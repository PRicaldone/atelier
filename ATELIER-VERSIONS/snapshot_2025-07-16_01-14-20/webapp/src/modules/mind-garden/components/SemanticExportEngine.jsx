/**
 * Mind Garden v5.1 - Semantic Export Engine
 * Day 6: Intelligent conversation → Canvas transformation
 */

import { BRANCH_TYPES, CONVERSATION_FOCUS } from '../types/conversationTypes';

export class SemanticExportEngine {
  constructor() {
    this.exportTemplates = this.initializeExportTemplates();
    this.canvasElementTypes = this.initializeCanvasElementTypes();
    this.semanticRules = this.initializeSemanticRules();
    this.layoutStrategies = this.initializeLayoutStrategies();
  }

  /**
   * Initialize export templates for different use cases
   */
  initializeExportTemplates() {
    return {
      PROJECT_BOARD: {
        name: 'Project Board',
        description: 'Organize conversation into structured project boards',
        canvasLayout: 'board-focused',
        groupingStrategy: 'semantic-clustering',
        includeMetadata: true,
        preserveFlow: true
      },
      
      IDEATION_MAP: {
        name: 'Ideation Map',
        description: 'Visual map of ideas and connections',
        canvasLayout: 'network-layout',
        groupingStrategy: 'topic-based',
        includeMetadata: false,
        preserveFlow: true
      },
      
      ACTION_PLAN: {
        name: 'Action Plan',
        description: 'Implementation-focused task structure',
        canvasLayout: 'timeline-layout',
        groupingStrategy: 'branch-based',
        includeMetadata: true,
        preserveFlow: false,
        filterBranches: [BRANCH_TYPES.IMPLEMENTATION]
      },
      
      RESEARCH_NOTES: {
        name: 'Research Notes',
        description: 'Structured research documentation',
        canvasLayout: 'document-layout',
        groupingStrategy: 'topic-clustering',
        includeMetadata: true,
        preserveFlow: false
      },
      
      PRESENTATION_FLOW: {
        name: 'Presentation Flow',
        description: 'Linear presentation structure',
        canvasLayout: 'linear-layout',
        groupingStrategy: 'conversation-flow',
        includeMetadata: false,
        preserveFlow: true
      },
      
      KNOWLEDGE_BASE: {
        name: 'Knowledge Base',
        description: 'Comprehensive knowledge structure',
        canvasLayout: 'hierarchical-layout',
        groupingStrategy: 'semantic-hierarchy',
        includeMetadata: true,
        preserveFlow: false
      }
    };
  }

  /**
   * Initialize Canvas element types mapping
   */
  initializeCanvasElementTypes() {
    return {
      CONVERSATION_ROOT: {
        canvasType: 'board',
        styling: {
          backgroundColor: '#f3f4f6',
          borderColor: '#d1d5db',
          headerColor: '#374151'
        }
      },
      
      MAIN_IDEA: {
        canvasType: 'note',
        styling: {
          backgroundColor: '#dbeafe',
          borderColor: '#3b82f6',
          textColor: '#1e40af'
        }
      },
      
      IMPLEMENTATION_ITEM: {
        canvasType: 'note',
        styling: {
          backgroundColor: '#d1fae5',
          borderColor: '#10b981',
          textColor: '#047857'
        }
      },
      
      CRITIQUE_POINT: {
        canvasType: 'note',
        styling: {
          backgroundColor: '#fef2f2',
          borderColor: '#ef4444',
          textColor: '#dc2626'
        }
      },
      
      REFINEMENT_NOTE: {
        canvasType: 'note',
        styling: {
          backgroundColor: '#f3e8ff',
          borderColor: '#8b5cf6',
          textColor: '#7c3aed'
        }
      },
      
      TOPIC_CLUSTER: {
        canvasType: 'board',
        styling: {
          backgroundColor: '#f9fafb',
          borderColor: '#6b7280',
          headerColor: '#374151'
        }
      },
      
      REFERENCE_LINK: {
        canvasType: 'link',
        styling: {
          backgroundColor: '#fff7ed',
          borderColor: '#f97316',
          textColor: '#ea580c'
        }
      },
      
      AI_INSIGHT: {
        canvasType: 'note',
        styling: {
          backgroundColor: '#f0f9ff',
          borderColor: '#0ea5e9',
          textColor: '#0284c7'
        }
      }
    };
  }

  /**
   * Initialize semantic transformation rules
   */
  initializeSemanticRules() {
    return {
      // Node classification rules
      nodeClassification: {
        isRootNode: (node) => !node.data.context?.parentChain?.length,
        isMainIdea: (node) => this.calculateImportanceScore(node) > 0.7,
        isImplementationItem: (node) => node.data.context?.branch === BRANCH_TYPES.IMPLEMENTATION,
        isCritiquePoint: (node) => node.data.context?.branch === BRANCH_TYPES.CRITIQUE,
        isRefinementNote: (node) => node.data.context?.branch === BRANCH_TYPES.REFINEMENT,
        isAIInsight: (node) => node.data.aiGenerated || node.data.aiResponse?.length > 100
      },
      
      // Grouping rules
      groupingRules: {
        semanticSimilarity: (node1, node2) => this.calculateSemanticSimilarity(node1, node2),
        topicClustering: (nodes) => this.clusterByTopics(nodes),
        conversationFlow: (nodes) => this.groupByConversationFlow(nodes),
        branchTypeGrouping: (nodes) => this.groupByBranchType(nodes)
      },
      
      // Layout rules
      layoutRules: {
        hierarchicalDepth: (node) => node.data.context?.depth || 0,
        spatialProximity: (node1, node2) => this.calculateSpatialProximity(node1, node2),
        temporalOrder: (nodes) => this.sortByTimestamp(nodes),
        importanceRanking: (nodes) => this.rankByImportance(nodes)
      }
    };
  }

  /**
   * Initialize layout strategies
   */
  initializeLayoutStrategies() {
    return {
      'board-focused': {
        name: 'Board-Focused Layout',
        description: 'Groups content into logical boards',
        algorithm: this.boardFocusedLayout.bind(this),
        spacing: { board: 400, note: 200 }
      },
      
      'network-layout': {
        name: 'Network Layout', 
        description: 'Preserves conversation connections',
        algorithm: this.networkLayout.bind(this),
        spacing: { node: 250, cluster: 300 }
      },
      
      'timeline-layout': {
        name: 'Timeline Layout',
        description: 'Linear temporal arrangement',
        algorithm: this.timelineLayout.bind(this),
        spacing: { step: 300, parallel: 200 }
      },
      
      'document-layout': {
        name: 'Document Layout',
        description: 'Structured document-like arrangement',
        algorithm: this.documentLayout.bind(this),
        spacing: { section: 250, item: 150 }
      },
      
      'hierarchical-layout': {
        name: 'Hierarchical Layout',
        description: 'Tree-like knowledge structure',
        algorithm: this.hierarchicalLayout.bind(this),
        spacing: { level: 200, sibling: 180 }
      }
    };
  }

  /**
   * Main export method - converts conversation to Canvas structure
   */
  async exportConversationToCanvas(conversationNodes, exportOptions = {}) {
    const {
      template = 'PROJECT_BOARD',
      customization = {},
      includeMetadata = true,
      preserveConnections = true,
      exportFormat = 'canvas'
    } = exportOptions;

    console.log('🔄 Starting semantic export:', { 
      nodeCount: conversationNodes.length, 
      template, 
      customization 
    });

    try {
      // 1. Analyze conversation for export readiness
      const analysis = await this.analyzeConversationForExport(conversationNodes);
      
      // 2. Apply semantic transformations
      const semanticStructure = await this.buildSemanticStructure(conversationNodes, analysis);
      
      // 3. Group related nodes intelligently
      const groupedStructure = await this.applySmartGrouping(semanticStructure, template);
      
      // 4. Generate Canvas elements
      const canvasElements = await this.generateCanvasElements(groupedStructure, template, customization);
      
      // 5. Apply layout strategy
      const layoutStrategy = this.exportTemplates[template].canvasLayout;
      const layoutedElements = await this.applyLayoutStrategy(canvasElements, layoutStrategy);
      
      // 6. Generate export metadata
      const exportMetadata = this.generateExportMetadata(conversationNodes, analysis, template);
      
      const exportResult = {
        elements: layoutedElements,
        metadata: exportMetadata,
        template,
        analysis,
        statistics: this.calculateExportStatistics(layoutedElements),
        recommendations: this.generateExportRecommendations(analysis)
      };

      console.log('✅ Semantic export completed:', {
        elementsCreated: layoutedElements.length,
        template,
        readinessScore: analysis.readinessScore
      });

      return exportResult;

    } catch (error) {
      console.error('❌ Semantic export failed:', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * Analyze conversation for export readiness
   */
  async analyzeConversationForExport(nodes) {
    const analysis = {
      nodeCount: nodes.length,
      completedNodes: nodes.filter(n => n.data.state === 'complete').length,
      branchDistribution: this.calculateBranchDistribution(nodes),
      topicCoverage: this.calculateTopicCoverage(nodes),
      conversationDepth: Math.max(...nodes.map(n => n.data.context?.depth || 0)),
      coherenceScore: this.calculateCoherenceScore(nodes),
      readinessScore: 0,
      recommendations: []
    };

    // Calculate readiness score
    analysis.readinessScore = this.calculateReadinessScore(analysis);
    
    // Generate recommendations
    analysis.recommendations = this.generateReadinessRecommendations(analysis);

    return analysis;
  }

  /**
   * Build semantic structure from conversation nodes
   */
  async buildSemanticStructure(nodes, analysis) {
    const structure = {
      rootNodes: [],
      mainIdeas: [],
      supportingNodes: [],
      implementationItems: [],
      critiques: [],
      refinements: [],
      aiInsights: [],
      relationships: []
    };

    // Classify nodes semantically
    nodes.forEach(node => {
      const classification = this.classifyNode(node);
      
      if (classification.isRootNode) structure.rootNodes.push(node);
      if (classification.isMainIdea) structure.mainIdeas.push(node);
      if (classification.isImplementationItem) structure.implementationItems.push(node);
      if (classification.isCritiquePoint) structure.critiques.push(node);
      if (classification.isRefinementNote) structure.refinements.push(node);
      if (classification.isAIInsight) structure.aiInsights.push(node);
      
      if (!classification.isRootNode && !classification.isMainIdea) {
        structure.supportingNodes.push(node);
      }
    });

    // Identify relationships
    structure.relationships = this.identifySemanticRelationships(nodes);

    return structure;
  }

  /**
   * Apply smart grouping based on template
   */
  async applySmartGrouping(structure, template) {
    const templateConfig = this.exportTemplates[template];
    const groupingStrategy = templateConfig.groupingStrategy;

    let groupedStructure = {};

    switch (groupingStrategy) {
      case 'semantic-clustering':
        groupedStructure = this.applySemanticClustering(structure);
        break;
      case 'topic-based':
        groupedStructure = this.applyTopicBasedGrouping(structure);
        break;
      case 'branch-based':
        groupedStructure = this.applyBranchBasedGrouping(structure);
        break;
      case 'conversation-flow':
        groupedStructure = this.applyConversationFlowGrouping(structure);
        break;
      case 'semantic-hierarchy':
        groupedStructure = this.applySemanticHierarchy(structure);
        break;
      default:
        groupedStructure = this.applyDefaultGrouping(structure);
    }

    return groupedStructure;
  }

  /**
   * Generate Canvas elements from grouped structure
   */
  async generateCanvasElements(groupedStructure, template, customization) {
    const elements = [];
    const templateConfig = this.exportTemplates[template];
    
    // Process each group
    for (const [groupName, groupNodes] of Object.entries(groupedStructure)) {
      if (Array.isArray(groupNodes) && groupNodes.length > 0) {
        // Create group board if needed
        if (this.shouldCreateGroupBoard(groupName, groupNodes, templateConfig)) {
          const groupBoard = this.createGroupBoard(groupName, groupNodes, customization);
          elements.push(groupBoard);
        }
        
        // Create individual elements
        for (const node of groupNodes) {
          const canvasElement = this.createCanvasElement(node, groupName, customization);
          elements.push(canvasElement);
        }
      }
    }

    return elements;
  }

  /**
   * Create Canvas element from conversation node
   */
  createCanvasElement(node, groupName, customization) {
    const elementType = this.determineElementType(node);
    const baseElement = this.canvasElementTypes[elementType];
    
    const element = {
      id: `exported_${node.id}`,
      type: baseElement.canvasType,
      position: { x: 0, y: 0 }, // Will be positioned by layout strategy
      data: {
        title: this.extractTitle(node),
        content: this.extractContent(node),
        sourceModule: 'mind-garden',
        sourceNodeId: node.id,
        exportGroup: groupName,
        branchType: node.data.context?.branch,
        conversationFocus: node.data.context?.conversationFocus,
        aiConfidence: node.data.context?.aiConfidence,
        timestamp: node.data.timestamp || new Date().toISOString(),
        ...customization.elementDefaults
      },
      style: {
        ...baseElement.styling,
        ...customization.styling
      }
    };

    return element;
  }

  /**
   * Apply layout strategy to elements
   */
  async applyLayoutStrategy(elements, layoutStrategy) {
    const strategy = this.layoutStrategies[layoutStrategy];
    if (!strategy) {
      throw new Error(`Unknown layout strategy: ${layoutStrategy}`);
    }

    return await strategy.algorithm(elements, strategy.spacing);
  }

  // Layout Algorithm Implementations

  /**
   * Board-focused layout algorithm
   */
  async boardFocusedLayout(elements, spacing) {
    const boards = elements.filter(el => el.type === 'board');
    const notes = elements.filter(el => el.type === 'note');
    
    let currentX = 0;
    let currentY = 0;
    
    // Position boards
    boards.forEach((board, index) => {
      board.position = { x: currentX, y: currentY };
      currentX += spacing.board;
      
      if ((index + 1) % 3 === 0) {
        currentX = 0;
        currentY += spacing.board;
      }
    });
    
    // Position notes within boards
    const notesByGroup = this.groupElementsByGroup(notes);
    
    for (const [groupName, groupNotes] of Object.entries(notesByGroup)) {
      const parentBoard = boards.find(b => b.data.exportGroup === groupName);
      if (parentBoard) {
        this.positionNotesInBoard(groupNotes, parentBoard, spacing.note);
      }
    }
    
    return elements;
  }

  /**
   * Network layout algorithm
   */
  async networkLayout(elements, spacing) {
    // Implement force-directed layout
    const nodes = elements.filter(el => el.type === 'note');
    const clusters = this.identifyElementClusters(nodes);
    
    let clusterX = 0;
    
    for (const cluster of clusters) {
      const clusterCenter = { x: clusterX, y: 0 };
      this.positionClusterNodes(cluster, clusterCenter, spacing.node);
      clusterX += spacing.cluster;
    }
    
    return elements;
  }

  /**
   * Timeline layout algorithm
   */
  async timelineLayout(elements, spacing) {
    const sortedElements = elements.sort((a, b) => 
      new Date(a.data.timestamp) - new Date(b.data.timestamp)
    );
    
    let currentX = 0;
    let currentY = 0;
    
    sortedElements.forEach((element, index) => {
      element.position = { x: currentX, y: currentY };
      currentX += spacing.step;
      
      // Add parallel tracks for different branch types
      if (element.data.branchType === BRANCH_TYPES.CRITIQUE) {
        element.position.y += spacing.parallel;
      } else if (element.data.branchType === BRANCH_TYPES.REFINEMENT) {
        element.position.y -= spacing.parallel;
      }
    });
    
    return elements;
  }

  /**
   * Document layout algorithm
   */
  async documentLayout(elements, spacing) {
    const sections = this.groupElementsByTopic(elements);
    
    let currentY = 0;
    
    for (const [sectionName, sectionElements] of Object.entries(sections)) {
      // Create section header
      const sectionHeader = this.createSectionHeader(sectionName, currentY);
      elements.push(sectionHeader);
      currentY += spacing.section;
      
      // Position section elements
      sectionElements.forEach((element, index) => {
        element.position = { x: 100, y: currentY };
        currentY += spacing.item;
      });
      
      currentY += spacing.section;
    }
    
    return elements;
  }

  /**
   * Hierarchical layout algorithm
   */
  async hierarchicalLayout(elements, spacing) {
    const hierarchy = this.buildElementHierarchy(elements);
    
    const positionHierarchy = (nodes, depth = 0, startY = 0) => {
      let currentY = startY;
      
      nodes.forEach(node => {
        node.position = { x: depth * spacing.level, y: currentY };
        currentY += spacing.sibling;
        
        if (node.children && node.children.length > 0) {
          currentY = positionHierarchy(node.children, depth + 1, currentY);
        }
      });
      
      return currentY;
    };
    
    positionHierarchy(hierarchy);
    return elements;
  }

  // Helper Methods

  calculateImportanceScore(node) {
    let score = 0;
    
    // Base score from AI confidence
    score += (node.data.context?.aiConfidence || 0.5) * 0.3;
    
    // Bonus for root nodes
    if (!node.data.context?.parentChain?.length) score += 0.3;
    
    // Bonus for nodes with many children
    const childCount = node.data.childCount || 0;
    score += Math.min(childCount / 5, 0.2);
    
    // Bonus for longer content
    const contentLength = (node.data.prompt?.length || 0) + (node.data.aiResponse?.length || 0);
    score += Math.min(contentLength / 1000, 0.2);
    
    return Math.min(score, 1.0);
  }

  calculateSemanticSimilarity(node1, node2) {
    // Simple implementation - can be enhanced with NLP
    const text1 = `${node1.data.prompt || ''} ${node1.data.aiResponse || ''}`.toLowerCase();
    const text2 = `${node2.data.prompt || ''} ${node2.data.aiResponse || ''}`.toLowerCase();
    
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  classifyNode(node) {
    const rules = this.semanticRules.nodeClassification;
    
    return {
      isRootNode: rules.isRootNode(node),
      isMainIdea: rules.isMainIdea(node),
      isImplementationItem: rules.isImplementationItem(node),
      isCritiquePoint: rules.isCritiquePoint(node),
      isRefinementNote: rules.isRefinementNote(node),
      isAIInsight: rules.isAIInsight(node)
    };
  }

  determineElementType(node) {
    const classification = this.classifyNode(node);
    
    if (classification.isRootNode) return 'CONVERSATION_ROOT';
    if (classification.isMainIdea) return 'MAIN_IDEA';
    if (classification.isImplementationItem) return 'IMPLEMENTATION_ITEM';
    if (classification.isCritiquePoint) return 'CRITIQUE_POINT';
    if (classification.isRefinementNote) return 'REFINEMENT_NOTE';
    if (classification.isAIInsight) return 'AI_INSIGHT';
    
    return 'MAIN_IDEA'; // Default
  }

  extractTitle(node) {
    if (node.data.title) return node.data.title;
    if (node.data.prompt) {
      return node.data.prompt.length > 50 
        ? node.data.prompt.substring(0, 50) + '...'
        : node.data.prompt;
    }
    return 'Untitled';
  }

  extractContent(node) {
    const parts = [];
    
    if (node.data.prompt) {
      parts.push(`**Question:** ${node.data.prompt}`);
    }
    
    if (node.data.aiResponse) {
      parts.push(`**Response:** ${node.data.aiResponse}`);
    }
    
    return parts.join('\n\n');
  }

  generateExportMetadata(nodes, analysis, template) {
    return {
      exportDate: new Date().toISOString(),
      sourceModule: 'mind-garden',
      template,
      originalNodeCount: nodes.length,
      readinessScore: analysis.readinessScore,
      conversationDepth: analysis.conversationDepth,
      branchDistribution: analysis.branchDistribution,
      exportVersion: '5.1.0'
    };
  }

  calculateExportStatistics(elements) {
    const stats = {
      totalElements: elements.length,
      elementTypes: {},
      boardCount: 0,
      noteCount: 0,
      linkCount: 0
    };

    elements.forEach(element => {
      stats.elementTypes[element.type] = (stats.elementTypes[element.type] || 0) + 1;
      
      switch (element.type) {
        case 'board': stats.boardCount++; break;
        case 'note': stats.noteCount++; break;
        case 'link': stats.linkCount++; break;
      }
    });

    return stats;
  }

  generateExportRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.readinessScore < 0.6) {
      recommendations.push('Consider developing more conversation depth before exporting');
    }
    
    if (analysis.completedNodes / analysis.nodeCount < 0.7) {
      recommendations.push('Complete more conversation nodes for better export quality');
    }
    
    if (analysis.branchDistribution.exploration > 0.8) {
      recommendations.push('Add implementation and refinement branches for more actionable export');
    }
    
    return recommendations;
  }

  calculateReadinessScore(analysis) {
    let score = 0;
    
    // Completion rate
    score += (analysis.completedNodes / analysis.nodeCount) * 0.3;
    
    // Branch diversity
    const branchCount = Object.keys(analysis.branchDistribution).length;
    score += (branchCount / 4) * 0.2;
    
    // Conversation depth
    score += Math.min(analysis.conversationDepth / 5, 1) * 0.2;
    
    // Coherence
    score += analysis.coherenceScore * 0.3;
    
    return Math.min(score, 1.0);
  }

  // Additional helper methods implementation

  calculateBranchDistribution(nodes) {
    const branchCounts = {};
    const total = nodes.length;
    
    nodes.forEach(node => {
      const branch = node.data.context?.branch || 'exploration';
      branchCounts[branch] = (branchCounts[branch] || 0) + 1;
    });
    
    const distribution = {};
    Object.entries(branchCounts).forEach(([branch, count]) => {
      distribution[branch] = count / total;
    });
    
    return distribution;
  }

  calculateTopicCoverage(nodes) {
    // Simple topic coverage calculation
    const allWords = nodes.flatMap(node => {
      const text = `${node.data.prompt || ''} ${node.data.aiResponse || ''}`;
      return text.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    });
    
    const uniqueWords = new Set(allWords);
    return uniqueWords.size / allWords.length;
  }

  calculateCoherenceScore(nodes) {
    if (nodes.length < 2) return 1.0;
    
    // Calculate coherence based on conversation threading
    let coherentPairs = 0;
    let totalPairs = 0;
    
    nodes.forEach(node => {
      const parentChain = node.data.context?.parentChain || [];
      parentChain.forEach(parentId => {
        const parent = nodes.find(n => n.id === parentId);
        if (parent) {
          const similarity = this.calculateSemanticSimilarity(node, parent);
          if (similarity > 0.3) coherentPairs++;
          totalPairs++;
        }
      });
    });
    
    return totalPairs > 0 ? coherentPairs / totalPairs : 0.5;
  }

  generateReadinessRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.readinessScore < 0.6) {
      recommendations.push('Consider developing more conversation depth before exporting');
    }
    
    if (analysis.completedNodes / analysis.nodeCount < 0.7) {
      recommendations.push('Complete more conversation nodes for better export quality');
    }
    
    if (analysis.branchDistribution.exploration > 0.8) {
      recommendations.push('Add implementation and refinement branches for more actionable export');
    }
    
    if (analysis.conversationDepth < 3) {
      recommendations.push('Develop deeper conversation threads for richer export structure');
    }
    
    return recommendations;
  }

  identifySemanticRelationships(nodes) {
    const relationships = [];
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        // Parent-child relationship
        if (node1.data.context?.parentChain?.includes(node2.id)) {
          relationships.push({
            from: node2.id,
            to: node1.id,
            type: 'parent-child',
            strength: 1.0
          });
        }
        
        // Semantic similarity
        const similarity = this.calculateSemanticSimilarity(node1, node2);
        if (similarity > 0.6) {
          relationships.push({
            from: node1.id,
            to: node2.id,
            type: 'semantic-similar',
            strength: similarity
          });
        }
      }
    }
    
    return relationships;
  }

  // Grouping Algorithm Implementations
  applySemanticClustering(structure) {
    const { mainIdeas, supportingNodes, implementationItems, critiques, refinements } = structure;
    
    return {
      'Core Ideas': mainIdeas,
      'Supporting Details': supportingNodes,
      'Implementation Tasks': implementationItems,
      'Critical Analysis': critiques,
      'Refinements': refinements
    };
  }

  applyTopicBasedGrouping(structure) {
    // Simple topic-based grouping
    const allNodes = [
      ...structure.mainIdeas,
      ...structure.supportingNodes,
      ...structure.implementationItems,
      ...structure.critiques,
      ...structure.refinements
    ];
    
    const topicGroups = {};
    
    allNodes.forEach(node => {
      const text = `${node.data.prompt || ''} ${node.data.aiResponse || ''}`;
      const keywords = text.toLowerCase().split(/\s+/).filter(word => word.length > 4);
      const topicKey = keywords.slice(0, 3).join(' ') || 'General';
      
      if (!topicGroups[topicKey]) {
        topicGroups[topicKey] = [];
      }
      topicGroups[topicKey].push(node);
    });
    
    return topicGroups;
  }

  applyBranchBasedGrouping(structure) {
    return {
      'Exploration': structure.mainIdeas.filter(n => n.data.context?.branch === 'exploration'),
      'Implementation': structure.implementationItems,
      'Refinement': structure.refinements,
      'Critique': structure.critiques
    };
  }

  applyConversationFlowGrouping(structure) {
    // Group by conversation threads
    const threads = {};
    const allNodes = [
      ...structure.mainIdeas,
      ...structure.supportingNodes,
      ...structure.implementationItems,
      ...structure.critiques,
      ...structure.refinements
    ];
    
    allNodes.forEach(node => {
      const rootId = this.findRootNode(node, allNodes);
      const threadKey = `Thread ${rootId}`;
      
      if (!threads[threadKey]) {
        threads[threadKey] = [];
      }
      threads[threadKey].push(node);
    });
    
    return threads;
  }

  applySemanticHierarchy(structure) {
    return {
      'Level 1: Root Concepts': structure.rootNodes,
      'Level 2: Main Ideas': structure.mainIdeas,
      'Level 3: Details': structure.supportingNodes,
      'Level 4: Implementation': structure.implementationItems,
      'Level 5: Analysis': [...structure.critiques, ...structure.refinements]
    };
  }

  applyDefaultGrouping(structure) {
    return this.applySemanticClustering(structure);
  }

  // Helper methods for grouping
  findRootNode(node, allNodes) {
    let current = node;
    while (current.data.context?.parentChain?.length > 0) {
      const parentId = current.data.context.parentChain[current.data.context.parentChain.length - 1];
      const parent = allNodes.find(n => n.id === parentId);
      if (parent) {
        current = parent;
      } else {
        break;
      }
    }
    return current.id;
  }

  shouldCreateGroupBoard(groupName, groupNodes, templateConfig) {
    // Create boards for groups with multiple nodes
    return groupNodes.length > 1 && templateConfig.canvasLayout === 'board-focused';
  }

  createGroupBoard(groupName, groupNodes, customization) {
    return {
      id: `board_${groupName.replace(/\s+/g, '_').toLowerCase()}`,
      type: 'board',
      position: { x: 0, y: 0 },
      data: {
        title: groupName,
        content: `Contains ${groupNodes.length} conversation elements`,
        exportGroup: groupName,
        nodeCount: groupNodes.length,
        ...customization.boardDefaults
      },
      style: {
        backgroundColor: '#f9fafb',
        borderColor: '#6b7280',
        minWidth: 250,
        minHeight: 200,
        ...customization.styling
      }
    };
  }

  // Layout helpers
  groupElementsByGroup(elements) {
    const groups = {};
    elements.forEach(element => {
      const groupName = element.data.exportGroup || 'default';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(element);
    });
    return groups;
  }

  positionNotesInBoard(notes, board, spacing) {
    const boardPosition = board.position;
    const cols = Math.ceil(Math.sqrt(notes.length));
    
    notes.forEach((note, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      note.position = {
        x: boardPosition.x + 20 + (col * spacing),
        y: boardPosition.y + 60 + (row * spacing)
      };
    });
  }

  identifyElementClusters(elements) {
    // Simple clustering - group elements by export group
    const clusters = {};
    elements.forEach(element => {
      const cluster = element.data.exportGroup || 'default';
      if (!clusters[cluster]) {
        clusters[cluster] = [];
      }
      clusters[cluster].push(element);
    });
    
    return Object.values(clusters);
  }

  positionClusterNodes(cluster, center, spacing) {
    const radius = spacing;
    cluster.forEach((node, index) => {
      const angle = (index / cluster.length) * 2 * Math.PI;
      node.position = {
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius
      };
    });
  }

  groupElementsByTopic(elements) {
    // Group elements by topic keywords
    const topics = {};
    elements.forEach(element => {
      const text = `${element.data.title || ''} ${element.data.content || ''}`;
      const keywords = text.toLowerCase().split(/\s+/).filter(word => word.length > 4);
      const topicKey = keywords.slice(0, 2).join(' ') || 'General';
      
      if (!topics[topicKey]) {
        topics[topicKey] = [];
      }
      topics[topicKey].push(element);
    });
    
    return topics;
  }

  createSectionHeader(sectionName, y) {
    return {
      id: `section_${sectionName.replace(/\s+/g, '_').toLowerCase()}`,
      type: 'note',
      position: { x: 0, y },
      data: {
        title: sectionName,
        content: '',
        isHeader: true
      },
      style: {
        backgroundColor: '#f3f4f6',
        borderColor: '#9ca3af',
        fontWeight: 'bold',
        fontSize: '16px'
      }
    };
  }

  buildElementHierarchy(elements) {
    // Build hierarchy based on parent-child relationships
    const hierarchy = [];
    const processed = new Set();
    
    elements.forEach(element => {
      if (!processed.has(element.id)) {
        const tree = this.buildElementTree(element, elements, processed);
        hierarchy.push(tree);
      }
    });
    
    return hierarchy;
  }

  buildElementTree(element, allElements, processed) {
    processed.add(element.id);
    
    const tree = {
      ...element,
      children: []
    };
    
    // Find children based on sourceNodeId
    const children = allElements.filter(el => 
      el.data.sourceNodeId && 
      el.data.sourceNodeId === element.data.sourceNodeId &&
      !processed.has(el.id)
    );
    
    children.forEach(child => {
      tree.children.push(this.buildElementTree(child, allElements, processed));
    });
    
    return tree;
  }
}

export default SemanticExportEngine;