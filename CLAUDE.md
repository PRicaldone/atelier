# 🤖 CLAUDE.md - Contesto per l'AI Assistant

> Questo file contiene informazioni specifiche per Claude AI per comprendere rapidamente il progetto Atelier quando si riprende il lavoro.

## 📋 **KEY DOCUMENTATION QUICK ACCESS**

**🏆 Core Architecture:**
- `/docs/ATELIER-TRINITY-MANIFESTO.md` (v1.4) - Project North Star + Mobile-First Foundation
- `/docs/ENTERPRISE-DRAG-BASELINE.md` - Performance baseline protection
- `/docs/blueprint-v6.2.md` - Technical architecture

**🚀 PRO Trinity Amplifiers:**
- `/docs/TRINITY-AMPLIFIER-TITLE-FIELD.md` - Universal title system
- `/docs/TRINITY-AMPLIFIER-SEARCH-GESTURE.md` - No search bar revolution  
- `/docs/TRINITY-AMPLIFIER-GROUPING-CONTAINER.md` - Professional grouping
- `/docs/TRINITY-AMPLIFIER-RECTANGLE-MULTISELECTION.md` - Marquee selection

**🤌 Gesture System:**
- `/docs/GESTURE-GATE-PROTOCOL.md` - Feature validation framework
- `/docs/GESTURE-LANGUAGE-MAP.md` - Universal gesture patterns
- `/docs/GESTURE-REFERENCE-CARD.md` - Quick developer reference

**📱 Mobile-First Foundation:**
- `/docs/MOBILE-VALIDATION-MANIFESTO.md` - Touch-native experience standards
- `/docs/MOBILE-VALIDATION-CHECKLIST.md` - Mandatory PR validation requirements

**🌱 BiFlow System:**
- `/docs/TRINITY-BIFLOW-FEATURE.md` - Core BiFlow architecture and 1:1 relationship
- `/docs/BIFLOW-GENERAL-GARDEN-EXCEPTION.md` - Critical exception documentation
- `/docs/ATELIER-CORE-FLOWS.md` - Freestyle to Project philosophy
- `/webapp/src/modules/scriptorium/biflow-types.js` - Complete data model implementation
- `/webapp/src/modules/scriptorium/biflow-store.js` - Store operations and validation

## 🎯 Quick Start Command

Copia e incolla questo comando quando inizi una nuova chat:

```
Ciao Claude! Sto lavorando su Atelier, il mio command center creativo per progetti NFT/VFX.
Il progetto è in ~/atelier/ con webapp React in ~/atelier/webapp/.
Leggi ~/atelier/CLAUDE.md per il contesto completo e lo stato attuale del progetto.
Poi leggi ~/atelier/docs/blueprint.md e ~/atelier/docs/cheat-sheet.md per i dettagli.
L'ultimo salvataggio è del 20/07/2025 con Trinity+Gesture+Mobile Manifesto v1.4 - Mobile-First Foundation implementata con PRO Amplifiers completi.

IMPORTANTE: Attiva il Context Monitor automatico - monitora la conversazione e avvisami proattivamente quando è il momento di fare atelier-save prima che il contesto si esaurisca.
```

## 📊 Stato Progetto (Ultimo aggiornamento: 20/07/2025 - MOBILE-FIRST FOUNDATION)

### ⚠️ **IMPORTANTE: ATELIER 1.x - ROAD TO 2.0 (PRE-FORK)**

**ATTENZIONE: Atelier è attualmente in stato 1.x "pre-fork".**
- La branch/feature V2 verrà creata solo DOPO la validazione completa della Trinity+Gesture+Mobile
- Tutto il lavoro attuale serve a garantire che la V2 sia PULITA, CORE-FIRST, MOBILE-NATIVE, e senza debito tecnico
- NON confondere gli snapshot/commits attuali con V2: sono la base di partenza, NON la nuova architettura
- **Siamo in fase di validazione e pulizia Mobile-First, NON di sviluppo V2**

### 🏆 **TRINITY+GESTURE+MOBILE MANIFESTO v1.4: MOBILE-FIRST FOUNDATION** ⭐ **STRATEGIC BREAKTHROUGH**

**📱 MOBILE-FIRST FOUNDATION - COMPETITIVE ADVANTAGE SECURED**

**Il progetto ha raggiunto una svolta strategica critica: Mobile-First è ora parte integrante dell'identità Atelier, non un "nice-to-have" post-MVP. Questo posiziona Atelier per competere direttamente con Muse, Milanote mobile, Figma iPad, e Miro.**

**🔒 TRINITY+GESTURE+MOBILE CORE SYSTEMS (Non-Negotiable):**
1. **🎯 DRAG SYSTEM** - Enterprise 60fps pointer events (`22890ef` baseline) + native touch support
2. **🌳 NESTED BOARDS** - Infinite hierarchy con state preservation + touch navigation  
3. **📊 TREEVIEW SYNC** - Real-time bidirectional sync <150ms + mobile sidebar
4. **🤌 GESTURE SYSTEM** - Universal UX language ≤100ms response (desktop AND mobile)
5. **📱 MOBILE FOUNDATION** - Touch-native experience, 60fps on iPhone12/Pixel5, cross-platform parity

**🚪 CORE FEATURE GATE PROTOCOL:**
- Nessuna feature può essere "core" senza gesture accessibility nativa
- ≤100ms response time = baseline violation se violato (desktop AND mobile)
- Pattern consistency = linguaggio gesture è SACRED
- Universal access = desktop + touch, tutti i contesti
- Mobile-native = touch events implemented, works flawlessly on iOS/Android
- Real device tested = validated on physical iPhone 12+ and Pixel 5+ devices

### 🔊 **TRINITY AMPLIFIERS: Mandatory UX Patterns** ⭐ **PRO UPGRADED**

**Amplifiers non sono parte del Trinity Core, ma sono pattern obbligatori che rendono Trinity usabile at scale.**

**🏷️ TITLE FIELD AMPLIFIER #1:** ✅ **IMPLEMENTED**
- **Ogni elemento** (note, link, board, image, AI) supporta campo `title` opzionale
- **Display universale**: TreeView, Breadcrumbs, Search, Properties, Drag overlay
- **Import/Export**: Preservazione automatica titoli da fonti esterne
- **Performance**: <1ms overhead, impatto storage trascurabile
- **Differenziazione**: A differenza di Milanote, non serve raggruppare per avere titoli

**🔍 SEARCH-AS-GESTURE AMPLIFIER #2:** 📋 **DOCUMENTED**
- **NO SEARCH BAR**: Mai una barra di ricerca fissa nella UI
- **Gesture Activation**: Long-press o Cmd+F attiva AI prompt "Cerca..."
- **Natural Language**: Query naturali processate da AI ("note senza titolo", "link dal 2024")
- **Visual Response**: Highlighting spaziale, navigazione, mai solo liste
- **Poetic Feedback**: "Nessuna nota trovata... Vuoi crearne una qui?"

## 🚀 **PRO TRINITY AMPLIFIERS** - Professional Canvas Standards ⭐ **IMPLEMENTATI**

**📦 GROUPING/BOX CONTAINER AMPLIFIER #3:** ✅ **IMPLEMENTED**
- **Visual Containers**: Gruppi elementi in box con colori, titoli, bordi personalizzabili
- **Nested Support**: Infiniti livelli di grouping (come Figma/Miro)
- **Batch Operations**: Group/ungroup, duplicate gruppo implementati in store
- **Data Model**: GROUP element type con helper functions complete
- **Store Integration**: createGroup(), ungroupElement(), duplicateGroup() methods
- **Performance**: Ready for 60fps movement container + children

**▭ RECTANGLE MULTI-SELECTION AMPLIFIER #4:** ✅ **IMPLEMENTED**
- **Marquee Selection**: Drag su area vuota → rectangle selection con 60fps
- **Selection Modes**: Intersect (default), Contain (Shift+drag), Center (Alt+drag)
- **Visual Feedback**: Rectangle trasparente + highlight elementi in real-time
- **Multi-Element Drag**: Supporto drag simultaneo elementi selezionati
- **Performance Monitoring**: Real-time >16ms detection con warnings
- **Gesture Integration**: Modifier keys + visual mode indicators

**Strategic Importance**: 
🎯 **Grouping + Multi-Selection = Professional Canvas Standard**
- Required per competere con Figma, Miro, FigJam
- Trasforma workflow da "amateur click-by-click" a "pro multi-selection"
- Foundation per advanced organization e batch operations

**Implementation Status**:
- **Data Model**: `/src/modules/scriptorium/types.js` - GROUP element type ✅
- **Store Operations**: `/src/modules/scriptorium/store.js` - Group methods ✅  
- **UI Component**: `/src/modules/scriptorium/components/RectangleSelection.jsx` ✅
- **Integration**: VisualCanvasStandalone.jsx updated with professional selection ✅
- **Mobile-Ready**: Touch events and gesture integration prepared for validation ⚠️

**Documentation**: 
- `/docs/TRINITY-AMPLIFIER-TITLE-FIELD.md` ✅ 
- `/docs/TRINITY-AMPLIFIER-SEARCH-GESTURE.md` ✅
- `/docs/TRINITY-AMPLIFIER-GROUPING-CONTAINER.md` ✅
- `/docs/TRINITY-AMPLIFIER-RECTANGLE-MULTISELECTION.md` ✅
- `/docs/MOBILE-VALIDATION-MANIFESTO.md` ✅
- `/docs/MOBILE-VALIDATION-CHECKLIST.md` ✅

### 🎯 **ENTERPRISE DRAG & DROP SYSTEM: Baseline Established** ⭐ **CRITICAL MILESTONE**

**SISTEMA ENTERPRISE DRAG & DROP COMPLETATO - BASELINE DEFINITIVA PER FUTURE MODIFICHE**

**🔒 BASELINE COMMITMENT (`22890ef`) + PRO AMPLIFIERS + MOBILE FOUNDATION:**
- ✅ **60fps Performance**: Pointer events nativi, zero render loops (desktop AND mobile)
- ✅ **"drag perfetto"**: User experience level richiesto raggiunto  
- ✅ **Architettura Isolata**: VisualCanvasStandalone, Opzione A separation
- ✅ **React.StrictMode Compatible**: Zero interferenze cross-system
- ✅ **Console Pulita**: Da 171+ errori/min a 0 errori
- ✅ **PRO Multi-Selection**: Rectangle selection + multi-element drag
- ✅ **Group Operations**: Professional grouping con 60fps performance
- ⚠️ **Mobile-Native**: Touch events framework ready for validation phase
- ⚠️ **Cross-Platform**: iOS Safari + Android Chrome compatibility prepared

**🛡️ PROTECTION PROTOCOL:**
Qualsiasi modifica futura al drag & drop DEVE:
1. Mantenere almeno questo livello di performance (60fps desktop AND mobile)
2. Giustificare tradeoff con analisi dettagliata vs baseline
3. Includere rollback plan a questo stato gold standard
4. Passare tutti i quality gates established
5. Complete Mobile Validation Checklist with real device testing evidence
6. Maintain cross-platform parity between iOS Safari and Android Chrome

**📍 Technical Implementation:**
- **VisualCanvasStandalone.jsx**: Componente isolato con custom pointer events + PRO selection + mobile framework
- **RectangleSelection.jsx**: Professional marquee selection component with touch support preparation
- **Group Operations**: Store methods per createGroup/ungroup/duplicate
- **AppGesture.jsx**: Opzione A architecture (routes separate da GestureLayout)
- **Mobile Foundation**: Touch event framework integrated in component architecture
- **Performance**: 60fps native browser drag + selection, zero library dependencies
- **Testing**: StandaloneDragTest validation environment

### 🚪 **GESTURE TOOLCHAIN: Automated Enforcement System** ⭐ **AUTOMATION MILESTONE**

**Sistema completo di enforcement automatico per garantire rispetto della philosophy as protocol.**

**🛡️ GESTURE GATE ENFORCEMENT:**
- **GESTURE-GATE-PROTOCOL.md**: Framework di validazione completo
- **GESTURE-LANGUAGE-MAP.md**: Schema visuale universale gesture patterns
- **PR Template obbligatorio**: Gesture Gate Checklist per ogni feature
- **CI/CD Integration**: Automated testing gesture performance
- **Runtime Monitoring**: Auto-rollback se violazioni baseline

**🤌 CORE GESTURE PATTERNS (Desktop + Mobile):**
```
Long-press (≤100ms)     → AI Context Activation (mouse/touch)
Double-tap (≤100ms)     → Radial Menu (click/touch)
Drag & Drop (60fps)     → Movement + Nesting (mouse/touch)
Tap (≤50ms)            → Selection + Navigation (click/touch)
Swipe (≤100ms)         → Directional Operations (touch-native)
Pinch/Spread           → Zoom (native browser integration)
Two-finger pan         → Canvas Navigation (touch-only)
```

**⚡ AUTOMATIC ROLLBACK TRIGGERS:**
- >100ms gesture response = BASELINE VIOLATION (desktop OR mobile)
- New gesture patterns = LANGUAGE BREAK  
- Platform inconsistency = UNIVERSAL ACCESS FAIL
- Trinity conflicts = HARMONY VIOLATION
- Mobile functionality failure = MOBILE BASELINE VIOLATION
- Cross-platform parity break = PLATFORM CONSISTENCY FAIL

**📊 VALIDATION ROUTES:**
- `/trinity-test` - Trinity+Gesture+Mobile validation suite
- Comprehensive testing: drag + nested + tree + gesture systems + mobile framework
- Performance monitoring con real-time metrics (desktop AND mobile)
- Mobile device simulation and testing protocols

### 🎨 **GESTURE UI REVOLUTION: Complete System Implementation**

**Atelier ora include un sistema di interfaccia gesture-based rivoluzionario per flussi creativi senza attrito.**

**Gesture UI Features Implementate:**
1. **Gesture Detection System**: Double-click per radial menu, long-press per AI prompts
2. **React Component Architecture**: Header, CanvasContainer, RadialMenu, AIPrompt, ThemeProvider
3. **Theme System**: Light/dark mode con CSS custom properties e persistenza Zustand
4. **AI Integration**: SuperClaude+MCP ready con sistema prompt strutturato
5. **Mobile Optimization**: Touch-optimized con responsive design mobile-first
6. **Professional Documentation**: 2000+ linee di guide developer, examples, architecture
7. **Prototype Versioning**: Sistema versioning per UI con HTML prototypes in /docs/ui/prototypes/
8. **ModuleRegistry Integration**: Seamless integration con architettura Atelier esistente

### 🤖 **AI REVOLUTION: SuperClaude+MCP Phase 1 Complete**

**Sistema AI completo con governance, sicurezza e automazione intelligente.**

**SuperClaude+MCP Features:**
1. **AI Security Infrastructure**: Data sanitization, PII protection, consent management
2. **AI Transparency Dashboard**: Real-time monitoring, usage analytics, governance
3. **SuperClaude AI Agent**: Board generation, workflow automation, content analysis
4. **AI Board Generator**: Scriptorium integration con AI-powered board creation
5. **Automatic Ideas Capture**: Sistema intelligente per catturare idee di business automaticamente
6. **AI Fallback System**: Graceful degradation con manual override quando AI fallisce
7. **Event-Driven AI Communication**: Cross-module AI coordination via Event Bus

### 🎯 **PHILOSOPHY UPDATE: Creative Polymorph Optimization**

**Atelier è ora ottimizzato per artisti polimorfi e knowledge worker che cambiano spesso rotta e progetto.** 

**Core Principles implementati:**
1. **Rilascio Incrementale e Test Reali**: Ogni automazione validata nel ciclo creativo reale
2. **Documentazione Viva**: Sistema auto-aggiornante di docs e dashboard
3. **Coerenza Architetturale**: Zero shortcut, sempre architettura pulita e testata
4. **Multi-User Ready**: Preparazione per isolamento dati e preferenze utente
5. **AI Trasparente**: Preview Mode per ogni comando con spiegazione e undo
6. **Workflow "Cambia Idea Spesso"**: Supporto per ramificazione, duplicazione, archiviazione rapida
7. **KPI Risparmio Tempo**: Ogni automazione deve dimostrare ROI temporale

### ✅ Moduli Completati

1. **Creative Atelier** (100% completo)
   - Drag & drop multi-tipo (note, image, link, AI, board)
   - Pan con Alt+drag o middle mouse
   - Zoom con right-click+drag (0.1x-5x)
   - Tree View gerarchico con nested boards
   - Path Breadcrumb navigabile stile Finder
   - Properties Panel dinamico
   - Snap-to-grid, multi-select, shortcuts
   - Persistenza automatica in localStorage

2. **Mind Garden** (100% completo)
   - ReactFlow-based visual mind mapping
   - Ultra-intense selection visual (Ring4 + Triple Glow + Badge)
   - Right-click zoom Wacom-friendly (clamp max 1x)
   - Export to Creative Atelier workflow (Mind Garden → Creative Atelier notes)
   - Auto-centering nodes with optimal zoom
   - Creative Atelier-coherent UI layout
   - AI Command Palette integration
   - Organic edges e phase-based coloring

3. **Orchestra** (rinominato da Content Studio)
   - Renamed seamlessly with alias system
   - Backwards compatibility garantita
   - Ready for AI agents implementation

4. **Business Switcher** (funzionale)
   - Switch tra business multipli
   - Stato persistente

5. **Project Tracker** (base implementata)
   - Lista progetti
   - Stati e progressi

### 🏗️ **PROFESSIONAL MODULE SYSTEM** (100% completo)

6. **Module Registry** (100% completo)
   - Gestione centralizzata di tutti i moduli
   - Lazy loading con contract validation
   - Alias system per backwards compatibility
   - Safe cross-module method invocation

7. **Adapter Pattern** (100% completo)
   - CanvasAdapter per operazioni sicure Canvas
   - MindGardenAdapter per operazioni sicure Mind Garden
   - OrchestratAdapter per operazioni sicure Orchestra
   - Error-safe communication tra moduli

8. **Event Bus System** (100% completo)
   - Event-driven communication asincrona
   - History tracking per monitoring
   - Structured events con costanti
   - Cross-module communication patterns

9. **Error Tracking System** (100% completo)
   - Centralized error logging
   - Real-time statistics per modulo
   - Search e filtering capabilities
   - JSON export per analysis

10. **Event Monitoring Dashboard** (100% completo)
    - Real-time event stream visualization
    - Module health monitoring
    - Error statistics e analytics
    - Test utilities per development
    - Professional export capabilities

### 🌱 **BIFLOW SYSTEM** (100% completo)

11. **BiFlow Architecture** (100% completo)
    - **CORE PRINCIPLE**: Sacred 1:1 Board ↔ Mind Garden relationship
    - **GENERAL MIND GARDEN EXCEPTION**: Only `id: 'general'` allowed without board
    - Bidirectional promotion flow: Mind Garden → Board creation
    - Dedicated garden auto-creation for every board
    - Origin tracking system (MG-generale, manual, AI, sub-board, duplicated)
    - Performance optimization with lazy loading and caching

12. **Freestyle to Project Philosophy** (100% completo)
    - **CORE PRINCIPLE**: All creative spaces start as freestyle, promotion optional
    - **UNIVERSAL START**: Zero barriers to creativity (no names, structure, categories)
    - **FLUID PROMOTION**: Reversible transition freestyle ↔ project with zero data loss
    - **FEATURE EQUALITY**: No core features limited to project mode
    - **MEMORY PERSISTENCE**: All freestyle spaces always accessible and searchable
    - **ANTI-ANXIETY**: Gentle invitation patterns, never force structure

13. **BiFlow Data Model** (100% completo)
    - Extended Board structure with mindGardenId (never null)
    - Extended Mind Garden structure with boardId (null only for General)
    - Creative mode support (freestyle/project) with promotion history
    - Validation system with General Garden exception handling
    - Migration utilities for legacy boards without gardens
    - Parent-child hierarchy support for infinite nesting

### 🎨 **GESTURE UI SYSTEM** (100% completo)

11. **Gesture Detection System** (100% completo)
    - Double-click for radial menu
    - Long-press for AI prompts
    - Mobile touch optimization
    - Keyboard accessibility alternatives

12. **React Component Architecture** (100% completo)
    - GestureLayout main orchestrator
    - Header floating navigation
    - CanvasContainer gesture detection
    - RadialMenu creation overlay
    - AIPrompt AI interaction
    - ThemeProvider theme management

13. **Professional Documentation** (100% completo)
    - GESTURE_UI_GUIDE.md (750+ linee)
    - EXAMPLES.md (930+ linee practical examples)
    - VISUAL_ARCHITECTURE.md (system diagrams)
    - README.md (quick start guide)
    - Prototype versioning system

14. **Integration Architecture** (100% completo)
    - ModuleRegistry seamless integration
    - EventBus cross-module communication
    - SuperClaude+MCP AI ready
    - Theme persistence con Zustand
    - Performance optimization (60fps)

11. **🔬 ANALYTICS SYSTEM COMPLETE** (100% completo)
    - **Usage Tracking**: Real-time tracking di ogni interazione utente
    - **Pattern Recognition**: AI identifica i 5 workflow più frequenti per automazione
    - **Time Saved Metrics**: KPI precisi di tempo risparmiato con ROI validation
    - **Analytics Dashboard**: Dashboard unificata per insights e raccomandazioni
    - **AI Command Tracking**: Tracking automatico di ogni comando AI con time saved

12. **🔍 AI COMMAND BAR PREVIEW MODE** (100% completo)
    - **Transparent AI**: Preview step-by-step di ogni comando prima dell'esecuzione
    - **Risk Assessment**: Analisi rischi con mitigazione strategies
    - **Impact Analysis**: Preview di modifiche e effetti cross-module
    - **Customization Options**: Opzioni di esecuzione personalizzabili
    - **Technical Details**: Breakdown tecnico per power users
    - **Undo/Rollback Ready**: Foundation per sistema di undo completo

13. **🔐 SECURITY IMPLEMENTATION** (100% completo)
    - **API Proxy**: Server-side API calls, nessuna key esposta
    - **Secure Storage**: AES-256 encryption per localStorage
    - **Security Headers**: CSP, X-Frame-Options, XSS protection
    - **Auth Placeholder**: Demo mode pronto per real auth
    - **Security Monitor**: Dashboard real-time status
    - **Auto Migration**: Da plain text a encrypted storage

### 🤖 **ATELIER ROUTINE AGENT SYSTEM** (100% completo)

11. **Atelier Routine Agent** (100% completo)
    - Autonomous system maintenance agent
    - Comprehensive health check automation
    - Structured maintenance checklists (Daily/Weekly/Critical)
    - Module Registry integration per health monitoring
    - Event Bus flow verification
    - Error tracking trend analysis
    - Storage health monitoring
    - Adapter communication testing
    - Performance bottleneck detection

12. **Routine Agent Dashboard** (100% completo)
    - Real-time system health visualization
    - Scheduled maintenance alerts
    - Quick checklist execution buttons
    - Health check history tracking
    - Expandable check details
    - Color-coded status indicators
    - Actionable recommendations display

13. **Automated Checklists** (100% completo)
    - Daily routine: Module health, error count, event flow, storage, backup reminders
    - Weekly routine: Dependencies, performance review, code quality, documentation
    - Critical routine: Contract validation, adapter testing, data integrity
    - Scheduled execution tracking
    - User action reminders
    - Automated vs manual check differentiation

### 🔧 Stack Tecnico

- **Frontend**: React 18 + Vite + Tailwind CSS
- **State Management**: Zustand con middleware
- **Drag & Drop**: @dnd-kit/sortable + @dnd-kit/core
- **Animazioni**: Framer Motion
- **Icone**: Lucide React
- **Backend Ready**: Supabase config (da attivare)
- **Professional Architecture**: Module Registry + Adapter Pattern + Event Bus
- **Monitoring**: Centralized Error Tracking + Real-time Dashboard
- **Gesture UI**: Custom gesture detection + Theme system + Mobile optimization
- **Typography**: Inter (body) + Playfair Display (headings) + JetBrains Mono (code)

### 📁 Struttura File Critici

```
~/atelier/
├── webapp/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── scriptorium/ (rinominato da visual-canvas)
│   │   │   │   ├── VisualCanvasStandalone.jsx (enterprise drag + PRO selection)
│   │   │   │   ├── VisualCanvasStandaloneSync.jsx (TreeView sync wrapper)
│   │   │   │   ├── store.js (stato + group operations)
│   │   │   │   ├── types.js (tipi + GROUP element + groupHelpers)
│   │   │   │   └── components/
│   │   │   │       ├── TreeViewSidebar.jsx (gerarchia)
│   │   │   │       ├── PathBreadcrumb.jsx (navigazione)
│   │   │   │       ├── PropertiesPanel.jsx (proprietà + title field)
│   │   │   │       ├── CanvasToolbar.jsx (tools)
│   │   │   │       └── RectangleSelection.jsx (🚀 PRO marquee selection)
│   │   │   ├── mind-garden/
│   │   │   │   ├── MindGarden.jsx (componente principale)
│   │   │   │   └── store.js (stato e logica)
│   │   │   ├── orchestra/
│   │   │   │   └── Orchestra.jsx (componente principale)
│   │   │   └── shared/
│   │   │       ├── registry/
│   │   │       │   └── ModuleRegistry.js (gestione moduli)
│   │   │       ├── adapters/
│   │   │       │   ├── CanvasAdapter.js (safe canvas operations)
│   │   │       │   └── MindGardenAdapter.js (safe mind garden operations)
│   │   │       ├── events/
│   │   │       │   ├── EventBus.js (comunicazione asincrona)
│   │   │       │   └── events-matrix.md (documentazione eventi)
│   │   │       ├── monitoring/
│   │   │       │   ├── ErrorTracker.js (error tracking centralizzato)
│   │   │       │   └── ModuleLogger.js (convenience wrappers)
│   │   │       ├── agents/
│   │   │       │   ├── AtelierRoutineAgent.js (autonomous maintenance)
│   │   │       │   ├── routineChecklist.js (structured checklists)
│   │   │       │   ├── testRoutineAgent.js (testing utilities)
│   │   │       │   └── index.js (agents export)
│   │   │       └── security/
│   │   │           ├── SecurityStatus.jsx (dashboard monitor)
│   │   │           └── migrationSecureStorage.js (auto-migration)
│   │   ├── components/
│   │   │   ├── EventMonitoringDashboard.jsx (dashboard monitoraggio)
│   │   │   ├── ErrorTrackingDemo.jsx (demo error tracking)
│   │   │   └── RoutineAgentDashboard.jsx (routine agent UI)
│   │   ├── test/
│   │   │   └── TrinityValidationTest.jsx (Trinity+Gesture validation suite)
│   │   ├── utils/
│   │   │   ├── monitoringTestUtils.js (test utilities)
│   │   │   ├── apiClient.js (secure API proxy client)
│   │   │   ├── secureStorage.js (AES-256 encryption)
│   │   │   ├── authPlaceholder.js (demo auth system)
│   │   │   └── welcomeAnalytics.js (welcome page analytics system)
│   │   └── [config, hooks, utils...]
│   └── package.json
├── api/
│   ├── anthropic.js (server-side proxy)
│   ├── openai.js (server-side proxy)
│   └── health.js (status endpoint)
├── vercel.json (security headers + deploy config)
├── docs/
│   ├── 🏆 ATELIER-TRINITY-MANIFESTO.md (v1.2 - GESTURE AS IDENTITY + AMPLIFIERS)
│   ├── 🚪 GESTURE-GATE-PROTOCOL.md (automated enforcement framework)
│   ├── 🤌 GESTURE-LANGUAGE-MAP.md (universal gesture patterns reference)
│   ├── 🤌 GESTURE-REFERENCE-CARD.md (quick developer reference)
│   ├── 🛡️ ENTERPRISE-DRAG-BASELINE.md (drag system protection protocol)
│   ├── 🏷️ TRINITY-AMPLIFIER-TITLE-FIELD.md (mandatory UX pattern #1)
│   ├── 🔍 TRINITY-AMPLIFIER-SEARCH-GESTURE.md (no search bar revolution #2)
│   ├── ui/
│   │   ├── GESTURE_UI_GUIDE.md (comprehensive developer guide 750+ linee)
│   │   ├── EXAMPLES.md (practical examples 930+ linee)
│   │   ├── README.md (quick start guide)
│   │   ├── WELCOME-POETRY.md (complete poetry system documentation)
│   │   └── prototypes/
│   │       └── v1.0-gesture-canvas.html (original HTML prototype)
│   ├── architecture/
│   │   └── VISUAL_ARCHITECTURE.md (system diagrams)
│   ├── blueprint-v6.2.md (architettura professionale)
│   ├── cheat-sheet.md (comandi e workflow)
│   └── security-implementation.md (documentazione sicurezza)
├── ATELIER-VERSIONS/ (snapshots locali)
├── ATELIER-BACKUPS/ (backup settimanali)
└── atelier-save.sh (script backup principale)
```

### 🐛 Ultimi Fix Implementati

1. **Pan non funzionava** → Risolto con event handling prioritario
2. **Tree View non aggiornava con nested boards** → Fix con `saveCurrentLevelToParent()`
3. **Path Breadcrumb non navigava** → Fix con stato sincronizzato
4. **Drag ghosting offset** → Semplificato DragOverlay
5. **Toolbar non centrata** → Fix positioning con calcolo dinamico

### 🏗️ **PROFESSIONAL ARCHITECTURE IMPLEMENTED**

6. **Module Coupling Issues** → Risolto con Module Registry + Adapter Pattern
7. **Cross-module Communication** → Implementato Event Bus asincrono
8. **Error Tracking** → Sistema centralizzato con structured logging
9. **Module Renaming Breaking Changes** → Alias system per backwards compatibility
10. **System Monitoring** → Real-time dashboard con health checks

### 🎨 **GESTURE UI SYSTEM IMPLEMENTED**

11. **Traditional UI Friction** → Risolto con gesture-based interface rivoluzionario
12. **Zero-friction Creative Workflow** → Double-click radial menu, long-press AI prompts
13. **Theme System Chaos** → CSS custom properties con light/dark persistence
14. **Mobile UX Gaps** → Touch-optimized con responsive design mobile-first
15. **Documentation Fragmentation** → 2000+ linee comprehensive docs con examples
16. **Prototype Version Control** → Sistema versioning HTML prototypes in /docs/ui/prototypes/

### 🚀 Prossimi Step Suggeriti

1. **Gesture UI Integration Testing**:
   - A/B testing tra traditional UI vs gesture UI
   - User experience metrics e feedback collection
   - Performance monitoring gesture detection
   - Cross-browser compatibility testing

2. **Advanced Gesture Features**:
   - Multi-touch gestures (pinch-to-zoom, rotate)
   - Voice commands integration
   - Gesture recording e playback per automation
   - Custom gesture training per power users

3. **AI Integration Enhancement**:
   - Context-aware AI prompts based on canvas content
   - Visual AI commands (sketch-to-element)
   - AI-powered gesture suggestions
   - Predictive element creation

4. **Production Deployment**:
   - Gesture UI A/B testing framework
   - Real-time analytics gesture usage
   - Progressive rollout strategy
   - Fallback mechanism per compatibility

### 🎨 **WELCOME PAGE POETRY SYSTEM** (100% completo)

15. **Poetic Statements System** (100% completo)
    - Random rotating statements on each page load
    - Context-aware filtering (newUser/returning/powerUser/temporal)
    - "Show another thought" button for manual cycling
    - Theme-aware typography and styling

16. **Advanced Gesture Support** (100% completo)
    - Desktop: Click, double-click, long-press detection
    - Mobile: Touch, double-tap, long-press with proper timing
    - Cross-platform gesture consistency
    - Accessibility support with keyboard alternatives

17. **Comprehensive Analytics** (100% completo)
    - EventBus integration per real-time tracking
    - User behavior classification (explorer/poetry_lover/browser/etc.)
    - Statement engagement metrics
    - Session analytics con export capabilities

18. **Professional Integration** (100% completo)
    - ModuleRegistry seamless integration
    - ThemeProvider automatic adaptation
    - EventBus cross-module communication
    - Complete documentation e best practices

### 🔮 **Future-Proof Vision: Next-Generation Creative Interfaces**

19. **Immersive Technologies**:
   - **VR Integration**: 3D canvas manipulation con hand tracking
   - **AR Overlay**: Mixed reality per project visualization
   - **Spatial Computing**: Gesture recognition in 3D space
   - **Haptic Feedback**: Tactile response per element interaction

20. **Real-Time Collaboration**:
   - **Multi-user Canvas**: Concurrent editing con conflict resolution
   - **Live Cursors**: Real-time presence awareness
   - **Voice Chat**: Integrated communication durante collaboration
   - **Shared AI Context**: Collaborative AI prompts e suggestions

21. **Advanced AI Features**:
   - **Voice Commands**: Natural language canvas control
   - **Smart Templates**: AI-generated layout suggestions
   - **Intelligent Automation**: Workflow learning e auto-execution
   - **Predictive UI**: Interface adaptation based su user patterns

22. **Cross-Platform Expansion**:
   - **Mobile Native**: iOS/Android app con gesture parity (FOUNDATION IMPLEMENTED v1.4)
   - **Desktop Integration**: System-level shortcuts e notifications
   - **API Ecosystem**: Third-party tool integrations
   - **Touch-First PWA**: Progressive Web App optimization for mobile devices
   - **Plugin Architecture**: Extensible functionality system

### 💡 Note Tecniche Importanti

1. **Trinity+Gesture+Mobile Architecture (v1.4)**:
   ```javascript
   // CORE FEATURE GATE CHECK (Desktop + Mobile)
   const isFeatureCore = (feature) => {
     return feature.hasGestureAccess && 
            feature.responseTime <= 100 &&
            feature.isUniversal && 
            feature.respectsPatterns &&
            feature.trinityIntegration &&
            feature.mobileNative &&
            feature.realDeviceTested;
   };
   
   // GESTURE BASELINE VALIDATION (Cross-Platform)
   const validateGesture = async (gestureType, platform = 'desktop') => {
     const startTime = performance.now();
     await executeGesture(gestureType, platform);
     const responseTime = performance.now() - startTime;
     
     if (responseTime > 100) {
       triggerBaselineViolation(gestureType, responseTime, platform);
     }
   };
   
   // TRINITY+MOBILE SYSTEM INTEGRATION
   const trinitySystemOk = (platform = 'all') => {
     const baseChecks = dragSystem.performance >= 60 &&
            nestedBoards.statePreservation &&
            treeViewSync.responseTime < 150 &&
            gestureSystem.responseTime <= 100;
            
     if (platform === 'mobile' || platform === 'all') {
       return baseChecks &&
              mobileFoundation.touchEvents &&
              mobileFoundation.crossPlatformParity &&
              mobileFoundation.realDeviceTested;
     }
     
     return baseChecks;
   };
   ```

2. **Enterprise Drag Baseline Protection + Mobile**:
   ```javascript
   // Baseline `22890ef` Protection + Mobile Foundation
   const dragBaseline = {
     fps: 60,
     renderLoops: 0,
     ghostLag: 0,
     architecture: 'VisualCanvasStandalone',
     performance: 'enterprise-grade',
     mobileSupport: {
       touchEvents: true,
       crossPlatform: ['iOS Safari', 'Android Chrome'],
       touchPrecision: '<2px',
       realDeviceTested: true
     }
   };
   
   // Any change must meet or exceed baseline (desktop AND mobile)
   if (newDragPerformance.fps < dragBaseline.fps) {
     throw new BaselineViolationError('Drag performance regression');
   }
   
   if (!newDragPerformance.mobileSupport.touchEvents) {
     throw new MobileBaselineViolationError('Touch events required');
   }
   ```

3. **Module Registry Pattern**:
   ```javascript
   // Registrazione modulo con contract validation
   moduleRegistry.register('canvas', canvasFactory, {
     adapter: canvasAdapter,
     contract: ICanvas,
     aliases: ['creative-atelier', 'visual-canvas']
   });
   ```

2. **Adapter Pattern Communication**:
   ```javascript
   // Safe cross-module communication
   const elementId = await canvasAdapter.addElement('note', {x: 100, y: 100}, data);
   ```

3. **Event Bus System**:
   ```javascript
   // Structured event communication
   eventBus.emit(ModuleEvents.CANVAS_ELEMENT_CREATED, { elementId, type: 'note' });
   ```

4. **Error Tracking**:
   ```javascript
   // Centralized error logging
   canvasLogger.error(error, 'addElement', { elementType: 'note' });
   ```

5. **Gesture UI Implementation**:
   ```javascript
   // Gesture detection patterns
   const handleDoubleClick = (e) => {
     if (e.target === canvas) {
       openRadialMenu(e.clientX - 120, e.clientY - 120);
     }
   };
   
   const handleLongPress = (e) => {
     longPressTimer = setTimeout(() => {
       openAIPrompt(e.clientX - 160, e.clientY - 10);
     }, 500);
   };
   ```

6. **Theme System**:
   ```css
   /* CSS custom properties per theme consistency */
   :root {
     --bg-primary: #FAFAF9;
     --accent: #5E5CE6;
     --shadow-sm: 0 2px 8px rgba(0,0,0,0.04);
   }
   
   body.dark-theme {
     --bg-primary: #0A0A0C;
     --accent: #6B69D6;
     --shadow-sm: 0 2px 8px rgba(0,0,0,0.4);
   }
   ```

7. **Legacy System Compatibility**:
   - Viewport Transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
   - Persistenza: `secureStorage.getItem('ATELIER_CANVAS_ELEMENTS')` (encrypted)
   - Mouse Priority: Right-click → Zoom, Alt/Middle → Pan
   - Layout: Left sidebar: 240px, Right sidebar: 320px

6. **Security System**:
   ```javascript
   // Secure API calls
   const response = await apiClient.callAnthropic(messages, options);
   
   // Encrypted storage
   secureStorage.setItem('CANVAS_ELEMENTS', data); // AES-256 encrypted
   
   // Security monitoring
   window.__secureStorage // Debug encrypted storage
   window.__migrationStatus // Check migration status
   ```

### 🔍 Debug Commands

```javascript
// TRINITY+GESTURE SYSTEM (v1.2)
window.location.href = '/trinity-test' // Trinity+Gesture validation suite
// Testa tutti e 4 i core systems: Drag + Nested + Tree + Gesture

// ENTERPRISE DRAG BASELINE
window.__dragPerformance.getStats() // 60fps monitoring
window.__dragPerformance.validateBaseline() // check `22890ef` compliance

// GESTURE SYSTEM (Desktop + Mobile)
window.__gestureMonitor.getResponseTimes() // ≤100ms validation
window.__gestureMonitor.testLongPress() // test AI activation
window.__gestureMonitor.testDoubleTap() // test radial menu
window.__gestureMonitor.validateUniversalAccess() // desktop + touch
window.__gestureMonitor.testMobileGestures() // mobile-specific testing
window.__gestureMonitor.validateCrossPlatform() // iOS Safari + Android Chrome

// SEARCH-AS-GESTURE AMPLIFIER
window.__searchGesture.testActivation() // long-press + cmd+f testing
window.__searchGesture.testAIQuery('note senza titolo') // natural language test
window.__searchGesture.validateNoSearchBar() // ensure no UI search bar
window.__searchGesture.getResponseTimes() // ≤300ms first results

// PRO TRINITY AMPLIFIERS (Desktop + Mobile)
window.__groupOperations.testCreateGroup() // test group creation
window.__groupOperations.testUngroup() // test ungrouping
window.__groupOperations.testDuplicateGroup() // test group duplication
window.__groupOperations.getPerformanceStats() // 60fps group operations
window.__groupOperations.testMobileGrouping() // mobile touch grouping
window.__groupOperations.validateCrossPlatform() // mobile parity testing

window.__rectangleSelection.testMarqueeSelection() // test rectangle selection
window.__rectangleSelection.testSelectionModes() // intersect/contain/center
window.__rectangleSelection.testMultiElementDrag() // test multi-element drag
window.__rectangleSelection.getPerformanceStats() // <16ms response tracking
window.__rectangleSelection.testMobileSelection() // mobile long-press marquee
window.__rectangleSelection.validateTouchTargets() // ≥44px touch targets

// LEGACY SYSTEM
secureStorage.getItem('ATELIER_CANVAS_ELEMENTS') // encrypted storage
useCanvasStore.getState() // vedi stato completo

// PROFESSIONAL MODULE SYSTEM
window.__moduleRegistry.getInfo() // info moduli registrati
window.__eventBus.getStats() // statistiche eventi
window.__errorTracker.getStats() // statistiche errori
window.__monitoringTestUtils.generateTestEvents() // genera test events

// GESTURE UI SYSTEM
window.__atelierUI.toggleTheme() // toggle theme
window.__atelierUI.openRadialMenu(400, 300) // open radial menu at position
window.__atelierUI.openAIPrompt(200, 150) // open AI prompt at position
window.__atelierUI.getTheme() // get current theme

// WELCOME PAGE POETRY SYSTEM
window.__welcomeAnalytics.getStats() // session analytics
window.__welcomeAnalytics.getInsights() // user behavior insights
window.__welcomeAnalytics.getPopular() // popular statements
window.__welcomeAnalytics.export() // export all data
window.__welcomeAnalytics.reset() // reset session data
window.__welcomeAnalytics.simulateEngagement() // test data generation

// SECURITY SYSTEM
window.__secureStorage // access secure storage
window.__migrationStatus() // check migration status
window.__authStatus() // check auth state

// ATELIER ROUTINE AGENT
window.__atelierRoutineAgent.runRoutine() // esegui routine completa
window.__atelierRoutineAgent.runChecklist('daily') // esegui checklist giornaliera
window.__atelierRoutineAgent.runChecklist('weekly') // esegui checklist settimanale
window.__atelierRoutineAgent.runChecklist('critical') // esegui checklist critica
window.__atelierRoutineAgent.getConfig() // configurazione agent
window.__atelierRoutineAgent.checkModuleHealth() // check singolo modulo

// 🔬 ANALYTICS SYSTEM (NEW)
window.__usageTracker.getAnalytics() // analytics complete
window.__patternRecognition.getInsights() // pattern insights  
window.__timeSavedMetrics.getTimeSavedReport() // time saved report
window.__analyticsSystem.getComprehensiveReport() // tutto insieme

// ANALYTICS TESTING
window.__analyticsHelpers.testAICommand() // test AI command tracking
window.__analyticsHelpers.testNavigation() // test navigation tracking  
window.__analyticsHelpers.testWorkflow() // test workflow tracking
window.__analyticsHelpers.getReport() // get full report
window.__analyticsHelpers.exportAll() // export tutti i dati
window.__analyticsHelpers.reset() // reset analytics data
```

### 📝 Git Workflow

```bash
# Check status
git status

# Ultimo commit
git log --oneline -1

# Salva tutto
./atelier-save.sh "Messaggio commit"
```

### 🌳 Branch Management

**MANDATORY FEATURE BRANCH POLICY** 🚨

**⚠️ IMPORTANT**: Per QUALSIASI nuova funzionalità rilevante o nuovo modulo, Claude DEVE SEMPRE creare una feature branch dedicata. NON sviluppare mai direttamente su `main` per features significative.

**Branch Structure:**
```
main              → Stable, production-ready (Mind Garden v5.1 + Export System)
feature/*         → MANDATORY per nuove features rilevanti
hotfix/*          → Solo per bug critici su main
experimental/*    → Proof of concepts e sperimentazioni
```

**🚨 MANDATORY BRANCH CREATION TRIGGERS:**
- ✨ **Nuovi moduli**: Qualsiasi nuovo modulo principale
- 🔧 **Funzionalità rilevanti**: Features che richiedono >5 file modificati
- 🤖 **Integrazioni AI**: Nuovi sistemi AI o upgrade significativi
- 🏢 **SaaS features**: Authentication, billing, collaboration
- 📦 **Breaking changes**: Modifiche che potrebbero rompere esistente
- 🎯 **Roadmap milestones**: Ogni milestone principale del roadmap

**Current Status:**
- **Active branch**: `feature/custom-pointer-drag` ✅ 
- **Contains**: Enterprise Drag & Drop System completato - BASELINE STABILITA
- **GitHub URL**: `https://github.com/PRicaldone/atelier/tree/feature/custom-pointer-drag`
- **Last feature**: Custom pointer events 60fps drag system (`22890ef`) - GOLD STANDARD

**🎯 MANDATORY Workflow per nuove features:**

**Step 1: SEMPRE creare feature branch**
```bash
# Template naming convention
git checkout -b feature/[module-name]-[description]
git checkout -b feature/saas-authentication
git checkout -b feature/mind-garden-templates
git checkout -b feature/canvas-collaboration
git checkout -b experimental/anthropic-sdk-upgrade
```

**Step 2: Sviluppo e testing**
```bash
# Sviluppo sulla feature branch
git add . && git commit -m "feat: implement new feature"
./atelier-save.sh "Feature progress - specific description"

# Testing e iteration
npm run dev
npm run build
npm run typecheck
```

**Step 3: Merge solo quando completo**
```bash
# Solo quando feature è 100% completa e testata
git checkout main
git merge feature/nome-feature
git branch -d feature/nome-feature  # Cleanup locale
git push origin --delete feature/nome-feature  # Cleanup remote
```

**🚫 FORBIDDEN: Direct main development**
- NON commitare mai features direttamente su main
- NON usare main per sperimentazione
- NON mergere features incomplete

**✅ ALLOWED on main:**
- Hotfix critici (1-2 file max)
- Documentation updates
- Configuration tweaks
- Emergency bug fixes

**Branch Commands:**
```bash
# Verifica branch corrente
git branch -a
git status

# Crea feature branch (MANDATORY per nuove features)
git checkout -b feature/description-of-work

# Verifica remote branches
git ls-remote --heads origin

# Cleanup dopo merge
git branch -d feature/old-feature
git push origin --delete feature/old-feature
```

**🎯 MANDATORY Feature Branch Protocol:**
1. **PRIMA** di iniziare qualsiasi sviluppo significativo → crea feature branch
2. Sviluppa SOLO sulla feature branch
3. Push regolari con atelier-save.sh
4. Merge su `main` SOLO quando feature completa e testata
5. Cleanup branch dopo merge

**🤖 Claude Behavior:**
- Claude DEVE creare feature branch per qualsiasi richiesta di sviluppo significativo
- Claude DEVE avvisare se l'utente vuole sviluppare direttamente su main
- Claude DEVE suggerire nomi appropriati per feature branches
- Claude DEVE verificare che siamo sulla branch corretta prima di iniziare sviluppo

### 🌐 Development

```bash
# Start dev server
cd ~/atelier/webapp && npm run dev
# Apri http://localhost:5174

# Build production
npm run build

# Type check
npm run typecheck
```

## 🎨 **CREATIVE POLYMORPH WORKFLOW SUPPORT**

**Atelier è progettato per artisti e knowledge worker che "cambiano spesso idea" e saltano tra progetti diversi.**

### 🔄 **Change Mind Often Features** (Implementate)
- **Quick Duplicate**: One-click board/project duplication ✅
- **Branch/Archive**: Git-like branching per progetti creativi ✅  
- **Context Switching**: Memory di "dove ero" quando cambi progetto ✅
- **Cross-Module Flow**: Trasferimento fluido Mind Garden → Scriptorium → Orchestra ✅
- **AI Command Bar**: Interfaccia unificata per automazioni cross-module ✅

### 📊 **Time-Saving KPI Tracking** (Implementato)
- **Real-Time Analytics**: Ogni azione tracciata per identificare pattern ✅
- **ROI Validation**: Ogni automazione dimostra tempo risparmiato ✅
- **Pattern Recognition**: AI identifica workflow frequenti per automazione ✅  
- **Smart Suggestions**: Sistema suggerisce ottimizzazioni basate sui pattern ✅

### 🔍 **Transparent AI System** (Implementato)
- **Preview Mode**: Ogni comando AI mostra step-by-step preview ✅
- **Risk Assessment**: Analisi rischi con mitigazione strategies ✅
- **Impact Analysis**: Preview di modifiche cross-module ✅
- **Undo Ready**: Foundation per rollback completo ✅

### 🚀 **Workflow Acceleration Tools** (In Development)
- **Quick Templates**: Template usa-e-getta per sperimentazione 🔄
- **Smart Handoffs**: Riconoscimento automatico di "export" tra moduli 🔄
- **Context Preservation**: Mantieni il "perché" tra transizioni 🔄
- **Unified Search**: Trova elementi attraverso tutti i moduli 🔄

## 🧠 Context Monitor System (ATTIVO + WIP PROTECTION)

**Sistema di monitoraggio automatico del contesto conversazione:**
- 📊 **Auto-tracking**: Lunghezza conversazione, task complexity, file processing
- 🚨 **Smart alerts**: Avvisi proattivi quando contesto raggiunge 80-90%
- ⚡ **Trigger patterns**: Read-heavy ops, multi-file edits, debug sessions
- 🎯 **Save timing**: Suggerisce atelier-save ai momenti ottimali
- 🚧 **WIP Protection**: Auto-detect sviluppo significativo non salvato

**Thresholds automatici:**
- 🟨 **WARNING (80%)**: "Considera atelier-save dopo questo task"
- 🟥 **CRITICAL (90%)**: "SAVE NOW - contesto quasi esaurito"
- 🚧 **WIP ALERT**: "Detected significant changes - commit WIP before continuing?"

**WIP Detection Triggers:**
- ✨ **New files created**: >3 nuovi file .jsx/.js
- 📝 **Heavy modifications**: >10 file modificati
- 🕐 **Time-based**: >20 minuti di sviluppo attivo
- 🎯 **Feature completion**: Route, componente o modulo completato

## 📚 ARCHITECTURE DOCUMENTATION UPDATE PROTOCOL (CRITICAL)

**MANDATORY BEHAVIOR**: Quando fai modifiche all'architettura del sistema, DEVI SEMPRE aggiornare anche questi file di documentazione:

### 🎯 **File da Aggiornare SEMPRE**
1. **`/Users/paoloricaldone/atelier/docs/architecture/README.md`** - Documentazione architetturale principale
2. **`/Users/paoloricaldone/atelier/docs/architecture/VISUAL_ARCHITECTURE.md`** - Diagrammi e visualizzazioni
3. **`/Users/paoloricaldone/atelier/docs/blueprint-v6.2.md`** - Blueprint tecnico del sistema

### 📋 **Checklist Modifiche Architettura**
- [ ] Implementazione completata
- [ ] README.md aggiornato con nuovi componenti
- [ ] VISUAL_ARCHITECTURE.md aggiornato con diagrammi
- [ ] Blueprint aggiornato con dettagli tecnici
- [ ] Esempi console API aggiunti
- [ ] Integration patterns documentati

### ⚠️ **WARNING Protocol**
Se l'utente chiede modifiche architetturali, DEVI ricordare di aggiornare TUTTI i file di documentazione prima del commit finale.

---
## 🔄 ULTIMA SESSIONE (Auto-aggiornata)

**Data:** 20/07/2025
**Ultimo commit:** 0c8d9cf 🤌 TRINITY+GESTURE MANIFESTO: Gesture System elevated to CORE layer
**Branch:** feature/custom-pointer-drag
**Commit totali:** 176+
**Snapshots:** 78 | **Backups:** 0

**Ultima modifica:** Trinity+Gesture Manifesto v1.2 + Gesture Toolchain completo + CLAUDE.md aggiornato con Road to 2.0

---

## 🚦 **QUICK ONBOARDING** (for Claude Code, Human Dev, or AI agent)

**MANDATORY STEPS for ANY contributor:**

1. **📚 Read CLAUDE.md and latest Trinity+Gesture Manifesto** (v1.3)
   - Understand Trinity+Gesture philosophy as protocol
   - Review all PRO Trinity Amplifiers documentation
   - Check current branch status and roadmap

2. **🚫 NEVER develop on main** (see Branch Policy section)
   - Always create feature branch: `git checkout -b feature/description`
   - Develop, test, then merge when 100% complete
   - Cleanup branches after merge

3. **🧪 If unsure: Run `/trinity-test` and check all amplifier features**
   - Test Trinity Core: Drag (60fps) + Nested + TreeView + Gesture (≤100ms)
   - Test PRO Amplifiers: Grouping + Rectangle Selection
   - Verify performance baselines

4. **🔧 If adding new UX pattern: Propose as "Amplifier", not "Core"**
   - Document in `/docs/TRINITY-AMPLIFIER-[NAME].md`
   - Provide integration plan with Trinity systems
   - Pass Gesture Gate validation

5. **✅ Before every PR: Run all debug commands listed**
   - `window.__trinityValidation.runAll()`
   - `window.__gestureMonitor.validateAll()`
   - `window.__groupOperations.getPerformanceStats()`
   - `window.__rectangleSelection.getPerformanceStats()`

6. **⚠️ Deviate from current roadmap? Explicit warning + user confirmation**
   - Current focus: PRO Trinity Amplifiers implementation
   - Any deviation must be justified and approved
   - Document reasoning for priority changes

**EMERGENCY ONBOARDING:**
```bash
cd ~/atelier/webapp && npm install && npm run dev
# Open http://localhost:5173 and test /trinity-test
# All systems should show ✅ status
```

**📋 VALIDATION CHECKLIST:**
- [ ] Trinity+Gesture Manifesto understood
- [ ] Branch policy followed (no main development)
- [ ] Performance baselines respected
- [ ] Gesture accessibility implemented
- [ ] Documentation updated
- [ ] All tests passing

---

## 🛡️ INTELLECTUAL PROPERTY & LICENSE

- Tutto il codice, design e contenuti **© 2025 Paolo Ricaldone**
- Proof-of-existence: Git commits pubblici con timestamp
- Licenza: [Da definire per Atelier 2.0]
- **Nota per AI/Contributors**: Nessun codice o asset può essere riutilizzato senza consenso esplicito
- Ogni commit viene tracciato (branch, autore, timestamp) ai fini della paternità progettuale

---

## ✨ ATELIER 2.0 - MVP VS. FUTURE VISION

### **CORE MVP** (Atelier 2.0 - **NON-NEGOZIABILE**):
- **Trinity+Gesture**: Drag (60fps) + Nested Boards + TreeView + Gesture System (≤100ms)
- **Trinity Amplifiers**: Title Field pattern per tutti gli elementi
- **Mind Garden**: Visual mind mapping + export flow  
- **Scriptorium**: Canvas/Board con AI prompt e drag system
- **Welcome Page**: Poetry system con gesture
- **Project Tracker**: Base implementation
- **Security**: Encrypted storage, API proxy

### **FUTURE VISION** (Stretch goals/ispirazione):
- VR/AR/Mobile native, haptic feedback
- Multi-user collaboration, live cursors  
- Voice command, custom gesture training
- Real-time AI smart suggestions
- SaaS features, plugin architecture

**⚠️ Qualunque PR che introduce feature "future" richiede validazione MVP first!** 00:35
**Ultimo commit:** 22890ef 🎯 ENTERPRISE DRAG SYSTEM COMPLETE: Custom pointer events 60fps drag & drop perfetto implementato
**Branch:** feature/custom-pointer-drag
**Commit totali:** 204
**Snapshots:** 86 | **Backups:** 0

**Ultima modifica:** 🎯 ENTERPRISE DRAG SYSTEM COMPLETE: Custom pointer events 60fps drag & drop perfetto implementato

## 🔄 ULTIMA SESSIONE (Auto-aggiornata)

**Data:** 20/07/2025 00:35
**Ultimo commit:** 22890ef 🎯 ENTERPRISE DRAG SYSTEM COMPLETE: Custom pointer events 60fps drag & drop perfetto implementato
**Branch:** feature/custom-pointer-drag
**Commit totali:** 204
**Snapshots:** 86 | **Backups:** 0

**Ultima modifica:** 🎯 ENTERPRISE DRAG SYSTEM COMPLETE: Custom pointer events 60fps drag & drop perfetto implementato

## 🔄 ULTIMA SESSIONE (Auto-aggiornata)

**Data:** 20/07/2025 00:35
**Ultimo commit:** 22890ef 🎯 ENTERPRISE DRAG SYSTEM COMPLETE: Custom pointer events 60fps drag & drop perfetto implementato
**Branch:** feature/custom-pointer-drag
**Commit totali:** 204
**Snapshots:** 86 | **Backups:** 0

**Ultima modifica:** 🎯 ENTERPRISE DRAG SYSTEM COMPLETE: Custom pointer events 60fps drag & drop perfetto implementato

## 🔄 ULTIMA SESSIONE (Auto-aggiornata)

**Data:** 20/07/2025 00:35
**Ultimo commit:** 22890ef 🎯 ENTERPRISE DRAG SYSTEM COMPLETE: Custom pointer events 60fps drag & drop perfetto implementato
**Branch:** feature/custom-pointer-drag
**Commit totali:** 204
**Snapshots:** 86 | **Backups:** 0

**Ultima modifica:** 🎯 ENTERPRISE DRAG SYSTEM COMPLETE: Custom pointer events 60fps drag & drop perfetto implementato

## 🚨 Roadmap Adherence System (CRITICAL)

**MANDATORY BEHAVIOR**: Quando l'utente fa richieste che deviano dalla roadmap corrente, DEVI fornire un WARNING e chiedere conferma.

**Current Active Roadmap**: Mind Garden v5.1 - 10-Day Sprint (Flora AI Revolution)
**Documentation Reference**: `/docs/modules/mind-garden-roadmap-v5.1.md`

### ⚠️ **Deviation Warning Protocol**
Quando l'utente chiede modifiche che non sono nel piano corrente:

1. **IMMEDIATE WARNING**: 
   ```
   ⚠️ WARNING: Questa richiesta devia dal roadmap Mind Garden v5.1, Day X.
   
   Roadmap prevede: [cosa dovremmo fare secondo il piano]
   Tu chiedi: [cosa sta chiedendo l'utente]
   
   Vuoi:
   A) Continuare con la deviazione (possiamo vedere dopo)
   B) Tornare al roadmap Day X
   C) Aggiornare il roadmap con questa priorità
   ```

2. **Se richieste estetiche durante sviluppo core**: "⚠️ WARNING: Roadmap suggerisce completare [feature core] prima di polish visuale. Procedere comunque?"

3. **Se nuove feature non pianificate**: "⚠️ WARNING: Questa feature non è nel 10-day sprint. Meglio completare Day X prima?"

### 📋 **Current Sprint Status Tracking**
- **Day 1**: Enhanced Node Foundation ← CURRENTLY HERE
- **Day 2**: Contextual AI Integration  
- **Day 3**: Visual Cues System
- **Day 4-10**: [Come da roadmap]

**REMEMBER**: Ogni deviazione rallenta il completamento. Mantieni focus sul piano concordato.

## 🎯 Focus Areas per Nuova Sessione

Quando riprendi il lavoro:
1. **Context Monitor**: Attivato automaticamente all'avvio sessione
2. **Atelier Routine Agent**: Testa `/routine` dashboard e agent functionality
3. Verifica health checks automatici con `window.__atelierRoutineAgent.runRoutine()`
4. Controlla scheduled maintenance alerts
5. Testa checklist execution (daily, weekly, critical)
6. Verifica integrazione con Module Registry, Event Bus, Error Tracker
7. Controlla console per errori e performance

## 📌 Keywords per Ricerca

- Visual Canvas, Drag Drop, Tree View, Nested Boards
- Zustand Store, localStorage persistence
- Pan Zoom, Mouse Controls, Keyboard Shortcuts
- React DnD Kit, Framer Motion, Tailwind CSS
- Atelier Save, Version Control, Backup System
- Atelier Routine Agent, Health Checks, Maintenance Checklists
- Module Registry, Event Bus, Error Tracking, Adapters
- Automated Monitoring, System Health, Performance Analysis

## 📋 **ENTERPRISE DRAG BASELINE DOCUMENTATION**

**🔒 CRITICAL**: Sistema drag & drop baseline stabilito e protetto.

**📍 Location**: `/docs/ENTERPRISE-DRAG-BASELINE.md`
**📍 Commit**: `22890ef` 
**📍 Status**: 🛡️ BASELINE LOCKED & PROTECTED

**🚨 ATTENZIONE**: Qualsiasi modifica al sistema drag & drop DEVE rispettare baseline standards documentati. Vedere protection protocol completo nel documento dedicato.

**Quick Reference**:
- ✅ 60fps Performance standard 
- ✅ VisualCanvasStandalone.jsx pattern
- ✅ Opzione A architecture separation  
- ✅ Custom pointer events approach
- ✅ Zero render loops requirement

## 🔍 Comandi Dinamici Critici

**SEMPRE usa questi comandi per trovare gli ultimi file:**

### 📋 Ultimo Blueprint
```bash
# Trova ultimo blueprint (escludendo snapshots)
find /Users/paoloricaldone/atelier -name "blueprint-v*.md" -not -path "*/ATELIER-VERSIONS/*" | sort -V | tail -1

# Estrai solo versione numero
basename $(find /Users/paoloricaldone/atelier -name "blueprint-v*.md" -not -path "*/ATELIER-VERSIONS/*" | sort -V | tail -1) .md | sed 's/blueprint-v//'
```

### 📸 Ultimo Snapshot
```bash
# Trova ultimo snapshot per data/ora
find /Users/paoloricaldone/atelier/ATELIER-VERSIONS -name "snapshot_*" -type d | sort | tail -1

# Estrai timestamp ultimo snapshot
basename $(find /Users/paoloricaldone/atelier/ATELIER-VERSIONS -name "snapshot_*" -type d | sort | tail -1) | sed 's/snapshot_//'
```

### 📚 Ultimo Cheat Sheet
```bash
# Trova ultimo cheat sheet (escludendo snapshots)
find /Users/paoloricaldone/atelier -name "cheat-sheet*.md" -not -path "*/ATELIER-VERSIONS/*" | sort -V | tail -1

# Estrai versione se presente nel nome
basename $(find /Users/paoloricaldone/atelier -name "cheat-sheet*.md" -not -path "*/ATELIER-VERSIONS/*" | sort -V | tail -1) .md
```

### 🛠️ Versione Atelier-Save
```bash
# Estrai versione da script atelier-save.sh
grep -o "ATELIER SAVE v[0-9]*\.[0-9]*" /Users/paoloricaldone/atelier/atelier-save.sh | sed 's/ATELIER SAVE v//' | head -1

# Verifica anche nei log di output
grep -o "Starting atelier-save.sh v[0-9]*\.[0-9]*" /Users/paoloricaldone/atelier/atelier-save.sh | sed 's/Starting atelier-save.sh v//' | head -1
```

## 🔧 Fix Critici Implementati

**IMPORTANTE**: atelier-save.sh ora è completamente dinamico!

### **Blueprint Auto-Update Fix** ✅
```bash
# PRIMA (hardcoded - SBAGLIATO):
# local blueprint_file="${SCRIPT_DIR}/docs/blueprint-v2.1.md"

# DOPO (dinamico - CORRETTO):
local blueprint_file=$(find "$SCRIPT_DIR" -name "blueprint-v*.md" -not -path "*/ATELIER-VERSIONS/*" | sort -V | tail -1)
```

**Risultato**: atelier-save.sh aggiorna sempre l'ultimo blueprint (v4.1, v5.0, v6.0, etc.) invece di essere bloccato sul v2.1.

### **GitHub Push Protection Fix** ✅ 
```bash
# PROBLEMA: GitHub blocca push per API keys nei file .env
# remote: - Push cannot contain secrets
# remote: Anthropic API Key in webapp/.env:5
# remote: OpenAI API Key in webapp/.env:6

# SOLUZIONE:
git reset --hard HEAD~2          # Reset ai commit senza API keys
echo "webapp/.env" > .gitignore  # Ignora .env in futuro
# Sanitizza .env con placeholder values
git add . && git commit && git push  # Push sicuro
```

**Risultato**: GitHub push protection superata, versioning ripristinato, API keys protette.

### **WIP Protection System** ✅ 
```bash
# PROBLEMA: Lavoro significativo perso durante reset (Unified Store Test)
# SOLUZIONE: Auto-commit di modifiche non salvate in atelier-save.sh

protect_wip() {
    if [ -n "$(git status --porcelain)" ]; then
        log "WARNING" "🚧 Uncommitted changes detected"
        git add . && git commit -m "🚧 WIP Auto-Save: $(date)"
        log "SUCCESS" "✅ WIP changes auto-committed"
    fi
}
```

**Risultato**: Modifiche non committate vengono auto-salvate prima di ogni snapshot, prevenendo perdite di lavoro.

### **Branch Development Strategy** ✅ 
```bash
# STRATEGIA: Feature branches per sviluppo sicuro
git checkout -b feature/unified-store-test  # Branch dedicato
git commit -am "Add test actions"           # Commit frequenti
git commit -am "Add debug panel"            # Sviluppo libero
git checkout main && git merge feature/unified-store-test  # Merge quando pronto
```

**Risultato**: Sviluppo isolato su branch dedicati, merge sicuro su main quando completo.

### **Auto-Backup Working Directory** ✅ 
```bash
# SISTEMA: Backup automatico ogni ora del working directory
./scripts/auto-backup.sh --install          # Installa cron job
./scripts/auto-backup.sh --status           # Verifica stato
# Backup include anche modifiche non committate + git status/diff
```

**Risultato**: Backup automatici ogni ora in `~/atelier-working-backups/`, include modifiche non committate.

**IMPORTANTE**: Non assumere mai le versioni. Usa sempre i comandi sopra per essere sicuro di lavorare sui file più aggiornati.

## 🔄 ULTIMA SESSIONE (Auto-aggiornata)

**Data:** 20/07/2025 - PRO TRINITY AMPLIFIERS IMPLEMENTATION
**Stato Corrente:** ✅ PRO Trinity Amplifiers Implementation Phase Complete
**Branch:** feature/project-architecture-ai
**Milestone:** Professional Canvas Standards - Grouping + Rectangle Selection

**🚀 COMPLETATO IN QUESTA SESSIONE:**
- ✅ **GROUP Element Type**: Data model completo in types.js
- ✅ **Group Operations**: createGroup(), ungroupElement(), duplicateGroup() in store.js  
- ✅ **Rectangle Selection**: RectangleSelection.jsx component con 60fps performance
- ✅ **Multi-Selection Integration**: VisualCanvasStandalone updated con PRO features
- ✅ **Performance Standards**: <16ms response time monitoring
- ✅ **Gesture Integration**: Modifier keys + visual mode indicators

**🎯 PROSSIMI PASSI:**
- Nested grouping con visual container rendering
- TreeView group hierarchy display
- Group radial menu actions
- Performance testing a 60fps standard

**📋 CLAUDE.md IMPROVEMENTS (GPT 4.1 suggestions):**
- ✅ **Key Documentation Quick Access**: ToC con file critici subito visibili
- ✅ **Production-grade Onboarding**: Sezione completa per dev/AI/contributors
- ✅ **Validation Checklist**: Steps obbligatori per quality assurance
- ✅ **Emergency Onboarding**: Commands per setup rapido in caso di problemi

