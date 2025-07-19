import { motion } from 'framer-motion';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useCanvasStore } from '../store.js';
import { BoardCard } from './cards/BoardCard.jsx';
import { NoteCard } from './cards/NoteCard.jsx';
import { ImageCard } from './cards/ImageCard.jsx';
import { LinkCard } from './cards/LinkCard.jsx';
import { AICard } from './cards/AICard.jsx';
import FileOpenerNode from './FileOpenerNode.jsx';
import URLLauncherNode from './URLLauncherNode.jsx';
import { ELEMENT_TYPES } from '../types.js';
import { generateContextualNodes, createNodesFromSuggestions } from '../utils/contextAwareCreation.js';
import { generateIntelligentContent, generateSmartTitle } from '../utils/contentGeneration.js';

export const DraggableElement = ({ element }) => {
  const { selectElement, updateElement, navigateToBoard, addElement, elements } = useCanvasStore();
  
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging
  } = useDraggable({
    id: element.id,
    data: element
  });

  // Droppable hook for boards
  const {
    isOver,
    setNodeRef: setDroppableRef,
    active
  } = useDroppable({
    id: `board-drop-${element.id}`,
    data: {
      boardId: element.id,
      type: 'board-drop-zone'
    },
    disabled: element.type !== ELEMENT_TYPES.BOARD
  });

  // Combine refs for boards
  const setNodeRef = (node) => {
    setDraggableRef(node);
    if (element.type === ELEMENT_TYPES.BOARD) {
      setDroppableRef(node);
    }
  };

  // Check if can drop on this board
  const canDrop = element.type === ELEMENT_TYPES.BOARD && 
                  active && 
                  active.id !== element.id;  // Can drop anything except itself
  const isDropping = isOver && canDrop;

  const style = {
    // No transform here - handled by DragOverlay
    zIndex: isDragging ? 9999 : element.zIndex,
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  const handleClick = (e) => {
    e.stopPropagation();
    selectElement(element.id, e.metaKey || e.ctrlKey);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (element.type === ELEMENT_TYPES.NOTE) {
      // Enable text editing mode for notes
      updateElement(element.id, { editing: true });
    } else if (element.type === ELEMENT_TYPES.BOARD) {
      // Enter board on double-click using smart navigation
      console.log('🖱️ Double-click navigation to board:', element.id);
      navigateToBoard(element.id);
    }
  };

  // Handle intelligent agentic actions
  const handleAgenticAction = (action, data) => {
    console.log('🤖 Agentic action received:', action, data);
    
    switch (action) {
      case 'file-analyzed':
        console.log('📁 File analyzed:', data.fileName, data.analysis);
        
        // Generate contextual node suggestions
        if (data.analysis && data.analysis.confidence > 0.7) {
          const suggestions = generateContextualNodes(
            data.analysis, 
            element.position, 
            elements
          );
          
          console.log('💡 Generated suggestions:', suggestions);
          
          // Auto-create high-confidence suggestions
          if (suggestions.length > 0) {
            setTimeout(() => {
              const createdNodes = createNodesFromSuggestions(suggestions.slice(0, 2), addElement);
              console.log('✨ Auto-created nodes:', createdNodes);
            }, 1000);
          }
        }
        break;
        
      case 'execute-suggestion':
        console.log('💡 Executing suggestion:', data.suggestion);
        
        // Handle specific suggestion types with intelligent content
        switch (data.suggestion.type) {
          case 'PROJECT_SETUP':
            // Create project board structure with intelligent content
            const smartTitle = generateSmartTitle(data.analysis.contentType, 'PROJECT_SETUP', data.fileName);
            const projectBoard = addElement(ELEMENT_TYPES.BOARD, {
              x: element.position.x + 320,
              y: element.position.y
            }, {
              title: smartTitle,
              backgroundColor: '#E3F2FD',
              description: `Auto-generated project structure from ${data.fileName} analysis`
            });
            
            // Add requirements note inside the board
            setTimeout(() => {
              const requirementsContent = generateIntelligentContent(
                data.analysis.contentType, 
                'requirements', 
                data.fileName, 
                data.analysis
              );
              
              addElement(ELEMENT_TYPES.NOTE, {
                x: element.position.x + 340,
                y: element.position.y + 60
              }, {
                title: 'Requirements',
                content: requirementsContent,
                backgroundColor: '#FFF9C4'
              });
            }, 300);
            break;
            
          case 'COLOR_PALETTE':
            // Create color palette note with extracted colors
            const colorContent = generateIntelligentContent(
              data.analysis.contentType, 
              'COLOR_PALETTE', 
              data.fileName, 
              data.analysis
            );
            const colorNote = addElement(ELEMENT_TYPES.NOTE, {
              x: element.position.x + 320,
              y: element.position.y + 160
            }, {
              title: generateSmartTitle(data.analysis.contentType, 'COLOR_PALETTE', data.fileName),
              content: colorContent,
              backgroundColor: '#F3E5F5'
            });
            break;
            
          case 'TIMELINE':
            // Create timeline note with project phases
            const timelineContent = generateIntelligentContent(
              data.analysis.contentType, 
              'TIMELINE', 
              data.fileName, 
              data.analysis
            );
            const timelineNote = addElement(ELEMENT_TYPES.NOTE, {
              x: element.position.x,
              y: element.position.y + 200
            }, {
              title: generateSmartTitle(data.analysis.contentType, 'TIMELINE', data.fileName),
              content: timelineContent,
              backgroundColor: '#E8F5E9'
            });
            break;
            
          case 'STYLE_ANALYSIS':
            // Create style analysis note for images
            const styleContent = generateIntelligentContent(
              data.analysis.contentType, 
              'STYLE_ANALYSIS', 
              data.fileName, 
              data.analysis
            );
            const styleNote = addElement(ELEMENT_TYPES.NOTE, {
              x: element.position.x + 320,
              y: element.position.y
            }, {
              title: generateSmartTitle(data.analysis.contentType, 'STYLE_ANALYSIS', data.fileName),
              content: styleContent,
              backgroundColor: '#F3E5F5'
            });
            break;
            
          case 'COLOR_EXTRACTION':
            // Create color mood analysis
            const moodContent = generateIntelligentContent(
              data.analysis.contentType, 
              'colorMood', 
              data.fileName, 
              data.analysis
            );
            const moodNote = addElement(ELEMENT_TYPES.NOTE, {
              x: element.position.x + 320,
              y: element.position.y + 200
            }, {
              title: 'Color Psychology',
              content: moodContent,
              backgroundColor: '#FFE0B2'
            });
            break;
        }
        break;
        
      case 'execute-automation':
        console.log('⚡ Executing automation:', data.automation);
        
        // Handle automation workflows with intelligent content
        switch (data.automation.id) {
          case 'auto-project-setup':
            // Create complete project structure with intelligent content
            setTimeout(() => {
              const suggestions = generateContextualNodes(
                data.analysis, 
                element.position, 
                elements
              );
              
              if (suggestions.length > 0) {
                // Create nodes with intelligent content
                suggestions.forEach((suggestion, index) => {
                  setTimeout(() => {
                    const content = generateIntelligentContent(
                      data.analysis.contentType,
                      suggestion.data?.title || suggestion.type,
                      data.fileName,
                      data.analysis
                    );
                    
                    const title = generateSmartTitle(
                      data.analysis.contentType,
                      suggestion.data?.title || suggestion.type,
                      data.fileName
                    );
                    
                    const enrichedData = {
                      ...suggestion.data,
                      title: title,
                      content: suggestion.type === ELEMENT_TYPES.NOTE ? content : suggestion.data?.description || content,
                      description: suggestion.type === ELEMENT_TYPES.BOARD ? `Auto-generated from ${data.fileName}` : suggestion.data?.description
                    };
                    
                    addElement(suggestion.type, suggestion.position, enrichedData);
                  }, index * 200); // Stagger creation for visual effect
                });
              }
            }, 500);
            break;
            
          case 'auto-design-analysis':
            // Create design analysis workflow
            setTimeout(() => {
              // Color palette note
              const colorContent = generateIntelligentContent(data.analysis.contentType, 'COLOR_PALETTE', data.fileName, data.analysis);
              addElement(ELEMENT_TYPES.NOTE, {
                x: element.position.x + 320,
                y: element.position.y
              }, {
                title: 'Color Palette Analysis',
                content: colorContent,
                backgroundColor: '#F3E5F5'
              });
              
              // Typography note
              setTimeout(() => {
                const typoContent = generateIntelligentContent(data.analysis.contentType, 'typography', data.fileName, data.analysis);
                addElement(ELEMENT_TYPES.NOTE, {
                  x: element.position.x + 320,
                  y: element.position.y + 180
                }, {
                  title: 'Typography Guide',
                  content: typoContent,
                  backgroundColor: '#FFE0B2'
                });
              }, 300);
              
              // Style guide board
              setTimeout(() => {
                const styleContent = generateIntelligentContent(data.analysis.contentType, 'styleGuide', data.fileName, data.analysis);
                addElement(ELEMENT_TYPES.BOARD, {
                  x: element.position.x + 640,
                  y: element.position.y
                }, {
                  title: 'Style Guide',
                  backgroundColor: '#E8F5E9',
                  description: `Complete style guide extracted from ${data.fileName}`
                });
              }, 600);
            }, 300);
            break;
            
          case 'auto-mood-board':
            // Create mood board workflow for images
            setTimeout(() => {
              // Style analysis
              const styleContent = generateIntelligentContent(data.analysis.contentType, 'STYLE_ANALYSIS', data.fileName, data.analysis);
              addElement(ELEMENT_TYPES.BOARD, {
                x: element.position.x + 320,
                y: element.position.y
              }, {
                title: 'Style Analysis Board',
                backgroundColor: '#F3E5F5',
                description: `Visual style analysis of ${data.fileName}`
              });
              
              // Color mood analysis
              setTimeout(() => {
                const moodContent = generateIntelligentContent(data.analysis.contentType, 'colorMood', data.fileName, data.analysis);
                addElement(ELEMENT_TYPES.NOTE, {
                  x: element.position.x + 340,
                  y: element.position.y + 60
                }, {
                  title: 'Color Psychology',
                  content: moodContent,
                  backgroundColor: '#FFE0B2'
                });
              }, 400);
            }, 300);
            break;
        }
        break;
        
      default:
        console.log('🤖 Unknown agentic action:', action);
    }
  };

  const renderCard = () => {
    switch (element.type) {
      case ELEMENT_TYPES.BOARD:
        return <BoardCard element={element} />;
      case ELEMENT_TYPES.NOTE:
        return <NoteCard element={element} />;
      case ELEMENT_TYPES.IMAGE:
        return <ImageCard element={element} />;
      case ELEMENT_TYPES.LINK:
        return <LinkCard element={element} />;
      case ELEMENT_TYPES.AI:
        return <AICard element={element} />;
      case ELEMENT_TYPES.FILE_OPENER:
        return <FileOpenerNode 
          element={element} 
          onUpdate={updateElement}
          onExecute={handleAgenticAction}
        />;
      case ELEMENT_TYPES.URL_LAUNCHER:
        return <URLLauncherNode 
          element={element} 
          onUpdate={updateElement}
          onExecute={handleAgenticAction}
        />;
      default:
        return <div>Unknown element type</div>;
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...style,
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        // Allow adaptive sizing for notes with null dimensions
        ...(element.size.width !== null && { width: element.size.width }),
        ...(element.size.height !== null && { height: element.size.height }),
        transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0) rotate(${element.rotation}deg)`,
        visibility: element.visible ? 'visible' : 'hidden'
      }}
      className={`
        cursor-move select-none
        ${element.selected ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2' : ''}
        ${isDragging ? 'opacity-0' : ''}
        ${element.locked ? 'cursor-not-allowed' : 'cursor-move'}
      `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      {...listeners}
      {...attributes}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      whileHover={{ 
        scale: element.locked ? 1 : 1.02,
        transition: { duration: 0.2 }
      }}
      whileDrag={{ 
        scale: 1.05,
        rotate: element.rotation + 2,
        transition: { duration: 0.1 }
      }}
    >
      {renderCard()}
      
      {/* Drop indicator for boards */}
      {isDropping && element.type === ELEMENT_TYPES.BOARD && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute inset-0 bg-blue-500 dark:bg-blue-600 bg-opacity-20 rounded-xl border-2 border-blue-500 dark:border-blue-400 border-dashed z-50 pointer-events-none"
        />
      )}
      
      {/* Hover indicator when dragging over board */}
      {canDrop && !isDropping && element.type === ELEMENT_TYPES.BOARD && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-transparent hover:ring-blue-300 dark:hover:ring-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all z-40 pointer-events-none" />
      )}
      
      {/* Selection indicator */}
      {element.selected && (
        <motion.div
          className="absolute -inset-1 border-2 border-blue-500 dark:border-blue-400 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
      
      {/* Resize handles for selected elements */}
      {element.selected && !element.locked && (
        <>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 border border-white dark:border-gray-800 rounded-full cursor-se-resize" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 border border-white dark:border-gray-800 rounded-full cursor-ne-resize" />
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 border border-white dark:border-gray-800 rounded-full cursor-nw-resize" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 border border-white dark:border-gray-800 rounded-full cursor-sw-resize" />
        </>
      )}
      
      {/* Locked indicator */}
      {element.locked && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-gray-500 dark:bg-gray-400 text-white dark:text-gray-800 rounded-full flex items-center justify-center text-xs">
          🔒
        </div>
      )}
    </motion.div>
  );
};