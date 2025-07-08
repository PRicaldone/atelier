import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DndContext, 
  useSensor, 
  useSensors, 
  PointerSensor,
  KeyboardSensor,
  DragOverlay
} from '@dnd-kit/core';
import { useGesture } from '@use-gesture/react';
import { useCanvasStore } from './store.js';
import { DraggableElement } from './components/DraggableElement.jsx';
import { CanvasToolbar } from './components/CanvasToolbar.jsx';
import { PropertiesPanel } from './components/PropertiesPanel.jsx';
import { GRID_SIZE } from './types.js';

const VisualCanvas = () => {
  const canvasRef = useRef(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  
  const {
    elements,
    selectedIds,
    viewport,
    settings,
    moveElement,
    selectElement,
    selectMultiple,
    clearSelection,
    updateViewport,
    panViewport,
    initialize
  } = useCanvasStore();

  // Initialize canvas on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Gesture handling for pan and zoom
  const bind = useGesture(
    {
      onWheel: ({ event, delta: [dx, dy], ctrlKey, metaKey }) => {
        event.preventDefault();
        
        if (ctrlKey || metaKey) {
          // Zoom with ctrl/cmd + wheel
          const zoomFactor = 1 - dy * 0.01;
          const newZoom = Math.max(0.25, Math.min(3, viewport.zoom * zoomFactor));
          updateViewport({ zoom: newZoom });
        } else {
          // Pan with wheel
          panViewport({ x: -dx, y: -dy });
        }
      },
      onDrag: ({ movement: [mx, my], buttons, memo }) => {
        // Pan with middle mouse button or space + drag
        if (buttons === 4 || memo?.isPanning) {
          panViewport({ x: mx - (memo?.lastX || 0), y: my - (memo?.lastY || 0) });
          return { isPanning: true, lastX: mx, lastY: my };
        }
        return memo;
      },
      onPinch: ({ delta: [d], origin, memo }) => {
        // Pinch to zoom (touchpad)
        const zoomFactor = 1 + d * 0.01;
        const newZoom = Math.max(0.25, Math.min(3, viewport.zoom * zoomFactor));
        updateViewport({ zoom: newZoom });
        return memo;
      }
    },
    {
      target: canvasRef,
      eventOptions: { passive: false }
    }
  );

  // Handle drag start
  const handleDragStart = useCallback((event) => {
    const element = elements.find(el => el.id === event.active.id);
    setDraggedElement(element);
  }, [elements]);

  // Handle drag end
  const handleDragEnd = useCallback((event) => {
    const { active, delta } = event;
    
    if (delta.x !== 0 || delta.y !== 0) {
      // Apply zoom factor to delta
      const scaledDelta = {
        x: delta.x / viewport.zoom,
        y: delta.y / viewport.zoom
      };
      
      if (selectedIds.includes(active.id) && selectedIds.length > 1) {
        // Move all selected elements
        selectedIds.forEach(id => moveElement(id, scaledDelta));
      } else {
        // Move only the dragged element
        moveElement(active.id, scaledDelta);
      }
    }
    
    setDraggedElement(null);
  }, [selectedIds, viewport.zoom, moveElement]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e) => {
    if (e.target === canvasRef.current) {
      clearSelection();
    }
  }, [clearSelection]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedIds.length > 0) {
            useCanvasStore.getState().deleteSelected();
            e.preventDefault();
          }
          break;
        case 'a':
          if (e.metaKey || e.ctrlKey) {
            useCanvasStore.getState().selectAll();
            e.preventDefault();
          }
          break;
        case 'c':
          if (e.metaKey || e.ctrlKey) {
            useCanvasStore.getState().copySelected();
            e.preventDefault();
          }
          break;
        case 'v':
          if (e.metaKey || e.ctrlKey) {
            useCanvasStore.getState().pasteElements();
            e.preventDefault();
          }
          break;
        case 'Escape':
          clearSelection();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, clearSelection]);

  // Grid pattern styles
  const gridStyle = {
    backgroundImage: settings.gridVisible 
      ? `radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)`
      : 'none',
    backgroundSize: `${GRID_SIZE * viewport.zoom}px ${GRID_SIZE * viewport.zoom}px`,
    backgroundPosition: `${viewport.x}px ${viewport.y}px`
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-gray-50">
      <CanvasToolbar />
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Canvas */}
        <div
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={gridStyle}
          onClick={handleCanvasClick}
          {...bind()}
        >
          {/* Viewport transform container */}
          <motion.div
            style={{
              transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
              transformOrigin: '0 0',
              width: '100%',
              height: '100%',
              position: 'relative'
            }}
            animate={{
              transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Canvas elements */}
            <AnimatePresence>
              {elements.map((element) => (
                <DraggableElement
                  key={element.id}
                  element={element}
                />
              ))}
            </AnimatePresence>

            {/* Selection box */}
            {selectionBox && (
              <motion.div
                className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-20 pointer-events-none"
                style={{
                  left: selectionBox.x,
                  top: selectionBox.y,
                  width: selectionBox.width,
                  height: selectionBox.height
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </motion.div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {draggedElement && (
            <div
              className="opacity-80 rotate-2 scale-105"
              style={{
                width: draggedElement.size.width,
                height: draggedElement.size.height
              }}
            >
              <DraggableElement element={draggedElement} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Canvas info overlay */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 space-y-1">
        <div>Elements: {elements.length}</div>
        <div>Selected: {selectedIds.length}</div>
        <div>Zoom: {Math.round(viewport.zoom * 100)}%</div>
        <div>Grid: {settings.gridVisible ? 'Visible' : 'Hidden'}</div>
        <div>Snap: {settings.snapToGrid ? 'On' : 'Off'}</div>
      </div>

      {/* Help overlay */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600">
        <div className="font-medium mb-1">Shortcuts:</div>
        <div>Drag: Move elements</div>
        <div>Cmd/Ctrl+Wheel: Zoom</div>
        <div>Wheel: Pan canvas</div>
        <div>Delete: Remove selected</div>
        <div>Cmd/Ctrl+A: Select all</div>
        <div>Cmd/Ctrl+C/V: Copy/Paste</div>
        <div>Double-click: Edit</div>
      </div>

      {/* Grid size indicator */}
      {settings.gridVisible && (
        <div className="absolute top-24 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-600">
          Grid: {GRID_SIZE}px
        </div>
      )}

      {/* Properties Panel */}
      <PropertiesPanel />
    </div>
  );
};

export default VisualCanvas;