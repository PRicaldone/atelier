import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout'
import { 
  VisualCanvas, 
  ProjectStart, 
  ProjectTracker, 
  BusinessSwitcher 
} from './modules'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/canvas" replace />} />
        <Route path="/canvas" element={<VisualCanvas />} />
        <Route path="/start" element={<ProjectStart />} />
        <Route path="/tracker" element={<ProjectTracker />} />
        <Route path="/business" element={<BusinessSwitcher />} />
      </Routes>
    </Layout>
  )
}

export default App
