/**
 * Canvas Adapter - Safe interface for canvas operations
 * Handles multiple canvas implementations (visual-canvas, creative-atelier, etc.)
 */
import moduleRegistry from '../registry/ModuleRegistry.js';
import { adapterLogger } from '../monitoring/ModuleLogger.js';

class CanvasAdapter {
  constructor() {
    this.moduleNames = ['canvas', 'visual-canvas', 'creative-atelier'];
    this._canvasStore = null;
    this._initialized = false;
    this.logger = adapterLogger.child({ adapter: 'canvas' });
  }

  /**
   * Initialize the adapter by finding available canvas module
   */
  async init() {
    if (this._initialized) return;
    
    // Try to find any available canvas module
    for (const moduleName of this.moduleNames) {
      if (moduleRegistry.hasModule(moduleName)) {
        try {
          const module = await moduleRegistry.getModule(moduleName);
          if (module) {
            this._canvasStore = module;
            this._initialized = true;
            this.logger.info(`Initialized with module: ${moduleName}`, 'init', { moduleName });
            return;
          }
        } catch (error) {
          this.logger.warning(`Failed to load ${moduleName}`, 'init', { moduleName, error: error.message });
        }
      }
    }
    
    this.logger.error(new Error('No canvas module found'), 'init', { availableModules: this.moduleNames });
  }

  /**
   * Get the canvas store instance
   * @private
   */
  async _getStore() {
    if (!this._initialized) {
      await this.init();
    }
    
    if (!this._canvasStore) {
      throw new Error('Canvas module not available');
    }
    
    // Handle both Zustand stores and regular objects
    if (typeof this._canvasStore === 'function') {
      return this._canvasStore.getState();
    }
    
    return this._canvasStore;
  }

  /**
   * Add element to canvas with fallback handling
   * @param {string} type - Element type
   * @param {Object} position - Position {x, y}
   * @param {Object} data - Element data
   * @returns {Promise<string|null>} Element ID or null
   */
  async addElement(type, position, data = {}) {
    try {
      const store = await this._getStore();
      
      // Handle different method signatures
      if (store.addElement) {
        return store.addElement(type, position, data);
      } else if (store.addElementWithCustomData) {
        return store.addElementWithCustomData(type, position, data);
      }
      
      this.logger.warning('No add method found', 'addElement', { type, position, data });
      return null;
    } catch (error) {
      this.logger.error(error, 'addElement', { type, position, data });
      return null;
    }
  }

  /**
   * Navigate to a board
   * @param {string} boardId - Board ID
   */
  async navigateToBoard(boardId) {
    try {
      const store = await this._getStore();
      
      if (store.navigateToBoard) {
        return store.navigateToBoard(boardId);
      } else if (store.enterBoard) {
        // Fallback to old method
        return store.enterBoard(boardId);
      }
      
      this.logger.warning('No navigation method found', 'navigateToBoard', { boardId });
    } catch (error) {
      this.logger.error(error, 'navigateToBoard', { boardId });
    }
  }

  /**
   * Get current elements
   * @returns {Promise<Array>} Elements array
   */
  async getElements() {
    try {
      const store = await this._getStore();
      return store.elements || [];
    } catch (error) {
      this.logger.error(error, 'getElements');
      return [];
    }
  }

  /**
   * Select an element
   * @param {string} elementId - Element ID
   * @param {boolean} addToSelection - Add to existing selection
   */
  async selectElement(elementId, addToSelection = false) {
    try {
      const store = await this._getStore();
      
      if (store.selectElement) {
        return store.selectElement(elementId, addToSelection);
      }
      
      this.logger.warning('selectElement method not found', 'selectElement', { elementId, addToSelection });
    } catch (error) {
      this.logger.error(error, 'selectElement', { elementId, addToSelection });
    }
  }

  /**
   * Clear selection
   */
  async clearSelection() {
    try {
      const store = await this._getStore();
      
      if (store.clearSelection) {
        return store.clearSelection();
      }
    } catch (error) {
      this.logger.error(error, 'clearSelection');
    }
  }

  /**
   * Update element
   * @param {string} elementId - Element ID
   * @param {Object} updates - Updates to apply
   */
  async updateElement(elementId, updates) {
    try {
      const store = await this._getStore();
      
      if (store.updateElement) {
        return store.updateElement(elementId, updates);
      }
      
      this.logger.warning('updateElement method not found', 'updateElement', { elementId, updates });
    } catch (error) {
      this.logger.error(error, 'updateElement', { elementId, updates });
    }
  }

  /**
   * Batch add multiple elements
   * @param {Array} elements - Array of elements to add
   * @returns {Promise<Array>} Array of element IDs
   */
  async batchAddElements(elements) {
    try {
      const store = await this._getStore();
      
      // Try native batch method first
      if (store.batchAddElements) {
        return store.batchAddElements(elements);
      }
      
      // Fallback to individual adds
      const ids = [];
      for (const element of elements) {
        const id = await this.addElement(
          element.type,
          element.position,
          element.data
        );
        if (id) ids.push(id);
      }
      
      return ids;
    } catch (error) {
      this.logger.error(error, 'batchAddElements', { elementCount: elements.length });
      return [];
    }
  }

  /**
   * Get breadcrumbs for current navigation
   * @returns {Promise<Array>} Breadcrumbs array
   */
  async getBreadcrumbs() {
    try {
      const store = await this._getStore();
      
      if (store.getBreadcrumbs) {
        return store.getBreadcrumbs();
      }
      
      return [];
    } catch (error) {
      this.logger.error(error, 'getBreadcrumbs');
      return [];
    }
  }

  /**
   * Center viewport on elements
   */
  async centerViewport() {
    try {
      const store = await this._getStore();
      
      if (store.centerViewport) {
        return store.centerViewport();
      }
    } catch (error) {
      this.logger.error(error, 'centerViewport');
    }
  }
}

// Create singleton instance
export const canvasAdapter = new CanvasAdapter();

export default canvasAdapter;