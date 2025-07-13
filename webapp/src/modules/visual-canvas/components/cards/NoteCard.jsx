import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCanvasStore } from '../../store.js';
import { Edit3, Type, Palette } from 'lucide-react';

export const NoteCard = ({ element }) => {
  const { updateElement } = useCanvasStore();
  const [isEditing, setIsEditing] = useState(element.editing || false);
  const textareaRef = useRef(null);
  
  const { data } = element;

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleTextChange = (e) => {
    updateElement(element.id, {
      data: { ...data, text: e.target.value }
    });
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    updateElement(element.id, { editing: false });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleTextBlur();
    }
    if (e.key === 'Escape') {
      handleTextBlur();
    }
  };

  const cardStyle = {
    backgroundColor: data.backgroundColor || '#fef3c7',
    borderColor: data.borderColor || '#f59e0b',
    color: data.color || '#1f2937'
  };

  return (
    <motion.div
      className="w-full h-full rounded-lg border-2 shadow-md hover:shadow-lg transition-shadow duration-200 relative overflow-hidden"
      style={cardStyle}
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-current opacity-20 dark:opacity-30">
        <Type size={14} />
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-current opacity-40 dark:opacity-50" />
          <div className="w-2 h-2 rounded-full bg-current opacity-40 dark:opacity-50" />
          <div className="w-2 h-2 rounded-full bg-current opacity-40 dark:opacity-50" />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 h-full">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={data.text}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-transparent border-none outline-none resize-none"
            style={{
              fontSize: `${data.fontSize || 14}px`,
              fontWeight: data.fontWeight || 'normal',
              textAlign: data.textAlign || 'left',
              color: 'inherit'
            }}
            placeholder="Start typing..."
          />
        ) : (
          <div
            className="w-full h-full whitespace-pre-wrap cursor-text space-y-1"
            style={{
              fontSize: `${data.fontSize || 14}px`,
              fontWeight: data.fontWeight || 'normal',
              textAlign: data.textAlign || 'left'
            }}
            onDoubleClick={() => setIsEditing(true)}
          >
            {/* Support both formats: legacy (data.text) and new (data.title + data.content) */}
            {data.title && (
              <div className="font-bold text-sm mb-2 border-b border-current opacity-60 pb-1 text-gray-800 dark:text-gray-100">
                {data.title}
              </div>
            )}
            <div className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
              {data.content || data.text || 'Double-click to edit'}
            </div>
          </div>
        )}
      </div>

      {/* Edit indicator */}
      {!isEditing && (
        <motion.div
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <Edit3 size={12} className="text-current opacity-60 dark:opacity-70" />
        </motion.div>
      )}

      {/* Color palette indicator */}
      <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full border border-current opacity-30 dark:opacity-40" />
      
      {/* Sticky note fold effect */}
      <div className="absolute top-0 right-0 w-4 h-4">
        <div 
          className="absolute top-0 right-0 w-0 h-0 border-l-4 border-b-4 border-l-transparent"
          style={{ borderBottomColor: data.borderColor || '#f59e0b' }}
        />
      </div>
    </motion.div>
  );
};