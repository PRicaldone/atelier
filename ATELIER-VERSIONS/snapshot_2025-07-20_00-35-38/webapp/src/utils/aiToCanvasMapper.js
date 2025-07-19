/**
 * AI to Canvas Mapper
 * Converts AI response structures to canvas elements
 * 
 * This utility ensures clean separation between AI responses and canvas logic,
 * making it easy to evolve AI formats without touching canvas components.
 */

import { SuperClaudeOperations, ResponseTypes } from '../modules/shared/ai/agents/SuperClaudeAgent.js';

/**
 * Canvas element positioning configuration
 */
const LAYOUT_CONFIG = {
  spacing: {
    vertical: 100,
    horizontal: 320,
    indent: 50
  },
  dimensions: {
    note: { width: 280, height: 'auto' },
    board: { width: 320, height: 200 },
    image: { width: 300, height: 220 },
    header: { width: 300, height: 'auto' }
  }
};

/**
 * Main mapper class for AI responses to canvas elements
 */
export class AIToCanvasMapper {
  constructor(options = {}) {
    this.options = {
      enableAnalytics: options.enableAnalytics !== false,
      maxElementsPerSection: options.maxElementsPerSection || 10,
      autoPosition: options.autoPosition !== false,
      ...options
    };
  }

  /**
   * Convert AI response to canvas elements based on response type
   * @param {object} aiResponse - AI response from SuperClaudeAgent
   * @param {object} basePosition - Starting position for element placement
   * @param {string} operation - Original AI operation type
   * @returns {Array} Array of canvas elements
   */
  mapResponseToElements(aiResponse, basePosition, operation) {
    if (!aiResponse.success || !aiResponse.data) {
      throw new Error('Invalid AI response structure');
    }

    const { data } = aiResponse;
    let elements = [];

    switch (data.type) {
      case ResponseTypes.BOARD_STRUCTURE:
        elements = this.mapBoardStructure(data, basePosition);
        break;
        
      case ResponseTypes.CONTENT_SUGGESTIONS:
        elements = this.mapContentSuggestions(data, basePosition);
        break;
        
      case ResponseTypes.WORKFLOW_STEPS:
        elements = this.mapWorkflowSteps(data, basePosition);
        break;
        
      case ResponseTypes.GENERATED_CONTENT:
        elements = this.mapGeneratedContent(data, basePosition);
        break;
        
      case ResponseTypes.ORGANIZATION_STRUCTURE:
        elements = this.mapOrganizationStructure(data, basePosition);
        break;
        
      case ResponseTypes.CONNECTION_MAP:
        elements = this.mapConnectionMap(data, basePosition);
        break;
        
      default:
        elements = this.mapGenericResponse(data, basePosition);
    }

    // Add AI metadata to all elements
    elements = elements.map(element => ({
      ...element,
      aiGenerated: true,
      aiOperation: operation,
      aiTimestamp: Date.now(),
      aiFallback: data.fallback || false
    }));

    // Emit analytics if enabled
    if (this.options.enableAnalytics && window.__eventBus) {
      window.__eventBus.emit('ai.mapper.conversion_completed', {
        responseType: data.type,
        operation,
        elementsCount: elements.length,
        basePosition,
        timestamp: Date.now()
      });
    }

    return elements;
  }

  /**
   * Map board structure response to canvas elements
   * @param {object} data - Board structure data
   * @param {object} basePosition - Base position
   * @returns {Array} Canvas elements
   */
  mapBoardStructure(data, basePosition) {
    if (!data.sections || !Array.isArray(data.sections)) {
      return this.createFallbackElement(basePosition, 'Invalid board structure received');
    }

    const elements = [];
    let currentY = basePosition.y;

    for (const section of data.sections) {
      // Create section header
      elements.push({
        id: this.generateElementId('header'),
        type: 'note',
        position: { x: basePosition.x, y: currentY },
        data: {
          title: section.title || 'Untitled Section',
          content: section.description || '',
          ...LAYOUT_CONFIG.dimensions.header,
          sectionHeader: true,
          sectionId: section.id
        }
      });

      currentY += LAYOUT_CONFIG.spacing.vertical;

      // Create section elements
      if (section.elements && Array.isArray(section.elements)) {
        const sectionElements = this.createSectionElements(
          section.elements, 
          basePosition.x + LAYOUT_CONFIG.spacing.indent, 
          currentY
        );
        elements.push(...sectionElements);
        
        // Update Y position for next section
        const maxElementsInRow = Math.ceil(sectionElements.length / 3); // Max 3 per row
        currentY += maxElementsInRow * LAYOUT_CONFIG.spacing.vertical;
      }

      currentY += LAYOUT_CONFIG.spacing.vertical / 2; // Section separator
    }

    return elements;
  }

  /**
   * Map content suggestions to canvas elements
   * @param {object} data - Content suggestions data
   * @param {object} basePosition - Base position
   * @returns {Array} Canvas elements
   */
  mapContentSuggestions(data, basePosition) {
    if (!data.suggestions || !Array.isArray(data.suggestions)) {
      return this.createFallbackElement(basePosition, 'No suggestions received');
    }

    const elements = [];
    let currentY = basePosition.y;

    // Create header for suggestions
    elements.push({
      id: this.generateElementId('suggestions-header'),
      type: 'note',
      position: { x: basePosition.x, y: currentY },
      data: {
        title: 'AI Suggestions',
        content: `${data.suggestions.length} suggestions generated`,
        ...LAYOUT_CONFIG.dimensions.header,
        suggestionsHeader: true
      }
    });

    currentY += LAYOUT_CONFIG.spacing.vertical;

    // Create suggestion elements
    for (let i = 0; i < data.suggestions.length; i++) {
      const suggestion = data.suggestions[i];
      elements.push({
        id: this.generateElementId(`suggestion-${i}`),
        type: 'note',
        position: { x: basePosition.x, y: currentY },
        data: {
          title: `Suggestion ${i + 1}`,
          content: this.extractSuggestionContent(suggestion),
          ...LAYOUT_CONFIG.dimensions.note,
          suggestionType: suggestion.type || 'general',
          suggestionAction: suggestion.action
        }
      });

      currentY += LAYOUT_CONFIG.spacing.vertical;
    }

    return elements;
  }

  /**
   * Map workflow steps to canvas elements
   * @param {object} data - Workflow steps data
   * @param {object} basePosition - Base position
   * @returns {Array} Canvas elements
   */
  mapWorkflowSteps(data, basePosition) {
    if (!data.steps || !Array.isArray(data.steps)) {
      return this.createFallbackElement(basePosition, 'No workflow steps received');
    }

    const elements = [];
    let currentY = basePosition.y;

    // Create workflow header
    elements.push({
      id: this.generateElementId('workflow-header'),
      type: 'note',
      position: { x: basePosition.x, y: currentY },
      data: {
        title: 'AI Generated Workflow',
        content: `${data.steps.length} steps identified`,
        ...LAYOUT_CONFIG.dimensions.header,
        workflowHeader: true
      }
    });

    currentY += LAYOUT_CONFIG.spacing.vertical;

    // Create step elements
    for (let i = 0; i < data.steps.length; i++) {
      const step = data.steps[i];
      elements.push({
        id: this.generateElementId(`step-${i}`),
        type: 'note',
        position: { x: basePosition.x, y: currentY },
        data: {
          title: `${i + 1}. ${step.title || 'Untitled Step'}`,
          content: `${step.description || ''}\n${step.estimated_time ? `⏱️ ${step.estimated_time}` : ''}`,
          ...LAYOUT_CONFIG.dimensions.note,
          stepNumber: i + 1,
          stepId: step.id,
          estimatedTime: step.estimated_time
        }
      });

      currentY += LAYOUT_CONFIG.spacing.vertical;
    }

    return elements;
  }

  /**
   * Map generated content to canvas elements
   * @param {object} data - Generated content data
   * @param {object} basePosition - Base position
   * @returns {Array} Canvas elements
   */
  mapGeneratedContent(data, basePosition) {
    const content = data.content || data.text || 'No content generated';
    
    return [{
      id: this.generateElementId('generated-content'),
      type: 'note',
      position: basePosition,
      data: {
        title: data.title || 'AI Generated Content',
        content: content,
        ...LAYOUT_CONFIG.dimensions.note,
        contentType: data.contentType || 'text'
      }
    }];
  }

  /**
   * Map organization structure to canvas elements
   * @param {object} data - Organization structure data
   * @param {object} basePosition - Base position
   * @returns {Array} Canvas elements
   */
  mapOrganizationStructure(data, basePosition) {
    // Similar to board structure but with organizational hierarchy
    return this.mapBoardStructure(data, basePosition);
  }

  /**
   * Map connection map to canvas elements
   * @param {object} data - Connection map data
   * @param {object} basePosition - Base position
   * @returns {Array} Canvas elements
   */
  mapConnectionMap(data, basePosition) {
    const connections = data.connections || [];
    const elements = [];
    let currentY = basePosition.y;

    // Create connection header
    elements.push({
      id: this.generateElementId('connections-header'),
      type: 'note',
      position: { x: basePosition.x, y: currentY },
      data: {
        title: 'AI Identified Connections',
        content: `${connections.length} connections found`,
        ...LAYOUT_CONFIG.dimensions.header,
        connectionsHeader: true
      }
    });

    currentY += LAYOUT_CONFIG.spacing.vertical;

    // Create connection elements
    for (let i = 0; i < connections.length; i++) {
      const connection = connections[i];
      elements.push({
        id: this.generateElementId(`connection-${i}`),
        type: 'note',
        position: { x: basePosition.x, y: currentY },
        data: {
          title: `Connection ${i + 1}`,
          content: `${connection.source || 'Unknown'} → ${connection.target || 'Unknown'}\n${connection.description || ''}`,
          ...LAYOUT_CONFIG.dimensions.note,
          connectionType: connection.type,
          strength: connection.strength
        }
      });

      currentY += LAYOUT_CONFIG.spacing.vertical;
    }

    return elements;
  }

  /**
   * Map generic/unknown response type
   * @param {object} data - Generic data
   * @param {object} basePosition - Base position
   * @returns {Array} Canvas elements
   */
  mapGenericResponse(data, basePosition) {
    const content = JSON.stringify(data, null, 2);
    
    return [{
      id: this.generateElementId('generic-response'),
      type: 'note',
      position: basePosition,
      data: {
        title: 'AI Response',
        content: content.length > 500 ? content.substring(0, 500) + '...' : content,
        ...LAYOUT_CONFIG.dimensions.note,
        responseType: 'generic'
      }
    }];
  }

  /**
   * Create section elements with intelligent positioning
   * @param {Array} elements - Section elements
   * @param {number} baseX - Base X position
   * @param {number} baseY - Base Y position
   * @returns {Array} Canvas elements
   */
  createSectionElements(elements, baseX, baseY) {
    const canvasElements = [];
    const maxPerRow = 3;
    
    for (let i = 0; i < Math.min(elements.length, this.options.maxElementsPerSection); i++) {
      const element = elements[i];
      const row = Math.floor(i / maxPerRow);
      const col = i % maxPerRow;
      
      const x = baseX + (col * LAYOUT_CONFIG.spacing.horizontal);
      const y = baseY + (row * LAYOUT_CONFIG.spacing.vertical);

      canvasElements.push({
        id: this.generateElementId(`section-element-${i}`),
        type: element.type || 'note',
        position: { x, y },
        data: {
          title: element.title || 'Untitled',
          content: element.content || '',
          ...LAYOUT_CONFIG.dimensions[element.type] || LAYOUT_CONFIG.dimensions.note,
          originalData: element.data
        }
      });
    }

    return canvasElements;
  }

  /**
   * Create fallback element for error cases
   * @param {object} position - Element position
   * @param {string} message - Error message
   * @returns {Array} Fallback element
   */
  createFallbackElement(position, message) {
    return [{
      id: this.generateElementId('fallback'),
      type: 'note',
      position,
      data: {
        title: 'AI Processing Issue',
        content: `${message}\n\nThe AI response could not be properly processed. You can continue working manually.`,
        ...LAYOUT_CONFIG.dimensions.note,
        fallback: true,
        error: true
      }
    }];
  }

  /**
   * Extract content from suggestion object
   * @param {object|string} suggestion - Suggestion data
   * @returns {string} Extracted content
   */
  extractSuggestionContent(suggestion) {
    if (typeof suggestion === 'string') {
      return suggestion;
    }
    
    return suggestion.message || suggestion.content || suggestion.text || 'No content available';
  }

  /**
   * Generate unique element ID
   * @param {string} prefix - ID prefix
   * @returns {string} Unique ID
   */
  generateElementId(prefix = 'ai-element') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Get mapper statistics
   * @returns {object} Mapper stats
   */
  getStats() {
    return {
      layoutConfig: LAYOUT_CONFIG,
      options: this.options,
      version: '1.0.0'
    };
  }
}

/**
 * Convenience function for quick mapping
 * @param {object} aiResponse - AI response
 * @param {object} basePosition - Base position
 * @param {string} operation - AI operation
 * @param {object} options - Mapper options
 * @returns {Array} Canvas elements
 */
export function mapAIResponseToCanvas(aiResponse, basePosition, operation, options = {}) {
  const mapper = new AIToCanvasMapper(options);
  return mapper.mapResponseToElements(aiResponse, basePosition, operation);
}

/**
 * Default mapper instance
 */
export const defaultMapper = new AIToCanvasMapper();

export default AIToCanvasMapper;