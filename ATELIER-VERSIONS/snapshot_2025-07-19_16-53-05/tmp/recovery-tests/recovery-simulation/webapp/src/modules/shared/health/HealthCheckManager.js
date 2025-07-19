/**
 * Health Check Manager - Automated health monitoring for all modules
 * 
 * Features:
 * - Ping-based health checks with configurable intervals
 * - Auto-restart for failed modules
 * - Heartbeat system with timeout detection
 * - Health status aggregation and reporting
 * - Integration with ErrorTracker for failure analysis
 */

import { healthLogger } from '../monitoring/ModuleLogger.js';
import errorTracker from '../monitoring/ErrorTracker.js';
import eventBus, { ModuleEvents } from '../events/EventBus.js';

// Health check status constants
export const HealthStatus = {
  HEALTHY: 'healthy',
  WARNING: 'warning', 
  CRITICAL: 'critical',
  DEAD: 'dead',
  RESTARTING: 'restarting',
  UNKNOWN: 'unknown'
};

// Health check configuration
const DEFAULT_CONFIG = {
  pingInterval: 5000, // 5 seconds
  pingTimeout: 2000, // 2 seconds
  maxRetries: 3,
  restartDelay: 1000, // 1 second
  heartbeatTimeout: 10000, // 10 seconds
  warningThreshold: 2, // failures before warning
  criticalThreshold: 5 // failures before critical
};

class HealthCheckManager {
  constructor() {
    this.modules = new Map(); // Registered modules for health checking
    this.healthStatus = new Map(); // Current health status
    this.intervals = new Map(); // Ping intervals
    this.heartbeats = new Map(); // Last heartbeat timestamps
    this.failureCounts = new Map(); // Failure counters
    this.restartAttempts = new Map(); // Restart attempt counters
    this.config = { ...DEFAULT_CONFIG };
    this.logger = healthLogger;
    this.isActive = false;
    this.startTime = Date.now();
    
    // Bind methods
    this.handleModuleInitialized = this.handleModuleInitialized.bind(this);
    this.handleModuleError = this.handleModuleError.bind(this);
    
    // Listen to module events
    eventBus.on(ModuleEvents.MODULE_INITIALIZED, this.handleModuleInitialized);
    eventBus.on(ModuleEvents.MODULE_ERROR, this.handleModuleError);
  }
  
  /**
   * Register a module for health checking
   * @param {string} moduleName - Module name
   * @param {Object} healthProvider - Object with health check methods
   * @param {Object} config - Custom configuration
   */
  registerModule(moduleName, healthProvider, config = {}) {
    const moduleConfig = { ...this.config, ...config };
    
    // Validate health provider
    if (!healthProvider || typeof healthProvider.ping !== 'function') {
      throw new Error(`Module ${moduleName} must provide a ping() method`);
    }
    
    this.modules.set(moduleName, {
      healthProvider,
      config: moduleConfig,
      registeredAt: Date.now()
    });
    
    this.healthStatus.set(moduleName, HealthStatus.UNKNOWN);
    this.failureCounts.set(moduleName, 0);
    this.restartAttempts.set(moduleName, 0);
    this.heartbeats.set(moduleName, Date.now());
    
    this.logger.info(`Module ${moduleName} registered for health checking`, 'registerModule', {
      moduleName,
      config: moduleConfig
    });
    
    // Start health checking if manager is active
    if (this.isActive) {
      this.startModuleHealthCheck(moduleName);
    }
    
    // Emit registration event
    eventBus.emit('health:module:registered', {
      moduleName,
      timestamp: Date.now()
    });
  }
  
  /**
   * Unregister a module from health checking
   * @param {string} moduleName - Module name
   */
  unregisterModule(moduleName) {
    this.stopModuleHealthCheck(moduleName);
    
    this.modules.delete(moduleName);
    this.healthStatus.delete(moduleName);
    this.failureCounts.delete(moduleName);
    this.restartAttempts.delete(moduleName);
    this.heartbeats.delete(moduleName);
    
    this.logger.info(`Module ${moduleName} unregistered from health checking`, 'unregisterModule', {
      moduleName
    });
    
    eventBus.emit('health:module:unregistered', {
      moduleName,
      timestamp: Date.now()
    });
  }
  
  /**
   * Start health checking for all registered modules
   */
  start() {
    if (this.isActive) {
      this.logger.warning('Health check manager already active', 'start');
      return;
    }
    
    this.isActive = true;
    this.startTime = Date.now();
    
    // Start health checks for all registered modules
    for (const moduleName of this.modules.keys()) {
      this.startModuleHealthCheck(moduleName);
    }
    
    this.logger.info('Health check manager started', 'start', {
      moduleCount: this.modules.size
    });
    
    eventBus.emit('health:manager:started', {
      moduleCount: this.modules.size,
      timestamp: Date.now()
    });
  }
  
  /**
   * Stop health checking for all modules
   */
  stop() {
    if (!this.isActive) {
      this.logger.warning('Health check manager not active', 'stop');
      return;
    }
    
    this.isActive = false;
    
    // Stop all health check intervals
    for (const moduleName of this.modules.keys()) {
      this.stopModuleHealthCheck(moduleName);
    }
    
    this.logger.info('Health check manager stopped', 'stop', {
      moduleCount: this.modules.size
    });
    
    eventBus.emit('health:manager:stopped', {
      timestamp: Date.now()
    });
  }
  
  /**
   * Start health checking for a specific module
   * @param {string} moduleName - Module name
   */
  startModuleHealthCheck(moduleName) {
    const moduleData = this.modules.get(moduleName);
    if (!moduleData) {
      this.logger.error(new Error(`Module ${moduleName} not registered`), 'startModuleHealthCheck', {
        moduleName
      });
      return;
    }
    
    // Clear existing interval if any
    this.stopModuleHealthCheck(moduleName);
    
    // Start ping interval
    const interval = setInterval(() => {
      this.performHealthCheck(moduleName);
    }, moduleData.config.pingInterval);
    
    this.intervals.set(moduleName, interval);
    
    // Perform initial health check
    this.performHealthCheck(moduleName);
    
    this.logger.info(`Health checking started for module ${moduleName}`, 'startModuleHealthCheck', {
      moduleName,
      interval: moduleData.config.pingInterval
    });
  }
  
  /**
   * Stop health checking for a specific module
   * @param {string} moduleName - Module name
   */
  stopModuleHealthCheck(moduleName) {
    const interval = this.intervals.get(moduleName);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(moduleName);
    }
  }
  
  /**
   * Perform health check for a module
   * @param {string} moduleName - Module name
   */
  async performHealthCheck(moduleName) {
    const moduleData = this.modules.get(moduleName);
    if (!moduleData) return;
    
    const { healthProvider, config } = moduleData;
    const startTime = Date.now();
    
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), config.pingTimeout);
      });
      
      // Perform ping with timeout
      const result = await Promise.race([
        healthProvider.ping(),
        timeoutPromise
      ]);
      
      const responseTime = Date.now() - startTime;
      
      // Handle successful ping
      this.handleHealthCheckSuccess(moduleName, result, responseTime);
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Handle failed ping
      this.handleHealthCheckFailure(moduleName, error, responseTime);
    }
  }
  
  /**
   * Handle successful health check
   * @param {string} moduleName - Module name
   * @param {*} result - Ping result
   * @param {number} responseTime - Response time in ms
   */
  handleHealthCheckSuccess(moduleName, result, responseTime) {
    const previousStatus = this.healthStatus.get(moduleName);
    
    // Reset failure count
    this.failureCounts.set(moduleName, 0);
    this.restartAttempts.set(moduleName, 0);
    
    // Update heartbeat
    this.heartbeats.set(moduleName, Date.now());
    
    // Determine health status based on response time
    let newStatus = HealthStatus.HEALTHY;
    if (responseTime > 1000) {
      newStatus = HealthStatus.WARNING;
    }
    
    // Update status
    this.healthStatus.set(moduleName, newStatus);
    
    // Log success
    this.logger.info(`Health check successful for ${moduleName}`, 'performHealthCheck', {
      moduleName,
      responseTime,
      status: newStatus,
      result
    });
    
    // Emit event if status changed
    if (previousStatus !== newStatus) {
      eventBus.emit('health:status:changed', {
        moduleName,
        previousStatus,
        newStatus,
        responseTime,
        timestamp: Date.now()
      });
    }
    
    // Emit heartbeat event
    eventBus.emit('health:heartbeat', {
      moduleName,
      responseTime,
      timestamp: Date.now()
    });
  }
  
  /**
   * Handle failed health check
   * @param {string} moduleName - Module name
   * @param {Error} error - Error that occurred
   * @param {number} responseTime - Response time in ms
   */
  handleHealthCheckFailure(moduleName, error, responseTime) {
    const moduleData = this.modules.get(moduleName);
    if (!moduleData) return;
    
    const previousStatus = this.healthStatus.get(moduleName);
    const failureCount = this.failureCounts.get(moduleName) + 1;
    
    // Update failure count
    this.failureCounts.set(moduleName, failureCount);
    
    // Determine new status based on failure count
    let newStatus = HealthStatus.HEALTHY;
    if (failureCount >= moduleData.config.criticalThreshold) {
      newStatus = HealthStatus.CRITICAL;
    } else if (failureCount >= moduleData.config.warningThreshold) {
      newStatus = HealthStatus.WARNING;
    }
    
    // Check if module should be considered dead
    if (failureCount >= moduleData.config.maxRetries) {
      newStatus = HealthStatus.DEAD;
    }
    
    // Update status
    this.healthStatus.set(moduleName, newStatus);
    
    // Log failure
    this.logger.error(error, 'performHealthCheck', {
      moduleName,
      failureCount,
      responseTime,
      status: newStatus
    });
    
    // Track error in ErrorTracker
    errorTracker.logError(error, 'health-check', 'ping', {
      moduleName,
      failureCount,
      responseTime
    });
    
    // Emit event if status changed
    if (previousStatus !== newStatus) {
      eventBus.emit('health:status:changed', {
        moduleName,
        previousStatus,
        newStatus,
        failureCount,
        error: error.message,
        timestamp: Date.now()
      });
    }
    
    // Attempt restart if module is dead
    if (newStatus === HealthStatus.DEAD) {
      this.attemptModuleRestart(moduleName);
    }
  }
  
  /**
   * Attempt to restart a dead module
   * @param {string} moduleName - Module name
   */
  async attemptModuleRestart(moduleName) {
    const moduleData = this.modules.get(moduleName);
    if (!moduleData) return;
    
    const restartAttempts = this.restartAttempts.get(moduleName);
    
    // Check if we should attempt restart
    if (restartAttempts >= 3) {
      this.logger.error(new Error(`Module ${moduleName} restart attempts exceeded`), 'attemptModuleRestart', {
        moduleName,
        restartAttempts
      });
      return;
    }
    
    // Update status to restarting
    this.healthStatus.set(moduleName, HealthStatus.RESTARTING);
    this.restartAttempts.set(moduleName, restartAttempts + 1);
    
    this.logger.info(`Attempting to restart module ${moduleName}`, 'attemptModuleRestart', {
      moduleName,
      attempt: restartAttempts + 1
    });
    
    eventBus.emit('health:restart:attempt', {
      moduleName,
      attempt: restartAttempts + 1,
      timestamp: Date.now()
    });
    
    try {
      // Wait for restart delay
      await new Promise(resolve => setTimeout(resolve, moduleData.config.restartDelay));
      
      // Attempt restart if module provides restart method
      if (moduleData.healthProvider.restart) {
        await moduleData.healthProvider.restart();
      }
      
      // Reset failure count
      this.failureCounts.set(moduleName, 0);
      
      this.logger.info(`Module ${moduleName} restart successful`, 'attemptModuleRestart', {
        moduleName,
        attempt: restartAttempts + 1
      });
      
      eventBus.emit('health:restart:success', {
        moduleName,
        attempt: restartAttempts + 1,
        timestamp: Date.now()
      });
      
    } catch (error) {
      this.logger.error(error, 'attemptModuleRestart', {
        moduleName,
        attempt: restartAttempts + 1
      });
      
      eventBus.emit('health:restart:failure', {
        moduleName,
        attempt: restartAttempts + 1,
        error: error.message,
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * Handle module initialization event
   * @param {Object} data - Event data
   */
  handleModuleInitialized(data) {
    const { moduleName } = data;
    
    // Update heartbeat
    this.heartbeats.set(moduleName, Date.now());
    
    // Reset failure count
    this.failureCounts.set(moduleName, 0);
    
    this.logger.info(`Module ${moduleName} initialized`, 'handleModuleInitialized', {
      moduleName
    });
  }
  
  /**
   * Handle module error event
   * @param {Object} data - Event data
   */
  handleModuleError(data) {
    const { moduleName, error } = data;
    
    // Increment failure count
    const failureCount = this.failureCounts.get(moduleName) || 0;
    this.failureCounts.set(moduleName, failureCount + 1);
    
    this.logger.warning(`Module ${moduleName} reported error`, 'handleModuleError', {
      moduleName,
      failureCount: failureCount + 1,
      error
    });
  }
  
  /**
   * Get health status for a specific module
   * @param {string} moduleName - Module name
   * @returns {Object} Health status information
   */
  getModuleHealth(moduleName) {
    if (!this.modules.has(moduleName)) {
      return null;
    }
    
    const status = this.healthStatus.get(moduleName);
    const failureCount = this.failureCounts.get(moduleName);
    const restartAttempts = this.restartAttempts.get(moduleName);
    const lastHeartbeat = this.heartbeats.get(moduleName);
    const moduleData = this.modules.get(moduleName);
    
    return {
      moduleName,
      status,
      failureCount,
      restartAttempts,
      lastHeartbeat,
      timeSinceLastHeartbeat: Date.now() - lastHeartbeat,
      isHealthy: status === HealthStatus.HEALTHY,
      registeredAt: moduleData.registeredAt,
      config: moduleData.config
    };
  }
  
  /**
   * Get health status for all modules
   * @returns {Object} Complete health status
   */
  getAllModuleHealth() {
    const health = {};
    
    for (const moduleName of this.modules.keys()) {
      health[moduleName] = this.getModuleHealth(moduleName);
    }
    
    return {
      modules: health,
      summary: this.getHealthSummary(),
      managerStatus: {
        isActive: this.isActive,
        startTime: this.startTime,
        uptime: Date.now() - this.startTime,
        registeredModules: this.modules.size
      }
    };
  }
  
  /**
   * Get health summary statistics
   * @returns {Object} Health summary
   */
  getHealthSummary() {
    const summary = {
      total: this.modules.size,
      healthy: 0,
      warning: 0,
      critical: 0,
      dead: 0,
      restarting: 0,
      unknown: 0
    };
    
    for (const status of this.healthStatus.values()) {
      summary[status] = (summary[status] || 0) + 1;
    }
    
    return summary;
  }
  
  /**
   * Force a health check for a specific module
   * @param {string} moduleName - Module name
   */
  forceHealthCheck(moduleName) {
    if (!this.modules.has(moduleName)) {
      throw new Error(`Module ${moduleName} not registered`);
    }
    
    this.performHealthCheck(moduleName);
  }
  
  /**
   * Force a health check for all modules
   */
  forceAllHealthChecks() {
    for (const moduleName of this.modules.keys()) {
      this.performHealthCheck(moduleName);
    }
  }
  
  /**
   * Update configuration for a specific module
   * @param {string} moduleName - Module name
   * @param {Object} config - New configuration
   */
  updateModuleConfig(moduleName, config) {
    const moduleData = this.modules.get(moduleName);
    if (!moduleData) {
      throw new Error(`Module ${moduleName} not registered`);
    }
    
    // Update configuration
    moduleData.config = { ...moduleData.config, ...config };
    
    // Restart health checking with new config
    if (this.isActive) {
      this.stopModuleHealthCheck(moduleName);
      this.startModuleHealthCheck(moduleName);
    }
    
    this.logger.info(`Configuration updated for module ${moduleName}`, 'updateModuleConfig', {
      moduleName,
      config
    });
  }
  
  /**
   * Get configuration for the health check manager
   * @returns {Object} Current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  
  /**
   * Update global configuration
   * @param {Object} config - New configuration
   */
  updateConfig(config) {
    this.config = { ...this.config, ...config };
    
    this.logger.info('Global configuration updated', 'updateConfig', {
      config: this.config
    });
  }
}

// Create singleton instance
export const healthCheckManager = new HealthCheckManager();

// Make available for debugging
if (typeof window !== 'undefined') {
  window.__healthCheckManager = healthCheckManager;
}

export default healthCheckManager;