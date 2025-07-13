import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  createCanvasState, 
  createCanvasElement, 
  canvasHelpers,
  STORAGE_KEYS 
} from './types.js';

// Canvas store with drag & drop and persistence
export const useCanvasStore = create(
  subscribeWithSelector((set, get) => ({
    ...createCanvasState(),
    
    // Board navigation state
    currentBoardId: null,
    boardHistory: [],
    boardViewports: {},
    
    // Auto-save control
    autoSaveEnabled: true,
    
    // Element management
    addElement: (type, position) => {
      const newElement = createCanvasElement(type, position);
      set((state) => ({
        elements: [...state.elements, newElement],
        selectedIds: [newElement.id]
      }));
      
      // Save the updated elements to persistence
      setTimeout(() => {
        get().saveCurrentLevelToParent();
      }, 100);
    },

    // Add a complete element (used for drag from tree)
    addCompleteElement: (element) => {
      set((state) => ({
        elements: [...state.elements, element],
        selectedIds: [element.id]
      }));
      
      // Save the updated elements to persistence
      setTimeout(() => {
        get().saveCurrentLevelToParent();
      }, 100);
    },

    removeElement: (elementId) => {
      set((state) => ({
        elements: state.elements.filter(el => el.id !== elementId),
        selectedIds: state.selectedIds.filter(id => id !== elementId)
      }));
      
      // Save immediately - no timeout to avoid race conditions
      get().saveCurrentLevelToHierarchy();
    },

    // Remove element without saving - used during board operations
    removeElementNoSave: (elementId) => {
      set((state) => ({
        elements: state.elements.filter(el => el.id !== elementId),
        selectedIds: state.selectedIds.filter(id => id !== elementId)
      }));
    },

    updateElement: (elementId, updates) => {
      set((state) => ({
        elements: state.elements.map(el => 
          el.id === elementId 
            ? { ...el, ...updates, updatedAt: Date.now() }
            : el
        )
      }));
      
      // Save the updated elements to persistence
      setTimeout(() => {
        get().saveCurrentLevelToParent();
      }, 100);
    },

    moveElement: (elementId, delta) => {
      const state = get();
      const element = state.elements.find(el => el.id === elementId);
      if (!element) return;

      let newPosition = {
        x: element.position.x + delta.x,
        y: element.position.y + delta.y
      };

      // Snap to grid if enabled
      if (state.settings.snapToGrid) {
        newPosition = canvasHelpers.snapToGrid(newPosition, state.settings.gridSize);
      }

      get().updateElement(elementId, { position: newPosition });
    },

    moveElements: (elementIds, delta) => {
      elementIds.forEach(id => get().moveElement(id, delta));
    },

    // Selection management
    selectElement: (elementId, addToSelection = false) => {
      set((state) => {
        const selectedIds = addToSelection 
          ? [...new Set([...state.selectedIds, elementId])]
          : [elementId];
        
        return {
          selectedIds,
          elements: state.elements.map(el => ({
            ...el,
            selected: selectedIds.includes(el.id)
          }))
        };
      });
    },

    selectMultiple: (elementIds) => {
      set((state) => ({
        selectedIds: [...new Set(elementIds)],
        elements: state.elements.map(el => ({
          ...el,
          selected: elementIds.includes(el.id)
        }))
      }));
    },

    clearSelection: () => {
      set((state) => ({
        selectedIds: [],
        elements: state.elements.map(el => ({ ...el, selected: false }))
      }));
    },

    selectAll: () => {
      set((state) => {
        const allIds = state.elements.map(el => el.id);
        return {
          selectedIds: allIds,
          elements: state.elements.map(el => ({ ...el, selected: true }))
        };
      });
    },

    // Clipboard operations
    copySelected: () => {
      const state = get();
      const selectedElements = state.elements.filter(el => 
        state.selectedIds.includes(el.id)
      );
      
      set({ clipboard: selectedElements });
    },

    pasteElements: (position = { x: 0, y: 0 }) => {
      const state = get();
      if (state.clipboard.length === 0) return;

      const bounds = canvasHelpers.getElementBounds(state.clipboard);
      const offset = bounds ? { x: position.x - bounds.x, y: position.y - bounds.y } : { x: 0, y: 0 };

      const pastedElements = state.clipboard.map(el => {
        const newElement = createCanvasElement(el.type, {
          x: el.position.x + offset.x + 20, // Small offset to see the paste
          y: el.position.y + offset.y + 20
        });
        return {
          ...newElement,
          data: { ...el.data },
          size: { ...el.size }
        };
      });

      set((state) => ({
        elements: [...state.elements, ...pastedElements],
        selectedIds: pastedElements.map(el => el.id)
      }));
    },

    deleteSelected: () => {
      set((state) => ({
        elements: state.elements.filter(el => !state.selectedIds.includes(el.id)),
        selectedIds: []
      }));
    },

    // Z-index management
    bringToFront: (elementId) => {
      const state = get();
      const element = state.elements.find(el => el.id === elementId);
      if (!element) return;

      const updatedElement = canvasHelpers.bringToFront(element, state.elements);
      get().updateElement(elementId, { zIndex: updatedElement.zIndex });
    },

    sendToBack: (elementId) => {
      get().updateElement(elementId, { zIndex: 1 });
    },

    // Viewport management
    updateViewport: (updates) => {
      set((state) => ({
        viewport: { ...state.viewport, ...updates }
      }));
    },

    zoomIn: () => {
      set((state) => ({
        viewport: {
          ...state.viewport,
          zoom: Math.min(state.viewport.zoom * 1.2, 3)
        }
      }));
    },

    zoomOut: () => {
      set((state) => ({
        viewport: {
          ...state.viewport,
          zoom: Math.max(state.viewport.zoom / 1.2, 0.25)
        }
      }));
    },

    resetZoom: () => {
      set((state) => ({
        viewport: { ...state.viewport, zoom: 1 }
      }));
    },

    panViewport: (delta) => {
      set((state) => ({
        viewport: {
          ...state.viewport,
          x: state.viewport.x + delta.x,
          y: state.viewport.y + delta.y
        }
      }));
    },

    centerViewport: () => {
      const state = get();
      if (state.elements.length === 0) {
        // If no elements, center on origin
        set((state) => ({
          viewport: {
            ...state.viewport,
            x: 0,
            y: 0,
            zoom: 1
          }
        }));
        return;
      }

      const bounds = canvasHelpers.getElementBounds(state.elements);
      if (!bounds) return;

      // Calculate actual viewport dimensions
      const navbarHeight = 64;
      const leftSidebarWidth = 240;
      const rightSidebarWidth = 320;
      const canvasWidth = window.innerWidth - leftSidebarWidth - rightSidebarWidth;
      const canvasHeight = window.innerHeight - navbarHeight;
      
      // Calculate center of elements in world coordinates
      const elementsCenterX = bounds.x + bounds.width / 2;
      const elementsCenterY = bounds.y + bounds.height / 2;
      
      // Calculate viewport center in screen coordinates
      const viewportCenterX = canvasWidth / 2;
      const viewportCenterY = canvasHeight / 2;
      
      // Calculate the pan needed to center elements
      // viewport.x/y represents the pan offset
      const panX = viewportCenterX - elementsCenterX * state.viewport.zoom;
      const panY = viewportCenterY - elementsCenterY * state.viewport.zoom;

      // Apply smooth animation by using a transition
      const currentViewport = state.viewport;
      const targetViewport = { x: panX, y: panY };
      
      // Simple smooth transition - could be enhanced with more sophisticated animation
      const animateViewport = (startTime) => {
        const duration = 500; // 500ms animation
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const currentX = currentViewport.x + (targetViewport.x - currentViewport.x) * easeOut;
        const currentY = currentViewport.y + (targetViewport.y - currentViewport.y) * easeOut;
        
        set((state) => ({
          viewport: {
            ...state.viewport,
            x: currentX,
            y: currentY
          }
        }));
        
        if (progress < 1) {
          requestAnimationFrame(() => animateViewport(startTime));
        }
      };
      
      requestAnimationFrame(() => animateViewport(Date.now()));
    },

    // Settings management
    toggleSetting: (setting) => {
      set((state) => ({
        settings: {
          ...state.settings,
          [setting]: !state.settings[setting]
        }
      }));
    },

    updateSettings: (updates) => {
      set((state) => ({
        settings: { ...state.settings, ...updates }
      }));
    },

    // Utility methods
    getSelectedElements: () => {
      const state = get();
      return state.elements.filter(el => state.selectedIds.includes(el.id));
    },

    getElementById: (id) => {
      return get().elements.find(el => el.id === id);
    },

    getElementsByType: (type) => {
      return get().elements.filter(el => el.type === type);
    },

    // Canvas operations
    clearCanvas: () => {
      set(() => createCanvasState());
    },

    // SMART NAVIGATION - Calcola path completo per tree navigation
    navigateToBoard: (boardId) => {
      const state = get();
      
      console.log('🧭 Smart navigation to board:', boardId);
      
      // Save current level before navigating
      get().saveCurrentLevelToHierarchy();
      
      if (boardId === 'root') {
        // Navigate to root
        get().exitToRoot(state.boardViewports);
        get().saveToStorage();
        return;
      }
      
      // Find the complete path from root to target board
      const findBoardPath = (elements, targetId, currentPath = []) => {
        for (const element of elements) {
          if (element.id === targetId && element.type === 'board') {
            return [...currentPath, targetId];
          }
          if (element.type === 'board' && element.data?.elements) {
            const foundPath = findBoardPath(element.data.elements, targetId, [...currentPath, element.id]);
            if (foundPath) return foundPath;
          }
        }
        return null;
      };
      
      const rootElements = JSON.parse(localStorage.getItem(STORAGE_KEYS.CANVAS_ELEMENTS) || '[]');
      const completePath = findBoardPath(rootElements, boardId);
      
      if (!completePath) {
        console.error('🧭 ❌ Board path not found:', boardId);
        return;
      }
      
      console.log('🧭 ✅ Complete path found:', completePath);
      
      // Find the target board
      const targetBoard = get().findBoardInHierarchy(boardId);
      if (!targetBoard) {
        console.error('🧭 ❌ Target board not found:', boardId);
        return;
      }
      
      // Save current viewport
      const currentLevel = state.currentBoardId || 'root';
      const updatedViewports = {
        ...state.boardViewports,
        [currentLevel]: { ...state.viewport }
      };
      
      // Navigate with complete path as boardHistory
      set((state) => ({
        currentBoardId: boardId,
        boardHistory: completePath, // This is the key fix!
        elements: targetBoard.data?.elements || [],
        selectedIds: [],
        viewport: updatedViewports[boardId] || { x: 0, y: 0, zoom: 1 },
        boardViewports: updatedViewports
      }));
      
      console.log('🧭 ✅ Navigation completed with boardHistory:', completePath);
      
      // CRITICAL FIX: Save to storage synchronously before breadcrumb verification
      get().saveToStorage();
      
      // Immediately verify breadcrumbs are correct (no timeout needed)
      const breadcrumbs = get().getBreadcrumbs();
      console.log('🧭 🥖 Post-navigation breadcrumbs verification:', breadcrumbs);
      
      // Double-check: ensure breadcrumbs length matches boardHistory + 1 (for root)
      if (breadcrumbs.length !== completePath.length + 1) {
        console.error('🧭 ❌ Breadcrumb sync failed! Expected:', completePath.length + 1, 'Got:', breadcrumbs.length);
        console.error('🧭 ❌ This indicates a race condition in persistence');
      } else {
        console.log('🧭 ✅ Breadcrumb sync verified successfully');
      }
    },

    // DEPRECATED - Use navigateToBoard instead
    enterBoard: (boardId) => {
      console.warn('⚠️ enterBoard is deprecated. Use navigateToBoard instead.');
      get().navigateToBoard(boardId);
    },

    // DEPRECATED - Use navigateToBoard with parent logic instead
    exitBoard: () => {
      const state = get();
      if (!state.currentBoardId) return;

      console.warn('⚠️ exitBoard is deprecated. Use navigateToBoard instead.');
      
      // Find parent board from current path
      if (state.boardHistory.length > 1) {
        // Navigate to parent (one level up)
        const parentId = state.boardHistory[state.boardHistory.length - 2];
        get().navigateToBoard(parentId);
      } else if (state.boardHistory.length === 1) {
        // Navigate to root
        get().navigateToBoard('root');
      }
    },

    // Helper method for clean exit to root
    exitToRoot: (viewports = {}) => {
      // Load fresh root elements from localStorage 
      const rootElements = JSON.parse(localStorage.getItem(STORAGE_KEYS.CANVAS_ELEMENTS) || '[]');
      console.log('🚪 🏠 Going to root with', rootElements.length, 'elements');
      
      set({
        currentBoardId: null,
        boardHistory: [],
        elements: rootElements,
        selectedIds: [],
        viewport: viewports.root || { x: 0, y: 0, zoom: 1 },
        boardViewports: viewports
      });
    },

    getBreadcrumbs: () => {
      const state = get();
      console.log('🥖 getBreadcrumbs - currentBoardId:', state.currentBoardId, 'boardHistory:', state.boardHistory);
      
      const breadcrumbs = [{ id: 'root', title: 'Canvas' }];
      
      // Build breadcrumbs step by step using fresh data from localStorage
      // First, ensure we have the latest data by using a helper function
      const getLatestHierarchy = () => {
        try {
          return JSON.parse(localStorage.getItem(STORAGE_KEYS.CANVAS_ELEMENTS) || '[]');
        } catch (error) {
          console.error('🥖 ❌ Error parsing localStorage:', error);
          return [];
        }
      };
      
      let currentElements = getLatestHierarchy();
      console.log('🥖 Starting from root with', currentElements.length, 'elements');
      
      for (let i = 0; i < state.boardHistory.length; i++) {
        const boardId = state.boardHistory[i];
        console.log(`🥖 Looking for board ${boardId} at level ${i} in ${currentElements.length} elements`);
        
        const board = currentElements.find(el => el.id === boardId && el.type === 'board');
        
        if (board) {
          breadcrumbs.push({
            id: boardId,
            title: board.data?.title || 'Untitled Board'
          });
          console.log(`🥖 ✅ Found board ${boardId}: "${board.data?.title || 'Untitled'}"`);
          // Move into this board for next iteration
          currentElements = board.data?.elements || [];
          console.log(`🥖 Moving into board ${boardId}, now has ${currentElements.length} elements`);
        } else {
          console.warn('🥖 ❌ getBreadcrumbs - board not found:', boardId, 'in level', i);
          console.warn('🥖 Available boards at this level:', 
            currentElements.filter(el => el.type === 'board').map(b => ({ id: b.id, title: b.data?.title })));
          
          // CRITICAL FIX: If board not found, try to rebuild from current state
          console.log('🥖 🔄 Attempting to rebuild breadcrumbs from in-memory state...');
          const inMemoryBoard = get().findBoardInHierarchy(boardId);
          if (inMemoryBoard) {
            console.log('🥖 ✅ Found board in memory, using fallback title');
            breadcrumbs.push({
              id: boardId,
              title: inMemoryBoard.data?.title || 'Untitled Board'
            });
            // Can't navigate deeper since we don't have the hierarchy, but at least show the breadcrumb
          } else {
            console.error('🥖 ❌ Board not found in memory either, breaking breadcrumb chain');
            break;
          }
        }
      }
      
      console.log('🥖 Final breadcrumbs:', breadcrumbs);
      return breadcrumbs;
    },

    // UNIFIED HIERARCHY PERSISTENCE - Replaces old saveCurrentLevelToParent
    saveCurrentLevelToHierarchy: () => {
      const state = get();
      console.log('💾 saveCurrentLevelToHierarchy - currentBoardId:', state.currentBoardId, 'elements:', state.elements.length);
      
      // Load current full hierarchy from localStorage
      let rootElements = [];
      try {
        rootElements = JSON.parse(localStorage.getItem(STORAGE_KEYS.CANVAS_ELEMENTS) || '[]');
      } catch (e) {
        console.error('Failed to parse localStorage elements:', e);
        rootElements = [];
      }
      
      if (!state.currentBoardId) {
        // We're at root - simply replace root elements
        console.log('💾 Saving to root level with', state.elements.length, 'elements');
        localStorage.setItem(STORAGE_KEYS.CANVAS_ELEMENTS, JSON.stringify(state.elements));
        return;
      }

      // We're inside a nested board - update the hierarchy
      console.log('💾 Updating nested board in hierarchy, rootElements:', rootElements.length);
      
      const updateHierarchy = (elements, targetBoardId, newElements) => {
        return elements.map(element => {
          if (element.id === targetBoardId && element.type === 'board') {
            console.log('💾 ✅ FOUND and updating board:', targetBoardId, 'with', newElements.length, 'elements');
            return {
              ...element,
              data: {
                ...element.data,
                elements: newElements,
                updatedAt: Date.now()
              }
            };
          }
          if (element.type === 'board' && element.data?.elements) {
            const updatedChildren = updateHierarchy(element.data.elements, targetBoardId, newElements);
            return {
              ...element,
              data: {
                ...element.data,
                elements: updatedChildren
              }
            };
          }
          return element;
        });
      };

      const updatedHierarchy = updateHierarchy(rootElements, state.currentBoardId, state.elements);
      
      // Save the complete updated hierarchy
      localStorage.setItem(STORAGE_KEYS.CANVAS_ELEMENTS, JSON.stringify(updatedHierarchy));
      console.log('💾 ✅ Hierarchy saved successfully');
      
      // Verification - make sure our board can be found
      setTimeout(() => {
        const testFind = get().findBoardInHierarchy(state.currentBoardId);
        console.log('💾 🔍 Verification - board', state.currentBoardId, 'findable:', !!testFind);
        if (testFind) {
          console.log('💾 ✅ Board verified with', testFind.data?.elements?.length || 0, 'elements');
        } else {
          console.error('💾 ❌ Board not found after save! This is a critical error.');
        }
      }, 10);
    },

    // LEGACY WRAPPER - Will be removed after migration
    saveCurrentLevelToParent: () => {
      console.log('⚠️ Using legacy saveCurrentLevelToParent - migrating to saveCurrentLevelToHierarchy');
      get().saveCurrentLevelToHierarchy();
    },

    // Find a board in the hierarchy
    findBoardInHierarchy: (boardId) => {
      const state = get();
      
      console.log('findBoardInHierarchy - searching for:', boardId);
      
      // Search in full hierarchy (always use fresh data from localStorage)
      const rootElements = JSON.parse(localStorage.getItem(STORAGE_KEYS.CANVAS_ELEMENTS) || '[]');
      console.log('findBoardInHierarchy - searching in rootElements:', rootElements.length);
      
      const findInElements = (elements, path = []) => {
        for (const element of elements) {
          console.log('findBoardInHierarchy - checking element:', element.id, 'type:', element.type, 'path:', path);
          if (element.id === boardId && element.type === 'board') {
            console.log('findBoardInHierarchy - FOUND board:', boardId, 'at path:', path);
            return element;
          }
          if (element.type === 'board' && element.data?.elements) {
            console.log('findBoardInHierarchy - searching in nested board:', element.id, 'children:', element.data.elements.length);
            const found = findInElements(element.data.elements, [...path, element.id]);
            if (found) return found;
          }
        }
        return null;
      };

      const result = findInElements(rootElements);
      console.log('findBoardInHierarchy - result for', boardId, ':', !!result);
      return result;
    },

    // Get hierarchical structure for tree view
    getHierarchicalStructure: () => {
      const state = get();
      
      // Get fresh root elements from localStorage
      const rootElements = JSON.parse(localStorage.getItem(STORAGE_KEYS.CANVAS_ELEMENTS) || '[]');
      
      console.log('getHierarchicalStructure - rootElements:', rootElements.length, 'currentBoardId:', state.currentBoardId, 'boardHistory:', state.boardHistory);
      
      // Build tree structure showing path to current level
      const buildTreePath = (elements, targetBoardId, currentPath = []) => {
        return elements.map(element => {
          const isInPath = currentPath.includes(element.id) || element.id === targetBoardId;
          const isCurrentLevel = element.id === targetBoardId;
          const children = element.type === 'board' && element.data?.elements ? 
            buildTreePath(element.data.elements, targetBoardId, [...currentPath, element.id]) : [];
          
          console.log('buildTreePath - element:', element.id, 'isInPath:', isInPath, 'isCurrentLevel:', isCurrentLevel, 'children:', children.length);
          
          return {
            ...element,
            isInPath,
            isCurrentLevel,
            children
          };
        });
      };
      
      const result = buildTreePath(rootElements, state.currentBoardId, state.boardHistory);
      console.log('getHierarchicalStructure - result:', result.length);
      return result;
    },

    // UNIFIED PERSISTENCE SYSTEM - Always maintains full hierarchy
    saveToStorage: () => {
      const state = get();
      try {
        // IMPORTANT: We now ALWAYS save the full hierarchy, not just current elements
        get().saveCurrentLevelToHierarchy();
        
        // Save other state
        localStorage.setItem(STORAGE_KEYS.CANVAS_SETTINGS, JSON.stringify(state.settings));
        localStorage.setItem(STORAGE_KEYS.CANVAS_STATE, JSON.stringify({
          viewport: state.viewport,
          selectedIds: state.selectedIds,
          currentBoardId: state.currentBoardId,
          boardHistory: state.boardHistory,
          boardViewports: state.boardViewports
        }));
      } catch (error) {
        console.error('Failed to save canvas to storage:', error);
      }
    },

    loadFromStorage: () => {
      try {
        const elementsData = localStorage.getItem(STORAGE_KEYS.CANVAS_ELEMENTS);
        const settingsData = localStorage.getItem(STORAGE_KEYS.CANVAS_SETTINGS);
        const stateData = localStorage.getItem(STORAGE_KEYS.CANVAS_STATE);

        const updates = {};

        if (settingsData) {
          updates.settings = { ...get().settings, ...JSON.parse(settingsData) };
        }

        if (stateData) {
          const parsedState = JSON.parse(stateData);
          updates.viewport = { ...get().viewport, ...parsedState.viewport };
          updates.selectedIds = parsedState.selectedIds || [];
          
          // Load navigation state
          if (parsedState.currentBoardId !== undefined) {
            updates.currentBoardId = parsedState.currentBoardId;
          }
          if (parsedState.boardHistory) {
            updates.boardHistory = parsedState.boardHistory;
          }
          if (parsedState.boardViewports) {
            updates.boardViewports = parsedState.boardViewports;
          }
        }

        // Load elements based on current board context
        if (elementsData) {
          const rootElements = JSON.parse(elementsData);
          
          if (updates.currentBoardId) {
            // We're in a nested board - find and load its elements
            const findBoard = (elements, boardId) => {
              for (const element of elements) {
                if (element.id === boardId && element.type === 'board') {
                  return element;
                }
                if (element.type === 'board' && element.data?.elements) {
                  const found = findBoard(element.data.elements, boardId);
                  if (found) return found;
                }
              }
              return null;
            };
            
            const currentBoard = findBoard(rootElements, updates.currentBoardId);
            if (currentBoard) {
              updates.elements = currentBoard.data?.elements || [];
              console.log('📚 Loaded nested board elements:', updates.elements.length);
            } else {
              console.warn('📚 Board not found, falling back to root');
              updates.elements = rootElements;
              updates.currentBoardId = null;
              updates.boardHistory = [];
            }
          } else {
            // We're at root level - filter out invalid elements
            updates.elements = rootElements.filter(el => el && el.size && el.size.width && el.size.height);
            console.log('📚 Loaded root elements:', updates.elements.length, '(filtered from', rootElements.length, ')');
          }
        }

        if (Object.keys(updates).length > 0) {
          set((state) => ({ ...state, ...updates }));
          console.log('📚 ✅ Storage loaded successfully');
        }
      } catch (error) {
        console.error('📚 ❌ Failed to load canvas from storage:', error);
        // Reset to safe state on error
        set((state) => ({
          ...state,
          ...createCanvasState(),
          currentBoardId: null,
          boardHistory: [],
          boardViewports: {}
        }));
      }
    },

    // Move element to specific board
    moveElementToBoard: (element, targetBoardId) => {
      console.log('🚀 moveElementToBoard called', { element, targetBoardId });
      
      const state = get();
      
      // Get fresh data from localStorage
      const rootElements = JSON.parse(localStorage.getItem(STORAGE_KEYS.CANVAS_ELEMENTS) || '[]');
      
      // Find target board in hierarchy
      const findBoard = (elements, boardId) => {
        for (const el of elements) {
          if (el.id === boardId && el.type === 'board') {
            return el;
          }
          if (el.type === 'board' && el.data?.elements) {
            const found = findBoard(el.data.elements, boardId);
            if (found) return found;
          }
        }
        return null;
      };
      
      const targetBoard = findBoard(rootElements, targetBoardId);
      if (!targetBoard) {
        console.error('Target board not found:', targetBoardId);
        return false;
      }
      
      // Add element to target board
      if (!targetBoard.data) {
        targetBoard.data = {};
      }
      if (!targetBoard.data.elements) {
        targetBoard.data.elements = [];
      }
      
      // Check if element already exists in target (avoid duplicates)
      const existingElement = targetBoard.data.elements.find(el => el.id === element.id);
      if (existingElement) {
        console.log('Element already exists in target board, skipping');
        return false;
      }
      
      // Reset element position for new board with smart positioning
      const newElement = {
        ...element,
        position: { 
          x: 50 + (targetBoard.data.elements?.length || 0) * 20, 
          y: 50 + (targetBoard.data.elements?.length || 0) * 20 
        }
      };
      
      targetBoard.data.elements.push(newElement);
      
      // Save updated hierarchy immediately
      localStorage.setItem(STORAGE_KEYS.CANVAS_ELEMENTS, JSON.stringify(rootElements));
      
      // Trigger tree refresh
      set((state) => ({
        selectedIds: [],
        lastUpdate: Date.now()
      }));
      
      // Dispatch event for tree refresh
      window.dispatchEvent(new CustomEvent('atelier-hierarchy-changed'));
      
      console.log('✅ Element moved to board:', targetBoardId);
      return true;
    },

    // Initialize canvas
    initialize: () => {
      get().loadFromStorage();
    }
  }))
);

// UNIFIED AUTO-SAVE - Uses new hierarchy system
useCanvasStore.subscribe(
  (state) => state.elements,
  () => {
    const state = useCanvasStore.getState();
    
    // Skip auto-save if disabled (during drag operations)
    if (!state.autoSaveEnabled) {
      console.log('⏸️ Auto-save skipped - disabled during operation');
      return;
    }
    
    // Debounce saves to avoid excessive localStorage writes
    clearTimeout(useCanvasStore.saveTimeout);
    useCanvasStore.saveTimeout = setTimeout(() => {
      // Use the unified hierarchy persistence system
      useCanvasStore.getState().saveCurrentLevelToHierarchy();
    }, 500); // Reduced timeout for better responsiveness
  }
);

// Save settings changes immediately
useCanvasStore.subscribe(
  (state) => state.settings,
  (settings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CANVAS_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }
);