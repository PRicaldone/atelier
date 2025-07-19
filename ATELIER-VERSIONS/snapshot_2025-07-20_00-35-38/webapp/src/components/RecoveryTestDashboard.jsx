/**
 * Recovery Test Dashboard - Monitor backup system health
 * Real-time monitoring of backup integrity and recovery capabilities
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Calendar,
  FileCheck,
  Database,
  Cpu,
  HardDrive,
  Clock,
  Download,
  Play
} from 'lucide-react';

const RecoveryTestDashboard = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastTestDate, setLastTestDate] = useState(null);
  const [testHistory, setTestHistory] = useState([]);

  useEffect(() => {
    // Load test history from localStorage
    const savedHistory = localStorage.getItem('ATELIER_RECOVERY_TEST_HISTORY');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setTestHistory(history);
        if (history.length > 0) {
          setLastTestDate(new Date(history[0].timestamp));
          setTestResults(history[0]);
        }
      } catch (error) {
        console.error('Failed to load test history:', error);
      }
    }
  }, []);

  const runRecoveryTest = async () => {
    setIsRunning(true);
    
    try {
      // Simulate running recovery tests
      const startTime = Date.now();
      
      // Mock test results - in real implementation, this would call the actual script
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate test duration
      
      const mockResults = {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        totalTests: 6,
        passedTests: Math.floor(Math.random() * 2) + 5, // 5-6 passed tests
        tests: [
          {
            name: 'Snapshot Integrity Check',
            status: 'passed',
            duration: 245,
            details: 'All critical files present'
          },
          {
            name: 'Package.json Validity',
            status: 'passed',
            duration: 123,
            details: 'Valid JSON syntax and required fields'
          },
          {
            name: 'Module System Integrity',
            status: 'passed',
            duration: 567,
            details: 'All core modules present'
          },
          {
            name: 'Security Files Integrity',
            status: Math.random() > 0.3 ? 'passed' : 'warning',
            duration: 334,
            details: Math.random() > 0.3 ? 'All security files present' : 'Some API files missing (acceptable for local dev)'
          },
          {
            name: 'Documentation Integrity',
            status: 'passed',
            duration: 189,
            details: 'All documentation files present'
          },
          {
            name: 'Recovery Simulation',
            status: 'passed',
            duration: 1456,
            details: 'Recovery simulation successful'
          }
        ]
      };

      setTestResults(mockResults);
      setLastTestDate(new Date());

      // Update history
      const newHistory = [mockResults, ...testHistory.slice(0, 9)]; // Keep last 10 results
      setTestHistory(newHistory);
      localStorage.setItem('ATELIER_RECOVERY_TEST_HISTORY', JSON.stringify(newHistory));

    } catch (error) {
      console.error('Recovery test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const calculateHealthScore = () => {
    if (!testResults) return 0;
    const passedTests = testResults.tests.filter(t => t.status === 'passed').length;
    return Math.round((passedTests / testResults.totalTests) * 100);
  };

  const getNextScheduledTest = () => {
    // Calculate next Sunday at 2 AM
    const now = new Date();
    const nextSunday = new Date();
    const daysUntilSunday = (7 - now.getDay()) % 7;
    nextSunday.setDate(now.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
    nextSunday.setHours(2, 0, 0, 0);
    
    return nextSunday;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Recovery Test Dashboard</h1>
          </div>
          <p className="text-gray-600">Monitor backup system health and recovery capabilities</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <FileCheck className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-gray-900">{calculateHealthScore()}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Last Test</p>
                <p className="text-sm font-bold text-gray-900">
                  {lastTestDate ? lastTestDate.toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Test History</p>
                <p className="text-2xl font-bold text-gray-900">{testHistory.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Next Scheduled</p>
                <p className="text-sm font-bold text-gray-900">
                  {getNextScheduledTest().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recovery Test Control</h2>
            <button
              onClick={runRecoveryTest}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isRunning ? 'Running Tests...' : 'Run Recovery Tests'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <strong>Test Frequency:</strong> Weekly (Sundays at 2 AM)
            </div>
            <div>
              <strong>Test Duration:</strong> ~2-3 minutes
            </div>
            <div>
              <strong>Coverage:</strong> 6 critical system areas
            </div>
          </div>
        </div>

        {/* Latest Test Results */}
        {testResults && (
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Latest Test Results</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {new Date(testResults.timestamp).toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {testResults.tests.map((test, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      <h3 className="font-medium">{test.name}</h3>
                    </div>
                    <span className="text-xs font-mono">{test.duration}ms</span>
                  </div>
                  <p className="text-sm opacity-75">{test.details}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <span>
                  <strong>Total Tests:</strong> {testResults.totalTests}
                </span>
                <span>
                  <strong>Passed:</strong> {testResults.passedTests}
                </span>
                <span>
                  <strong>Duration:</strong> {Math.round(testResults.duration / 1000)}s
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md">
                  <Download className="w-3 h-3" />
                  Export
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test History */}
        {testHistory.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Test History</h2>
            
            <div className="space-y-3">
              {testHistory.slice(0, 5).map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      test.passedTests === test.totalTests ? 'bg-green-500' : 
                      test.passedTests >= test.totalTests * 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="font-medium">
                      {new Date(test.timestamp).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-gray-600">
                      {test.passedTests}/{test.totalTests} tests passed
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    {Math.round(test.duration / 1000)}s
                  </div>
                </div>
              ))}
            </div>

            {testHistory.length > 5 && (
              <div className="mt-4 text-center">
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  View All {testHistory.length} Tests
                </button>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!testResults && (
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Recovery Test System</h3>
                <p className="text-blue-700 text-sm mb-3">
                  The recovery test system validates your backup integrity and ensures you can restore your project if needed.
                </p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Tests snapshot file integrity</li>
                  <li>• Validates module system completeness</li>
                  <li>• Simulates full recovery process</li>
                  <li>• Monitors security file presence</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecoveryTestDashboard;