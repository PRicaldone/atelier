/**
 * Mind Garden Module Contract
 * Defines the interface for the Mind Garden module
 */
export const IMindGarden = {
  version: '1.0',
  
  methods: [
    // Node management
    'createNode',
    'updateNode',
    'deleteNode',
    'getNode',
    'getNodes',
    
    // Edge management
    'createEdge',
    'deleteEdge',
    'getEdges',
    
    // Export functionality
    'exportToCanvas',
    'exportNode',
    'exportSelectedNodes',
    
    // Layout
    'autoLayout',
    'centerNode',
    'fitView',
    
    // Selection
    'selectNode',
    'clearSelection',
    'getSelectedNodes'
  ],
  
  properties: [
    'nodes',
    'edges',
    'selectedNodeIds',
    'viewport'
  ],
  
  // Expected node structure
  nodeSchema: {
    id: 'string',
    type: 'string',
    position: {
      x: 'number',
      y: 'number'
    },
    data: {
      title: 'string',
      content: 'string',
      phase: 'string',
      createdAt: 'number',
      lastModified: 'number'
    }
  },
  
  // Expected edge structure
  edgeSchema: {
    id: 'string',
    source: 'string',
    target: 'string',
    type: 'string'
  }
};