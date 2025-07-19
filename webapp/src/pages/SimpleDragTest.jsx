/**
 * Simple Drag Test Page
 * Minimal test environment for custom drag system
 */

import React, { useState, useRef, useCallback } from 'react';

const SimpleDragTest = () => {
  console.log('🔥 SimpleDragTest component loading!');
  
  const [elements, setElements] = useState([]);
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedElement: null,
    offset: { x: 0, y: 0 }
  });

  // Component did mount
  React.useEffect(() => {
    console.log('🔥 SimpleDragTest mounted!');
    document.title = 'Simple Drag Test';
  }, []);

  // Simple drag implementation
  const handleMouseDown = useCallback((e, element) => {
    console.log('🎯 Mouse down on element:', element.id);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    setDragState({
      isDragging: true,
      draggedElement: element,
      offset
    });

    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!dragState.isDragging || !dragState.draggedElement) return;

    const newPosition = {
      x: e.clientX - dragState.offset.x,
      y: e.clientY - dragState.offset.y
    };

    setElements(prev => prev.map(el => 
      el.id === dragState.draggedElement.id 
        ? { ...el, position: newPosition }
        : el
    ));
  }, [dragState]);

  const handleMouseUp = useCallback(() => {
    console.log('🎯 Mouse up');
    setDragState({
      isDragging: false,
      draggedElement: null,
      offset: { x: 0, y: 0 }
    });
  }, []);

  // Global mouse events
  React.useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  // Create test element
  const createTestElement = useCallback((type) => {
    const newElement = {
      id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type || 'note',
      position: {
        x: 100 + Math.random() * 400,
        y: 100 + Math.random() * 300
      },
      data: {
        content: `Test ${type} - Drag me!`
      }
    };
    
    console.log('🎯 Creating test element:', newElement.id, newElement.type);
    setElements(prev => [...prev, newElement]);
    
    return newElement;
  }, []);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#f5f5f5',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 99999,
      overflow: 'hidden'
    }}>
      {/* Visible indicator */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'red',
        color: 'white',
        padding: '20px',
        fontSize: '24px',
        fontWeight: 'bold',
        zIndex: 100000,
        border: '5px solid black'
      }}>
        SIMPLE DRAG TEST PAGE LOADED!
      </div>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderBottom: '1px solid #ddd',
        padding: '16px',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
            Simple Drag Test
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
            Basic drag system test
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => createTestElement('note')}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            + Note
          </button>
          <button
            onClick={() => createTestElement('board')}
            style={{
              padding: '8px 16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            + Board
          </button>
          <button
            onClick={() => createTestElement('link')}
            style={{
              padding: '8px 16px',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            + Link
          </button>
          <button
            onClick={() => setElements([])}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Clear
          </button>
        </div>
      </div>
      
      {/* Stats */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '16px',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '12px',
        zIndex: 40,
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        <div>Elements: {elements.length}</div>
        <div>Dragging: {dragState.isDragging ? 'Yes' : 'No'}</div>
        <div>Dragged: {dragState.draggedElement?.id || 'None'}</div>
      </div>
      
      {/* Canvas */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}>
        {elements.map(element => (
          <div
            key={element.id}
            onMouseDown={(e) => handleMouseDown(e, element)}
            style={{
              position: 'absolute',
              left: element.position.x,
              top: element.position.y,
              width: '200px',
              height: '120px',
              background: element.type === 'note' ? '#fef3c7' : 
                         element.type === 'board' ? '#d1fae5' : '#e0e7ff',
              border: '2px solid',
              borderColor: element.type === 'note' ? '#f59e0b' : 
                          element.type === 'board' ? '#10b981' : '#8b5cf6',
              borderRadius: '8px',
              padding: '12px',
              cursor: dragState.isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              boxShadow: dragState.draggedElement?.id === element.id ? 
                        '0 8px 25px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
              transform: dragState.draggedElement?.id === element.id ? 'scale(1.05)' : 'scale(1)',
              transition: dragState.isDragging ? 'none' : 'transform 0.2s, box-shadow 0.2s',
              zIndex: dragState.draggedElement?.id === element.id ? 1000 : 1
            }}
          >
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: '#333'
            }}>
              {element.type.charAt(0).toUpperCase() + element.type.slice(1)}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#666' 
            }}>
              {element.data.content}
            </div>
            <div style={{ 
              fontSize: '10px', 
              color: '#999', 
              marginTop: '8px' 
            }}>
              ID: {element.id.split('-').pop()}
            </div>
          </div>
        ))}
      </div>
      
      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '12px',
        zIndex: 40,
        maxWidth: '300px'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
          Instructions:
        </h3>
        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px' }}>
          <li>Click buttons to create elements</li>
          <li>Drag elements to move them</li>
          <li>Check console for debug logs</li>
          <li>Elements should follow mouse smoothly</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleDragTest;