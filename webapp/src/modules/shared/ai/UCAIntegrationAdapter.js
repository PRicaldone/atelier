/**
 * 🚨 POLICY: Universal Content Awareness (UCA) Integration Adapter for AI
 * 
 * This adapter ensures all AI components have full access to UCA data
 * and can leverage content awareness for intelligent operations.
 * 
 * Complies with UCA Policy v2.0.1 as defined in /docs/BIFLOW-COMPLETE-TYPES.md
 */

import { globalUCA } from '../content/universal-content-awareness.js';
import { fileAccessManager } from '../../scriptorium/file-types.js';
import { useCanvasStore } from '../../scriptorium/store.js';
import { useMindGardenStore } from '../../mind-garden/store.js';

class UCAIntegrationAdapter {
  constructor() {
    this.uca = globalUCA;
    this.contentCache = new Map();
  }

  /**
   * Get all UCA-aware content from current workspace
   * @param {Object} options - Filter options
   * @returns {Array} Array of UCA-enhanced content items
   */
  async getAllWorkspaceContent(options = {}) {
    const content = [];
    
    // Get content from Scriptorium/Canvas
    const canvasElements = useCanvasStore.getState().elements;
    for (const element of canvasElements) {
      if (element.ucaMetadata || element.type === 'file') {
        content.push(await this.enhanceWithUCA(element, 'scriptorium'));
      }
    }

    // Get content from Mind Garden
    const mindGardenNodes = useMindGardenStore.getState().nodes;
    for (const node of mindGardenNodes) {
      if (node.data?.ucaMetadata || node.data?.hasFile) {
        content.push(await this.enhanceWithUCA(node, 'mind-garden'));
      }
    }


    // Apply filters
    if (options.type) {
      return content.filter(item => item.contentType === options.type);
    }
    if (options.aiReadable) {
      return content.filter(item => item.aiReadable !== false);
    }

    return content;
  }

  /**
   * Enhance an element with full UCA metadata and preview
   */
  async enhanceWithUCA(element, source) {
    const ucaData = {
      id: element.id,
      source,
      originalElement: element,
      contentType: this.detectContentType(element),
      aiReadable: true,
      metadata: {},
      preview: null,
      aiContext: {}
    };

    // Extract metadata based on source
    switch (source) {
      case 'scriptorium':
        ucaData.metadata = {
          name: element.name || element.text,
          position: element.position,
          connections: element.connections || [],
          ...element.ucaMetadata
        };
        break;
      case 'mind-garden':
        ucaData.metadata = {
          title: element.data?.title,
          content: element.data?.content,
          phase: element.data?.phase,
          tags: element.data?.tags || [],
          ...element.data?.ucaMetadata
        };
        break;
        ucaData.metadata = {
          title: element.title,
          description: element.description,
          status: element.status,
          attachments: element.attachments,
          ...element.ucaMetadata
        };
        break;
    }

    // Generate preview if needed
    if (element.type === 'file' || element.filePath) {
      ucaData.preview = await this.generatePreview(element);
    }

    // Extract AI context
    ucaData.aiContext = await this.extractAIContext(ucaData);

    return ucaData;
  }

  /**
   * Detect content type using UCA recognizers
   */
  detectContentType(element) {
    if (element.type === 'file' && element.filePath) {
      const ext = element.filePath.split('.').pop().toLowerCase();
      return this.uca.recognizeByExtension(ext);
    }
    
    if (element.type === 'image') return 'image';
    if (element.type === 'link') return 'link';
    if (element.type === 'board') return 'board';
    
    return element.type || 'text';
  }

  /**
   * Generate preview for content
   */
  async generatePreview(element) {
    if (this.contentCache.has(element.id)) {
      return this.contentCache.get(element.id).preview;
    }

    try {
      // Check for existing preview
      if (element.preview) return element.preview;

      // Generate based on type
      const contentType = this.detectContentType(element);
      const renderer = this.uca.getRenderer(contentType);
      
      if (renderer && renderer.generatePreview) {
        const preview = await renderer.generatePreview(element);
        this.contentCache.set(element.id, { preview });
        return preview;
      }

      return null;
    } catch (error) {
      console.error('Error generating preview:', error);
      return null;
    }
  }

  /**
   * Extract AI-accessible context from content
   */
  async extractAIContext(ucaData) {
    const context = {
      summary: '',
      entities: [],
      keywords: [],
      relationships: []
    };

    // Extract based on content type
    switch (ucaData.contentType) {
      case 'text':
      case 'markdown':
        context.summary = this.summarizeText(ucaData.metadata.content || ucaData.metadata.name);
        context.keywords = this.extractKeywords(context.summary);
        break;
        
      case 'image':
        if (ucaData.metadata.alt) {
          context.summary = ucaData.metadata.alt;
        }
        if (ucaData.metadata.caption) {
          context.summary += ' ' + ucaData.metadata.caption;
        }
        break;
        
      case 'pdf':
      case 'document':
        // Would need actual file access here
        context.summary = `Document: ${ucaData.metadata.name}`;
        if (ucaData.preview?.extractedText) {
          context.summary = this.summarizeText(ucaData.preview.extractedText);
        }
        break;
        
      case 'link':
        context.summary = `Link to: ${ucaData.metadata.url || ucaData.metadata.name}`;
        break;
    }

    // Extract relationships
    if (ucaData.metadata.connections?.length > 0) {
      context.relationships = ucaData.metadata.connections;
    }

    return context;
  }

  /**
   * Simple text summarization
   */
  summarizeText(text, maxLength = 200) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Simple keyword extraction
   */
  extractKeywords(text) {
    if (!text) return [];
    
    // Remove common words and extract meaningful terms
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
    const words = text.toLowerCase().split(/\W+/);
    
    return words
      .filter(word => word.length > 3 && !commonWords.has(word))
      .slice(0, 5);
  }

  /**
   * Get AI-ready context for a specific module or area
   */
  async getModuleAIContext(moduleName) {
    const allContent = await this.getAllWorkspaceContent();
    const moduleContent = allContent.filter(item => item.source === moduleName);
    
    return {
      module: moduleName,
      contentCount: moduleContent.length,
      contentTypes: [...new Set(moduleContent.map(item => item.contentType))],
      items: moduleContent.map(item => ({
        id: item.id,
        type: item.contentType,
        summary: item.aiContext.summary,
        keywords: item.aiContext.keywords,
        preview: item.preview
      }))
    };
  }

  /**
   * Check if AI has permission to access specific content
   */
  async checkAIPermission(contentId, operation = 'read') {
    // Integrate with fileAccessManager for file-based content
    const content = await this.getAllWorkspaceContent();
    const item = content.find(c => c.id === contentId);
    
    if (!item) return false;
    
    // Check if it's a file that needs explicit permission
    if (item.contentType === 'file' || item.originalElement.filePath) {
      return await fileAccessManager.requestAccess(
        item.originalElement.filePath,
        `AI wants to ${operation} this file`
      );
    }
    
    // Non-file content is generally accessible
    return true;
  }

  /**
   * Prepare content for AI agent consumption
   */
  async prepareForAI(contentIds = []) {
    const allContent = await this.getAllWorkspaceContent({ aiReadable: true });
    
    let targetContent = allContent;
    if (contentIds.length > 0) {
      targetContent = allContent.filter(item => contentIds.includes(item.id));
    }

    return {
      timestamp: new Date().toISOString(),
      ucaVersion: '2.0.1',
      contentCount: targetContent.length,
      workspace: {
        scriptorium: targetContent.filter(c => c.source === 'scriptorium').length,
        mindGarden: targetContent.filter(c => c.source === 'mind-garden').length,
      },
      content: targetContent.map(item => ({
        id: item.id,
        source: item.source,
        type: item.contentType,
        metadata: item.metadata,
        context: item.aiContext,
        preview: item.preview ? 'Available' : 'Not available'
      }))
    };
  }
}

// Singleton instance
export const ucaIntegration = new UCAIntegrationAdapter();

// Export for window debugging
if (typeof window !== 'undefined') {
  window.__ucaIntegration = ucaIntegration;
}