/**
 * AI Board Generator Component for Scriptorium
 * Allows users to generate creative boards using AI
 */

import React, { useState, useRef } from 'react';
import { Wand2, Sparkles, AlertCircle, Loader2, Check, X } from 'lucide-react';
import { superClaudeAgent } from '../../shared/ai/agents/SuperClaudeAgent.js';
import { hasAIConsent } from '../../shared/ai/consent/ConsentManager.js';
import { useCanvasStore } from '../store.js';

/**
 * AI Board Generator Component
 */
export default function AIBoardGenerator({ onBoardGenerated, className = '' }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef(null);
  
  const { addElement, setViewport } = useCanvasStore();

  /**
   * Handle board generation
   */
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setLastResult(null);

    try {
      // Check consent first
      const hasConsent = hasAIConsent('board_generation');
      if (!hasConsent) {
        // Consent will be requested by the agent
      }

      // Generate board using SuperClaude agent
      const result = await superClaudeAgent.generateBoard(prompt, {
        userPreferences: {
          style: 'creative',
          complexity: 'medium'
        }
      });

      if (result.success) {
        setLastResult(result);
        setShowPreview(true);
      } else {
        throw new Error(result.error || 'Generation failed');
      }

    } catch (err) {
      console.error('AI Board Generation Error:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Apply generated board to canvas
   */
  const applyToCanvas = () => {
    if (!lastResult || !lastResult.data) return;

    try {
      const boardData = lastResult.data;
      let elementCount = 0;
      let totalWidth = 0;
      let totalHeight = 0;

      // Process each section
      boardData.sections.forEach((section, sectionIndex) => {
        // Add section title
        const sectionTitle = addElement('note', {
          x: 100 + (sectionIndex * 300),
          y: 100
        }, {
          content: section.title,
          style: {
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: '#f0f0f0'
          }
        });

        elementCount++;
        totalWidth = Math.max(totalWidth, 100 + (sectionIndex * 300) + 250);
        totalHeight = Math.max(totalHeight, 150);

        // Add section description if available
        if (section.description) {
          addElement('note', {
            x: 100 + (sectionIndex * 300),
            y: 150
          }, {
            content: section.description,
            style: {
              fontSize: '14px',
              backgroundColor: '#f8f8f8'
            }
          });

          elementCount++;
          totalHeight = Math.max(totalHeight, 200);
        }

        // Add section elements
        if (section.elements && Array.isArray(section.elements)) {
          section.elements.forEach((element, elementIndex) => {
            const elementPosition = {
              x: element.position?.x || (100 + (sectionIndex * 300)),
              y: element.position?.y || (200 + (elementIndex * 80))
            };

            const elementData = {
              content: element.content || element.title || 'Generated content',
              ...element.data
            };

            addElement(element.type || 'note', elementPosition, elementData);
            
            elementCount++;
            totalWidth = Math.max(totalWidth, elementPosition.x + 250);
            totalHeight = Math.max(totalHeight, elementPosition.y + 80);
          });
        }
      });

      // Center viewport on generated content
      if (elementCount > 0) {
        setViewport({
          x: -(totalWidth / 2) + (window.innerWidth / 2),
          y: -(totalHeight / 2) + (window.innerHeight / 2),
          zoom: 0.8
        });
      }

      // Clear form and preview
      setPrompt('');
      setShowPreview(false);
      setLastResult(null);

      // Notify parent component
      if (onBoardGenerated) {
        onBoardGenerated({
          elementsAdded: elementCount,
          fallbackUsed: lastResult.fallbackUsed,
          aiGenerated: !lastResult.fallbackUsed
        });
      }

    } catch (err) {
      console.error('Error applying board to canvas:', err);
      setError('Failed to apply board to canvas');
    }
  };

  /**
   * Cancel preview and return to form
   */
  const cancelPreview = () => {
    setShowPreview(false);
    setLastResult(null);
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  /**
   * Get placeholder text based on AI availability
   */
  const getPlaceholder = () => {
    if (!superClaudeAgent.isConnected) {
      return "AI temporarily unavailable. Describe your board idea for manual creation...";
    }
    return "Describe your creative board idea... (e.g., 'mood board for cyberpunk aesthetic', 'project planning for mobile app')";
  };

  /**
   * Render generation form
   */
  const renderForm = () => (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          disabled={isGenerating}
        />
        
        {superClaudeAgent.isConnected && (
          <div className="absolute top-2 right-2 text-green-500">
            <Sparkles size={16} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {superClaudeAgent.isConnected ? (
            <span className="flex items-center gap-1">
              <Sparkles size={14} />
              AI Assistant Ready
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <AlertCircle size={14} />
              AI Offline - Manual Mode
            </span>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 size={16} />
              Generate Board
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle size={16} />
            <span className="font-medium">Generation Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="text-xs text-gray-400">
        Press Ctrl+Enter to generate • AI features require consent • Your data stays private
      </div>
    </div>
  );

  /**
   * Render board preview
   */
  const renderPreview = () => {
    if (!lastResult || !lastResult.data) return null;

    const boardData = lastResult.data;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Generated Board Preview</h3>
          {lastResult.fallbackUsed && (
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
              Manual Mode
            </span>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
          {boardData.sections.map((section, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <h4 className="font-medium text-gray-900">{section.title}</h4>
              {section.description && (
                <p className="text-sm text-gray-600 mt-1">{section.description}</p>
              )}
              
              {section.elements && section.elements.length > 0 && (
                <div className="mt-2 space-y-1">
                  {section.elements.slice(0, 3).map((element, elementIndex) => (
                    <div key={elementIndex} className="text-xs bg-gray-50 p-2 rounded">
                      {element.content || element.title || 'Generated element'}
                    </div>
                  ))}
                  {section.elements.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{section.elements.length - 3} more elements
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {lastResult.fallbackUsed && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <AlertCircle size={16} />
              <span className="font-medium">Manual Mode Active</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              {lastResult.data.reason || 'AI assistant temporarily unavailable. Basic board structure created.'}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={applyToCanvas}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Check size={16} />
            Apply to Canvas
          </button>
          
          <button
            onClick={cancelPreview}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Wand2 size={20} className="text-blue-600" />
        <h2 className="text-lg font-semibold">AI Board Generator</h2>
      </div>

      {showPreview ? renderPreview() : renderForm()}
    </div>
  );
}