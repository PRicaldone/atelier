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

// Navigation sync component
function NavigationSync() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentModule } = useUnifiedStore();
  
  useEffect(() => {
    // Map unified store modules to routes
    const moduleToRoute = {
      'canvas': '/canvas',
      'unified-store-test': '/unified-store',
      'mind-garden': '/start', // Temporary mapping
      'projects': '/tracker'   // Temporary mapping
    };
    
    const targetRoute = moduleToRoute[currentModule];
    if (targetRoute && location.pathname !== targetRoute) {
      navigate(targetRoute);
    }
  }, [currentModule, navigate, location.pathname]);
  
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
        <Route path="/unified-store" element={<UnifiedStoreTest />} />
      </Routes>
    </Layout>
  )
}

export default App
