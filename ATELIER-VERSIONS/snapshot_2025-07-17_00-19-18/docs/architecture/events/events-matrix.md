# 📡 Event Documentation Matrix

> **Status**: Active | **Last Updated**: 2025-07-16 | **Version**: 1.0

## 🎯 Overview

This document provides a comprehensive view of all cross-module events in the Atelier system. It serves as the **single source of truth** for event-driven communication between modules.

## 📋 Event Categories

### 🎨 Canvas Events
| Event | Emitter | Listener(s) | Payload | Purpose | Frequency | Criticality |
|-------|---------|-------------|---------|---------|-----------|-------------|
| `canvas:element:created` | Canvas Module | Analytics, History | `{ elementId, type, position, data }` | Track element creation | Per element | Medium |
| `canvas:element:updated` | Canvas Module | Auto-save, History | `{ elementId, updates, timestamp }` | Track element changes | Per edit | Medium |
| `canvas:element:deleted` | Canvas Module | History, Cleanup | `{ elementId, type, timestamp }` | Track element deletion | Per deletion | Medium |
| `canvas:board:navigated` | Canvas Module | Navigation, History | `{ boardId, fromBoard, timestamp }` | Track board navigation | Per navigation | Low |
| `canvas:selection:changed` | Canvas Module | Properties Panel, Toolbar | `{ selectedIds, previousIds }` | Update UI state | Per selection | Low |

### 🧠 Mind Garden Events
| Event | Emitter | Listener(s) | Payload | Purpose | Frequency | Criticality |
|-------|---------|-------------|---------|---------|-----------|-------------|
| `mindgarden:node:created` | Mind Garden | Analytics, Export | `{ nodeId, type, position, data }` | Track node creation | Per node | Medium |
| `mindgarden:node:updated` | Mind Garden | Auto-save, Export | `{ nodeId, updates, timestamp }` | Track node changes | Per edit | Medium |
| `mindgarden:node:deleted` | Mind Garden | Cleanup, Export | `{ nodeId, type, timestamp }` | Track node deletion | Per deletion | Medium |
| `mindgarden:export:requested` | Mind Garden UI | Module Init Handler | `{ nodeIds, elements }` | Request export to Canvas | Per export | **HIGH** |
| `mindgarden:export:completed` | Module Init Handler | Mind Garden UI | `{ nodeIds, elementIds, success }` | Confirm export completion | Per export | **HIGH** |

### 🔄 Cross-Module Events
| Event | Emitter | Listener(s) | Payload | Purpose | Frequency | Criticality |
|-------|---------|-------------|---------|---------|-----------|-------------|
| `module:initialized` | Module Init | All Modules | `{ modules: string[] }` | Signal system ready | Once per app load | **HIGH** |
| `module:error` | Any Module | Error Handler | `{ error, module, action }` | Report module errors | Per error | **HIGH** |
| `module:cross:sync` | Any Module | Related Modules | `{ fromModule, toModule, data }` | Sync data between modules | Per sync | Medium |

### 📊 Project Events
| Event | Emitter | Listener(s) | Payload | Purpose | Frequency | Criticality |
|-------|---------|-------------|---------|---------|-----------|-------------|
| `project:changed` | Project Store | All Modules | `{ projectId, previousId }` | Signal project switch | Per project switch | **HIGH** |
| `project:saved` | Project Store | UI, Notifications | `{ projectId, timestamp }` | Confirm project save | Per save | Medium |
| `project:loaded` | Project Store | All Modules | `{ projectId, data }` | Signal project load | Per load | **HIGH** |

## 🔍 Event Flow Diagrams

### Mind Garden → Canvas Export Flow
```
[Mind Garden UI] 
    ↓ (User clicks export)
    emits: mindgarden:export:requested
    ↓
[Module Init Handler]
    ↓ (Processes export)
    calls: mindGardenAdapter.exportNodesToCanvas()
    ↓
[Canvas Adapter]
    ↓ (Adds elements)
    calls: canvasAdapter.addElement()
    ↓
[Canvas Store]
    ↓ (Elements added)
    emits: canvas:element:created (for each element)
    ↓
[Module Init Handler]
    ↓ (Export complete)
    emits: mindgarden:export:completed
    ↓
[Mind Garden UI] (Updates UI state)
```

### Module Error Handling Flow
```
[Any Module]
    ↓ (Error occurs)
    emits: module:error
    ↓
[Error Handler]
    ↓ (Logs error)
    calls: ErrorTracker.logError()
    ↓ (If critical)
    emits: system:critical:error
    ↓
[Error Dashboard] (Shows error)
```

## 🚨 Critical Events

### High Priority Events (System Breaking)
- `module:initialized` - System won't work without this
- `mindgarden:export:requested` - Core workflow
- `mindgarden:export:completed` - Core workflow  
- `module:error` - Error handling
- `project:changed` - Data integrity
- `project:loaded` - Data integrity

### Medium Priority Events (Feature Breaking)
- `canvas:element:*` - Canvas functionality
- `mindgarden:node:*` - Mind Garden functionality
- `module:cross:sync` - Data synchronization

### Low Priority Events (UI/UX)
- `canvas:selection:changed` - UI state
- `canvas:board:navigated` - Navigation tracking

## 📊 Event Monitoring

### Performance Metrics
- **Average Response Time**: < 100ms for critical events
- **Event Volume**: Monitor for unusual spikes
- **Error Rate**: < 1% for critical events

### Debugging
```javascript
// Enable event debugging
eventBus.on('*', (event, data) => {
  console.log(`[EventDebug] ${event}:`, data);
});

// Get event history
const history = eventBus.getHistory();
console.log('Last 100 events:', history);
```

## 🔧 Best Practices

### Event Naming
- Use namespace format: `module:entity:action`
- Examples: `canvas:element:created`, `mindgarden:node:updated`
- Avoid generic names like `update` or `change`

### Payload Structure
```typescript
interface EventPayload {
  // Required fields
  timestamp: number;
  source: string;
  
  // Event-specific data
  [key: string]: any;
  
  // Optional metadata
  metadata?: {
    userId?: string;
    sessionId?: string;
    version?: string;
  };
}
```

### Error Handling
```javascript
// Always wrap event handlers
eventBus.on('my:event', (data) => {
  try {
    // Handle event
  } catch (error) {
    eventBus.emit('module:error', {
      error: error.message,
      module: 'my-module',
      action: 'handle-my-event',
      data
    });
  }
});
```

## 🔄 Maintenance

### Adding New Events
1. Add to `ModuleEvents` enum in `EventBus.js`
2. Update this matrix with full documentation
3. Add to monitoring dashboard
4. Write integration tests

### Removing Events
1. Check this matrix for all listeners
2. Create deprecation notice (2 release cycles)
3. Remove from matrix
4. Update tests

### Modifying Events
1. Consider backwards compatibility
2. Use event versioning if needed
3. Update all listeners
4. Update this matrix

## 🧪 Testing Events

### Unit Tests
```javascript
// Test event emission
it('should emit element:created event', () => {
  const spy = jest.spyOn(eventBus, 'emit');
  canvas.addElement('note', {x: 0, y: 0});
  expect(spy).toHaveBeenCalledWith('canvas:element:created', {
    elementId: expect.any(String),
    type: 'note',
    position: {x: 0, y: 0}
  });
});
```

### Integration Tests
```javascript
// Test event flow
it('should complete Mind Garden export flow', async () => {
  const exportPromise = waitForEvent('mindgarden:export:completed');
  eventBus.emit('mindgarden:export:requested', { nodeIds: ['test'] });
  const result = await exportPromise;
  expect(result.success).toBe(true);
});
```

---

## 📝 Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-07-16 | Initial event matrix documentation |

---

**Next Review**: 2025-08-01  
**Maintainer**: Development Team  
**Stakeholders**: All module developers