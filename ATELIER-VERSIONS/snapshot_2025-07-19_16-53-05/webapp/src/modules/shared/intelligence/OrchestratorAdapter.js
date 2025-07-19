/**
 * OrchestratorAdapter - Advanced workflow orchestration
 * 
 * Handles complex multi-step workflows that require:
 * - Multiple service coordination
 * - Context management and state preservation
 * - Advanced automation and business logic
 * - Error handling and rollback capabilities
 */

import { ModuleLogger } from '../monitoring/ModuleLogger.js';
import { eventBus } from '../events/EventBus.js';
import { moduleRegistry } from '../registry/ModuleRegistry.js';

// Workflow execution states
export const WorkflowStates = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  PAUSED: 'paused'
};

// Step execution results
export const StepResults = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  SKIPPED: 'skipped',
  RETRY: 'retry'
};

// Workflow priorities
export const WorkflowPriorities = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Context types for data flow
export const ContextTypes = {
  INPUT: 'input',
  OUTPUT: 'output',
  INTERMEDIATE: 'intermediate',
  SHARED: 'shared'
};

/**
 * WorkflowStep - Individual step in a workflow
 */
export class WorkflowStep {
  constructor(id, name, operation, config = {}) {
    this.id = id;
    this.name = name;
    this.operation = operation;
    this.config = {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      required: true,
      ...config
    };
    this.state = WorkflowStates.PENDING;
    this.result = null;
    this.error = null;
    this.startTime = null;
    this.endTime = null;
    this.attempts = 0;
  }

  /**
   * Execute this step
   */
  async execute(context, orchestrator) {
    this.startTime = Date.now();
    this.state = WorkflowStates.RUNNING;
    this.attempts++;

    try {
      // Execute the operation
      this.result = await this.operation(context, orchestrator);
      this.state = WorkflowStates.COMPLETED;
      this.endTime = Date.now();
      
      return {
        status: StepResults.SUCCESS,
        result: this.result,
        executionTime: this.endTime - this.startTime
      };
      
    } catch (error) {
      this.error = error;
      this.endTime = Date.now();
      
      // Check if we should retry
      if (this.attempts < this.config.retries) {
        this.state = WorkflowStates.PENDING;
        return {
          status: StepResults.RETRY,
          error: error.message,
          attempt: this.attempts
        };
      }
      
      // Final failure
      this.state = WorkflowStates.FAILED;
      return {
        status: StepResults.FAILURE,
        error: error.message,
        executionTime: this.endTime - this.startTime
      };
    }
  }

  /**
   * Reset step for retry
   */
  reset() {
    this.state = WorkflowStates.PENDING;
    this.result = null;
    this.error = null;
    this.startTime = null;
    this.endTime = null;
    this.attempts = 0;
  }
}

/**
 * Workflow - Collection of steps with execution logic
 */
export class Workflow {
  constructor(id, name, steps = [], config = {}) {
    this.id = id;
    this.name = name;
    this.steps = steps;
    this.config = {
      priority: WorkflowPriorities.MEDIUM,
      timeout: 300000, // 5 minutes
      parallel: false,
      stopOnError: true,
      ...config
    };
    this.state = WorkflowStates.PENDING;
    this.context = new Map();
    this.results = [];
    this.startTime = null;
    this.endTime = null;
    this.currentStepIndex = 0;
  }

  /**
   * Add a step to the workflow
   */
  addStep(step) {
    this.steps.push(step);
    return this;
  }

  /**
   * Set context data
   */
  setContext(key, value, type = ContextTypes.SHARED) {
    this.context.set(key, { value, type, timestamp: Date.now() });
    return this;
  }

  /**
   * Get context data
   */
  getContext(key) {
    const item = this.context.get(key);
    return item ? item.value : undefined;
  }

  /**
   * Execute the workflow
   */
  async execute(orchestrator) {
    this.startTime = Date.now();
    this.state = WorkflowStates.RUNNING;
    this.results = [];

    try {
      if (this.config.parallel) {
        return await this.executeParallel(orchestrator);
      } else {
        return await this.executeSequential(orchestrator);
      }
    } catch (error) {
      this.state = WorkflowStates.FAILED;
      this.endTime = Date.now();
      throw error;
    }
  }

  /**
   * Execute steps sequentially
   */
  async executeSequential(orchestrator) {
    for (let i = 0; i < this.steps.length; i++) {
      this.currentStepIndex = i;
      const step = this.steps[i];
      
      let result;
      let retryCount = 0;
      
      do {
        result = await step.execute(this.context, orchestrator);
        
        if (result.status === StepResults.RETRY) {
          retryCount++;
          await this.delay(step.config.retryDelay * retryCount);
        }
        
      } while (result.status === StepResults.RETRY);
      
      this.results.push(result);
      
      // Handle step failure
      if (result.status === StepResults.FAILURE) {
        if (this.config.stopOnError && step.config.required) {
          throw new Error(`Required step ${step.name} failed: ${result.error}`);
        }
      }
      
      // Update context with step result
      if (result.result) {
        this.setContext(`step_${step.id}_result`, result.result, ContextTypes.OUTPUT);
      }
    }
    
    this.state = WorkflowStates.COMPLETED;
    this.endTime = Date.now();
    
    return {
      status: WorkflowStates.COMPLETED,
      results: this.results,
      executionTime: this.endTime - this.startTime,
      context: Object.fromEntries(this.context)
    };
  }

  /**
   * Execute steps in parallel
   */
  async executeParallel(orchestrator) {
    const promises = this.steps.map(async (step, index) => {
      try {
        const result = await step.execute(this.context, orchestrator);
        return { index, result };
      } catch (error) {
        return { index, result: { status: StepResults.FAILURE, error: error.message } };
      }
    });
    
    const results = await Promise.allSettled(promises);
    
    // Process results
    for (const promiseResult of results) {
      if (promiseResult.status === 'fulfilled') {
        const { index, result } = promiseResult.value;
        this.results[index] = result;
        
        // Update context
        if (result.result) {
          this.setContext(`step_${this.steps[index].id}_result`, result.result, ContextTypes.OUTPUT);
        }
      } else {
        // Promise rejected
        const error = promiseResult.reason;
        this.results.push({ status: StepResults.FAILURE, error: error.message });
      }
    }
    
    this.state = WorkflowStates.COMPLETED;
    this.endTime = Date.now();
    
    return {
      status: WorkflowStates.COMPLETED,
      results: this.results,
      executionTime: this.endTime - this.startTime,
      context: Object.fromEntries(this.context)
    };
  }

  /**
   * Pause workflow execution
   */
  pause() {
    this.state = WorkflowStates.PAUSED;
  }

  /**
   * Resume workflow execution
   */
  resume() {
    if (this.state === WorkflowStates.PAUSED) {
      this.state = WorkflowStates.RUNNING;
    }
  }

  /**
   * Cancel workflow execution
   */
  cancel() {
    this.state = WorkflowStates.CANCELLED;
    this.endTime = Date.now();
  }

  /**
   * Utility method for delays
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * OrchestratorAdapter - Main orchestration engine
 */
export class OrchestratorAdapter {
  constructor() {
    this.logger = ModuleLogger.child({ module: 'orchestrator' });
    this.workflows = new Map();
    this.workflowQueue = [];
    this.runningWorkflows = new Map();
    this.workflowHistory = [];
    this.config = {
      maxConcurrentWorkflows: 5,
      defaultTimeout: 300000,
      historyRetention: 1000
    };
    
    this.initializeBuiltInWorkflows();
  }

  /**
   * Initialize built-in workflow templates
   */
  initializeBuiltInWorkflows() {
    // Multi-service data aggregation workflow
    this.registerWorkflowTemplate('multi-service-aggregation', {
      name: 'Multi-Service Data Aggregation',
      steps: [
        {
          id: 'fetch-notion',
          name: 'Fetch Notion Data',
          operation: async (context) => {
            const claudeConnectors = await moduleRegistry.getModule('claude-connectors');
            return await claudeConnectors.executeOperation('notion', 'read', context.get('notion_params')?.value);
          }
        },
        {
          id: 'fetch-drive',
          name: 'Fetch Google Drive Data',
          operation: async (context) => {
            const claudeConnectors = await moduleRegistry.getModule('claude-connectors');
            return await claudeConnectors.executeOperation('google-drive', 'read', context.get('drive_params')?.value);
          }
        },
        {
          id: 'aggregate-data',
          name: 'Aggregate Data',
          operation: async (context) => {
            const notionData = context.get('step_fetch-notion_result');
            const driveData = context.get('step_fetch-drive_result');
            
            return {
              notion: notionData,
              drive: driveData,
              aggregated: true,
              timestamp: Date.now()
            };
          }
        }
      ]
    });

    // Atelier board creation workflow
    this.registerWorkflowTemplate('create-atelier-board', {
      name: 'Create Atelier Board with External Data',
      steps: [
        {
          id: 'create-board',
          name: 'Create Board',
          operation: async (context, orchestrator) => {
            const canvasAdapter = await moduleRegistry.getModule('canvas');
            const boardData = context.get('board_data')?.value;
            
            return await canvasAdapter.createBoard(boardData);
          }
        },
        {
          id: 'add-elements',
          name: 'Add Elements',
          operation: async (context, orchestrator) => {
            const canvasAdapter = await moduleRegistry.getModule('canvas');
            const boardId = context.get('step_create-board_result')?.id;
            const elements = context.get('elements')?.value || [];
            
            const addedElements = [];
            for (const element of elements) {
              const addedElement = await canvasAdapter.addElement(element.type, element.position, element.data);
              addedElements.push(addedElement);
            }
            
            return { boardId, addedElements };
          }
        }
      ]
    });

    // File processing and organization workflow
    this.registerWorkflowTemplate('file-processing-workflow', {
      name: 'File Processing and Organization',
      parallel: true,
      steps: [
        {
          id: 'process-images',
          name: 'Process Images',
          operation: async (context) => {
            const files = context.get('files')?.value || [];
            const imageFiles = files.filter(f => f.type?.startsWith('image/'));
            
            // Simulate image processing
            return {
              processed: imageFiles.length,
              thumbnails: imageFiles.map(f => ({ ...f, thumbnail: `${f.name}_thumb.jpg` }))
            };
          }
        },
        {
          id: 'process-documents',
          name: 'Process Documents',
          operation: async (context) => {
            const files = context.get('files')?.value || [];
            const docFiles = files.filter(f => f.type?.includes('document') || f.name?.endsWith('.pdf'));
            
            // Simulate document processing
            return {
              processed: docFiles.length,
              extracted: docFiles.map(f => ({ ...f, text: `Extracted text from ${f.name}` }))
            };
          }
        }
      ]
    });
  }

  /**
   * Register a workflow template
   */
  registerWorkflowTemplate(id, template) {
    this.workflows.set(id, template);
    this.logger.info(`Workflow template registered: ${id}`, 'registerWorkflowTemplate');
  }

  /**
   * Create a workflow from template
   */
  createWorkflow(templateId, workflowId, context = {}) {
    const template = this.workflows.get(templateId);
    if (!template) {
      throw new Error(`Workflow template not found: ${templateId}`);
    }

    const workflow = new Workflow(workflowId, template.name, [], template.config);
    
    // Add steps from template
    for (const stepTemplate of template.steps) {
      const step = new WorkflowStep(
        stepTemplate.id,
        stepTemplate.name,
        stepTemplate.operation,
        stepTemplate.config
      );
      workflow.addStep(step);
    }
    
    // Set initial context
    for (const [key, value] of Object.entries(context)) {
      workflow.setContext(key, value, ContextTypes.INPUT);
    }
    
    return workflow;
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflow) {
    const startTime = Date.now();
    
    try {
      // Check if we can run more workflows
      if (this.runningWorkflows.size >= this.config.maxConcurrentWorkflows) {
        this.workflowQueue.push(workflow);
        this.logger.info(`Workflow queued: ${workflow.id}`, 'executeWorkflow');
        return { status: 'queued', workflow: workflow.id };
      }

      // Start execution
      this.runningWorkflows.set(workflow.id, workflow);
      
      this.logger.info(`Starting workflow: ${workflow.name}`, 'executeWorkflow', {
        workflowId: workflow.id,
        steps: workflow.steps.length
      });

      // Execute workflow
      const result = await workflow.execute(this);
      
      // Clean up
      this.runningWorkflows.delete(workflow.id);
      
      // Record in history
      this.recordWorkflowExecution(workflow, result, Date.now() - startTime);
      
      // Process queue
      this.processWorkflowQueue();
      
      // Emit completion event
      eventBus.emit('orchestrator:workflow:completed', {
        workflowId: workflow.id,
        result,
        executionTime: Date.now() - startTime
      });
      
      this.logger.info(`Workflow completed: ${workflow.name}`, 'executeWorkflow', {
        workflowId: workflow.id,
        executionTime: Date.now() - startTime,
        status: result.status
      });
      
      return result;
      
    } catch (error) {
      // Clean up on error
      this.runningWorkflows.delete(workflow.id);
      
      // Record failed execution
      this.recordWorkflowExecution(workflow, { error: error.message }, Date.now() - startTime);
      
      // Process queue
      this.processWorkflowQueue();
      
      // Emit error event
      eventBus.emit('orchestrator:workflow:error', {
        workflowId: workflow.id,
        error: error.message,
        executionTime: Date.now() - startTime
      });
      
      this.logger.error(error, 'executeWorkflow', { workflowId: workflow.id });
      throw error;
    }
  }

  /**
   * Process workflow queue
   */
  processWorkflowQueue() {
    while (this.workflowQueue.length > 0 && 
           this.runningWorkflows.size < this.config.maxConcurrentWorkflows) {
      const workflow = this.workflowQueue.shift();
      this.executeWorkflow(workflow);
    }
  }

  /**
   * Record workflow execution in history
   */
  recordWorkflowExecution(workflow, result, executionTime) {
    const record = {
      workflowId: workflow.id,
      workflowName: workflow.name,
      timestamp: Date.now(),
      executionTime,
      result,
      success: !result.error
    };
    
    this.workflowHistory.push(record);
    
    // Maintain history size
    if (this.workflowHistory.length > this.config.historyRetention) {
      this.workflowHistory.shift();
    }
  }

  /**
   * Get workflow status
   */
  getWorkflowStatus(workflowId) {
    const running = this.runningWorkflows.get(workflowId);
    if (running) {
      return {
        status: running.state,
        currentStep: running.currentStepIndex,
        totalSteps: running.steps.length,
        progress: running.currentStepIndex / running.steps.length
      };
    }
    
    const queued = this.workflowQueue.find(w => w.id === workflowId);
    if (queued) {
      return {
        status: 'queued',
        queuePosition: this.workflowQueue.indexOf(queued) + 1
      };
    }
    
    const history = this.workflowHistory.find(h => h.workflowId === workflowId);
    if (history) {
      return {
        status: 'completed',
        result: history.result,
        executionTime: history.executionTime
      };
    }
    
    return null;
  }

  /**
   * Cancel a workflow
   */
  cancelWorkflow(workflowId) {
    const workflow = this.runningWorkflows.get(workflowId);
    if (workflow) {
      workflow.cancel();
      this.runningWorkflows.delete(workflowId);
      this.logger.info(`Workflow cancelled: ${workflowId}`, 'cancelWorkflow');
      return true;
    }
    
    // Remove from queue
    const queueIndex = this.workflowQueue.findIndex(w => w.id === workflowId);
    if (queueIndex !== -1) {
      this.workflowQueue.splice(queueIndex, 1);
      this.logger.info(`Workflow removed from queue: ${workflowId}`, 'cancelWorkflow');
      return true;
    }
    
    return false;
  }

  /**
   * Get orchestrator statistics
   */
  getStats() {
    const stats = {
      runningWorkflows: this.runningWorkflows.size,
      queuedWorkflows: this.workflowQueue.length,
      totalWorkflowsExecuted: this.workflowHistory.length,
      registeredTemplates: this.workflows.size,
      successRate: 0,
      averageExecutionTime: 0
    };
    
    if (this.workflowHistory.length > 0) {
      const successful = this.workflowHistory.filter(h => h.success);
      stats.successRate = successful.length / this.workflowHistory.length;
      stats.averageExecutionTime = this.workflowHistory.reduce((sum, h) => sum + h.executionTime, 0) / this.workflowHistory.length;
    }
    
    return stats;
  }

  /**
   * Health check
   */
  async healthCheck() {
    const stats = this.getStats();
    const isHealthy = stats.runningWorkflows < this.config.maxConcurrentWorkflows && 
                      stats.queuedWorkflows < 10;
    
    return {
      status: isHealthy ? 'healthy' : 'warning',
      runningWorkflows: stats.runningWorkflows,
      queuedWorkflows: stats.queuedWorkflows,
      successRate: stats.successRate
    };
  }

  /**
   * Get available workflow templates
   */
  getAvailableTemplates() {
    return Array.from(this.workflows.entries()).map(([id, template]) => ({
      id,
      name: template.name,
      steps: template.steps.length,
      config: template.config
    }));
  }
}

// Create singleton instance
export const orchestratorAdapter = new OrchestratorAdapter();

// Make available for console debugging
if (typeof window !== 'undefined') {
  window.__orchestratorAdapter = orchestratorAdapter;
}

export default orchestratorAdapter;