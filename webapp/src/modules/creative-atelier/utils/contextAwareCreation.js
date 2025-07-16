/**
 * Context-Aware Node Creation System
 * Automatically suggests and creates relevant nodes based on file analysis
 */

import { ELEMENT_TYPES } from '../types.js';

// Node creation templates based on content analysis
const NODE_TEMPLATES = {
  // Project Brief Analysis → Auto-create project structure
  'project-brief': [
    {
      type: ELEMENT_TYPES.BOARD,
      title: 'Project Overview',
      description: 'Main project board with timeline and deliverables',
      position: { x: 100, y: 100 },
      data: {
        title: 'Project Overview',
        backgroundColor: '#E3F2FD',
        description: 'Auto-generated from project brief analysis'
      }
    },
    {
      type: ELEMENT_TYPES.NOTE,
      title: 'Requirements',
      description: 'Extracted project requirements',
      position: { x: 450, y: 100 },
      data: {
        title: 'Requirements',
        content: 'Auto-extracted from brief...',
        backgroundColor: '#FFF9C4'
      }
    },
    {
      type: ELEMENT_TYPES.NOTE,
      title: 'Timeline',
      description: 'Project timeline and milestones',
      position: { x: 100, y: 300 },
      data: {
        title: 'Timeline',
        content: 'Project milestones...',
        backgroundColor: '#E8F5E9'
      }
    },
    {
      type: ELEMENT_TYPES.BOARD,
      title: 'Mood Board',
      description: 'Visual inspiration and style direction',
      position: { x: 450, y: 300 },
      data: {
        title: 'Mood Board',
        backgroundColor: '#FCE4EC',
        description: 'Visual inspiration based on brief analysis'
      }
    }
  ],

  // Design File Analysis → Create design workflow
  'design-file': [
    {
      type: ELEMENT_TYPES.NOTE,
      title: 'Color Palette',
      description: 'Extracted color palette from design',
      position: { x: 100, y: 100 },
      data: {
        title: 'Color Palette',
        content: 'Auto-extracted colors...',
        backgroundColor: '#F3E5F5'
      }
    },
    {
      type: ELEMENT_TYPES.NOTE,
      title: 'Typography',
      description: 'Font analysis and typography guide',
      position: { x: 350, y: 100 },
      data: {
        title: 'Typography',
        content: 'Font analysis...',
        backgroundColor: '#FFE0B2'
      }
    },
    {
      type: ELEMENT_TYPES.BOARD,
      title: 'Variations',
      description: 'Design variations and iterations',
      position: { x: 100, y: 250 },
      data: {
        title: 'Variations',
        backgroundColor: '#E8F5E9',
        description: 'Auto-generated design variations'
      }
    }
  ],

  // Image Asset → Create mood board workflow
  'image-asset': [
    {
      type: ELEMENT_TYPES.BOARD,
      title: 'Style Analysis',
      description: 'Visual style breakdown and similar assets',
      position: { x: 100, y: 100 },
      data: {
        title: 'Style Analysis',
        backgroundColor: '#F3E5F5',
        description: 'Auto-analyzed visual style elements'
      }
    },
    {
      type: ELEMENT_TYPES.NOTE,
      title: 'Color Mood',
      description: 'Color psychology and mood analysis',
      position: { x: 400, y: 100 },
      data: {
        title: 'Color Mood',
        content: 'Color analysis and emotional impact...',
        backgroundColor: '#FFE0B2'
      }
    }
  ],

  // Video Content → Create production workflow
  'video-content': [
    {
      type: ELEMENT_TYPES.BOARD,
      title: 'Storyboard',
      description: 'Visual sequence and key frames',
      position: { x: 100, y: 100 },
      data: {
        title: 'Storyboard',
        backgroundColor: '#E3F2FD',
        description: 'Auto-generated from video analysis'
      }
    },
    {
      type: ELEMENT_TYPES.NOTE,
      title: 'Content Notes',
      description: 'Video content analysis and notes',
      position: { x: 400, y: 100 },
      data: {
        title: 'Content Notes',
        content: 'Video analysis results...',
        backgroundColor: '#FFF9C4'
      }
    }
  ]
};

// Smart positioning algorithm to avoid overlaps
const calculateSmartPosition = (existingElements, basePosition = { x: 100, y: 100 }) => {
  const GRID_SIZE = 20;
  const MIN_DISTANCE = 280; // Minimum distance between nodes
  
  let position = { ...basePosition };
  let attempts = 0;
  const maxAttempts = 50;
  
  while (attempts < maxAttempts) {
    // Check if current position overlaps with existing elements
    const hasOverlap = existingElements.some(element => {
      const distance = Math.sqrt(
        Math.pow(element.position.x - position.x, 2) + 
        Math.pow(element.position.y - position.y, 2)
      );
      return distance < MIN_DISTANCE;
    });
    
    if (!hasOverlap) {
      // Snap to grid
      position.x = Math.round(position.x / GRID_SIZE) * GRID_SIZE;
      position.y = Math.round(position.y / GRID_SIZE) * GRID_SIZE;
      return position;
    }
    
    // Try next position in a spiral pattern
    const angle = (attempts * 0.5) % (2 * Math.PI);
    const radius = 50 + (attempts * 10);
    
    position = {
      x: basePosition.x + Math.cos(angle) * radius,
      y: basePosition.y + Math.sin(angle) * radius
    };
    
    attempts++;
  }
  
  return position;
};

/**
 * Generates context-aware node suggestions based on file analysis
 */
export const generateContextualNodes = (analysis, sourcePosition, existingElements = []) => {
  if (!analysis || !analysis.contentType) return [];
  
  const templates = NODE_TEMPLATES[analysis.contentType];
  if (!templates) return [];
  
  const suggestions = templates.map((template, index) => {
    // Calculate smart position relative to source
    const basePosition = {
      x: sourcePosition.x + 300 + (index % 2) * 300,
      y: sourcePosition.y + Math.floor(index / 2) * 200
    };
    
    const smartPosition = calculateSmartPosition(existingElements, basePosition);
    
    return {
      ...template,
      position: smartPosition,
      metadata: {
        sourceAnalysis: analysis,
        autoGenerated: true,
        confidence: analysis.confidence,
        createdAt: Date.now()
      }
    };
  });
  
  return suggestions;
};

/**
 * Creates actual node elements from suggestions
 */
export const createNodesFromSuggestions = (suggestions, addElementFn) => {
  const createdNodes = [];
  
  suggestions.forEach(suggestion => {
    try {
      const nodeId = addElementFn(suggestion.type, suggestion.position, suggestion.data);
      createdNodes.push({
        id: nodeId,
        type: suggestion.type,
        title: suggestion.title,
        position: suggestion.position
      });
    } catch (error) {
      console.error('Failed to create suggested node:', error);
    }
  });
  
  return createdNodes;
};

/**
 * Smart workflow suggestions based on analysis patterns
 */
export const suggestWorkflows = (analysis, context = {}) => {
  const workflows = [];
  
  switch (analysis.contentType) {
    case 'brief':
      workflows.push({
        id: 'client-project-workflow',
        title: 'Client Project Setup',
        description: 'Complete client project workflow from brief to delivery',
        steps: [
          'Extract requirements from brief',
          'Create project timeline',
          'Generate mood board',
          'Setup deliverables tracking',
          'Create presentation template'
        ],
        estimatedTime: '2 minutes',
        automation: true
      });
      break;
      
    case 'design':
      workflows.push({
        id: 'design-system-workflow',
        title: 'Design System Creation',
        description: 'Extract design elements and create systematic guidelines',
        steps: [
          'Analyze color palette',
          'Extract typography',
          'Create component library',
          'Generate style guide',
          'Setup design tokens'
        ],
        estimatedTime: '90 seconds',
        automation: true
      });
      break;
      
    case 'image':
      workflows.push({
        id: 'mood-board-workflow',
        title: 'Mood Board Development',
        description: 'Analyze visual style and create comprehensive mood board',
        steps: [
          'Analyze visual style',
          'Extract color palette',
          'Find similar aesthetics',
          'Create mood board',
          'Generate style guide'
        ],
        estimatedTime: '75 seconds',
        automation: true
      });
      break;
  }
  
  return workflows;
};

/**
 * Intelligent canvas organization based on content relationships
 */
export const organizeCanvasIntelligently = (elements, analysis) => {
  // Group related elements
  const groups = {
    planning: elements.filter(el => 
      el.data?.title?.toLowerCase().includes('timeline') ||
      el.data?.title?.toLowerCase().includes('requirement') ||
      el.data?.title?.toLowerCase().includes('brief')
    ),
    creative: elements.filter(el => 
      el.data?.title?.toLowerCase().includes('mood') ||
      el.data?.title?.toLowerCase().includes('color') ||
      el.data?.title?.toLowerCase().includes('style')
    ),
    execution: elements.filter(el => 
      el.data?.title?.toLowerCase().includes('deliverable') ||
      el.data?.title?.toLowerCase().includes('asset') ||
      el.data?.title?.toLowerCase().includes('final')
    )
  };
  
  // Suggest layout optimizations
  const optimizations = [];
  
  if (groups.planning.length > 2) {
    optimizations.push({
      type: 'group-layout',
      title: 'Organize Planning Elements',
      description: 'Group planning-related elements in top-left area',
      action: 'arrange-planning-group'
    });
  }
  
  if (groups.creative.length > 2) {
    optimizations.push({
      type: 'group-layout',
      title: 'Organize Creative Elements',
      description: 'Group creative elements in central area',
      action: 'arrange-creative-group'
    });
  }
  
  return optimizations;
};