# 🎨 ATELIER RESUME COMMAND - COPIA E INCOLLA IN NUOVA CHAT

```
Ciao Claude! Sto lavorando su Atelier, il mio command center creativo per progetti NFT/VFX.

CONTESTO PROGETTO:
- Path: ~/atelier/
- Webapp React: ~/atelier/webapp/
- Docs: ~/atelier/docs/ (blueprint.md, cheat-sheet.md)
- Sistema versioning: ATELIER-VERSIONS/, ATELIER-BACKUPS/, GitHub
- Script principale: atelier-save.sh

STATO ATTUALE (09/07/2025):
1. Visual Canvas COMPLETATO con:
   - Drag & drop elementi (note, image, link, AI, board)
   - Pan: Alt+drag o middle mouse
   - Zoom: Right-click+drag (NEW!)
   - Tree View gerarchico con nested boards (FIXED!)
   - Path Breadcrumb navigabile (FIXED!)
   - Properties Panel per customizzazione
   - Snap-to-grid, multi-select, keyboard shortcuts

2. ULTIME IMPLEMENTAZIONI:
   - Fix persistenza nested boards con saveCurrentLevelToParent()
   - Tree View mostra gerarchia completa in tempo reale
   - Path Breadcrumb aggiorna con navigazione nested
   - Zoom fluido con right-click+drag (range 0.1x-5x)
   - Auto-save su ogni modifica elemento

3. ARCHITETTURA:
   - Frontend: React + Vite + Tailwind CSS + Framer Motion
   - Canvas: @dnd-kit per drag & drop
   - State: Zustand con persistenza localStorage
   - Struttura moduli: business-switcher, project-start, project-tracker, visual-canvas

4. FILE CHIAVE:
   - ~/atelier/webapp/src/modules/visual-canvas/VisualCanvas.jsx
   - ~/atelier/webapp/src/modules/visual-canvas/store.js
   - ~/atelier/webapp/src/modules/visual-canvas/components/TreeViewSidebar.jsx
   - ~/atelier/webapp/src/modules/visual-canvas/components/PathBreadcrumb.jsx

PROSSIMI STEP PIANIFICATI:
- [ ] Integrazione AI per generazione contenuti
- [ ] Export canvas (PNG, PDF, JSON)
- [ ] Collaborative features
- [ ] Template system
- [ ] Plugin architecture

Per continuare, leggi:
- ~/atelier/docs/blueprint.md (visione completa)
- ~/atelier/docs/cheat-sheet.md (comandi e workflow)
- ~/atelier/CHANGELOG.md (storico modifiche)

Il progetto è su localhost:5174 (npm run dev nella webapp).
```

# 📋 INFORMAZIONI AGGIUNTIVE PER CLAUDE

## Stato Tecnico Dettagliato

### Visual Canvas Features Implementate:
1. **Mouse Controls**:
   - Left drag: Move elements / Select area
   - Alt+drag: Pan canvas
   - Middle mouse: Pan canvas
   - Right+drag: Zoom canvas
   - Ctrl/Cmd+click: Multi-select

2. **Navigazione Gerarchica**:
   - Tree View con struttura completa sempre visibile
   - Board annidate con indicatori visivi
   - Path Breadcrumb in basso stile Finder macOS
   - Auto-save della gerarchia su ogni modifica

3. **Layout Webapp**:
   ```
   ┌─────────────── NAVBAR (64px) ─────────────────┐
   │                                               │
   ├─[LEFT 240px]─┬─── CANVAS AREA ───┬─[RIGHT 320px]─┐
   │              │   - Toolbar       │   - TreeView   │
   │  - Sidebar   │   - Canvas        │   - Structure  │
   │  - Modules   │   - Elements      │                │
   │              │   - Properties    │                │
   ├──────────────┴───────────────────┴───────────────┤
   │            PATH BREADCRUMB (40px)                │
   └──────────────────────────────────────────────────┘
   ```

4. **Problemi Risolti Recentemente**:
   - ✅ Pan non funzionava → Implementato con Alt+drag
   - ✅ Tree View non aggiornava → Fix con persistenza gerarchica
   - ✅ Path Breadcrumb non navigava → Fix con logica sincronizzata
   - ✅ Drag ghosting → Semplificato DragOverlay
   - ✅ Toolbar non centrata → Fix positioning dinamico
   - ✅ Properties Panel sovrapposto → Riposizionato

5. **Store Functions Chiave**:
   - `saveCurrentLevelToParent()`: Salva elementi nel parent
   - `findBoardInHierarchy()`: Cerca board in tutta la gerarchia
   - `getHierarchicalStructure()`: Ricostruisce tree completo
   - `enterBoard()` / `exitBoard()`: Navigazione con persistenza

## Comandi Utili:
```bash
# Avvia webapp
cd ~/atelier/webapp && npm run dev

# Salva progetto
cd ~/atelier && ./atelier-save.sh

# Build production
cd ~/atelier/webapp && npm run build

# Vedi logs
tail -f ~/atelier/logs/atelier-save_*.log
```

## Note Importanti:
- Il canvas usa viewport transform per pan/zoom
- La persistenza è in localStorage con chiave ATELIER_CANVAS_ELEMENTS
- Ogni board può contenere altri elementi incluse altre board
- Il Tree View mostra SEMPRE la gerarchia completa
- Path Breadcrumb è cliccabile per navigazione rapida

Quando riprendi, verifica lo stato con:
1. `git status` per vedere modifiche pending
2. `npm run dev` per testare webapp
3. Leggi ultimi commit con `git log --oneline -10`