/**
 * AI-specific Event Constants and Utilities
 * Centralizes all AI-related event types for consistent event handling
 */

/**
 * AI Agent Events
 */
export const AIAgentEvents = {
  // Agent lifecycle
  AGENT_INITIALIZED: 'ai.agent.initialized',
  AGENT_RESET: 'ai.agent.reset',
  AGENT_CONNECTED: 'ai.agent.connected',
  AGENT_DISCONNECTED: 'ai.agent.disconnected',
  
  // Request lifecycle
  REQUEST_STARTED: 'ai.agent.request_started',
  REQUEST_COMPLETED: 'ai.agent.request_completed',
  REQUEST_FAILED: 'ai.agent.request_failed',
  
  // Cache events
  CACHE_HIT: 'ai.agent.cache_hit',
  CACHE_MISS: 'ai.agent.cache_miss',
  CACHE_UPDATED: 'ai.agent.cache_updated'
};

/**
 * AI Consent Events
 */
export const AIConsentEvents = {
  CONSENT_GRANTED: 'ai.consent.granted',
  CONSENT_REVOKED: 'ai.consent.revoked',
  CONSENT_MODIFIED: 'ai.consent.modified',
  CONSENT_REQUESTED: 'ai.consent.requested',
  CONSENT_EXPIRED: 'ai.consent.expired',
  CONSENT_UPDATED: 'ai.consent.updated',
  CONSENT_CLEARED: 'ai.consent.cleared',
  CONSENT_REVIEW_NEEDED: 'ai.consent.review_needed'
};

/**
 * AI Fallback Events
 */
export const AIFallbackEvents = {
  OPERATION_STARTED: 'ai.fallback.operation_started',
  OPERATION_COMPLETED: 'ai.fallback.operation_completed',
  FALLBACK_TRIGGERED: 'ai.fallback.fallback_triggered',
  MANUAL_OVERRIDE_ACTIVATED: 'ai.fallback.manual_override_activated',
  SERVICE_DEGRADED: 'ai.fallback.service_degraded',
  SERVICE_RECOVERED: 'ai.fallback.service_recovered'
};

/**
 * AI Security Events
 */
export const AISecurityEvents = {
  DATA_SANITIZED: 'ai.security.data_sanitized',
  SENSITIVE_DATA_BLOCKED: 'ai.security.sensitive_data_blocked',
  SANITIZATION_ERROR: 'ai.security.sanitization_error',
  SECURITY_VIOLATION: 'ai.security.security_violation'
};

/**
 * AI Feature Events (Module-specific)
 */
export const AIFeatureEvents = {
  // Scriptorium AI events
  BOARD_GENERATION_STARTED: 'ai.scriptorium.board_generation_started',
  BOARD_GENERATION_COMPLETED: 'ai.scriptorium.board_generation_completed',
  BOARD_GENERATION_FAILED: 'ai.scriptorium.board_generation_failed',
  BOARD_APPLIED_TO_CANVAS: 'ai.scriptorium.board_applied_to_canvas',
  
  // Orchestra AI events
  WORKFLOW_GENERATION_STARTED: 'ai.orchestra.workflow_generation_started',
  WORKFLOW_GENERATION_COMPLETED: 'ai.orchestra.workflow_generation_completed',
  WORKFLOW_APPLIED: 'ai.orchestra.workflow_applied',
  
  CONTENT_GENERATION_STARTED: 'ai.orchestra.content_generation_started',
  CONTENT_GENERATION_COMPLETED: 'ai.orchestra.content_generation_completed',
  
  // Mind Garden AI events
  KNOWLEDGE_ORGANIZATION_STARTED: 'ai.mindgarden.knowledge_organization_started',
  KNOWLEDGE_ORGANIZATION_COMPLETED: 'ai.mindgarden.knowledge_organization_completed',
  
  CONNECTIONS_DISCOVERED: 'ai.mindgarden.connections_discovered',
  INSIGHTS_GENERATED: 'ai.mindgarden.insights_generated'
};

/**
 * All AI Events combined for easy reference
 */
export const AllAIEvents = {
  ...AIAgentEvents,
  ...AIConsentEvents,
  ...AIFallbackEvents,
  ...AISecurityEvents,
  ...AIFeatureEvents
};

/**
 * AI Event Categories for filtering and monitoring
 */
export const AIEventCategories = {
  AGENT: 'agent',
  CONSENT: 'consent',
  FALLBACK: 'fallback',
  SECURITY: 'security',
  FEATURE: 'feature'
};

/**
 * Get event category from event name
 * @param {string} eventName - Event name
 * @returns {string} Event category
 */
export function getEventCategory(eventName) {
  if (eventName.includes('.agent.')) return AIEventCategories.AGENT;
  if (eventName.includes('.consent.')) return AIEventCategories.CONSENT;
  if (eventName.includes('.fallback.')) return AIEventCategories.FALLBACK;
  if (eventName.includes('.security.')) return AIEventCategories.SECURITY;
  if (eventName.includes('.scriptorium.') || eventName.includes('.orchestra.') || eventName.includes('.mindgarden.')) {
    return AIEventCategories.FEATURE;
  }
  return 'unknown';
}

/**
 * Check if event is AI-related
 * @param {string} eventName - Event name
 * @returns {boolean} Whether event is AI-related
 */
export function isAIEvent(eventName) {
  return eventName.startsWith('ai.');
}

/**
 * AI Event Bus Extension - adds AI-specific functionality to EventBus
 */
export class AIEventBusExtension {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.aiEventHistory = [];
    this.maxAIHistorySize = 200;
    this.aiEventStats = new Map();
    
    // Subscribe to all AI events for tracking
    this.setupAIEventTracking();
  }

  /**
   * Setup AI event tracking
   */
  setupAIEventTracking() {
    // Track all AI events
    Object.values(AllAIEvents).forEach(eventName => {
      this.eventBus.on(eventName, (data) => {
        this.trackAIEvent(eventName, data);
      });
    });
  }

  /**
   * Track AI event for analytics
   * @param {string} eventName - Event name
   * @param {object} data - Event data
   */
  trackAIEvent(eventName, data) {
    const eventRecord = {
      event: eventName,
      category: getEventCategory(eventName),
      timestamp: Date.now(),
      data,
      sessionId: this.getSessionId()
    };

    // Add to AI-specific history
    this.aiEventHistory.push(eventRecord);
    
    // Limit history size
    if (this.aiEventHistory.length > this.maxAIHistorySize) {
      this.aiEventHistory.shift();
    }

    // Update statistics
    this.updateAIEventStats(eventName);
  }

  /**
   * Update AI event statistics
   * @param {string} eventName - Event name
   */
  updateAIEventStats(eventName) {
    const category = getEventCategory(eventName);
    
    if (!this.aiEventStats.has(category)) {
      this.aiEventStats.set(category, {
        total: 0,
        events: new Map()
      });
    }

    const categoryStats = this.aiEventStats.get(category);
    categoryStats.total++;

    if (!categoryStats.events.has(eventName)) {
      categoryStats.events.set(eventName, 0);
    }
    categoryStats.events.set(eventName, categoryStats.events.get(eventName) + 1);
  }

  /**
   * Get AI event statistics
   * @returns {object} AI event statistics
   */
  getAIEventStats() {
    const stats = {};
    
    for (const [category, categoryStats] of this.aiEventStats.entries()) {
      stats[category] = {
        total: categoryStats.total,
        events: Object.fromEntries(categoryStats.events)
      };
    }

    return {
      totalAIEvents: this.aiEventHistory.length,
      categories: stats,
      recentEvents: this.aiEventHistory.slice(-10).map(event => ({
        event: event.event,
        category: event.category,
        timestamp: event.timestamp
      }))
    };
  }

  /**
   * Get AI events by category
   * @param {string} category - Event category
   * @param {number} limit - Maximum number of events to return
   * @returns {Array} Filtered AI events
   */
  getAIEventsByCategory(category, limit = 50) {
    return this.aiEventHistory
      .filter(event => event.category === category)
      .slice(-limit);
  }

  /**
   * Get recent AI events
   * @param {number} minutes - Minutes back to look
   * @returns {Array} Recent AI events
   */
  getRecentAIEvents(minutes = 30) {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.aiEventHistory.filter(event => event.timestamp > cutoff);
  }

  /**
   * Clear AI event history
   */
  clearAIEventHistory() {
    this.aiEventHistory = [];
    this.aiEventStats.clear();
  }

  /**
   * Get current session ID (simple implementation)
   * @returns {string} Session ID
   */
  getSessionId() {
    if (!this._sessionId) {
      this._sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this._sessionId;
  }

  /**
   * Emit AI event with automatic categorization
   * @param {string} eventName - Event name
   * @param {object} data - Event data
   */
  emitAIEvent(eventName, data = {}) {
    const enrichedData = {
      ...data,
      category: getEventCategory(eventName),
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    };

    this.eventBus.emit(eventName, enrichedData);
  }
}

/**
 * Create AI event utilities for easy use
 * @param {EventBus} eventBus - Event bus instance
 * @returns {object} AI event utilities
 */
export function createAIEventUtils(eventBus) {
  const extension = new AIEventBusExtension(eventBus);
  
  return {
    // Event constants
    events: AllAIEvents,
    categories: AIEventCategories,
    
    // Utilities
    isAIEvent,
    getEventCategory,
    
    // Extension methods
    getAIEventStats: () => extension.getAIEventStats(),
    getAIEventsByCategory: (category, limit) => extension.getAIEventsByCategory(category, limit),
    getRecentAIEvents: (minutes) => extension.getRecentAIEvents(minutes),
    clearAIEventHistory: () => extension.clearAIEventHistory(),
    emitAIEvent: (eventName, data) => extension.emitAIEvent(eventName, data),
    
    // Direct event emitters for common patterns
    emitAgentEvent: (agentName, operation, success, data = {}) => {
      const eventName = success ? AIAgentEvents.REQUEST_COMPLETED : AIAgentEvents.REQUEST_FAILED;
      extension.emitAIEvent(eventName, { agentName, operation, success, ...data });
    },
    
    emitConsentEvent: (consentType, granted, context = {}) => {
      const eventName = granted ? AIConsentEvents.CONSENT_GRANTED : AIConsentEvents.CONSENT_REVOKED;
      extension.emitAIEvent(eventName, { consentType, granted, ...context });
    },
    
    emitFallbackEvent: (operationId, reason, strategy, context = {}) => {
      extension.emitAIEvent(AIFallbackEvents.FALLBACK_TRIGGERED, { 
        operationId, reason, strategy, ...context 
      });
    }
  };
}

export default {
  AIAgentEvents,
  AIConsentEvents,
  AIFallbackEvents,
  AISecurityEvents,
  AIFeatureEvents,
  AllAIEvents,
  AIEventCategories,
  getEventCategory,
  isAIEvent,
  createAIEventUtils
};