/**
 * Mind Garden v5.1 - Context Analysis System
 * Analyzes conversation parent chains and builds contextual intelligence
 */

import { CONVERSATION_FOCUS, BRANCH_TYPES, getContextIndicator } from '../modules/mind-garden/types/conversationTypes';

export class ContextAnalyzer {
  constructor(intelligenceEngine) {
    this.ai = intelligenceEngine;
  }

  /**
   * Analyze conversation focus from parent chain
   * Determines whether conversation is creative, technical, strategic, etc.
   */
  analyzeConversationFocus(parentChain) {
    if (!parentChain || parentChain.length === 0) {
      return CONVERSATION_FOCUS.CREATIVE; // Default for new conversations
    }

    // Analyze content keywords to determine focus
    const allText = parentChain
      .map(node => `${node.prompt} ${node.aiResponse}`)
      .join(' ')
      .toLowerCase();

    // Technical indicators
    const technicalWords = ['implement', 'code', 'setup', 'technical', 'system', 'api', 'function', 'build', 'develop'];
    const technicalScore = technicalWords.reduce((score, word) => 
      score + (allText.split(word).length - 1), 0);

    // Strategic indicators  
    const strategicWords = ['plan', 'strategy', 'goal', 'roadmap', 'timeline', 'business', 'market', 'launch'];
    const strategicScore = strategicWords.reduce((score, word) => 
      score + (allText.split(word).length - 1), 0);

    // Analytical indicators
    const analyticalWords = ['analyze', 'compare', 'evaluate', 'assess', 'study', 'research', 'examine'];
    const analyticalScore = analyticalWords.reduce((score, word) => 
      score + (allText.split(word).length - 1), 0);

    // Creative indicators (default)
    const creativeWords = ['idea', 'creative', 'art', 'design', 'inspire', 'imagine', 'concept', 'visual'];
    const creativeScore = creativeWords.reduce((score, word) => 
      score + (allText.split(word).length - 1), 0);

    // Determine focus based on highest score
    const scores = {
      [CONVERSATION_FOCUS.TECHNICAL]: technicalScore,
      [CONVERSATION_FOCUS.STRATEGIC]: strategicScore,
      [CONVERSATION_FOCUS.ANALYTICAL]: analyticalScore,
      [CONVERSATION_FOCUS.CREATIVE]: creativeScore + 1 // Slight bias toward creative
    };

    const maxScore = Math.max(...Object.values(scores));
    return Object.keys(scores).find(key => scores[key] === maxScore) || CONVERSATION_FOCUS.CREATIVE;
  }

  /**
   * Extract primary topic from conversation history
   */
  extractPrimaryTopic(parentChain) {
    if (!parentChain || parentChain.length === 0) {
      return 'New Idea';
    }

    // Use the first node's prompt as base topic
    const rootPrompt = parentChain[0]?.prompt || '';
    
    // Extract key phrases (simple keyword extraction)
    const words = rootPrompt.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['what', 'how', 'why', 'when', 'where', 'this', 'that', 'with', 'from', 'into'].includes(word));

    if (words.length === 0) {
      return 'Exploration';
    }

    // Return first meaningful words as topic
    return words.slice(0, 3).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  /**
   * Analyze conversation flow pattern
   */
  analyzeFlow(parentChain) {
    if (!parentChain || parentChain.length <= 1) {
      return 'linear';
    }

    // Count branch types
    const branchCounts = parentChain.reduce((counts, node) => {
      const branch = node.branch || BRANCH_TYPES.EXPLORATION;
      counts[branch] = (counts[branch] || 0) + 1;
      return counts;
    }, {});

    const totalNodes = parentChain.length;
    const branchTypes = Object.keys(branchCounts).length;

    // Determine flow pattern
    if (branchTypes === 1) {
      return 'linear';
    } else if (branchTypes >= 3) {
      return 'branching';
    } else if (branchCounts[BRANCH_TYPES.REFINEMENT] > totalNodes * 0.3) {
      return 'cyclical'; // Lots of refinement suggests iterative approach
    }

    return 'branching';
  }

  /**
   * Calculate conversation depth metrics
   */
  calculateDepthMetrics(parentChain) {
    const depth = parentChain.length;
    const contextIndicator = getContextIndicator(depth);
    
    return {
      depth,
      indicator: contextIndicator.indicator,
      color: contextIndicator.color,
      meaning: contextIndicator.meaning,
      complexity: depth > 5 ? 'high' : depth > 2 ? 'medium' : 'low'
    };
  }

  /**
   * Analyze conversation for export readiness
   */
  analyzeExportReadiness(conversationThread) {
    const { nodes, metadata } = conversationThread;
    
    // Count completed conversations
    const completedNodes = nodes.filter(node => 
      node.data.state === 'complete' && 
      node.data.aiResponse
    );

    // Check for meaningful content
    const hasSubstantialContent = completedNodes.some(node => 
      (node.data.prompt?.length || 0) > 20 && 
      (node.data.aiResponse?.length || 0) > 50
    );

    // Check for depth
    const hasDepth = metadata.totalDepth >= 2;

    // Check for insights
    const hasInsights = nodes.some(node => 
      node.data.context?.branch === BRANCH_TYPES.IMPLEMENTATION ||
      node.data.context?.branch === BRANCH_TYPES.CRITIQUE
    );

    const score = [
      hasSubstantialContent,
      hasDepth,
      hasInsights,
      completedNodes.length >= 3
    ].filter(Boolean).length;

    return {
      ready: score >= 2,
      score: score / 4,
      recommendations: this.generateExportRecommendations(score, conversationThread)
    };
  }

  /**
   * Generate recommendations for improving export readiness
   */
  generateExportRecommendations(score, conversationThread) {
    const recommendations = [];

    if (conversationThread.nodes.length < 3) {
      recommendations.push('Continue the conversation - add more depth with follow-up questions');
    }

    if (conversationThread.metadata.totalDepth < 2) {
      recommendations.push('Create child nodes to explore ideas deeper');
    }

    const hasImplementation = conversationThread.nodes.some(node => 
      node.data.context?.branch === BRANCH_TYPES.IMPLEMENTATION
    );
    if (!hasImplementation) {
      recommendations.push('Add implementation-focused nodes to make ideas actionable');
    }

    const hasCritique = conversationThread.nodes.some(node => 
      node.data.context?.branch === BRANCH_TYPES.CRITIQUE
    );
    if (!hasCritique) {
      recommendations.push('Consider adding critical analysis to strengthen ideas');
    }

    if (recommendations.length === 0) {
      recommendations.push('Conversation is ready for export to Canvas');
    }

    return recommendations;
  }

  /**
   * Extract key insights from conversation
   */
  extractKeyInsights(parentChain) {
    if (!parentChain || parentChain.length === 0) {
      return [];
    }

    const insights = [];

    // Look for implementation nodes
    const implementationNodes = parentChain.filter(node => 
      node.branch === BRANCH_TYPES.IMPLEMENTATION
    );
    implementationNodes.forEach(node => {
      if (node.aiResponse && node.aiResponse.length > 50) {
        insights.push({
          type: 'implementation',
          title: node.prompt,
          content: node.aiResponse,
          source: 'ai_analysis'
        });
      }
    });

    // Look for critique nodes
    const critiqueNodes = parentChain.filter(node => 
      node.branch === BRANCH_TYPES.CRITIQUE
    );
    critiqueNodes.forEach(node => {
      if (node.aiResponse && node.aiResponse.length > 50) {
        insights.push({
          type: 'critique',
          title: node.prompt,
          content: node.aiResponse,
          source: 'ai_analysis'
        });
      }
    });

    // Look for refinement insights
    const refinementNodes = parentChain.filter(node => 
      node.branch === BRANCH_TYPES.REFINEMENT
    );
    if (refinementNodes.length > 0) {
      insights.push({
        type: 'refinement',
        title: 'Refinement Process',
        content: `${refinementNodes.length} iterations of refinement, focusing on improving and enhancing the core concepts.`,
        source: 'pattern_analysis'
      });
    }

    return insights.slice(0, 5); // Limit to top 5 insights
  }

  /**
   * Extract action items from conversation
   */
  extractActionItems(parentChain) {
    if (!parentChain || parentChain.length === 0) {
      return [];
    }

    const actionItems = [];

    // Look for action-oriented language in AI responses
    const actionWords = ['implement', 'create', 'build', 'develop', 'design', 'setup', 'configure'];
    
    parentChain.forEach(node => {
      if (node.aiResponse) {
        const sentences = node.aiResponse.split(/[.!?]+/);
        sentences.forEach(sentence => {
          const hasActionWord = actionWords.some(word => 
            sentence.toLowerCase().includes(word)
          );
          
          if (hasActionWord && sentence.length > 20 && sentence.length < 150) {
            actionItems.push({
              action: sentence.trim(),
              details: `From conversation: "${node.prompt}"`,
              urgency: node.branch === BRANCH_TYPES.IMPLEMENTATION ? 'high' : 'medium',
              source: 'conversation_analysis'
            });
          }
        });
      }
    });

    return actionItems.slice(0, 8); // Limit to top 8 action items
  }

  /**
   * Analyze relationships between conversation nodes
   */
  analyzeRelationships(parentChain) {
    if (!parentChain || parentChain.length < 2) {
      return [];
    }

    const relationships = [];

    // Analyze parent-child relationships
    for (let i = 1; i < parentChain.length; i++) {
      const parent = parentChain[i - 1];
      const child = parentChain[i];
      
      relationships.push({
        sourceId: parent.id,
        targetId: child.id,
        relationshipType: this.determineRelationshipType(parent, child),
        strength: this.calculateRelationshipStrength(parent, child)
      });
    }

    return relationships;
  }

  /**
   * Determine relationship type between two nodes
   */
  determineRelationshipType(parentNode, childNode) {
    if (!childNode.branch) {
      return 'continuation';
    }

    switch (childNode.branch) {
      case BRANCH_TYPES.EXPLORATION:
        return 'expansion';
      case BRANCH_TYPES.REFINEMENT:
        return 'refinement';
      case BRANCH_TYPES.IMPLEMENTATION:
        return 'implementation';
      case BRANCH_TYPES.CRITIQUE:
        return 'analysis';
      default:
        return 'continuation';
    }
  }

  /**
   * Calculate relationship strength between nodes
   */
  calculateRelationshipStrength(parentNode, childNode) {
    // Base strength on content similarity and branch type
    let strength = 0.5; // Base strength

    // Stronger if implementation or critique
    if (childNode.branch === BRANCH_TYPES.IMPLEMENTATION || 
        childNode.branch === BRANCH_TYPES.CRITIQUE) {
      strength += 0.3;
    }

    // Stronger if content references parent
    if (childNode.prompt && parentNode.aiResponse) {
      const parentWords = parentNode.aiResponse.toLowerCase().split(/\s+/);
      const childWords = childNode.prompt.toLowerCase().split(/\s+/);
      const overlap = parentWords.filter(word => childWords.includes(word)).length;
      const similarity = overlap / Math.max(parentWords.length, childWords.length);
      strength += similarity * 0.2;
    }

    return Math.min(strength, 1.0);
  }
}

export default ContextAnalyzer;