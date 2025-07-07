#!/bin/bash
DATE=$(date +%Y%m%d_%H%M)
echo "🔄 Backup Atelier v1.1-$DATE..."
rsync -av --exclude='*/node_modules' --exclude='.DS_Store' --exclude='*.log' atelier/ ATELIER-VERSIONS/v1.1-$DATE/
echo "✅ Backup v1.1-$DATE completato!"
echo "📊 Dimensione: $(du -sh ATELIER-VERSIONS/v1.1-$DATE/)"

