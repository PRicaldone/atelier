/**
 * React DnD POC Demo
 * Test nested boards and drag & drop functionality
 */

import React, { useState } from 'react';
import BoardDnDContext from './BoardDnDContext';
import { DraggableBoard } from './DraggableBoard';
import { DraggableElement } from './DraggableElement';
import DragPreviewLayer from './DragPreviewLayer';

export default function ReactDnDDemo() {
  // Mock data structure with nested boards
  const [boards, setBoards] = useState({
    'board-1': {
      id: 'board-1',
      type: 'board',
      parentId: null,
      position: { x: 50, y: 50 },
      size: { width: 400, height: 300 },
      data: {
        title: 'Main Board',
        backgroundColor: 'bg-purple-50',
        elements: ['element-1', 'element-2', 'board-2']
      }
    },
    'board-2': {
      id: 'board-2',
      type: 'board',
      parentId: 'board-1',
      position: { x: 20, y: 100 },
      size: { width: 350, height: 200 },
      data: {
        title: 'Nested Board',
        backgroundColor: 'bg-blue-50',
        elements: ['element-3']
      }
    },
    'board-3': {
      id: 'board-3',
      type: 'board',
      parentId: null,
      position: { x: 500, y: 50 },
      size: { width: 350, height: 250 },
      data: {
        title: 'Another Board',
        backgroundColor: 'bg-green-50',
        elements: []
      }
    }
  });

  const [elements, setElements] = useState({
    'element-1': {
      id: 'element-1',
      type: 'note',
      data: { title: 'Note 1', content: 'This is a draggable note' },
      size: { width: 200 }
    },
    'element-2': {
      id: 'element-2',
      type: 'image',
      data: { src: 'https://via.placeholder.com/200x150', alt: 'Sample' },
      size: { width: 200 }
    },
    'element-3': {
      id: 'element-3',
      type: 'link',
      data: { title: 'Atelier Docs', url: 'https://atelier.dev' },
      size: { width: 200 }
    }
  });

  // Handle dropping items into boards
  const handleDropItem = (item, targetBoardId) => {
    console.log('🎯 Dropping', item.type, item.id, 'into board', targetBoardId);

    if (item.type === 'board') {
      // Moving a board into another board
      setBoards(prev => {
        const updatedBoards = { ...prev };
        const movedBoard = updatedBoards[item.id];
        const oldParent = item.originalParent;
        
        // Remove from old parent if it had one
        if (oldParent && updatedBoards[oldParent]) {
          updatedBoards[oldParent] = {
            ...updatedBoards[oldParent],
            data: {
              ...updatedBoards[oldParent].data,
              elements: updatedBoards[oldParent].data.elements.filter(id => id !== item.id)
            }
          };
        }
        
        // Add to new parent
        updatedBoards[targetBoardId] = {
          ...updatedBoards[targetBoardId],
          data: {
            ...updatedBoards[targetBoardId].data,
            elements: [...(updatedBoards[targetBoardId].data.elements || []), item.id]
          }
        };
        
        // Update the moved board's parent
        updatedBoards[item.id] = {
          ...movedBoard,
          parentId: targetBoardId
        };
        
        return updatedBoards;
      });
    } else if (item.type === 'element') {
      // Moving an element between boards
      setBoards(prev => {
        const updatedBoards = { ...prev };
        const oldParent = item.originalParent;
        
        // Remove from old parent
        if (oldParent && updatedBoards[oldParent]) {
          updatedBoards[oldParent] = {
            ...updatedBoards[oldParent],
            data: {
              ...updatedBoards[oldParent].data,
              elements: updatedBoards[oldParent].data.elements.filter(id => id !== item.id)
            }
          };
        }
        
        // Add to new parent
        updatedBoards[targetBoardId] = {
          ...updatedBoards[targetBoardId],
          data: {
            ...updatedBoards[targetBoardId].data,
            elements: [...(updatedBoards[targetBoardId].data.elements || []), item.id]
          }
        };
        
        return updatedBoards;
      });
    }
  };

  // Render board with its children recursively
  const renderBoard = (boardId) => {
    const board = boards[boardId];
    if (!board) return null;

    return (
      <DraggableBoard
        key={board.id}
        board={board}
        onDropItem={handleDropItem}
      >
        {board.data.elements?.map(childId => {
          if (boards[childId]) {
            // It's a nested board
            return renderBoard(childId);
          } else if (elements[childId]) {
            // It's an element
            return (
              <DraggableElement
                key={childId}
                element={elements[childId]}
                parentBoardId={boardId}
              />
            );
          }
          return null;
        })}
      </DraggableBoard>
    );
  };

  // Get root boards (no parent)
  const rootBoards = Object.values(boards).filter(b => !b.parentId);

  return (
    <BoardDnDContext>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
            React DnD POC - Nested Boards
          </h1>
          
          <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li>Drag elements between boards</li>
              <li>Drag boards into other boards to nest them</li>
              <li>Blue highlight shows valid drop zones</li>
              <li>Elements and boards show custom drag preview</li>
            </ul>
          </div>

          {/* Canvas area */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 min-h-[600px]">
            <div className="flex gap-8 flex-wrap">
              {rootBoards.map(board => (
                <div key={board.id} style={{ 
                  position: 'absolute',
                  left: board.position.x,
                  top: board.position.y
                }}>
                  {renderBoard(board.id)}
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Drag Preview Layer */}
          <DragPreviewLayer
            renderPreview={({ item, itemType }) => {
              if (itemType === 'board' && boards[item.id]) {
                const board = boards[item.id];
                return (
                  <div 
                    className="shadow-2xl opacity-90 transform scale-105"
                    style={{ 
                      pointerEvents: 'none',
                      cursor: 'grabbing'
                    }}
                  >
                    <DraggableBoard 
                      board={board} 
                      onDropItem={() => {}} 
                      onMoveBoard={() => {}}
                    >
                      {/* Empty for preview */}
                    </DraggableBoard>
                  </div>
                );
              }
              
              if (itemType === 'element' && elements[item.id]) {
                const element = elements[item.id];
                return (
                  <div 
                    className="shadow-2xl opacity-90 transform scale-105"
                    style={{ 
                      pointerEvents: 'none',
                      cursor: 'grabbing'
                    }}
                  >
                    <DraggableElement 
                      element={element} 
                      parentBoardId={null}
                    />
                  </div>
                );
              }
              
              return null;
            }}
          />
        </div>
      </div>
    </BoardDnDContext>
  );
}