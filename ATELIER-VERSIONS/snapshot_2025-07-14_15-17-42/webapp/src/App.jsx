import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Layout } from './components/layout'
import { useUnifiedStore } from './store/unifiedStore'
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
  return (
    <Layout>
      <NavigationSync />
      <Routes>
        <Route path="/" element={<Navigate to="/canvas" replace />} />
        <Route path="/canvas" element={<VisualCanvas />} />
        <Route path="/start" element={<ProjectStart />} />
        <Route path="/mind-garden" element={<MindGarden />} />
        <Route path="/tracker" element={<ProjectTracker />} />
        <Route path="/business" element={<BusinessSwitcher />} />
        <Route path="/unified-store" element={<UnifiedStoreTestSimple />} />
      </Routes>
    </Layout>
  )
}

export default App
