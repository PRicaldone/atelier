/**
 * Health Check Integration - Connects health checks with existing modules
 * 
 * Automatically registers health providers for all modules and
 * integrates with the existing module system.
 */

import healthCheckManager from './HealthCheckManager.js';
import { 
  CanvasHealthProvider, 
  MindGardenHealthProvider, 
  EventBusHealthProvider,
  ErrorTrackerHealthProvider
} from './ModuleHealthProvider.js';
import moduleRegistry from '../registry/ModuleRegistry.js';
import eventBus from '../events/EventBus.js';
import errorTracker from '../monitoring/ErrorTracker.js';
import { healthLogger } from '../monitoring/ModuleLogger.js';

/**
 * Initialize health checking for all modules
 */
export async function initializeHealthChecking() {
  healthLogger.info('Initializing health checking system', 'initializeHealthChecking');
  
  try {
    // Register Event Bus health provider
    const eventBusProvider = new EventBusHealthProvider(eventBus);
    healthCheckManager.registerModule('event-bus', eventBusProvider, {
      pingInterval: 10000, // 10 seconds
      pingTimeout: 1000,
      maxRetries: 5
    });
    
    // Register Error Tracker health provider
    const errorTrackerProvider = new ErrorTrackerHealthProvider(errorTracker);
    healthCheckManager.registerModule('error-tracker', errorTrackerProvider, {
      pingInterval: 15000, // 15 seconds
      pingTimeout: 1000,
      maxRetries: 3
    });
    
    // Register Canvas health provider
    try {
      const canvasModule = await moduleRegistry.getModule('canvas');
      if (canvasModule) {
        const canvasProvider = new CanvasHealthProvider(canvasModule);
        healthCheckManager.registerModule('canvas', canvasProvider, {
          pingInterval: 5000, // 5 seconds
          pingTimeout: 2000,
          maxRetries: 3
        });
      }
    } catch (error) {
      healthLogger.warning('Canvas module not available for health checking', 'initializeHealthChecking', {
        error: error.message
      });
    }
    
    // Register Mind Garden health provider
    try {
      const mindGardenModule = await moduleRegistry.getModule('mindgarden');
      if (mindGardenModule) {
        const mindGardenProvider = new MindGardenHealthProvider(mindGardenModule);
        healthCheckManager.registerModule('mind-garden', mindGardenProvider, {
          pingInterval: 5000, // 5 seconds
          pingTimeout: 2000,
          maxRetries: 3
        });
      }
    } catch (error) {
      healthLogger.warning('Mind Garden module not available for health checking', 'initializeHealthChecking', {
        error: error.message
      });
    }
    
    
    // Start health checking
    healthCheckManager.start();
    
    healthLogger.info('Health checking system initialized successfully', 'initializeHealthChecking', {
      registeredModules: healthCheckManager.modules.size
    });
    
  } catch (error) {
    healthLogger.error(error, 'initializeHealthChecking');
    throw error;
  }
}

/**
 * Stop health checking system
 */
export function stopHealthChecking() {
  healthLogger.info('Stopping health checking system', 'stopHealthChecking');
  
  try {
    healthCheckManager.stop();
    
    healthLogger.info('Health checking system stopped', 'stopHealthChecking');
    
  } catch (error) {
    healthLogger.error(error, 'stopHealthChecking');
    throw error;
  }
}

/**
 * Get comprehensive health report
 * @returns {Object} Complete health report
 */
export function getHealthReport() {
  try {
    const allHealth = healthCheckManager.getAllModuleHealth();
    const summary = healthCheckManager.getHealthSummary();
    
    // Add system information
    const systemInfo = {
      timestamp: Date.now(),
      uptime: performance.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      memory: performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      } : null
    };
    
    // Add module registry information
    const moduleRegistryInfo = moduleRegistry.getInfo();
    
    // Add event bus statistics
    const eventBusStats = eventBus.getStats ? eventBus.getStats() : {};
    
    // Add error tracker statistics
    const errorTrackerStats = errorTracker.getStats();
    
    return {
      healthCheck: allHealth,
      summary,
      systemInfo,
      moduleRegistry: moduleRegistryInfo,
      eventBus: eventBusStats,
      errorTracker: errorTrackerStats,
      generatedAt: Date.now()
    };
    
  } catch (error) {
    healthLogger.error(error, 'getHealthReport');
    throw error;
  }
}

/**
 * Export health report as JSON
 * @returns {string} JSON string of health report
 */
export function exportHealthReport() {
  try {
    const report = getHealthReport();
    return JSON.stringify(report, null, 2);
    
  } catch (error) {
    healthLogger.error(error, 'exportHealthReport');
    throw error;
  }
}

/**
 * Check if system is healthy
 * @returns {boolean} True if all modules are healthy
 */
export function isSystemHealthy() {
  try {
    const summary = healthCheckManager.getHealthSummary();
    return summary.dead === 0 && summary.critical === 0;
    
  } catch (error) {
    healthLogger.error(error, 'isSystemHealthy');
    return false;
  }
}

/**
 * Get unhealthy modules
 * @returns {Array} List of unhealthy modules
 */
export function getUnhealthyModules() {
  try {
    const allHealth = healthCheckManager.getAllModuleHealth();
    const unhealthy = [];
    
    Object.values(allHealth.modules).forEach(module => {
      if (module.status === 'dead' || module.status === 'critical') {
        unhealthy.push(module);
      }
    });
    
    return unhealthy;
    
  } catch (error) {
    healthLogger.error(error, 'getUnhealthyModules');
    return [];
  }
}

/**
 * Force health check for all modules
 */
export function forceHealthCheck() {
  try {
    healthCheckManager.forceAllHealthChecks();
    
    healthLogger.info('Forced health check for all modules', 'forceHealthCheck');
    
  } catch (error) {
    healthLogger.error(error, 'forceHealthCheck');
    throw error;
  }
}

/**
 * Force health check for specific module
 * @param {string} moduleName - Module name
 */
export function forceModuleHealthCheck(moduleName) {
  try {
    healthCheckManager.forceHealthCheck(moduleName);
    
    healthLogger.info(`Forced health check for module ${moduleName}`, 'forceModuleHealthCheck', {
      moduleName
    });
    
  } catch (error) {
    healthLogger.error(error, 'forceModuleHealthCheck', {
      moduleName
    });
    throw error;
  }
}

/**
 * Register additional health provider
 * @param {string} moduleName - Module name
 * @param {Object} healthProvider - Health provider instance
 * @param {Object} config - Health check configuration
 */
export function registerHealthProvider(moduleName, healthProvider, config = {}) {
  try {
    healthCheckManager.registerModule(moduleName, healthProvider, config);
    
    healthLogger.info(`Registered health provider for module ${moduleName}`, 'registerHealthProvider', {
      moduleName,
      config
    });
    
  } catch (error) {
    healthLogger.error(error, 'registerHealthProvider', {
      moduleName,
      config
    });
    throw error;
  }
}

/**
 * Unregister health provider
 * @param {string} moduleName - Module name
 */
export function unregisterHealthProvider(moduleName) {
  try {
    healthCheckManager.unregisterModule(moduleName);
    
    healthLogger.info(`Unregistered health provider for module ${moduleName}`, 'unregisterHealthProvider', {
      moduleName
    });
    
  } catch (error) {
    healthLogger.error(error, 'unregisterHealthProvider', {
      moduleName
    });
    throw error;
  }
}

// Listen for critical health events and log them
eventBus.on('health:status:changed', (data) => {
  const { moduleName, previousStatus, newStatus } = data;
  
  if (newStatus === 'critical' || newStatus === 'dead') {
    healthLogger.error(
      new Error(`Module ${moduleName} health changed to ${newStatus}`),
      'healthStatusChanged',
      { moduleName, previousStatus, newStatus }
    );
  } else if (newStatus === 'healthy' && (previousStatus === 'critical' || previousStatus === 'dead')) {
    healthLogger.info(
      `Module ${moduleName} recovered from ${previousStatus} to ${newStatus}`,
      'healthStatusChanged',
      { moduleName, previousStatus, newStatus }
    );
  }
});

// Listen for restart events
eventBus.on('health:restart:attempt', (data) => {
  healthLogger.warning(
    `Attempting restart for module ${data.moduleName} (attempt ${data.attempt})`,
    'healthRestartAttempt',
    data
  );
});

eventBus.on('health:restart:success', (data) => {
  healthLogger.info(
    `Restart successful for module ${data.moduleName} (attempt ${data.attempt})`,
    'healthRestartSuccess',
    data
  );
});

eventBus.on('health:restart:failure', (data) => {
  healthLogger.error(
    new Error(`Restart failed for module ${data.moduleName} (attempt ${data.attempt}): ${data.error}`),
    'healthRestartFailure',
    data
  );
});

// Export health check manager for advanced usage
export { healthCheckManager };

// Make available for debugging
if (typeof window !== 'undefined') {
  window.__healthCheckIntegration = {
    initializeHealthChecking,
    stopHealthChecking,
    getHealthReport,
    exportHealthReport,
    isSystemHealthy,
    getUnhealthyModules,
    forceHealthCheck,
    forceModuleHealthCheck,
    registerHealthProvider,
    unregisterHealthProvider,
    healthCheckManager
  };
}