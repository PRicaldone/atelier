/**
 * Ideas Module Store - Zustand State Management
 * 
 * Professional-grade state management for Ideas & Commercial Roadmap Module
 * Integrated with Atelier's enterprise architecture and persistence layer
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  IdeaStatus, 
  IdeaCategory, 
  IdeaPriority,
  StatusTransitions,
  createIdeaTemplate,
  IdeasEvents 
} from './types.js';

// Storage key for persistence
const STORAGE_KEY = 'ATELIER_IDEAS_STATE';

/**
 * Ideas Store with enterprise-grade patterns
 */
export const useIdeasStore = create(
  persist(
    (set, get) => ({
      // Core State
      ideas: [],
      filters: {
        status: [],
        category: [],
        priority: [],
        author: '',
        search: '',
        tags: [],
        relatedModules: []
      },
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      selectedIdea: null,
      loading: false,
      error: null,
      
      // UI State
      viewMode: 'table', // 'table', 'kanban', 'timeline'
      showArchived: false,
      bulkSelection: [],
      
      // Statistics
      stats: {
        total: 0,
        byStatus: {},
        byCategory: {},
        byPriority: {},
        implementedCount: 0,
        activeCount: 0
      },

      // Core Actions
      /**
       * Add new idea with validation
       */
      addIdea: (ideaData) => {
        try {
          const newIdea = createIdeaTemplate(ideaData);
          
          set((state) => {
            const updatedIdeas = [...state.ideas, newIdea];
            const updatedStats = get().calculateStats(updatedIdeas);
            
            return {
              ideas: updatedIdeas,
              stats: updatedStats,
              error: null
            };
          });

          // Emit event for cross-module communication
          if (window.__eventBus) {
            window.__eventBus.emit(IdeasEvents.IDEA_CREATED, {
              idea: newIdea,
              timestamp: Date.now()
            });
          }

          // Track with analytics system
          if (window.__usageTracker) {
            window.__usageTracker.logInteraction('ideas', 'create', {
              category: newIdea.category,
              status: newIdea.status,
              source: newIdea.source
            });
          }

          return newIdea;
        } catch (error) {
          set({ error: error.message });
          console.error('[Ideas Store] Failed to add idea:', error);
          return null;
        }
      },

      /**
       * Update existing idea with validation
       */
      updateIdea: (ideaId, updates) => {
        try {
          set((state) => {
            const ideaIndex = state.ideas.findIndex(idea => idea.id === ideaId);
            if (ideaIndex === -1) {
              throw new Error(`Idea with id ${ideaId} not found`);
            }

            const currentIdea = state.ideas[ideaIndex];
            const updatedIdea = {
              ...currentIdea,
              ...updates,
              updatedAt: new Date().toISOString()
            };

            const updatedIdeas = [...state.ideas];
            updatedIdeas[ideaIndex] = updatedIdea;
            const updatedStats = get().calculateStats(updatedIdeas);

            // Emit events for significant changes
            if (updates.status && updates.status !== currentIdea.status) {
              if (window.__eventBus) {
                window.__eventBus.emit(IdeasEvents.IDEA_STATUS_CHANGED, {
                  idea: updatedIdea,
                  oldStatus: currentIdea.status,
                  newStatus: updates.status,
                  timestamp: Date.now()
                });
              }
            }

            if (window.__eventBus) {
              window.__eventBus.emit(IdeasEvents.IDEA_UPDATED, {
                idea: updatedIdea,
                changes: updates,
                timestamp: Date.now()
              });
            }

            return {
              ideas: updatedIdeas,
              stats: updatedStats,
              error: null
            };
          });

          return true;
        } catch (error) {
          set({ error: error.message });
          console.error('[Ideas Store] Failed to update idea:', error);
          return false;
        }
      },

      /**
       * Change idea status with validation
       */
      updateIdeaStatus: (ideaId, newStatus) => {
        const state = get();
        const idea = state.ideas.find(i => i.id === ideaId);
        
        if (!idea) {
          set({ error: `Idea ${ideaId} not found` });
          return false;
        }

        // Validate status transition
        const allowedTransitions = StatusTransitions[idea.status] || [];
        if (!allowedTransitions.includes(newStatus)) {
          set({ error: `Invalid status transition from ${idea.status} to ${newStatus}` });
          return false;
        }

        return state.updateIdea(ideaId, { status: newStatus });
      },

      /**
       * Delete idea (soft delete by archiving)
       */
      deleteIdea: (ideaId) => {
        return get().updateIdea(ideaId, { archived: true });
      },

      /**
       * Permanently remove idea
       */
      removeIdea: (ideaId) => {
        try {
          set((state) => {
            const updatedIdeas = state.ideas.filter(idea => idea.id !== ideaId);
            const updatedStats = get().calculateStats(updatedIdeas);
            
            return {
              ideas: updatedIdeas,
              stats: updatedStats,
              error: null
            };
          });

          if (window.__eventBus) {
            window.__eventBus.emit(IdeasEvents.IDEA_DELETED, {
              ideaId,
              timestamp: Date.now()
            });
          }

          return true;
        } catch (error) {
          set({ error: error.message });
          return false;
        }
      },

      // Filtering and Search
      /**
       * Apply filters to ideas
       */
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }));
      },

      /**
       * Clear all filters
       */
      clearFilters: () => {
        set({
          filters: {
            status: [],
            category: [],
            priority: [],
            author: '',
            search: '',
            tags: [],
            relatedModules: []
          }
        });
      },

      /**
       * Get filtered and sorted ideas
       */
      getFilteredIdeas: () => {
        const state = get();
        let filtered = state.ideas.filter(idea => {
          // Archive filter
          if (!state.showArchived && idea.archived) return false;

          // Status filter
          if (state.filters.status.length > 0 && !state.filters.status.includes(idea.status)) {
            return false;
          }

          // Category filter
          if (state.filters.category.length > 0 && !state.filters.category.includes(idea.category)) {
            return false;
          }

          // Priority filter
          if (state.filters.priority.length > 0 && !state.filters.priority.includes(idea.priority)) {
            return false;
          }

          // Author filter
          if (state.filters.author && !idea.author.toLowerCase().includes(state.filters.author.toLowerCase())) {
            return false;
          }

          // Search filter
          if (state.filters.search) {
            const searchTerm = state.filters.search.toLowerCase();
            const searchableText = `${idea.title} ${idea.description} ${idea.notes}`.toLowerCase();
            if (!searchableText.includes(searchTerm)) return false;
          }

          // Tags filter
          if (state.filters.tags.length > 0) {
            const hasMatchingTag = state.filters.tags.some(tag => 
              idea.tags.some(ideaTag => ideaTag.toLowerCase().includes(tag.toLowerCase()))
            );
            if (!hasMatchingTag) return false;
          }

          // Related modules filter
          if (state.filters.relatedModules.length > 0) {
            const hasMatchingModule = state.filters.relatedModules.some(module =>
              idea.relatedModules.includes(module)
            );
            if (!hasMatchingModule) return false;
          }

          return true;
        });

        // Apply sorting
        filtered.sort((a, b) => {
          let aVal = a[state.sortBy];
          let bVal = b[state.sortBy];

          // Handle different data types
          if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
          }

          if (state.sortOrder === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
          }
        });

        return filtered;
      },

      // Bulk Operations
      /**
       * Update multiple ideas
       */
      bulkUpdateIdeas: (ideaIds, updates) => {
        try {
          const results = ideaIds.map(id => get().updateIdea(id, updates));
          const success = results.every(result => result === true);

          if (success && window.__eventBus) {
            window.__eventBus.emit(IdeasEvents.IDEAS_BULK_UPDATE, {
              ideaIds,
              updates,
              timestamp: Date.now()
            });
          }

          return success;
        } catch (error) {
          set({ error: error.message });
          return false;
        }
      },

      // Analytics and Statistics
      /**
       * Calculate comprehensive statistics
       */
      calculateStats: (ideas = null) => {
        const ideasToAnalyze = ideas || get().ideas;
        const activeIdeas = ideasToAnalyze.filter(idea => !idea.archived);

        const stats = {
          total: ideasToAnalyze.length,
          active: activeIdeas.length,
          archived: ideasToAnalyze.length - activeIdeas.length,
          byStatus: {},
          byCategory: {},
          byPriority: {},
          implementedCount: 0,
          averageVotes: 0
        };

        // Calculate distributions
        Object.values(IdeaStatus).forEach(status => {
          stats.byStatus[status] = activeIdeas.filter(idea => idea.status === status).length;
        });

        Object.values(IdeaCategory).forEach(category => {
          stats.byCategory[category] = activeIdeas.filter(idea => idea.category === category).length;
        });

        Object.values(IdeaPriority).forEach(priority => {
          stats.byPriority[priority] = activeIdeas.filter(idea => idea.priority === priority).length;
        });

        // Special metrics
        stats.implementedCount = stats.byStatus[IdeaStatus.IMPLEMENTED] || 0;
        stats.averageVotes = activeIdeas.length > 0 
          ? activeIdeas.reduce((sum, idea) => sum + (idea.votes || 0), 0) / activeIdeas.length 
          : 0;

        return stats;
      },

      /**
       * Get ideas by status for kanban view
       */
      getIdeasByStatus: () => {
        const ideas = get().getFilteredIdeas();
        const byStatus = {};

        Object.values(IdeaStatus).forEach(status => {
          byStatus[status] = ideas.filter(idea => idea.status === status);
        });

        return byStatus;
      },

      // Export Functions
      /**
       * Export ideas in various formats
       */
      exportIdeas: (format = 'json', filteredOnly = true) => {
        const ideas = filteredOnly ? get().getFilteredIdeas() : get().ideas;
        
        try {
          let exportData;
          let filename;
          let mimeType;

          switch (format.toLowerCase()) {
            case 'json':
              exportData = JSON.stringify(ideas, null, 2);
              filename = `atelier-ideas-${new Date().toISOString().split('T')[0]}.json`;
              mimeType = 'application/json';
              break;

            case 'csv':
              const headers = ['ID', 'Title', 'Description', 'Category', 'Status', 'Priority', 'Author', 'Created', 'Updated', 'Tags', 'Modules'];
              const csvRows = [
                headers.join(','),
                ...ideas.map(idea => [
                  idea.id,
                  `"${idea.title.replace(/"/g, '""')}"`,
                  `"${idea.description.replace(/"/g, '""')}"`,
                  idea.category,
                  idea.status,
                  idea.priority,
                  idea.author,
                  idea.createdAt,
                  idea.updatedAt,
                  `"${(idea.tags || []).join(', ')}"`,
                  `"${(idea.relatedModules || []).join(', ')}"`
                ].join(','))
              ];
              exportData = csvRows.join('\n');
              filename = `atelier-ideas-${new Date().toISOString().split('T')[0]}.csv`;
              mimeType = 'text/csv';
              break;

            case 'markdown':
              exportData = get().generateMarkdownReport(ideas);
              filename = `atelier-ideas-report-${new Date().toISOString().split('T')[0]}.md`;
              mimeType = 'text/markdown';
              break;

            default:
              throw new Error(`Unsupported export format: ${format}`);
          }

          // Create download
          const blob = new Blob([exportData], { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          // Emit export event
          if (window.__eventBus) {
            window.__eventBus.emit(IdeasEvents.IDEAS_EXPORTED, {
              format,
              count: ideas.length,
              filename,
              timestamp: Date.now()
            });
          }

          return { success: true, filename, count: ideas.length };
        } catch (error) {
          set({ error: error.message });
          console.error('[Ideas Store] Export failed:', error);
          return { success: false, error: error.message };
        }
      },

      /**
       * Generate markdown report
       */
      generateMarkdownReport: (ideas) => {
        const stats = get().calculateStats(ideas);
        const sections = [];

        // Header
        sections.push(`# Atelier Ideas Report`);
        sections.push(`Generated: ${new Date().toLocaleString()}`);
        sections.push(`Total Ideas: ${ideas.length}`);
        sections.push('');

        // Statistics
        sections.push('## 📊 Statistics');
        sections.push('');
        sections.push('### By Status');
        Object.entries(stats.byStatus).forEach(([status, count]) => {
          if (count > 0) sections.push(`- **${status}**: ${count}`);
        });
        sections.push('');

        sections.push('### By Category');
        Object.entries(stats.byCategory).forEach(([category, count]) => {
          if (count > 0) sections.push(`- **${category}**: ${count}`);
        });
        sections.push('');

        // Ideas by Status
        Object.values(IdeaStatus).forEach(status => {
          const statusIdeas = ideas.filter(idea => idea.status === status);
          if (statusIdeas.length > 0) {
            sections.push(`## ${status.toUpperCase()} (${statusIdeas.length})`);
            sections.push('');
            
            statusIdeas.forEach(idea => {
              sections.push(`### ${idea.title}`);
              sections.push(`- **Category**: ${idea.category}`);
              sections.push(`- **Priority**: ${idea.priority}`);
              sections.push(`- **Author**: ${idea.author}`);
              sections.push(`- **Created**: ${new Date(idea.createdAt).toLocaleDateString()}`);
              if (idea.relatedModules.length > 0) {
                sections.push(`- **Modules**: ${idea.relatedModules.join(', ')}`);
              }
              sections.push('');
              sections.push(idea.description);
              if (idea.notes) {
                sections.push('');
                sections.push(`**Notes**: ${idea.notes}`);
              }
              sections.push('');
              sections.push('---');
              sections.push('');
            });
          }
        });

        return sections.join('\n');
      },

      // UI State Management
      setViewMode: (mode) => set({ viewMode: mode }),
      setSorting: (sortBy, sortOrder = 'desc') => set({ sortBy, sortOrder }),
      setSelectedIdea: (idea) => set({ selectedIdea: idea }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      toggleShowArchived: () => set((state) => ({ showArchived: !state.showArchived })),

      // Bulk Selection
      setBulkSelection: (selection) => set({ bulkSelection: selection }),
      addToBulkSelection: (ideaId) => set((state) => ({
        bulkSelection: [...state.bulkSelection, ideaId]
      })),
      removeFromBulkSelection: (ideaId) => set((state) => ({
        bulkSelection: state.bulkSelection.filter(id => id !== ideaId)
      })),
      clearBulkSelection: () => set({ bulkSelection: [] }),

      // Utility Functions
      getIdeaById: (ideaId) => {
        return get().ideas.find(idea => idea.id === ideaId);
      },

      getIdeasByModule: (moduleName) => {
        return get().ideas.filter(idea => 
          idea.relatedModules.includes(moduleName) && !idea.archived
        );
      },

      // Initialize store
      initialize: () => {
        const stats = get().calculateStats();
        set({ stats });
      }
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ideas: state.ideas,
        filters: state.filters,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        viewMode: state.viewMode,
        showArchived: state.showArchived
      })
    }
  )
);

// Auto-initialize stats on store creation
setTimeout(() => {
  useIdeasStore.getState().initialize();
}, 0);

export default useIdeasStore;