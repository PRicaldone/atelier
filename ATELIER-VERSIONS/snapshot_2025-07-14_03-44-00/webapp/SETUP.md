# Atelier v3.0 - Setup Instructions

## Nuove Dipendenze da Installare

Per utilizzare le nuove funzionalità (Mind Map, Content Studio, AI Assistant), installa queste dipendenze:

```bash
cd ~/atelier/webapp
npm install reactflow
```

## Nuovi Moduli Implementati

### 1. Project Start Enhanced
- **Mind Map integrata** con toggle 3 stati (Hidden/Side/Full)
- **4 Fasi guidate**: Inspiration Dump → Idea Sorting → Foundation Block → Start or Park
- **Layout adattivo** con animazioni fluide

### 2. Content Studio (Nuovo)
- **Struttura base** con 4 tabs: Calendar, Composer, Analytics, Settings
- **UI placeholder** per tutte le sezioni
- **Pronto per implementazione features**

### 3. AI Assistant Floating (Nuovo)
- **Orb pulsante** sempre visibile (bottom-right)
- **Chat panel** espandibile con blur background
- **Quick actions** predefinite
- **Animazioni** smooth con Framer Motion

## Struttura Cartelle Aggiornata

```
src/modules/
├── visual-canvas/          ✅ Esistente
├── project-start/
│   ├── ProjectStart.jsx    ✅ Aggiornato con Mind Map
│   └── MindMap/
│       └── MindMapCanvas.jsx 🆕 React Flow
├── content-studio/         🆕 Nuovo modulo
│   ├── ContentStudio.jsx
│   ├── Calendar/
│   ├── Composer/
│   └── Analytics/
├── ai-assistant/           🆕 Nuovo modulo
│   └── FloatingAssistant.jsx
└── automation/             🆕 Per future integrazioni n8n
```

## Routes Aggiornate

- `/canvas` - Visual Canvas ✅
- `/start` - Project Start con Mind Map 🆕
- `/tracker` - Project Tracker ✅
- `/content` - Content Studio 🆕
- `/business` - Business Switcher ✅

## Test delle Nuove Features

1. **Avvia il server**: `npm run dev`
2. **Vai su `/start`** per vedere Project Start con Mind Map
3. **Clicca "Mind Map"** per testare i 3 stati: Hidden → Side → Full
4. **Naviga tra le 4 fasi** con i tab in alto
5. **Vai su `/content`** per vedere Content Studio
6. **Floating AI Assistant** è sempre visibile in basso a destra

## Prossimi Step

### Immediate (Sprint corrente):
1. ✅ Mind Map base con React Flow  
2. ✅ Content Studio UI structure
3. ✅ AI Assistant floating
4. 🔄 Collegamento dati Mind Map ↔ Canvas
5. 🔄 Content Calendar implementation

### Future:
- React Flow layout algorithms (Radial, Tree, Force-directed)
- OpenAI integration per AI Assistant
- Content scheduling e social media APIs
- n8n automation workflows

## Note Tecniche

- **React Flow** richiede CSS import: `import 'reactflow/dist/style.css'`
- **FloatingAssistant** è globale (fuori da Routes)
- **Mind Map state** al momento è locale - da collegare a store globale
- **Responsive design** ottimizzato per desktop

---

*Blueprint v3.0 - Mind Map & Content Studio Integration*