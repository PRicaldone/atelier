import React from 'react';
import { useUnifiedStore } from '../../store/unifiedStore';

const UnifiedStoreTestSimple = () => {
  console.log('🧪 UnifiedStoreTestSimple rendering...');
  
  try {
    const store = useUnifiedStore();
    console.log('🧪 Store loaded successfully:', store);
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Unified Store Test - Simple</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Store Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Store Status</h2>
            <div className="space-y-2">
              <div>Initialized: {store.initialized ? '✅' : '❌'}</div>
              <div>AI Ready: {store.aiReady ? '✅' : '❌'}</div>
              <div>Current Module: {store.currentModule || 'None'}</div>
              <div>Canvas Elements: {store.canvas?.elements?.length || 0}</div>
              <div>AI Suggestions: {store.ai?.suggestions?.length || 0}</div>
            </div>
          </div>
          
          {/* Test Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Test Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => {
                  console.log('🧪 Analyzing context...');
                  store.analyzeCanvasContext?.();
                }}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Analyze Context
              </button>
              
              <button
                onClick={() => {
                  console.log('🧪 Navigating to canvas...');
                  console.log('🧪 Current module before:', store.currentModule);
                  console.log('🧪 navigateToModule function:', typeof store.navigateToModule);
                  if (store.navigateToModule) {
                    store.navigateToModule('canvas');
                    setTimeout(() => {
                      console.log('🧪 Current module after:', store.currentModule);
                    }, 100);
                  } else {
                    console.error('🧪 navigateToModule not available!');
                  }
                }}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Navigate to Canvas
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('🧪 Error in UnifiedStoreTestSimple:', error);
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <pre className="bg-red-100 p-4 rounded mt-4">
          {error.toString()}
        </pre>
      </div>
    );
  }
};

export default UnifiedStoreTestSimple;