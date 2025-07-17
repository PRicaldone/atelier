/**
 * IntelligenceSystemDashboard - Unified monitoring dashboard for the intelligence system
 * 
 * Provides real-time monitoring and analytics for:
 * - TaskCoordinator performance and routing
 * - ClaudeConnectors health and operations
 * - Orchestrator workflow execution
 * - Cross-system communication health
 */

import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Activity, 
  Brain, 
  GitBranch, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BarChart3,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

const IntelligenceSystemDashboard = () => {
  const [stats, setStats] = useState({
    taskCoordinator: null,
    claudeConnectors: null,
    orchestrator: null,
    systemHealth: null
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch stats from all intelligence components
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // Get TaskCoordinator stats
      const taskCoordinatorStats = window.__taskCoordinator?.getStats() || null;
      
      // Get ClaudeConnectors stats
      const claudeConnectorsStats = window.__claudeConnectorsAdapter?.getOperationStats() || null;
      const connectorsHealth = await window.__claudeConnectorsAdapter?.healthCheck() || null;
      
      // Get Orchestrator stats
      const orchestratorStats = window.__orchestratorAdapter?.getStats() || null;
      const orchestratorHealth = await window.__orchestratorAdapter?.healthCheck() || null;
      
      // Get ContextManager stats
      const contextManagerStats = window.__contextManager?.getStats() || null;
      const contextManagerHealth = await window.__contextManager?.healthCheck() || null;
      
      // Combine health info
      const systemHealth = {
        taskCoordinator: await window.__taskCoordinator?.healthCheck() || null,
        claudeConnectors: connectorsHealth,
        orchestrator: orchestratorHealth,
        contextManager: contextManagerHealth
      };
      
      setStats({
        taskCoordinator: taskCoordinatorStats,
        claudeConnectors: {
          ...claudeConnectorsStats,
          health: connectorsHealth
        },
        orchestrator: {
          ...orchestratorStats,
          health: orchestratorHealth
        },
        contextManager: {
          ...contextManagerStats,
          health: contextManagerHealth
        },
        systemHealth
      });
      
      setLastUpdate(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching intelligence stats:', error);
      setIsLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchStats();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getHealthBadge = (status) => {
    const variants = {
      healthy: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800',
      unknown: 'bg-gray-100 text-gray-800'
    };
    
    const icons = {
      healthy: <CheckCircle className="w-3 h-3" />,
      warning: <AlertTriangle className="w-3 h-3" />,
      critical: <AlertTriangle className="w-3 h-3" />,
      unknown: <AlertTriangle className="w-3 h-3" />
    };
    
    return (
      <Badge className={`${variants[status] || variants.unknown} flex items-center gap-1`}>
        {icons[status] || icons.unknown}
        {status || 'unknown'}
      </Badge>
    );
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString();
  };

  const formatTime = (ms) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  // Test functions
  const runTaskCoordinatorTest = async () => {
    try {
      if (window.__taskCoordinator?.runTests) {
        const results = await window.__taskCoordinator.runTests();
        console.log('TaskCoordinator test results:', results);
      }
    } catch (error) {
      console.error('TaskCoordinator test failed:', error);
    }
  };

  const runConnectorsTest = async () => {
    try {
      if (window.__claudeConnectorsAdapter?.testAllConnectors) {
        const results = await window.__claudeConnectorsAdapter.testAllConnectors();
        console.log('Connectors test results:', results);
      }
    } catch (error) {
      console.error('Connectors test failed:', error);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            Intelligence System Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring and analytics for the Claude + Connectors + Orchestrator system
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "primary" : "secondary"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-2"
          >
            {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            Auto-refresh
          </Button>
          
          <Button
            variant="secondary"
            onClick={fetchStats}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Last Update */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Clock className="w-4 h-4" />
        Last updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
      </div>

      {/* System Health Overview */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Health Overview
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Task Coordinator</p>
              <p className="text-lg font-semibold">
                {stats.systemHealth?.taskCoordinator?.activeTasks || 0} active tasks
              </p>
            </div>
            {getHealthBadge(stats.systemHealth?.taskCoordinator?.status)}
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Claude Connectors</p>
              <p className="text-lg font-semibold">
                {stats.systemHealth?.claudeConnectors?.connectedConnectors || 0} connected
              </p>
            </div>
            {getHealthBadge(stats.systemHealth?.claudeConnectors?.status)}
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Orchestrator</p>
              <p className="text-lg font-semibold">
                {stats.systemHealth?.orchestrator?.runningWorkflows || 0} running
              </p>
            </div>
            {getHealthBadge(stats.systemHealth?.orchestrator?.status)}
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Context Manager</p>
              <p className="text-lg font-semibold">
                {stats.systemHealth?.contextManager?.totalContexts || 0} contexts
              </p>
            </div>
            {getHealthBadge(stats.systemHealth?.contextManager?.status)}
          </div>
        </div>
      </Card>

      {/* Task Coordinator Stats */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Task Coordinator Performance
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Total Tasks</p>
            <p className="text-2xl font-bold">{formatNumber(stats.taskCoordinator?.totalTasks)}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Success Rate</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{formatPercentage(stats.taskCoordinator?.successRate)}</p>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Avg Execution Time</p>
            <p className="text-2xl font-bold">{formatTime(stats.taskCoordinator?.averageExecutionTime)}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Active Tasks</p>
            <p className="text-2xl font-bold">{formatNumber(stats.taskCoordinator?.activeTasks)}</p>
          </div>
        </div>
        
        {stats.taskCoordinator?.routeDistribution && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Route Distribution</h4>
            <div className="space-y-2">
              {Object.entries(stats.taskCoordinator.routeDistribution).map(([route, count]) => (
                <div key={route} className="flex items-center justify-between">
                  <span className="text-sm">{route}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={(count / stats.taskCoordinator.totalTasks) * 100} className="w-32" />
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Button onClick={runTaskCoordinatorTest} variant="secondary" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Run Test Suite
          </Button>
        </div>
      </Card>

      {/* Claude Connectors Stats */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Claude Connectors Status
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Total Operations</p>
            <p className="text-2xl font-bold">{formatNumber(stats.claudeConnectors?.totalOperations)}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Success Rate</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{formatPercentage(stats.claudeConnectors?.successRate)}</p>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Avg Response Time</p>
            <p className="text-2xl font-bold">{formatTime(stats.claudeConnectors?.averageExecutionTime)}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Connected Services</p>
            <p className="text-2xl font-bold">{formatNumber(stats.claudeConnectors?.health?.connectedConnectors)}</p>
          </div>
        </div>
        
        {stats.claudeConnectors?.operationsByConnector && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Operations by Connector</h4>
            <div className="space-y-2">
              {Object.entries(stats.claudeConnectors.operationsByConnector).map(([connector, count]) => (
                <div key={connector} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{connector.replace('-', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={(count / stats.claudeConnectors.totalOperations) * 100} className="w-32" />
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Button onClick={runConnectorsTest} variant="secondary" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Test All Connectors
          </Button>
        </div>
      </Card>

      {/* Orchestrator Stats */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Orchestrator Performance
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Total Workflows</p>
            <p className="text-2xl font-bold">{formatNumber(stats.orchestrator?.totalWorkflowsExecuted)}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Success Rate</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{formatPercentage(stats.orchestrator?.successRate)}</p>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Avg Execution Time</p>
            <p className="text-2xl font-bold">{formatTime(stats.orchestrator?.averageExecutionTime)}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Running Workflows</p>
            <p className="text-2xl font-bold">{formatNumber(stats.orchestrator?.runningWorkflows)}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="font-semibold mb-3">Workflow Queue</h4>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Queued: {stats.orchestrator?.queuedWorkflows || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Running: {stats.orchestrator?.runningWorkflows || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-sm">Templates: {stats.orchestrator?.registeredTemplates || 0}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Context Manager Stats */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Context Manager Performance
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Total Contexts</p>
            <p className="text-2xl font-bold">{formatNumber(stats.contextManager?.totalContexts)}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Memory Usage</p>
            <p className="text-2xl font-bold">{formatNumber(stats.contextManager?.memoryUsage)} bytes</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Utilization</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{formatPercentage(stats.contextManager?.health?.utilizationRate)}</p>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Max Entries</p>
            <p className="text-2xl font-bold">{formatNumber(stats.contextManager?.health?.maxEntries)}</p>
          </div>
        </div>
        
        {stats.contextManager?.byScope && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Context Distribution by Scope</h4>
            <div className="space-y-2">
              {Object.entries(stats.contextManager.byScope).map(([scope, count]) => (
                <div key={scope} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{scope}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={(count / stats.contextManager.totalContexts) * 100} className="w-32" />
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {stats.contextManager?.byType && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Context Distribution by Type</h4>
            <div className="space-y-2">
              {Object.entries(stats.contextManager.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm">{type.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={(count / stats.contextManager.totalContexts) * 100} className="w-32" />
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Button 
            onClick={() => {
              console.log('Context Manager snapshot:', window.__contextManager?.createSnapshot());
            }} 
            variant="secondary" 
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Create Context Snapshot
          </Button>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="secondary"
            onClick={() => console.log('TaskCoordinator info:', window.__taskCoordinator?.getStats())}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Log TaskCoordinator Stats
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => console.log('Connectors info:', window.__claudeConnectorsAdapter?.getAllConnectorsStatus())}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Log Connectors Status
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => console.log('Orchestrator info:', window.__orchestratorAdapter?.getAvailableTemplates())}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Log Workflow Templates
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => console.log('Module Registry info:', window.__moduleRegistry?.getInfo())}
            className="flex items-center gap-2"
          >
            <GitBranch className="w-4 h-4" />
            Log Module Registry
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => console.log('Context Manager info:', window.__contextManager?.getStats())}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Log Context Manager
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => window.__monitoringTestUtils?.generateTestEvents()}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Generate Test Events
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => {
              localStorage.removeItem('ATELIER_CANVAS_ELEMENTS');
              window.location.reload();
            }}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset System
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default IntelligenceSystemDashboard;