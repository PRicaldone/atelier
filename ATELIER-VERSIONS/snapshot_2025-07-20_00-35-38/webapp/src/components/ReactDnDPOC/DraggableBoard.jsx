/**
 * Draggable & Droppable Board Component
 * Can be dragged and can accept other boards and elements
 */

import React from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { motion } from 'framer-motion';

const ItemTypes = {
  BOARD: 'board',
  ELEMENT: 'element'
};

export function DraggableBoard({ board, onDropItem, onMoveBoard, children }) {
  // Make the board draggable
  const [{ isDragging }, dragRef] = useDrag({
    type: ItemTypes.BOARD,
    item: () => ({
      id: board.id,
      type: ItemTypes.BOARD,
      originalParent: board.parentId
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Make the board accept drops (both elements and other boards)
  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: [ItemTypes.ELEMENT, ItemTypes.BOARD],
    canDrop: (item) => {
      // Prevent dropping a board into itself or its children
      if (item.type === ItemTypes.BOARD) {
        return item.id !== board.id && !isChildBoard(item.id, board.id);
      }
      return true;
    },
    drop: (item, monitor) => {
      if (!monitor.didDrop()) {
        onDropItem(item, board.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  // Helper to check if a board is a child of another
  const isChildBoard = (parentId, childId) => {
    // This would check your board hierarchy
    // For now, simple implementation
    return false;
  };

  // Combine drag and drop refs
  const ref = (node) => {
    dragRef(dropRef(node));
  };

  return (
    <motion.div
      ref={ref}
      className={`
        relative p-4 rounded-xl
        ${board.data?.backgroundColor || 'bg-white dark:bg-gray-800'}
        ${isDragging ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        ${isOver && canDrop ? 'ring-4 ring-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''}
        border-2 border-gray-200 dark:border-gray-700
        cursor-move
        transition-all duration-200
      `}
      style={{
        minWidth: '300px',
        minHeight: '250px',
        width: board.size?.width || 300,
        height: board.size?.height || 250,
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Board Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {board.data?.title || 'Untitled Board'}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Board
        </span>
      </div>

      {/* Drop Zone Indicator */}
      {isOver && canDrop && (
        <motion.div
          className="absolute inset-0 bg-blue-500/10 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Board Content */}
      <div className="space-y-2">
        {children}
      </div>

      {/* Nested Boards Count */}
      {board.data?.elements?.length > 0 && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {board.data.elements.length} items
        </div>
      )}
    </motion.div>
  );
}