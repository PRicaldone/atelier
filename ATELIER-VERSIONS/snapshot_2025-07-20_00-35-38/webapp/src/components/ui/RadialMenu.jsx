/**
 * Radial Menu - Circular menu for quick element creation
 * Appears on double-click with smooth animations
 */

import React from 'react';
import { motion } from 'framer-motion';

const RadialMenu = ({ position, onElementCreate, onClose }) => {
  const menuItems = [
    { 
      type: 'note', 
      icon: '📝', 
      label: 'note',
      position: 'top',
      description: 'Create a text note'
    },
    { 
      type: 'image', 
      icon: '📎', 
      label: 'file',
      position: 'right',
      description: 'Upload an image or file'
    },
    { 
      type: 'link', 
      icon: '🔗', 
      label: 'link',
      position: 'bottom',
      description: 'Add a web link'
    },
    { 
      type: 'reference', 
      icon: '📁', 
      label: 'ref',
      position: 'left',
      description: 'Create a reference'
    },
    { 
      type: 'board', 
      icon: '📋', 
      label: 'board',
      position: 'top-right',
      description: 'Create a new board'
    }
  ];

  const handleItemClick = (item) => {
    const elementPosition = {
      x: position.x + 120, // Center of radial menu
      y: position.y + 120
    };
    
    onElementCreate(item.type, elementPosition);
    
    // Emit event for analytics
    if (window.__eventBus) {
      window.__eventBus.emit('ui:radial-menu:element-created', {
        type: item.type,
        position: elementPosition,
        timestamp: Date.now()
      });
    }
  };

  return (
    <motion.div
      className="radial-menu active"
      style={{
        left: position.x,
        top: position.y
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Center circle */}
      <motion.div
        className="radial-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
      >
        +
      </motion.div>

      {/* Menu items */}
      {menuItems.map((item, index) => (
        <motion.div
          key={item.type}
          className={`radial-option ${item.position}`}
          onClick={() => handleItemClick(item)}
          title={item.description}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 0.1 + (index * 0.05), 
            duration: 0.2,
            ease: 'easeOut'
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="radial-icon">{item.icon}</span>
          <span className="radial-label">{item.label}</span>
        </motion.div>
      ))}

      {/* Backdrop to close menu */}
      <motion.div
        className="radial-backdrop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: 'transparent'
        }}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
    </motion.div>
  );
};

export default RadialMenu;