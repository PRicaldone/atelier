/**
 * Audit Log System - Comprehensive system activity logging
 * Tracks all significant user actions and system events for security and compliance
 */

import { createModuleLogger } from '../modules/shared/monitoring/ModuleLogger';
import alertSystem, { AlertSeverity, AlertCategory } from './alertSystem';

const logger = createModuleLogger('AuditLogger');

// Audit event types
export const AuditEventType = {
  // Authentication & Authorization
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_FAILED: 'auth.failed',
  
  // Data Operations
  DATA_CREATE: 'data.create',
  DATA_READ: 'data.read',
  DATA_UPDATE: 'data.update',
  DATA_DELETE: 'data.delete',
  DATA_EXPORT: 'data.export',
  DATA_IMPORT: 'data.import',
  
  // Security Events
  SECURITY_ENCRYPTION: 'security.encryption',
  SECURITY_DECRYPTION: 'security.decryption',
  SECURITY_KEY_GENERATION: 'security.key_generation',
  SECURITY_MIGRATION: 'security.migration',
  SECURITY_ALERT: 'security.alert',
  
  // System Events
  SYSTEM_START: 'system.start',
  SYSTEM_ERROR: 'system.error',
  SYSTEM_CONFIG_CHANGE: 'system.config_change',
  SYSTEM_BACKUP: 'system.backup',
  SYSTEM_RECOVERY: 'system.recovery',
  
  // User Actions
  USER_NAVIGATION: 'user.navigation',
  USER_MODULE_SWITCH: 'user.module_switch',
  USER_SAVE: 'user.save',
  USER_PROJECT_CREATE: 'user.project_create',
  USER_PROJECT_SWITCH: 'user.project_switch',
  
  // Module Events
  MODULE_LOAD: 'module.load',
  MODULE_ERROR: 'module.error',
  MODULE_COMMUNICATION: 'module.communication',
  
  // Performance Events
  PERFORMANCE_SLOW: 'performance.slow',
  PERFORMANCE_ERROR: 'performance.error',
  PERFORMANCE_MEMORY: 'performance.memory'
};

// Audit severity levels
export const AuditSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Audit categories for filtering and analysis
export const AuditCategory = {
  SECURITY: 'security',
  COMPLIANCE: 'compliance',
  PERFORMANCE: 'performance',
  USER_BEHAVIOR: 'user_behavior',
  SYSTEM_HEALTH: 'system_health',
  DATA_GOVERNANCE: 'data_governance'
};

class AuditLogger {
  constructor() {
    this.isEnabled = true;
    this.maxLogs = 10000; // Maximum audit logs to keep in memory
    this.retentionPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days
    this.logs = [];
    this.sessionId = this.generateSessionId();
    this.userId = 'anonymous'; // Will be updated when auth is implemented
    
    this.config = {
      enabledCategories: Object.values(AuditCategory),
      minSeverity: AuditSeverity.LOW,
      enableRealTimeAlerts: true,
      enablePerformanceTracking: true,
      enableSecurityTracking: true,
      enableComplianceMode: false
    };
    
    this.initialize();
  }

  initialize() {
    this.loadConfiguration();
    this.loadPersistedLogs();
    this.setupSystemEventListeners();
    this.setupPeriodicCleanup();
    this.logSystemStart();
    
    logger.info('Audit Logger initialized', { sessionId: this.sessionId });
  }

  loadConfiguration() {
    try {
      const saved = localStorage.getItem('ATELIER_AUDIT_CONFIG');
      if (saved) {
        const savedConfig = JSON.parse(saved);
        this.config = { ...this.config, ...savedConfig };
      }
    } catch (error) {
      logger.error(error, 'Failed to load audit configuration');
    }
  }

  loadPersistedLogs() {
    try {
      const saved = localStorage.getItem('ATELIER_AUDIT_LOGS');
      if (saved) {
        const savedLogs = JSON.parse(saved);
        
        // Filter out expired logs
        const cutoff = Date.now() - this.retentionPeriod;
        this.logs = savedLogs.filter(log => log.timestamp > cutoff);
        
        logger.info(`Loaded ${this.logs.length} persisted audit logs`);
      }
    } catch (error) {
      logger.error(error, 'Failed to load persisted audit logs');
      this.logs = [];
    }
  }

  setupSystemEventListeners() {
    // Listen for global errors
    window.addEventListener('error', (event) => {
      this.logEvent(AuditEventType.SYSTEM_ERROR, {
        severity: AuditSeverity.HIGH,
        category: AuditCategory.SYSTEM_HEALTH,
        details: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        }
      });
    });

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logEvent(AuditEventType.SYSTEM_ERROR, {
        severity: AuditSeverity.HIGH,
        category: AuditCategory.SYSTEM_HEALTH,
        details: {
          type: 'unhandled_rejection',
          reason: event.reason?.message || 'Unknown rejection',
          stack: event.reason?.stack
        }
      });
    });

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.logEvent(AuditEventType.USER_NAVIGATION, {
        severity: AuditSeverity.LOW,
        category: AuditCategory.USER_BEHAVIOR,
        details: {
          action: document.hidden ? 'page_hidden' : 'page_visible',
          timestamp: new Date().toISOString()
        }
      });
    });

    // Listen for beforeunload events
    window.addEventListener('beforeunload', () => {
      this.logEvent(AuditEventType.USER_NAVIGATION, {
        severity: AuditSeverity.LOW,
        category: AuditCategory.USER_BEHAVIOR,
        details: {
          action: 'page_unload',
          sessionDuration: Date.now() - this.sessionStartTime
        }
      });
      
      // Force save audit logs before page unload
      this.persistLogs();
    });

    // Listen for custom Atelier events
    window.addEventListener('atelier:save-triggered', (event) => {
      this.logEvent(AuditEventType.USER_SAVE, {
        severity: AuditSeverity.MEDIUM,
        category: AuditCategory.DATA_GOVERNANCE,
        details: {
          source: event.detail?.source || 'manual',
          unsavedChanges: event.detail?.unsavedChanges?.length || 0,
          sessionData: event.detail?.sessionData
        }
      });
    });
  }

  setupPeriodicCleanup() {
    // Clean up old logs every hour
    setInterval(() => {
      this.cleanupOldLogs();
      this.persistLogs();
    }, 60 * 60 * 1000);
  }

  logSystemStart() {
    this.sessionStartTime = Date.now();
    
    this.logEvent(AuditEventType.SYSTEM_START, {
      severity: AuditSeverity.MEDIUM,
      category: AuditCategory.SYSTEM_HEALTH,
      details: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        platform: navigator.platform,
        language: navigator.language,
        referrer: document.referrer
      }
    });
  }

  logEvent(eventType, options = {}) {
    if (!this.isEnabled) return null;

    const {
      severity = AuditSeverity.LOW,
      category = AuditCategory.SYSTEM_HEALTH,
      details = {},
      userId = this.userId,
      metadata = {}
    } = options;

    // Check if this category is enabled
    if (!this.config.enabledCategories.includes(category)) {
      return null;
    }

    // Check minimum severity level
    const severityLevels = {
      [AuditSeverity.LOW]: 1,
      [AuditSeverity.MEDIUM]: 2,
      [AuditSeverity.HIGH]: 3,
      [AuditSeverity.CRITICAL]: 4
    };

    if (severityLevels[severity] < severityLevels[this.config.minSeverity]) {
      return null;
    }

    const auditLog = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: userId,
      eventType: eventType,
      severity: severity,
      category: category,
      details: details,
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    };

    // Add to logs array
    this.logs.unshift(auditLog);

    // Enforce max logs limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Trigger real-time alerts for critical events
    if (this.config.enableRealTimeAlerts && severity === AuditSeverity.CRITICAL) {
      this.triggerRealTimeAlert(auditLog);
    }

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔍 [AUDIT] ${eventType} (${severity})`);
      console.log('Details:', details);
      console.log('Full Log:', auditLog);
      console.groupEnd();
    }

    logger.info(`Audit event logged: ${eventType}`, { severity, category });

    return auditLog;
  }

  triggerRealTimeAlert(auditLog) {
    alertSystem.createAlert({
      severity: AlertSeverity.CRITICAL,
      category: AlertCategory.SECURITY,
      title: 'Critical Audit Event',
      message: `Critical system event detected: ${auditLog.eventType}`,
      details: auditLog,
      persistent: true,
      actions: [
        {
          label: 'View Audit Logs',
          action: () => window.open('/audit-logs', '_blank')
        }
      ]
    });
  }

  // Convenience methods for common audit events
  logAuth(action, success, details = {}) {
    const eventType = success ? 
      (action === 'login' ? AuditEventType.AUTH_LOGIN : AuditEventType.AUTH_LOGOUT) :
      AuditEventType.AUTH_FAILED;

    return this.logEvent(eventType, {
      severity: success ? AuditSeverity.MEDIUM : AuditSeverity.HIGH,
      category: AuditCategory.SECURITY,
      details: { action, success, ...details }
    });
  }

  logDataOperation(operation, resource, details = {}) {
    const eventTypeMap = {
      create: AuditEventType.DATA_CREATE,
      read: AuditEventType.DATA_READ,
      update: AuditEventType.DATA_UPDATE,
      delete: AuditEventType.DATA_DELETE,
      export: AuditEventType.DATA_EXPORT,
      import: AuditEventType.DATA_IMPORT
    };

    return this.logEvent(eventTypeMap[operation] || AuditEventType.DATA_READ, {
      severity: operation === 'delete' ? AuditSeverity.HIGH : AuditSeverity.MEDIUM,
      category: AuditCategory.DATA_GOVERNANCE,
      details: { operation, resource, ...details }
    });
  }

  logSecurityEvent(action, details = {}) {
    const eventTypeMap = {
      encryption: AuditEventType.SECURITY_ENCRYPTION,
      decryption: AuditEventType.SECURITY_DECRYPTION,
      key_generation: AuditEventType.SECURITY_KEY_GENERATION,
      migration: AuditEventType.SECURITY_MIGRATION,
      alert: AuditEventType.SECURITY_ALERT
    };

    return this.logEvent(eventTypeMap[action] || AuditEventType.SECURITY_ALERT, {
      severity: AuditSeverity.HIGH,
      category: AuditCategory.SECURITY,
      details: { action, ...details }
    });
  }

  logUserAction(action, details = {}) {
    const eventTypeMap = {
      navigation: AuditEventType.USER_NAVIGATION,
      module_switch: AuditEventType.USER_MODULE_SWITCH,
      save: AuditEventType.USER_SAVE,
      project_create: AuditEventType.USER_PROJECT_CREATE,
      project_switch: AuditEventType.USER_PROJECT_SWITCH
    };

    return this.logEvent(eventTypeMap[action] || AuditEventType.USER_NAVIGATION, {
      severity: AuditSeverity.LOW,
      category: AuditCategory.USER_BEHAVIOR,
      details: { action, ...details }
    });
  }

  logPerformanceEvent(metric, value, threshold, details = {}) {
    const isSlowPerformance = value > threshold;
    
    return this.logEvent(
      isSlowPerformance ? AuditEventType.PERFORMANCE_SLOW : AuditEventType.PERFORMANCE_MEMORY,
      {
        severity: isSlowPerformance ? AuditSeverity.MEDIUM : AuditSeverity.LOW,
        category: AuditCategory.PERFORMANCE,
        details: {
          metric,
          value,
          threshold,
          exceeded: isSlowPerformance,
          ...details
        }
      }
    );
  }

  // Query and analysis methods
  getLogs(filter = {}) {
    let filtered = [...this.logs];

    if (filter.eventType) {
      filtered = filtered.filter(log => log.eventType === filter.eventType);
    }

    if (filter.severity) {
      filtered = filtered.filter(log => log.severity === filter.severity);
    }

    if (filter.category) {
      filtered = filtered.filter(log => log.category === filter.category);
    }

    if (filter.userId) {
      filtered = filtered.filter(log => log.userId === filter.userId);
    }

    if (filter.sessionId) {
      filtered = filtered.filter(log => log.sessionId === filter.sessionId);
    }

    if (filter.startTime) {
      filtered = filtered.filter(log => log.timestamp >= filter.startTime);
    }

    if (filter.endTime) {
      filtered = filtered.filter(log => log.timestamp <= filter.endTime);
    }

    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.eventType.toLowerCase().includes(searchTerm) ||
        JSON.stringify(log.details).toLowerCase().includes(searchTerm)
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit
    if (filter.limit) {
      filtered = filtered.slice(0, filter.limit);
    }

    return filtered;
  }

  getStatistics() {
    const stats = {
      totalLogs: this.logs.length,
      sessionId: this.sessionId,
      sessionDuration: Date.now() - this.sessionStartTime,
      oldestLog: this.logs.length > 0 ? Math.min(...this.logs.map(l => l.timestamp)) : null,
      newestLog: this.logs.length > 0 ? Math.max(...this.logs.map(l => l.timestamp)) : null,
      categories: {},
      severities: {},
      eventTypes: {},
      recentActivity: this.getLogs({ limit: 10 })
    };

    // Count by categories
    this.logs.forEach(log => {
      stats.categories[log.category] = (stats.categories[log.category] || 0) + 1;
      stats.severities[log.severity] = (stats.severities[log.severity] || 0) + 1;
      stats.eventTypes[log.eventType] = (stats.eventTypes[log.eventType] || 0) + 1;
    });

    return stats;
  }

  exportLogs(format = 'json', filter = {}) {
    const logs = this.getLogs(filter);
    const exportData = {
      meta: {
        exportedAt: new Date().toISOString(),
        totalLogs: logs.length,
        filter: filter,
        sessionId: this.sessionId
      },
      logs: logs
    };

    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(logs);
    }

    return exportData;
  }

  convertToCSV(logs) {
    if (logs.length === 0) return '';

    const headers = ['timestamp', 'eventType', 'severity', 'category', 'userId', 'sessionId', 'details'];
    const csvRows = [headers.join(',')];

    logs.forEach(log => {
      const row = [
        new Date(log.timestamp).toISOString(),
        log.eventType,
        log.severity,
        log.category,
        log.userId,
        log.sessionId,
        `"${JSON.stringify(log.details).replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  clearLogs(olderThan = null) {
    const beforeCount = this.logs.length;
    
    if (olderThan) {
      this.logs = this.logs.filter(log => log.timestamp > olderThan);
    } else {
      this.logs = [];
    }

    const afterCount = this.logs.length;
    const cleared = beforeCount - afterCount;

    this.persistLogs();

    this.logEvent(AuditEventType.SYSTEM_CONFIG_CHANGE, {
      severity: AuditSeverity.MEDIUM,
      category: AuditCategory.SYSTEM_HEALTH,
      details: {
        action: 'clear_audit_logs',
        logsCleared: cleared,
        olderThan: olderThan ? new Date(olderThan).toISOString() : 'all'
      }
    });

    logger.info(`Cleared ${cleared} audit logs`);
    return cleared;
  }

  cleanupOldLogs() {
    const cutoff = Date.now() - this.retentionPeriod;
    const beforeCount = this.logs.length;
    
    this.logs = this.logs.filter(log => log.timestamp > cutoff);
    
    const afterCount = this.logs.length;
    const cleaned = beforeCount - afterCount;

    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} expired audit logs`);
    }

    return cleaned;
  }

  persistLogs() {
    try {
      const dataToSave = JSON.stringify(this.logs);
      localStorage.setItem('ATELIER_AUDIT_LOGS', dataToSave);
    } catch (error) {
      logger.error(error, 'Failed to persist audit logs');
      
      // If storage is full, try to make space by removing old logs
      if (error.name === 'QuotaExceededError') {
        this.clearLogs(Date.now() - (7 * 24 * 60 * 60 * 1000)); // Keep only last 7 days
        try {
          localStorage.setItem('ATELIER_AUDIT_LOGS', JSON.stringify(this.logs));
        } catch (retryError) {
          logger.error(retryError, 'Failed to persist audit logs after cleanup');
        }
      }
    }
  }

  configure(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    try {
      localStorage.setItem('ATELIER_AUDIT_CONFIG', JSON.stringify(this.config));
    } catch (error) {
      logger.error(error, 'Failed to save audit configuration');
    }

    this.logEvent(AuditEventType.SYSTEM_CONFIG_CHANGE, {
      severity: AuditSeverity.MEDIUM,
      category: AuditCategory.SYSTEM_HEALTH,
      details: {
        action: 'audit_config_update',
        changes: newConfig
      }
    });

    logger.info('Audit logger configuration updated', newConfig);
  }

  // Utility methods
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateLogId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId) {
    const previousUserId = this.userId;
    this.userId = userId;
    
    this.logEvent(AuditEventType.AUTH_LOGIN, {
      severity: AuditSeverity.MEDIUM,
      category: AuditCategory.SECURITY,
      details: {
        previousUserId,
        newUserId: userId,
        action: 'user_id_change'
      }
    });
  }

  enable() {
    this.isEnabled = true;
    this.logEvent(AuditEventType.SYSTEM_CONFIG_CHANGE, {
      severity: AuditSeverity.MEDIUM,
      category: AuditCategory.SYSTEM_HEALTH,
      details: { action: 'audit_logging_enabled' }
    });
  }

  disable() {
    this.logEvent(AuditEventType.SYSTEM_CONFIG_CHANGE, {
      severity: AuditSeverity.MEDIUM,
      category: AuditCategory.SYSTEM_HEALTH,
      details: { action: 'audit_logging_disabled' }
    });
    this.isEnabled = false;
  }

  getConfiguration() {
    return { ...this.config };
  }
}

// Create global instance
const auditLogger = new AuditLogger();

// Export for global access
window.__auditLogger = auditLogger;

export default auditLogger;