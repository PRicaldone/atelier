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

    removeElement: (elementId) => {
      set((state) => ({
        elements: state.elements.filter(el => el.id !== elementId),
        selectedIds: state.selectedIds.filter(id => id !== elementId)
      }));
      
      // Save the updated elements to persistence
      setTimeout(() => {
        get().saveCurrentLevelToParent();
      }, 100);
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

    // IMPROVED Board navigation with unified persistence
    enterBoard: (boardId) => {
      const state = get();
      
      console.log('🚪 Entering board:', boardId);
      
      // Save current level to hierarchy BEFORE navigating
      get().saveCurrentLevelToHierarchy();
      
      // Find the target board in the updated hierarchy
      const board = get().findBoardInHierarchy(boardId);
      if (!board) {
        console.error('🚪 ❌ Board not found:', boardId);
        return;
      }

      // Save current viewport state for this level
      const currentLevel = state.currentBoardId || 'root';
      const updatedViewports = {
        ...state.boardViewports,
        [currentLevel]: { ...state.viewport }
      };

      console.log('🚪 ✅ Found board with', board.data?.elements?.length || 0, 'elements');

      // Navigate to the board
      set((state) => ({
        currentBoardId: boardId,
        boardHistory: [...state.boardHistory, boardId],
        elements: board.data?.elements || [],
        selectedIds: [],
        viewport: updatedViewports[boardId] || { x: 0, y: 0, zoom: 1 },
        boardViewports: updatedViewports
      }));
      
      // Save the navigation state immediately
      get().saveToStorage();
    },

    exitBoard: () => {
      const state = get();
      if (!state.currentBoardId) return;

      console.log('🚪 ⬅️ Exiting board:', state.currentBoardId);

      // Save current level to hierarchy before exiting
      get().saveCurrentLevelToHierarchy();

      // Save current board viewport
      const updatedViewports = {
        ...state.boardViewports,
        [state.currentBoardId]: { ...state.viewport }
      };

      // Determine parent level
      const newHistory = [...state.boardHistory];
      newHistory.pop(); // Remove current board
      const parentBoardId = newHistory[newHistory.length - 1] || null;

      if (parentBoardId) {
        // Going to parent board - load from fresh hierarchy
        const parentBoard = get().findBoardInHierarchy(parentBoardId);
        if (!parentBoard) {
          console.error('🚪 ❌ Parent board not found, falling back to root');
          get().exitToRoot(updatedViewports);
          return;
        }
        
        console.log('🚪 ⬆️ Going to parent board:', parentBoardId, 'with', parentBoard.data?.elements?.length || 0, 'elements');
        
        set({
          currentBoardId: parentBoardId,
          boardHistory: newHistory,
          elements: parentBoard.data?.elements || [],
          selectedIds: [],
          viewport: updatedViewports[parentBoardId] || { x: 0, y: 0, zoom: 1 },
          boardViewports: updatedViewports
        });
      } else {
        // Back to root
        get().exitToRoot(updatedViewports);
      }
      
      // Save the navigation state
      get().saveToStorage();
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
      const breadcrumbs = [{ id: 'root', title: 'Canvas' }];
      
      // Build breadcrumbs step by step, maintaining context of where we are
      let currentElements = JSON.parse(localStorage.getItem(STORAGE_KEYS.CANVAS_ELEMENTS) || '[]');
      
      for (let i = 0; i < state.boardHistory.length; i++) {
        const boardId = state.boardHistory[i];
        const board = currentElements.find(el => el.id === boardId && el.type === 'board');
        
        if (board) {
          breadcrumbs.push({
            id: boardId,
            title: board.data?.title || 'Untitled Board'
          });
          // Move into this board for next iteration
          currentElements = board.data?.elements || [];
        } else {
          console.warn('getBreadcrumbs - board not found:', boardId, 'in level', i);
          break;
        }
      }
      
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
            // We're at root level
            updates.elements = rootElements;
            console.log('📚 Loaded root elements:', updates.elements.length);
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