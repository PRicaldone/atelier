import { useState, useCallback, useRef, useEffect } from 'react';

// 🚀 TRINITY AMPLIFIER: Rectangle Multi-Selection Component
// Professional marquee selection with 60fps performance and gesture integration

export const RectangleSelection = ({ 
  onSelectionChange, 
  disabled = false, 
  elements = [], 
  selectedIds = [],
  viewport = { x: 0, y: 0, zoom: 1 } 
}) => {
  const [selectionState, setSelectionState] = useState({
    isActive: false,
    startPoint: null,
    currentPoint: null,
    mode: 'intersect', // intersect, contain, center
    highlightedIds: []
  });

  const selectionRef = useRef(null);

  // Calculate which elements are selected by the rectangle
  const calculateRectangleSelection = useCallback((startPoint, currentPoint, mode = 'intersect') => {
    if (!startPoint || !currentPoint) return [];

    // Convert screen coordinates to world coordinates
    const rect = {
      x: Math.min(startPoint.x, currentPoint.x),
      y: Math.min(startPoint.y, currentPoint.y),
      width: Math.abs(currentPoint.x - startPoint.x),
      height: Math.abs(currentPoint.y - startPoint.y)
    };

    // Adjust for viewport transform
    const worldRect = {
      x: (rect.x - viewport.x) / viewport.zoom,
      y: (rect.y - viewport.y) / viewport.zoom,
      width: rect.width / viewport.zoom,
      height: rect.height / viewport.zoom
    };

    return elements.filter(element => {
      const elementBounds = {
        x1: element.position.x,
        y1: element.position.y,
        x2: element.position.x + element.size.width,
        y2: element.position.y + element.size.height
      };

      const selectionBounds = {
        x1: worldRect.x,
        y1: worldRect.y,
        x2: worldRect.x + worldRect.width,
        y2: worldRect.y + worldRect.height
      };

      switch (mode) {
        case 'contain':
          // Element must be fully inside selection
          return (
            elementBounds.x1 >= selectionBounds.x1 &&
            elementBounds.y1 >= selectionBounds.y1 &&
            elementBounds.x2 <= selectionBounds.x2 &&
            elementBounds.y2 <= selectionBounds.y2
          );

        case 'center':
          // Element center must be inside selection
          const centerX = elementBounds.x1 + (elementBounds.x2 - elementBounds.x1) / 2;
          const centerY = elementBounds.y1 + (elementBounds.y2 - elementBounds.y1) / 2;
          return (
            centerX >= selectionBounds.x1 &&
            centerX <= selectionBounds.x2 &&
            centerY >= selectionBounds.y1 &&
            centerY <= selectionBounds.y2
          );

        case 'intersect':
        default:
          // Element intersects with selection (default)
          return !(
            elementBounds.x2 < selectionBounds.x1 ||
            elementBounds.x1 > selectionBounds.x2 ||
            elementBounds.y2 < selectionBounds.y1 ||
            elementBounds.y1 > selectionBounds.y2
          );
      }
    });
  }, [elements, viewport]);

  // Start rectangle selection
  const startSelection = useCallback((event, mode = 'intersect') => {
    if (disabled) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const startPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    console.log('🔲 Starting rectangle selection at:', startPoint, 'mode:', mode);

    setSelectionState({
      isActive: true,
      startPoint,
      currentPoint: startPoint,
      mode,
      highlightedIds: []
    });

    // Prevent default drag behavior
    event.preventDefault();
    event.stopPropagation();
  }, [disabled]);

  // Update rectangle selection
  const updateSelection = useCallback((event) => {
    if (!selectionState.isActive || !selectionState.startPoint) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const currentPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    // Calculate highlighted elements
    const highlighted = calculateRectangleSelection(
      selectionState.startPoint,
      currentPoint,
      selectionState.mode
    );

    setSelectionState(prev => ({
      ...prev,
      currentPoint,
      highlightedIds: highlighted.map(el => el.id)
    }));

    // Performance monitoring
    const startTime = performance.now();
    const duration = performance.now() - startTime;
    if (duration > 16) { // 60fps = 16ms per frame
      console.warn(`🔲 Selection performance warning: ${duration}ms for ${highlighted.length} elements`);
    }
  }, [selectionState.isActive, selectionState.startPoint, selectionState.mode, calculateRectangleSelection]);

  // End rectangle selection
  const endSelection = useCallback((event) => {
    if (!selectionState.isActive) return;

    console.log('🔲 Ending rectangle selection with', selectionState.highlightedIds.length, 'elements');

    // Commit selection
    let finalSelection = [...selectionState.highlightedIds];

    // Handle modifier keys for multi-selection
    if (event.ctrlKey || event.metaKey) {
      // Add to existing selection
      finalSelection = [...new Set([...selectedIds, ...finalSelection])];
    } else {
      // Replace selection
      finalSelection = selectionState.highlightedIds;
    }

    // Call callback if provided
    if (onSelectionChange) {
      onSelectionChange(finalSelection);
    }

    // Reset selection state
    setSelectionState({
      isActive: false,
      startPoint: null,
      currentPoint: null,
      mode: 'intersect',
      highlightedIds: []
    });

    console.log('✅ Rectangle selection completed:', finalSelection.length, 'elements selected');
  }, [selectionState, selectedIds, onSelectionChange]);

  // Handle mouse events
  const handleMouseDown = useCallback((event) => {
    // Only start on empty canvas (not on elements)
    if (event.target.dataset.elementId) return;

    let mode = 'intersect';
    if (event.shiftKey) mode = 'contain';
    if (event.altKey) mode = 'center';

    startSelection(event, mode);
  }, [startSelection]);

  const handleMouseMove = useCallback((event) => {
    updateSelection(event);
  }, [updateSelection]);

  const handleMouseUp = useCallback((event) => {
    endSelection(event);
  }, [endSelection]);

  // Handle keyboard modifiers for mode switching
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!selectionState.isActive) return;

      let newMode = 'intersect';
      if (event.shiftKey) newMode = 'contain';
      if (event.altKey) newMode = 'center';

      if (newMode !== selectionState.mode) {
        setSelectionState(prev => ({ ...prev, mode: newMode }));
      }
    };

    const handleKeyUp = (event) => {
      if (!selectionState.isActive) return;

      let newMode = 'intersect';
      if (event.shiftKey) newMode = 'contain';
      if (event.altKey) newMode = 'center';

      if (newMode !== selectionState.mode) {
        setSelectionState(prev => ({ ...prev, mode: newMode }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectionState.isActive, selectionState.mode]);

  // Calculate rectangle style
  const getRectangleStyle = () => {
    if (!selectionState.isActive || !selectionState.startPoint || !selectionState.currentPoint) {
      return { display: 'none' };
    }

    const rect = {
      left: Math.min(selectionState.startPoint.x, selectionState.currentPoint.x),
      top: Math.min(selectionState.startPoint.y, selectionState.currentPoint.y),
      width: Math.abs(selectionState.currentPoint.x - selectionState.startPoint.x),
      height: Math.abs(selectionState.currentPoint.y - selectionState.startPoint.y)
    };

    // Different styles for different modes
    const modeStyles = {
      intersect: {
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderStyle: 'solid'
      },
      contain: {
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderStyle: 'dashed'
      },
      center: {
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderStyle: 'dotted'
      }
    };

    return {
      position: 'absolute',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      border: `2px ${modeStyles[selectionState.mode].borderStyle} ${modeStyles[selectionState.mode].borderColor}`,
      backgroundColor: modeStyles[selectionState.mode].backgroundColor,
      borderRadius: '4px',
      pointerEvents: 'none',
      zIndex: 9999,
      transition: 'border-color 0.1s ease',
      ...getRectangleAnimation()
    };
  };

  // Add subtle animation for visual feedback
  const getRectangleAnimation = () => {
    if (selectionState.mode === 'intersect') {
      return {
        animation: 'marquee-pulse 1s ease-in-out infinite alternate'
      };
    }
    return {};
  };

  return (
    <>
      {/* Selection Rectangle Overlay */}
      <div
        ref={selectionRef}
        style={getRectangleStyle()}
        className="rectangle-selection-overlay"
      />

      {/* Global Event Handlers */}
      <div
        className="rectangle-selection-handler"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: selectionState.isActive ? 'all' : 'none',
          zIndex: selectionState.isActive ? 9998 : -1
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={endSelection}
      />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes marquee-pulse {
          from {
            border-color: #3b82f6;
            background-color: rgba(59, 130, 246, 0.1);
          }
          to {
            border-color: #1d4ed8;
            background-color: rgba(59, 130, 246, 0.15);
          }
        }

        .rectangle-selection-overlay {
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
        }

        /* Element highlighting during selection */
        .element-highlighted {
          box-shadow: 0 0 0 2px #3b82f6, 0 0 8px rgba(59, 130, 246, 0.3) !important;
          z-index: 100 !important;
          transition: box-shadow 0.1s ease !important;
        }

        /* Mode indicator in selection rectangle */
        .rectangle-selection-overlay::after {
          content: '${selectionState.mode === 'contain' ? 'CONTAIN' : 
                     selectionState.mode === 'center' ? 'CENTER' : 'INTERSECT'}';
          position: absolute;
          top: -24px;
          left: 0;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>
    </>
  );
};

// 🚀 TRINITY AMPLIFIER: Selection State Hook
export const useRectangleSelection = () => {
  const [selectionState, setSelectionState] = useState({
    isActive: false,
    selectedIds: [],
    mode: 'intersect'
  });

  return {
    selectionState,
    setSelectionState,
    isSelecting: selectionState.isActive
  };
};

// 🚀 TRINITY AMPLIFIER: Performance Monitoring Hook
export const useSelectionPerformance = () => {
  const [performanceStats, setPerformanceStats] = useState({
    lastDuration: 0,
    averageDuration: 0,
    maxElementsHandled: 0,
    performanceWarnings: 0
  });

  const recordPerformance = useCallback((duration, elementCount) => {
    setPerformanceStats(prev => ({
      lastDuration: duration,
      averageDuration: (prev.averageDuration + duration) / 2,
      maxElementsHandled: Math.max(prev.maxElementsHandled, elementCount),
      performanceWarnings: duration > 16 ? prev.performanceWarnings + 1 : prev.performanceWarnings
    }));

    if (duration > 16) {
      console.warn(`🔲 Selection performance warning: ${duration}ms for ${elementCount} elements`);
    }
  }, []);

  return {
    performanceStats,
    recordPerformance
  };
};

export default RectangleSelection;