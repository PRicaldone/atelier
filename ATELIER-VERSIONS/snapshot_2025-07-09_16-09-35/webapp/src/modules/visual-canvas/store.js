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

    // Board navigation
    enterBoard: (boardId) => {
      const state = get();
      
      // First save current elements back to their parent
      get().saveCurrentLevelToParent();
      
      const board = get().findBoardInHierarchy(boardId);
      if (!board) {
        console.log('Board not found:', boardId);
        return;
      }

      // Save current viewport state
      const currentBoard = state.currentBoardId || 'root';
      set((state) => ({
        boardViewports: {
          ...state.boardViewports,
          [currentBoard]: { ...state.viewport }
        }
      }));

      console.log('Entering board:', boardId, 'with elements:', board.data?.elements?.length || 0);

      // Enter the board
      set((state) => ({
        currentBoardId: boardId,
        boardHistory: [...state.boardHistory, boardId],
        elements: board.data?.elements || [],
        selectedIds: [],
        viewport: state.boardViewports[boardId] || { x: 0, y: 0, zoom: 1 }
      }));
    },

    exitBoard: () => {
      const state = get();
      if (!state.currentBoardId) return;

      console.log('Exiting board:', state.currentBoardId);

      // Save current level elements before exiting
      get().saveCurrentLevelToParent();

      // Save current board viewport
      set((state) => ({
        boardViewports: {
          ...state.boardViewports,
          [state.currentBoardId]: { ...state.viewport }
        }
      }));

      // Exit to parent board or root
      const newHistory = [...state.boardHistory];
      newHistory.pop();
      const parentBoardId = newHistory[newHistory.length - 1] || null;

      if (parentBoardId) {
        // Going to parent board
        const parentBoard = get().findBoardInHierarchy(parentBoardId);
        console.log('Going to parent board:', parentBoardId, 'with elements:', parentBoard?.data?.elements?.length || 0);
        
        set({
          currentBoardId: parentBoardId,
          boardHistory: newHistory,
          elements: parentBoard?.data?.elements || [],
          selectedIds: [],
          viewport: state.boardViewports[parentBoardId] || { x: 0, y: 0, zoom: 1 }
        });
      } else {
        // Back to root
        const rootElements = JSON.parse(localStorage.getItem(STORAGE_KEYS.CANVAS_ELEMENTS) || '[]');
        console.log('Going to root with elements:', rootElements.length);
        
        set({
          currentBoardId: null,
          boardHistory: [],
          elements: rootElements,
          selectedIds: [],
          viewport: state.boardViewports.root || { x: 0, y: 0, zoom: 1 }
        });
      }
    },

    getBreadcrumbs: () => {
      const state = get();
      const breadcrumbs = [{ id: 'root', title: 'Canvas' }];
      
      state.boardHistory.forEach(boardId => {
        const board = get().findBoardInHierarchy(boardId);
        if (board) {
          breadcrumbs.push({
            id: boardId,
            title: board.data?.title || 'Untitled Board'
          });
        }
      });
      
      return breadcrumbs;
    },

    // Save current level elements back to their parent
    saveCurrentLevelToParent: () => {
      const state = get();
      if (!state.currentBoardId) {
        // We're at root, save to localStorage
        localStorage.setItem(STORAGE_KEYS.CANVAS_ELEMENTS, JSON.stringify(state.elements));
        return;
      }

      // We're inside a board, need to save back to parent
      const rootElements = JSON.parse(localStorage.getItem(STORAGE_KEYS.CANVAS_ELEMENTS) || '[]');
      
      const updateBoardElements = (elements, targetBoardId, newElements) => {
        return elements.map(element => {
          if (element.id === targetBoardId && element.type === 'board') {
            return {
              ...element,
              data: {
                ...element.data,
                elements: newElements
              }
            };
          }
          if (element.type === 'board' && element.data?.elements) {
            return {
              ...element,
              data: {
                ...element.data,
                elements: updateBoardElements(element.data.elements, targetBoardId, newElements)
              }
            };
          }
          return element;
        });
      };

      const updatedRootElements = updateBoardElements(rootElements, state.currentBoardId, state.elements);
      localStorage.setItem(STORAGE_KEYS.CANVAS_ELEMENTS, JSON.stringify(updatedRootElements));
    },

    // Find a board in the hierarchy
    findBoardInHierarchy: (boardId) => {
      const state = get();
      
      // If we're at root, search in current elements
      if (!state.currentBoardId) {
        return state.elements.find(el => el.id === boardId && el.type === 'board');
      }

      // Search in full hierarchy
      const rootElements = JSON.parse(localStorage.getItem(STORAGE_KEYS.CANVAS_ELEMENTS) || '[]');
      
      const findInElements = (elements) => {
        for (const element of elements) {
          if (element.id === boardId && element.type === 'board') {
            return element;
          }
          if (element.type === 'board' && element.data?.elements) {
            const found = findInElements(element.data.elements);
            if (found) return found;
          }
        }
        return null;
      };

      return findInElements(rootElements);
    },

    // Get hierarchical structure for tree view
    getHierarchicalStructure: () => {
      const state = get();
      
      // Get fresh root elements from localStorage
      const rootElements = JSON.parse(localStorage.getItem(STORAGE_KEYS.CANVAS_ELEMENTS) || '[]');
      
      // Build tree structure showing path to current level
      const buildTreePath = (elements, targetBoardId, currentPath = []) => {
        return elements.map(element => ({
          ...element,
          isInPath: currentPath.includes(element.id) || element.id === targetBoardId,
          isCurrentLevel: element.id === targetBoardId,
          children: element.type === 'board' && element.data?.elements ? 
            buildTreePath(element.data.elements, targetBoardId, [...currentPath, element.id]) : []
        }));
      };
      
      return buildTreePath(rootElements, state.currentBoardId, state.boardHistory);
    },

    // Persistence
    saveToStorage: () => {
      const state = get();
      try {
        localStorage.setItem(STORAGE_KEYS.CANVAS_ELEMENTS, JSON.stringify(state.elements));
        localStorage.setItem(STORAGE_KEYS.CANVAS_SETTINGS, JSON.stringify(state.settings));
        localStorage.setItem(STORAGE_KEYS.CANVAS_STATE, JSON.stringify({
          viewport: state.viewport,
          selectedIds: state.selectedIds
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

        if (elementsData) {
          updates.elements = JSON.parse(elementsData);
        }

        if (settingsData) {
          updates.settings = { ...get().settings, ...JSON.parse(settingsData) };
        }

        if (stateData) {
          const parsedState = JSON.parse(stateData);
          updates.viewport = { ...get().viewport, ...parsedState.viewport };
          updates.selectedIds = parsedState.selectedIds || [];
        }

        if (Object.keys(updates).length > 0) {
          set((state) => ({ ...state, ...updates }));
        }
      } catch (error) {
        console.error('Failed to load canvas from storage:', error);
      }
    },

    // Initialize canvas
    initialize: () => {
      get().loadFromStorage();
    }
  }))
);

// Auto-save to localStorage on changes
useCanvasStore.subscribe(
  (state) => state.elements,
  () => {
    // Debounce saves to avoid excessive localStorage writes
    clearTimeout(useCanvasStore.saveTimeout);
    useCanvasStore.saveTimeout = setTimeout(() => {
      useCanvasStore.getState().saveToStorage();
    }, 1000);
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