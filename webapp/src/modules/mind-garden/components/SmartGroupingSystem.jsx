/**
 * Mind Garden v5.1 - Smart Grouping System
 * Day 6: Intelligent node clustering and relationship analysis
 */

import { BRANCH_TYPES, CONVERSATION_FOCUS } from '../types/conversationTypes';

export class SmartGroupingSystem {
  constructor(topicExtractor) {
    this.topicExtractor = topicExtractor;
    this.groupingAlgorithms = this.initializeGroupingAlgorithms();
    this.clusteringMetrics = this.initializeClusteringMetrics();
    this.relationshipTypes = this.initializeRelationshipTypes();
  }

  /**
   * Initialize grouping algorithms
   */
  initializeGroupingAlgorithms() {
    return {
      SEMANTIC_CLUSTERING: {
        name: 'Semantic Clustering',
        description: 'Group by semantic similarity and topic overlap',
        algorithm: this.semanticClustering.bind(this),
        parameters: {
          similarityThreshold: 0.6,
          maxClusterSize: 8,
          minClusterSize: 2
        }
      },
      
      TOPIC_BASED: {
        name: 'Topic-Based Grouping',
        description: 'Group by extracted topics and themes',
        algorithm: this.topicBasedGrouping.bind(this),
        parameters: {
          topicOverlapThreshold: 0.5,
          maxTopicsPerGroup: 3
        }
      },
      
      BRANCH_BASED: {
        name: 'Branch-Based Grouping',
        description: 'Group by conversation branch types',
        algorithm: this.branchBasedGrouping.bind(this),
        parameters: {
          preserveFlow: true,
          allowMixedBranches: false
        }
      },
      
      CONVERSATION_FLOW: {
        name: 'Conversation Flow Grouping',
        description: 'Group by conversation thread continuity',
        algorithm: this.conversationFlowGrouping.bind(this),
        parameters: {
          maxFlowGap: 2,
          preserveDepth: true
        }
      },
      
      HIERARCHICAL: {
        name: 'Hierarchical Grouping',
        description: 'Group by parent-child relationships',
        algorithm: this.hierarchicalGrouping.bind(this),
        parameters: {
          maxDepthPerGroup: 3,
          groupSiblings: true
        }
      },
      
      TEMPORAL: {
        name: 'Temporal Grouping',
        description: 'Group by creation time and conversation sessions',
        algorithm: this.temporalGrouping.bind(this),
        parameters: {
          timeWindowMinutes: 60,
          sessionGapMinutes: 30
        }
      },
      
      CONFIDENCE_BASED: {
        name: 'Confidence-Based Grouping',
        description: 'Group by AI confidence and response quality',
        algorithm: this.confidenceBasedGrouping.bind(this),
        parameters: {
          confidenceThreshold: 0.7,
          qualityWeight: 0.3
        }
      }
    };
  }

  /**
   * Initialize clustering metrics
   */
  initializeClusteringMetrics() {
    return {
      cohesion: this.calculateCohesion.bind(this),
      separation: this.calculateSeparation.bind(this),
      silhouette: this.calculateSilhouette.bind(this),
      compactness: this.calculateCompactness.bind(this),
      connectivity: this.calculateConnectivity.bind(this)
    };
  }

  // Clustering metrics implementation (stub methods for now)
  calculateCohesion(cluster) {
    // Simple cohesion calculation
    return cluster.length > 0 ? 0.8 : 0;
  }

  calculateSeparation(cluster1, cluster2) {
    // Simple separation calculation
    return 0.7;
  }

  calculateSilhouette(clusters) {
    // Simple silhouette calculation
    return 0.75;
  }

  calculateCompactness(cluster) {
    // Simple compactness calculation
    return cluster.length > 0 ? 0.6 : 0;
  }

  calculateConnectivity(nodes, relationships) {
    // Simple connectivity calculation
    return relationships.length / Math.max(nodes.length - 1, 1);
  }

  /**
   * Initialize relationship types
   */
  initializeRelationshipTypes() {
    return {
      PARENT_CHILD: {
        strength: 1.0,
        type: 'hierarchical',
        bidirectional: false
      },
      SIBLING: {
        strength: 0.8,
        type: 'horizontal',
        bidirectional: true
      },
      SEMANTIC_SIMILAR: {
        strength: 0.6,
        type: 'semantic',
        bidirectional: true
      },
      TOPIC_OVERLAP: {
        strength: 0.7,
        type: 'thematic',
        bidirectional: true
      },
      TEMPORAL_ADJACENT: {
        strength: 0.4,
        type: 'temporal',
        bidirectional: true
      },
      BRANCH_CONTINUATION: {
        strength: 0.9,
        type: 'conversational',
        bidirectional: false
      }
    };
  }

  /**
   * Main grouping method with algorithm selection
   */
  async groupNodes(nodes, algorithm = 'SEMANTIC_CLUSTERING', customParameters = {}) {
    const groupingConfig = this.groupingAlgorithms[algorithm];
    if (!groupingConfig) {
      throw new Error(`Unknown grouping algorithm: ${algorithm}`);
    }

    const parameters = { ...groupingConfig.parameters, ...customParameters };
    
    console.log('🔄 Starting smart grouping:', {
      algorithm,
      nodeCount: nodes.length,
      parameters
    });

    try {
      // 1. Analyze node relationships
      const relationships = await this.analyzeNodeRelationships(nodes);
      
      // 2. Apply grouping algorithm
      const groups = await groupingConfig.algorithm(nodes, relationships, parameters);
      
      // 3. Optimize groups
      const optimizedGroups = await this.optimizeGroups(groups, relationships, parameters);
      
      // 4. Evaluate grouping quality
      const metrics = await this.evaluateGroupingQuality(optimizedGroups, relationships);
      
      // 5. Generate group metadata
      const groupMetadata = await this.generateGroupMetadata(optimizedGroups, nodes);

      const result = {
        groups: optimizedGroups,
        metrics,
        metadata: groupMetadata,
        algorithm,
        parameters,
        relationships,
        statistics: this.calculateGroupingStatistics(optimizedGroups)
      };

      console.log('✅ Smart grouping completed:', {
        groupCount: optimizedGroups.length,
        avgGroupSize: result.statistics.averageGroupSize,
        quality: metrics.overallQuality
      });

      return result;

    } catch (error) {
      console.error('❌ Smart grouping failed:', error);
      throw new Error(`Grouping failed: ${error.message}`);
    }
  }

  /**
   * Analyze relationships between nodes
   */
  async analyzeNodeRelationships(nodes) {
    const relationships = [];
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        // Check different relationship types
        const relationshipAnalysis = await this.analyzeNodePair(node1, node2);
        
        if (relationshipAnalysis.hasRelationship) {
          relationships.push({
            node1Id: node1.id,
            node2Id: node2.id,
            type: relationshipAnalysis.type,
            strength: relationshipAnalysis.strength,
            metadata: relationshipAnalysis.metadata
          });
        }
      }
    }
    
    return relationships;
  }

  /**
   * Analyze relationship between two nodes
   */
  async analyzeNodePair(node1, node2) {
    const relationships = [];
    
    // 1. Check hierarchical relationship
    const hierarchical = this.checkHierarchicalRelationship(node1, node2);
    if (hierarchical.hasRelationship) {
      relationships.push(hierarchical);
    }
    
    // 2. Check semantic similarity
    const semantic = await this.checkSemanticSimilarity(node1, node2);
    if (semantic.hasRelationship) {
      relationships.push(semantic);
    }
    
    // 3. Check topic overlap
    const topicOverlap = await this.checkTopicOverlap(node1, node2);
    if (topicOverlap.hasRelationship) {
      relationships.push(topicOverlap);
    }
    
    // 4. Check temporal adjacency
    const temporal = this.checkTemporalAdjacency(node1, node2);
    if (temporal.hasRelationship) {
      relationships.push(temporal);
    }
    
    // 5. Check branch continuation
    const branchContinuation = this.checkBranchContinuation(node1, node2);
    if (branchContinuation.hasRelationship) {
      relationships.push(branchContinuation);
    }
    
    // Return strongest relationship
    if (relationships.length === 0) {
      return { hasRelationship: false };
    }
    
    const strongest = relationships.reduce((max, rel) => 
      rel.strength > max.strength ? rel : max
    );
    
    return {
      hasRelationship: true,
      type: strongest.type,
      strength: strongest.strength,
      metadata: strongest.metadata
    };
  }

  /**
   * Check hierarchical relationship (parent-child)
   */
  checkHierarchicalRelationship(node1, node2) {
    const chain1 = node1.data.context?.parentChain || [];
    const chain2 = node2.data.context?.parentChain || [];
    
    // Check if node1 is parent of node2
    if (chain2.includes(node1.id)) {
      return {
        hasRelationship: true,
        type: 'PARENT_CHILD',
        strength: 1.0,
        metadata: { direction: 'node1_parent_of_node2' }
      };
    }
    
    // Check if node2 is parent of node1
    if (chain1.includes(node2.id)) {
      return {
        hasRelationship: true,
        type: 'PARENT_CHILD',
        strength: 1.0,
        metadata: { direction: 'node2_parent_of_node1' }
      };
    }
    
    // Check if they're siblings (same parent)
    const parent1 = chain1[chain1.length - 1];
    const parent2 = chain2[chain2.length - 1];
    
    if (parent1 && parent2 && parent1 === parent2) {
      return {
        hasRelationship: true,
        type: 'SIBLING',
        strength: 0.8,
        metadata: { commonParent: parent1 }
      };
    }
    
    return { hasRelationship: false };
  }

  /**
   * Check semantic similarity between nodes
   */
  async checkSemanticSimilarity(node1, node2) {
    const text1 = `${node1.data.prompt || ''} ${node1.data.aiResponse || ''}`;
    const text2 = `${node2.data.prompt || ''} ${node2.data.aiResponse || ''}`;
    
    const similarity = this.calculateTextSimilarity(text1, text2);
    
    if (similarity > 0.6) {
      return {
        hasRelationship: true,
        type: 'SEMANTIC_SIMILAR',
        strength: similarity,
        metadata: { similarity }
      };
    }
    
    return { hasRelationship: false };
  }

  /**
   * Check topic overlap between nodes
   */
  async checkTopicOverlap(node1, node2) {
    if (!this.topicExtractor) {
      return { hasRelationship: false };
    }
    
    const topics1 = this.topicExtractor.extractTopics([node1], { maxTopics: 5 });
    const topics2 = this.topicExtractor.extractTopics([node2], { maxTopics: 5 });
    
    const overlap = this.calculateTopicOverlap(topics1, topics2);
    
    if (overlap.score > 0.5) {
      return {
        hasRelationship: true,
        type: 'TOPIC_OVERLAP',
        strength: overlap.score,
        metadata: { 
          commonTopics: overlap.commonTopics,
          overlapScore: overlap.score
        }
      };
    }
    
    return { hasRelationship: false };
  }

  /**
   * Check temporal adjacency
   */
  checkTemporalAdjacency(node1, node2) {
    const time1 = new Date(node1.data.timestamp || 0);
    const time2 = new Date(node2.data.timestamp || 0);
    
    const timeDiff = Math.abs(time1 - time2);
    const maxGap = 30 * 60 * 1000; // 30 minutes
    
    if (timeDiff < maxGap) {
      const strength = 1 - (timeDiff / maxGap);
      return {
        hasRelationship: true,
        type: 'TEMPORAL_ADJACENT',
        strength,
        metadata: { timeDifference: timeDiff }
      };
    }
    
    return { hasRelationship: false };
  }

  /**
   * Check branch continuation
   */
  checkBranchContinuation(node1, node2) {
    const branch1 = node1.data.context?.branch;
    const branch2 = node2.data.context?.branch;
    
    if (branch1 && branch2 && branch1 === branch2) {
      const depth1 = node1.data.context?.depth || 0;
      const depth2 = node2.data.context?.depth || 0;
      
      if (Math.abs(depth1 - depth2) <= 1) {
        return {
          hasRelationship: true,
          type: 'BRANCH_CONTINUATION',
          strength: 0.9,
          metadata: { branchType: branch1, depthDifference: Math.abs(depth1 - depth2) }
        };
      }
    }
    
    return { hasRelationship: false };
  }

  // Grouping Algorithm Implementations

  /**
   * Build similarity graph for semantic clustering
   */
  buildSimilarityGraph(nodes, relationships, threshold = 0.5) {
    const graph = new Map();
    
    // Initialize graph nodes
    nodes.forEach(node => {
      graph.set(node.id, { node, connections: [] });
    });
    
    // Calculate similarities between all node pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];
        
        // Calculate semantic similarity based on content
        const similarity = this.calculateSemanticSimilarity(nodeA, nodeB);
        
        if (similarity >= threshold) {
          graph.get(nodeA.id).connections.push({ nodeId: nodeB.id, weight: similarity });
          graph.get(nodeB.id).connections.push({ nodeId: nodeA.id, weight: similarity });
        }
      }
    }
    
    return graph;
  }

  /**
   * Calculate semantic similarity between two nodes
   */
  calculateSemanticSimilarity(nodeA, nodeB) {
    // Simple similarity based on prompt and response content
    const textA = `${nodeA.data.prompt || ''} ${nodeA.data.aiResponse || ''}`.toLowerCase();
    const textB = `${nodeB.data.prompt || ''} ${nodeB.data.aiResponse || ''}`.toLowerCase();
    
    if (!textA.trim() || !textB.trim()) return 0;
    
    // Simple word overlap similarity
    const wordsA = textA.split(/\s+/).filter(w => w.length > 3);
    const wordsB = textB.split(/\s+/).filter(w => w.length > 3);
    
    const intersection = wordsA.filter(word => wordsB.includes(word)).length;
    const union = new Set([...wordsA, ...wordsB]).size;
    
    return union > 0 ? intersection / union : 0;
  }

  /**
   * Apply community detection for clustering
   */
  applyCommunityDetection(graph, maxClusterSize = 5, minClusterSize = 1) {
    const visited = new Set();
    const clusters = [];
    
    // Simple connected components detection
    for (const [nodeId, nodeData] of graph) {
      if (!visited.has(nodeId)) {
        const cluster = [];
        const queue = [nodeId];
        
        while (queue.length > 0 && cluster.length < maxClusterSize) {
          const currentId = queue.shift();
          if (!visited.has(currentId)) {
            visited.add(currentId);
            cluster.push(currentId);
            
            // Add connected nodes to queue
            const connections = graph.get(currentId)?.connections || [];
            connections.forEach(conn => {
              if (!visited.has(conn.nodeId)) {
                queue.push(conn.nodeId);
              }
            });
          }
        }
        
        if (cluster.length >= minClusterSize) {
          clusters.push(cluster);
        }
      }
    }
    
    return clusters;
  }

  /**
   * Calculate cluster cohesion
   */
  calculateClusterCohesion(cluster, relationships) {
    if (cluster.length <= 1) return 1.0;
    
    // Simple cohesion based on internal connections
    let internalConnections = 0;
    let totalPossible = (cluster.length * (cluster.length - 1)) / 2;
    
    for (let i = 0; i < cluster.length; i++) {
      for (let j = i + 1; j < cluster.length; j++) {
        // Check if nodes are connected (simplified)
        if (relationships && relationships.some(r => 
          (r.source === cluster[i] && r.target === cluster[j]) ||
          (r.source === cluster[j] && r.target === cluster[i])
        )) {
          internalConnections++;
        }
      }
    }
    
    return totalPossible > 0 ? internalConnections / totalPossible : 0.8;
  }

  /**
   * Semantic clustering algorithm
   */
  async semanticClustering(nodes, relationships, parameters) {
    const { similarityThreshold, maxClusterSize, minClusterSize } = parameters;
    
    // Build similarity graph
    const similarityGraph = this.buildSimilarityGraph(nodes, relationships, similarityThreshold);
    
    // Apply clustering algorithm (simplified community detection)
    const clusters = this.applyCommunityDetection(similarityGraph, maxClusterSize, minClusterSize);
    
    // Convert to groups
    const groups = clusters.map((cluster, index) => ({
      id: `semantic_cluster_${index}`,
      name: `Semantic Cluster ${index + 1}`,
      nodes: cluster.map(nodeId => nodes.find(n => n.id === nodeId)),
      type: 'semantic',
      cohesion: this.calculateClusterCohesion(cluster, relationships)
    }));
    
    return groups.filter(group => group.nodes.length >= minClusterSize);
  }

  /**
   * Aggregate topics from a group of nodes
   */
  aggregateGroupTopics(groupNodes, nodeTopics) {
    const allTopics = [];
    groupNodes.forEach(node => {
      const topics = nodeTopics.get(node.id) || [];
      allTopics.push(...topics);
    });
    
    // Count topic frequency and return weighted list
    const topicCount = new Map();
    allTopics.forEach(topic => {
      topicCount.set(topic, (topicCount.get(topic) || 0) + 1);
    });
    
    // Return topics sorted by frequency
    return Array.from(topicCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([topic, count]) => ({ topic, weight: count / allTopics.length }));
  }

  /**
   * Calculate topic overlap between two topic lists
   */
  calculateTopicOverlap(topicsA, topicsB) {
    if (!topicsA.length || !topicsB.length) return { score: 0, overlap: [] };
    
    const setA = new Set(Array.isArray(topicsA[0]) ? topicsA.map(t => t[0] || t.topic) : topicsA);
    const setBWeighted = Array.isArray(topicsB[0]) ? topicsB : topicsB.map(t => ({ topic: t, weight: 1 }));
    
    const overlap = [];
    let totalWeight = 0;
    
    setBWeighted.forEach(({ topic, weight }) => {
      if (setA.has(topic)) {
        overlap.push({ topic, weight });
        totalWeight += weight;
      }
    });
    
    const maxPossibleWeight = Math.min(setA.size, setBWeighted.length);
    const score = maxPossibleWeight > 0 ? totalWeight / maxPossibleWeight : 0;
    
    return { score, overlap };
  }

  /**
   * Topic-based grouping algorithm
   */
  async topicBasedGrouping(nodes, relationships, parameters) {
    const { topicOverlapThreshold, maxTopicsPerGroup } = parameters;
    
    // Extract topics for all nodes
    const nodeTopics = new Map();
    for (const node of nodes) {
      const topics = this.topicExtractor?.extractTopics([node], { maxTopics: maxTopicsPerGroup }) || [];
      nodeTopics.set(node.id, topics);
    }
    
    // Group nodes by topic similarity
    const topicGroups = new Map();
    
    for (const node of nodes) {
      const nodeTopicList = nodeTopics.get(node.id) || [];
      let bestGroup = null;
      let bestOverlap = 0;
      
      // Find best matching group
      for (const [groupId, groupNodes] of topicGroups.entries()) {
        const groupTopics = this.aggregateGroupTopics(groupNodes, nodeTopics);
        const overlap = this.calculateTopicOverlap(nodeTopicList, groupTopics);
        
        if (overlap.score > bestOverlap && overlap.score > topicOverlapThreshold) {
          bestGroup = groupId;
          bestOverlap = overlap.score;
        }
      }
      
      if (bestGroup) {
        topicGroups.get(bestGroup).push(node);
      } else {
        // Create new group
        const groupId = `topic_group_${topicGroups.size}`;
        topicGroups.set(groupId, [node]);
      }
    }
    
    // Convert to groups format
    const groups = Array.from(topicGroups.entries()).map(([groupId, groupNodes]) => ({
      id: groupId,
      name: this.generateTopicGroupName(groupNodes, nodeTopics),
      nodes: groupNodes,
      type: 'topic',
      topics: this.aggregateGroupTopics(groupNodes, nodeTopics)
    }));
    
    return groups;
  }

  /**
   * Branch-based grouping algorithm
   */
  async branchBasedGrouping(nodes, relationships, parameters) {
    const { preserveFlow, allowMixedBranches } = parameters;
    
    const branchGroups = new Map();
    
    // Group by branch type
    for (const node of nodes) {
      const branch = node.data.context?.branch || BRANCH_TYPES.EXPLORATION;
      
      if (!branchGroups.has(branch)) {
        branchGroups.set(branch, []);
      }
      
      branchGroups.get(branch).push(node);
    }
    
    // If preserveFlow is true, maintain conversation flow within branches
    if (preserveFlow) {
      for (const [branch, branchNodes] of branchGroups.entries()) {
        const sortedNodes = branchNodes.sort((a, b) => {
          const depthA = a.data.context?.depth || 0;
          const depthB = b.data.context?.depth || 0;
          return depthA - depthB;
        });
        branchGroups.set(branch, sortedNodes);
      }
    }
    
    // Convert to groups format
    const groups = Array.from(branchGroups.entries()).map(([branch, branchNodes]) => ({
      id: `branch_${branch}`,
      name: this.getBranchDisplayName(branch),
      nodes: branchNodes,
      type: 'branch',
      branchType: branch,
      averageDepth: branchNodes.reduce((sum, n) => sum + (n.data.context?.depth || 0), 0) / branchNodes.length
    }));
    
    return groups;
  }

  /**
   * Conversation flow grouping algorithm
   */
  async conversationFlowGrouping(nodes, relationships, parameters) {
    const { maxFlowGap, preserveDepth } = parameters;
    
    // Build conversation threads
    const threads = this.buildConversationThreads(nodes, relationships);
    
    // Group threads by flow continuity
    const flowGroups = [];
    
    for (const thread of threads) {
      const threadGroups = this.segmentThreadByFlow(thread, maxFlowGap, preserveDepth);
      flowGroups.push(...threadGroups);
    }
    
    return flowGroups;
  }

  /**
   * Hierarchical grouping algorithm
   */
  async hierarchicalGrouping(nodes, relationships, parameters) {
    const { maxDepthPerGroup, groupSiblings } = parameters;
    
    // Build hierarchy tree
    const hierarchyTree = this.buildHierarchyTree(nodes);
    
    // Group by hierarchy levels
    const hierarchyGroups = [];
    
    const processHierarchyLevel = (levelNodes, depth, parentId) => {
      if (depth > maxDepthPerGroup) return;
      
      if (groupSiblings && levelNodes.length > 1) {
        // Group siblings together
        hierarchyGroups.push({
          id: `hierarchy_${parentId}_siblings`,
          name: `Level ${depth} Siblings`,
          nodes: levelNodes,
          type: 'hierarchy',
          depth,
          parentId
        });
      } else {
        // Process each node separately
        levelNodes.forEach(node => {
          const nodeGroup = {
            id: `hierarchy_${node.id}`,
            name: `${node.data.prompt?.substring(0, 30) || 'Untitled'}...`,
            nodes: [node],
            type: 'hierarchy',
            depth,
            parentId
          };
          
          // Add children if within depth limit
          const children = this.getNodeChildren(node, nodes);
          if (children.length > 0 && depth < maxDepthPerGroup) {
            nodeGroup.nodes.push(...children);
          }
          
          hierarchyGroups.push(nodeGroup);
        });
      }
    };
    
    // Process each level
    for (let depth = 0; depth <= maxDepthPerGroup; depth++) {
      const levelNodes = nodes.filter(n => (n.data.context?.depth || 0) === depth);
      processHierarchyLevel(levelNodes, depth, null);
    }
    
    return hierarchyGroups;
  }

  /**
   * Temporal grouping algorithm
   */
  async temporalGrouping(nodes, relationships, parameters) {
    const { timeWindowMinutes, sessionGapMinutes } = parameters;
    
    // Sort nodes by timestamp
    const sortedNodes = nodes.sort((a, b) => 
      new Date(a.data.timestamp || 0) - new Date(b.data.timestamp || 0)
    );
    
    const temporalGroups = [];
    let currentGroup = null;
    
    for (const node of sortedNodes) {
      const nodeTime = new Date(node.data.timestamp || 0);
      
      if (!currentGroup) {
        // Start new group
        currentGroup = {
          id: `temporal_${temporalGroups.length}`,
          name: `Session ${temporalGroups.length + 1}`,
          nodes: [node],
          type: 'temporal',
          startTime: nodeTime,
          endTime: nodeTime
        };
      } else {
        const timeSinceLastNode = nodeTime - currentGroup.endTime;
        const sessionGap = sessionGapMinutes * 60 * 1000;
        
        if (timeSinceLastNode > sessionGap) {
          // End current group and start new one
          temporalGroups.push(currentGroup);
          currentGroup = {
            id: `temporal_${temporalGroups.length}`,
            name: `Session ${temporalGroups.length + 1}`,
            nodes: [node],
            type: 'temporal',
            startTime: nodeTime,
            endTime: nodeTime
          };
        } else {
          // Add to current group
          currentGroup.nodes.push(node);
          currentGroup.endTime = nodeTime;
        }
      }
    }
    
    // Add final group
    if (currentGroup) {
      temporalGroups.push(currentGroup);
    }
    
    return temporalGroups;
  }

  /**
   * Confidence-based grouping algorithm
   */
  async confidenceBasedGrouping(nodes, relationships, parameters) {
    const { confidenceThreshold, qualityWeight } = parameters;
    
    // Calculate quality scores for all nodes
    const nodeQualities = new Map();
    for (const node of nodes) {
      const quality = this.calculateNodeQuality(node, qualityWeight);
      nodeQualities.set(node.id, quality);
    }
    
    // Group by confidence levels
    const confidenceGroups = {
      high: [],
      medium: [],
      low: []
    };
    
    for (const node of nodes) {
      const confidence = node.data.context?.aiConfidence || 0;
      const quality = nodeQualities.get(node.id);
      
      if (confidence >= confidenceThreshold && quality > 0.7) {
        confidenceGroups.high.push(node);
      } else if (confidence >= 0.5 && quality > 0.5) {
        confidenceGroups.medium.push(node);
      } else {
        confidenceGroups.low.push(node);
      }
    }
    
    // Convert to groups format
    const groups = [];
    
    if (confidenceGroups.high.length > 0) {
      groups.push({
        id: 'high_confidence',
        name: 'High Confidence Nodes',
        nodes: confidenceGroups.high,
        type: 'confidence',
        confidenceLevel: 'high'
      });
    }
    
    if (confidenceGroups.medium.length > 0) {
      groups.push({
        id: 'medium_confidence',
        name: 'Medium Confidence Nodes',
        nodes: confidenceGroups.medium,
        type: 'confidence',
        confidenceLevel: 'medium'
      });
    }
    
    if (confidenceGroups.low.length > 0) {
      groups.push({
        id: 'low_confidence',
        name: 'Low Confidence Nodes',
        nodes: confidenceGroups.low,
        type: 'confidence',
        confidenceLevel: 'low'
      });
    }
    
    return groups;
  }

  // Helper Methods

  calculateTextSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  calculateNodeQuality(node, qualityWeight) {
    let quality = 0;
    
    // Content length factor
    const contentLength = (node.data.prompt?.length || 0) + (node.data.aiResponse?.length || 0);
    quality += Math.min(contentLength / 500, 1) * 0.3;
    
    // AI confidence factor
    quality += (node.data.context?.aiConfidence || 0) * 0.4;
    
    // Interaction depth factor
    const depth = node.data.context?.depth || 0;
    quality += Math.min(depth / 5, 1) * 0.3;
    
    return quality * qualityWeight;
  }

  generateTopicGroupName(nodes, nodeTopics) {
    const allTopics = [];
    for (const node of nodes) {
      const topics = nodeTopics.get(node.id) || [];
      allTopics.push(...topics);
    }
    
    // Find most common topic
    const topicCounts = new Map();
    for (const topic of allTopics) {
      const topicName = topic.topic || topic;
      topicCounts.set(topicName, (topicCounts.get(topicName) || 0) + 1);
    }
    
    const mostCommonTopic = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    return mostCommonTopic ? `${mostCommonTopic[0]} Discussion` : 'Topic Group';
  }

  getBranchDisplayName(branch) {
    const displayNames = {
      [BRANCH_TYPES.EXPLORATION]: 'Exploration & Ideation',
      [BRANCH_TYPES.REFINEMENT]: 'Refinement & Improvement',
      [BRANCH_TYPES.IMPLEMENTATION]: 'Implementation & Action',
      [BRANCH_TYPES.CRITIQUE]: 'Analysis & Critique'
    };
    
    return displayNames[branch] || branch;
  }

  // Additional helper methods for optimization, evaluation, etc.
  async optimizeGroups(groups, relationships, parameters) {
    // Implement group optimization logic
    return groups;
  }

  async evaluateGroupingQuality(groups, relationships) {
    // Implement quality metrics
    return {
      overallQuality: 0.8,
      cohesion: 0.75,
      separation: 0.85
    };
  }

  async generateGroupMetadata(groups, originalNodes) {
    return {
      totalGroups: groups.length,
      totalNodes: originalNodes.length,
      averageGroupSize: originalNodes.length / groups.length,
      groupTypes: groups.map(g => g.type)
    };
  }

  calculateGroupingStatistics(groups) {
    return {
      groupCount: groups.length,
      totalNodes: groups.reduce((sum, g) => sum + g.nodes.length, 0),
      averageGroupSize: groups.reduce((sum, g) => sum + g.nodes.length, 0) / groups.length,
      largestGroup: Math.max(...groups.map(g => g.nodes.length)),
      smallestGroup: Math.min(...groups.map(g => g.nodes.length))
    };
  }
}

export default SmartGroupingSystem;