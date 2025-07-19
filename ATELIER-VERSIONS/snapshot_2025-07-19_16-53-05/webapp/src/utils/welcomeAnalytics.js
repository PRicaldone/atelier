/**
 * Welcome Page Analytics Utilities
 * 
 * Provides advanced analytics for Welcome page interactions,
 * integrating with EventBus and future analytics systems.
 */

// Statement engagement tracking
export class WelcomeAnalytics {
  constructor() {
    this.sessionData = {
      startTime: Date.now(),
      statementsShown: [],
      interactions: [],
      userBehavior: {
        cyclingFrequency: 0,
        gestureUsage: {},
        modulePreferences: {},
        promptEngagement: 0
      }
    };
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    if (window.__eventBus) {
      // Track statement interactions
      window.__eventBus.on('welcome:statement:*', (event) => {
        this.trackStatementEvent(event);
      });

      // Track module interactions
      window.__eventBus.on('welcome:module:*', (event) => {
        this.trackModuleEvent(event);
      });

      // Track prompt interactions
      window.__eventBus.on('welcome:prompt:*', (event) => {
        this.trackPromptEvent(event);
      });

      // Track theme changes
      window.__eventBus.on('welcome:theme:*', (event) => {
        this.trackThemeEvent(event);
      });
    }
  }

  trackStatementEvent(event) {
    const { type, ...data } = event;
    
    this.sessionData.interactions.push({
      type: 'statement',
      action: type.split(':')[2], // 'shown', 'changed', 'gesture'
      timestamp: Date.now(),
      data
    });

    // Update behavior metrics
    if (type === 'welcome:statement:changed') {
      this.sessionData.userBehavior.cyclingFrequency++;
    }

    if (type === 'welcome:statement:gesture') {
      const gesture = data.gesture;
      this.sessionData.userBehavior.gestureUsage[gesture] = 
        (this.sessionData.userBehavior.gestureUsage[gesture] || 0) + 1;
    }

    // Track statement shown
    if (type === 'welcome:statement:shown' && !this.sessionData.statementsShown.includes(data.text)) {
      this.sessionData.statementsShown.push({
        text: data.text,
        type: data.type,
        context: data.context,
        timestamp: Date.now()
      });
    }
  }

  trackModuleEvent(event) {
    const { type, ...data } = event;
    
    this.sessionData.interactions.push({
      type: 'module',
      action: type.split(':')[2], // 'entered', 'hovered'
      timestamp: Date.now(),
      data
    });

    // Update module preferences
    if (type === 'welcome:module:entered') {
      const module = data.module;
      this.sessionData.userBehavior.modulePreferences[module] = 
        (this.sessionData.userBehavior.modulePreferences[module] || 0) + 1;
    }
  }

  trackPromptEvent(event) {
    const { type, ...data } = event;
    
    this.sessionData.interactions.push({
      type: 'prompt',
      action: type.split(':')[2], // 'submitted', 'opened'
      timestamp: Date.now(),
      data
    });

    if (type === 'welcome:prompt:submitted') {
      this.sessionData.userBehavior.promptEngagement++;
    }
  }

  trackThemeEvent(event) {
    const { type, ...data } = event;
    
    this.sessionData.interactions.push({
      type: 'theme',
      action: type.split(':')[2], // 'changed'
      timestamp: Date.now(),
      data
    });
  }

  // Analytics getters
  getSessionSummary() {
    const sessionDuration = Date.now() - this.sessionData.startTime;
    
    return {
      duration: sessionDuration,
      statementsViewed: this.sessionData.statementsShown.length,
      uniqueStatements: new Set(this.sessionData.statementsShown.map(s => s.text)).size,
      interactions: this.sessionData.interactions.length,
      cyclingFrequency: this.sessionData.userBehavior.cyclingFrequency,
      gestureUsage: this.sessionData.userBehavior.gestureUsage,
      modulePreferences: this.sessionData.userBehavior.modulePreferences,
      promptEngagement: this.sessionData.userBehavior.promptEngagement
    };
  }

  getPopularStatements() {
    const statementCounts = {};
    
    this.sessionData.statementsShown.forEach(statement => {
      statementCounts[statement.text] = (statementCounts[statement.text] || 0) + 1;
    });

    return Object.entries(statementCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([text, count]) => ({ text, count }));
  }

  getUserBehaviorInsights() {
    const summary = this.getSessionSummary();
    
    return {
      engagementLevel: this.calculateEngagementLevel(summary),
      preferredGestures: Object.entries(summary.gestureUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([gesture]) => gesture),
      favoriteModule: Object.entries(summary.modulePreferences)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || null,
      sessionType: this.classifySession(summary)
    };
  }

  calculateEngagementLevel(summary) {
    let score = 0;
    
    // Statement cycling
    if (summary.cyclingFrequency > 3) score += 3;
    else if (summary.cyclingFrequency > 0) score += 1;
    
    // Gesture usage
    if (Object.keys(summary.gestureUsage).length > 1) score += 2;
    else if (Object.keys(summary.gestureUsage).length > 0) score += 1;
    
    // Module exploration
    if (Object.keys(summary.modulePreferences).length > 2) score += 3;
    else if (Object.keys(summary.modulePreferences).length > 0) score += 1;
    
    // Prompt engagement
    if (summary.promptEngagement > 0) score += 2;
    
    // Time spent
    if (summary.duration > 120000) score += 2; // > 2 minutes
    else if (summary.duration > 30000) score += 1; // > 30 seconds
    
    if (score >= 8) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }

  classifySession(summary) {
    if (summary.promptEngagement > 0) return 'explorer';
    if (summary.cyclingFrequency > 3) return 'poetry_lover';
    if (Object.keys(summary.modulePreferences).length > 1) return 'browser';
    if (summary.duration < 10000) return 'quick_visitor';
    return 'contemplator';
  }

  // Export data for analysis
  exportData() {
    return {
      sessionData: this.sessionData,
      summary: this.getSessionSummary(),
      insights: this.getUserBehaviorInsights(),
      exportedAt: Date.now()
    };
  }

  // Reset session (for testing or new session)
  reset() {
    this.sessionData = {
      startTime: Date.now(),
      statementsShown: [],
      interactions: [],
      userBehavior: {
        cyclingFrequency: 0,
        gestureUsage: {},
        modulePreferences: {},
        promptEngagement: 0
      }
    };
  }
}

// Singleton instance
let analyticsInstance = null;

export const getWelcomeAnalytics = () => {
  if (!analyticsInstance) {
    analyticsInstance = new WelcomeAnalytics();
  }
  return analyticsInstance;
};

// Debug utilities for development
export const welcomeAnalyticsUtils = {
  getStats: () => getWelcomeAnalytics().getSessionSummary(),
  getInsights: () => getWelcomeAnalytics().getUserBehaviorInsights(),
  getPopular: () => getWelcomeAnalytics().getPopularStatements(),
  export: () => getWelcomeAnalytics().exportData(),
  reset: () => getWelcomeAnalytics().reset(),
  
  // Test data generation
  simulateEngagement: () => {
    const analytics = getWelcomeAnalytics();
    
    // Simulate statement viewing
    window.__eventBus?.emit('welcome:statement:shown', {
      text: 'Test statement',
      type: 'default',
      context: ['universal'],
      timestamp: Date.now()
    });
    
    // Simulate cycling
    window.__eventBus?.emit('welcome:statement:changed', {
      newText: 'Another test statement',
      type: 'default',
      timestamp: Date.now()
    });
    
    // Simulate gesture
    window.__eventBus?.emit('welcome:statement:gesture', {
      gesture: 'longPress',
      text: 'Test statement',
      timestamp: Date.now()
    });
    
    console.log('Simulated engagement data generated');
  }
};

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.__welcomeAnalytics = welcomeAnalyticsUtils;
}