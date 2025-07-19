/**
 * Enterprise Canvas Drag Preview Layer
 * Smooth, elegant drag ghosts following cursor
 */

import React from 'react';
import { useDragLayer } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { DraggableBoard, ItemTypes } from './DraggableBoard.jsx';
import { DraggableElementNew } from './DraggableElementNew.jsx';

// Calculate drag preview position
function getItemStyles(currentOffset) {
  if (!currentOffset) {
    return { display: 'none' };
  }

  const { x, y } = currentOffset;
  
  return {
    position: 'fixed',
    pointerEvents: 'none',
    left: 0,
    top: 0,
    transform: `translate(${x}px, ${y}px)`,
    zIndex: 10000,
  };
}

export const CanvasDragPreview = () => {
  const {
    isDragging,
    item,
    itemType,
    currentOffset,
  } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  if (!isDragging || !currentOffset || !item) {
    return null;
  }

  // Render preview based on item type
  const renderPreview = () => {
    const element = item.element;
    
    if (!element) return null;

    // Common preview wrapper with elegant styling
    const PreviewWrapper = ({ children, badge }) => (
      <div
        style={{
          opacity: 0.9,
          transform: 'scale(1.05)',
          filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))',
          pointerEvents: 'none'
        }}
        className="relative"
      >
        {children}
        
        {/* Drag Badge */}
        <div className="absolute -top-3 -right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
          {badge}
        </div>

        {/* AI Badge for AI-generated elements */}
        {element.data?.aiGenerated && (
          <div className="absolute -top-3 -left-3 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
            AI
          </div>
        )}

        {/* Elegant glow effect */}
        <div className="absolute inset-0 bg-blue-400 opacity-20 blur-xl rounded-xl -z-10" />
      </div>
    );

    // Board preview
    if (itemType === ItemTypes.BOARD) {
      return (
        <PreviewWrapper badge="BOARD">
          <div
            className="bg-white dark:bg-gray-800 border-2 border-blue-400 rounded-xl p-4 min-w-[300px] min-h-[200px]"
            style={{
              width: element.size?.width || 300,
              height: element.size?.height || 250
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {element.data?.title || 'Untitled Board'}
              </h3>
              <span className="text-xs text-gray-500">Moving...</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {element.data?.elements?.length || 0} items
            </div>
          </div>
        </PreviewWrapper>
      );
    }

    // Element preview
    return (
      <PreviewWrapper badge={itemType.toUpperCase()}>
        <DraggableElementNew
          element={{
            ...element,
            selected: false,
            position: { x: 0, y: 0 } // Reset position for preview
          }}
          onUpdate={() => {}}
          onDelete={() => {}}
        />
      </PreviewWrapper>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        style={getItemStyles(currentOffset)}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ 
          duration: 0.2, 
          ease: 'easeOut',
          type: 'spring',
          damping: 20
        }}
      >
        {renderPreview()}
      </motion.div>
    </AnimatePresence>
  );
};