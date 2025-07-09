import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCanvasStore } from '../../store.js';
import { Folder, FolderOpen, MoreHorizontal } from 'lucide-react';

export const BoardCard = ({ element }) => {
  const { updateElement } = useCanvasStore();
  const [isEditing, setIsEditing] = useState(element.editing || false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);

  useEffect(() => {
    if (isEditing && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditingDescription && descriptionRef.current) {
      descriptionRef.current.focus();
      descriptionRef.current.select();
    }
  }, [isEditingDescription]);

  const handleTitleChange = (e) => {
    updateElement(element.id, {
      data: { ...element.data, title: e.target.value }
    });
  };

  const handleTitleSubmit = () => {
    setIsEditing(false);
    updateElement(element.id, { editing: false });
  };

  const handleDescriptionChange = (e) => {
    updateElement(element.id, {
      data: { ...element.data, description: e.target.value }
    });
    
    // Auto-resize textarea as content changes
    autoResizeTextarea(e.target);
  };

  const handleDescriptionSubmit = () => {
    setIsEditingDescription(false);
  };

  // Auto-resize textarea to fit content
  const autoResizeTextarea = (textarea) => {
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set height based on content, with min and max constraints
    const minHeight = 48; // Minimum 3 rows (smaller for text-xs)
    const maxHeight = 96; // Maximum ~6 rows (smaller for text-xs)
    const newHeight = Math.max(minHeight, Math.min(maxHeight, textarea.scrollHeight));
    
    textarea.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    if (isEditingDescription && descriptionRef.current) {
      autoResizeTextarea(descriptionRef.current);
    }
  }, [isEditingDescription, element.data.description]);

  // Milanote-style pastel colors
  const getMilanoteColor = () => {
    const colors = {
      blue: '#E3F2FD',
      purple: '#F3E5F5',
      green: '#E8F5E9',
      yellow: '#FFF9C4',
      coral: '#FFE0B2',
      pink: '#FCE4EC',
      gray: '#F5F5F5'
    };
    return element.data.backgroundColor || colors.gray;
  };

  return (
    <motion.div 
      className="w-full relative group"
      style={{ 
        height: 'auto',
        minHeight: '250px' // Maintain minimum board size
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Milanote-style card */}
      <div 
        className="w-full rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
        style={{ 
          backgroundColor: getMilanoteColor(),
          border: '1px solid rgba(0,0,0,0.06)',
          height: 'auto',
          minHeight: '250px'
        }}
      >
        {/* Milanote-style minimal header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3 flex-1">
            {/* Folder icon */}
            <motion.div
              animate={{ rotate: isHovered ? 10 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isHovered ? (
                <FolderOpen size={20} className="text-gray-600" />
              ) : (
                <Folder size={20} className="text-gray-600" />
              )}
            </motion.div>
            
            {/* Title and Description Container */}
            <div className="flex-1">
              {/* Title */}
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
                  className="w-full text-base font-medium bg-transparent border-none outline-none text-gray-800"
                  placeholder="Board title..."
                />
              ) : (
                <h3 
                  className="text-base font-medium text-gray-800 cursor-text"
                  onClick={() => setIsEditing(true)}
                >
                  {element.data.title}
                </h3>
              )}

              {/* Description */}
              <div className="mt-1">
                {isEditingDescription ? (
                  <div className="w-full">
                    <textarea
                      ref={descriptionRef}
                      value={element.data.description || ''}
                      onChange={handleDescriptionChange}
                      onBlur={handleDescriptionSubmit}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          setIsEditingDescription(false);
                        } else if (e.key === 'Enter') {
                          // Force line break behavior
                          e.stopPropagation();
                          const textarea = e.target;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const value = textarea.value;
                          const newValue = value.substring(0, start) + '\n' + value.substring(end);
                          
                          updateElement(element.id, {
                            data: { ...element.data, description: newValue }
                          });
                          
                          // Set cursor position after the inserted newline and auto-resize
                          setTimeout(() => {
                            textarea.selectionStart = textarea.selectionEnd = start + 1;
                            autoResizeTextarea(textarea);
                          }, 0);
                        }
                      }}
                      className="w-full text-xs text-gray-700 bg-white border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none overflow-hidden"
                      placeholder="Add description... (Enter for new line)"
                      rows={3}
                      wrap="soft"
                      autoFocus
                      style={{ minHeight: '48px', maxHeight: '96px' }}
                    />
                    <div className="text-xs text-gray-400 mt-1">Click outside to save • Esc to cancel</div>
                  </div>
                ) : (
                  <div 
                    className={`text-xs cursor-text leading-tight ${
                      element.data.description ? 'text-gray-600' : 'text-gray-400 italic'
                    }`}
                    onClick={() => setIsEditingDescription(true)}
                    style={{
                      minHeight: element.data.description ? 'auto' : '1.25rem',
                      maxHeight: '120px',
                      overflow: 'auto',
                      wordWrap: 'break-word',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    {element.data.description || 'Add description...'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* More options (visible on hover) */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
            title="Board options"
          >
            <MoreHorizontal size={18} />
          </motion.button>
        </div>

        {/* Milanote-style content preview */}
        <div className="px-4 pb-4">
          {/* Element count */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{element.data.elements?.length || 0} items</span>
            {element.data.elements?.length > 0 && (
              <div className="flex -space-x-2">
                {/* Preview dots for elements */}
                {element.data.elements.slice(0, 3).map((_, index) => (
                  <div
                    key={index}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                ))}
                {element.data.elements.length > 3 && (
                  <span className="text-xs text-gray-400 ml-2">
                    +{element.data.elements.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Visual indicator */}
          <div className="mt-3 flex space-x-1">
            <div className="h-1 w-8 bg-gray-300 rounded-full" />
            <div className="h-1 w-12 bg-gray-300 rounded-full" />
            <div className="h-1 w-6 bg-gray-300 rounded-full" />
          </div>
        </div>
      </div>

      {/* Hover effect border */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{
          boxShadow: isHovered 
            ? '0 0 0 2px rgba(99, 102, 241, 0.2)' 
            : '0 0 0 0px rgba(99, 102, 241, 0)'
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
};