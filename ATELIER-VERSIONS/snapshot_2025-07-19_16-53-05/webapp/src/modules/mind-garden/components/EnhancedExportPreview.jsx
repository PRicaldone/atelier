/**
 * Mind Garden v5.1 - Enhanced Export Preview
 * Day 6: Advanced Canvas structure preview with customization
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  X, 
  Eye, 
  Settings, 
  Layers, 
  Grid, 
  Zap,
  Target,
  GitBranch,
  FileText,
  Clock,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Info,
  RefreshCw,
  Maximize2,
  Minimize2,
  Play,
  Pause
} from 'lucide-react';
import SemanticExportEngine from './SemanticExportEngine';
import SmartGroupingSystem from './SmartGroupingSystem';
import { BRANCH_TYPES } from '../types/conversationTypes';

const EnhancedExportPreview = ({ 
  isOpen, 
  onClose, 
  conversationNodes, 
  onExport,
  topicExtractor
}) => {
  const [exportEngine] = useState(() => new SemanticExportEngine());
  const [groupingSystem] = useState(() => new SmartGroupingSystem(topicExtractor));
  
  // UI State
  const [activeTab, setActiveTab] = useState('preview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState('canvas');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Export Configuration
  const [exportConfig, setExportConfig] = useState({
    template: 'PROJECT_BOARD',
    groupingAlgorithm: 'SEMANTIC_CLUSTERING',
    layoutStrategy: 'board-focused',
    includeMetadata: true,
    preserveConnections: true,
    customization: {
      styling: {},
      elementDefaults: {},
      boardDefaults: {}
    }
  });
  
  // Export Results
  const [exportResult, setExportResult] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [groupingResult, setGroupingResult] = useState(null);
  
  // Templates and Options
  const exportTemplates = useMemo(() => [
    {
      id: 'PROJECT_BOARD',
      name: 'Project Board',
      description: 'Organize into structured project boards',
      icon: <Layers className="w-4 h-4" />,
      color: 'blue',
      bestFor: 'Project planning and organization'
    },
    {
      id: 'IDEATION_MAP',
      name: 'Ideation Map',
      description: 'Visual network of connected ideas',
      icon: <Grid className="w-4 h-4" />,
      color: 'purple',
      bestFor: 'Brainstorming and concept mapping'
    },
    {
      id: 'ACTION_PLAN',
      name: 'Action Plan',
      description: 'Implementation-focused tasks',
      icon: <Target className="w-4 h-4" />,
      color: 'green',
      bestFor: 'Task management and execution'
    },
    {
      id: 'RESEARCH_NOTES',
      name: 'Research Notes',
      description: 'Structured documentation',
      icon: <FileText className="w-4 h-4" />,
      color: 'orange',
      bestFor: 'Knowledge organization'
    },
    {
      id: 'PRESENTATION_FLOW',
      name: 'Presentation Flow',
      description: 'Linear presentation structure',
      icon: <Play className="w-4 h-4" />,
      color: 'red',
      bestFor: 'Presentations and storytelling'
    },
    {
      id: 'KNOWLEDGE_BASE',
      name: 'Knowledge Base',
      description: 'Hierarchical knowledge structure',
      icon: <BarChart3 className="w-4 h-4" />,
      color: 'indigo',
      bestFor: 'Documentation and reference'
    }
  ], []);

  const groupingAlgorithms = useMemo(() => [
    {
      id: 'SEMANTIC_CLUSTERING',
      name: 'Semantic Clustering',
      description: 'Group by meaning and content similarity',
      icon: <Zap className="w-4 h-4" />
    },
    {
      id: 'TOPIC_BASED',
      name: 'Topic-Based',
      description: 'Group by extracted topics and themes',
      icon: <GitBranch className="w-4 h-4" />
    },
    {
      id: 'BRANCH_BASED',
      name: 'Branch-Based',
      description: 'Group by conversation branch types',
      icon: <GitBranch className="w-4 h-4" />
    },
    {
      id: 'CONVERSATION_FLOW',
      name: 'Conversation Flow',
      description: 'Group by conversation continuity',
      icon: <GitBranch className="w-4 h-4" />
    },
    {
      id: 'TEMPORAL',
      name: 'Temporal',
      description: 'Group by creation time',
      icon: <Clock className="w-4 h-4" />
    }
  ], []);

  // Generate export preview
  const generateExportPreview = useCallback(async () => {
    if (!conversationNodes || conversationNodes.length === 0) return;
    
    setIsGenerating(true);
    
    try {
      console.log('🔄 Generating export preview...');
      
      // 1. Generate export with semantic engine
      const exportResult = await exportEngine.exportConversationToCanvas(
        conversationNodes,
        exportConfig
      );
      
      // 2. Generate grouping analysis
      const groupingResult = await groupingSystem.groupNodes(
        conversationNodes,
        exportConfig.groupingAlgorithm
      );
      
      // 3. Combine results
      setExportResult(exportResult);
      setAnalysisResult(exportResult.analysis);
      setGroupingResult(groupingResult);
      
      console.log('✅ Export preview generated:', {
        elements: exportResult.elements.length,
        groups: groupingResult.groups.length,
        quality: exportResult.analysis.readinessScore
      });
      
    } catch (error) {
      console.error('❌ Export preview generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [conversationNodes, exportConfig, exportEngine, groupingSystem]);

  // Regenerate preview when config changes
  useEffect(() => {
    if (isOpen && conversationNodes && conversationNodes.length > 0) {
      generateExportPreview();
    }
  }, [isOpen, conversationNodes, exportConfig, generateExportPreview]);

  // Handle template selection
  const handleTemplateSelect = useCallback((templateId) => {
    setExportConfig(prev => ({
      ...prev,
      template: templateId
    }));
  }, []);

  // Handle grouping algorithm change
  const handleGroupingAlgorithmChange = useCallback((algorithmId) => {
    setExportConfig(prev => ({
      ...prev,
      groupingAlgorithm: algorithmId
    }));
  }, []);

  // Handle export execution
  const handleExport = useCallback(async () => {
    if (!exportResult) return;
    
    try {
      await onExport(exportResult);
      onClose();
    } catch (error) {
      console.error('❌ Export execution failed:', error);
    }
  }, [exportResult, onExport, onClose]);

  // Get readiness indicator
  const getReadinessIndicator = useCallback((score) => {
    if (score >= 0.8) return { icon: CheckCircle, color: 'text-green-500', text: 'Excellent' };
    if (score >= 0.6) return { icon: CheckCircle, color: 'text-blue-500', text: 'Good' };
    if (score >= 0.4) return { icon: AlertCircle, color: 'text-yellow-500', text: 'Fair' };
    return { icon: AlertCircle, color: 'text-red-500', text: 'Poor' };
  }, []);

  // Render Canvas preview
  const renderCanvasPreview = () => {
    if (!exportResult || !exportResult.elements) return null;
    
    const { elements } = exportResult;
    
    // Calculate preview dimensions
    const bounds = elements.reduce((acc, element) => {
      const { x, y } = element.position;
      return {
        minX: Math.min(acc.minX, x),
        maxX: Math.max(acc.maxX, x + 200),
        minY: Math.min(acc.minY, y),
        maxY: Math.max(acc.maxY, y + 150)
      };
    }, { minX: 0, maxX: 0, minY: 0, maxY: 0 });
    
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    const scale = Math.min(400 / width, 300 / height, 1);
    
    return (
      <div className="relative bg-gray-50 border-2 border-gray-200 rounded-lg" style={{ height: '400px' }}>
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left'
          }}
        >
          {elements.map((element, index) => (
            <motion.div
              key={element.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: showAnimation ? index * 0.1 : 0 }}
              className="absolute"
              style={{
                left: element.position.x - bounds.minX,
                top: element.position.y - bounds.minY,
                width: element.type === 'board' ? '200px' : '150px',
                height: element.type === 'board' ? '150px' : '100px'
              }}
            >
              <div
                className={`w-full h-full rounded-lg border-2 p-2 text-xs ${
                  element.type === 'board' 
                    ? 'bg-gray-100 border-gray-400' 
                    : 'bg-white border-gray-300'
                }`}
                style={{
                  backgroundColor: element.style?.backgroundColor,
                  borderColor: element.style?.borderColor,
                  color: element.style?.textColor
                }}
              >
                <div className="font-semibold truncate" title={element.data.title}>
                  {element.data.title}
                </div>
                {element.type !== 'board' && (
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {element.data.content?.substring(0, 50)}...
                  </div>
                )}
                {element.data.branchType && (
                  <div className="absolute top-1 right-1">
                    <div className={`w-2 h-2 rounded-full ${getBranchColor(element.data.branchType)}`} />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Preview Controls */}
        <div className="absolute top-2 right-2 flex space-x-1">
          <button
            onClick={() => setShowAnimation(!showAnimation)}
            className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
            title="Toggle animation"
          >
            {showAnimation ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
            title="Toggle size"
          >
            {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>
    );
  };

  // Render statistics
  const renderStatistics = () => {
    if (!exportResult || !analysisResult) return null;
    
    const { statistics } = exportResult;
    const readiness = getReadinessIndicator(analysisResult.readinessScore);
    
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Export Statistics</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Canvas Elements:</span>
              <span className="font-medium">{statistics.totalElements}</span>
            </div>
            <div className="flex justify-between">
              <span>Boards:</span>
              <span className="font-medium">{statistics.boardCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Notes:</span>
              <span className="font-medium">{statistics.noteCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Links:</span>
              <span className="font-medium">{statistics.linkCount}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Quality Analysis</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span>Readiness:</span>
              <div className="flex items-center space-x-1">
                <readiness.icon className={`w-4 h-4 ${readiness.color}`} />
                <span className="font-medium">{readiness.text}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span>Completion:</span>
              <span className="font-medium">
                {Math.round((analysisResult.completedNodes / analysisResult.nodeCount) * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Depth:</span>
              <span className="font-medium">{analysisResult.conversationDepth}</span>
            </div>
            <div className="flex justify-between">
              <span>Coherence:</span>
              <span className="font-medium">{Math.round(analysisResult.coherenceScore * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render grouping analysis
  const renderGroupingAnalysis = () => {
    if (!groupingResult) return null;
    
    const { groups, metrics, statistics } = groupingResult;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{statistics.groupCount}</div>
            <div className="text-sm text-blue-700">Groups Created</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{statistics.averageGroupSize.toFixed(1)}</div>
            <div className="text-sm text-green-700">Avg Group Size</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{Math.round(metrics.overallQuality * 100)}%</div>
            <div className="text-sm text-purple-700">Quality Score</div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Group Breakdown</h4>
          <div className="space-y-2">
            {groups.map((group, index) => (
              <div key={group.id} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getGroupTypeColor(group.type)}`} />
                  <span className="font-medium">{group.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {group.nodes.length} nodes
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Helper functions
  const getBranchColor = (branchType) => {
    switch (branchType) {
      case BRANCH_TYPES.EXPLORATION: return 'bg-blue-400';
      case BRANCH_TYPES.REFINEMENT: return 'bg-purple-400';
      case BRANCH_TYPES.IMPLEMENTATION: return 'bg-green-400';
      case BRANCH_TYPES.CRITIQUE: return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const getGroupTypeColor = (groupType) => {
    switch (groupType) {
      case 'semantic': return 'bg-blue-400';
      case 'topic': return 'bg-purple-400';
      case 'branch': return 'bg-green-400';
      case 'temporal': return 'bg-yellow-400';
      case 'hierarchy': return 'bg-indigo-400';
      default: return 'bg-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 overflow-hidden ${
            isExpanded ? 'max-h-[95vh]' : 'max-h-[90vh]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Export to Canvas
                </h2>
                <p className="text-sm text-gray-600">
                  Transform your conversation into structured Canvas elements
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex h-full">
            {/* Left Panel - Configuration */}
            <div className="w-80 border-r border-gray-200 overflow-y-auto">
              {/* Template Selection */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3">Export Template</h3>
                <div className="space-y-2">
                  {exportTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        exportConfig.template === template.id
                          ? `border-${template.color}-500 bg-${template.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`text-${template.color}-600`}>
                          {template.icon}
                        </div>
                        <span className="font-medium">{template.name}</span>
                      </div>
                      <div className="text-xs text-gray-600">{template.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Best for: {template.bestFor}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grouping Algorithm */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3">Grouping Algorithm</h3>
                <div className="space-y-2">
                  {groupingAlgorithms.map((algorithm) => (
                    <button
                      key={algorithm.id}
                      onClick={() => handleGroupingAlgorithmChange(algorithm.id)}
                      className={`w-full p-2 rounded-lg border text-left transition-all ${
                        exportConfig.groupingAlgorithm === algorithm.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {algorithm.icon}
                        <span className="font-medium text-sm">{algorithm.name}</span>
                      </div>
                      <div className="text-xs text-gray-600">{algorithm.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export Options */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={exportConfig.includeMetadata}
                      onChange={(e) => setExportConfig(prev => ({
                        ...prev,
                        includeMetadata: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm">Include metadata</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={exportConfig.preserveConnections}
                      onChange={(e) => setExportConfig(prev => ({
                        ...prev,
                        preserveConnections: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm">Preserve connections</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="flex-1 overflow-y-auto">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                {[
                  { id: 'preview', label: 'Preview', icon: Eye },
                  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
                  { id: 'grouping', label: 'Grouping', icon: Layers }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="flex items-center space-x-3">
                      <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                      <span className="text-gray-600">Generating export preview...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {activeTab === 'preview' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800">Canvas Preview</h3>
                          <button
                            onClick={() => setShowAnimation(!showAnimation)}
                            className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
                          >
                            {showAnimation ? 'Disable' : 'Enable'} Animation
                          </button>
                        </div>
                        {renderCanvasPreview()}
                        
                        {analysisResult && analysisResult.recommendations.length > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Info className="w-4 h-4 text-yellow-600" />
                              <span className="font-medium text-yellow-800">Recommendations</span>
                            </div>
                            <ul className="text-sm text-yellow-700 space-y-1">
                              {analysisResult.recommendations.map((rec, index) => (
                                <li key={index}>• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {activeTab === 'statistics' && renderStatistics()}
                    
                    {activeTab === 'grouping' && renderGroupingAnalysis()}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {exportResult && (
                <span>
                  Ready to export {exportResult.statistics.totalElements} elements
                  {analysisResult && ` • Quality: ${Math.round(analysisResult.readinessScore * 100)}%`}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={generateExportPreview}
                disabled={isGenerating}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Regenerate
              </button>
              
              <button
                onClick={handleExport}
                disabled={!exportResult || isGenerating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export to Canvas</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancedExportPreview;