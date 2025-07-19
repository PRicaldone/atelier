/**
 * UsageTracker - Real-Time Usage Analytics for Creative Workflows
 * 
 * Tracks user interactions, workflow patterns, and time metrics to identify
 * the most valuable automation opportunities for creative polymorphs.
 * 
 * Design Philosophy:
 * - Zero friction tracking (transparent to user)
 * - Privacy-first (local storage only)
 * - Pattern recognition for workflow optimization
 * - Time-saved metrics for ROI validation
 */

export class UsageTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.interactions = [];
    this.workflows = [];
    this.currentWorkflow = null;
    this.moduleTimers = new Map();
    this.config = {
      maxInteractions: 10000,
      maxWorkflows: 1000,
      workflowTimeout: 300000, // 5 minutes without activity = new workflow
      storageKey: 'ATELIER_USAGE_ANALYTICS'
    };
    
    this.init();
  }

  /**
   * Initialize tracking system
   */
  init() {
    this.loadStoredData();
    this.startSessionTracking();
    this.setupAutoSave();
    
    // Log system start
    this.logInteraction('system', 'session_start', {
      sessionId: this.sessionId,
      timestamp: this.startTime,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load stored analytics data
   */
  loadStoredData() {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.interactions = data.interactions || [];
        this.workflows = data.workflows || [];
        
        // Cleanup old data to prevent memory issues
        this.cleanupOldData();
      }
    } catch (error) {
      console.warn('Failed to load usage analytics:', error);
      this.interactions = [];
      this.workflows = [];
    }
  }

  /**
   * Save analytics data to localStorage
   */
  saveData() {
    try {
      const data = {
        interactions: this.interactions.slice(-this.config.maxInteractions),
        workflows: this.workflows.slice(-this.config.maxWorkflows),
        lastSaved: Date.now(),
        sessionId: this.sessionId
      };
      
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save usage analytics:', error);
    }
  }

  /**
   * Setup auto-save timer
   */
  setupAutoSave() {
    // Save every 30 seconds
    setInterval(() => {
      this.saveData();
    }, 30000);
    
    // Save on page unload
    window.addEventListener('beforeunload', () => {
      this.saveData();
    });
  }

  /**
   * Cleanup old data to prevent memory issues
   */
  cleanupOldData() {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    // Keep only last week of interactions
    this.interactions = this.interactions.filter(
      interaction => interaction.timestamp > weekAgo
    );
    
    // Keep only last week of workflows
    this.workflows = this.workflows.filter(
      workflow => workflow.startTime > weekAgo
    );
  }

  /**
   * Start tracking session activity
   */
  startSessionTracking() {
    // Track module switches
    this.lastModule = null;
    this.moduleStartTime = Date.now();
  }

  /**
   * Log user interaction
   */
  logInteraction(module, action, context = {}, timeSaved = null) {
    const interaction = {
      id: this.generateInteractionId(),
      sessionId: this.sessionId,
      timestamp: Date.now(),
      module,
      action,
      context: { ...context },
      timeSaved, // How much time this action saved vs manual
      userAgent: navigator.userAgent
    };

    this.interactions.push(interaction);
    
    // Update workflow tracking
    this.updateWorkflowTracking(interaction);
    
    // Update module timing
    this.updateModuleTiming(module);
    
    // Trigger pattern analysis
    this.analyzePatterns();
    
    return interaction.id;
  }

  /**
   * Generate unique interaction ID
   */
  generateInteractionId() {
    return `int_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Update workflow tracking
   */
  updateWorkflowTracking(interaction) {
    const now = Date.now();
    
    // Check if we should start a new workflow
    if (!this.currentWorkflow || 
        (now - this.currentWorkflow.lastActivity) > this.config.workflowTimeout) {
      
      // Finish previous workflow if exists
      if (this.currentWorkflow) {
        this.finishWorkflow();
      }
      
      // Start new workflow
      this.startWorkflow(interaction);
    } else {
      // Add to current workflow
      this.currentWorkflow.interactions.push(interaction.id);
      this.currentWorkflow.lastActivity = now;
      this.currentWorkflow.modules.add(interaction.module);
      this.currentWorkflow.actions.add(interaction.action);
    }
  }

  /**
   * Start new workflow tracking
   */
  startWorkflow(firstInteraction) {
    this.currentWorkflow = {
      id: this.generateWorkflowId(),
      sessionId: this.sessionId,
      startTime: firstInteraction.timestamp,
      lastActivity: firstInteraction.timestamp,
      interactions: [firstInteraction.id],
      modules: new Set([firstInteraction.module]),
      actions: new Set([firstInteraction.action]),
      pattern: null, // Will be determined when workflow finishes
      totalTimeSaved: 0
    };
  }

  /**
   * Finish current workflow
   */
  finishWorkflow() {
    if (!this.currentWorkflow) return;
    
    const workflow = {
      ...this.currentWorkflow,
      endTime: this.currentWorkflow.lastActivity,
      duration: this.currentWorkflow.lastActivity - this.currentWorkflow.startTime,
      modules: Array.from(this.currentWorkflow.modules),
      actions: Array.from(this.currentWorkflow.actions),
      interactionCount: this.currentWorkflow.interactions.length
    };
    
    // Analyze workflow pattern
    workflow.pattern = this.analyzeWorkflowPattern(workflow);
    
    // Calculate total time saved
    workflow.totalTimeSaved = this.calculateWorkflowTimeSaved(workflow);
    
    this.workflows.push(workflow);
    this.currentWorkflow = null;
    
    return workflow;
  }

  /**
   * Generate unique workflow ID
   */
  generateWorkflowId() {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  /**
   * Update module timing
   */
  updateModuleTiming(module) {
    const now = Date.now();
    
    if (this.lastModule && this.lastModule !== module) {
      // Record time spent in previous module
      const timeSpent = now - this.moduleStartTime;
      
      if (!this.moduleTimers.has(this.lastModule)) {
        this.moduleTimers.set(this.lastModule, { totalTime: 0, sessions: 0 });
      }
      
      const timer = this.moduleTimers.get(this.lastModule);
      timer.totalTime += timeSpent;
      timer.sessions += 1;
      timer.avgTime = timer.totalTime / timer.sessions;
    }
    
    this.lastModule = module;
    this.moduleStartTime = now;
  }

  /**
   * Analyze workflow pattern
   */
  analyzeWorkflowPattern(workflow) {
    const { modules, actions, duration, interactionCount } = workflow;
    
    // Determine workflow type
    let type = 'unknown';
    if (modules.length === 1) {
      type = 'single-module';
    } else if (modules.includes('mind-garden') && modules.includes('scriptorium')) {
      type = 'ideation-to-creation';
    } else if (modules.includes('scriptorium') && modules.includes('orchestra')) {
      type = 'creation-to-campaign';
    } else if (modules.length > 2) {
      type = 'multi-module-flow';
    } else {
      type = 'cross-module';
    }
    
    // Calculate complexity
    let complexity = 'simple';
    if (interactionCount > 10 || duration > 600000) { // 10 mins
      complexity = 'complex';
    } else if (interactionCount > 5 || duration > 300000) { // 5 mins
      complexity = 'medium';
    }
    
    // Identify common patterns
    const commonPatterns = this.identifyCommonPatterns(actions);
    
    return {
      type,
      complexity,
      commonPatterns,
      efficiency: this.calculateEfficiency(workflow)
    };
  }

  /**
   * Identify common action patterns
   */
  identifyCommonPatterns(actions) {
    const patterns = [];
    const actionArray = Array.from(actions);
    
    // Import/Export patterns
    if (actionArray.some(a => a.includes('import')) && 
        actionArray.some(a => a.includes('export'))) {
      patterns.push('import-export-flow');
    }
    
    // Creation patterns
    if (actionArray.some(a => a.includes('create')) && 
        actionArray.some(a => a.includes('edit'))) {
      patterns.push('create-edit-cycle');
    }
    
    // AI Command patterns
    if (actionArray.some(a => a.includes('ai-command'))) {
      patterns.push('ai-assisted');
    }
    
    return patterns;
  }

  /**
   * Calculate workflow efficiency
   */
  calculateEfficiency(workflow) {
    const { duration, interactionCount } = workflow;
    
    // Simple efficiency metric: interactions per minute
    const interactionsPerMinute = (interactionCount / (duration / 60000));
    
    // Classify efficiency
    if (interactionsPerMinute > 5) return 'high';
    if (interactionsPerMinute > 2) return 'medium';
    return 'low';
  }

  /**
   * Calculate time saved for workflow
   */
  calculateWorkflowTimeSaved(workflow) {
    return this.interactions
      .filter(int => workflow.interactions.includes(int.id))
      .reduce((total, int) => total + (int.timeSaved || 0), 0);
  }

  /**
   * Analyze usage patterns
   */
  analyzePatterns() {
    // Only analyze every 10 interactions to avoid performance issues
    if (this.interactions.length % 10 !== 0) return;
    
    const patterns = {
      frequentModules: this.getFrequentModules(),
      frequentActions: this.getFrequentActions(),
      peakHours: this.getPeakUsageHours(),
      averageSessionLength: this.getAverageSessionLength(),
      moduleTransitions: this.getModuleTransitions(),
      timeWasters: this.identifyTimeWasters()
    };
    
    return patterns;
  }

  /**
   * Get most frequently used modules
   */
  getFrequentModules() {
    const moduleCounts = {};
    
    this.interactions.forEach(int => {
      moduleCounts[int.module] = (moduleCounts[int.module] || 0) + 1;
    });
    
    return Object.entries(moduleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([module, count]) => ({ module, count }));
  }

  /**
   * Get most frequently used actions
   */
  getFrequentActions() {
    const actionCounts = {};
    
    this.interactions.forEach(int => {
      const key = `${int.module}:${int.action}`;
      actionCounts[key] = (actionCounts[key] || 0) + 1;
    });
    
    return Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }));
  }

  /**
   * Get peak usage hours
   */
  getPeakUsageHours() {
    const hourCounts = new Array(24).fill(0);
    
    this.interactions.forEach(int => {
      const hour = new Date(int.timestamp).getHours();
      hourCounts[hour]++;
    });
    
    return hourCounts.map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Get average session length
   */
  getAverageSessionLength() {
    const sessions = {};
    
    this.interactions.forEach(int => {
      if (!sessions[int.sessionId]) {
        sessions[int.sessionId] = { start: int.timestamp, end: int.timestamp };
      } else {
        sessions[int.sessionId].end = Math.max(sessions[int.sessionId].end, int.timestamp);
      }
    });
    
    const lengths = Object.values(sessions).map(s => s.end - s.start);
    return lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
  }

  /**
   * Get module transition patterns
   */
  getModuleTransitions() {
    const transitions = {};
    
    for (let i = 1; i < this.interactions.length; i++) {
      const from = this.interactions[i - 1].module;
      const to = this.interactions[i].module;
      
      if (from !== to) {
        const key = `${from} → ${to}`;
        transitions[key] = (transitions[key] || 0) + 1;
      }
    }
    
    return Object.entries(transitions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([transition, count]) => ({ transition, count }));
  }

  /**
   * Identify potential time wasters
   */
  identifyTimeWasters() {
    const timeWasters = [];
    
    // Frequent module switching
    const recentInteractions = this.interactions.slice(-50);
    const moduleSwitches = recentInteractions.filter((int, i) => 
      i > 0 && int.module !== recentInteractions[i - 1].module
    );
    
    if (moduleSwitches.length > 10) {
      timeWasters.push({
        type: 'frequent-module-switching',
        severity: 'medium',
        suggestion: 'Consider using cross-module workflows or AI Command Bar'
      });
    }
    
    // Repeated actions
    const actionCounts = {};
    recentInteractions.forEach(int => {
      const key = `${int.module}:${int.action}`;
      actionCounts[key] = (actionCounts[key] || 0) + 1;
    });
    
    Object.entries(actionCounts).forEach(([action, count]) => {
      if (count > 5) {
        timeWasters.push({
          type: 'repeated-action',
          action,
          count,
          severity: 'high',
          suggestion: 'This action could be automated with AI Command Bar'
        });
      }
    });
    
    return timeWasters;
  }

  /**
   * Get comprehensive analytics
   */
  getAnalytics() {
    return {
      session: {
        id: this.sessionId,
        startTime: this.startTime,
        duration: Date.now() - this.startTime,
        interactionCount: this.interactions.filter(i => i.sessionId === this.sessionId).length
      },
      overall: {
        totalInteractions: this.interactions.length,
        totalWorkflows: this.workflows.length,
        totalTimeSaved: this.interactions.reduce((sum, int) => sum + (int.timeSaved || 0), 0),
        averageTimeSaved: this.interactions
          .filter(int => int.timeSaved)
          .reduce((sum, int, _, arr) => sum + int.timeSaved / arr.length, 0)
      },
      patterns: this.analyzePatterns(),
      moduleTimers: Object.fromEntries(this.moduleTimers),
      recentWorkflows: this.workflows.slice(-5),
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Generate usage recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const patterns = this.analyzePatterns();
    
    // Recommend AI Command Bar for frequent actions
    patterns.frequentActions.forEach(({ action, count }) => {
      if (count > 10 && !action.includes('ai-command')) {
        recommendations.push({
          type: 'automation',
          priority: 'high',
          suggestion: `Consider using AI Command Bar for "${action}" (used ${count} times)`,
          action: 'ai-command-bar-usage',
          potentialTimeSaved: count * 30 // Estimate 30 seconds saved per automation
        });
      }
    });
    
    // Recommend workflow optimization
    patterns.moduleTransitions.forEach(({ transition, count }) => {
      if (count > 5) {
        recommendations.push({
          type: 'workflow',
          priority: 'medium',
          suggestion: `Frequent transition "${transition}" could be streamlined`,
          action: 'workflow-optimization',
          potentialTimeSaved: count * 60 // Estimate 1 minute saved per optimization
        });
      }
    });
    
    return recommendations;
  }

  /**
   * Track AI Command Bar usage
   */
  trackAICommand(command, analysis, result, timeSaved = null) {
    return this.logInteraction('ai-command-bar', 'execute-command', {
      command,
      complexity: analysis?.complexity,
      route: analysis?.route,
      confidence: analysis?.confidence,
      success: !!result,
      resultType: result?.type
    }, timeSaved);
  }

  /**
   * Track module navigation
   */
  trackModuleNavigation(fromModule, toModule, method = 'click') {
    return this.logInteraction('navigation', 'module-switch', {
      fromModule,
      toModule,
      method
    });
  }

  /**
   * Track workflow automation
   */
  trackAutomation(automationType, context = {}, timeSaved = null) {
    return this.logInteraction('automation', automationType, context, timeSaved);
  }

  /**
   * Get real-time usage insights
   */
  getInsights() {
    const now = Date.now();
    const lastHour = this.interactions.filter(int => (now - int.timestamp) < 3600000);
    const lastDay = this.interactions.filter(int => (now - int.timestamp) < 86400000);
    
    return {
      productivity: {
        lastHour: lastHour.length,
        lastDay: lastDay.length,
        trend: this.calculateProductivityTrend()
      },
      efficiency: {
        timeSavedToday: lastDay.reduce((sum, int) => sum + (int.timeSaved || 0), 0),
        automationUsage: lastDay.filter(int => int.action.includes('ai-command')).length,
        manualActions: lastDay.filter(int => !int.action.includes('ai-command')).length
      },
      focus: {
        currentModule: this.lastModule,
        moduleSessionTime: now - this.moduleStartTime,
        moduleSwithes: lastHour.filter((int, i) => 
          i > 0 && int.module !== lastHour[i - 1].module
        ).length
      }
    };
  }

  /**
   * Calculate productivity trend
   */
  calculateProductivityTrend() {
    const now = Date.now();
    const hourAgo = now - 3600000;
    const twoHoursAgo = now - 7200000;
    
    const currentHour = this.interactions.filter(int => int.timestamp > hourAgo).length;
    const previousHour = this.interactions.filter(int => 
      int.timestamp > twoHoursAgo && int.timestamp <= hourAgo
    ).length;
    
    if (previousHour === 0) return 'stable';
    
    const change = (currentHour - previousHour) / previousHour;
    
    if (change > 0.2) return 'increasing';
    if (change < -0.2) return 'decreasing';
    return 'stable';
  }

  /**
   * Export analytics data
   */
  exportData() {
    return {
      export_timestamp: Date.now(),
      session_id: this.sessionId,
      analytics: this.getAnalytics(),
      raw_data: {
        interactions: this.interactions,
        workflows: this.workflows,
        module_timers: Object.fromEntries(this.moduleTimers)
      }
    };
  }

  /**
   * Reset analytics data
   */
  reset() {
    this.interactions = [];
    this.workflows = [];
    this.moduleTimers.clear();
    this.currentWorkflow = null;
    this.saveData();
  }
}

// Create global instance
export const usageTracker = new UsageTracker();

// Make available for console debugging
if (typeof window !== 'undefined') {
  window.__usageTracker = usageTracker;
}

export default usageTracker;