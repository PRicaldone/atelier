import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Layout } from './components/layout'
import { useUnifiedStore } from './store/unifiedStore'
import { 
  VisualCanvas, 
  ProjectStart, 
  ProjectTracker, 
  BusinessSwitcher,
  UnifiedStoreTest 
} from './modules'
import UnifiedStoreTestSimple from './modules/unified-store-test/UnifiedStoreTestSimple'

// Navigation sync component
function NavigationSync() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentModule, navigateToModule } = useUnifiedStore();
  
  useEffect(() => {
    // Bidirectional sync: Route changes update store module
    const routeToModule = {
      '/canvas': 'canvas',
      '/unified-store': 'unified-store-test',
      '/start': 'mind-garden',
      '/tracker': 'projects'
    };
    
    const currentModuleFromRoute = routeToModule[location.pathname];
    if (currentModuleFromRoute && currentModuleFromRoute !== currentModule) {
      // Update store module to match current route
      navigateToModule(currentModuleFromRoute, { source: 'route-sync' });
      return; // Don't navigate if we just updated the module
    }
    
    // Store changes update route (only if different)
    const moduleToRoute = {
      'canvas': '/canvas',
      'unified-store-test': '/unified-store',
      'mind-garden': '/start',
      'projects': '/tracker'
    };
    
    const targetRoute = moduleToRoute[currentModule];
    if (targetRoute && location.pathname !== targetRoute) {
      navigate(targetRoute);
    }
  }, [currentModule, navigate, location.pathname, navigateToModule]);
  
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
        <Route path="/tracker" element={<ProjectTracker />} />
        <Route path="/business" element={<BusinessSwitcher />} />
        <Route path="/unified-store" element={<UnifiedStoreTestSimple />} />
      </Routes>
    </Layout>
  )
}

export default App
