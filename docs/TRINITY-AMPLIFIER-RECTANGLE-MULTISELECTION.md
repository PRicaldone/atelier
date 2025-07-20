# ▭ RECTANGLE MULTI-SELECTION - TRINITY AMPLIFIER PROTOCOL

> **"Ultra-fast professional multi-selection for complex creative workflows. The backbone of pro creative tools."**

**Status**: 🔒 **MANDATORY TRINITY AMPLIFIER**  
**Version**: 1.0  
**Authority**: User Strategic Vision + Pro Canvas Best Practices  
**Reference**: Trinity+Gesture Manifesto v1.2  

---

## 🎯 **STRATEGIC OBJECTIVE**

Implementare il sistema di selezione multipla professionale che caratterizza Figma, Muse, FigJam, Miro - permettendo workflow creativi ultra-rapidi e operazioni batch sofisticate.

**"La selezione rettangolare è il gesto più naturale e potente per gestire board complesse. Senza di essa, Atelier rimane un tool amateur."**

---

## 📋 **RECTANGLE SELECTION STANDARD PROTOCOL**

### **1. Marquee Selection Behavior**
- ✅ **Drag su area vuota**: Attiva rectangle selection mode
- ✅ **Visual feedback**: Rettangolo trasparente in tempo reale
- ✅ **Element highlighting**: Highlight elementi "toccati" dal rectangle
- ✅ **Gesture integration**: Pattern nativo nel gesture system
- ✅ **Performance**: 60fps sostenuto durante drag

### **2. Selection Logic**
```javascript
// Selection Modes
const selectionModes = {
  INTERSECT: 'intersect', // Element touched by rectangle (default)
  CONTAIN: 'contain',     // Element fully inside rectangle (Shift+drag)
  CENTER: 'center'        // Element center inside rectangle (Alt+drag)
};

// Selection Algorithm
const calculateRectangleSelection = (startPoint, currentPoint, mode = 'intersect') => {
  const rect = {
    x: Math.min(startPoint.x, currentPoint.x),
    y: Math.min(startPoint.y, currentPoint.y),
    width: Math.abs(currentPoint.x - startPoint.x),
    height: Math.abs(currentPoint.y - startPoint.y)
  };
  
  return elements.filter(element => {
    switch(mode) {
      case 'intersect':
        return rectIntersectsElement(rect, element);
      case 'contain':
        return rectContainsElement(rect, element);
      case 'center':
        return rectContainsElementCenter(rect, element);
      default:
        return rectIntersectsElement(rect, element);
    }
  });
};
```

### **3. Visual Feedback System**
```css
/* Marquee Selection Rectangle */
.marquee-rectangle {
  position: absolute;
  border: 2px solid #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
  pointer-events: none;
  z-index: 9999;
  animation: marquee-pulse 1s ease-in-out infinite alternate;
}

@keyframes marquee-pulse {
  from { 
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
  }
  to { 
    border-color: #1d4ed8;
    background: rgba(59, 130, 246, 0.15);
  }
}

/* Element Highlighting During Selection */
.element-highlighted {
  box-shadow: 0 0 0 2px #3b82f6, 0 0 8px rgba(59, 130, 246, 0.3);
  z-index: 100;
  transition: box-shadow 0.1s ease;
}

/* Selected Elements */
.element-selected-multi {
  box-shadow: 0 0 0 2px #10b981, 0 0 12px rgba(16, 185, 129, 0.4);
  z-index: 200;
}
```

---

## 🎮 **GESTURE INTEGRATION**

### **Core Gesture Patterns**
```javascript
// Rectangle Selection Gestures
const rectangleGestures = {
  'drag-empty-canvas': {
    trigger: 'pointerdown on empty area',
    action: startRectangleSelection,
    duration: 'continuous',
    feedback: 'visual-rectangle',
    performance: '60fps-required'
  },
  
  'shift-drag-canvas': {
    trigger: 'shift + drag empty area',
    action: startContainSelection,
    mode: 'contain',
    feedback: 'different-border-style'
  },
  
  'alt-drag-canvas': {
    trigger: 'alt + drag empty area', 
    action: startCenterSelection,
    mode: 'center',
    feedback: 'center-point-indicators'
  }
};

// Post-Selection Gestures
const multiSelectionGestures = {
  'double-tap-selection': {
    trigger: 'double-tap on selected group',
    action: showGroupRadialMenu,
    options: ['Group', 'Duplicate', 'Delete', 'Move to Board', 'Lock']
  },
  
  'long-press-selection': {
    trigger: 'long-press on selected group',
    duration: 500,
    action: showAdvancedGroupActions,
    options: ['Smart Group', 'Apply Template', 'Export Selection', 'AI Analysis']
  }
};
```

### **Gesture State Management**
```javascript
const rectangleSelectionState = {
  isActive: false,
  startPoint: null,
  currentPoint: null,
  mode: 'intersect',
  selectedIds: [],
  highlightedIds: [],
  
  start: (point, mode = 'intersect') => {
    rectangleSelectionState.isActive = true;
    rectangleSelectionState.startPoint = point;
    rectangleSelectionState.currentPoint = point;
    rectangleSelectionState.mode = mode;
    
    // Clear previous selection if no modifier key
    if (!event.ctrlKey && !event.metaKey) {
      rectangleSelectionState.selectedIds = [];
    }
  },
  
  update: (point) => {
    if (!rectangleSelectionState.isActive) return;
    
    rectangleSelectionState.currentPoint = point;
    
    // Calculate and highlight elements in real-time
    const highlighted = calculateRectangleSelection(
      rectangleSelectionState.startPoint,
      point,
      rectangleSelectionState.mode
    );
    
    rectangleSelectionState.highlightedIds = highlighted.map(el => el.id);
  },
  
  end: () => {
    if (!rectangleSelectionState.isActive) return;
    
    // Commit selection
    rectangleSelectionState.selectedIds = [
      ...rectangleSelectionState.selectedIds,
      ...rectangleSelectionState.highlightedIds
    ];
    
    // Update store
    selectMultiple(rectangleSelectionState.selectedIds);
    
    // Reset state
    rectangleSelectionState.isActive = false;
    rectangleSelectionState.highlightedIds = [];
  }
};
```

---

## 🚀 **ADVANCED SELECTION FEATURES**

### **Smart Selection Modes**
```javascript
// Context-Aware Selection
const smartSelectionModes = {
  // Select only same type
  'type-filter': (baseElement, candidates) => {
    return candidates.filter(el => el.type === baseElement.type);
  },
  
  // Select by proximity clustering
  'proximity-cluster': (elements, maxDistance = 100) => {
    return findElementClusters(elements, maxDistance);
  },
  
  // Select by visual similarity (color, size)
  'visual-similarity': (baseElement, candidates) => {
    return candidates.filter(el => 
      isSimilarColor(el.data.backgroundColor, baseElement.data.backgroundColor) ||
      isSimilarSize(el.size, baseElement.size)
    );
  }
};

// AI-Enhanced Selection
const aiSelectionSuggestions = async (selectedElements) => {
  const analysis = await analyzeElementsForGrouping(selectedElements);
  
  return {
    suggestedGroups: analysis.clusters,
    recommendedActions: analysis.actions,
    optimizationTips: analysis.optimizations
  };
};
```

### **Batch Operations**
```javascript
// Multi-Element Operations
const batchOperations = {
  group: (selectedIds) => {
    const groupElement = createGroupFromSelection(selectedIds);
    addElement(groupElement);
    clearSelection();
    selectElement(groupElement.id);
  },
  
  duplicate: (selectedIds) => {
    const elements = getElementsById(selectedIds);
    const duplicated = elements.map(el => duplicateElement(el, { x: 20, y: 20 }));
    selectMultiple(duplicated.map(el => el.id));
  },
  
  alignHorizontal: (selectedIds) => {
    const elements = getElementsById(selectedIds);
    const avgY = elements.reduce((sum, el) => sum + el.position.y, 0) / elements.length;
    
    elements.forEach(el => {
      updateElement(el.id, { position: { ...el.position, y: avgY } });
    });
  },
  
  alignVertical: (selectedIds) => {
    const elements = getElementsById(selectedIds);
    const avgX = elements.reduce((sum, el) => sum + el.position.x, 0) / elements.length;
    
    elements.forEach(el => {
      updateElement(el.id, { position: { ...el.position, x: avgX } });
    });
  },
  
  distributeHorizontal: (selectedIds) => {
    const elements = getElementsById(selectedIds).sort((a, b) => a.position.x - b.position.x);
    const totalWidth = elements[elements.length - 1].position.x - elements[0].position.x;
    const spacing = totalWidth / (elements.length - 1);
    
    elements.forEach((el, index) => {
      if (index > 0 && index < elements.length - 1) {
        const newX = elements[0].position.x + (spacing * index);
        updateElement(el.id, { position: { ...el.position, x: newX } });
      }
    });
  }
};
```

### **Radial Menu Integration**
```javascript
// Context-Sensitive Radial Menu
const multiSelectionRadialMenu = {
  position: 'selection-center',
  items: [
    {
      id: 'group',
      label: 'Group',
      icon: 'package',
      action: () => batchOperations.group(selectedIds),
      gesture: 'drag-up'
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: 'copy',
      action: () => batchOperations.duplicate(selectedIds),
      gesture: 'drag-right'
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'trash-2',
      action: () => deleteSelected(),
      gesture: 'drag-down',
      destructive: true
    },
    {
      id: 'align',
      label: 'Align',
      icon: 'align-center',
      submenu: [
        { label: 'Horizontal', action: () => batchOperations.alignHorizontal(selectedIds) },
        { label: 'Vertical', action: () => batchOperations.alignVertical(selectedIds) },
        { label: 'Distribute H', action: () => batchOperations.distributeHorizontal(selectedIds) }
      ],
      gesture: 'drag-left'
    },
    {
      id: 'style',
      label: 'Style',
      icon: 'palette',
      action: () => showBatchStyleEditor(selectedIds),
      gesture: 'drag-up-right'
    }
  ]
};
```

---

## 🔧 **TRINITY SYSTEM INTEGRATION**

### **Drag System Compatibility**
```javascript
// Multi-Element Drag Handler
const handleMultiElementDrag = (draggedIds, delta) => {
  // Use existing 60fps drag system
  draggedIds.forEach(id => {
    moveElement(id, delta);
  });
  
  // Maintain relative positions
  const baseElement = getElementById(draggedIds[0]);
  const basePosition = baseElement.position;
  
  // Update ghost overlay for all elements
  updateMultiDragGhost(draggedIds, delta);
};

// Conflict Resolution
const resolveDragConflicts = (selectedIds, dragStartPoint) => {
  // If clicking on selected element → multi-drag
  // If clicking on unselected element → single drag + clear selection
  // If rectangle selecting → prevent element drag
  
  const clickedElement = getElementAtPoint(dragStartPoint);
  
  if (clickedElement && selectedIds.includes(clickedElement.id)) {
    return { mode: 'multi-drag', elements: selectedIds };
  } else if (clickedElement) {
    clearSelection();
    selectElement(clickedElement.id);
    return { mode: 'single-drag', elements: [clickedElement.id] };
  } else {
    return { mode: 'rectangle-select', elements: [] };
  }
};
```

### **TreeView Multi-Selection Sync**
```javascript
// Bi-directional TreeView Sync
const syncTreeViewMultiSelection = (selectedIds) => {
  // Expand tree to show all selected elements
  selectedIds.forEach(id => {
    const element = getElementById(id);
    expandTreePathToElement(element);
  });
  
  // Highlight all selected nodes
  updateTreeNodeSelection(selectedIds);
  
  // Show selection count in tree header
  updateTreeSelectionCount(selectedIds.length);
};

// Tree → Canvas Selection
const handleTreeMultiSelection = (nodeIds) => {
  selectMultiple(nodeIds);
  
  // Center canvas view on selection if needed
  const bounds = calculateElementsBounds(getElementsById(nodeIds));
  if (bounds && !isViewportContaining(bounds)) {
    animateViewportToBounds(bounds);
  }
};
```

---

## 📊 **PERFORMANCE STANDARDS**

### **60fps Rectangle Selection**
- **Rectangle Rendering**: 60fps durante drag completo
- **Element Highlighting**: <16ms per update cycle
- **Selection Calculation**: <5ms per frame per 100 elementi
- **Visual Feedback**: Zero lag percettibile

### **Memory Efficiency**
- **Selection State**: <1KB overhead per 1000 elementi
- **Visual Effects**: GPU-accelerated CSS transforms
- **Event Handling**: Debounced per performance ottimale

### **Responsiveness Standards**
```javascript
// Performance Monitoring
const selectionPerformance = {
  maxElementsForRealTime: 500, // Real-time highlighting
  batchThreshold: 1000,        // Switch to batch processing
  frameBudget: 16,            // Max ms per frame (60fps)
  
  monitor: (startTime, elementCount) => {
    const duration = performance.now() - startTime;
    
    if (duration > 16) {
      console.warn(`Selection performance warning: ${duration}ms for ${elementCount} elements`);
      // Auto-optimize for next operation
      optimizeSelectionPerformance(elementCount);
    }
  }
};
```

---

## 🎯 **STRATEGIC DIFFERENTIATION**

### **Atelier Multi-Selection vs. Competition**

| Feature | Atelier | Figma | Miro | FigJam | Milanote |
|---------|---------|-------|------|--------|----------|
| Marquee Selection | ✅ 60fps | ✅ 60fps | ✅ 60fps | ✅ 60fps | ❌ None |
| Gesture Integration | ✅ Native | ❌ | ❌ | ❌ | ❌ |
| AI Group Suggestions | ✅ Smart | ❌ | 🟡 Basic | ❌ | ❌ |
| TreeView Sync | ✅ Real-time | ❌ | ❌ | ❌ | ❌ |
| Radial Menu | ✅ Context | ❌ | ❌ | ❌ | ❌ |
| Batch Operations | ✅ Advanced | ✅ Basic | ✅ Basic | ✅ Basic | ❌ |
| Selection Modes | ✅ 3 modes | ✅ 2 modes | ✅ 1 mode | ✅ 1 mode | ❌ |

---

## 💎 **PHILOSOPHY ALIGNMENT**

**"We build for hands, not just minds"**
- Rectangle selection è il gesto più naturale per multi-selection

**"Performance is identity"**  
- 60fps marquee selection senza compromessi

**"Every pixel has purpose"**
- Visual feedback immediato e significativo

**"Trinity amplification"**
- Potenzia Drag + TreeView + Gesture senza conflitti

---

## 🚀 **IMPLEMENTATION ROADMAP**

### **Phase 1: Core Marquee** (Sprint 1)
1. Implement basic rectangle selection on empty canvas
2. Add visual feedback rectangle with 60fps performance
3. Basic element intersection calculation

### **Phase 2: Gesture Integration** (Sprint 2)
1. Add modifier key support (Shift, Alt)
2. Implement selection mode switching
3. Gesture pattern validation

### **Phase 3: Batch Operations** (Sprint 3)
1. Multi-element drag and drop
2. Radial menu for group actions
3. Basic batch operations (group, duplicate, delete)

### **Phase 4: Advanced Features** (Sprint 4)
1. AI-powered grouping suggestions
2. Advanced alignment and distribution
3. Performance optimization for large selections

### **Phase 5: Pro Features** (Sprint 5)
1. Selection history and undo
2. Custom selection filters
3. Advanced batch styling tools

---

## 🔍 **DEBUG AND TESTING**

### **Selection Testing Utils**
```javascript
// Debug Selection Performance
window.__debugSelection = {
  logPerformance: true,
  highlightBounds: false,
  showSelectionState: () => rectangleSelectionState,
  testSelectionWith: (elementCount) => {
    // Generate test elements and measure selection performance
    const testElements = generateTestElements(elementCount);
    const startTime = performance.now();
    const selected = calculateRectangleSelection(
      { x: 0, y: 0 }, 
      { x: 1000, y: 1000 }
    );
    const duration = performance.now() - startTime;
    console.log(`Selected ${selected.length}/${elementCount} in ${duration}ms`);
  }
};
```

---

**▭ "Rectangle selection = Professional workflow speed. Without it, you're still clicking one by one like an amateur."**

---

*Document Version: 1.0*  
*Last Updated: 20 July 2025*  
*Status: 🔒 **ACTIVE TRINITY AMPLIFIER #4***