// Visual Canvas Types and Data Structures

export const ELEMENT_TYPES = {
  BOARD: 'board',
  NOTE: 'note',
  IMAGE: 'image', 
  LINK: 'link',
  AI: 'ai'
};

export const GRID_SIZE = 20;
export const DEFAULT_ZOOM = 1;
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 3;

// Canvas element base structure
export const createCanvasElement = (type, position = { x: 0, y: 0 }) => {
  const baseElement = {
    id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    position,
    rotation: 0,
    zIndex: 1,
    selected: false,
    locked: false,
    visible: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    data: getDefaultElementData(type)
  };

  // Set different default sizes based on element type
  switch (type) {
    case ELEMENT_TYPES.BOARD:
      baseElement.size = { width: 300, height: 250 };
      break;
    case ELEMENT_TYPES.NOTE:
      baseElement.size = { width: 200, height: 150 };
      break;
    case ELEMENT_TYPES.IMAGE:
      baseElement.size = { width: 250, height: 200 };
      break;
    case ELEMENT_TYPES.LINK:
      baseElement.size = { width: 280, height: 120 };
      break;
    case ELEMENT_TYPES.AI:
      baseElement.size = { width: 300, height: 200 };
      break;
    default:
      baseElement.size = { width: 200, height: 150 };
  }

  return baseElement;
};

// Default data for each element type
const getDefaultElementData = (type) => {
  switch (type) {
    case ELEMENT_TYPES.BOARD:
      return {
        title: 'New Board',
        description: '',
        backgroundColor: '#f8fafc',
        borderColor: '#e2e8f0',
        elements: [], // Child elements within this board
        collapsed: false
      };
      
    case ELEMENT_TYPES.NOTE:
      return {
        text: 'Double-click to edit',
        fontSize: 14,
        fontWeight: 'normal',
        textAlign: 'left',
        color: '#1f2937',
        backgroundColor: '#fef3c7',
        borderColor: '#f59e0b'
      };
    
    case ELEMENT_TYPES.IMAGE:
      return {
        src: null,
        alt: '',
        objectFit: 'cover',
        borderRadius: 8,
        opacity: 1,
        filter: 'none'
      };
    
    case ELEMENT_TYPES.LINK:
      return {
        url: '',
        title: 'Untitled Link',
        description: '',
        favicon: null,
        thumbnail: null,
        preview: false
      };
    
    case ELEMENT_TYPES.AI:
      return {
        prompt: '',
        model: 'gpt-4',
        response: '',
        status: 'idle', // idle, processing, completed, error
        tokens: 0,
        temperature: 0.7
      };
    
    default:
      return {};
  }
};

// Canvas state structure
export const createCanvasState = () => ({
  elements: [],
  selectedIds: [],
  clipboard: [],
  viewport: {
    x: 0,
    y: 0,
    zoom: DEFAULT_ZOOM
  },
  settings: {
    gridEnabled: true,
    gridVisible: false,
    snapToGrid: true,
    gridSize: GRID_SIZE,
    darkMode: false,
    showMinimap: false
  },
  history: {
    past: [],
    present: null,
    future: []
  }
});

// Helper functions for element manipulation
export const canvasHelpers = {
  // Position helpers
  snapToGrid: (position, gridSize = GRID_SIZE) => ({
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  }),

  // Bounds checking
  isWithinBounds: (element, canvasBounds) => {
    const { x, y } = element.position;
    const { width, height } = element.size;
    
    return (
      x >= canvasBounds.left &&
      y >= canvasBounds.top &&
      x + width <= canvasBounds.right &&
      y + height <= canvasBounds.bottom
    );
  },

  // Collision detection
  isOverlapping: (elementA, elementB) => {
    const aLeft = elementA.position.x;
    const aRight = aLeft + elementA.size.width;
    const aTop = elementA.position.y;
    const aBottom = aTop + elementA.size.height;

    const bLeft = elementB.position.x;
    const bRight = bLeft + elementB.size.width;
    const bTop = elementB.position.y;
    const bBottom = bTop + elementB.size.height;

    return !(
      aRight < bLeft ||
      aLeft > bRight ||
      aBottom < bTop ||
      aTop > bBottom
    );
  },

  // Selection helpers
  getElementsInSelection: (elements, selectionRect) => {
    return elements.filter(element => {
      const { x, y } = element.position;
      const { width, height } = element.size;
      
      return (
        x >= selectionRect.x &&
        y >= selectionRect.y &&
        x + width <= selectionRect.x + selectionRect.width &&
        y + height <= selectionRect.y + selectionRect.height
      );
    });
  },

  // Transform helpers
  getElementBounds: (elements) => {
    if (elements.length === 0) return null;
    
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    elements.forEach(element => {
      const { x, y } = element.position;
      const { width, height } = element.size;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  },

  // Z-index management
  bringToFront: (element, elements) => {
    const maxZ = Math.max(...elements.map(el => el.zIndex));
    return { ...element, zIndex: maxZ + 1 };
  },

  sendToBack: (element) => {
    return { ...element, zIndex: 1 };
  }
};

// Canvas actions for state management
export const CANVAS_ACTIONS = {
  ADD_ELEMENT: 'ADD_ELEMENT',
  REMOVE_ELEMENT: 'REMOVE_ELEMENT',
  UPDATE_ELEMENT: 'UPDATE_ELEMENT',
  MOVE_ELEMENT: 'MOVE_ELEMENT',
  SELECT_ELEMENT: 'SELECT_ELEMENT',
  SELECT_MULTIPLE: 'SELECT_MULTIPLE',
  CLEAR_SELECTION: 'CLEAR_SELECTION',
  COPY_ELEMENTS: 'COPY_ELEMENTS',
  PASTE_ELEMENTS: 'PASTE_ELEMENTS',
  DELETE_SELECTED: 'DELETE_SELECTED',
  UPDATE_VIEWPORT: 'UPDATE_VIEWPORT',
  TOGGLE_SETTING: 'TOGGLE_SETTING',
  UNDO: 'UNDO',
  REDO: 'REDO'
};

// Storage keys for persistence
export const STORAGE_KEYS = {
  CANVAS_STATE: 'atelier_canvas_state',
  CANVAS_SETTINGS: 'atelier_canvas_settings',
  CANVAS_ELEMENTS: 'atelier_canvas_elements'
};