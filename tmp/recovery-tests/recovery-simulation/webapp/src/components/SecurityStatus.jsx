/**
 * Security Status Component - Shows current security state
 * Useful for development and debugging
 */

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Key, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import authPlaceholder from '../utils/authPlaceholder';
import secureStorage from '../utils/secureStorage';
import { getMigrationStatus } from '../utils/migrationSecureStorage';

const SecurityStatus = () => {
  const [authState, setAuthState] = useState(null);
  const [storageStats, setStorageStats] = useState(null);
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Check auth state
    const unsubscribe = authPlaceholder.onAuthStateChange((user, state) => {
      setAuthState({ user, state });
    });

    // Initial auth state
    setAuthState({
      user: authPlaceholder.getCurrentUser(),
      state: authPlaceholder.isAuthenticated() ? 'authenticated' : 'unauthenticated'
    });

    // Get storage stats
    setStorageStats(secureStorage.getStorageStats());
    
    // Get migration status
    setMigrationStatus(getMigrationStatus());

    // Check API proxy status
    checkApiStatus();

    return unsubscribe;
  }, []);

  const checkApiStatus = async () => {
    try {
      // Simple connectivity test
      const response = await fetch('/api/health', { method: 'GET' });
      setApiStatus(response.ok ? 'connected' : 'error');
    } catch (error) {
      setApiStatus('offline');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
      case 'authenticated':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'offline':
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
      case 'authenticated':
        return 'text-green-600';
      case 'offline':
      case 'error':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Hide in production
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left"
        >
          <Shield className="w-5 h-5 text-blue-500" />
          <span className="font-medium">Security Status</span>
          <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
            DEV
          </span>
        </button>

        {expanded && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
            {/* Authentication Status */}
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Authentication:</span>
              <span className={`text-sm ${getStatusColor(authState?.state)}`}>
                {authState?.state || 'unknown'}
              </span>
              {getStatusIcon(authState?.state)}
            </div>

            {authState?.user && (
              <div className="ml-7 text-xs text-gray-500">
                User: {authState.user.username} ({authState.user.role})
                {authState.user.isDemoUser && <span className="ml-1 text-yellow-600">[DEMO]</span>}
              </div>
            )}

            {/* API Proxy Status */}
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">API Proxy:</span>
              <span className={`text-sm ${getStatusColor(apiStatus)}`}>
                {apiStatus}
              </span>
              {getStatusIcon(apiStatus)}
            </div>

            {/* Storage Encryption */}
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Encrypted Storage:</span>
              <span className="text-sm text-green-600">
                {migrationStatus?.encryptionPercentage || 0}% encrypted
              </span>
              {migrationStatus?.needsMigration ? (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
            
            {migrationStatus?.needsMigration && (
              <div className="ml-7 text-xs text-yellow-600">
                Migration needed: {storageStats?.totalKeys - storageStats?.encryptedKeys || 0} unencrypted keys
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => console.log('Auth Debug:', authPlaceholder.getDebugInfo())}
                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                Debug Auth
              </button>
              <button
                onClick={() => console.log('Storage Stats:', { storageStats, migrationStatus })}
                className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800"
              >
                Debug Storage
              </button>
              <button
                onClick={checkApiStatus}
                className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800"
              >
                Test API
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityStatus;