/**
 * Mind Garden v5.1 - Keyboard Shortcuts Help Panel
 * Day 5: Comprehensive keyboard navigation help
 */

import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Keyboard, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown,
  CornerDownLeft,
  Command,
  Shift,
  Target,
  Copy,
  Trash2,
  Edit3,
  Search,
  Map,
  Zap,
  Settings
} from 'lucide-react';
import { KEYBOARD_SHORTCUTS } from './KeyboardNavigation';

const KeyboardShortcutsHelp = memo(({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('navigation');

  const tabs = [
    { id: 'navigation', label: 'Navigation', icon: <ArrowRight className="w-4 h-4" /> },
    { id: 'quickActions', label: 'Quick Actions', icon: <Zap className="w-4 h-4" /> },
    { id: 'branchTypes', label: 'Branch Types', icon: <Target className="w-4 h-4" /> },
    { id: 'global', label: 'Global', icon: <Command className="w-4 h-4" /> }
  ];

  const getKeyIcon = (key) => {
    switch (key) {
      case 'Arrow Keys':
        return <div className="flex space-x-1">
          <ArrowUp className="w-3 h-3" />
          <ArrowDown className="w-3 h-3" />
          <ArrowLeft className="w-3 h-3" />
          <ArrowRight className="w-3 h-3" />
        </div>;
      case 'Enter':
        return <CornerDownLeft className="w-3 h-3" />;
      case 'Ctrl/Cmd + F':
        return <Search className="w-3 h-3" />;
      case 'm':
        return <Map className="w-3 h-3" />;
      case 'c':
        return <Copy className="w-3 h-3" />;
      case 'Delete':
      case 'Backspace':
        return <Trash2 className="w-3 h-3" />;
      case 'Shift + Enter':
        return <Edit3 className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const formatKey = (key) => {
    return key.split(' + ').map((k, index, arr) => (
      <React.Fragment key={k}>
        <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded shadow-sm">
          {k}
        </kbd>
        {index < arr.length - 1 && <span className="mx-1">+</span>}
      </React.Fragment>
    ));
  };

  const ShortcutItem = memo(({ shortcut, description, icon }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center space-x-3">
        {icon && <div className="text-gray-500">{icon}</div>}
        <div className="flex items-center space-x-2">
          {formatKey(shortcut)}
        </div>
      </div>
      <div className="text-sm text-gray-600 text-right">
        {description}
      </div>
    </motion.div>
  ));

  const renderShortcuts = (shortcuts) => (
    <div className="space-y-2">
      {Object.entries(shortcuts).map(([key, description]) => (
        <ShortcutItem
          key={key}
          shortcut={key}
          description={description}
          icon={getKeyIcon(key)}
        />
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Keyboard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Keyboard Shortcuts
                  </h2>
                  <p className="text-sm text-gray-600">
                    Master the Mind Garden with these keyboard shortcuts
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'navigation' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Navigation Controls
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Navigate through your conversation threads efficiently with these shortcuts.
                        </p>
                        {renderShortcuts(KEYBOARD_SHORTCUTS.navigation)}
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Pro Tips:</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Hold <kbd className="px-1 py-0.5 text-xs bg-blue-100 rounded">Alt</kbd> with arrow keys to jump to conversation boundaries</li>
                          <li>• Use <kbd className="px-1 py-0.5 text-xs bg-blue-100 rounded">Tab</kbd> to create logical continuations</li>
                          <li>• Press <kbd className="px-1 py-0.5 text-xs bg-blue-100 rounded">Shift+Tab</kbd> to explore variations</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'quickActions' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Quick Actions
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Perform common actions without leaving the keyboard.
                        </p>
                        {renderShortcuts(KEYBOARD_SHORTCUTS.quickActions)}
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">Quick Action Mode:</h4>
                        <p className="text-sm text-green-700">
                          Press <kbd className="px-1 py-0.5 text-xs bg-green-100 rounded">q</kbd> to toggle quick action mode for faster access to these shortcuts.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'branchTypes' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Branch Types
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Quickly set the conversation branch type to guide AI responses.
                        </p>
                        {renderShortcuts(KEYBOARD_SHORTCUTS.branchTypes)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <h4 className="font-semibold text-blue-800 mb-1">Exploration</h4>
                          <p className="text-sm text-blue-700">Open-ended ideation and discovery</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <h4 className="font-semibold text-purple-800 mb-1">Refinement</h4>
                          <p className="text-sm text-purple-700">Improve and polish existing ideas</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <h4 className="font-semibold text-green-800 mb-1">Implementation</h4>
                          <p className="text-sm text-green-700">Practical execution and action</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3">
                          <h4 className="font-semibold text-red-800 mb-1">Critique</h4>
                          <p className="text-sm text-red-700">Analysis and evaluation</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'global' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Global Shortcuts
                        </h3>
                        <p className="text-gray-600 mb-4">
                          System-wide shortcuts that work regardless of current focus.
                        </p>
                        {renderShortcuts(KEYBOARD_SHORTCUTS.global)}
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Platform Notes:</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Use <kbd className="px-1 py-0.5 text-xs bg-gray-100 rounded">Cmd</kbd> on Mac, <kbd className="px-1 py-0.5 text-xs bg-gray-100 rounded">Ctrl</kbd> on Windows/Linux</li>
                          <li>• Global shortcuts work from any focused element</li>
                          <li>• Some shortcuts may conflict with browser defaults</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Press <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded">h</kbd> anytime to toggle this help panel
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-500">
                  Mind Garden v5.1
                </div>
                <div className="flex items-center space-x-1">
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Keyboard-First Workflow</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

KeyboardShortcutsHelp.displayName = 'KeyboardShortcutsHelp';

export default KeyboardShortcutsHelp;