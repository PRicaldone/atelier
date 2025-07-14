#!/bin/bash

# =============================================================================
# 🕐 ATELIER AUTO-BACKUP SYSTEM
# Hourly backup of working directory (including uncommitted changes)
# =============================================================================

set -euo pipefail

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
readonly BACKUP_BASE_DIR="$HOME/atelier-working-backups"
readonly MAX_BACKUPS=24  # Keep 24 hours of backups

# Colors
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        "INFO")  echo -e "${BLUE}ℹ️  [$timestamp] $message${NC}" ;;
        "SUCCESS") echo -e "${GREEN}✅ [$timestamp] $message${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  [$timestamp] $message${NC}" ;;
        "ERROR") echo -e "${RED}❌ [$timestamp] $message${NC}" ;;
    esac
}

create_hourly_backup() {
    local hour=$(date '+%H')
    local backup_dir="$BACKUP_BASE_DIR/working-backup-hour-$hour"
    
    log "INFO" "Creating hourly backup for hour $hour"
    
    # Create backup directory
    mkdir -p "$backup_dir"
    
    # Rsync with progress and exclude unnecessary files
    rsync -av \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='dist' \
        --exclude='build' \
        --exclude='.DS_Store' \
        --exclude='*.log' \
        --exclude='ATELIER-VERSIONS' \
        --exclude='ATELIER-BACKUPS' \
        --exclude='atelier-working-backups' \
        "$PROJECT_ROOT/" "$backup_dir/" > /dev/null 2>&1
    
    # Save git status and diff for uncommitted changes
    if cd "$PROJECT_ROOT" && git rev-parse --git-dir > /dev/null 2>&1; then
        git status --porcelain > "$backup_dir/git-status.txt" 2>/dev/null || true
        git diff > "$backup_dir/git-diff.txt" 2>/dev/null || true
        git diff --cached > "$backup_dir/git-diff-staged.txt" 2>/dev/null || true
        echo "$(git rev-parse HEAD)" > "$backup_dir/git-commit.txt" 2>/dev/null || true
    fi
    
    # Create metadata
    cat > "$backup_dir/backup-info.json" << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "hour": "$hour",
    "type": "hourly_working_backup",
    "source": "$PROJECT_ROOT",
    "git_branch": "$(cd "$PROJECT_ROOT" && git branch --show-current 2>/dev/null || echo 'unknown')",
    "backup_size": "$(du -sh "$backup_dir" | cut -f1)"
}
EOF
    
    log "SUCCESS" "Backup created: $backup_dir"
}

cleanup_old_backups() {
    log "INFO" "Cleaning up old backups (keeping last $MAX_BACKUPS hours)"
    
    if [ -d "$BACKUP_BASE_DIR" ]; then
        # Remove backups older than MAX_BACKUPS hours
        find "$BACKUP_BASE_DIR" -name "working-backup-hour-*" -type d -mtime +1 -exec rm -rf {} \; 2>/dev/null || true
        
        local remaining=$(find "$BACKUP_BASE_DIR" -name "working-backup-hour-*" -type d | wc -l | tr -d ' ')
        log "INFO" "Kept $remaining hourly backups"
    fi
}

install_cron_job() {
    log "INFO" "Installing hourly cron job for auto-backup"
    
    # Create cron job that runs every hour
    local cron_command="0 * * * * $SCRIPT_DIR/auto-backup.sh >> $HOME/.atelier-backup.log 2>&1"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "auto-backup.sh"; then
        log "WARNING" "Cron job already exists"
    else
        # Add to crontab
        (crontab -l 2>/dev/null; echo "$cron_command") | crontab -
        log "SUCCESS" "Hourly backup cron job installed"
        log "INFO" "Logs will be written to $HOME/.atelier-backup.log"
    fi
}

show_status() {
    log "INFO" "Auto-Backup System Status"
    echo
    
    if [ -d "$BACKUP_BASE_DIR" ]; then
        local backup_count=$(find "$BACKUP_BASE_DIR" -name "working-backup-hour-*" -type d | wc -l | tr -d ' ')
        local total_size=$(du -sh "$BACKUP_BASE_DIR" 2>/dev/null | cut -f1 || echo "unknown")
        
        echo "📁 Backup Directory: $BACKUP_BASE_DIR"
        echo "🔢 Available Backups: $backup_count"
        echo "💾 Total Size: $total_size"
        echo
        
        if [ "$backup_count" -gt 0 ]; then
            echo "📋 Recent Backups:"
            find "$BACKUP_BASE_DIR" -name "working-backup-hour-*" -type d | sort | tail -5 | while read -r backup; do
                local hour=$(basename "$backup" | sed 's/working-backup-hour-//')
                local timestamp=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$backup" 2>/dev/null || echo "unknown")
                echo "   Hour $hour: $timestamp"
            done
        fi
    else
        echo "❌ No backups found"
    fi
    
    echo
    if crontab -l 2>/dev/null | grep -q "auto-backup.sh"; then
        echo "✅ Cron job is installed (runs hourly)"
    else
        echo "⚠️  Cron job not installed (run with --install to set up)"
    fi
}

main() {
    case "${1:-run}" in
        "run")
            create_hourly_backup
            cleanup_old_backups
            ;;
        "--install")
            install_cron_job
            ;;
        "--status")
            show_status
            ;;
        "--help")
            echo "Usage: $0 [run|--install|--status|--help]"
            echo "  run       Create backup and cleanup (default)"
            echo "  --install Install hourly cron job"
            echo "  --status  Show backup system status"
            echo "  --help    Show this help"
            ;;
        *)
            log "ERROR" "Unknown option: $1"
            exit 1
            ;;
    esac
}

main "$@"