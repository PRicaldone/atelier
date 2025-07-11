import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui';
import { Lightbulb, Palette, Code, Rocket, Brain, Eye, EyeOff } from 'lucide-react';
import MindGardenCanvas from './MindGarden/MindGardenCanvas';
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
  const [mindMapVisible, setMindMapVisible] = useState('hidden'); // 'hidden', 'side', 'full'
  const [currentPhase, setCurrentPhase] = useState('dump');

  const toggleMindMap = () => {
    const states = ['hidden', 'side', 'full'];
    const currentIndex = states.indexOf(mindMapVisible);
    const nextIndex = (currentIndex + 1) % states.length;
    setMindMapVisible(states[nextIndex]);
  };

  const projectPhases = [
    {
      id: 'dump',
      title: 'Inspiration Dump',
      description: 'Capture all your ideas without structure',
      color: 'bg-yellow-500',
      icon: Lightbulb
    },
    {
      id: 'sort',
      title: 'Idea Sorting',
      description: 'Organize and group related concepts',
      color: 'bg-blue-500',
      icon: Palette
    },
    {
      id: 'foundation',
      title: 'Foundation Block',
      description: 'Define narrative, formal and symbolic levels',
      color: 'bg-green-500',
      icon: Code
    },
    {
      id: 'decision',
      title: 'Start or Park',
      description: 'Decide to proceed or archive the project',
      color: 'bg-purple-500',
      icon: Rocket
    }
  ];

  return (
    <div className="h-screen flex">
      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        mindMapVisible === 'full' ? 'w-0 overflow-hidden' : 
        mindMapVisible === 'side' ? 'w-2/3' : 'w-full'
      }`}>
        <div className="p-6">
          {/* Header with Mind Map Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex justify-between items-center"
          >
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Project Start</h2>
              <p className="mt-1 text-gray-600 dark:text-gray-300">Guide your ideas through the creative process</p>
            </div>
            <button
              onClick={toggleMindMap}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Brain className="w-5 h-5" />
              <span>Mind Garden</span>
              {mindMapVisible === 'hidden' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </motion.div>

          {/* Phase Navigation */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {projectPhases.map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => setCurrentPhase(phase.id)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    currentPhase === phase.id
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {phase.title}
                </button>
              ))}
            </div>
          </div>

          {/* Current Phase Content */}
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentPhase === 'dump' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Inspiration Dump</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Collect all your ideas, references, and inspiration without worrying about organization.
                </p>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <Lightbulb className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Drop images, notes, links, or any inspiration here</p>
                  </div>
                </div>
              </Card>
            )}

            {currentPhase === 'sort' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Idea Sorting</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Group related ideas and identify patterns with AI assistance.
                </p>
                <div className="text-center py-12">
                  <Palette className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">AI-powered categorization coming soon</p>
                </div>
              </Card>
            )}

            {currentPhase === 'foundation' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Foundation Block</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Define your project across three essential dimensions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Narrative</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Story, message, concept</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Formal</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Visual style, techniques</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Symbolic</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Meaning, metaphors</p>
                  </div>
                </div>
              </Card>
            )}

            {currentPhase === 'decision' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Start or Park</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Ready to begin? Move to active development or save for later.
                </p>
                <div className="flex space-x-4">
                  <button className="flex-1 py-3 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    → Start Project
                  </button>
                  <button className="flex-1 py-3 px-6 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    📦 Park for Later
                  </button>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      {/* Mind Map Panel */}
      {mindMapVisible !== 'hidden' && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className={`bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 ${
            mindMapVisible === 'full' ? 'w-full' : 'w-1/3'
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 dark:text-white">Mind Garden</h3>
                <div className="flex space-x-2">
                  <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800 dark:text-white">
                    <option>Radial</option>
                    <option>Tree</option>
                    <option>Force</option>
                  </select>
                  <button
                    onClick={toggleMindMap}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    {mindMapVisible === 'full' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <MindGardenCanvas currentPhase={currentPhase} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProjectStart;