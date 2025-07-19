/**
 * Gesture Layout - Main gesture-based layout
 * Integrates with ModuleRegistry + EventBus architecture
 */

import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import CanvasContainer from './CanvasContainer';
import ThemeProvider from './ThemeProvider';
import SidebarToggle from './SidebarToggle';
import CornerInfo from './CornerInfo';
import { useCanvasStore } from '../../modules/scriptorium/store';
import { useUnifiedStore } from '../../store/unifiedStore';

const GestureLayout = ({ children, onOpenProjectSelector }) => {
  const [canvasElements, setCanvasElements] = useState([]);
  const [syncStatus, setSyncStatus] = useState('synced');
  const [activeElement, setActiveElement] = useState(null);
  const { elements, addElement, updateElement, deleteElement } = useCanvasStore();
  const { currentModule } = useUnifiedStore();

  // Initialize canvas elements from store
  useEffect(() => {
    if (elements && elements.length > 0) {
      setCanvasElements(elements);
    }
  }, [elements]);

  // Listen for cross-module events
  useEffect(() => {
    const handleModuleEvent = (event) => {
      console.log('🔄 Module event:', event);
      
      switch (event.type) {
        case 'canvas:element:created':
          handleElementAdd(event.data.element);
          break;
        case 'canvas:element:updated':
          handleElementUpdate(event.data.elementId, event.data.updates);
          break;
        case 'canvas:element:deleted':
          handleElementDelete(event.data.elementId);
          break;
        case 'ai:board:generated':
          // Handle AI-generated board
          if (event.data.board) {
            handleElementAdd({
              id: `ai-board-${Date.now()}`,
              type: 'board',
              position: event.data.position || { x: 200, y: 200 },
              data: event.data.board
            });
          }
          break;
      }
    };

    if (window.__eventBus) {
      window.__eventBus.on('*', handleModuleEvent);
      return () => window.__eventBus.off('*', handleModuleEvent);
    }
  }, []);

  // Handle element operations
  const handleElementAdd = (element) => {
    const newElement = {
      ...element,
      id: element.id || `element-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCanvasElements(prev => [...prev, newElement]);
    
    // Fix: Call addElement with proper signature (type, position, customData)
    addElement(element.type, element.position, element.data);

    // Emit event for other modules
    if (window.__eventBus) {
      window.__eventBus.emit('canvas:element:created', {
        element: newElement,
        timestamp: Date.now()
      });
    }

    // Track with analytics
    if (window.__usageTracker) {
      window.__usageTracker.logInteraction('canvas', 'element-created', {
        type: element.type,
        source: 'gesture-ui'
      });
    }
  };

  const handleElementUpdate = (elementId, updates) => {
    setCanvasElements(prev => 
      prev.map(el => 
        el.id === elementId 
          ? { ...el, ...updates, updatedAt: new Date().toISOString() }
          : el
      )
    );
    
    updateElement(elementId, updates);

    // Emit event
    if (window.__eventBus) {
      window.__eventBus.emit('canvas:element:updated', {
        elementId,
        updates,
        timestamp: Date.now()
      });
    }
  };

  const handleElementDelete = (elementId) => {
    setCanvasElements(prev => prev.filter(el => el.id !== elementId));
    deleteElement(elementId);

    // Emit event
    if (window.__eventBus) {
      window.__eventBus.emit('canvas:element:deleted', {
        elementId,
        timestamp: Date.now()
      });
    }
  };

  // Handle drag operations
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveElement(active);
  };

  const handleDragEnd = (event) => {
    const { active, delta } = event;
    
    if (active && delta) {
      const elementId = active.id;
      const element = canvasElements.find(el => el.id === elementId);
      
      if (element) {
        const newPosition = {
          x: element.position.x + delta.x,
          y: element.position.y + delta.y
        };
        
        handleElementUpdate(elementId, { position: newPosition });
      }
    }
    
    setActiveElement(null);
  };

  // Handle AI integrations
  const handleAIPromptSubmit = async (prompt, shortcut) => {
    setSyncStatus('syncing');
    
    try {
      // Use ModuleRegistry to invoke AI agent
      if (window.__moduleRegistry?.hasAIAgent('superclaude')) {
        const result = await window.__moduleRegistry.invokeAIAgent('superclaude', 'generateBoard', {
          prompt,
          shortcut: shortcut?.key,
          context: {
            currentModule,
            canvasElements: canvasElements.length,
            timestamp: Date.now()
          }
        });

        if (result) {
          handleElementAdd({
            id: `ai-${Date.now()}`,
            type: result.type || 'board',
            position: result.position || { x: 300, y: 300 },
            data: result.data || { title: 'AI Generated', content: result.content }
          });
        }
      } else {
        // Fallback to mock generation
        const mockElement = {
          id: `mock-${Date.now()}`,
          type: 'note',
          position: { x: 300, y: 300 },
          data: {
            title: 'AI Generated Note',
            content: `Generated from prompt: "${prompt.substring(0, 50)}..."`
          }
        };
        
        handleElementAdd(mockElement);
      }
      
      setSyncStatus('synced');
    } catch (error) {
      console.error('AI prompt failed:', error);
      setSyncStatus('error');
      
      // Show error to user
      if (window.__eventBus) {
        window.__eventBus.emit('ui:notification', {
          type: 'error',
          message: 'AI generation failed. Please try again.',
          timestamp: Date.now()
        });
      }
      
      setTimeout(() => setSyncStatus('synced'), 3000);
    }
  };

  // Only show canvas for canvas-related modules
  const showCanvas = ['scriptorium', 'canvas', 'creative-atelier'].includes(currentModule);

  return (
    <ThemeProvider>
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="gesture-layout">
          <Header onOpenProjectSelector={onOpenProjectSelector} />
          
          {showCanvas ? (
            <CanvasContainer
              elements={canvasElements}
              onElementAdd={handleElementAdd}
              onElementUpdate={handleElementUpdate}
              onElementDelete={handleElementDelete}
              onAIPromptSubmit={handleAIPromptSubmit}
            />
          ) : (
            <div className="module-container">
              {children}
            </div>
          )}
          
          <SidebarToggle />
          <CornerInfo syncStatus={syncStatus} />
          
          {/* Disabilitato - gestito da VisualCanvas
          <DragOverlay>
            {activeElement ? (
              <motion.div
                className="drag-overlay"
                initial={{ opacity: 0.8, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--accent)'
                }}
              >
                Dragging element...
              </motion.div>
            ) : null}
          </DragOverlay> */}
        </div>
      </DndContext>
    </ThemeProvider>
  );
};

export default GestureLayout;