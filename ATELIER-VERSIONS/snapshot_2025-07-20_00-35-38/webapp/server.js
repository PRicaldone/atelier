/**
 * Simple Mock Server for SuperClaude+MCP Testing
 * This is a development server for testing AI integration
 */

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock AI responses for development
const mockResponses = {
  '/board': {
    success: true,
    data: {
      type: 'board_structure',
      sections: [
        {
          id: 'creative-section',
          title: 'Creative Elements',
          description: 'Core creative components for your project',
          elements: [
            {
              type: 'note',
              title: 'Mood Board',
              content: 'Collect visual references and inspiration',
              position: { x: 0, y: 0 }
            },
            {
              type: 'note', 
              title: 'Color Palette',
              content: 'Define primary and secondary colors',
              position: { x: 0, y: 80 }
            },
            {
              type: 'note',
              title: 'Typography',
              content: 'Select fonts and text styles',
              position: { x: 0, y: 160 }
            }
          ]
        },
        {
          id: 'execution-section',
          title: 'Execution Plan', 
          description: 'Actionable steps to bring your vision to life',
          elements: [
            {
              type: 'note',
              title: 'Concept Development',
              content: 'Refine and iterate on initial ideas',
              position: { x: 0, y: 0 }
            },
            {
              type: 'note',
              title: 'Production Timeline',
              content: 'Create realistic milestones and deadlines',
              position: { x: 0, y: 80 }
            }
          ]
        }
      ]
    }
  },
  '/idea': {
    success: true,
    data: {
      type: 'content_suggestions',
      suggestions: [
        {
          type: 'brainstorm',
          message: 'Consider exploring different artistic mediums - digital art, traditional painting, mixed media',
          action: 'explore_mediums'
        },
        {
          type: 'brainstorm', 
          message: 'Research current trends in your target market or industry',
          action: 'market_research'
        },
        {
          type: 'brainstorm',
          message: 'Create a mind map of related concepts and themes',
          action: 'mind_mapping'
        },
        {
          type: 'brainstorm',
          message: 'Look at work from artists or creators you admire for inspiration',
          action: 'inspiration_research'
        }
      ]
    }
  },
  '/ref': {
    success: true,
    data: {
      type: 'content_suggestions',
      suggestions: [
        {
          type: 'reference',
          message: 'Behance and Dribbble for visual design inspiration',
          action: 'browse_inspiration'
        },
        {
          type: 'reference',
          message: 'Pinterest boards for mood and style references',
          action: 'create_mood_board'
        },
        {
          type: 'reference',
          message: 'Art history resources for classical techniques and styles',
          action: 'study_techniques'
        }
      ]
    }
  },
  '/brief': {
    success: true,
    data: {
      type: 'workflow_steps',
      steps: [
        {
          id: 'objective',
          title: 'Define Objective',
          description: 'Clearly articulate the main goal and purpose',
          estimated_time: '30 minutes'
        },
        {
          id: 'audience',
          title: 'Identify Target Audience',
          description: 'Define who will engage with this work',
          estimated_time: '20 minutes'
        },
        {
          id: 'constraints',
          title: 'Document Constraints',
          description: 'Budget, timeline, technical requirements',
          estimated_time: '15 minutes'
        },
        {
          id: 'success-metrics',
          title: 'Success Metrics',
          description: 'How will you measure if this project succeeds',
          estimated_time: '15 minutes'
        }
      ]
    }
  }
};

// Health check endpoint
app.get('/api/ai/superclaude/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SuperClaude Mock API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Main SuperClaude API endpoint
app.post('/api/ai/superclaude', async (req, res) => {
  try {
    const { operation, payload } = req.body;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    console.log(`[SuperClaude API] ${operation} request:`, payload);
    
    // Determine response based on operation and payload
    let response;
    
    if (operation === 'board_generation') {
      response = mockResponses['/board'];
    } else if (operation === 'content_analysis' && payload.context?.type === 'brainstorm') {
      response = mockResponses['/idea'];
    } else if (operation === 'workflow_automation') {
      response = mockResponses['/brief'];
    } else {
      // Generic enhanced content response
      response = {
        success: true,
        data: {
          type: 'generated_content',
          title: 'AI Enhanced Content',
          content: `Enhanced version: ${payload.content || payload.prompt || 'Your idea'}\n\nAI suggests: Consider expanding this concept with more specific details, research backing, and actionable next steps.`,
          contentType: 'enhanced_text'
        }
      };
    }
    
    // Add metadata
    response.metadata = {
      requestId: req.headers['x-request-id'] || 'mock-req-' + Date.now(),
      processingTime: Math.random() * 2000 + 1000,
      model: 'claude-3-sonnet-20240229',
      timestamp: new Date().toISOString()
    };
    
    console.log(`[SuperClaude API] Response:`, response);
    res.json(response);
    
  } catch (error) {
    console.error('[SuperClaude API] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('[Server Error]:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 SuperClaude Mock API Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/ai/superclaude/health`);
  console.log(`🧠 API endpoint: http://localhost:${PORT}/api/ai/superclaude`);
  console.log('');
  console.log('Available operations:');
  console.log('  - board_generation (generates creative boards)');
  console.log('  - content_analysis (brainstorms ideas)');
  console.log('  - workflow_automation (creates project briefs)');
  console.log('');
});

export default app;