import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCanvasStore } from '../../store.js';
import { Edit3, Type, Palette, Sparkles } from 'lucide-react';

export const NoteCard = ({ element }) => {
  const { updateElement } = useCanvasStore();
  const [isEditing, setIsEditing] = useState(element.editing || false);
  const titleInputRef = useRef(null);
  const textareaRef = useRef(null);
  
  // Use element.data directly to avoid stale closures
  const data = element.data;

  useEffect(() => {
    if (isEditing) {
      // Small delay to ensure DOM is updated before focusing
      setTimeout(() => {
        if (!element.data.title && !element.data.content && titleInputRef.current) {
          titleInputRef.current.focus();
        } else if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 50);
      
      // Escape is handled by individual input handlers
    }
  }, [isEditing]); // Remove data dependencies that cause re-renders

  const handleTitleChange = useCallback((e) => {
    console.log('Title change:', e.target.value, 'Focus on:', document.activeElement);
    updateElement(element.id, {
      data: { ...data, title: e.target.value }
    });
  }, [element.id, updateElement, data]);

  const handleContentChange = useCallback((e) => {
    console.log('Content change:', e.target.value, 'Current data:', data);
    updateElement(element.id, {
      data: { ...data, content: e.target.value }
    });
  }, [element.id, updateElement, data]);

  const handleTextBlur = () => {
    setIsEditing(false);
    updateElement(element.id, { editing: false });
  };

  // Simplified handlers - only stopPropagation and basic escape

  // Use Mind Garden elegant styling with better contrast
  const accentColor = data.backgroundColor || '#f59e0b';

  // Calculate adaptive dimensions based on content length like Mind Garden
  const titleLength = (data.title || '').length;
  const contentLength = (data.content || data.text || '').length;
  const totalLength = titleLength + contentLength;
  
  // Adaptive width based on content (similar to Mind Garden)
  const getAdaptiveWidth = () => {
    if (totalLength < 50) return 'min-w-[200px] max-w-[280px]';
    if (totalLength < 100) return 'min-w-[240px] max-w-[320px]';
    if (totalLength < 200) return 'min-w-[280px] max-w-[360px]';
    return 'min-w-[320px] max-w-[400px]';
  };
  
  // Adaptive height based on content lines
  const getAdaptiveHeight = () => {
    const estimatedLines = Math.ceil(totalLength / 40); // Rough estimate
    if (estimatedLines <= 3) return 'min-h-[120px]';
    if (estimatedLines <= 6) return 'min-h-[160px]';
    if (estimatedLines <= 10) return 'min-h-[200px]';
    return 'min-h-[240px] max-h-[300px]';
  };

  return (
    <motion.div
      className={`
        relative
        ${getAdaptiveWidth()}
        ${getAdaptiveHeight()}
        ${isEditing 
          ? 'bg-white/[0.05] dark:bg-gray-900/60 border-white/30' 
          : 'bg-white/[0.02] dark:bg-gray-900/50 border-white/10 hover:border-white/20'
        }
        border rounded-xl
        backdrop-blur-md
        transition-all duration-200
        shadow-lg hover:shadow-xl
      `}
      style={{
        boxShadow: isEditing 
          ? '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)'
          : '0 8px 32px rgba(0, 0, 0, 0.1)',
        borderColor: isEditing ? `${accentColor}40` : `${accentColor}20`
      }}
      whileHover={isEditing ? {} : { scale: 1.02, y: -2 }}
      onClick={(e) => {
        if (!isEditing) {
          // Allow normal element selection when not editing
          // DraggableElement will handle the click
        } else {
          // In editing mode, still allow selection but stop propagation to canvas
          e.stopPropagation();
        }
      }}
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
      <div className={`${isEditing ? 'p-4' : 'p-3'} flex-1 overflow-hidden note-editing-area`}>
        {isEditing ? (
          <div className="space-y-3 h-full flex flex-col">
            {/* Title Input */}
            <input
              ref={titleInputRef}
              type="text"
              value={element.data.title || ''}
              onChange={handleTitleChange}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                console.log('Title KeyDown:', e.key, 'Value before:', e.target.value);
                e.stopPropagation();
                if (e.key === 'Escape') {
                  e.preventDefault();
                  handleTextBlur();
                }
                // Let all other keys work normally
              }}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 font-medium text-base outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                color: '#111827'
              }}
              placeholder="Note title..."
            />
            {/* Content Textarea */}
            <textarea
              ref={textareaRef}
              value={element.data.content || ''}
              onChange={handleContentChange}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                console.log('Content KeyDown:', e.key);
                e.stopPropagation();
                if (e.key === 'Escape') {
                  e.preventDefault();
                  handleTextBlur();
                }
                // Let all other keys work normally
              }}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 resize-none flex-1 min-h-[60px] outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                fontSize: `${data.fontSize || 14}px`,
                fontWeight: data.fontWeight || 'normal',
                textAlign: data.textAlign || 'left',
                color: '#111827' // Same dark color as title for visibility
              }}
              placeholder="Note content..."
            />
            {/* Editing instructions */}
            <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center pt-1 border-t border-gray-200 dark:border-gray-600">
              <span>Tab: next field</span>
              <span>⌘+Enter: save • Esc: cancel</span>
            </div>
          </div>
        ) : (
          <div
            className="w-full whitespace-pre-wrap cursor-text space-y-1 overflow-y-auto"
            style={{
              fontSize: `${data.fontSize || 14}px`,
              fontWeight: data.fontWeight || 'normal',
              textAlign: data.textAlign || 'left'
            }}
            onDoubleClick={() => setIsEditing(true)}
          >
            {/* Title and Content Display */}
            {(data.title || data.content) ? (
              <div className="space-y-2">
                {data.title && (
                  <div className="font-medium text-base text-gray-900 dark:text-white line-clamp-2">
                    {data.title}
                  </div>
                )}
                {data.content && (
                  <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4">
                    {data.content}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                Double-click to add title and content
              </div>
            )}
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