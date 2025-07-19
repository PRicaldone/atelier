/**
 * Audit Logs Dashboard - Comprehensive audit logging interface
 * Provides detailed view, filtering, and analysis of system audit logs
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Filter, 
  Search,
  Download,
  Trash2,
  RefreshCw,
  Eye,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  User,
  Shield,
  Activity,
  BarChart3,
  Settings,
  Calendar,
  ExternalLink
} from 'lucide-react';
import auditLogger, { AuditEventType, AuditSeverity, AuditCategory } from '../utils/auditLogger';

const AuditLogsDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState({
    search: '',
    eventType: '',
    severity: '',
    category: '',
    startDate: '',
    endDate: '',
    limit: 100
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    let interval;
    if (realTimeUpdates) {
      interval = setInterval(loadData, 5000); // Update every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [realTimeUpdates]);

  useEffect(() => {
    applyFilters();
  }, [logs, filter]);

  const loadData = () => {
    try {
      setLoading(true);
      
      const allLogs = auditLogger.getLogs();
      const statistics = auditLogger.getStatistics();
      
      setLogs(allLogs);
      setStats(statistics);
    } catch (error) {
      console.error('Failed to load audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Search filter
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.eventType.toLowerCase().includes(searchTerm) ||
        JSON.stringify(log.details).toLowerCase().includes(searchTerm) ||
        log.userId.toLowerCase().includes(searchTerm)
      );
    }

    // Event type filter
    if (filter.eventType) {
      filtered = filtered.filter(log => log.eventType === filter.eventType);
    }

    // Severity filter
    if (filter.severity) {
      filtered = filtered.filter(log => log.severity === filter.severity);
    }

    // Category filter
    if (filter.category) {
      filtered = filtered.filter(log => log.category === filter.category);
    }

    // Date range filter
    if (filter.startDate) {
      const startTime = new Date(filter.startDate).getTime();
      filtered = filtered.filter(log => log.timestamp >= startTime);
    }

    if (filter.endDate) {
      const endTime = new Date(filter.endDate + 'T23:59:59').getTime();
      filtered = filtered.filter(log => log.timestamp <= endTime);
    }

    // Apply limit
    if (filter.limit) {
      filtered = filtered.slice(0, filter.limit);
    }

    setFilteredLogs(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilter({
      search: '',
      eventType: '',
      severity: '',
      category: '',
      startDate: '',
      endDate: '',
      limit: 100
    });
  };

  const exportLogs = (format = 'json') => {
    const exportData = auditLogger.exportLogs(format, {
      ...filter,
      startTime: filter.startDate ? new Date(filter.startDate).getTime() : undefined,
      endTime: filter.endDate ? new Date(filter.endDate + 'T23:59:59').getTime() : undefined
    });

    const blob = new Blob([exportData], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atelier-audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearOldLogs = () => {
    if (confirm('Clear logs older than 7 days? This action cannot be undone.')) {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      auditLogger.clearLogs(sevenDaysAgo);
      loadData();
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case AuditSeverity.CRITICAL:
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case AuditSeverity.HIGH:
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case AuditSeverity.MEDIUM:
        return <Info className="w-4 h-4 text-blue-600" />;
      case AuditSeverity.LOW:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case AuditSeverity.CRITICAL:
        return 'bg-red-100 text-red-800 border-red-200';
      case AuditSeverity.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case AuditSeverity.MEDIUM:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case AuditSeverity.LOW:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case AuditCategory.SECURITY:
        return <Shield className="w-4 h-4" />;
      case AuditCategory.PERFORMANCE:
        return <Activity className="w-4 h-4" />;
      case AuditCategory.USER_BEHAVIOR:
        return <User className="w-4 h-4" />;
      case AuditCategory.SYSTEM_HEALTH:
        return <Settings className="w-4 h-4" />;
      case AuditCategory.DATA_GOVERNANCE:
        return <FileText className="w-4 h-4" />;
      case AuditCategory.COMPLIANCE:
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatEventType = (eventType) => {
    return eventType.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audit logs...</p>
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
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          </div>
          <p className="text-gray-600">Comprehensive system activity logging and monitoring</p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Logs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalLogs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Session Duration</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(stats.sessionDuration / 60000)}m
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Events</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.severities[AuditSeverity.CRITICAL] || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Events</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.categories[AuditCategory.SECURITY] || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Filters & Controls</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  realTimeUpdates 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${realTimeUpdates ? 'animate-spin' : ''}`} />
                {realTimeUpdates ? 'Live' : 'Manual'}
              </button>
              <button
                onClick={() => exportLogs('json')}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                JSON
              </button>
              <button
                onClick={() => exportLogs('csv')}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={clearOldLogs}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Clear Old
              </button>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={filter.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={filter.eventType}
              onChange={(e) => handleFilterChange('eventType', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Event Types</option>
              {Object.values(AuditEventType).map(type => (
                <option key={type} value={type}>{formatEventType(type)}</option>
              ))}
            </select>

            <select
              value={filter.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Severities</option>
              {Object.values(AuditSeverity).map(severity => (
                <option key={severity} value={severity}>
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={filter.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {Object.values(AuditCategory).map(category => (
                <option key={category} value={category}>
                  {category.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {filteredLogs.length} of {logs.length} logs
              </span>
              <select
                value={filter.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </select>
            </div>
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              <Filter className="w-3 h-3" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-medium">No audit logs found</p>
                      <p className="text-sm">Try adjusting your filters or check back later</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(log.category)}
                          <span className="text-sm font-medium text-gray-900">
                            {formatEventType(log.eventType)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(log.severity)}
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(log.severity)}`}>
                            {log.severity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.category.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.userId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Log Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Audit Log Details
                  </h3>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Event Type:</span>
                        <span className="font-medium">{formatEventType(selectedLog.eventType)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Severity:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(selectedLog.severity)}`}>
                          {selectedLog.severity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium">{selectedLog.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">User ID:</span>
                        <span className="font-medium">{selectedLog.userId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Session ID:</span>
                        <span className="font-mono text-xs">{selectedLog.sessionId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Timestamp:</span>
                        <span className="font-medium">{formatTimestamp(selectedLog.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Metadata</h4>
                    <div className="bg-gray-50 p-3 rounded text-xs">
                      <pre className="whitespace-pre-wrap overflow-auto">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Event Details</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm whitespace-pre-wrap overflow-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsDashboard;