/**
 * TaskPreview - AI Command Preview System
 * 
 * Provides transparent preview of what AI commands will do before execution.
 * Essential for building trust and allowing users to understand automation.
 * 
 * Core Features:
 * - Step-by-step workflow preview
 * - Time estimation and impact analysis
 * - Risk assessment and warnings
 * - Customization options before execution
 * - Clear explanation of AI reasoning
 */

class TaskPreview {
  constructor(taskAnalyzer, taskCoordinator) {
    this.taskAnalyzer = taskAnalyzer;
    this.taskCoordinator = taskCoordinator;
    this.previewCache = new Map();
    this.config = {
      maxCacheSize: 100,
      previewTimeoutMs: 10000,
      enableRiskAnalysis: true,
      showTechnicalDetails: false
    };
  }

  /**
   * Generate comprehensive preview for a command
   */
  async generatePreview(command, analysis, context = {}) {
    const cacheKey = this.generateCacheKey(command, analysis, context);
    
    // Check cache first
    if (this.previewCache.has(cacheKey)) {
      const cached = this.previewCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
        return { ...cached.preview, cached: true };
      }
    }

    try {
      const preview = await this.buildPreview(command, analysis, context);
      
      // Cache the preview
      this.previewCache.set(cacheKey, {
        preview,
        timestamp: Date.now()
      });
      
      // Cleanup cache if needed
      this.cleanupCache();
      
      return preview;
    } catch (error) {
      console.error('Failed to generate task preview:', error);
      return this.generateErrorPreview(command, error);
    }
  }

  /**
   * Build detailed preview structure
   */
  async buildPreview(command, analysis, context) {
    const steps = await this.generateExecutionSteps(command, analysis, context);
    const impact = await this.analyzeImpact(steps, context);
    const risks = this.enableRiskAnalysis ? await this.assessRisks(steps, impact) : [];
    const timeline = this.calculateTimeline(steps);
    const customization = this.getCustomizationOptions(steps, analysis);

    return {
      id: this.generatePreviewId(),
      timestamp: Date.now(),
      command,
      analysis,
      
      // Core preview data
      steps,
      impact,
      risks,
      timeline,
      customization,
      
      // User-friendly summary
      summary: this.generateSummary(steps, impact, timeline),
      explanation: this.generateExplanation(analysis, steps),
      
      // Execution metadata
      canExecute: risks.filter(r => r.severity === 'critical').length === 0,
      recommendedAction: this.getRecommendedAction(risks, impact),
      
      // Technical details (for power users)
      technical: this.config.showTechnicalDetails ? this.getTechnicalDetails(analysis, steps) : null
    };
  }

  /**
   * Generate execution steps from analysis
   */
  async generateExecutionSteps(command, analysis, context) {
    const { complexity, route, services } = analysis;
    const steps = [];

    // Step 1: Initialize and prepare
    steps.push({
      id: 'init',
      order: 1,
      title: 'Initialize Task',
      description: 'Prepare systems and validate parameters',
      type: 'preparation',
      duration: 1000,
      module: context.module || 'general',
      details: {
        actions: ['Validate command syntax', 'Check system permissions', 'Load required services'],
        risks: ['low'],
        reversible: true
      }
    });

    // Generate route-specific steps
    if (route === 'claude-connectors') {
      steps.push(...this.generateConnectorSteps(command, services, context));
    } else if (route === 'orchestrator') {
      steps.push(...this.generateOrchestratorSteps(command, services, context));
    } else if (route === 'hybrid') {
      steps.push(...this.generateHybridSteps(command, services, context));
    }

    // Step N: Finalize and cleanup
    steps.push({
      id: 'finalize',
      order: steps.length + 1,
      title: 'Complete Task',
      description: 'Finalize results and update system state',
      type: 'finalization',
      duration: 2000,
      module: context.module || 'general',
      details: {
        actions: ['Save results', 'Update analytics', 'Clean up temporary data'],
        risks: ['low'],
        reversible: false
      }
    });

    return steps;
  }

  /**
   * Generate connector-specific steps
   */
  generateConnectorSteps(command, services, context) {
    const steps = [];
    
    services.forEach((service, index) => {
      steps.push({
        id: `connector_${service.name}_${index}`,
        order: index + 2,
        title: `Connect to ${service.name}`,
        description: `Retrieve data from ${service.name} service`,
        type: 'connector',
        duration: this.estimateConnectorDuration(service),
        module: 'intelligence',
        service: service.name,
        details: {
          actions: [
            `Authenticate with ${service.name}`,
            `Execute ${service.operation || 'read'} operation`,
            'Process and format results'
          ],
          risks: service.name === 'filesystem' ? ['low'] : ['medium'],
          reversible: service.operation === 'read',
          dataAccess: this.getDataAccessDescription(service)
        }
      });
    });

    // Add processing step if multiple services
    if (services.length > 1) {
      steps.push({
        id: 'process_multiple',
        order: services.length + 2,
        title: 'Combine Results',
        description: 'Merge and process data from multiple sources',
        type: 'processing',
        duration: 3000,
        module: 'intelligence',
        details: {
          actions: ['Merge datasets', 'Resolve conflicts', 'Format for target module'],
          risks: ['low'],
          reversible: true
        }
      });
    }

    return steps;
  }

  /**
   * Generate orchestrator-specific steps
   */
  generateOrchestratorSteps(command, services, context) {
    const steps = [];
    
    // Workflow preparation
    steps.push({
      id: 'workflow_prep',
      order: 2,
      title: 'Prepare Workflow',
      description: 'Initialize multi-step automation workflow',
      type: 'orchestration',
      duration: 2000,
      module: 'intelligence',
      details: {
        actions: ['Load workflow template', 'Validate dependencies', 'Prepare execution context'],
        risks: ['medium'],
        reversible: true
      }
    });

    // Multiple service interactions
    services.forEach((service, index) => {
      steps.push({
        id: `orchestrator_${service.name}_${index}`,
        order: index + 3,
        title: `Process ${service.name}`,
        description: `Execute ${service.operation || 'workflow'} in ${service.name}`,
        type: 'orchestration',
        duration: this.estimateOrchestratorDuration(service),
        module: 'intelligence',
        service: service.name,
        details: {
          actions: [
            `Connect to ${service.name}`,
            `Execute workflow step`,
            'Handle errors and retries'
          ],
          risks: ['medium'],
          reversible: false,
          dependencies: index > 0 ? [`orchestrator_${services[index-1].name}_${index-1}`] : []
        }
      });
    });

    // Workflow finalization
    steps.push({
      id: 'workflow_finalize',
      order: services.length + 3,
      title: 'Complete Workflow',
      description: 'Finalize multi-step process and ensure consistency',
      type: 'orchestration',
      duration: 3000,
      module: 'intelligence',
      details: {
        actions: ['Validate all steps completed', 'Ensure data consistency', 'Generate summary'],
        risks: ['low'],
        reversible: false
      }
    });

    return steps;
  }

  /**
   * Generate hybrid workflow steps
   */
  generateHybridSteps(command, services, context) {
    const connectorServices = services.filter(s => s.type === 'connector');
    const orchestratorServices = services.filter(s => s.type === 'orchestrator');
    
    const steps = [];
    
    // Add connector steps first
    if (connectorServices.length > 0) {
      steps.push(...this.generateConnectorSteps(command, connectorServices, context));
    }
    
    // Add orchestrator steps
    if (orchestratorServices.length > 0) {
      steps.push(...this.generateOrchestratorSteps(command, orchestratorServices, context));
    }
    
    // Hybrid integration step
    if (connectorServices.length > 0 && orchestratorServices.length > 0) {
      steps.push({
        id: 'hybrid_integration',
        order: steps.length + 1,
        title: 'Integrate Results',
        description: 'Combine simple operations with complex workflows',
        type: 'integration',
        duration: 2000,
        module: 'intelligence',
        details: {
          actions: ['Merge connector results', 'Feed into orchestrator', 'Validate integration'],
          risks: ['medium'],
          reversible: true
        }
      });
    }
    
    return steps;
  }

  /**
   * Analyze potential impact of execution
   */
  async analyzeImpact(steps, context) {
    const impact = {
      modules: new Set(),
      dataAccess: new Set(),
      externalServices: new Set(),
      fileOperations: [],
      stateChanges: [],
      userVisible: [],
      timeSaved: 0
    };

    steps.forEach(step => {
      // Module impact
      if (step.module) impact.modules.add(step.module);
      
      // Service impact
      if (step.service) impact.externalServices.add(step.service);
      
      // Data access impact
      if (step.details?.dataAccess) {
        impact.dataAccess.add(step.details.dataAccess);
      }
      
      // File operations
      if (step.type === 'connector' && step.service === 'filesystem') {
        impact.fileOperations.push({
          step: step.id,
          operation: step.details?.actions?.[1] || 'read',
          reversible: step.details?.reversible || false
        });
      }
      
      // State changes
      if (!step.details?.reversible) {
        impact.stateChanges.push({
          step: step.id,
          description: step.description,
          module: step.module
        });
      }
      
      // User visible changes
      if (step.type !== 'preparation' && step.module !== 'intelligence') {
        impact.userVisible.push({
          step: step.id,
          module: step.module,
          description: step.description
        });
      }
      
      // Time saved estimation
      impact.timeSaved += this.estimateTimeSaved(step);
    });

    return {
      modules: Array.from(impact.modules),
      dataAccess: Array.from(impact.dataAccess),
      externalServices: Array.from(impact.externalServices),
      fileOperations: impact.fileOperations,
      stateChanges: impact.stateChanges,
      userVisible: impact.userVisible,
      timeSaved: impact.timeSaved,
      scope: this.categorizeScope(impact)
    };
  }

  /**
   * Assess risks associated with execution
   */
  async assessRisks(steps, impact) {
    const risks = [];

    // Data access risks
    if (impact.externalServices.length > 0) {
      risks.push({
        id: 'external_data_access',
        severity: 'medium',
        category: 'privacy',
        description: `Will access data from: ${impact.externalServices.join(', ')}`,
        mitigation: 'All data access follows your configured permissions',
        canProceed: true
      });
    }

    // File operation risks
    if (impact.fileOperations.some(op => !op.reversible)) {
      risks.push({
        id: 'irreversible_file_ops',
        severity: 'high',
        category: 'data_integrity',
        description: 'Some file operations cannot be undone',
        mitigation: 'Review file operations carefully before proceeding',
        canProceed: true
      });
    }

    // State change risks
    if (impact.stateChanges.length > 2) {
      risks.push({
        id: 'multiple_state_changes',
        severity: 'medium',
        category: 'complexity',
        description: `Will make ${impact.stateChanges.length} permanent changes`,
        mitigation: 'Each change will be logged for audit purposes',
        canProceed: true
      });
    }

    // Cross-module risks
    if (impact.modules.length > 2) {
      risks.push({
        id: 'cross_module_complexity',
        severity: 'low',
        category: 'complexity',
        description: `Operations across ${impact.modules.length} modules`,
        mitigation: 'Module isolation ensures safe execution',
        canProceed: true
      });
    }

    // Performance risks
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    if (totalDuration > 30000) { // 30 seconds
      risks.push({
        id: 'long_execution_time',
        severity: 'low',
        category: 'performance',
        description: `Estimated execution time: ${Math.round(totalDuration / 1000)}s`,
        mitigation: 'You can cancel execution at any time',
        canProceed: true
      });
    }

    return risks;
  }

  /**
   * Calculate execution timeline
   */
  calculateTimeline(steps) {
    let currentTime = 0;
    const timeline = [];

    steps.forEach((step, index) => {
      timeline.push({
        stepId: step.id,
        startTime: currentTime,
        duration: step.duration,
        endTime: currentTime + step.duration,
        parallel: step.details?.dependencies ? false : index > 0 ? this.canRunInParallel(step, steps[index - 1]) : false
      });
      
      if (!timeline[timeline.length - 1].parallel) {
        currentTime += step.duration;
      }
    });

    return {
      totalDuration: Math.max(...timeline.map(t => t.endTime)),
      steps: timeline,
      criticalPath: this.calculateCriticalPath(timeline),
      parallelization: timeline.filter(t => t.parallel).length
    };
  }

  /**
   * Get customization options for the user
   */
  getCustomizationOptions(steps, analysis) {
    const options = {
      execution: {
        dryRun: {
          enabled: true,
          description: 'Preview results without making changes',
          impact: 'No permanent changes will be made'
        },
        stepByStep: {
          enabled: steps.length > 3,
          description: 'Execute one step at a time with confirmation',
          impact: 'You can review and approve each step'
        },
        autoRetry: {
          enabled: true,
          description: 'Automatically retry failed operations',
          impact: 'Reduces manual intervention for transient errors'
        }
      },
      
      output: {
        verbose: {
          enabled: true,
          description: 'Show detailed progress information',
          impact: 'More information displayed during execution'
        },
        saveLog: {
          enabled: true,
          description: 'Save execution log for review',
          impact: 'Creates audit trail of all operations'
        }
      },
      
      safety: {
        backupFirst: {
          enabled: steps.some(s => !s.details?.reversible),
          description: 'Create backup before irreversible operations',
          impact: 'Allows rollback if needed'
        },
        confirmRisks: {
          enabled: true,
          description: 'Confirm each high-risk operation',
          impact: 'Additional safety prompts for risky actions'
        }
      }
    };

    return options;
  }

  /**
   * Generate user-friendly summary
   */
  generateSummary(steps, impact, timeline) {
    const actionSteps = steps.filter(s => s.type !== 'preparation' && s.type !== 'finalization');
    const primaryActions = actionSteps.slice(0, 3).map(s => s.title);
    
    let summary = `Will perform ${actionSteps.length} main actions: ${primaryActions.join(', ')}`;
    
    if (actionSteps.length > 3) {
      summary += ` and ${actionSteps.length - 3} more`;
    }
    
    summary += `.`;
    
    if (impact.timeSaved > 0) {
      summary += ` Estimated time saved: ${this.formatDuration(impact.timeSaved)}.`;
    }
    
    if (impact.externalServices.length > 0) {
      summary += ` Uses: ${impact.externalServices.join(', ')}.`;
    }

    return summary;
  }

  /**
   * Generate explanation of AI reasoning
   */
  generateExplanation(analysis, steps) {
    const { complexity, route, reasoning, confidence } = analysis;
    
    let explanation = `I analyzed this as a ${complexity} task with ${Math.round(confidence * 100)}% confidence. `;
    
    explanation += `I chose the ${route} approach because: ${reasoning.slice(0, 2).join(' and ')}.`;
    
    const mainActions = steps.filter(s => s.type !== 'preparation' && s.type !== 'finalization');
    if (mainActions.length > 1) {
      explanation += ` This will involve ${mainActions.length} main steps to ensure the task is completed properly.`;
    }

    return explanation;
  }

  /**
   * Get recommended action based on risks and impact
   */
  getRecommendedAction(risks, impact) {
    const criticalRisks = risks.filter(r => r.severity === 'critical');
    const highRisks = risks.filter(r => r.severity === 'high');
    
    if (criticalRisks.length > 0) {
      return {
        action: 'review_required',
        message: 'Review critical risks before proceeding',
        color: 'red'
      };
    }
    
    if (highRisks.length > 0) {
      return {
        action: 'caution_advised',
        message: 'Proceed with caution - review high-risk operations',
        color: 'yellow'
      };
    }
    
    if (impact.timeSaved > 300000) { // 5+ minutes
      return {
        action: 'highly_recommended',
        message: 'Highly recommended - significant time savings',
        color: 'green'
      };
    }
    
    return {
      action: 'safe_to_proceed',
      message: 'Safe to proceed',
      color: 'blue'
    };
  }

  /**
   * Utility methods
   */
  generateCacheKey(command, analysis, context) {
    return `${command}_${analysis.complexity}_${analysis.route}_${JSON.stringify(context)}`;
  }

  generatePreviewId() {
    return `preview_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  estimateConnectorDuration(service) {
    const baseTimes = {
      'notion': 3000,
      'google-drive': 4000,
      'asana': 3500,
      'filesystem': 1000,
      'airtable': 3000,
      'zapier': 5000
    };
    return baseTimes[service.name] || 3000;
  }

  estimateOrchestratorDuration(service) {
    return this.estimateConnectorDuration(service) * 2; // Orchestrator takes longer
  }

  estimateTimeSaved(step) {
    const manualTimeMappings = {
      'connector': 120000,    // 2 minutes manual
      'orchestration': 300000, // 5 minutes manual
      'processing': 60000,    // 1 minute manual
      'integration': 180000   // 3 minutes manual
    };
    return manualTimeMappings[step.type] || 60000;
  }

  categorizeScope(impact) {
    if (impact.modules.length === 1 && impact.externalServices.length === 0) return 'local';
    if (impact.modules.length <= 2 && impact.externalServices.length <= 1) return 'moderate';
    return 'extensive';
  }

  canRunInParallel(currentStep, previousStep) {
    // Simple heuristic - connector steps can often run in parallel
    return currentStep.type === 'connector' && previousStep.type === 'connector';
  }

  calculateCriticalPath(timeline) {
    // Find longest sequential path
    return timeline.filter(t => !t.parallel).map(t => t.stepId);
  }

  formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }

  getDataAccessDescription(service) {
    const descriptions = {
      'notion': 'Read your Notion pages and databases',
      'google-drive': 'Access your Google Drive files',
      'asana': 'Read your Asana tasks and projects',
      'filesystem': 'Access local files',
      'airtable': 'Read your Airtable records',
      'zapier': 'Trigger your Zapier automations'
    };
    return descriptions[service.name] || `Access ${service.name} data`;
  }

  getTechnicalDetails(analysis, steps) {
    return {
      analysisDetails: analysis,
      executionPlan: {
        stepCount: steps.length,
        parallelizable: steps.filter(s => s.details?.dependencies?.length === 0).length,
        dependencies: steps.filter(s => s.details?.dependencies?.length > 0).map(s => ({
          step: s.id,
          depends_on: s.details.dependencies
        }))
      },
      resourceUsage: {
        networkCalls: steps.filter(s => s.service).length,
        fileOperations: steps.filter(s => s.service === 'filesystem').length,
        stateModifications: steps.filter(s => !s.details?.reversible).length
      }
    };
  }

  generateErrorPreview(command, error) {
    return {
      id: this.generatePreviewId(),
      timestamp: Date.now(),
      command,
      error: true,
      
      summary: 'Unable to generate preview for this command',
      explanation: `Preview generation failed: ${error.message}`,
      
      canExecute: false,
      recommendedAction: {
        action: 'error',
        message: 'Cannot preview this command',
        color: 'red'
      },
      
      steps: [{
        id: 'error',
        title: 'Preview Error',
        description: 'Could not analyze this command',
        type: 'error',
        duration: 0
      }],
      
      risks: [{
        id: 'preview_error',
        severity: 'critical',
        category: 'system',
        description: 'Unable to analyze command safety',
        mitigation: 'Try rephrasing the command or contact support',
        canProceed: false
      }]
    };
  }

  cleanupCache() {
    if (this.previewCache.size > this.config.maxCacheSize) {
      const entries = Array.from(this.previewCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest 20% of entries
      const toRemove = Math.floor(entries.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        this.previewCache.delete(entries[i][0]);
      }
    }
  }

  /**
   * Export preview data for debugging
   */
  exportPreview(preview) {
    return {
      ...preview,
      export_timestamp: Date.now(),
      cache_stats: {
        size: this.previewCache.size,
        hit_rate: this.cacheHitRate || 0
      }
    };
  }
}

export default TaskPreview;