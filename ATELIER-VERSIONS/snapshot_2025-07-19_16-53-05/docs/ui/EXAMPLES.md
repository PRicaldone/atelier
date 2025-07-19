# 🎨 Gesture UI Examples

> **Practical examples for implementing gesture-based interfaces**

## 🚀 Basic Examples

### 1. Simple Canvas with Gestures

```jsx
import React, { useState } from 'react';
import { CanvasContainer, ThemeProvider } from '../components/ui';

function SimpleGestureCanvas() {
  const [elements, setElements] = useState([]);

  const handleElementAdd = (element) => {
    setElements(prev => [...prev, element]);
  };

  const handleElementUpdate = (elementId, updates) => {
    setElements(prev => 
      prev.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      )
    );
  };

  const handleElementDelete = (elementId) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
  };

  return (
    <ThemeProvider>
      <div style={{ width: '100vw', height: '100vh' }}>
        <CanvasContainer
          elements={elements}
          onElementAdd={handleElementAdd}
          onElementUpdate={handleElementUpdate}
          onElementDelete={handleElementDelete}
        />
      </div>
    </ThemeProvider>
  );
}
```

### 2. Custom Element Type

```jsx
import React from 'react';
import { motion } from 'framer-motion';

const CustomTaskElement = ({ element, onUpdate, onDelete }) => {
  const [isCompleted, setIsCompleted] = useState(element.data.completed || false);

  const toggleComplete = () => {
    setIsCompleted(!isCompleted);
    onUpdate(element.id, { 
      data: { ...element.data, completed: !isCompleted }
    });
  };

  return (
    <motion.div
      className="canvas-element custom-task"
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: 280,
        padding: '16px',
        background: isCompleted ? '#f0f9ff' : '#fff',
        border: `2px solid ${isCompleted ? '#0ea5e9' : '#e5e7eb'}`,
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={toggleComplete}
          style={{ width: '18px', height: '18px' }}
        />
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '16px',
            textDecoration: isCompleted ? 'line-through' : 'none',
            color: isCompleted ? '#6b7280' : '#1f2937'
          }}>
            {element.data.title}
          </h3>
          <p style={{ 
            margin: '4px 0 0 0', 
            fontSize: '14px', 
            color: '#6b7280' 
          }}>
            {element.data.description}
          </p>
        </div>
        <button
          onClick={() => onDelete(element.id)}
          style={{
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ×
        </button>
      </div>
    </motion.div>
  );
};

// Usage in radial menu
const customMenuItems = [
  {
    type: 'task',
    icon: '✅',
    label: 'task',
    description: 'Create a task'
  }
];
```

### 3. AI-Powered Custom Element

```jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AIIdeaElement = ({ element, onUpdate, onDelete }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState(element.data.ideas || []);

  const generateMoreIdeas = async () => {
    setIsGenerating(true);
    
    try {
      // Use AI to generate more ideas
      const response = await fetch('/api/ai/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: element.data.context,
          existingIdeas: ideas
        })
      });
      
      const newIdeas = await response.json();
      const updatedIdeas = [...ideas, ...newIdeas];
      
      setIdeas(updatedIdeas);
      onUpdate(element.id, {
        data: { ...element.data, ideas: updatedIdeas }
      });
    } catch (error) {
      console.error('Failed to generate ideas:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      className="canvas-element ai-idea-element"
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: 320,
        maxHeight: 400,
        padding: '20px',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        border: '2px solid #f59e0b',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(245, 158, 11, 0.2)',
        overflow: 'hidden'
      }}
      whileHover={{ y: -2 }}
      layout
    >
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#92400e' }}>
          🧠 {element.data.title}
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#b45309' }}>
          {element.data.context}
        </p>
      </div>

      <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
        {ideas.map((idea, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              padding: '8px 12px',
              margin: '4px 0',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#78350f'
            }}
          >
            💡 {idea}
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={generateMoreIdeas}
          disabled={isGenerating}
          style={{
            flex: 1,
            padding: '8px 16px',
            background: isGenerating ? '#d97706' : '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {isGenerating ? '🔄 Generating...' : '✨ More Ideas'}
        </button>
        
        <button
          onClick={() => onDelete(element.id)}
          style={{
            padding: '8px 12px',
            background: 'rgba(239, 68, 68, 0.8)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🗑️
        </button>
      </div>
    </motion.div>
  );
};
```

## 🎨 Advanced Examples

### 4. Custom Radial Menu with Categories

```jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CategorizedRadialMenu = ({ position, onElementCreate, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = {
    productivity: {
      icon: '💼',
      label: 'Work',
      items: [
        { type: 'task', icon: '✅', label: 'Task' },
        { type: 'meeting', icon: '📅', label: 'Meeting' },
        { type: 'deadline', icon: '⏰', label: 'Deadline' }
      ]
    },
    creative: {
      icon: '🎨',
      label: 'Creative',
      items: [
        { type: 'mood-board', icon: '🖼️', label: 'Mood' },
        { type: 'sketch', icon: '✏️', label: 'Sketch' },
        { type: 'inspiration', icon: '💡', label: 'Inspire' }
      ]
    },
    social: {
      icon: '👥',
      label: 'Social',
      items: [
        { type: 'comment', icon: '💬', label: 'Comment' },
        { type: 'share', icon: '🔗', label: 'Share' },
        { type: 'collaborate', icon: '🤝', label: 'Collab' }
      ]
    }
  };

  const handleCategorySelect = (categoryKey) => {
    setSelectedCategory(categoryKey);
  };

  const handleItemSelect = (item) => {
    const elementPosition = {
      x: position.x + 120,
      y: position.y + 120
    };
    
    onElementCreate(item.type, elementPosition);
    onClose();
  };

  return (
    <motion.div
      className="radial-menu categorized"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: 300,
        height: 300
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      {/* Center */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 60,
          height: 60,
          background: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '24px',
          cursor: 'pointer',
          zIndex: 10
        }}
        onClick={() => setSelectedCategory(null)}
      >
        {selectedCategory ? '←' : '+'}
      </div>

      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          // Category selection
          <motion.div key="categories">
            {Object.entries(categories).map(([key, category], index) => {
              const angle = (index * 120) - 90; // Distribute evenly
              const radius = 100;
              const x = Math.cos(angle * Math.PI / 180) * radius;
              const y = Math.sin(angle * Math.PI / 180) * radius;
              
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    position: 'absolute',
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    width: 56,
                    height: 56,
                    background: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transform: 'translate(-50%, -50%)'
                  }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleCategorySelect(key)}
                >
                  <span style={{ fontSize: '20px' }}>{category.icon}</span>
                  <span style={{ fontSize: '10px', marginTop: '2px' }}>
                    {category.label}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          // Items in selected category
          <motion.div key="items">
            {categories[selectedCategory].items.map((item, index) => {
              const angle = (index * (360 / categories[selectedCategory].items.length)) - 90;
              const radius = 100;
              const x = Math.cos(angle * Math.PI / 180) * radius;
              const y = Math.sin(angle * Math.PI / 180) * radius;
              
              return (
                <motion.div
                  key={item.type}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    position: 'absolute',
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    width: 56,
                    height: 56,
                    background: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transform: 'translate(-50%, -50%)'
                  }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleItemSelect(item)}
                >
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <span style={{ fontSize: '10px', marginTop: '2px' }}>
                    {item.label}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
```

### 5. Gesture-Controlled Zoom and Pan

```jsx
import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const ZoomableCanvas = ({ elements, onElementAdd, onElementUpdate, onElementDelete }) => {
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    const delta = e.deltaY;
    const zoomFactor = delta > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(viewport.zoom * zoomFactor, 0.1), 5);
    
    // Zoom towards mouse position
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const newX = viewport.x - (mouseX - rect.width / 2) * (newZoom - viewport.zoom);
    const newY = viewport.y - (mouseY - rect.height / 2) * (newZoom - viewport.zoom);
    
    setViewport({ x: newX, y: newY, zoom: newZoom });
  }, [viewport]);

  const handleMouseDown = useCallback((e) => {
    if (e.altKey || e.button === 1) { // Alt key or middle mouse button
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setViewport(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastPanPoint]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const transformStyle = {
    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    transformOrigin: 'center center'
  };

  return (
    <div
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: isPanning ? 'grabbing' : 'grab',
        position: 'relative'
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <motion.div
        style={transformStyle}
        animate={{ 
          x: viewport.x, 
          y: viewport.y, 
          scale: viewport.zoom 
        }}
        transition={{ duration: 0.1 }}
      >
        {elements.map(element => (
          <CanvasElement
            key={element.id}
            element={element}
            onUpdate={onElementUpdate}
            onDelete={onElementDelete}
          />
        ))}
      </motion.div>
      
      {/* Zoom controls */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <button
          onClick={() => setViewport(prev => ({ 
            ...prev, 
            zoom: Math.min(prev.zoom * 1.2, 5) 
          }))}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          +
        </button>
        <button
          onClick={() => setViewport(prev => ({ 
            ...prev, 
            zoom: Math.max(prev.zoom * 0.8, 0.1) 
          }))}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          −
        </button>
        <button
          onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          ⌂
        </button>
      </div>
    </div>
  );
};
```

## 🎯 Integration Examples

### 6. Real-time Collaboration

```jsx
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const CollaborativeCanvas = () => {
  const [elements, setElements] = useState([]);
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('/canvas');
    setSocket(newSocket);

    newSocket.on('element-added', (element) => {
      setElements(prev => [...prev, element]);
    });

    newSocket.on('element-updated', ({ elementId, updates }) => {
      setElements(prev => 
        prev.map(el => 
          el.id === elementId ? { ...el, ...updates } : el
        )
      );
    });

    newSocket.on('users-updated', (userList) => {
      setUsers(userList);
    });

    return () => newSocket.close();
  }, []);

  const handleElementAdd = (element) => {
    const elementWithUser = {
      ...element,
      createdBy: socket.id,
      createdAt: Date.now()
    };
    
    setElements(prev => [...prev, elementWithUser]);
    socket.emit('add-element', elementWithUser);
  };

  const handleElementUpdate = (elementId, updates) => {
    setElements(prev => 
      prev.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      )
    );
    
    socket.emit('update-element', { elementId, updates });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <CanvasContainer
        elements={elements}
        onElementAdd={handleElementAdd}
        onElementUpdate={handleElementUpdate}
      />
      
      {/* User avatars */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        gap: '8px'
      }}>
        {users.map(user => (
          <div
            key={user.id}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: user.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {user.name.charAt(0)}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 7. Voice-Controlled Elements

```jsx
import React, { useState, useEffect } from 'react';

const VoiceControlledCanvas = () => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [elements, setElements] = useState([]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        
        if (event.results[event.results.length - 1].isFinal) {
          processVoiceCommand(transcript);
        }
      };
      
      setRecognition(recognition);
    }
  }, []);

  const processVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('create note')) {
      const title = extractTitle(lowerCommand, 'create note');
      createElement('note', { title, content: '' });
    } else if (lowerCommand.includes('create board')) {
      const title = extractTitle(lowerCommand, 'create board');
      createElement('board', { title, items: [] });
    } else if (lowerCommand.includes('delete')) {
      // Voice-controlled deletion logic
      handleVoiceDelete(lowerCommand);
    }
  };

  const extractTitle = (command, prefix) => {
    return command.replace(prefix, '').trim() || 'Untitled';
  };

  const createElement = (type, data) => {
    const element = {
      id: `voice-${Date.now()}`,
      type,
      position: { x: 200, y: 200 },
      data: {
        ...data,
        createdBy: 'voice'
      }
    };
    
    setElements(prev => [...prev, element]);
  };

  const toggleListening = () => {
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsListening(!isListening);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <CanvasContainer
        elements={elements}
        onElementAdd={(element) => setElements(prev => [...prev, element])}
        onElementUpdate={(id, updates) => 
          setElements(prev => 
            prev.map(el => el.id === id ? { ...el, ...updates } : el)
          )
        }
        onElementDelete={(id) => 
          setElements(prev => prev.filter(el => el.id !== id))
        }
      />
      
      {/* Voice control button */}
      <button
        onClick={toggleListening}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          background: isListening ? '#ef4444' : '#10b981',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          animation: isListening ? 'pulse 1s infinite' : 'none'
        }}
      >
        🎤
      </button>
      
      {isListening && (
        <div style={{
          position: 'absolute',
          bottom: '90px',
          left: '20px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          Listening... Try "create note" or "create board"
        </div>
      )}
    </div>
  );
};
```

## 🎨 Styling Examples

### 8. Custom Theme Implementation

```jsx
import React, { createContext, useContext, useState } from 'react';

const CustomThemeContext = createContext();

export const useCustomTheme = () => useContext(CustomThemeContext);

export const CustomThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('cyberpunk');
  
  const themes = {
    cyberpunk: {
      '--bg-primary': '#0a0a0f',
      '--bg-secondary': '#1a1a2e',
      '--text-primary': '#00ffff',
      '--text-secondary': '#ff00ff',
      '--accent': '#ffff00',
      '--border': '#333366',
      '--shadow': '0 0 20px rgba(0, 255, 255, 0.3)'
    },
    nature: {
      '--bg-primary': '#f0f8e8',
      '--bg-secondary': '#ffffff',
      '--text-primary': '#2d5016',
      '--text-secondary': '#4a7c59',
      '--accent': '#7cb342',
      '--border': '#c8e6c9',
      '--shadow': '0 4px 12px rgba(124, 179, 66, 0.2)'
    },
    minimal: {
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f9f9f9',
      '--text-primary': '#333333',
      '--text-secondary': '#666666',
      '--accent': '#000000',
      '--border': '#e0e0e0',
      '--shadow': '0 2px 8px rgba(0, 0, 0, 0.1)'
    }
  };

  const applyTheme = (themeName) => {
    const root = document.documentElement;
    const themeVars = themes[themeName];
    
    Object.entries(themeVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    setTheme(themeName);
  };

  return (
    <CustomThemeContext.Provider value={{ theme, applyTheme, themes }}>
      {children}
    </CustomThemeContext.Provider>
  );
};

// Usage
function ThemedCanvas() {
  const { theme, applyTheme, themes } = useCustomTheme();
  
  return (
    <div>
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        zIndex: 1000 
      }}>
        <select 
          value={theme} 
          onChange={(e) => applyTheme(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)'
          }}
        >
          {Object.keys(themes).map(themeName => (
            <option key={themeName} value={themeName}>
              {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      <CanvasContainer />
    </div>
  );
}
```

These examples demonstrate the flexibility and power of the Gesture UI system. Each example can be combined and customized to create unique creative experiences.

**Build the future of creative interfaces with gestures!** 🚀✨