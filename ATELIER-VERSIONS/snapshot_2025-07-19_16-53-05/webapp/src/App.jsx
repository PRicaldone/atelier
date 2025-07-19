import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Layout } from './components/layout'
import { useUnifiedStore } from './store/unifiedStore'
import { useProjectStore } from './store/projectStore'
import ProjectSelector from './components/ProjectSelector'
import MigrationManager from './components/MigrationManager'
import { 
  CreativeAtelier, 
  ProjectStart, 
  ProjectTracker, 
  BusinessSwitcher,
  UnifiedStoreTest,
  MindGarden,
  Orchestra,
  Ideas
} from './modules'
import UnifiedStoreTestSimple from './modules/unified-store-test/UnifiedStoreTestSimple'
import { initializeModules } from './modules/shared/moduleInit'
import ModuleSystemDemo from './components/ModuleSystemDemo'
import ErrorTrackingDemo from './components/ErrorTrackingDemo'
import EventMonitoringDashboard from './components/EventMonitoringDashboard'
import IntegrationTestDashboard from './components/IntegrationTestDashboard'
import AlertingConfigurationUI from './components/AlertingConfigurationUI'
import RoutineAgentDashboard from './components/RoutineAgentDashboard'
import IntelligenceSystemDashboard from './components/IntelligenceSystemDashboard'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import SecurityStatus from './components/SecurityStatus'
import RecoveryTestDashboard from './components/RecoveryTestDashboard'
import AlertNotifications from './components/AlertNotifications'
import AlertManagementDashboard from './components/AlertManagementDashboard'
import CryptoMigrationDashboard from './components/CryptoMigrationDashboard'
import WIPProtectionIndicator from './components/WIPProtectionIndicator'
import WIPProtectionDashboard from './components/WIPProtectionDashboard'
import AuditLogsDashboard from './components/AuditLogsDashboard'
import AITransparencyDashboard from './components/AITransparencyDashboard'
import './modules/shared/analytics'  // Initialize analytics system
import './utils/alertSystem'  // Initialize alert system
import './utils/wipProtection'  // Initialize WIP protection
import './utils/auditLogger'  // Initialize audit logging
import './modules/shared/ai'  // Initialize AI system
import './utils/addMicroSubscriptionIdea'  // Add business model idea
import { autoMigrateOnStartup } from './utils/migrationSecureStorage'

// Navigation sync component - ROBUST version to prevent loops
function NavigationSync() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentModule, navigateToModule } = useUnifiedStore();
  
  // Use useRef to track if we're in a navigation cycle
  const navigationInProgress = React.useRef(false);
  
  // Route mapping
  const routeToModule = {
    '/scriptorium': 'scriptorium',
    '/atelier': 'scriptorium', // Backward compatibility
    '/canvas': 'scriptorium', // Backward compatibility
    '/unified-store': 'unified-store-test',
    '/start': 'project-start',
    '/mind-garden': 'mind-garden',
    '/tracker': 'projects',
    '/orchestra': 'orchestra',
    '/content-studio': 'orchestra', // Backward compatibility
    '/ideas': 'ideas',
    '/roadmap': 'ideas', // Backward compatibility
    '/commercial-ideas': 'ideas' // Backward compatibility
  };
  
  const moduleToRoute = {
    'scriptorium': '/scriptorium',
    'canvas': '/scriptorium', // Backward compatibility alias
    'unified-store-test': '/unified-store',
    'project-start': '/start',
    'mind-garden': '/mind-garden',
    'projects': '/tracker',
    'orchestra': '/orchestra'
  };
  
  // Only sync when there's a real mismatch and we're not already navigating
  useEffect(() => {
    console.log('🔄 NavigationSync check:', {
      pathname: location.pathname,
      currentModule,
      navigationInProgress: navigationInProgress.current
    });
    
    if (navigationInProgress.current) {
      console.log('🔄 Skipping - navigation in progress');
      return;
    }
    
    const moduleFromRoute = routeToModule[location.pathname];
    const routeFromModule = moduleToRoute[currentModule];
    
    console.log('🔄 Mappings:', { moduleFromRoute, routeFromModule });
    
    // IMPORTANT: Allow certain routes to work independently without sync
    const independentRoutes = ['/start', '/tracker', '/business'];
    const isIndependentRoute = independentRoutes.includes(location.pathname);
    
    if (isIndependentRoute) {
      console.log('🔄 Independent route - no sync needed:', location.pathname);
      return;
    }
    
    // Check if we need Store→Route sync first (button clicks)
    if (routeFromModule && location.pathname !== routeFromModule) {
      // Store changed, update route (higher priority)
      console.log('🔄 Store→Route sync:', currentModule, '→', routeFromModule);
      navigationInProgress.current = true;
      navigate(routeFromModule);
      setTimeout(() => { navigationInProgress.current = false; }, 50);
    } else if (moduleFromRoute && moduleFromRoute !== currentModule) {
      // URL changed manually, update store
      console.log('🔄 Route→Store sync:', location.pathname, '→', moduleFromRoute);
      navigationInProgress.current = true;
      navigateToModule(moduleFromRoute, { source: 'url-sync' });
      setTimeout(() => { navigationInProgress.current = false; }, 50);
    } else {
      console.log('🔄 No sync needed');
    }
  }, [location.pathname, currentModule]); // Minimal dependencies
  
  return null;
}

function App() {
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [modulesInitialized, setModulesInitialized] = useState(false);
  const { initialized, currentProjectId, initialize, projects } = useProjectStore();
  
  // Initialize project store on app load
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
        console.log('🎯 Module system initialized');
      }).catch(error => {
        console.error('🎯 Module system initialization failed:', error);
      });
    }
  }, [initialized, modulesInitialized]);
  
  // Show project selector if no current project or if explicitly requested
  useEffect(() => {
    if (initialized && !currentProjectId) {
      setShowProjectSelector(true);
    }
  }, [initialized, currentProjectId]);
  
  // Global keyboard shortcut for project selector
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + P to open project selector
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setShowProjectSelector(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <MigrationManager>
      <Layout onOpenProjectSelector={() => setShowProjectSelector(true)}>
        <NavigationSync />
        
        {/* Project Selector Modal */}
        <ProjectSelector
          isOpen={showProjectSelector}
          onClose={() => setShowProjectSelector(false)}
        />
        
        {/* Main Routes */}
        <Routes>
          <Route path="/" element={<Navigate to="/scriptorium" replace />} />
          <Route path="/scriptorium" element={<CreativeAtelier />} />
          <Route path="/atelier" element={<CreativeAtelier />} />
          <Route path="/canvas" element={<CreativeAtelier />} />
          <Route path="/start" element={<ProjectStart />} />
          <Route path="/mind-garden" element={<MindGarden />} />
          <Route path="/tracker" element={<ProjectTracker />} />
          <Route path="/business" element={<BusinessSwitcher />} />
          <Route path="/unified-store" element={<UnifiedStoreTestSimple />} />
          <Route path="/orchestra" element={<Orchestra />} />
          <Route path="/content-studio" element={<Orchestra />} />
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
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/roadmap" element={<Ideas />} />
          <Route path="/commercial-ideas" element={<Ideas />} />
        </Routes>
        
        {/* Security Status (Development Only) */}
        <SecurityStatus />
        
        {/* Alert Notifications System */}
        <AlertNotifications />
        
        {/* WIP Protection Indicator */}
        <WIPProtectionIndicator />
      </Layout>
    </MigrationManager>
  )
}

export default App
