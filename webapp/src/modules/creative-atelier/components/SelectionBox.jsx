/**
 * SelectionBox - Visual component for drag selection rectangle
 * Used in Creative Atelier for multi-element selection
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SelectionBox = ({ box }) => {
  if (!box) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="absolute pointer-events-none z-[9999]"
        style={{
          left: box.x,
          top: box.y,
          width: box.width,
          height: box.height
        }}
      >
        {/* Main selection rectangle */}
        <div className="absolute inset-0 border-2 border-blue-500 bg-blue-500/10 backdrop-blur-[1px] rounded-sm">
          {/* Corner indicators */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-500 rounded-full shadow-md" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full shadow-md" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-500 rounded-full shadow-md" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full shadow-md" />
        </div>
        
        {/* Animated dashed border overlay */}
        <svg className="absolute inset-0 w-full h-full">
          <rect
            x="1"
            y="1"
            width="calc(100% - 2px)"
            height="calc(100% - 2px)"
            fill="none"
            stroke="rgba(59, 130, 246, 0.9)"
            strokeWidth="1"
            strokeDasharray="8,4"
            className="animate-[dash_1.5s_linear_infinite]"
          />
        </svg>

        {/* Selection info badge */}
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
          Selecting...
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// CSS animation styles
if (typeof document !== 'undefined') {
  const styleId = 'selection-box-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes dash {
        to {
          stroke-dashoffset: -24;
        }
      }
    `;
    document.head.appendChild(style);
  }
}