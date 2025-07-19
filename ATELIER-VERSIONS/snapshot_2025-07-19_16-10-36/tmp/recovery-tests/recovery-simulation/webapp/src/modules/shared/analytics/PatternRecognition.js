/**
 * PatternRecognition - Advanced Workflow Pattern Analysis
 * 
 * Analyzes user behavior patterns to identify the "5 perfect workflows"
 * that should be automated for maximum time saving.
 * 
 * Features:
 * - Machine learning-inspired pattern detection
 * - Workflow similarity clustering
 * - Automation opportunity scoring
 * - Creative workflow templates generation
 */

class PatternRecognition {
  constructor(usageTracker) {
    this.usageTracker = usageTracker;
    this.patterns = new Map();
    this.templates = new Map();
    this.config = {
      minWorkflowLength: 3, // Minimum interactions to consider as workflow
      similarityThreshold: 0.7, // How similar workflows need to be to cluster
      frequencyThreshold: 3, // Minimum occurrences to consider as pattern
      maxPatterns: 20, // Maximum patterns to track
      analysisInterval: 300000 // 5 minutes between pattern analysis
    };
    
    this.init();
  }

  /**
   * Initialize pattern recognition
   */
  init() {
    this.loadStoredPatterns();
    this.setupPeriodicAnalysis();
  }

  /**
   * Load stored patterns from localStorage
   */
  loadStoredPatterns() {
    try {
      const stored = localStorage.getItem('ATELIER_WORKFLOW_PATTERNS');
      if (stored) {
        const data = JSON.parse(stored);
        this.patterns = new Map(data.patterns || []);
        this.templates = new Map(data.templates || []);
      }
    } catch (error) {
      console.warn('Failed to load workflow patterns:', error);
    }
  }

  /**
   * Save patterns to localStorage
   */
  savePatterns() {
    try {
      const data = {
        patterns: Array.from(this.patterns.entries()),
        templates: Array.from(this.templates.entries()),
        lastAnalysis: Date.now()
      };
      localStorage.setItem('ATELIER_WORKFLOW_PATTERNS', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save workflow patterns:', error);
    }
  }

  /**
   * Setup periodic pattern analysis
   */
  setupPeriodicAnalysis() {
    setInterval(() => {
      this.analyzeWorkflowPatterns();
    }, this.config.analysisInterval);
  }

  /**
   * Analyze all workflow patterns
   */
  analyzeWorkflowPatterns() {
    const analytics = this.usageTracker.getAnalytics();
    const workflows = analytics.raw_data?.workflows || [];
    
    if (workflows.length < 3) return; // Need at least 3 workflows to analyze
    
    // Extract workflow sequences
    const sequences = this.extractWorkflowSequences(workflows);
    
    // Find similar workflow clusters
    const clusters = this.clusterSimilarWorkflows(sequences);
    
    // Generate patterns from clusters
    const newPatterns = this.generatePatternsFromClusters(clusters);
    
    // Update pattern database
    this.updatePatterns(newPatterns);
    
    // Generate automation templates
    this.generateAutomationTemplates();
    
    // Save updated patterns
    this.savePatterns();
    
    return {
      clustersFound: clusters.length,
      patternsGenerated: newPatterns.length,
      automationOpportunities: this.getAutomationOpportunities()
    };
  }

  /**
   * Extract workflow sequences from completed workflows
   */
  extractWorkflowSequences(workflows) {
    return workflows
      .filter(wf => wf.interactionCount >= this.config.minWorkflowLength)
      .map(workflow => ({
        id: workflow.id,
        sequence: this.createActionSequence(workflow),
        metadata: {
          duration: workflow.duration,
          modules: workflow.modules,
          pattern: workflow.pattern,
          timeSaved: workflow.totalTimeSaved,
          efficiency: workflow.pattern?.efficiency
        }
      }));
  }

  /**
   * Create action sequence from workflow
   */
  createActionSequence(workflow) {
    const interactions = this.usageTracker.interactions.filter(
      int => workflow.interactions.includes(int.id)
    );
    
    return interactions
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(int => ({
        module: int.module,
        action: int.action,
        context: int.context,
        timeSaved: int.timeSaved
      }));
  }

  /**
   * Cluster similar workflows using sequence similarity
   */
  clusterSimilarWorkflows(sequences) {
    const clusters = [];
    const processed = new Set();
    
    sequences.forEach((seq1, i) => {
      if (processed.has(seq1.id)) return;
      
      const cluster = {
        id: this.generateClusterId(),
        centroid: seq1,
        members: [seq1],
        similarity: 1.0,
        frequency: 1
      };
      
      // Find similar sequences
      sequences.slice(i + 1).forEach(seq2 => {
        if (processed.has(seq2.id)) return;
        
        const similarity = this.calculateSequenceSimilarity(seq1.sequence, seq2.sequence);
        
        if (similarity >= this.config.similarityThreshold) {
          cluster.members.push(seq2);
          cluster.frequency++;
          processed.add(seq2.id);
        }
      });
      
      processed.add(seq1.id);
      
      // Only keep clusters with multiple members or high value
      if (cluster.frequency >= this.config.frequencyThreshold || 
          cluster.centroid.metadata.timeSaved > 300) { // 5+ minutes saved
        clusters.push(cluster);
      }
    });
    
    return clusters.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Calculate similarity between two action sequences
   */
  calculateSequenceSimilarity(seq1, seq2) {
    // Sequence similarity based on:
    // 1. Module overlap
    // 2. Action pattern similarity
    // 3. Temporal pattern similarity
    
    const modules1 = new Set(seq1.map(s => s.module));
    const modules2 = new Set(seq2.map(s => s.module));
    const moduleOverlap = this.setIntersection(modules1, modules2).size / 
                         Math.max(modules1.size, modules2.size);
    
    const actions1 = seq1.map(s => `${s.module}:${s.action}`);
    const actions2 = seq2.map(s => `${s.module}:${s.action}`);
    const actionSimilarity = this.calculateActionSimilarity(actions1, actions2);
    
    const structureSimilarity = this.calculateStructureSimilarity(seq1, seq2);
    
    // Weighted average
    return (moduleOverlap * 0.4) + (actionSimilarity * 0.4) + (structureSimilarity * 0.2);
  }

  /**
   * Calculate action sequence similarity using Levenshtein distance
   */
  calculateActionSimilarity(actions1, actions2) {
    const distance = this.levenshteinDistance(actions1, actions2);
    const maxLength = Math.max(actions1.length, actions2.length);
    return 1 - (distance / maxLength);
  }

  /**
   * Calculate structural similarity (timing, flow patterns)
   */
  calculateStructureSimilarity(seq1, seq2) {
    // Simple structure similarity based on sequence length ratio
    const lengthRatio = Math.min(seq1.length, seq2.length) / 
                       Math.max(seq1.length, seq2.length);
    
    // Could be extended with more sophisticated structure analysis
    return lengthRatio;
  }

  /**
   * Levenshtein distance for sequence comparison
   */
  levenshteinDistance(arr1, arr2) {
    const matrix = Array(arr2.length + 1).fill(null).map(() => 
      Array(arr1.length + 1).fill(null)
    );
    
    for (let i = 0; i <= arr1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= arr2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= arr2.length; j++) {
      for (let i = 1; i <= arr1.length; i++) {
        const indicator = arr1[i - 1] === arr2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[arr2.length][arr1.length];
  }

  /**
   * Set intersection utility
   */
  setIntersection(set1, set2) {
    return new Set([...set1].filter(x => set2.has(x)));
  }

  /**
   * Generate cluster ID
   */
  generateClusterId() {
    return `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Generate patterns from workflow clusters
   */
  generatePatternsFromClusters(clusters) {
    return clusters.map(cluster => {
      const pattern = this.analyzeClusterPattern(cluster);
      
      return {
        id: this.generatePatternId(),
        name: pattern.name,
        description: pattern.description,
        frequency: cluster.frequency,
        averageTimeSaved: this.calculateAverageTimeSaved(cluster),
        confidence: this.calculatePatternConfidence(cluster),
        template: this.generateWorkflowTemplate(cluster),
        automationPotential: this.calculateAutomationPotential(cluster),
        createdAt: Date.now(),
        lastSeen: Date.now()
      };
    });
  }

  /**
   * Analyze cluster to identify pattern characteristics
   */
  analyzeClusterPattern(cluster) {
    const centroid = cluster.centroid.sequence;
    const modules = [...new Set(centroid.map(s => s.module))];
    const primaryActions = this.extractPrimaryActions(centroid);
    
    // Generate pattern name and description
    let name = 'Unknown Pattern';
    let description = 'Unclassified workflow pattern';
    
    if (modules.includes('mind-garden') && modules.includes('scriptorium')) {
      name = 'Ideation to Creation';
      description = 'Generate ideas in Mind Garden, then create visual content in Scriptorium';
    } else if (modules.includes('scriptorium') && modules.includes('orchestra')) {
      name = 'Creation to Campaign';
      description = 'Create content in Scriptorium, then launch campaigns in Orchestra';
    } else if (modules.length === 1) {
      name = `${modules[0]} Deep Work`;
      description = `Focused work session in ${modules[0]}`;
    } else if (modules.length > 2) {
      name = 'Multi-Module Workflow';
      description = `Complex workflow spanning ${modules.join(', ')}`;
    } else {
      name = `${modules[0]} to ${modules[1]}`;
      description = `Transfer workflow from ${modules[0]} to ${modules[1]}`;
    }
    
    return { name, description, modules, primaryActions };
  }

  /**
   * Extract primary actions from sequence
   */
  extractPrimaryActions(sequence) {
    const actionCounts = {};
    sequence.forEach(step => {
      const action = step.action;
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    });
    
    return Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([action]) => action);
  }

  /**
   * Calculate average time saved for cluster
   */
  calculateAverageTimeSaved(cluster) {
    const totalTimeSaved = cluster.members.reduce(
      (sum, member) => sum + (member.metadata.timeSaved || 0), 0
    );
    return totalTimeSaved / cluster.members.length;
  }

  /**
   * Calculate pattern confidence score
   */
  calculatePatternConfidence(cluster) {
    // Confidence based on frequency and consistency
    const frequencyScore = Math.min(cluster.frequency / 10, 1); // Max at 10 occurrences
    const consistencyScore = cluster.similarity;
    
    return (frequencyScore * 0.6) + (consistencyScore * 0.4);
  }

  /**
   * Generate automation potential score
   */
  calculateAutomationPotential(cluster) {
    const avgTimeSaved = this.calculateAverageTimeSaved(cluster);
    const frequency = cluster.frequency;
    const consistency = cluster.similarity;
    
    // High potential = frequent, time-saving, consistent patterns
    const timeScore = Math.min(avgTimeSaved / 300, 1); // Max at 5 minutes
    const frequencyScore = Math.min(frequency / 10, 1);
    const consistencyScore = consistency;
    
    return (timeScore * 0.4) + (frequencyScore * 0.3) + (consistencyScore * 0.3);
  }

  /**
   * Generate workflow template for automation
   */
  generateWorkflowTemplate(cluster) {
    const centroid = cluster.centroid.sequence;
    
    return {
      steps: centroid.map((step, index) => ({
        order: index + 1,
        module: step.module,
        action: step.action,
        parameters: this.extractActionParameters(step),
        estimatedTime: this.estimateStepTime(step),
        automatable: this.isStepAutomatable(step)
      })),
      estimatedTotalTime: this.estimateWorkflowTime(centroid),
      automationComplexity: this.calculateAutomationComplexity(centroid)
    };
  }

  /**
   * Extract action parameters for automation
   */
  extractActionParameters(step) {
    // Extract reusable parameters from step context
    const params = {};
    
    if (step.context) {
      // Common automation parameters
      if (step.context.elementType) params.elementType = step.context.elementType;
      if (step.context.position) params.position = step.context.position;
      if (step.context.title) params.title = step.context.title;
      if (step.context.content) params.content = step.context.content;
    }
    
    return params;
  }

  /**
   * Estimate time for individual step
   */
  estimateStepTime(step) {
    // Base estimates for common actions
    const timeEstimates = {
      'create': 60000, // 1 minute
      'edit': 30000,   // 30 seconds
      'export': 15000, // 15 seconds
      'import': 20000, // 20 seconds
      'navigate': 5000, // 5 seconds
      'ai-command': 10000 // 10 seconds
    };
    
    const actionType = Object.keys(timeEstimates).find(type => 
      step.action.toLowerCase().includes(type)
    );
    
    return timeEstimates[actionType] || 30000; // Default 30 seconds
  }

  /**
   * Estimate total workflow time
   */
  estimateWorkflowTime(sequence) {
    return sequence.reduce((total, step) => total + this.estimateStepTime(step), 0);
  }

  /**
   * Check if step can be automated
   */
  isStepAutomatable(step) {
    // Steps that typically can be automated
    const automatableActions = [
      'import', 'export', 'create-element', 'add-node', 
      'ai-command', 'navigation', 'save', 'load'
    ];
    
    return automatableActions.some(action => 
      step.action.toLowerCase().includes(action)
    );
  }

  /**
   * Calculate automation complexity
   */
  calculateAutomationComplexity(sequence) {
    const automatableSteps = sequence.filter(step => this.isStepAutomatable(step));
    const automationRatio = automatableSteps.length / sequence.length;
    
    if (automationRatio > 0.8) return 'low';
    if (automationRatio > 0.5) return 'medium';
    return 'high';
  }

  /**
   * Generate pattern ID
   */
  generatePatternId() {
    return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Update pattern database
   */
  updatePatterns(newPatterns) {
    newPatterns.forEach(pattern => {
      // Check if similar pattern already exists
      const existingPattern = this.findSimilarPattern(pattern);
      
      if (existingPattern) {
        // Update existing pattern
        existingPattern.frequency += pattern.frequency;
        existingPattern.lastSeen = pattern.createdAt;
        existingPattern.confidence = Math.max(existingPattern.confidence, pattern.confidence);
      } else {
        // Add new pattern
        this.patterns.set(pattern.id, pattern);
      }
    });
    
    // Remove low-confidence patterns if we have too many
    this.prunePatterns();
  }

  /**
   * Find similar existing pattern
   */
  findSimilarPattern(newPattern) {
    for (const [id, existingPattern] of this.patterns) {
      if (this.arePatternsimilar(existingPattern, newPattern)) {
        return existingPattern;
      }
    }
    return null;
  }

  /**
   * Check if two patterns are similar
   */
  arePatternsimilar(pattern1, pattern2) {
    // Simple similarity check based on name and modules
    return pattern1.name === pattern2.name || 
           this.calculateSetSimilarity(
             new Set(pattern1.template.steps.map(s => s.module)),
             new Set(pattern2.template.steps.map(s => s.module))
           ) > 0.8;
  }

  /**
   * Calculate set similarity
   */
  calculateSetSimilarity(set1, set2) {
    const intersection = this.setIntersection(set1, set2);
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  /**
   * Prune low-confidence patterns
   */
  prunePatterns() {
    if (this.patterns.size <= this.config.maxPatterns) return;
    
    const sortedPatterns = Array.from(this.patterns.entries())
      .sort((a, b) => b[1].confidence - a[1].confidence);
    
    // Keep only top patterns
    this.patterns.clear();
    sortedPatterns.slice(0, this.config.maxPatterns).forEach(([id, pattern]) => {
      this.patterns.set(id, pattern);
    });
  }

  /**
   * Generate automation templates
   */
  generateAutomationTemplates() {
    const topPatterns = Array.from(this.patterns.values())
      .filter(pattern => pattern.automationPotential > 0.6)
      .sort((a, b) => b.automationPotential - a.automationPotential)
      .slice(0, 5); // Top 5 automation candidates
    
    topPatterns.forEach(pattern => {
      const template = this.createAutomationTemplate(pattern);
      this.templates.set(pattern.id, template);
    });
  }

  /**
   * Create automation template
   */
  createAutomationTemplate(pattern) {
    return {
      id: pattern.id,
      name: `Auto-${pattern.name}`,
      description: `Automated version of ${pattern.description}`,
      trigger: this.generateTriggerConditions(pattern),
      workflow: this.generateAutomationWorkflow(pattern),
      estimatedTimeSaved: pattern.averageTimeSaved,
      complexity: pattern.template.automationComplexity,
      aiCommands: this.generateAICommands(pattern),
      createdAt: Date.now()
    };
  }

  /**
   * Generate trigger conditions for automation
   */
  generateTriggerConditions(pattern) {
    const firstStep = pattern.template.steps[0];
    
    return {
      module: firstStep.module,
      action: firstStep.action,
      conditions: {
        frequency: `Used ${pattern.frequency} times`,
        confidence: `${Math.round(pattern.confidence * 100)}% pattern match`
      }
    };
  }

  /**
   * Generate automation workflow
   */
  generateAutomationWorkflow(pattern) {
    return pattern.template.steps
      .filter(step => step.automatable)
      .map(step => ({
        action: step.action,
        module: step.module,
        parameters: step.parameters,
        aiCommand: this.generateStepAICommand(step)
      }));
  }

  /**
   * Generate AI commands for pattern
   */
  generateAICommands(pattern) {
    const commands = [];
    
    // Generate command for the entire workflow
    const workflowCommand = this.generateWorkflowAICommand(pattern);
    if (workflowCommand) commands.push(workflowCommand);
    
    // Generate commands for individual steps
    pattern.template.steps.forEach(step => {
      const stepCommand = this.generateStepAICommand(step);
      if (stepCommand) commands.push(stepCommand);
    });
    
    return commands;
  }

  /**
   * Generate AI command for entire workflow
   */
  generateWorkflowAICommand(pattern) {
    const modules = [...new Set(pattern.template.steps.map(s => s.module))];
    
    if (modules.includes('mind-garden') && modules.includes('scriptorium')) {
      return 'Transform my ideas from Mind Garden into visual content in Scriptorium';
    } else if (modules.includes('scriptorium') && modules.includes('orchestra')) {
      return 'Take my Scriptorium content and create a campaign in Orchestra';
    } else {
      return `Execute my ${pattern.name.toLowerCase()} workflow`;
    }
  }

  /**
   * Generate AI command for individual step
   */
  generateStepAICommand(step) {
    const commandTemplates = {
      'create': `Create ${step.parameters.elementType || 'element'} in ${step.module}`,
      'export': `Export content from ${step.module}`,
      'import': `Import data into ${step.module}`,
      'navigate': `Navigate to ${step.module}`,
      'ai-command': step.parameters.command || 'Execute AI command'
    };
    
    const actionType = Object.keys(commandTemplates).find(type => 
      step.action.toLowerCase().includes(type)
    );
    
    return commandTemplates[actionType];
  }

  /**
   * Get top workflow patterns
   */
  getTopPatterns(limit = 5) {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.automationPotential - a.automationPotential)
      .slice(0, limit);
  }

  /**
   * Get automation opportunities
   */
  getAutomationOpportunities() {
    const patterns = this.getTopPatterns(10);
    
    return patterns.map(pattern => ({
      id: pattern.id,
      name: pattern.name,
      description: pattern.description,
      frequency: pattern.frequency,
      timeSavedPotential: pattern.averageTimeSaved * pattern.frequency,
      automationPotential: pattern.automationPotential,
      aiCommands: this.templates.get(pattern.id)?.aiCommands || [],
      implementation: {
        complexity: pattern.template.automationComplexity,
        estimatedEffort: this.estimateImplementationEffort(pattern),
        roi: this.calculateROI(pattern)
      }
    }));
  }

  /**
   * Estimate implementation effort
   */
  estimateImplementationEffort(pattern) {
    const complexity = pattern.template.automationComplexity;
    const stepCount = pattern.template.steps.length;
    
    const baseHours = {
      'low': 2,
      'medium': 8,
      'high': 20
    };
    
    return baseHours[complexity] + (stepCount * 0.5);
  }

  /**
   * Calculate ROI for automation
   */
  calculateROI(pattern) {
    const timeSavedPerMonth = pattern.averageTimeSaved * pattern.frequency * 4; // 4 weeks
    const implementationTime = this.estimateImplementationEffort(pattern) * 3600000; // hours to ms
    
    const monthsToBreakEven = implementationTime / timeSavedPerMonth;
    
    return {
      monthsToBreakEven: Math.round(monthsToBreakEven * 10) / 10,
      yearlyTimeSaved: timeSavedPerMonth * 12,
      priority: monthsToBreakEven < 2 ? 'high' : monthsToBreakEven < 6 ? 'medium' : 'low'
    };
  }

  /**
   * Get pattern insights
   */
  getInsights() {
    const patterns = Array.from(this.patterns.values());
    
    return {
      totalPatterns: patterns.length,
      averageConfidence: patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length,
      highPotentialPatterns: patterns.filter(p => p.automationPotential > 0.7).length,
      totalTimeSavingPotential: patterns.reduce((sum, p) => sum + (p.averageTimeSaved * p.frequency), 0),
      topModules: this.getTopModulesByPatterns(),
      recommendedAutomations: this.getAutomationOpportunities().slice(0, 3)
    };
  }

  /**
   * Get top modules by pattern frequency
   */
  getTopModulesByPatterns() {
    const moduleCounts = {};
    
    Array.from(this.patterns.values()).forEach(pattern => {
      pattern.template.steps.forEach(step => {
        moduleCounts[step.module] = (moduleCounts[step.module] || 0) + 1;
      });
    });
    
    return Object.entries(moduleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([module, count]) => ({ module, count }));
  }

  /**
   * Export pattern data
   */
  exportPatterns() {
    return {
      export_timestamp: Date.now(),
      patterns: Array.from(this.patterns.entries()),
      templates: Array.from(this.templates.entries()),
      insights: this.getInsights(),
      automationOpportunities: this.getAutomationOpportunities()
    };
  }
}

export default PatternRecognition;