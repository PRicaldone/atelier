/**
 * ModuleLogger - Convenience wrapper for ErrorTracker per module
 * Provides module-specific logging with automatic context
 */
import errorTracker from './ErrorTracker.js';

/**
 * Create a module-specific logger
 * @param {string} moduleName - Name of the module
 * @param {Object} defaultContext - Default context for this module
 * @returns {Object} Logger instance
 */
export function createModuleLogger(moduleName, defaultContext = {}) {
  return {
    /**
     * Log error with module context
     */
    error(error, action = 'unknown', context = {}) {
      return errorTracker.logError(
        error,
        moduleName,
        action,
        { ...defaultContext, ...context }
      );
    },

    /**
     * Log warning with module context
     */
    warning(warning, action = 'unknown', context = {}) {
      return errorTracker.logWarning(
        warning,
        moduleName,
        action,
        { ...defaultContext, ...context }
      );
    },

    /**
     * Log info with module context
     */
    info(info, action = 'unknown', context = {}) {
      return errorTracker.logInfo(
        info,
        moduleName,
        action,
        { ...defaultContext, ...context }
      );
    },

    /**
     * Log debug with module context
     */
    debug(debug, action = 'unknown', context = {}) {
      return errorTracker.logDebug(
        debug,
        moduleName,
        action,
        { ...defaultContext, ...context }
      );
    },

    /**
     * Time an operation
     */
    time(label, action = 'timing') {
      const startTime = performance.now();
      return {
        end: () => {
          const duration = performance.now() - startTime;
          this.info(
            { message: `${label} completed`, duration: `${duration.toFixed(2)}ms` },
            action,
            { timing: true, duration }
          );
          return duration;
        }
      };
    },

    /**
     * Wrap a function with error logging
     */
    wrap(fn, action = 'wrapped_function') {
      return async (...args) => {
        try {
          const result = await fn(...args);
          return result;
        } catch (error) {
          this.error(error, action, {
            functionName: fn.name,
            arguments: args.length
          });
          throw error;
        }
      };
    },

    /**
     * Log async operation with automatic timing
     */
    async logAsync(asyncFn, action = 'async_operation', context = {}) {
      const timer = this.time(action, 'async_timing');
      try {
        const result = await asyncFn();
        timer.end();
        return result;
      } catch (error) {
        timer.end();
        this.error(error, action, context);
        throw error;
      }
    },

    /**
     * Create child logger with additional context
     */
    child(childContext) {
      return createModuleLogger(moduleName, { ...defaultContext, ...childContext });
    }
  };
}

/**
 * Pre-configured loggers for existing modules
 */
export const scriptoriumLogger = createModuleLogger('scriptorium', {
  module: 'scriptorium',
  component: 'store'
});

// Backward compatibility alias
export const canvasLogger = scriptoriumLogger;

export const mindGardenLogger = createModuleLogger('mind-garden', {
  module: 'mind-garden',
  component: 'store'
});

export const orchestraLogger = createModuleLogger('orchestra', {
  module: 'orchestra',
  component: 'ui'
});

export const moduleRegistryLogger = createModuleLogger('module-registry', {
  module: 'shared',
  component: 'registry'
});

export const eventBusLogger = createModuleLogger('event-bus', {
  module: 'shared',
  component: 'events'
});

export const adapterLogger = createModuleLogger('adapter', {
  module: 'shared',
  component: 'adapter'
});

export const healthLogger = createModuleLogger('health-check', {
  module: 'shared',
  component: 'health'
});

export const testLogger = createModuleLogger('integration-test', {
  module: 'shared',
  component: 'testing'
});

export const alertLogger = createModuleLogger('alerting-system', {
  module: 'shared',
  component: 'alerting'
});

/**
 * Console replacement for gradual migration
 * Drop-in replacement for console.log/error/warn
 */
export const structuredConsole = {
  log: (message, ...args) => {
    errorTracker.logInfo(
      { message: typeof message === 'string' ? message : JSON.stringify(message), args },
      'console',
      'log'
    );
  },
  
  error: (error, ...args) => {
    errorTracker.logError(
      error instanceof Error ? error : new Error(error),
      'console',
      'error',
      { args }
    );
  },
  
  warn: (warning, ...args) => {
    errorTracker.logWarning(
      { message: typeof warning === 'string' ? warning : JSON.stringify(warning), args },
      'console',
      'warn'
    );
  },
  
  info: (info, ...args) => {
    errorTracker.logInfo(
      { message: typeof info === 'string' ? info : JSON.stringify(info), args },
      'console',
      'info'
    );
  },
  
  debug: (debug, ...args) => {
    errorTracker.logDebug(
      { message: typeof debug === 'string' ? debug : JSON.stringify(debug), args },
      'console',
      'debug'
    );
  }
};

/**
 * React Hook for component logging
 */
export function useModuleLogger(moduleName, componentName) {
  const logger = createModuleLogger(moduleName, {
    component: componentName,
    reactHook: true
  });
  
  // Log component mount/unmount
  React.useEffect(() => {
    logger.debug('Component mounted', 'lifecycle');
    return () => {
      logger.debug('Component unmounted', 'lifecycle');
    };
  }, []);
  
  return logger;
}

export default createModuleLogger;