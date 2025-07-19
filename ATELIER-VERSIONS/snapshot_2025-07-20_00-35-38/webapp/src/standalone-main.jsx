/**
 * Standalone Entry Point - NO Atelier systems
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import StandaloneDragTest from './StandaloneDragTest.jsx'

// NO CSS imports from Atelier
// NO store imports 
// NO system initializations
// PURE React + drag test only

console.log('🔥 Standalone entry point loading - ZERO Atelier dependencies')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StandaloneDragTest />
  </React.StrictMode>,
)

console.log('🔥 Standalone app mounted successfully')