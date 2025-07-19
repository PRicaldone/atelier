/**
 * AI Fallback & Manual Override System
 * Ensures graceful degradation when AI services fail
 */

import { eventBus } from '../../events/EventBus.js';

/**
 * Fallback strategies for different AI operations
 */
export const FallbackStrategies = {
  IMMEDIATE_MANUAL: 'immediate_manual',
  RETRY_THEN_MANUAL: 'retry_then_manual',
  CACHED_RESULT: 'cached_result',
  ALTERNATIVE_AI: 'alternative_ai',
  DEGRADED_FUNCTION: 'degraded_function'
};

/**
 * AI operation states
 */
export const OperationStates = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  SUCCESS: 'success',
  FAILED: 'failed',
  FALLBACK_ACTIVE: 'fallback_active',
  MANUAL_OVERRIDE: 'manual_override'
};

/**
 * Fallback events for monitoring
 */
export const FallbackEvents = {
  OPERATION_STARTED: 'ai.fallback.operation_started',
  OPERATION_COMPLETED: 'ai.fallback.operation_completed',
  FALLBACK_TRIGGERED: 'ai.fallback.fallback_triggered',
  MANUAL_OVERRIDE_ACTIVATED: 'ai.fallback.manual_override_activated',
  SERVICE_DEGRADED: 'ai.fallback.service_degraded',
  SERVICE_RECOVERED: 'ai.fallback.service_recovered'
};

/**
 * AI Fallback Manager
 */
export class FallbackManager {
  constructor(options = {}) {
    this.options = {
      defaultTimeout: options.defaultTimeout || 10000, // 10 seconds
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      cacheEnabled: options.cacheEnabled !== false,
      ...options
    };

    this.eventBus = eventBus;
    this.activeOperations = new Map();
    this.serviceHealth = new Map();
    this.cache = new Map();
    this.fallbackHistory = [];
    
    this.initializeServiceMonitoring();
  }

  /**
   * Execute AI operation with fallback protection
   * @param {string} operationId - Unique operation identifier
   * @param {Function} aiOperation - AI operation function
   * @param {Function} fallbackOperation - Fallback operation function
   * @param {object} options - Operation options
   * @returns {Promise<object>} Operation result
   */
  async executeWithFallback(operationId, aiOperation, fallbackOperation, options = {}) {
    const operation = {
      id: operationId,
      startTime: Date.now(),
      state: OperationStates.PENDING,
      attempts: 0,
      options: {
        timeout: options.timeout || this.options.defaultTimeout,
        strategy: options.strategy || FallbackStrategies.RETRY_THEN_MANUAL,
        preserveState: options.preserveState !== false,
        context: options.context || {},
        ...options
      }
    };

    this.activeOperations.set(operationId, operation);
    
    try {
      // Emit operation started event
      this.eventBus.emit(FallbackEvents.OPERATION_STARTED, {
        operationId,
        timestamp: Date.now(),
        context: operation.options.context
      });

      // Check service health before attempting
      if (!this.isServiceHealthy('ai_primary')) {
        return await this.triggerFallback(operation, aiOperation, fallbackOperation, 'service_unhealthy');
      }

      // Execute with timeout and retry logic
      const result = await this.executeWithRetry(operation, aiOperation);
      
      // Operation successful
      operation.state = OperationStates.SUCCESS;
      operation.endTime = Date.now();
      operation.duration = operation.endTime - operation.startTime;

      this.eventBus.emit(FallbackEvents.OPERATION_COMPLETED, {
        operationId,
        success: true,
        duration: operation.duration,
        attempts: operation.attempts
      });

      return {
        success: true,
        result,
        operationId,
        duration: operation.duration,
        fallbackUsed: false,
        attempts: operation.attempts
      };

    } catch (error) {
      // AI operation failed, trigger fallback
      return await this.triggerFallback(operation, aiOperation, fallbackOperation, error.message, error);
    } finally {
      this.activeOperations.delete(operationId);
    }
  }

  /**
   * Execute operation with retry logic
   * @param {object} operation - Operation configuration
   * @param {Function} aiOperation - AI operation function
   * @returns {Promise<any>} Operation result
   */
  async executeWithRetry(operation, aiOperation) {
    const maxRetries = this.options.maxRetries;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      operation.attempts = attempt;
      operation.state = OperationStates.IN_PROGRESS;

      try {
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('AI_TIMEOUT')), operation.options.timeout);
        });

        // Execute with timeout
        const result = await Promise.race([
          aiOperation(operation.options.context),
          timeoutPromise
        ]);

        // Mark service as healthy on success
        this.markServiceHealthy('ai_primary');
        return result;

      } catch (error) {
        lastError = error;
        
        // Mark service as degraded
        this.markServiceDegraded('ai_primary', error.message);

        // If not the last attempt, wait before retry
        if (attempt < maxRetries) {
          await this.delay(this.options.retryDelay * attempt); // Exponential backoff
        }
      }
    }

    throw lastError;
  }

  /**
   * Trigger fallback operation
   * @param {object} operation - Operation configuration
   * @param {Function} aiOperation - Original AI operation
   * @param {Function} fallbackOperation - Fallback operation
   * @param {string} reason - Fallback reason
   * @param {Error} error - Original error (optional)
   * @returns {Promise<object>} Fallback result
   */
  async triggerFallback(operation, aiOperation, fallbackOperation, reason, error = null) {
    operation.state = OperationStates.FALLBACK_ACTIVE;
    operation.fallbackReason = reason;
    operation.fallbackTime = Date.now();

    // Record fallback event
    const fallbackEvent = {
      operationId: operation.id,
      reason,
      timestamp: Date.now(),
      strategy: operation.options.strategy,
      attempts: operation.attempts,
      error: error ? error.message : reason
    };

    this.fallbackHistory.push(fallbackEvent);
    this.eventBus.emit(FallbackEvents.FALLBACK_TRIGGERED, fallbackEvent);

    try {
      let fallbackResult;

      switch (operation.options.strategy) {
        case FallbackStrategies.CACHED_RESULT:
          fallbackResult = await this.tryCache(operation);
          break;
          
        case FallbackStrategies.ALTERNATIVE_AI:
          fallbackResult = await this.tryAlternativeAI(operation, aiOperation);
          break;
          
        case FallbackStrategies.DEGRADED_FUNCTION:
          fallbackResult = await this.provideDegradedFunction(operation);
          break;
          
        case FallbackStrategies.IMMEDIATE_MANUAL:
        case FallbackStrategies.RETRY_THEN_MANUAL:
        default:
          fallbackResult = await this.executeManualFallback(operation, fallbackOperation);
          break;
      }

      operation.state = OperationStates.SUCCESS;
      operation.endTime = Date.now();
      operation.duration = operation.endTime - operation.startTime;

      this.eventBus.emit(FallbackEvents.OPERATION_COMPLETED, {
        operationId: operation.id,
        success: true,
        duration: operation.duration,
        fallbackUsed: true,
        fallbackStrategy: operation.options.strategy
      });

      return {
        success: true,
        result: fallbackResult,
        operationId: operation.id,
        duration: operation.duration,
        fallbackUsed: true,
        fallbackReason: reason,
        fallbackStrategy: operation.options.strategy
      };

    } catch (fallbackError) {
      operation.state = OperationStates.FAILED;
      operation.endTime = Date.now();

      this.eventBus.emit(FallbackEvents.OPERATION_COMPLETED, {
        operationId: operation.id,
        success: false,
        error: fallbackError.message,
        fallbackUsed: true
      });

      throw new Error(`Both AI and fallback operations failed: ${fallbackError.message}`);
    }
  }

  /**
   * Execute manual fallback operation
   * @param {object} operation - Operation configuration
   * @param {Function} fallbackOperation - Fallback function
   * @returns {Promise<any>} Fallback result
   */
  async executeManualFallback(operation, fallbackOperation) {
    operation.state = OperationStates.MANUAL_OVERRIDE;
    
    this.eventBus.emit(FallbackEvents.MANUAL_OVERRIDE_ACTIVATED, {
      operationId: operation.id,
      timestamp: Date.now(),
      context: operation.options.context
    });

    // Preserve user state if requested
    if (operation.options.preserveState) {
      await this.preserveOperationState(operation);
    }

    // Execute fallback with user-friendly messaging
    return await fallbackOperation({
      reason: this.getFriendlyErrorMessage(operation.fallbackReason),
      context: operation.options.context,
      preservedState: operation.preservedState
    });
  }

  /**
   * Try to get cached result
   * @param {object} operation - Operation configuration
   * @returns {Promise<any>} Cached result or throws error
   */
  async tryCache(operation) {
    if (!this.options.cacheEnabled) {
      throw new Error('Cache not enabled');
    }

    const cacheKey = this.generateCacheKey(operation);
    const cached = this.cache.get(cacheKey);

    if (cached && !this.isCacheExpired(cached)) {
      return cached.result;
    }

    throw new Error('No valid cache available');
  }

  /**
   * Try alternative AI service
   * @param {object} operation - Operation configuration
   * @param {Function} aiOperation - AI operation function
   * @returns {Promise<any>} Alternative AI result
   */
  async tryAlternativeAI(operation, aiOperation) {
    // This would integrate with alternative AI services
    // For now, throw error to fall back to manual
    throw new Error('Alternative AI not configured');
  }

  /**
   * Provide degraded functionality
   * @param {object} operation - Operation configuration
   * @returns {Promise<any>} Degraded result
   */
  async provideDegradedFunction(operation) {
    // Provide basic functionality without AI
    return {
      degraded: true,
      message: 'Basic functionality available. AI features temporarily unavailable.',
      context: operation.options.context
    };
  }

  /**
   * Preserve operation state for manual continuation
   * @param {object} operation - Operation configuration
   */
  async preserveOperationState(operation) {
    const stateKey = `operation_state_${operation.id}`;
    const state = {
      operationId: operation.id,
      context: operation.options.context,
      timestamp: Date.now(),
      reason: operation.fallbackReason
    };

    try {
      localStorage.setItem(stateKey, JSON.stringify(state));
      operation.preservedState = state;
    } catch (error) {
      console.warn('FallbackManager: Could not preserve operation state:', error);
    }
  }

  /**
   * Get user-friendly error message
   * @param {string} reason - Technical error reason
   * @returns {string} User-friendly message
   */
  getFriendlyErrorMessage(reason) {
    const friendlyMessages = {
      'AI_TIMEOUT': 'Our AI seems distracted today! You can continue manually.',
      'service_unhealthy': 'AI services are temporarily unavailable. You can continue manually.',
      'network_error': 'Connection issues detected. You can continue manually.',
      'rate_limit': 'Too many requests. Please continue manually.',
      'invalid_response': 'AI response was unclear. You can continue manually.'
    };

    return friendlyMessages[reason] || 'AI assistance is temporarily unavailable. You can continue manually.';
  }

  /**
   * Initialize service health monitoring
   */
  initializeServiceMonitoring() {
    // Initialize primary AI service as healthy
    this.serviceHealth.set('ai_primary', {
      healthy: true,
      lastCheck: Date.now(),
      failureCount: 0,
      lastFailure: null
    });

    // Setup periodic health checks
    setInterval(() => {
      this.performHealthChecks();
    }, 60000); // Check every minute
  }

  /**
   * Mark service as healthy
   * @param {string} serviceId - Service identifier
   */
  markServiceHealthy(serviceId) {
    const health = this.serviceHealth.get(serviceId) || {};
    const wasUnhealthy = !health.healthy;

    this.serviceHealth.set(serviceId, {
      ...health,
      healthy: true,
      lastCheck: Date.now(),
      failureCount: 0,
      lastSuccess: Date.now()
    });

    if (wasUnhealthy) {
      this.eventBus.emit(FallbackEvents.SERVICE_RECOVERED, {
        serviceId,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Mark service as degraded
   * @param {string} serviceId - Service identifier
   * @param {string} reason - Degradation reason
   */
  markServiceDegraded(serviceId, reason) {
    const health = this.serviceHealth.get(serviceId) || {};
    const wasHealthy = health.healthy;

    this.serviceHealth.set(serviceId, {
      ...health,
      healthy: false,
      lastCheck: Date.now(),
      failureCount: (health.failureCount || 0) + 1,
      lastFailure: Date.now(),
      lastFailureReason: reason
    });

    if (wasHealthy) {
      this.eventBus.emit(FallbackEvents.SERVICE_DEGRADED, {
        serviceId,
        reason,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Check if service is healthy
   * @param {string} serviceId - Service identifier
   * @returns {boolean} Service health status
   */
  isServiceHealthy(serviceId) {
    const health = this.serviceHealth.get(serviceId);
    return health ? health.healthy : false;
  }

  /**
   * Perform periodic health checks
   */
  performHealthChecks() {
    // Simple health check based on recent failure patterns
    for (const [serviceId, health] of this.serviceHealth.entries()) {
      const timeSinceLastFailure = Date.now() - (health.lastFailure || 0);
      const recoveryTime = 5 * 60 * 1000; // 5 minutes

      // Auto-recover after recovery time if no recent failures
      if (!health.healthy && timeSinceLastFailure > recoveryTime) {
        this.markServiceHealthy(serviceId);
      }
    }
  }

  /**
   * Generate cache key for operation
   * @param {object} operation - Operation configuration
   * @returns {string} Cache key
   */
  generateCacheKey(operation) {
    const contextHash = JSON.stringify(operation.options.context);
    return `${operation.id}_${btoa(contextHash).slice(0, 16)}`;
  }

  /**
   * Check if cache entry is expired
   * @param {object} cached - Cached entry
   * @returns {boolean} Whether cache is expired
   */
  isCacheExpired(cached) {
    const maxAge = 30 * 60 * 1000; // 30 minutes
    return Date.now() - cached.timestamp > maxAge;
  }

  /**
   * Cache operation result
   * @param {string} operationId - Operation ID
   * @param {object} context - Operation context
   * @param {any} result - Operation result
   */
  cacheResult(operationId, context, result) {
    if (!this.options.cacheEnabled) return;

    const cacheKey = this.generateCacheKey({ id: operationId, options: { context } });
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now(),
      operationId
    });

    // Limit cache size
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get fallback statistics
   * @returns {object} Fallback statistics
   */
  getStats() {
    const recentHistory = this.fallbackHistory.filter(
      event => Date.now() - event.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    return {
      totalFallbacks: this.fallbackHistory.length,
      recentFallbacks: recentHistory.length,
      activeOperations: this.activeOperations.size,
      serviceHealth: Object.fromEntries(this.serviceHealth),
      cacheSize: this.cache.size,
      fallbackReasons: this.getFallbackReasonStats(recentHistory)
    };
  }

  /**
   * Get fallback reason statistics
   * @param {Array} history - Fallback history
   * @returns {object} Reason statistics
   */
  getFallbackReasonStats(history) {
    const reasons = {};
    history.forEach(event => {
      reasons[event.reason] = (reasons[event.reason] || 0) + 1;
    });
    return reasons;
  }

  /**
   * Utility delay function
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Delay promise
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global instance
export const fallbackManager = new FallbackManager();

// Convenience function for executing AI operations with fallback
export const executeAIOperation = (operationId, aiOperation, fallbackOperation, options) => {
  return fallbackManager.executeWithFallback(operationId, aiOperation, fallbackOperation, options);
};

export default FallbackManager;