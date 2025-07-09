import { motion } from 'framer-motion';
import { useCanvasStore } from '../store.js';
import { ChevronRight, Home } from 'lucide-react';

export const BreadcrumbNavigation = () => {
  const { getBreadcrumbs, exitBoard, currentBoardId } = useCanvasStore();
  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  const handleBreadcrumbClick = (index) => {
    const stepsBack = breadcrumbs.length - 1 - index;
    for (let i = 0; i < stepsBack; i++) {
      exitBoard();
    }
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-20 left-4 z-40 bg-white rounded-lg shadow-md border border-gray-200 px-3 py-2"
    >
      <div className="flex items-center space-x-1 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.id} className="flex items-center">
            {index > 0 && <ChevronRight size={16} className="text-gray-400 mx-1" />}
            
            <button
              onClick={() => handleBreadcrumbClick(index)}
              className={`
                px-2 py-1 rounded transition-colors
                ${index === breadcrumbs.length - 1 
                  ? 'text-gray-900 font-medium cursor-default' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
              disabled={index === breadcrumbs.length - 1}
            >
              {index === 0 ? (
                <div className="flex items-center space-x-1">
                  <Home size={14} />
                  <span>{crumb.title}</span>
                </div>
              ) : (
                crumb.title
              )}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};