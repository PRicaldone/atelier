#!/bin/bash

# 🎯 ATELIER BACKUP MANAGER
# Gestisce snapshot, backup compressi e pulizia automatica

DATE=$(date +%Y%m%d_%H%M)
WEEK=$(date +%Y%W)

echo "🎯 ATELIER BACKUP MANAGER"
echo "========================"

# 📊 Mostra stato attuale
echo "📊 STATO ATTUALE:"
echo "Snapshot disponibili: $(ls -1 ATELIER-VERSIONS/ 2>/dev/null | wc -l)"
echo "Backup compressi: $(ls -1 ATELIER-BACKUPS/*.tar.gz 2>/dev/null | wc -l)"
echo "Spazio VERSIONS: $(du -sh ATELIER-VERSIONS/ 2>/dev/null | cut -f1)"
echo "Spazio BACKUPS: $(du -sh ATELIER-BACKUPS/ 2>/dev/null | cut -f1)"
echo ""

# 🎯 Menu opzioni
echo "🎯 OPZIONI DISPONIBILI:"
echo "1) 📸 Nuovo snapshot"
echo "2) 📦 Backup settimanale compresso"
echo "3) 🗂️ Milestone backup (con nome)"
echo "4) 🧹 Pulizia snapshot vecchi"
echo "5) ☁️ Prepara per Google Drive"
echo "6) 📋 Lista tutti i backup"
echo ""

read -p "Scegli opzione (1-6): " choice

case $choice in
    1)
        echo "📸 Creando nuovo snapshot..."
        rsync -av --exclude='*/node_modules' --exclude='.DS_Store' --exclude='*.log' webapp/ ATELIER-VERSIONS/v1.x-$DATE/
        echo "✅ Snapshot v1.x-$DATE creato!"
        ;;
    
    2)
        echo "📦 Creando backup settimanale compresso..."
        tar -czf ATELIER-BACKUPS/atelier-week-$WEEK-$DATE.tar.gz ATELIER-VERSIONS/
        echo "✅ Backup settimanale creato: atelier-week-$WEEK-$DATE.tar.gz"
        echo "📊 Dimensione: $(du -sh ATELIER-BACKUPS/atelier-week-$WEEK-$DATE.tar.gz | cut -f1)"
        ;;
    
    3)
        read -p "📝 Nome del milestone (es: canvas-complete): " milestone_name
        echo "🗂️ Creando milestone backup..."
        tar -czf ATELIER-BACKUPS/milestone-$milestone_name-$DATE.tar.gz webapp/
        echo "✅ Milestone '$milestone_name' creato!"
        ;;
    
    4)
        echo "🧹 Pulizia snapshot vecchi (conservo ultimi 5)..."
        cd ATELIER-VERSIONS/
        ls -t | tail -n +6 | head -n -5 | xargs -r rm -rf
        cd ..
        echo "✅ Pulizia completata!"
        ;;
    
    5)
        echo "☁️ Preparando file per Google Drive..."
        CLOUD_FILE="ATELIER-BACKUPS/atelier-cloud-backup-$DATE.tar.gz"
        tar -czf $CLOUD_FILE ATELIER-VERSIONS/ atelier-backup.sh
        echo "✅ File pronto: $CLOUD_FILE"
        echo "📋 Copia questo file su Google Drive manualmente"
        echo "💡 Dimensione: $(du -sh $CLOUD_FILE | cut -f1)"
        ;;
    
    6)
        echo "📋 LISTA COMPLETA BACKUP:"
        echo ""
        echo "📸 SNAPSHOT (ATELIER-VERSIONS):"
        ls -la ATELIER-VERSIONS/ 2>/dev/null || echo "Nessuno snapshot"
        echo ""
        echo "📦 BACKUP COMPRESSI (ATELIER-BACKUPS):"
        ls -la ATELIER-BACKUPS/*.tar.gz 2>/dev/null || echo "Nessun backup compresso"
        ;;
    
    *)
        echo "❌ Opzione non valida"
        ;;
esac

echo ""
echo "🎯 Backup Manager completato!"
