/**
 * Mind Garden Adapter - Safe interface for Mind Garden operations
 */
import moduleRegistry from '../registry/ModuleRegistry.js';
import canvasAdapter from './CanvasAdapter.js';
import { adapterLogger } from '../monitoring/ModuleLogger.js';

class MindGardenAdapter {
  constructor() {
    this._mindGardenStore = null;
    this._initialized = false;
    this.logger = adapterLogger.child({ adapter: 'mind-garden' });
  }

  /**
   * Initialize the adapter
   */
  async init() {
    if (this._initialized) return;
    
    try {
      const module = await moduleRegistry.getModule('mindgarden');
      if (module) {
        this._mindGardenStore = module;
        this._initialized = true;
        this.logger.info('Initialized', 'init');
      }
    } catch (error) {
      this.logger.error(error, 'init');
    }
  }

  /**
   * Get the Mind Garden store
   * @private
   */
  async _getStore() {
    if (!this._initialized) {
      await this.init();
    }
    
    if (!this._mindGardenStore) {
      throw new Error('Mind Garden module not available');
    }
    
    // Handle Zustand store
    if (typeof this._mindGardenStore === 'function') {
      return this._mindGardenStore.getState();
    }
    
    return this._mindGardenStore;
  }

  /**
   * Export node to Canvas
   * @param {string} nodeId - Node ID to export
   * @returns {Promise<string|null>} Canvas element ID or null
   */
  async exportNodeToCanvas(nodeId) {
    try {
      const store = await this._getStore();
      
      // Get node data
      const node = store.nodes.find(n => n.id === nodeId);
      if (!node) {
        this.logger.warning(`Node ${nodeId} not found`, 'exportNodeToCanvas', { nodeId });
        return null;
      }
      
      // Prepare canvas element data
      const canvasData = {
        title: node.data?.title || 'Untitled',
        content: node.data?.content || '',
        source: 'mind-garden',
        originalNodeId: nodeId,
        phase: node.data?.phase,
        createdAt: node.data?.createdAt || Date.now()
      };
      
      // Add to canvas using adapter
      const elementId = await canvasAdapter.addElement(
        'note',
        { x: 100, y: 100 }, // Default position
        canvasData
      );
      
      this.logger.info(`Exported node ${nodeId} as element ${elementId}`, 'exportNodeToCanvas', { nodeId, elementId });
      return elementId;
      
    } catch (error) {
      this.logger.error(error, 'exportNodeToCanvas', { nodeId });
      return null;
    }
  }

  /**
   * Export multiple nodes to Canvas
   * @param {Array<string>} nodeIds - Array of node IDs
   * @returns {Promise<Array>} Array of canvas element IDs
   */
  async exportNodesToCanvas(nodeIds) {
    const results = [];
    
    // Calculate grid positions for multiple elements
    const columns = Math.ceil(Math.sqrt(nodeIds.length));
    const spacing = 320;
    const startX = 100;
    const startY = 100;
    
    for (let i = 0; i < nodeIds.length; i++) {
      const row = Math.floor(i / columns);
      const col = i % columns;
      const position = {
        x: startX + (col * spacing),
        y: startY + (row * spacing)
      };
      
      try {
        const store = await this._getStore();
        const node = store.nodes.find(n => n.id === nodeIds[i]);
        
        if (node) {
          const canvasData = {
            title: node.data?.title || 'Untitled',
            content: node.data?.content || '',
            source: 'mind-garden',
            originalNodeId: nodeIds[i],
            phase: node.data?.phase,
            createdAt: node.data?.createdAt || Date.now()
          };
          
          const elementId = await canvasAdapter.addElement('note', position, canvasData);
          if (elementId) {
            results.push(elementId);
          }
        }
      } catch (error) {
        this.logger.error(error, 'exportNodesToCanvas', { nodeId: nodeIds[i], index: i });
      }
    }
    
    // Center viewport on new elements
    if (results.length > 0) {
      await canvasAdapter.centerViewport();
    }
    
    return results;
  }

  /**
   * Get node by ID
   * @param {string} nodeId - Node ID
   * @returns {Promise<Object|null>} Node object or null
   */
  async getNode(nodeId) {
    try {
      const store = await this._getStore();
      return store.nodes.find(n => n.id === nodeId) || null;
    } catch (error) {
      this.logger.error(error, 'getNode', { nodeId });
      return null;
    }
  }

  /**
   * Get all nodes
   * @returns {Promise<Array>} Array of nodes
   */
  async getNodes() {
    try {
      const store = await this._getStore();
      return store.nodes || [];
    } catch (error) {
      this.logger.error(error, 'getNodes');
      return [];
    }
  }

  /**
   * Update node
   * @param {string} nodeId - Node ID
   * @param {Object} updates - Updates to apply
   */
  async updateNode(nodeId, updates) {
    try {
      const store = await this._getStore();
      
      if (store.updateNode) {
        return store.updateNode(nodeId, updates);
      }
      
      this.logger.warning('updateNode method not found', 'updateNode', { nodeId, updates });
    } catch (error) {
      this.logger.error(error, 'updateNode', { nodeId, updates });
    }
  }

  /**
   * Create a new node
   * @param {Object} nodeData - Node data
   * @returns {Promise<string|null>} Node ID or null
   */
  async createNode(nodeData) {
    try {
      const store = await this._getStore();
      
      if (store.createNode) {
        return store.createNode(nodeData);
      } else if (store.addNode) {
        // Fallback to alternative method
        return store.addNode(nodeData);
      }
      
      this.logger.warning('No create method found', 'createNode', { nodeData });
      return null;
    } catch (error) {
      this.logger.error(error, 'createNode', { nodeData });
      return null;
    }
  }
}

// Create singleton instance
export const mindGardenAdapter = new MindGardenAdapter();

export default mindGardenAdapter;