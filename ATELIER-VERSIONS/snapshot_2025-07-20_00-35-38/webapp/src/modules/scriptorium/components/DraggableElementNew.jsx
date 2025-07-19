/**
 * Universal Draggable Element Component - React DnD Implementation
 * Handles all element types: note, image, link, ai
 */

import React from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import { NoteCard } from './cards/NoteCard.jsx';
import { ImageCard } from './cards/ImageCard.jsx';
import { LinkCard } from './cards/LinkCard.jsx';
import { AICard } from './cards/AICard.jsx';
import { ELEMENT_TYPES } from '../types.js';
import { ItemTypes } from './DraggableBoard.jsx';

export const DraggableElementNew = ({ 
  element, 
  onUpdate, 
  onDelete, 
  onAICallback,
  onEventBusEmit,
  onClick,
  onDoubleClick
}) => {
  // Map element types to React DnD item types
  const getItemType = (elementType) => {
    switch (elementType) {
      case ELEMENT_TYPES.NOTE:
        return ItemTypes.NOTE;
      case ELEMENT_TYPES.IMAGE:
        return ItemTypes.IMAGE;
      case ELEMENT_TYPES.LINK:
        return ItemTypes.LINK;
      case ELEMENT_TYPES.AI:
        return ItemTypes.AI;
      default:
        return ItemTypes.NOTE;
    }
  };

  // Drag configuration
  const [{ isDragging }, dragRef] = useDrag({
    type: getItemType(element.type),
    item: () => ({
      id: element.id,
      type: getItemType(element.type),
      element: element,
      sourceParent: element.parentId || 'root'
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      // EventBus integration - drag end
      if (onEventBusEmit) {
        onEventBusEmit('canvas.element.drag_end', {
          elementId: item.id,
          elementType: item.type,
          didDrop: monitor.didDrop(),
          timestamp: Date.now()
        });
      }

      // AI Callback for AI-generated elements
      if (onAICallback && element.data?.aiGenerated) {
        onAICallback('ai_element_drag_end', {
          elementId: item.id,
          didDrop: monitor.didDrop()
        });
      }
    }
  });

  // Render appropriate card component
  const renderCard = () => {
    const cardProps = {
      element,
      onUpdate,
      onDelete
    };

    switch (element.type) {
      case ELEMENT_TYPES.NOTE:
        return <NoteCard {...cardProps} />;
      case ELEMENT_TYPES.IMAGE:
        return <ImageCard {...cardProps} />;
      case ELEMENT_TYPES.LINK:
        return <LinkCard {...cardProps} />;
      case ELEMENT_TYPES.AI:
        return <AICard {...cardProps} />;
      default:
        return <NoteCard {...cardProps} />;
    }
  };

  // Handle click events
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(element.id, e.metaKey || e.ctrlKey);
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (onDoubleClick) {
      onDoubleClick(element);
    }
  };

  return (
    <motion.div
      ref={dragRef}
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: element.size?.width || 'auto',
        height: element.size?.height || 'auto',
        opacity: isDragging ? 0 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: element.zIndex || 1,
        rotate: element.rotation || 0
      }}
      className={`
        select-none
        ${element.selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${element.locked ? 'cursor-not-allowed' : ''}
        transition-all duration-200
      `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: isDragging ? 0 : 1,
        rotate: element.rotation || 0
      }}
      whileHover={{ 
        scale: element.locked ? 1 : 1.02,
        transition: { duration: 0.2 }
      }}
      transition={{ duration: 0.2 }}
    >
      {renderCard()}

      {/* AI Generated Badge */}
      {element.data?.aiGenerated && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
          AI
        </div>
      )}

      {/* Selection Indicator */}
      {element.selected && (
        <motion.div
          className="absolute -inset-1 border-2 border-blue-500 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Locked Indicator */}
      {element.locked && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs">
          🔒
        </div>
      )}
    </motion.div>
  );
};