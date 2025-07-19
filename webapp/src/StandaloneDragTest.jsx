/**
 * Standalone Drag Test - Completely isolated from Atelier systems
 * NO imports from modules, NO GestureLayout, NO initialization systems
 */

import React, { useState, useCallback, useEffect } from 'react';

// Force override any global CSS
const globalStyles = `
  * {
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
  }
  body {
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  #root {
    width: 100vw !important;
    height: 100vh !important;
    margin: 0 !important;
    padding: 0 !important;
  }
`;

const StandaloneDragTest = () => {
  const [elements, setElements] = useState([]);
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedElement: null,
    offset: { x: 0, y: 0 },
    startPos: { x: 0, y: 0 }
  });

  console.log('🔥 StandaloneDragTest loading - NO Atelier systems');

  // Create test element
  const createTestElement = useCallback((type) => {
    const colors = {
      note: { bg: '#fef3c7', border: '#f59e0b' },
      board: { bg: '#d1fae5', border: '#10b981' },
      link: { bg: '#e0e7ff', border: '#8b5cf6' },
      image: { bg: '#fed7d7', border: '#f56565' }
    };

    const newElement = {
      id: `standalone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type || 'note',
      position: {
        x: 100 + Math.random() * 600,
        y: 150 + Math.random() * 400
      },
      data: {
        content: `Standalone ${type} - Drag me with NO interference!`,
        colors: colors[type] || colors.note
      }
    };
    
    console.log('🎯 Creating standalone element:', newElement.id, newElement.type);
    setElements(prev => [...prev, newElement]);
    
    return newElement;
  }, []);

  // Handle mouse down on element
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
      offset,
      startPos: { x: e.clientX, y: e.clientY }
    });

    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle mouse move
  const handleMouseMove = useCallback((e) => {
    if (!dragState.isDragging || !dragState.draggedElement) return;

    const newPosition = {
      x: e.clientX - dragState.offset.x,
      y: e.clientY - dragState.offset.y
    };

    // Update element position in real-time
    setElements(prev => prev.map(el => 
      el.id === dragState.draggedElement.id 
        ? { ...el, position: newPosition }
        : el
    ));
  }, [dragState]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    console.log('🎯 Mouse up - drag complete');
    
    setDragState({
      isDragging: false,
      draggedElement: null,
      offset: { x: 0, y: 0 },
      startPos: { x: 0, y: 0 }
    });
  }, []);

  // Global mouse events for dragging
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  // Component mounted
  useEffect(() => {
    console.log('🔥 StandaloneDragTest mounted - Clean environment');
    document.title = 'Standalone Drag Test';
    
    // Inject global styles to override any Atelier CSS
    const styleElement = document.createElement('style');
    styleElement.textContent = globalStyles;
    document.head.appendChild(styleElement);
    
    // Create initial test elements
    setTimeout(() => {
      createTestElement('note');
      createTestElement('board');
    }, 100);
    
    return () => {
      // Cleanup styles on unmount
      document.head.removeChild(styleElement);
    };
  }, [createTestElement]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 999999
    }}>
      {/* Success Banner */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#10b981',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        zIndex: 100
      }}>
        ✅ STANDALONE DRAG TEST - NO ATELIER INTERFERENCE!
      </div>

      {/* Header Controls */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.95)',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        zIndex: 100
      }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
          Create Elements:
        </span>
        
        {['note', 'board', 'link', 'image'].map(type => (
          <button
            key={type}
            onClick={() => createTestElement(type)}
            style={{
              padding: '8px 16px',
              background: type === 'note' ? '#f59e0b' : 
                         type === 'board' ? '#10b981' : 
                         type === 'link' ? '#8b5cf6' : '#f56565',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'transform 0.1s',
              textTransform: 'capitalize'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            + {type}
          </button>
        ))}
        
        <button
          onClick={() => setElements([])}
          style={{
            padding: '8px 16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            marginLeft: '8px'
          }}
        >
          Clear All
        </button>
      </div>
      
      {/* Stats Panel */}
      <div style={{
        position: 'absolute',
        top: '150px',
        left: '20px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 100
      }}>
        <div>Elements: {elements.length}</div>
        <div>Dragging: {dragState.isDragging ? 'YES' : 'NO'}</div>
        <div>Dragged: {dragState.draggedElement?.id?.split('-').pop() || 'None'}</div>
        <div>Performance: 60fps native</div>
      </div>
      
      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(255,255,255,0.95)',
        padding: '16px',
        borderRadius: '8px',
        maxWidth: '350px',
        fontSize: '14px',
        zIndex: 100
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#333' }}>
          🎯 Pure Drag Test
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
          <li>Click buttons to create elements</li>
          <li>Drag elements - should follow mouse PERFECTLY</li>
          <li>NO ring menu, NO Atelier interference</li>
          <li>Check console for clean logs</li>
          <li>This is how drag SHOULD work!</li>
        </ul>
      </div>

      {/* Canvas with elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2) 2px, transparent 2px)',
        backgroundSize: '40px 40px'
      }}>
        {elements.map(element => (
          <div
            key={element.id}
            onMouseDown={(e) => handleMouseDown(e, element)}
            style={{
              position: 'absolute',
              left: element.position.x,
              top: element.position.y,
              width: '220px',
              height: '140px',
              background: element.data.colors.bg,
              border: `3px solid ${element.data.colors.border}`,
              borderRadius: '12px',
              padding: '16px',
              cursor: dragState.isDragging && dragState.draggedElement?.id === element.id ? 'grabbing' : 'grab',
              userSelect: 'none',
              boxShadow: dragState.draggedElement?.id === element.id ? 
                        '0 20px 60px rgba(0,0,0,0.4)' : '0 8px 25px rgba(0,0,0,0.15)',
              transform: dragState.draggedElement?.id === element.id ? 'scale(1.05) rotate(2deg)' : 'scale(1)',
              transition: dragState.isDragging ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease',
              zIndex: dragState.draggedElement?.id === element.id ? 1000 : 1,
              backgroundColor: element.data.colors.bg
            }}
          >
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: '#333',
              textTransform: 'capitalize'
            }}>
              🎯 {element.type}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#666',
              lineHeight: '1.4'
            }}>
              {element.data.content}
            </div>
            <div style={{ 
              fontSize: '10px', 
              color: '#999', 
              marginTop: '12px',
              fontFamily: 'monospace'
            }}>
              ID: {element.id.split('-').pop()}
            </div>
          </div>
        ))}
      </div>

      {/* Drag indicator */}
      {dragState.isDragging && (
        <div style={{
          position: 'fixed',
          top: '50%',
          right: '20px',
          transform: 'translateY(-50%)',
          background: '#10b981',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 10000,
          animation: 'pulse 1s infinite'
        }}>
          🚀 DRAGGING!
        </div>
      )}
    </div>
  );
};

export default StandaloneDragTest;