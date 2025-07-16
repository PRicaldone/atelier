/**
 * Utility functions for testing the monitoring system
 */
import eventBus from '../modules/shared/events/EventBus.js';
import { ModuleEvents } from '../modules/shared/events/EventBus.js';
import { canvasLogger, mindGardenLogger, orchestraLogger } from '../modules/shared/monitoring/ModuleLogger.js';

/**
 * Generate test events for monitoring dashboard
 */
export const generateTestEvents = () => {
  // Canvas events
  eventBus.emit(ModuleEvents.CANVAS_ELEMENT_CREATED, {
    elementId: 'test-' + Date.now(),
    type: 'note',
    position: { x: 100, y: 100 }
  });
  
  setTimeout(() => {
    eventBus.emit(ModuleEvents.CANVAS_SELECTION_CHANGED, {
      selectedIds: ['test-' + Date.now()]
    });
  }, 500);
  
  // Mind Garden events
  setTimeout(() => {
    eventBus.emit(ModuleEvents.MINDGARDEN_NODE_CREATED, {
      nodeId: 'node-' + Date.now(),
      title: 'Test Node',
      phase: 'ideation'
    });
  }, 1000);
  
  // Cross-module events
  setTimeout(() => {
    eventBus.emit(ModuleEvents.MINDGARDEN_EXPORT_REQUESTED, {
      nodeIds: ['node-' + Date.now()],
      target: 'canvas'
    });
  }, 1500);
  
  setTimeout(() => {
    eventBus.emit(ModuleEvents.MINDGARDEN_EXPORT_COMPLETED, {
      nodeIds: ['node-' + Date.now()],
      elementIds: ['element-' + Date.now()]
    });
  }, 2000);
  
  // Orchestra events
  setTimeout(() => {
    eventBus.emit('orchestra:calendar:synced', {
      provider: 'google',
      eventsCount: 5
    });
  }, 2500);
  
  // Project events
  setTimeout(() => {
    eventBus.emit(ModuleEvents.PROJECT_SAVED, {
      projectId: 'proj-' + Date.now(),
      timestamp: Date.now()
    });
  }, 3000);
};

/**
 * Generate test errors for monitoring
 */
export const generateTestErrors = () => {
  // Canvas errors
  canvasLogger.error(new Error('Failed to save canvas state'), 'saveState', {
    elementCount: 10,
    testError: true
  });
  
  setTimeout(() => {
    canvasLogger.warning('Canvas element overlap detected', 'checkOverlap', {
      elements: ['elem1', 'elem2'],
      testWarning: true
    });
  }, 500);
  
  // Mind Garden errors
  setTimeout(() => {
    mindGardenLogger.error(new Error('Node connection failed'), 'connectNodes', {
      sourceId: 'node1',
      targetId: 'node2',
      testError: true
    });
  }, 1000);
  
  // Orchestra errors
  setTimeout(() => {
    orchestraLogger.error(new Error('Calendar sync timeout'), 'syncCalendar', {
      provider: 'google',
      timeout: 30000,
      testError: true
    });
  }, 1500);
};

/**
 * Generate continuous test activity
 */
export const startContinuousTestActivity = (intervalMs = 3000) => {
  const interval = setInterval(() => {
    // Random event generation
    const eventTypes = [
      () => eventBus.emit(ModuleEvents.CANVAS_ELEMENT_UPDATED, {
        elementId: 'elem-' + Date.now(),
        changes: { position: { x: Math.random() * 800, y: Math.random() * 600 } }
      }),
      () => eventBus.emit(ModuleEvents.MINDGARDEN_NODE_UPDATED, {
        nodeId: 'node-' + Date.now(),
        changes: { title: 'Updated Node ' + Math.random() }
      }),
      () => eventBus.emit('orchestra:task:completed', {
        taskId: 'task-' + Date.now(),
        duration: Math.random() * 1000
      }),
      () => eventBus.emit(ModuleEvents.PROJECT_CHANGED, {
        projectId: 'proj-' + Date.now(),
        field: 'name',
        value: 'Test Project ' + Math.random()
      })
    ];
    
    // Execute random event
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    randomEvent();
    
    // Occasionally generate errors
    if (Math.random() < 0.1) {
      generateTestErrors();
    }
    
  }, intervalMs);
  
  // Return stop function
  return () => clearInterval(interval);
};

/**
 * Generate module health test scenarios
 */
export const generateHealthTestScenarios = () => {
  // Healthy module activity
  setTimeout(() => {
    for (let i = 0; i < 10; i++) {
      eventBus.emit(ModuleEvents.CANVAS_ELEMENT_CREATED, {
        elementId: 'bulk-' + i,
        type: 'note'
      });
    }
  }, 100);
  
  // Warning scenario - some errors
  setTimeout(() => {
    for (let i = 0; i < 3; i++) {
      mindGardenLogger.warning('Node validation warning', 'validateNode', {
        nodeId: 'node-' + i,
        issue: 'missing title'
      });
    }
  }, 2000);
  
  // Critical scenario - many errors
  setTimeout(() => {
    for (let i = 0; i < 15; i++) {
      orchestraLogger.error(new Error('Critical system error'), 'systemCheck', {
        errorId: 'crit-' + i,
        severity: 'high'
      });
    }
  }, 4000);
};

/**
 * Clear all test data
 */
export const clearTestData = () => {
  eventBus.clear();
  // Note: ErrorTracker has its own clear method
  if (window.__errorTracker) {
    window.__errorTracker.clear();
  }
};

// Export for console debugging
if (typeof window !== 'undefined') {
  window.__monitoringTestUtils = {
    generateTestEvents,
    generateTestErrors,
    startContinuousTestActivity,
    generateHealthTestScenarios,
    clearTestData
  };
}