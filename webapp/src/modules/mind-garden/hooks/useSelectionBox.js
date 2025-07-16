/**
 * useSelectionBox - Hook for implementing drag selection rectangle
 * Used in both Mind Garden and Creative Atelier for multi-select
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
    
    // Don't start selection if clicking on a node or control
    if (e.target.closest('.react-flow__node') || 
        e.target.closest('.react-flow__controls') ||
        e.target.closest('.draggable-element') ||
        e.target.closest('button')) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    startPoint.current = { x, y };
    currentPoint.current = { x, y };
    setIsSelecting(true);
    setSelectionBox({ x, y, width: 0, height: 0 });

    // Prevent text selection during drag
    e.preventDefault();
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

    setSelectionBox({
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    });
  }, [isSelecting, containerRef]);

  // Complete selection on mouse up
  const handleMouseUp = useCallback((e) => {
    if (!isSelecting) return;

    setIsSelecting(false);

    // Calculate final selection area
    if (selectionBox && selectionBox.width > 5 && selectionBox.height > 5) {
      // Only trigger selection if the box is bigger than 5x5 pixels
      onSelectionComplete(selectionBox);
    }

    setSelectionBox(null);
  }, [isSelecting, selectionBox, onSelectionComplete]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add event listeners
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
 */
export const isElementInSelectionBox = (element, selectionBox, containerOffset = { x: 0, y: 0 }) => {
  if (!selectionBox || !element) return false;

  // Get element bounds
  const elementX = element.position?.x || element.x || 0;
  const elementY = element.position?.y || element.y || 0;
  const elementWidth = element.width || element.data?.width || 150;
  const elementHeight = element.height || element.data?.height || 50;

  // Adjust for container offset
  const adjustedElementX = elementX - containerOffset.x;
  const adjustedElementY = elementY - containerOffset.y;

  // Check if element overlaps with selection box
  const elementRight = adjustedElementX + elementWidth;
  const elementBottom = adjustedElementY + elementHeight;
  const selectionRight = selectionBox.x + selectionBox.width;
  const selectionBottom = selectionBox.y + selectionBox.height;

  return !(
    adjustedElementX > selectionRight ||
    elementRight < selectionBox.x ||
    adjustedElementY > selectionBottom ||
    elementBottom < selectionBox.y
  );
};