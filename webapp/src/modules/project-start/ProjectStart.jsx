import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui';
import { Brain, FolderPlus, FolderOpen } from 'lucide-react';
import { useUnifiedStore } from '../../store/unifiedStore';
import { useProjectStore } from '../../store/projectStore';
import { useState } from 'react';
import ProjectSelector from '../../components/ProjectSelector';

const startOptions = [
  {
    id: 'quick-brainstorm',
    title: 'Quick Brainstorm',
    description: 'Start mind mapping immediately without project setup',
    icon: Brain,
    color: 'text-purple-500',
    gradient: 'from-purple-500 to-pink-500',
    action: 'brainstorm'
  },
  {
    id: 'new-project',
    title: 'New Project',
    description: 'Create a structured project with templates and organization',
    icon: FolderPlus,
    color: 'text-blue-500',
    gradient: 'from-blue-500 to-cyan-500',
    action: 'create'
  },
  {
    id: 'open-project',
    title: 'Open Project',
    description: 'Continue working on an existing project',
    icon: FolderOpen,
    color: 'text-green-500',
    gradient: 'from-green-500 to-teal-500',
    action: 'open'
  }
];

const ProjectStart = () => {
  const { navigateToModule } = useUnifiedStore();
  const { createTemporaryProject } = useProjectStore();
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [selectorMode, setSelectorMode] = useState('select'); // 'select' | 'create'
  
  const handleStartOption = (option) => {
    console.log('🚀 Starting option:', option.title);
    
    switch (option.action) {
      case 'brainstorm':
        // Create temporary project and go to Mind Garden
        console.log('🧠 Starting quick brainstorm session');
        createTemporaryProject();
        navigateToModule('mind-garden');
        break;
        
      case 'create':
        // Show project selector in creation mode
        setSelectorMode('create');
        setShowProjectSelector(true);
        break;
        
      case 'open':
        // Show project selector in selection mode
        setSelectorMode('select');
        setShowProjectSelector(true);
        break;
        
      default:
        console.warn('Unknown action:', option.action);
    }
  };
  
  const handleProjectSelectorClose = () => {
    setShowProjectSelector(false);
    setSelectorMode('select');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Start Creative Session</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">How would you like to begin your creative work today?</p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {startOptions.map((option, index) => {
          const Icon = option.icon;
          
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => handleStartOption(option)}>
                <div className="text-center p-8">
                  <div className={`inline-flex p-6 rounded-2xl bg-gradient-to-br ${option.gradient} mb-6 group-hover:scale-105 transition-transform`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{option.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{option.description}</p>
                  <button 
                    className="w-full py-3 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    {option.title} →
                  </button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {/* Project Selector Modal */}
      <AnimatePresence>
        {showProjectSelector && (
          <ProjectSelector
            isOpen={showProjectSelector}
            onClose={handleProjectSelectorClose}
            mode={selectorMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectStart;