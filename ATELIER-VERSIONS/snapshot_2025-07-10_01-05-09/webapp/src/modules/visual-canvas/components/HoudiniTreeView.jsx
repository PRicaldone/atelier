import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore } from '../store.js';
import { ELEMENT_TYPES } from '../types.js';
import { 
  ChevronRight, 
  ChevronDown, 
  Layout, 
  StickyNote, 
  Image, 
  Link, 
  Brain,
  Circle,
  Square,
  Triangle,
  Home,
  Folder,
  FolderOpen
} from 'lucide-react';

const HoudiniTreeView = () => {
  const {
    elements,
    selectedIds,
    currentBoardId,
    boardHistory,
    selectElement,
    selectMultiple,
    enterBoard,
    exitBoard,
    getBreadcrumbs,
    getHierarchicalStructure
  } = useCanvasStore();

  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));
  const [hierarchicalData, setHierarchicalData] = useState([]);
  const [breadcrumbsData, setBreadcrumbsData] = useState([]);

  // Update data when navigation changes
  useEffect(() => {
    const newHierarchical = getHierarchicalStructure();
    const newBreadcrumbs = getBreadcrumbs();
    
    setHierarchicalData(newHierarchical);
    setBreadcrumbsData(newBreadcrumbs);
    
    // Log only if there are navigation issues
    if (boardHistory.length > 0 && newBreadcrumbs.length !== boardHistory.length + 1) {
      console.warn('⚠️ Breadcrumb mismatch:', {
        expected: boardHistory.length + 1,
        actual: newBreadcrumbs.length,
        boardHistory,
        breadcrumbs: newBreadcrumbs.map(b => b.title)
      });
    }
  }, [currentBoardId, boardHistory, elements, getHierarchicalStructure, getBreadcrumbs]);

  // Get element icon with enhanced styling
  const getElementIcon = (type, element, isExpanded = false) => {
    const iconProps = { size: 14, className: "flex-shrink-0" };
    
    switch (type) {
      case ELEMENT_TYPES.BOARD:
        const hasElements = element?.data?.elements && element.data.elements.length > 0;
        return (
          <div className="flex items-center space-x-1">
            {hasElements ? (
              isExpanded ? <FolderOpen {...iconProps} className="text-blue-600 dark:text-blue-400" /> : <Folder {...iconProps} className="text-blue-600 dark:text-blue-400" />
            ) : (
              <Square {...iconProps} className="text-gray-400 dark:text-gray-500" />
            )}
            {hasElements && (
              <div className="w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
            )}
          </div>
        );
      case ELEMENT_TYPES.NOTE:
        return <StickyNote {...iconProps} className="text-yellow-500 dark:text-yellow-400" />;
      case ELEMENT_TYPES.IMAGE:
        return <Image {...iconProps} className="text-green-500 dark:text-green-400" />;
      case ELEMENT_TYPES.LINK:
        return <Link {...iconProps} className="text-blue-400 dark:text-blue-300" />;
      case ELEMENT_TYPES.AI:
        return <Brain {...iconProps} className="text-purple-500 dark:text-purple-400" />;
      default:
        return <Circle {...iconProps} className="text-gray-400 dark:text-gray-500" />;
    }
  };

  // Get element title
  const getElementTitle = (element) => {
    if (element.data?.title) return element.data.title;
    if (element.data?.text) return element.data.text.substring(0, 20) + '...';
    return `${element.type.charAt(0).toUpperCase() + element.type.slice(1)} ${element.id.substring(0, 4)}`;
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
      const newSelection = selectedIds.includes(elementId)
        ? selectedIds.filter(id => id !== elementId)
        : [...selectedIds, elementId];
      selectMultiple(newSelection);
    } else {
      selectElement(elementId);
    }
  };

  // Handle board navigation
  const handleBoardNavigation = (boardId) => {
    if (boardId === 'root') {
      // Go back to root
      while (currentBoardId) {
        exitBoard();
      }
    } else {
      enterBoard(boardId);
    }
  };

  // Render connection lines (Houdini-style)
  const renderConnectionLine = (level, isLast, hasChildren) => {
    const baseWidth = 20;
    const indentWidth = level * baseWidth;
    
    return (
      <div className="absolute left-0 top-0 h-full pointer-events-none">
        {level > 0 && (
          <div className="relative h-full">
            {/* Vertical line from parent */}
            <div 
              className="absolute w-px bg-gray-300"
              style={{
                left: `${indentWidth - 10}px`,
                top: 0,
                height: isLast ? '12px' : '100%'
              }}
            />
            
            {/* Horizontal line to element */}
            <div 
              className="absolute h-px bg-gray-300"
              style={{
                left: `${indentWidth - 10}px`,
                top: '12px',
                width: '8px'
              }}
            />
            
            {/* Expansion indicator line */}
            {hasChildren && (
              <div 
                className="absolute w-px bg-gray-300"
                style={{
                  left: `${indentWidth - 2}px`,
                  top: '12px',
                  height: '8px'
                }}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  // Render tree node (Houdini-style)
  const renderTreeNode = (element, level = 0, isLast = false, parentPath = []) => {
    const isExpanded = expandedNodes.has(element.id);
    const hasChildren = element.children && element.children.length > 0;
    const isInPath = element.isInPath;
    const isCurrentLevel = element.isCurrentLevel;
    const isSelected = selectedIds.includes(element.id);
    
    const currentPath = [...parentPath, element.id];
    const indentWidth = level * 20;

    return (
      <div key={element.id} className="relative">
        {/* Connection lines */}
        {renderConnectionLine(level, isLast, hasChildren)}
        
        {/* Node content */}
        <motion.div
          layout
          className={`
            relative flex items-center py-1 px-2 rounded cursor-pointer transition-all
            ${isSelected 
              ? 'bg-blue-100 border border-blue-300' 
              : isCurrentLevel 
              ? 'bg-yellow-50 border border-yellow-300'
              : isInPath 
              ? 'bg-gray-50 border border-gray-200'
              : 'hover:bg-gray-50 border border-transparent'
            }
          `}
          style={{ 
            paddingLeft: `${indentWidth + 24}px`,
            marginLeft: '4px'
          }}
          onClick={(e) => handleElementSelect(element.id, e)}
          onDoubleClick={() => {
            if (element.type === ELEMENT_TYPES.BOARD) {
              handleBoardNavigation(element.id);
            }
          }}
        >
          {/* Expansion toggle */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(element.id);
              }}
              className="absolute p-0.5 hover:bg-gray-200 rounded"
              style={{ left: `${indentWidth + 4}px` }}
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          )}

          {/* Element icon */}
          <div className="flex items-center space-x-2">
            {getElementIcon(element.type, element, isExpanded)}
            
            {/* Element title */}
            <div className="flex-1 min-w-0">
              <span className={`text-xs truncate block ${
                isCurrentLevel ? 'font-medium text-yellow-700' : 
                isInPath ? 'font-medium text-gray-700' : 
                'text-gray-600'
              }`}>
                {getElementTitle(element)}
              </span>
              
              {/* Path indicator */}
              {isCurrentLevel && (
                <span className="text-xs text-yellow-600 font-medium">← You are here</span>
              )}
            </div>
            
            {/* Element count for boards */}
            {element.type === ELEMENT_TYPES.BOARD && element.data?.elements?.length > 0 && (
              <span className="text-xs text-gray-400 bg-gray-100 px-1 py-0.5 rounded">
                {element.data.elements.length}
              </span>
            )}
          </div>
        </motion.div>

        {/* Render children if expanded */}
        {isExpanded && hasChildren && (
          <div className="ml-0">
            {element.children.map((child, index) => 
              renderTreeNode(child, level + 1, index === element.children.length - 1, currentPath)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed right-0 top-16 bottom-0 w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg z-40">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Canvas Network</h3>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Level {breadcrumbsData.length - 1}
            </div>
          </div>
        </div>
        
        {/* Breadcrumb path */}
        <div className="mt-2 flex items-center space-x-1 text-xs">
          <Home size={12} className="text-gray-400 dark:text-gray-500" />
          {breadcrumbsData.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              <button
                onClick={() => handleBoardNavigation(crumb.id)}
                className={`hover:text-blue-600 px-1 py-0.5 rounded transition-colors ${
                  index === breadcrumbsData.length - 1 
                    ? 'font-medium text-blue-600 bg-blue-50' 
                    : 'text-gray-600'
                }`}
              >
                {crumb.title}
              </button>
              {index < breadcrumbsData.length - 1 && (
                <ChevronRight size={10} className="text-gray-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Tree structure */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {hierarchicalData.length > 0 ? (
            hierarchicalData.map((element, index) => 
              renderTreeNode(element, 0, index === hierarchicalData.length - 1)
            )
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Layout size={32} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No elements</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>Total: {elements.length} elements</span>
          {selectedIds.length > 0 && (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {selectedIds.length} selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default HoudiniTreeView;