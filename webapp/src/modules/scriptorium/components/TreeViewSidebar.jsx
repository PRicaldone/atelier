import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore } from '../store.js';
import { ELEMENT_TYPES, getDisplayTitle } from '../types.js';
import { 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Eye, 
  EyeOff, 
  Layout, 
  StickyNote, 
  Image, 
  Link, 
  Brain,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit3,
  Copy,
  Move
} from 'lucide-react';

const TreeViewSidebar = () => {
  const {
    elements,
    selectedIds,
    currentBoardId,
    selectElement,
    selectMultiple,
    clearSelection,
    addElement,
    updateElement,
    updateElementTitle,
    removeElement,
    enterBoard,
    navigateToBoard,
    exitBoard,
    getBreadcrumbs,
    moveElement,
    copySelected,
    deleteSelected,
    boardHistory,
    getHierarchicalStructure
  } = useCanvasStore();

  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  // Update tree view when navigation changes
  useEffect(() => {
    // Force re-render when currentBoardId changes
    const hierarchical = getHierarchicalStructure();
    console.log('Tree view updated - currentBoardId:', currentBoardId, 'hierarchical elements:', hierarchical.length);
  }, [currentBoardId, boardHistory, getHierarchicalStructure]);

  // Get element icon based on type
  const getElementIcon = (type, element) => {
    switch (type) {
      case ELEMENT_TYPES.BOARD:
        const hasElements = element?.data?.elements && element.data.elements.length > 0;
        return (
          <div className="flex items-center">
            <Layout size={16} className="text-indigo-600 dark:text-indigo-400" />
            {hasElements && (
              <div className="ml-1 w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
            )}
          </div>
        );
      case ELEMENT_TYPES.NOTE:
        return <StickyNote size={16} className="text-yellow-600" />;
      case ELEMENT_TYPES.IMAGE:
        return <Image size={16} className="text-green-600" />;
      case ELEMENT_TYPES.LINK:
        return <Link size={16} className="text-blue-600 dark:text-blue-400" />;
      case ELEMENT_TYPES.AI:
        return <Brain size={16} className="text-purple-600" />;
      default:
        return <Layout size={16} className="text-gray-600" />;
    }
  };

  // TRINITY AMPLIFIER: Use universal display title with smart fallbacks
  const getElementTitle = (element) => {
    return getDisplayTitle(element);
  };

  // Toggle node expansion
  const toggleExpanded = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Handle element selection
  const handleElementSelect = (elementId, event) => {
    event.stopPropagation();
    
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      const newSelection = selectedIds.includes(elementId)
        ? selectedIds.filter(id => id !== elementId)
        : [...selectedIds, elementId];
      selectMultiple(newSelection);
    } else {
      // Single select
      selectElement(elementId);
    }
  };

  // Handle board navigation from breadcrumbs/tree
  const handleBoardNavigation = (boardId) => {
    console.log('🌳 Tree navigation to:', boardId);
    navigateToBoard(boardId);
  };

  // TRINITY AMPLIFIER: Handle title editing
  const startEditing = (element) => {
    setEditingId(element.id);
    setEditingTitle(element.title || ''); // Use universal title field
  };

  const finishEditing = () => {
    if (editingId) {
      // Use Trinity Amplifier title update method
      updateElementTitle(editingId, editingTitle.trim());
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  // Handle drag and drop
  const handleDragStart = (event, elementId) => {
    setDraggedId(elementId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (event, elementId) => {
    event.preventDefault();
    setDragOverId(elementId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (event, targetId) => {
    event.preventDefault();
    setDragOverId(null);
    
    if (draggedId && targetId && draggedId !== targetId) {
      const draggedElement = elements.find(el => el.id === draggedId);
      const targetElement = elements.find(el => el.id === targetId);
      
      if (draggedElement && targetElement && targetElement.type === ELEMENT_TYPES.BOARD) {
        // Move element to board (this would need board hierarchy implementation)
        console.log('Move element to board:', draggedId, 'to', targetId);
      }
    }
    
    setDraggedId(null);
  };

  // Add new element
  const handleAddElement = (type) => {
    const position = { x: 100, y: 100 };
    addElement(type, position);
  };

  // Get hierarchical structure for tree display
  const hierarchicalElements = getHierarchicalStructure();
  
  // Group current level elements by type for better organization
  const groupedElements = elements.reduce((acc, element) => {
    if (!acc[element.type]) acc[element.type] = [];
    acc[element.type].push(element);
    return acc;
  }, {});

  const breadcrumbs = getBreadcrumbs();

  // Render hierarchical tree node
  const renderTreeNode = (element, level = 0) => {
    const isExpanded = expandedNodes.has(element.id);
    const hasChildren = element.children && element.children.length > 0;
    const isInCurrentPath = element.isInPath;
    const isCurrentLevel = element.isCurrentLevel;

    return (
      <div key={element.id} className={`ml-${level * 3}`}>
        <motion.div
          layout
          className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all ${
            selectedIds.includes(element.id)
              ? 'bg-indigo-100 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-600 border'
              : isCurrentLevel
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-600 border'
              : isInCurrentPath
              ? 'bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 border-gray-200 dark:border-gray-600 border'
              : 'hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 border border-transparent'
          }`}
          onClick={(e) => handleElementSelect(element.id, e)}
          onDoubleClick={() => {
            if (element.type === ELEMENT_TYPES.BOARD) {
              console.log('🌳 Tree double-click navigation to:', element.id);
              navigateToBoard(element.id);
            }
          }}
        >
          {/* Expand/Collapse for boards with children */}
          {element.type === ELEMENT_TYPES.BOARD && hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(element.id);
              }}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          )}

          {getElementIcon(element.type, element)}
          
          <div className="flex-1 min-w-0">
            {editingId === element.id ? (
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={finishEditing}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') finishEditing();
                  if (e.key === 'Escape') cancelEditing();
                }}
                className="w-full text-xs bg-white dark:bg-gray-700 border border-indigo-300 dark:border-indigo-600 rounded px-1 py-0.5 text-gray-800 dark:text-gray-200"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-xs text-gray-800 dark:text-gray-200 truncate block">
                {getElementTitle(element)}
                {isCurrentLevel && <span className="ml-1 text-blue-600 dark:text-blue-400">(current)</span>}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                startEditing(element);
              }}
              className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
              title="Edit Title"
            >
              <Edit3 size={10} />
            </button>
            {element.type === ELEMENT_TYPES.BOARD && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🌳 Tree button navigation to:', element.id);
                  navigateToBoard(element.id);
                }}
                className="p-1 text-indigo-400 dark:text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-400"
                title="Enter Board"
              >
                <ChevronRight size={10} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Render children if expanded */}
        {isExpanded && hasChildren && (
          <div className="ml-4 mt-1 space-y-1">
            {element.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed right-0 top-16 bottom-0 w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg z-40">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Canvas Structure</h3>
            {currentBoardId && (
              <button
                onClick={exitBoard}
                className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Go up one level"
              >
                <ChevronUp size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleAddElement(ELEMENT_TYPES.BOARD)}
              className="p-1 text-indigo-600 dark:text-indigo-400 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded"
              title="Add Board"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={() => toggleExpanded('root')}
              className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 rounded"
              title="Expand/Collapse All"
            >
              {expandedNodes.has('root') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
        </div>
        
        {/* Current Location Indicator */}
        <div className="mt-2">
          <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
            <span className="text-gray-500 dark:text-gray-400">Current:</span>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                <button
                  onClick={() => handleBoardNavigation(crumb.id)}
                  className={`hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-400 px-1 py-0.5 rounded ${
                    index === breadcrumbs.length - 1 ? 'font-medium text-indigo-600 dark:text-indigo-400 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : ''
                  }`}
                >
                  {crumb.title}
                </button>
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight size={12} className="text-gray-400" />
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Level indicator */}
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {currentBoardId ? `Level ${breadcrumbs.length - 1}` : 'Root Level'} • {elements.length} elements
          </div>
        </div>
      </div>

      {/* Element Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence>
          {expandedNodes.has('root') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {/* Hierarchical Tree Structure */}
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Canvas Structure
                  </span>
                </div>
                
                {hierarchicalElements.length > 0 ? (
                  hierarchicalElements.map(element => renderTreeNode(element))
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <Layout size={24} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No elements</p>
                  </div>
                )}
              </div>

              {/* Current Level Elements (if inside a board) */}
              {currentBoardId && elements.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Current Level ({elements.length})
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {elements.map((element) => (
                      <motion.div
                        key={element.id}
                        layout
                        className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all ${
                          selectedIds.includes(element.id)
                            ? 'bg-indigo-100 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-600 border'
                            : 'hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 border border-transparent'
                        }`}
                        onClick={(e) => handleElementSelect(element.id, e)}
                      >
                        {getElementIcon(element.type, element)}
                        <div className="flex-1 min-w-0">
                          {editingId === element.id ? (
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onBlur={finishEditing}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') finishEditing();
                                if (e.key === 'Escape') cancelEditing();
                              }}
                              className="w-full text-xs bg-white dark:bg-gray-700 border border-indigo-300 dark:border-indigo-600 rounded px-1 py-0.5 text-gray-800 dark:text-gray-200"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span className="text-xs text-gray-800 dark:text-gray-200 truncate block">
                              {getElementTitle(element)}
                            </span>
                          )}
                        </div>
                        
                        {/* Actions for current level elements */}
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(element);
                            }}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                            title="Edit Title"
                          >
                            <Edit3 size={10} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {elements.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Layout size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No elements yet</p>
                  <p className="text-xs mt-1">Create your first element</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>{elements.length} elements</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearSelection}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
              title="Clear Selection"
            >
              Clear
            </button>
            {selectedIds.length > 0 && (
              <span className="text-indigo-600 dark:text-indigo-400">
                {selectedIds.length} selected
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeViewSidebar;