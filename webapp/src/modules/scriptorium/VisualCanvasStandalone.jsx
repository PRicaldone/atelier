/**
 * Visual Canvas Standalone - ZERO interference from Atelier systems
 * Direct adaptation of working StandaloneDragTest for production use
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import RectangleSelection from './components/RectangleSelection.jsx';

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
  
  // 🚀 TRINITY AMPLIFIER: Rectangle Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);

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

  // 🚀 TRINITY AMPLIFIER: Selection handlers
  const handleSelectionChange = useCallback((newSelectedIds) => {
    console.log('🔲 Selection changed:', newSelectedIds.length, 'elements');
    setSelectedIds(newSelectedIds);
  }, []);

  const selectElement = useCallback((elementId, addToSelection = false) => {
    setSelectedIds(prev => {
      if (addToSelection) {
        return prev.includes(elementId) 
          ? prev.filter(id => id !== elementId)
          : [...prev, elementId];
      } else {
        return [elementId];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Enhanced drag handlers with selection support
  const handleMouseDown = useCallback((e, element) => {
    console.log('🎯 Mouse down on element:', element.id);
    
    // Handle selection on click
    if (e.ctrlKey || e.metaKey) {
      // Multi-select mode
      selectElement(element.id, true);
      return;
    } else if (!selectedIds.includes(element.id)) {
      // Single select if not already selected
      selectElement(element.id, false);
    }
    
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
  }, [selectedIds, selectElement]);

  const handleMouseMove = useCallback((e) => {
    if (!dragState.isDragging || !dragState.draggedElement) return;

    const newPosition = {
      x: e.clientX - dragState.offset.x,
      y: e.clientY - dragState.offset.y
    };

    // Calculate delta for multi-element dragging
    const delta = {
      x: newPosition.x - dragState.draggedElement.position.x,
      y: newPosition.y - dragState.draggedElement.position.y
    };

    // Update element position in real-time - support multi-selection
    setElements(prev => {
      const elementsToMove = selectedIds.length > 1 && selectedIds.includes(dragState.draggedElement.id) 
        ? selectedIds 
        : [dragState.draggedElement.id];

      const updated = prev.map(el => {
        if (elementsToMove.includes(el.id)) {
          return {
            ...el,
            position: {
              x: el.position.x + delta.x,
              y: el.position.y + delta.y
            }
          };
        }
        return el;
      });
      
      // Notify parent of position changes (for sync) - debounced for performance
      if (onElementsChange && dragState.isDragging) {
        // Use requestAnimationFrame for 60fps performance
        requestAnimationFrame(() => {
          onElementsChange(updated);
        });
      }
      
      return updated;
    });

    // Update dragged element position for next frame calculation
    setDragState(prev => ({
      ...prev,
      draggedElement: {
        ...prev.draggedElement,
        position: newPosition
      }
    }));
  }, [dragState, selectedIds, onElementsChange]);

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
          
          {/* 🚀 TRINITY AMPLIFIER: Selection Controls */}
          <div style={{ 
            marginLeft: '16px', 
            paddingLeft: '16px', 
            borderLeft: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              Selected: {selectedIds.length}
            </span>
            {selectedIds.length > 0 && (
              <button
                onClick={clearSelection}
                style={{
                  padding: '4px 8px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: '500'
                }}
              >
                Clear Selection
              </button>
            )}
          </div>
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
        <div>🔲 Selected: {selectedIds.length}</div>
        <div>🔥 System: Enterprise + Rectangle Selection</div>
      </div>
      
      {/* Canvas */}
      <div 
        id="canvas-container"
        style={{
          position: 'absolute',
          top: '80px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          overflow: 'hidden'
        }}
        onMouseDown={(e) => {
          // Clear selection when clicking on empty canvas (unless Ctrl/Cmd held)
          if (e.target.id === 'canvas-container' && !e.ctrlKey && !e.metaKey) {
            clearSelection();
          }
        }}
      >
        {/* 🚀 TRINITY AMPLIFIER: Rectangle Selection */}
        <RectangleSelection 
          onSelectionChange={handleSelectionChange}
          disabled={dragState.isDragging}
          elements={elements}
          selectedIds={selectedIds}
          viewport={{ x: 0, y: 0, zoom: 1 }}
        />
        
        {elements.map(element => {
          const isSelected = selectedIds.includes(element.id);
          const isDragged = dragState.draggedElement?.id === element.id;
          
          return (
            <div
              key={element.id}
              data-element-id={element.id}
              onMouseDown={(e) => handleMouseDown(e, element)}
              className={isSelected && !isDragged ? 'element-selected-multi' : ''}
              style={{
                position: 'absolute',
                left: element.position.x,
                top: element.position.y,
                width: '200px',
                height: '120px',
                background: element.data.colors.bg,
                border: `2px solid ${isSelected ? '#10b981' : element.data.colors.border}`,
                borderRadius: '8px',
                padding: '12px',
                cursor: isDragged ? 'grabbing' : 'grab',
                userSelect: 'none',
                boxShadow: isDragged ? 
                          '0 20px 40px rgba(0,0,0,0.3)' : 
                          isSelected ? 
                          '0 0 0 2px #10b981, 0 0 12px rgba(16, 185, 129, 0.4)' :
                          '0 4px 12px rgba(0,0,0,0.1)',
                transform: isDragged ? 'scale(1.05)' : 'scale(1)',
                transition: dragState.isDragging ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease',
                zIndex: isDragged ? 1000 : isSelected ? 200 : 1
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
        maxWidth: '320px',
        fontSize: '12px',
        zIndex: 100,
        backdropFilter: 'blur(8px)'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#111827' }}>
          🚀 Enterprise Canvas + Rectangle Selection
        </h3>
        <ul style={{ margin: 0, paddingLeft: '16px', color: '#6b7280', lineHeight: '1.4' }}>
          <li><strong>Drag:</strong> 60fps multi-element dragging</li>
          <li><strong>Select:</strong> Click element (Ctrl/Cmd for multi)</li>
          <li><strong>Rectangle:</strong> Drag on empty area</li>
          <li><strong>Modes:</strong> Shift=Contain, Alt=Center</li>
          <li><strong>Performance:</strong> Professional grade</li>
        </ul>
        <div style={{ 
          marginTop: '8px', 
          padding: '4px 8px', 
          background: '#f3f4f6', 
          borderRadius: '4px',
          fontSize: '10px',
          color: '#6b7280'
        }}>
          🎯 TRINITY AMPLIFIER: Rectangle Multi-Selection
        </div>
      </div>
    </div>
  );
};

export default VisualCanvasStandalone;