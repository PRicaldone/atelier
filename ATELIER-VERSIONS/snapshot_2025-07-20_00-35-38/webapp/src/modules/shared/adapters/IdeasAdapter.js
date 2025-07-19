/**
 * IdeasAdapter - Safe Cross-Module Communication
 * 
 * Professional adapter pattern for Ideas module integration
 * Follows Atelier's enterprise architecture patterns
 */

import { ModuleLogger } from '../monitoring/ModuleLogger.js';

class IdeasAdapter {
  constructor() {
    this.logger = new ModuleLogger('ideas-adapter');
    this.moduleNames = ['ideas', 'roadmap', 'commercial-ideas'];
    this._store = null;
  }

  /**
   * Get Ideas store with error handling
   */
  async _getStore() {
    if (this._store) return this._store;

    try {
      // Try multiple module name variations
      for (const moduleName of this.moduleNames) {
        if (window.__moduleRegistry) {
          try {
            this._store = await window.__moduleRegistry.getModule(moduleName);
            if (this._store) {
              this.logger.info(`Connected to Ideas store via "${moduleName}"`, 'connect');
              return this._store;
            }
          } catch (error) {
            // Continue to next module name
            continue;
          }
        }
      }

      // Fallback to direct import
      const { useIdeasStore } = await import('../../ideas/store.js');
      this._store = useIdeasStore;
      this.logger.info('Connected to Ideas store via direct import', 'connect');
      return this._store;
      
    } catch (error) {
      this.logger.error(error, '_getStore');
      throw new Error('Ideas store not available');
    }
  }

  /**
   * Health check for the Ideas module
   */
  async healthCheck() {
    try {
      const store = await this._getStore();
      const state = store.getState();
      
      return {
        status: 'healthy',
        ideasCount: state.ideas.length,
        activeIdeas: state.ideas.filter(idea => !idea.archived).length,
        lastUpdated: new Date().toISOString(),
        module: 'ideas'
      };
    } catch (error) {
      this.logger.error(error, 'healthCheck');
      return {
        status: 'unhealthy',
        error: error.message,
        module: 'ideas'
      };
    }
  }

  // Core CRUD Operations

  /**
   * Add new idea with validation
   */
  async addIdea(ideaData) {
    try {
      const store = await this._getStore();
      const result = store.getState().addIdea(ideaData);
      
      if (result) {
        this.logger.info(`Idea created: ${result.id}`, 'addIdea', { 
          category: result.category, 
          status: result.status 
        });
        return result;
      } else {
        this.logger.warning('Failed to create idea', 'addIdea', { ideaData });
        return null;
      }
    } catch (error) {
      this.logger.error(error, 'addIdea', { ideaData });
      return null;
    }
  }

  /**
   * Update existing idea
   */
  async updateIdea(ideaId, updates) {
    try {
      const store = await this._getStore();
      const success = store.getState().updateIdea(ideaId, updates);
      
      if (success) {
        this.logger.info(`Idea updated: ${ideaId}`, 'updateIdea', { updates });
        return true;
      } else {
        this.logger.warning(`Failed to update idea: ${ideaId}`, 'updateIdea', { updates });
        return false;
      }
    } catch (error) {
      this.logger.error(error, 'updateIdea', { ideaId, updates });
      return false;
    }
  }

  /**
   * Update idea status with validation
   */
  async updateIdeaStatus(ideaId, newStatus) {
    try {
      const store = await this._getStore();
      const success = store.getState().updateIdeaStatus(ideaId, newStatus);
      
      if (success) {
        this.logger.info(`Idea status updated: ${ideaId} -> ${newStatus}`, 'updateIdeaStatus');
        return true;
      } else {
        this.logger.warning(`Invalid status transition for idea: ${ideaId}`, 'updateIdeaStatus', { newStatus });
        return false;
      }
    } catch (error) {
      this.logger.error(error, 'updateIdeaStatus', { ideaId, newStatus });
      return false;
    }
  }

  /**
   * Get idea by ID
   */
  async getIdea(ideaId) {
    try {
      const store = await this._getStore();
      const idea = store.getState().getIdeaById(ideaId);
      
      if (idea) {
        this.logger.info(`Idea retrieved: ${ideaId}`, 'getIdea');
        return idea;
      } else {
        this.logger.warning(`Idea not found: ${ideaId}`, 'getIdea');
        return null;
      }
    } catch (error) {
      this.logger.error(error, 'getIdea', { ideaId });
      return null;
    }
  }

  /**
   * Get ideas with filtering
   */
  async getIdeas(filters = {}) {
    try {
      const store = await this._getStore();
      const state = store.getState();
      
      // Apply filters temporarily
      const originalFilters = state.filters;
      if (Object.keys(filters).length > 0) {
        state.setFilters(filters);
      }
      
      const ideas = state.getFilteredIdeas();
      
      // Restore original filters
      state.setFilters(originalFilters);
      
      this.logger.info(`Retrieved ${ideas.length} ideas`, 'getIdeas', { filters });
      return ideas;
    } catch (error) {
      this.logger.error(error, 'getIdeas', { filters });
      return [];
    }
  }

  /**
   * Get ideas by module (for cross-module integration)
   */
  async getIdeasByModule(moduleName) {
    try {
      const store = await this._getStore();
      const ideas = store.getState().getIdeasByModule(moduleName);
      
      this.logger.info(`Retrieved ${ideas.length} ideas for module: ${moduleName}`, 'getIdeasByModule');
      return ideas;
    } catch (error) {
      this.logger.error(error, 'getIdeasByModule', { moduleName });
      return [];
    }
  }

  /**
   * Delete idea (soft delete)
   */
  async deleteIdea(ideaId) {
    try {
      const store = await this._getStore();
      const success = store.getState().deleteIdea(ideaId);
      
      if (success) {
        this.logger.info(`Idea archived: ${ideaId}`, 'deleteIdea');
        return true;
      } else {
        this.logger.warning(`Failed to archive idea: ${ideaId}`, 'deleteIdea');
        return false;
      }
    } catch (error) {
      this.logger.error(error, 'deleteIdea', { ideaId });
      return false;
    }
  }

  // Bulk Operations

  /**
   * Bulk update multiple ideas
   */
  async bulkUpdateIdeas(ideaIds, updates) {
    try {
      const store = await this._getStore();
      const success = store.getState().bulkUpdateIdeas(ideaIds, updates);
      
      if (success) {
        this.logger.info(`Bulk updated ${ideaIds.length} ideas`, 'bulkUpdateIdeas', { updates });
        return true;
      } else {
        this.logger.warning(`Bulk update failed for ${ideaIds.length} ideas`, 'bulkUpdateIdeas', { updates });
        return false;
      }
    } catch (error) {
      this.logger.error(error, 'bulkUpdateIdeas', { ideaIds, updates });
      return false;
    }
  }

  // Analytics and Statistics

  /**
   * Get ideas statistics
   */
  async getStats() {
    try {
      const store = await this._getStore();
      const stats = store.getState().stats;
      
      this.logger.info('Statistics retrieved', 'getStats', { total: stats.total });
      return stats;
    } catch (error) {
      this.logger.error(error, 'getStats');
      return null;
    }
  }

  /**
   * Get ideas grouped by status (for kanban view)
   */
  async getIdeasByStatus() {
    try {
      const store = await this._getStore();
      const byStatus = store.getState().getIdeasByStatus();
      
      this.logger.info('Ideas grouped by status retrieved', 'getIdeasByStatus');
      return byStatus;
    } catch (error) {
      this.logger.error(error, 'getIdeasByStatus');
      return {};
    }
  }

  // Export Functions

  /**
   * Export ideas in specified format
   */
  async exportIdeas(format = 'json', filteredOnly = true) {
    try {
      const store = await this._getStore();
      const result = store.getState().exportIdeas(format, filteredOnly);
      
      if (result.success) {
        this.logger.info(`Ideas exported successfully`, 'exportIdeas', { 
          format, 
          count: result.count, 
          filename: result.filename 
        });
        return result;
      } else {
        this.logger.warning(`Export failed: ${result.error}`, 'exportIdeas', { format });
        return result;
      }
    } catch (error) {
      this.logger.error(error, 'exportIdeas', { format, filteredOnly });
      return { success: false, error: error.message };
    }
  }

  // Cross-Module Integration

  /**
   * Suggest ideas related to current context
   */
  async suggestRelatedIdeas(context = {}) {
    try {
      const store = await this._getStore();
      const allIdeas = store.getState().ideas.filter(idea => !idea.archived);
      
      // Simple relevance scoring based on context
      const scoredIdeas = allIdeas.map(idea => {
        let score = 0;
        
        // Module relevance
        if (context.module && idea.relatedModules.includes(context.module)) {
          score += 3;
        }
        
        // Category relevance
        if (context.category && idea.category === context.category) {
          score += 2;
        }
        
        // Tag relevance
        if (context.tags && idea.tags) {
          const matchingTags = context.tags.filter(tag => 
            idea.tags.some(ideaTag => ideaTag.toLowerCase().includes(tag.toLowerCase()))
          );
          score += matchingTags.length;
        }
        
        // Text relevance (simple keyword matching)
        if (context.text) {
          const searchText = context.text.toLowerCase();
          const ideaText = `${idea.title} ${idea.description}`.toLowerCase();
          if (ideaText.includes(searchText)) {
            score += 1;
          }
        }
        
        return { ...idea, relevanceScore: score };
      });
      
      // Return top relevant ideas
      const relevant = scoredIdeas
        .filter(idea => idea.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5);
      
      this.logger.info(`Found ${relevant.length} related ideas`, 'suggestRelatedIdeas', { context });
      return relevant;
    } catch (error) {
      this.logger.error(error, 'suggestRelatedIdeas', { context });
      return [];
    }
  }

  /**
   * Add idea from external module
   */
  async addIdeaFromModule(moduleName, ideaData) {
    try {
      const enhancedData = {
        ...ideaData,
        source: 'module',
        relatedModules: [moduleName, ...(ideaData.relatedModules || [])],
        metadata: {
          ...ideaData.metadata,
          sourceModule: moduleName,
          importedAt: new Date().toISOString()
        }
      };
      
      const result = await this.addIdea(enhancedData);
      
      if (result) {
        this.logger.info(`Idea imported from module: ${moduleName}`, 'addIdeaFromModule', { 
          ideaId: result.id 
        });
      }
      
      return result;
    } catch (error) {
      this.logger.error(error, 'addIdeaFromModule', { moduleName, ideaData });
      return null;
    }
  }

  // Utility Methods

  /**
   * Search ideas with advanced options
   */
  async searchIdeas(query, options = {}) {
    try {
      const filters = {
        search: query,
        ...options
      };
      
      return await this.getIdeas(filters);
    } catch (error) {
      this.logger.error(error, 'searchIdeas', { query, options });
      return [];
    }
  }

  /**
   * Get module information
   */
  getModuleInfo() {
    return {
      name: 'ideas',
      version: '1.0.0',
      description: 'Ideas & Commercial Roadmap Module',
      adapters: this.moduleNames,
      capabilities: [
        'create', 'read', 'update', 'delete',
        'bulk-operations', 'export', 'search',
        'cross-module-integration', 'analytics'
      ]
    };
  }
}

// Create singleton instance
export const ideasAdapter = new IdeasAdapter();

// Global access for debugging
if (typeof window !== 'undefined') {
  window.__ideasAdapter = ideasAdapter;
}

export default ideasAdapter;