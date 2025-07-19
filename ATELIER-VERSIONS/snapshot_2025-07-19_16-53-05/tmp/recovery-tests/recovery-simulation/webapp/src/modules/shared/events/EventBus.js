/**
 * Event Bus - Central event system for loose coupling between modules
 */
import { eventBusLogger } from '../monitoring/ModuleLogger.js';

class EventBus {
  constructor() {
    this.events = new Map();
    this.history = [];
    this.maxHistorySize = 100;
    this.logger = eventBusLogger;
    this.startTime = Date.now();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @returns {Function} Unsubscribe function
   */
  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    this.events.get(event).add(handler);
    
    // Return unsubscribe function
    return () => {
      this.off(event, handler);
    };
  }

  /**
   * Subscribe to an event (alias for on)
   */
  subscribe(event, handler) {
    return this.on(event, handler);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  off(event, handler) {
    if (this.events.has(event)) {
      this.events.get(event).delete(handler);
      
      // Clean up empty event sets
      if (this.events.get(event).size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * Subscribe to an event only once
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  once(event, handler) {
    const onceHandler = (...args) => {
      handler(...args);
      this.off(event, onceHandler);
    };
    
    this.on(event, onceHandler);
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    // Add to history
    this._addToHistory(event, data);
    
    // Get handlers
    const handlers = this.events.get(event);
    if (!handlers || handlers.size === 0) {
      this.logger.debug(`No handlers for event: ${event}`, 'emit', { event, data });
      return;
    }
    
    // Execute handlers
    handlers.forEach(handler => {
      try {
        // Use setTimeout to make it async and prevent blocking
        setTimeout(() => {
          handler(data);
        }, 0);
      } catch (error) {
        this.logger.error(error, 'emit_handler', { event, data });
      }
    });
    
    this.logger.debug(`Emitted event: ${event}`, 'emit', { event, handlerCount: handlers.size, data });
  }

  /**
   * Emit an event and wait for all handlers to complete
   * @param {string} event - Event name
   * @param {*} data - Event data
   * @returns {Promise<Array>} Results from all handlers
   */
  async emitAsync(event, data) {
    // Add to history
    this._addToHistory(event, data);
    
    // Get handlers
    const handlers = this.events.get(event);
    if (!handlers || handlers.size === 0) {
      return [];
    }
    
    // Execute handlers and collect results
    const promises = Array.from(handlers).map(handler => {
      return new Promise(resolve => {
        try {
          const result = handler(data);
          resolve(result);
        } catch (error) {
          this.logger.error(error, 'emit_async_handler', { event, data });
          resolve(undefined);
        }
      });
    });
    
    return Promise.all(promises);
  }

  /**
   * Clear all event listeners
   */
  clear() {
    this.events.clear();
    this.history = [];
  }

  /**
   * Get event history
   * @returns {Array} Event history
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Get registered events
   * @returns {Array} List of event names with handler counts
   */
  getEvents() {
    return Array.from(this.events.entries()).map(([event, handlers]) => ({
      event,
      handlerCount: handlers.size
    }));
  }

  /**
   * Get real-time statistics for monitoring
   * @returns {Object} Statistics object
   */
  getStats() {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    const minuteAgo = now - (60 * 1000);
    
    // Event frequency stats
    const eventFrequency = {};
    this.history.forEach(event => {
      const eventType = event.event.split(':')[0];
      if (!eventFrequency[eventType]) {
        eventFrequency[eventType] = { total: 0, lastHour: 0, lastMinute: 0 };
      }
      
      eventFrequency[eventType].total++;
      if (event.timestamp > hourAgo) {
        eventFrequency[eventType].lastHour++;
      }
      if (event.timestamp > minuteAgo) {
        eventFrequency[eventType].lastMinute++;
      }
    });
    
    // Module activity stats
    const moduleActivity = {};
    this.history.forEach(event => {
      const module = event.event.split(':')[0];
      if (!moduleActivity[module]) {
        moduleActivity[module] = {
          eventCount: 0,
          lastActivity: null,
          events: []
        };
      }
      
      moduleActivity[module].eventCount++;
      moduleActivity[module].lastActivity = event.timestamp;
      moduleActivity[module].events.push(event.event);
    });
    
    return {
      totalEvents: this.history.length,
      registeredEvents: this.events.size,
      eventFrequency,
      moduleActivity,
      recentEvents: this.history.slice(-10),
      uptime: Date.now() - (this.startTime || Date.now())
    };
  }

  /**
   * Subscribe to real-time monitoring events
   * @param {Function} callback - Callback for monitoring updates
   * @returns {Function} Unsubscribe function
   */
  onMonitoringUpdate(callback) {
    return this.on('__monitoring:update', callback);
  }

  /**
   * Get cross-module communication patterns
   * @returns {Object} Communication patterns
   */
  getCommunicationPatterns() {
    const patterns = {};
    
    this.history.forEach(event => {
      const parts = event.event.split(':');
      if (parts.length >= 2) {
        const source = parts[0];
        const target = parts[1];
        
        if (!patterns[source]) {
          patterns[source] = {};
        }
        
        if (!patterns[source][target]) {
          patterns[source][target] = 0;
        }
        
        patterns[source][target]++;
      }
    });
    
    return patterns;
  }

  /**
   * Private: Add event to history
   * @private
   */
  _addToHistory(event, data) {
    this.history.push({
      event,
      data,
      timestamp: Date.now()
    });
    
    // Trim history if needed
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }
}

// Module event names
export const ModuleEvents = {
  // Canvas events
  CANVAS_ELEMENT_CREATED: 'canvas:element:created',
  CANVAS_ELEMENT_UPDATED: 'canvas:element:updated',
  CANVAS_ELEMENT_DELETED: 'canvas:element:deleted',
  CANVAS_BOARD_NAVIGATED: 'canvas:board:navigated',
  CANVAS_SELECTION_CHANGED: 'canvas:selection:changed',
  
  // Mind Garden events
  MINDGARDEN_NODE_CREATED: 'mindgarden:node:created',
  MINDGARDEN_NODE_UPDATED: 'mindgarden:node:updated',
  MINDGARDEN_NODE_DELETED: 'mindgarden:node:deleted',
  MINDGARDEN_EXPORT_REQUESTED: 'mindgarden:export:requested',
  MINDGARDEN_EXPORT_COMPLETED: 'mindgarden:export:completed',
  
  // Cross-module events
  MODULE_INITIALIZED: 'module:initialized',
  MODULE_ERROR: 'module:error',
  CROSS_MODULE_SYNC: 'module:cross:sync',
  
  // Project events
  PROJECT_CHANGED: 'project:changed',
  PROJECT_SAVED: 'project:saved',
  PROJECT_LOADED: 'project:loaded'
};

// Create singleton instance
export const eventBus = new EventBus();

// For debugging in console
if (typeof window !== 'undefined') {
  window.__eventBus = eventBus;
}

export default eventBus;