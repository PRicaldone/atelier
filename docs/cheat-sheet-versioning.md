# Atelier Versioning Cheat Sheet
**Guida Rapida Sistema Backup Multi-Layer**

## 🚀 Comandi Rapidi

### Snapshot Quotidiano
```bash
# Crea backup giornaliero
./atelier-backup.sh

# Backup con tag specifico
./atelier-backup.sh "fix-canvas-bug"
```

### Backup Manager Menu
```bash
# Avvia menu interattivo
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

## 📦 Operazioni Backup

### Creare Backup Manuale
```bash
# Backup completo con compressione
tar -czf ATELIER-BACKUPS/$(date +%Y-%m-%d)_atelier_manual.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  ./

# Backup solo codice sorgente
tar -czf ATELIER-BACKUPS/source_only.tar.gz \
  src/ \
  public/ \
  *.json \
  *.js \
  *.md
```

### Listare Backup Disponibili
```bash
# Lista tutti i backup
ls -lah ATELIER-BACKUPS/

# Lista con dimensioni human-readable
du -sh ATELIER-BACKUPS/*.tar.gz | sort -h

# Trova backup per data
ls ATELIER-BACKUPS/ | grep "2025-01"
```

## 🔄 GitHub Sync

### Push to Repository
```bash
# Sync manuale
cd ATELIER-BACKUPS
git add .
git commit -m "Backup $(date +%Y-%m-%d)"
git push origin main

# Sync con tag release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### Clone/Pull Backup
```bash
# Clone repository backup
git clone https://github.com/paoloricaldone/atelier-backups.git

# Update locale
cd atelier-backups
git pull origin main
```

## ☁️ Google Drive Operations

### Upload to Drive
```bash
# Usando rclone (configurato)
rclone copy ATELIER-BACKUPS/latest.tar.gz \
  gdrive:STUDIO-ARCHIVE/ATELIER-PROJECT/backups/

# Upload multipli file
rclone sync ATELIER-BACKUPS/ \
  gdrive:STUDIO-ARCHIVE/ATELIER-PROJECT/backups/ \
  --include "*.tar.gz"
```

### Download from Drive
```bash
# Download backup specifico
rclone copy \
  gdrive:STUDIO-ARCHIVE/ATELIER-PROJECT/backups/2025-01-15_atelier.tar.gz \
  ./recovery/

# Sync completo locale
rclone sync \
  gdrive:STUDIO-ARCHIVE/ATELIER-PROJECT/backups/ \
  ATELIER-BACKUPS/
```

## 🔧 Recovery Procedures

### Restore da Backup Locale
```bash
# 1. Backup stato corrente (safety)
mv atelier atelier_old_$(date +%Y%m%d)

# 2. Estrai backup
tar -xzf ATELIER-BACKUPS/2025-01-15_atelier_v1.0.0.tar.gz

# 3. Reinstalla dipendenze
cd atelier
npm install

# 4. Verifica ambiente
cp .env.example .env
# Edit .env con le tue keys
```

### Restore Point-in-Time
```bash
# Lista snapshot disponibili
ls ATELIER-VERSIONS/daily/

# Restore da snapshot
cp -R ATELIER-VERSIONS/daily/2025-01-15/* ./atelier/

# Restore solo src
cp -R ATELIER-VERSIONS/daily/2025-01-15/src/* ./atelier/src/
```

### Emergency Recovery
```bash
# Se tutto fallisce, usa l'ultimo backup GitHub
git clone https://github.com/paoloricaldone/atelier-backups.git recovery
cd recovery
tar -tf latest_backup.tar.gz  # verifica contenuti
tar -xzf latest_backup.tar.gz
```

## 🧹 Cleanup e Manutenzione

### Pulizia Backup Vecchi
```bash
# Rimuovi backup più vecchi di 30 giorni
find ATELIER-BACKUPS/ -name "*.tar.gz" -mtime +30 -delete

# Mantieni solo ultimi 10 backup
ls -t ATELIER-BACKUPS/*.tar.gz | tail -n +11 | xargs rm -f

# Pulizia snapshot giornalieri
find ATELIER-VERSIONS/daily/ -type d -mtime +7 -exec rm -rf {} \;
```

### Verifica Integrità
```bash
# Test estrazione backup
tar -tzf ATELIER-BACKUPS/backup.tar.gz > /dev/null
echo "Exit code: $?"  # 0 = OK

# Checksum verification
md5sum ATELIER-BACKUPS/*.tar.gz > checksums.md5
md5sum -c checksums.md5
```

## 🚨 Troubleshooting

### Errori Comuni

#### "Permission denied"
```bash
# Fix permessi script
chmod +x atelier-backup.sh backup-manager.sh

# Fix permessi cartelle
chmod -R 755 ATELIER-VERSIONS ATELIER-BACKUPS
```

#### "No space left"
```bash
# Controlla spazio
df -h

# Pulizia emergenza
rm -rf ATELIER-BACKUPS/temp_*
find . -name "*.log" -size +100M -delete
```

#### "Backup corrupted"
```bash
# Prova repair
gunzip -t backup.tar.gz

# Estrai partial
tar -xzf backup.tar.gz --ignore-zeros

# Usa backup precedente
ls -t ATELIER-BACKUPS/*.tar.gz | head -2
```

### Recovery da Disaster

1. **Locale Corrotto**
```bash
# Usa GitHub come source of truth
rm -rf atelier
git clone https://github.com/paoloricaldone/atelier.git
cd atelier
npm install
```

2. **GitHub Non Disponibile**
```bash
# Usa Google Drive backup
rclone copy gdrive:STUDIO-ARCHIVE/ATELIER-PROJECT/latest.tar.gz ./
tar -xzf latest.tar.gz
```

3. **Tutto Perso**
```bash
# Contatta team per backup offsite
# Check email per backup mensili
# Verifica Time Machine / system backup
```

## 📋 Best Practices

### Routine Quotidiana
```bash
# Mattina
./atelier-backup.sh "morning-$(date +%Y%m%d)"

# Fine giornata
./backup-manager.sh  # Option 5 (Sync GitHub)
```

### Prima di Major Changes
```bash
# 1. Full backup
./backup-manager.sh  # Option 1

# 2. Tag version
git tag -a "pre-refactor-$(date +%Y%m%d)" -m "Before major refactor"

# 3. Sync everywhere
./backup-manager.sh  # Options 5 & 6
```

### Release Process
```bash
# 1. Create release backup
./atelier-backup.sh "release-v1.0.0"

# 2. Tag in Git
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 3. Archive to Drive
rclone copy ATELIER-BACKUPS/*v1.0.0* gdrive:STUDIO-ARCHIVE/releases/
```

## 🔗 Link Utili

- **GitHub Repo**: https://github.com/paoloricaldone/atelier
- **GitHub Backups**: https://github.com/paoloricaldone/atelier-backups
- **Google Drive**: https://drive.google.com (STUDIO-ARCHIVE folder)
- **Documentazione**: /docs/blueprint-v2.1.md

---

*Quick Reference Card - Stampa e tieni vicino!*
*Ultimo aggiornamento: Gennaio 2025*