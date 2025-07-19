/**
 * Custom Draggable Element - Pointer Events Based
 * Replaces React DnD with custom pointer events system
 */

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { NoteCard } from './cards/NoteCard.jsx';
import { ImageCard } from './cards/ImageCard.jsx';
import { LinkCard } from './cards/LinkCard.jsx';
import { AICard } from './cards/AICard.jsx';
import { BoardCard } from './cards/BoardCard.jsx';
import { ELEMENT_TYPES } from '../types.js';
import { useDropZone, setGlobalDragState } from '../hooks/useDropZone.js';

export const CustomDraggableElement = ({ 
  element, 
  onUpdate, 
  onDelete,
  onDrop,
  onClick,
  onDoubleClick,
  isDragging = false,
  customDragRef
}) => {
  
  // Setup dropzone for board elements (they can accept drops)
  const { getDropZoneProps, isOver, canDrop } = useDropZone(
    element.id,
    onDrop,
    (draggedElement) => {
      // Boards can accept any element, elements can't accept drops
      return element.type === ELEMENT_TYPES.BOARD && draggedElement.id !== element.id;
    }
  );

  // Handle drag start with custom pointer events
  const handlePointerDown = useCallback((e) => {
    // Only start drag on left click, not on interactive elements
    if (e.button !== 0 || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    
    console.log('🎯 Custom drag start for element:', element.id);
    
    // Set global drag state for dropzones
    setGlobalDragState(element, true);
    
    // Start custom drag via ref
    if (customDragRef?.current?.startDrag) {
      customDragRef.current.startDrag(element, e);
    }
    
    // Prevent text selection
    e.preventDefault();
  }, [element, customDragRef]);

  // Handle click events
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(element.id, e.metaKey || e.ctrlKey);
    }
  }, [element.id, onClick]);

  // Handle double click events
  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    if (onDoubleClick) {
      onDoubleClick(element);
    }
  }, [element, onDoubleClick]);

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
      case ELEMENT_TYPES.BOARD:
        return <BoardCard {...cardProps} />;
      default:
        return <NoteCard {...cardProps} />;
    }
  };

  // Combine dropzone props for boards
  const dropZoneProps = element.type === ELEMENT_TYPES.BOARD ? getDropZoneProps() : {};

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: element.size?.width || 'auto',
        height: element.size?.height || 'auto',
        opacity: isDragging ? 0 : 1, // Hide original during drag
        cursor: 'grab',
        zIndex: element.zIndex || 1,
        rotate: element.rotation || 0
      }}
      className={`
        select-none touch-none
        ${element.selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${element.locked ? 'cursor-not-allowed' : ''}
        ${isOver && canDrop ? 'ring-4 ring-green-400 bg-green-50 dark:bg-green-900/20' : ''}
        transition-all duration-200
      `}
      onPointerDown={handlePointerDown}
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
      {...dropZoneProps}
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

      {/* Drop Zone Visual Feedback for Boards */}
      {element.type === ELEMENT_TYPES.BOARD && isOver && canDrop && (
        <motion.div
          className="absolute inset-0 bg-green-500/20 border-2 border-green-400 border-dashed rounded-xl pointer-events-none"
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

      {/* Nested Elements for Boards */}
      {element.type === ELEMENT_TYPES.BOARD && element.data?.elements && (
        <div className="absolute inset-4 top-12 overflow-hidden">
          {element.data.elements.map(nestedElement => (
            <CustomDraggableElement
              key={nestedElement.id}
              element={{
                ...nestedElement,
                position: {
                  x: nestedElement.position.x - element.position.x,
                  y: nestedElement.position.y - element.position.y
                }
              }}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onDrop={onDrop}
              onClick={onClick}
              onDoubleClick={onDoubleClick}
              customDragRef={customDragRef}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};