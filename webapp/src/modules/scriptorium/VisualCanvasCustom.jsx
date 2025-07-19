/**
 * Visual Canvas - Custom Pointer Events Implementation
 * Figma/Milanote-style drag & drop with 60fps performance
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore } from './store.js';
import { useUnifiedStore, useCanvasState } from '../../store/unifiedStore.js';
import { useProjectStore } from '../../store/projectStore.js';
import { CanvasToolbar } from './components/CanvasToolbar.jsx';
import { PropertiesPanel } from './components/PropertiesPanel.jsx';
import { AISuggestions } from './components/AISuggestions.jsx';
import AIBoardGenerator from './components/AIBoardGenerator.jsx';
import TreeViewSidebar from './components/TreeViewSidebar.jsx';
import HoudiniTreeView from './components/HoudiniTreeView.jsx';
import PathBreadcrumb from './components/PathBreadcrumb.jsx';
import { GRID_SIZE, ELEMENT_TYPES } from './types.js';
import { Lightbulb, Brain, Save } from 'lucide-react';
import ConsolidationPanel from '../mind-garden/components/ConsolidationPanel';
import IntelligenceCommandBar from '../../components/IntelligenceCommandBar';
import { moduleContext } from '../shared/intelligence/ModuleContext';

// Custom Drag System Components
import { useCustomDrag } from './hooks/useCustomDrag.js';
import { CustomDragGhost } from './components/CustomDragGhost.jsx';
import { CustomDraggableElement } from './components/CustomDraggableElement.jsx';
import { clearGlobalDragState } from './hooks/useDropZone.js';

const CreativeAtelierCustom = () => {
  console.log('CreativeAtelier rendering - Custom Pointer Events Edition');
  
  const canvasRef = useRef(null);
  const customDragRef = useRef(null);
  
  // Canvas interaction states
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const [selectionStart, setSelectionStart] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomStart, setZoomStart] = useState(null);
  const [initialZoom, setInitialZoom] = useState(1);
  const [consolidationOpen, setConsolidationOpen] = useState(false);
  
  // Custom drag system
  const {
    isDragging,
    draggedElement,
    ghostPosition,
    startDrag,
    cancelDrag,
    isElementDragging
  } = useCustomDrag();
  
  // Expose startDrag via ref for child components
  customDragRef.current = {
    startDrag
  };
  
  // Unified Store integration
  const {
    navigateToModule,
    analyzeCanvasContext
  } = useUnifiedStore();
  
  // Project Store integration
  const { getCurrentProject } = useProjectStore();
  
  const unifiedCanvas = useCanvasState();

  // Intelligence System integration
  useEffect(() => {
    moduleContext.setCurrentModule('scriptorium');
    return () => {
      // Cleanup if needed
    };
  }, []);
  
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
    addCompleteElement,
    updateElement,
    navigateToBoard,
    removeElement
  } = useCanvasStore();

  // Initialize atelier on mount
  useEffect(() => {
    initialize();
    // Set current module in unified store
    navigateToModule('canvas', { source: 'creative-atelier-init' });
  }, [initialize, navigateToModule]);
  
  // Trigger AI analysis when elements change
  const currentProject = getCurrentProject();
  const isTemporaryProject = currentProject?.isTemporary || false;
  
  useEffect(() => {
    // Trigger analysis only when elements change meaningfully
    analyzeCanvasContext();
  }, [elements.length]); // Only when elements count changes
  
  // Auto-center viewport when new elements are added
  useEffect(() => {
    if (elements.length > 0) {
      setTimeout(() => {
        centerViewport();
      }, 100);
    }
  }, [elements.length, centerViewport]);

  // Intelligence System execution handler
  const handleIntelligenceExecution = useCallback(async (result) => {
    console.log('🧠 Intelligence System executed:', result);
    
    try {
      if (result.type === 'create_board') {
        clearSelection();
        if (result.elements) {
          result.elements.forEach((elementData, index) => {
            const position = elementData.position || { 
              x: 100 + (index % 4) * 300, 
              y: 100 + Math.floor(index / 4) * 200 
            };
            const element = {
              id: `element-${Date.now()}-${index}`,
              type: elementData.type || 'note',
              position,
              data: elementData.data || { content: 'New element' },
              source: 'intelligence-system'
            };
            addElement(element);
          });
        }
        centerViewport();
      }
      
      moduleContext.updateUserPreferences('scriptorium', result.type, true);
      
    } catch (error) {
      console.error('🧠 Intelligence execution failed:', error);
      moduleContext.updateUserPreferences('scriptorium', result.type, false);
    }
  }, [elements, selectedIds, clearSelection, addElement, centerViewport]);

  // Custom Drop Handler
  const handleCustomDrop = useCallback((draggedElement, targetId, relativePosition) => {
    console.log('🎯 Custom drop handler:', draggedElement.id, '→', targetId);
    
    const store = useCanvasStore.getState();
    const targetElement = elements.find(el => el.id === targetId);
    
    if (targetElement && targetElement.type === ELEMENT_TYPES.BOARD) {
      // Move element into board
      const success = store.moveElementToBoard(draggedElement, targetId);
      if (success) {
        store.removeElement(draggedElement.id);
        console.log('✅ Element moved to board', targetId);
        
        // Emit EventBus event
        if (window.__eventBus) {
          window.__eventBus.emit('canvas.element.moved_to_board', {
            elementId: draggedElement.id,
            targetBoardId: targetId,
            timestamp: Date.now()
          });
        }
      }
    } else {
      // Move element on canvas
      const canvasBounds = canvasRef.current?.getBoundingClientRect();
      if (canvasBounds) {
        const canvasPosition = {
          x: (relativePosition.x - viewport.x) / viewport.zoom,
          y: (relativePosition.y - viewport.y) / viewport.zoom
        };
        
        // Snap to grid if enabled
        const finalPosition = settings.snapToGrid ? {
          x: Math.round(canvasPosition.x / GRID_SIZE) * GRID_SIZE,
          y: Math.round(canvasPosition.y / GRID_SIZE) * GRID_SIZE
        } : canvasPosition;
        
        // Update element position
        const deltaPosition = {
          x: finalPosition.x - draggedElement.position.x,
          y: finalPosition.y - draggedElement.position.y
        };
        
        moveElement(draggedElement.id, deltaPosition);
        
        // Emit EventBus event
        if (window.__eventBus) {
          window.__eventBus.emit('canvas.element.moved', {
            elementId: draggedElement.id,
            newPosition: finalPosition,
            timestamp: Date.now()
          });
        }
      }
    }
    
    // Clear global drag state
    clearGlobalDragState();
  }, [elements, viewport, settings.snapToGrid, moveElement]);

  // Element Click Handler
  const handleElementClick = useCallback((elementId, multiSelect) => {
    selectElement(elementId, multiSelect);
  }, [selectElement]);

  // Element Double Click Handler
  const handleElementDoubleClick = useCallback((element) => {
    if (element.type === ELEMENT_TYPES.NOTE) {
      updateElement(element.id, { editing: true });
    } else if (element.type === ELEMENT_TYPES.BOARD) {
      console.log('🖱️ Double-click navigation to board:', element.id);
      navigateToBoard(element.id);
    }
  }, [updateElement, navigateToBoard]);

  // Handle canvas click and double-click
  const handleCanvasClick = useCallback((e) => {
    if (e.target === canvasRef.current) {
      if (e.detail === 2) {
        // Double click - create new note at mouse position
        const canvasBounds = canvasRef.current.getBoundingClientRect();
        const canvasX = (e.clientX - canvasBounds.left - viewport.x) / viewport.zoom;
        const canvasY = (e.clientY - canvasBounds.top - viewport.y) / viewport.zoom;
        
        // Snap to grid if enabled
        const position = settings.snapToGrid ? {
          x: Math.round(canvasX / GRID_SIZE) * GRID_SIZE,
          y: Math.round(canvasY / GRID_SIZE) * GRID_SIZE
        } : { x: canvasX, y: canvasY };
        
        addElement('note', position);
      } else {
        // Single click - clear selection
        clearSelection();
      }
    }
  }, [clearSelection, addElement, viewport, settings.snapToGrid]);

  // Handle mouse down for selection box, panning, and zooming
  const handleMouseDown = useCallback((e) => {
    // Skip if dragging
    if (isDragging) return;
    
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
  }, [viewport.zoom, isDragging]);

  // Handle mouse move for selection box, panning, and zooming
  const handleMouseMove = useCallback((e) => {
    // Handle zooming
    if (isZooming && zoomStart) {
      const deltaY = e.clientY - zoomStart.y;
      const zoomFactor = 1 + (deltaY * -0.01);
      const newZoom = Math.max(0.1, Math.min(5, initialZoom * zoomFactor));
      
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = zoomStart.x - rect.left;
        const mouseY = zoomStart.y - rect.top;
        
        const worldX = (mouseX - viewport.x) / viewport.zoom;
        const worldY = (mouseY - viewport.y) / viewport.zoom;
        
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
    if (isZooming) {
      setIsZooming(false);
      setZoomStart(null);
      setInitialZoom(1);
      return;
    }
    
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }
    
    if (isSelecting && selectionBox) {
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
      if (e.target.tagName === 'INPUT' || 
          e.target.tagName === 'TEXTAREA' || 
          e.target.contentEditable === 'true' ||
          e.target.closest('[contenteditable="true"]') ||
          e.target.closest('textarea')) return;
      
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
          if (isDragging) {
            cancelDrag();
          } else {
            clearSelection();
          }
          break;
        case ' ':
          centerViewport();
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, deleteSelected, selectAll, copySelected, pasteElements, clearSelection, isDragging, cancelDrag]);
  
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
      
      {/* Intelligence Command Bar - Top Center */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-96">
        <IntelligenceCommandBar
          module="scriptorium"
          onExecute={handleIntelligenceExecution}
          className="shadow-lg"
        />
      </div>
      
      {/* Temporary Project Badge */}
      {isTemporaryProject && (
        <div className="absolute top-20 left-4 z-50">
          <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg px-3 py-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Creative Atelier - Custom Drag
            </span>
          </div>
        </div>
      )}
      
      {/* Action Buttons for temporary projects */}
      {isTemporaryProject && (
        <div className="absolute top-20 right-4 z-50 flex items-center gap-3">
          <button
            onClick={() => setConsolidationOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors"
            title="Save as permanent project"
          >
            <Save className="w-4 h-4" />
            <span className="text-sm font-medium">Save as Project</span>
          </button>
          
          <button
            onClick={() => navigateToModule('mind-garden')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors"
            title="Back to Mind Garden"
          >
            <Brain className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Ideas</span>
          </button>
        </div>
      )}
      
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
        onContextMenu={(e) => e.preventDefault()}
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
            {elements.map(element => (
              <CustomDraggableElement
                key={element.id}
                element={element}
                onUpdate={updateElement}
                onDelete={removeElement}
                onDrop={handleCustomDrop}
                onClick={handleElementClick}
                onDoubleClick={handleElementDoubleClick}
                isDragging={isElementDragging(element.id)}
                customDragRef={customDragRef}
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

      {/* Custom Drag Ghost */}
      <CustomDragGhost
        isDragging={isDragging}
        draggedElement={draggedElement}
        position={ghostPosition}
      />
      
      {/* Tree View Sidebar */}
      <HoudiniTreeView />

      {/* Properties Panel */}
      <PropertiesPanel />
      
      {/* AI Suggestions */}
      <AISuggestions />
      
      {/* AI Board Generator */}
      <AIBoardGenerator 
        onBoardGenerated={(result) => {
          console.log('🤖 Board generated:', result);
        }}
        className="fixed top-20 right-4 w-80 z-30"
      />
      
      {/* Path Breadcrumb */}
      <PathBreadcrumb />
      
      {/* Consolidation Panel for temporary projects */}
      {isTemporaryProject && (
        <ConsolidationPanel
          isOpen={consolidationOpen}
          onClose={() => setConsolidationOpen(false)}
          nodes={elements.map(element => ({
            id: element.id,
            data: {
              title: element.type === 'note' ? element.content?.substring(0, 50) || 'Note' : element.type,
              content: element.type === 'note' ? element.content || '' : `${element.type} element`,
              type: element.type,
              created: element.created || new Date().toISOString(),
              modified: element.modified || new Date().toISOString()
            },
            position: { x: element.position?.x || 0, y: element.position?.y || 0 },
            type: 'card'
          }))}
          edges={[]}
          tempProjectId={currentProject?.id}
        />
      )}
    </div>
  );
};

export default CreativeAtelierCustom;

// Backward compatibility alias
export { CreativeAtelierCustom as VisualCanvasCustom };