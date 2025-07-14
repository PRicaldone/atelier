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

## 📊 Stato Progetto (Ultimo aggiornamento: 13/07/2025)

### ✅ Moduli Completati

1. **Visual Canvas** (100% completo)
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
   - Export to Canvas workflow (Mind Garden → Canvas notes)
   - Auto-centering nodes with optimal zoom
   - Canvas-coherent UI layout
   - AI Command Palette integration
   - Organic edges e phase-based coloring

3. **Business Switcher** (funzionale)
   - Switch tra business multipli
   - Stato persistente

4. **Project Tracker** (base implementata)
   - Lista progetti
   - Stati e progressi

### 🔧 Stack Tecnico

- **Frontend**: React 18 + Vite + Tailwind CSS
- **State Management**: Zustand con middleware
- **Drag & Drop**: @dnd-kit/sortable + @dnd-kit/core
- **Animazioni**: Framer Motion
- **Icone**: Lucide React
- **Backend Ready**: Supabase config (da attivare)

### 📁 Struttura File Critici

```
~/atelier/
├── webapp/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── visual-canvas/
│   │   │   │   ├── VisualCanvas.jsx (componente principale)
│   │   │   │   ├── store.js (stato e logica)
│   │   │   │   ├── types.js (tipi e costanti)
│   │   │   │   └── components/
│   │   │   │       ├── TreeViewSidebar.jsx (gerarchia)
│   │   │   │       ├── PathBreadcrumb.jsx (navigazione)
│   │   │   │       ├── PropertiesPanel.jsx (proprietà)
│   │   │   │       └── CanvasToolbar.jsx (tools)
│   │   │   └── [altri moduli...]
│   │   └── [config, hooks, utils...]
│   └── package.json
├── docs/
│   ├── blueprint.md (visione completa progetto)
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

### 🚀 Prossimi Step Suggeriti

1. **Integrazione AI**:
   - OpenAI API per generazione contenuti
   - Suggerimenti intelligenti
   - Auto-tagging immagini

2. **Export Sistema**:
   - Export PNG del canvas
   - Export PDF per presentazioni
   - Export/Import JSON per backup

3. **Collaboration**:
   - Real-time sync con Supabase
   - Cursori multipli
   - Commenti su elementi

4. **Template System**:
   - Template predefiniti per progetti
   - Elementi custom riutilizzabili
   - Theme system

### 💡 Note Tecniche Importanti

1. **Viewport Transform**:
   ```javascript
   transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
   ```

2. **Persistenza Gerarchica**:
   - Root elements in `localStorage.ATELIER_CANVAS_ELEMENTS`
   - Nested boards salvate dentro `element.data.elements`
   - Auto-save su ogni modifica

3. **Mouse Priority**:
   - Right-click → Zoom
   - Alt/Middle → Pan
   - Left → Select/Drag

4. **Layout Constraints**:
   - Left sidebar: 240px
   - Right sidebar: 320px
   - Top navbar: 64px
   - Bottom breadcrumb: 40px

### 🔍 Debug Commands

```javascript
// In browser console
localStorage.getItem('ATELIER_CANVAS_ELEMENTS')
useCanvasStore.getState() // vedi stato completo
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

**Branch Structure:**
```
main              → Stable, production-ready (Visual Canvas + Security)
feature/*         → Development branches (AI Intelligence, new features)
```

**Current Status:**
- **Active branch**: `main` ✅ 
- **Contains**: AI Intelligence Engine v4.1 + Unified Store Architecture + NavigationSync
- **GitHub URL**: `https://github.com/PRicaldone/atelier/tree/main`
- **Feature branch**: `feature/unified-store-test` MERGED ✅ e rimossa

**🎯 Ready for new development:**
- main branch stabile con tutti i milestone
- Pronto per nuovo feature branch per Mind Garden
- NavigationSync bidirezionale come fondazione solida

**Branch Commands:**
```bash
# Vedi tutte le branch
git branch -a

# Cambia branch locale
git checkout main
git checkout feature/unified-store-test

# Verifica remote
git ls-remote --heads origin

# Merge feature → main (quando pronto)
git checkout main
git merge feature/unified-store-test
```

**🎯 Workflow Development:**
1. Sviluppa su `feature/unified-store-test`
2. Push regolari con atelier-save.sh
3. Merge su `main` quando milestone completi

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

**Data:** 14/07/2025 15:56
**Ultimo commit:** 528ccbd 🧪 WIP: Manual UI Testing - Mind Garden v5.1 Functional + Text Readability Fix
**Branch:** main
**Commit totali:** 127
**Snapshots:** 62 | **Backups:** 0

**Ultima modifica:** 🧪 WIP: Manual UI Testing - Mind Garden v5.1 Functional + Text Readability Fix

