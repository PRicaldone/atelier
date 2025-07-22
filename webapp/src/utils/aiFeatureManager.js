/**
 * AI Feature Manager - Automatic AI features enablement system
 * 
 * This system automatically detects when AI APIs are available and
 * re-enables disabled AI features without requiring manual intervention.
 * 
 * PRINCIPLE: Never leave things for the user to remember - automate everything.
 */

import { createModuleLogger } from '../modules/shared/monitoring/ModuleLogger.js';

const logger = createModuleLogger('ai-feature-manager');

class AIFeatureManager {
  constructor() {
    this.isInitialized = false;
    this.apiAvailable = false;
    this.checkInterval = null;
    this.checkIntervalMs = 30000; // Check every 30 seconds
    this.features = new Map();
    this.callbacks = new Set();
    
    this.init();
  }

  /**
   * Initialize the AI Feature Manager
   */
  async init() {
    if (this.isInitialized) return;
    
    logger.info('Initializing AI Feature Manager', 'init');
    
    // Register all disabled AI features
    this.registerDisabledFeature('canvas-auto-analysis', {
      file: 'modules/scriptorium/VisualCanvas.jsx',
      line: '~107',
      function: 'analyzeCanvasContext',
      trigger: 'elements.length change',
      restoreCallback: () => this.enableCanvasAutoAnalysis()
    });
    
    this.registerDisabledFeature('ai-suggestions-auto-analysis', {
      file: 'modules/scriptorium/components/AISuggestions.jsx', 
      line: '~24',
      function: 'analyzeCanvasContext',
      trigger: 'every 3 elements added',
      restoreCallback: () => this.enableAISuggestionsAutoAnalysis()
    });
    
    // Start monitoring API availability
    this.startAPIMonitoring();
    
    this.isInitialized = true;
    logger.info('AI Feature Manager initialized', 'init', {
      featuresCount: this.features.size,
      checkInterval: this.checkIntervalMs
    });
  }

  /**
   * Register a disabled AI feature for automatic restoration
   */
  registerDisabledFeature(id, config) {
    this.features.set(id, {
      ...config,
      status: 'disabled',
      registeredAt: Date.now()
    });
    
    logger.info(`Registered disabled feature: ${id}`, 'registerDisabledFeature', config);
  }

  /**
   * Start monitoring API availability
   */
  startAPIMonitoring() {
    // Initial check
    this.checkAPIAvailability();
    
    // Set up periodic checks
    this.checkInterval = setInterval(() => {
      this.checkAPIAvailability();
    }, this.checkIntervalMs);
    
    logger.info('Started API availability monitoring', 'startAPIMonitoring');
  }

  /**
   * Check if AI APIs are available
   */
  async checkAPIAvailability() {
    try {
      // Check if we have API keys or if API proxy is working
      const hasApiProxy = await this.testAPIProxy();
      const hasDirectApi = this.checkDirectAPIKeys();
      
      const wasAvailable = this.apiAvailable;
      this.apiAvailable = hasApiProxy || hasDirectApi;
      
      if (!wasAvailable && this.apiAvailable) {
        logger.info('AI APIs became available - triggering auto-restoration', 'checkAPIAvailability');
        this.restoreAllFeatures();
      } else if (wasAvailable && !this.apiAvailable) {
        logger.warning('AI APIs became unavailable', 'checkAPIAvailability');
      }
      
    } catch (error) {
      logger.error(error, 'checkAPIAvailability');
      this.apiAvailable = false;
    }
  }

  /**
   * Test API proxy availability
   */
  async testAPIProxy() {
    try {
      // Test if API proxy endpoints exist
      const healthCheck = await fetch('/api/health', { 
        method: 'GET',
        timeout: 5000 
      });
      return healthCheck.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check for direct API keys
   */
  checkDirectAPIKeys() {
    // Check environment variables or localStorage for API keys
    const hasAnthropicKey = !!localStorage.getItem('ANTHROPIC_API_KEY');
    const hasOpenAIKey = !!localStorage.getItem('OPENAI_API_KEY');
    
    return hasAnthropicKey || hasOpenAIKey;
  }

  /**
   * Restore all disabled AI features automatically
   */
  async restoreAllFeatures() {
    logger.info('Starting automatic restoration of all AI features', 'restoreAllFeatures');
    
    let restoredCount = 0;
    
    for (const [featureId, feature] of this.features) {
      if (feature.status === 'disabled') {
        try {
          await feature.restoreCallback();
          feature.status = 'restored';
          feature.restoredAt = Date.now();
          restoredCount++;
          
          logger.info(`Restored feature: ${featureId}`, 'restoreAllFeatures', {
            file: feature.file,
            function: feature.function
          });
        } catch (error) {
          logger.error(error, 'restoreAllFeatures', { featureId });
        }
      }
    }
    
    // Notify all registered callbacks
    this.notifyRestoration();
    
    // Stop monitoring since features are restored
    this.stopAPIMonitoring();
    
    logger.info(`AI feature restoration complete`, 'restoreAllFeatures', {
      restoredCount,
      totalFeatures: this.features.size
    });
  }

  /**
   * Enable canvas auto analysis by modifying the code
   */
  enableCanvasAutoAnalysis() {
    // This would normally modify the actual file, but in a browser environment
    // we use a runtime flag approach instead
    window.__AI_FEATURES_ENABLED = window.__AI_FEATURES_ENABLED || {};
    window.__AI_FEATURES_ENABLED.canvasAutoAnalysis = true;
    
    logger.info('Enabled canvas auto analysis', 'enableCanvasAutoAnalysis');
    
    // Emit event to notify components
    window.dispatchEvent(new CustomEvent('ai-feature-restored', {
      detail: { feature: 'canvas-auto-analysis' }
    }));
  }

  /**
   * Enable AI suggestions auto analysis
   */
  enableAISuggestionsAutoAnalysis() {
    window.__AI_FEATURES_ENABLED = window.__AI_FEATURES_ENABLED || {};
    window.__AI_FEATURES_ENABLED.aiSuggestionsAutoAnalysis = true;
    
    logger.info('Enabled AI suggestions auto analysis', 'enableAISuggestionsAutoAnalysis');
    
    // Emit event to notify components
    window.dispatchEvent(new CustomEvent('ai-feature-restored', {
      detail: { feature: 'ai-suggestions-auto-analysis' }
    }));
  }

  /**
   * Stop API monitoring
   */
  stopAPIMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info('Stopped API monitoring', 'stopAPIMonitoring');
    }
  }

  /**
   * Register callback for restoration notification
   */
  onRestore(callback) {
    this.callbacks.add(callback);
  }

  /**
   * Notify all callbacks about restoration
   */
  notifyRestoration() {
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        logger.error(error, 'notifyRestoration');
      }
    });
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      apiAvailable: this.apiAvailable,
      featuresCount: this.features.size,
      disabledFeatures: Array.from(this.features.entries())
        .filter(([_, feature]) => feature.status === 'disabled')
        .map(([id, feature]) => ({ id, ...feature })),
      restoredFeatures: Array.from(this.features.entries())
        .filter(([_, feature]) => feature.status === 'restored')
        .map(([id, feature]) => ({ id, ...feature }))
    };
  }

  /**
   * Force check and restore (for debugging)
   */
  async forceRestore() {
    logger.info('Force restore triggered', 'forceRestore');
    this.apiAvailable = true;
    await this.restoreAllFeatures();
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopAPIMonitoring();
    this.callbacks.clear();
    this.features.clear();
    this.isInitialized = false;
    
    logger.info('AI Feature Manager destroyed', 'destroy');
  }
}

// Create singleton instance
export const aiFeatureManager = new AIFeatureManager();

// Make available for debugging
if (typeof window !== 'undefined') {
  window.__aiFeatureManager = aiFeatureManager;
}

export default aiFeatureManager;