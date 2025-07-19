import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Search, Sparkles } from 'lucide-react';

const AICommands = {
  '@expand': { label: 'Expand Node', description: 'Generate 5 sub-ideas from this node', icon: '🌱' },
  '@connect': { label: 'Find Connections', description: 'Find hidden relations between nodes', icon: '🔗' },
  '@visual': { label: 'Visual References', description: 'Suggest visual references', icon: '🎨' },
  '@technical': { label: 'Technical Breakdown', description: 'Houdini/Nuke technical setup', icon: '⚙️' },
  '@narrative': { label: 'Story Arc', description: 'Develop narrative structure', icon: '📖' },
  '/image': { label: 'Search Images', description: 'Find and insert relevant images', icon: '🖼️' },
  '/houdini': { label: 'Houdini Template', description: 'Generate Houdini node setup', icon: '🎬' },
  '/concept': { label: 'Concept Art', description: 'Generate concept art prompt', icon: '🎭' }
};

const AICommandPalette = ({ isOpen, onClose, onCommand, position }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const filteredCommands = Object.entries(AICommands).filter(([key, value]) =>
    key.toLowerCase().includes(search.toLowerCase()) ||
    value.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleCommand(filteredCommands[selectedIndex][0]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleCommand = (command) => {
    onCommand(command);
    setSearch('');
    setSelectedIndex(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop for click outside */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
        className="absolute z-50 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        style={{
          left: position.x,
          top: position.y
        }}
      >
        {/* Search Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type @ or / for AI commands..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
            />
            <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-80 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No commands found
            </div>
          ) : (
            <div className="py-1">
              {filteredCommands.map(([key, command], index) => (
                <button
                  key={key}
                  onClick={() => handleCommand(key)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-3 py-2 flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    index === selectedIndex ? 'bg-gray-50 dark:bg-gray-800' : ''
                  }`}
                >
                  <span className="text-xl mt-0.5">{command.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {command.label}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{key}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {command.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">Enter</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AICommandPalette;