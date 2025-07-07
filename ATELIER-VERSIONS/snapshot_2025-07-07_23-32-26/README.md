# Atelier
**Creative Command Center per Paolo Ricaldone**

Un command center personalizzato per gestire l'intero flusso creativo di Paolo Ricaldone - artista NFT e VFX specialist. Sistema integrato per gestione progetti, operazioni business, strumenti creativi e intelligenza artificiale.

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/paoloricaldone/atelier.git
cd atelier/webapp/webapp

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your keys

# Run development
npm run dev

# Build production
npm run build
```

## 🏗️ Stack Tecnologico

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Supabase (database + auth)
- **AI Integration**: OpenAI API
- **Deployment**: Vercel / Netlify
- **Version Control**: Git + GitHub + Google Drive

## 📦 Moduli Principali

### Visual Canvas
Grid dinamica progetti con anteprima, upload drag & drop, filtri per stato/categoria

### Project Start
Template creation wizard, metadata automatici, setup automatico struttura progetto

### Project Tracker
Timeline visuale progetti, progress bars, note e task management

### Business Switcher
Toggle NFT/Traditional mode, UI adattiva per contesto business

### AI Layer
Chat assistente contestuale, generazione prompt creativi, analisi trend

## 🔄 Sistema Versioning Multi-Layer

Atelier implementa un sistema di backup su 4 livelli:

1. **Locale** (ATELIER-VERSIONS): Snapshot giornalieri
2. **Compressi** (ATELIER-BACKUPS): Backup tar.gz ottimizzati
3. **GitHub** (atelier-backups repo): Sync automatico
4. **Google Drive** (STUDIO-ARCHIVE): Archive cloud

### Script Automazione
- **`atelier-save.sh`**: 🌟 **NUOVO!** Comando unico per tutto il versioning
- `atelier-backup.sh`: Backup incrementali con compressione  
- `backup-manager.sh`: Menu interattivo gestione backup

#### 🚀 Atelier-Save: One Command, Full Automation
```bash
# Salvataggio completo automatico
./atelier-save.sh

# Con messaggio commit personalizzato
./atelier-save.sh "Implementato nuovo modulo AI"
```

**Funzioni automatiche:**
- ✅ Snapshot locale istantaneo
- ✅ Commit e push Git intelligente
- ✅ Backup settimanale (se venerdì)
- ✅ Sync repository backup
- ✅ Report dettagliato operazioni
- ✅ Gestione errori e rollback
- ✅ Log completi con timestamp

## 📚 Documentazione

### Documentazione Completa
- **[Blueprint v2.1](docs/blueprint-v2.1.md)**: Visione completa del progetto, architettura, roadmap
- **[Cheat Sheet Versioning](docs/cheat-sheet-versioning.md)**: Guida rapida comandi backup/recovery

### Directory Documentazione
```
docs/
├── blueprint-v2.1.md           # Blueprint completo progetto
├── cheat-sheet-versioning.md   # Guida comandi backup
├── progress-notes/             # Note sviluppo
└── tech-specs/                 # Specifiche tecniche
```

## 🚦 Stato Sviluppo

### Fase 1 - Foundation ✅
- Setup iniziale progetto
- Implementazione moduli base
- Sistema versioning multi-layer
- Script automazione backup

### Fase 2 - Enhancement (Current)
- Ottimizzazione UI/UX
- Integrazione AI avanzata
- Testing e documentazione
- Performance optimization

### Prossimi Step
- API esterne (OpenSea, Foundation)
- Google Drive sync automatico
- Mobile responsive completo
- Multi-user support

## 🎨 Features Principali

- **Responsive Design**: Ottimizzato per desktop e mobile
- **Dark Mode**: Interfaccia scura per sessioni prolungate
- **Real-time Updates**: Sync automatico dati
- **AI-Powered**: Assistente intelligente integrato
- **Multi-Business**: Supporto NFT e Traditional art
- **Backup Robusto**: Sistema versioning multi-layer

## 🔧 Sviluppo

### Environment Setup
```bash
# Variabili ambiente richieste
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_OPENAI_API_KEY=your_openai_key
```

### Workflow Git
```bash
main → develop → feature/xxx
     ↘ hotfix/xxx
```

### Testing
```bash
npm run test      # Unit tests
npm run test:e2e  # End-to-end tests
npm run lint      # Code linting
```

## 📈 Performance

- Load time < 2s
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Lighthouse score > 90

## 🔐 Security

- Environment variables per secrets
- Row Level Security su Supabase
- HTTPS only communication
- Regular dependency updates

## 📞 Support

- **Developer**: Paolo Ricaldone
- **Email**: paolo@ricaldone.studio
- **GitHub**: [github.com/paoloricaldone](https://github.com/paoloricaldone)
- **Issues**: [github.com/paoloricaldone/atelier/issues](https://github.com/paoloricaldone/atelier/issues)

---

*Ultimo aggiornamento: Gennaio 2025*
