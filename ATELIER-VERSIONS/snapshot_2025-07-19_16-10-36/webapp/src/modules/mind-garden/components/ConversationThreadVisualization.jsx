/**
 * Mind Garden v5.1 - Conversation Thread Visualization
 * Day 5: Advanced thread visualization with flow indicators
 */

import React, { memo, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  MessageSquare, 
  TrendingUp, 
  Zap, 
  Target,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ArrowDown,
  ArrowDownRight,
  Circle,
  Dot
} from 'lucide-react';
import { BRANCH_TYPES, CONVERSATION_FOCUS } from '../types/conversationTypes';

const ConversationThreadVisualization = memo(({ 
  nodes, 
  edges, 
  selectedNodeId, 
  onNodeSelect,
  onThreadSelect,
  showHealthIndicators = true,
  showFlowIndicators = true,
  compactMode = false 
}) => {
  // Calculate conversation threads from nodes
  const conversationThreads = useMemo(() => {
    const threads = [];
    const processedNodes = new Set();
    
    // Find root nodes (no parents)
    const rootNodes = nodes.filter(node => 
      !node.data.context?.parentChain?.length || 
      node.data.context.parentChain.length === 0
    );
    
    rootNodes.forEach(rootNode => {
      if (processedNodes.has(rootNode.id)) return;
      
      const thread = buildConversationThread(rootNode, nodes, edges, processedNodes);
      if (thread.nodes.length > 0) {
        threads.push(thread);
      }
    });
    
    return threads;
  }, [nodes, edges]);

  // Build conversation thread from root node
  const buildConversationThread = useCallback((rootNode, allNodes, allEdges, processedNodes) => {
    const threadNodes = [];
    const threadEdges = [];
    const nodeQueue = [rootNode];
    
    while (nodeQueue.length > 0) {
      const currentNode = nodeQueue.shift();
      if (processedNodes.has(currentNode.id)) continue;
      
      processedNodes.add(currentNode.id);
      threadNodes.push(currentNode);
      
      // Find children of current node
      const children = allNodes.filter(node => 
        node.data.context?.parentChain?.includes(currentNode.id) &&
        !processedNodes.has(node.id)
      );
      
      children.forEach(child => {
        nodeQueue.push(child);
        
        // Find edge connecting current node to child
        const connectingEdge = allEdges.find(edge => 
          edge.source === currentNode.id && edge.target === child.id
        );
        
        if (connectingEdge) {
          threadEdges.push(connectingEdge);
        }
      });
    }
    
    // Calculate thread metrics
    const threadMetrics = calculateThreadMetrics(threadNodes);
    
    return {
      id: rootNode.id,
      rootNode,
      nodes: threadNodes,
      edges: threadEdges,
      metrics: threadMetrics,
      depth: Math.max(...threadNodes.map(n => n.data.context?.depth || 0)),
      branches: getBranchDistribution(threadNodes),
      health: calculateThreadHealth(threadNodes),
      focus: getThreadFocus(threadNodes)
    };
  }, []);

  // Calculate thread metrics
  const calculateThreadMetrics = useCallback((threadNodes) => {
    const completedNodes = threadNodes.filter(n => n.data.state === 'complete');
    const totalPromptLength = threadNodes.reduce((sum, n) => sum + (n.data.prompt?.length || 0), 0);
    const totalResponseLength = threadNodes.reduce((sum, n) => sum + (n.data.aiResponse?.length || 0), 0);
    const avgConfidence = completedNodes.length > 0 
      ? completedNodes.reduce((sum, n) => sum + (n.data.context?.aiConfidence || 0), 0) / completedNodes.length
      : 0;
    
    return {
      totalNodes: threadNodes.length,
      completedNodes: completedNodes.length,
      avgPromptLength: totalPromptLength / threadNodes.length,
      avgResponseLength: totalResponseLength / threadNodes.length,
      avgConfidence,
      engagementScore: calculateEngagementScore(threadNodes),
      coherenceScore: calculateCoherenceScore(threadNodes)
    };
  }, []);

  // Calculate engagement score
  const calculateEngagementScore = useCallback((threadNodes) => {
    const completedNodes = threadNodes.filter(n => n.data.state === 'complete');
    if (completedNodes.length === 0) return 0;
    
    const avgInteractionLength = completedNodes.reduce((sum, node) => {
      const promptLength = node.data.prompt?.length || 0;
      const responseLength = node.data.aiResponse?.length || 0;
      return sum + promptLength + responseLength;
    }, 0) / completedNodes.length;
    
    return Math.min(avgInteractionLength / 300, 1.0); // Normalize to 0-1
  }, []);

  // Calculate coherence score
  const calculateCoherenceScore = useCallback((threadNodes) => {
    if (threadNodes.length < 2) return 1.0;
    
    let coherenceSum = 0;
    for (let i = 1; i < threadNodes.length; i++) {
      const prevNode = threadNodes[i - 1];
      const currNode = threadNodes[i];
      
      const prevWords = new Set((prevNode.data.prompt || '').toLowerCase().split(/\s+/));
      const currWords = new Set((currNode.data.prompt || '').toLowerCase().split(/\s+/));
      
      const overlap = new Set([...prevWords].filter(word => currWords.has(word) && word.length > 3));
      const union = new Set([...prevWords, ...currWords]);
      
      coherenceSum += overlap.size / Math.max(union.size, 1);
    }
    
    return coherenceSum / (threadNodes.length - 1);
  }, []);

  // Get branch distribution
  const getBranchDistribution = useCallback((threadNodes) => {
    const distribution = {};
    Object.values(BRANCH_TYPES).forEach(type => {
      distribution[type] = threadNodes.filter(n => n.data.context?.branch === type).length;
    });
    return distribution;
  }, []);

  // Calculate thread health
  const calculateThreadHealth = useCallback((threadNodes) => {
    const metrics = calculateThreadMetrics(threadNodes);
    const healthScore = (
      metrics.avgConfidence * 0.3 +
      metrics.engagementScore * 0.3 +
      metrics.coherenceScore * 0.2 +
      (metrics.completedNodes / metrics.totalNodes) * 0.2
    );
    
    if (healthScore > 0.8) return 'excellent';
    if (healthScore > 0.6) return 'good';
    if (healthScore > 0.4) return 'fair';
    return 'poor';
  }, [calculateThreadMetrics]);

  // Get thread focus
  const getThreadFocus = useCallback((threadNodes) => {
    const focusCount = {};
    Object.values(CONVERSATION_FOCUS).forEach(focus => {
      focusCount[focus] = threadNodes.filter(n => n.data.context?.conversationFocus === focus).length;
    });
    
    const maxCount = Math.max(...Object.values(focusCount));
    const primaryFocus = Object.keys(focusCount).find(key => focusCount[key] === maxCount);
    
    return primaryFocus || CONVERSATION_FOCUS.CREATIVE;
  }, []);

  // Get thread icon based on focus
  const getThreadIcon = useCallback((focus) => {
    switch (focus) {
      case CONVERSATION_FOCUS.CREATIVE:
        return <Zap className="w-4 h-4" />;
      case CONVERSATION_FOCUS.TECHNICAL:
        return <Target className="w-4 h-4" />;
      case CONVERSATION_FOCUS.STRATEGIC:
        return <TrendingUp className="w-4 h-4" />;
      case CONVERSATION_FOCUS.ANALYTICAL:
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  }, []);

  // Get health indicator
  const getHealthIndicator = useCallback((health) => {
    switch (health) {
      case 'excellent':
        return { color: 'text-green-500', icon: <CheckCircle className="w-3 h-3" /> };
      case 'good':
        return { color: 'text-blue-500', icon: <Circle className="w-3 h-3" /> };
      case 'fair':
        return { color: 'text-yellow-500', icon: <AlertCircle className="w-3 h-3" /> };
      case 'poor':
        return { color: 'text-red-500', icon: <AlertCircle className="w-3 h-3" /> };
      default:
        return { color: 'text-gray-500', icon: <Dot className="w-3 h-3" /> };
    }
  }, []);

  // Get branch icon
  const getBranchIcon = useCallback((branchType) => {
    switch (branchType) {
      case BRANCH_TYPES.EXPLORATION:
        return <ArrowRight className="w-3 h-3" />;
      case BRANCH_TYPES.REFINEMENT:
        return <ArrowDownRight className="w-3 h-3" />;
      case BRANCH_TYPES.IMPLEMENTATION:
        return <ArrowDown className="w-3 h-3" />;
      case BRANCH_TYPES.CRITIQUE:
        return <GitBranch className="w-3 h-3" />;
      default:
        return <ArrowRight className="w-3 h-3" />;
    }
  }, []);

  // Handle thread selection
  const handleThreadSelect = useCallback((thread) => {
    onThreadSelect?.(thread);
    onNodeSelect?.(thread.rootNode.id);
  }, [onThreadSelect, onNodeSelect]);

  return (
    <div className="conversation-thread-visualization">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Conversation Threads ({conversationThreads.length})
        </h3>
        
        {showHealthIndicators && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Health:</span>
            <div className="flex space-x-1">
              {conversationThreads.map(thread => {
                const indicator = getHealthIndicator(thread.health);
                return (
                  <div key={thread.id} className={`${indicator.color}`}>
                    {indicator.icon}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {conversationThreads.map((thread, threadIndex) => (
            <motion.div
              key={thread.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: threadIndex * 0.1 }}
              className={`conversation-thread-item ${
                selectedNodeId === thread.id ? 'selected' : ''
              }`}
              onClick={() => handleThreadSelect(thread)}
            >
              {/* Thread Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {getThreadIcon(thread.focus)}
                    <span className="font-medium text-gray-800">
                      {thread.rootNode.data.prompt?.substring(0, 50) || 'Untitled Thread'}
                      {thread.rootNode.data.prompt?.length > 50 && '...'}
                    </span>
                  </div>
                  
                  {showHealthIndicators && (
                    <div className={`flex items-center space-x-1 ${getHealthIndicator(thread.health).color}`}>
                      {getHealthIndicator(thread.health).icon}
                      <span className="text-xs font-medium">{thread.health}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{thread.nodes.length} nodes</span>
                  <span>•</span>
                  <span>depth {thread.depth}</span>
                </div>
              </div>

              {/* Thread Metrics */}
              {!compactMode && (
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500">Engagement:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${thread.metrics.engagementScore * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500">Coherence:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${thread.metrics.coherenceScore * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Branch Distribution */}
              {showFlowIndicators && (
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs text-gray-500">Flow:</span>
                  <div className="flex space-x-1">
                    {Object.entries(thread.branches).map(([branchType, count]) => (
                      count > 0 && (
                        <div 
                          key={branchType}
                          className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs"
                          style={{
                            backgroundColor: getBranchColor(branchType),
                            color: getBranchTextColor(branchType)
                          }}
                        >
                          {getBranchIcon(branchType)}
                          <span>{count}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Thread Nodes Preview */}
              <div className="flex items-center space-x-1 overflow-x-auto">
                {thread.nodes.slice(0, 8).map((node, nodeIndex) => (
                  <motion.div
                    key={node.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: nodeIndex * 0.05 }}
                    className={`conversation-node-preview ${
                      selectedNodeId === node.id ? 'selected' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNodeSelect?.(node.id);
                    }}
                    title={node.data.prompt || 'Empty node'}
                  >
                    <div className="w-2 h-2 rounded-full bg-current opacity-70" />
                    {node.data.state === 'complete' && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </motion.div>
                ))}
                
                {thread.nodes.length > 8 && (
                  <div className="text-xs text-gray-500 px-2">
                    +{thread.nodes.length - 8} more
                  </div>
                )}
              </div>

              {/* Thread Progress Bar */}
              {!compactMode && (
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(thread.metrics.completedNodes / thread.metrics.totalNodes) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {thread.metrics.completedNodes}/{thread.metrics.totalNodes}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});

// Helper functions
const getBranchColor = (branchType) => {
  switch (branchType) {
    case BRANCH_TYPES.EXPLORATION:
      return 'rgba(59, 130, 246, 0.1)';
    case BRANCH_TYPES.REFINEMENT:
      return 'rgba(147, 51, 234, 0.1)';
    case BRANCH_TYPES.IMPLEMENTATION:
      return 'rgba(34, 197, 94, 0.1)';
    case BRANCH_TYPES.CRITIQUE:
      return 'rgba(239, 68, 68, 0.1)';
    default:
      return 'rgba(156, 163, 175, 0.1)';
  }
};

const getBranchTextColor = (branchType) => {
  switch (branchType) {
    case BRANCH_TYPES.EXPLORATION:
      return '#3b82f6';
    case BRANCH_TYPES.REFINEMENT:
      return '#9333ea';
    case BRANCH_TYPES.IMPLEMENTATION:
      return '#22c55e';
    case BRANCH_TYPES.CRITIQUE:
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

ConversationThreadVisualization.displayName = 'ConversationThreadVisualization';

export default ConversationThreadVisualization;