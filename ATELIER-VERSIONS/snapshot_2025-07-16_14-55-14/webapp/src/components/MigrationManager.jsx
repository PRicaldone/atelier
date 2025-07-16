/**
 * Migration Manager Component
 * 
 * Handles automatic migration from localStorage to project-scoped storage
 * when the app loads. Shows progress and handles errors gracefully.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  ArrowRight,
  FileText,
  Settings
} from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { 
  needsMigration, 
  performMigration, 
  getMigrationStatus,
  MIGRATION_STATUS
} from '../store/migrationUtils';

const MigrationManager = ({ children }) => {
  const [migrationState, setMigrationState] = useState({
    needed: false,
    inProgress: false,
    completed: false,
    error: null,
    step: null
  });
  
  const projectStore = useProjectStore();
  
  // Check if migration is needed on mount
  useEffect(() => {
    const checkMigration = async () => {
      try {
        const migrationStatus = getMigrationStatus();
        
        if (migrationStatus.needsMigration) {
          console.log('🔄 Migration needed:', migrationStatus);
          setMigrationState(prev => ({ ...prev, needed: true }));
        } else {
          console.log('🔄 No migration needed');
          setMigrationState(prev => ({ ...prev, completed: true }));
        }
      } catch (error) {
        console.error('🔄 Error checking migration status:', error);
        setMigrationState(prev => ({ 
          ...prev, 
          error: 'Failed to check migration status',
          completed: true // Allow app to continue
        }));
      }
    };
    
    checkMigration();
  }, []);
  
  // Perform migration when needed
  const handleMigration = async () => {
    if (!migrationState.needed) return;
    
    setMigrationState(prev => ({ 
      ...prev, 
      inProgress: true,
      step: 'Starting migration...'
    }));
    
    try {
      // Ensure project store is initialized
      if (!projectStore.initialized) {
        setMigrationState(prev => ({ 
          ...prev, 
          step: 'Initializing project system...' 
        }));
        projectStore.initialize();
      }
      
      // Perform the migration
      setMigrationState(prev => ({ 
        ...prev, 
        step: 'Migrating Canvas and MindGarden data...' 
      }));
      
      const success = await performMigration(projectStore);
      
      if (success) {
        setMigrationState(prev => ({ 
          ...prev, 
          inProgress: false,
          completed: true,
          step: 'Migration completed successfully!'
        }));
        
        // Refresh the app to use new storage
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error('Migration failed');
      }
      
    } catch (error) {
      console.error('🔄 Migration failed:', error);
      setMigrationState(prev => ({ 
        ...prev, 
        inProgress: false,
        error: error.message,
        step: null
      }));
    }
  };
  
  // Skip migration and continue with app
  const handleSkipMigration = () => {
    setMigrationState(prev => ({ 
      ...prev, 
      needed: false,
      completed: true 
    }));
  };
  
  // Render migration UI
  if (migrationState.needed && !migrationState.completed) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Data Migration Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Atelier needs to migrate your existing Canvas and MindGarden data to the new project-based system.
            </p>
          </div>
          
          {/* Migration Steps */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Migrate Canvas elements and boards
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Settings className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Migrate MindGarden conversations
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Create unified project workspace
              </span>
            </div>
          </div>
          
          {/* Current Step */}
          <AnimatePresence>
            {migrationState.inProgress && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    {migrationState.step}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Error Display */}
          <AnimatePresence>
            {migrationState.error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-700 dark:text-red-300">
                    {migrationState.error}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSkipMigration}
              disabled={migrationState.inProgress}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Skip Migration
            </button>
            <button
              onClick={handleMigration}
              disabled={migrationState.inProgress}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {migrationState.inProgress ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  Start Migration
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
          
          {/* Warning */}
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  <strong>Safe Migration:</strong> Your original data will be backed up before migration. 
                  You can restore it if needed.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Show completion message briefly
  if (migrationState.completed && migrationState.step) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Migration Complete!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your data has been successfully migrated to the new project system. 
            The app will reload to use the new storage.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Reloading application...
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Migration is complete or not needed, render the app
  return children;
};

export default MigrationManager;