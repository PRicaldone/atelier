import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { Type, Image, Link2, Hash, ChevronRight, Sparkles, Bot } from 'lucide-react';

const NodeCard = ({ data, selected }) => {
  const getNodeIcon = (type) => {
    switch (type) {
      case 'text': return <Type className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'link': return <Link2 className="w-4 h-4" />;
      case 'tag': return <Hash className="w-4 h-4" />;
      default: return <ChevronRight className="w-4 h-4" />;
    }
  };

  const getAccentColor = (phase) => {
    switch (phase) {
      case 'narrative': return 'rgb(59, 130, 246)'; // Blue
      case 'formal': return 'rgb(16, 185, 129)'; // Green
      case 'symbolic': return 'rgb(139, 92, 246)'; // Purple
      default: return 'rgb(156, 163, 175)'; // Gray
    }
  };

  const accentColor = getAccentColor(data.phase);

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !border-2 !border-white opacity-60 hover:opacity-100 transition-all hover:scale-125"
        style={{ 
          width: 28, 
          height: 28, 
          borderRadius: '50%',
          cursor: 'crosshair',
          top: -8  // Sporge di 8px oltre il bordo
        }}
        isConnectable={true}
      />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`
          relative min-w-[200px] max-w-[400px] 
          bg-white/[0.02] dark:bg-gray-900/50
          border border-white/10 rounded-xl p-4
          backdrop-blur-md
          transition-all duration-200
          hover:border-white/20
        `}
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          zIndex: selected ? 1000 : 1
        }}
      >
        {/* Accent Line */}
        <div 
          className="absolute top-0 left-4 right-4 h-0.5 rounded-full"
          style={{ 
            backgroundColor: selected ? '#3B82F6' : accentColor, 
            opacity: selected ? 1 : 0.6
          }}
        />
        

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-gray-400">
            {getNodeIcon(data.type)}
            <span className="text-xs uppercase tracking-wider opacity-60">
              {data.type}
            </span>
            {data.aiGenerated && (
              <div className="flex items-center space-x-1">
                <Bot className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-purple-500 font-medium">AI</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {data.phase && (
              <span 
                className="text-xs px-2 py-1 rounded-full"
                style={{ 
                  backgroundColor: `${accentColor}20`,
                  color: accentColor
                }}
              >
                {data.phase}
              </span>
            )}
            {data.aiEnhanced && !data.aiGenerated && (
              <Sparkles className="w-3 h-3 text-amber-500" title="AI Enhanced" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          {data.title && (
            <h3 className="font-medium text-gray-900 dark:text-white">
              {data.title}
            </h3>
          )}
          
          {data.content && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
              {data.content}
            </p>
          )}

          {data.image && (
            <div className="relative h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img 
                src={data.image} 
                alt={data.title || 'Node image'} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* AI Suggestions Indicator */}
        {data.hasSuggestions && (
          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white text-xs">✨</span>
          </div>
        )}
      </motion.div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !border-2 !border-white opacity-60 hover:opacity-100 transition-all hover:scale-125"
        style={{ 
          width: 28, 
          height: 28, 
          borderRadius: '50%',
          cursor: 'crosshair',
          bottom: -8  // Sporge di 8px oltre il bordo
        }}
        isConnectable={true}
      />
    </>
  );
};

export default memo(NodeCard);