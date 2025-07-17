import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, CheckCircle2, AlertTriangle, XCircle, 
  Clock, RefreshCw, Play, FileText, Settings,
  ChevronDown, ChevronRight, Shield, TrendingUp,
  Calendar, ClipboardCheck
} from 'lucide-react';
import { atelierRoutineAgent } from '../modules/shared/agents';
import { getAllChecklists, getNextScheduledChecklist } from '../modules/shared/agents/routineChecklist';

const statusColors = {
  pending: 'bg-gray-500',
  running: 'bg-blue-500',
  healthy: 'bg-green-500',
  warning: 'bg-yellow-500',
  critical: 'bg-red-500',
  error: 'bg-red-600'
};

const statusIcons = {
  pending: Clock,
  running: RefreshCw,
  healthy: CheckCircle2,
  warning: AlertTriangle,
  critical: XCircle,
  error: XCircle
};

const priorityColors = {
  low: 'text-green-600 bg-green-50',
  medium: 'text-yellow-600 bg-yellow-50',
  high: 'text-red-600 bg-red-50'
};

export default function RoutineAgentDashboard() {
  const [lastReport, setLastReport] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedChecks, setExpandedChecks] = useState(new Set());
  const [autoRunEnabled, setAutoRunEnabled] = useState(false);
  const [runHistory, setRunHistory] = useState([]);
  const [selectedChecklist, setSelectedChecklist] = useState('daily');
  const [scheduledChecks, setScheduledChecks] = useState([]);

  // Load last report from localStorage on mount
  useEffect(() => {
    const savedReport = localStorage.getItem('ATELIER_ROUTINE_LAST_REPORT');
    if (savedReport) {
      setLastReport(JSON.parse(savedReport));
    }

    const savedHistory = localStorage.getItem('ATELIER_ROUTINE_HISTORY');
    if (savedHistory) {
      setRunHistory(JSON.parse(savedHistory));
    }

    // Check for scheduled routines
    const scheduled = getNextScheduledChecklist();
    setScheduledChecks(scheduled);
  }, []);

  // Run routine check
  const runRoutine = useCallback(async () => {
    setIsRunning(true);
    try {
      const report = await atelierRoutineAgent.runRoutine();
      setLastReport(report);
      
      // Save to localStorage
      localStorage.setItem('ATELIER_ROUTINE_LAST_REPORT', JSON.stringify(report));
      
      // Update history
      const newHistory = [report, ...runHistory.slice(0, 9)]; // Keep last 10
      setRunHistory(newHistory);
      localStorage.setItem('ATELIER_ROUTINE_HISTORY', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to run routine:', error);
    } finally {
      setIsRunning(false);
    }
  }, [runHistory]);

  // Run specific checklist
  const runChecklist = useCallback(async (frequency) => {
    setIsRunning(true);
    try {
      const report = await atelierRoutineAgent.runChecklist(frequency);
      
      // Update scheduled checks
      const scheduled = getNextScheduledChecklist();
      setScheduledChecks(scheduled);
      
      return report;
    } catch (error) {
      console.error('Failed to run checklist:', error);
    } finally {
      setIsRunning(false);
    }
  }, []);

  // Toggle check expansion
  const toggleCheck = (checkName) => {
    const newExpanded = new Set(expandedChecks);
    if (newExpanded.has(checkName)) {
      newExpanded.delete(checkName);
    } else {
      newExpanded.add(checkName);
    }
    setExpandedChecks(newExpanded);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Calculate time since last run
  const timeSinceLastRun = () => {
    if (!lastReport?.timestamp) return 'Never';
    const diff = Date.now() - lastReport.timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Atelier Routine Agent</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Last run: <span className="font-medium">{timeSinceLastRun()}</span>
            </div>
            <button
              onClick={runRoutine}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Routine
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scheduled Checks Alert */}
        {scheduledChecks.length > 0 && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-yellow-600" />
              <h3 className="font-medium text-yellow-900">Scheduled Maintenance Due</h3>
            </div>
            <div className="space-y-2">
              {scheduledChecks.map((check, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-yellow-800">
                    {check.checklist.name} - Last run: {check.lastRun ? new Date(check.lastRun).toLocaleDateString() : 'Never'}
                  </span>
                  <button
                    onClick={() => runChecklist(check.checklist.frequency)}
                    className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Run Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklist Selector */}
        <div className="mb-4 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-gray-600" />
              Quick Checklists
            </h3>
          </div>
          <div className="flex gap-2">
            {getAllChecklists().map((checklist) => (
              <button
                key={checklist.id}
                onClick={() => runChecklist(checklist.frequency)}
                disabled={isRunning}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  selectedChecklist === checklist.frequency
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {checklist.name}
              </button>
            ))}
          </div>
        </div>

        {/* Status Summary */}
        {lastReport && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Status</span>
                {React.createElement(statusIcons[lastReport.overallStatus], {
                  className: `w-5 h-5 text-${statusColors[lastReport.overallStatus].replace('bg-', '')}`
                })}
              </div>
              <div className="mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[lastReport.overallStatus]} text-white`}>
                  {lastReport.overallStatus.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Checks Passed</span>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                {lastReport.checks.filter(c => c.status === 'healthy').length}/{lastReport.checks.length}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Issues Found</span>
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                {lastReport.checks.filter(c => ['warning', 'critical'].includes(c.status)).length}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recommendations</span>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                {lastReport.recommendations.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      {lastReport ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checks Results */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Checks</h2>
            {lastReport.checks.map((check) => (
              <div key={check.check} className="bg-white rounded-lg shadow-sm border">
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleCheck(check.check)}
                >
                  <div className="flex items-center gap-3">
                    {React.createElement(expandedChecks.has(check.check) ? ChevronDown : ChevronRight, {
                      className: "w-4 h-4 text-gray-500"
                    })}
                    {React.createElement(statusIcons[check.status], {
                      className: `w-5 h-5 text-${statusColors[check.status].replace('bg-', '')}`
                    })}
                    <span className="font-medium text-gray-900">{check.check}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[check.status]} text-white`}>
                    {check.status.toUpperCase()}
                  </span>
                </div>

                {expandedChecks.has(check.check) && (
                  <div className="px-4 pb-4 border-t">
                    {check.details && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Details:</h4>
                        <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto">
                          {JSON.stringify(check.details, null, 2)}
                        </pre>
                      </div>
                    )}
                    {check.issues && check.issues.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Issues:</h4>
                        <ul className="space-y-1">
                          {check.issues.map((issue, idx) => (
                            <li key={idx} className="text-sm text-red-600">• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h2>
            {lastReport.recommendations.length > 0 ? (
              lastReport.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className={`inline-flex px-2 py-1 text-xs font-medium rounded mb-2 ${priorityColors[rec.priority]}`}>
                    {rec.priority.toUpperCase()} PRIORITY
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{rec.action}</h3>
                  <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                  <div className="text-xs text-gray-500">
                    Complete within: <span className="font-medium">{rec.timeframe}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">All systems healthy!</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  No recommendations at this time.
                </p>
              </div>
            )}

            {/* Run History */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Runs</h3>
              <div className="space-y-2">
                {runHistory.slice(0, 5).map((run, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{formatTime(run.timestamp)}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[run.overallStatus]} text-white`}>
                      {run.overallStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Routine Report Available</h3>
          <p className="text-gray-600 mb-6">Run your first routine check to see system health status.</p>
          <button
            onClick={runRoutine}
            disabled={isRunning}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Run First Check
          </button>
        </div>
      )}
    </div>
  );
}