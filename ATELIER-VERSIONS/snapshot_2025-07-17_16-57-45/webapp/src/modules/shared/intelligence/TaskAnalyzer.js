/**
 * TaskAnalyzer - Intelligent task complexity analysis and routing
 * 
 * Analyzes user requests to determine optimal execution path:
 * - Simple tasks → Claude Connectors
 * - Complex tasks → Orchestrator
 * - Hybrid tasks → Claude-first with escalation
 */

import { ModuleLogger } from '../monitoring/ModuleLogger.js';

// Task complexity levels
export const ComplexityLevels = {
  SIMPLE: 'simple',
  MEDIUM: 'medium',
  COMPLEX: 'complex',
  HYBRID: 'hybrid'
};

// Execution routes
export const ExecutionRoutes = {
  CLAUDE_CONNECTORS: 'claude-connectors',
  ORCHESTRATOR: 'orchestrator',
  HYBRID: 'hybrid'
};

// Service types and their weights
export const ServiceTypes = {
  NOTION: { name: 'notion', weight: 1, connector: true },
  GOOGLE_DRIVE: { name: 'google-drive', weight: 1, connector: true },
  ASANA: { name: 'asana', weight: 1, connector: true },
  FILESYSTEM: { name: 'filesystem', weight: 1, connector: true },
  ZAPIER: { name: 'zapier', weight: 2, connector: true },
  AIRTABLE: { name: 'airtable', weight: 1, connector: true },
  SUPABASE: { name: 'supabase', weight: 2, connector: false },
  ATELIER_CANVAS: { name: 'atelier-canvas', weight: 2, connector: false },
  CUSTOM_API: { name: 'custom-api', weight: 3, connector: false },
  DATABASE: { name: 'database', weight: 3, connector: false }
};

// Task patterns that indicate complexity
export const ComplexityPatterns = {
  SIMPLE: [
    /^(show|list|get|find|display).+from.+(notion|drive|asana)/i,
    /^(open|read|view).+file/i,
    /^(create|add).+simple.+(note|task|file)/i,
    /^(search|find).+in.+(notion|drive)/i
  ],
  MEDIUM: [
    /^(analyze|process|transform).+from.+/i,
    /^(export|import).+between.+/i,
    /^(generate|create).+based.+on.+/i,
    /^(sync|update).+across.+/i
  ],
  COMPLEX: [
    /^(when|if).+then.+/i, // Conditional logic
    /^(create|build).+workflow.+/i,
    /^(automate|schedule).+/i,
    /^.+and.+and.+/i, // Multiple operations
    /^(aggregate|combine|merge).+from.+multiple.+/i,
    /^(monitor|track).+continuously.+/i
  ]
};

// Action complexity weights
export const ActionWeights = {
  READ: 1,
  WRITE: 2,
  TRANSFORM: 3,
  AGGREGATE: 4,
  AUTOMATE: 5,
  MONITOR: 6
};

/**
 * TaskAnalyzer - Intelligent task analysis engine
 */
export class TaskAnalyzer {
  constructor() {
    this.logger = ModuleLogger.child({ module: 'task-analyzer' });
    this.analysisHistory = [];
    this.learningData = new Map();
  }

  /**
   * Analyze a user request and determine optimal execution path
   */
  analyzeTask(userRequest, context = {}) {
    const startTime = Date.now();
    
    try {
      // Extract task components
      const analysis = {
        request: userRequest,
        timestamp: Date.now(),
        context,
        
        // Core analysis
        services: this.extractServices(userRequest),
        actions: this.extractActions(userRequest),
        complexity: this.assessComplexity(userRequest),
        
        // Routing decision
        route: null,
        confidence: 0,
        reasoning: [],
        
        // Performance
        analysisTime: 0
      };

      // Determine routing based on analysis
      analysis.route = this.determineRoute(analysis);
      analysis.confidence = this.calculateConfidence(analysis);
      analysis.reasoning = this.generateReasoning(analysis);
      
      analysis.analysisTime = Date.now() - startTime;
      
      // Store for learning
      this.storeAnalysis(analysis);
      
      this.logger.info(`Task analyzed: ${analysis.complexity} → ${analysis.route}`, 'analyzeTask', {
        services: analysis.services.length,
        actions: analysis.actions.length,
        confidence: analysis.confidence,
        analysisTime: analysis.analysisTime
      });
      
      return analysis;
      
    } catch (error) {
      this.logger.error(error, 'analyzeTask', { userRequest });
      return this.createErrorAnalysis(userRequest, error);
    }
  }

  /**
   * Extract services mentioned in the request
   */
  extractServices(request) {
    const services = [];
    const requestLower = request.toLowerCase();
    
    for (const [key, serviceInfo] of Object.entries(ServiceTypes)) {
      const patterns = [
        serviceInfo.name,
        serviceInfo.name.replace('-', ' '),
        serviceInfo.name.replace('-', '')
      ];
      
      for (const pattern of patterns) {
        if (requestLower.includes(pattern)) {
          services.push({
            name: serviceInfo.name,
            type: key,
            weight: serviceInfo.weight,
            hasConnector: serviceInfo.connector
          });
          break;
        }
      }
    }
    
    // Detect implicit services
    if (requestLower.includes('board') || requestLower.includes('canvas')) {
      services.push({
        name: 'atelier-canvas',
        type: 'ATELIER_CANVAS',
        weight: 2,
        hasConnector: false
      });
    }
    
    return services;
  }

  /**
   * Extract actions from the request
   */
  extractActions(request) {
    const actions = [];
    const requestLower = request.toLowerCase();
    
    // Action patterns
    const actionPatterns = {
      READ: [/show|list|get|find|display|view|read|open/i],
      write: [/create|add|insert|save|write|update|modify|edit/i],
      transform: [/convert|transform|change|process|generate|analyze/i],
      aggregate: [/combine|merge|aggregate|collect|gather|summarize/i],
      automate: [/automate|schedule|trigger|when|if.*then/i],
      monitor: [/monitor|track|watch|observe|alert/i]
    };
    
    for (const [actionType, patterns] of Object.entries(actionPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(requestLower)) {
          actions.push({
            type: actionType,
            weight: ActionWeights[actionType.toUpperCase()] || 1
          });
          break;
        }
      }
    }
    
    return actions;
  }

  /**
   * Assess overall task complexity
   */
  assessComplexity(request) {
    // Check against complexity patterns
    for (const [level, patterns] of Object.entries(ComplexityPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(request)) {
          return level.toLowerCase();
        }
      }
    }
    
    // Calculate complexity score
    const services = this.extractServices(request);
    const actions = this.extractActions(request);
    
    const serviceScore = services.reduce((sum, s) => sum + s.weight, 0);
    const actionScore = actions.reduce((sum, a) => sum + a.weight, 0);
    const totalScore = serviceScore + actionScore;
    
    // Complexity thresholds
    if (totalScore <= 3) return ComplexityLevels.SIMPLE;
    if (totalScore <= 6) return ComplexityLevels.MEDIUM;
    return ComplexityLevels.COMPLEX;
  }

  /**
   * Determine optimal execution route
   */
  determineRoute(analysis) {
    const { services, actions, complexity } = analysis;
    
    // Simple tasks with only connector services
    if (complexity === ComplexityLevels.SIMPLE && 
        services.every(s => s.hasConnector) && 
        services.length <= 2) {
      return ExecutionRoutes.CLAUDE_CONNECTORS;
    }
    
    // Complex tasks or non-connector services
    if (complexity === ComplexityLevels.COMPLEX ||
        services.some(s => !s.hasConnector) ||
        services.length > 3) {
      return ExecutionRoutes.ORCHESTRATOR;
    }
    
    // Medium complexity or mixed services
    if (complexity === ComplexityLevels.MEDIUM ||
        (services.some(s => s.hasConnector) && services.some(s => !s.hasConnector))) {
      return ExecutionRoutes.HYBRID;
    }
    
    // Default to Claude connectors for simple cases
    return ExecutionRoutes.CLAUDE_CONNECTORS;
  }

  /**
   * Calculate confidence score for routing decision
   */
  calculateConfidence(analysis) {
    const { services, actions, complexity } = analysis;
    
    let confidence = 0.5; // Base confidence
    
    // Boost confidence for clear patterns
    if (complexity === ComplexityLevels.SIMPLE && services.length <= 2) {
      confidence += 0.3;
    }
    
    if (complexity === ComplexityLevels.COMPLEX || services.length > 3) {
      confidence += 0.3;
    }
    
    // Boost for connector availability
    if (services.every(s => s.hasConnector)) {
      confidence += 0.2;
    }
    
    // Reduce for mixed scenarios
    if (analysis.route === ExecutionRoutes.HYBRID) {
      confidence -= 0.1;
    }
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  /**
   * Generate human-readable reasoning
   */
  generateReasoning(analysis) {
    const { services, actions, complexity, route } = analysis;
    const reasoning = [];
    
    reasoning.push(`Task complexity: ${complexity}`);
    reasoning.push(`Services needed: ${services.length} (${services.map(s => s.name).join(', ')})`);
    reasoning.push(`Actions: ${actions.map(a => a.type).join(', ')}`);
    
    switch (route) {
      case ExecutionRoutes.CLAUDE_CONNECTORS:
        reasoning.push('→ Claude Connectors: Simple task with supported services');
        break;
      case ExecutionRoutes.ORCHESTRATOR:
        reasoning.push('→ Orchestrator: Complex workflow or unsupported services');
        break;
      case ExecutionRoutes.HYBRID:
        reasoning.push('→ Hybrid: Mixed complexity, Claude-first with escalation');
        break;
    }
    
    return reasoning;
  }

  /**
   * Store analysis for learning and improvement
   */
  storeAnalysis(analysis) {
    this.analysisHistory.push(analysis);
    
    // Keep last 100 analyses
    if (this.analysisHistory.length > 100) {
      this.analysisHistory.shift();
    }
    
    // Update learning data
    const key = `${analysis.complexity}-${analysis.route}`;
    const current = this.learningData.get(key) || { count: 0, success: 0 };
    current.count++;
    this.learningData.set(key, current);
  }

  /**
   * Update learning data with execution results
   */
  updateLearning(analysisId, success, executionTime, error = null) {
    const analysis = this.analysisHistory.find(a => a.timestamp === analysisId);
    if (!analysis) return;
    
    const key = `${analysis.complexity}-${analysis.route}`;
    const current = this.learningData.get(key);
    if (current) {
      if (success) current.success++;
      current.avgExecutionTime = (current.avgExecutionTime || 0) * 0.9 + executionTime * 0.1;
    }
    
    this.logger.info(`Learning updated: ${key}`, 'updateLearning', {
      success,
      executionTime,
      error: error?.message
    });
  }

  /**
   * Get analysis statistics
   */
  getStats() {
    const stats = {
      totalAnalyses: this.analysisHistory.length,
      routeDistribution: {},
      complexityDistribution: {},
      averageAnalysisTime: 0,
      learningData: Object.fromEntries(this.learningData)
    };
    
    this.analysisHistory.forEach(analysis => {
      stats.routeDistribution[analysis.route] = (stats.routeDistribution[analysis.route] || 0) + 1;
      stats.complexityDistribution[analysis.complexity] = (stats.complexityDistribution[analysis.complexity] || 0) + 1;
      stats.averageAnalysisTime += analysis.analysisTime;
    });
    
    stats.averageAnalysisTime /= this.analysisHistory.length || 1;
    
    return stats;
  }

  /**
   * Create error analysis response
   */
  createErrorAnalysis(request, error) {
    return {
      request,
      timestamp: Date.now(),
      error: error.message,
      route: ExecutionRoutes.CLAUDE_CONNECTORS, // Safe fallback
      confidence: 0.1,
      reasoning: ['Error in analysis, falling back to Claude Connectors'],
      analysisTime: 0
    };
  }

  /**
   * Test the analyzer with sample requests
   */
  runTests() {
    const testCases = [
      'Show me my Notion pages',
      'Create a new board with files from Google Drive and add tasks to Asana',
      'When a board has more than 10 items, export to PDF and notify on Slack',
      'Analyze all project files and create summary report',
      'Find images in Drive and create thumbnails on canvas'
    ];
    
    return testCases.map(request => this.analyzeTask(request));
  }
}

// Create singleton instance
export const taskAnalyzer = new TaskAnalyzer();

// Make available for console debugging
if (typeof window !== 'undefined') {
  window.__taskAnalyzer = taskAnalyzer;
}

export default taskAnalyzer;