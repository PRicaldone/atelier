#!/bin/bash

# =============================================================================
# ATELIER-SAVE: Comprehensive Versioning and Backup Automation
# =============================================================================
# Automatizza tutto il workflow di versioning del progetto Atelier:
# - Snapshot locale in ATELIER-VERSIONS/
# - Commit e push repository principale
# - Backup compresso settimanale
# - Push backup su repository atelier-backups
# - Report dettagliato operazioni
#
# Usage:
#   ./atelier-save.sh ['custom commit message']
#
# Author: Paolo Ricaldone
# Date: $(date +%Y-%m-%d)
# =============================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# =============================================================================
# CONFIGURAZIONE E VARIABILI
# =============================================================================

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_NAME="atelier"
readonly TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
readonly DATE=$(date +%Y-%m-%d)
readonly DAY_OF_WEEK=$(date +%u)  # 1=Monday, 7=Sunday, 5=Friday
readonly LOG_FILE="${SCRIPT_DIR}/logs/atelier-save_${DATE}.log"

# Directories
readonly VERSIONS_DIR="${SCRIPT_DIR}/ATELIER-VERSIONS"
readonly BACKUPS_DIR="${SCRIPT_DIR}/ATELIER-BACKUPS"
readonly LOGS_DIR="${SCRIPT_DIR}/logs"

# Git repositories
readonly MAIN_REPO="${SCRIPT_DIR}"
readonly BACKUP_REPO_URL="git@github.com:PRicaldone/atelier-backups.git"
readonly BACKUP_REPO_DIR="${SCRIPT_DIR}/temp-backup-repo"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m' # No Color

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Create logs directory if it doesn't exist
    mkdir -p "$LOGS_DIR"
    
    # Log to file
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    # Log to console with colors
    case "$level" in
        "INFO")  echo -e "${BLUE}ℹ️  [$timestamp] $message${NC}" ;;
        "SUCCESS") echo -e "${GREEN}✅ [$timestamp] $message${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  [$timestamp] $message${NC}" ;;
        "ERROR") echo -e "${RED}❌ [$timestamp] $message${NC}" ;;
        "STEP") echo -e "${PURPLE}🔄 [$timestamp] $message${NC}" ;;
        *) echo -e "${WHITE}📝 [$timestamp] $message${NC}" ;;
    esac
}

print_header() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                      🎨 ATELIER SAVE v2.0                       ║"
    echo "║              Comprehensive Versioning & Backup Tool             ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_separator() {
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
}

cleanup_on_exit() {
    log "INFO" "Cleaning up temporary files..."
    if [[ -d "$BACKUP_REPO_DIR" ]]; then
        rm -rf "$BACKUP_REPO_DIR"
        log "INFO" "Removed temporary backup repository"
    fi
}

trap cleanup_on_exit EXIT

# =============================================================================
# VALIDATION FUNCTIONS
# =============================================================================

check_prerequisites() {
    log "STEP" "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [[ ! -f "$SCRIPT_DIR/package.json" ]] && [[ ! -d "$SCRIPT_DIR/webapp" ]]; then
        log "ERROR" "Script must be run from the atelier project root directory"
        exit 1
    fi
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        log "ERROR" "Git is not installed or not in PATH"
        exit 1
    fi
    
    # Check if we're in a git repository
    if ! git -C "$MAIN_REPO" rev-parse --git-dir &> /dev/null; then
        log "ERROR" "Not in a git repository"
        exit 1
    fi
    
    # Check if remote origin is configured
    if ! git -C "$MAIN_REPO" remote get-url origin &> /dev/null; then
        log "ERROR" "No origin remote configured"
        exit 1
    fi
    
    # Create necessary directories
    mkdir -p "$VERSIONS_DIR" "$BACKUPS_DIR" "$LOGS_DIR"
    
    log "SUCCESS" "Prerequisites check passed"
}

check_git_status() {
    log "STEP" "Checking git repository status..."
    
    cd "$MAIN_REPO"
    
    # Check if there are any uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        log "WARNING" "Repository has uncommitted changes. They will be included in the commit."
    fi
    
    # Check if we can connect to remote
    if ! git ls-remote origin &> /dev/null; then
        log "ERROR" "Cannot connect to remote repository. Check internet connection and credentials."
        exit 1
    fi
    
    log "SUCCESS" "Git status check passed"
}

# =============================================================================
# CORE FUNCTIONS
# =============================================================================

create_local_snapshot() {
    log "STEP" "Creating local snapshot in ATELIER-VERSIONS..."
    
    local snapshot_dir="${VERSIONS_DIR}/snapshot_${TIMESTAMP}"
    
    # Create snapshot directory
    mkdir -p "$snapshot_dir"
    
    # Copy project files (excluding node_modules, .git, dist, logs, temp files)
    rsync -av \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='dist' \
        --exclude='logs' \
        --exclude='temp-*' \
        --exclude='.DS_Store' \
        --exclude='*.log' \
        --exclude='ATELIER-VERSIONS' \
        --exclude='ATELIER-BACKUPS' \
        "$MAIN_REPO/" \
        "$snapshot_dir/" \
        >> "$LOG_FILE" 2>&1
    
    # Create snapshot manifest
    cat > "$snapshot_dir/SNAPSHOT_INFO.txt" << EOF
ATELIER SNAPSHOT INFORMATION
============================
Created: $(date)
Timestamp: $TIMESTAMP
Git Commit: $(git -C "$MAIN_REPO" rev-parse HEAD 2>/dev/null || echo "No git history")
Git Branch: $(git -C "$MAIN_REPO" branch --show-current 2>/dev/null || echo "No git branch")
Size: $(du -sh "$snapshot_dir" | cut -f1)

Files included:
$(find "$snapshot_dir" -type f | wc -l) files
$(du -sh "$snapshot_dir" | cut -f1) total size

Generated by: atelier-save.sh v2.0
EOF
    
    log "SUCCESS" "Local snapshot created: $snapshot_dir"
    return 0
}

generate_smart_commit_message() {
    local custom_message="$1"
    
    if [[ -n "$custom_message" ]]; then
        echo "$custom_message"
        return 0
    fi
    
    # Generate smart commit message based on changes
    cd "$MAIN_REPO"
    
    local files_changed=$(git diff --name-only HEAD 2>/dev/null | wc -l || echo "0")
    local files_added=$(git diff --name-only --diff-filter=A HEAD 2>/dev/null | wc -l || echo "0")
    local files_modified=$(git diff --name-only --diff-filter=M HEAD 2>/dev/null | wc -l || echo "0")
    local files_deleted=$(git diff --name-only --diff-filter=D HEAD 2>/dev/null | wc -l || echo "0")
    
    local message="📦 Auto-save: "
    
    if [[ $files_changed -eq 0 ]]; then
        message+="Clean state snapshot"
    else
        if [[ $files_added -gt 0 ]]; then
            message+="${files_added} new files, "
        fi
        if [[ $files_modified -gt 0 ]]; then
            message+="${files_modified} modifications, "
        fi
        if [[ $files_deleted -gt 0 ]]; then
            message+="${files_deleted} deletions, "
        fi
        message="${message%, }"  # Remove trailing comma
    fi
    
    message+=" - $(date '+%Y-%m-%d %H:%M')"
    
    echo "$message"
}

commit_and_push_main() {
    log "STEP" "Committing and pushing to main repository..."
    
    cd "$MAIN_REPO"
    
    local custom_message="$1"
    local commit_message
    
    commit_message=$(generate_smart_commit_message "$custom_message")
    
    # Add all changes
    git add . >> "$LOG_FILE" 2>&1
    
    # Create commit with generated message
    if git commit -m "$commit_message

🤖 Generated with atelier-save.sh

Co-Authored-By: Claude <noreply@anthropic.com>" >> "$LOG_FILE" 2>&1; then
        log "SUCCESS" "Committed with message: $commit_message"
    else
        log "WARNING" "No changes to commit or commit failed"
        return 1
    fi
    
    # Push to origin
    if git push origin "$(git branch --show-current)" >> "$LOG_FILE" 2>&1; then
        log "SUCCESS" "Pushed to remote repository"
    else
        log "ERROR" "Failed to push to remote repository"
        return 1
    fi
    
    return 0
}

create_weekly_backup() {
    log "STEP" "Checking if weekly backup is needed..."
    
    # Only create compressed backup on Fridays (day 5)
    if [[ $DAY_OF_WEEK -ne 5 ]]; then
        log "INFO" "Today is not Friday. Skipping weekly backup creation."
        return 0
    fi
    
    log "STEP" "Creating weekly compressed backup..."
    
    local backup_name="atelier_weekly_${DATE}.tar.gz"
    local backup_path="${BACKUPS_DIR}/${backup_name}"
    
    # Create compressed backup excluding unnecessary files
    tar -czf "$backup_path" \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='dist' \
        --exclude='logs' \
        --exclude='temp-*' \
        --exclude='.DS_Store' \
        --exclude='*.log' \
        --exclude='ATELIER-VERSIONS' \
        --exclude='ATELIER-BACKUPS' \
        -C "$SCRIPT_DIR" \
        . \
        >> "$LOG_FILE" 2>&1
    
    if [[ $? -eq 0 ]]; then
        local backup_size=$(du -sh "$backup_path" | cut -f1)
        log "SUCCESS" "Weekly backup created: $backup_name (${backup_size})"
        
        # Update latest symlink
        cd "$BACKUPS_DIR"
        rm -f latest_weekly.tar.gz
        ln -s "$backup_name" latest_weekly.tar.gz
        
        return 0
    else
        log "ERROR" "Failed to create weekly backup"
        return 1
    fi
}

push_to_backup_repository() {
    log "STEP" "Pushing backups to backup repository..."
    
    # Only push if we have backups
    if [[ ! -d "$BACKUPS_DIR" ]] || [[ -z "$(ls -A "$BACKUPS_DIR" 2>/dev/null)" ]]; then
        log "INFO" "No backups to push"
        return 0
    fi
    
    # Clone or update backup repository
    if [[ -d "$BACKUP_REPO_DIR" ]]; then
        rm -rf "$BACKUP_REPO_DIR"
    fi
    
    if git clone "$BACKUP_REPO_URL" "$BACKUP_REPO_DIR" >> "$LOG_FILE" 2>&1; then
        log "SUCCESS" "Cloned backup repository"
    else
        log "ERROR" "Failed to clone backup repository"
        return 1
    fi
    
    cd "$BACKUP_REPO_DIR"
    
    # Copy backups to repository
    cp -r "$BACKUPS_DIR"/* . >> "$LOG_FILE" 2>&1
    
    # Add and commit
    git add . >> "$LOG_FILE" 2>&1
    
    if git commit -m "📦 Backup update: $DATE

Automated backup push from atelier-save.sh
Timestamp: $TIMESTAMP

🤖 Generated with atelier-save.sh" >> "$LOG_FILE" 2>&1; then
        log "SUCCESS" "Committed backups to backup repository"
    else
        log "INFO" "No new backups to commit"
        return 0
    fi
    
    # Push to remote
    if git push origin main >> "$LOG_FILE" 2>&1; then
        log "SUCCESS" "Pushed backups to remote backup repository"
    else
        log "ERROR" "Failed to push backups to remote"
        return 1
    fi
    
    return 0
}

generate_report() {
    log "STEP" "Generating operation report..."
    
    local report_file="${LOGS_DIR}/atelier-save_report_${TIMESTAMP}.txt"
    
    cat > "$report_file" << EOF
╔══════════════════════════════════════════════════════════════════╗
║                   🎨 ATELIER SAVE REPORT                        ║
╚══════════════════════════════════════════════════════════════════╝

Execution Date: $(date)
Timestamp: $TIMESTAMP
Day of Week: $(date +%A) (Day $DAY_OF_WEEK)

OPERATIONS COMPLETED:
────────────────────────────────────────────────────────────────

✅ Local Snapshot: Created in ATELIER-VERSIONS/snapshot_${TIMESTAMP}
   📁 Size: $(du -sh "${VERSIONS_DIR}/snapshot_${TIMESTAMP}" 2>/dev/null | cut -f1 || echo "N/A")

✅ Git Operations: 
   📝 Commit: $(git -C "$MAIN_REPO" log -1 --oneline 2>/dev/null || echo "No commit")
   🚀 Push: Completed to $(git -C "$MAIN_REPO" remote get-url origin 2>/dev/null || echo "No remote")

$(if [[ $DAY_OF_WEEK -eq 5 ]]; then
    echo "✅ Weekly Backup: Created atelier_weekly_${DATE}.tar.gz"
    echo "   📦 Size: $(du -sh "${BACKUPS_DIR}/atelier_weekly_${DATE}.tar.gz" 2>/dev/null | cut -f1 || echo "N/A")"
else
    echo "ℹ️  Weekly Backup: Skipped (not Friday)"
fi)

✅ Backup Repository: Synced to atelier-backups repository

SYSTEM INFO:
────────────────────────────────────────────────────────────────

📍 Working Directory: $SCRIPT_DIR
🔧 Git Branch: $(git -C "$MAIN_REPO" branch --show-current 2>/dev/null || echo "No branch")
📝 Git Commit: $(git -C "$MAIN_REPO" rev-parse --short HEAD 2>/dev/null || echo "No commit")
💾 Total Snapshots: $(ls -1 "$VERSIONS_DIR" 2>/dev/null | wc -l || echo "0")
📦 Total Backups: $(ls -1 "$BACKUPS_DIR"/*.tar.gz 2>/dev/null | wc -l || echo "0")

LOGS:
────────────────────────────────────────────────────────────────

📝 Detailed Log: $LOG_FILE
📊 This Report: $report_file

Generated by: atelier-save.sh v2.0
EOF
    
    log "SUCCESS" "Report generated: $report_file"
    
    # Also print report to console
    echo -e "${CYAN}"
    cat "$report_file"
    echo -e "${NC}"
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    local custom_commit_message="${1:-}"
    
    print_header
    
    log "INFO" "Starting atelier-save.sh v2.0"
    log "INFO" "Custom commit message: ${custom_commit_message:-"(auto-generated)"}"
    
    print_separator
    
    # Phase 1: Prerequisites and validation
    check_prerequisites
    check_git_status
    
    print_separator
    
    # Phase 2: Local operations
    if ! create_local_snapshot; then
        log "ERROR" "Failed to create local snapshot"
        exit 1
    fi
    
    print_separator
    
    # Phase 3: Git operations
    if ! commit_and_push_main "$custom_commit_message"; then
        log "WARNING" "Git operations had issues, but continuing..."
    fi
    
    print_separator
    
    # Phase 4: Weekly backup (conditional)
    create_weekly_backup
    
    print_separator
    
    # Phase 5: Backup repository sync
    if ! push_to_backup_repository; then
        log "WARNING" "Backup repository sync had issues, but continuing..."
    fi
    
    print_separator
    
    # Phase 6: Generate report
    generate_report
    
    log "SUCCESS" "atelier-save.sh completed successfully! 🎉"
}

# =============================================================================
# SCRIPT ENTRY POINT
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi