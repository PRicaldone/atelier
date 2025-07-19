/**
 * Custom Drag Ghost Overlay
 * Smooth 60fps ghost element that follows cursor
 * Portal-based, rendered outside React tree for performance
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const CustomDragGhost = ({ 
  isDragging, 
  draggedElement, 
  position, 
  onRender = null 
}) => {
  
  if (!isDragging || !draggedElement || !position) {
    return null;
  }

  // Create ghost content based on element type
  const renderGhostContent = () => {
    const { type, data } = draggedElement;
    
    const ghostStyle = {
      opacity: 0.8,
      transform: 'scale(1.05) rotate(2deg)',
      filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.3))',
      pointerEvents: 'none',
      zIndex: 10000
    };

    switch (type) {
      case 'note':
        return (
          <div 
            style={ghostStyle}
            className="bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4 min-w-[200px] max-w-[300px] shadow-xl"
          >
            <div className="text-sm font-medium text-gray-800 dark:text-white line-clamp-3">
              {data?.content || 'Note'}
            </div>
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full px-2 py-1 text-xs font-bold">
              NOTE
            </div>
          </div>
        );
        
      case 'board':
        return (
          <div 
            style={ghostStyle}
            className="bg-white dark:bg-gray-800 border-2 border-blue-400 rounded-xl p-4 min-w-[250px] min-h-[150px] shadow-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {data?.title || 'Board'}
              </h3>
              <span className="text-xs text-gray-500">Moving...</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {data?.elements?.length || 0} items
            </div>
            <div className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full px-2 py-1 text-xs font-bold">
              BOARD
            </div>
          </div>
        );
        
      case 'image':
        return (
          <div 
            style={ghostStyle}
            className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-2 shadow-xl"
          >
            <div className="w-32 h-24 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
              <span className="text-gray-500 text-xs">Image</span>
            </div>
            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full px-2 py-1 text-xs font-bold">
              IMG
            </div>
          </div>
        );
        
      case 'link':
        return (
          <div 
            style={ghostStyle}
            className="bg-blue-50 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-3 min-w-[200px] shadow-xl"
          >
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {data?.title || data?.url || 'Link'}
            </div>
            <div className="absolute -top-2 -right-2 bg-cyan-500 text-white rounded-full px-2 py-1 text-xs font-bold">
              LINK
            </div>
          </div>
        );
        
      case 'ai':
        return (
          <div 
            style={ghostStyle}
            className="bg-purple-50 dark:bg-purple-900 border-2 border-purple-300 dark:border-purple-700 rounded-lg p-3 min-w-[200px] shadow-xl"
          >
            <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
              {data?.content || 'AI Element'}
            </div>
            <div className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full px-2 py-1 text-xs font-bold">
              AI
            </div>
          </div>
        );
        
      default:
        return (
          <div 
            style={ghostStyle}
            className="bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-xl"
          >
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {type.toUpperCase()}
            </div>
          </div>
        );
    }
  };

  // Ghost container with precise positioning
  const ghostContainer = (
    <motion.div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        pointerEvents: 'none',
        zIndex: 10000,
        transform: 'translate3d(0, 0, 0)', // Hardware acceleration
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ 
        duration: 0.15, 
        ease: 'easeOut',
        type: 'spring',
        damping: 25,
        stiffness: 300
      }}
    >
      <div className="relative">
        {renderGhostContent()}
        
        {/* Elegant glow effect */}
        <div className="absolute inset-0 bg-blue-400 opacity-10 blur-xl rounded-xl -z-10" />
        
        {/* AI badge for AI-generated elements */}
        {draggedElement.data?.aiGenerated && (
          <div className="absolute -top-3 -left-3 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
            AI
          </div>
        )}
      </div>
    </motion.div>
  );

  // Render via portal for performance (outside React tree)
  return createPortal(
    <AnimatePresence mode="wait">
      {ghostContainer}
    </AnimatePresence>,
    document.body
  );
};