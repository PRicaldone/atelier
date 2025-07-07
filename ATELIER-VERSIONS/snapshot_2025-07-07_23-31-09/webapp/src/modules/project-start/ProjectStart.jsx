import { motion } from 'framer-motion';
import { Card } from '../../components/ui';
import { Lightbulb, Palette, Code, Rocket } from 'lucide-react';
import { PROJECT_PHASES } from '../../config/constants';

const phases = [
  {
    id: PROJECT_PHASES.IDEATION,
    title: 'Ideation',
    description: 'Brainstorm and conceptualize your project ideas',
    icon: Lightbulb,
    color: 'text-yellow-500'
  },
  {
    id: PROJECT_PHASES.DESIGN,
    title: 'Design',
    description: 'Create visual mockups and design systems',
    icon: Palette,
    color: 'text-blue-500'
  },
  {
    id: PROJECT_PHASES.DEVELOPMENT,
    title: 'Development',
    description: 'Build and implement your project features',
    icon: Code,
    color: 'text-green-500'
  },
  {
    id: PROJECT_PHASES.LAUNCH,
    title: 'Launch',
    description: 'Deploy and share your project with the world',
    icon: Rocket,
    color: 'text-purple-500'
  }
];

const ProjectStart = () => {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-semibold text-gray-900">Start New Project</h2>
        <p className="mt-1 text-gray-600">Choose a phase to begin your creative journey</p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {phases.map((phase, index) => {
          const Icon = phase.icon;
          
          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl bg-gray-100 ${phase.color}`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{phase.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{phase.description}</p>
                    <button className="mt-4 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors">
                      Start {phase.title} →
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectStart;