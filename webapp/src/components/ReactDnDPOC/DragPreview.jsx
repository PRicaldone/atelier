/**
 * Custom Drag Preview Component
 * Shows a live preview of the dragged item
 */

import React from 'react';
import { useDragLayer } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { DraggableBoard } from './DraggableBoard';
import { DraggableElement } from './DraggableElement';

export function DragPreview({ boards, elements }) {
  const {
    isDragging,
    item,
    itemType,
    currentOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging || !currentOffset) {
    return null;
  }

  const { x, y } = currentOffset;

  const renderPreview = () => {
    if (itemType === 'board' && boards[item.id]) {
      const board = boards[item.id];
      return (
        <div style={{ 
          opacity: 0.8, 
          transform: 'scale(1.05)',
          pointerEvents: 'none'
        }}>
          <DraggableBoard 
            board={board} 
            onDropItem={() => {}} 
            onMoveBoard={() => {}}
          >
            {/* Show nested content if needed */}
          </DraggableBoard>
        </div>
      );
    }

    if (itemType === 'element' && elements[item.id]) {
      const element = elements[item.id];
      return (
        <div style={{ 
          opacity: 0.8, 
          transform: 'scale(1.05)',
          pointerEvents: 'none'
        }}>
          <DraggableElement 
            element={element} 
            parentBoardId={null}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      <motion.div
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 100,
          left: 0,
          top: 0,
          transform: `translate(${x - 20}px, ${y - 20}px)`,
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.9 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderPreview()}
      </motion.div>
    </AnimatePresence>
  );
}