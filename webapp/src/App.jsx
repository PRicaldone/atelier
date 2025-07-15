import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Layout } from './components/layout'
import { useUnifiedStore } from './store/unifiedStore'
import { useProjectStore } from './store/projectStore'
import ProjectSelector from './components/ProjectSelector'
import { 
  VisualCanvas, 
  ProjectStart, 
  ProjectTracker, 
  BusinessSwitcher,
  UnifiedStoreTest,
  MindGarden
} from './modules'
import UnifiedStoreTestSimple from './modules/unified-store-test/UnifiedStoreTestSimple'

// Navigation sync component - ROBUST version to prevent loops
function NavigationSync() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentModule, navigateToModule } = useUnifiedStore();
  
  // Use useRef to track if we're in a navigation cycle
  const navigationInProgress = React.useRef(false);
  
  // Route mapping
  const routeToModule = {
    '/canvas': 'canvas',
    '/unified-store': 'unified-store-test',
    '/start': 'mind-garden',
    '/mind-garden': 'mind-garden',
    '/tracker': 'projects'
  };
  
  const moduleToRoute = {
    'canvas': '/canvas',
    'unified-store-test': '/unified-store',
    'mind-garden': '/mind-garden',
    'projects': '/tracker'
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
  const { initialized, currentProjectId, initialize, projects } = useProjectStore();
  
  // Initialize project store on app load
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);
  
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
    <Layout>
      <NavigationSync />
      
      {/* Project Selector Modal */}
      <ProjectSelector
        isOpen={showProjectSelector}
        onClose={() => setShowProjectSelector(false)}
      />
      
      {/* Main Routes */}
      <Routes>
        <Route path="/" element={<Navigate to="/canvas" replace />} />
        <Route path="/canvas" element={<VisualCanvas />} />
        <Route path="/start" element={<ProjectStart />} />
        <Route path="/mind-garden" element={<MindGarden />} />
        <Route path="/tracker" element={<ProjectTracker />} />
        <Route path="/business" element={<BusinessSwitcher />} />
        <Route path="/unified-store" element={<UnifiedStoreTestSimple />} />
      </Routes>
      
      {/* Project Context Display */}
      {currentProjectId && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {projects[currentProjectId]?.name || 'Current Project'}
              </span>
              <button
                onClick={() => setShowProjectSelector(true)}
                className="text-xs text-blue-500 hover:text-blue-600 ml-2"
              >
                Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default App
