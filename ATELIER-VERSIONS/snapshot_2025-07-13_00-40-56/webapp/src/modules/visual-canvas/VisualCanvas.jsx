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
import { useUnifiedStore, useCanvasState } from '../../store/unifiedStore.js';
import { CanvasToolbar } from './components/CanvasToolbar.jsx';
import { PropertiesPanel } from './components/PropertiesPanel.jsx';
import { DraggableElement } from './components/DraggableElement.jsx';
import TreeViewSidebar from './components/TreeViewSidebar.jsx';
import HoudiniTreeView from './components/HoudiniTreeView.jsx';
import PathBreadcrumb from './components/PathBreadcrumb.jsx';
import { GRID_SIZE } from './types.js';

const VisualCanvas = () => {
  console.log('VisualCanvas rendering - full functionality without gestures');
  
  const canvasRef = useRef(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const [selectionStart, setSelectionStart] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomStart, setZoomStart] = useState(null);
  const [initialZoom, setInitialZoom] = useState(1);
  
  // Unified Store integration
  const {
    navigateToModule,
    analyzeCanvasContext
  } = useUnifiedStore();
  
  const unifiedCanvas = useCanvasState();
  
  // Legacy Canvas Store (gradually migrate to unified)
  const {
    elements,
    selectedIds,
    viewport,
    settings,
    moveElement,
    clearSelection,
    selectElement,
    selectMultiple,
    deleteSelected,
    copySelected,
    pasteElements,
    selectAll,
    centerViewport,
    panViewport,
    updateViewport,
    initialize,
    addElement,
    addCompleteElement
  } = useCanvasStore();

  // Initialize canvas on mount
  useEffect(() => {
    initialize();
    // Set current module in unified store
    navigateToModule('canvas', { source: 'visual-canvas-init' });
  }, [initialize, navigateToModule]);
  
  // Trigger AI analysis when elements change
  useEffect(() => {
    if (elements.length > 0) {
      analyzeCanvasContext();
    }
  }, [elements.length]); // Removed analyzeCanvasContext from deps to prevent loop

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
    const { active } = event;
    console.log('🎨 handleDragStart called:', active.id);
    
    // Check if dragging from tree
    if (active.data.current?.source === 'tree') {
      const treeElement = active.data.current.element;
      setDraggedElement(treeElement);
      setDragOffset({ x: 0, y: 0 });
      return;
    }
    
    // Regular canvas element drag
    const element = elements.find(el => el.id === active.id);
    if (element) {
      console.log('🎨 Setting draggedElement:', element);
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
    const { active, delta, activatorEvent, over } = event;
    
    console.log('🎯 handleDragEnd called:', {
      activeId: active?.id,
      overId: over?.id,
      overType: over?.data?.current?.type,
      draggedElement: draggedElement,
      draggedElementId: draggedElement?.id
    });
    
    // Check if dropping on tree drop zone
    if (over && over.data.current?.type === 'tree-drop-zone') {
      const targetBoardId = over.data.current.boardId;
      
      console.log('📦 Dropping element', draggedElement?.id, 'into board', targetBoardId);
      console.log('📦 Full draggedElement:', draggedElement);
      
      // Move element to target board
      if (draggedElement) {
        const store = useCanvasStore.getState();
        
        console.log('🚀 Moving element to board...');
        // Move element to target board
        const success = store.moveElementToBoard(draggedElement, targetBoardId);
        
        if (success) {
          // Only remove from current location if move was successful
          store.removeElement(draggedElement.id);
          console.log('✅ Element moved to board', targetBoardId);
        } else {
          console.error('❌ Failed to move element to board');
        }
      } else {
        console.error('❌ No draggedElement found!');
      }
      
      setDraggedElement(null);
      setDragOffset({ x: 0, y: 0 });
      return;
    }
    
    // Check if dragging from tree to canvas
    if (active.data.current?.source === 'tree') {
      const treeElement = active.data.current.element;
      
      // Calculate drop position in canvas coordinates
      const canvasBounds = canvasRef.current?.getBoundingClientRect();
      if (canvasBounds && activatorEvent) {
        const dropX = (activatorEvent.clientX - canvasBounds.left - viewport.x) / viewport.zoom;
        const dropY = (activatorEvent.clientY - canvasBounds.top - viewport.y) / viewport.zoom;
        
        // Create a copy of the element at the drop position
        const newElement = {
          ...treeElement,
          id: `${treeElement.id}_copy_${Date.now()}`,
          position: {
            x: settings.snapToGrid ? Math.round(dropX / GRID_SIZE) * GRID_SIZE : dropX,
            y: settings.snapToGrid ? Math.round(dropY / GRID_SIZE) * GRID_SIZE : dropY
          },
          // If it's a board, preserve its children
          data: treeElement.type === 'board' ? {
            ...treeElement.data,
            elements: treeElement.data?.elements || []
          } : treeElement.data
        };
        
        // Add element to current board
        addCompleteElement(newElement);
      }
      
      setDraggedElement(null);
      setDragOffset({ x: 0, y: 0 });
      return;
    }
    
    // Check if dropping on a board (for canvas elements)
    if (!active.data.current?.source && activatorEvent) {
      const draggedElement = elements.find(el => el.id === active.id);
      if (draggedElement) {  // Allow all element types including boards
        // Calculate final drop position
        const canvasBounds = canvasRef.current?.getBoundingClientRect();
        if (canvasBounds) {
          const dropX = (activatorEvent.clientX - canvasBounds.left - viewport.x) / viewport.zoom;
          const dropY = (activatorEvent.clientY - canvasBounds.top - viewport.y) / viewport.zoom;
          
          // Find if dropping on a board
          const targetBoard = elements.find(el => {
            if (el.type !== 'board' || el.id === active.id) return false;
            
            // Check if drop position is within board bounds
            const elementCenterX = draggedElement.position.x + draggedElement.size.width / 2 + delta.x / viewport.zoom;
            const elementCenterY = draggedElement.position.y + draggedElement.size.height / 2 + delta.y / viewport.zoom;
            
            return elementCenterX >= el.position.x && 
                   elementCenterX <= el.position.x + el.size.width &&
                   elementCenterY >= el.position.y && 
                   elementCenterY <= el.position.y + el.size.height;
          });
          
          if (targetBoard) {
            console.log('📦 Dropping element onto board in canvas:', targetBoard.id);
            const store = useCanvasStore.getState();
            
            // ATOMIC OPERATION: Disable auto-save during operation
            console.log('🔒 Disabling auto-save for atomic operation...');
            useCanvasStore.setState({ autoSaveEnabled: false });
            
            try {
              // First move element to board (this updates localStorage)
              const result = store.moveElementToBoard(draggedElement, targetBoard.id);
              
              if (result) {
                console.log('🎯 ✅ Element successfully moved to board');
                
                // CRITICAL: Now remove from current state AND save to localStorage
                console.log('🗑️ Removing element from current canvas level...');
                store.removeElement(draggedElement.id); // This will save to localStorage
                
                console.log('✅ Element moved and removed from source');
              } else {
                console.error('🎯 ❌ Move operation failed!');
              }
            } finally {
              // CRITICAL: Re-enable auto-save after operation
              console.log('🔓 Re-enabling auto-save after operation');
              useCanvasStore.setState({ autoSaveEnabled: true });
            }
            
            console.log('✅ Atomic move operation completed');
            
            setDraggedElement(null);
            setDragOffset({ x: 0, y: 0 });
            return;
          }
        }
      }
    }
    
    // Regular canvas drag
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
  }, [selectedIds, viewport.zoom, moveElement, elements, settings.snapToGrid, selectElement, addElement, viewport.x, viewport.y, draggedElement]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e) => {
    if (e.target === canvasRef.current) {
      clearSelection();
    }
  }, [clearSelection]);

  // Handle mouse down for selection box, panning, and zooming
  const handleMouseDown = useCallback((e) => {
    // Priority 1: Check for zooming (Right mouse button)
    if (e.button === 2) {
      console.log('Starting zoom mode');
      setIsZooming(true);
      setZoomStart({ x: e.clientX, y: e.clientY });
      setInitialZoom(viewport.zoom);
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Priority 2: Check for panning (Alt key or middle mouse)
    if (e.altKey || e.button === 1) {
      console.log('Starting pan mode');
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Priority 3: Canvas selection
    if (e.target === canvasRef.current && !e.metaKey && !e.ctrlKey) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / viewport.zoom;
      const y = (e.clientY - rect.top) / viewport.zoom;
      
      setIsSelecting(true);
      setSelectionStart({ x, y });
      setSelectionBox({ x, y, width: 0, height: 0 });
    }
  }, [viewport.zoom]);

  // Handle mouse move for selection box, panning, and zooming
  const handleMouseMove = useCallback((e) => {
    // Handle zooming
    if (isZooming && zoomStart) {
      const deltaY = e.clientY - zoomStart.y;
      // Zoom sensitivity: negative deltaY = zoom in, positive = zoom out
      const zoomFactor = 1 + (deltaY * -0.01); // Adjust sensitivity as needed
      const newZoom = Math.max(0.1, Math.min(5, initialZoom * zoomFactor));
      
      // Calculate mouse position in canvas coordinates
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = zoomStart.x - rect.left;
        const mouseY = zoomStart.y - rect.top;
        
        // Calculate world coordinates of the mouse at the start of zoom
        const worldX = (mouseX - viewport.x) / viewport.zoom;
        const worldY = (mouseY - viewport.y) / viewport.zoom;
        
        // Calculate new viewport position to keep mouse point fixed
        const newViewportX = mouseX - worldX * newZoom;
        const newViewportY = mouseY - worldY * newZoom;
        
        updateViewport({ 
          zoom: newZoom,
          x: newViewportX,
          y: newViewportY
        });
      }
      return;
    }
    
    // Handle panning
    if (isPanning && panStart) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      
      panViewport({ x: deltaX, y: deltaY });
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Handle selection box
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
  }, [isZooming, zoomStart, initialZoom, updateViewport, isPanning, panStart, panViewport, isSelecting, selectionStart, viewport.zoom]);

  // Handle mouse up for selection box, panning, and zooming
  const handleMouseUp = useCallback(() => {
    // Stop zooming
    if (isZooming) {
      setIsZooming(false);
      setZoomStart(null);
      setInitialZoom(1);
      return;
    }
    
    // Stop panning
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }
    
    // Handle selection box
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
  }, [isZooming, isPanning, isSelecting, selectionBox, elements, selectMultiple]);

  // Add mouse event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Add global mouse listeners for pan and zoom functionality
    const handleGlobalMouseDown = (e) => {
      if (e.button === 2) {
        console.log('Global zoom start');
        setIsZooming(true);
        setZoomStart({ x: e.clientX, y: e.clientY });
        setInitialZoom(viewport.zoom);
        e.preventDefault();
        return;
      }
      
      if (e.altKey || e.button === 1) {
        console.log('Global pan start');
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
        e.preventDefault();
        return;
      }
    };

    // Canvas-specific mousedown for selection
    canvas.addEventListener('mousedown', handleMouseDown);
    
    // Global listeners for pan and general mouse events
    document.addEventListener('mousedown', handleGlobalMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousedown', handleGlobalMouseDown);
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
        case ' ':
          // Spacebar to center viewport
          centerViewport();
          e.preventDefault();
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
    <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900" style={{ top: '0px', left: '-24px', right: '-24px', bottom: '0px' }}>
      <CanvasToolbar />
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Canvas */}
        <div
          ref={canvasRef}
          className={`w-full h-full ${
            isZooming ? 'cursor-zoom-in' : 
            isPanning ? 'cursor-grabbing' : 
            'cursor-default'
          }`}
          style={gridStyle}
          onClick={handleCanvasClick}
          onContextMenu={(e) => e.preventDefault()} // Disable context menu for right-click zoom
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
                className="absolute border-2 border-blue-500 bg-blue-100 dark:bg-blue-900 bg-opacity-20 pointer-events-none"
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
              className="opacity-60 bg-blue-200 dark:bg-blue-800 border-2 border-blue-400 dark:border-blue-600 rounded-lg flex items-center justify-center"
              style={{
                width: draggedElement.size.width,
                height: draggedElement.size.height,
                cursor: 'grabbing'
              }}
            >
              <span className="text-sm text-blue-800 font-medium">
                {draggedElement.type}
              </span>
            </div>
          )}
        </DragOverlay>
        {/* Tree View Sidebar - inside DndContext */}
        <HoudiniTreeView />
      </DndContext>

      {/* Canvas info overlay */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-gray-300 space-y-1">
        <div>Elements: {elements.length}</div>
        <div>Selected: {selectedIds.length}</div>
        <div>Zoom: {Math.round(viewport.zoom * 100)}%</div>
        <div>Grid: {settings.gridVisible ? 'Visible' : 'Hidden'}</div>
        <div>Snap: {settings.snapToGrid ? 'On' : 'Off'}</div>
      </div>

      {/* Help overlay */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-gray-300" style={{ right: '340px' }}>
        <div className="font-medium mb-1">Shortcuts:</div>
        <div>Drag: Move elements</div>
        <div>Alt+drag: Pan canvas</div>
        <div>Middle mouse: Pan canvas</div>
        <div>Right+drag: Zoom canvas</div>
        <div>Shift+drag: Ignore snap to grid</div>
        <div>Double-click board: Enter board</div>
        <div>Ctrl/Cmd+click: Multi-select</div>
        <div>Drag area: Select multiple</div>
        <div>Delete: Remove selected</div>
        <div>Ctrl/Cmd+A: Select all</div>
        <div>Ctrl/Cmd+C/V: Copy/Paste</div>
        <div>Spacebar: Center view</div>
        <div>Escape: Clear selection</div>
      </div>

      {/* Properties Panel */}
      <PropertiesPanel />
      
      {/* Path Breadcrumb */}
      <PathBreadcrumb />
    </div>
  );
};

export default VisualCanvas;