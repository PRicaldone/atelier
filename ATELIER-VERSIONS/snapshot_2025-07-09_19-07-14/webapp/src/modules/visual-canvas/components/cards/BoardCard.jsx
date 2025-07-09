import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCanvasStore } from '../../store.js';
import { Layout, ChevronDown, ChevronRight, Plus, Edit3 } from 'lucide-react';

export const BoardCard = ({ element }) => {
  const { updateElement } = useCanvasStore();
  const [isEditing, setIsEditing] = useState(element.editing || false);
  const [collapsed, setCollapsed] = useState(element.data.collapsed || false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (isEditing && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isEditing]);

  const handleTitleChange = (e) => {
    updateElement(element.id, {
      data: { ...element.data, title: e.target.value }
    });
  };

  const handleTitleSubmit = () => {
    setIsEditing(false);
    updateElement(element.id, { editing: false });
  };

  const toggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    updateElement(element.id, {
      data: { ...element.data, collapsed: newCollapsed }
    });
  };

  const addElementToBoard = () => {
    // This would add a child element to the board
    console.log('Add element to board:', element.id);
  };

  return (
    <div 
      className="h-full w-full bg-white border-2 rounded-lg shadow-sm overflow-hidden"
      style={{ 
        backgroundColor: element.data.backgroundColor,
        borderColor: element.data.borderColor
      }}
    >
      {/* Board Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
        <div className="flex items-center space-x-2 flex-1">
          <button
            onClick={toggleCollapse}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <Layout size={16} className="text-indigo-600" />
          
          {isEditing ? (
            <input
              ref={titleRef}
              type="text"
              value={element.data.title}
              onChange={handleTitleChange}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  updateElement(element.id, { editing: false });
                }
              }}
              className="flex-1 text-sm font-medium bg-transparent border-none outline-none"
              placeholder="Board title..."
            />
          ) : (
            <h3 
              className="flex-1 text-sm font-medium text-gray-900 cursor-text"
              onClick={() => setIsEditing(true)}
            >
              {element.data.title}
            </h3>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
            title="Edit board title"
          >
            <Edit3 size={14} />
          </button>
          
          <button
            onClick={addElementToBoard}
            className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Add element to board"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Board Content */}
      {!collapsed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="p-4"
        >
          {element.data.description ? (
            <p className="text-xs text-gray-600 mb-3">
              {element.data.description}
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic mb-3">
              Click to add description...
            </p>
          )}

          {/* Board content area */}
          <div 
            className="min-h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
          >
            <div className="text-center">
              <Layout size={24} className="text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">
                Drop elements here or click + to add
              </p>
            </div>
          </div>

          {/* Board stats */}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>{element.data.elements?.length || 0} elements</span>
            <span>Board • {element.id.split('_')[1]}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};