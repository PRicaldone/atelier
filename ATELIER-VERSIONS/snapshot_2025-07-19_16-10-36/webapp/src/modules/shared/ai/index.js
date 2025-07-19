/**
 * AI System Initialization
 * Central initialization for all AI components
 */

// Initialize AI security and privacy systems
export * from './security/DataSanitizer.js';
export * from './consent/ConsentManager.js';
export * from './fallback/FallbackManager.js';

// Initialize AI agents
export * from './agents/SuperClaudeAgent.js';

// Initialize AI events
export * from '../events/AIEvents.js';

// Initialize Mock API in development
if (process.env.NODE_ENV === 'development') {
  import('./agents/MockSuperClaudeAPI.js').then(module => {
    console.log('🤖 AI Mock API initialized for development');
  });
}

// AI System Health Check
export const checkAISystemHealth = () => {
  const { superClaudeAgent } = require('./agents/SuperClaudeAgent.js');
  const { consentManager } = require('./consent/ConsentManager.js');
  const { fallbackManager } = require('./fallback/FallbackManager.js');

  return {
    superClaudeAgent: {
      connected: superClaudeAgent.isConnected,
      stats: superClaudeAgent.getStats()
    },
    consentManager: {
      summary: consentManager.getConsentSummary()
    },
    fallbackManager: {
      stats: fallbackManager.getStats()
    },
    timestamp: Date.now()
  };
};

// Make AI system available globally for debugging
if (typeof window !== 'undefined') {
  window.__aiSystem = {
    checkHealth: checkAISystemHealth
  };
}

console.log('🤖 AI System initialized');