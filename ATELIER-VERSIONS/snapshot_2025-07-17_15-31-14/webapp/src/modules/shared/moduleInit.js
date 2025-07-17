/**
 * Module Initialization - Register all modules with the registry
 * This is the ONLY place where direct imports should happen
 */
import moduleRegistry from './registry/ModuleRegistry.js';
import { canvasAdapter } from './adapters/CanvasAdapter.js';
import { mindGardenAdapter } from './adapters/MindGardenAdapter.js';
import { eventBus, ModuleEvents } from './events/EventBus.js';
import { ICanvas, ICanvas_v2 } from './contracts/ICanvas.js';
import { IMindGarden } from './contracts/IMindGarden.js';
import { initializeHealthChecking } from './health/HealthCheckIntegration.js';

/**
 * Initialize all modules with the registry
 * This function should be called once at app startup
 */
export async function initializeModules() {
  console.log('[ModuleInit] Starting module initialization...');
  
  try {
    // Register Scriptorium module (formerly Creative Atelier) with backward compatibility aliases
    moduleRegistry.register(
      'scriptorium',
      async () => {
        const { useCanvasStore } = await import('../visual-canvas/store.js');
        return useCanvasStore;
      },
      {
        aliases: ['canvas', 'creative-atelier', 'visual-canvas'],
        adapter: canvasAdapter,
        contract: ICanvas
      }
    );
    
    // Register Mind Garden module
    moduleRegistry.register(
      'mindgarden',
      async () => {
        const { useMindGardenStore } = await import('../mind-garden/store.js');
        return useMindGardenStore;
      },
      {
        aliases: ['mind-garden'],
        adapter: mindGardenAdapter,
        contract: IMindGarden
      }
    );
    
    // Register Orchestra module (formerly Content Studio)
    moduleRegistry.register(
      'orchestra',
      async () => {
        const Orchestra = await import('../orchestra/Orchestra.jsx');
        return Orchestra.default;
      },
      {
        aliases: ['content-studio', 'contentstudio'],
        adapter: null, // No adapter needed for UI-only modules
        contract: null
      }
    );
    
    // Initialize adapters
    await canvasAdapter.init();
    await mindGardenAdapter.init();
    
    // Setup cross-module event handlers
    setupEventHandlers();
    
    // Initialize health checking system
    await initializeHealthChecking();
    
    console.log('[ModuleInit] Module initialization complete');
    console.log('[ModuleInit] Registered modules:', moduleRegistry.getInfo());
    
    // Emit initialization complete event
    eventBus.emit(ModuleEvents.MODULE_INITIALIZED, {
      modules: moduleRegistry.getInfo().registeredModules
    });
    
  } catch (error) {
    console.error('[ModuleInit] Module initialization failed:', error);
    eventBus.emit(ModuleEvents.MODULE_ERROR, {
      error: error.message,
      phase: 'initialization'
    });
  }
}

/**
 * Setup cross-module event handlers
 */
function setupEventHandlers() {
  // Handle Mind Garden export requests
  eventBus.on(ModuleEvents.MINDGARDEN_EXPORT_REQUESTED, async (data) => {
    console.log('[ModuleInit] Handling Mind Garden export request:', data);
    
    try {
      const { nodeId, nodeIds } = data;
      
      if (nodeIds && Array.isArray(nodeIds)) {
        // Export multiple nodes
        const elementIds = await mindGardenAdapter.exportNodesToCanvas(nodeIds);
        eventBus.emit(ModuleEvents.MINDGARDEN_EXPORT_COMPLETED, {
          nodeIds,
          elementIds,
          success: true
        });
      } else if (nodeId) {
        // Export single node
        const elementId = await mindGardenAdapter.exportNodeToCanvas(nodeId);
        eventBus.emit(ModuleEvents.MINDGARDEN_EXPORT_COMPLETED, {
          nodeId,
          elementId,
          success: !!elementId
        });
      }
    } catch (error) {
      console.error('[ModuleInit] Export failed:', error);
      eventBus.emit(ModuleEvents.MODULE_ERROR, {
        error: error.message,
        module: 'mindgarden',
        action: 'export'
      });
    }
  });
  
  // Log all module events in development
  if (process.env.NODE_ENV === 'development') {
    Object.values(ModuleEvents).forEach(event => {
      eventBus.on(event, (data) => {
        console.debug(`[Event] ${event}:`, data);
      });
    });
  }
}

/**
 * Get module adapter by name
 * @param {string} moduleName - Module name
 * @returns {Object|null} Module adapter
 */
export function getModuleAdapter(moduleName) {
  switch (moduleName) {
    case 'scriptorium':
    case 'canvas':
    case 'visual-canvas':
    case 'creative-atelier':
      return canvasAdapter;
    case 'mindgarden':
    case 'mind-garden':
      return mindGardenAdapter;
    default:
      return moduleRegistry.getAdapter(moduleName);
  }
}

/**
 * Safe module invocation helper
 * @param {string} moduleName - Module name
 * @param {string} method - Method name
 * @param  {...any} args - Method arguments
 * @returns {Promise<any>} Method result
 */
export async function invokeModule(moduleName, method, ...args) {
  try {
    return await moduleRegistry.invoke(moduleName, method, ...args);
  } catch (error) {
    console.error(`[ModuleInit] Failed to invoke ${moduleName}.${method}:`, error);
    
    // Try adapter as fallback
    const adapter = getModuleAdapter(moduleName);
    if (adapter && adapter[method]) {
      return adapter[method](...args);
    }
    
    throw error;
  }
}

// Export everything for convenience
export { moduleRegistry, eventBus, ModuleEvents, canvasAdapter, mindGardenAdapter };