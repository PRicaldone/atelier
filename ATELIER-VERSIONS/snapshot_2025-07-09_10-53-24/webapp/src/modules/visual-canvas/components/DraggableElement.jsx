import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useCanvasStore } from '../store.js';
import { BoardCard } from './cards/BoardCard.jsx';
import { NoteCard } from './cards/NoteCard.jsx';
import { ImageCard } from './cards/ImageCard.jsx';
import { LinkCard } from './cards/LinkCard.jsx';
import { AICard } from './cards/AICard.jsx';
import { ELEMENT_TYPES } from '../types.js';

export const DraggableElement = ({ element }) => {
  const { selectElement, updateElement, enterBoard } = useCanvasStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: element.id,
    data: element
  });

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
      // Enter board on double-click
      enterBoard(element.id);
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
        ${element.selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
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
      
      {/* Selection indicator */}
      {element.selected && (
        <motion.div
          className="absolute -inset-1 border-2 border-blue-500 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
      
      {/* Resize handles for selected elements */}
      {element.selected && !element.locked && (
        <>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize" />
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize" />
        </>
      )}
      
      {/* Locked indicator */}
      {element.locked && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs">
          🔒
        </div>
      )}
    </motion.div>
  );
};