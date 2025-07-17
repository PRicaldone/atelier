# 👨‍💻 Atelier Developer Experience Guide

> Professional development workflows for enterprise-grade module system

## 🚀 Quick Start

### Prerequisites
```bash
# Required tools
node >= 18.0.0
npm >= 9.0.0
git >= 2.30.0
```

### Development Setup
```bash
# 1. Clone and setup
git clone https://github.com/PRicaldone/atelier.git
cd atelier/webapp
npm install

# 2. Start development server
npm run dev
# ➜ Local: http://localhost:5173/

# 3. Open monitoring dashboard
open http://localhost:5173/monitoring

# 4. Check intelligence system
open http://localhost:5173/intelligence
```

---

## 🏗️ Module Development Workflow

### Creating a New Module

#### 1. **Module Structure**
```bash
webapp/src/modules/your-module/
├── YourModule.jsx          # Main component
├── store.js                # Zustand store
├── types.js                # Type definitions
├── components/             # Sub-components
│   ├── Toolbar.jsx
│   └── Sidebar.jsx
└── utils/                  # Utilities
    └── helpers.js
```

#### 2. **Module Store Pattern**
```javascript
// store.js
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useYourModuleStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        items: [],
        selectedId: null,
        isLoading: false,
        
        // Actions
        addItem: (item) => set((state) => ({
          items: [...state.items, { ...item, id: crypto.randomUUID() }]
        })),
        
        selectItem: (id) => set({ selectedId: id }),
        
        // Async actions
        loadItems: async () => {
          set({ isLoading: true });
          try {
            // Load logic here
            const items = await fetchItems();
            set({ items, isLoading: false });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        }
      }),
      {
        name: 'your-module-storage',
        partialize: (state) => ({ 
          items: state.items,
          selectedId: state.selectedId 
        })
      }
    ),
    { name: 'YourModule' }
  )
);
```

#### 3. **Module Registration**
```javascript
// moduleInit.js
import { yourModuleAdapter } from './adapters/YourModuleAdapter.js';

// Register the module
moduleRegistry.register(
  'your-module',
  async () => {
    const { useYourModuleStore } = await import('../your-module/store.js');
    return useYourModuleStore;
  },
  {
    aliases: ['legacy-name', 'alternative-name'],
    adapter: yourModuleAdapter,
    contract: IYourModule
  }
);
```

#### 4. **Module Adapter**
```javascript
// adapters/YourModuleAdapter.js
import moduleRegistry from '../registry/ModuleRegistry.js';
import { adapterLogger } from '../monitoring/ModuleLogger.js';

class YourModuleAdapter {
  constructor() {
    this.moduleNames = ['your-module'];
    this.logger = adapterLogger.child({ adapter: 'your-module' });
  }

  async addItem(data) {
    try {
      const store = await this._getStore();
      return store.addItem(data);
    } catch (error) {
      this.logger.error(error, 'addItem');
      return null;
    }
  }

  async _getStore() {
    if (!this._store) {
      this._store = await moduleRegistry.getModule('your-module');
    }
    return this._store;
  }
}

export const yourModuleAdapter = new YourModuleAdapter();
```

### Module Contract Definition
```javascript
// contracts/IYourModule.js
export const IYourModule = {
  name: 'IYourModule',
  version: '1.0.0',
  
  required: {
    // Required methods
    addItem: { params: ['data'], returns: 'string' },
    getItems: { params: [], returns: 'array' },
    selectItem: { params: ['id'], returns: 'boolean' }
  },
  
  optional: {
    // Optional methods
    exportData: { params: [], returns: 'object' },
    importData: { params: ['data'], returns: 'boolean' }
  }
};
```

---

## 🔧 Development Tools

### Console Commands Reference

#### Module Registry
```javascript
// Get all registered modules
window.__moduleRegistry.getInfo()

// Check module status
window.__moduleRegistry.hasModule('scriptorium')

// Invoke module method safely
window.__moduleRegistry.invoke('scriptorium', 'addElement', {
  type: 'note',
  position: { x: 100, y: 100 },
  data: { content: 'Test note' }
})

// Reset module (for debugging)
window.__moduleRegistry.resetModule('scriptorium')
```

#### Health Monitoring
```javascript
// Get overall system health
window.__healthCheckManager.getStatus()

// Check specific module
window.__healthCheckManager.getModuleHealth('scriptorium')

// Force module ping
window.__healthCheckManager.pingModule('scriptorium')

// Restart failed module
window.__healthCheckManager.restartModule('scriptorium')
```

#### Error Tracking
```javascript
// Get error statistics
window.__errorTracker.getStats()

// Get recent errors
window.__errorTracker.getRecentErrors()

// Get errors by module
window.__errorTracker.getErrorsByModule('scriptorium')

// Clear error history
window.__errorTracker.clear()
```

#### Integration Testing
```javascript
// Run all tests
window.__integrationTestSuite.runAll()

// Run specific test
window.__integrationTestSuite.runTest('Module Registry Validation')

// Get test results
window.__integrationTestSuite.getResults()

// Export test report
window.__integrationTestSuite.exportResults()

// Reset mock data
window.__mockAdapterFactory.resetAllStores()
```

#### Intelligence System
```javascript
// Task execution testing
window.__taskCoordinator.executeTask('Show me my Notion pages')
window.__taskCoordinator.executeTask('Create a new board with files from Google Drive')
window.__taskCoordinator.getStats()

// Connector testing
window.__claudeConnectorsAdapter.testAllConnectors()
window.__claudeConnectorsAdapter.getAllConnectorsStatus()
window.__claudeConnectorsAdapter.executeOperation('notion', 'read', {})

// Orchestrator management
window.__orchestratorAdapter.getAvailableTemplates()
window.__orchestratorAdapter.getStats()
window.__orchestratorAdapter.createWorkflow('multi-service-aggregation', 'test-workflow')

// Context management
window.__contextManager.getStats()
window.__contextManager.createSnapshot()
window.__contextManager.getContextsByScope('session')
window.__contextManager.setContext('test-key', 'test-value', 'system_state', 'task')
```

#### Alerting System
```javascript
// Send custom alert
window.__alertingSystem.sendAlert({
  type: 'custom',
  severity: 'high',
  title: 'Development Alert',
  message: 'Testing alert system'
})

// Test all notification channels
window.__alertingSystem.testAllChannels()

// Get alert history
window.__alertingSystem.getAlertHistory()

// Clear alerting data
window.__alertingSystem.clear()
```

---

## 🧪 Testing Strategies

### Integration Test Development

#### Test Structure
```javascript
// Example integration test
class YourModuleTest {
  constructor() {
    this.name = 'Your Module Validation';
    this.description = 'Tests your module core functionality';
    this.severity = TestSeverity.HIGH;
  }

  async run() {
    const startTime = performance.now();
    
    try {
      // Test module registration
      const isRegistered = moduleRegistry.hasModule('your-module');
      if (!isRegistered) {
        throw new Error('Module not registered');
      }

      // Test adapter functionality
      const adapter = getModuleAdapter('your-module');
      const result = await adapter.addItem({ test: true });
      if (!result) {
        throw new Error('Adapter method failed');
      }

      // Test cross-module communication
      eventBus.emit('your-module:test', { data: 'test' });
      
      const duration = performance.now() - startTime;
      return new TestResult(TestResult.PASS, this.name, duration);
      
    } catch (error) {
      const duration = performance.now() - startTime;
      return new TestResult(TestResult.FAIL, this.name, duration, error.message);
    }
  }
}
```

#### Adding Tests to Suite
```javascript
// IntegrationTestSuite.js
import { YourModuleTest } from './tests/YourModuleTest.js';

// Add to test suite
this.tests = [
  new ModuleRegistryTest(),
  new EventBusTest(),
  new YourModuleTest(), // Add your test here
  // ... other tests
];
```

### Performance Testing
```javascript
// Performance benchmark example
class YourModulePerformanceTest {
  async run() {
    const iterations = 1000;
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      await adapter.addItem({ iteration: i });
    }
    
    const duration = performance.now() - startTime;
    const avgTime = duration / iterations;
    
    // Fail if average time > 1ms
    const passed = avgTime < 1;
    
    return new TestResult(
      passed ? TestResult.PASS : TestResult.FAIL,
      `${this.name} (avg: ${avgTime.toFixed(2)}ms)`,
      duration,
      passed ? null : `Performance degraded: ${avgTime.toFixed(2)}ms > 1ms`
    );
  }
}
```

---

## 📊 Monitoring & Debugging

### Health Check Integration
```javascript
// Register module health check
healthCheckManager.registerModule('your-module', {
  pingInterval: 5000,
  timeoutThreshold: 10000,
  
  healthCheck: async () => {
    const store = await moduleRegistry.getModule('your-module');
    return {
      healthy: store && !store.getState().hasError,
      metrics: {
        itemCount: store?.getState().items?.length || 0,
        lastActivity: store?.getState().lastActivity
      }
    };
  },
  
  onUnhealthy: (moduleName, error) => {
    console.error(`Module ${moduleName} is unhealthy:`, error);
  },
  
  onRecovered: (moduleName) => {
    console.log(`Module ${moduleName} has recovered`);
  }
});
```

### Error Tracking Best Practices
```javascript
// Use structured logging instead of console.log
import { createModuleLogger } from '../monitoring/ModuleLogger.js';

const logger = createModuleLogger('your-module', {
  component: 'store',
  version: '1.0.0'
});

// Log different severity levels
logger.info('Module initialized', 'init', { itemCount: 0 });
logger.warning('Performance slow', 'performance', { duration: 1500 });
logger.error(new Error('Failed to save'), 'save', { itemId: '123' });

// Time operations
const timer = logger.time('Heavy operation', 'performance');
await heavyOperation();
timer.end(); // Automatically logs duration
```

### Event Bus Debugging
```javascript
// Enable event debugging
if (process.env.NODE_ENV === 'development') {
  eventBus.on('*', (eventName, data) => {
    console.debug(`[Event] ${eventName}:`, data);
  });
}

// Emit events with context
eventBus.emit('your-module:item:created', {
  itemId: '123',
  timestamp: Date.now(),
  source: 'user-action',
  metadata: { userId: 'user-456' }
});
```

---

## 🔄 Cross-Module Communication

### Event-Driven Communication
```javascript
// Producer module
export const emitExportRequest = (data) => {
  eventBus.emit('your-module:export:requested', {
    sourceModule: 'your-module',
    targetModule: 'scriptorium',
    data,
    requestId: crypto.randomUUID(),
    timestamp: Date.now()
  });
};

// Consumer module
eventBus.on('your-module:export:requested', async (event) => {
  try {
    const result = await scriptoriumAdapter.importData(event.data);
    
    eventBus.emit('your-module:export:completed', {
      requestId: event.requestId,
      success: true,
      result
    });
  } catch (error) {
    eventBus.emit('your-module:export:failed', {
      requestId: event.requestId,
      success: false,
      error: error.message
    });
  }
});
```

### Adapter-Based Communication
```javascript
// Safe cross-module data transfer
export const exportToScriptorium = async (items) => {
  try {
    const results = [];
    
    for (const item of items) {
      const elementId = await canvasAdapter.addElement('note', {
        x: item.position?.x || 100,
        y: item.position?.y || 100
      }, {
        content: item.content,
        source: 'your-module',
        originalId: item.id
      });
      
      if (elementId) {
        results.push({ itemId: item.id, elementId });
      }
    }
    
    return { success: true, results };
  } catch (error) {
    logger.error(error, 'exportToScriptorium');
    return { success: false, error: error.message };
  }
};
```

---

## 🚀 Deployment & Production

### Pre-Deployment Checklist
```bash
# 1. Run all integration tests
npm run test:integration

# 2. Check system health
curl http://localhost:5173/monitoring

# 3. Test alert system
curl -X POST http://localhost:5173/api/test-alert

# 4. Validate module registration
node scripts/validate-modules.js

# 5. Performance benchmark
npm run test:performance
```

### Production Monitoring Setup
```javascript
// Production health check configuration
const productionHealthConfig = {
  // Shorter intervals for production
  pingInterval: 3000,
  timeoutThreshold: 5000,
  
  // More aggressive restart policy
  maxRestartAttempts: 5,
  restartDelay: 1000,
  
  // Enhanced logging
  logLevel: 'info',
  enableMetrics: true,
  
  // External monitoring integration
  webhookUrl: process.env.HEALTH_WEBHOOK_URL,
  alertChannels: ['email', 'webhook', 'telegram']
};
```

### Performance Optimization Tips

1. **Lazy Loading**: Modules load only when needed
```javascript
// Use dynamic imports
const module = await import('./HeavyModule.jsx');
```

2. **State Persistence**: Optimize what gets saved
```javascript
// Only persist essential state
partialize: (state) => ({
  items: state.items,
  // Don't persist temporary UI state
  // isLoading: state.isLoading,
  // selectedId: state.selectedId
})
```

3. **Event Bus Optimization**: Avoid event spam
```javascript
// Debounce frequent events
const debouncedEmit = debounce((event, data) => {
  eventBus.emit(event, data);
}, 100);
```

---

## 📝 Code Style & Standards

### Naming Conventions

- **Modules**: PascalCase classical names (Scriptorium, Symphony, Academia)
- **Routes**: kebab-case (`/scriptorium`, `/mind-garden`)
- **Files**: PascalCase for components, camelCase for utilities
- **Events**: module:action:target format (`mindgarden:export:requested`)

### Module Standards

1. **Always use adapters** for cross-module communication
2. **Implement health checks** for all production modules
3. **Use structured logging** instead of console statements
4. **Write integration tests** for critical functionality
5. **Follow contract interfaces** for API consistency

### Git Workflow

```bash
# Feature development
git checkout -b feature/your-module
git commit -m "feat: implement YourModule with adapter pattern"

# Integration
git checkout main
git merge feature/your-module

# Save snapshot
./atelier-save.sh "Add YourModule with full integration"
```

---

## 🆘 Troubleshooting

### Common Issues

#### Module Not Loading
```javascript
// Check registration
window.__moduleRegistry.hasModule('your-module')

// Check for errors
window.__errorTracker.getErrorsByModule('your-module')

// Force reload
window.__moduleRegistry.resetModule('your-module')
```

#### Cross-Module Communication Failing
```javascript
// Check adapter status
window.__moduleRegistry.getAdapter('target-module')

// Check event bus
eventBus.getStats()

// Test adapter directly
await window.__moduleRegistry.invoke('target-module', 'testMethod')
```

#### Health Checks Failing
```javascript
// Check health status
window.__healthCheckManager.getModuleHealth('your-module')

// Manual ping
await window.__healthCheckManager.pingModule('your-module')

// Restart module
window.__healthCheckManager.restartModule('your-module')
```

### Recovery Procedures

#### System Recovery
```bash
# 1. Restore from snapshot
./atelier-save.sh --restore snapshot_YYYY-MM-DD_HH-MM-SS

# 2. Or reset to last known good commit
git reset --hard HEAD~1

# 3. Clear browser storage
localStorage.clear()
```

#### Module Recovery
```javascript
// Emergency module reset
window.__moduleRegistry.resetModule('problem-module')
window.__healthCheckManager.restartModule('problem-module')

// Clear module storage
localStorage.removeItem('problem-module-storage')
```

---

## 📞 Support Resources

- **Architecture Documentation**: `/docs/architecture/README.md`
- **API Reference**: `/docs/api/`
- **Live Monitoring**: `http://localhost:5173/monitoring`
- **Test Dashboard**: `http://localhost:5173/tests`
- **Alert Configuration**: `http://localhost:5173/alerts`

---

*Happy coding! 🚀*  
*Atelier Development Team*