# Atelier Blueprint v2.1
**Command Center Creativo per Paolo Ricaldone**

## 🎯 Visione del Progetto

Atelier è un command center personalizzato per gestire l'intero flusso creativo di Paolo Ricaldone - artista NFT e VFX specialist. Il sistema integra gestione progetti, operazioni business, strumenti creativi e intelligenza artificiale in un'unica piattaforma fluida e responsive.

## 🏗️ Architettura del Sistema

### Stack Tecnologico
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Supabase (database + auth)
- **AI Integration**: OpenAI API
- **Deployment**: Vercel / Netlify
- **Version Control**: Git + GitHub
- **Asset Management**: Google Drive API

### Moduli Principali

#### 1. Visual Canvas ✅ COMPLETATO
- Grid dinamica progetti con anteprima
- Upload drag & drop multi-tipo (note, image, link, AI, board)
- Pan/Zoom avanzato con controlli mouse
- **Nested Boards con persistenza unificata** 🆕
- Tree View gerarchico navigabile
- Path Breadcrumb stile Finder
- Properties Panel dinamico
- Snap-to-grid, multi-select, shortcuts
- **Sistema persistenza gerarchica robusta** 🆕

#### 2. Project Start
- Template creation wizard
- Metadata automatici
- Integrazione con Business Switcher
- Setup automatico struttura progetto

#### 3. Project Tracker
- Timeline visuale progetti
- Progress bars e milestones
- Note e task management
- Export dati per reporting

#### 4. Business Switcher
- Toggle NFT/Traditional mode
- UI adattiva per contesto
- Preset configurazioni business
- Analytics per modalità

#### 5. AI Layer
- Chat assistente contestuale
- Generazione prompt creativi
- Analisi trend mercato
- Suggerimenti ottimizzazione workflow

## 📦 Sistema Versioning Multi-Layer

### 1. Versioning Locale (ATELIER-VERSIONS)
```
ATELIER-VERSIONS/
├── daily/         # Snapshot giornalieri
├── releases/      # Release stabili
└── hotfixes/      # Fix critici
```

### 2. Backup Compressi (ATELIER-BACKUPS)
```
ATELIER-BACKUPS/
├── 2024-01-15_atelier_v1.0.0.tar.gz
├── 2024-01-16_atelier_daily.tar.gz
└── latest -> [symlink all'ultimo backup]
```

### 3. GitHub Repository (atelier-backups)
- Sync automatico con branch dedicati
- Tags per release principali
- GitHub Actions per CI/CD

### 4. Google Drive (STUDIO-ARCHIVE)
```
STUDIO-ARCHIVE/
├── ATELIER-PROJECT/
│   ├── backups/
│   ├── assets/
│   └── docs/
```

## 🚀 Roadmap Sviluppo

### Fase 1 - Foundation ✅ COMPLETATA
- Setup iniziale progetto
- Implementazione moduli base
- Sistema versioning multi-layer
- Script automazione (atelier-save.sh)
- **Visual Canvas completo con nested boards**
- **Sistema persistenza unificato** 🆕

### Fase 2 - Enhancement (Current)
- **Bug fix critici persistenza** ✅ COMPLETATO
- Ottimizzazione UI/UX
- Integrazione AI avanzata
- Testing e debugging avanzato
- Documentazione tecnica completa

### Fase 3 - Integration
- API esterne (OpenSea, Foundation)
- Google Drive sync automatico
- Webhook notifications
- Mobile responsive completo

### Fase 4 - Scale
- Multi-user support
- Plugin system
- API pubblica
- Analytics dashboard

## 🔧 Infrastruttura Tecnica

### Database Schema (Supabase)
```sql
-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('nft', 'traditional')),
  status TEXT,
  created_at TIMESTAMP,
  metadata JSONB
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  title TEXT,
  completed BOOLEAN DEFAULT false,
  due_date DATE
);

-- Assets
CREATE TABLE assets (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  url TEXT,
  type TEXT,
  metadata JSONB
);
```

### Environment Variables
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_OPENAI_API_KEY=
VITE_GOOGLE_DRIVE_CLIENT_ID=
```

### Script di Automazione

#### atelier-backup.sh
- Crea snapshot incrementali
- Compressione ottimizzata
- Cleanup automatico vecchi backup
- Log dettagliati operazioni

#### backup-manager.sh
- Menu interattivo gestione backup
- Restore point-in-time
- Sync con repository remoti
- Verifica integrità backup

## 📊 Metriche e Monitoring

### Performance Target
- Load time < 2s
- FCP < 1.5s
- TTI < 3s
- Lighthouse score > 90

### Monitoring Setup
- Sentry per error tracking
- Analytics custom events
- Performance monitoring
- User behavior tracking

## 🔐 Security & Privacy

### Best Practices
- Environment variables per secrets
- Row Level Security su Supabase
- HTTPS only
- Regular dependency updates
- API rate limiting

### Backup Security
- Encryption at rest
- Access control GitHub/Drive
- Regular backup verification
- Disaster recovery plan

## 🎨 Design System

### Palette Colori
- Primary: Blue (#3B82F6)
- Secondary: Purple (#8B5CF6)
- Success: Green (#10B981)
- Error: Red (#EF4444)
- Background: Dark (#111827)

### Typography
- Headers: Inter
- Body: System UI
- Monospace: Fira Code

### Component Library
- Atomic design principles
- Reusable components
- Consistent spacing system
- Accessibility first

## 📝 Note Sviluppo

### Convenzioni Codice
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Component testing (Vitest)

### Workflow Git
```bash
main → develop → feature/xxx
     ↘ hotfix/xxx
```

### Review Process
1. Feature branch da develop
2. PR con description dettagliata
3. Code review + test
4. Merge to develop
5. Release to main con tag

## 🚦 Quick Start

```bash
# Clone repository
git clone https://github.com/paoloricaldone/atelier

# Install dependencies
cd atelier/webapp
npm install

# Setup environment
cp .env.example .env
# Edit .env with your keys

# Run development
npm run dev

# Build production
npm run build
```

## 📞 Contatti e Support

- **Developer**: Paolo Ricaldone
- **Email**: paolo@ricaldone.studio
- **GitHub**: github.com/paoloricaldone
- **Issues**: github.com/paoloricaldone/atelier/issues

## 🆕 Changelog v2.1.1

### July 2025 - Latest Updates
- **f302698 📋 Blueprint v4.1.1 - Hybrid Intelligence Architecture with Claude Code SDK future roadmap**: 📋 Blueprint v4.1.1 - Hybrid Intelligence Architecture with Claude Code SDK future roadmap

### July 2025 - Latest Updates
- **a235ae0 🔧 Updated atelier-save script to v2.1 - version alignment**: 🔧 Updated atelier-save script to v2.1 - version alignment

### July 2025 - Latest Updates
- **6baa593 v2.1 - Visual Canvas fully functional - localhost:5173/canvas working**: v2.1 - Visual Canvas fully functional - localhost:5173/canvas working

### July 2025 - Latest Updates
- **aa76a6e 🎯 Fix Tree→Canvas drag&drop - addCompleteElement method + board-to-board enabled**: 🎯 Fix Tree→Canvas drag&drop - addCompleteElement method + board-to-board enabled

### July 2025 - Latest Updates
- **31b0248 ✨ Board highlight durante drag&drop - visual feedback come tree view**: ✨ Board highlight durante drag&drop - visual feedback come tree view

### July 2025 - Latest Updates
- **420b7d9 🎯 DRAG&DROP PERFETTO! Canvas→Tree e Canvas→Canvas ENTRAMBI FUNZIONANTI - Sistema completo!**: 🎯 DRAG&DROP PERFETTO! Canvas→Tree e Canvas→Canvas ENTRAMBI FUNZIONANTI - Sistema completo!

### July 2025 - Latest Updates
- **0dc5331 ✅ DRAG&DROP Canvas→Tree PERFETTO! Drop Canvas→Canvas ancora duplica - fix parziale ma significativo**: ✅ DRAG&DROP Canvas→Tree PERFETTO! Drop Canvas→Canvas ancora duplica - fix parziale ma significativo

### July 2025 - Latest Updates
- **b2b3dee 📦 Auto-save:        1 modifications - 2025-07-11 02:37**: 📦 Auto-save:        1 modifications - 2025-07-11 02:37

### July 2025 - Latest Updates
- **60b7c6e 🔧 ANALYSIS: Drag&drop Canvas→Board issues documented - multiple sync problems identified**: 🔧 ANALYSIS: Drag&drop Canvas→Board issues documented - multiple sync problems identified

### July 2025 - Latest Updates
- **25442f5 🔧 Fixed drag&drop persistenza - aggiunto force refresh tree view con event system e lastUpdate timestamp**: 🔧 Fixed drag&drop persistenza - aggiunto force refresh tree view con event system e lastUpdate timestamp

### July 2025 - Latest Updates
- **3d1844c 🚀 Implementato drag&drop Canvas↔Tree con drop zones visuali - fixing bug persistenza elementi in board**: 🚀 Implementato drag&drop Canvas↔Tree con drop zones visuali - fixing bug persistenza elementi in board

### July 2025 - Latest Updates
- **6f8f8cc 🎨 Migliorata leggibilità Canvas Network in dark mode e rimosso BreadcrumbNavigation duplicato**: 🎨 Migliorata leggibilità Canvas Network in dark mode e rimosso BreadcrumbNavigation duplicato

### July 2025 - Latest Updates
- **a7f9458 🌙 Raffinato dark mode - Canvas Network panel dark, colori board ridotti, mappatura colori light/dark completa**: 🌙 Raffinato dark mode - Canvas Network panel dark, colori board ridotti, mappatura colori light/dark completa

### July 2025 - Latest Updates
- **7c99cc1 🌙 Implementato dark mode completo - toggle navbar, hook useTheme, styling tutti componenti**: 🌙 Implementato dark mode completo - toggle navbar, hook useTheme, styling tutti componenti

### July 2025 - Latest Updates
- **18481a1 🎨 Implementato Properties Panel dedicato per board - rimosso dimensioni/posizione/rotazione, aggiunto title/description/color picker Milanote**: 🎨 Implementato Properties Panel dedicato per board - rimosso dimensioni/posizione/rotazione, aggiunto title/description/color picker Milanote

### July 2025 - Latest Updates
- **c11c053 📝 Fix definitivo word wrap description board - testo rimane dentro i confini, auto-resize funzionante, font ridotto**: 📝 Fix definitivo word wrap description board - testo rimane dentro i confini, auto-resize funzionante, font ridotto

### July 2025 - Latest Updates
- **fe9cd16 📝 Implementata feature description multiline per board - editing inline con Enter per newline, layout verticale stile Milanote**: 📝 Implementata feature description multiline per board - editing inline con Enter per newline, layout verticale stile Milanote

### July 2025 - Latest Updates
- **3fb1115 🥖 Fix definitivo breadcrumb sync - eliminata history accumulation, navigazione unificata con navigateToBoard**: 🥖 Fix definitivo breadcrumb sync - eliminata history accumulation, navigazione unificata con navigateToBoard

### July 2025 - Latest Updates
- **1c9b2be 🐛 Debug breadcrumb sync avanzato - aggiunto logging dettagliato per identificare problema persistente**: 🐛 Debug breadcrumb sync avanzato - aggiunto logging dettagliato per identificare problema persistente

### July 2025 - Latest Updates
- **210b013 🧭 Fix breadcrumb sync: implementato navigateToBoard() per path corretto da tree navigation**: 🧭 Fix breadcrumb sync: implementato navigateToBoard() per path corretto da tree navigation

### July 2025 - Latest Updates
- **32b0ab8 🧠 Implementato Context Monitor automatico - sistema intelligente avvisi salvataggio**: 🧠 Implementato Context Monitor automatico - sistema intelligente avvisi salvataggio

### July 2025 - Latest Updates
- **ffaad25 🤖 Implementato sistema intelligente auto-update documentazione in atelier-save.sh**: 🤖 Implementato sistema intelligente auto-update documentazione in atelier-save.sh

### Luglio 2025 - Fix Critici Persistenza
- **Sistema persistenza unificato**: Risolto problema perdita dati nested boards
- **Navigazione robusta**: Eliminati conflitti race condition
- **Auto-save ottimizzato**: Ridotto timeout e migliorata responsiveness
- **Logging avanzato**: Debug emoji-based per troubleshooting rapido
- **Verifica automatica**: Controllo integrità dati post-save

### Architettura Tecnica Aggiornata
```javascript
// Nuovo sistema unificato
saveCurrentLevelToHierarchy() // Mantiene sempre gerarchia completa
loadFromStorage() // Context-aware loading per nested boards
enterBoard() / exitBoard() // Navigazione sincronizzata
```

---

*Ultimo aggiornamento: July 2025*
*Versione Blueprint: 2.1.1 - Critical Persistence Fixes*
