/**
 * Canvas Module Contract
 * Defines the interface that any canvas implementation must follow
 */
export const ICanvas = {
  version: '1.0',
  
  methods: [
    // Element management
    'addElement',
    'removeElement', 
    'updateElement',
    'moveElement',
    'getElements',
    
    // Navigation
    'navigateToBoard',
    'exitBoard',
    'getBreadcrumbs',
    'getCurrentBoardId',
    
    // Selection
    'selectElement',
    'selectMultiple',
    'clearSelection',
    'getSelectedIds',
    
    // Persistence
    'saveToProject',
    'loadFromProject',
    
    // Viewport
    'panViewport',
    'zoomViewport',
    'centerViewport'
  ],
  
  properties: [
    'elements',
    'selectedIds',
    'currentBoardId',
    'viewport'
  ],
  
  // Expected element structure
  elementSchema: {
    id: 'string',
    type: 'string', // 'note' | 'image' | 'link' | 'ai' | 'board'
    position: {
      x: 'number',
      y: 'number'
    },
    size: {
      width: 'number',
      height: 'number'
    },
    data: 'object' // Type-specific data
  }
};

/**
 * Canvas Module Contract v2 - Extended version
 * Includes new features while maintaining backwards compatibility
 */
export const ICanvas_v2 = {
  ...ICanvas,
  version: '2.0',
  
  methods: [
    ...ICanvas.methods,
    // New v2 methods
    'addElementWithCustomData',
    'batchAddElements',
    'getHierarchicalStructure',
    'exportElements',
    'importElements'
  ],
  
  // New events in v2
  events: [
    'element:created',
    'element:updated',
    'element:deleted',
    'board:navigated',
    'selection:changed'
  ]
};