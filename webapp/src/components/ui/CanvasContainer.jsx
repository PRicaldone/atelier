/**
 * Canvas Container - Main gesture-based canvas
 * Features: Radial grid, gesture detection, element positioning
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RadialMenu from './RadialMenu';
import AIPrompt from './AIPrompt';
import FloatingHints from './FloatingHints';
import { superClaudeAgent } from '../../modules/shared/ai/agents/SuperClaudeAgent.js';
import { mapAIResponseToCanvas } from '../../utils/aiToCanvasMapper.js';
import CanvasElement from './CanvasElement';
import { useGestures } from '../../hooks/useGestures';

const CanvasContainer = ({ elements = [], onElementAdd, onElementUpdate, onElementDelete, onAIPromptSubmit }) => {
  const canvasRef = useRef(null);
  const [showRadialMenu, setShowRadialMenu] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [promptPosition, setPromptPosition] = useState({ x: 0, y: 0 });
  const [touchIndicator, setTouchIndicator] = useState({ show: false, x: 0, y: 0 });
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGenerationStatus, setAiGenerationStatus] = useState('');

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
    try {
      // Set loading state
      setAiGenerating(true);
      setAiGenerationStatus('Initializing AI...');
      
      // Custom parent handler takes priority
      if (onAIPromptSubmit) {
        await onAIPromptSubmit(prompt, shortcut);
        setShowAIPrompt(false);
        return;
      }

      // Real AI integration based on shortcut
      let aiResponse;
      
      if (shortcut?.key === '/board') {
        // Generate board structure with AI
        setAiGenerationStatus('Generating creative board...');
        aiResponse = await superClaudeAgent.generateBoard(prompt, {
          userPreferences: { style: 'creative', format: 'visual' },
          context: { canvas: true, position: promptPosition }
        });
        
        // Convert AI board to canvas elements using mapper
        if (aiResponse.success) {
          setAiGenerationStatus('Creating canvas elements...');
          const canvasElements = mapAIResponseToCanvas(aiResponse, promptPosition, '/board');
          canvasElements.forEach(element => onElementAdd?.(element));
        } else {
          throw new Error('AI board generation failed');
        }
        
      } else if (shortcut?.key === '/idea') {
        // Generate ideas with AI
        setAiGenerationStatus('Brainstorming ideas...');
        aiResponse = await superClaudeAgent.analyzeContent(prompt, {
          type: 'brainstorm',
          context: { canvas: true }
        });
        
        // Convert AI ideas to note elements using mapper
        if (aiResponse.success) {
          setAiGenerationStatus('Creating idea notes...');
          const canvasElements = mapAIResponseToCanvas(aiResponse, promptPosition, '/idea');
          canvasElements.forEach(element => onElementAdd?.(element));
        } else {
          throw new Error('AI idea generation failed');
        }
        
      } else {
        // Default: generate single enhanced note with AI assistance
        setAiGenerationStatus('Enhancing content...');
        const enhancedContent = await generateEnhancedNote(prompt);
        const aiElement = {
          id: `ai-note-${Date.now()}`,
          type: 'note',
          position: promptPosition,
          data: {
            title: 'AI Enhanced',
            content: enhancedContent,
            width: 280,
            height: 'auto',
            aiGenerated: true
          }
        };
        onElementAdd?.(aiElement);
      }
      
      // Success state
      setAiGenerationStatus('AI generation completed!');
      
      // Emit analytics event
      if (window.__eventBus) {
        window.__eventBus.emit('ai.canvas.generation_completed', {
          shortcut: shortcut?.key || 'none',
          prompt: prompt.substring(0, 50) + '...',
          success: true,
          timestamp: Date.now()
        });
      }
      
    } catch (error) {
      setAiGenerationStatus('AI generation failed');
      console.error('AI prompt submission failed:', error);
      
      // Fallback: create a simple note with error context
      const fallbackElement = {
        id: `ai-fallback-${Date.now()}`,
        type: 'note',
        position: promptPosition,
        data: {
          title: 'AI Temporarily Unavailable',
          content: `Original prompt: ${prompt}\n\nAI assistant is temporarily unavailable. You can continue working manually and try AI features again later.`,
          width: 320,
          height: 'auto',
          fallback: true
        }
      };
      onElementAdd?.(fallbackElement);
      
      // Emit error analytics
      if (window.__eventBus) {
        window.__eventBus.emit('ai.canvas.generation_failed', {
          shortcut: shortcut?.key || 'none',
          error: error.message,
          timestamp: Date.now()
        });
      }
    } finally {
      // Reset loading state
      setTimeout(() => {
        setAiGenerating(false);
        setAiGenerationStatus('');
      }, 1500); // Show final status for 1.5 seconds
    }
    
    setShowAIPrompt(false);
  };


  // Generate enhanced note content
  const generateEnhancedNote = async (prompt) => {
    try {
      const response = await superClaudeAgent.analyzeContent(prompt, {
        type: 'enhancement',
        context: { format: 'note' }
      });
      
      if (response.success && response.data.suggestions && response.data.suggestions.length > 0) {
        return response.data.suggestions[0].message || prompt;
      }
      
      return prompt; // Fallback to original
    } catch (error) {
      console.warn('Note enhancement failed:', error);
      return prompt; // Fallback to original
    }
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

        {/* AI Generation Loading Indicator */}
        <AnimatePresence>
          {aiGenerating && (
            <motion.div
              className="ai-loading-indicator"
              style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '20px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%'
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span>{aiGenerationStatus}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Floating Hints */}
      <FloatingHints />
    </div>
  );
};

export default CanvasContainer;