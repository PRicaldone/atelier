import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCanvasStore } from '../../store.js';
import { Edit3, Type, Palette, Sparkles } from 'lucide-react';

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

  // Use Mind Garden elegant styling with better contrast
  const accentColor = data.backgroundColor || '#f59e0b';

  return (
    <motion.div
      className={`
        w-full h-full relative
        bg-white/[0.02] dark:bg-gray-900/50
        border rounded-xl
        backdrop-blur-md
        transition-all duration-200
        border-white/10 hover:border-white/20
        shadow-lg hover:shadow-xl
      `}
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        borderColor: `${accentColor}20`
      }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {/* Accent Line */}
      <div 
        className="absolute top-0 left-4 right-4 h-0.5 rounded-full"
        style={{ 
          backgroundColor: accentColor, 
          opacity: 0.6
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-3 mb-2">
        <div className="flex items-center space-x-2 text-gray-400 dark:text-gray-500">
          <Type size={14} />
          <span className="text-xs uppercase tracking-wider opacity-60">
            note
          </span>
          {data.sourceModule === 'mind-garden' && (
            <div className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span className="text-xs text-purple-500 font-medium">Mind Garden</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {data.phase && (
            <span 
              className="text-xs px-2 py-1 rounded-full text-white font-medium"
              style={{ 
                backgroundColor: accentColor,
                opacity: 0.8
              }}
            >
              {data.phase}
            </span>
          )}
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
              color: '#374151' // Dark gray for editing mode
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
              <div className="font-medium text-base mb-3 text-gray-900 dark:text-white">
                {data.title}
              </div>
            )}
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {data.content || data.text || 'Double-click to edit'}
            </div>
          </div>
        )}
      </div>

      {/* Edit indicator */}
      {!isEditing && (
        <motion.div
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <Edit3 size={12} className="text-gray-400 dark:text-gray-500" />
        </motion.div>
      )}
    </motion.div>
  );
};