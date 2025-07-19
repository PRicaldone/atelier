/**
 * Gesture Detection Hook
 * Handles double-click, long-press, touch events with proper timing
 */

import { useRef, useCallback } from 'react';

export const useGestures = ({ 
  onDoubleClickDetected, 
  onLongPressDetected, 
  longPressDelay = 500,
  doubleClickDelay = 300 
}) => {
  const longPressTimer = useRef(null);
  const lastClickTime = useRef(0);
  const clickCount = useRef(0);
  const doubleClickTimer = useRef(null);

  // Double-click detection
  const onDoubleClick = useCallback((event) => {
    if (event.target.classList.contains('canvas')) {
      onDoubleClickDetected?.(event);
    }
  }, [onDoubleClickDetected]);

  // Long press detection for mouse
  const onMouseDown = useCallback((event) => {
    if (event.target.classList.contains('canvas')) {
      longPressTimer.current = setTimeout(() => {
        onLongPressDetected?.(event);
      }, longPressDelay);
    }
  }, [onLongPressDetected, longPressDelay]);

  const onMouseUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Touch events for mobile
  const onTouchStart = useCallback((event) => {
    if (event.target.classList.contains('canvas')) {
      const touch = event.touches[0];
      const touchEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        target: event.target
      };

      longPressTimer.current = setTimeout(() => {
        onLongPressDetected?.(touchEvent);
      }, longPressDelay);
    }
  }, [onLongPressDetected, longPressDelay]);

  const onTouchEnd = useCallback((event) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Handle double-tap for mobile
    if (event.target.classList.contains('canvas')) {
      const now = Date.now();
      const timeSinceLastClick = now - lastClickTime.current;

      if (timeSinceLastClick < doubleClickDelay) {
        clickCount.current += 1;
        if (clickCount.current === 2) {
          // Double tap detected
          const touch = event.changedTouches[0];
          const touchEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            target: event.target
          };
          onDoubleClickDetected?.(touchEvent);
          clickCount.current = 0;
        }
      } else {
        clickCount.current = 1;
      }

      lastClickTime.current = now;

      // Reset click count after delay
      if (doubleClickTimer.current) {
        clearTimeout(doubleClickTimer.current);
      }
      doubleClickTimer.current = setTimeout(() => {
        clickCount.current = 0;
      }, doubleClickDelay);
    }
  }, [onDoubleClickDetected, doubleClickDelay]);

  return {
    onDoubleClick,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    onTouchStart,
    onTouchEnd
  };
};

export default useGestures;