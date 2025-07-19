/**
 * ErrorTracker - Centralized error tracking and logging system
 * Replaces scattered console.log statements with structured logging
 */

class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 1000; // Keep last 1000 errors
    this.errorCounts = new Map(); // For aggregation
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    
    // Error levels
    this.levels = {
      CRITICAL: 'critical',
      ERROR: 'error', 
      WARNING: 'warning',
      INFO: 'info',
      DEBUG: 'debug'
    };
    
    // Setup global error handlers
    this.setupGlobalHandlers();
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Setup global error handlers
   */
  setupGlobalHandlers() {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        type: 'unhandled_error'
      }, 'global', 'window.error');
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        reason: event.reason,
        type: 'unhandled_rejection'
      }, 'global', 'promise.rejection');
    });

    // Catch React errors (if available)
    if (typeof window.React !== 'undefined') {
      const originalError = console.error;
      console.error = (...args) => {
        // Check if it's a React error
        if (args[0] && args[0].includes && args[0].includes('Warning:')) {
          this.logWarning({
            message: args.join(' '),
            type: 'react_warning'
          }, 'react', 'console.error');
        }
        originalError.apply(console, args);
      };
    }
  }

  /**
   * Log an error with full context
   */
  logError(error, module = 'unknown', action = 'unknown', context = {}) {
    const errorEntry = this.createErrorEntry(error, this.levels.ERROR, module, action, context);
    this.recordError(errorEntry);
    
    // Emit event for critical errors
    if (this.isCriticalError(error)) {
      this.emitCriticalError(errorEntry);
    }
    
    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 [${module}:${action}] ${error.message || error}`);
      console.error('Error:', error);
      console.log('Context:', context);
      console.log('Stack:', error.stack);
      console.groupEnd();
    }
    
    return errorEntry.id;
  }

  /**
   * Log a warning
   */
  logWarning(warning, module = 'unknown', action = 'unknown', context = {}) {
    const warningEntry = this.createErrorEntry(warning, this.levels.WARNING, module, action, context);
    this.recordError(warningEntry);
    
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ [${module}:${action}]`, warning.message || warning, context);
    }
    
    return warningEntry.id;
  }

  /**
   * Log info message
   */
  logInfo(info, module = 'unknown', action = 'unknown', context = {}) {
    const infoEntry = this.createErrorEntry(info, this.levels.INFO, module, action, context);
    this.recordError(infoEntry);
    
    if (process.env.NODE_ENV === 'development') {
      console.info(`ℹ️ [${module}:${action}]`, info.message || info, context);
    }
    
    return infoEntry.id;
  }

  /**
   * Log debug message
   */
  logDebug(debug, module = 'unknown', action = 'unknown', context = {}) {
    // Only log debug in development
    if (process.env.NODE_ENV !== 'development') return;
    
    const debugEntry = this.createErrorEntry(debug, this.levels.DEBUG, module, action, context);
    this.recordError(debugEntry);
    
    console.debug(`🔍 [${module}:${action}]`, debug.message || debug, context);
    
    return debugEntry.id;
  }

  /**
   * Create standardized error entry
   */
  createErrorEntry(error, level, module, action, context) {
    const timestamp = Date.now();
    const errorId = `${level}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: errorId,
      timestamp,
      level,
      module,
      action,
      message: error.message || error.toString(),
      stack: error.stack,
      context,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      // Additional metadata
      metadata: {
        errorType: error.constructor?.name || 'Unknown',
        sessionUptime: timestamp - this.startTime,
        memoryUsage: this.getMemoryUsage(),
        ...context.metadata
      }
    };
  }

  /**
   * Record error in internal storage
   */
  recordError(errorEntry) {
    // Add to error list
    this.errors.unshift(errorEntry);
    
    // Trim if too many errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }
    
    // Update aggregation counters
    const key = `${errorEntry.module}:${errorEntry.action}:${errorEntry.level}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
  }

  /**
   * Check if error is critical
   */
  isCriticalError(error) {
    const criticalPatterns = [
      /module.*not.*found/i,
      /cannot.*read.*property/i,
      /type.*error/i,
      /network.*error/i,
      /database.*error/i,
      /auth.*error/i
    ];
    
    const message = error.message || error.toString();
    return criticalPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Emit critical error event
   */
  emitCriticalError(errorEntry) {
    // Import event bus dynamically to avoid circular deps
    import('../events/EventBus.js').then(({ eventBus, ModuleEvents }) => {
      eventBus.emit(ModuleEvents.MODULE_ERROR, {
        ...errorEntry,
        critical: true
      });
    }).catch(err => {
      console.error('Failed to emit critical error event:', err);
    });
  }

  /**
   * Get memory usage (if available)
   */
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  /**
   * Get error statistics
   */
  getStats() {
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);
    const lastDay = now - (24 * 60 * 60 * 1000);
    
    const recentErrors = this.errors.filter(e => e.timestamp > lastHour);
    const dailyErrors = this.errors.filter(e => e.timestamp > lastDay);
    
    return {
      total: this.errors.length,
      lastHour: recentErrors.length,
      lastDay: dailyErrors.length,
      byLevel: this.groupByLevel(),
      byModule: this.groupByModule(),
      topErrors: this.getTopErrors(),
      sessionInfo: {
        sessionId: this.sessionId,
        uptime: now - this.startTime,
        startTime: this.startTime
      }
    };
  }

  /**
   * Group errors by level
   */
  groupByLevel() {
    const groups = {};
    this.errors.forEach(error => {
      groups[error.level] = (groups[error.level] || 0) + 1;
    });
    return groups;
  }

  /**
   * Group errors by module
   */
  groupByModule() {
    const groups = {};
    this.errors.forEach(error => {
      groups[error.module] = (groups[error.module] || 0) + 1;
    });
    return groups;
  }

  /**
   * Get most frequent errors
   */
  getTopErrors(limit = 10) {
    const errorMap = new Map();
    
    this.errors.forEach(error => {
      const key = `${error.module}:${error.action}:${error.message}`;
      if (!errorMap.has(key)) {
        errorMap.set(key, { ...error, count: 0 });
      }
      errorMap.get(key).count++;
    });
    
    return Array.from(errorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Search errors by criteria
   */
  searchErrors(criteria = {}) {
    const {
      module,
      action,
      level,
      message,
      since,
      until,
      limit = 50
    } = criteria;
    
    let results = this.errors;
    
    if (module) {
      results = results.filter(e => e.module === module);
    }
    
    if (action) {
      results = results.filter(e => e.action === action);
    }
    
    if (level) {
      results = results.filter(e => e.level === level);
    }
    
    if (message) {
      const pattern = new RegExp(message, 'i');
      results = results.filter(e => pattern.test(e.message));
    }
    
    if (since) {
      results = results.filter(e => e.timestamp >= since);
    }
    
    if (until) {
      results = results.filter(e => e.timestamp <= until);
    }
    
    return results.slice(0, limit);
  }

  /**
   * Export errors for external analysis
   */
  exportErrors(format = 'json') {
    const data = {
      exportTime: Date.now(),
      sessionId: this.sessionId,
      stats: this.getStats(),
      errors: this.errors
    };
    
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.convertToCSV(this.errors);
      default:
        return data;
    }
  }

  /**
   * Convert errors to CSV format
   */
  convertToCSV(errors) {
    const headers = ['timestamp', 'level', 'module', 'action', 'message'];
    const rows = errors.map(error => [
      new Date(error.timestamp).toISOString(),
      error.level,
      error.module,
      error.action,
      `"${error.message.replace(/"/g, '""')}"`
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Clear all errors
   */
  clear() {
    this.errors = [];
    this.errorCounts.clear();
  }

  /**
   * Clear old errors (older than specified time)
   */
  clearOldErrors(olderThan = 24 * 60 * 60 * 1000) { // 24 hours default
    const cutoff = Date.now() - olderThan;
    this.errors = this.errors.filter(error => error.timestamp > cutoff);
  }
}

// Create singleton instance
export const errorTracker = new ErrorTracker();

// For debugging in console
if (typeof window !== 'undefined') {
  window.__errorTracker = errorTracker;
}

export default errorTracker;