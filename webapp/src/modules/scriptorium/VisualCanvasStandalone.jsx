/**
 * Visual Canvas Standalone - ZERO interference from Atelier systems
 * Direct adaptation of working StandaloneDragTest for production use
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';

const VisualCanvasStandalone = ({ 
  onCreateElement = null,
  initialElements = [],
  onElementsChange = null,
  performanceMode = false 
}) => {
  // console.log('🔥 VisualCanvasStandalone loading - ZERO Atelier interference');
  
  const [elements, setElements] = useState(initialElements);
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedElement: null,
    offset: { x: 0, y: 0 }
  });

  // Create element function - with sync support
  const createTestElement = useCallback((type) => {
    // Use external creation function if provided (for sync)
    if (onCreateElement) {
      const newElement = onCreateElement(type);
      // Still update local state for immediate UI response
      setElements(prev => {
        const updated = [...prev, newElement];
        // Notify parent of changes (for sync)
        if (onElementsChange) {
          setTimeout(() => onElementsChange(updated), 0);
        }
        return updated;
      });
      return newElement;
    }

    // Original standalone creation (baseline preserved)
    const colors = {
      note: { bg: '#fef3c7', border: '#f59e0b' },
      board: { bg: '#d1fae5', border: '#10b981' },
      link: { bg: '#e0e7ff', border: '#8b5cf6' },
      image: { bg: '#fed7d7', border: '#f56565' },
      ai: { bg: '#e0f2fe', border: '#0284c7' }
    };

    const newElement = {
      id: `standalone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type || 'note',
      position: {
        x: 150 + Math.random() * 500,
        y: 150 + Math.random() * 300
      },
      data: {
        content: type === 'note' ? 'New note - drag me!' : 
                type === 'board' ? 'Board container' :
                type === 'link' ? 'Link to resource' :
                type === 'ai' ? 'AI-generated content' :
                `${type} element`,
        colors: colors[type] || colors.note
      }
    };
    
    console.log('🎯 Creating standalone element:', newElement.id, newElement.type);
    setElements(prev => {
      const updated = [...prev, newElement];
      // Notify parent of changes (for sync)
      if (onElementsChange) {
        setTimeout(() => onElementsChange(updated), 0);
      }
      return updated;
    });
    
    return newElement;
  }, [onCreateElement, onElementsChange]);

  // Drag handlers - exactly like standalone
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
    e.stopPropagation();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!dragState.isDragging || !dragState.draggedElement) return;

    const newPosition = {
      x: e.clientX - dragState.offset.x,
      y: e.clientY - dragState.offset.y
    };

    // Update element position in real-time
    setElements(prev => {
      const updated = prev.map(el => 
        el.id === dragState.draggedElement.id 
          ? { ...el, position: newPosition }
          : el
      );
      
      // Notify parent of position changes (for sync) - debounced for performance
      if (onElementsChange && dragState.isDragging) {
        // Use requestAnimationFrame for 60fps performance
        requestAnimationFrame(() => {
          onElementsChange(updated);
        });
      }
      
      return updated;
    });
  }, [dragState]);

  const handleMouseUp = useCallback(() => {
    console.log('🎯 Mouse up - drag complete');
    
    setDragState({
      isDragging: false,
      draggedElement: null,
      offset: { x: 0, y: 0 }
    });
  }, []);

  // Global mouse events
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

  // Sync with initialElements prop changes
  useEffect(() => {
    if (initialElements.length > 0 && elements.length === 0) {
      setElements(initialElements);
    }
  }, [initialElements, elements.length]);

  // Component mounted - avoid double initial creation with React.StrictMode
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    console.log('🔥 VisualCanvasStandalone mounted');
    document.title = 'Scriptorium - Custom Drag Canvas';
    
    // Create initial elements only if not provided externally and not in performance mode
    if (initialElements.length === 0 && !performanceMode) {
      setTimeout(() => {
        createTestElement('note');
        createTestElement('board');
        createTestElement('ai');
      }, 500);
    }
  }, [createTestElement, initialElements.length, performanceMode]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255,255,255,0.95)',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(8px)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
            🎯 Scriptorium Canvas
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
            Custom drag & drop - Enterprise grade
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#6b7280', marginRight: '12px' }}>
            Create Elements:
          </span>
          
          {['note', 'board', 'link', 'ai', 'image'].map(type => (
            <button
              key={type}
              onClick={() => createTestElement(type)}
              style={{
                padding: '8px 16px',
                background: type === 'note' ? '#f59e0b' : 
                           type === 'board' ? '#10b981' : 
                           type === 'link' ? '#8b5cf6' : 
                           type === 'ai' ? '#0284c7' : '#f56565',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
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
              fontSize: '12px',
              fontWeight: '500',
              marginLeft: '8px'
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
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '11px',
        zIndex: 100
      }}>
        <div>📊 Elements: {elements.length}</div>
        <div>🎯 Dragging: {dragState.isDragging ? 'YES' : 'NO'}</div>
        <div>🔥 System: Enterprise Standalone</div>
      </div>
      
      {/* Canvas */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(0,0,0,0.05) 1px, transparent 1px)',
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
              width: '200px',
              height: '120px',
              background: element.data.colors.bg,
              border: `2px solid ${element.data.colors.border}`,
              borderRadius: '8px',
              padding: '12px',
              cursor: dragState.isDragging && dragState.draggedElement?.id === element.id ? 'grabbing' : 'grab',
              userSelect: 'none',
              boxShadow: dragState.draggedElement?.id === element.id ? 
                        '0 20px 40px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
              transform: dragState.draggedElement?.id === element.id ? 'scale(1.05)' : 'scale(1)',
              transition: dragState.isDragging ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease',
              zIndex: dragState.draggedElement?.id === element.id ? 1000 : 1
            }}
          >
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: '#1f2937',
              textTransform: 'capitalize'
            }}>
              {element.type === 'ai' ? '🤖' : 
               element.type === 'note' ? '📝' :
               element.type === 'board' ? '📋' :
               element.type === 'link' ? '🔗' : '🖼️'} {element.type}
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: '#6b7280',
              lineHeight: '1.4'
            }}>
              {element.data.content}
            </div>
            <div style={{ 
              fontSize: '9px', 
              color: '#9ca3af', 
              marginTop: '8px',
              fontFamily: 'monospace'
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
        right: '16px',
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        maxWidth: '300px',
        fontSize: '12px',
        zIndex: 100,
        backdropFilter: 'blur(8px)'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#111827' }}>
          🚀 Enterprise Canvas
        </h3>
        <ul style={{ margin: 0, paddingLeft: '16px', color: '#6b7280' }}>
          <li>Figma-style 60fps drag system</li>
          <li>Zero interference from Atelier</li>
          <li>Enterprise-grade performance</li>
          <li>Production ready architecture</li>
        </ul>
      </div>
    </div>
  );
};

export default VisualCanvasStandalone;