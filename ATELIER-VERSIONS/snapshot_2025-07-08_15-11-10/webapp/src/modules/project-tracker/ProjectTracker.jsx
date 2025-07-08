import { motion } from 'framer-motion';
import { Card } from '../../components/ui';
import { Clock, CheckCircle, Circle, AlertCircle } from 'lucide-react';

const mockProjects = [
  { id: 1, name: 'NFT Collection Launch', status: 'completed', phase: 'Launch', date: '2024-01-15' },
  { id: 2, name: 'VFX Studio Pipeline', status: 'in-progress', phase: 'Development', date: '2024-01-20' },
  { id: 3, name: 'AI Art Generator', status: 'planning', phase: 'Design', date: '2024-01-22' },
  { id: 4, name: 'Digital Gallery', status: 'on-hold', phase: 'Ideation', date: '2024-01-10' },
];

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-green-500', label: 'Completed' },
  'in-progress': { icon: Clock, color: 'text-blue-500', label: 'In Progress' },
  planning: { icon: Circle, color: 'text-yellow-500', label: 'Planning' },
  'on-hold': { icon: AlertCircle, color: 'text-gray-400', label: 'On Hold' },
};

const ProjectTracker = () => {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-semibold text-gray-900">Project Tracker</h2>
        <p className="mt-1 text-gray-600">Monitor and manage all your projects</p>
      </motion.div>
      
      <div className="space-y-4">
        {mockProjects.map((project, index) => {
          const status = statusConfig[project.status];
          const StatusIcon = status.icon;
          
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover={false} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <StatusIcon className={`${status.color}`} size={20} />
                  <div>
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>{project.phase}</span>
                      <span>•</span>
                      <span>{project.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`text-sm font-medium ${status.color}`}>
                    {status.label}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" transform="rotate(45 8 8)"/>
                    </svg>
                  </button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectTracker;