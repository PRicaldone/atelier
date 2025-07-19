/**
 * TimeSavedMetrics - ROI Tracking for Creative Workflow Automation
 * 
 * Calculates and tracks time saved through automations, AI commands,
 * and workflow optimizations. Provides KPI metrics to validate
 * architectural investments and guide future development.
 * 
 * Core Philosophy:
 * - Every automation must prove its worth in time saved
 * - Track both individual and cumulative time savings
 * - Provide insights for future optimization priorities
 */

class TimeSavedMetrics {
  constructor(usageTracker, patternRecognition) {
    this.usageTracker = usageTracker;
    this.patternRecognition = patternRecognition;
    this.metrics = new Map();
    this.benchmarks = new Map();
    this.config = {
      // Time estimates for manual actions (in milliseconds)
      manualActionTimes: {
        'create-element': 45000,      // 45 seconds
        'edit-element': 30000,        // 30 seconds
        'navigate-module': 10000,     // 10 seconds
        'export-data': 60000,         // 1 minute
        'import-data': 90000,         // 1.5 minutes
        'search-file': 30000,         // 30 seconds
        'copy-paste': 15000,          // 15 seconds
        'format-content': 120000,     // 2 minutes
        'organize-board': 180000,     // 3 minutes
        'create-campaign': 900000,    // 15 minutes
        'generate-report': 600000,    // 10 minutes
        'mind-map-creation': 300000,  // 5 minutes
        'cross-module-transfer': 120000 // 2 minutes
      },
      // AI automation time savings
      aiCommandSavings: {
        'simple': 0.7,    // 70% time reduction
        'medium': 0.6,    // 60% time reduction
        'complex': 0.5    // 50% time reduction
      },
      // Workflow optimization savings
      workflowOptimizations: {
        'eliminate-context-switch': 30000,  // 30 seconds per elimination
        'reduce-friction': 15000,           // 15 seconds per friction point
        'automate-repetitive': 0.8,         // 80% time reduction
        'smart-defaults': 10000             // 10 seconds per smart default
      }
    };
    
    this.init();
  }

  /**
   * Initialize metrics system
   */
  init() {
    this.loadStoredMetrics();
    this.setupPeriodicCalculation();
    this.createBaselines();
  }

  /**
   * Load stored metrics from localStorage
   */
  loadStoredMetrics() {
    try {
      const stored = localStorage.getItem('ATELIER_TIME_SAVED_METRICS');
      if (stored) {
        const data = JSON.parse(stored);
        this.metrics = new Map(data.metrics || []);
        this.benchmarks = new Map(data.benchmarks || []);
      }
    } catch (error) {
      console.warn('Failed to load time saved metrics:', error);
    }
  }

  /**
   * Save metrics to localStorage
   */
  saveMetrics() {
    try {
      const data = {
        metrics: Array.from(this.metrics.entries()),
        benchmarks: Array.from(this.benchmarks.entries()),
        lastCalculated: Date.now()
      };
      localStorage.setItem('ATELIER_TIME_SAVED_METRICS', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save time saved metrics:', error);
    }
  }

  /**
   * Setup periodic metric calculation
   */
  setupPeriodicCalculation() {
    // Recalculate metrics every 10 minutes
    setInterval(() => {
      this.calculateAllMetrics();
    }, 600000);
  }

  /**
   * Create baseline measurements for manual workflows
   */
  createBaselines() {
    // Establish baseline times for common workflows without automation
    const baselines = {
      'mind-garden-to-scriptorium': {
        manualTime: 300000, // 5 minutes manual
        steps: ['export-data', 'navigate-module', 'import-data', 'format-content'],
        description: 'Manual export from Mind Garden to Scriptorium'
      },
      'scriptorium-to-orchestra': {
        manualTime: 480000, // 8 minutes manual
        steps: ['export-data', 'navigate-module', 'create-campaign', 'organize-board'],
        description: 'Manual campaign creation from Scriptorium content'
      },
      'notion-import': {
        manualTime: 240000, // 4 minutes manual
        steps: ['navigate-external', 'copy-paste', 'format-content', 'organize-board'],
        description: 'Manual import from Notion'
      },
      'report-generation': {
        manualTime: 900000, // 15 minutes manual
        steps: ['collect-data', 'format-content', 'generate-report', 'export-data'],
        description: 'Manual report generation'
      },
      'multi-module-workflow': {
        manualTime: 600000, // 10 minutes manual
        steps: ['navigate-module', 'export-data', 'navigate-module', 'import-data', 'format-content'],
        description: 'Generic multi-module workflow'
      }
    };

    Object.entries(baselines).forEach(([key, baseline]) => {
      this.benchmarks.set(key, {
        ...baseline,
        createdAt: Date.now(),
        category: 'baseline'
      });
    });
  }

  /**
   * Calculate time saved for AI command
   */
  calculateAICommandTimeSaved(command, analysis, execution) {
    const complexity = analysis?.complexity || 'medium';
    const route = analysis?.route || 'claude-connectors';
    
    // Estimate manual time based on command type
    const manualTime = this.estimateManualTime(command, complexity);
    
    // Calculate AI execution time
    const aiTime = execution?.duration || this.estimateAITime(complexity, route);
    
    // Apply complexity-based savings multiplier
    const savingsMultiplier = this.config.aiCommandSavings[complexity] || 0.6;
    const potentialSavings = manualTime * savingsMultiplier;
    const actualTimeSaved = Math.max(0, manualTime - aiTime);
    
    const metric = {
      id: this.generateMetricId(),
      timestamp: Date.now(),
      type: 'ai-command',
      command,
      complexity,
      route,
      manualTime,
      aiTime,
      actualTimeSaved,
      potentialSavings,
      efficiency: actualTimeSaved / manualTime,
      context: {
        confidence: analysis?.confidence,
        services: analysis?.services?.map(s => s.name) || []
      }
    };
    
    this.recordMetric(metric);
    return metric;
  }

  /**
   * Estimate manual time for a command
   */
  estimateManualTime(command, complexity) {
    const cmd = command.toLowerCase();
    
    // Pattern matching for common commands
    if (cmd.includes('import') && cmd.includes('notion')) {
      return this.benchmarks.get('notion-import')?.manualTime || 240000;
    }
    
    if (cmd.includes('export') && cmd.includes('mind') && cmd.includes('scriptorium')) {
      return this.benchmarks.get('mind-garden-to-scriptorium')?.manualTime || 300000;
    }
    
    if (cmd.includes('campaign') || cmd.includes('orchestra')) {
      return this.benchmarks.get('scriptorium-to-orchestra')?.manualTime || 480000;
    }
    
    if (cmd.includes('report') || cmd.includes('generate')) {
      return this.benchmarks.get('report-generation')?.manualTime || 900000;
    }
    
    // Fallback to complexity-based estimation
    const complexityMultipliers = {
      'simple': 1,
      'medium': 2,
      'complex': 3
    };
    
    return 120000 * (complexityMultipliers[complexity] || 2); // Base 2 minutes
  }

  /**
   * Estimate AI execution time
   */
  estimateAITime(complexity, route) {
    const baseTimes = {
      'claude-connectors': {
        'simple': 5000,   // 5 seconds
        'medium': 15000,  // 15 seconds
        'complex': 30000  // 30 seconds
      },
      'orchestrator': {
        'simple': 10000,  // 10 seconds
        'medium': 30000,  // 30 seconds
        'complex': 60000  // 1 minute
      },
      'hybrid': {
        'simple': 8000,   // 8 seconds
        'medium': 25000,  // 25 seconds
        'complex': 45000  // 45 seconds
      }
    };
    
    return baseTimes[route]?.[complexity] || 20000; // Default 20 seconds
  }

  /**
   * Calculate time saved for workflow automation
   */
  calculateWorkflowTimeSaved(workflowType, automationType, context = {}) {
    const baseline = this.benchmarks.get(workflowType);
    if (!baseline) {
      console.warn(`No baseline found for workflow: ${workflowType}`);
      return null;
    }
    
    const manualTime = baseline.manualTime;
    let timeSaved = 0;
    
    switch (automationType) {
      case 'full-automation':
        timeSaved = manualTime * 0.9; // 90% time reduction
        break;
      case 'partial-automation':
        timeSaved = manualTime * 0.6; // 60% time reduction
        break;
      case 'assisted-workflow':
        timeSaved = manualTime * 0.4; // 40% time reduction
        break;
      case 'optimization':
        timeSaved = manualTime * 0.2; // 20% time reduction
        break;
      default:
        timeSaved = 0;
    }
    
    const metric = {
      id: this.generateMetricId(),
      timestamp: Date.now(),
      type: 'workflow-automation',
      workflowType,
      automationType,
      manualTime,
      timeSaved,
      efficiency: timeSaved / manualTime,
      context
    };
    
    this.recordMetric(metric);
    return metric;
  }

  /**
   * Calculate time saved from friction reduction
   */
  calculateFrictionReduction(frictionType, frequency, context = {}) {
    const frictionSavings = this.config.workflowOptimizations[frictionType] || 15000;
    const totalTimeSaved = frictionSavings * frequency;
    
    const metric = {
      id: this.generateMetricId(),
      timestamp: Date.now(),
      type: 'friction-reduction',
      frictionType,
      frequency,
      timeSavedPerInstance: frictionSavings,
      totalTimeSaved,
      context
    };
    
    this.recordMetric(metric);
    return metric;
  }

  /**
   * Calculate time saved from smart defaults and optimizations
   */
  calculateOptimizationTimeSaved(optimizationType, impact, context = {}) {
    let timeSaved = 0;
    
    switch (optimizationType) {
      case 'smart-defaults':
        timeSaved = this.config.workflowOptimizations['smart-defaults'] * impact;
        break;
      case 'context-preservation':
        timeSaved = 30000 * impact; // 30 seconds per context switch avoided
        break;
      case 'predictive-actions':
        timeSaved = 20000 * impact; // 20 seconds per predicted action
        break;
      case 'unified-interface':
        timeSaved = 45000 * impact; // 45 seconds per unified action
        break;
      default:
        timeSaved = 10000 * impact; // Default 10 seconds per optimization
    }
    
    const metric = {
      id: this.generateMetricId(),
      timestamp: Date.now(),
      type: 'optimization',
      optimizationType,
      impact,
      timeSaved,
      context
    };
    
    this.recordMetric(metric);
    return metric;
  }

  /**
   * Record metric in database
   */
  recordMetric(metric) {
    this.metrics.set(metric.id, metric);
    
    // Cleanup old metrics to prevent memory issues
    this.cleanupOldMetrics();
    
    // Trigger recalculation of aggregated metrics
    this.updateAggregatedMetrics();
  }

  /**
   * Generate metric ID
   */
  generateMetricId() {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Cleanup old metrics (keep last 30 days)
   */
  cleanupOldMetrics() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    for (const [id, metric] of this.metrics) {
      if (metric.timestamp < thirtyDaysAgo) {
        this.metrics.delete(id);
      }
    }
  }

  /**
   * Update aggregated metrics
   */
  updateAggregatedMetrics() {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    const allMetrics = Array.from(this.metrics.values());
    
    const aggregated = {
      id: 'aggregated_metrics',
      timestamp: now,
      type: 'aggregated',
      daily: this.calculatePeriodMetrics(allMetrics, oneDayAgo),
      weekly: this.calculatePeriodMetrics(allMetrics, oneWeekAgo),
      monthly: this.calculatePeriodMetrics(allMetrics, oneMonthAgo),
      allTime: this.calculatePeriodMetrics(allMetrics, 0)
    };
    
    this.metrics.set('aggregated_metrics', aggregated);
  }

  /**
   * Calculate metrics for a specific time period
   */
  calculatePeriodMetrics(allMetrics, startTime) {
    const periodMetrics = allMetrics.filter(m => m.timestamp >= startTime);
    
    const totalTimeSaved = periodMetrics.reduce((sum, m) => {
      return sum + (m.timeSaved || m.actualTimeSaved || m.totalTimeSaved || 0);
    }, 0);
    
    const byType = {};
    const byCategory = {};
    
    periodMetrics.forEach(metric => {
      // Group by type
      if (!byType[metric.type]) {
        byType[metric.type] = { count: 0, timeSaved: 0 };
      }
      byType[metric.type].count++;
      byType[metric.type].timeSaved += (metric.timeSaved || metric.actualTimeSaved || metric.totalTimeSaved || 0);
      
      // Group by category for AI commands
      if (metric.type === 'ai-command' && metric.complexity) {
        if (!byCategory[metric.complexity]) {
          byCategory[metric.complexity] = { count: 0, timeSaved: 0 };
        }
        byCategory[metric.complexity].count++;
        byCategory[metric.complexity].timeSaved += (metric.actualTimeSaved || 0);
      }
    });
    
    return {
      totalTimeSaved,
      totalInteractions: periodMetrics.length,
      averageTimeSaved: periodMetrics.length > 0 ? totalTimeSaved / periodMetrics.length : 0,
      byType,
      byCategory,
      topSavings: this.getTopTimeSavings(periodMetrics),
      efficiency: this.calculateOverallEfficiency(periodMetrics)
    };
  }

  /**
   * Get top time savings for period
   */
  getTopTimeSavings(periodMetrics) {
    return periodMetrics
      .sort((a, b) => {
        const aTime = a.timeSaved || a.actualTimeSaved || a.totalTimeSaved || 0;
        const bTime = b.timeSaved || b.actualTimeSaved || b.totalTimeSaved || 0;
        return bTime - aTime;
      })
      .slice(0, 5)
      .map(metric => ({
        type: metric.type,
        description: this.getMetricDescription(metric),
        timeSaved: metric.timeSaved || metric.actualTimeSaved || metric.totalTimeSaved || 0,
        timestamp: metric.timestamp
      }));
  }

  /**
   * Get human-readable description for metric
   */
  getMetricDescription(metric) {
    switch (metric.type) {
      case 'ai-command':
        return `AI Command: "${metric.command?.slice(0, 50) || 'Unknown command'}..."`;
      case 'workflow-automation':
        return `Workflow: ${metric.workflowType} (${metric.automationType})`;
      case 'friction-reduction':
        return `Friction Reduction: ${metric.frictionType} (${metric.frequency}x)`;
      case 'optimization':
        return `Optimization: ${metric.optimizationType}`;
      default:
        return `${metric.type}: Unknown`;
    }
  }

  /**
   * Calculate overall efficiency for period
   */
  calculateOverallEfficiency(periodMetrics) {
    const efficiencyMetrics = periodMetrics.filter(m => m.efficiency !== undefined);
    if (efficiencyMetrics.length === 0) return 0;
    
    return efficiencyMetrics.reduce((sum, m) => sum + m.efficiency, 0) / efficiencyMetrics.length;
  }

  /**
   * Calculate all metrics
   */
  calculateAllMetrics() {
    this.updateAggregatedMetrics();
    this.calculateROIMetrics();
    this.saveMetrics();
  }

  /**
   * Calculate ROI metrics
   */
  calculateROIMetrics() {
    const aggregated = this.metrics.get('aggregated_metrics');
    if (!aggregated) return;
    
    // Estimate development time investment (hours)
    const developmentHours = {
      'ai-command-bar': 40,
      'intelligence-system': 80,
      'pattern-recognition': 60,
      'workflow-automation': 100,
      'usage-tracking': 30
    };
    
    const totalDevHours = Object.values(developmentHours).reduce((sum, hours) => sum + hours, 0);
    const devTimeInMs = totalDevHours * 3600000; // Convert to milliseconds
    
    const monthlyTimeSaved = aggregated.monthly.totalTimeSaved;
    const yearlyTimeSaved = monthlyTimeSaved * 12;
    
    const roi = {
      id: 'roi_metrics',
      timestamp: Date.now(),
      development: {
        totalHours: totalDevHours,
        totalTimeMs: devTimeInMs,
        breakdown: developmentHours
      },
      returns: {
        monthlyTimeSaved,
        yearlyTimeSaved,
        monthsToBreakEven: devTimeInMs / monthlyTimeSaved,
        roi12Months: (yearlyTimeSaved - devTimeInMs) / devTimeInMs
      },
      projections: this.calculateProjections(monthlyTimeSaved, devTimeInMs)
    };
    
    this.metrics.set('roi_metrics', roi);
  }

  /**
   * Calculate future projections
   */
  calculateProjections(monthlyTimeSaved, devTimeInMs) {
    const growthRate = 1.1; // Assume 10% monthly growth in efficiency
    const projections = [];
    
    let cumulativeTimeSaved = 0;
    let monthlyGains = monthlyTimeSaved;
    
    for (let month = 1; month <= 24; month++) {
      cumulativeTimeSaved += monthlyGains;
      monthlyGains *= growthRate;
      
      projections.push({
        month,
        monthlyTimeSaved: monthlyGains,
        cumulativeTimeSaved,
        netGain: cumulativeTimeSaved - devTimeInMs,
        roi: (cumulativeTimeSaved - devTimeInMs) / devTimeInMs
      });
    }
    
    return projections;
  }

  /**
   * Get comprehensive time saved report
   */
  getTimeSavedReport() {
    const aggregated = this.metrics.get('aggregated_metrics');
    const roi = this.metrics.get('roi_metrics');
    
    return {
      summary: {
        totalTimeSavedAllTime: aggregated?.allTime.totalTimeSaved || 0,
        totalTimeSavedThisMonth: aggregated?.monthly.totalTimeSaved || 0,
        totalTimeSavedThisWeek: aggregated?.weekly.totalTimeSaved || 0,
        totalTimeSavedToday: aggregated?.daily.totalTimeSaved || 0,
        averageTimeSavedPerAction: aggregated?.allTime.averageTimeSaved || 0
      },
      efficiency: {
        overallEfficiency: aggregated?.allTime.efficiency || 0,
        monthlyEfficiency: aggregated?.monthly.efficiency || 0,
        weeklyEfficiency: aggregated?.weekly.efficiency || 0,
        dailyEfficiency: aggregated?.daily.efficiency || 0
      },
      breakdown: {
        byType: aggregated?.allTime.byType || {},
        byComplexity: aggregated?.allTime.byCategory || {},
        topSavings: aggregated?.allTime.topSavings || []
      },
      roi: roi?.returns || {},
      projections: roi?.projections?.slice(0, 12) || [], // Next 12 months
      insights: this.generateInsights()
    };
  }

  /**
   * Generate actionable insights
   */
  generateInsights() {
    const aggregated = this.metrics.get('aggregated_metrics');
    if (!aggregated) return [];
    
    const insights = [];
    const monthly = aggregated.monthly;
    
    // High-impact automations
    if (monthly.byType['ai-command']?.timeSaved > 3600000) { // > 1 hour
      insights.push({
        type: 'success',
        title: 'AI Commands Highly Effective',
        description: `AI Commands saved ${Math.round(monthly.byType['ai-command'].timeSaved / 60000)} minutes this month`,
        action: 'Continue expanding AI Command capabilities'
      });
    }
    
    // Workflow optimization opportunities
    if (monthly.byType['friction-reduction']?.count < 5) {
      insights.push({
        type: 'opportunity',
        title: 'Friction Reduction Potential',
        description: 'Low friction reduction activity detected',
        action: 'Analyze user workflows for friction points'
      });
    }
    
    // ROI achievement
    const roi = this.metrics.get('roi_metrics');
    if (roi && roi.returns.monthsToBreakEven < 12) {
      insights.push({
        type: 'success',
        title: 'Positive ROI Achieved',
        description: `Break-even in ${Math.round(roi.returns.monthsToBreakEven)} months`,
        action: 'Continue current automation strategy'
      });
    }
    
    // Usage patterns
    if (monthly.totalInteractions > 100) {
      insights.push({
        type: 'info',
        title: 'High Usage Detected',
        description: `${monthly.totalInteractions} time-saving actions this month`,
        action: 'Consider additional automation opportunities'
      });
    }
    
    return insights;
  }

  /**
   * Get automation suggestions based on metrics
   */
  getAutomationSuggestions() {
    const patterns = this.patternRecognition?.getAutomationOpportunities() || [];
    const metrics = this.getTimeSavedReport();
    
    return patterns.map(pattern => ({
      ...pattern,
      projectedTimeSaved: this.projectTimeSavings(pattern),
      currentEfficiency: metrics.efficiency.overallEfficiency,
      recommendation: this.generateRecommendation(pattern, metrics)
    }));
  }

  /**
   * Project time savings for a pattern
   */
  projectTimeSavings(pattern) {
    const baseTimeSaved = pattern.timeSavedPotential || 0;
    const frequency = pattern.frequency || 1;
    
    return {
      monthly: baseTimeSaved * frequency * 4,
      yearly: baseTimeSaved * frequency * 52,
      perUse: baseTimeSaved
    };
  }

  /**
   * Generate recommendation for pattern
   */
  generateRecommendation(pattern, metrics) {
    const roi = pattern.implementation?.roi;
    const timeSaved = this.projectTimeSavings(pattern);
    
    if (roi?.priority === 'high' && timeSaved.monthly > 600000) { // > 10 minutes/month
      return {
        priority: 'high',
        action: 'Implement immediately',
        reasoning: 'High ROI and significant time savings potential'
      };
    } else if (timeSaved.monthly > 300000) { // > 5 minutes/month
      return {
        priority: 'medium',
        action: 'Consider for next sprint',
        reasoning: 'Moderate time savings with good frequency'
      };
    } else {
      return {
        priority: 'low',
        action: 'Monitor for increased usage',
        reasoning: 'Low current impact, may grow with usage'
      };
    }
  }

  /**
   * Export all metrics data
   */
  exportMetrics() {
    return {
      export_timestamp: Date.now(),
      metrics: Array.from(this.metrics.entries()),
      benchmarks: Array.from(this.benchmarks.entries()),
      report: this.getTimeSavedReport(),
      suggestions: this.getAutomationSuggestions()
    };
  }

  /**
   * Get real-time efficiency insights
   */
  getRealTimeInsights() {
    const now = Date.now();
    const lastHour = Array.from(this.metrics.values())
      .filter(m => (now - m.timestamp) < 3600000);
    
    const hourlyTimeSaved = lastHour.reduce((sum, m) => {
      return sum + (m.timeSaved || m.actualTimeSaved || m.totalTimeSaved || 0);
    }, 0);
    
    return {
      currentHourTimeSaved: hourlyTimeSaved,
      actionsPerHour: lastHour.length,
      averageTimeSavedPerAction: lastHour.length > 0 ? hourlyTimeSaved / lastHour.length : 0,
      trend: this.calculateHourlyTrend(),
      productivity: hourlyTimeSaved > 300000 ? 'high' : hourlyTimeSaved > 120000 ? 'medium' : 'low'
    };
  }

  /**
   * Calculate hourly trend
   */
  calculateHourlyTrend() {
    const now = Date.now();
    const currentHour = Array.from(this.metrics.values())
      .filter(m => (now - m.timestamp) < 3600000);
    const previousHour = Array.from(this.metrics.values())
      .filter(m => (now - m.timestamp) >= 3600000 && (now - m.timestamp) < 7200000);
    
    const currentSavings = currentHour.reduce((sum, m) => sum + (m.timeSaved || m.actualTimeSaved || m.totalTimeSaved || 0), 0);
    const previousSavings = previousHour.reduce((sum, m) => sum + (m.timeSaved || m.actualTimeSaved || m.totalTimeSaved || 0), 0);
    
    if (previousSavings === 0) return 'stable';
    
    const change = (currentSavings - previousSavings) / previousSavings;
    
    if (change > 0.2) return 'increasing';
    if (change < -0.2) return 'decreasing';
    return 'stable';
  }
}

export default TimeSavedMetrics;