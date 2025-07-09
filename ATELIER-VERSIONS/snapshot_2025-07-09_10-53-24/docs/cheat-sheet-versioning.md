# Atelier Versioning Cheat Sheet v2.0
**Guida Completa Sistema Backup Multi-Layer con Comando Unificato**

## 🚀 COMANDO UNIFICATO (METODO PRINCIPALE)

### Atelier-Save: One Command, Full Automation ⭐

```bash
# Salvataggio completo automatico (raccomandato)
./atelier-save.sh

# Con messaggio commit personalizzato
./atelier-save.sh "🎨 Implementato nuovo modulo canvas"

# Esempi pratici
./atelier-save.sh "✨ Nuova feature: AI integration"
./atelier-save.sh "🐛 Fix: Risolto bug sidebar"
./atelier-save.sh "📚 Docs: Aggiornata documentazione"
```

### ✅ Cosa fa automaticamente:
1. **Snapshot locale** istantaneo con timestamp
2. **Commit intelligente** con messaggio auto-generato o custom
3. **Push GitHub** su repository principale
4. **Backup settimanale** compresso (solo venerdì)
5. **Sync repository** atelier-backups
6. **Report dettagliato** con statistiche complete
7. **Log strutturati** con timestamp per debugging
8. **Cleanup automatico** file temporanei

### 📊 Output del comando:
- **Console colorato** con progress real-time
- **Report finale** con summary operazioni
- **Log file** dettagliato in `logs/atelier-save_YYYY-MM-DD.log`
- **Report file** in `logs/atelier-save_report_TIMESTAMP.txt`

## ⚡ COMANDI VELOCI

### Workflow Quotidiano Semplificato
```bash
# Mattina - Check status
git status

# Lavora sul progetto...

# Fine sessione - Salva tutto
./atelier-save.sh "💼 Fine sessione: $(date +%Y-%m-%d)"

# Pre-weekend - Con backup
./atelier-save.sh "📦 Backup pre-weekend"
```

### Salvataggio per Milestone
```bash
# Release version
./atelier-save.sh "🚀 Release v1.0.0"

# Feature completa
./atelier-save.sh "✅ Completed: User authentication system"

# Prima di major changes
./atelier-save.sh "💾 Backup before refactoring"
```

## 🤔 QUANDO USARE COSA?

### 🚀 Usa `atelier-save.sh` quando:
- ✅ Vuoi salvare tutto rapidamente (90% dei casi)
- ✅ Non hai bisogno di controllo granulare
- ✅ Vuoi automazione completa
- ✅ Lavori in modalità "flow" creativo
- ✅ Vuoi report automatici

### 🔧 Usa comandi manuali quando:
- ⚙️ Hai bisogno di controllo specifico su cosa backuppare
- ⚙️ Vuoi testare singole operazioni
- ⚙️ Debugging di problemi specifici
- ⚙️ Operazioni di recovery complesse
- ⚙️ Backup custom con parametri specifici

## 📦 BACKUP AVANZATO (Controllo Granulare)

### Snapshot Manuali Specifici
```bash
# Backup solo codice sorgente
tar -czf ATELIER-BACKUPS/source_only_$(date +%Y-%m-%d).tar.gz \
  webapp/src/ \
  webapp/public/ \
  webapp/*.json \
  webapp/*.js \
  webapp/*.md

# Backup configurazioni
tar -czf ATELIER-BACKUPS/config_$(date +%Y-%m-%d).tar.gz \
  webapp/.env* \
  webapp/*config* \
  webapp/package*.json
```

### Backup Manager Menu Interattivo
```bash
# Avvia menu completo
./backup-manager.sh

# Opzioni disponibili:
# 1) Create backup
# 2) List backups  
# 3) Restore backup
# 4) Clean old backups
# 5) Sync to GitHub
# 6) Sync to Google Drive
# 7) Verify backup
# 8) Exit
```

### Script Backup Tradizionale
```bash
# Backup incrementale manuale
./atelier-backup.sh

# Backup con tag specifico
./atelier-backup.sh "milestone-v2.0"
```

## 📋 MONITORING & LOGS

### Visualizzare Logs Atelier-Save
```bash
# Log del giorno corrente
tail -f logs/atelier-save_$(date +%Y-%m-%d).log

# Ultimi report generati
ls -lt logs/atelier-save_report_*.txt | head -5

# Visualizza ultimo report
cat logs/atelier-save_report_*.txt | head -1 | xargs cat
```

### Monitoraggio Snapshot
```bash
# Lista tutti gli snapshot
ls -la ATELIER-VERSIONS/

# Info snapshot specifico
cat ATELIER-VERSIONS/snapshot_*/SNAPSHOT_INFO.txt

# Dimensioni snapshot
du -sh ATELIER-VERSIONS/snapshot_*

# Cleanup snapshot vecchi (>30 giorni)
find ATELIER-VERSIONS/ -name "snapshot_*" -mtime +30 -exec rm -rf {} \;
```

### Statistics e Report
```bash
# Conteggio operazioni giornaliere
grep "completed successfully" logs/atelier-save_$(date +%Y-%m-%d).log | wc -l

# Dimensione totale backup
du -sh ATELIER-VERSIONS/ ATELIER-BACKUPS/

# Ultimo commit info
git log -1 --oneline
```

## ☁️ GOOGLE DRIVE MILESTONE (Manuale)

### Upload Milestone Importante
```bash
# Crea backup milestone
./atelier-save.sh "🏆 Milestone: Project completion"

# Upload manuale a Google Drive (raccomandato per milestone)
rclone copy ATELIER-BACKUPS/latest_weekly.tar.gz \
  gdrive:STUDIO-ARCHIVE/ATELIER-PROJECT/milestones/

# Backup completo progetto
rclone sync ATELIER-VERSIONS/ \
  gdrive:STUDIO-ARCHIVE/ATELIER-PROJECT/snapshots/ \
  --include "snapshot_$(date +%Y-%m-%d)*"
```

### Sync Automatico Schedulato (Opzionale)
```bash
# Aggiungi a crontab per sync settimanale
# 0 23 * * 5 cd /Users/paoloricaldone/atelier && ./atelier-save.sh "📅 Weekly automated backup"
```

## 🔄 RECOVERY PROCEDURES

### Quick Recovery da Snapshot
```bash
# Lista snapshot disponibili
ls ATELIER-VERSIONS/ | grep snapshot

# Recovery da snapshot specifico
SNAPSHOT="snapshot_2025-01-15_14-30-45"
cp -R ATELIER-VERSIONS/$SNAPSHOT/* ./

# Recovery selettivo (solo webapp)
cp -R ATELIER-VERSIONS/$SNAPSHOT/webapp/* ./webapp/
```

### Recovery da GitHub
```bash
# Clone fresh dal repository
git clone https://github.com/PRicaldone/atelier.git atelier-recovery
cd atelier-recovery/webapp
npm install
```

### Recovery da Google Drive
```bash
# Download ultimo backup
rclone copy gdrive:STUDIO-ARCHIVE/ATELIER-PROJECT/latest.tar.gz ./
tar -xzf latest.tar.gz
```

## 🚦 WORKFLOW AGGIORNATO

### Routine Quotidiana (SEMPLIFICATA)
```bash
# ☀️ Inizio giornata
git status  # Check stato

# 💼 Durante lavoro
# ... sviluppo normale ...

# 🌅 Fine sessione
./atelier-save.sh "💼 End of day: $(date +%A)"
```

### Routine Settimanale
```bash
# 📅 Venerdì (backup automatico)
./atelier-save.sh "📦 Weekend backup"  # Crea backup.tar.gz automaticamente

# 🔍 Check logs
tail logs/atelier-save_$(date +%Y-%m-%d).log

# 🧹 Cleanup occasionale (mensile)
find ATELIER-VERSIONS/ -name "snapshot_*" -mtime +30 -exec rm -rf {} \;
```

### Pre-Release Workflow
```bash
# 1. Backup pre-release
./atelier-save.sh "🏁 Pre-release backup v1.0.0"

# 2. Final testing
cd webapp && npm run build && npm run lint

# 3. Release commit
./atelier-save.sh "🚀 Release v1.0.0 - Production ready"

# 4. Manual milestone backup
rclone copy ATELIER-BACKUPS/latest_weekly.tar.gz \
  gdrive:STUDIO-ARCHIVE/ATELIER-PROJECT/releases/v1.0.0.tar.gz
```

## 🚨 TROUBLESHOOTING

### Errori Comuni Atelier-Save
```bash
# Permessi negati
chmod +x atelier-save.sh

# Git non configurato
git config --global user.name "Paolo Ricaldone"
git config --global user.email "paolo@ricaldone.studio"

# Remote non raggiungibile
git remote -v  # Verifica URL
```

### Debug Mode
```bash
# Esegui con verbose logging
bash -x ./atelier-save.sh "🔍 Debug test"

# Check prerequisiti manualmente
git status
git remote get-url origin
ls -la ATELIER-VERSIONS/ ATELIER-BACKUPS/
```

### Recovery di Emergenza
```bash
# 1. GitHub come source of truth
git clone https://github.com/PRicaldone/atelier.git emergency-recovery

# 2. Google Drive backup
rclone copy gdrive:STUDIO-ARCHIVE/ATELIER-PROJECT/latest.tar.gz ./emergency/

# 3. Local snapshot recente
cp -R ATELIER-VERSIONS/snapshot_* ./emergency-recovery/
```

## 📈 BEST PRACTICES AGGIORNATE

### Frequenza Salvataggi
- **Quotidiano**: `./atelier-save.sh` a fine sessione
- **Pre-changes**: Prima di modifiche importanti
- **Milestone**: Con messaggi descrittivi specifici
- **Emergency**: Backup immediato prima di esperimenti

### Messaggi Commit Efficaci
```bash
# ✅ Buoni esempi
./atelier-save.sh "🎨 Nuovo design sistema colori"
./atelier-save.sh "🔧 Refactor: Ottimizzata performance canvas"
./atelier-save.sh "📱 Mobile: Responsive design completato"
./atelier-save.sh "🐛 Fix: Risolto crash su iOS Safari"

# ❌ Evitare
./atelier-save.sh "update"
./atelier-save.sh "fix"
./atelier-save.sh "work"
```

### Monitoraggio Salute Sistema
```bash
# Check settimanale dimensioni
du -sh ATELIER-VERSIONS/ ATELIER-BACKUPS/ logs/

# Verifica ultimo backup
ls -lt ATELIER-VERSIONS/ | head -3

# Test connettività remote
git ls-remote origin
```

## 🔗 Link Utili

- **GitHub Repo**: https://github.com/PRicaldone/atelier
- **GitHub Backups**: https://github.com/PRicaldone/atelier-backups  
- **Google Drive**: https://drive.google.com (STUDIO-ARCHIVE folder)
- **Documentazione**: [Blueprint v2.1](blueprint-v2.1.md)

---

## 📋 QUICK REFERENCE CARD

```bash
# COMANDO PRINCIPALE (usa questo 90% delle volte)
./atelier-save.sh                              # Auto-save completo
./atelier-save.sh "messaggio custom"           # Con messaggio specifico

# MONITORING
tail -f logs/atelier-save_$(date +%Y-%m-%d).log   # Log real-time
ls -la ATELIER-VERSIONS/                       # Lista snapshot
du -sh ATELIER-VERSIONS/ ATELIER-BACKUPS/      # Dimensioni

# RECOVERY VELOCE  
cp -R ATELIER-VERSIONS/snapshot_LATEST/* ./    # Restore da snapshot
git clone https://github.com/PRicaldone/atelier.git  # Fresh da GitHub

# CLEANUP
find ATELIER-VERSIONS/ -mtime +30 -exec rm -rf {} \;  # Rimuovi >30gg
```

*🎨 Atelier Versioning System v2.0 - One Command, Full Control*  
*Ultimo aggiornamento: Gennaio 2025*