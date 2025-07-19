/**
 * Gesture Demo - Simple demo to test gesture functionality
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CanvasContainer } from './ui';

const GestureDemo = () => {
  const [elements, setElements] = useState([
    {
      id: 'demo-1',
      type: 'note',
      position: { x: 200, y: 150 },
      data: {
        title: 'Welcome to Gesture UI',
        content: 'Double-click on canvas to add elements. Long-press for AI assistance.',
        width: 280,
        height: 'auto'
      }
    },
    {
      id: 'demo-2',
      type: 'board',
      position: { x: 550, y: 200 },
      data: {
        title: 'Demo Board',
        items: [],
        width: 320,
        height: 200
      }
    }
  ]);

  const handleElementAdd = (element) => {
    setElements(prev => [...prev, element]);
    console.log('✅ Element added:', element);
  };

  const handleElementUpdate = (elementId, updates) => {
    setElements(prev => 
      prev.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      )
    );
    console.log('✅ Element updated:', elementId, updates);
  };

  const handleElementDelete = (elementId) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
    console.log('✅ Element deleted:', elementId);
  };

  const handleAIPrompt = async (prompt, shortcut) => {
    console.log('🤖 AI Prompt:', prompt, shortcut);
    
    // Create a mock AI response
    const mockElement = {
      id: `ai-${Date.now()}`,
      type: 'note',
      position: { x: 300, y: 300 },
      data: {
        title: 'AI Generated',
        content: `AI response to: "${prompt}"`,
        width: 280,
        height: 'auto'
      }
    };
    
    handleElementAdd(mockElement);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ 
        position: 'absolute', 
        top: 20, 
        left: 20, 
        zIndex: 1000,
        background: 'var(--bg-secondary)',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-sm)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '12px'
      }}>
        <div>🎯 Gesture Demo</div>
        <div>Double-click: Add elements</div>
        <div>Long-press: AI prompt</div>
        <div>Elements: {elements.length}</div>
      </div>
      
      <CanvasContainer
        elements={elements}
        onElementAdd={handleElementAdd}
        onElementUpdate={handleElementUpdate}
        onElementDelete={handleElementDelete}
        onAIPromptSubmit={handleAIPrompt}
      />
    </div>
  );
};

export default GestureDemo;