/**
 * WIP (Work In Progress) Protection System
 * Detects and protects unsaved work from being lost
 */

import { createModuleLogger } from '../modules/shared/monitoring/ModuleLogger';
import alertSystem, { AlertSeverity, AlertCategory, AlertChannel } from './alertSystem';

const logger = createModuleLogger('WIPProtection');

class WIPProtection {
  constructor() {
    this.isEnabled = true;
    this.trackingInterval = 30 * 1000; // 30 seconds
    this.protectionThresholds = {
      significantChanges: 5,
      timeSpent: 10 * 60 * 1000, // 10 minutes
      newFiles: 3,
      modifiedFiles: 5,
      textChanges: 1000 // characters
    };
    
    this.currentSession = {
      startTime: Date.now(),
      changes: [],
      unsavedChanges: new Set(),
      textChangeCount: 0,
      lastSaveTime: null,
      isSignificant: false
    };
    
    this.protectionActive = false;
    this.subscribers = [];
    
    this.initialize();
  }

  initialize() {
    this.loadSession();
    this.setupTracking();
    this.setupBeforeUnloadProtection();
    this.setupVisibilityChangeProtection();
    this.setupPeriodicChecks();
    
    logger.info('WIP Protection initialized');
    
    // Check for previous unfinished session
    this.checkPreviousSession();
  }

  loadSession() {
    try {
      const saved = localStorage.getItem('ATELIER_WIP_SESSION');
      if (saved) {
        const sessionData = JSON.parse(saved);
        
        // Check if previous session was recent (within 4 hours)
        const sessionAge = Date.now() - sessionData.startTime;
        if (sessionAge < 4 * 60 * 60 * 1000) {
          this.currentSession = {
            ...this.currentSession,
            ...sessionData,
            unsavedChanges: new Set(sessionData.unsavedChanges || [])
          };
          
          logger.info('Restored WIP session', { sessionAge: Math.round(sessionAge / 60000) + ' minutes' });
        } else {
          logger.info('Previous session too old, starting fresh');
        }
      }
    } catch (error) {
      logger.error(error, 'Failed to load WIP session');
    }
  }

  saveSession() {
    try {
      const sessionData = {
        ...this.currentSession,
        unsavedChanges: Array.from(this.currentSession.unsavedChanges),
        lastUpdated: Date.now()
      };
      
      localStorage.setItem('ATELIER_WIP_SESSION', JSON.stringify(sessionData));
    } catch (error) {
      logger.error(error, 'Failed to save WIP session');
    }
  }

  checkPreviousSession() {
    const sessionAge = Date.now() - this.currentSession.startTime;
    const hasUnsavedChanges = this.currentSession.unsavedChanges.size > 0;
    const wasSignificant = this.currentSession.isSignificant;
    
    if (hasUnsavedChanges && wasSignificant && sessionAge > 60000) { // More than 1 minute ago
      alertSystem.createAlert({
        severity: AlertSeverity.WARNING,
        category: AlertCategory.USER_ACTION,
        title: 'Unsaved Work Detected',
        message: `You have unsaved work from ${Math.round(sessionAge / 60000)} minutes ago`,
        details: {
          unsavedFiles: Array.from(this.currentSession.unsavedChanges),
          sessionDuration: Math.round((this.currentSession.lastSaveTime || Date.now() - this.currentSession.startTime) / 60000),
          changes: this.currentSession.changes.length
        },
        channel: AlertChannel.MODAL,
        persistent: true,
        actions: [
          {
            label: 'Save Now',
            action: () => this.triggerSave()
          },
          {
            label: 'Continue Anyway',
            action: () => this.clearSession()
          }
        ]
      });
    }
  }

  setupTracking() {
    // Track form changes
    document.addEventListener('input', (event) => {
      this.trackInputChange(event);
    });

    // Track contenteditable changes
    document.addEventListener('input', (event) => {
      if (event.target.isContentEditable) {
        this.trackContentEditableChange(event);
      }
    });

    // Track programmatic changes via mutation observer
    const observer = new MutationObserver((mutations) => {
      this.trackDOMChanges(mutations);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: true
    });

    // Track localStorage changes
    this.originalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      this.trackStorageChange(key, value);
      return this.originalSetItem.call(localStorage, key, value);
    };
  }

  setupBeforeUnloadProtection() {
    window.addEventListener('beforeunload', (event) => {
      if (this.protectionActive && this.hasSignificantChanges()) {
        const message = 'You have unsaved work. Are you sure you want to leave?';
        event.preventDefault();
        event.returnValue = message;
        
        // Log the protection trigger
        logger.warning('WIP protection triggered on page unload', {
          unsavedChanges: Array.from(this.currentSession.unsavedChanges),
          sessionDuration: Date.now() - this.currentSession.startTime,
          changes: this.currentSession.changes.length
        });
        
        return message;
      }
    });
  }

  setupVisibilityChangeProtection() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.hasSignificantChanges()) {
        this.showVisibilityProtection();
      }
    });
  }

  setupPeriodicChecks() {
    setInterval(() => {
      this.performPeriodicCheck();
    }, this.trackingInterval);
  }

  trackInputChange(event) {
    const element = event.target;
    const elementId = this.getElementIdentifier(element);
    
    this.recordChange({
      type: 'input',
      element: elementId,
      timestamp: Date.now(),
      length: element.value?.length || 0
    });

    this.currentSession.textChangeCount += event.data?.length || 1;
    this.currentSession.unsavedChanges.add(elementId);
    
    this.updateProtectionStatus();
    this.notifySubscribers('change', { type: 'input', element: elementId });
  }

  trackContentEditableChange(event) {
    const element = event.target;
    const elementId = this.getElementIdentifier(element);
    
    this.recordChange({
      type: 'contenteditable',
      element: elementId,
      timestamp: Date.now(),
      content: element.textContent?.substring(0, 100) + '...' // First 100 chars
    });

    this.currentSession.textChangeCount += event.data?.length || 1;
    this.currentSession.unsavedChanges.add(elementId);
    
    this.updateProtectionStatus();
    this.notifySubscribers('change', { type: 'contenteditable', element: elementId });
  }

  trackDOMChanges(mutations) {
    let significantChanges = 0;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        significantChanges += mutation.addedNodes.length + mutation.removedNodes.length;
      } else if (mutation.type === 'characterData') {
        significantChanges += 1;
      }
    });

    if (significantChanges > 0) {
      this.recordChange({
        type: 'dom',
        timestamp: Date.now(),
        mutations: significantChanges
      });

      this.updateProtectionStatus();
      this.notifySubscribers('change', { type: 'dom', mutations: significantChanges });
    }
  }

  trackStorageChange(key, value) {
    // Only track relevant Atelier keys
    if (key.startsWith('ATELIER_') && !key.includes('WIP_SESSION') && !key.includes('LAST_SAVE')) {
      this.recordChange({
        type: 'storage',
        key: key,
        timestamp: Date.now(),
        size: value?.length || 0
      });

      this.currentSession.unsavedChanges.add(key);
      this.updateProtectionStatus();
      this.notifySubscribers('change', { type: 'storage', key });
    }
  }

  recordChange(changeData) {
    this.currentSession.changes.push(changeData);
    
    // Keep only recent changes (last 100)
    if (this.currentSession.changes.length > 100) {
      this.currentSession.changes = this.currentSession.changes.slice(-100);
    }
    
    this.saveSession();
  }

  updateProtectionStatus() {
    const wasActive = this.protectionActive;
    this.protectionActive = this.hasSignificantChanges();
    
    if (!wasActive && this.protectionActive) {
      this.activateProtection();
    } else if (wasActive && !this.protectionActive) {
      this.deactivateProtection();
    }
  }

  hasSignificantChanges() {
    const sessionDuration = Date.now() - this.currentSession.startTime;
    const timeSinceLastSave = this.currentSession.lastSaveTime ? 
      Date.now() - this.currentSession.lastSaveTime : sessionDuration;
    
    return (
      this.currentSession.changes.length >= this.protectionThresholds.significantChanges ||
      timeSinceLastSave >= this.protectionThresholds.timeSpent ||
      this.currentSession.unsavedChanges.size >= this.protectionThresholds.modifiedFiles ||
      this.currentSession.textChangeCount >= this.protectionThresholds.textChanges
    );
  }

  activateProtection() {
    logger.info('WIP protection activated');
    
    this.currentSession.isSignificant = true;
    this.notifySubscribers('protection_activated');
    
    // Show initial protection notification
    alertSystem.createAlert({
      severity: AlertSeverity.INFO,
      category: AlertCategory.USER_ACTION,
      title: 'Work In Progress Protected',
      message: 'Your changes are being tracked to prevent data loss',
      channel: AlertChannel.TOAST,
      actions: [
        {
          label: 'Save Now',
          action: () => this.triggerSave()
        }
      ]
    });
  }

  deactivateProtection() {
    logger.info('WIP protection deactivated');
    
    this.notifySubscribers('protection_deactivated');
  }

  performPeriodicCheck() {
    const sessionDuration = Date.now() - this.currentSession.startTime;
    const timeSinceLastSave = this.currentSession.lastSaveTime ? 
      Date.now() - this.currentSession.lastSaveTime : sessionDuration;
    
    // Remind to save every 15 minutes if there are significant changes
    if (this.protectionActive && timeSinceLastSave > 15 * 60 * 1000) {
      this.showPeriodicReminder();
    }
    
    // Auto-save session data
    this.saveSession();
  }

  showPeriodicReminder() {
    const timeSinceLastSave = this.currentSession.lastSaveTime ? 
      Date.now() - this.currentSession.lastSaveTime : 
      Date.now() - this.currentSession.startTime;
    
    alertSystem.createAlert({
      severity: AlertSeverity.WARNING,
      category: AlertCategory.USER_ACTION,
      title: 'Reminder: Save Your Work',
      message: `You haven't saved for ${Math.round(timeSinceLastSave / 60000)} minutes`,
      details: {
        unsavedChanges: Array.from(this.currentSession.unsavedChanges),
        changeCount: this.currentSession.changes.length,
        textChanges: this.currentSession.textChangeCount
      },
      channel: AlertChannel.TOAST,
      actions: [
        {
          label: 'Save Now',
          action: () => this.triggerSave()
        },
        {
          label: 'Remind Later',
          action: () => {} // Just dismiss
        }
      ]
    });
  }

  showVisibilityProtection() {
    alertSystem.createAlert({
      severity: AlertSeverity.WARNING,
      category: AlertCategory.USER_ACTION,
      title: 'Unsaved Work Warning',
      message: 'You have unsaved changes. Consider saving before leaving.',
      channel: AlertChannel.PERSISTENT,
      persistent: true,
      actions: [
        {
          label: 'Save Now',
          action: () => this.triggerSave()
        }
      ]
    });
  }

  triggerSave() {
    // Dispatch custom event for save trigger
    window.dispatchEvent(new CustomEvent('atelier:save-triggered', {
      detail: {
        source: 'wip-protection',
        unsavedChanges: Array.from(this.currentSession.unsavedChanges),
        sessionData: this.getSessionSummary()
      }
    }));
    
    this.markAsSaved();
    
    logger.info('Save triggered by WIP protection');
  }

  markAsSaved() {
    this.currentSession.lastSaveTime = Date.now();
    this.currentSession.unsavedChanges.clear();
    this.currentSession.textChangeCount = 0;
    this.currentSession.changes = [];
    this.protectionActive = false;
    
    localStorage.setItem('ATELIER_LAST_SAVE_TIMESTAMP', new Date().toISOString());
    this.saveSession();
    
    this.notifySubscribers('saved');
    
    alertSystem.createAlert({
      severity: AlertSeverity.INFO,
      category: AlertCategory.USER_ACTION,
      title: 'Work Saved',
      message: 'Your changes have been saved successfully',
      channel: AlertChannel.TOAST
    });
  }

  clearSession() {
    this.currentSession = {
      startTime: Date.now(),
      changes: [],
      unsavedChanges: new Set(),
      textChangeCount: 0,
      lastSaveTime: Date.now(),
      isSignificant: false
    };
    
    this.protectionActive = false;
    localStorage.removeItem('ATELIER_WIP_SESSION');
    
    this.notifySubscribers('session_cleared');
    logger.info('WIP session cleared');
  }

  getElementIdentifier(element) {
    return element.id || 
           element.name || 
           element.className || 
           element.tagName + '_' + Array.from(element.parentNode.children).indexOf(element);
  }

  getSessionSummary() {
    const sessionDuration = Date.now() - this.currentSession.startTime;
    
    return {
      duration: sessionDuration,
      durationMinutes: Math.round(sessionDuration / 60000),
      changes: this.currentSession.changes.length,
      unsavedFiles: this.currentSession.unsavedChanges.size,
      textChanges: this.currentSession.textChangeCount,
      isProtected: this.protectionActive,
      lastSave: this.currentSession.lastSaveTime
    };
  }

  getStats() {
    return {
      isEnabled: this.isEnabled,
      protectionActive: this.protectionActive,
      session: this.getSessionSummary(),
      thresholds: this.protectionThresholds,
      recentChanges: this.currentSession.changes.slice(-10) // Last 10 changes
    };
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notifySubscribers(event, data = {}) {
    this.subscribers.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        logger.error(error, 'WIP subscriber callback failed');
      }
    });
  }

  configure(options) {
    if (options.enabled !== undefined) {
      this.isEnabled = options.enabled;
    }
    
    if (options.thresholds) {
      this.protectionThresholds = { ...this.protectionThresholds, ...options.thresholds };
    }
    
    if (options.trackingInterval) {
      this.trackingInterval = options.trackingInterval;
    }
    
    logger.info('WIP protection configured', options);
  }

  disable() {
    this.isEnabled = false;
    this.protectionActive = false;
    this.clearSession();
    
    // Remove event listeners would require storing references
    logger.info('WIP protection disabled');
  }

  enable() {
    this.isEnabled = true;
    this.initialize();
    
    logger.info('WIP protection enabled');
  }
}

// Create global instance
const wipProtection = new WIPProtection();

// Export for global access
window.__wipProtection = wipProtection;

export default wipProtection;