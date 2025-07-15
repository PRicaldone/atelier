import React from 'react';
import { useMindGardenStore } from '../store';

const DebugPanel = () => {
  const { nodes, edges } = useMindGardenStore();
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: 'white',
      border: '2px solid #ddd',
      borderRadius: 8,
      padding: 16,
      zIndex: 9999,
      maxWidth: 300,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: 14 }}>🐛 Debug Panel</h3>
      <div style={{ fontSize: 12 }}>
        <div>Nodes: {nodes.length}</div>
        <div>Edges: {edges.length}</div>
        <div style={{ marginTop: 8 }}>
          <strong>Node IDs:</strong>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            {nodes.map(n => (
              <li key={n.id} style={{ 
                color: n.selected ? 'blue' : 'black',
                fontWeight: n.selected ? 'bold' : 'normal'
              }}>
                {n.id} ({n.type})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;