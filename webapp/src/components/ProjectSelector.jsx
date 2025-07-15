/**
 * Project Selector Component
 * 
 * Unified project selection and creation interface that appears:
 * - On first launch (no projects)
 * - When explicitly switching projects
 * - When creating new projects
 * 
 * Features:
 * - Project type templates (NFT, VFX, Branding, General)
 * - Recent projects quick access
 * - Project search and filtering
 * - Project settings and metadata
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Folder, 
  Calendar, 
  Tag, 
  Settings,
  Palette,
  Film,
  Zap,
  Sparkles,
  ChevronRight,
  Clock,
  Users,
  Star
} from 'lucide-react';
import { useProjectStore, PROJECT_TYPES, PROJECT_PHASES } from '../store/projectStore';
import { useUnifiedStore } from '../store/unifiedStore';

// Project type configurations with icons and descriptions
const PROJECT_TYPE_CONFIG = {
  [PROJECT_TYPES.NFT]: {
    icon: Sparkles,
    name: 'NFT Collection',
    description: 'Digital art, community building, and blockchain integration',
    color: 'from-purple-500 to-pink-500',
    features: ['AI Art Concepts', 'Community Strategy', 'Roadmap Planning', 'Technical Integration']
  },
  [PROJECT_TYPES.VFX]: {
    icon: Film,
    name: 'VFX Pipeline',
    description: 'Visual effects, 3D workflows, and technical production',
    color: 'from-blue-500 to-cyan-500',
    features: ['Pipeline Design', 'Tool Integration', 'Technical Solutions', 'Project Management']
  },
  [PROJECT_TYPES.BRANDING]: {
    icon: Palette,
    name: 'Brand Identity',
    description: 'Brand strategy, visual identity, and market positioning',
    color: 'from-green-500 to-teal-500',
    features: ['Brand Strategy', 'Visual Identity', 'Marketing Concepts', 'Audience Development']
  },
  [PROJECT_TYPES.GENERAL]: {
    icon: Zap,
    name: 'General Creative',
    description: 'Flexible creative workspace for any project type',
    color: 'from-orange-500 to-red-500',
    features: ['Creative Ideation', 'Project Planning', 'Problem Solving', 'Adaptive Support']
  }
};

const ProjectSelector = ({ isOpen, onClose, selectedPhase = null, mode = 'select' }) => {
  const {
    projects,
    currentProjectId,
    createProject,
    createProjectFromTemplate,
    selectProject,
    getProjectStats
  } = useProjectStore();
  
  const { navigateToModule } = useUnifiedStore();
  
  const [view, setView] = useState('select'); // 'select' | 'create' | 'settings'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState(PROJECT_TYPES.GENERAL);
  const [projectName, setProjectName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Auto-open create form when selectedPhase is provided or mode is 'create'
  useEffect(() => {
    if (selectedPhase || mode === 'create') {
      setShowCreateForm(true);
    } else if (mode === 'select') {
      setShowCreateForm(false);
    }
  }, [selectedPhase, mode]);
  
  // Get project statistics
  const stats = getProjectStats();
  const projectList = Object.values(projects);
  
  // Filter projects based on search
  const filteredProjects = projectList.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle project creation
  const handleCreateProject = () => {
    if (!projectName.trim()) return;
    
    const projectId = createProjectFromTemplate(selectedType, projectName.trim());
    selectProject(projectId);
    
    setProjectName('');
    setShowCreateForm(false);
    onClose();
    
    // If we have a selected phase, navigate to Mind Garden
    if (selectedPhase) {
      console.log('🚀 Project created, navigating to Mind Garden for phase:', selectedPhase.title);
      navigateToModule('mind-garden');
    }
  };
  
  // Handle project selection
  const handleSelectProject = (projectId) => {
    selectProject(projectId);
    onClose();
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && showCreateForm && projectName.trim()) {
        handleCreateProject();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showCreateForm, projectName, onClose]);
  
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
                {showCreateForm ? 'Create New Project' : 'Select Project'}
                {selectedPhase && (
                  <span className="ml-2 text-lg font-medium text-blue-600 dark:text-blue-400">
                    for {selectedPhase.title}
                  </span>
                )}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {showCreateForm 
                  ? selectedPhase 
                    ? `Create a new project to start with ${selectedPhase.title} phase`
                    : 'Choose a template and configure your new creative workspace'
                  : `Choose from ${stats.totalProjects} projects or create a new one`
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <AnimatePresence mode="wait">
            {!showCreateForm ? (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Search and Create */}
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg
                      flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    New Project
                  </button>
                </div>
                
                {/* Recent Projects */}
                {stats.recentProjects.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Recent Projects
                    </h3>
                    <div className="grid gap-3">
                      {stats.recentProjects.slice(0, 3).map((project) => {
                        const config = PROJECT_TYPE_CONFIG[project.type];
                        const IconComponent = config.icon;
                        
                        return (
                          <motion.button
                            key={project.id}
                            onClick={() => handleSelectProject(project.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 rounded-xl border-2 transition-all text-left
                              ${currentProjectId === project.id 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                                <IconComponent className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                  {project.name}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {config.name} • {project.phase}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Clock className="w-4 h-4" />
                                {new Date(project.modified).toLocaleDateString()}
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* All Projects */}
                {filteredProjects.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      All Projects ({filteredProjects.length})
                    </h3>
                    <div className="grid gap-3 max-h-60 overflow-y-auto">
                      {filteredProjects.map((project) => {
                        const config = PROJECT_TYPE_CONFIG[project.type];
                        const IconComponent = config.icon;
                        
                        return (
                          <motion.button
                            key={project.id}
                            onClick={() => handleSelectProject(project.id)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`p-3 rounded-lg border transition-all text-left
                              ${currentProjectId === project.id 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                                <IconComponent className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                  {project.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {config.name}
                                </p>
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(project.modified).toLocaleDateString()}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Empty State */}
                {filteredProjects.length === 0 && (
                  <div className="text-center py-12">
                    <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No projects found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {searchTerm ? 'Try adjusting your search terms' : 'Create your first project to get started'}
                    </p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg
                        flex items-center gap-2 mx-auto transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Create Project
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Back Button */}
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 transform rotate-180" />
                  Back to Projects
                </button>
                
                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    autoFocus
                  />
                </div>
                
                {/* Project Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Project Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(PROJECT_TYPE_CONFIG).map(([type, config]) => {
                      const IconComponent = config.icon;
                      
                      return (
                        <motion.button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-xl border-2 transition-all text-left
                            ${selectedType === type 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                {config.name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                {config.description}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {config.features.map((feature, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-600 dark:text-gray-300"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Create Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateProject}
                    disabled={!projectName.trim()}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    Create Project
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProjectSelector;