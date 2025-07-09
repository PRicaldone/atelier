import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCanvasStore } from '../../store.js';
import { Brain, Send, Sparkles, Copy, RotateCcw, Settings } from 'lucide-react';

export const AICard = ({ element }) => {
  const { updateElement } = useCanvasStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data } = element;

  const handlePromptChange = (e) => {
    updateElement(element.id, {
      data: {
        ...data,
        prompt: e.target.value
      }
    });
  };

  const handleSubmit = async () => {
    if (!data.prompt.trim()) return;
    
    updateElement(element.id, {
      data: {
        ...data,
        status: 'processing'
      }
    });

    // Simulate AI processing (replace with actual OpenAI integration)
    setTimeout(() => {
      const mockResponse = `Here's a creative response to: "${data.prompt}"\n\nThis is a placeholder response. In the full implementation, this would connect to the OpenAI API using the configuration from the project.`;
      
      updateElement(element.id, {
        data: {
          ...data,
          response: mockResponse,
          status: 'completed',
          tokens: Math.floor(Math.random() * 1000) + 100
        }
      });
    }, 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const copyResponse = () => {
    if (data.response) {
      navigator.clipboard.writeText(data.response);
    }
  };

  const clearConversation = () => {
    updateElement(element.id, {
      data: {
        ...data,
        prompt: '',
        response: '',
        status: 'idle',
        tokens: 0
      }
    });
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'processing': return 'text-yellow-500';
      case 'completed': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'processing': 
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles size={16} />
          </motion.div>
        );
      case 'completed': return <Sparkles size={16} />;
      case 'error': return <Brain size={16} />;
      default: return <Brain size={16} />;
    }
  };

  return (
    <motion.div
      className="w-full h-full rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md hover:shadow-lg transition-shadow duration-200 relative overflow-hidden group"
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-purple-100 bg-gradient-to-r from-purple-100 to-indigo-100">
        <div className="flex items-center space-x-2">
          <div className={`${getStatusColor()}`}>
            {getStatusIcon()}
          </div>
          <span className="text-sm font-medium text-gray-700">AI Assistant</span>
        </div>
        
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
            title="Expand/Collapse"
          >
            <Settings size={12} />
          </button>
          {data.response && (
            <>
              <button
                onClick={copyResponse}
                className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                title="Copy response"
              >
                <Copy size={12} />
              </button>
              <button
                onClick={clearConversation}
                className="p-1 hover:bg-red-100 text-red-500 rounded"
                title="Clear conversation"
              >
                <RotateCcw size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 flex flex-col h-full">
        {/* Prompt input */}
        <div className="mb-3">
          <textarea
            value={data.prompt}
            onChange={handlePromptChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything... (Cmd+Enter to send)"
            className="w-full h-16 p-2 text-sm border border-purple-200 rounded resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white bg-opacity-70"
            disabled={data.status === 'processing'}
          />
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                Model: {data.model || 'gpt-4'}
              </span>
              {data.tokens > 0 && (
                <span className="text-xs text-gray-500">
                  {data.tokens} tokens
                </span>
              )}
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={!data.prompt.trim() || data.status === 'processing'}
              className="flex items-center space-x-1 px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={12} />
              <span>{data.status === 'processing' ? 'Thinking...' : 'Send'}</span>
            </button>
          </div>
        </div>

        {/* Response */}
        {data.response && (
          <div className="flex-1 min-h-0">
            <div className="h-full bg-white bg-opacity-70 rounded border border-purple-200 p-2 overflow-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">
                {data.response}
              </pre>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!data.response && data.status === 'idle' && (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="space-y-2">
              <Brain size={24} className="text-purple-400 mx-auto" />
              <p className="text-xs text-gray-600">
                Ready to assist with creative tasks
              </p>
            </div>
          </div>
        )}

        {/* Processing state */}
        {data.status === 'processing' && (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="space-y-2">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <Sparkles size={24} className="text-purple-500 mx-auto" />
              </motion.div>
              <p className="text-xs text-gray-600">
                AI is thinking...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* AI indicator */}
      <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-pulse" />

      {/* Model settings (when expanded) */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-95 border-t border-purple-200 p-2"
        >
          <div className="text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span>Temperature:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={data.temperature || 0.7}
                onChange={(e) => updateElement(element.id, {
                  data: { ...data, temperature: parseFloat(e.target.value) }
                })}
                className="w-16"
              />
              <span>{data.temperature || 0.7}</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};