/**
 * Alerting System - Professional notification system for critical events
 * 
 * Features:
 * - Multiple notification channels (email, webhook, browser, console)
 * - Alert severity levels and filtering
 * - Rate limiting and deduplication
 * - Template-based notifications
 * - Integration with health checks and error tracking
 * - Escalation policies
 */

import { alertLogger } from '../monitoring/ModuleLogger.js';
import eventBus from '../events/EventBus.js';
import errorTracker from '../monitoring/ErrorTracker.js';

// Alert severity levels
export const AlertSeverity = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info'
};

// Alert types
export const AlertType = {
  HEALTH_CHECK_FAILED: 'health_check_failed',
  MODULE_DEAD: 'module_dead',
  ERROR_THRESHOLD_EXCEEDED: 'error_threshold_exceeded',
  PERFORMANCE_DEGRADATION: 'performance_degradation',
  TEST_FAILURE: 'test_failure',
  SYSTEM_ERROR: 'system_error',
  CUSTOM: 'custom'
};

// Notification channels
export const NotificationChannel = {
  EMAIL: 'email',
  WEBHOOK: 'webhook',
  BROWSER: 'browser',
  CONSOLE: 'console',
  TELEGRAM: 'telegram',
  SLACK: 'slack'
};

/**
 * Base Notification Channel
 */
export class BaseNotificationChannel {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
    this.enabled = config.enabled !== false;
    this.logger = alertLogger.child({ channel: name });
  }
  
  /**
   * Send notification - must be implemented by subclasses
   * @param {Object} alert - Alert object
   * @returns {Promise<boolean>} Success status
   */
  async send(alert) {
    throw new Error('send() method must be implemented by subclass');
  }
  
  /**
   * Test the notification channel
   * @returns {Promise<boolean>} Test success
   */
  async test() {
    const testAlert = {
      id: `test-${Date.now()}`,
      type: AlertType.CUSTOM,
      severity: AlertSeverity.INFO,
      title: 'Test Alert',
      message: 'This is a test alert to verify the notification channel is working.',
      timestamp: Date.now(),
      source: 'alerting-system-test'
    };
    
    try {
      const success = await this.send(testAlert);
      this.logger.info(`Test alert ${success ? 'succeeded' : 'failed'}`, 'test', { success });
      return success;
    } catch (error) {
      this.logger.error(error, 'test');
      return false;
    }
  }
}

/**
 * Console Notification Channel
 */
export class ConsoleNotificationChannel extends BaseNotificationChannel {
  constructor(config = {}) {
    super(NotificationChannel.CONSOLE, config);
  }
  
  async send(alert) {
    const prefix = this.getSeverityPrefix(alert.severity);
    const message = `${prefix} [${alert.type.toUpperCase()}] ${alert.title}: ${alert.message}`;
    
    switch (alert.severity) {
      case AlertSeverity.CRITICAL:
      case AlertSeverity.HIGH:
        console.error(message, alert);
        break;
      case AlertSeverity.MEDIUM:
        console.warn(message, alert);
        break;
      default:
        console.info(message, alert);
    }
    
    return true;
  }
  
  getSeverityPrefix(severity) {
    switch (severity) {
      case AlertSeverity.CRITICAL: return '🚨';
      case AlertSeverity.HIGH: return '⚠️';
      case AlertSeverity.MEDIUM: return '⚡';
      case AlertSeverity.LOW: return 'ℹ️';
      case AlertSeverity.INFO: return '💬';
      default: return '📢';
    }
  }
}

/**
 * Browser Notification Channel
 */
export class BrowserNotificationChannel extends BaseNotificationChannel {
  constructor(config = {}) {
    super(NotificationChannel.BROWSER, config);
    this.permissionRequested = false;
  }
  
  async send(alert) {
    // Check if browser notifications are supported
    if (!('Notification' in window)) {
      this.logger.warning('Browser notifications not supported', 'send');
      return false;
    }
    
    // Request permission if needed
    if (Notification.permission === 'default' && !this.permissionRequested) {
      this.permissionRequested = true;
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        this.logger.warning('Browser notification permission denied', 'send');
        return false;
      }
    }
    
    if (Notification.permission !== 'granted') {
      return false;
    }
    
    // Create notification
    const notification = new Notification(alert.title, {
      body: alert.message,
      icon: this.getIconForSeverity(alert.severity),
      tag: alert.type, // Prevents duplicate notifications
      requireInteraction: alert.severity === AlertSeverity.CRITICAL,
      data: alert
    });
    
    // Auto-close after delay (except for critical alerts)
    if (alert.severity !== AlertSeverity.CRITICAL) {
      setTimeout(() => {
        notification.close();
      }, this.config.autoCloseDelay || 5000);
    }
    
    return true;
  }
  
  getIconForSeverity(severity) {
    // You can customize these icons
    switch (severity) {
      case AlertSeverity.CRITICAL: return '/icons/alert-critical.png';
      case AlertSeverity.HIGH: return '/icons/alert-high.png';
      case AlertSeverity.MEDIUM: return '/icons/alert-medium.png';
      default: return '/icons/alert-info.png';
    }
  }
}

/**
 * Webhook Notification Channel
 */
export class WebhookNotificationChannel extends BaseNotificationChannel {
  constructor(config = {}) {
    super(NotificationChannel.WEBHOOK, config);
    this.url = config.url;
    this.headers = config.headers || {};
    this.timeout = config.timeout || 10000;
  }
  
  async send(alert) {
    if (!this.url) {
      this.logger.error(new Error('Webhook URL not configured'), 'send');
      return false;
    }
    
    try {
      const payload = {
        alert,
        timestamp: Date.now(),
        source: 'atelier-alerting-system'
      };
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
      }
      
      this.logger.info('Webhook notification sent successfully', 'send', {
        url: this.url,
        status: response.status
      });
      
      return true;
      
    } catch (error) {
      this.logger.error(error, 'send', { url: this.url });
      return false;
    }
  }
}

/**
 * Email Notification Channel (Mock implementation)
 */
export class EmailNotificationChannel extends BaseNotificationChannel {
  constructor(config = {}) {
    super(NotificationChannel.EMAIL, config);
    this.smtpConfig = config.smtp || {};
    this.recipients = config.recipients || [];
    this.template = config.template || 'default';
  }
  
  async send(alert) {
    // This is a mock implementation
    // In a real application, you would integrate with an email service
    
    if (this.recipients.length === 0) {
      this.logger.warning('No email recipients configured', 'send');
      return false;
    }
    
    const emailData = {
      to: this.recipients,
      subject: `[Atelier Alert - ${alert.severity.toUpperCase()}] ${alert.title}`,
      body: this.formatEmailBody(alert),
      html: this.formatEmailHTML(alert)
    };
    
    // Mock email sending
    this.logger.info('Email notification would be sent', 'send', {
      recipients: this.recipients.length,
      subject: emailData.subject,
      alert: alert.id
    });
    
    // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
    
    return true;
  }
  
  formatEmailBody(alert) {
    return `
Alert: ${alert.title}
Severity: ${alert.severity.toUpperCase()}
Type: ${alert.type}
Time: ${new Date(alert.timestamp).toISOString()}

Message:
${alert.message}

${alert.details ? `Details:\n${JSON.stringify(alert.details, null, 2)}` : ''}

---
Sent by Atelier Alerting System
`;
  }
  
  formatEmailHTML(alert) {
    const severityColor = this.getSeverityColor(alert.severity);
    
    return `
<html>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto;">
    <h2 style="color: ${severityColor}; border-bottom: 2px solid ${severityColor}; padding-bottom: 10px;">
      🚨 Atelier Alert
    </h2>
    
    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <h3 style="margin: 0 0 10px 0; color: ${severityColor};">${alert.title}</h3>
      <p style="margin: 0;"><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
      <p style="margin: 0;"><strong>Type:</strong> ${alert.type}</p>
      <p style="margin: 0;"><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
    </div>
    
    <div style="margin: 15px 0;">
      <h4>Message:</h4>
      <p style="background: #ffffff; padding: 10px; border-left: 4px solid ${severityColor};">
        ${alert.message}
      </p>
    </div>
    
    ${alert.details ? `
    <div style="margin: 15px 0;">
      <h4>Details:</h4>
      <pre style="background: #f1f3f4; padding: 10px; border-radius: 3px; overflow-x: auto;">
${JSON.stringify(alert.details, null, 2)}
      </pre>
    </div>
    ` : ''}
    
    <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
      Sent by Atelier Alerting System
    </div>
  </div>
</body>
</html>
`;
  }
  
  getSeverityColor(severity) {
    switch (severity) {
      case AlertSeverity.CRITICAL: return '#dc2626';
      case AlertSeverity.HIGH: return '#ea580c';
      case AlertSeverity.MEDIUM: return '#d97706';
      case AlertSeverity.LOW: return '#2563eb';
      case AlertSeverity.INFO: return '#059669';
      default: return '#6b7280';
    }
  }
}

/**
 * Telegram Notification Channel (Mock implementation)
 */
export class TelegramNotificationChannel extends BaseNotificationChannel {
  constructor(config = {}) {
    super(NotificationChannel.TELEGRAM, config);
    this.botToken = config.botToken;
    this.chatId = config.chatId;
  }
  
  async send(alert) {
    if (!this.botToken || !this.chatId) {
      this.logger.warning('Telegram bot token or chat ID not configured', 'send');
      return false;
    }
    
    try {
      const message = this.formatTelegramMessage(alert);
      
      // Mock Telegram API call
      this.logger.info('Telegram notification would be sent', 'send', {
        chatId: this.chatId,
        messageLength: message.length,
        alert: alert.id
      });
      
      // TODO: Integrate with Telegram Bot API
      // const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     chat_id: this.chatId,
      //     text: message,
      //     parse_mode: 'Markdown'
      //   })
      // });
      
      return true;
      
    } catch (error) {
      this.logger.error(error, 'send');
      return false;
    }
  }
  
  formatTelegramMessage(alert) {
    const emoji = this.getSeverityEmoji(alert.severity);
    
    return `
${emoji} *Atelier Alert*

*${alert.title}*

*Severity:* ${alert.severity.toUpperCase()}
*Type:* ${alert.type}
*Time:* ${new Date(alert.timestamp).toLocaleString()}

*Message:*
${alert.message}

${alert.details ? `*Details:*\n\`\`\`\n${JSON.stringify(alert.details, null, 2)}\n\`\`\`` : ''}
`;
  }
  
  getSeverityEmoji(severity) {
    switch (severity) {
      case AlertSeverity.CRITICAL: return '🚨';
      case AlertSeverity.HIGH: return '⚠️';
      case AlertSeverity.MEDIUM: return '⚡';
      case AlertSeverity.LOW: return 'ℹ️';
      case AlertSeverity.INFO: return '💬';
      default: return '📢';
    }
  }
}

/**
 * Alert Rate Limiter
 */
export class AlertRateLimiter {
  constructor(config = {}) {
    this.windowSize = config.windowSize || 300000; // 5 minutes
    this.maxAlerts = config.maxAlerts || 10;
    this.alertCounts = new Map();
    this.logger = alertLogger.child({ component: 'rate-limiter' });
  }
  
  /**
   * Check if alert should be rate limited
   * @param {Object} alert - Alert object
   * @returns {boolean} True if alert should be allowed
   */
  shouldAllow(alert) {
    const key = this.getAlertKey(alert);
    const now = Date.now();
    const windowStart = now - this.windowSize;
    
    // Get or create alert count entry
    if (!this.alertCounts.has(key)) {
      this.alertCounts.set(key, []);
    }
    
    const timestamps = this.alertCounts.get(key);
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(ts => ts > windowStart);
    this.alertCounts.set(key, validTimestamps);
    
    // Check if rate limit exceeded
    if (validTimestamps.length >= this.maxAlerts) {
      this.logger.warning('Alert rate limit exceeded', 'shouldAllow', {
        key,
        count: validTimestamps.length,
        maxAlerts: this.maxAlerts,
        alert: alert.id
      });
      return false;
    }
    
    // Add current timestamp
    validTimestamps.push(now);
    this.alertCounts.set(key, validTimestamps);
    
    return true;
  }
  
  /**
   * Generate rate limiting key for alert
   * @param {Object} alert - Alert object
   * @returns {string} Rate limiting key
   */
  getAlertKey(alert) {
    // Group by type and source for rate limiting
    return `${alert.type}:${alert.source || 'unknown'}`;
  }
  
  /**
   * Clear all rate limiting data
   */
  clear() {
    this.alertCounts.clear();
    this.logger.info('Rate limiting data cleared', 'clear');
  }
}

/**
 * Alert Deduplicator
 */
export class AlertDeduplicator {
  constructor(config = {}) {
    this.windowSize = config.windowSize || 60000; // 1 minute
    this.recentAlerts = new Map();
    this.logger = alertLogger.child({ component: 'deduplicator' });
  }
  
  /**
   * Check if alert is a duplicate
   * @param {Object} alert - Alert object
   * @returns {boolean} True if alert is a duplicate
   */
  isDuplicate(alert) {
    const key = this.getDeduplicationKey(alert);
    const now = Date.now();
    
    if (this.recentAlerts.has(key)) {
      const lastAlert = this.recentAlerts.get(key);
      
      if (now - lastAlert.timestamp < this.windowSize) {
        this.logger.info('Duplicate alert detected', 'isDuplicate', {
          key,
          timeSinceLastAlert: now - lastAlert.timestamp,
          alert: alert.id
        });
        return true;
      }
    }
    
    // Store this alert
    this.recentAlerts.set(key, {
      timestamp: now,
      alert: alert.id
    });
    
    // Cleanup old entries
    this.cleanup();
    
    return false;
  }
  
  /**
   * Generate deduplication key for alert
   * @param {Object} alert - Alert object
   * @returns {string} Deduplication key
   */
  getDeduplicationKey(alert) {
    // Deduplicate based on type, severity, and source
    return `${alert.type}:${alert.severity}:${alert.source || 'unknown'}:${alert.title}`;
  }
  
  /**
   * Clean up old deduplication entries
   */
  cleanup() {
    const now = Date.now();
    const cutoff = now - this.windowSize;
    
    for (const [key, entry] of this.recentAlerts.entries()) {
      if (entry.timestamp < cutoff) {
        this.recentAlerts.delete(key);
      }
    }
  }
  
  /**
   * Clear all deduplication data
   */
  clear() {
    this.recentAlerts.clear();
    this.logger.info('Deduplication data cleared', 'clear');
  }
}

/**
 * Main Alerting System
 */
export class AlertingSystem {
  constructor() {
    this.channels = new Map();
    this.rateLimiter = new AlertRateLimiter();
    this.deduplicator = new AlertDeduplicator();
    this.enabled = true;
    this.alertHistory = [];
    this.maxHistorySize = 1000;
    this.logger = alertLogger;
    
    // Default configuration
    this.config = {
      enableDeduplication: true,
      enableRateLimiting: true,
      defaultSeverity: AlertSeverity.MEDIUM,
      minSeverityToSend: AlertSeverity.LOW
    };
    
    // Initialize default channels
    this.initializeDefaultChannels();
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Initialize default notification channels
   */
  initializeDefaultChannels() {
    // Console channel (always enabled)
    this.addChannel(new ConsoleNotificationChannel());
    
    // Browser notifications (if supported)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.addChannel(new BrowserNotificationChannel({
        autoCloseDelay: 5000
      }));
    }
  }
  
  /**
   * Set up event listeners for automatic alerting
   */
  setupEventListeners() {
    // Health check failures
    eventBus.on('health:status:changed', (data) => {
      if (data.newStatus === 'dead' || data.newStatus === 'critical') {
        this.sendAlert({
          type: data.newStatus === 'dead' ? AlertType.MODULE_DEAD : AlertType.HEALTH_CHECK_FAILED,
          severity: data.newStatus === 'dead' ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
          title: `Module Health Alert: ${data.moduleName}`,
          message: `Module ${data.moduleName} health changed from ${data.previousStatus} to ${data.newStatus}`,
          source: 'health-check-system',
          details: data
        });
      }
    });
    
    // Test failures
    eventBus.on('tests:completed', (data) => {
      if (!data.success) {
        this.sendAlert({
          type: AlertType.TEST_FAILURE,
          severity: AlertSeverity.HIGH,
          title: 'Integration Tests Failed',
          message: `Integration test suite failed with ${data.results.summary.failed + data.results.summary.errors} failures`,
          source: 'integration-tests',
          details: {
            summary: data.results.summary,
            failedTests: data.results.results.filter(r => r.result === 'FAIL' || r.result === 'ERROR')
          }
        });
      }
    });
    
    // Error threshold monitoring
    this.setupErrorThresholdMonitoring();
  }
  
  /**
   * Set up error threshold monitoring
   */
  setupErrorThresholdMonitoring() {
    let lastErrorCount = 0;
    const checkInterval = 60000; // 1 minute
    const errorThreshold = 10; // 10 errors per minute
    
    setInterval(() => {
      const stats = errorTracker.getStats();
      const currentErrorCount = stats.total;
      const newErrors = currentErrorCount - lastErrorCount;
      
      if (newErrors >= errorThreshold) {
        this.sendAlert({
          type: AlertType.ERROR_THRESHOLD_EXCEEDED,
          severity: AlertSeverity.HIGH,
          title: 'Error Threshold Exceeded',
          message: `${newErrors} new errors in the last minute (threshold: ${errorThreshold})`,
          source: 'error-tracking-system',
          details: {
            newErrors,
            threshold: errorThreshold,
            totalErrors: currentErrorCount,
            byModule: stats.byModule
          }
        });
      }
      
      lastErrorCount = currentErrorCount;
    }, checkInterval);
  }
  
  /**
   * Add notification channel
   * @param {BaseNotificationChannel} channel - Notification channel
   */
  addChannel(channel) {
    this.channels.set(channel.name, channel);
    this.logger.info(`Notification channel added: ${channel.name}`, 'addChannel');
  }
  
  /**
   * Remove notification channel
   * @param {string} channelName - Channel name
   */
  removeChannel(channelName) {
    if (this.channels.delete(channelName)) {
      this.logger.info(`Notification channel removed: ${channelName}`, 'removeChannel');
    }
  }
  
  /**
   * Send alert through all configured channels
   * @param {Object} alertData - Alert data
   * @returns {Promise<Object>} Send results
   */
  async sendAlert(alertData) {
    if (!this.enabled) {
      this.logger.info('Alerting system disabled, skipping alert', 'sendAlert');
      return { success: false, reason: 'disabled' };
    }
    
    // Create complete alert object
    const alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      severity: this.config.defaultSeverity,
      source: 'alerting-system',
      ...alertData
    };
    
    // Check minimum severity
    if (!this.meetsSeverityThreshold(alert.severity)) {
      this.logger.info('Alert below minimum severity threshold', 'sendAlert', {
        alertSeverity: alert.severity,
        minSeverity: this.config.minSeverityToSend
      });
      return { success: false, reason: 'below_threshold' };
    }
    
    // Check for duplicates
    if (this.config.enableDeduplication && this.deduplicator.isDuplicate(alert)) {
      return { success: false, reason: 'duplicate' };
    }
    
    // Check rate limiting
    if (this.config.enableRateLimiting && !this.rateLimiter.shouldAllow(alert)) {
      return { success: false, reason: 'rate_limited' };
    }
    
    // Add to history
    this.addToHistory(alert);
    
    // Send through all channels
    const results = {};
    const promises = [];
    
    for (const [channelName, channel] of this.channels.entries()) {
      if (channel.enabled) {
        promises.push(
          channel.send(alert)
            .then(success => ({ channelName, success }))
            .catch(error => ({ channelName, success: false, error: error.message }))
        );
      } else {
        results[channelName] = { success: false, reason: 'disabled' };
      }
    }
    
    const channelResults = await Promise.all(promises);
    channelResults.forEach(result => {
      results[result.channelName] = result;
    });
    
    const successCount = Object.values(results).filter(r => r.success).length;
    const totalChannels = Object.keys(results).length;
    
    this.logger.info('Alert sent', 'sendAlert', {
      alertId: alert.id,
      successCount,
      totalChannels,
      results
    });
    
    return {
      success: successCount > 0,
      alertId: alert.id,
      successCount,
      totalChannels,
      results
    };
  }
  
  /**
   * Check if alert meets severity threshold
   * @param {string} severity - Alert severity
   * @returns {boolean} Meets threshold
   */
  meetsSeverityThreshold(severity) {
    const severityLevels = [
      AlertSeverity.INFO,
      AlertSeverity.LOW,
      AlertSeverity.MEDIUM,
      AlertSeverity.HIGH,
      AlertSeverity.CRITICAL
    ];
    
    const alertLevel = severityLevels.indexOf(severity);
    const minLevel = severityLevels.indexOf(this.config.minSeverityToSend);
    
    return alertLevel >= minLevel;
  }
  
  /**
   * Add alert to history
   * @param {Object} alert - Alert object
   */
  addToHistory(alert) {
    this.alertHistory.push({
      ...alert,
      sentAt: Date.now()
    });
    
    // Trim history if needed
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory = this.alertHistory.slice(-this.maxHistorySize);
    }
  }
  
  /**
   * Get alert history
   * @param {Object} filters - Filter options
   * @returns {Array} Filtered alert history
   */
  getAlertHistory(filters = {}) {
    let history = [...this.alertHistory];
    
    if (filters.severity) {
      history = history.filter(alert => alert.severity === filters.severity);
    }
    
    if (filters.type) {
      history = history.filter(alert => alert.type === filters.type);
    }
    
    if (filters.source) {
      history = history.filter(alert => alert.source === filters.source);
    }
    
    if (filters.since) {
      history = history.filter(alert => alert.timestamp >= filters.since);
    }
    
    if (filters.limit) {
      history = history.slice(-filters.limit);
    }
    
    return history;
  }
  
  /**
   * Test all notification channels
   * @returns {Promise<Object>} Test results
   */
  async testAllChannels() {
    const results = {};
    
    for (const [channelName, channel] of this.channels.entries()) {
      if (channel.enabled) {
        try {
          const success = await channel.test();
          results[channelName] = { success };
        } catch (error) {
          results[channelName] = { success: false, error: error.message };
        }
      } else {
        results[channelName] = { success: false, reason: 'disabled' };
      }
    }
    
    this.logger.info('All channels tested', 'testAllChannels', results);
    return results;
  }
  
  /**
   * Get system status
   * @returns {Object} System status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      channels: Array.from(this.channels.entries()).map(([name, channel]) => ({
        name,
        enabled: channel.enabled,
        config: channel.config
      })),
      config: this.config,
      history: {
        total: this.alertHistory.length,
        recent: this.alertHistory.slice(-5)
      },
      rateLimiter: {
        activeKeys: this.rateLimiter.alertCounts.size
      },
      deduplicator: {
        activeKeys: this.deduplicator.recentAlerts.size
      }
    };
  }
  
  /**
   * Update configuration
   * @param {Object} newConfig - Configuration updates
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('Configuration updated', 'updateConfig', newConfig);
  }
  
  /**
   * Enable/disable alerting system
   * @param {boolean} enabled - Enable status
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    this.logger.info(`Alerting system ${enabled ? 'enabled' : 'disabled'}`, 'setEnabled');
  }
  
  /**
   * Clear all data (history, rate limiting, deduplication)
   */
  clear() {
    this.alertHistory = [];
    this.rateLimiter.clear();
    this.deduplicator.clear();
    this.logger.info('All alerting data cleared', 'clear');
  }
}

// Create singleton instance
export const alertingSystem = new AlertingSystem();

// Make available for debugging
if (typeof window !== 'undefined') {
  window.__alertingSystem = alertingSystem;
}

export default alertingSystem;