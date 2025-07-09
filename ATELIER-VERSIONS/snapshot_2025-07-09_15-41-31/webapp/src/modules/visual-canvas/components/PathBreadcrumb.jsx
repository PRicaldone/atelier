import React from 'react';
import { motion } from 'framer-motion';
import { useCanvasStore } from '../store.js';
import { ChevronRight, Home, Folder } from 'lucide-react';

const PathBreadcrumb = () => {
  const { getBreadcrumbs, enterBoard, exitBoard, currentBoardId } = useCanvasStore();
  const breadcrumbs = getBreadcrumbs();

  const handleBreadcrumbClick = (crumbId) => {
    console.log('PathBreadcrumb: Navigating to', crumbId, 'from breadcrumbs:', breadcrumbs);
    
    if (crumbId === 'root') {
      // Go back to root - exit all boards
      let attempts = 0;
      while (useCanvasStore.getState().currentBoardId && attempts < 10) {
        exitBoard();
        attempts++;
      }
    } else {
      // Navigate to specific board by going back the right number of steps
      const currentIndex = breadcrumbs.findIndex(b => b.id === crumbId);
      if (currentIndex === -1) {
        console.log('Breadcrumb not found in path');
        return;
      }
      
      const stepsBack = breadcrumbs.length - 1 - currentIndex;
      console.log('Steps back needed:', stepsBack);
      
      for (let i = 0; i < stepsBack; i++) {
        exitBoard();
      }
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 px-4 py-2 z-30"
      style={{ 
        left: '240px',
        right: '320px'
      }}
    >
      <div className="flex items-center text-sm text-gray-600">
        <span className="text-gray-500 mr-2">Path:</span>
        
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.id}>
            {index > 0 && (
              <ChevronRight size={12} className="text-gray-400 mx-1" />
            )}
            
            <button
              onClick={() => handleBreadcrumbClick(crumb.id)}
              className={`flex items-center px-2 py-1 rounded hover:bg-gray-200 transition-colors ${
                index === breadcrumbs.length - 1 
                  ? 'text-gray-900 font-medium bg-gray-200' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {index === 0 ? (
                <>
                  <Home size={14} className="mr-1" />
                  <span>{crumb.title}</span>
                </>
              ) : (
                <>
                  <Folder size={14} className="mr-1" />
                  <span>{crumb.title}</span>
                </>
              )}
            </button>
          </React.Fragment>
        ))}
        
        {/* Current level indicator */}
        {breadcrumbs.length > 1 && (
          <span className="ml-4 text-xs text-gray-400">
            Level {breadcrumbs.length - 1}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default PathBreadcrumb;