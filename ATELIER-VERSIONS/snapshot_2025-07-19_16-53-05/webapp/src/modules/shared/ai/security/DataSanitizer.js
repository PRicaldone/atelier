/**
 * Data Sanitization Pipeline for AI Processing
 * Removes PII and sensitive data before sending to AI services
 */

/**
 * Data classification levels for AI processing
 */
export const DataClassification = {
  PUBLIC: 'public',     // Safe for AI processing
  PRIVATE: 'private',   // Requires user consent
  SENSITIVE: 'sensitive' // Never sent to AI
};

/**
 * PII patterns for automatic detection and removal
 */
const PII_PATTERNS = {
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  PHONE: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  CREDIT_CARD: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  API_KEY: /\b(?:sk-|pk-|rk-)[a-zA-Z0-9]{32,}\b/g,
  JWT_TOKEN: /\beyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\b/g,
  IP_ADDRESS: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
  URL_WITH_TOKENS: /https?:\/\/[^\s]*(?:token|key|secret|auth)=[^\s&]*/gi
};

/**
 * Sensitive keywords that should be redacted
 */
const SENSITIVE_KEYWORDS = [
  'password', 'passwd', 'pwd', 'secret', 'private', 'confidential',
  'classified', 'internal', 'restricted', 'proprietary', 'personal',
  'ssn', 'social security', 'driver license', 'passport', 'address'
];

/**
 * Data Sanitizer for AI-safe content processing
 */
export class DataSanitizer {
  constructor(options = {}) {
    this.options = {
      maxLength: options.maxLength || 10000,
      preserveStructure: options.preserveStructure !== false,
      strictMode: options.strictMode || false,
      customPatterns: options.customPatterns || {},
      allowedDomains: options.allowedDomains || []
    };
  }

  /**
   * Sanitize content for AI processing
   * @param {string|object} content - Content to sanitize
   * @param {string} classification - Data classification level
   * @returns {object} Sanitized content with metadata
   */
  sanitize(content, classification = DataClassification.PRIVATE) {
    const startTime = performance.now();
    
    try {
      // Convert to string if object
      const textContent = typeof content === 'string' ? content : JSON.stringify(content);
      
      // Check classification level
      if (classification === DataClassification.SENSITIVE) {
        return {
          sanitized: '[SENSITIVE_DATA_REMOVED]',
          classification,
          removed: ['sensitive_data'],
          processingTime: performance.now() - startTime,
          safe: false
        };
      }

      let sanitized = textContent;
      const removedItems = [];

      // Length validation
      if (sanitized.length > this.options.maxLength) {
        sanitized = sanitized.substring(0, this.options.maxLength) + '...[TRUNCATED]';
        removedItems.push('truncated_content');
      }

      // Remove PII patterns
      Object.entries(PII_PATTERNS).forEach(([type, pattern]) => {
        const matches = sanitized.match(pattern);
        if (matches) {
          sanitized = sanitized.replace(pattern, `[${type}_REMOVED]`);
          removedItems.push(type.toLowerCase());
        }
      });

      // Remove custom patterns
      Object.entries(this.options.customPatterns).forEach(([type, pattern]) => {
        const matches = sanitized.match(pattern);
        if (matches) {
          sanitized = sanitized.replace(pattern, `[${type.toUpperCase()}_REMOVED]`);
          removedItems.push(type);
        }
      });

      // Check for sensitive keywords
      const sensitiveFound = SENSITIVE_KEYWORDS.some(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        if (regex.test(sanitized)) {
          sanitized = sanitized.replace(regex, '[SENSITIVE_KEYWORD]');
          removedItems.push('sensitive_keyword');
          return true;
        }
        return false;
      });

      // Strict mode additional checks
      if (this.options.strictMode) {
        sanitized = this.applyStrictModeFilters(sanitized, removedItems);
      }

      const processingTime = performance.now() - startTime;
      const isSafe = removedItems.length === 0 || classification === DataClassification.PUBLIC;

      return {
        sanitized,
        classification,
        removed: [...new Set(removedItems)],
        processingTime,
        safe: isSafe,
        originalLength: textContent.length,
        sanitizedLength: sanitized.length
      };

    } catch (error) {
      console.error('DataSanitizer: Error during sanitization:', error);
      return {
        sanitized: '[SANITIZATION_ERROR]',
        classification,
        removed: ['sanitization_error'],
        processingTime: performance.now() - startTime,
        safe: false,
        error: error.message
      };
    }
  }

  /**
   * Apply strict mode filters for additional security
   * @param {string} content - Content to filter
   * @param {Array} removedItems - Array to track removed items
   * @returns {string} Filtered content
   */
  applyStrictModeFilters(content, removedItems) {
    let filtered = content;

    // Remove any remaining URLs with query parameters
    const urlPattern = /https?:\/\/[^\s]*\?[^\s]*/gi;
    if (urlPattern.test(filtered)) {
      filtered = filtered.replace(urlPattern, '[URL_WITH_PARAMS_REMOVED]');
      removedItems.push('url_with_params');
    }

    // Remove potential code snippets with secrets
    const codePattern = /```[\s\S]*?```|`[^`]*`/g;
    const codeMatches = filtered.match(codePattern);
    if (codeMatches) {
      codeMatches.forEach(code => {
        if (SENSITIVE_KEYWORDS.some(keyword => code.toLowerCase().includes(keyword))) {
          filtered = filtered.replace(code, '[CODE_BLOCK_REMOVED]');
          removedItems.push('sensitive_code');
        }
      });
    }

    return filtered;
  }

  /**
   * Validate if content is safe for AI processing
   * @param {string} content - Content to validate
   * @returns {object} Validation result
   */
  validateSafety(content) {
    const result = this.sanitize(content, DataClassification.PRIVATE);
    return {
      isSafe: result.safe,
      issues: result.removed,
      recommendation: result.safe ? 'SAFE_TO_PROCESS' : 'REQUIRES_SANITIZATION'
    };
  }

  /**
   * Get sanitization statistics
   * @returns {object} Statistics about sanitization patterns
   */
  getStats() {
    return {
      piiPatterns: Object.keys(PII_PATTERNS).length,
      sensitiveKeywords: SENSITIVE_KEYWORDS.length,
      customPatterns: Object.keys(this.options.customPatterns).length,
      strictMode: this.options.strictMode,
      maxLength: this.options.maxLength
    };
  }
}

/**
 * Pre-configured sanitizer instances
 */
export const AISanitizer = {
  // Standard sanitizer for general AI processing
  standard: new DataSanitizer({
    maxLength: 10000,
    strictMode: false
  }),

  // Strict sanitizer for sensitive operations
  strict: new DataSanitizer({
    maxLength: 5000,
    strictMode: true
  }),

  // Permissive sanitizer for public content
  permissive: new DataSanitizer({
    maxLength: 20000,
    strictMode: false,
    preserveStructure: true
  })
};

/**
 * Convenience function for quick sanitization
 * @param {string|object} content - Content to sanitize
 * @param {string} mode - Sanitization mode ('standard', 'strict', 'permissive')
 * @returns {object} Sanitized content result
 */
export function sanitizeForAI(content, mode = 'standard') {
  const sanitizer = AISanitizer[mode] || AISanitizer.standard;
  return sanitizer.sanitize(content);
}

/**
 * Quick safety check for content
 * @param {string} content - Content to check
 * @returns {boolean} True if content is safe for AI processing
 */
export function isAISafe(content) {
  return AISanitizer.standard.validateSafety(content).isSafe;
}

export default DataSanitizer;