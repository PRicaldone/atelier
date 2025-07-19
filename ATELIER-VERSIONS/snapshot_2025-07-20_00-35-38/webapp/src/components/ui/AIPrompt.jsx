/**
 * AI Prompt - Intelligent content generation overlay
 * Appears on long-press with SuperClaude+MCP integration
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const AIPrompt = ({ position, onSubmit, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef(null);

  const shortcuts = [
    { 
      key: '/board', 
      label: 'board', 
      description: 'Generate a new board with content',
      template: 'Create a board for '
    },
    { 
      key: '/idea', 
      label: 'idea', 
      description: 'Brainstorm ideas',
      template: 'Generate ideas for '
    },
    { 
      key: '/ref', 
      label: 'ref', 
      description: 'Find references',
      template: 'Find references for '
    },
    { 
      key: '/brief', 
      label: 'brief', 
      description: 'Create a project brief',
      template: 'Create a brief for '
    }
  ];

  // Auto-focus textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleShortcutClick = (shortcut) => {
    setPrompt(shortcut.template);
    textareaRef.current?.focus();
    
    // Move cursor to end
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(
          shortcut.template.length,
          shortcut.template.length
        );
      }
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    try {
      // Detect shortcut from prompt
      const shortcut = shortcuts.find(s => prompt.startsWith(s.key));
      
      // Submit to parent with prompt and shortcut info
      await onSubmit(prompt, shortcut);
      
      // Emit analytics event
      if (window.__eventBus) {
        window.__eventBus.emit('ui:ai-prompt:submitted', {
          prompt: prompt.substring(0, 50) + '...', // Truncate for privacy
          shortcut: shortcut?.key || 'none',
          timestamp: Date.now()
        });
      }
      
    } catch (error) {
      console.error('AI prompt submission failed:', error);
      
      // Show error feedback
      if (window.__eventBus) {
        window.__eventBus.emit('ui:ai-prompt:error', {
          error: error.message,
          timestamp: Date.now()
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <motion.div
      className="ai-prompt active"
      style={{
        left: position.x,
        top: position.y
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="ai-prompt-header">
        <span className="ai-prompt-icon">✨</span>
        <span className="ai-prompt-title">
          {isGenerating ? 'Generating...' : 'Cosa vuoi creare qui?'}
        </span>
        <motion.button
          className="ai-prompt-close"
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontSize: '16px'
          }}
        >
          ×
        </motion.button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          className="ai-prompt-input"
          placeholder="Descrivi cosa vorresti generare in questo punto del canvas..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isGenerating}
          rows={3}
        />

        {/* Shortcuts */}
        <div className="ai-prompt-shortcuts">
          {shortcuts.map((shortcut) => (
            <motion.button
              key={shortcut.key}
              type="button"
              className="ai-shortcut"
              onClick={() => handleShortcutClick(shortcut)}
              title={shortcut.description}
              disabled={isGenerating}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {shortcut.label}
            </motion.button>
          ))}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          className="ai-prompt-submit"
          disabled={!prompt.trim() || isGenerating}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          {isGenerating ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-block', marginRight: '8px' }}
              >
                ⟳
              </motion.span>
              generating...
            </>
          ) : (
            '[generate]'
          )}
        </motion.button>
      </form>

      {/* Backdrop */}
      <motion.div
        className="ai-prompt-backdrop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: 'transparent'
        }}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
    </motion.div>
  );
};

export default AIPrompt;