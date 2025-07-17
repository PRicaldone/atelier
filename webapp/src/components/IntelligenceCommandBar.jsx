/**
 * IntelligenceCommandBar - Universal AI Command Interface
 * 
 * Provides natural language interface to Intelligence System across all modules.
 * Features:
 * - Context-aware suggestions
 * - Real-time task analysis
 * - Execution feedback
 * - Module-specific actions
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Zap, Brain, MessageCircle, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { taskAnalyzer } from '../modules/shared/intelligence/TaskAnalyzer.js';
import { taskCoordinator } from '../modules/shared/intelligence/TaskCoordinator.js';

// Execution states
const ExecutionState = {
  IDLE: 'idle',
  ANALYZING: 'analyzing',
  EXECUTING: 'executing',
  COMPLETED: 'completed',
  ERROR: 'error'
};

// Complexity level colors
const ComplexityColors = {
  simple: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: 'text-green-500'
  },
  medium: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    icon: 'text-yellow-500'
  },
  complex: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: 'text-red-500'
  },
  hybrid: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-500'
  }
};

// Route descriptions
const RouteDescriptions = {
  'claude-connectors': 'Direct service integration',
  'orchestrator': 'Multi-step workflow',
  'hybrid': 'Intelligent routing'
};

/**
 * IntelligenceCommandBar Component
 */
export default function IntelligenceCommandBar({ 
  module = 'general', 
  onExecute = () => {}, 
  className = '' 
}) {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [executionState, setExecutionState] = useState(ExecutionState.IDLE);
  const [analysis, setAnalysis] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Module-specific suggestions
  const moduleSuggestions = {
    'mind-garden': [
      'Import my Notion pages as nodes',
      'Create connections between related concepts',
      'Export selected nodes to Scriptorium board',
      'Show me my Asana tasks as mind map',
      'Find images in Drive and create visual nodes'
    ],
    'scriptorium': [
      'Create dashboard with my Drive files',
      'Add Asana tasks as visual cards',
      'Generate project report and save to Drive',
      'Create board with Notion meeting notes',
      'Export current board as PDF'
    ],
    'orchestra': [
      'Schedule content from current campaign',
      'Create automation workflow',
      'Launch multi-channel campaign',
      'Analyze campaign performance',
      'Create client onboarding workflow'
    ],
    'general': [
      'Show me my recent files',
      'Create new project workspace',
      'Generate weekly report',
      'Setup automation workflow'
    ]
  };

  // Update suggestions based on module
  useEffect(() => {
    setSuggestions(moduleSuggestions[module] || moduleSuggestions.general);
  }, [module]);

  // Debounced analysis
  useEffect(() => {
    if (input.trim() && input.length > 3) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        analyzeInput(input);
      }, 300);
    } else {
      setAnalysis(null);
      setShowAnalysis(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [input]);

  /**
   * Analyze user input
   */
  const analyzeInput = async (text) => {
    if (!text.trim()) return;

    setExecutionState(ExecutionState.ANALYZING);
    setShowAnalysis(true);

    try {
      const analysisResult = await taskAnalyzer.analyzeTask(text, { module });
      setAnalysis(analysisResult);
      setExecutionState(ExecutionState.IDLE);
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error.message);
      setExecutionState(ExecutionState.ERROR);
    }
  };

  /**
   * Execute the analyzed task
   */
  const executeTask = async () => {
    if (!input.trim() || !analysis) return;

    setExecutionState(ExecutionState.EXECUTING);
    setError(null);

    try {
      const result = await taskCoordinator.executeTask(input, { 
        module,
        analysis 
      });
      
      setResult(result);
      setExecutionState(ExecutionState.COMPLETED);
      
      // Notify parent component
      onExecute(result);
      
      // Auto-close after success
      setTimeout(() => {
        setIsOpen(false);
        setInput('');
        setAnalysis(null);
        setResult(null);
        setShowAnalysis(false);
      }, 3000);
      
    } catch (error) {
      console.error('Execution failed:', error);
      setError(error.message);
      setExecutionState(ExecutionState.ERROR);
    }
  };

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  /**
   * Handle key press
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (analysis && executionState === ExecutionState.IDLE) {
        executeTask();
      }
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      setInput('');
      setAnalysis(null);
      setShowAnalysis(false);
    }
  };

  /**
   * Get execution state icon
   */
  const getStateIcon = () => {
    switch (executionState) {
      case ExecutionState.ANALYZING:
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case ExecutionState.EXECUTING:
        return <Loader2 className="w-4 h-4 animate-spin text-orange-500" />;
      case ExecutionState.COMPLETED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case ExecutionState.ERROR:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Brain className="w-4 h-4 text-gray-400" />;
    }
  };

  /**
   * Get complexity styling
   */
  const getComplexityStyle = (complexity) => {
    return ComplexityColors[complexity] || ComplexityColors.simple;
  };

  return (
    <div className={`intelligence-command-bar ${className}`}>
      {/* Screen Reader Helper */}
      <div id="intelligence-command-help" className="sr-only">
        Intelligence Command Bar. Type natural language commands to interact with the AI assistant. 
        Press Enter to execute, Escape to close.
      </div>
      
      {/* Main Command Bar */}
      <div className="relative">
        {/* Input Container */}
        <div className={`
          relative transition-all duration-200 
          ${isOpen ? 'shadow-lg' : 'shadow-md'}
          bg-white rounded-xl border border-gray-200 
          ${isOpen ? 'ring-2 ring-blue-500/20' : ''}
          w-full max-w-full
        `}>
          {/* Search Icon & Input */}
          <div className="flex items-center gap-3 p-3">
            <div className="flex items-center gap-2">
              {getStateIcon()}
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsOpen(true)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask AI to help with ${module === 'general' ? 'your work' : module.replace('-', ' ')}...`}
              className="flex-1 text-sm placeholder:text-gray-400 border-none outline-none bg-transparent min-w-0"
              aria-label="Intelligence Command Input"
              aria-describedby="intelligence-command-help"
              autoComplete="off"
            />
            
            {/* Execute Button */}
            {analysis && executionState === ExecutionState.IDLE && (
              <button
                onClick={executeTask}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                aria-label="Execute intelligence task"
              >
                <Zap className="w-3 h-3" />
                <span className="hidden sm:inline">Execute</span>
              </button>
            )}
          </div>

          {/* Analysis Display */}
          {showAnalysis && analysis && (
            <div className="border-t border-gray-100 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`
                  inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md
                  ${getComplexityStyle(analysis.complexity).bg}
                  ${getComplexityStyle(analysis.complexity).border}
                  ${getComplexityStyle(analysis.complexity).text}
                  border
                `}>
                  <Brain className={`w-3 h-3 ${getComplexityStyle(analysis.complexity).icon}`} />
                  {analysis.complexity}
                </div>
                
                <div className="text-xs text-gray-500">
                  via {RouteDescriptions[analysis.route]}
                </div>
                
                <div className="text-xs text-gray-400">
                  {Math.round(analysis.confidence * 100)}% confidence
                </div>
              </div>

              {/* Services & Actions */}
              <div className="flex flex-wrap gap-1 mb-2">
                {analysis.services.map((service, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-md"
                  >
                    {service.name}
                  </span>
                ))}
              </div>

              {/* Reasoning */}
              <div className="text-xs text-gray-500">
                {analysis.reasoning.slice(0, 2).join(' • ')}
              </div>
            </div>
          )}

          {/* Execution Result */}
          {result && (
            <div className="border-t border-gray-100 p-3">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                Task completed successfully
              </div>
              {result.summary && (
                <div className="text-xs text-gray-500 mt-1">
                  {result.summary}
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="border-t border-gray-100 p-3">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {isOpen && !input && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50 max-w-full">
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Try these suggestions:</span>
                <span className="sm:hidden">Suggestions:</span>
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                  aria-label={`Suggestion: ${suggestion}`}
                >
                  <span className="block truncate">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * Compact version for toolbar integration
 */
export function CompactIntelligenceCommandBar({ module, onExecute, className }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isExpanded) {
    return (
      <div className="fixed inset-x-4 top-4 z-50 max-w-full">
        <div className="max-w-2xl mx-auto">
          <IntelligenceCommandBar
            module={module}
            onExecute={onExecute}
            className={className}
          />
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 text-white rounded-full text-xs hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/50"
            aria-label="Close intelligence command bar"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsExpanded(true)}
      className={`
        flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 
        bg-white border border-gray-200 rounded-lg hover:bg-gray-50 
        transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 
        ${className}
      `}
      aria-label="Open intelligence command bar"
    >
      <Brain className="w-4 h-4" />
      <span className="hidden sm:block">Ask AI</span>
      <span className="sm:hidden">AI</span>
    </button>
  );
}