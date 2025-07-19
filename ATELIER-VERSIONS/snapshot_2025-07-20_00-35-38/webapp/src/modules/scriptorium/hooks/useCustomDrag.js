/**
 * Custom Drag System - Figma/Milanote Style
 * Pointer events based, 60fps performance, zero lag
 */

import { useState, useRef, useCallback } from 'react';

export const useCustomDrag = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElement, setDraggedElement] = useState(null);
  const [ghostPosition, setGhostPosition] = useState({ x: 0, y: 0 });
  
  const dragRef = useRef({
    startPosition: null,
    offset: { x: 0, y: 0 },
    currentPointer: null
  });

  // Start drag with pointer events
  const startDrag = useCallback((element, pointerEvent) => {
    console.log('🎯 Custom drag start:', element.id);
    
    // Calculate offset from element center to pointer
    const rect = pointerEvent.currentTarget.getBoundingClientRect();
    const offset = {
      x: pointerEvent.clientX - rect.left,
      y: pointerEvent.clientY - rect.top
    };
    
    // Setup drag state
    dragRef.current = {
      startPosition: { x: pointerEvent.clientX, y: pointerEvent.clientY },
      offset,
      element
    };
    
    setIsDragging(true);
    setDraggedElement(element);
    setGhostPosition({
      x: pointerEvent.clientX - offset.x,
      y: pointerEvent.clientY - offset.y
    });
    
    // Emit EventBus event
    if (window.__eventBus) {
      window.__eventBus.emit('canvas.drag.start', {
        elementId: element.id,
        elementType: element.type,
        startPosition: { x: pointerEvent.clientX, y: pointerEvent.clientY },
        timestamp: Date.now()
      });
    }
    
    // Global pointer event listeners
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    
    // Prevent default behavior
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();
  }, []);

  // Handle pointer move - 60fps ghost update
  const handlePointerMove = useCallback((e) => {
    if (!isDragging || !dragRef.current.offset) return;
    
    // Update ghost position smoothly
    const newPosition = {
      x: e.clientX - dragRef.current.offset.x,
      y: e.clientY - dragRef.current.offset.y
    };
    
    // Use requestAnimationFrame for smooth 60fps updates
    requestAnimationFrame(() => {
      setGhostPosition(newPosition);
    });
    
    // Emit move event
    if (window.__eventBus) {
      window.__eventBus.emit('canvas.drag.move', {
        elementId: dragRef.current.element?.id,
        position: { x: e.clientX, y: e.clientY },
        ghostPosition: newPosition,
        timestamp: Date.now()
      });
    }
  }, [isDragging]);

  // Handle pointer up - commit or cancel drag
  const handlePointerUp = useCallback((e) => {
    console.log('🎯 Custom drag end');
    
    const draggedEl = dragRef.current.element;
    
    // Calculate final drop position and target
    const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
    const finalPosition = {
      x: e.clientX - dragRef.current.offset.x,
      y: e.clientY - dragRef.current.offset.y
    };
    
    // Emit EventBus event
    if (window.__eventBus) {
      window.__eventBus.emit('canvas.drag.end', {
        elementId: draggedEl?.id,
        dropTarget: dropTarget?.dataset?.dropzoneId || null,
        finalPosition,
        success: !!dropTarget?.dataset?.dropzoneId,
        timestamp: Date.now()
      });
    }
    
    // Clean up
    setIsDragging(false);
    setDraggedElement(null);
    setGhostPosition({ x: 0, y: 0 });
    
    // Remove global listeners
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
    
    // Reset drag ref
    const result = {
      dropTarget,
      finalPosition,
      element: draggedEl
    };
    
    dragRef.current = {
      startPosition: null,
      offset: { x: 0, y: 0 },
      element: null
    };
    
    return result;
  }, [handlePointerMove]);

  // Cancel drag (escape key, etc)
  const cancelDrag = useCallback(() => {
    console.log('🎯 Custom drag cancelled');
    
    setIsDragging(false);
    setDraggedElement(null);
    setGhostPosition({ x: 0, y: 0 });
    
    // Clean up
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
    
    // Emit cancel event
    if (window.__eventBus) {
      window.__eventBus.emit('canvas.drag.cancel', {
        elementId: dragRef.current.element?.id,
        timestamp: Date.now()
      });
    }
    
    dragRef.current = {
      startPosition: null,
      offset: { x: 0, y: 0 },
      element: null
    };
  }, [handlePointerMove, handlePointerUp]);

  return {
    // State
    isDragging,
    draggedElement,
    ghostPosition,
    
    // Actions
    startDrag,
    cancelDrag,
    
    // Utils
    isElementDragging: (elementId) => draggedElement?.id === elementId
  };
};