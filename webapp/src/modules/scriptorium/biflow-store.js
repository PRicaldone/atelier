/**
 * 🌱 BIFLOW STORE v2.0 - Mind Garden ↔ Scriptorium Operations
 * 
 * 🚨 POLICY: All code, data models, UX/UI flows and architecture
 * MUST comply with the single specification at /docs/BIFLOW-COMPLETE-TYPES.md (current version: v2.0.1).
 * In case of any doubt or discrepancy between code, comments, chat, or other docs,
 * the latest version of this document ALWAYS TAKES PRECEDENCE.
 * No structural changes may be made without reviewing and updating the spec.
 * 
 * This store manages the complete BiFlow v2.0 system:
 * - FMG (Freestyle Mind Garden) ↔ FS (Freestyle Scriptorium)
 * - PMG (Project Mind Garden) ↔ PS (Project Scriptorium)
 * - BMG (Board Mind Garden) ⇄ Board (1:1 sacred relationship)
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  MIND_GARDEN_TYPES,
  SCRIPTORIUM_TYPES,
  BIFLOW_TYPES,
  CREATIVE_MODES,
  BIFLOW_ORIGINS,
  GENERAL_MIND_GARDEN,
  createFreestyleMindGarden,
  createProjectMindGarden,
  createBoardMindGarden,
  createFreestyleScriptorium,
  createProjectScriptorium,
  createGeneralMindGarden,
  biflowUtils
} from './biflow-types.js';

// 🌱 BIFLOW v2.0: Dedicated store for complete BiFlow system
export const useBiFlowStore = create(
  subscribeWithSelector((set, get) => ({
    // 🌱 CORE STATE: All BiFlow entities
    mindGardens: [],      // FMG, PMG, BMG collections
    scriptoriums: [],     // FS, PS collections
    
    // 🌱 INITIALIZATION: System status
    isSystemInitialized: false,
    isGeneralGardenInitialized: false,
    
    // 🌱 NAVIGATION STATE: Current active entities
    activeMindGardenId: null,
    activeScriptoriumId: null,
    currentView: 'scriptorium', // 'scriptorium' | 'mind-garden' | 'split'
    
    // 🌱 CACHE: Performance optimization
    gardenCache: new Map(),
    scriptoriumCache: new Map(),
    lastAccessTimes: new Map(),
    
    // 🌱 SYNC STATE: Cross-entity sync status
    syncStatus: {
      isEnabled: true,
      lastSync: null,
      pendingChanges: [],
      errors: []
    },
    
    // =====================================
    // 🌱 SYSTEM INITIALIZATION
    // =====================================
    
    /**
     * Initialize complete BiFlow v2.0 system
     */
    initializeBiFlowSystem: () => {
      const state = get();
      
      if (state.isSystemInitialized) {
        console.log('✅ BiFlow system already initialized');
        return;
      }
      
      // Initialize General Mind Garden
      const generalGarden = get().initializeGeneralGarden();
      
      // Set system as initialized
      set({ 
        isSystemInitialized: true,
        activeMindGardenId: generalGarden.id,
        currentView: 'mind-garden'
      });
      
      console.log('🌱 BiFlow v2.0 system initialized successfully');
    },
    
    /**
     * Initialize General Mind Garden (special case)
     */
    initializeGeneralGarden: () => {
      const state = get();
      
      // Check if already exists
      const existingGeneral = state.mindGardens.find(g => g.id === GENERAL_MIND_GARDEN.ID);
      if (existingGeneral) {
        console.log('✅ General Mind Garden already exists:', existingGeneral.id);
        set({ isGeneralGardenInitialized: true });
        return existingGeneral;
      }
      
      // Create General Mind Garden
      const generalGarden = createGeneralMindGarden();
      
      set(state => ({
        mindGardens: [generalGarden, ...state.mindGardens],
        isGeneralGardenInitialized: true
      }));
      
      console.log('🌱 General Mind Garden initialized:', generalGarden.id);
      return generalGarden;
    },
    
    // =====================================
    // 🌱 MIND GARDEN MANAGEMENT (FMG/PMG/BMG)
    // =====================================
    
    /**
     * Create Freestyle Mind Garden (FMG)
     */
    createFreestyleMindGarden: (options = {}) => {
      const fmg = createFreestyleMindGarden(options);
      
      set(state => ({
        mindGardens: [...state.mindGardens, fmg]
      }));
      
      console.log('✅ FMG created:', fmg.id);
      return fmg;
    },
    
    /**
     * Create Project Mind Garden (PMG)
     */
    createProjectMindGarden: (projectId, options = {}) => {
      const pmg = createProjectMindGarden(projectId, options);
      
      set(state => ({
        mindGardens: [...state.mindGardens, pmg]
      }));
      
      console.log('✅ PMG created:', pmg.id, 'for project:', projectId);
      return pmg;
    },
    
    /**
     * Create Board Mind Garden (BMG) - SACRED 1:1 relationship
     */
    createBoardMindGarden: (boardId, options = {}) => {
      // Validate board existence (would need external board store)
      if (!boardId) {
        throw new Error('BIFLOW_VIOLATION: BMG requires valid boardId');
      }
      
      // Check if BMG already exists for this board
      const existingBMG = get().mindGardens.find(g => 
        g.type === MIND_GARDEN_TYPES.BMG && g.boardId === boardId
      );
      
      if (existingBMG) {
        console.warn('⚠️ BMG already exists for board:', boardId);
        return existingBMG;
      }
      
      const bmg = createBoardMindGarden(boardId, options);
      
      set(state => ({
        mindGardens: [...state.mindGardens, bmg]
      }));
      
      console.log('✅ BMG created:', bmg.id, 'for board:', boardId);
      return bmg;
    },
    
    /**
     * Update Mind Garden
     */
    updateMindGarden: (gardenId, updates) => {
      set(state => ({
        mindGardens: state.mindGardens.map(garden =>
          garden.id === gardenId
            ? { 
                ...garden, 
                ...updates, 
                updatedAt: Date.now()
              }
            : garden
        )
      }));
      
      // Update access time
      get().updateAccessTime('garden', gardenId);
      console.log('✅ Mind Garden updated:', gardenId);
    },
    
    /**
     * Remove Mind Garden (with validation)
     */
    removeMindGarden: (gardenId) => {
      const garden = get().mindGardens.find(g => g.id === gardenId);
      if (!garden) return;
      
      // Prevent deletion of General Mind Garden
      if (garden.id === GENERAL_MIND_GARDEN.ID || garden.metadata?.isGeneralGarden) {
        throw new Error('BIFLOW_VIOLATION: General Mind Garden cannot be deleted');
      }
      
      // Warn about BMG deletion (should cascade from board deletion)
      if (garden.type === MIND_GARDEN_TYPES.BMG) {
        console.warn('🚨 BMG deletion - ensure board is also being deleted:', garden.boardId);
      }
      
      set(state => ({
        mindGardens: state.mindGardens.filter(g => g.id !== gardenId),
        activeMindGardenId: state.activeMindGardenId === gardenId ? null : state.activeMindGardenId
      }));
      
      console.log('✅ Mind Garden removed:', gardenId);
    },
    
    // =====================================
    // 🌱 SCRIPTORIUM MANAGEMENT (FS/PS)
    // =====================================
    
    /**
     * Create Freestyle Scriptorium (FS)
     */
    createFreestyleScriptorium: (options = {}) => {
      const fs = createFreestyleScriptorium(options);
      
      set(state => ({
        scriptoriums: [...state.scriptoriums, fs]
      }));
      
      console.log('✅ FS created:', fs.id);
      return fs;
    },
    
    /**
     * Create Project Scriptorium (PS)
     */
    createProjectScriptorium: (projectId, options = {}) => {
      const ps = createProjectScriptorium(projectId, options);
      
      set(state => ({
        scriptoriums: [...state.scriptoriums, ps]
      }));
      
      console.log('✅ PS created:', ps.id, 'for project:', projectId);
      return ps;
    },
    
    /**
     * Update Scriptorium
     */
    updateScriptorium: (scriptoriumId, updates) => {
      set(state => ({
        scriptoriums: state.scriptoriums.map(scriptorium =>
          scriptorium.id === scriptoriumId
            ? { 
                ...scriptorium, 
                ...updates, 
                updatedAt: Date.now()
              }
            : scriptorium
        )
      }));
      
      // Update access time
      get().updateAccessTime('scriptorium', scriptoriumId);
      console.log('✅ Scriptorium updated:', scriptoriumId);
    },
    
    /**
     * Remove Scriptorium
     */
    removeScriptorium: (scriptoriumId) => {
      const scriptorium = get().scriptoriums.find(s => s.id === scriptoriumId);
      if (!scriptorium) return;
      
      // Warn about linked mind gardens
      if (scriptorium.linkedMindGardenIds?.length > 0) {
        console.warn('🚨 Scriptorium has linked mind gardens:', scriptorium.linkedMindGardenIds);
      }
      
      set(state => ({
        scriptoriums: state.scriptoriums.filter(s => s.id !== scriptoriumId),
        activeScriptoriumId: state.activeScriptoriumId === scriptoriumId ? null : state.activeScriptoriumId
      }));
      
      console.log('✅ Scriptorium removed:', scriptoriumId);
    },
    
    // =====================================
    // 🌱 BIFLOW OPERATIONS (Cross-entity flows)
    // =====================================
    
    /**
     * Promote elements from Mind Garden to Scriptorium
     */
    promoteFromMindGarden: async (gardenId, elements, targetScriptoriumId = null, options = {}) => {
      console.log('🌱 Promoting elements from Mind Garden:', { gardenId, count: elements.length, targetScriptoriumId });
      
      const garden = get().mindGardens.find(g => g.id === gardenId);
      if (!garden) {
        throw new Error(`Mind Garden not found: ${gardenId}`);
      }
      
      try {
        let targetScriptorium;
        
        // Determine target scriptorium based on garden type and flow rules
        if (targetScriptoriumId) {
          targetScriptorium = get().scriptoriums.find(s => s.id === targetScriptoriumId);
          if (!targetScriptorium) {
            throw new Error(`Target scriptorium not found: ${targetScriptoriumId}`);
          }
        } else {
          // Auto-determine target based on garden type
          targetScriptorium = get().autoSelectTargetScriptorium(garden, options);
        }
        
        // Validate flow compatibility
        const flowType = biflowUtils.flows.getFlowType(garden.type, targetScriptorium.type);
        if (!flowType) {
          throw new Error(`Invalid flow: ${garden.type} → ${targetScriptorium.type}`);
        }
        
        // Transform elements for scriptorium
        const promotedElements = elements.map(element => ({
          ...element,
          id: `promoted_${element.id}_${Date.now()}`,
          metadata: {
            ...element.metadata,
            promotedFromGarden: gardenId,
            promotedAt: Date.now(),
            flowType: flowType,
            originalId: element.id
          }
        }));
        
        // Add to scriptorium home
        const updatedScriptorium = {
          ...targetScriptorium,
          home: {
            ...targetScriptorium.home,
            elements: [...targetScriptorium.home.elements, ...promotedElements]
          },
          metadata: {
            ...targetScriptorium.metadata,
            promotionCount: (targetScriptorium.metadata.promotionCount || 0) + 1,
            lastPromotionAt: Date.now()
          }
        };
        
        // Update scriptorium
        get().updateScriptorium(targetScriptorium.id, updatedScriptorium);
        
        // Update garden statistics
        get().updateMindGarden(gardenId, {
          metadata: {
            ...garden.metadata,
            promotionCount: (garden.metadata.promotionCount || 0) + 1
          }
        });
        
        console.log('✅ Promotion completed:', {
          from: gardenId,
          to: targetScriptorium.id,
          elementsCount: promotedElements.length,
          flowType
        });
        
        return {
          success: true,
          targetScriptorium: updatedScriptorium,
          promotedElements,
          flowType
        };
        
      } catch (error) {
        console.error('🚨 Promotion failed:', error);
        throw error;
      }
    },
    
    /**
     * Auto-select target scriptorium based on garden type
     */
    autoSelectTargetScriptorium: (garden, options = {}) => {
      const scriptoriums = get().scriptoriums;
      
      // For FMG: prefer linked FS, create new FS if none
      if (garden.type === MIND_GARDEN_TYPES.FMG) {
        const linkedFS = scriptoriums.find(s => 
          s.type === SCRIPTORIUM_TYPES.FS && 
          s.linkedMindGardenIds?.includes(garden.id)
        );
        
        if (linkedFS) return linkedFS;
        
        // Create new FS if requested
        if (options.createIfMissing !== false) {
          return get().createFreestyleScriptorium({
            linkedMindGardenIds: [garden.id],
            title: `Workspace for ${garden.metadata.title}`
          });
        }
      }
      
      // For PMG: find associated PS by project ID
      if (garden.type === MIND_GARDEN_TYPES.PMG) {
        const linkedPS = scriptoriums.find(s => 
          s.type === SCRIPTORIUM_TYPES.PS && 
          s.projectId === garden.projectId
        );
        
        if (linkedPS) return linkedPS;
        
        // Create new PS if requested
        if (options.createIfMissing !== false) {
          return get().createProjectScriptorium(garden.projectId, {
            linkedMindGardenId: garden.id,
            title: `Project: ${garden.project?.name || 'Untitled'}`
          });
        }
      }
      
      throw new Error(`Cannot auto-select target scriptorium for ${garden.type}`);
    },
    
    /**
     * Navigate from Scriptorium to associated Mind Garden
     */
    navigateToMindGarden: (scriptoriumId) => {
      const scriptorium = get().scriptoriums.find(s => s.id === scriptoriumId);
      if (!scriptorium) {
        throw new Error(`Scriptorium not found: ${scriptoriumId}`);
      }
      
      let targetGardenId = null;
      
      // Find associated mind garden based on scriptorium type
      if (scriptorium.type === SCRIPTORIUM_TYPES.PS && scriptorium.linkedMindGardenId) {
        targetGardenId = scriptorium.linkedMindGardenId;
      } else if (scriptorium.type === SCRIPTORIUM_TYPES.FS && scriptorium.linkedMindGardenIds?.length > 0) {
        // For FS, take the first linked garden or most recent
        targetGardenId = scriptorium.linkedMindGardenIds[0];
      }
      
      if (!targetGardenId) {
        // Create associated garden if missing
        if (scriptorium.type === SCRIPTORIUM_TYPES.PS) {
          const pmg = get().createProjectMindGarden(scriptorium.projectId, {
            linkedScriptoriumId: scriptoriumId
          });
          targetGardenId = pmg.id;
          
          // Update scriptorium link
          get().updateScriptorium(scriptoriumId, {
            linkedMindGardenId: pmg.id
          });
        } else {
          const fmg = get().createFreestyleMindGarden({
            linkedScriptoriumIds: [scriptoriumId]
          });
          targetGardenId = fmg.id;
          
          // Update scriptorium link
          get().updateScriptorium(scriptoriumId, {
            linkedMindGardenIds: [fmg.id]
          });
        }
      }
      
      set({
        activeMindGardenId: targetGardenId,
        currentView: 'mind-garden'
      });
      
      console.log('✅ Navigated to Mind Garden:', targetGardenId);
      return targetGardenId;
    },
    
    /**
     * Navigate from Mind Garden to associated Scriptorium
     */
    navigateToScriptorium: (gardenId) => {
      const garden = get().mindGardens.find(g => g.id === gardenId);
      if (!garden) {
        throw new Error(`Mind Garden not found: ${gardenId}`);
      }
      
      let targetScriptoriumId = null;
      
      // Find associated scriptorium based on garden type
      if (garden.type === MIND_GARDEN_TYPES.PMG && garden.linkedScriptoriumId) {
        targetScriptoriumId = garden.linkedScriptoriumId;
      } else if (garden.type === MIND_GARDEN_TYPES.FMG && garden.linkedScriptoriumIds?.length > 0) {
        targetScriptoriumId = garden.linkedScriptoriumIds[0];
      }
      
      if (!targetScriptoriumId) {
        // Auto-create scriptorium if missing
        const scriptorium = get().autoSelectTargetScriptorium(garden, { createIfMissing: true });
        targetScriptoriumId = scriptorium.id;
      }
      
      set({
        activeScriptoriumId: targetScriptoriumId,
        currentView: 'scriptorium'
      });
      
      console.log('✅ Navigated to Scriptorium:', targetScriptoriumId);
      return targetScriptoriumId;
    },
    
    // =====================================
    // 🌱 FREESTYLE ↔ PROJECT PROMOTION
    // =====================================
    
    /**
     * Promote Mind Garden from freestyle to project
     */
    promoteMindGardenToProject: (gardenId, projectMetadata = {}) => {
      const garden = get().mindGardens.find(g => g.id === gardenId);
      if (!garden) {
        throw new Error(`Mind Garden not found: ${gardenId}`);
      }
      
      const promotedGarden = biflowUtils.freestyleProject.promoteToProject(garden, projectMetadata);
      
      get().updateMindGarden(gardenId, promotedGarden);
      
      console.log('✅ Mind Garden promoted to project:', gardenId);
      return promotedGarden;
    },
    
    /**
     * Promote Scriptorium from freestyle to project
     */
    promoteScriptoriumToProject: (scriptoriumId, projectMetadata = {}) => {
      const scriptorium = get().scriptoriums.find(s => s.id === scriptoriumId);
      if (!scriptorium) {
        throw new Error(`Scriptorium not found: ${scriptoriumId}`);
      }
      
      const promotedScriptorium = biflowUtils.freestyleProject.promoteToProject(scriptorium, projectMetadata);
      
      get().updateScriptorium(scriptoriumId, promotedScriptorium);
      
      console.log('✅ Scriptorium promoted to project:', scriptoriumId);
      return promotedScriptorium;
    },
    
    // =====================================
    // 🌱 VALIDATION & INTEGRITY
    // =====================================
    
    /**
     * Validate all BiFlow relationships
     */
    validateBiFlowIntegrity: () => {
      const { mindGardens, scriptoriums } = get();
      
      // Validate orphaned entities
      const orphans = biflowUtils.validation.findOrphanedEntities([], mindGardens, scriptoriums);
      
      // Validate flow compatibility
      const invalidFlows = [];
      
      scriptoriums.forEach(scriptorium => {
        if (scriptorium.linkedMindGardenIds) {
          scriptorium.linkedMindGardenIds.forEach(gardenId => {
            const garden = mindGardens.find(g => g.id === gardenId);
            if (garden) {
              const isCompatible = biflowUtils.flows.validateFlowCompatibility(garden.type, scriptorium.type);
              if (!isCompatible) {
                invalidFlows.push({
                  gardenId: garden.id,
                  gardenType: garden.type,
                  scriptoriumId: scriptorium.id,
                  scriptoriumType: scriptorium.type
                });
              }
            }
          });
        }
      });
      
      const report = {
        isHealthy: !orphans.hasOrphans && invalidFlows.length === 0,
        orphans,
        invalidFlows,
        totalMindGardens: mindGardens.length,
        totalScriptoriums: scriptoriums.length,
        validatedAt: Date.now()
      };
      
      if (!report.isHealthy) {
        console.warn('🚨 BiFlow integrity issues detected:', report);
      } else {
        console.log('✅ BiFlow system integrity confirmed:', report);
      }
      
      return report;
    },
    
    // =====================================
    // 🌱 UTILITIES & HELPERS
    // =====================================
    
    /**
     * Get Mind Garden by ID
     */
    getMindGarden: (gardenId) => {
      return get().mindGardens.find(g => g.id === gardenId);
    },
    
    /**
     * Get Scriptorium by ID
     */
    getScriptorium: (scriptoriumId) => {
      return get().scriptoriums.find(s => s.id === scriptoriumId);
    },
    
    /**
     * Get General Mind Garden
     */
    getGeneralGarden: () => {
      return get().mindGardens.find(g => g.id === GENERAL_MIND_GARDEN.ID);
    },
    
    /**
     * Update access time for performance tracking
     */
    updateAccessTime: (entityType, entityId) => {
      const state = get();
      state.lastAccessTimes.set(`${entityType}-${entityId}`, Date.now());
    },
    
    /**
     * Get BiFlow system statistics
     */
    getSystemStats: () => {
      const state = get();
      
      const mindGardensByType = {
        [MIND_GARDEN_TYPES.FMG]: state.mindGardens.filter(g => g.type === MIND_GARDEN_TYPES.FMG).length,
        [MIND_GARDEN_TYPES.PMG]: state.mindGardens.filter(g => g.type === MIND_GARDEN_TYPES.PMG).length,
        [MIND_GARDEN_TYPES.BMG]: state.mindGardens.filter(g => g.type === MIND_GARDEN_TYPES.BMG).length
      };
      
      const scriptoriumsByType = {
        [SCRIPTORIUM_TYPES.FS]: state.scriptoriums.filter(s => s.type === SCRIPTORIUM_TYPES.FS).length,
        [SCRIPTORIUM_TYPES.PS]: state.scriptoriums.filter(s => s.type === SCRIPTORIUM_TYPES.PS).length
      };
      
      return {
        isInitialized: state.isSystemInitialized,
        totalMindGardens: state.mindGardens.length,
        totalScriptoriums: state.scriptoriums.length,
        mindGardensByType,
        scriptoriumsByType,
        activeMindGarden: state.activeMindGardenId,
        activeScriptorium: state.activeScriptoriumId,
        currentView: state.currentView,
        lastSync: state.syncStatus.lastSync,
        cacheSize: {
          gardens: state.gardenCache.size,
          scriptoriums: state.scriptoriumCache.size,
          accessTimes: state.lastAccessTimes.size
        }
      };
    },
    
    /**
     * Reset BiFlow system (development only)
     */
    resetBiFlowSystem: () => {
      console.warn('🚨 Resetting BiFlow system - all data will be lost!');
      
      set({
        mindGardens: [],
        scriptoriums: [],
        isSystemInitialized: false,
        isGeneralGardenInitialized: false,
        activeMindGardenId: null,
        activeScriptoriumId: null,
        currentView: 'scriptorium'
      });
      
      // Clear caches
      const state = get();
      state.gardenCache.clear();
      state.scriptoriumCache.clear();
      state.lastAccessTimes.clear();
      
      console.log('✅ BiFlow system reset complete');
    }
  }))
);

// 🌱 BIFLOW v2.0: Integration hooks for external stores
export const biflowIntegration = {
  /**
   * Connect BiFlow store with Canvas store (for BMG ⇄ Board relationships)
   */
  connectToCanvasStore: (canvasStore) => {
    return canvasStore.subscribe(
      (state) => state.elements.filter(el => el.type === 'board'),
      (boards, previousBoards) => {
        const biflowStore = useBiFlowStore.getState();
        
        // Auto-create BMG for new boards
        boards.forEach(board => {
          const existingBMG = biflowStore.mindGardens.find(g => 
            g.type === MIND_GARDEN_TYPES.BMG && g.boardId === board.id
          );
          
          if (!existingBMG) {
            console.log('🌱 Auto-creating BMG for new board:', board.id);
            biflowStore.createBoardMindGarden(board.id, {
              boardTitle: board.title || board.data?.title,
              boardType: board.type
            });
          }
        });
        
        // Clean up BMG for deleted boards
        const boardIds = new Set(boards.map(b => b.id));
        const orphanedBMGs = biflowStore.mindGardens.filter(g => 
          g.type === MIND_GARDEN_TYPES.BMG && !boardIds.has(g.boardId)
        );
        
        orphanedBMGs.forEach(bmg => {
          console.log('🌱 Cleaning up BMG for deleted board:', bmg.boardId);
          biflowStore.removeMindGarden(bmg.id);
        });
      }
    );
  },
  
  /**
   * Handle board deletion with BMG cleanup
   */
  handleBoardDeletion: (boardId) => {
    const biflowStore = useBiFlowStore.getState();
    const bmg = biflowStore.mindGardens.find(g => 
      g.type === MIND_GARDEN_TYPES.BMG && g.boardId === boardId
    );
    
    if (bmg) {
      console.log('🌱 Cleaning up BMG for deleted board:', boardId);
      biflowStore.removeMindGarden(bmg.id);
    }
  }
};