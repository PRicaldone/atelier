# Atelier Blueprint v3.1
**Command Center Creativo per Paolo Ricaldone**

## 🎯 Visione del Progetto

Atelier è un command center personalizzato per gestire l'intero flusso creativo di Paolo Ricaldone - artista NFT e VFX specialist. Il sistema integra gestione progetti, operazioni business, strumenti creativi e intelligenza artificiale in un'unica piattaforma fluida e responsive.

## 🏗️ Architettura del Sistema

### Stack Tecnologico
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Supabase (database + auth)
- **AI Integration**: OpenAI API
- **Automation**: n8n (self-hosted)
- **Mind Map**: React Flow + Custom Components
- **3D Effects**: Three.js (opzionale per background)
- **Deployment**: Vercel / Netlify
- **Version Control**: Git + GitHub
- **Asset Management**: Google Drive API

### Moduli Principali

#### 1. Visual Canvas ✅ COMPLETATO
- Grid dinamica progetti con anteprima
- Upload drag & drop multi-tipo (note, image, link, AI, board)
- Pan/Zoom avanzato con controlli mouse
- **Nested Boards con persistenza unificata**
- Tree View gerarchico navigabile
- Path Breadcrumb stile Finder
- Properties Panel dinamico
- Snap-to-grid, multi-select, shortcuts
- Dark mode completo

#### 2. Project Start 🆕 ENHANCED con Mind Garden
Modulo per far emergere, filtrare e avviare progetti con **Mind Garden** integrato.

##### 🌱 Mind Garden (Evolution della Mind Map)
**Design Concept**: Fusione tra mind map tradizionale e node garden interattivo

**Features Visive:**
- **Nodi come cards** fluttuanti (non cerchi)
  - Preview del contenuto inline
  - Bordi luminosi sottili con glow
  - Ombre soft per profondità 3D
  - Animazioni smooth su interazione

- **Connessioni organiche**
  - Curve Bezier animate stile Coggle
  - Spessore dinamico basato su importanza
  - Auto-routing intelligente per evitare overlap
  - Glow colorato su hover

- **Canvas infinito** con zoom semantico (Obsidian-inspired)
  - Livello far: solo titoli e connessioni
  - Livello medium: titoli + preview + icone
  - Livello close: contenuto completo espanso

- **Background vivo** (opzionale Three.js)
  - Particelle sottili che fluttuano
  - Connessioni fantasma tra nodi correlati
  - Risponde al movimento mouse
  - "Living document" atmosphere

**AI Integration Avanzata:**
```javascript
// Comandi AI nativi nel Mind Garden
const AICommands = {
  "@expand": "Genera 5 sub-idee da questo nodo",
  "@connect": "Trova relazioni nascoste tra nodi",
  "@visual": "Suggerisci reference visive",
  "@technical": "Breakdown tecnico (Houdini/Nuke)",
  "@narrative": "Sviluppa story arc",
  "/image": "Cerca e inserisci immagini pertinenti",
  "/houdini": "Template setup tecnico",
  "/concept": "Genera concept art prompt"
}
```

**Modalità Operative:**
1. **Structured Mode**: Albero gerarchico classico
2. **Freeform Mode**: Note fluttuanti stile Scapple
3. **Hybrid Mode**: Mix con aree strutturate e libere

**Comportamenti Smart:**
- **Auto-layout**: Riorganizzazione magnetica dei nodi
- **Cluster detection**: Raggruppamento automatico per tema
- **Smart suggestions**: AI propone connessioni mentre lavori
- **Content mixing**: Supporto per testo, immagini, link, embed

##### 🌀 Le 4 Fasi del Project Start:
1. **Inspiration Dump**
   - Mind Garden in modalità "chaos creativo"
   - Nodi aggiunti velocemente senza struttura
   - AI cattura pattern nascosti

2. **Idea Sorting**
   - Auto-clustering per temi simili
   - Drag per riorganizzare gerarchie
   - AI evidenzia connessioni importanti

3. **Foundation Block**
   - Template strutturati appaiono nel garden
   - Nodi si organizzano in 3 aree:
     - **Narrativa** (blu)
     - **Formale** (verde)
     - **Simbolica** (viola)

4. **Start or Park**
   - Vista "overview" del garden completo
   - Export come board in Visual Canvas
   - Snapshot salvato per riferimento

#### 3. Project Tracker
- Timeline visuale progetti
- Task management con stati
- Progress tracking e milestones
- Collegamento a board del canvas
- Sincronizzazione Google Calendar
- AI: suggerimenti task e priorità

#### 4. Content Studio 🆕 NUOVO MODULO
Hub dedicato per marketing e promozione progetti.

##### Features principali:
- **Content Calendar**
  - Vista mensile/settimanale
  - Drag & drop per ripianificare
  - Best time to post analysis
  
- **Post Composer**
  - Editor multi-piattaforma
  - Preview live per platform
  - AI copy generation
  - Hashtag research
  
- **Asset Generator**
  - Auto-resize per social
  - Template library
  - Brand consistency
  
- **Platform Manager**
  - Twitter/X, Instagram, Mirror, Lens
  - Bulk scheduling
  - Cross-posting intelligente
  
- **Analytics Dashboard**
  - Engagement tracking
  - Performance insights
  - ROI su promozione

##### 🔄 Automation Layer (n8n)
- **Visual workflow designer**
- **Pre-built templates**:
  - NFT Drop Campaign
  - Client Update Flow
  - Content Recycling
- **Trigger su eventi Atelier**
- **Webhook integration**

#### 5. Business Switcher
- Toggle NFT/VFX/AI mode
- UI adattiva per contesto
- Preset configurazioni
- Analytics per modalità

#### 6. AI Assistant Layer 🆕 ENHANCED
- **Floating AI Assistant** sempre presente
- **Context-aware**: sa dove sei e cosa fai
- **Modalità ibride**:
  - Quick actions buttons
  - Chat espandibile
  - Proactive suggestions
- **Mind Garden Integration**:
  - Genera nodi da conversazione
  - Espande idee in tempo reale
  - Connette concetti durante chat

#### 7. Control Room (Fase futura)
- Gestione Gmail avanzata
- Automazioni complesse con nodi visuali
- Monitoring sistema
- Backup automation

## 🎨 Mind Garden Technical Specs

### Component Architecture
```javascript
components/
  ProjectStart/
    MindGarden/
      MindGardenCanvas.jsx    // React Flow custom implementation
      NodeCard.jsx            // Card-style nodes with preview
      OrganicEdge.jsx         // Bezier curve connections
      SemanticZoom.jsx        // Zoom level manager
      AICommandPalette.jsx    // @ and / commands
      BackgroundParticles.jsx // Three.js effects
      AutoLayout.jsx          // Smart positioning algorithms
      ContentMixer.jsx        // Multi-type content handler
```

### Visual Design System
```javascript
const MindGardenTheme = {
  nodes: {
    base: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '16px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    },
    hover: {
      borderColor: 'rgba(59, 130, 246, 0.5)',
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
    },
    types: {
      narrative: { accentColor: '#3B82F6' },  // Blue
      formal: { accentColor: '#10B981' },     // Green  
      symbolic: { accentColor: '#8B5CF6' }    // Purple
    }
  },
  edges: {
    stroke: 'rgba(255, 255, 255, 0.2)',
    strokeWidth: (importance) => 1 + importance * 2,
    animation: 'pulse 3s ease-in-out infinite'
  }
}
```

### State Management
```javascript
const useMindGarden = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [layout, setLayout] = useState('hybrid');
  const [zoomLevel, setZoomLevel] = useState('medium');
  
  // AI-powered operations
  const expandNode = async (nodeId) => {
    const suggestions = await AI.generateSubNodes(nodeId);
    // Auto-position with force-directed layout
  };
  
  // Real-time collaboration prep
  const syncWithCanvas = () => {
    // Bidirectional sync with Visual Canvas
  };
}
```

## 📦 Database Schema Aggiornato

```sql
-- Mind Gardens (updated from mind_maps)
CREATE TABLE mind_gardens (
  id UUID PRIMARY KEY,
  project_start_id UUID REFERENCES project_starts(id),
  nodes JSONB, -- Enhanced: {id, type, content, position, preview, metadata}
  edges JSONB, -- Enhanced: {source, target, strength, type, bezierPath}
  layout_type TEXT DEFAULT 'hybrid',
  theme_config JSONB,
  ai_suggestions JSONB,
  snapshot BYTEA, -- Visual snapshot for quick preview
  updated_at TIMESTAMP
);

-- AI Interactions in Mind Garden
CREATE TABLE garden_ai_history (
  id UUID PRIMARY KEY,
  garden_id UUID REFERENCES mind_gardens(id),
  command TEXT,
  input_context JSONB,
  output JSONB,
  created_at TIMESTAMP
);
```

## 🚀 Implementazione Prioritaria

### Sprint 1: Mind Garden Core
1. Setup React Flow con custom nodes
2. Implementare NodeCard component
3. AI command palette base
4. Semantic zoom system

### Sprint 2: AI Integration  
1. OpenAI integration per comandi
2. Auto-layout algorithm
3. Smart suggestions real-time
4. Pattern recognition

### Sprint 3: Polish & Effects
1. Three.js background (optional)
2. Animazioni e transizioni
3. Export/Import functionality
4. Performance optimization

## 🎯 Next Steps Immediate

```bash
# 1. Install dependencies
npm install reactflow @react-three/fiber @react-three/drei framer-motion

# 2. Create Mind Garden structure
mkdir -p components/ProjectStart/MindGarden

# 3. Implement base components
# Start with MindGardenCanvas.jsx using React Flow
```

---

*Ultimo aggiornamento: July 2025*
*Versione Blueprint: 3.1 - Mind Garden Evolution*
