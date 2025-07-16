/**
 * SelectionBox - Visual component for drag selection rectangle
 */

import React from 'react';
import { motion } from 'framer-motion';

export const SelectionBox = ({ box }) => {
  if (!box) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute pointer-events-none z-[9999]"
      style={{
        left: box.x,
        top: box.y,
        width: box.width,
        height: box.height
      }}
    >
      {/* Selection rectangle with animated border */}
      <div className="absolute inset-0 border-2 border-blue-500 bg-blue-500/10 rounded-sm">
        {/* Animated corner indicators */}
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
      </div>
      
      {/* Dashed border overlay for better visibility */}
      <svg className="absolute inset-0 w-full h-full">
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="none"
          stroke="rgba(59, 130, 246, 0.8)"
          strokeWidth="1"
          strokeDasharray="5,5"
          className="animate-[dash_20s_linear_infinite]"
        />
      </svg>
    </motion.div>
  );
};

// Add CSS animation for marching ants effect
const style = document.createElement('style');
style.textContent = `
  @keyframes dash {
    to {
      stroke-dashoffset: -100;
    }
  }
`;
document.head.appendChild(style);