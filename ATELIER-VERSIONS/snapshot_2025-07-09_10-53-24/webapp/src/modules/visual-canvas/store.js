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
    },

    removeElement: (elementId) => {
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
      if (state.elements.length === 0) return;

      const bounds = canvasHelpers.getElementBounds(state.elements);
      if (!bounds) return;

      set((state) => ({
        viewport: {
          ...state.viewport,
          x: -(bounds.x + bounds.width / 2),
          y: -(bounds.y + bounds.height / 2)
        }
      }));
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
      const board = state.elements.find(el => el.id === boardId && el.type === 'board');
      if (!board) return;

      // Save current viewport state
      const currentBoard = state.currentBoardId || 'root';
      set((state) => ({
        boardViewports: {
          ...state.boardViewports,
          [currentBoard]: { ...state.viewport }
        }
      }));

      // Enter the board
      set((state) => ({
        currentBoardId: boardId,
        boardHistory: [...state.boardHistory, boardId],
        elements: board.data.elements || [],
        selectedIds: [],
        viewport: state.boardViewports[boardId] || { x: 0, y: 0, zoom: 1 }
      }));
    },

    exitBoard: () => {
      const state = get();
      if (!state.currentBoardId) return;

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

      // Load parent board elements
      if (parentBoardId) {
        const parentBoard = get().getElementById(parentBoardId);
        set({
          currentBoardId: parentBoardId,
          boardHistory: newHistory,
          elements: parentBoard?.data.elements || [],
          selectedIds: [],
          viewport: state.boardViewports[parentBoardId] || { x: 0, y: 0, zoom: 1 }
        });
      } else {
        // Back to root
        set({
          currentBoardId: null,
          boardHistory: [],
          elements: [], // This should be loaded from persistence
          selectedIds: [],
          viewport: state.boardViewports.root || { x: 0, y: 0, zoom: 1 }
        });
      }
    },

    getBreadcrumbs: () => {
      const state = get();
      const breadcrumbs = [{ id: 'root', title: 'Canvas' }];
      
      state.boardHistory.forEach(boardId => {
        const board = state.getElementById(boardId);
        if (board) {
          breadcrumbs.push({
            id: boardId,
            title: board.data.title || 'Untitled Board'
          });
        }
      });
      
      return breadcrumbs;
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