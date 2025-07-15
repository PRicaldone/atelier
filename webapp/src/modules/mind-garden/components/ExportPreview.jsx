import React, { useState } from 'react';
import { X, ArrowRight, Download, Eye } from 'lucide-react';
import { useMindGardenStore } from '../store';

const ExportPreview = ({ isOpen, onClose, selectedNodes, onExport }) => {
  const [previewMode, setPreviewMode] = useState('list'); // 'list' or 'visual'
  const { exportToCanvas } = useMindGardenStore();

  if (!isOpen) return null;

  const handleExport = async () => {
    console.log('🌱 EXPORT PREVIEW: handleExport called');
    console.log('🌱 EXPORT PREVIEW: selectedNodes:', selectedNodes);
    const nodeIds = selectedNodes.map(node => node.id);
    console.log('🌱 EXPORT PREVIEW: nodeIds to export:', nodeIds);
    
    try {
      const success = await exportToCanvas(nodeIds);
      console.log('🌱 EXPORT PREVIEW: exportToCanvas result:', success);
      
      if (success) {
        // Navigate to canvas to see results
        const { useUnifiedStore } = await import('../../../store/unifiedStore');
        const unifiedStore = useUnifiedStore.getState();
        unifiedStore.navigateToModule('canvas', { source: 'mind-garden-export' });
        onClose();
      } else {
        console.error('🌱 EXPORT PREVIEW: Export failed');
      }
    } catch (error) {
      console.error('🌱 EXPORT PREVIEW: Export error:', error);
    }
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'narrative': return 'bg-blue-500';
      case 'formal': return 'bg-green-500';
      case 'symbolic': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPhaseLabel = (phase) => {
    switch (phase) {
      case 'narrative': return 'Narrative';
      case 'formal': return 'Formal';
      case 'symbolic': return 'Symbolic';
      default: return 'Unphased';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Export to Canvas</h2>
            <p className="text-gray-400 text-sm mt-1">
              Preview how {selectedNodes.length} selected nodes will appear in Canvas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-700 rounded-lg">
              <button
                onClick={() => setPreviewMode('list')}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  previewMode === 'list' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setPreviewMode('visual')}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  previewMode === 'visual' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Visual
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {previewMode === 'list' ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-400 mb-4">
                These nodes will be converted to Canvas note cards:
              </div>
              
              {selectedNodes.map((node, index) => (
                <div key={node.id} className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                      <span className="text-purple-300 text-sm font-medium">{index + 1}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium truncate">
                        {node.data.title || 'Untitled'}
                      </h3>
                      {node.data.phase && (
                        <span className={`px-2 py-1 text-xs rounded-full text-white ${getPhaseColor(node.data.phase)}`}>
                          {getPhaseLabel(node.data.phase)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {node.data.content || 'No content'}
                    </p>
                    {node.data.tags && node.data.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {node.data.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-0.5 text-xs bg-gray-600 text-gray-300 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    <ArrowRight className="w-5 h-5 text-gray-500" />
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className="w-16 h-12 bg-gray-600 rounded border-2 border-dashed border-gray-500 flex items-center justify-center">
                      <span className="text-xs text-gray-400">Note</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-400 mb-4">
                Visual layout preview (approximate Canvas positioning):
              </div>
              
              <div className="relative bg-gray-900 rounded-lg p-8 min-h-[400px] border border-gray-700">
                {selectedNodes.map((node) => (
                  <div
                    key={node.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${Math.max(10, Math.min(90, (node.position.x / 10)))}%`,
                      top: `${Math.max(10, Math.min(90, (node.position.y / 10)))}%`
                    }}
                  >
                    <div className="w-48 bg-gray-700 rounded-lg p-3 border border-gray-600 shadow-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-white text-sm font-medium truncate">
                          {node.data.title || 'Untitled'}
                        </h4>
                        {node.data.phase && (
                          <div className={`w-2 h-2 rounded-full ${getPhaseColor(node.data.phase)}`} />
                        )}
                      </div>
                      <p className="text-gray-400 text-xs line-clamp-3">
                        {node.data.content || 'No content'}
                      </p>
                      {node.data.tags && node.data.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {node.data.tags.slice(0, 2).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-1.5 py-0.5 text-xs bg-gray-600 text-gray-300 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {node.data.tags.length > 2 && (
                            <span className="text-xs text-gray-500">+{node.data.tags.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="w-full h-full" style={{
                    backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                  }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="text-sm text-gray-400">
            <p>Export will create {selectedNodes.length} new note cards in Canvas</p>
            <p>Original Mind Garden nodes will remain unchanged</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                console.log('🌱 EXPORT PREVIEW: Button clicked!', e);
                handleExport();
              }}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export to Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPreview;