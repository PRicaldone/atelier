# 🤖 CLAUDE.md - Contesto per l'AI Assistant

> Questo file contiene informazioni specifiche per Claude AI per comprendere rapidamente il progetto Atelier quando si riprende il lavoro.

## 🎯 Quick Start Command

Copia e incolla questo comando quando inizi una nuova chat:

```
Ciao Claude! Sto lavorando su Atelier, il mio command center creativo per progetti NFT/VFX.
Il progetto è in ~/atelier/ con webapp React in ~/atelier/webapp/.
Leggi ~/atelier/CLAUDE.md per il contesto completo e lo stato attuale del progetto.
Poi leggi ~/atelier/docs/blueprint.md e ~/atelier/docs/cheat-sheet.md per i dettagli.
L'ultimo salvataggio è del 13/07/2025 con Mind Garden Visual Enhancements completato.

IMPORTANTE: Attiva il Context Monitor automatico - monitora la conversazione e avvisami proattivamente quando è il momento di fare atelier-save prima che il contesto si esaurisca.
```

## 📊 Stato Progetto (Ultimo aggiornamento: 16/07/2025)

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

### 🔧 Stack Tecnico

- **Frontend**: React 18 + Vite + Tailwind CSS
- **State Management**: Zustand con middleware
- **Drag & Drop**: @dnd-kit/sortable + @dnd-kit/core
- **Animazioni**: Framer Motion
- **Icone**: Lucide React
- **Backend Ready**: Supabase config (da attivare)
- **Professional Architecture**: Module Registry + Adapter Pattern + Event Bus
- **Monitoring**: Centralized Error Tracking + Real-time Dashboard

### 📁 Struttura File Critici

```
~/atelier/
├── webapp/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── creative-atelier/
│   │   │   │   ├── CreativeAtelier.jsx (componente principale)
│   │   │   │   ├── store.js (stato e logica)
│   │   │   │   ├── types.js (tipi e costanti)
│   │   │   │   └── components/
│   │   │   │       ├── TreeViewSidebar.jsx (gerarchia)
│   │   │   │       ├── PathBreadcrumb.jsx (navigazione)
│   │   │   │       ├── PropertiesPanel.jsx (proprietà)
│   │   │   │       └── CanvasToolbar.jsx (tools)
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
│   │   │       └── monitoring/
│   │   │           ├── ErrorTracker.js (error tracking centralizzato)
│   │   │           └── ModuleLogger.js (convenience wrappers)
│   │   ├── components/
│   │   │   ├── EventMonitoringDashboard.jsx (dashboard monitoraggio)
│   │   │   └── ErrorTrackingDemo.jsx (demo error tracking)
│   │   ├── utils/
│   │   │   └── monitoringTestUtils.js (test utilities)
│   │   └── [config, hooks, utils...]
│   └── package.json
├── docs/
│   ├── blueprint-v6.2.md (architettura professionale)
│   └── cheat-sheet.md (comandi e workflow)
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

### 🚀 Prossimi Step Suggeriti

1. **Visual Architecture Documentation**:
   - Diagrammi dell'architettura module system
   - Flow charts per event communication
   - Visual representation dell'adapter pattern

2. **Developer Experience**:
   - README per developer onboarding
   - API documentation per adapters
   - Best practices guide

3. **Integration Tests**:
   - Automated testing per cross-module communication
   - Health checks automatici
   - Performance monitoring

4. **Advanced Features**:
   - Load balancing per performance
   - Advanced analytics sui patterns
   - Automated alerts sistema

### 💡 Note Tecniche Importanti

1. **Module Registry Pattern**:
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

5. **Legacy System Compatibility**:
   - Viewport Transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
   - Persistenza: `localStorage.ATELIER_CANVAS_ELEMENTS`
   - Mouse Priority: Right-click → Zoom, Alt/Middle → Pan
   - Layout: Left sidebar: 240px, Right sidebar: 320px

### 🔍 Debug Commands

```javascript
// LEGACY SYSTEM
localStorage.getItem('ATELIER_CANVAS_ELEMENTS')
useCanvasStore.getState() // vedi stato completo

// PROFESSIONAL MODULE SYSTEM
window.__moduleRegistry.getInfo() // info moduli registrati
window.__eventBus.getStats() // statistiche eventi
window.__errorTracker.getStats() // statistiche errori
window.__monitoringTestUtils.generateTestEvents() // genera test events
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
- **Active branch**: `main` ✅ 
- **Contains**: Mind Garden v5.1 complete + SaaS roadmap documentation
- **GitHub URL**: `https://github.com/PRicaldone/atelier/tree/main`
- **Last feature**: Mind Garden context threading + export system

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
2. Verifica che tutti i fix funzionino con `npm run dev`
3. Testa navigazione nested boards
4. Verifica persistenza dopo refresh
5. Controlla console per errori

## 📌 Keywords per Ricerca

- Visual Canvas, Drag Drop, Tree View, Nested Boards
- Zustand Store, localStorage persistence
- Pan Zoom, Mouse Controls, Keyboard Shortcuts
- React DnD Kit, Framer Motion, Tailwind CSS
- Atelier Save, Version Control, Backup System

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

**Data:** 17/07/2025 00:05
**Ultimo commit:** 8853571 🏆 GOLDEN STATE: All systems tested and validated - 100% success before Scriptorium rename
**Branch:** feature/project-architecture-ai
**Commit totali:** 168
**Snapshots:** 76 | **Backups:** 0

**Ultima modifica:** 🏆 GOLDEN STATE: All systems tested and validated - 100% success before Scriptorium rename

