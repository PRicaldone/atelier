# 🎨 Gesture UI - Developer README

> **Revolutionary gesture-based interface for creative workflows**

## 🎯 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/PRicaldone/atelier.git
cd atelier/webapp

# Install dependencies
npm install

# Start development server
npm run dev
```

### Basic Usage

```jsx
import { GestureLayout } from './components/ui';

function App() {
  return (
    <GestureLayout>
      <YourContent />
    </GestureLayout>
  );
}
```

## 🎭 Gesture System

| Gesture | Action | Platform |
|---------|--------|----------|
| **Double-click** | Opens radial menu | Desktop/Mobile |
| **Long-press** | Opens AI prompt | Desktop/Mobile |
| **Drag** | Moves elements | Desktop/Mobile |
| **Escape** | Closes overlays | Desktop |
| **⌘/Ctrl + P** | Project selector | Desktop |

## 🎨 Theme System

### Quick Theme Switch

```jsx
import { useTheme } from './components/ui';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

### Custom Themes

```css
/* Override CSS custom properties */
:root {
  --accent: #your-brand-color;
  --bg-primary: #your-background;
}
```

## 🤖 AI Integration

### Basic AI Prompt

```jsx
const handleAIPrompt = async (prompt, shortcut) => {
  const result = await aiAgent.generate(prompt);
  addElement(result);
};
```

### AI Shortcuts

- `/board` - Generate new board
- `/idea` - Brainstorm ideas
- `/ref` - Find references
- `/brief` - Create project brief

## 🔧 Debug Commands

```javascript
// Available in browser console
window.__atelierUI.toggleTheme();
window.__atelierUI.openRadialMenu(400, 300);
window.__atelierUI.openAIPrompt(200, 150);
```

## 📱 Mobile Support

The Gesture UI is fully optimized for mobile devices:

- Touch-based gesture detection
- Responsive design
- Mobile-first approach
- Optimized touch targets

## 🎯 Performance

- 60fps animations
- Efficient event handling
- Memory leak prevention
- Lazy loading support

## 🎨 Customization

### Custom Canvas Elements

```jsx
const CustomElement = ({ element, onUpdate, onDelete }) => {
  return (
    <div className="canvas-element custom-element">
      <h3>{element.data.title}</h3>
      <p>{element.data.content}</p>
    </div>
  );
};
```

### Custom Radial Menu

```jsx
const customMenuItems = [
  { 
    type: 'custom',
    icon: '🎨',
    label: 'custom',
    description: 'Custom element'
  }
];
```

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run test:e2e
```

### Gesture Testing

```jsx
import { fireEvent, screen } from '@testing-library/react';

test('double-click opens radial menu', () => {
  render(<CanvasContainer />);
  fireEvent.doubleClick(screen.getByTestId('canvas'));
  expect(screen.getByTestId('radial-menu')).toBeInTheDocument();
});
```

## 🎯 Architecture

### Component Structure

```
/components/ui/
├── GestureLayout.jsx     # Main orchestrator
├── Header.jsx            # Floating navigation
├── CanvasContainer.jsx   # Gesture detection
├── RadialMenu.jsx        # Creation overlay
├── AIPrompt.jsx          # AI interaction
├── CanvasElement.jsx     # Draggable elements
├── ThemeProvider.jsx     # Theme management
└── index.js              # Exports
```

### Key Technologies

- **React 18** - Modern React with concurrent features
- **Framer Motion** - Smooth animations
- **DnD Kit** - Drag and drop functionality
- **Zustand** - State management
- **CSS Custom Properties** - Theme system

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Environment Variables

```env
VITE_AI_ENDPOINT=your-ai-endpoint
VITE_ANALYTICS_ID=your-analytics-id
```

## 🎨 Contributing

### Development Workflow

1. Create feature branch
2. Implement changes
3. Add tests
4. Update documentation
5. Submit pull request

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Maintain accessibility standards
- Write comprehensive tests

## 📚 Documentation

- **[Gesture UI Guide](./GESTURE_UI_GUIDE.md)** - Complete developer guide
- **[Visual Architecture](../architecture/VISUAL_ARCHITECTURE.md)** - System architecture
- **[API Reference](./API_REFERENCE.md)** - Component API documentation

## 🐛 Troubleshooting

### Common Issues

1. **Gestures not working**
   - Ensure touch-action: none on canvas
   - Check event propagation

2. **Theme not persisting**
   - Verify ThemeProvider wrapper
   - Check localStorage permissions

3. **Performance issues**
   - Enable React DevTools Profiler
   - Check for memory leaks

### Debug Mode

```javascript
// Enable debug logging
window.__atelierUI.debug = true;
```

## 🎯 Roadmap

- [ ] Multi-touch gestures
- [ ] Voice commands
- [ ] VR/AR support
- [ ] Real-time collaboration
- [ ] Advanced AI features

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/PRicaldone/atelier/issues)
- **Discussions**: [GitHub Discussions](https://github.com/PRicaldone/atelier/discussions)
- **Documentation**: [Full Documentation](./GESTURE_UI_GUIDE.md)

## 📄 License

MIT License - see [LICENSE](../../LICENSE) file for details.

---

**Built with ❤️ by the Atelier team**

**The future of creative interfaces is gesture-based.** 🚀✨