/**
 * Analytics Module Index - Unified Analytics System
 * 
 * Exports all analytics components and initializes the complete
 * usage tracking, pattern recognition, and time saved metrics system.
 * 
 * This module implements the strategic vision for creative workflow
 * optimization through data-driven insights.
 */

import UsageTracker from './UsageTracker.js';
import PatternRecognition from './PatternRecognition.js';
import TimeSavedMetrics from './TimeSavedMetrics.js';

// Initialize analytics system
class AnalyticsSystem {
  constructor() {
    this.usageTracker = new UsageTracker();
    this.patternRecognition = new PatternRecognition(this.usageTracker);
    this.timeSavedMetrics = new TimeSavedMetrics(this.usageTracker, this.patternRecognition);
    
    this.isInitialized = false;
    this.init();
  }

  /**
   * Initialize the complete analytics system
   */
  init() {
    try {
      // Make components available globally for console debugging
      if (typeof window !== 'undefined') {
        window.__usageTracker = this.usageTracker;
        window.__patternRecognition = this.patternRecognition;
        window.__timeSavedMetrics = this.timeSavedMetrics;
        window.__analyticsSystem = this;
      }

      // Set up cross-system integration
      this.setupIntegration();
      
      this.isInitialized = true;
      console.log('🔬 Analytics System initialized successfully');
      
      // Track system initialization
      this.usageTracker.logInteraction('analytics', 'system-initialized', {
        timestamp: Date.now(),
        components: ['usageTracker', 'patternRecognition', 'timeSavedMetrics']
      });
      
    } catch (error) {
      console.error('Failed to initialize Analytics System:', error);
    }
  }

  /**
   * Setup integration between analytics components
   */
  setupIntegration() {
    // Hook into AI Command Bar executions
    this.setupAICommandTracking();
    
    // Hook into module navigation
    this.setupModuleNavigationTracking();
    
    // Hook into workflow automation
    this.setupWorkflowAutomationTracking();
  }

  /**
   * Setup AI Command tracking integration
   */
  setupAICommandTracking() {
    // This will be called by AI Command Bar when commands are executed
    window.__trackAICommand = (command, analysis, result, timeSaved) => {
      // Track usage
      const interactionId = this.usageTracker.trackAICommand(command, analysis, result, timeSaved);
      
      // Calculate time saved metrics
      const metric = this.timeSavedMetrics.calculateAICommandTimeSaved(
        command, 
        analysis, 
        { duration: result?.executionTime, success: !!result }
      );
      
      return { interactionId, metric };
    };
  }

  /**
   * Setup module navigation tracking
   */
  setupModuleNavigationTracking() {
    // This will be called when users navigate between modules
    window.__trackModuleNavigation = (fromModule, toModule, method = 'click') => {
      return this.usageTracker.trackModuleNavigation(fromModule, toModule, method);
    };
  }

  /**
   * Setup workflow automation tracking
   */
  setupWorkflowAutomationTracking() {
    // This will be called when automated workflows are executed
    window.__trackWorkflowAutomation = (workflowType, automationType, context, timeSaved) => {
      // Track usage
      const interactionId = this.usageTracker.trackAutomation(automationType, context, timeSaved);
      
      // Calculate workflow time saved
      const metric = this.timeSavedMetrics.calculateWorkflowTimeSaved(
        workflowType, 
        automationType, 
        context
      );
      
      return { interactionId, metric };
    };
  }

  /**
   * Track friction reduction
   */
  trackFrictionReduction(frictionType, frequency, context = {}) {
    // Track usage
    const interactionId = this.usageTracker.logInteraction(
      'friction-reduction', 
      frictionType, 
      { frequency, ...context }
    );
    
    // Calculate time saved
    const metric = this.timeSavedMetrics.calculateFrictionReduction(
      frictionType, 
      frequency, 
      context
    );
    
    return { interactionId, metric };
  }

  /**
   * Track optimization improvements
   */
  trackOptimization(optimizationType, impact, context = {}) {
    // Track usage
    const interactionId = this.usageTracker.logInteraction(
      'optimization', 
      optimizationType, 
      { impact, ...context }
    );
    
    // Calculate time saved
    const metric = this.timeSavedMetrics.calculateOptimizationTimeSaved(
      optimizationType, 
      impact, 
      context
    );
    
    return { interactionId, metric };
  }

  /**
   * Get comprehensive analytics report
   */
  getComprehensiveReport() {
    return {
      usage: this.usageTracker.getAnalytics(),
      patterns: this.patternRecognition.getInsights(),
      timeSaved: this.timeSavedMetrics.getTimeSavedReport(),
      realTime: this.usageTracker.getInsights(),
      recommendations: this.timeSavedMetrics.getAutomationSuggestions(),
      export_timestamp: Date.now()
    };
  }

  /**
   * Get real-time dashboard data
   */
  getDashboardData() {
    return {
      usage: this.usageTracker.getAnalytics(),
      patterns: this.patternRecognition.getInsights(),
      timeSaved: this.timeSavedMetrics.getTimeSavedReport(),
      realTime: this.usageTracker.getInsights(),
      lastUpdate: Date.now()
    };
  }

  /**
   * Export all analytics data
   */
  exportAllData() {
    return {
      usage: this.usageTracker.exportData(),
      patterns: this.patternRecognition.exportPatterns(),
      timeSaved: this.timeSavedMetrics.exportMetrics(),
      system_info: {
        initialized: this.isInitialized,
        export_timestamp: Date.now(),
        version: '1.0.0'
      }
    };
  }

  /**
   * Reset all analytics data
   */
  resetAllData() {
    this.usageTracker.reset();
    this.patternRecognition = new PatternRecognition(this.usageTracker);
    this.timeSavedMetrics = new TimeSavedMetrics(this.usageTracker, this.patternRecognition);
    
    console.log('🔄 Analytics System reset completed');
  }

  /**
   * Get system health
   */
  getSystemHealth() {
    const usage = this.usageTracker.getAnalytics();
    const patterns = this.patternRecognition.getInsights();
    const timeSaved = this.timeSavedMetrics.getTimeSavedReport();
    
    return {
      status: 'healthy',
      components: {
        usageTracker: usage ? 'active' : 'inactive',
        patternRecognition: patterns ? 'active' : 'inactive',
        timeSavedMetrics: timeSaved ? 'active' : 'inactive'
      },
      dataIntegrity: {
        totalInteractions: usage?.overall?.totalInteractions || 0,
        totalPatterns: patterns?.totalPatterns || 0,
        totalTimeSaved: timeSaved?.summary?.totalTimeSavedAllTime || 0
      },
      lastActivity: Math.max(
        usage?.session?.startTime || 0,
        patterns?.lastAnalysis || 0,
        timeSaved?.lastCalculated || 0
      )
    };
  }
}

// Create and export global analytics system instance
export const analyticsSystem = new AnalyticsSystem();

// Export individual components for direct use
export { UsageTracker, PatternRecognition, TimeSavedMetrics };

// Export tracking utilities for easy integration
export const trackAICommand = (command, analysis, result, timeSaved) => {
  return window.__trackAICommand?.(command, analysis, result, timeSaved);
};

export const trackModuleNavigation = (fromModule, toModule, method) => {
  return window.__trackModuleNavigation?.(fromModule, toModule, method);
};

export const trackWorkflowAutomation = (workflowType, automationType, context, timeSaved) => {
  return window.__trackWorkflowAutomation?.(workflowType, automationType, context, timeSaved);
};

export const trackFrictionReduction = (frictionType, frequency, context) => {
  return analyticsSystem.trackFrictionReduction(frictionType, frequency, context);
};

export const trackOptimization = (optimizationType, impact, context) => {
  return analyticsSystem.trackOptimization(optimizationType, impact, context);
};

// Console utilities for debugging
if (typeof window !== 'undefined') {
  window.__analyticsHelpers = {
    getReport: () => analyticsSystem.getComprehensiveReport(),
    getDashboard: () => analyticsSystem.getDashboardData(),
    exportAll: () => analyticsSystem.exportAllData(),
    reset: () => analyticsSystem.resetAllData(),
    health: () => analyticsSystem.getSystemHealth(),
    
    // Quick test functions
    testAICommand: () => trackAICommand(
      'Test AI command', 
      { complexity: 'simple', route: 'claude-connectors', confidence: 0.9 },
      { success: true, executionTime: 5000 }
    ),
    
    testNavigation: () => trackModuleNavigation('mind-garden', 'scriptorium', 'click'),
    
    testWorkflow: () => trackWorkflowAutomation(
      'mind-garden-to-scriptorium',
      'partial-automation',
      { nodeCount: 5 },
      120000 // 2 minutes saved
    )
  };
}

export default analyticsSystem;