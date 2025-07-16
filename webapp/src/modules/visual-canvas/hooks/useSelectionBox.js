/**
 * useSelectionBox - Hook for implementing drag selection rectangle
 * Shared between Mind Garden and Creative Atelier for multi-select
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export const useSelectionBox = (containerRef, onSelectionComplete) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const startPoint = useRef({ x: 0, y: 0 });
  const currentPoint = useRef({ x: 0, y: 0 });

  // Start selection on mouse down
  const handleMouseDown = useCallback((e) => {
    // Only start selection with left mouse button
    if (e.button !== 0) return;
    
    console.log('🖱️ Mouse down detected', e.target);
    
    // Don't start selection if clicking on elements that should be interactive
    if (e.target.closest('.react-flow__node') || 
        e.target.closest('.react-flow__controls') ||
        e.target.closest('.draggable-element') ||
        e.target.closest('.canvas-toolbar') ||
        e.target.closest('.tree-view-sidebar') ||
        e.target.closest('.properties-panel') ||
        e.target.closest('button') ||
        e.target.closest('input') ||
        e.target.closest('textarea') ||
        e.target.closest('[role="button"]') ||
        e.target.closest('[data-draggable]') ||
        e.target.closest('.react-flow__handle')) {
      console.log('🖱️ Ignoring click on interactive element:', e.target.className);
      return;
    }

    // Check if click is directly on the container or canvas background
    const container = containerRef.current;
    if (!container) {
      console.log('🖱️ No container ref');
      return;
    }

    // Only start selection if clicking directly on background
    if (e.target !== container && 
        !e.target.closest('.react-flow__pane') &&
        !e.target.classList.contains('react-flow__renderer') &&
        e.target !== container.querySelector('.react-flow__pane')) {
      console.log('🖱️ Not clicking on background, target:', e.target.className);
      return;
    }

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log('🖱️ Starting selection at:', { x, y });

    startPoint.current = { x, y };
    currentPoint.current = { x, y };
    setIsSelecting(true);
    setSelectionBox({ x, y, width: 0, height: 0 });

    // Prevent text selection during drag
    e.preventDefault();
    e.stopPropagation();
  }, [containerRef]);

  // Update selection box during drag
  const handleMouseMove = useCallback((e) => {
    if (!isSelecting) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentPoint.current = { x, y };

    // Calculate selection box dimensions
    const minX = Math.min(startPoint.current.x, x);
    const minY = Math.min(startPoint.current.y, y);
    const maxX = Math.max(startPoint.current.x, x);
    const maxY = Math.max(startPoint.current.y, y);

    const newBox = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };

    console.log('🖱️ Mouse move - updating selection box:', newBox);

    setSelectionBox(newBox);

    e.preventDefault();
  }, [isSelecting, containerRef]);

  // Complete selection on mouse up
  const handleMouseUp = useCallback((e) => {
    if (!isSelecting) return;

    console.log('🖱️ Mouse up - completing selection:', selectionBox);

    setIsSelecting(false);

    // Calculate final selection area
    if (selectionBox && selectionBox.width > 5 && selectionBox.height > 5) {
      console.log('🖱️ Selection box size valid, calling onSelectionComplete');
      // Only trigger selection if the box is bigger than 5x5 pixels (reduced threshold)
      onSelectionComplete(selectionBox);
    } else {
      console.log('🖱️ Selection box too small or null, ignoring. Size:', selectionBox);
    }

    setSelectionBox(null);
    e.preventDefault();
  }, [isSelecting, selectionBox, onSelectionComplete]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      console.log('🖱️ No container for event listeners');
      return;
    }

    console.log('🖱️ Setting up event listeners on container:', container);

    // Add event listeners to container
    container.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Cleanup
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  return {
    isSelecting,
    selectionBox
  };
};

/**
 * Check if an element is within the selection box
 * Works for both ReactFlow nodes and Canvas elements
 */
export const isElementInSelectionBox = (element, selectionBox, viewport = { x: 0, y: 0, zoom: 1 }) => {
  if (!selectionBox || !element) return false;

  // Handle different element formats
  let elementX, elementY, elementWidth, elementHeight;
  
  if (element.position) {
    // Canvas element format
    elementX = element.position.x;
    elementY = element.position.y;
    elementWidth = element.size?.width || 200;
    elementHeight = element.size?.height || 150;
  } else {
    // Direct coordinates format
    elementX = element.x || 0;
    elementY = element.y || 0;
    elementWidth = element.width || 200;
    elementHeight = element.height || 100;
  }

  // Apply viewport transformation for canvas elements
  const screenX = (elementX + viewport.x) * viewport.zoom;
  const screenY = (elementY + viewport.y) * viewport.zoom;
  const screenWidth = elementWidth * viewport.zoom;
  const screenHeight = elementHeight * viewport.zoom;

  // Check if element overlaps with selection box
  const elementRight = screenX + screenWidth;
  const elementBottom = screenY + screenHeight;
  const selectionRight = selectionBox.x + selectionBox.width;
  const selectionBottom = selectionBox.y + selectionBox.height;

  return !(
    screenX > selectionRight ||
    elementRight < selectionBox.x ||
    screenY > selectionBottom ||
    elementBottom < selectionBox.y
  );
};