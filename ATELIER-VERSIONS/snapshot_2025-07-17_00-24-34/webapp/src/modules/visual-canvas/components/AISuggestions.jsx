import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles, ChevronRight } from 'lucide-react';
import { useUnifiedStore } from '../../../store/unifiedStore';

export const AISuggestions = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const { ai, canvas, analyzeCanvasContext, clearAISuggestions, dismissAISuggestion } = useUnifiedStore();
  const suggestions = ai?.suggestions || [];

  // Trigger analysis when canvas changes significantly
  useEffect(() => {
    const elementCount = canvas?.elements?.length || 0;
    if (elementCount > 0 && elementCount % 3 === 0) {
      // Analyze every 3 elements added
      analyzeCanvasContext();
    }
  }, [canvas?.elements?.length, analyzeCanvasContext]);

  if (!isVisible || suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-20 right-6 z-40 max-w-sm"
      >
        <div className={`
          bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
          ${isExpanded ? 'w-96' : 'w-auto'}
        `}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Bot className="w-5 h-5 text-purple-500" />
                <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                AI Suggestions ({suggestions.length})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <ChevronRight 
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`} 
                />
              </button>
              <button
                onClick={() => {
                  clearAISuggestions();
                  setIsVisible(false);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Suggestions */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      <button
                        onClick={() => {
                          // Handle suggestion click
                          console.log('🤖 Suggestion clicked:', suggestion);
                          // Could open a modal with detailed workflow
                        }}
                        className="w-full text-left p-2 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 
                                 transition-colors group"
                      >
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {suggestion}
                        </p>
                        <span className="text-xs text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          Click for details →
                        </span>
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Actions */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <button
                    onClick={() => analyzeCanvasContext()}
                    className="w-full px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 
                             transition-colors flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Get More Suggestions</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed state */}
          {!isExpanded && (
            <div className="px-3 py-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-xs">
                {suggestions[0]}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};