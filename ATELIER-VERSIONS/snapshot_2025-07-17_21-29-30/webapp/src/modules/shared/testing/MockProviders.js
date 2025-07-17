/**
 * Mock Providers - Mock implementations for testing
 * 
 * Provides mock implementations of modules and adapters for testing
 * without requiring the full module infrastructure
 */

import { testLogger } from '../monitoring/ModuleLogger.js';

/**
 * Mock Canvas Store
 */
export class MockCanvasStore {
  constructor() {
    this.elements = [
      {
        id: 'mock-element-1',
        type: 'note',
        position: { x: 100, y: 100 },
        data: { title: 'Mock Note 1', content: 'Test content' }
      },
      {
        id: 'mock-element-2', 
        type: 'board',
        position: { x: 300, y: 200 },
        data: { title: 'Mock Board', elements: [] }
      }
    ];
    
    this.viewport = {
      x: 0,
      y: 0,
      zoom: 1
    };
    
    this.selectedIds = [];
    this.logger = testLogger.child({ mock: 'canvas' });
  }
  
  getState() {
    return {
      elements: this.elements,
      viewport: this.viewport,
      selectedIds: this.selectedIds
    };
  }
  
  addElement(type, position, data = {}) {
    const element = {
      id: `mock-element-${Date.now()}`,
      type,
      position,
      data: {
        title: data.title || `Mock ${type}`,
        ...data
      }
    };
    
    this.elements.push(element);
    this.logger.info('Element added', 'addElement', { element });
    return element.id;
  }
  
  updateElement(elementId, updates) {
    const element = this.elements.find(e => e.id === elementId);
    if (element) {
      Object.assign(element, updates);
      this.logger.info('Element updated', 'updateElement', { elementId, updates });
      return true;
    }
    return false;
  }
  
  removeElement(elementId) {
    const index = this.elements.findIndex(e => e.id === elementId);
    if (index !== -1) {
      this.elements.splice(index, 1);
      this.logger.info('Element removed', 'removeElement', { elementId });
      return true;
    }
    return false;
  }
  
  selectElement(elementId, addToSelection = false) {
    if (!addToSelection) {
      this.selectedIds = [];
    }
    
    if (!this.selectedIds.includes(elementId)) {
      this.selectedIds.push(elementId);
    }
    
    this.logger.info('Element selected', 'selectElement', { elementId, selectedIds: this.selectedIds });
  }
  
  clearSelection() {
    this.selectedIds = [];
    this.logger.info('Selection cleared', 'clearSelection');
  }
  
  reset() {
    this.elements = [];
    this.viewport = { x: 0, y: 0, zoom: 1 };
    this.selectedIds = [];
    this.logger.info('Store reset', 'reset');
  }
}

/**
 * Mock Mind Garden Store
 */
export class MockMindGardenStore {
  constructor() {
    this.nodes = [
      {
        id: 'mock-node-1',
        position: { x: 100, y: 100 },
        data: {
          title: 'Mock Node 1',
          content: 'Test mind garden content',
          phase: 'ideation',
          createdAt: Date.now()
        }
      },
      {
        id: 'mock-node-2',
        position: { x: 300, y: 200 },
        data: {
          title: 'Mock Node 2',
          content: 'Another test node',
          phase: 'development',
          createdAt: Date.now() - 10000
        }
      }
    ];
    
    this.edges = [
      {
        id: 'mock-edge-1',
        source: 'mock-node-1',
        target: 'mock-node-2'
      }
    ];
    
    this.selectedNodeId = null;
    this.logger = testLogger.child({ mock: 'mind-garden' });
  }
  
  getState() {
    return {
      nodes: this.nodes,
      edges: this.edges,
      selectedNodeId: this.selectedNodeId
    };
  }
  
  addNode(nodeData) {
    const node = {
      id: `mock-node-${Date.now()}`,
      position: nodeData.position || { x: 200, y: 200 },
      data: {
        title: nodeData.title || 'New Node',
        content: nodeData.content || '',
        phase: nodeData.phase || 'ideation',
        createdAt: Date.now(),
        ...nodeData
      }
    };
    
    this.nodes.push(node);
    this.logger.info('Node added', 'addNode', { node });
    return node.id;
  }
  
  updateNode(nodeId, updates) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      if (updates.data) {
        Object.assign(node.data, updates.data);
      }
      if (updates.position) {
        Object.assign(node.position, updates.position);
      }
      this.logger.info('Node updated', 'updateNode', { nodeId, updates });
      return true;
    }
    return false;
  }
  
  removeNode(nodeId) {
    const nodeIndex = this.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex !== -1) {
      this.nodes.splice(nodeIndex, 1);
      
      // Remove associated edges
      this.edges = this.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
      
      this.logger.info('Node removed', 'removeNode', { nodeId });
      return true;
    }
    return false;
  }
  
  selectNode(nodeId) {
    this.selectedNodeId = nodeId;
    this.logger.info('Node selected', 'selectNode', { nodeId });
  }
  
  clearSelection() {
    this.selectedNodeId = null;
    this.logger.info('Selection cleared', 'clearSelection');
  }
  
  reset() {
    this.nodes = [];
    this.edges = [];
    this.selectedNodeId = null;
    this.logger.info('Store reset', 'reset');
  }
}

/**
 * Mock Orchestra Store
 */
export class MockOrchestraStore {
  constructor() {
    this.campaigns = [
      {
        id: 'mock-campaign-1',
        name: 'Test Campaign',
        status: 'active',
        createdAt: Date.now()
      }
    ];
    
    this.agents = [
      {
        id: 'mock-agent-1',
        name: 'Twitter Agent',
        status: 'healthy',
        lastActivity: Date.now()
      }
    ];
    
    this.logger = testLogger.child({ mock: 'orchestra' });
  }
  
  getState() {
    return {
      campaigns: this.campaigns,
      agents: this.agents
    };
  }
  
  addCampaign(campaignData) {
    const campaign = {
      id: `mock-campaign-${Date.now()}`,
      name: campaignData.name || 'New Campaign',
      status: 'draft',
      createdAt: Date.now(),
      ...campaignData
    };
    
    this.campaigns.push(campaign);
    this.logger.info('Campaign added', 'addCampaign', { campaign });
    return campaign.id;
  }
  
  reset() {
    this.campaigns = [];
    this.agents = [];
    this.logger.info('Store reset', 'reset');
  }
}

/**
 * Mock Adapter Factory
 */
export class MockAdapterFactory {
  constructor() {
    this.mockStores = {
      canvas: new MockCanvasStore(),
      mindGarden: new MockMindGardenStore(),
      orchestra: new MockOrchestraStore()
    };
    
    this.logger = testLogger.child({ factory: 'mock-adapter' });
  }
  
  /**
   * Create mock canvas adapter
   */
  createCanvasAdapter() {
    const store = this.mockStores.canvas;
    
    return {
      async init() {
        return true;
      },
      
      async addElement(type, position, data = {}) {
        return store.addElement(type, position, data);
      },
      
      async getElements() {
        return store.getState().elements;
      },
      
      async updateElement(elementId, updates) {
        return store.updateElement(elementId, updates);
      },
      
      async selectElement(elementId, addToSelection = false) {
        return store.selectElement(elementId, addToSelection);
      },
      
      async clearSelection() {
        return store.clearSelection();
      },
      
      async centerViewport() {
        // Mock implementation
        return true;
      },
      
      async navigateToBoard(boardId) {
        // Mock implementation
        return true;
      }
    };
  }
  
  /**
   * Create mock mind garden adapter
   */
  createMindGardenAdapter() {
    const store = this.mockStores.mindGarden;
    
    return {
      async init() {
        return true;
      },
      
      async getNodes() {
        return store.getState().nodes;
      },
      
      async getNode(nodeId) {
        return store.getState().nodes.find(n => n.id === nodeId) || null;
      },
      
      async createNode(nodeData) {
        return store.addNode(nodeData);
      },
      
      async updateNode(nodeId, updates) {
        return store.updateNode(nodeId, updates);
      },
      
      async exportNodeToCanvas(nodeId) {
        const node = store.getState().nodes.find(n => n.id === nodeId);
        if (node) {
          const canvasAdapter = this.createCanvasAdapter();
          return await canvasAdapter.addElement('note', { x: 100, y: 100 }, {
            title: node.data.title,
            content: node.data.content,
            source: 'mind-garden',
            originalNodeId: nodeId
          });
        }
        return null;
      },
      
      async exportNodesToCanvas(nodeIds) {
        const results = [];
        for (const nodeId of nodeIds) {
          const elementId = await this.exportNodeToCanvas(nodeId);
          if (elementId) {
            results.push(elementId);
          }
        }
        return results;
      }
    };
  }
  
  /**
   * Get mock store by name
   */
  getMockStore(storeName) {
    return this.mockStores[storeName];
  }
  
  /**
   * Reset all mock stores
   */
  resetAllStores() {
    Object.values(this.mockStores).forEach(store => {
      if (store.reset) {
        store.reset();
      }
    });
    
    this.logger.info('All mock stores reset', 'resetAllStores');
  }
}

// Create singleton instance
export const mockAdapterFactory = new MockAdapterFactory();

// Export mock stores for direct access
export const mockCanvasStore = mockAdapterFactory.getMockStore('canvas');
export const mockMindGardenStore = mockAdapterFactory.getMockStore('mindGarden');
export const mockOrchestraStore = mockAdapterFactory.getMockStore('orchestra');

// Make available for debugging
if (typeof window !== 'undefined') {
  window.__mockAdapterFactory = mockAdapterFactory;
  window.__mockStores = {
    canvas: mockCanvasStore,
    mindGarden: mockMindGardenStore,
    orchestra: mockOrchestraStore
  };
}

export default mockAdapterFactory;