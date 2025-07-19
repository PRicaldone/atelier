/**
 * SuperClaude AI Agent Integration
 * Handles communication with SuperClaude+MCP services
 */

import { sanitizeForAI } from '../security/DataSanitizer.js';
import { requestAIConsent, hasAIConsent } from '../consent/ConsentManager.js';
import { executeAIOperation } from '../fallback/FallbackManager.js';
import { eventBus } from '../../events/EventBus.js';

/**
 * SuperClaude operation types
 */
export const SuperClaudeOperations = {
  BOARD_GENERATION: 'board_generation',
  CONTENT_ANALYSIS: 'content_analysis',
  WORKFLOW_AUTOMATION: 'workflow_automation',
  CONTENT_GENERATION: 'content_generation',
  KNOWLEDGE_ORGANIZATION: 'knowledge_organization',
  CONNECTION_SUGGESTIONS: 'connection_suggestions'
};

/**
 * SuperClaude response types
 */
export const ResponseTypes = {
  BOARD_STRUCTURE: 'board_structure',
  CONTENT_SUGGESTIONS: 'content_suggestions',
  WORKFLOW_STEPS: 'workflow_steps',
  GENERATED_CONTENT: 'generated_content',
  ORGANIZATION_STRUCTURE: 'organization_structure',
  CONNECTION_MAP: 'connection_map'
};

/**
 * SuperClaude AI Agent
 */
export class SuperClaudeAgent {
  constructor(options = {}) {
    this.options = {
      apiEndpoint: options.apiEndpoint || '/api/ai/superclaude',
      timeout: options.timeout || 15000,
      maxRetries: options.maxRetries || 3,
      enableCaching: options.enableCaching !== false,
      ...options
    };

    this.eventBus = eventBus;
    this.cache = new Map();
    this.requestHistory = [];
    this.isConnected = false;
    
    this.initializeAgent();
  }

  /**
   * Initialize the SuperClaude agent
   */
  async initializeAgent() {
    try {
      await this.testConnection();
      this.isConnected = true;
      
      this.eventBus.emit('ai.agent.initialized', {
        agent: 'superclaude',
        timestamp: Date.now(),
        connected: this.isConnected
      });
    } catch (error) {
      console.warn('SuperClaudeAgent: Connection test failed:', error.message);
      this.isConnected = false;
    }
  }

  /**
   * Test connection to SuperClaude service
   */
  async testConnection() {
    const response = await fetch(`${this.options.apiEndpoint}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Service unavailable: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Generate creative board from prompt
   * @param {string} prompt - User's creative prompt
   * @param {object} context - Additional context
   * @returns {Promise<object>} Generated board structure
   */
  async generateBoard(prompt, context = {}) {
    // Check consent first
    const hasConsent = await this.ensureConsent('board_generation', {
      prompt: prompt.substring(0, 100) + '...',
      module: 'scriptorium'
    });

    if (!hasConsent) {
      throw new Error('User consent required for AI board generation');
    }

    // Sanitize input
    const sanitizedPrompt = sanitizeForAI(prompt, 'standard');
    if (!sanitizedPrompt.safe) {
      throw new Error('Prompt contains sensitive information that cannot be processed');
    }

    // Execute with fallback protection
    return executeAIOperation(
      `board_generation_${Date.now()}`,
      async () => this.callSuperClaude(SuperClaudeOperations.BOARD_GENERATION, {
        prompt: sanitizedPrompt.sanitized,
        context: this.sanitizeContext(context),
        preferences: context.userPreferences || {}
      }),
      async (fallbackContext) => this.manualBoardGeneration(prompt, fallbackContext),
      {
        timeout: this.options.timeout,
        preserveState: true,
        context: { prompt, originalContext: context }
      }
    );
  }

  /**
   * Analyze content for suggestions
   * @param {object} content - Content to analyze
   * @param {object} context - Analysis context
   * @returns {Promise<object>} Content analysis and suggestions
   */
  async analyzeContent(content, context = {}) {
    const hasConsent = await this.ensureConsent('content_analysis', {
      contentType: context.type || 'unknown',
      module: 'scriptorium'
    });

    if (!hasConsent) {
      throw new Error('User consent required for content analysis');
    }

    const sanitizedContent = sanitizeForAI(content, 'standard');
    if (!sanitizedContent.safe) {
      throw new Error('Content contains sensitive information');
    }

    return executeAIOperation(
      `content_analysis_${Date.now()}`,
      async () => this.callSuperClaude(SuperClaudeOperations.CONTENT_ANALYSIS, {
        content: sanitizedContent.sanitized,
        context: this.sanitizeContext(context)
      }),
      async (fallbackContext) => this.manualContentAnalysis(content, fallbackContext),
      {
        timeout: this.options.timeout,
        context: { content, originalContext: context }
      }
    );
  }

  /**
   * Generate workflow automation
   * @param {object} brief - Project brief
   * @param {object} context - Workflow context
   * @returns {Promise<object>} Generated workflow steps
   */
  async generateWorkflow(brief, context = {}) {
    const hasConsent = await this.ensureConsent('workflow_automation', {
      briefType: context.type || 'campaign',
      module: 'orchestra'
    });

    if (!hasConsent) {
      throw new Error('User consent required for workflow automation');
    }

    const sanitizedBrief = sanitizeForAI(brief, 'standard');
    if (!sanitizedBrief.safe) {
      throw new Error('Brief contains sensitive information');
    }

    return executeAIOperation(
      `workflow_generation_${Date.now()}`,
      async () => this.callSuperClaude(SuperClaudeOperations.WORKFLOW_AUTOMATION, {
        brief: sanitizedBrief.sanitized,
        context: this.sanitizeContext(context)
      }),
      async (fallbackContext) => this.manualWorkflowGeneration(brief, fallbackContext),
      {
        timeout: this.options.timeout * 1.5, // Longer timeout for complex workflows
        context: { brief, originalContext: context }
      }
    );
  }

  /**
   * Call SuperClaude API with MCP integration
   * @param {string} operation - Operation type
   * @param {object} payload - Request payload
   * @returns {Promise<object>} API response
   */
  async callSuperClaude(operation, payload) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check cache first
    if (this.options.enableCaching) {
      const cached = this.getCachedResponse(operation, payload);
      if (cached) {
        this.eventBus.emit('ai.agent.cache_hit', {
          operation,
          requestId,
          timestamp: Date.now()
        });
        return cached;
      }
    }

    const request = {
      id: requestId,
      operation,
      payload,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    };

    try {
      this.eventBus.emit('ai.agent.request_started', {
        operation,
        requestId,
        timestamp: Date.now()
      });

      const response = await fetch(this.options.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Validate response structure
      this.validateResponse(result, operation);
      
      // Cache successful response
      if (this.options.enableCaching && result.success) {
        this.cacheResponse(operation, payload, result);
      }

      // Record successful request
      this.recordRequest(request, result, true);

      this.eventBus.emit('ai.agent.request_completed', {
        operation,
        requestId,
        success: true,
        duration: Date.now() - request.timestamp
      });

      return result;

    } catch (error) {
      this.recordRequest(request, { error: error.message }, false);
      
      this.eventBus.emit('ai.agent.request_failed', {
        operation,
        requestId,
        error: error.message,
        duration: Date.now() - request.timestamp
      });

      throw error;
    }
  }

  /**
   * Validate API response structure
   * @param {object} response - API response
   * @param {string} operation - Operation type
   */
  validateResponse(response, operation) {
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response format');
    }

    if (!response.success) {
      throw new Error(response.error || 'Operation failed');
    }

    if (!response.data) {
      throw new Error('Missing response data');
    }

    // Operation-specific validation
    switch (operation) {
      case SuperClaudeOperations.BOARD_GENERATION:
        if (!response.data.sections || !Array.isArray(response.data.sections)) {
          throw new Error('Invalid board structure');
        }
        break;
        
      case SuperClaudeOperations.WORKFLOW_AUTOMATION:
        if (!response.data.steps || !Array.isArray(response.data.steps)) {
          throw new Error('Invalid workflow structure');
        }
        break;
    }
  }

  /**
   * Ensure user consent for operation
   * @param {string} consentType - Type of consent needed
   * @param {object} context - Request context
   * @returns {Promise<boolean>} Whether consent is granted
   */
  async ensureConsent(consentType, context) {
    if (hasAIConsent(consentType)) {
      return true;
    }

    return await requestAIConsent(consentType, context);
  }

  /**
   * Sanitize context object for AI processing
   * @param {object} context - Context to sanitize
   * @returns {object} Sanitized context
   */
  sanitizeContext(context) {
    const sanitized = {};
    
    // Only include safe context fields
    const safeFields = ['type', 'category', 'tags', 'preferences', 'style', 'format'];
    safeFields.forEach(field => {
      if (context[field]) {
        const fieldResult = sanitizeForAI(context[field], 'standard');
        if (fieldResult.safe) {
          sanitized[field] = fieldResult.sanitized;
        }
      }
    });

    return sanitized;
  }

  /**
   * Manual fallback for board generation
   * @param {string} prompt - Original prompt
   * @param {object} fallbackContext - Fallback context
   * @returns {object} Manual board structure
   */
  async manualBoardGeneration(prompt, fallbackContext) {
    return {
      success: true,
      data: {
        type: ResponseTypes.BOARD_STRUCTURE,
        sections: [
          {
            id: 'main',
            title: 'Creative Board',
            description: `Manual board for: ${prompt.substring(0, 50)}...`,
            elements: [
              {
                type: 'note',
                content: `Original prompt: ${prompt}`,
                position: { x: 100, y: 100 }
              },
              {
                type: 'note',
                content: 'AI assistant temporarily unavailable. Continue building manually.',
                position: { x: 100, y: 200 }
              }
            ]
          }
        ],
        fallback: true,
        reason: fallbackContext.reason
      }
    };
  }

  /**
   * Manual fallback for content analysis
   * @param {object} content - Original content
   * @param {object} fallbackContext - Fallback context
   * @returns {object} Manual analysis
   */
  async manualContentAnalysis(content, fallbackContext) {
    return {
      success: true,
      data: {
        type: ResponseTypes.CONTENT_SUGGESTIONS,
        suggestions: [
          {
            type: 'info',
            message: 'AI analysis temporarily unavailable. Review your content manually.',
            action: 'manual_review'
          }
        ],
        fallback: true,
        reason: fallbackContext.reason
      }
    };
  }

  /**
   * Manual fallback for workflow generation
   * @param {object} brief - Original brief
   * @param {object} fallbackContext - Fallback context
   * @returns {object} Manual workflow
   */
  async manualWorkflowGeneration(brief, fallbackContext) {
    return {
      success: true,
      data: {
        type: ResponseTypes.WORKFLOW_STEPS,
        steps: [
          {
            id: 'step1',
            title: 'Planning',
            description: 'Define project goals and requirements',
            estimated_time: '2-4 hours'
          },
          {
            id: 'step2',
            title: 'Creative Development',
            description: 'Develop creative concepts and materials',
            estimated_time: '4-8 hours'
          },
          {
            id: 'step3',
            title: 'Review & Refinement',
            description: 'Review and refine deliverables',
            estimated_time: '2-4 hours'
          }
        ],
        fallback: true,
        reason: fallbackContext.reason
      }
    };
  }

  /**
   * Cache response for future use
   * @param {string} operation - Operation type
   * @param {object} payload - Request payload
   * @param {object} response - Response to cache
   */
  cacheResponse(operation, payload, response) {
    const cacheKey = this.generateCacheKey(operation, payload);
    const cacheEntry = {
      response,
      timestamp: Date.now(),
      operation
    };

    this.cache.set(cacheKey, cacheEntry);

    // Limit cache size
    if (this.cache.size > 50) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get cached response if available and valid
   * @param {string} operation - Operation type
   * @param {object} payload - Request payload
   * @returns {object|null} Cached response or null
   */
  getCachedResponse(operation, payload) {
    const cacheKey = this.generateCacheKey(operation, payload);
    const cached = this.cache.get(cacheKey);

    if (!cached) return null;

    // Check if cache is still valid (5 minutes for most operations)
    const maxAge = operation === SuperClaudeOperations.BOARD_GENERATION ? 5 * 60 * 1000 : 10 * 60 * 1000;
    if (Date.now() - cached.timestamp > maxAge) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.response;
  }

  /**
   * Generate cache key for operation and payload
   * @param {string} operation - Operation type
   * @param {object} payload - Request payload
   * @returns {string} Cache key
   */
  generateCacheKey(operation, payload) {
    const payloadHash = JSON.stringify(payload);
    return `${operation}_${btoa(payloadHash).slice(0, 16)}`;
  }

  /**
   * Record request in history
   * @param {object} request - Request object
   * @param {object} response - Response object
   * @param {boolean} success - Whether request was successful
   */
  recordRequest(request, response, success) {
    const record = {
      ...request,
      response,
      success,
      endTime: Date.now(),
      duration: Date.now() - request.timestamp
    };

    this.requestHistory.push(record);

    // Limit history size
    if (this.requestHistory.length > 100) {
      this.requestHistory.shift();
    }
  }

  /**
   * Get agent statistics
   * @returns {object} Agent statistics
   */
  getStats() {
    const recent = this.requestHistory.filter(
      req => Date.now() - req.timestamp < 24 * 60 * 60 * 1000
    );

    return {
      connected: this.isConnected,
      totalRequests: this.requestHistory.length,
      recentRequests: recent.length,
      successRate: recent.length > 0 ? 
        (recent.filter(req => req.success).length / recent.length * 100).toFixed(1) : 0,
      cacheSize: this.cache.size,
      avgResponseTime: recent.length > 0 ?
        Math.round(recent.reduce((sum, req) => sum + req.duration, 0) / recent.length) : 0
    };
  }

  /**
   * Clear cache and reset agent
   */
  reset() {
    this.cache.clear();
    this.requestHistory = [];
    this.isConnected = false;
    
    this.eventBus.emit('ai.agent.reset', {
      agent: 'superclaude',
      timestamp: Date.now()
    });
  }
}

// Global instance
export const superClaudeAgent = new SuperClaudeAgent();

export default SuperClaudeAgent;