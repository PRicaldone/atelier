/**
 * Quick Project Form - Simplified project creation for Brain with Purpose
 * 
 * Features:
 * - Simple name input + project type selection
 * - No complex configuration
 * - Direct navigation to Mind Garden after creation
 * - Focused on getting started quickly
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Film, 
  Palette, 
  Zap, 
  Target,
  ArrowRight 
} from 'lucide-react';
import { useProjectStore, PROJECT_TYPES } from '../../../store/projectStore';

const PROJECT_TYPE_CONFIG = {
  [PROJECT_TYPES.NFT]: {
    icon: Sparkles,
    name: 'NFT Collection',
    description: 'Digital art, community building, blockchain integration',
    color: 'from-purple-500 to-pink-500'
  },
  [PROJECT_TYPES.VFX]: {
    icon: Film,
    name: 'VFX Pipeline',
    description: 'Visual effects, 3D workflows, technical production',
    color: 'from-blue-500 to-cyan-500'
  },
  [PROJECT_TYPES.BRANDING]: {
    icon: Palette,
    name: 'Brand Identity',
    description: 'Brand strategy, visual identity, market positioning',
    color: 'from-green-500 to-teal-500'
  },
  [PROJECT_TYPES.GENERAL]: {
    icon: Zap,
    name: 'General Creative',
    description: 'Flexible creative workspace for any project type',
    color: 'from-orange-500 to-red-500'
  }
};

const QuickProjectForm = ({ isOpen, onClose, onProjectCreated }) => {
  const { createProject, selectProject } = useProjectStore();
  
  const [projectName, setProjectName] = useState('');
  const [selectedType, setSelectedType] = useState(PROJECT_TYPES.GENERAL);
  const [isCreating, setIsCreating] = useState(false);
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setProjectName('');
      setSelectedType(PROJECT_TYPES.GENERAL);
      setIsCreating(false);
    }
  }, [isOpen]);
  
  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    
    setIsCreating(true);
    
    try {
      // Create project
      const projectId = createProject(projectName.trim(), selectedType);
      
      // Select the new project
      selectProject(projectId);
      
      console.log('🎯 Quick project created:', projectName, selectedType);
      
      // Notify parent with project ID
      onProjectCreated(projectId);
      
    } catch (error) {
      console.error('❌ Quick project creation failed:', error);
      setIsCreating(false);
    }
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && projectName.trim() && !isCreating) {
        handleCreateProject();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, projectName, isCreating, onClose]);
  
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
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  🎯 Brain with Purpose
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Create your project and start thinking
                </p>
              </div>
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
        <div className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter your project name..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              autoFocus
              disabled={isCreating}
            />
          </div>
          
          {/* Project Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Project Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(PROJECT_TYPE_CONFIG).map(([type, config]) => {
                const IconComponent = config.icon;
                const isSelected = selectedType === type;
                
                return (
                  <motion.button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isCreating}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    } ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {config.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {config.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
          
          {/* Quick Start Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
              Ready to start thinking?
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Your project will be created and you'll be taken directly to Mind Garden 
              where you can start brainstorming and developing your ideas.
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isCreating}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateProject}
              disabled={!projectName.trim() || isCreating}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  Create & Start Thinking
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuickProjectForm;