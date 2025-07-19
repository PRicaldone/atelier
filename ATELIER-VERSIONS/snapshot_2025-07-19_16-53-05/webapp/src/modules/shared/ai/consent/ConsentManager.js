/**
 * AI Consent Management System
 * Handles user permissions and consent for AI features
 */

import { eventBus } from '../../events/EventBus.js';

/**
 * AI consent types and their descriptions
 */
export const ConsentTypes = {
  BOARD_GENERATION: {
    id: 'board_generation',
    name: 'AI Board Generation',
    description: 'Allow AI to generate creative boards from your prompts',
    module: 'scriptorium',
    dataUsage: 'Selected text prompts only',
    default: false
  },
  CONTENT_ANALYSIS: {
    id: 'content_analysis',
    name: 'Content Analysis',
    description: 'Allow AI to analyze your content for suggestions',
    module: 'scriptorium',
    dataUsage: 'Selected board content only',
    default: false
  },
  WORKFLOW_AUTOMATION: {
    id: 'workflow_automation',
    name: 'Workflow Automation',
    description: 'Allow AI to automate marketing workflows',
    module: 'orchestra',
    dataUsage: 'Project briefs and campaign data',
    default: false
  },
  CONTENT_GENERATION: {
    id: 'content_generation',
    name: 'Content Generation',
    description: 'Allow AI to generate marketing content',
    module: 'orchestra',
    dataUsage: 'Brand guidelines and creative briefs',
    default: false
  },
  KNOWLEDGE_ORGANIZATION: {
    id: 'knowledge_organization',
    name: 'Knowledge Organization',
    description: 'Allow AI to organize your knowledge base',
    module: 'mind_garden',
    dataUsage: 'Notes and research content',
    default: false
  },
  CONNECTION_SUGGESTIONS: {
    id: 'connection_suggestions',
    name: 'Connection Suggestions',
    description: 'Allow AI to suggest connections between ideas',
    module: 'mind_garden',
    dataUsage: 'Note content and relationships',
    default: false
  }
};

/**
 * Consent event types for audit logging
 */
export const ConsentEvents = {
  CONSENT_GRANTED: 'consent.granted',
  CONSENT_REVOKED: 'consent.revoked',
  CONSENT_MODIFIED: 'consent.modified',
  CONSENT_REQUESTED: 'consent.requested',
  CONSENT_EXPIRED: 'consent.expired'
};

/**
 * AI Consent Manager
 */
export class ConsentManager {
  constructor() {
    this.storageKey = 'ATELIER_AI_CONSENT';
    this.consentData = this.loadConsent();
    this.eventBus = eventBus;
    this.consentCallbacks = new Map();
    
    // Initialize default consent state
    this.initializeDefaults();
    
    // Setup periodic consent review reminders
    this.setupConsentReview();
  }

  /**
   * Initialize default consent values
   */
  initializeDefaults() {
    let updated = false;
    
    Object.values(ConsentTypes).forEach(consentType => {
      if (!(consentType.id in this.consentData.permissions)) {
        this.consentData.permissions[consentType.id] = {
          granted: consentType.default,
          timestamp: Date.now(),
          version: '1.0',
          explicit: false // Default values are not explicit consent
        };
        updated = true;
      }
    });

    if (updated) {
      this.saveConsent();
    }
  }

  /**
   * Load consent data from storage
   * @returns {object} Consent data
   */
  loadConsent() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('ConsentManager: Error loading consent data:', error);
    }

    return {
      permissions: {},
      lastReview: Date.now(),
      version: '1.0',
      userId: null
    };
  }

  /**
   * Save consent data to storage
   */
  saveConsent() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.consentData));
      this.eventBus.emit('ai.consent.updated', {
        timestamp: Date.now(),
        permissions: this.consentData.permissions
      });
    } catch (error) {
      console.error('ConsentManager: Error saving consent data:', error);
    }
  }

  /**
   * Request consent for a specific AI feature
   * @param {string} consentId - Consent type ID
   * @param {object} context - Additional context for the request
   * @returns {Promise<boolean>} Whether consent was granted
   */
  async requestConsent(consentId, context = {}) {
    const consentType = Object.values(ConsentTypes).find(c => c.id === consentId);
    if (!consentType) {
      throw new Error(`Unknown consent type: ${consentId}`);
    }

    // Check if already granted and still valid
    const currentConsent = this.consentData.permissions[consentId];
    if (currentConsent && currentConsent.granted && currentConsent.explicit) {
      return true;
    }

    // Emit consent request event
    this.eventBus.emit(ConsentEvents.CONSENT_REQUESTED, {
      consentId,
      consentType,
      context,
      timestamp: Date.now()
    });

    // Show consent dialog (this would trigger UI component)
    const granted = await this.showConsentDialog(consentType, context);
    
    // Record consent decision
    this.recordConsentDecision(consentId, granted, context);
    
    return granted;
  }

  /**
   * Show consent dialog to user (mock implementation)
   * In real implementation, this would trigger a UI component
   * @param {object} consentType - Consent type configuration
   * @param {object} context - Request context
   * @returns {Promise<boolean>} User's consent decision
   */
  async showConsentDialog(consentType, context) {
    // This is a mock implementation
    // In real app, this would show a proper consent UI
    return new Promise((resolve) => {
      // For demo purposes, auto-grant consent after a short delay
      // In production, this would wait for actual user interaction
      setTimeout(() => {
        const granted = confirm(
          `${consentType.name}\n\n${consentType.description}\n\nData usage: ${consentType.dataUsage}\n\nDo you consent to this AI feature?`
        );
        resolve(granted);
      }, 100);
    });
  }

  /**
   * Record a consent decision
   * @param {string} consentId - Consent type ID
   * @param {boolean} granted - Whether consent was granted
   * @param {object} context - Decision context
   */
  recordConsentDecision(consentId, granted, context = {}) {
    this.consentData.permissions[consentId] = {
      granted,
      timestamp: Date.now(),
      version: '1.0',
      explicit: true,
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context
      }
    };

    this.saveConsent();

    // Emit appropriate event
    const eventType = granted ? ConsentEvents.CONSENT_GRANTED : ConsentEvents.CONSENT_REVOKED;
    this.eventBus.emit(eventType, {
      consentId,
      granted,
      timestamp: Date.now(),
      context
    });

    // Notify any registered callbacks
    const callbacks = this.consentCallbacks.get(consentId) || [];
    callbacks.forEach(callback => {
      try {
        callback(granted, consentId);
      } catch (error) {
        console.error('ConsentManager: Error in consent callback:', error);
      }
    });
  }

  /**
   * Check if consent is granted for a specific feature
   * @param {string} consentId - Consent type ID
   * @returns {boolean} Whether consent is granted
   */
  hasConsent(consentId) {
    const consent = this.consentData.permissions[consentId];
    return consent && consent.granted && consent.explicit;
  }

  /**
   * Get all consent permissions
   * @returns {object} All consent permissions
   */
  getAllConsent() {
    return { ...this.consentData.permissions };
  }

  /**
   * Revoke consent for a specific feature
   * @param {string} consentId - Consent type ID
   */
  revokeConsent(consentId) {
    if (this.consentData.permissions[consentId]) {
      this.recordConsentDecision(consentId, false, { action: 'user_revoked' });
    }
  }

  /**
   * Grant consent for a specific feature
   * @param {string} consentId - Consent type ID
   * @param {object} context - Context for granting consent
   */
  grantConsent(consentId, context = {}) {
    this.recordConsentDecision(consentId, true, { action: 'user_granted', ...context });
  }

  /**
   * Register a callback for consent changes
   * @param {string} consentId - Consent type ID
   * @param {Function} callback - Callback function
   */
  onConsentChange(consentId, callback) {
    if (!this.consentCallbacks.has(consentId)) {
      this.consentCallbacks.set(consentId, []);
    }
    this.consentCallbacks.get(consentId).push(callback);
  }

  /**
   * Remove consent change callback
   * @param {string} consentId - Consent type ID
   * @param {Function} callback - Callback function to remove
   */
  offConsentChange(consentId, callback) {
    const callbacks = this.consentCallbacks.get(consentId);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Export consent data for user (GDPR compliance)
   * @returns {object} Exportable consent data
   */
  exportConsentData() {
    return {
      permissions: this.consentData.permissions,
      lastReview: this.consentData.lastReview,
      version: this.consentData.version,
      exportDate: new Date().toISOString()
    };
  }

  /**
   * Clear all consent data (GDPR right to be forgotten)
   */
  clearAllConsent() {
    this.consentData = {
      permissions: {},
      lastReview: Date.now(),
      version: '1.0',
      userId: null
    };
    
    this.saveConsent();
    
    this.eventBus.emit('ai.consent.cleared', {
      timestamp: Date.now()
    });
  }

  /**
   * Setup periodic consent review reminders
   */
  setupConsentReview() {
    const reviewPeriod = 90 * 24 * 60 * 60 * 1000; // 90 days
    const lastReview = this.consentData.lastReview || 0;
    const timeSinceReview = Date.now() - lastReview;

    if (timeSinceReview > reviewPeriod) {
      // Schedule consent review reminder
      setTimeout(() => {
        this.eventBus.emit('ai.consent.review_needed', {
          lastReview: new Date(lastReview).toISOString(),
          daysSinceReview: Math.floor(timeSinceReview / (24 * 60 * 60 * 1000))
        });
      }, 5000); // Show after 5 seconds of app load
    }
  }

  /**
   * Mark consent as reviewed
   */
  markReviewed() {
    this.consentData.lastReview = Date.now();
    this.saveConsent();
  }

  /**
   * Get consent summary for dashboard
   * @returns {object} Consent summary
   */
  getConsentSummary() {
    const permissions = this.consentData.permissions;
    const total = Object.keys(ConsentTypes).length;
    const granted = Object.values(permissions).filter(p => p.granted && p.explicit).length;
    const pending = Object.values(permissions).filter(p => !p.explicit).length;

    return {
      total,
      granted,
      pending,
      percentage: total > 0 ? Math.round((granted / total) * 100) : 0,
      lastReview: this.consentData.lastReview
    };
  }
}

// Global instance
export const consentManager = new ConsentManager();

// Convenience functions
export const requestAIConsent = (consentId, context) => consentManager.requestConsent(consentId, context);
export const hasAIConsent = (consentId) => consentManager.hasConsent(consentId);
export const revokeAIConsent = (consentId) => consentManager.revokeConsent(consentId);
export const grantAIConsent = (consentId, context) => consentManager.grantConsent(consentId, context);

export default ConsentManager;