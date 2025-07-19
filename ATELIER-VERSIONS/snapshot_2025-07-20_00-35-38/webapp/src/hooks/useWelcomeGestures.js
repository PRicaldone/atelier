import { useRef, useCallback } from 'react';

/**
 * Custom hook for Welcome Page gesture detection
 * Extends the existing gesture system for Welcome-specific interactions
 */

export const useWelcomeGestures = ({ 
  onLongPress, 
  onDoubleClick, 
  longPressDelay = 500,
  doubleTapDelay = 300 
}) => {
  const longPressTimer = useRef(null);
  const lastTap = useRef(0);
  const tapCount = useRef(0);

  // Clear timers
  const clearTimers = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Mouse events
  const handleMouseDown = useCallback((event) => {
    clearTimers();
    
    longPressTimer.current = setTimeout(() => {
      if (onLongPress) {
        onLongPress(event);
      }
    }, longPressDelay);
  }, [longPressDelay, onLongPress, clearTimers]);

  const handleMouseUp = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  const handleMouseLeave = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  const handleDoubleClick = useCallback((event) => {
    if (onDoubleClick) {
      onDoubleClick(event);
    }
  }, [onDoubleClick]);

  // Touch events for mobile
  const handleTouchStart = useCallback((event) => {
    clearTimers();
    
    const touch = event.touches[0];
    const now = Date.now();
    
    // Double tap detection
    if (now - lastTap.current < doubleTapDelay) {
      tapCount.current += 1;
      if (tapCount.current === 2 && onDoubleClick) {
        onDoubleClick({
          clientX: touch.clientX,
          clientY: touch.clientY,
          target: event.target
        });
        tapCount.current = 0;
        return;
      }
    } else {
      tapCount.current = 1;
    }
    
    lastTap.current = now;
    
    // Long press detection
    longPressTimer.current = setTimeout(() => {
      if (onLongPress) {
        onLongPress({
          clientX: touch.clientX,
          clientY: touch.clientY,
          target: event.target,
          type: 'touch'
        });
      }
    }, longPressDelay);
  }, [longPressDelay, doubleTapDelay, onLongPress, onDoubleClick, clearTimers]);

  const handleTouchEnd = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  const handleTouchMove = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  return {
    // Mouse events
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    onDoubleClick: handleDoubleClick,
    
    // Touch events
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
    
    // Cleanup
    cleanup
  };
};