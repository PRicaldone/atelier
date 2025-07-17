/**
 * TaskCoordinator - Intelligent task routing and execution coordination
 * 
 * Orchestrates the entire Claude + Connectors + Orchestrator ecosystem:
 * - Analyzes incoming requests using TaskAnalyzer
 * - Routes to appropriate execution engine
 * - Manages context preservation between systems
 * - Provides unified response handling
 */

import { ModuleLogger } from '../monitoring/ModuleLogger.js';
import { eventBus } from '../events/EventBus.js';
import { taskAnalyzer, ExecutionRoutes } from './TaskAnalyzer.js';
import { claudeConnectorsAdapter } from './ClaudeConnectorsAdapter.js';
import { orchestratorAdapter } from './OrchestratorAdapter.js';
import { contextManager, ContextTypes, ContextScopes } from './ContextManager.js';

// Task execution states
export const TaskStates = {
  PENDING: 'pending',
  ANALYZING: 'analyzing',
  ROUTING: 'routing',
  EXECUTING: 'executing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

// Response types
export const ResponseTypes = {
  IMMEDIATE: 'immediate',
  STREAMING: 'streaming',
  ASYNC: 'async',
  CALLBACK: 'callback'
};

// Task priorities
export const TaskPriorities = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

/**
 * Task - Individual task execution context
 */
export class Task {
  constructor(id, request, options = {}) {
    this.id = id;
    this.request = request;
    this.options = {
      priority: TaskPriorities.MEDIUM,
      timeout: 60000,
      responseType: ResponseTypes.IMMEDIATE,
      context: {},
      ...options
    };
    
    this.state = TaskStates.PENDING;
    this.analysis = null;
    this.route = null;
    this.result = null;
    this.error = null;
    this.startTime = null;
    this.endTime = null;
    this.executionTime = null;
    this.context = new Map();
    
    // Set initial context
    for (const [key, value] of Object.entries(this.options.context)) {
      this.context.set(key, value);
    }
  }

  /**
   * Update task state and emit events
   */
  updateState(newState, data = {}) {
    const previousState = this.state;
    this.state = newState;
    
    eventBus.emit('task-coordinator:state:changed', {
      taskId: this.id,
      previousState,
      newState,
      data
    });
  }

  /**
   * Set context data
   */
  setContext(key, value) {
    this.context.set(key, value);
  }

  /**
   * Get context data
   */
  getContext(key) {
    return this.context.get(key);
  }

  /**
   * Mark task as completed
   */
  complete(result) {
    this.result = result;
    this.endTime = Date.now();
    this.executionTime = this.endTime - this.startTime;
    this.updateState(TaskStates.COMPLETED, { result });
  }

  /**
   * Mark task as failed
   */
  fail(error) {
    this.error = error;
    this.endTime = Date.now();
    this.executionTime = this.endTime - this.startTime;
    this.updateState(TaskStates.FAILED, { error });
  }
}

/**
 * ExecutionResult - Unified result format
 */
export class ExecutionResult {
  constructor(success, data, metadata = {}) {
    this.success = success;
    this.data = data;
    this.metadata = {
      timestamp: Date.now(),
      executionTime: null,
      route: null,
      ...metadata
    };
  }

  /**
   * Create success result
   */
  static success(data, metadata = {}) {
    return new ExecutionResult(true, data, metadata);
  }

  /**
   * Create failure result
   */
  static failure(error, metadata = {}) {
    return new ExecutionResult(false, null, {
      error: error.message || error,
      ...metadata
    });
  }
}

/**
 * TaskCoordinator - Main coordination engine
 */
export class TaskCoordinator {
  constructor() {
    this.logger = ModuleLogger.child({ module: 'task-coordinator' });
    this.tasks = new Map();
    this.taskHistory = [];
    this.executionStats = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageExecutionTime: 0,
      routeDistribution: {}
    };
    
    this.config = {
      maxConcurrentTasks: 10,
      defaultTimeout: 60000,
      historyRetention: 1000
    };
    
    this.initializeEventHandlers();
  }

  /**
   * Initialize event handlers
   */
  initializeEventHandlers() {
    // Listen for task state changes
    eventBus.on('task-coordinator:state:changed', (data) => {
      this.logger.info(`Task ${data.taskId} state changed: ${data.previousState} → ${data.newState}`, 'stateChanged');
    });

    // Listen for connector events
    eventBus.on('claude-connectors:operation:success', (data) => {
      this.logger.info(`Connector operation succeeded: ${data.connectorId}.${data.operation}`, 'connectorSuccess');
    });

    eventBus.on('claude-connectors:operation:error', (data) => {
      this.logger.error(`Connector operation failed: ${data.connectorId}.${data.operation}`, 'connectorError', data);
    });

    // Listen for orchestrator events
    eventBus.on('orchestrator:workflow:completed', (data) => {
      this.logger.info(`Workflow completed: ${data.workflowId}`, 'workflowCompleted');
    });

    eventBus.on('orchestrator:workflow:error', (data) => {
      this.logger.error(`Workflow failed: ${data.workflowId}`, 'workflowError', data);
    });
  }

  /**
   * Execute a task with intelligent routing
   */
  async executeTask(request, options = {}) {
    const taskId = this.generateTaskId();
    const task = new Task(taskId, request, options);
    
    this.tasks.set(taskId, task);
    task.startTime = Date.now();
    
    try {
      // Load existing context if available
      const existingContext = contextManager.getContextsByScope(ContextScopes.SESSION);
      for (const [key, value] of Object.entries(existingContext)) {
        task.setContext(key, value);
      }
      
      // Store initial task context
      contextManager.setContext(
        `task_${taskId}_input`,
        { request, options },
        ContextTypes.USER_INPUT,
        ContextScopes.TASK,
        { source: 'task-coordinator' }
      );
      
      // Phase 1: Analysis
      task.updateState(TaskStates.ANALYZING);
      task.analysis = await taskAnalyzer.analyzeTask(request, options.context);
      
      // Store analysis context
      contextManager.setContext(
        `task_${taskId}_analysis`,
        task.analysis,
        ContextTypes.SYSTEM_STATE,
        ContextScopes.TASK,
        { source: 'task-analyzer' }
      );
      
      this.logger.info(`Task analyzed: ${task.analysis.complexity} → ${task.analysis.route}`, 'executeTask', {
        taskId,
        confidence: task.analysis.confidence,
        services: task.analysis.services?.length || 0
      });

      // Phase 2: Routing
      task.updateState(TaskStates.ROUTING);
      task.route = task.analysis.route;
      
      // Phase 3: Execution
      task.updateState(TaskStates.EXECUTING);
      const result = await this.routeAndExecute(task);
      
      // Phase 4: Completion
      task.complete(result);
      
      // Store result context
      contextManager.setContext(
        `task_${taskId}_result`,
        result,
        ContextTypes.EXECUTION_RESULT,
        ContextScopes.SESSION,
        { 
          source: 'task-coordinator',
          ttl: 3600000 // 1 hour
        }
      );
      
      // Update statistics
      this.updateExecutionStats(task);
      
      // Store in history
      this.storeTaskHistory(task);
      
      // Clean up
      this.tasks.delete(taskId);
      
      this.logger.info(`Task completed successfully`, 'executeTask', {
        taskId,
        route: task.route,
        executionTime: task.executionTime
      });
      
      return ExecutionResult.success(result, {
        taskId,
        route: task.route,
        executionTime: task.executionTime,
        analysis: task.analysis
      });
      
    } catch (error) {
      task.fail(error);
      
      // Store error context
      contextManager.setContext(
        `task_${taskId}_error`,
        { error: error.message, stack: error.stack },
        ContextTypes.EXECUTION_RESULT,
        ContextScopes.TASK,
        { source: 'task-coordinator' }
      );
      
      this.updateExecutionStats(task);
      this.storeTaskHistory(task);
      this.tasks.delete(taskId);
      
      this.logger.error(error, 'executeTask', { taskId, route: task.route });
      
      return ExecutionResult.failure(error, {
        taskId,
        route: task.route,
        executionTime: task.executionTime,
        analysis: task.analysis
      });
    }
  }

  /**
   * Route and execute based on analysis
   */
  async routeAndExecute(task) {
    const { route, analysis } = task;
    
    switch (route) {
      case ExecutionRoutes.CLAUDE_CONNECTORS:
        return await this.executeViaConnectors(task);
        
      case ExecutionRoutes.ORCHESTRATOR:
        return await this.executeViaOrchestrator(task);
        
      case ExecutionRoutes.HYBRID:
        return await this.executeHybrid(task);
        
      default:
        throw new Error(`Unknown execution route: ${route}`);
    }
  }

  /**
   * Execute via Claude Connectors
   */
  async executeViaConnectors(task) {
    const { request, analysis } = task;
    
    // Determine primary service
    const primaryService = analysis.services[0];
    if (!primaryService) {
      throw new Error('No services identified for connector execution');
    }
    
    // Map request to connector operation
    const operation = this.mapRequestToConnectorOperation(request, analysis);
    const params = this.extractConnectorParams(request, analysis);
    
    // Execute via connector
    const result = await claudeConnectorsAdapter.executeOperation(
      primaryService.name,
      operation,
      params
    );
    
    // Post-process result
    return this.postProcessConnectorResult(result, task);
  }

  /**
   * Execute via Orchestrator
   */
  async executeViaOrchestrator(task) {
    const { request, analysis } = task;
    
    // Determine workflow template
    const templateId = this.mapRequestToWorkflowTemplate(request, analysis);
    const context = this.prepareOrchestratorContext(task);
    
    // Create and execute workflow
    const workflow = orchestratorAdapter.createWorkflow(
      templateId,
      `task-${task.id}`,
      context
    );
    
    const result = await orchestratorAdapter.executeWorkflow(workflow);
    
    // Post-process result
    return this.postProcessOrchestratorResult(result, task);
  }

  /**
   * Execute hybrid approach (Claude-first with escalation)
   */
  async executeHybrid(task) {
    const { request, analysis } = task;
    
    try {
      // Try connectors first
      task.setContext('attempt', 'connectors');
      const connectorResult = await this.executeViaConnectors(task);
      
      // If successful, return result
      return connectorResult;
      
    } catch (connectorError) {
      this.logger.warn(`Connector execution failed, escalating to orchestrator`, 'executeHybrid', {
        taskId: task.id,
        error: connectorError.message
      });
      
      // Escalate to orchestrator
      task.setContext('attempt', 'orchestrator');
      task.setContext('connector_error', connectorError.message);
      
      return await this.executeViaOrchestrator(task);
    }
  }

  /**
   * Map request to connector operation
   */
  mapRequestToConnectorOperation(request, analysis) {
    const actions = analysis.actions || [];
    const requestLower = request.toLowerCase();
    
    if (actions.some(a => a.type === 'read') || requestLower.includes('show') || requestLower.includes('get')) {
      return 'read';
    }
    
    if (actions.some(a => a.type === 'write') || requestLower.includes('create') || requestLower.includes('add')) {
      return 'create';
    }
    
    if (requestLower.includes('search') || requestLower.includes('find')) {
      return 'search';
    }
    
    if (requestLower.includes('update') || requestLower.includes('modify')) {
      return 'update';
    }
    
    // Default to read for simple requests
    return 'read';
  }

  /**
   * Extract parameters for connector operations
   */
  extractConnectorParams(request, analysis) {
    const params = {};
    
    // Extract common parameters
    const requestLower = request.toLowerCase();
    
    if (requestLower.includes('limit')) {
      const limitMatch = request.match(/limit\s+(\d+)/i);
      if (limitMatch) {
        params.limit = parseInt(limitMatch[1]);
      }
    }
    
    if (requestLower.includes('search')) {
      const searchMatch = request.match(/search\s+(?:for\s+)?['"](.*?)['"]/i) || 
                           request.match(/search\s+(?:for\s+)?(\w+)/i);
      if (searchMatch) {
        params.query = searchMatch[1];
      }
    }
    
    return params;
  }

  /**
   * Map request to workflow template
   */
  mapRequestToWorkflowTemplate(request, analysis) {
    const requestLower = request.toLowerCase();
    const services = analysis.services || [];
    
    // Multi-service aggregation
    if (services.length > 1 && (requestLower.includes('aggregate') || requestLower.includes('combine'))) {
      return 'multi-service-aggregation';
    }
    
    // Board creation
    if (requestLower.includes('board') || requestLower.includes('canvas')) {
      return 'create-atelier-board';
    }
    
    // File processing
    if (requestLower.includes('file') || requestLower.includes('process')) {
      return 'file-processing-workflow';
    }
    
    // Default to multi-service aggregation for complex requests
    return 'multi-service-aggregation';
  }

  /**
   * Prepare context for orchestrator
   */
  prepareOrchestratorContext(task) {
    const context = {};
    
    // Add task context
    for (const [key, value] of task.context.entries()) {
      context[key] = value;
    }
    
    // Add analysis results
    context.analysis = task.analysis;
    context.request = task.request;
    
    // Add service-specific parameters
    if (task.analysis.services) {
      task.analysis.services.forEach(service => {
        context[`${service.name}_params`] = {
          service: service.name,
          operation: 'read' // Default operation
        };
      });
    }
    
    return context;
  }

  /**
   * Post-process connector results
   */
  postProcessConnectorResult(result, task) {
    // Add metadata
    const processed = {
      source: 'claude-connectors',
      originalResult: result,
      timestamp: Date.now(),
      taskId: task.id
    };
    
    // Format for consistent response
    if (result.files) {
      processed.type = 'files';
      processed.items = result.files;
    } else if (result.pages) {
      processed.type = 'pages';
      processed.items = result.pages;
    } else if (result.tasks) {
      processed.type = 'tasks';
      processed.items = result.tasks;
    } else {
      processed.type = 'generic';
      processed.items = [result];
    }
    
    return processed;
  }

  /**
   * Post-process orchestrator results
   */
  postProcessOrchestratorResult(result, task) {
    return {
      source: 'orchestrator',
      originalResult: result,
      timestamp: Date.now(),
      taskId: task.id,
      workflow: {
        status: result.status,
        steps: result.results?.length || 0,
        executionTime: result.executionTime
      },
      context: result.context
    };
  }

  /**
   * Generate unique task ID
   */
  generateTaskId() {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update execution statistics
   */
  updateExecutionStats(task) {
    this.executionStats.totalTasks++;
    
    if (task.state === TaskStates.COMPLETED) {
      this.executionStats.completedTasks++;
    } else if (task.state === TaskStates.FAILED) {
      this.executionStats.failedTasks++;
    }
    
    // Update average execution time
    if (task.executionTime) {
      const totalTime = this.executionStats.averageExecutionTime * (this.executionStats.totalTasks - 1);
      this.executionStats.averageExecutionTime = (totalTime + task.executionTime) / this.executionStats.totalTasks;
    }
    
    // Update route distribution
    if (task.route) {
      this.executionStats.routeDistribution[task.route] = (this.executionStats.routeDistribution[task.route] || 0) + 1;
    }
  }

  /**
   * Store task in history
   */
  storeTaskHistory(task) {
    const historyEntry = {
      taskId: task.id,
      request: task.request,
      route: task.route,
      state: task.state,
      executionTime: task.executionTime,
      timestamp: Date.now(),
      success: task.state === TaskStates.COMPLETED
    };
    
    this.taskHistory.push(historyEntry);
    
    // Maintain history size
    if (this.taskHistory.length > this.config.historyRetention) {
      this.taskHistory.shift();
    }
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId) {
    const task = this.tasks.get(taskId);
    if (task) {
      return {
        id: task.id,
        state: task.state,
        route: task.route,
        startTime: task.startTime,
        executionTime: task.executionTime,
        analysis: task.analysis
      };
    }
    
    // Check history
    const historyEntry = this.taskHistory.find(h => h.taskId === taskId);
    if (historyEntry) {
      return {
        id: historyEntry.taskId,
        state: historyEntry.state,
        route: historyEntry.route,
        executionTime: historyEntry.executionTime,
        timestamp: historyEntry.timestamp
      };
    }
    
    return null;
  }

  /**
   * Get coordinator statistics
   */
  getStats() {
    return {
      ...this.executionStats,
      activeTasks: this.tasks.size,
      historySize: this.taskHistory.length,
      successRate: this.executionStats.totalTasks > 0 ? 
        this.executionStats.completedTasks / this.executionStats.totalTasks : 0
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    const stats = this.getStats();
    const isHealthy = stats.activeTasks < this.config.maxConcurrentTasks && 
                      stats.successRate > 0.8;
    
    return {
      status: isHealthy ? 'healthy' : 'warning',
      activeTasks: stats.activeTasks,
      successRate: stats.successRate,
      averageExecutionTime: stats.averageExecutionTime
    };
  }

  /**
   * Test the coordinator with sample requests
   */
  async runTests() {
    const testRequests = [
      'Show me my Notion pages',
      'Create a new board with files from Google Drive and add tasks to Asana',
      'Search for images in Drive',
      'Generate a summary report from multiple services'
    ];
    
    const results = [];
    
    for (const request of testRequests) {
      try {
        const result = await this.executeTask(request);
        results.push({ request, success: true, result });
      } catch (error) {
        results.push({ request, success: false, error: error.message });
      }
    }
    
    return results;
  }
}

// Create singleton instance
export const taskCoordinator = new TaskCoordinator();

// Make available for console debugging
if (typeof window !== 'undefined') {
  window.__taskCoordinator = taskCoordinator;
}

export default taskCoordinator;