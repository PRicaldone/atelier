/**
 * Consolidation Panel - Transforms temporary brainstorm into permanent project
 * 
 * Features:
 * - Granular node selection
 * - Project configuration (name, type, phase)
 * - Parking lot for unselected ideas
 * - Preview of consolidated project
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  Check, 
  X, 
  Eye, 
  Trash2,
  Archive,
  Lightbulb,
  Sparkles,
  Film,
  Palette,
  Zap,
  ChevronRight
} from 'lucide-react';
import { useProjectStore, PROJECT_TYPES } from '../../../store/projectStore';
import { useUnifiedStore } from '../../../store/unifiedStore';
import { Card } from '../../../components/ui';

const PROJECT_TYPE_CONFIG = {
  [PROJECT_TYPES.NFT]: {
    icon: Sparkles,
    name: 'NFT Collection',
    color: 'from-purple-500 to-pink-500'
  },
  [PROJECT_TYPES.VFX]: {
    icon: Film,
    name: 'VFX Pipeline',
    color: 'from-blue-500 to-cyan-500'
  },
  [PROJECT_TYPES.BRANDING]: {
    icon: Palette,
    name: 'Brand Identity',
    color: 'from-green-500 to-teal-500'
  },
  [PROJECT_TYPES.GENERAL]: {
    icon: Zap,
    name: 'General Creative',
    color: 'from-orange-500 to-red-500'
  }
};

const ConsolidationPanel = ({ 
  isOpen, 
  onClose, 
  nodes = [], 
  edges = [],
  tempProjectId 
}) => {
  const { consolidateTemporaryProject } = useProjectStore();
  const { navigateToModule } = useUnifiedStore();
  
  const [step, setStep] = useState(1); // 1: Select nodes, 2: Configure project
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState(PROJECT_TYPES.GENERAL);
  const [selectionMode, setSelectionMode] = useState('specific'); // 'all' | 'specific'
  
  // Auto-select all nodes initially
  useEffect(() => {
    if (nodes.length > 0) {
      setSelectedNodes(nodes.map(n => n.id));
    }
  }, [nodes]);
  
  const handleNodeToggle = (nodeId) => {
    setSelectedNodes(prev => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };
  
  const handleBulkSelect = (action) => {
    switch (action) {
      case 'all':
        setSelectedNodes(nodes.map(n => n.id));
        break;
      case 'none':
        setSelectedNodes([]);
        break;
      case 'connected':
        // Select nodes with connections
        const connectedIds = edges.reduce((acc, edge) => {
          acc.add(edge.source);
          acc.add(edge.target);
          return acc;
        }, new Set());
        setSelectedNodes(Array.from(connectedIds));
        break;
      case 'recent':
        // Select recently modified nodes (last 30 minutes)
        const recentThreshold = Date.now() - 30 * 60 * 1000;
        const recentIds = nodes
          .filter(n => new Date(n.data.modified || n.data.created) > recentThreshold)
          .map(n => n.id);
        setSelectedNodes(recentIds);
        break;
    }
  };
  
  const handleConsolidate = async () => {
    if (!projectName.trim()) return;
    
    const nodeIds = selectionMode === 'all' ? [] : selectedNodes;
    const newProjectId = consolidateTemporaryProject(
      tempProjectId,
      projectName.trim(),
      projectType,
      nodeIds
    );
    
    if (newProjectId) {
      console.log('🎯 Consolidation successful:', newProjectId);
      onClose();
      // Stay in Mind Garden with new project
    } else {
      console.error('❌ Consolidation failed');
    }
  };
  
  const selectedNodesData = nodes.filter(n => selectedNodes.includes(n.id));
  const unselectedNodesData = nodes.filter(n => !selectedNodes.includes(n.id));
  const connectedEdges = edges.filter(e => 
    selectedNodes.includes(e.source) && selectedNodes.includes(e.target)
  );
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {step === 1 ? 'Select Ideas to Save' : 'Configure Project'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {step === 1 
                  ? 'Choose which nodes to transfer to your permanent project'
                  : 'Set up your new project with the selected ideas'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Selection Mode */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="all-nodes"
                      name="selection-mode"
                      checked={selectionMode === 'all'}
                      onChange={() => setSelectionMode('all')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="all-nodes" className="text-sm font-medium text-gray-900 dark:text-white">
                      Transfer all nodes
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="specific-nodes"
                      name="selection-mode"
                      checked={selectionMode === 'specific'}
                      onChange={() => setSelectionMode('specific')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="specific-nodes" className="text-sm font-medium text-gray-900 dark:text-white">
                      Select specific nodes
                    </label>
                  </div>
                </div>
                
                {selectionMode === 'specific' && (
                  <>
                    {/* Bulk Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Quick select:</span>
                      <button
                        onClick={() => handleBulkSelect('all')}
                        className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        All
                      </button>
                      <button
                        onClick={() => handleBulkSelect('none')}
                        className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        None
                      </button>
                      <button
                        onClick={() => handleBulkSelect('connected')}
                        className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                      >
                        Connected
                      </button>
                      <button
                        onClick={() => handleBulkSelect('recent')}
                        className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                      >
                        Recent
                      </button>
                    </div>
                    
                    {/* Node Selection Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {nodes.map((node) => {
                        const isSelected = selectedNodes.includes(node.id);
                        
                        return (
                          <motion.div
                            key={node.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleNodeToggle(node.id)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-500' 
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                  {node.data.title || node.data.content?.substring(0, 50) || 'Untitled'}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {node.data.content?.substring(0, 100) || 'No content'}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
                )}
                
                {/* Transfer Summary */}
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      {selectionMode === 'all' 
                        ? `All ${nodes.length} nodes will be transferred`
                        : `${selectedNodes.length} nodes selected for transfer`
                      }
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      {unselectedNodesData.length > 0 && selectionMode === 'specific' && 
                        `${unselectedNodesData.length} nodes will be moved to parking lot`
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    disabled={selectionMode === 'specific' && selectedNodes.length === 0}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Configure Project
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="configure"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Back Button */}
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 transform rotate-180" />
                  Back to Selection
                </button>
                
                {/* Project Configuration */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Enter project name..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Project Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(PROJECT_TYPE_CONFIG).map(([type, config]) => {
                        const IconComponent = config.icon;
                        const isSelected = projectType === type;
                        
                        return (
                          <motion.button
                            key={type}
                            onClick={() => setProjectType(type)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                                <IconComponent className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {config.name}
                                </h4>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Consolidation Summary */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">
                    Consolidation Summary
                  </h4>
                  <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                    <li>• {selectedNodesData.length} nodes will be transferred</li>
                    <li>• {connectedEdges.length} connections preserved</li>
                    {unselectedNodesData.length > 0 && (
                      <li>• {unselectedNodesData.length} nodes moved to parking lot</li>
                    )}
                    <li>• Project type: {PROJECT_TYPE_CONFIG[projectType].name}</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            {step === 2 && (
              <button
                onClick={handleConsolidate}
                disabled={!projectName.trim()}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Create Project
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConsolidationPanel;