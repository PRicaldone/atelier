import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Brain, 
  Activity, 
  Eye, 
  Plus, 
  Zap, 
  TreePine, 
  FolderOpen,
  Bug,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const UnifiedStoreTest = () => {
  const [storeState, setStoreState] = useState({
    initialized: true,
    aiReady: true,
    currentModule: 'canvas',
    canvasElements: 0,
    suggestions: [],
    lastAnalysis: 'None'
  });

  const [testResults, setTestResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Simulate store state updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStoreState(prev => ({
        ...prev,
        canvasElements: Math.floor(Math.random() * 10)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleAnalyzeContext = async () => {
    setIsAnalyzing(true);
    setTestResults(prev => [...prev, {
      id: Date.now(),
      action: 'Analyze Context',
      timestamp: new Date().toLocaleTimeString(),
      status: 'running'
    }]);

    // Simulate analysis
    setTimeout(() => {
      const newSuggestions = [
        `💡 Add animated transitions to canvas elements`,
        `🎨 Consider using warmer color palette for ${storeState.currentModule}`,
        `⚡ Optimize rendering performance with React.memo`
      ];
      
      setStoreState(prev => ({
        ...prev,
        lastAnalysis: new Date().toLocaleTimeString(),
        suggestions: [...prev.suggestions, ...newSuggestions]
      }));
      
      setTestResults(prev => prev.map(result => 
        result.action === 'Analyze Context' && result.status === 'running'
          ? { ...result, status: 'success', result: 'Context analyzed successfully' }
          : result
      ));
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleGenerateSuggestions = () => {
    const suggestionTypes = [
      `🎯 Create project template for ${storeState.currentModule}`,
      `🔄 Add auto-save functionality`,
      `📊 Implement analytics dashboard`,
      `🌙 Add dark mode toggle`,
      `⚡ Preload next canvas elements`,
      `🎨 Suggest color scheme based on content`,
      `📝 Add collaborative editing features`,
      `🔍 Implement advanced search`,
      `📱 Optimize for mobile devices`,
      `🚀 Add keyboard shortcuts`
    ];
    
    const randomSuggestions = Array.from({ length: 3 }, () => 
      suggestionTypes[Math.floor(Math.random() * suggestionTypes.length)]
    );
    
    setStoreState(prev => ({
      ...prev,
      suggestions: [...prev.suggestions, ...randomSuggestions]
    }));
    
    setTestResults(prev => [...prev, {
      id: Date.now(),
      action: 'Generate Suggestions',
      timestamp: new Date().toLocaleTimeString(),
      status: 'success',
      result: `Generated: ${randomSuggestions.join(', ')}`
    }]);
  };

  const handleNavigate = (module) => {
    setStoreState(prev => ({
      ...prev,
      currentModule: module
    }));
    
    setTestResults(prev => [...prev, {
      id: Date.now(),
      action: `Navigate to ${module}`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'success',
      result: `Module switched to ${module}`
    }]);
  };

  const handleAddTestElement = () => {
    setStoreState(prev => ({
      ...prev,
      canvasElements: prev.canvasElements + 1
    }));
    
    setTestResults(prev => [...prev, {
      id: Date.now(),
      action: 'Add Test Element',
      timestamp: new Date().toLocaleTimeString(),
      status: 'success',
      result: 'Test element added to canvas'
    }]);
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🧪 Unified Store Architecture Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Testing and debugging the unified store architecture for cross-module intelligence
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Store Status Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-500" />
              Store Status
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Initialized:</span>
                <div className="flex items-center">
                  {storeState.initialized ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-600 font-medium">Ready</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-red-600 font-medium">Error</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">AI Ready:</span>
                <div className="flex items-center">
                  {storeState.aiReady ? (
                    <>
                      <Brain className="w-4 h-4 text-purple-500 mr-1" />
                      <span className="text-purple-600 font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-orange-500 mr-1" />
                      <span className="text-orange-600 font-medium">Inactive</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Current Module:</span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm font-medium">
                  {storeState.currentModule}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Canvas Elements:</span>
                <span className="text-gray-900 dark:text-white font-mono">
                  {storeState.canvasElements}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">AI Suggestions:</span>
                <span className="text-gray-900 dark:text-white font-mono">
                  {storeState.suggestions.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last Analysis:</span>
                <span className="text-gray-900 dark:text-white font-mono text-sm">
                  {storeState.lastAnalysis}
                </span>
              </div>
            </div>
          </div>

          {/* Test Actions Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-500" />
              Test Actions
            </h2>
            
            <div className="space-y-3">
              <button
                onClick={handleAnalyzeContext}
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
              >
                <Brain className="w-4 h-4 mr-2" />
                {isAnalyzing ? 'Analyzing...' : '🧠 Analyze Context'}
              </button>

              <button
                onClick={handleGenerateSuggestions}
                className="w-full flex items-center justify-center px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                <Zap className="w-4 h-4 mr-2" />
                💡 Generate Suggestions
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleNavigate('mind-garden')}
                  className="flex items-center justify-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
                >
                  <TreePine className="w-4 h-4 mr-1" />
                  🌱 Mind Garden
                </button>

                <button
                  onClick={() => handleNavigate('projects')}
                  className="flex items-center justify-center px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm"
                >
                  <FolderOpen className="w-4 h-4 mr-1" />
                  📁 Projects
                </button>
              </div>

              <button
                onClick={handleAddTestElement}
                className="w-full flex items-center justify-center px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                ➕ Add Test Element
              </button>

              <button
                onClick={() => console.log('Raw State Debug:', storeState)}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Bug className="w-4 h-4 mr-2" />
                🔍 Raw State Debug
              </button>
            </div>
          </div>
        </div>

        {/* Test Results Log */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Eye className="w-5 h-5 mr-2 text-indigo-500" />
              Test Results Log
            </h2>
            <button
              onClick={clearTestResults}
              className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            >
              Clear Log
            </button>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No test results yet. Try running some actions above.
              </p>
            ) : (
              <div className="space-y-2">
                {testResults.map((result) => (
                  <div
                    key={result.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      result.status === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                        : result.status === 'running'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {result.action}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {result.timestamp}
                      </span>
                    </div>
                    {result.result && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {result.result}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Suggestions Panel */}
        {storeState.suggestions.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-purple-500" />
              🤖 AI Suggestions ({storeState.suggestions.length})
            </h2>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {storeState.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500"
                >
                  <p className="text-purple-800 dark:text-purple-200 text-sm">
                    {suggestion}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStoreState(prev => ({ ...prev, suggestions: [] }))}
              className="mt-3 px-3 py-1 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors"
            >
              Clear Suggestions
            </button>
          </div>
        )}

        {/* Raw State Debug */}
        <div className="mt-6 bg-gray-900 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Bug className="w-5 h-5 mr-2 text-yellow-400" />
            🔍 Raw State Debug
          </h2>
          <pre className="text-green-400 text-sm overflow-x-auto">
            {JSON.stringify(storeState, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default UnifiedStoreTest;