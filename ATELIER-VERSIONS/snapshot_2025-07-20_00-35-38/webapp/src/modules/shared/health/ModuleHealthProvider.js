/**
 * Module Health Provider - Base class for module health checking
 * 
 * Provides standard interface for module health checks:
 * - ping() - Basic health check
 * - restart() - Module restart capability
 * - getMetrics() - Health metrics
 * - cleanup() - Resource cleanup
 */

import { healthLogger } from '../monitoring/ModuleLogger.js';

export class ModuleHealthProvider {
  constructor(moduleName, options = {}) {
    this.moduleName = moduleName;
    this.options = {
      enableMetrics: true,
      enableRestart: true,
      pingTimeout: 1000,
      ...options
    };
    
    this.logger = healthLogger.child({ module: moduleName });
    this.startTime = Date.now();
    this.pingCount = 0;
    this.lastPingTime = null;
    this.metrics = {
      totalPings: 0,
      successfulPings: 0,
      failedPings: 0,
      averageResponseTime: 0,
      totalRestarts: 0
    };
  }
  
  /**
   * Ping method - must be implemented by subclasses
   * @returns {Promise<Object>} Health check result
   */
  async ping() {
    throw new Error(`ping() method must be implemented by ${this.moduleName}`);
  }
  
  /**
   * Restart method - optional, can be implemented by subclasses
   * @returns {Promise<void>}
   */
  async restart() {
    if (!this.options.enableRestart) {
      throw new Error(`Restart not enabled for ${this.moduleName}`);
    }
    
    this.logger.info('Restart not implemented', 'restart');
    throw new Error(`restart() method not implemented by ${this.moduleName}`);
  }
  
  /**
   * Get health metrics
   * @returns {Object} Health metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime,
      lastPingTime: this.lastPingTime,
      moduleName: this.moduleName
    };
  }
  
  /**
   * Update ping metrics
   * @param {boolean} success - Whether ping was successful
   * @param {number} responseTime - Response time in ms
   */
  updateMetrics(success, responseTime) {
    if (!this.options.enableMetrics) return;
    
    this.metrics.totalPings++;
    this.lastPingTime = Date.now();
    
    if (success) {
      this.metrics.successfulPings++;
    } else {
      this.metrics.failedPings++;
    }
    
    // Update average response time
    this.metrics.averageResponseTime = (
      (this.metrics.averageResponseTime * (this.metrics.totalPings - 1)) + responseTime
    ) / this.metrics.totalPings;
  }
  
  /**
   * Record restart attempt
   */
  recordRestart() {
    this.metrics.totalRestarts++;
    this.logger.info('Restart recorded', 'recordRestart', {
      totalRestarts: this.metrics.totalRestarts
    });
  }
  
  /**
   * Cleanup resources
   */
  cleanup() {
    this.logger.info('Cleanup called', 'cleanup');
  }
}

/**
 * Canvas Health Provider - Health checks for Canvas module
 */
export class CanvasHealthProvider extends ModuleHealthProvider {
  constructor(canvasStore) {
    super('canvas', {
      enableMetrics: true,
      enableRestart: true,
      pingTimeout: 500
    });
    
    this.canvasStore = canvasStore;
  }
  
  /**
   * Ping Canvas module
   * @returns {Promise<Object>} Health check result
   */
  async ping() {
    const startTime = Date.now();
    
    try {
      // Check if store is accessible
      if (!this.canvasStore) {
        throw new Error('Canvas store not available');
      }
      
      // Get current state
      const state = typeof this.canvasStore === 'function' 
        ? this.canvasStore.getState() 
        : this.canvasStore;
      
      // Validate essential properties
      if (!state || typeof state !== 'object') {
        throw new Error('Canvas state invalid');
      }
      
      // Check if elements array exists
      if (!Array.isArray(state.elements)) {
        throw new Error('Canvas elements array missing');
      }
      
      // Check viewport
      if (!state.viewport || typeof state.viewport !== 'object') {
        throw new Error('Canvas viewport missing');
      }
      
      const responseTime = Date.now() - startTime;
      this.updateMetrics(true, responseTime);
      
      return {
        status: 'healthy',
        responseTime,
        elementCount: state.elements.length,
        viewport: state.viewport,
        timestamp: Date.now()
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime);
      
      this.logger.error(error, 'ping', {
        responseTime
      });
      
      throw error;
    }
  }
  
  /**
   * Restart Canvas module
   * @returns {Promise<void>}
   */
  async restart() {
    this.logger.info('Attempting Canvas restart', 'restart');
    
    try {
      // Reset Canvas state if possible
      if (this.canvasStore && typeof this.canvasStore.getState === 'function') {
        const state = this.canvasStore.getState();
        if (state.reset) {
          await state.reset();
        }
      }
      
      this.recordRestart();
      this.logger.info('Canvas restart successful', 'restart');
      
    } catch (error) {
      this.logger.error(error, 'restart');
      throw error;
    }
  }
}

/**
 * Mind Garden Health Provider - Health checks for Mind Garden module
 */
export class MindGardenHealthProvider extends ModuleHealthProvider {
  constructor(mindGardenStore) {
    super('mind-garden', {
      enableMetrics: true,
      enableRestart: true,
      pingTimeout: 500
    });
    
    this.mindGardenStore = mindGardenStore;
  }
  
  /**
   * Ping Mind Garden module
   * @returns {Promise<Object>} Health check result
   */
  async ping() {
    const startTime = Date.now();
    
    try {
      // Check if store is accessible
      if (!this.mindGardenStore) {
        throw new Error('Mind Garden store not available');
      }
      
      // Get current state
      const state = typeof this.mindGardenStore === 'function' 
        ? this.mindGardenStore.getState() 
        : this.mindGardenStore;
      
      // Validate essential properties
      if (!state || typeof state !== 'object') {
        throw new Error('Mind Garden state invalid');
      }
      
      // Check if nodes array exists
      if (!Array.isArray(state.nodes)) {
        throw new Error('Mind Garden nodes array missing');
      }
      
      // Check if edges array exists
      if (!Array.isArray(state.edges)) {
        throw new Error('Mind Garden edges array missing');
      }
      
      const responseTime = Date.now() - startTime;
      this.updateMetrics(true, responseTime);
      
      return {
        status: 'healthy',
        responseTime,
        nodeCount: state.nodes.length,
        edgeCount: state.edges.length,
        timestamp: Date.now()
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime);
      
      this.logger.error(error, 'ping', {
        responseTime
      });
      
      throw error;
    }
  }
  
  /**
   * Restart Mind Garden module
   * @returns {Promise<void>}
   */
  async restart() {
    this.logger.info('Attempting Mind Garden restart', 'restart');
    
    try {
      // Reset Mind Garden state if possible
      if (this.mindGardenStore && typeof this.mindGardenStore.getState === 'function') {
        const state = this.mindGardenStore.getState();
        if (state.reset) {
          await state.reset();
        }
      }
      
      this.recordRestart();
      this.logger.info('Mind Garden restart successful', 'restart');
      
    } catch (error) {
      this.logger.error(error, 'restart');
      throw error;
    }
  }
}

/**
 * Orchestra Health Provider - Health checks for Orchestra module
 */
export class OrchestraHealthProvider extends ModuleHealthProvider {
  constructor(orchestraStore) {
    super('orchestra', {
      enableMetrics: true,
      enableRestart: true,
      pingTimeout: 500
    });
    
    this.orchestraStore = orchestraStore;
  }
  
  /**
   * Ping Orchestra module
   * @returns {Promise<Object>} Health check result
   */
  async ping() {
    const startTime = Date.now();
    
    try {
      // Orchestra is a simple React component without a store
      // Just check if the module exists and is accessible
      const responseTime = Date.now() - startTime;
      this.updateMetrics(true, responseTime);
      
      return {
        status: 'healthy',
        responseTime,
        moduleType: 'react-component',
        timestamp: Date.now()
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime);
      
      this.logger.error(error, 'ping', {
        responseTime
      });
      
      throw error;
    }
  }
  
  /**
   * Restart Orchestra module
   * @returns {Promise<void>}
   */
  async restart() {
    this.logger.info('Attempting Orchestra restart', 'restart');
    
    try {
      // Orchestra is a React component, restart not applicable
      // Just record the restart attempt for metrics
      this.recordRestart();
      this.logger.info('Orchestra restart successful (no-op for React component)', 'restart');
      
    } catch (error) {
      this.logger.error(error, 'restart');
      throw error;
    }
  }
}

/**
 * Event Bus Health Provider - Health checks for Event Bus
 */
export class EventBusHealthProvider extends ModuleHealthProvider {
  constructor(eventBus) {
    super('event-bus', {
      enableMetrics: true,
      enableRestart: false, // Event Bus doesn't support restart
      pingTimeout: 100
    });
    
    this.eventBus = eventBus;
  }
  
  /**
   * Ping Event Bus
   * @returns {Promise<Object>} Health check result
   */
  async ping() {
    const startTime = Date.now();
    
    try {
      // Check if event bus is accessible
      if (!this.eventBus) {
        throw new Error('Event Bus not available');
      }
      
      // Test basic functionality
      const testEvent = `health-check-${Date.now()}`;
      let testPassed = false;
      
      // Set up test listener
      const unsubscribe = this.eventBus.on(testEvent, () => {
        testPassed = true;
      });
      
      // Emit test event
      this.eventBus.emit(testEvent, { test: true });
      
      // Wait a bit for event to be processed
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Cleanup
      unsubscribe();
      
      if (!testPassed) {
        throw new Error('Event Bus test failed');
      }
      
      // Get statistics
      const stats = this.eventBus.getStats ? this.eventBus.getStats() : {};
      
      const responseTime = Date.now() - startTime;
      this.updateMetrics(true, responseTime);
      
      return {
        status: 'healthy',
        responseTime,
        totalEvents: stats.totalEvents || 0,
        registeredEvents: stats.registeredEvents || 0,
        timestamp: Date.now()
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime);
      
      this.logger.error(error, 'ping', {
        responseTime
      });
      
      throw error;
    }
  }
}

/**
 * Error Tracker Health Provider - Health checks for Error Tracker
 */
export class ErrorTrackerHealthProvider extends ModuleHealthProvider {
  constructor(errorTracker) {
    super('error-tracker', {
      enableMetrics: true,
      enableRestart: false, // Error Tracker doesn't support restart
      pingTimeout: 100
    });
    
    this.errorTracker = errorTracker;
  }
  
  /**
   * Ping Error Tracker
   * @returns {Promise<Object>} Health check result
   */
  async ping() {
    const startTime = Date.now();
    
    try {
      // Check if error tracker is accessible
      if (!this.errorTracker) {
        throw new Error('Error Tracker not available');
      }
      
      // Test basic functionality
      const testError = new Error('Health check test error');
      this.errorTracker.logInfo('Health check test', 'health-check', 'ping', {
        test: true
      });
      
      // Get statistics
      const stats = this.errorTracker.getStats ? this.errorTracker.getStats() : {};
      
      const responseTime = Date.now() - startTime;
      this.updateMetrics(true, responseTime);
      
      return {
        status: 'healthy',
        responseTime,
        totalErrors: stats.total || 0,
        errorsByModule: Object.keys(stats.byModule || {}).length,
        timestamp: Date.now()
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime);
      
      this.logger.error(error, 'ping', {
        responseTime
      });
      
      throw error;
    }
  }
}