/**
 * Mind Garden v5.1 - Advanced Conversation Analysis
 * Day 4: Sophisticated conversation pattern recognition and optimization
 */

import { CONVERSATION_FOCUS, BRANCH_TYPES } from '../modules/mind-garden/types/conversationTypes';

export class ConversationAnalyzer {
  constructor() {
    this.intentPatterns = this.initializeIntentPatterns();
    this.topicKeywords = this.initializeTopicKeywords();
    this.contextualCues = this.initializeContextualCues();
    this.sentimentIndicators = this.initializeSentimentIndicators();
  }

  /**
   * Initialize intent detection patterns for branch optimization
   */
  initializeIntentPatterns() {
    return {
      [BRANCH_TYPES.EXPLORATION]: {
        keywords: ['explore', 'what if', 'imagine', 'consider', 'possibility', 'alternative', 'wonder', 'brainstorm', 'idea', 'concept'],
        phrases: ['what about', 'how might we', 'could we', 'what would happen', 'let\'s explore', 'another way'],
        contextClues: ['open-ended', 'creative', 'divergent', 'ideation'],
        confidence: 0.8
      },
      
      [BRANCH_TYPES.REFINEMENT]: {
        keywords: ['improve', 'better', 'enhance', 'refine', 'optimize', 'polish', 'adjust', 'modify', 'upgrade', 'perfect'],
        phrases: ['make it better', 'how can we improve', 'refine this', 'enhance the', 'optimize for'],
        contextClues: ['iterative', 'improvement', 'enhancement', 'optimization'],
        confidence: 0.85
      },
      
      [BRANCH_TYPES.IMPLEMENTATION]: {
        keywords: ['implement', 'build', 'create', 'develop', 'code', 'setup', 'configure', 'deploy', 'execute', 'make'],
        phrases: ['how do we', 'let\'s build', 'implement this', 'create a', 'set up', 'put together'],
        contextClues: ['actionable', 'practical', 'concrete', 'executable'],
        confidence: 0.9
      },
      
      [BRANCH_TYPES.CRITIQUE]: {
        keywords: ['analyze', 'evaluate', 'assess', 'critique', 'review', 'examine', 'problem', 'issue', 'challenge', 'weakness'],
        phrases: ['what\'s wrong', 'problems with', 'analyze this', 'evaluate the', 'issues might be'],
        contextClues: ['analytical', 'critical', 'evaluative', 'assessment'],
        confidence: 0.75
      }
    };
  }

  /**
   * Initialize topic extraction keywords for different domains
   */
  initializeTopicKeywords() {
    return {
      creative: {
        primary: ['art', 'design', 'creative', 'visual', 'aesthetic', 'style', 'concept', 'inspiration', 'mood', 'theme'],
        secondary: ['color', 'composition', 'texture', 'form', 'beauty', 'artistic', 'imagery', 'symbolic'],
        weight: 1.2
      },
      
      technical: {
        primary: ['code', 'system', 'architecture', 'implementation', 'framework', 'technology', 'software', 'hardware', 'database'],
        secondary: ['algorithm', 'performance', 'optimization', 'security', 'scalability', 'integration', 'deployment'],
        weight: 1.3
      },
      
      strategic: {
        primary: ['strategy', 'plan', 'goal', 'objective', 'timeline', 'roadmap', 'business', 'market', 'vision', 'mission'],
        secondary: ['competitive', 'advantage', 'growth', 'opportunity', 'risk', 'investment', 'resources'],
        weight: 1.1
      },
      
      analytical: {
        primary: ['analyze', 'data', 'research', 'study', 'examine', 'investigate', 'evaluate', 'measure', 'compare'],
        secondary: ['statistics', 'metrics', 'insights', 'findings', 'evidence', 'patterns', 'trends'],
        weight: 1.0
      }
    };
  }

  /**
   * Initialize contextual cues for conversation flow analysis
   */
  initializeContextualCues() {
    return {
      divergent: ['many', 'various', 'different', 'multiple', 'several', 'diverse', 'alternative'],
      convergent: ['specific', 'focus', 'narrow', 'precise', 'exact', 'particular', 'definite'],
      temporal: ['first', 'then', 'next', 'after', 'before', 'finally', 'sequence', 'step'],
      causal: ['because', 'therefore', 'since', 'due to', 'as a result', 'consequently'],
      comparative: ['compare', 'contrast', 'versus', 'difference', 'similar', 'unlike'],
      emotional: ['feel', 'emotion', 'excited', 'concerned', 'passionate', 'worried', 'confident']
    };
  }

  /**
   * Initialize sentiment indicators for conversation tone analysis
   */
  initializeSentimentIndicators() {
    return {
      positive: ['great', 'excellent', 'amazing', 'love', 'fantastic', 'wonderful', 'brilliant', 'perfect'],
      negative: ['problem', 'issue', 'difficult', 'challenge', 'wrong', 'bad', 'terrible', 'awful'],
      neutral: ['okay', 'fine', 'standard', 'normal', 'regular', 'typical', 'usual'],
      uncertain: ['maybe', 'perhaps', 'possibly', 'might', 'could', 'uncertain', 'unsure', 'unclear']
    };
  }

  /**
   * Detect optimal branch intent based on conversation context and user input
   */
  detectBranchIntent(prompt, conversationHistory, currentBranch = BRANCH_TYPES.EXPLORATION) {
    const promptLower = prompt.toLowerCase();
    const scores = {};
    
    // Calculate intent scores for each branch type
    Object.entries(this.intentPatterns).forEach(([branchType, patterns]) => {
      let score = 0;
      
      // Keyword matching
      patterns.keywords.forEach(keyword => {
        if (promptLower.includes(keyword)) {
          score += 1.0;
        }
      });
      
      // Phrase matching (higher weight)
      patterns.phrases.forEach(phrase => {
        if (promptLower.includes(phrase)) {
          score += 1.5;
        }
      });
      
      // Context clue analysis
      patterns.contextClues.forEach(clue => {
        if (promptLower.includes(clue)) {
          score += 0.8;
        }
      });
      
      // Apply confidence multiplier
      score *= patterns.confidence;
      
      scores[branchType] = score;
    });

    // Analyze conversation history for context
    const historyContext = this.analyzeHistoryContext(conversationHistory);
    
    // Apply history-based adjustments
    Object.keys(scores).forEach(branchType => {
      scores[branchType] += historyContext[branchType] || 0;
    });

    // Find the branch with highest score
    const maxScore = Math.max(...Object.values(scores));
    const detectedBranch = Object.keys(scores).find(key => scores[key] === maxScore);
    
    // Only suggest change if confidence is high enough and different from current
    const shouldChangeBranch = maxScore > 2.0 && detectedBranch !== currentBranch;
    
    return {
      suggestedBranch: shouldChangeBranch ? detectedBranch : currentBranch,
      confidence: Math.min(maxScore / 5.0, 1.0), // Normalize to 0-1
      scores,
      reasoning: this.generateReasoningExplanation(detectedBranch, maxScore, scores)
    };
  }

  /**
   * Analyze conversation history for context patterns
   */
  analyzeHistoryContext(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return {};
    }

    const recentNodes = conversationHistory.slice(-3); // Focus on last 3 exchanges
    const branchDistribution = {};
    
    // Count recent branch types
    recentNodes.forEach(node => {
      const branch = node.branch || BRANCH_TYPES.EXPLORATION;
      branchDistribution[branch] = (branchDistribution[branch] || 0) + 1;
    });

    // Apply diversity bonus/penalty
    const adjustments = {};
    const totalRecent = recentNodes.length;
    
    Object.values(BRANCH_TYPES).forEach(branchType => {
      const count = branchDistribution[branchType] || 0;
      const ratio = count / totalRecent;
      
      // Encourage diversity - penalize overused branches, bonus for underused
      if (ratio > 0.6) {
        adjustments[branchType] = -0.5; // Penalty for overuse
      } else if (ratio === 0 && totalRecent >= 2) {
        adjustments[branchType] = 0.3; // Bonus for unused branches
      }
    });

    return adjustments;
  }

  /**
   * Enhanced conversation focus analysis with advanced heuristics
   */
  analyzeAdvancedConversationFocus(conversationHistory, currentPrompt) {
    const allText = [
      ...conversationHistory.map(node => `${node.prompt} ${node.aiResponse || ''}`),
      currentPrompt
    ].join(' ').toLowerCase();

    const focusScores = {};
    
    // Calculate weighted scores for each focus type
    Object.entries(this.topicKeywords).forEach(([focus, keywords]) => {
      let score = 0;
      
      // Primary keyword scoring
      keywords.primary.forEach(keyword => {
        const occurrences = (allText.match(new RegExp(keyword, 'g')) || []).length;
        score += occurrences * 2.0;
      });
      
      // Secondary keyword scoring
      keywords.secondary.forEach(keyword => {
        const occurrences = (allText.match(new RegExp(keyword, 'g')) || []).length;
        score += occurrences * 1.0;
      });
      
      // Apply focus weight
      score *= keywords.weight;
      
      focusScores[focus] = score;
    });

    // Add contextual analysis
    const contextualScore = this.analyzeContextualPatterns(allText);
    Object.keys(focusScores).forEach(focus => {
      focusScores[focus] += contextualScore[focus] || 0;
    });

    // Determine primary focus
    const maxScore = Math.max(...Object.values(focusScores));
    const primaryFocus = Object.keys(focusScores).find(key => focusScores[key] === maxScore);
    
    // Map to CONVERSATION_FOCUS constants
    const focusMapping = {
      creative: CONVERSATION_FOCUS.CREATIVE,
      technical: CONVERSATION_FOCUS.TECHNICAL,
      strategic: CONVERSATION_FOCUS.STRATEGIC,
      analytical: CONVERSATION_FOCUS.ANALYTICAL
    };

    return {
      primaryFocus: focusMapping[primaryFocus] || CONVERSATION_FOCUS.CREATIVE,
      confidence: Math.min(maxScore / 10.0, 1.0),
      scores: focusScores,
      breakdown: this.generateFocusBreakdown(focusScores)
    };
  }

  /**
   * Analyze contextual patterns for additional insights
   */
  analyzeContextualPatterns(text) {
    const patterns = {};
    
    // Check for divergent vs convergent thinking
    const divergentCount = this.contextualCues.divergent.reduce((count, word) => 
      count + (text.split(word).length - 1), 0);
    const convergentCount = this.contextualCues.convergent.reduce((count, word) => 
      count + (text.split(word).length - 1), 0);
    
    if (divergentCount > convergentCount) {
      patterns.creative = 1.0;
    } else if (convergentCount > divergentCount) {
      patterns.technical = 1.0;
      patterns.analytical = 0.5;
    }

    // Check for temporal patterns (step-by-step thinking)
    const temporalCount = this.contextualCues.temporal.reduce((count, word) => 
      count + (text.split(word).length - 1), 0);
    if (temporalCount > 2) {
      patterns.strategic = 1.0;
      patterns.technical = 0.5;
    }

    // Check for causal reasoning
    const causalCount = this.contextualCues.causal.reduce((count, word) => 
      count + (text.split(word).length - 1), 0);
    if (causalCount > 1) {
      patterns.analytical = 1.5;
    }

    return patterns;
  }

  /**
   * Enhanced topic extraction with semantic clustering
   */
  extractAdvancedTopics(conversationHistory, maxTopics = 5) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return [];
    }

    const allText = conversationHistory
      .map(node => `${node.prompt} ${node.aiResponse || ''}`)
      .join(' ')
      .toLowerCase();

    // Extract potential topics using various methods
    const topics = new Map();
    
    // Method 1: Named entity-like extraction (simple heuristic)
    const sentences = allText.split(/[.!?]+/);
    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/)
        .filter(word => word.length > 4)
        .filter(word => !this.isStopWord(word));
      
      // Look for noun phrases (simple heuristic)
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = `${words[i]} ${words[i + 1]}`;
        if (this.isPotentialTopic(phrase)) {
          topics.set(phrase, (topics.get(phrase) || 0) + 1);
        }
      }
      
      // Single important words
      words.forEach(word => {
        if (this.isPotentialTopic(word)) {
          topics.set(word, (topics.get(word) || 0) + 0.5);
        }
      });
    });

    // Method 2: Domain-specific topic detection
    Object.entries(this.topicKeywords).forEach(([domain, keywords]) => {
      keywords.primary.forEach(keyword => {
        const count = (allText.match(new RegExp(keyword, 'g')) || []).length;
        if (count > 0) {
          topics.set(keyword, (topics.get(keyword) || 0) + count * 2);
        }
      });
    });

    // Sort and return top topics
    return Array.from(topics.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxTopics)
      .map(([topic, weight]) => ({
        topic: this.capitalizeTopic(topic),
        weight,
        relevance: Math.min(weight / 3.0, 1.0)
      }));
  }

  /**
   * Analyze conversation sentiment and emotional trajectory
   */
  analyzeSentiment(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return { overall: 'neutral', trajectory: 'stable', confidence: 0.5 };
    }

    const sentimentScores = conversationHistory.map(node => {
      const text = `${node.prompt} ${node.aiResponse || ''}`.toLowerCase();
      let score = 0;
      
      // Count sentiment indicators
      this.sentimentIndicators.positive.forEach(word => {
        score += (text.split(word).length - 1) * 1;
      });
      this.sentimentIndicators.negative.forEach(word => {
        score += (text.split(word).length - 1) * -1;
      });
      this.sentimentIndicators.uncertain.forEach(word => {
        score += (text.split(word).length - 1) * -0.3;
      });
      
      return score;
    });

    // Calculate overall sentiment
    const avgSentiment = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;
    
    // Determine trajectory
    const recentScores = sentimentScores.slice(-3);
    const earlyScores = sentimentScores.slice(0, 3);
    const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const earlyAvg = earlyScores.reduce((sum, score) => sum + score, 0) / earlyScores.length;
    
    let trajectory = 'stable';
    if (recentAvg > earlyAvg + 0.5) trajectory = 'improving';
    else if (recentAvg < earlyAvg - 0.5) trajectory = 'declining';

    return {
      overall: avgSentiment > 0.5 ? 'positive' : avgSentiment < -0.5 ? 'negative' : 'neutral',
      trajectory,
      confidence: Math.min(Math.abs(avgSentiment) / 2.0, 1.0),
      scores: sentimentScores
    };
  }

  /**
   * Generate conversation health metrics
   */
  generateHealthMetrics(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return { health: 'new', score: 1.0, recommendations: ['Start exploring your ideas'] };
    }

    const metrics = {
      depth: conversationHistory.length,
      diversity: this.calculateBranchDiversity(conversationHistory),
      engagement: this.calculateEngagementLevel(conversationHistory),
      coherence: this.calculateCoherence(conversationHistory),
      productivity: this.calculateProductivity(conversationHistory)
    };

    // Calculate overall health score
    const healthScore = (
      Math.min(metrics.depth / 5.0, 1.0) * 0.2 +
      metrics.diversity * 0.25 +
      metrics.engagement * 0.25 +
      metrics.coherence * 0.15 +
      metrics.productivity * 0.15
    );

    // Generate health status
    let health = 'poor';
    if (healthScore > 0.8) health = 'excellent';
    else if (healthScore > 0.6) health = 'good';
    else if (healthScore > 0.4) health = 'fair';

    return {
      health,
      score: healthScore,
      metrics,
      recommendations: this.generateHealthRecommendations(metrics, healthScore)
    };
  }

  // Helper methods
  calculateBranchDiversity(history) {
    const branches = history.map(node => node.branch || BRANCH_TYPES.EXPLORATION);
    const uniqueBranches = new Set(branches);
    return uniqueBranches.size / Object.keys(BRANCH_TYPES).length;
  }

  calculateEngagementLevel(history) {
    const avgPromptLength = history.reduce((sum, node) => 
      sum + (node.prompt?.length || 0), 0) / history.length;
    const avgResponseLength = history.reduce((sum, node) => 
      sum + (node.aiResponse?.length || 0), 0) / history.length;
    
    // Higher engagement = longer, more detailed exchanges
    return Math.min((avgPromptLength + avgResponseLength) / 500, 1.0);
  }

  calculateCoherence(history) {
    // Simple heuristic: check for keyword overlap between consecutive nodes
    if (history.length < 2) return 1.0;
    
    let coherenceSum = 0;
    for (let i = 1; i < history.length; i++) {
      const prevWords = new Set((history[i-1].prompt || '').toLowerCase().split(/\s+/));
      const currWords = new Set((history[i].prompt || '').toLowerCase().split(/\s+/));
      const overlap = new Set([...prevWords].filter(word => currWords.has(word)));
      coherenceSum += overlap.size / Math.max(prevWords.size, currWords.size);
    }
    
    return coherenceSum / (history.length - 1);
  }

  calculateProductivity(history) {
    // Count actionable insights and implementation-focused nodes
    const actionableNodes = history.filter(node => 
      node.branch === BRANCH_TYPES.IMPLEMENTATION ||
      (node.aiResponse && node.aiResponse.includes('implement')) ||
      (node.aiResponse && node.aiResponse.includes('action'))
    );
    
    return actionableNodes.length / history.length;
  }

  generateHealthRecommendations(metrics, healthScore) {
    const recommendations = [];
    
    if (metrics.diversity < 0.5) {
      recommendations.push('Try exploring different types of branches (implementation, critique, refinement)');
    }
    
    if (metrics.engagement < 0.4) {
      recommendations.push('Add more detail to your prompts for richer AI responses');
    }
    
    if (metrics.coherence < 0.3) {
      recommendations.push('Build more directly on previous conversation points');
    }
    
    if (metrics.productivity < 0.2) {
      recommendations.push('Focus on actionable outcomes and implementation steps');
    }
    
    if (healthScore > 0.8) {
      recommendations.push('Excellent conversation flow! Consider exporting to Canvas');
    }
    
    return recommendations.length > 0 ? recommendations : ['Keep exploring and developing your ideas'];
  }

  // Utility methods
  isStopWord(word) {
    const stopWords = ['the', 'and', 'that', 'this', 'with', 'from', 'they', 'have', 'been', 'were', 'said', 'each', 'which', 'their'];
    return stopWords.includes(word.toLowerCase());
  }

  isPotentialTopic(phrase) {
    return phrase.length > 3 && 
           !this.isStopWord(phrase) && 
           /^[a-zA-Z\s]+$/.test(phrase) &&
           !phrase.includes('could') &&
           !phrase.includes('should') &&
           !phrase.includes('would');
  }

  capitalizeTopic(topic) {
    return topic.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  generateReasoningExplanation(branch, score, allScores) {
    if (score < 1.0) return 'No clear intent detected';
    
    const explanations = {
      [BRANCH_TYPES.EXPLORATION]: 'Detected exploratory language and open-ended questioning',
      [BRANCH_TYPES.REFINEMENT]: 'Identified improvement-focused keywords and optimization intent',
      [BRANCH_TYPES.IMPLEMENTATION]: 'Found action-oriented language and practical implementation cues',
      [BRANCH_TYPES.CRITIQUE]: 'Recognized analytical and evaluative language patterns'
    };
    
    return explanations[branch] || 'General conversation pattern detected';
  }

  generateFocusBreakdown(scores) {
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    if (total === 0) return {};
    
    const breakdown = {};
    Object.entries(scores).forEach(([focus, score]) => {
      breakdown[focus] = Math.round((score / total) * 100);
    });
    
    return breakdown;
  }
}

export default ConversationAnalyzer;