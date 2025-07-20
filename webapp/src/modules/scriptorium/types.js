// Visual Canvas Types and Data Structures

export const ELEMENT_TYPES = {
  BOARD: 'board',
  NOTE: 'note',
  IMAGE: 'image', 
  LINK: 'link',
  AI: 'ai',
  GROUP: 'group', // 🚀 TRINITY AMPLIFIER: Professional grouping container
  // AGENTIC NODES 🤖
  FILE_OPENER: 'file-opener',
  URL_LAUNCHER: 'url-launcher'
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
    title: null, // TRINITY AMPLIFIER: Universal title field (optional)
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
      // Larger default size for notes to show more content
      baseElement.size = { width: 280, height: 220 };
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
    case ELEMENT_TYPES.GROUP:
      // 🚀 TRINITY AMPLIFIER: Professional group container
      baseElement.size = { width: 400, height: 300 };
      break;
    case ELEMENT_TYPES.FILE_OPENER:
      baseElement.size = { width: 280, height: 140 };
      break;
    case ELEMENT_TYPES.URL_LAUNCHER:
      baseElement.size = { width: 280, height: 140 };
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
      // Milanote-style pastel colors
      const milanoteColors = [
        '#E3F2FD', // blue
        '#F3E5F5', // purple
        '#E8F5E9', // green
        '#FFF9C4', // yellow
        '#FFE0B2', // coral
        '#FCE4EC', // pink
        '#F5F5F5'  // gray
      ];
      const randomColor = milanoteColors[Math.floor(Math.random() * milanoteColors.length)];
      
      return {
        title: 'New Board',
        description: '',
        backgroundColor: randomColor,
        borderColor: 'rgba(0,0,0,0.06)',
        elements: [], // Child elements within this board
        collapsed: false
      };
      
    case ELEMENT_TYPES.NOTE:
      return {
        title: '',
        content: '',
        // Legacy support for text field
        text: '',
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
    
    case ELEMENT_TYPES.GROUP:
      // 🚀 TRINITY AMPLIFIER: Professional group container
      return {
        title: 'New Group',
        backgroundColor: 'rgba(59, 130, 246, 0.1)', // Blue with transparency
        borderColor: '#3b82f6',
        borderStyle: 'dashed', // solid, dashed, dotted
        borderWidth: 2,
        cornerRadius: 8,
        opacity: 0.95,
        collapsed: false, // Future: collapsible groups
        children: [], // Array of child element IDs
        showTitle: true,
        titlePosition: 'top', // top, bottom, inside
        padding: 16,
        autoResize: true // Auto-resize to fit children
      };
    
    case ELEMENT_TYPES.FILE_OPENER:
      return {
        filePath: '',
        fileName: 'Select File',
        description: 'Click to open file',
        fileType: 'unknown',
        fileSize: null,
        lastModified: null,
        application: 'auto', // auto-detect or specific app
        icon: '📄',
        status: 'ready', // ready, opening, error
        exists: true
      };
    
    case ELEMENT_TYPES.URL_LAUNCHER:
      return {
        url: '',
        title: 'Enter URL',
        description: 'Click to open link',
        favicon: null,
        preview: false,
        icon: '🔗',
        status: 'ready', // ready, opening, error
        openInNewTab: true
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

// TRINITY AMPLIFIER: Title Field Helper Functions
export const getDisplayTitle = (element) => {
  if (element.title) return element.title;
  
  // Smart fallbacks based on type
  switch(element.type) {
    case ELEMENT_TYPES.NOTE:
      return element.data.title || getContentPreview(element.data.content, 30) || `Note ${element.id.slice(-4)}`;
    case ELEMENT_TYPES.BOARD:
      return element.data.title || `Board ${element.id.slice(-4)}`;
    case ELEMENT_TYPES.LINK:
      return element.data.title || extractDomain(element.data.url) || `Link ${element.id.slice(-4)}`;
    case ELEMENT_TYPES.IMAGE:
      return element.data.alt || element.data.fileName || `Image ${element.id.slice(-4)}`;
    case ELEMENT_TYPES.AI:
      return element.data.title || `AI Response ${element.id.slice(-4)}`;
    case ELEMENT_TYPES.GROUP:
      // 🚀 TRINITY AMPLIFIER: Group title with children count
      const childCount = element.data.children?.length || 0;
      const baseTitle = element.data.title || `Group ${element.id.slice(-4)}`;
      return childCount > 0 ? `${baseTitle} (${childCount})` : baseTitle;
    case ELEMENT_TYPES.FILE_OPENER:
      return element.data.fileName || `File ${element.id.slice(-4)}`;
    case ELEMENT_TYPES.URL_LAUNCHER:
      return element.data.title || `URL ${element.id.slice(-4)}`;
    default:
      return `${element.type} ${element.id.slice(-4)}`;
  }
};

const getContentPreview = (content, maxLength = 30) => {
  if (!content || typeof content !== 'string') return null;
  const preview = content.trim();
  if (preview.length <= maxLength) return preview;
  return preview.substring(0, maxLength) + '...';
};

const extractDomain = (url) => {
  if (!url || typeof url !== 'string') return null;
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return null;
  }
};

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

// 🚀 TRINITY AMPLIFIER: Group Management Helper Functions
export const groupHelpers = {
  // Calculate bounds for a set of elements
  calculateElementsBounds: (elements) => {
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

  // Create group from selected elements
  createGroupFromSelection: (selectedElements, groupTitle = null) => {
    if (selectedElements.length === 0) return null;

    const bounds = groupHelpers.calculateElementsBounds(selectedElements);
    const padding = 16;
    const titleSpace = 40;

    // Create group element
    const groupElement = createCanvasElement(ELEMENT_TYPES.GROUP, {
      x: bounds.x - padding,
      y: bounds.y - titleSpace
    });

    // Set group size with padding
    groupElement.size = {
      width: bounds.width + (padding * 2),
      height: bounds.height + titleSpace + padding
    };

    // Set title
    const finalTitle = groupTitle || `Group (${selectedElements.length} items)`;
    groupElement.title = finalTitle;
    groupElement.data.title = finalTitle;

    // Set children IDs
    groupElement.data.children = selectedElements.map(el => el.id);

    return groupElement;
  },

  // Convert element positions to relative (when adding to group)
  convertToRelativePositions: (elements, groupPosition) => {
    return elements.map(element => ({
      ...element,
      position: {
        x: element.position.x - groupPosition.x,
        y: element.position.y - groupPosition.y
      },
      parentGroupId: null // Will be set when adding to group
    }));
  },

  // Convert element positions to absolute (when ungrouping)
  convertToAbsolutePositions: (elements, groupPosition) => {
    return elements.map(element => ({
      ...element,
      position: {
        x: element.position.x + groupPosition.x,
        y: element.position.y + groupPosition.y
      },
      parentGroupId: undefined
    }));
  },

  // Check if element is inside group bounds
  isElementInGroupBounds: (element, group) => {
    const elementBounds = {
      x1: element.position.x,
      y1: element.position.y,
      x2: element.position.x + element.size.width,
      y2: element.position.y + element.size.height
    };

    const groupBounds = {
      x1: group.position.x,
      y1: group.position.y,
      x2: group.position.x + group.size.width,
      y2: group.position.y + group.size.height
    };

    return (
      elementBounds.x1 >= groupBounds.x1 &&
      elementBounds.y1 >= groupBounds.y1 &&
      elementBounds.x2 <= groupBounds.x2 &&
      elementBounds.y2 <= groupBounds.y2
    );
  },

  // Auto-resize group to fit children
  autoResizeGroupToFitChildren: (group, children) => {
    if (children.length === 0) {
      return group;
    }

    const bounds = groupHelpers.calculateElementsBounds(children);
    const padding = group.data.padding || 16;
    const titleSpace = group.data.showTitle ? 40 : 8;

    return {
      ...group,
      size: {
        width: Math.max(bounds.width + (padding * 2), 200), // Minimum width
        height: Math.max(bounds.height + titleSpace + padding, 100) // Minimum height
      }
    };
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