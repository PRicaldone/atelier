import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DndContext, 
  useSensor, 
  useSensors, 
  PointerSensor,
  KeyboardSensor,
  DragOverlay,
  useDraggable
} from '@dnd-kit/core';
import { useCanvasStore } from './store.js';
import { CanvasToolbar } from './components/CanvasToolbar.jsx';
import { PropertiesPanel } from './components/PropertiesPanel.jsx';
import { DraggableElement } from './components/DraggableElement.jsx';
import { BreadcrumbNavigation } from './components/BreadcrumbNavigation.jsx';
import { GRID_SIZE } from './types.js';

const VisualCanvas = () => {
  console.log('VisualCanvas rendering - full functionality without gestures');
  
  const canvasRef = useRef(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const [selectionStart, setSelectionStart] = useState(null);
  
  const {
    elements,
    selectedIds,
    viewport,
    settings,
    moveElement,
    clearSelection,
    selectMultiple,
    deleteSelected,
    copySelected,
    pasteElements,
    selectAll,
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
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Handle drag start
  const handleDragStart = useCallback((event) => {
    const element = elements.find(el => el.id === event.active.id);
    if (element) {
      setDraggedElement(element);
      
      // Calculate mouse offset relative to element's top-left corner
      const rect = event.active.rect.current.translated;
      if (rect) {
        const mouseX = event.activatorEvent.clientX;
        const mouseY = event.activatorEvent.clientY;
        const elementScreenX = rect.left;
        const elementScreenY = rect.top;
        
        setDragOffset({
          x: mouseX - elementScreenX,
          y: mouseY - elementScreenY
        });
      }
    }
  }, [elements]);

  // Handle drag end
  const handleDragEnd = useCallback((event) => {
    const { active, delta, activatorEvent } = event;
    
    if (delta.x !== 0 || delta.y !== 0) {
      const scaledDelta = {
        x: delta.x / viewport.zoom,
        y: delta.y / viewport.zoom
      };
      
      // Apply snap-to-grid if enabled and not holding shift
      const shiftHeld = activatorEvent?.shiftKey;
      
      if (selectedIds.includes(active.id) && selectedIds.length > 1) {
        // Move all selected elements
        selectedIds.forEach(id => {
          const element = elements.find(el => el.id === id);
          if (element && settings.snapToGrid && !shiftHeld) {
            // Calculate final position with snap
            const finalPosition = {
              x: Math.round((element.position.x + scaledDelta.x) / GRID_SIZE) * GRID_SIZE,
              y: Math.round((element.position.y + scaledDelta.y) / GRID_SIZE) * GRID_SIZE
            };
            // Calculate actual delta to snap position
            const snapDelta = {
              x: finalPosition.x - element.position.x,
              y: finalPosition.y - element.position.y
            };
            moveElement(id, snapDelta);
          } else {
            moveElement(id, scaledDelta);
          }
        });
      } else {
        // Move only the dragged element
        const element = elements.find(el => el.id === active.id);
        if (element && settings.snapToGrid && !shiftHeld) {
          // Calculate final position with snap
          const finalPosition = {
            x: Math.round((element.position.x + scaledDelta.x) / GRID_SIZE) * GRID_SIZE,
            y: Math.round((element.position.y + scaledDelta.y) / GRID_SIZE) * GRID_SIZE
          };
          // Calculate actual delta to snap position
          const snapDelta = {
            x: finalPosition.x - element.position.x,
            y: finalPosition.y - element.position.y
          };
          moveElement(active.id, snapDelta);
        } else {
          moveElement(active.id, scaledDelta);
        }
      }
    }
    
    setDraggedElement(null);
    setDragOffset({ x: 0, y: 0 });
  }, [selectedIds, viewport.zoom, moveElement, elements, settings.snapToGrid]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e) => {
    if (e.target === canvasRef.current) {
      clearSelection();
    }
  }, [clearSelection]);

  // Handle mouse down for selection box
  const handleMouseDown = useCallback((e) => {
    if (e.target === canvasRef.current && !e.metaKey && !e.ctrlKey) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / viewport.zoom;
      const y = (e.clientY - rect.top) / viewport.zoom;
      
      setIsSelecting(true);
      setSelectionStart({ x, y });
      setSelectionBox({ x, y, width: 0, height: 0 });
    }
  }, [viewport.zoom]);

  // Handle mouse move for selection box
  const handleMouseMove = useCallback((e) => {
    if (isSelecting && selectionStart && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const currentX = (e.clientX - rect.left) / viewport.zoom;
      const currentY = (e.clientY - rect.top) / viewport.zoom;
      
      const box = {
        x: Math.min(selectionStart.x, currentX),
        y: Math.min(selectionStart.y, currentY),
        width: Math.abs(currentX - selectionStart.x),
        height: Math.abs(currentY - selectionStart.y)
      };
      
      setSelectionBox(box);
    }
  }, [isSelecting, selectionStart, viewport.zoom]);

  // Handle mouse up for selection box
  const handleMouseUp = useCallback(() => {
    if (isSelecting && selectionBox) {
      // Find elements within selection box
      const selectedElements = elements.filter(element => {
        const elementRight = element.position.x + element.size.width;
        const elementBottom = element.position.y + element.size.height;
        const boxRight = selectionBox.x + selectionBox.width;
        const boxBottom = selectionBox.y + selectionBox.height;
        
        return (
          element.position.x < boxRight &&
          elementRight > selectionBox.x &&
          element.position.y < boxBottom &&
          elementBottom > selectionBox.y
        );
      });
      
      if (selectedElements.length > 0) {
        selectMultiple(selectedElements.map(el => el.id));
      }
    }
    
    setIsSelecting(false);
    setSelectionBox(null);
    setSelectionStart(null);
  }, [isSelecting, selectionBox, elements, selectMultiple]);

  // Add mouse event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedIds.length > 0) {
            deleteSelected();
            e.preventDefault();
          }
          break;
        case 'a':
          if (e.metaKey || e.ctrlKey) {
            selectAll();
            e.preventDefault();
          }
          break;
        case 'c':
          if (e.metaKey || e.ctrlKey) {
            if (selectedIds.length > 0) {
              copySelected();
              e.preventDefault();
            }
          }
          break;
        case 'v':
          if (e.metaKey || e.ctrlKey) {
            pasteElements();
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
  }, [selectedIds, deleteSelected, selectAll, copySelected, pasteElements, clearSelection]);
  
  // Grid pattern styles
  const gridStyle = {
    backgroundImage: settings.gridVisible 
      ? `radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)`
      : 'none',
    backgroundSize: `${GRID_SIZE * viewport.zoom}px ${GRID_SIZE * viewport.zoom}px`,
    backgroundPosition: `0px 0px`
  };

  return (
    <div className="fixed inset-0 bg-gray-50" style={{ top: '64px', left: '240px' }}>
      <CanvasToolbar />
      <BreadcrumbNavigation />
      
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
        >
          {/* Viewport transform container */}
          <motion.div
            style={{
              transform: `translate(0px, 0px) scale(${viewport.zoom})`,
              transformOrigin: '0 0',
              width: '100%',
              height: '100%',
              position: 'relative'
            }}
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
        <DragOverlay 
          modifiers={[
            (args) => {
              // Apply the captured offset to keep element under mouse
              return {
                ...args,
                transform: {
                  ...args.transform,
                  x: args.transform.x - dragOffset.x + (draggedElement?.size.width || 0) / 2,
                  y: args.transform.y - dragOffset.y + (draggedElement?.size.height || 0) / 2
                }
              };
            }
          ]}
        >
          {draggedElement && (
            <div
              className="opacity-80"
              style={{
                width: draggedElement.size.width,
                height: draggedElement.size.height,
                cursor: 'grabbing'
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
        <div>Shift+drag: Ignore snap to grid</div>
        <div>Double-click board: Enter board</div>
        <div>Ctrl/Cmd+click: Multi-select</div>
        <div>Drag area: Select multiple</div>
        <div>Delete: Remove selected</div>
        <div>Ctrl/Cmd+A: Select all</div>
        <div>Ctrl/Cmd+C/V: Copy/Paste</div>
        <div>Escape: Clear selection</div>
      </div>

      {/* Properties Panel */}
      <PropertiesPanel />
    </div>
  );
};

export default VisualCanvas;