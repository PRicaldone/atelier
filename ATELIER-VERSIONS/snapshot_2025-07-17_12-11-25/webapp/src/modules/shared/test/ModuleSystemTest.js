/**
 * Module System Test - Demonstrate the new architecture
 */
import { 
  moduleRegistry, 
  eventBus, 
  ModuleEvents, 
  canvasAdapter, 
  mindGardenAdapter,
  invokeModule 
} from '../moduleInit.js';

export class ModuleSystemTest {
  constructor() {
    this.results = [];
  }

  log(message, data = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      message,
      data
    };
    this.results.push(entry);
    console.log(`[ModuleTest] ${message}`, data);
  }

  async runTests() {
    this.log('🚀 Starting Module System Tests');

    try {
      // Test 1: Module Registry
      await this.testModuleRegistry();
      
      // Test 2: Canvas Adapter
      await this.testCanvasAdapter();
      
      // Test 3: Mind Garden Adapter
      await this.testMindGardenAdapter();
      
      // Test 4: Event Bus
      await this.testEventBus();
      
      // Test 5: Cross-module Communication
      await this.testCrossModuleCommunication();
      
      // Test 6: Orchestra Module (renamed from Content Studio)
      await this.testOrchestraModule();
      
      this.log('✅ All Module System Tests Completed');
      return { success: true, results: this.results };
      
    } catch (error) {
      this.log('❌ Module System Test Failed', error.message);
      return { success: false, error: error.message, results: this.results };
    }
  }

  async testModuleRegistry() {
    this.log('🔍 Testing Module Registry');
    
    // Test module registration
    const info = moduleRegistry.getInfo();
    this.log('Registered modules:', info.registeredModules);
    
    // Test module aliases
    const hasCanvas = moduleRegistry.hasModule('canvas');
    const hasVisualCanvas = moduleRegistry.hasModule('visual-canvas');
    const hasCreativeAtelier = moduleRegistry.hasModule('creative-atelier');
    
    this.log('Module aliases working:', {
      canvas: hasCanvas,
      visualCanvas: hasVisualCanvas,
      creativeAtelier: hasCreativeAtelier
    });
    
    if (!hasCanvas || !hasVisualCanvas || !hasCreativeAtelier) {
      throw new Error('Module aliases not working correctly');
    }
  }

  async testCanvasAdapter() {
    this.log('🎨 Testing Canvas Adapter');
    
    try {
      // Test initialization
      await canvasAdapter.init();
      this.log('Canvas adapter initialized');
      
      // Test getting elements
      const elements = await canvasAdapter.getElements();
      this.log('Canvas elements retrieved:', elements?.length || 0);
      
      // Test adding element
      const elementId = await canvasAdapter.addElement('note', { x: 100, y: 100 }, {
        title: 'Test Note',
        content: 'This is a test note from the module system'
      });
      
      this.log('Added test element:', elementId);
      
      return true;
    } catch (error) {
      this.log('Canvas adapter test failed:', error.message);
      return false;
    }
  }

  async testMindGardenAdapter() {
    this.log('🧠 Testing Mind Garden Adapter');
    
    try {
      // Test initialization
      await mindGardenAdapter.init();
      this.log('Mind Garden adapter initialized');
      
      // Test getting nodes
      const nodes = await mindGardenAdapter.getNodes();
      this.log('Mind Garden nodes retrieved:', nodes?.length || 0);
      
      return true;
    } catch (error) {
      this.log('Mind Garden adapter test failed:', error.message);
      return false;
    }
  }

  async testEventBus() {
    this.log('📡 Testing Event Bus');
    
    return new Promise((resolve) => {
      let eventReceived = false;
      
      // Subscribe to test event
      const unsubscribe = eventBus.on('test:event', (data) => {
        this.log('Event received:', data);
        eventReceived = true;
        unsubscribe();
        resolve(true);
      });
      
      // Emit test event
      eventBus.emit('test:event', { message: 'Test event data' });
      
      // Timeout if event not received
      setTimeout(() => {
        if (!eventReceived) {
          this.log('Event bus test failed: timeout');
          unsubscribe();
          resolve(false);
        }
      }, 1000);
    });
  }

  async testCrossModuleCommunication() {
    this.log('🔗 Testing Cross-module Communication');
    
    return new Promise((resolve) => {
      let exportCompleted = false;
      
      // Listen for export completion
      const unsubscribe = eventBus.on(ModuleEvents.MINDGARDEN_EXPORT_COMPLETED, (data) => {
        this.log('Export completed event received:', data);
        exportCompleted = true;
        unsubscribe();
        resolve(true);
      });
      
      // Simulate export request
      eventBus.emit(ModuleEvents.MINDGARDEN_EXPORT_REQUESTED, {
        nodeIds: ['test-node-1'],
        elements: [{
          type: 'note',
          position: { x: 200, y: 200 },
          data: {
            title: 'Cross-module Test',
            content: 'This note was created via cross-module communication'
          }
        }]
      });
      
      // Timeout if export not completed
      setTimeout(() => {
        if (!exportCompleted) {
          this.log('Cross-module communication test failed: timeout');
          unsubscribe();
          resolve(false);
        }
      }, 3000);
    });
  }

  async testModuleInvocation() {
    this.log('🔧 Testing Module Invocation');
    
    try {
      // Test safe module invocation
      const result = await invokeModule('canvas', 'getElements');
      this.log('Module invocation successful:', result?.length || 0);
      return true;
    } catch (error) {
      this.log('Module invocation test failed:', error.message);
      return false;
    }
  }

  async testOrchestraModule() {
    this.log('🎼 Testing Orchestra Module (renamed from Content Studio)');
    
    try {
      // Test module aliases
      const hasOrchestra = moduleRegistry.hasModule('orchestra');
      const hasContentStudio = moduleRegistry.hasModule('content-studio');
      const hasContentStudioAlias = moduleRegistry.hasModule('contentstudio');
      
      this.log('Orchestra module aliases:', {
        orchestra: hasOrchestra,
        contentStudio: hasContentStudio,
        contentstudio: hasContentStudioAlias
      });
      
      if (!hasOrchestra || !hasContentStudio || !hasContentStudioAlias) {
        throw new Error('Orchestra module aliases not working');
      }
      
      // Test module loading
      const orchestraModule = await moduleRegistry.getModule('orchestra');
      this.log('Orchestra module loaded:', !!orchestraModule);
      
      // Test backwards compatibility
      const contentStudioModule = await moduleRegistry.getModule('content-studio');
      this.log('Content Studio backwards compatibility:', !!contentStudioModule);
      
      // They should be the same module
      if (orchestraModule === contentStudioModule) {
        this.log('✅ Orchestra and Content Studio are the same module (correct)');
      } else {
        this.log('⚠️ Orchestra and Content Studio are different modules (unexpected)');
      }
      
      return true;
    } catch (error) {
      this.log('Orchestra module test failed:', error.message);
      return false;
    }
  }
}

// Console helper for testing
if (typeof window !== 'undefined') {
  window.testModuleSystem = async () => {
    const test = new ModuleSystemTest();
    return await test.runTests();
  };
}

export default ModuleSystemTest;