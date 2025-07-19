/**
 * Enhanced Drag Preview Layer
 * Following GPT 4.1 best practices for fluid drag preview
 */

import React from 'react';
import { useDragLayer } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';

// Calculate position styles for the drag preview
function getItemStyles(currentOffset) {
  if (!currentOffset) {
    return { display: 'none' };
  }
  
  const { x, y } = currentOffset;
  
  return {
    pointerEvents: 'none',
    position: 'fixed',
    left: 0,
    top: 0,
    transform: `translate(${x}px, ${y}px)`,
    zIndex: 9999,
  };
}

export default function DragPreviewLayer({ renderPreview }) {
  const {
    isDragging,
    item,
    itemType,
    currentOffset,
  } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(), // Use source client offset for smooth following
  }));

  if (!isDragging || !currentOffset) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        style={getItemStyles(currentOffset)}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {/* Render the preview using the provided render function */}
        {renderPreview({ item, itemType })}
      </motion.div>
    </AnimatePresence>
  );
}