import React, { useState, useEffect } from 'react';
import { useUnifiedStore } from '../../store/unifiedStore';
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
  // Connect to real Unified Store
  const {
    initialized,
    aiReady,
    currentModule,
    canvas,
    ai,
    navigation,
    lastActivity,
    analyzeCanvasContext,
    generateAISuggestions,
    navigateToModule,
    addCanvasElement,
    clearAISuggestions,
    getCurrentModuleContext
  } = useUnifiedStore();

  const [testResults, setTestResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // No need for simulated updates - using real store

  const handleAnalyzeContext = async () => {
    setIsAnalyzing(true);
    setTestResults(prev => [...prev, {
      id: Date.now(),
      action: 'Analyze Context',
      timestamp: new Date().toLocaleTimeString(),
      status: 'running'
    }]);

    // Use real unified store analysis
    setTimeout(async () => {
      await analyzeCanvasContext();
      
      setTestResults(prev => prev.map(result => 
        result.action === 'Analyze Context' && result.status === 'running'
          ? { ...result, status: 'success', result: 'Real unified store context analyzed successfully' }
          : result
      ));
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleGenerateSuggestions = () => {
    // Use real unified store suggestion generation
    const newSuggestions = generateAISuggestions(getCurrentModuleContext());
    
    setTestResults(prev => [...prev, {
      id: Date.now(),
      action: 'Generate Suggestions',
      timestamp: new Date().toLocaleTimeString(),
      status: 'success',
      result: `Generated: ${newSuggestions.join(', ')}`
    }]);
  };

  const handleNavigate = (module) => {
    // Use real unified store navigation
    navigateToModule(module, { source: 'unified-store-test' });
    
    setTestResults(prev => [...prev, {
      id: Date.now(),
      action: `Navigate to ${module}`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'success',
      result: `Real navigation to ${module} completed`
    }]);
  };

  const handleAddTestElement = () => {
    // Use real unified store element addition
    addCanvasElement('note', { x: Math.random() * 400, y: Math.random() * 300 });
    
    setTestResults(prev => [...prev, {
      id: Date.now(),
      action: 'Add Test Element',
      timestamp: new Date().toLocaleTimeString(),
      status: 'success',
      result: 'Real test element added to unified store canvas'
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
                  {initialized ? (
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
                  {aiReady ? (
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
                  {currentModule}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Canvas Elements:</span>
                <span className="text-gray-900 dark:text-white font-mono">
                  {canvas.elements.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">AI Suggestions:</span>
                <span className="text-gray-900 dark:text-white font-mono">
                  {ai.suggestions.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last Analysis:</span>
                <span className="text-gray-900 dark:text-white font-mono text-sm">
                  {ai.lastAnalysis ? new Date(ai.lastAnalysis).toLocaleTimeString() : 'None'}
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
                onClick={() => console.log('Unified Store State:', { initialized, aiReady, currentModule, canvas, ai, navigation })}
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
        {ai.suggestions.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-purple-500" />
              🤖 AI Suggestions ({ai.suggestions.length})
            </h2>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {ai.suggestions.map((suggestion, index) => (
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
              onClick={clearAISuggestions}
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
            {JSON.stringify({ 
              initialized, 
              aiReady, 
              currentModule, 
              canvasElementsCount: canvas.elements.length,
              suggestionsCount: ai.suggestions.length,
              lastAnalysis: ai.lastAnalysis,
              navigationHistory: navigation.history.slice(-3),
              lastActivity
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default UnifiedStoreTest;