/**
 * 🌱 BIFLOW STORE EXTENSION - Board ↔ Mind Garden Operations
 * 
 * This module extends the Canvas store with BiFlow operations,
 * maintaining the sacred 1:1 Board ↔ Mind Garden relationship.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  createBiFlowBoard, 
  createMindGarden,
  createGeneralMindGarden,
  biflowUtils,
  BIFLOW_ORIGINS,
  GENERAL_MIND_GARDEN 
} from './biflow-types.js';
import { ELEMENT_TYPES } from './types.js';

// 🌱 BIFLOW: Dedicated store for Mind Gardens
export const useBiFlowStore = create(
  subscribeWithSelector((set, get) => ({
    // 🌱 CORE STATE: Mind Gardens collection (includes General Mind Garden)
    gardens: [],
    
    // 🌱 INITIALIZATION: General Mind Garden status
    isGeneralGardenInitialized: false,
    
    // 🌱 NAVIGATION STATE: Current garden and view
    activeGardenId: null,
    currentView: 'board', // 'board' | 'garden' | 'split'
    
    // 🌱 CACHE: Performance optimization
    gardenCache: new Map(),
    lastAccessTimes: new Map(),
    
    // 🌱 SYNC STATE: Board ↔ Garden sync status
    syncStatus: {
      isEnabled: true,
      lastSync: null,
      pendingChanges: [],
      errors: []
    },
    
    // =====================================
    // 🌱 GENERAL MIND GARDEN MANAGEMENT
    // =====================================
    
    /**
     * Initialize General Mind Garden (call on app startup)
     */
    initializeGeneralGarden: () => {
      const state = get();
      
      // Check if already exists
      const existingGeneral = state.gardens.find(g => g.id === GENERAL_MIND_GARDEN.ID);
      if (existingGeneral) {
        console.log('✅ General Mind Garden already exists:', existingGeneral.id);
        set({ isGeneralGardenInitialized: true });
        return existingGeneral;
      }
      
      // Create General Mind Garden
      const generalGarden = createGeneralMindGarden();
      
      set(state => ({
        gardens: [generalGarden, ...state.gardens],
        isGeneralGardenInitialized: true,
        activeGardenId: generalGarden.id, // Start in General Garden
        currentView: 'garden'
      }));
      
      console.log('🌱 General Mind Garden initialized:', generalGarden.id);
      return generalGarden;
    },
    
    /**
     * Get General Mind Garden
     */
    getGeneralGarden: () => {
      const state = get();
      return state.gardens.find(g => g.id === GENERAL_MIND_GARDEN.ID);
    },
    
    /**
     * Ensure General Mind Garden exists (auto-create if missing)
     */
    ensureGeneralGarden: () => {
      const existing = get().getGeneralGarden();
      if (existing) return existing;
      
      console.log('🌱 Auto-creating missing General Mind Garden');
      return get().initializeGeneralGarden();
    },
    
    // =====================================
    // 🌱 CORE BIFLOW OPERATIONS
    // =====================================
    
    /**
     * Create new board with dedicated Mind Garden (1:1 relationship)
     */
    createBoardWithGarden: (position, options = {}) => {
      console.log('🌱 Creating board with dedicated garden:', options);
      
      // Create board
      const board = createBiFlowBoard(ELEMENT_TYPES.BOARD, position, {
        origin: options.origin || BIFLOW_ORIGINS.MANUAL,
        parentBoardId: options.parentBoardId,
        customTitle: options.title,
        description: options.description
      });
      
      // Create dedicated garden
      const garden = createMindGarden(board.id, {
        origin: BIFLOW_ORIGINS.DEDICATED,
        elements: options.gardenElements || [],
        parentGardenId: options.parentGardenId
      });
      
      // Link board ↔ garden (SACRED 1:1 RELATIONSHIP)
      board.mindGardenId = garden.id;
      
      // Validate link
      const validation = biflowUtils.validation.validateBoardGardenLink(board, garden);
      if (!validation.isValid) {
        console.error('🚨 BIFLOW_VIOLATION:', validation.errors);
        throw new Error(`BiFlow violation: ${validation.errors.join(', ')}`);
      }
      
      // Update state
      set(state => ({
        gardens: [...state.gardens, garden]
      }));
      
      console.log('✅ Board-Garden link created:', { boardId: board.id, gardenId: garden.id });
      
      return { board, garden };
    },
    
    /**
     * Promote elements from Mind Garden to new Board
     * 🚨 SPECIAL: Can promote from General Mind Garden (sourceGardenId = 'general')
     */
    promoteToBoard: async (gardenElements, sourceGardenId, options = {}) => {
      console.log('🌱 Promoting elements to board:', { count: gardenElements.length, sourceGardenId });
      
      try {
        // 🚨 SPECIAL CASE: Handle promotion from General Mind Garden
        const actualSourceId = sourceGardenId === GENERAL_MIND_GARDEN.ID ? 'mg-generale' : sourceGardenId;
        
        // Use promotion utility
        const { board, dedicatedGarden, promotionSummary } = biflowUtils.promotion.promoteElementsToBoard(
          gardenElements, 
          actualSourceId, 
          options
        );
        
        // Validate promotion result
        const validation = biflowUtils.validation.validateBoardGardenLink(board, dedicatedGarden);
        if (!validation.isValid) {
          throw new Error(`Promotion validation failed: ${validation.errors.join(', ')}`);
        }
        
        // Update gardens state
        set(state => ({
          gardens: [...state.gardens, dedicatedGarden],
          activeGardenId: dedicatedGarden.id,
          currentView: 'board' // Navigate to new board
        }));
        
        console.log('✅ Promotion completed:', promotionSummary);
        
        // Return for external store integration
        return { board, dedicatedGarden, promotionSummary };
        
      } catch (error) {
        console.error('🚨 Promotion failed:', error);
        throw error;
      }
    },
    
    /**
     * Navigate from Board to its dedicated Mind Garden
     */
    navigateToGarden: (boardId) => {
      console.log('🌱 Navigating to garden for board:', boardId);
      
      // Find board's garden
      const garden = get().gardens.find(g => g.boardId === boardId);
      if (!garden) {
        console.error('🚨 BIFLOW_VIOLATION: Board has no associated garden:', boardId);
        throw new Error(`Board ${boardId} has no associated Mind Garden`);
      }
      
      set({
        activeGardenId: garden.id,
        currentView: 'garden'
      });
      
      // Update access time for performance tracking
      get().updateAccessTime(garden.id);
      
      console.log('✅ Navigated to garden:', garden.id);
      return garden;
    },
    
    /**
     * Navigate from Mind Garden back to its Board
     */
    navigateToBoard: (gardenId) => {
      console.log('🌱 Navigating to board from garden:', gardenId);
      
      const garden = get().gardens.find(g => g.id === gardenId);
      if (!garden) {
        throw new Error(`Garden ${gardenId} not found`);
      }
      
      set({
        activeGardenId: null,
        currentView: 'board'
      });
      
      console.log('✅ Navigated to board:', garden.boardId);
      return garden.boardId;
    },
    
    /**
     * Create sub-board from dedicated garden elements
     */
    createSubBoard: (gardenElements, parentBoardId, parentGardenId, options = {}) => {
      console.log('🌱 Creating sub-board:', { parentBoardId, parentGardenId });
      
      // Determine generation
      const state = get();
      const parentGarden = state.gardens.find(g => g.id === parentGardenId);
      const generation = (parentGarden?.metadata?.generation || 0) + 1;
      
      // Create sub-board with garden
      return get().createBoardWithGarden(options.position || { x: 200, y: 200 }, {
        origin: BIFLOW_ORIGINS.SUB_BOARD,
        parentBoardId,
        parentGardenId,
        title: options.title,
        description: options.description,
        gardenElements,
        generation
      });
    },
    
    // =====================================
    // 🌱 MIND GARDEN MANAGEMENT
    // =====================================
    
    /**
     * Add new Mind Garden (with board validation)
     */
    addGarden: (garden) => {
      // Validate board relationship
      if (!garden.boardId) {
        throw new Error('BIFLOW_VIOLATION: Garden must have boardId');
      }
      
      set(state => ({
        gardens: [...state.gardens, garden]
      }));
      
      console.log('✅ Garden added:', garden.id);
    },
    
    /**
     * Update Mind Garden content
     */
    updateGarden: (gardenId, updates) => {
      set(state => ({
        gardens: state.gardens.map(garden =>
          garden.id === gardenId
            ? { 
                ...garden, 
                ...updates, 
                updatedAt: Date.now(),
                metadata: {
                  ...garden.metadata,
                  ...updates.metadata
                }
              }
            : garden
        )
      }));
      
      // Update access time
      get().updateAccessTime(gardenId);
      
      console.log('✅ Garden updated:', gardenId);
    },
    
    /**
     * Remove Mind Garden (with board cascade check)
     */
    removeGarden: (gardenId) => {
      const garden = get().gardens.find(g => g.id === gardenId);
      if (!garden) return;
      
      console.warn('🚨 Removing garden - ensure board is also removed:', {
        gardenId,
        boardId: garden.boardId
      });
      
      set(state => ({
        gardens: state.gardens.filter(g => g.id !== gardenId),
        activeGardenId: state.activeGardenId === gardenId ? null : state.activeGardenId
      }));
    },
    
    /**
     * Get garden by board ID
     */
    getGardenByBoardId: (boardId) => {
      return get().gardens.find(g => g.boardId === boardId);
    },
    
    /**
     * Get all gardens for boards
     */
    getGardensForBoards: (boardIds) => {
      const gardens = get().gardens;
      return boardIds.map(boardId => gardens.find(g => g.boardId === boardId)).filter(Boolean);
    },
    
    // =====================================
    // 🌱 MIGRATION OPERATIONS
    // =====================================
    
    /**
     * Migrate legacy boards to BiFlow system
     */
    migrateLegacyBoards: (legacyBoards) => {
      console.log('🌱 Migrating legacy boards to BiFlow:', legacyBoards.length);
      
      const { newGardens, updatedBoards, migrationSummary } = biflowUtils.migration.batchMigrateLegacyBoards(
        legacyBoards,
        get().gardens
      );
      
      // Add new gardens to state
      set(state => ({
        gardens: [...state.gardens, ...newGardens]
      }));
      
      console.log('✅ Migration completed:', migrationSummary);
      
      return { updatedBoards, migrationSummary };
    },
    
    /**
     * Create garden for existing board
     */
    createGardenForBoard: (board) => {
      const garden = biflowUtils.migration.createGardenForLegacyBoard(board);
      
      set(state => ({
        gardens: [...state.gardens, garden]
      }));
      
      console.log('✅ Garden created for board:', { boardId: board.id, gardenId: garden.id });
      
      return garden;
    },
    
    // =====================================
    // 🌱 VALIDATION & INTEGRITY
    // =====================================
    
    /**
     * Validate all Board ↔ Garden relationships
     */
    validateAllRelationships: (boards) => {
      const gardens = get().gardens;\n      \n      // Find orphaned entities\n      const orphans = biflowUtils.validation.findOrphanedEntities(boards, gardens);\n      \n      // Validate hierarchy\n      const hierarchy = biflowUtils.validation.validateHierarchy(boards, gardens);\n      \n      // Validate individual links\n      const linkValidations = boards.map(board => {\n        const garden = gardens.find(g => g.id === board.mindGardenId);\n        if (!garden) {\n          return {\n            boardId: board.id,\n            isValid: false,\n            errors: ['Board has no associated garden']\n          };\n        }\n        \n        return {\n          boardId: board.id,\n          gardenId: garden.id,\n          ...biflowUtils.validation.validateBoardGardenLink(board, garden)\n        };\n      });\n      \n      const invalidLinks = linkValidations.filter(v => !v.isValid);\n      \n      const report = {\n        isHealthy: orphans.hasOrphans === false && hierarchy.isValid && invalidLinks.length === 0,\n        orphans,\n        hierarchy,\n        invalidLinks,\n        totalBoards: boards.length,\n        totalGardens: gardens.length,\n        validatedAt: Date.now()\n      };\n      \n      if (!report.isHealthy) {\n        console.warn('🚨 BiFlow integrity issues detected:', report);\n      } else {\n        console.log('✅ BiFlow system integrity confirmed:', report);\n      }\n      \n      return report;\n    },\n    \n    /**\n     * Auto-repair BiFlow relationships\n     */\n    autoRepairRelationships: (boards) => {\n      const report = get().validateAllRelationships(boards);\n      \n      if (report.isHealthy) {\n        return { repaired: false, report };\n      }\n      \n      console.log('🔧 Auto-repairing BiFlow relationships...');\n      \n      // Create gardens for orphaned boards\n      const newGardens = [];\n      const updatedBoards = [];\n      \n      report.orphans.orphanedBoards.forEach(board => {\n        const garden = biflowUtils.migration.createGardenForLegacyBoard(board);\n        const updatedBoard = biflowUtils.migration.updateLegacyBoardWithGarden(board, garden);\n        \n        newGardens.push(garden);\n        updatedBoards.push(updatedBoard);\n      });\n      \n      // Remove orphaned gardens (controversial - may need user confirmation)\n      const gardensToKeep = get().gardens.filter(garden => \n        !report.orphans.orphanedGardens.find(orphan => orphan.id === garden.id)\n      );\n      \n      // Update state\n      set({\n        gardens: [...gardensToKeep, ...newGardens]\n      });\n      \n      console.log('✅ Auto-repair completed:', {\n        newGardens: newGardens.length,\n        removedGardens: report.orphans.orphanedGardens.length,\n        updatedBoards: updatedBoards.length\n      });\n      \n      return {\n        repaired: true,\n        newGardens,\n        updatedBoards,\n        removedGardens: report.orphans.orphanedGardens,\n        report\n      };\n    },\n    \n    // =====================================\n    // 🌱 PERFORMANCE & CACHING\n    // =====================================\n    \n    /**\n     * Update garden access time for performance tracking\n     */\n    updateAccessTime: (gardenId) => {\n      const state = get();\n      state.lastAccessTimes.set(gardenId, Date.now());\n      \n      // Update garden metadata\n      get().updateGarden(gardenId, {\n        lastAccessedAt: Date.now(),\n        metadata: {\n          sessionCount: (state.gardens.find(g => g.id === gardenId)?.metadata?.sessionCount || 0) + 1\n        }\n      });\n    },\n    \n    /**\n     * Cache garden data for performance\n     */\n    cacheGarden: (gardenId, data) => {\n      const state = get();\n      state.gardenCache.set(gardenId, {\n        data,\n        cachedAt: Date.now()\n      });\n    },\n    \n    /**\n     * Get cached garden data\n     */\n    getCachedGarden: (gardenId, maxAge = 300000) => { // 5 minutes default\n      const state = get();\n      const cached = state.gardenCache.get(gardenId);\n      \n      if (!cached) return null;\n      \n      const age = Date.now() - cached.cachedAt;\n      if (age > maxAge) {\n        state.gardenCache.delete(gardenId);\n        return null;\n      }\n      \n      return cached.data;\n    },\n    \n    /**\n     * Clear old cache entries\n     */\n    cleanupCache: () => {\n      const state = get();\n      const now = Date.now();\n      const maxAge = 600000; // 10 minutes\n      \n      for (const [gardenId, cached] of state.gardenCache.entries()) {\n        if (now - cached.cachedAt > maxAge) {\n          state.gardenCache.delete(gardenId);\n        }\n      }\n    },\n    \n    // =====================================\n    // 🌱 NAVIGATION UTILITIES\n    // =====================================\n    \n    /**\n     * Get navigation breadcrumb for current board/garden\n     */\n    getNavigationPath: (boardId, allBoards) => {\n      return biflowUtils.navigation.getBoardNavigationPath(\n        allBoards.find(b => b.id === boardId),\n        allBoards\n      );\n    },\n    \n    /**\n     * Toggle between board and garden view\n     */\n    toggleView: (boardId) => {\n      const state = get();\n      \n      if (state.currentView === 'board') {\n        return get().navigateToGarden(boardId);\n      } else {\n        return get().navigateToBoard(state.activeGardenId);\n      }\n    },\n    \n    // =====================================\n    // 🌱 DEBUG & MONITORING\n    // =====================================\n    \n    /**\n     * Get BiFlow system statistics\n     */\n    getSystemStats: () => {\n      const state = get();\n      \n      return {\n        totalGardens: state.gardens.length,\n        activeGarden: state.activeGardenId,\n        currentView: state.currentView,\n        cacheSize: state.gardenCache.size,\n        lastCleanup: state.lastCleanup,\n        memoryUsage: {\n          gardens: state.gardens.length,\n          cache: state.gardenCache.size,\n          accessTimes: state.lastAccessTimes.size\n        }\n      };\n    },\n    \n    /**\n     * Reset BiFlow system (development only)\n     */\n    resetSystem: () => {\n      console.warn('🚨 Resetting BiFlow system - all gardens will be lost!');\n      \n      set({\n        gardens: [],\n        activeGardenId: null,\n        currentView: 'board'\n      });\n      \n      // Clear caches\n      const state = get();\n      state.gardenCache.clear();\n      state.lastAccessTimes.clear();\n    }\n  }))\n);\n\n// 🌱 BIFLOW: Integration hooks for external stores\nexport const biflowIntegration = {\n  /**\n   * Connect BiFlow store with Canvas store\n   */\n  connectToCanvasStore: (canvasStore) => {\n    // Subscribe to canvas board changes\n    return canvasStore.subscribe(\n      (state) => state.elements.filter(el => el.type === 'board'),\n      (boards, previousBoards) => {\n        const biflowStore = useBiFlowStore.getState();\n        \n        // Auto-repair relationships when boards change\n        if (boards.length !== previousBoards.length) {\n          setTimeout(() => {\n            biflowStore.autoRepairRelationships(boards);\n          }, 100);\n        }\n      }\n    );\n  },\n  \n  /**\n   * Sync board deletion with garden cleanup\n   */\n  handleBoardDeletion: (boardId) => {\n    const biflowStore = useBiFlowStore.getState();\n    const garden = biflowStore.getGardenByBoardId(boardId);\n    \n    if (garden) {\n      console.log('🌱 Cleaning up garden for deleted board:', { boardId, gardenId: garden.id });\n      biflowStore.removeGarden(garden.id);\n    }\n  },\n  \n  /**\n   * Handle board duplication with garden\n   */\n  handleBoardDuplication: (originalBoardId, newBoard, includeGarden = true) => {\n    if (!includeGarden) return newBoard;\n    \n    const biflowStore = useBiFlowStore.getState();\n    const originalGarden = biflowStore.getGardenByBoardId(originalBoardId);\n    \n    if (originalGarden) {\n      // Create new garden based on original\n      const newGarden = createMindGarden(newBoard.id, {\n        origin: BIFLOW_ORIGINS.DUPLICATED,\n        elements: [...originalGarden.elements], // Clone elements\n        layout: { ...originalGarden.layout },\n        metadata: {\n          ...originalGarden.metadata,\n          duplicatedFrom: originalGarden.id,\n          duplicatedAt: Date.now()\n        }\n      });\n      \n      biflowStore.addGarden(newGarden);\n      \n      // Update board with garden link\n      newBoard.mindGardenId = newGarden.id;\n      \n      console.log('✅ Garden duplicated for new board:', {\n        originalGardenId: originalGarden.id,\n        newGardenId: newGarden.id,\n        newBoardId: newBoard.id\n      });\n    }\n    \n    return newBoard;\n  }\n};