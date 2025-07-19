# 🧪 Recovery Testing System Documentation

> Automated backup recovery testing and validation system for Atelier

## 📋 Overview

The Recovery Testing System ensures the integrity and recoverability of Atelier backups through automated validation tests. This system provides confidence that your project data can be reliably restored when needed.

## 🎯 Features

### Automated Testing
- **Weekly Schedule**: Runs every Sunday at 2 AM
- **Comprehensive Coverage**: Tests 6 critical system areas
- **Real-time Monitoring**: Dashboard with live status updates
- **Historical Tracking**: Maintains test result history

### Test Coverage Areas
1. **Snapshot Integrity**: Validates all critical files are present
2. **Package.json Validity**: Ensures dependency configuration is valid
3. **Module System Integrity**: Confirms all core modules are available
4. **Security Files Integrity**: Checks security implementation completeness
5. **Documentation Integrity**: Validates documentation presence
6. **Recovery Simulation**: Performs actual recovery process test

## 🚀 Quick Start

### Manual Test Execution
```bash
# Run recovery tests immediately
./scripts/recovery-test.sh --run

# Install automated weekly testing
./scripts/recovery-test.sh --install-cron

# Remove automated testing
./scripts/recovery-test.sh --uninstall-cron
```

### Web Dashboard Access
```bash
# Start development server
npm run dev

# Navigate to Recovery Dashboard
http://localhost:5174/recovery
```

## 🔧 System Architecture

### Script Components
```
scripts/recovery-test.sh
├── Configuration & Setup
├── Logging Functions
├── Utility Functions
├── Test Functions
│   ├── test_snapshot_integrity()
│   ├── test_package_json_validity()
│   ├── test_module_system_integrity()
│   ├── test_security_files_integrity()
│   ├── test_documentation_integrity()
│   └── simulate_recovery()
├── Main Test Suite
└── Automated Scheduling
```

### Dashboard Components
```
RecoveryTestDashboard.jsx
├── Test Execution Control
├── Real-time Status Display
├── Health Score Calculation
├── Test History Management
└── Results Visualization
```

## 🧪 Test Details

### 1. Snapshot Integrity Check
**Purpose**: Ensures critical project files are present in backup
**Files Checked**:
- `webapp/package.json`
- `webapp/src/App.jsx`
- `webapp/src/modules/shared/registry/ModuleRegistry.js`
- `docs/` directory
- `CLAUDE.md`

**Pass Criteria**: All critical files exist in snapshot

### 2. Package.json Validity
**Purpose**: Validates dependency configuration integrity
**Validations**:
- JSON syntax correctness
- Required fields presence (`name`, `version`, `dependencies`, `scripts`)
- File readability

**Pass Criteria**: Valid JSON with all required fields

### 3. Module System Integrity
**Purpose**: Confirms all core modules are backed up
**Modules Checked**:
- `shared/` (Module Registry, Adapters, Event Bus)
- `scriptorium/` (Visual Canvas)
- `mind-garden/` (Mind Mapping)
- `orchestra/` (Content Management)
- `ideas/` (Commercial Roadmap)

**Pass Criteria**: All core module directories exist

### 4. Security Files Integrity
**Purpose**: Ensures security implementation is preserved
**Files Checked**:
- `api/anthropic.js`
- `api/openai.js`
- `api/health.js`
- `webapp/src/utils/secureStorage.js`
- `webapp/src/utils/authPlaceholder.js`
- `webapp/src/components/SecurityStatus.jsx`
- `vercel.json`

**Pass Criteria**: All security files present (warnings for missing API files in local development)

### 5. Documentation Integrity
**Purpose**: Validates project documentation preservation
**Files Checked**:
- `README.md`
- `CLAUDE.md`
- `docs/architecture-visual.md`
- `docs/security-implementation.md`

**Pass Criteria**: All documentation files exist

### 6. Recovery Simulation
**Purpose**: Tests actual recovery process
**Process**:
1. Creates temporary recovery directory
2. Copies critical files from backup
3. Validates file structure integrity
4. Tests package.json readability
5. Cleans up test artifacts

**Pass Criteria**: Successful file restoration and validation

## 📊 Health Scoring

### Health Score Calculation
```javascript
Health Score = (Passed Tests / Total Tests) × 100
```

### Score Interpretation
- **100%**: Perfect health, all systems operational
- **90-99%**: Excellent health, minor issues
- **80-89%**: Good health, some attention needed
- **70-79%**: Fair health, investigate warnings
- **<70%**: Poor health, immediate action required

## 🔄 Automated Scheduling

### Cron Job Installation
```bash
# Install weekly automated tests (Sundays at 2 AM)
./scripts/recovery-test.sh --install-cron

# Verify installation
crontab -l | grep recovery-test
```

### Schedule Details
- **Frequency**: Weekly
- **Day**: Sunday
- **Time**: 2:00 AM local time
- **Logging**: Results logged to `/logs/recovery-test_YYYY-MM-DD.log`

### Manual Scheduling
```bash
# Custom cron schedule (daily at 3 AM)
0 3 * * * /path/to/scripts/recovery-test.sh --automated >> /path/to/logs/recovery.log 2>&1
```

## 📈 Monitoring & Alerts

### Dashboard Features
- **Real-time Status**: Current system health display
- **Test Control**: Manual test execution
- **Historical Data**: Previous test results
- **Health Trends**: Visual health score tracking
- **Export Options**: Test result export functionality

### Log Management
```bash
# View recent test logs
tail -f logs/recovery-test_$(date +%Y-%m-%d).log

# Search for specific test results
grep "SUCCESS\|ERROR" logs/recovery-test_*.log

# Archive old logs
find logs/ -name "recovery-test_*.log" -mtime +30 -delete
```

## 🚨 Troubleshooting

### Common Issues

#### No Snapshots Found
```bash
# Check backup directory
ls -la ATELIER-VERSIONS/

# Ensure atelier-save.sh has run
./atelier-save.sh "Manual backup for testing"
```

#### Test Failures
```bash
# Run in verbose mode
./scripts/recovery-test.sh --run

# Check specific test logs
grep "test_name" logs/recovery-test_*.log
```

#### Cron Job Not Running
```bash
# Check cron service status
sudo service cron status

# Verify cron job installation
crontab -l

# Check cron logs
grep recovery-test /var/log/syslog
```

### Recovery Procedures

#### If Health Score Drops Below 80%
1. **Immediate Action**: Run manual backup
   ```bash
   ./atelier-save.sh "Emergency backup - health check failed"
   ```

2. **Investigate Issues**: Check test details in dashboard

3. **Fix Problems**: Address failed test areas

4. **Re-test**: Run recovery test again
   ```bash
   ./scripts/recovery-test.sh --run
   ```

#### Critical System Failure
1. **Assess Damage**: Review latest test results
2. **Identify Last Good Backup**: Check test history
3. **Prepare Recovery**: Choose appropriate snapshot
4. **Execute Recovery**: Follow backup restoration procedure
5. **Validate**: Run full recovery test after restoration

## 🔮 Future Enhancements

### Planned Features
- **Email Notifications**: Automated alerts for test failures
- **Slack Integration**: Team notifications for critical issues
- **Performance Metrics**: Test execution time tracking
- **Advanced Analytics**: Failure pattern recognition
- **Cloud Backup Testing**: Extended testing for cloud backups

### Enhancement Roadmap
1. **Phase 1**: Email alert system
2. **Phase 2**: Performance optimization
3. **Phase 3**: Cloud integration testing
4. **Phase 4**: Predictive failure analysis

## 📚 API Reference

### Script Commands
```bash
# Show help
./scripts/recovery-test.sh --help

# Run tests
./scripts/recovery-test.sh --run

# Install automation
./scripts/recovery-test.sh --install-cron

# Remove automation
./scripts/recovery-test.sh --uninstall-cron

# Run in automated mode (less verbose)
./scripts/recovery-test.sh --automated
```

### Dashboard Integration
```javascript
// Access test results programmatically
const testHistory = JSON.parse(
  localStorage.getItem('ATELIER_RECOVERY_TEST_HISTORY')
);

// Trigger manual test
// (Implementation depends on shell script integration)
```

## 📞 Support

### Getting Help
- **Documentation**: This guide and inline script comments
- **Logs**: Check `/logs/recovery-test_*.log` for detailed output
- **Dashboard**: Use `/recovery` route for visual monitoring
- **Issues**: Report problems via GitHub issues

### Best Practices
1. **Regular Monitoring**: Check dashboard weekly
2. **Address Warnings**: Don't ignore warning status
3. **Keep Logs**: Preserve test logs for trend analysis
4. **Test Recovery**: Periodically perform actual recovery
5. **Update Tests**: Modify tests as system evolves

---

**Recovery Testing System Complete** ✅  
*Last Updated: July 17, 2025*