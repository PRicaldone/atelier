# 🤖 CLAUDE.md - Contesto per l'AI Assistant

> Questo file contiene informazioni specifiche per Claude AI per comprendere rapidamente il progetto Atelier quando si riprende il lavoro.

## 🎯 Quick Start Command

Copia e incolla questo comando quando inizi una nuova chat:

```
Ciao Claude! Sto lavorando su Atelier, il mio command center creativo per progetti NFT/VFX.
Il progetto è in ~/atelier/ con webapp React in ~/atelier/webapp/.
Leggi ~/atelier/CLAUDE.md per il contesto completo e lo stato attuale del progetto.
Poi leggi ~/atelier/docs/blueprint.md e ~/atelier/docs/cheat-sheet.md per i dettagli.
L'ultimo salvataggio è del 09/07/2025 con Visual Canvas completato.

IMPORTANTE: Attiva il Context Monitor automatico - monitora la conversazione e avvisami proattivamente quando è il momento di fare atelier-save prima che il contesto si esaurisca.
```

## 📊 Stato Progetto (Ultimo aggiornamento: 09/07/2025)

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

2. **Business Switcher** (funzionale)
   - Switch tra business multipli
   - Stato persistente

3. **Project Tracker** (base implementata)
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

## 🧠 Context Monitor System (ATTIVO)

**Sistema di monitoraggio automatico del contesto conversazione:**
- 📊 **Auto-tracking**: Lunghezza conversazione, task complexity, file processing
- 🚨 **Smart alerts**: Avvisi proattivi quando contesto raggiunge 80-90%
- ⚡ **Trigger patterns**: Read-heavy ops, multi-file edits, debug sessions
- 🎯 **Save timing**: Suggerisce atelier-save ai momenti ottimali

**Thresholds automatici:**
- 🟨 **WARNING (80%)**: "Considera atelier-save dopo questo task"
- 🟥 **CRITICAL (90%)**: "SAVE NOW - contesto quasi esaurito"

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

**IMPORTANTE**: Non assumere mai le versioni. Usa sempre i comandi sopra per essere sicuro di lavorare sui file più aggiornati.

## 🔄 ULTIMA SESSIONE (Auto-aggiornata)

**Data:** 12/07/2025 01:45
**Ultimo commit:** a235ae0 🔧 Updated atelier-save script to v2.1 - version alignment
**Branch:** main
**Commit totali:** 57
**Snapshots:** 46 | **Backups:** 0

**Ultima modifica:** 🔧 Updated atelier-save script to v2.1 - version alignment

