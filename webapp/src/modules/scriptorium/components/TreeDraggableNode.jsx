import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { ELEMENT_TYPES } from '../types.js';

export const TreeDraggableNode = ({ 
  element, 
  children, 
  isSelected,
  isCurrentLevel,
  isInPath,
  className,
  style,
  onClick,
  onDoubleClick 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: `tree-${element.id}`,
    data: {
      element,
      source: 'tree',
      type: 'tree-node'
    }
  });

  const dragStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1
  } : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      layout
      className={`${className} ${isDragging ? 'z-50' : ''}`}
      style={{ ...style, ...dragStyle }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      {...attributes}
      {...listeners}
    >
      {children}
    </motion.div>
  );
};