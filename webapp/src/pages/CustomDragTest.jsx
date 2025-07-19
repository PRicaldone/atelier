/**
 * Custom Drag Test Page
 * Standalone testing environment for the custom drag system
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomDrag } from '../modules/scriptorium/hooks/useCustomDrag.js';
import { CustomDragGhost } from '../modules/scriptorium/components/CustomDragGhost.jsx';
import { CustomDraggableElement } from '../modules/scriptorium/components/CustomDraggableElement.jsx';

const CustomDragTest = () => {
  const [elements, setElements] = useState([]);
  const canvasRef = useRef(null);
  const customDragRef = useRef(null);
  
  // Custom drag system
  const {
    isDragging,
    draggedElement,
    ghostPosition,
    startDrag,
    cancelDrag,
    isElementDragging
  } = useCustomDrag();
  
  // Expose startDrag via ref
  customDragRef.current = {
    startDrag
  };
  
  // Create test element
  const createTestElement = useCallback((type) => {
    const newElement = {
      id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type || 'note',
      position: {
        x: 100 + Math.random() * 400,
        y: 100 + Math.random() * 300
      },
      size: { width: 200, height: 150 },
      data: {
        content: `Test ${type} - Drag me!`,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Element`
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('🎯 Creating test element:', newElement.id, newElement.type);
    setElements(prev => [...prev, newElement]);
    
    return newElement;
  }, []);
  
  // Handle custom drop
  const handleCustomDrop = useCallback((draggedElement, targetId, relativePosition) => {
    console.log('🎯 Custom drop handler:', draggedElement.id, '→', targetId || 'canvas');
    
    // Update element position
    setElements(prev => prev.map(el => 
      el.id === draggedElement.id 
        ? { ...el, position: relativePosition }
        : el
    ));
  }, []);
  
  // Handle element click
  const handleElementClick = useCallback((elementId, multiSelect) => {
    console.log('🎯 Element clicked:', elementId, 'Multi:', multiSelect);
  }, []);
  
  // Handle element double click
  const handleElementDoubleClick = useCallback((element) => {
    console.log('🎯 Element double-clicked:', element.id);
  }, []);
  
  // Handle element update
  const handleElementUpdate = useCallback((elementId, updates) => {
    setElements(prev => prev.map(el => 
      el.id === elementId 
        ? { ...el, ...updates, updatedAt: new Date().toISOString() }
        : el
    ));
  }, []);
  
  // Handle element delete
  const handleElementDelete = useCallback((elementId) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
  }, []);
  
  return (
    <div className="w-screen h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Custom Drag Test</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Figma/Milanote-style drag system test</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => createTestElement('note')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
            >
              + Note
            </button>
            <button
              onClick={() => createTestElement('board')}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
            >
              + Board
            </button>
            <button
              onClick={() => createTestElement('link')}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded transition-colors"
            >
              + Link
            </button>
            <button
              onClick={() => createTestElement('image')}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded transition-colors"
            >
              + Image
            </button>
            <button
              onClick={() => setElements([])}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="absolute top-20 left-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 z-40">
        <div className="text-xs font-mono">
          <div>Elements: {elements.length}</div>
          <div>Dragging: {isDragging ? 'Yes' : 'No'}</div>
          <div>Dragged: {draggedElement?.id || 'None'}</div>
          <div>Ghost: {ghostPosition ? `${Math.round(ghostPosition.x)}, ${Math.round(ghostPosition.y)}` : 'N/A'}</div>
        </div>
      </div>
      
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 top-16"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        <AnimatePresence>
          {elements.map(element => (
            <CustomDraggableElement
              key={element.id}
              element={element}
              onUpdate={handleElementUpdate}
              onDelete={handleElementDelete}
              onDrop={handleCustomDrop}
              onClick={handleElementClick}
              onDoubleClick={handleElementDoubleClick}
              isDragging={isElementDragging(element.id)}
              customDragRef={customDragRef}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Custom Drag Ghost */}
      <CustomDragGhost
        isDragging={isDragging}
        draggedElement={draggedElement}
        position={ghostPosition}
      />
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 z-40 max-w-md">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Instructions:</h3>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Click buttons to create elements</li>
          <li>• Drag elements to move them (60fps smooth)</li>
          <li>• Elements should follow mouse pointer exactly</li>
          <li>• Ghost element shows during drag</li>
          <li>• Check console for debug logs</li>
        </ul>
      </div>
    </div>
  );
};

export default CustomDragTest;