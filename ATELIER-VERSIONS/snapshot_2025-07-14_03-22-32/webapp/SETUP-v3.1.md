# Atelier v3.1 - Mind Garden Setup

## 🚀 Installazione Dipendenze

Per utilizzare il nuovo **Mind Garden** con React Flow avanzato:

```bash
cd ~/atelier/webapp
npm install reactflow @react-three/fiber @react-three/drei framer-motion
```

## 🌱 Mind Garden - Nuove Features

### 1. Custom Node Cards
- **NodeCard.jsx** - Nodi stile cards con preview content
- **Glassmorphism design** con backdrop blur
- **Color-coded phases**: Narrative (blu), Formal (verde), Symbolic (viola)
- **Interactive elements**: Tags, images, suggestions indicator

### 2. Organic Connections
- **OrganicEdge.jsx** - Connessioni Bezier curve personalizzate
- **Dynamic thickness** basata su strength
- **Glow effects** su hover e highlight
- **Animated flow** per connessioni attive

### 3. AI Command Palette
- **AICommandPalette.jsx** - Palette comandi stile VSCode
- **@ commands**: @expand, @connect, @visual, @technical, @narrative
- **/ commands**: /image, /houdini, /concept
- **Keyboard navigation** con arrow keys + Enter

### 4. Interactive Canvas
- **Double-click canvas** → Add new node
- **Double-click node** → Open AI command palette
- **Drag between handles** → Create connections
- **MiniMap** con colori per phase
- **Controls** con style glassmorphism

## 🎨 Visual Design System

### Theme Variables
```javascript
const MindGardenTheme = {
  nodes: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
  },
  phases: {
    narrative: '#3B82F6',  // Blue
    formal: '#10B981',     // Green  
    symbolic: '#8B5CF6'    // Purple
  }
}
```

### Canvas Background
- **Dark theme**: bg-gray-900
- **Subtle grid**: rgba(255, 255, 255, 0.02)
- **Floating UI**: glassmorphism controls
- **Particle effects**: ready per Three.js integration

## 🔧 Component Architecture

```
modules/project-start/MindGarden/
├── MindGardenCanvas.jsx     ✅ Main component con ReactFlowProvider
├── NodeCard.jsx             ✅ Custom node con fase colors
├── OrganicEdge.jsx          ✅ Bezier connections con glow
├── AICommandPalette.jsx     ✅ Command palette interattiva
├── SemanticZoom.jsx         🔄 TODO: Zoom level manager
├── AutoLayout.jsx           🔄 TODO: Smart positioning
└── BackgroundParticles.jsx  🔄 TODO: Three.js effects
```

## 📋 Test delle Features

1. **Avvia server**: `npm run dev`
2. **Vai su `/start`**: Project Start page
3. **Click "Mind Garden"**: Toggle side panel
4. **Double-click canvas**: Aggiungi nuovo nodo
5. **Double-click nodo**: Apri AI command palette
6. **Drag handles**: Connetti nodi
7. **Test AI commands**: @expand, /houdini, etc.

## 🎯 Differenze Mind Map → Mind Garden

| Feature | Old Mind Map | New Mind Garden |
|---------|-------------|-----------------|
| Nodes | Cerchi default | Cards con preview |
| Edges | Lines basic | Bezier organiche |
| AI | Esterno | Command palette integrata |
| Layout | Radial statico | Hybrid + freeform |
| Theme | Light | Dark glassmorphism |
| Interaction | Click/drag | Double-click + palette |

## 🔮 Next Steps

### Sprint Corrente
1. ✅ Setup React Flow con custom components
2. ✅ AI command palette base  
3. ✅ Glassmorphism design system
4. 🔄 Test interazioni complete

### Sprint Prossimi
1. OpenAI integration per comandi AI
2. Auto-layout algorithms (force-directed)
3. Three.js background particles (optional)
4. Export/sync con Visual Canvas
5. Persistent state management

## 🐛 Troubleshooting

### React Flow Errors
- Assicurati di avere `ReactFlowProvider` wrapper
- Import CSS: `import 'reactflow/dist/style.css'`
- Verifica node/edge types registration

### Style Issues  
- Tailwind classes potrebbero confliggere con React Flow
- Usa `!important` se necessario per custom styles
- Glassmorphism richiede `backdrop-filter` support

---

*Mind Garden v3.1 - Evolution from Mind Map to Interactive Node Garden*

## 🎨 Design Inspiration

- **Obsidian**: Canvas infinito e zoom semantico
- **Coggle**: Connessioni Bezier organiche  
- **Scapple**: Note fluttuanti freeform
- **Notion**: Command palette UX
- **Figma**: Glassmorphism e floating UI