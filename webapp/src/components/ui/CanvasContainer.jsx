/**
 * Canvas Container - Main gesture-based canvas
 * Features: Radial grid, gesture detection, element positioning
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RadialMenu from './RadialMenu';
import AIPrompt from './AIPrompt';
import FloatingHints from './FloatingHints';
import CanvasElement from './CanvasElement';
import { useGestures } from '../../hooks/useGestures';

const CanvasContainer = ({ elements = [], onElementAdd, onElementUpdate, onElementDelete, onAIPromptSubmit }) => {
  const canvasRef = useRef(null);
  const [showRadialMenu, setShowRadialMenu] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [promptPosition, setPromptPosition] = useState({ x: 0, y: 0 });
  const [touchIndicator, setTouchIndicator] = useState({ show: false, x: 0, y: 0 });

  // Gesture detection hook
  const { onDoubleClick, onLongPress, onMouseDown, onMouseUp, onTouchStart, onTouchEnd } = useGestures({
    onDoubleClickDetected: (event) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      setMenuPosition({ x: x - 120, y: y - 120 });
      setShowRadialMenu(true);
      setShowAIPrompt(false);
      
      // Auto-hide after 10 seconds
      setTimeout(() => setShowRadialMenu(false), 10000);
    },
    onLongPressDetected: (event) => {
      const rect = canvasRef.current.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;
      
      // Position prompt optimally
      x = Math.max(20, Math.min(x - 160, rect.width - 340));
      y = Math.max(20, Math.min(y - 10, rect.height - 200));
      
      setPromptPosition({ x, y });
      setShowAIPrompt(true);
      setShowRadialMenu(false);
      
      // Show touch indicator for feedback
      setTouchIndicator({ show: true, x: event.clientX - rect.left, y: event.clientY - rect.top });
      setTimeout(() => setTouchIndicator(prev => ({ ...prev, show: false })), 300);
    }
  });

  // Handle element creation from radial menu
  const handleElementCreate = (type, position) => {
    const newElement = {
      id: `element-${Date.now()}`,
      type,
      position,
      data: getDefaultElementData(type)
    };
    
    onElementAdd?.(newElement);
    setShowRadialMenu(false);
  };

  // Handle AI prompt submission
  const handleAIPromptSubmit = async (prompt, shortcut) => {
    if (onAIPromptSubmit) {
      await onAIPromptSubmit(prompt, shortcut);
    } else {
      // Fallback: create a simple note
      const mockElement = {
        id: `ai-note-${Date.now()}`,
        type: 'note',
        position: promptPosition,
        data: {
          title: 'AI Generated',
          content: prompt,
          width: 280,
          height: 'auto'
        }
      };
      onElementAdd?.(mockElement);
    }
    
    setShowAIPrompt(false);
  };

  // Default element data factory
  const getDefaultElementData = (type) => {
    switch (type) {
      case 'note':
        return {
          title: 'New Note',
          content: 'Write your thoughts here...',
          width: 280,
          height: 'auto'
        };
      case 'image':
        return {
          src: 'https://via.placeholder.com/300x220/f5f5f5/666?text=Upload+Image',
          alt: 'Placeholder image',
          width: 300,
          height: 220
        };
      case 'board':
        return {
          title: 'New Board',
          items: [],
          width: 320,
          height: 200
        };
      case 'link':
        return {
          url: '',
          title: 'New Link',
          description: '',
          width: 280,
          height: 'auto'
        };
      default:
        return {};
    }
  };

  // Close overlays on escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowRadialMenu(false);
        setShowAIPrompt(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Expose debug methods
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__atelierUI = window.__atelierUI || {};
      window.__atelierUI.openRadialMenu = (x, y) => {
        setMenuPosition({ x, y });
        setShowRadialMenu(true);
      };
      window.__atelierUI.openAIPrompt = (x, y) => {
        setPromptPosition({ x, y });
        setShowAIPrompt(true);
      };
    }
  }, []);

  return (
    <div className="canvas-container">
      <div 
        ref={canvasRef}
        className="canvas"
        onDoubleClick={onDoubleClick}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Canvas Elements */}
        <AnimatePresence>
          {elements.map((element) => (
            <CanvasElement
              key={element.id}
              element={element}
              onUpdate={(updates) => onElementUpdate?.(element.id, updates)}
              onDelete={() => onElementDelete?.(element.id)}
            />
          ))}
        </AnimatePresence>

        {/* Radial Menu */}
        <AnimatePresence>
          {showRadialMenu && (
            <RadialMenu
              position={menuPosition}
              onElementCreate={handleElementCreate}
              onClose={() => setShowRadialMenu(false)}
            />
          )}
        </AnimatePresence>

        {/* AI Prompt */}
        <AnimatePresence>
          {showAIPrompt && (
            <AIPrompt
              position={promptPosition}
              onSubmit={handleAIPromptSubmit}
              onClose={() => setShowAIPrompt(false)}
            />
          )}
        </AnimatePresence>

        {/* Touch Indicator */}
        <AnimatePresence>
          {touchIndicator.show && (
            <motion.div
              className="touch-indicator active"
              style={{
                left: touchIndicator.x - 30,
                top: touchIndicator.y - 30
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.3, scale: 1.2 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>
      </div>
      
      {/* Floating Hints */}
      <FloatingHints />
    </div>
  );
};

export default CanvasContainer;