/**
 * App Gesture - Main application with gesture-based UI
 * Revolutionary gesture-first interface for creative workflows
 */

import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GestureLayout } from './components/ui';
import { useUnifiedStore } from './store/unifiedStore';
import { useProjectStore } from './store/projectStore';
import ProjectSelector from './components/ProjectSelector';
import MigrationManager from './components/MigrationManager';
import { 
  CreativeAtelier, 
  ProjectStart, 
  ProjectTracker, 
  BusinessSwitcher,
  MindGarden,
  Orchestra,
  Ideas
} from './modules';

// Import system initializations
import './modules/shared/analytics';
import './utils/alertSystem';
import './utils/wipProtection';
import './utils/auditLogger';
import './modules/shared/ai';
import './utils/addMicroSubscriptionIdea';
import './styles/gesture-ui.css';

// Import module initialization
import { initializeModules } from './modules/shared/moduleInit';
import { autoMigrateOnStartup } from './utils/migrationSecureStorage';

// Development dashboards
import ModuleSystemDemo from './components/ModuleSystemDemo';
import ErrorTrackingDemo from './components/ErrorTrackingDemo';
import EventMonitoringDashboard from './components/EventMonitoringDashboard';
import IntegrationTestDashboard from './components/IntegrationTestDashboard';
import AlertingConfigurationUI from './components/AlertingConfigurationUI';
import RoutineAgentDashboard from './components/RoutineAgentDashboard';
import IntelligenceSystemDashboard from './components/IntelligenceSystemDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import SecurityStatus from './components/SecurityStatus';
import RecoveryTestDashboard from './components/RecoveryTestDashboard';
import AlertNotifications from './components/AlertNotifications';
import AlertManagementDashboard from './components/AlertManagementDashboard';
import CryptoMigrationDashboard from './components/CryptoMigrationDashboard';
import WIPProtectionDashboard from './components/WIPProtectionDashboard';
import AuditLogsDashboard from './components/AuditLogsDashboard';
import AITransparencyDashboard from './components/AITransparencyDashboard';
import WIPProtectionIndicator from './components/WIPProtectionIndicator';

function AppGesture() {
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [modulesInitialized, setModulesInitialized] = useState(false);
  const { initialized, currentProjectId, initialize } = useProjectStore();
  const { currentModule, navigateToModule } = useUnifiedStore();

  // Initialize project store
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  // Initialize module system
  useEffect(() => {
    if (initialized && !modulesInitialized) {
      // Auto-migrate to secure storage first
      autoMigrateOnStartup();
      
      initializeModules().then(() => {
        setModulesInitialized(true);
        console.log('🎯 Module system initialized with gesture UI');
      }).catch(error => {
        console.error('🎯 Module system initialization failed:', error);
      });
    }
  }, [initialized, modulesInitialized]);

  // Show project selector if no current project
  useEffect(() => {
    if (initialized && !currentProjectId) {
      setShowProjectSelector(true);
    }
  }, [initialized, currentProjectId]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + P to open project selector
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setShowProjectSelector(true);
      }
      
      // Ctrl/Cmd + K for command palette (future)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        console.log('🎯 Command palette shortcut (future implementation)');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize routing synchronization
  useEffect(() => {
    // Default to scriptorium if no module is selected
    if (!currentModule) {
      navigateToModule('scriptorium');
    }
  }, [currentModule, navigateToModule]);

  return (
    <MigrationManager>
      <GestureLayout onOpenProjectSelector={() => setShowProjectSelector(true)}>
        {/* Project Selector Modal */}
        <ProjectSelector
          isOpen={showProjectSelector}
          onClose={() => setShowProjectSelector(false)}
        />
        
        {/* Main Routes */}
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/scriptorium" replace />} />
          
          {/* Main modules */}
          <Route path="/scriptorium" element={<CreativeAtelier />} />
          <Route path="/atelier" element={<CreativeAtelier />} />
          <Route path="/canvas" element={<CreativeAtelier />} />
          <Route path="/start" element={<ProjectStart />} />
          <Route path="/mind-garden" element={<MindGarden />} />
          <Route path="/tracker" element={<ProjectTracker />} />
          <Route path="/business" element={<BusinessSwitcher />} />
          <Route path="/orchestra" element={<Orchestra />} />
          <Route path="/content-studio" element={<Orchestra />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/roadmap" element={<Ideas />} />
          <Route path="/commercial-ideas" element={<Ideas />} />
          
          {/* Development & Admin Routes */}
          <Route path="/module-demo" element={<ModuleSystemDemo />} />
          <Route path="/error-demo" element={<ErrorTrackingDemo />} />
          <Route path="/monitoring" element={<EventMonitoringDashboard />} />
          <Route path="/tests" element={<IntegrationTestDashboard />} />
          <Route path="/alerts" element={<AlertingConfigurationUI />} />
          <Route path="/routine" element={<RoutineAgentDashboard />} />
          <Route path="/intelligence" element={<IntelligenceSystemDashboard />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/recovery" element={<RecoveryTestDashboard />} />
          <Route path="/alerts-mgmt" element={<AlertManagementDashboard />} />
          <Route path="/crypto-migration" element={<CryptoMigrationDashboard />} />
          <Route path="/wip-protection" element={<WIPProtectionDashboard />} />
          <Route path="/audit-logs" element={<AuditLogsDashboard />} />
          <Route path="/ai-transparency" element={<AITransparencyDashboard />} />
        </Routes>
        
        {/* Security Status (Development Only) */}
        <SecurityStatus />
        
        {/* Alert Notifications System */}
        <AlertNotifications />
        
        {/* WIP Protection Indicator */}
        <WIPProtectionIndicator />
      </GestureLayout>
    </MigrationManager>
  );
}

export default AppGesture;