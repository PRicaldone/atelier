/**
 * Draggable Element Component
 * Can be dragged between boards
 */

import React from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';

const ItemTypes = {
  ELEMENT: 'element'
};

export function DraggableElement({ element, parentBoardId }) {
  const [{ isDragging }, dragRef] = useDrag({
    type: ItemTypes.ELEMENT,
    item: () => ({
      id: element.id,
      type: ItemTypes.ELEMENT,
      originalParent: parentBoardId,
      elementType: element.type
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const renderElementContent = () => {
    switch (element.type) {
      case 'note':
        return (
          <div className="p-3">
            <h4 className="font-medium text-gray-800 dark:text-white mb-1">
              {element.data?.title || 'Note'}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {element.data?.content || 'Empty note'}
            </p>
          </div>
        );
      
      case 'image':
        return (
          <div className="p-2">
            <img 
              src={element.data?.src || 'https://via.placeholder.com/200x150'} 
              alt={element.data?.alt || 'Image'}
              className="w-full h-32 object-cover rounded"
            />
          </div>
        );
      
      case 'link':
        return (
          <div className="p-3">
            <a 
              href={element.data?.url || '#'} 
              className="text-blue-500 hover:text-blue-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {element.data?.title || 'Link'}
            </a>
          </div>
        );
      
      default:
        return (
          <div className="p-3">
            <span className="text-gray-500">Unknown element type</span>
          </div>
        );
    }
  };

  return (
    <motion.div
      ref={dragRef}
      className={`
        bg-white dark:bg-gray-700 
        rounded-lg shadow-md hover:shadow-lg
        cursor-move
        transition-all duration-200
        ${isDragging ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        ${element.selected ? 'ring-2 ring-blue-500' : ''}
      `}
      style={{
        width: element.size?.width || 280,
        minHeight: element.size?.height || 'auto'
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Element Type Badge */}
      <div className="flex items-center justify-between px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-t-lg">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {element.type}
        </span>
        <span className="text-xs text-gray-400">
          ⋮⋮
        </span>
      </div>

      {/* Element Content */}
      {renderElementContent()}
    </motion.div>
  );
}