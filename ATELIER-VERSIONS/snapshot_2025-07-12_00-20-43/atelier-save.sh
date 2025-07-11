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
# FILE VALIDATION FUNCTIONS
# =============================================================================

validate_critical_files() {
    log "STEP" "Validating critical files before snapshot..."
    
    # Lista dei file critici che non dovrebbero mai essere vuoti
    local critical_files=(
        "docs/blueprint-v3.1.md"
        "docs/blueprint-v2.1.md" 
        "docs/cheat-sheet-versioning.md"
        "CLAUDE.md"
        "webapp/package.json"
    )
    
    local files_fixed=0
    local validation_issues=()
    
    for file in "${critical_files[@]}"; do
        local filepath="${MAIN_REPO}/${file}"
        
        # Controlla se il file esiste ed è vuoto
        if [[ -f "$filepath" ]] && [[ ! -s "$filepath" ]]; then
            log "WARNING" "Critical file is empty: $file"
            
            # Tenta di ripristinare da git
            if git -C "$MAIN_REPO" show "HEAD:$file" > /dev/null 2>&1; then
                local git_size=$(git -C "$MAIN_REPO" show "HEAD:$file" | wc -c | tr -d ' ')
                
                if [[ $git_size -gt 0 ]]; then
                    log "INFO" "Restoring $file from git (${git_size} bytes)"
                    git -C "$MAIN_REPO" show "HEAD:$file" > "$filepath"
                    files_fixed=$((files_fixed + 1))
                    log "SUCCESS" "Restored $file from git repository"
                else
                    validation_issues+=("$file: empty in both local and git")
                fi
            else
                validation_issues+=("$file: not found in git history")
            fi
        elif [[ -f "$filepath" ]]; then
            local size=$(wc -c < "$filepath" | tr -d ' ')
            log "INFO" "✓ $file validated (${size} bytes)"
        else
            validation_issues+=("$file: file not found")
        fi
    done
    
    # Report risultati validazione
    if [[ $files_fixed -gt 0 ]]; then
        log "SUCCESS" "Fixed $files_fixed critical files from git"
    fi
    
    if [[ ${#validation_issues[@]} -gt 0 ]]; then
        log "WARNING" "Validation issues found:"
        for issue in "${validation_issues[@]}"; do
            log "WARNING" "  - $issue"
        done
    else
        log "SUCCESS" "All critical files validated successfully"
    fi
    
    return 0
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
    
    # Validate snapshot integrity
    log "INFO" "Validating snapshot integrity..."
    local snapshot_issues=()
    
    # Verifica che i file critici siano stati copiati correttamente
    local critical_files=(
        "docs/blueprint-v3.1.md"
        "docs/blueprint-v2.1.md" 
        "docs/cheat-sheet-versioning.md"
        "CLAUDE.md"
        "webapp/package.json"
    )
    
    for file in "${critical_files[@]}"; do
        local source_file="${MAIN_REPO}/${file}"
        local snapshot_file="${snapshot_dir}/${file}"
        
        if [[ -f "$source_file" ]] && [[ -f "$snapshot_file" ]]; then
            local source_size=$(wc -c < "$source_file" | tr -d ' ')
            local snapshot_size=$(wc -c < "$snapshot_file" | tr -d ' ')
            
            if [[ $source_size -ne $snapshot_size ]]; then
                snapshot_issues+=("$file: size mismatch (source: ${source_size}, snapshot: ${snapshot_size})")
            elif [[ $snapshot_size -eq 0 ]]; then
                snapshot_issues+=("$file: empty file in snapshot")
            else
                log "INFO" "✓ $file: ${snapshot_size} bytes copied correctly"
            fi
        elif [[ -f "$source_file" ]]; then
            snapshot_issues+=("$file: not copied to snapshot")
        fi
    done
    
    if [[ ${#snapshot_issues[@]} -gt 0 ]]; then
        log "WARNING" "Snapshot integrity issues:"
        for issue in "${snapshot_issues[@]}"; do
            log "WARNING" "  - $issue"
        done
    else
        log "SUCCESS" "Snapshot integrity validated"
    fi

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

# =============================================================================
# AGGIORNA CLAUDE.MD
# =============================================================================

update_claude_md() {
    log "STEP" "Updating CLAUDE.md with latest session info..."
    
    local claude_file="${SCRIPT_DIR}/CLAUDE.md"
    
    if [[ ! -f "$claude_file" ]]; then
        log "WARNING" "CLAUDE.md not found, skipping update"
        return 0
    fi
    
    # Get current git info
    local current_commit=$(git -C "$MAIN_REPO" log -1 --oneline 2>/dev/null || echo "No commit")
    local current_branch=$(git -C "$MAIN_REPO" branch --show-current 2>/dev/null || echo "unknown")
    local total_commits=$(git -C "$MAIN_REPO" rev-list --count HEAD 2>/dev/null || echo "0")
    
    # Count snapshots and backups
    local snapshots_count=$(find "$VERSIONS_DIR" -name "snapshot_*" -type d 2>/dev/null | wc -l | tr -d ' ')
    local backups_count=$(find "$BACKUPS_DIR" -name "backup_*" -type f 2>/dev/null | wc -l | tr -d ' ')
    
    # Get last commit message (without hash)
    local last_commit_msg=$(git -C "$MAIN_REPO" log -1 --format="%s" 2>/dev/null || echo "No commit message")
    
    # Create backup of current CLAUDE.md
    cp "$claude_file" "${claude_file}.backup"
    
    # Get current timestamp
    local current_time=$(date "+%d/%m/%Y %H:%M")
    
    # Create temp file for new content
    local temp_file=$(mktemp)
    
    # Read current file and update specific sections
    awk -v timestamp="$current_time" -v commit="$current_commit" -v branch="$current_branch" -v total_commits="$total_commits" -v snapshots="$snapshots_count" -v backups="$backups_count" -v last_msg="$last_commit_msg" '
    BEGIN { 
        in_session_section = 0
        in_bottom_section = 0
        session_updated = 0
    }
    
    # Look for the session section marker
    /^## 🔄 ULTIMA SESSIONE/ {
        in_session_section = 1
        print "## 🔄 ULTIMA SESSIONE (Auto-aggiornata)"
        print ""
        print "**Data:** " timestamp
        print "**Ultimo commit:** " commit
        print "**Branch:** " branch
        print "**Commit totali:** " total_commits
        print "**Snapshots:** " snapshots " | **Backups:** " backups
        print ""
        print "**Ultima modifica:** " last_msg
        print ""
        session_updated = 1
        next
    }
    
    # Skip lines until end of session section
    in_session_section && /^## / && !/^## 🔄 ULTIMA SESSIONE/ {
        in_session_section = 0
        print $0
        next
    }
    
    # Skip lines in session section
    in_session_section { next }
    
    # Look for bottom timestamp
    /^\*Ultimo aggiornamento:/ {
        print "*Ultimo aggiornamento: " timestamp "*"
        next
    }
    
    # Print all other lines
    !in_session_section { print $0 }
    
    # If session section was not found, add it before the bottom section
    /^---$/ && !session_updated {
        print "## 🔄 ULTIMA SESSIONE (Auto-aggiornata)"
        print ""
        print "**Data:** " timestamp
        print "**Ultimo commit:** " commit
        print "**Branch:** " branch
        print "**Commit totali:** " total_commits
        print "**Snapshots:** " snapshots " | **Backups:** " backups
        print ""
        print "**Ultima modifica:** " last_msg
        print ""
        session_updated = 1
        print $0
        next
    }
    
    ' "$claude_file" > "$temp_file"
    
    # If session section was never found, add it at the end
    if ! grep -q "## 🔄 ULTIMA SESSIONE" "$temp_file"; then
        cat >> "$temp_file" << EOF

## 🔄 ULTIMA SESSIONE (Auto-aggiornata)

**Data:** $current_time
**Ultimo commit:** $current_commit
**Branch:** $current_branch
**Commit totali:** $total_commits
**Snapshots:** $snapshots_count | **Backups:** $backups_count

**Ultima modifica:** $last_commit_msg

EOF
    fi
    
    # Replace original file with updated version
    mv "$temp_file" "$claude_file"
    
    log "SUCCESS" "CLAUDE.md updated with latest session info"
    
    return 0
}

# =============================================================================
# SMART DOCUMENTATION AUTO-UPDATE SYSTEM
# =============================================================================

analyze_commit_for_docs_update() {
    log "STEP" "Analyzing commit for documentation updates..."
    
    local custom_message="$1"
    local commit_message="${custom_message:-$(generate_smart_commit_message "")}"
    
    # Get list of changed files
    local changed_files=$(git -C "$MAIN_REPO" diff --name-only HEAD~1 HEAD 2>/dev/null || git -C "$MAIN_REPO" diff --cached --name-only 2>/dev/null || echo "")
    
    log "INFO" "Analyzing commit: $commit_message"
    log "INFO" "Changed files: $(echo "$changed_files" | wc -l) files"
    
    # Decision flags
    local should_update_blueprint=false
    local should_update_cheatsheet=false
    local update_reason=""
    
    # BLUEPRINT UPDATE TRIGGERS
    # - Major architectural changes (🔧 🏗️)
    # - New features completion (✅ ✨)
    # - Module completions
    # - Critical fixes that change system behavior
    if echo "$commit_message" | grep -qE "(🔧|🏗️|✅|✨|🌱|🚀|Implementato|Completato|sistema|persistenza|Canvas|modulo|Mind Garden|v[0-9]+\.|blueprint)" || \
       echo "$changed_files" | grep -qE "(store\.js|VisualCanvas|types\.js|components/.*\.jsx|MindGarden|ContentStudio|AIAssistant|modules/.*/.*\.jsx)" || \
       echo "$commit_message" | grep -qiE "(unificato|fix critici|architettura|refactor|sistema|completo|evolution|garden|palette|major|breaking)"; then
        should_update_blueprint=true
        update_reason+="Major feature/architecture change detected. "
    fi
    
    # CHEAT-SHEET UPDATE TRIGGERS  
    # - New commit patterns (examples for future reference)
    # - Versioning workflow changes
    # - Script improvements
    # - Documentation workflow updates
    if echo "$commit_message" | grep -qE "(📚|📝|Docs|cheat|versioning|script|workflow)" || \
       echo "$changed_files" | grep -qE "(atelier-save\.sh|\.md|docs/)" || \
       echo "$commit_message" | grep -qiE "(save|backup|commit|esempio|pattern|best practice)"; then
        should_update_cheatsheet=true
        update_reason+="Documentation/workflow change detected. "
    fi
    
    # SPECIAL PATTERNS - High significance commits
    if echo "$commit_message" | grep -qE "(persistenza|nested boards|race condition|localStorage|critical|hotfix)" || \
       echo "$commit_message" | grep -qiE "(risolto|problema|fix|bug|errore|critico)"; then
        should_update_blueprint=true
        should_update_cheatsheet=true
        update_reason+="Critical system fix - updating both docs. "
    fi
    
    log "INFO" "Analysis result: Blueprint=$should_update_blueprint, CheatSheet=$should_update_cheatsheet"
    log "INFO" "Reason: $update_reason"
    
    # Store results in global variables for main function
    export UPDATE_BLUEPRINT="$should_update_blueprint"
    export UPDATE_CHEATSHEET="$should_update_cheatsheet" 
    export UPDATE_REASON="$update_reason"
    
    return 0
}

update_blueprint_smart() {
    log "STEP" "Smart updating blueprint with latest changes..."
    
    # Find the latest blueprint version automatically (supports v2.x, v3.x, v4.x, v5.x, etc.)
    local blueprint_file=""
    local latest_version=""
    
    # Find all blueprint files and get the highest version
    if [[ -d "${SCRIPT_DIR}/docs" ]]; then
        # Find all blueprint-vX.Y.md files and sort by version number
        local blueprints_raw=$(find "${SCRIPT_DIR}/docs" -name "blueprint-v*.md" -type f | sort -V)
        
        if [[ -n "$blueprints_raw" ]]; then
            # Take the highest version (last line in sorted output)
            blueprint_file=$(echo "$blueprints_raw" | tail -1)
            latest_version=$(basename "$blueprint_file" .md | sed 's/blueprint-v//')
            log "INFO" "Auto-detected latest Blueprint v${latest_version}"
        fi
    fi
    
    # Fallback if no versioned blueprint found
    if [[ -z "$blueprint_file" || ! -f "$blueprint_file" ]]; then
        log "WARNING" "No blueprint file found in docs/ - looking for fallbacks"
        return 0
    fi
    
    # Get current commit info
    local current_commit=$(git -C "$MAIN_REPO" log -1 --oneline 2>/dev/null || echo "No commit")
    local last_commit_msg=$(git -C "$MAIN_REPO" log -1 --format="%s" 2>/dev/null || echo "No commit message")
    local current_date=$(date "+%B %Y")
    
    # Create backup
    cp "$blueprint_file" "${blueprint_file}.backup"
    
    # Create temp file for updates
    local temp_file=$(mktemp)
    
    # Update the changelog section (universal version support)
    awk -v commit="$current_commit" -v msg="$last_commit_msg" -v date="$current_date" -v version="$latest_version" '
    # Update version in title if needed
    /^# Atelier Blueprint v[0-9]+\.[0-9]+/ {
        if (msg ~ /v[0-9]+\.[0-9]+/ && msg !~ version) {
            # Extract new version from commit message
            match(msg, /v([0-9]+\.[0-9]+)/, ver)
            if (ver[1] && ver[1] != version) {
                gsub(/v[0-9]+\.[0-9]+/, "v" ver[1], $0)
            }
        }
        print $0
        next
    }
    
    /^## 🆕 Changelog/ {
        print $0
        print ""
        print "### " date " - Latest Updates"
        print "- **" commit "**: " msg
        getline; if ($0 ~ /^### /) { print ""; }
        print $0
        next
    }
    
    /^\*Ultimo aggiornamento:/ {
        print "*Ultimo aggiornamento: " date "*"
        next
    }
    
    /^\*Versione Blueprint:/ {
        # Update version in footer if commit mentions new version
        if (msg ~ /v[0-9]+\.[0-9]+/) {
            match(msg, /v([0-9]+\.[0-9]+)/, ver)
            if (ver[1] && ver[1] != version) {
                print "*Versione Blueprint: " ver[1] " - " substr(msg, index(msg, " - ") + 3) "*"
                next
            }
        }
        print $0
        next
    }
    
    { print $0 }
    ' "$blueprint_file" > "$temp_file"
    
    # Replace original with updated version
    mv "$temp_file" "$blueprint_file"
    
    log "SUCCESS" "Blueprint updated with commit: $current_commit"
    return 0
}

update_cheatsheet_smart() {
    log "STEP" "Smart updating cheat-sheet with latest commit patterns..."
    
    local cheatsheet_file="${SCRIPT_DIR}/docs/cheat-sheet-versioning.md"
    
    if [[ ! -f "$cheatsheet_file" ]]; then
        log "WARNING" "Cheat-sheet file not found: $cheatsheet_file"
        return 0
    fi
    
    # Get current commit info for example
    local last_commit_msg=$(git -C "$MAIN_REPO" log -1 --format="%s" 2>/dev/null || echo "No commit message")
    local current_date=$(date "+%B %Y")
    
    # Create backup
    cp "$cheatsheet_file" "${cheatsheet_file}.backup"
    
    # Only add to examples if it's a good commit message pattern
    if echo "$last_commit_msg" | grep -qE "(🔧|🐛|✨|⚡|🏗️|📚|🧪)" && \
       [[ ${#last_commit_msg} -gt 20 ]] && \
       ! echo "$last_commit_msg" | grep -qiE "(auto-save|backup|update|change)"; then
        
        local temp_file=$(mktemp)
        
        # Add the new example to the good examples section
        awk -v msg="$last_commit_msg" -v date="$current_date" '
        /^# ✅ Buoni esempi - Fix e ottimizzazioni/ {
            print $0
            getline; print $0  # print the ```bash line
            getline; print $0  # print first example
            print "./atelier-save.sh \"" msg "\"  # Latest real example"
            next
        }
        
        /^\*Ultimo aggiornamento:/ {
            print "*Ultimo aggiornamento: " date "*"
            next
        }
        
        { print $0 }
        ' "$cheatsheet_file" > "$temp_file"
        
        mv "$temp_file" "$cheatsheet_file"
        
        log "SUCCESS" "Cheat-sheet updated with new commit example: $last_commit_msg"
    else
        log "INFO" "Commit message not suitable for cheat-sheet example"
    fi
    
    return 0
}

smart_docs_update() {
    local custom_message="$1"
    
    # Analyze the commit to decide what to update
    analyze_commit_for_docs_update "$custom_message"
    
    local updates_made=false
    
    # Update blueprint if needed
    if [[ "$UPDATE_BLUEPRINT" == "true" ]]; then
        log "INFO" "🎯 Updating blueprint: $UPDATE_REASON"
        if update_blueprint_smart; then
            updates_made=true
        fi
    fi
    
    # Update cheat-sheet if needed  
    if [[ "$UPDATE_CHEATSHEET" == "true" ]]; then
        log "INFO" "🎯 Updating cheat-sheet: $UPDATE_REASON"
        if update_cheatsheet_smart; then
            updates_made=true
        fi
    fi
    
    if [[ "$updates_made" == "false" ]]; then
        log "INFO" "🤖 No documentation updates needed for this commit"
    else
        log "SUCCESS" "🤖 Smart documentation updates completed"
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
   🔍 File Validation: $(if grep -q "All critical files validated successfully" "$LOG_FILE"; then echo "✅ Passed"; else echo "⚠️ Issues detected"; fi)
   🔎 Snapshot Integrity: $(if grep -q "Snapshot integrity validated" "$LOG_FILE"; then echo "✅ Validated"; else echo "⚠️ Issues found"; fi)

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

$(if [[ "${UPDATE_BLUEPRINT:-false}" == "true" ]] || [[ "${UPDATE_CHEATSHEET:-false}" == "true" ]]; then
    echo "🤖 Smart Docs Updates:"
    [[ "${UPDATE_BLUEPRINT:-false}" == "true" ]] && echo "   📋 Blueprint updated automatically"
    [[ "${UPDATE_CHEATSHEET:-false}" == "true" ]] && echo "   📝 Cheat-sheet updated automatically"
    echo "   💡 Reason: ${UPDATE_REASON:-'Automatic analysis'}"
else
    echo "🤖 Smart Docs: No updates needed for this commit"
fi)

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
    validate_critical_files
    
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
    
    # Phase 6: Update CLAUDE.md
    if ! update_claude_md; then
        log "WARNING" "CLAUDE.md update had issues, but continuing..."
    fi
    
    print_separator
    
    # Phase 6.5: Smart Documentation Updates  
    if ! smart_docs_update "$custom_commit_message"; then
        log "WARNING" "Smart docs update had issues, but continuing..."
    fi
    
    print_separator
    
    # Phase 7: Generate report
    generate_report
    
    log "SUCCESS" "atelier-save.sh completed successfully! 🎉"
}

# =============================================================================
# SCRIPT ENTRY POINT
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi