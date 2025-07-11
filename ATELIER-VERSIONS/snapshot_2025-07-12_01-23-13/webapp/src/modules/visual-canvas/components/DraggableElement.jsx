import { motion } from 'framer-motion';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useCanvasStore } from '../store.js';
import { BoardCard } from './cards/BoardCard.jsx';
import { NoteCard } from './cards/NoteCard.jsx';
import { ImageCard } from './cards/ImageCard.jsx';
import { LinkCard } from './cards/LinkCard.jsx';
import { AICard } from './cards/AICard.jsx';
import { ELEMENT_TYPES } from '../types.js';

export const DraggableElement = ({ element }) => {
  const { selectElement, updateElement, navigateToBoard } = useCanvasStore();
  
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging
  } = useDraggable({
    id: element.id,
    data: element
  });

  // Droppable hook for boards
  const {
    isOver,
    setNodeRef: setDroppableRef,
    active
  } = useDroppable({
    id: `board-drop-${element.id}`,
    data: {
      boardId: element.id,
      type: 'board-drop-zone'
    },
    disabled: element.type !== ELEMENT_TYPES.BOARD
  });

  // Combine refs for boards
  const setNodeRef = (node) => {
    setDraggableRef(node);
    if (element.type === ELEMENT_TYPES.BOARD) {
      setDroppableRef(node);
    }
  };

  // Check if can drop on this board
  const canDrop = element.type === ELEMENT_TYPES.BOARD && 
                  active && 
                  active.id !== element.id;  // Can drop anything except itself
  const isDropping = isOver && canDrop;

  const style = {
    // Remove the CSS.Translate to fix ghosting - handled by position
    zIndex: isDragging ? 9999 : element.zIndex
  };

  const handleClick = (e) => {
    e.stopPropagation();
    selectElement(element.id, e.metaKey || e.ctrlKey);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (element.type === ELEMENT_TYPES.NOTE) {
      // Enable text editing mode for notes
      updateElement(element.id, { editing: true });
    } else if (element.type === ELEMENT_TYPES.BOARD) {
      // Enter board on double-click using smart navigation
      console.log('🖱️ Double-click navigation to board:', element.id);
      navigateToBoard(element.id);
    }
  };

  const renderCard = () => {
    switch (element.type) {
      case ELEMENT_TYPES.BOARD:
        return <BoardCard element={element} />;
      case ELEMENT_TYPES.NOTE:
        return <NoteCard element={element} />;
      case ELEMENT_TYPES.IMAGE:
        return <ImageCard element={element} />;
      case ELEMENT_TYPES.LINK:
        return <LinkCard element={element} />;
      case ELEMENT_TYPES.AI:
        return <AICard element={element} />;
      default:
        return <div>Unknown element type</div>;
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...style,
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0) rotate(${element.rotation}deg)`,
        visibility: element.visible ? 'visible' : 'hidden'
      }}
      className={`
        cursor-move select-none
        ${element.selected ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2' : ''}
        ${isDragging ? 'opacity-80 scale-105' : ''}
        ${element.locked ? 'cursor-not-allowed' : 'cursor-move'}
      `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      {...listeners}
      {...attributes}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      whileHover={{ 
        scale: element.locked ? 1 : 1.02,
        transition: { duration: 0.2 }
      }}
      whileDrag={{ 
        scale: 1.05,
        rotate: element.rotation + 2,
        transition: { duration: 0.1 }
      }}
    >
      {renderCard()}
      
      {/* Drop indicator for boards */}
      {isDropping && element.type === ELEMENT_TYPES.BOARD && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute inset-0 bg-blue-500 dark:bg-blue-600 bg-opacity-20 rounded-xl border-2 border-blue-500 dark:border-blue-400 border-dashed z-50 pointer-events-none"
        />
      )}
      
      {/* Hover indicator when dragging over board */}
      {canDrop && !isDropping && element.type === ELEMENT_TYPES.BOARD && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-transparent hover:ring-blue-300 dark:hover:ring-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all z-40 pointer-events-none" />
      )}
      
      {/* Selection indicator */}
      {element.selected && (
        <motion.div
          className="absolute -inset-1 border-2 border-blue-500 dark:border-blue-400 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
      
      {/* Resize handles for selected elements */}
      {element.selected && !element.locked && (
        <>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 border border-white dark:border-gray-800 rounded-full cursor-se-resize" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 border border-white dark:border-gray-800 rounded-full cursor-ne-resize" />
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 border border-white dark:border-gray-800 rounded-full cursor-nw-resize" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 border border-white dark:border-gray-800 rounded-full cursor-sw-resize" />
        </>
      )}
      
      {/* Locked indicator */}
      {element.locked && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-gray-500 dark:bg-gray-400 text-white dark:text-gray-800 rounded-full flex items-center justify-center text-xs">
          🔒
        </div>
      )}
    </motion.div>
  );
};