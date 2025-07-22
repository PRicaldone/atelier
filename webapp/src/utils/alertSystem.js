/**
 * Proactive Alert System - Smart monitoring and notifications
 * Monitors system health and provides proactive alerts for issues
 */

import { createModuleLogger } from '../modules/shared/monitoring/ModuleLogger';

const logger = createModuleLogger('AlertSystem');

// Alert severity levels
export const AlertSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

// Alert categories
export const AlertCategory = {
  SYSTEM_HEALTH: 'system_health',
  SECURITY: 'security',
  BACKUP: 'backup',
  PERFORMANCE: 'performance',
  USER_ACTION: 'user_action',
  MODULE_ERROR: 'module_error'
};

// Alert channels
export const AlertChannel = {
  TOAST: 'toast',
  MODAL: 'modal',
  CONSOLE: 'console',
  PERSISTENT: 'persistent',
  EMAIL: 'email' // Future implementation
};

class AlertSystem {
  constructor() {
    this.alerts = [];
    this.subscribers = [];
    this.config = {
      maxAlerts: 100,
      autoCleanup: true,
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
      rateLimiting: {
        enabled: true,
        maxPerMinute: 10,
        window: 60 * 1000 // 1 minute
      }
    };
    this.rateLimitTracker = new Map();
    this.healthChecks = new Map();
    
    this.initializeSystem();
    this.setupHealthMonitoring();
  }

  initializeSystem() {
    // Load persisted alerts
    try {
      const saved = localStorage.getItem('ATELIER_ALERT_SYSTEM');
      if (saved) {
        const data = JSON.parse(saved);
        this.alerts = data.alerts || [];
        this.config = { ...this.config, ...data.config };
      }
    } catch (error) {
      logger.error(error, 'Failed to load alert system data');
    }

    // Setup cleanup interval
    if (this.config.autoCleanup) {
      setInterval(() => this.cleanupExpiredAlerts(), this.config.cleanupInterval);
    }

    // Setup global error handler
    window.addEventListener('error', (event) => {
      this.createAlert({
        severity: AlertSeverity.ERROR,
        category: AlertCategory.SYSTEM_HEALTH,
        title: 'JavaScript Error',
        message: event.message,
        details: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        },
        channel: AlertChannel.CONSOLE
      });
    });

    // Setup unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.createAlert({
        severity: AlertSeverity.ERROR,
        category: AlertCategory.SYSTEM_HEALTH,
        title: 'Unhandled Promise Rejection',
        message: event.reason?.message || 'Unknown error',
        details: { reason: event.reason },
        channel: AlertChannel.CONSOLE
      });
    });

    logger.info('Alert system initialized');
  }

  setupHealthMonitoring() {
    // Monitor localStorage usage
    this.registerHealthCheck('localStorage', () => {
      try {
        const used = new Blob(Object.values(localStorage)).size;
        const limit = 5 * 1024 * 1024; // 5MB typical limit
        const usage = (used / limit) * 100;

        if (usage > 90) {
          return {
            status: 'critical',
            message: `localStorage usage critical: ${usage.toFixed(1)}%`,
            recommendation: 'Clear old data or implement data rotation'
          };
        } else if (usage > 75) {
          return {
            status: 'warning',
            message: `localStorage usage high: ${usage.toFixed(1)}%`,
            recommendation: 'Consider data cleanup'
          };
        }

        return { status: 'healthy', usage: usage.toFixed(1) };
      } catch (error) {
        return {
          status: 'error',
          message: 'Failed to check localStorage usage',
          error: error.message
        };
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    // Monitor memory usage
    this.registerHealthCheck('memory', () => {
      if (performance.memory) {
        const used = performance.memory.usedJSHeapSize;
        const limit = performance.memory.jsHeapSizeLimit;
        const usage = (used / limit) * 100;

        if (usage > 90) {
          return {
            status: 'critical',
            message: `Memory usage critical: ${usage.toFixed(1)}%`,
            recommendation: 'Refresh page or reduce active modules'
          };
        } else if (usage > 75) {
          return {
            status: 'warning',
            message: `Memory usage high: ${usage.toFixed(1)}%`,
            recommendation: 'Monitor for memory leaks'
          };
        }

        return { status: 'healthy', usage: usage.toFixed(1) };
      }
      return { status: 'unavailable', message: 'Memory API not supported' };
    }, 2 * 60 * 1000); // Check every 2 minutes

    // Monitor backup freshness
    this.registerHealthCheck('backups', () => {
      try {
        const lastSave = localStorage.getItem('ATELIER_LAST_SAVE_TIMESTAMP');
        if (!lastSave) {
          return {
            status: 'warning',
            message: 'No backup timestamp found',
            recommendation: 'Run atelier-save.sh to create backup'
          };
        }

        const lastSaveTime = new Date(lastSave);
        const now = new Date();
        const hoursSinceLastSave = (now - lastSaveTime) / (1000 * 60 * 60);

        if (hoursSinceLastSave > 48) {
          return {
            status: 'critical',
            message: `No backup in ${Math.floor(hoursSinceLastSave)} hours`,
            recommendation: 'Create backup immediately'
          };
        } else if (hoursSinceLastSave > 24) {
          return {
            status: 'warning',
            message: `Backup is ${Math.floor(hoursSinceLastSave)} hours old`,
            recommendation: 'Consider creating fresh backup'
          };
        }

        return { 
          status: 'healthy', 
          lastBackup: Math.floor(hoursSinceLastSave) + ' hours ago' 
        };
      } catch (error) {
        return {
          status: 'error',
          message: 'Failed to check backup status',
          error: error.message
        };
      }
    }, 10 * 60 * 1000); // Check every 10 minutes

    // Monitor active modules
    this.registerHealthCheck('modules', () => {
      try {
        const registry = window.__moduleRegistry;
        if (!registry) {
          return {
            status: 'error',
            message: 'Module registry not available',
            recommendation: 'Check module system initialization'
          };
        }

        const info = registry.getInfo();
        const errorCount = info.modules.filter(m => m.status === 'error').length;
        const totalModules = info.modules.length;

        if (errorCount > 0) {
          return {
            status: 'warning',
            message: `${errorCount}/${totalModules} modules have errors`,
            recommendation: 'Check module system logs'
          };
        }

        return { 
          status: 'healthy', 
          modules: `${totalModules} modules loaded` 
        };
      } catch (error) {
        return {
          status: 'error',
          message: 'Failed to check module status',
          error: error.message
        };
      }
    }, 3 * 60 * 1000); // Check every 3 minutes
  }

  registerHealthCheck(name, checkFunction, interval) {
    // Remove existing check if any
    if (this.healthChecks.has(name)) {
      clearInterval(this.healthChecks.get(name).intervalId);
    }

    // Setup new health check
    const intervalId = setInterval(async () => {
      try {
        const result = await checkFunction();
        this.handleHealthCheckResult(name, result);
      } catch (error) {
        logger.error(error, `Health check failed: ${name}`);
        this.handleHealthCheckResult(name, {
          status: 'error',
          message: `Health check failed: ${error.message}`,
          error: error.message
        });
      }
    }, interval);

    this.healthChecks.set(name, {
      checkFunction,
      interval,
      intervalId,
      lastResult: null,
      lastCheck: null
    });

    // Run initial check
    setTimeout(async () => {
      try {
        const result = await checkFunction();
        this.handleHealthCheckResult(name, result);
      } catch (error) {
        logger.error(error, `Initial health check failed: ${name}`);
      }
    }, 1000);

    logger.info(`Health check registered: ${name} (${interval}ms interval)`);
  }

  handleHealthCheckResult(checkName, result) {
    const check = this.healthChecks.get(checkName);
    if (!check) return;

    const previousResult = check.lastResult;
    check.lastResult = result;
    check.lastCheck = new Date();

    // Only alert on status changes or critical issues
    const shouldAlert = !previousResult || 
                       previousResult.status !== result.status ||
                       result.status === 'critical';

    if (shouldAlert && result.status !== 'healthy') {
      const severity = result.status === 'critical' ? AlertSeverity.CRITICAL :
                      result.status === 'error' ? AlertSeverity.ERROR :
                      AlertSeverity.WARNING;

      this.createAlert({
        severity,
        category: AlertCategory.SYSTEM_HEALTH,
        title: `Health Check: ${checkName}`,
        message: result.message,
        details: result,
        channel: result.status === 'critical' ? AlertChannel.MODAL : AlertChannel.TOAST,
        actions: result.recommendation ? [{
          label: 'View Recommendation',
          action: () => this.showRecommendation(result.recommendation)
        }] : []
      });
    }
  }

  createAlert(alertData) {
    // Validate required fields
    if (!alertData.severity || !alertData.category || !alertData.message) {
      logger.error('Invalid alert data: missing required fields', alertData);
      return null;
    }

    // Check rate limiting
    if (this.config.rateLimiting.enabled && !this.checkRateLimit()) {
      logger.warning('Alert rate limit exceeded, dropping alert', alertData);
      return null;
    }

    const alert = {
      id: this.generateAlertId(),
      timestamp: new Date(),
      severity: alertData.severity,
      category: alertData.category,
      title: alertData.title || 'System Alert',
      message: alertData.message,
      details: alertData.details || {},
      channel: alertData.channel || AlertChannel.TOAST,
      actions: alertData.actions || [],
      dismissed: false,
      persistent: alertData.persistent || false
    };

    // Add to alerts array
    this.alerts.unshift(alert);

    // Enforce max alerts limit
    if (this.alerts.length > this.config.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.config.maxAlerts);
    }

    // Persist to localStorage
    this.persistAlerts();

    // Notify subscribers
    this.notifySubscribers('alert_created', alert);

    // Execute channel-specific delivery
    this.deliverAlert(alert);

    logger.info(`Alert created: ${alert.id} (${alert.severity})`, alert);
    return alert;
  }

  deliverAlert(alert) {
    switch (alert.channel) {
      case AlertChannel.TOAST:
        this.showToast(alert);
        break;
      case AlertChannel.MODAL:
        this.showModal(alert);
        break;
      case AlertChannel.CONSOLE:
        this.logToConsole(alert);
        break;
      case AlertChannel.PERSISTENT:
        this.showPersistentAlert(alert);
        break;
      default:
        this.showToast(alert);
    }
  }

  showToast(alert) {
    // Dispatch custom event for toast notifications
    window.dispatchEvent(new CustomEvent('atelier:toast', {
      detail: {
        type: alert.severity,
        title: alert.title,
        message: alert.message,
        duration: this.getToastDuration(alert.severity),
        actions: alert.actions
      }
    }));
  }

  showModal(alert) {
    // Dispatch custom event for modal alerts
    window.dispatchEvent(new CustomEvent('atelier:modal', {
      detail: {
        type: alert.severity,
        title: alert.title,
        message: alert.message,
        details: alert.details,
        actions: alert.actions
      }
    }));
  }

  logToConsole(alert) {
    const style = this.getConsoleStyle(alert.severity);
    console.group(`%c[${alert.severity.toUpperCase()}] ${alert.title}`, style);
    console.log(alert.message);
    if (Object.keys(alert.details).length > 0) {
      console.log('Details:', alert.details);
    }
    console.groupEnd();
  }

  showPersistentAlert(alert) {
    // Dispatch custom event for persistent alerts (banner, sidebar, etc.)
    window.dispatchEvent(new CustomEvent('atelier:persistent', {
      detail: alert
    }));
  }

  dismissAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.dismissed = true;
      this.persistAlerts();
      this.notifySubscribers('alert_dismissed', alert);
      logger.info(`Alert dismissed: ${alertId}`);
    }
  }

  getAlerts(filter = {}) {
    let filtered = this.alerts;

    if (filter.severity) {
      filtered = filtered.filter(a => a.severity === filter.severity);
    }

    if (filter.category) {
      filtered = filtered.filter(a => a.category === filter.category);
    }

    if (filter.dismissed !== undefined) {
      filtered = filtered.filter(a => a.dismissed === filter.dismissed);
    }

    if (filter.since) {
      const since = new Date(filter.since);
      filtered = filtered.filter(a => new Date(a.timestamp) >= since);
    }

    return filtered;
  }

  clearAlerts(filter = {}) {
    const beforeCount = this.alerts.length;
    
    if (Object.keys(filter).length === 0) {
      this.alerts = [];
    } else {
      const toKeep = this.alerts.filter(alert => {
        if (filter.severity && alert.severity !== filter.severity) return true;
        if (filter.category && alert.category !== filter.category) return true;
        if (filter.dismissed !== undefined && alert.dismissed !== filter.dismissed) return true;
        return false;
      });
      this.alerts = toKeep;
    }

    const afterCount = this.alerts.length;
    const cleared = beforeCount - afterCount;

    this.persistAlerts();
    this.notifySubscribers('alerts_cleared', { count: cleared, filter });
    
    logger.info(`Cleared ${cleared} alerts`, filter);
    return cleared;
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // Utility methods
  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  checkRateLimit() {
    const now = Date.now();
    const windowStart = now - this.config.rateLimiting.window;
    
    // Clean old entries
    for (const [timestamp] of this.rateLimitTracker) {
      if (timestamp < windowStart) {
        this.rateLimitTracker.delete(timestamp);
      }
    }

    // Check current rate
    if (this.rateLimitTracker.size >= this.config.rateLimiting.maxPerMinute) {
      return false;
    }

    // Add current request
    this.rateLimitTracker.set(now, true);
    return true;
  }

  cleanupExpiredAlerts() {
    const cutoff = new Date(Date.now() - this.config.retentionPeriod);
    const beforeCount = this.alerts.length;
    
    this.alerts = this.alerts.filter(alert => 
      alert.persistent || new Date(alert.timestamp) >= cutoff
    );

    const afterCount = this.alerts.length;
    const cleaned = beforeCount - afterCount;

    if (cleaned > 0) {
      this.persistAlerts();
      logger.info(`Cleaned up ${cleaned} expired alerts`);
    }
  }

  persistAlerts() {
    try {
      const data = {
        alerts: this.alerts,
        config: this.config,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('ATELIER_ALERT_SYSTEM', JSON.stringify(data));
    } catch (error) {
      logger.error(error, 'Failed to persist alerts');
    }
  }

  notifySubscribers(event, data) {
    this.subscribers.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        logger.error(error, 'Subscriber callback failed');
      }
    });
  }

  getToastDuration(severity) {
    switch (severity) {
      case AlertSeverity.CRITICAL: return 10000; // 10 seconds
      case AlertSeverity.ERROR: return 7000;     // 7 seconds
      case AlertSeverity.WARNING: return 5000;   // 5 seconds
      case AlertSeverity.INFO: return 3000;      // 3 seconds
      default: return 5000;
    }
  }

  getConsoleStyle(severity) {
    switch (severity) {
      case AlertSeverity.CRITICAL: return 'color: white; background: #dc2626; padding: 2px 4px; border-radius: 2px; font-weight: bold';
      case AlertSeverity.ERROR: return 'color: #dc2626; font-weight: bold';
      case AlertSeverity.WARNING: return 'color: #d97706; font-weight: bold';
      case AlertSeverity.INFO: return 'color: #2563eb; font-weight: bold';
      default: return 'color: #6b7280';
    }
  }

  showRecommendation(recommendation) {
    this.createAlert({
      severity: AlertSeverity.INFO,
      category: AlertCategory.USER_ACTION,
      title: 'System Recommendation',
      message: recommendation,
      channel: AlertChannel.MODAL
    });
  }

  // Public API methods
  getStats() {
    return {
      totalAlerts: this.alerts.length,
      activeAlerts: this.alerts.filter(a => !a.dismissed).length,
      criticalAlerts: this.alerts.filter(a => a.severity === AlertSeverity.CRITICAL && !a.dismissed).length,
      healthChecks: Array.from(this.healthChecks.keys()).map(name => ({
        name,
        lastCheck: this.healthChecks.get(name).lastCheck,
        lastResult: this.healthChecks.get(name).lastResult
      })),
      config: this.config
    };
  }

  updateConfig(updates) {
    this.config = { ...this.config, ...updates };
    this.persistAlerts();
    logger.info('Alert system configuration updated', updates);
  }
}

// Create global instance
const alertSystem = new AlertSystem();

// Export for global access
window.__alertSystem = alertSystem;

export default alertSystem;