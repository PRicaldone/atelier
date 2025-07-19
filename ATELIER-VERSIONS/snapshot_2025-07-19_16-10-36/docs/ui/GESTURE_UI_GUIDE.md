# 🎨 Gesture UI Guide - Developer Documentation

> **Revolutionary gesture-based interface for creative workflows**

## 🎯 Overview

Atelier's Gesture UI represents a paradigm shift from traditional menu-driven interfaces to intuitive, gesture-based interactions. Built for creative professionals who need zero-friction workflows and maximum creative freedom.

## 🚀 Quick Start

### Basic Usage

```jsx
import { GestureLayout } from '../components/ui';

function MyApp() {
  return (
    <GestureLayout onOpenProjectSelector={() => setShowSelector(true)}>
      <YourContent />
    </GestureLayout>
  );
}
```

### Canvas Integration

```jsx
import { CanvasContainer } from '../components/ui';

function MyCanvas() {
  const [elements, setElements] = useState([]);

  return (
    <CanvasContainer
      elements={elements}
      onElementAdd={handleAdd}
      onElementUpdate={handleUpdate}
      onElementDelete={handleDelete}
      onAIPromptSubmit={handleAI}
    />
  );
}
```

## 🎭 Core Concepts

### Gesture System

| Gesture | Action | Platform |
|---------|--------|----------|
| **Double-click** | Opens radial menu | Desktop/Mobile |
| **Long-press** | Opens AI prompt | Desktop/Mobile |
| **Drag** | Moves elements | Desktop/Mobile |
| **Escape** | Closes overlays | Desktop |
| **⌘/Ctrl + K** | Command palette | Desktop |

### Element Types

```jsx
// Supported canvas elements
const ELEMENT_TYPES = {
  NOTE: 'note',        // Text notes with rich formatting
  IMAGE: 'image',      // Images and media files
  BOARD: 'board',      // Nested boards and collections
  LINK: 'link',        // Web links and bookmarks
  REFERENCE: 'reference' // Reference materials
};
```

## 🎨 Theme System

### Theme Provider

```jsx
import { ThemeProvider, useTheme } from '../components/ui';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}

function ThemedComponent() {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <div className={isDark ? 'dark-mode' : 'light-mode'}>
      <button onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### CSS Custom Properties

```css
/* Light Theme */
:root {
  --bg-primary: #FAFAF9;
  --bg-secondary: #FFFFFF;
  --text-primary: #1A1A1A;
  --accent: #5E5CE6;
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.04);
}

/* Dark Theme */
body.dark-theme {
  --bg-primary: #0A0A0C;
  --bg-secondary: #16161A;
  --text-primary: #F7F7F8;
  --accent: #6B69D6;
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.4);
}
```

## 🤖 AI Integration

### SuperClaude+MCP Integration

```jsx
// AI prompt submission
const handleAIPrompt = async (prompt, shortcut) => {
  // Integrates with ModuleRegistry
  if (window.__moduleRegistry?.hasAIAgent('superclaude')) {
    const result = await window.__moduleRegistry.invokeAIAgent(
      'superclaude', 
      'generateBoard', 
      { prompt, shortcut, context: getContext() }
    );
    
    if (result) {
      addElement(result);
    }
  }
};
```

### AI Shortcuts

| Shortcut | Purpose | Example |
|----------|---------|---------|
| `/board` | Generate board | `/board project planning` |
| `/idea` | Brainstorm ideas | `/idea marketing campaign` |
| `/ref` | Find references | `/ref design inspiration` |
| `/brief` | Create brief | `/brief client presentation` |

## 🎯 Component Architecture

### Component Hierarchy

```
GestureLayout
├── Header (floating navigation)
├── CanvasContainer (gesture detection)
│   ├── CanvasElement[] (draggable elements)
│   ├── RadialMenu (creation overlay)
│   ├── AIPrompt (AI overlay)
│   └── FloatingHints (contextual help)
├── SidebarToggle (collapsed sidebar)
└── CornerInfo (status indicators)
```

### Custom Elements

```jsx
// Create custom canvas element
const CustomElement = ({ element, onUpdate, onDelete }) => {
  return (
    <motion.div
      className="canvas-element custom-element"
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
    >
      <h3>{element.data.title}</h3>
      <p>{element.data.content}</p>
      
      {/* Custom element controls */}
      <ElementControls
        onEdit={() => onUpdate(element.id, { editing: true })}
        onDelete={() => onDelete(element.id)}
      />
    </motion.div>
  );
};
```

## 🎪 Animations & Micro-interactions

### Framer Motion Integration

```jsx
import { motion, AnimatePresence } from 'framer-motion';

// Radial menu animation
const radialVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
};

// Element hover effects
const elementVariants = {
  hover: { 
    y: -1, 
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)' 
  }
};
```

### CSS Animations

```css
/* Pulse animation for sync status */
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

/* Touch indicator feedback */
.touch-indicator.active {
  opacity: 0.3;
  transform: scale(1.2);
  transition: all 0.3s ease;
}
```

## 🔧 Developer Tools

### Debug Commands

```javascript
// Available in browser console
window.__atelierUI = {
  toggleTheme: () => void,
  openRadialMenu: (x, y) => void,
  openAIPrompt: (x, y) => void,
  getTheme: () => string
};

// Usage examples
window.__atelierUI.toggleTheme();
window.__atelierUI.openRadialMenu(400, 300);
window.__atelierUI.openAIPrompt(200, 150);
```

### Event Monitoring

```jsx
// Listen for gesture events
useEffect(() => {
  const handleGestureEvent = (event) => {
    console.log('Gesture event:', event);
  };

  if (window.__eventBus) {
    window.__eventBus.on('ui:*', handleGestureEvent);
    return () => window.__eventBus.off('ui:*', handleGestureEvent);
  }
}, []);
```

## 📱 Mobile Optimization

### Touch Events

```jsx
// Mobile-first gesture detection
const useGestures = ({ onDoubleClick, onLongPress }) => {
  const handleTouchStart = useCallback((event) => {
    const touch = event.touches[0];
    
    // Long press detection
    longPressTimer.current = setTimeout(() => {
      onLongPress({
        clientX: touch.clientX,
        clientY: touch.clientY,
        target: event.target
      });
    }, 500);
  }, [onLongPress]);

  const handleTouchEnd = useCallback(() => {
    clearTimeout(longPressTimer.current);
  }, []);

  return { handleTouchStart, handleTouchEnd };
};
```

### Responsive Design

```css
@media (max-width: 768px) {
  .canvas-element {
    touch-action: none; /* Prevent default touch behavior */
  }
  
  .ai-prompt {
    width: 280px; /* Smaller prompt on mobile */
  }
  
  .radial-menu {
    width: 200px; /* Smaller radial menu */
    height: 200px;
  }
}
```

## 🎨 Customization

### Custom Themes

```jsx
// Create custom theme
const customTheme = {
  colors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent: '#45B7D1',
    background: '#F7F9FC',
    text: '#2C3E50'
  },
  fonts: {
    heading: 'Playfair Display',
    body: 'Inter',
    mono: 'JetBrains Mono'
  },
  shadows: {
    sm: '0 2px 8px rgba(0,0,0,0.04)',
    md: '0 8px 24px rgba(0,0,0,0.08)',
    lg: '0 16px 48px rgba(0,0,0,0.12)'
  }
};
```

### Custom Radial Menu

```jsx
// Extend radial menu with custom options
const customMenuItems = [
  { 
    type: 'custom-element',
    icon: '🎨',
    label: 'custom',
    description: 'Create custom element'
  },
  // ... other items
];

const CustomRadialMenu = ({ position, onElementCreate }) => {
  return (
    <RadialMenu
      position={position}
      items={customMenuItems}
      onElementCreate={onElementCreate}
    />
  );
};
```

## 🚀 Performance Optimization

### Lazy Loading

```jsx
// Lazy load heavy components
const CanvasContainer = lazy(() => import('./CanvasContainer'));
const AIPrompt = lazy(() => import('./AIPrompt'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <CanvasContainer />
</Suspense>
```

### Virtualization

```jsx
// Virtualize large element lists
const VirtualizedCanvas = ({ elements }) => {
  const visibleElements = useMemo(() => {
    // Only render elements in viewport
    return elements.filter(element => 
      isInViewport(element.position, viewport)
    );
  }, [elements, viewport]);

  return (
    <div className="canvas">
      {visibleElements.map(element => (
        <CanvasElement key={element.id} element={element} />
      ))}
    </div>
  );
};
```

## 🔍 Testing

### Gesture Testing

```jsx
// Test gesture detection
import { fireEvent, screen } from '@testing-library/react';

test('double-click opens radial menu', async () => {
  render(<CanvasContainer />);
  
  const canvas = screen.getByTestId('canvas');
  fireEvent.doubleClick(canvas);
  
  expect(screen.getByTestId('radial-menu')).toBeInTheDocument();
});

test('long-press opens AI prompt', async () => {
  render(<CanvasContainer />);
  
  const canvas = screen.getByTestId('canvas');
  fireEvent.mouseDown(canvas);
  
  await waitFor(() => {
    expect(screen.getByTestId('ai-prompt')).toBeInTheDocument();
  }, { timeout: 600 });
});
```

### Integration Testing

```jsx
// Test AI integration
test('AI prompt creates element', async () => {
  const mockAIAgent = {
    generateBoard: jest.fn().mockResolvedValue({
      type: 'board',
      data: { title: 'AI Board' }
    })
  };
  
  window.__moduleRegistry = {
    hasAIAgent: () => true,
    invokeAIAgent: mockAIAgent.generateBoard
  };
  
  render(<CanvasContainer />);
  
  // Trigger AI prompt
  fireEvent.mouseDown(screen.getByTestId('canvas'));
  
  const prompt = await screen.findByTestId('ai-prompt');
  const input = screen.getByRole('textbox');
  
  fireEvent.change(input, { target: { value: 'Create a board' } });
  fireEvent.click(screen.getByText('[generate]'));
  
  expect(mockAIAgent.generateBoard).toHaveBeenCalledWith({
    prompt: 'Create a board',
    shortcut: null,
    context: expect.any(Object)
  });
});
```

## 🎯 Best Practices

### 1. **Gesture Accessibility**
```jsx
// Always provide keyboard alternatives
const AccessibleGesture = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setMenuOpen(true);
    }
  };
  
  return (
    <div
      onDoubleClick={() => setMenuOpen(true)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label="Double-click or press Enter to open menu"
    >
      Canvas
    </div>
  );
};
```

### 2. **Performance Considerations**
```jsx
// Debounce expensive operations
const debouncedUpdate = useCallback(
  debounce((elementId, updates) => {
    updateElement(elementId, updates);
  }, 100),
  [updateElement]
);

// Optimize re-renders
const MemoizedElement = memo(CanvasElement, (prev, next) => {
  return prev.element.position === next.element.position &&
         prev.element.data === next.element.data;
});
```

### 3. **Error Handling**
```jsx
// Graceful gesture failures
const handleGestureError = (error, gestureType) => {
  console.warn(`Gesture ${gestureType} failed:`, error);
  
  // Fallback to traditional interface
  if (window.__eventBus) {
    window.__eventBus.emit('ui:gesture:fallback', {
      gestureType,
      error: error.message
    });
  }
};
```

## 🎨 Advanced Examples

### Custom Canvas Element

```jsx
const CustomNoteElement = ({ element, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <motion.div
      className="canvas-element custom-note"
      layout
      whileHover={{ y: -2 }}
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: element.data.width || 280
      }}
    >
      {isEditing ? (
        <textarea
          value={element.data.content}
          onChange={(e) => onUpdate(element.id, { 
            data: { ...element.data, content: e.target.value }
          })}
          onBlur={() => setIsEditing(false)}
          autoFocus
        />
      ) : (
        <div onDoubleClick={() => setIsEditing(true)}>
          <h3>{element.data.title}</h3>
          <p>{element.data.content}</p>
        </div>
      )}
      
      <ElementControls
        onEdit={() => setIsEditing(true)}
        onDelete={() => onDelete(element.id)}
      />
    </motion.div>
  );
};
```

### Custom AI Integration

```jsx
const CustomAIPrompt = ({ position, onSubmit, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleSubmit = async () => {
    setIsGenerating(true);
    
    try {
      // Custom AI processing
      const result = await processWithCustomAI(prompt);
      onSubmit(result);
    } catch (error) {
      console.error('AI processing failed:', error);
      // Fallback to simple text element
      onSubmit({
        type: 'note',
        data: { title: 'AI Error', content: prompt }
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <motion.div
      className="ai-prompt custom-ai-prompt"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y
      }}
    >
      <div className="ai-prompt-header">
        <span>🤖 Custom AI Assistant</span>
        <button onClick={onClose}>×</button>
      </div>
      
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe what you want to create..."
        disabled={isGenerating}
      />
      
      <div className="ai-prompt-actions">
        <button onClick={handleSubmit} disabled={!prompt.trim() || isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </motion.div>
  );
};
```

## 🎯 Migration Guide

### From Traditional UI

```jsx
// Before: Traditional menu-driven interface
const OldInterface = () => {
  return (
    <div>
      <MenuBar>
        <Menu label="File">
          <MenuItem onClick={() => createNote()}>New Note</MenuItem>
          <MenuItem onClick={() => createBoard()}>New Board</MenuItem>
        </Menu>
      </MenuBar>
      <Canvas elements={elements} />
    </div>
  );
};

// After: Gesture-based interface
const NewInterface = () => {
  return (
    <GestureLayout>
      <CanvasContainer
        elements={elements}
        onElementAdd={handleElementAdd}
        onElementUpdate={handleElementUpdate}
        onElementDelete={handleElementDelete}
      />
    </GestureLayout>
  );
};
```

### Gradual Migration

```jsx
// Hybrid approach during migration
const HybridInterface = () => {
  const [useGestures, setUseGestures] = useState(false);
  
  return (
    <div>
      <Settings>
        <label>
          <input
            type="checkbox"
            checked={useGestures}
            onChange={(e) => setUseGestures(e.target.checked)}
          />
          Enable Gesture UI (Beta)
        </label>
      </Settings>
      
      {useGestures ? (
        <GestureLayout>
          <CanvasContainer />
        </GestureLayout>
      ) : (
        <TraditionalLayout>
          <TraditionalCanvas />
        </TraditionalLayout>
      )}
    </div>
  );
};
```

## 🎨 Troubleshooting

### Common Issues

1. **Gestures not working on mobile**
   ```jsx
   // Ensure touch events are properly handled
   const canvas = document.querySelector('.canvas');
   canvas.style.touchAction = 'none';
   ```

2. **Radial menu positioning issues**
   ```jsx
   // Account for scroll position
   const adjustedPosition = {
     x: event.clientX - rect.left + window.scrollX,
     y: event.clientY - rect.top + window.scrollY
   };
   ```

3. **Theme not persisting**
   ```jsx
   // Ensure ThemeProvider is at root level
   <ThemeProvider>
     <App />
   </ThemeProvider>
   ```

### Debug Mode

```jsx
// Enable debug mode for detailed logging
window.__atelierUI.debug = true;

// View gesture events
window.__eventBus.on('ui:gesture:*', (event) => {
  console.log('Gesture event:', event);
});
```

---

## 🎯 Next Steps

1. **Explore the demo**: Load `/gesture-demo` to test all features
2. **Try the debug commands**: Use browser console to test API
3. **Customize themes**: Create your own color schemes
4. **Extend with AI**: Integrate custom AI providers
5. **Build custom elements**: Create domain-specific canvas elements

**The future of creative interfaces is gesture-based. Welcome to the revolution!** 🚀✨