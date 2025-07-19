/**
 * Mock SuperClaude API for Development and Testing
 * Simulates SuperClaude+MCP responses for local development
 */

import { SuperClaudeOperations, ResponseTypes } from './SuperClaudeAgent.js';

/**
 * Mock API responses for different operations
 */
const mockResponses = {
  [SuperClaudeOperations.BOARD_GENERATION]: {
    cyberpunk: {
      success: true,
      data: {
        type: ResponseTypes.BOARD_STRUCTURE,
        sections: [
          {
            id: 'aesthetic',
            title: 'Cyberpunk Aesthetic',
            description: 'Visual elements and mood references',
            elements: [
              {
                type: 'note',
                content: 'Neon lights and dark urban landscapes',
                position: { x: 120, y: 200 }
              },
              {
                type: 'note',
                content: 'Metallic textures with glitch effects',
                position: { x: 120, y: 280 }
              },
              {
                type: 'note',
                content: 'Color palette: Electric blue, magenta, black',
                position: { x: 120, y: 360 }
              }
            ]
          },
          {
            id: 'technology',
            title: 'Technology Elements',
            description: 'Tech-focused design inspiration',
            elements: [
              {
                type: 'note',
                content: 'Holographic interfaces and AR displays',
                position: { x: 420, y: 200 }
              },
              {
                type: 'note',
                content: 'Circuit board patterns and data streams',
                position: { x: 420, y: 280 }
              },
              {
                type: 'note',
                content: 'Futuristic typography with scan lines',
                position: { x: 420, y: 360 }
              }
            ]
          },
          {
            id: 'atmosphere',
            title: 'Atmospheric Elements',
            description: 'Mood and environmental aspects',
            elements: [
              {
                type: 'note',
                content: 'Rain-soaked streets with reflections',
                position: { x: 720, y: 200 }
              },
              {
                type: 'note',
                content: 'Smoke and fog effects',
                position: { x: 720, y: 280 }
              },
              {
                type: 'note',
                content: 'Dystopian urban architecture',
                position: { x: 720, y: 360 }
              }
            ]
          }
        ]
      }
    },
    
    default: {
      success: true,
      data: {
        type: ResponseTypes.BOARD_STRUCTURE,
        sections: [
          {
            id: 'main',
            title: 'Creative Board',
            description: 'AI-generated creative structure',
            elements: [
              {
                type: 'note',
                content: 'Central concept and main idea',
                position: { x: 300, y: 200 }
              },
              {
                type: 'note',
                content: 'Supporting elements and details',
                position: { x: 300, y: 300 }
              },
              {
                type: 'note',
                content: 'References and inspiration sources',
                position: { x: 300, y: 400 }
              }
            ]
          },
          {
            id: 'research',
            title: 'Research & References',
            description: 'Background research and reference materials',
            elements: [
              {
                type: 'note',
                content: 'Primary research sources',
                position: { x: 600, y: 200 }
              },
              {
                type: 'note',
                content: 'Visual references and mood boards',
                position: { x: 600, y: 300 }
              }
            ]
          }
        ]
      }
    }
  },

  [SuperClaudeOperations.CONTENT_ANALYSIS]: {
    success: true,
    data: {
      type: ResponseTypes.CONTENT_SUGGESTIONS,
      suggestions: [
        {
          type: 'improvement',
          message: 'Consider adding visual hierarchy with headings',
          action: 'add_structure'
        },
        {
          type: 'enhancement',
          message: 'Add supporting visuals or diagrams',
          action: 'add_visuals'
        },
        {
          type: 'organization',
          message: 'Group related items together',
          action: 'reorganize'
        }
      ]
    }
  },

  [SuperClaudeOperations.WORKFLOW_AUTOMATION]: {
    success: true,
    data: {
      type: ResponseTypes.WORKFLOW_STEPS,
      steps: [
        {
          id: 'step1',
          title: 'Research & Planning',
          description: 'Gather requirements and create project brief',
          estimated_time: '2-4 hours',
          dependencies: []
        },
        {
          id: 'step2',
          title: 'Concept Development',
          description: 'Develop initial concepts and mood boards',
          estimated_time: '4-6 hours',
          dependencies: ['step1']
        },
        {
          id: 'step3',
          title: 'Design Execution',
          description: 'Create detailed designs and assets',
          estimated_time: '6-10 hours',
          dependencies: ['step2']
        },
        {
          id: 'step4',
          title: 'Review & Iteration',
          description: 'Review with stakeholders and iterate',
          estimated_time: '2-4 hours',
          dependencies: ['step3']
        },
        {
          id: 'step5',
          title: 'Final Delivery',
          description: 'Prepare and deliver final assets',
          estimated_time: '1-2 hours',
          dependencies: ['step4']
        }
      ]
    }
  }
};

/**
 * Mock SuperClaude API Server
 */
export class MockSuperClaudeAPI {
  constructor() {
    this.isEnabled = true;
    this.responseDelay = 1500; // Simulate network delay
    this.failureRate = 0.05; // 5% failure rate for testing
    this.setup();
  }

  /**
   * Setup mock API server
   */
  setup() {
    // Only setup in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Intercept fetch requests to our AI API
    const originalFetch = window.fetch;
    window.fetch = async (url, options) => {
      // Check if this is a request to our AI API
      if (url.includes('/api/ai/superclaude')) {
        return this.handleMockRequest(url, options);
      }
      
      // Pass through other requests
      return originalFetch(url, options);
    };

    console.log('🤖 Mock SuperClaude API initialized');
  }

  /**
   * Handle mock API request
   */
  async handleMockRequest(url, options) {
    console.log('🤖 Mock API request:', url, options);

    // Simulate network delay
    await this.delay(this.responseDelay);

    // Handle health check
    if (url.includes('/health')) {
      return this.createMockResponse({
        status: 'healthy',
        service: 'superclaude-mock',
        timestamp: Date.now()
      });
    }

    // Handle main API requests
    if (options?.method === 'POST') {
      return this.handlePostRequest(options);
    }

    // Default 404 for unknown endpoints
    return this.createMockResponse({ error: 'Endpoint not found' }, 404);
  }

  /**
   * Handle POST requests (main AI operations)
   */
  async handlePostRequest(options) {
    try {
      const body = JSON.parse(options.body);
      const { operation, payload } = body;

      console.log('🤖 Mock API operation:', operation, payload);

      // Simulate random failures for testing
      if (Math.random() < this.failureRate) {
        return this.createMockResponse({
          success: false,
          error: 'Mock API simulated failure'
        }, 500);
      }

      // Generate response based on operation
      const response = await this.generateMockResponse(operation, payload);
      return this.createMockResponse(response);

    } catch (error) {
      console.error('Mock API error:', error);
      return this.createMockResponse({
        success: false,
        error: 'Invalid request format'
      }, 400);
    }
  }

  /**
   * Generate mock response for operation
   */
  async generateMockResponse(operation, payload) {
    switch (operation) {
      case SuperClaudeOperations.BOARD_GENERATION:
        return this.generateBoardResponse(payload);
        
      case SuperClaudeOperations.CONTENT_ANALYSIS:
        return mockResponses[SuperClaudeOperations.CONTENT_ANALYSIS];
        
      case SuperClaudeOperations.WORKFLOW_AUTOMATION:
        return mockResponses[SuperClaudeOperations.WORKFLOW_AUTOMATION];
        
      default:
        return {
          success: false,
          error: `Unknown operation: ${operation}`
        };
    }
  }

  /**
   * Generate board response based on prompt
   */
  generateBoardResponse(payload) {
    const prompt = payload.prompt?.toLowerCase() || '';
    
    // Check for specific keywords to provide tailored responses
    if (prompt.includes('cyberpunk') || prompt.includes('futuristic') || prompt.includes('neon')) {
      return mockResponses[SuperClaudeOperations.BOARD_GENERATION].cyberpunk;
    }
    
    if (prompt.includes('nature') || prompt.includes('organic') || prompt.includes('natural')) {
      return {
        success: true,
        data: {
          type: ResponseTypes.BOARD_STRUCTURE,
          sections: [
            {
              id: 'organic',
              title: 'Natural Elements',
              description: 'Organic forms and natural inspiration',
              elements: [
                {
                  type: 'note',
                  content: 'Flowing curves and organic shapes',
                  position: { x: 120, y: 200 }
                },
                {
                  type: 'note',
                  content: 'Earth tones and natural colors',
                  position: { x: 120, y: 280 }
                },
                {
                  type: 'note',
                  content: 'Textures from bark, stone, water',
                  position: { x: 120, y: 360 }
                }
              ]
            },
            {
              id: 'inspiration',
              title: 'Nature Inspiration',
              description: 'Natural patterns and structures',
              elements: [
                {
                  type: 'note',
                  content: 'Tree branch patterns and fractals',
                  position: { x: 420, y: 200 }
                },
                {
                  type: 'note',
                  content: 'Ocean waves and flowing water',
                  position: { x: 420, y: 280 }
                },
                {
                  type: 'note',
                  content: 'Mountain silhouettes and horizons',
                  position: { x: 420, y: 360 }
                }
              ]
            }
          ]
        }
      };
    }

    // Return default response
    return mockResponses[SuperClaudeOperations.BOARD_GENERATION].default;
  }

  /**
   * Create mock fetch response
   */
  createMockResponse(data, status = 200) {
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data))
    });
  }

  /**
   * Simulate delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Enable/disable mock API
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  /**
   * Set response delay
   */
  setResponseDelay(ms) {
    this.responseDelay = ms;
  }

  /**
   * Set failure rate for testing
   */
  setFailureRate(rate) {
    this.failureRate = Math.max(0, Math.min(1, rate));
  }
}

// Initialize mock API in development
let mockAPI = null;
if (process.env.NODE_ENV === 'development') {
  mockAPI = new MockSuperClaudeAPI();
}

// Export for manual control in development
export const mockSuperClaudeAPI = mockAPI;

// Utility functions for development
export const enableMockAPI = () => mockAPI?.setEnabled(true);
export const disableMockAPI = () => mockAPI?.setEnabled(false);
export const setMockAPIDelay = (ms) => mockAPI?.setResponseDelay(ms);
export const setMockAPIFailureRate = (rate) => mockAPI?.setFailureRate(rate);

// Make available in browser console for development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.__mockSuperClaudeAPI = {
    api: mockAPI,
    enable: enableMockAPI,
    disable: disableMockAPI,
    setDelay: setMockAPIDelay,
    setFailureRate: setMockAPIFailureRate
  };
}

export default MockSuperClaudeAPI;