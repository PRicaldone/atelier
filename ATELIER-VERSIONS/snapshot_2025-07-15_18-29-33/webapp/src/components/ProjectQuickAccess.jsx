/**
 * Project Quick Access - Top bar component for project switching
 * 
 * Features:
 * - Current project indicator
 * - Quick project switching (Cmd+P)
 * - Recent projects dropdown
 * - Project status indicator
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Folder, 
  Plus, 
  Clock, 
  Sparkles, 
  Film, 
  Palette, 
  Zap,
  Lightbulb
} from 'lucide-react';
import { useProjectStore, PROJECT_TYPES } from '../store/projectStore';

const PROJECT_TYPE_ICONS = {
  [PROJECT_TYPES.NFT]: Sparkles,
  [PROJECT_TYPES.VFX]: Film,
  [PROJECT_TYPES.BRANDING]: Palette,
  [PROJECT_TYPES.GENERAL]: Zap,
  [PROJECT_TYPES.TEMPORARY]: Lightbulb
};

const ProjectQuickAccess = ({ onOpenProjectSelector }) => {
  const { 
    currentProjectId, 
    projects, 
    getCurrentProject, 
    getProjectStats,
    selectProject 
  } = useProjectStore();
  
  const [showDropdown, setShowDropdown] = useState(false);
  
  const currentProject = getCurrentProject();
  const stats = getProjectStats();
  
  const handleProjectSelect = (projectId) => {
    selectProject(projectId);
    setShowDropdown(false);
  };
  
  const handleNewProject = () => {
    setShowDropdown(false);
    onOpenProjectSelector();
  };
  
  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.project-dropdown')) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);
  
  if (!currentProject) {
    return (
      <button
        onClick={onOpenProjectSelector}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <Plus className="w-4 h-4" />
        Create Project
      </button>
    );
  }
  
  const ProjectIcon = PROJECT_TYPE_ICONS[currentProject.type] || Folder;
  
  return (
    <div className="relative project-dropdown">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <ProjectIcon className="w-4 h-4" />
          <span className="font-medium truncate max-w-32">
            {currentProject.name}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
          >
            {/* Current Project */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <ProjectIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {currentProject.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentProject.type} • {currentProject.phase}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Recent Projects */}
            {stats.recentProjects.length > 0 && (
              <div className="p-2">
                <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recent Projects
                </div>
                <div className="space-y-1">
                  {stats.recentProjects.slice(0, 4).map((project) => {
                    if (project.id === currentProjectId) return null;
                    
                    const Icon = PROJECT_TYPE_ICONS[project.type] || Folder;
                    
                    return (
                      <button
                        key={project.id}
                        onClick={() => handleProjectSelect(project.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {project.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {project.type}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {new Date(project.modified).toLocaleDateString()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleNewProject}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  New Project
                </span>
              </button>
              
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onOpenProjectSelector();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Folder className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Browse All Projects
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectQuickAccess;