/**
 * Crypto Migration Dashboard - Manage encryption method migration
 * Interface for migrating between CryptoJS and Web Crypto API
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Database,
  Settings,
  Play,
  RefreshCw,
  BarChart3,
  Info,
  Clock,
  Download
} from 'lucide-react';
import hybridSecureStorage from '../utils/hybridSecureStorage';
import webCryptoStorage from '../utils/webCryptoStorage';
import secureStorage from '../utils/secureStorage';

const CryptoMigrationDashboard = () => {
  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState(null);
  const [migrationStatus, setMigrationStatus] = useState('idle');
  const [migrationResult, setMigrationResult] = useState(null);
  const [performanceResults, setPerformanceResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const storageStats = hybridSecureStorage.getStorageStats();
      const configuration = hybridSecureStorage.getConfiguration();
      
      setStats(storageStats);
      setConfig(configuration);
    } catch (error) {
      console.error('Failed to load crypto migration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const performMigration = async () => {
    try {
      setMigrationStatus('running');
      setMigrationResult(null);
      
      const result = await hybridSecureStorage.performMigration('to-webcrypto');
      
      setMigrationResult(result);
      setMigrationStatus('completed');
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationResult({ 
        success: false, 
        error: error.message 
      });
      setMigrationStatus('failed');
    }
  };

  const runPerformanceTest = async () => {
    try {
      setMigrationStatus('testing');
      
      const results = await hybridSecureStorage.performanceComparison(50);
      setPerformanceResults(results);
      setMigrationStatus('idle');
    } catch (error) {
      console.error('Performance test failed:', error);
      setMigrationStatus('idle');
    }
  };

  const updateConfiguration = (updates) => {
    hybridSecureStorage.configure(updates);
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const exportData = () => {
    const exportData = {
      stats,
      config,
      migrationResult,
      performanceResults,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atelier-crypto-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'webcrypto':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cryptojs':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (supported) => {
    return supported ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <AlertTriangle className="w-5 h-5 text-yellow-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading encryption analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Crypto Migration Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage encryption method migration and performance analysis</p>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Current Method</h3>
            </div>
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getMethodColor(config?.preferredMethod)}`}>
              {config?.preferredMethod === 'webcrypto' ? 'Web Crypto API' : 'CryptoJS'}
            </div>
            {config?.autoMigration && (
              <p className="text-xs text-gray-500 mt-2">Auto-migration enabled</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-3">
              <Database className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">Data Distribution</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Web Crypto:</span>
                <span className="font-medium">{stats?.webcrypto?.encryptedKeys || 0} keys</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>CryptoJS:</span>
                <span className="font-medium">{stats?.cryptojs?.encryptedKeys || 0} keys</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Web Crypto Support</h3>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(config?.webCryptoSupported)}
              <span className="text-sm font-medium">
                {config?.webCryptoSupported ? 'Supported' : 'Not Supported'}
              </span>
            </div>
          </div>
        </div>

        {/* Migration Control */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Migration Control</h2>
              <p className="text-gray-600 text-sm mt-1">
                Migrate encryption from CryptoJS to Web Crypto API for enhanced security
              </p>
            </div>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
              Export Analysis
            </button>
          </div>

          {/* Migration Status */}
          {migrationStatus !== 'idle' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                {migrationStatus === 'running' && <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />}
                {migrationStatus === 'testing' && <BarChart3 className="w-5 h-5 text-blue-600" />}
                {migrationStatus === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                {migrationStatus === 'failed' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                <span className="font-medium">
                  {migrationStatus === 'running' && 'Migration in progress...'}
                  {migrationStatus === 'testing' && 'Running performance tests...'}
                  {migrationStatus === 'completed' && 'Migration completed successfully'}
                  {migrationStatus === 'failed' && 'Migration failed'}
                </span>
              </div>
            </div>
          )}

          {/* Migration Result */}
          {migrationResult && (
            <div className="mb-6 p-4 bg-gray-50 border rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Migration Results</h3>
              {migrationResult.success ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Items Attempted:</span>
                    <span className="font-medium">{migrationResult.results?.attempted || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Successfully Migrated:</span>
                    <span className="font-medium text-green-600">{migrationResult.results?.successful || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed:</span>
                    <span className="font-medium text-red-600">{migrationResult.results?.failed || 0}</span>
                  </div>
                  {migrationResult.results?.errors?.length > 0 && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-red-600 text-sm">View Errors</summary>
                      <div className="mt-2 space-y-1">
                        {migrationResult.results.errors.map((error, index) => (
                          <p key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            {error}
                          </p>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ) : (
                <p className="text-red-600 text-sm">{migrationResult.error}</p>
              )}
            </div>
          )}

          {/* Migration Actions */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={performMigration}
              disabled={migrationStatus !== 'idle' || !config?.webCryptoSupported || stats?.cryptojs?.encryptedKeys === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4" />
              Migrate to Web Crypto API
            </button>

            <button
              onClick={runPerformanceTest}
              disabled={migrationStatus !== 'idle'}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4" />
              Run Performance Test
            </button>

            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {!config?.webCryptoSupported && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-yellow-800 font-medium text-sm">Web Crypto API Not Supported</p>
                  <p className="text-yellow-700 text-xs mt-1">
                    Your browser doesn't support the Web Crypto API. Migration is not available.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Performance Results */}
        {performanceResults && (
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Comparison</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CryptoJS Results */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-3">CryptoJS Performance</h3>
                {performanceResults.cryptojs && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Iterations:</span>
                      <span className="font-medium">{performanceResults.cryptojs.iterations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Time:</span>
                      <span className="font-medium">{performanceResults.cryptojs.totalMs}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average per Operation:</span>
                      <span className="font-medium">{performanceResults.cryptojs.avgMs}ms</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Web Crypto Results */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-900 mb-3">Web Crypto API Performance</h3>
                {performanceResults.webcrypto && !performanceResults.webcrypto.error ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Iterations:</span>
                      <span className="font-medium">{performanceResults.webcrypto.iterations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Encryption:</span>
                      <span className="font-medium">{performanceResults.webcrypto.avgEncryptionMs}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Decryption:</span>
                      <span className="font-medium">{performanceResults.webcrypto.avgDecryptionMs}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total per Operation:</span>
                      <span className="font-medium">{performanceResults.webcrypto.totalMs}ms</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-600 text-sm">{performanceResults.webcrypto?.error}</p>
                )}
              </div>
            </div>

            {/* Comparison */}
            {performanceResults.comparison && (
              <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Performance Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Faster Method</p>
                    <p className="font-medium text-lg capitalize">{performanceResults.comparison.fasterMethod}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Speed Difference</p>
                    <p className="font-medium text-lg">{performanceResults.comparison.speedDifference}ms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Performance Gain</p>
                    <p className="font-medium text-lg">{performanceResults.comparison.percentageDifference}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Configuration */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Encryption Method
              </label>
              <select
                value={config?.preferredMethod || 'cryptojs'}
                onChange={(e) => updateConfiguration({ preferredMethod: e.target.value })}
                disabled={!config?.webCryptoSupported && e.target.value === 'webcrypto'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="cryptojs">CryptoJS (Compatible)</option>
                <option value="webcrypto">Web Crypto API (Enhanced Security)</option>
              </select>
              {!config?.webCryptoSupported && (
                <p className="text-xs text-yellow-600 mt-1">Web Crypto API not supported in this browser</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config?.autoMigration || false}
                  onChange={(e) => updateConfiguration({ autoMigration: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Enable Auto-Migration</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Automatically migrate data to Web Crypto API when supported
              </p>
            </div>
          </div>

          {/* Storage Details */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium text-gray-900 mb-4">Storage Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">CryptoJS Storage</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Encrypted Keys:</span>
                    <span>{stats?.cryptojs?.encryptedKeys || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Size:</span>
                    <span>{Math.round((stats?.cryptojs?.totalSize || 0) / 1024)}KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Algorithm:</span>
                    <span>AES-256</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Web Crypto Storage</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Encrypted Keys:</span>
                    <span>{stats?.webcrypto?.encryptedKeys || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Size:</span>
                    <span>{Math.round((stats?.webcrypto?.totalSize || 0) / 1024)}KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Algorithm:</span>
                    <span>{stats?.webcrypto?.algorithm || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoMigrationDashboard;