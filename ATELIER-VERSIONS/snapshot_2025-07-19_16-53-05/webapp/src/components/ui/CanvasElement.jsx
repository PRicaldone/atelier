/**
 * Canvas Element - Base component for all canvas elements
 * Handles positioning, dragging, and element-specific rendering
 */

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';

const CanvasElement = ({ element, onUpdate, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const elementRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: element.id,
    data: {
      type: 'canvas-element',
      element
    }
  });

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsSelected(true);
    // Enter edit mode
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    // Show context menu
  };

  const style = {
    position: 'absolute',
    left: element.position.x,
    top: element.position.y,
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    width: element.data.width,
    height: element.data.height === 'auto' ? 'auto' : element.data.height
  };

  const renderElementContent = () => {
    switch (element.type) {
      case 'note':
        return (
          <div className="element-note">
            <h3>{element.data.title}</h3>
            <p>{element.data.content}</p>
          </div>
        );

      case 'image':
        return (
          <div className="element-image">
            <img 
              src={element.data.src} 
              alt={element.data.alt}
              style={{ 
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
                display: 'block',
                pointerEvents: 'none'
              }}
            />
          </div>
        );

      case 'board':
        return (
          <div className="element-board">
            <h3>{element.data.title}</h3>
            <div className="board-preview">
              {Array(4).fill(null).map((_, i) => (
                <div key={i} className="board-preview-item" />
              ))}
            </div>
          </div>
        );

      case 'link':
        return (
          <div className="element-link">
            <h3>{element.data.title}</h3>
            <p>{element.data.description}</p>
            <a 
              href={element.data.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="link-url"
            >
              {element.data.url}
            </a>
          </div>
        );

      case 'reference':
        return (
          <div className="element-reference">
            <h3>Reference</h3>
            <div className="reference-grid">
              {element.data.items?.map((item, i) => (
                <div key={i} className="reference-item">
                  {item.title}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="element-unknown">
            <h3>Unknown Element</h3>
            <p>Type: {element.type}</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      className={`canvas-element ${element.type ? `element-${element.type}` : ''}`}
      style={style}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
      {...listeners}
      {...attributes}
    >
      {renderElementContent()}
      
      {/* Hover Controls */}
      {isHovered && (
        <motion.div
          className="element-controls"
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            display: 'flex',
            gap: '4px'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            className="element-control-btn"
            onClick={(e) => {
              e.stopPropagation();
              // Edit element
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              width: '24px',
              height: '24px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ✏️
          </motion.button>
          
          <motion.button
            className="element-control-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              width: '24px',
              height: '24px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🗑️
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CanvasElement;