import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Brain, 
  Loader2, 
  CheckCircle2, 
  ArrowDown, 
  ArrowRight,
  Send,
  Edit3,
  Sparkles,
  User,
  Bot
} from 'lucide-react';
import '../styles/conversationalNodes.scss';

const ConversationalNode = ({ data, selected, id }) => {
  // Local state for conversation
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [isEditing, setIsEditing] = useState(data.state === 'empty');
  const [localState, setLocalState] = useState(data.state || 'empty');
  
  // Refs for keyboard navigation
  const textareaRef = useRef(null);
  const nodeRef = useRef(null);

  // Context depth visual indicators
  const getContextIndicator = (depth = 0) => {
    const indicators = ['○', '◐', '◑', '●'];
    const colors = ['gray-400', 'blue-400', 'blue-600', 'blue-800'];
    
    const index = Math.min(depth, indicators.length - 1);
    return {
      symbol: indicators[index],
      color: colors[index],
      meaning: ['Fresh start', 'Light context', 'Medium context', 'Deep context'][index]
    };
  };

  // Branch type styling
  const getBranchStyling = (branchType = 'exploration') => {
    const styles = {
      exploration: { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
      refinement: { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-700' },
      implementation: { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-700' },
      critique: { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700' }
    };
    return styles[branchType] || styles.exploration;
  };

  // Enhanced state styling with SCSS classes
  const getNodeClasses = () => {
    return `conversational-node ${localState} ${selected ? 'selected' : ''}`;
  };

  // Get confidence level for visual feedback
  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  };

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'Enter':
        if (!e.shiftKey && prompt.trim()) {
          e.preventDefault();
          handleGenerateResponse();
        }
        break;
      case 'Tab':
        if (localState === 'complete') {
          e.preventDefault();
          if (e.shiftKey) {
            handleCreateSiblingNode();
          } else {
            handleCreateChildNode();
          }
        }
        break;
      case 'Escape':
        if (isEditing) {
          e.preventDefault();
          setIsEditing(false);
        }
        break;
      case 'F2':
        e.preventDefault();
        setIsEditing(true);
        break;
    }
  }, [prompt, localState, isEditing]);

  // ENHANCED v5.1: AI Response Generation with Contextual Intelligence
  const handleGenerateResponse = useCallback(async () => {
    if (!prompt.trim()) return;
    
    setLocalState('thinking');
    setIsEditing(false);
    
    try {
      // Get AI Intelligence Engine from unified store
      const { useUnifiedStore } = await import('../../../store/unifiedStore');
      const { getIntelligenceEngine } = useUnifiedStore.getState();
      const intelligenceEngine = await getIntelligenceEngine();
      
      if (!intelligenceEngine) {
        console.warn('🤖 AI Intelligence Engine not available - using fallback');
        handleFallbackResponse();
        return;
      }

      // Get Mind Garden store to build parent chain
      const { useMindGardenStore } = await import('../store');
      const mindGardenStore = useMindGardenStore.getState();
      const parentChain = mindGardenStore.buildParentChain?.(id) || [];

      console.log('🌱 Generating AI response with context:', { 
        nodeId: id, 
        prompt, 
        contextDepth: parentChain.length 
      });

      setLocalState('streaming');

      // Generate contextual AI response
      const result = await intelligenceEngine.generateConversationalResponse(id, prompt, parentChain);
      
      if (result.error) {
        console.error('🤖 AI response generation failed:', result.error);
        handleFallbackResponse();
        return;
      }

      setLocalState('complete');
      
      // Update parent store with AI response and metadata
      if (data.onUpdate) {
        data.onUpdate(id, {
          prompt: prompt,
          aiResponse: result.response,
          state: 'complete',
          timestamp: result.timestamp,
          context: {
            ...data.context,
            aiConfidence: result.confidence,
            conversationFocus: result.conversationFocus,
            primaryTopic: result.primaryTopic
          },
          suggestedBranches: result.suggestedBranches
        });
      }

      console.log('🌱 AI response generated successfully:', {
        responseLength: result.response.length,
        confidence: result.confidence,
        suggestions: result.suggestedBranches?.length || 0
      });

    } catch (error) {
      console.error('🌱 AI response generation failed:', error);
      handleFallbackResponse();
    }
  }, [prompt, id, data]);

  // Fallback response for when AI is unavailable
  const handleFallbackResponse = useCallback(() => {
    setLocalState('complete');
    if (data.onUpdate) {
      data.onUpdate(id, {
        prompt: prompt,
        aiResponse: `Thank you for your input: "${prompt}"\n\nI'm currently working on processing your request. This is a development placeholder that will be enhanced with full AI intelligence once the system is activated.`,
        state: 'complete',
        timestamp: new Date().toISOString(),
        context: {
          ...data.context,
          aiConfidence: 0.6
        }
      });
    }
  }, [prompt, id, data]);

  // Node creation handlers (placeholder for Day 2)
  const handleCreateChildNode = useCallback(() => {
    if (data.onCreateChild) {
      data.onCreateChild(id, {
        parentId: id,
        context: {
          parentChain: [...(data.context?.parentChain || []), id],
          depth: (data.context?.depth || 0) + 1,
          branch: 'exploration'
        }
      });
    }
  }, [id, data]);

  const handleCreateSiblingNode = useCallback(() => {
    if (data.onCreateSibling) {
      data.onCreateSibling(id, {
        parentId: data.context?.parentChain?.slice(-1)[0] || null,
        context: {
          parentChain: data.context?.parentChain || [],
          depth: data.context?.depth || 0,
          branch: 'refinement'
        }
      });
    }
  }, [id, data]);

  // Auto-focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // Context indicator data
  const contextIndicator = getContextIndicator(data.context?.depth || 0);
  const branchStyling = getBranchStyling(data.context?.branch);

  return (
    <>
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !border-2 !border-white opacity-60 hover:opacity-100 transition-all"
        style={{ width: 24, height: 24, borderRadius: '50%', top: -8 }}
        isConnectable={true}
      />

      <motion.div
        ref={nodeRef}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: selected ? 1.05 : 1.02 }}
        className={getNodeClasses()}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        data-confidence={getConfidenceLevel(data.context?.aiConfidence || 0.7)}
        style={{
          zIndex: selected ? 1000 : 1
        }}
      >
        {/* Enhanced Context Depth Indicator */}
        <motion.div 
          className="context-indicator"
          data-depth={data.context?.depth || 0}
          title={`Context depth: ${data.context?.depth || 0} - ${contextIndicator.meaning}`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        />

        {/* Enhanced State Indicator */}
        <AnimatePresence mode="wait">
          {localState === 'thinking' && (
            <motion.div 
              key="thinking"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Loader2 className="w-3 h-3 text-white animate-spin" />
            </motion.div>
          )}
          {localState === 'streaming' && (
            <motion.div 
              key="streaming"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Brain className="w-3 h-3 text-white animate-pulse" />
            </motion.div>
          )}
          {localState === 'complete' && (
            <motion.div 
              key="complete"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <CheckCircle2 className="w-3 h-3 text-white" />
            </motion.div>
          )}
          {localState === 'branching' && (
            <motion.div 
              key="branching"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <ArrowRight className="w-3 h-3 text-white animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Branch Type Indicator */}
        {data.context?.branch && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`branch-type-indicator ${data.context.branch}`}
          >
            {data.context.branch}
          </motion.div>
        )}

        {/* Header */}
        <div className="flex items-center space-x-2 mb-3">
          <MessageCircle className="w-4 h-4 text-gray-400" />
          <span className="text-xs uppercase tracking-wider text-gray-400">
            Conversation
          </span>
          {data.aiGenerated && (
            <div className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span className="text-xs text-purple-500 font-medium">AI</span>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="space-y-3">
          {/* Prompt Section */}
          <div className="space-y-2">
            {isEditing || localState === 'empty' ? (
              <div className="space-y-2">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type your idea, question, or prompt..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-gray-900 placeholder-gray-400"
                  rows={3}
                  onKeyDown={handleKeyDown}
                />
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Press Enter to generate AI response • Tab for child node • Shift+Tab for sibling
                  </div>
                  <button
                    onClick={handleGenerateResponse}
                    disabled={!prompt.trim() || localState === 'thinking'}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm
                      hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center space-x-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            ) : (
              <motion.div 
                className="prompt-section"
                onClick={() => setIsEditing(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2 flex-1">
                    <User className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 mb-1">You:</div>
                      <div className="text-sm text-gray-700">{prompt}</div>
                    </div>
                  </div>
                  <Edit3 className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Enhanced AI Response Section */}
          {data.aiResponse && localState !== 'empty' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="response-section"
            >
              <div className="flex items-start space-x-2">
                <Bot className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-900">AI:</span>
                    {data.context?.aiConfidence && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`text-xs px-2 py-1 rounded-full ${
                          data.context.aiConfidence >= 0.8 
                            ? 'bg-green-100 text-green-700' 
                            : data.context.aiConfidence >= 0.6 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {Math.round(data.context.aiConfidence * 100)}% confidence
                      </motion.span>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {localState === 'streaming' ? (
                      <div className="ai-thinking">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="thinking-dots">Generating response...</span>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {data.aiResponse}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Thinking State */}
          {localState === 'thinking' && (
            <div className="flex items-center space-x-2 text-blue-600 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI is analyzing context and generating response...</span>
            </div>
          )}

          {/* Navigation Hints */}
          {localState === 'complete' && (
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <ArrowDown className="w-3 h-3" />
                    <span>Tab: Continue thread</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ArrowRight className="w-3 h-3" />
                    <span>Shift+Tab: Explore variation</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Suggested Branches */}
        {data.suggestedBranches && localState === 'complete' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="branch-suggestions"
          >
            <div className="text-xs text-gray-500 mb-2">💡 Continue exploring:</div>
            <div className="flex flex-wrap gap-2">
              {data.suggestedBranches.map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="suggestion-tag"
                  onClick={() => setPrompt(suggestion)}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !border-2 !border-white opacity-60 hover:opacity-100 transition-all"
        style={{ width: 24, height: 24, borderRadius: '50%', bottom: -8 }}
        isConnectable={true}
      />
    </>
  );
};

export default memo(ConversationalNode);