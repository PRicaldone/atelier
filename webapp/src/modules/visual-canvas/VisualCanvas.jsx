import { motion } from 'framer-motion';

const VisualCanvas = () => {
  return (
    <div className="h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-semibold text-gray-900">Visual Canvas</h2>
        <p className="mt-1 text-gray-600">Create and visualize your ideas</p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative h-[calc(100vh-200px)] bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-grid-pattern opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(to right, #d2d2d7 1px, transparent 1px),
              linear-gradient(to bottom, #d2d2d7 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-gray-400 text-lg">Canvas area ready for implementation</p>
        </div>
      </motion.div>
    </div>
  );
};

export default VisualCanvas;