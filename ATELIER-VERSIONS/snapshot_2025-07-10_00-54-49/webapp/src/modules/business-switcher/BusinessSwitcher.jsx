import { motion } from 'framer-motion';
import { Card } from '../../components/ui';
import { BUSINESS_MODES } from '../../config/constants';
import { useStore } from '../../store';
import { Sparkles, Film, Brain } from 'lucide-react';

const modes = [
  {
    id: BUSINESS_MODES.NFT,
    title: 'NFT',
    description: 'Create and manage digital art collections',
    icon: Sparkles,
    features: ['Smart contracts', 'Marketplace integration', 'Collection management']
  },
  {
    id: BUSINESS_MODES.VFX,
    title: 'VFX',
    description: 'Visual effects and motion graphics pipeline',
    icon: Film,
    features: ['Compositing tools', 'Render management', 'Asset tracking']
  },
  {
    id: BUSINESS_MODES.AI,
    title: 'AI',
    description: 'AI-powered creative tools and workflows',
    icon: Brain,
    features: ['Generative models', 'Prompt engineering', 'Training datasets']
  }
];

const BusinessSwitcher = () => {
  const businessMode = useStore((state) => state.businessMode);
  const setBusinessMode = useStore((state) => state.setBusinessMode);
  
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Business Mode</h2>
        <p className="mt-1 text-gray-600 dark:text-gray-300">Switch between different creative workflows</p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modes.map((mode, index) => {
          const Icon = mode.icon;
          const isSelected = businessMode === mode.id;
          
          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setBusinessMode(mode.id)}
            >
              <Card 
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'ring-2 ring-gray-900 dark:ring-gray-100 bg-gray-50 dark:bg-gray-800' 
                    : ''
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-4 rounded-2xl mb-4 ${
                    isSelected 
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}>
                    <Icon size={32} />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{mode.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{mode.description}</p>
                  
                  <div className="mt-4 space-y-2 w-full">
                    {mode.features.map((feature, idx) => (
                      <div 
                        key={idx}
                        className={`text-xs px-3 py-2 rounded-lg ${
                          isSelected 
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' 
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Current mode: <span className="font-semibold text-gray-900 dark:text-white">{businessMode.toUpperCase()}</span>
        </p>
      </motion.div>
    </div>
  );
};

export default BusinessSwitcher;