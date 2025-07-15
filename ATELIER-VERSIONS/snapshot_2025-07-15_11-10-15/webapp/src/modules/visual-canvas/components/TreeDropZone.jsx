import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { ELEMENT_TYPES } from '../types.js';

export const TreeDropZone = ({ 
  boardId, 
  children, 
  className = '',
  isCurrentLevel = false
}) => {
  const {
    isOver,
    setNodeRef,
    active
  } = useDroppable({
    id: `tree-drop-${boardId}`,
    data: {
      boardId,
      type: 'tree-drop-zone'
    }
  });

  // Check if the active item can be dropped here
  const canDrop = active && !active.id.startsWith('tree-');
  const isDropping = isOver && canDrop;

  return (
    <div
      ref={setNodeRef}
      className={`relative ${className}`}
    >
      {/* Drop indicator */}
      {isDropping && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute inset-0 bg-blue-500 dark:bg-blue-600 bg-opacity-20 rounded-lg border-2 border-blue-500 dark:border-blue-400 border-dashed z-10"
        />
      )}
      
      {/* Highlight on hover when dragging */}
      {canDrop && !isDropping && (
        <div className="absolute inset-0 rounded-lg ring-2 ring-transparent hover:ring-blue-300 dark:hover:ring-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all z-10 pointer-events-none" />
      )}
      
      {children}
    </div>
  );
};