/**
 * Consolidate Button - Floating action button for temporary projects
 * 
 * Shows when current project is temporary and allows consolidation
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Save, Sparkles } from 'lucide-react';

const ConsolidateButton = ({ 
  isVisible, 
  nodeCount = 0, 
  onClick 
}) => {
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed top-4 right-4 z-40"
    >
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium group"
      >
        <div className="flex items-center gap-2">
          <Save className="w-5 h-5" />
          <span>Save as Project</span>
        </div>
        
        {nodeCount > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-sm">
            <Sparkles className="w-4 h-4" />
            <span>{nodeCount}</span>
          </div>
        )}
        
        {/* Pulsing indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      </motion.button>
      
      {/* Tooltip */}
      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Convert brainstorm to permanent project
      </div>
    </motion.div>
  );
};

export default ConsolidateButton;