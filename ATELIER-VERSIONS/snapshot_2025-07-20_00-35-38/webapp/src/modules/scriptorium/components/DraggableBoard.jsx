/**
 * Draggable Board Component - React DnD Implementation
 * Supports nested boards, AI integration, and smooth drag previews
 */

import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { BoardCard } from './cards/BoardCard.jsx';
import { ELEMENT_TYPES } from '../types.js';

// Item types for React DnD
export const ItemTypes = {
  BOARD: 'board',
  NOTE: 'note',
  IMAGE: 'image',
  LINK: 'link',
  AI: 'ai'
};

export const DraggableBoard = ({ 
  element, 
  onUpdate, 
  onDelete, 
  onDropElement, 
  onAICallback,
  onEventBusEmit,
  children 
}) => {
  // Drag configuration
  const [{ isDragging }, dragRef] = useDrag({
    type: ItemTypes.BOARD,
    item: () => ({
      id: element.id,
      type: ItemTypes.BOARD,
      element: element,
      sourceParent: element.parentId || 'root'
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      // EventBus integration - drag end
      if (onEventBusEmit) {
        onEventBusEmit('canvas.board.drag_end', {
          boardId: item.id,
          didDrop: monitor.didDrop(),
          timestamp: Date.now()
        });
      }
    }
  });

  // Drop configuration - accepts all types
  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: [ItemTypes.BOARD, ItemTypes.NOTE, ItemTypes.IMAGE, ItemTypes.LINK, ItemTypes.AI],
    canDrop: (item) => {
      // Prevent dropping board into itself or its children
      if (item.type === ItemTypes.BOARD && item.id === element.id) {
        return false;
      }
      // TODO: Add logic to prevent dropping parent into child
      return true;
    },
    drop: (item, monitor) => {
      // Only handle drop if not handled by child
      if (!monitor.didDrop()) {
        console.log('🎯 Board drop:', item.id, '→', element.id);
        
        // Handle the drop
        if (onDropElement) {
          onDropElement(item, element.id);
        }

        // AI Callback integration
        if (onAICallback && item.element?.data?.aiGenerated) {
          onAICallback('element_moved_to_board', {
            elementId: item.id,
            boardId: element.id,
            aiGenerated: true
          });
        }

        // EventBus integration
        if (onEventBusEmit) {
          onEventBusEmit('canvas.element.dropped', {
            elementId: item.id,
            targetBoardId: element.id,
            elementType: item.type,
            timestamp: Date.now()
          });
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  // Combine refs
  const ref = (node) => {
    dragRef(dropRef(node));
  };

  return (
    <motion.div
      ref={ref}
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: element.size?.width || 300,
        height: element.size?.height || 250,
        opacity: isDragging ? 0 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: element.zIndex || 1
      }}
      className={`
        ${isOver && canDrop ? 'ring-4 ring-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''}
        ${element.selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        transition-all duration-200
      `}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: isDragging ? 0 : 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Board Card Component */}
      <BoardCard 
        element={element}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />

      {/* Nested Elements Container */}
      <div className="absolute inset-4 top-12 overflow-hidden">
        {children}
      </div>

      {/* Drop Zone Visual Feedback */}
      {isOver && canDrop && (
        <motion.div
          className="absolute inset-0 bg-blue-500/10 border-2 border-blue-400 border-dashed rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Selection Indicator */}
      {element.selected && (
        <motion.div
          className="absolute -inset-1 border-2 border-blue-500 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
};