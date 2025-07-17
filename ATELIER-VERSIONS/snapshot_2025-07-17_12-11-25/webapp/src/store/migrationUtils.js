/**
 * Migration utilities for transitioning from localStorage to project-scoped storage
 * 
 * Handles:
 * - Canvas localStorage → ProjectStore.workspace.canvas
 * - MindGarden localStorage → ProjectStore.workspace.mindGarden
 * - Data validation and error handling
 * - Backup creation before migration
 */

import { STORAGE_KEYS } from '../modules/visual-canvas/types.js';

export const MIGRATION_KEYS = {
  CANVAS_ELEMENTS: 'ATELIER_CANVAS_ELEMENTS',
  CANVAS_SETTINGS: 'ATELIER_CANVAS_SETTINGS', 
  CANVAS_STATE: 'ATELIER_CANVAS_STATE',
  MIND_GARDEN: 'ATELIER_MIND_GARDEN',
  MIGRATION_BACKUP: 'ATELIER_MIGRATION_BACKUP',
  MIGRATION_STATUS: 'ATELIER_MIGRATION_STATUS'
};

/**
 * Migration status tracking
 */
export const MIGRATION_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * Check if migration is needed
 */
export const needsMigration = () => {
  const status = localStorage.getItem(MIGRATION_KEYS.MIGRATION_STATUS);
  if (status === MIGRATION_STATUS.COMPLETED) {
    return false;
  }
  
  // Check if we have old localStorage data
  const hasCanvasData = localStorage.getItem(MIGRATION_KEYS.CANVAS_ELEMENTS);
  const hasMindGardenData = localStorage.getItem(MIGRATION_KEYS.MIND_GARDEN);
  
  return !!(hasCanvasData || hasMindGardenData);
};

/**
 * Create backup of current localStorage data
 */
export const createMigrationBackup = () => {
  const backup = {
    timestamp: new Date().toISOString(),
    data: {
      canvas: {
        elements: localStorage.getItem(MIGRATION_KEYS.CANVAS_ELEMENTS),
        settings: localStorage.getItem(MIGRATION_KEYS.CANVAS_SETTINGS),
        state: localStorage.getItem(MIGRATION_KEYS.CANVAS_STATE)
      },
      mindGarden: {
        data: localStorage.getItem(MIGRATION_KEYS.MIND_GARDEN)
      }
    }
  };
  
  try {
    localStorage.setItem(MIGRATION_KEYS.MIGRATION_BACKUP, JSON.stringify(backup));
    console.log('🔄 Migration backup created');
    return true;
  } catch (error) {
    console.error('🔄 Failed to create migration backup:', error);
    return false;
  }
};

/**
 * Migrate Canvas data to project workspace
 */
export const migrateCanvasData = (projectStore) => {
  try {
    console.log('🔄 Starting Canvas migration...');
    
    const elementsData = localStorage.getItem(MIGRATION_KEYS.CANVAS_ELEMENTS);
    const settingsData = localStorage.getItem(MIGRATION_KEYS.CANVAS_SETTINGS);
    const stateData = localStorage.getItem(MIGRATION_KEYS.CANVAS_STATE);
    
    const canvasData = {
      elements: elementsData ? JSON.parse(elementsData) : [],
      boards: [], // Will be extracted from elements
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedIds: [],
      currentBoardId: null,
      boardHistory: [],
      gridEnabled: true,
      snapToGrid: true
    };
    
    // Parse settings
    if (settingsData) {
      const settings = JSON.parse(settingsData);
      canvasData.gridEnabled = settings.gridEnabled ?? true;
      canvasData.snapToGrid = settings.snapToGrid ?? true;
    }
    
    // Parse state
    if (stateData) {
      const state = JSON.parse(stateData);
      canvasData.viewport = state.viewport || canvasData.viewport;
      canvasData.selectedIds = state.selectedIds || [];
      canvasData.currentBoardId = state.currentBoardId || null;
      canvasData.boardHistory = state.boardHistory || [];
      canvasData.boardViewports = state.boardViewports || {};
    }
    
    // Extract boards from elements (boards are stored as elements with nested elements)
    const boards = [];
    const regularElements = [];
    
    canvasData.elements.forEach(element => {
      if (element.type === 'board') {
        boards.push({
          id: element.id,
          title: element.data?.title || 'Untitled Board',
          elements: element.data?.elements || [],
          position: element.position,
          size: element.size,
          createdAt: element.createdAt,
          updatedAt: element.updatedAt
        });
      } else {
        regularElements.push(element);
      }
    });
    
    canvasData.elements = regularElements;
    canvasData.boards = boards;
    
    // Update project workspace
    projectStore.updateWorkspace('scriptorium', canvasData);
    
    console.log('🔄 Canvas migration completed:', {
      elements: canvasData.elements.length,
      boards: canvasData.boards.length,
      viewport: canvasData.viewport
    });
    
    return true;
  } catch (error) {
    console.error('🔄 Canvas migration failed:', error);
    return false;
  }
};

/**
 * Migrate MindGarden data to project workspace
 */
export const migrateMindGardenData = (projectStore) => {
  try {
    console.log('🔄 Starting MindGarden migration...');
    
    const mindGardenData = localStorage.getItem(MIGRATION_KEYS.MIND_GARDEN);
    
    if (!mindGardenData) {
      console.log('🔄 No MindGarden data to migrate');
      return true;
    }
    
    const parsed = JSON.parse(mindGardenData);
    
    const migrated = {
      conversations: [],
      nodes: parsed.nodes || [],
      edges: parsed.edges || [],
      viewport: parsed.viewport || { x: 0, y: 0, zoom: 1 },
      aiHistory: [],
      contextCache: new Map(),
      exportHistory: parsed.exportHistory || []
    };
    
    // Convert export history to proper format
    migrated.exportHistory = migrated.exportHistory.map(entry => ({
      id: entry.id || `export_${Date.now()}`,
      timestamp: entry.timestamp,
      nodeCount: entry.nodeCount,
      nodeIds: entry.nodeIds || [],
      canvasElementIds: entry.canvasElementIds || []
    }));
    
    // Update project workspace
    projectStore.updateWorkspace('mindGarden', migrated);
    
    console.log('🔄 MindGarden migration completed:', {
      nodes: migrated.nodes.length,
      edges: migrated.edges.length,
      exportHistory: migrated.exportHistory.length
    });
    
    return true;
  } catch (error) {
    console.error('🔄 MindGarden migration failed:', error);
    return false;
  }
};

/**
 * Migrate shared data and connections
 */
export const migrateSharedData = (projectStore) => {
  try {
    console.log('🔄 Starting shared data migration...');
    
    // For now, we'll create an empty shared workspace
    // In the future, we could analyze existing exports and create connections
    const sharedData = {
      exports: [],
      connections: [],
      aiContext: {},
      timeline: [],
      assets: []
    };
    
    // Update project workspace
    projectStore.updateWorkspace('shared', sharedData);
    
    console.log('🔄 Shared data migration completed');
    return true;
  } catch (error) {
    console.error('🔄 Shared data migration failed:', error);
    return false;
  }
};

/**
 * Complete migration process
 */
export const performMigration = async (projectStore) => {
  try {
    console.log('🔄 Starting migration process...');
    
    // Set migration status
    localStorage.setItem(MIGRATION_KEYS.MIGRATION_STATUS, MIGRATION_STATUS.IN_PROGRESS);
    
    // Create backup
    if (!createMigrationBackup()) {
      throw new Error('Failed to create migration backup');
    }
    
    // Migrate each module
    const canvasSuccess = migrateCanvasData(projectStore);
    const mindGardenSuccess = migrateMindGardenData(projectStore);
    const sharedSuccess = migrateSharedData(projectStore);
    
    if (!canvasSuccess || !mindGardenSuccess || !sharedSuccess) {
      throw new Error('One or more migrations failed');
    }
    
    // Mark migration as completed
    localStorage.setItem(MIGRATION_KEYS.MIGRATION_STATUS, MIGRATION_STATUS.COMPLETED);
    
    console.log('🔄 Migration completed successfully');
    return true;
    
  } catch (error) {
    console.error('🔄 Migration failed:', error);
    localStorage.setItem(MIGRATION_KEYS.MIGRATION_STATUS, MIGRATION_STATUS.FAILED);
    return false;
  }
};

/**
 * Restore from migration backup (rollback)
 */
export const restoreFromBackup = () => {
  try {
    const backupData = localStorage.getItem(MIGRATION_KEYS.MIGRATION_BACKUP);
    if (!backupData) {
      throw new Error('No backup found');
    }
    
    const backup = JSON.parse(backupData);
    
    // Restore Canvas data
    if (backup.data.canvas.elements) {
      localStorage.setItem(MIGRATION_KEYS.CANVAS_ELEMENTS, backup.data.canvas.elements);
    }
    if (backup.data.canvas.settings) {
      localStorage.setItem(MIGRATION_KEYS.CANVAS_SETTINGS, backup.data.canvas.settings);
    }
    if (backup.data.canvas.state) {
      localStorage.setItem(MIGRATION_KEYS.CANVAS_STATE, backup.data.canvas.state);
    }
    
    // Restore MindGarden data
    if (backup.data.mindGarden.data) {
      localStorage.setItem(MIGRATION_KEYS.MIND_GARDEN, backup.data.mindGarden.data);
    }
    
    // Reset migration status
    localStorage.removeItem(MIGRATION_KEYS.MIGRATION_STATUS);
    
    console.log('🔄 Restored from backup successfully');
    return true;
    
  } catch (error) {
    console.error('🔄 Failed to restore from backup:', error);
    return false;
  }
};

/**
 * Clean up old localStorage data after successful migration
 */
export const cleanupOldData = () => {
  try {
    // Only cleanup if migration was successful
    const status = localStorage.getItem(MIGRATION_KEYS.MIGRATION_STATUS);
    if (status !== MIGRATION_STATUS.COMPLETED) {
      console.log('🔄 Skipping cleanup - migration not completed');
      return false;
    }
    
    // Remove old localStorage keys
    localStorage.removeItem(MIGRATION_KEYS.CANVAS_ELEMENTS);
    localStorage.removeItem(MIGRATION_KEYS.CANVAS_SETTINGS);
    localStorage.removeItem(MIGRATION_KEYS.CANVAS_STATE);
    localStorage.removeItem(MIGRATION_KEYS.MIND_GARDEN);
    
    console.log('🔄 Old localStorage data cleaned up');
    return true;
    
  } catch (error) {
    console.error('🔄 Failed to cleanup old data:', error);
    return false;
  }
};

/**
 * Get migration status info
 */
export const getMigrationStatus = () => {
  const status = localStorage.getItem(MIGRATION_KEYS.MIGRATION_STATUS) || MIGRATION_STATUS.NOT_STARTED;
  const hasBackup = !!localStorage.getItem(MIGRATION_KEYS.MIGRATION_BACKUP);
  const hasOldData = needsMigration();
  
  return {
    status,
    hasBackup,
    hasOldData,
    needsMigration: needsMigration()
  };
};