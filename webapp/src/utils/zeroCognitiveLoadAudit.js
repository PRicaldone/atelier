/**
 * Zero Cognitive Load Audit System
 * 
 * Verifica automaticamente che tutti i sistemi di Atelier rispettino il principio
 * "Non lasciare mai cose da ricordare all'utente"
 */

import { createModuleLogger } from '../modules/shared/monitoring/ModuleLogger.js';

const logger = createModuleLogger('zero-cognitive-load-audit');

class ZeroCognitiveLoadAudit {
  constructor() {
    this.violations = [];
    this.compliantSystems = [];
    this.auditHistory = [];
    this.isInitialized = false;
    
    this.init();
  }

  async init() {
    if (this.isInitialized) return;
    
    logger.info('Initializing Zero Cognitive Load Audit System', 'init');
    
    // Schedule automatic audits
    this.scheduleAudits();
    
    this.isInitialized = true;
    logger.info('Zero Cognitive Load Audit System initialized', 'init');
  }

  /**
   * Schedule automatic compliance audits
   */
  scheduleAudits() {
    // Run audit every hour
    setInterval(() => {
      this.runComplianceAudit();
    }, 60 * 60 * 1000); // 1 hour

    // Initial audit after 30 seconds
    setTimeout(() => {
      this.runComplianceAudit();
    }, 30000);
  }

  /**
   * Run comprehensive compliance audit
   */
  async runComplianceAudit() {
    logger.info('Starting Zero Cognitive Load compliance audit', 'runComplianceAudit');
    
    this.violations = [];
    this.compliantSystems = [];
    
    // Audit all areas
    await this.auditAIFeatureManagement();
    await this.auditWIPProtection();
    await this.auditModuleHealth();
    await this.auditErrorTracking();
    await this.auditBackupSystems();
    await this.auditSecurityMigration();
    await this.auditBranchProtection();
    await this.auditCanvasOperations();
    await this.auditMindGarden();
    await this.auditProjectManagement();
    await this.auditFileManagement();
    await this.auditUIPatterns();
    
    // Record audit results
    const auditResult = {
      timestamp: Date.now(),
      totalViolations: this.violations.length,
      compliantSystems: this.compliantSystems.length,
      violations: [...this.violations],
      compliant: [...this.compliantSystems],
      complianceRate: this.compliantSystems.length / (this.compliantSystems.length + this.violations.length)
    };
    
    this.auditHistory.push(auditResult);
    
    // Keep last 10 audits
    if (this.auditHistory.length > 10) {
      this.auditHistory.shift();
    }
    
    logger.info('Compliance audit completed', 'runComplianceAudit', auditResult);
    
    // Alert on violations
    if (this.violations.length > 0) {
      this.alertViolations();
    }
    
    return auditResult;
  }

  /**
   * Audit AI Feature Management compliance
   */
  async auditAIFeatureManagement() {
    const systemName = 'AI Feature Management';
    
    try {
      // Check if AIFeatureManager exists and is working
      const manager = window.__aiFeatureManager;
      
      if (!manager) {
        this.addViolation(systemName, 'AIFeatureManager not found');
        return;
      }
      
      const status = manager.getStatus();
      
      // Check auto-management
      if (!status.initialized) {
        this.addViolation(systemName, 'Not initialized - user would need to remember to enable');
        return;
      }
      
      // Check monitoring
      if (status.featuresCount === 0) {
        this.addViolation(systemName, 'No features registered - system not managing anything');
        return;
      }
      
      // Check restoration capability
      if (typeof manager.forceRestore !== 'function') {
        this.addViolation(systemName, 'Missing auto-restore capability');
        return;
      }
      
      this.addCompliantSystem(systemName, 'Full auto-management with monitoring and restoration');
      
    } catch (error) {
      this.addViolation(systemName, `System error: ${error.message}`);
    }
  }

  /**
   * Audit WIP Protection compliance
   */
  async auditWIPProtection() {
    const systemName = 'WIP Protection';
    
    try {
      // Check if WIP protection is active
      const wipProtection = window.wipProtection;
      
      if (!wipProtection) {
        this.addViolation(systemName, 'WIP Protection system not found');
        return;
      }
      
      const stats = wipProtection.getStats();
      
      if (!stats?.isEnabled) {
        this.addViolation(systemName, 'WIP Protection disabled - user needs to remember to save');
        return;
      }
      
      // Check auto-monitoring
      if (stats.session?.duration === undefined) {
        this.addViolation(systemName, 'Not monitoring work session automatically');
        return;
      }
      
      this.addCompliantSystem(systemName, 'Automatic work protection and monitoring');
      
    } catch (error) {
      this.addViolation(systemName, `System error: ${error.message}`);
    }
  }

  /**
   * Audit Module Health compliance
   */
  async auditModuleHealth() {
    const systemName = 'Module Health Monitoring';
    
    try {
      const healthIntegration = window.__healthCheckIntegration;
      
      if (!healthIntegration) {
        this.addViolation(systemName, 'Health check system not found');
        return;
      }
      
      const isHealthy = healthIntegration.isSystemHealthy();
      const unhealthyModules = healthIntegration.getUnhealthyModules();
      
      if (unhealthyModules.length > 0) {
        this.addViolation(systemName, `${unhealthyModules.length} unhealthy modules - manual intervention may be needed`);
        return;
      }
      
      this.addCompliantSystem(systemName, 'Automatic health monitoring and alerts');
      
    } catch (error) {
      this.addViolation(systemName, `System error: ${error.message}`);
    }
  }

  /**
   * Audit Error Tracking compliance
   */
  async auditErrorTracking() {
    const systemName = 'Error Tracking';
    
    try {
      const errorTracker = window.__errorTracker;
      
      if (!errorTracker) {
        this.addViolation(systemName, 'Error tracker not found - silent failures possible');
        return;
      }
      
      const stats = errorTracker.getStats();
      
      if (!stats || stats.total === undefined) {
        this.addViolation(systemName, 'Error tracking not collecting data');
        return;
      }
      
      this.addCompliantSystem(systemName, 'Centralized error tracking with automatic logging');
      
    } catch (error) {
      this.addViolation(systemName, `System error: ${error.message}`);
    }
  }

  /**
   * Audit backup systems compliance
   */
  async auditBackupSystems() {
    const systemName = 'Backup Systems';
    
    try {
      // Check if secure storage auto-migration exists
      const migrationStatus = window.__migrationStatus;
      
      if (!migrationStatus) {
        this.addViolation(systemName, 'No auto-migration system - user would need manual intervention');
        return;
      }
      
      const status = migrationStatus();
      
      if (status.needsMigration) {
        this.addViolation(systemName, 'Migration needed but not completed automatically');
        return;
      }
      
      this.addCompliantSystem(systemName, 'Auto-migration and backup systems');
      
    } catch (error) {
      // If migration system doesn't exist, that's a violation
      this.addViolation(systemName, 'Auto-backup/migration system not found');
    }
  }

  /**
   * Audit security migration compliance
   */
  async auditSecurityMigration() {
    const systemName = 'Security Migration';
    
    try {
      const secureStorage = window.__secureStorage;
      
      if (!secureStorage) {
        this.addViolation(systemName, 'Secure storage not available');
        return;
      }
      
      // Check if migration happened automatically
      if (secureStorage.needsMigration?.()) {
        this.addViolation(systemName, 'Security migration needed but not auto-completed');
        return;
      }
      
      this.addCompliantSystem(systemName, 'Automatic security migration completed');
      
    } catch (error) {
      this.addViolation(systemName, `System error: ${error.message}`);
    }
  }

  /**
   * Audit branch protection compliance
   */
  async auditBranchProtection() {
    const systemName = 'Branch Protection';
    
    // This would typically check git hooks or branch policies
    // For now, we check if the system has proper warnings/automation
    
    try {
      // Check if branch protection warnings exist in code
      const hasProtection = document.querySelector('[data-branch-protection]') ||
                           window.location.pathname.includes('feature/') ||
                           localStorage.getItem('ATELIER_BRANCH_WARNINGS');
      
      if (!hasProtection) {
        this.addViolation(systemName, 'No automatic branch protection warnings detected');
        return;
      }
      
      this.addCompliantSystem(systemName, 'Branch protection warnings and automation');
      
    } catch (error) {
      this.addViolation(systemName, `System error: ${error.message}`);
    }
  }

  /**
   * Audit Canvas operations compliance
   */
  async auditCanvasOperations() {
    const systemName = 'Canvas Operations';
    
    try {
      const canvasStore = window.useCanvasStore?.getState?.();
      
      if (!canvasStore) {
        this.addViolation(systemName, 'Canvas store not found');
        return;
      }
      
      // Check for auto-save
      if (canvasStore.autoSaveEnabled === false) {
        this.addViolation(systemName, 'Auto-save disabled - user needs to remember to save');
        return;
      }
      
      // Check for smart defaults
      if (!canvasStore.settings?.snapToGrid === undefined) {
        this.addViolation(systemName, 'No smart defaults for snap-to-grid');
        return;
      }
      
      this.addCompliantSystem(systemName, 'Auto-save and smart defaults implemented');
      
    } catch (error) {
      this.addViolation(systemName, `System error: ${error.message}`);
    }
  }

  /**
   * Audit Mind Garden compliance (placeholder - needs implementation)
   */
  async auditMindGarden() {
    const systemName = 'Mind Garden';
    
    // TODO: Implement specific Mind Garden compliance checks
    // For now, mark as needs audit
    this.addViolation(systemName, 'NEEDS AUDIT - No automated compliance checks implemented yet');
  }

  /**
   * Audit Project Management compliance (placeholder)
   */
  async auditProjectManagement() {
    const systemName = 'Project Management';
    
    // TODO: Check for auto project switching, context preservation, etc.
    this.addViolation(systemName, 'NEEDS AUDIT - No automated compliance checks implemented yet');
  }

  /**
   * Audit File Management compliance (placeholder)
   */
  async auditFileManagement() {
    const systemName = 'File Management';
    
    // TODO: Check for auto file recognition, smart previews, etc.
    this.addViolation(systemName, 'NEEDS AUDIT - No automated compliance checks implemented yet');
  }

  /**
   * Audit UI Patterns compliance (placeholder)
   */
  async auditUIPatterns() {
    const systemName = 'UI Patterns';
    
    // TODO: Check for smart navigation, auto-persistence, etc.
    this.addViolation(systemName, 'NEEDS AUDIT - No automated compliance checks implemented yet');
  }

  /**
   * Add a compliance violation
   */
  addViolation(system, reason) {
    this.violations.push({
      system,
      reason,
      timestamp: Date.now(),
      severity: this.categorizeSeverity(reason)
    });
    
    logger.warning(`Compliance violation in ${system}: ${reason}`, 'addViolation');
  }

  /**
   * Add a compliant system
   */
  addCompliantSystem(system, reason) {
    this.compliantSystems.push({
      system,
      reason,
      timestamp: Date.now()
    });
  }

  /**
   * Categorize violation severity
   */
  categorizeSeverity(reason) {
    if (reason.includes('NEEDS AUDIT')) return 'info';
    if (reason.includes('user would need') || reason.includes('user needs to remember')) return 'high';
    if (reason.includes('not found') || reason.includes('disabled')) return 'medium';
    return 'low';
  }

  /**
   * Alert on compliance violations
   */
  alertViolations() {
    const highSeverityViolations = this.violations.filter(v => v.severity === 'high');
    
    if (highSeverityViolations.length > 0) {
      console.warn('🧠 ZERO COGNITIVE LOAD VIOLATIONS DETECTED:', highSeverityViolations);
      
      // Create visual alert if alert system exists
      if (window.alertSystem) {
        window.alertSystem.alert({
          title: 'Cognitive Load Violations',
          message: `${highSeverityViolations.length} high-severity violations detected`,
          type: 'warning',
          persistent: true
        });
      }
    }
  }

  /**
   * Get current compliance status
   */
  getComplianceStatus() {
    const total = this.violations.length + this.compliantSystems.length;
    const compliantCount = this.compliantSystems.length;
    
    return {
      complianceRate: total > 0 ? compliantCount / total : 1,
      totalSystems: total,
      compliantSystems: compliantCount,
      violations: this.violations.length,
      lastAudit: this.auditHistory.length > 0 ? this.auditHistory[this.auditHistory.length - 1] : null,
      summary: {
        high: this.violations.filter(v => v.severity === 'high').length,
        medium: this.violations.filter(v => v.severity === 'medium').length,
        low: this.violations.filter(v => v.severity === 'low').length,
        info: this.violations.filter(v => v.severity === 'info').length
      }
    };
  }

  /**
   * Get detailed compliance report
   */
  getComplianceReport() {
    return {
      overview: this.getComplianceStatus(),
      violations: this.violations,
      compliantSystems: this.compliantSystems,
      auditHistory: this.auditHistory,
      recommendations: this.getRecommendations()
    };
  }

  /**
   * Get recommendations for fixing violations
   */
  getRecommendations() {
    const recommendations = [];
    
    this.violations.forEach(violation => {
      if (violation.reason.includes('not found')) {
        recommendations.push({
          system: violation.system,
          action: 'Implement missing auto-management system',
          priority: 'high'
        });
      } else if (violation.reason.includes('disabled')) {
        recommendations.push({
          system: violation.system,
          action: 'Enable automatic features with smart defaults',
          priority: 'medium'
        });
      } else if (violation.reason.includes('NEEDS AUDIT')) {
        recommendations.push({
          system: violation.system,
          action: 'Implement automated compliance checks',
          priority: 'low'
        });
      }
    });
    
    return recommendations;
  }

  /**
   * Manual compliance check (for debugging)
   */
  async checkCompliance() {
    console.log('🧠 Running Zero Cognitive Load compliance check...');
    const result = await this.runComplianceAudit();
    
    console.log('📊 Compliance Report:', this.getComplianceReport());
    
    return result;
  }

  /**
   * Export audit data
   */
  exportAuditData() {
    return JSON.stringify(this.getComplianceReport(), null, 2);
  }
}

// Create singleton instance
export const zeroCognitiveLoadAudit = new ZeroCognitiveLoadAudit();

// Make available for debugging
if (typeof window !== 'undefined') {
  window.__zeroCognitiveLoadAudit = zeroCognitiveLoadAudit;
}

export default zeroCognitiveLoadAudit;