/**
 * Mind Garden v5.1 - Advanced Error Handling and Retry System
 * Day 4: Robust error recovery and conversation preservation
 */

export class ConversationErrorHandler {
  constructor() {
    this.retryConfig = {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
      jitter: true
    };
    
    this.errorStats = {
      totalErrors: 0,
      apiErrors: 0,
      networkErrors: 0,
      contextErrors: 0,
      recoveredErrors: 0,
      unrecoverableErrors: 0
    };
    
    this.fallbackResponses = this.initializeFallbackResponses();
    this.errorPatterns = this.initializeErrorPatterns();
  }

  /**
   * Initialize fallback responses for different error scenarios
   */
  initializeFallbackResponses() {
    return {
      apiLimit: {
        response: "I'm experiencing high demand right now. Let me provide a thoughtful response based on our conversation so far...",
        type: 'rate_limit',
        canRetry: true,
        delay: 60000 // 1 minute
      },
      
      networkError: {
        response: "I'm having trouble connecting right now. Let me continue our conversation based on the context we've built...",
        type: 'network',
        canRetry: true,
        delay: 5000
      },
      
      contextTooLong: {
        response: "Our conversation has become quite rich! Let me focus on your current question while keeping the essential context...",
        type: 'context_length',
        canRetry: true,
        delay: 1000
      },
      
      invalidResponse: {
        response: "I need a moment to process that properly. Let me approach your question from a different angle...",
        type: 'processing',
        canRetry: true,
        delay: 2000
      },
      
      authenticationError: {
        response: "I'm currently unable to access my full capabilities. Let me help you with a basic response while we resolve this...",
        type: 'auth',
        canRetry: false,
        delay: 0
      },
      
      generic: {
        response: "I encountered an unexpected situation. Let me continue our conversation based on what we've discussed...",
        type: 'unknown',
        canRetry: true,
        delay: 3000
      }
    };
  }

  /**
   * Initialize error pattern recognition
   */
  initializeErrorPatterns() {
    return {
      rateLimitPatterns: [
        /rate.?limit/i,
        /too many requests/i,
        /quota exceeded/i,
        /429/,
        /throttle/i
      ],
      
      networkPatterns: [
        /network error/i,
        /connection/i,
        /timeout/i,
        /ECONNRESET/i,
        /ENOTFOUND/i,
        /failed to fetch/i
      ],
      
      contextPatterns: [
        /context.?length/i,
        /token.?limit/i,
        /maximum context/i,
        /input too long/i,
        /4096/,
        /8192/
      ],
      
      authPatterns: [
        /unauthorized/i,
        /invalid.?key/i,
        /authentication/i,
        /401/,
        /403/,
        /forbidden/i
      ],
      
      serverPatterns: [
        /internal server error/i,
        /service unavailable/i,
        /502/,
        /503/,
        /504/,
        /bad gateway/i
      ]
    };
  }

  /**
   * Main error handling method with intelligent recovery
   */
  async handleConversationError(error, context = {}) {
    this.errorStats.totalErrors++;
    
    const errorType = this.classifyError(error);
    const errorInfo = {
      type: errorType,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      nodeId: context.nodeId,
      prompt: context.prompt,
      parentChainLength: context.parentChain?.length || 0
    };

    console.error('🚨 Conversation Error:', errorInfo);

    // Update error statistics
    this.updateErrorStats(errorType);

    // Attempt recovery based on error type
    const recoveryResult = await this.attemptRecovery(error, errorInfo, context);
    
    if (recoveryResult.success) {
      this.errorStats.recoveredErrors++;
      console.log('✅ Error recovered successfully:', recoveryResult);
      return recoveryResult;
    } else {
      this.errorStats.unrecoverableErrors++;
      console.warn('⚠️ Error not recoverable, using fallback:', recoveryResult);
      return this.generateFallbackResponse(errorType, context);
    }
  }

  /**
   * Classify error type for appropriate handling
   */
  classifyError(error) {
    const message = error.message?.toLowerCase() || '';
    const statusCode = error.status || error.statusCode;

    // Check for rate limiting
    if (statusCode === 429 || this.matchesPatterns(message, this.errorPatterns.rateLimitPatterns)) {
      return 'rate_limit';
    }

    // Check for network issues
    if (this.matchesPatterns(message, this.errorPatterns.networkPatterns)) {
      return 'network';
    }

    // Check for context length issues
    if (this.matchesPatterns(message, this.errorPatterns.contextPatterns)) {
      return 'context_length';
    }

    // Check for authentication issues
    if (statusCode === 401 || statusCode === 403 || 
        this.matchesPatterns(message, this.errorPatterns.authPatterns)) {
      return 'auth';
    }

    // Check for server issues
    if (statusCode >= 500 || this.matchesPatterns(message, this.errorPatterns.serverPatterns)) {
      return 'server';
    }

    // Default to generic error
    return 'generic';
  }

  /**
   * Check if message matches any patterns
   */
  matchesPatterns(message, patterns) {
    return patterns.some(pattern => pattern.test(message));
  }

  /**
   * Attempt intelligent error recovery
   */
  async attemptRecovery(error, errorInfo, context) {
    const { type } = errorInfo;

    switch (type) {
      case 'rate_limit':
        return await this.handleRateLimitError(error, context);
      
      case 'network':
        return await this.handleNetworkError(error, context);
      
      case 'context_length':
        return await this.handleContextLengthError(error, context);
      
      case 'auth':
        return await this.handleAuthError(error, context);
      
      case 'server':
        return await this.handleServerError(error, context);
      
      default:
        return await this.handleGenericError(error, context);
    }
  }

  /**
   * Handle rate limit errors with exponential backoff
   */
  async handleRateLimitError(error, context) {
    const delay = this.calculateRetryDelay(context.retryCount || 0);
    
    console.log(`⏳ Rate limited, waiting ${delay}ms before retry`);
    
    if ((context.retryCount || 0) < this.retryConfig.maxRetries) {
      await this.sleep(delay);
      return {
        success: false,
        shouldRetry: true,
        retryDelay: delay,
        retryCount: (context.retryCount || 0) + 1
      };
    }

    return {
      success: false,
      shouldRetry: false,
      reason: 'Max retries exceeded for rate limit'
    };
  }

  /**
   * Handle network errors with intelligent retry
   */
  async handleNetworkError(error, context) {
    const retryCount = context.retryCount || 0;
    
    if (retryCount < this.retryConfig.maxRetries) {
      const delay = this.calculateRetryDelay(retryCount);
      
      console.log(`🔄 Network error, retrying in ${delay}ms (attempt ${retryCount + 1})`);
      
      await this.sleep(delay);
      return {
        success: false,
        shouldRetry: true,
        retryDelay: delay,
        retryCount: retryCount + 1
      };
    }

    return {
      success: false,
      shouldRetry: false,
      reason: 'Network error persists after retries'
    };
  }

  /**
   * Handle context length errors by trimming conversation
   */
  async handleContextLengthError(error, context) {
    console.log('✂️ Context too long, attempting to trim conversation history');
    
    if (!context.parentChain || context.parentChain.length === 0) {
      return {
        success: false,
        shouldRetry: false,
        reason: 'No conversation history to trim'
      };
    }

    // Trim conversation intelligently
    const trimmedChain = this.trimConversationHistory(context.parentChain);
    
    if (trimmedChain.length < context.parentChain.length) {
      return {
        success: true,
        shouldRetry: true,
        modifiedContext: {
          ...context,
          parentChain: trimmedChain,
          trimmed: true
        },
        message: 'Conversation history trimmed to fit context limits'
      };
    }

    return {
      success: false,
      shouldRetry: false,
      reason: 'Unable to trim conversation sufficiently'
    };
  }

  /**
   * Handle authentication errors
   */
  async handleAuthError(error, context) {
    console.error('🔐 Authentication error - API key may be invalid or expired');
    
    // Could attempt to refresh credentials here
    return {
      success: false,
      shouldRetry: false,
      reason: 'Authentication failed - check API credentials',
      requiresUserAction: true
    };
  }

  /**
   * Handle server errors with backoff
   */
  async handleServerError(error, context) {
    const retryCount = context.retryCount || 0;
    
    if (retryCount < this.retryConfig.maxRetries) {
      const delay = this.calculateRetryDelay(retryCount) * 2; // Longer delay for server errors
      
      console.log(`🔧 Server error, retrying in ${delay}ms`);
      
      await this.sleep(delay);
      return {
        success: false,
        shouldRetry: true,
        retryDelay: delay,
        retryCount: retryCount + 1
      };
    }

    return {
      success: false,
      shouldRetry: false,
      reason: 'Server error persists'
    };
  }

  /**
   * Handle generic errors
   */
  async handleGenericError(error, context) {
    const retryCount = context.retryCount || 0;
    
    if (retryCount < this.retryConfig.maxRetries) {
      const delay = this.calculateRetryDelay(retryCount);
      
      await this.sleep(delay);
      return {
        success: false,
        shouldRetry: true,
        retryDelay: delay,
        retryCount: retryCount + 1
      };
    }

    return {
      success: false,
      shouldRetry: false,
      reason: 'Generic error - max retries exceeded'
    };
  }

  /**
   * Generate contextual fallback response
   */
  generateFallbackResponse(errorType, context) {
    const fallback = this.fallbackResponses[errorType] || this.fallbackResponses.generic;
    
    // Generate contextual fallback based on conversation history
    const contextualResponse = this.generateContextualFallback(context);
    
    return {
      success: true,
      response: contextualResponse || fallback.response,
      confidence: 0.3, // Low confidence for fallback
      isFallback: true,
      errorType,
      timestamp: new Date().toISOString(),
      canRetryLater: fallback.canRetry,
      retryDelay: fallback.delay
    };
  }

  /**
   * Generate contextual fallback based on conversation history
   */
  generateContextualFallback(context) {
    if (!context.parentChain || context.parentChain.length === 0) {
      return this.generateRootFallback(context.prompt);
    }

    // Analyze conversation to generate relevant fallback
    const recentExchanges = context.parentChain.slice(-2);
    const topics = this.extractTopicsFromHistory(recentExchanges);
    const sentiment = this.analyzeSentiment(recentExchanges);
    
    return this.buildContextualFallbackResponse(context.prompt, topics, sentiment);
  }

  /**
   * Generate fallback for root level (no history)
   */
  generateRootFallback(prompt) {
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('how')) {
      return `Your question about "${prompt}" touches on some interesting approaches. While I work through the technical details, consider that there are usually multiple ways to approach this kind of challenge. What specific aspect would you like to explore first?`;
    }
    
    if (promptLower.includes('what')) {
      return `"${prompt}" is a great question that opens up several possibilities. Let me think through some potential directions we could explore together. What's your primary goal or interest in this area?`;
    }
    
    if (promptLower.includes('why')) {
      return `The reasoning behind "${prompt}" likely involves multiple factors. While I process the full context, consider that these kinds of questions often have both immediate and deeper underlying causes. What's prompting your interest in this?`;
    }
    
    return `Your idea about "${prompt}" has interesting potential. Let me work with what we have and explore some directions this could lead. What aspect resonates most with your current thinking?`;
  }

  /**
   * Build contextual fallback response
   */
  buildContextualFallbackResponse(prompt, topics, sentiment) {
    const topicStr = topics.length > 0 ? topics.slice(0, 2).join(' and ') : 'your concepts';
    
    const templates = [
      `Building on our discussion of ${topicStr}, your question about "${prompt}" suggests some interesting directions. Let me continue exploring this with you...`,
      `Given our conversation about ${topicStr}, "${prompt}" opens up some valuable possibilities. What we've established so far provides a good foundation for...`,
      `Your question "${prompt}" connects well with our ${topicStr} discussion. While I work through the details, consider how this might relate to what we've already explored...`
    ];
    
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    // Add sentiment-appropriate ending
    if (sentiment === 'positive') {
      return selectedTemplate + ' This looks like a promising direction to continue our exploration.';
    } else if (sentiment === 'negative') {
      return selectedTemplate + ' Let\'s work through any challenges together and find the best path forward.';
    } else {
      return selectedTemplate + ' What specific aspect would you like to focus on next?';
    }
  }

  /**
   * Trim conversation history intelligently
   */
  trimConversationHistory(parentChain, maxLength = 3) {
    if (parentChain.length <= maxLength) {
      return parentChain;
    }

    // Keep the most recent exchanges and the first one (for context)
    const first = parentChain[0];
    const recent = parentChain.slice(-(maxLength - 1));
    
    return [first, ...recent];
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  calculateRetryDelay(retryCount) {
    const delay = Math.min(
      this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffFactor, retryCount),
      this.retryConfig.maxDelay
    );

    if (this.retryConfig.jitter) {
      // Add random jitter ±25%
      const jitter = delay * 0.25 * (Math.random() - 0.5);
      return Math.max(0, delay + jitter);
    }

    return delay;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update error statistics
   */
  updateErrorStats(errorType) {
    switch (errorType) {
      case 'rate_limit':
      case 'auth':
      case 'server':
        this.errorStats.apiErrors++;
        break;
      case 'network':
        this.errorStats.networkErrors++;
        break;
      case 'context_length':
        this.errorStats.contextErrors++;
        break;
    }
  }

  /**
   * Extract topics from conversation history
   */
  extractTopicsFromHistory(history) {
    const allText = history
      .map(node => `${node.prompt || ''} ${node.aiResponse || ''}`)
      .join(' ')
      .toLowerCase();

    const words = allText
      .split(/\s+/)
      .filter(word => word.length > 4)
      .filter(word => !/^(the|and|that|this|with|from|they|have|been|were|said|each|which|their)$/.test(word));

    // Get unique words
    const uniqueWords = [...new Set(words)];
    return uniqueWords.slice(0, 3); // Top 3 topics
  }

  /**
   * Simple sentiment analysis
   */
  analyzeSentiment(history) {
    const allText = history
      .map(node => `${node.prompt || ''} ${node.aiResponse || ''}`)
      .join(' ')
      .toLowerCase();

    const positiveWords = ['good', 'great', 'excellent', 'love', 'amazing', 'perfect', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'problem', 'issue', 'wrong', 'difficult'];

    let score = 0;
    positiveWords.forEach(word => {
      score += (allText.split(word).length - 1);
    });
    negativeWords.forEach(word => {
      score -= (allText.split(word).length - 1);
    });

    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const total = this.errorStats.totalErrors;
    return {
      ...this.errorStats,
      recoveryRate: total > 0 ? Math.round((this.errorStats.recoveredErrors / total) * 100) : 0,
      apiErrorRate: total > 0 ? Math.round((this.errorStats.apiErrors / total) * 100) : 0,
      networkErrorRate: total > 0 ? Math.round((this.errorStats.networkErrors / total) * 100) : 0
    };
  }

  /**
   * Reset error statistics
   */
  resetStats() {
    this.errorStats = {
      totalErrors: 0,
      apiErrors: 0,
      networkErrors: 0,
      contextErrors: 0,
      recoveredErrors: 0,
      unrecoverableErrors: 0
    };
  }

  /**
   * Test error handling (for development)
   */
  async testErrorHandling(errorType = 'generic') {
    const mockError = new Error(`Test ${errorType} error`);
    const mockContext = {
      nodeId: 'test_node',
      prompt: 'Test prompt for error handling',
      parentChain: [
        { prompt: 'Previous question', aiResponse: 'Previous response' }
      ],
      retryCount: 0
    };

    return await this.handleConversationError(mockError, mockContext);
  }
}

export default ConversationErrorHandler;