/**
 * Custom Drop Zone System
 * Manages drop targets, highlighting, and validation
 */

import { useState, useCallback, useRef } from 'react';

export const useDropZone = (dropZoneId, onDrop, canAccept = () => true) => {
  const [isOver, setIsOver] = useState(false);
  const [canDrop, setCanDrop] = useState(false);
  const dropRef = useRef(null);

  // Handle pointer enter (drag over)
  const handlePointerEnter = useCallback((e) => {
    // Only handle if there's an active drag
    if (!e.currentTarget.dataset?.isDragging) {
      const draggedElement = window.__customDragState?.element;
      if (draggedElement && canAccept(draggedElement)) {
        setIsOver(true);
        setCanDrop(true);
        
        // Emit EventBus event
        if (window.__eventBus) {
          window.__eventBus.emit('canvas.dropzone.enter', {
            dropZoneId,
            elementId: draggedElement.id,
            timestamp: Date.now()
          });
        }
      }
    }
  }, [dropZoneId, canAccept]);

  // Handle pointer leave (drag exit)
  const handlePointerLeave = useCallback((e) => {
    setIsOver(false);
    setCanDrop(false);
    
    // Emit EventBus event
    if (window.__eventBus) {
      const draggedElement = window.__customDragState?.element;
      if (draggedElement) {
        window.__eventBus.emit('canvas.dropzone.leave', {
          dropZoneId,
          elementId: draggedElement.id,
          timestamp: Date.now()
        });
      }
    }
  }, [dropZoneId]);

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedElement = window.__customDragState?.element;
    if (draggedElement && canAccept(draggedElement)) {
      console.log('🎯 Custom drop:', draggedElement.id, '→', dropZoneId);
      
      // Calculate drop position relative to dropzone
      const rect = e.currentTarget.getBoundingClientRect();
      const relativePosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      // Call drop handler
      if (onDrop) {
        onDrop(draggedElement, dropZoneId, relativePosition);
      }
      
      // Emit EventBus event
      if (window.__eventBus) {
        window.__eventBus.emit('canvas.dropzone.drop', {
          dropZoneId,
          elementId: draggedElement.id,
          relativePosition,
          timestamp: Date.now()
        });
      }
    }
    
    // Reset state
    setIsOver(false);
    setCanDrop(false);
  }, [dropZoneId, onDrop, canAccept]);

  // Get drop zone props to spread on element
  const getDropZoneProps = useCallback(() => ({
    ref: dropRef,
    'data-dropzone-id': dropZoneId,
    'data-is-over': isOver,
    'data-can-drop': canDrop,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
    onDrop: handleDrop,
    onDragOver: (e) => e.preventDefault(), // Allow drop
  }), [
    dropZoneId, 
    isOver, 
    canDrop, 
    handlePointerEnter, 
    handlePointerLeave, 
    handleDrop
  ]);

  return {
    // State
    isOver,
    canDrop,
    dropRef,
    
    // Props to spread
    getDropZoneProps,
    
    // Manual control
    setIsOver,
    setCanDrop
  };
};

// Global state manager for custom drag
window.__customDragState = {
  element: null,
  isActive: false
};

// Helper to set global drag state
export const setGlobalDragState = (element, isActive = true) => {
  window.__customDragState = {
    element,
    isActive
  };
};

// Helper to clear global drag state
export const clearGlobalDragState = () => {
  window.__customDragState = {
    element: null,
    isActive: false
  };
};