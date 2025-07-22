import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui';
import { Brain, Target, Lightbulb, Zap } from 'lucide-react';
import { useUnifiedStore } from '../../store/unifiedStore';
import { useProjectStore } from '../../store/projectStore';
import { useState } from 'react';
import BrainFreestyleCard from './components/BrainFreestyleCard';
import BrainPurposeCard from './components/BrainPurposeCard';
import QuickProjectForm from './components/QuickProjectForm';

const startOptions = [
  {
    id: 'brain-freestyle',
    title: '🧠 Brain Freestyle',
    description: 'Start brainstorming freely - you can always create a project later',
    icon: Brain,
    color: 'text-purple-500',
    gradient: 'from-purple-500 to-pink-500',
    action: 'freestyle'
  },
  {
    id: 'brain-purpose',
    title: '🎯 Brain with Purpose',
    description: 'Start with a clear project idea in mind',
    icon: Target,
    color: 'text-blue-500',
    gradient: 'from-blue-500 to-cyan-500',
    action: 'purpose'
  }
];

const ProjectStart = () => {
  const { navigateToModule } = useUnifiedStore();
  const { createTemporaryProject } = useProjectStore();
  const [showQuickProjectForm, setShowQuickProjectForm] = useState(false);
  
  const handleStartOption = (option) => {
    console.log('🚀 Starting option:', option.title);
    
    switch (option.action) {
      case 'freestyle':
        // Create temporary project and go to Mind Garden
        console.log('🧠 Starting free thinking session');
        createTemporaryProject();
        navigateToModule('mind-garden');
        break;
        
      case 'purpose':
        // Show quick project form
        setShowQuickProjectForm(true);
        break;
        
      default:
        console.warn('Unknown action:', option.action);
    }
  };
  
  const handleQuickProjectClose = () => {
    setShowQuickProjectForm(false);
  };
  
  const handleProjectCreated = (projectId) => {
    console.log('✅ Project created:', projectId);
    setShowQuickProjectForm(false);
    navigateToModule('mind-garden');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <Brain className="w-8 h-8 text-purple-500" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Mind Garden</h2>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Your creative ideas start here. Choose how you want to begin thinking:
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
                    {option.action === 'freestyle' ? 'Start Free Thinking' : 'Create Project'} →
                  </button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {/* Quick Project Form Modal */}
      <AnimatePresence>
        {showQuickProjectForm && (
          <QuickProjectForm
            isOpen={showQuickProjectForm}
            onClose={handleQuickProjectClose}
            onProjectCreated={handleProjectCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectStart;