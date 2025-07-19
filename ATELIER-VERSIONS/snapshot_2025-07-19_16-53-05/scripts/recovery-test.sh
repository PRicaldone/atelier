#!/bin/bash

# 🧪 ATELIER RECOVERY TEST SYSTEM v1.0
# Automated backup recovery testing and validation

set -euo pipefail

# =====================================================
# CONFIGURATION
# =====================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TEST_DIR="$PROJECT_ROOT/tmp/recovery-tests"
BACKUP_DIR="$PROJECT_ROOT/ATELIER-VERSIONS"
LOG_FILE="$PROJECT_ROOT/logs/recovery-test_$(date +%Y-%m-%d).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =====================================================
# LOGGING FUNCTIONS
# =====================================================

log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [$level] $message" | tee -a "$LOG_FILE"
}

log_info() { log "INFO" "${BLUE}$1${NC}"; }
log_success() { log "SUCCESS" "${GREEN}✅ $1${NC}"; }
log_warning() { log "WARNING" "${YELLOW}⚠️ $1${NC}"; }
log_error() { log "ERROR" "${RED}❌ $1${NC}"; }

# =====================================================
# UTILITY FUNCTIONS
# =====================================================

ensure_directory() {
    local dir="$1"
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        log_info "Created directory: $dir"
    fi
}

cleanup_test_directory() {
    if [ -d "$TEST_DIR" ]; then
        rm -rf "$TEST_DIR"
        log_info "Cleaned up test directory"
    fi
}

get_latest_snapshot() {
    find "$BACKUP_DIR" -name "snapshot_*" -type d | sort | tail -1
}

# =====================================================
# TEST FUNCTIONS
# =====================================================

test_snapshot_integrity() {
    local snapshot_dir="$1"
    local test_name="Snapshot Integrity Check"
    
    log_info "🧪 Running: $test_name"
    
    # Check if snapshot directory exists
    if [ ! -d "$snapshot_dir" ]; then
        log_error "$test_name: Snapshot directory not found: $snapshot_dir"
        return 1
    fi
    
    # Check critical files
    local critical_files=(
        "webapp/package.json"
        "webapp/src/App.jsx"
        "webapp/src/modules/shared/registry/ModuleRegistry.js"
        "docs"
        "CLAUDE.md"
    )
    
    local missing_files=()
    for file in "${critical_files[@]}"; do
        if [ ! -e "$snapshot_dir/$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        log_success "$test_name: All critical files present"
        return 0
    else
        log_error "$test_name: Missing critical files: ${missing_files[*]}"
        return 1
    fi
}

test_package_json_validity() {
    local snapshot_dir="$1"
    local test_name="Package.json Validity"
    
    log_info "🧪 Running: $test_name"
    
    local package_json="$snapshot_dir/webapp/package.json"
    if [ ! -f "$package_json" ]; then
        log_error "$test_name: package.json not found"
        return 1
    fi
    
    # Validate JSON syntax
    if ! jq empty "$package_json" 2>/dev/null; then
        log_error "$test_name: Invalid JSON syntax"
        return 1
    fi
    
    # Check required fields
    local required_fields=("name" "version" "dependencies" "scripts")
    for field in "${required_fields[@]}"; do
        if ! jq -e ".$field" "$package_json" >/dev/null 2>&1; then
            log_error "$test_name: Missing required field: $field"
            return 1
        fi
    done
    
    log_success "$test_name: Package.json is valid"
    return 0
}

test_module_system_integrity() {
    local snapshot_dir="$1"
    local test_name="Module System Integrity"
    
    log_info "🧪 Running: $test_name"
    
    local modules_dir="$snapshot_dir/webapp/src/modules"
    if [ ! -d "$modules_dir" ]; then
        log_error "$test_name: Modules directory not found"
        return 1
    fi
    
    # Check core modules
    local core_modules=("shared" "scriptorium" "mind-garden" "orchestra" "ideas")
    local missing_modules=()
    
    for module in "${core_modules[@]}"; do
        if [ ! -d "$modules_dir/$module" ]; then
            missing_modules+=("$module")
        fi
    done
    
    if [ ${#missing_modules[@]} -eq 0 ]; then
        log_success "$test_name: All core modules present"
        return 0
    else
        log_error "$test_name: Missing modules: ${missing_modules[*]}"
        return 1
    fi
}

test_security_files_integrity() {
    local snapshot_dir="$1"
    local test_name="Security Files Integrity"
    
    log_info "🧪 Running: $test_name"
    
    local security_files=(
        "api/anthropic.js"
        "api/openai.js"
        "api/health.js"
        "webapp/src/utils/secureStorage.js"
        "webapp/src/utils/authPlaceholder.js"
        "webapp/src/components/SecurityStatus.jsx"
        "vercel.json"
    )
    
    local missing_security_files=()
    for file in "${security_files[@]}"; do
        if [ ! -f "$snapshot_dir/$file" ]; then
            missing_security_files+=("$file")
        fi
    done
    
    if [ ${#missing_security_files[@]} -eq 0 ]; then
        log_success "$test_name: All security files present"
        return 0
    else
        log_warning "$test_name: Missing security files: ${missing_security_files[*]}"
        return 1
    fi
}

test_documentation_integrity() {
    local snapshot_dir="$1"
    local test_name="Documentation Integrity"
    
    log_info "🧪 Running: $test_name"
    
    local doc_files=(
        "README.md"
        "CLAUDE.md"
        "docs/architecture-visual.md"
        "docs/security-implementation.md"
    )
    
    local missing_docs=()
    for file in "${doc_files[@]}"; do
        if [ ! -f "$snapshot_dir/$file" ]; then
            missing_docs+=("$file")
        fi
    done
    
    if [ ${#missing_docs[@]} -eq 0 ]; then
        log_success "$test_name: All documentation files present"
        return 0
    else
        log_warning "$test_name: Missing documentation: ${missing_docs[*]}"
        return 1
    fi
}

simulate_recovery() {
    local snapshot_dir="$1"
    local test_name="Recovery Simulation"
    
    log_info "🧪 Running: $test_name"
    
    # Create test recovery directory
    local recovery_dir="$TEST_DIR/recovery-simulation"
    ensure_directory "$recovery_dir"
    
    # Copy critical files to simulate recovery
    log_info "Simulating recovery process..."
    
    # Copy webapp directory
    if cp -r "$snapshot_dir/webapp" "$recovery_dir/" 2>/dev/null; then
        log_info "✓ Webapp files recovered"
    else
        log_error "$test_name: Failed to recover webapp files"
        return 1
    fi
    
    # Copy API directory
    if cp -r "$snapshot_dir/api" "$recovery_dir/" 2>/dev/null; then
        log_info "✓ API files recovered"
    else
        log_warning "$test_name: API files not found (acceptable for local development)"
    fi
    
    # Copy documentation
    if cp -r "$snapshot_dir/docs" "$recovery_dir/" 2>/dev/null; then
        log_info "✓ Documentation recovered"
    else
        log_warning "$test_name: Documentation not fully recovered"
    fi
    
    # Test if package.json is readable
    if [ -f "$recovery_dir/webapp/package.json" ]; then
        if jq . "$recovery_dir/webapp/package.json" >/dev/null 2>&1; then
            log_success "$test_name: Recovery simulation successful"
            return 0
        else
            log_error "$test_name: Recovered files corrupted"
            return 1
        fi
    else
        log_error "$test_name: Critical files missing after recovery"
        return 1
    fi
}

# =====================================================
# MAIN TEST SUITE
# =====================================================

run_recovery_tests() {
    log_info "🎯 Starting Atelier Recovery Test Suite"
    log_info "Test Directory: $TEST_DIR"
    log_info "Backup Directory: $BACKUP_DIR"
    
    # Ensure log directory exists
    ensure_directory "$(dirname "$LOG_FILE")"
    
    # Cleanup previous test
    cleanup_test_directory
    ensure_directory "$TEST_DIR"
    
    # Get latest snapshot
    local latest_snapshot=$(get_latest_snapshot)
    if [ -z "$latest_snapshot" ]; then
        log_error "No snapshots found in $BACKUP_DIR"
        exit 1
    fi
    
    log_info "Testing snapshot: $(basename "$latest_snapshot")"
    
    # Run all tests
    local tests_passed=0
    local tests_total=0
    local test_functions=(
        "test_snapshot_integrity"
        "test_package_json_validity"
        "test_module_system_integrity"
        "test_security_files_integrity"
        "test_documentation_integrity"
        "simulate_recovery"
    )
    
    for test_func in "${test_functions[@]}"; do
        ((tests_total++))
        if $test_func "$latest_snapshot"; then
            ((tests_passed++))
        fi
        echo "" # Add spacing between tests
    done
    
    # Generate summary
    log_info "🎯 Recovery Test Summary"
    log_info "Tests Passed: $tests_passed/$tests_total"
    
    if [ $tests_passed -eq $tests_total ]; then
        log_success "🎉 All recovery tests passed! Backup system is healthy."
        cleanup_test_directory
        return 0
    else
        log_warning "⚠️ Some tests failed. Backup system needs attention."
        log_info "Test artifacts preserved in: $TEST_DIR"
        return 1
    fi
}

# =====================================================
# AUTOMATED SCHEDULING
# =====================================================

install_recovery_test_cron() {
    log_info "Installing automated recovery test cron job..."
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "recovery-test.sh"; then
        log_warning "Recovery test cron job already installed"
        return 0
    fi
    
    # Add cron job to run every Sunday at 2 AM
    (crontab -l 2>/dev/null; echo "0 2 * * 0 $SCRIPT_DIR/recovery-test.sh --automated >> $LOG_FILE 2>&1") | crontab -
    
    log_success "Recovery test cron job installed (Sundays at 2 AM)"
}

uninstall_recovery_test_cron() {
    log_info "Removing recovery test cron job..."
    
    crontab -l 2>/dev/null | grep -v "recovery-test.sh" | crontab -
    
    log_success "Recovery test cron job removed"
}

# =====================================================
# MAIN EXECUTION
# =====================================================

show_help() {
    cat << EOF
🧪 Atelier Recovery Test System v1.0

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --run                Run recovery tests now
    --install-cron      Install automated weekly tests
    --uninstall-cron    Remove automated tests
    --automated         Run in automated mode (less verbose)
    --help              Show this help

EXAMPLES:
    $0 --run                        # Run recovery tests manually
    $0 --install-cron              # Install weekly automated tests
    $0 --automated                 # Run in automated mode

EOF
}

main() {
    case "${1:-}" in
        --run)
            run_recovery_tests
            ;;
        --install-cron)
            install_recovery_test_cron
            ;;
        --uninstall-cron)
            uninstall_recovery_test_cron
            ;;
        --automated)
            log_info "🤖 Running automated recovery test"
            run_recovery_tests
            ;;
        --help)
            show_help
            ;;
        "")
            show_help
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"