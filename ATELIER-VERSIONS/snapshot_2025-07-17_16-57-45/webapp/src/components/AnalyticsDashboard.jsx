/**
 * AnalyticsDashboard - Comprehensive Usage Analytics & Time Saved Metrics
 * 
 * Provides real-time insights into usage patterns, workflow efficiency,
 * and time savings from automation. Designed specifically for creative
 * polymorphs who need to validate ROI on workflow optimization.
 * 
 * Features:
 * - Real-time usage tracking
 * - Pattern recognition insights
 * - Time saved metrics and ROI
 * - Automation recommendations
 * - Creative workflow analysis
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, TrendingUp, Zap, Target, Brain, 
  BarChart3, PieChart, Activity, CheckCircle,
  AlertCircle, Info, ArrowUp, ArrowDown,
  Calendar, Timer, Lightbulb, Rocket,
  Download, RefreshCw, Play, Pause
} from 'lucide-react';

// Chart component placeholder (would use recharts in real implementation)
const SimpleChart = ({ data, type = 'bar', title }) => (
  <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="text-sm font-medium text-gray-600">{title}</div>
      <div className="text-lg font-bold text-gray-800">
        {Array.isArray(data) ? `${data.length} items` : 'Chart Data'}
      </div>
    </div>
  </div>
);

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [timeSavedReport, setTimeSavedReport] = useState(null);
  const [patterns, setPatterns] = useState(null);
  const [realTimeInsights, setRealTimeInsights] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
    
    if (isLive) {
      const interval = setInterval(loadAnalyticsData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isLive]);

  const loadAnalyticsData = async () => {
    try {
      // Load data from global analytics instances
      if (window.__usageTracker) {
        const usageAnalytics = window.__usageTracker.getAnalytics();
        setAnalytics(usageAnalytics);
        
        const insights = window.__usageTracker.getInsights();
        setRealTimeInsights(insights);
      }
      
      if (window.__timeSavedMetrics) {
        const timeSavedData = window.__timeSavedMetrics.getTimeSavedReport();
        setTimeSavedReport(timeSavedData);
      }
      
      if (window.__patternRecognition) {
        const patternData = window.__patternRecognition.getInsights();
        setPatterns(patternData);
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }
  };

  const formatTime = (milliseconds) => {
    if (!milliseconds) return '0s';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  const exportAnalytics = () => {
    const exportData = {
      timestamp: Date.now(),
      usage: analytics,
      timeSaved: timeSavedReport,
      patterns: patterns,
      realTime: realTimeInsights
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atelier-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!analytics && !timeSavedReport) {
    return (
      <div className="p-6 bg-white rounded-xl border border-gray-200">
        <div className="text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Loading Analytics...
          </h3>
          <p className="text-gray-500">
            Gathering usage data and calculating metrics
          </p>
        </div>
      </div>
    );
  }

  const periodData = analytics?.[selectedPeriod] || {};
  const currentTimeSaved = timeSavedReport?.summary?.[`totalTimeSaved${selectedPeriod === 'daily' ? 'Today' : selectedPeriod === 'weekly' ? 'ThisWeek' : 'ThisMonth'}`] || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Creative Workflow Analytics
          </h1>
          <p className="text-gray-600">
            Track usage patterns, time savings, and automation ROI
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Today</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
          </select>
          
          {/* Live Toggle */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isLive
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            {isLive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isLive ? 'Live' : 'Paused'}
          </button>
          
          {/* Export Button */}
          <button
            onClick={exportAnalytics}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          {/* Refresh Button */}
          <button
            onClick={loadAnalyticsData}
            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Last Update Info */}
      {lastUpdate && (
        <div className="text-xs text-gray-500 text-right">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Time Saved Today */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-6 h-6 text-green-600" />
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              Time Saved
            </span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {formatTime(currentTimeSaved)}
          </div>
          <p className="text-sm text-green-700">
            {selectedPeriod === 'daily' ? 'Today' : selectedPeriod === 'weekly' ? 'This Week' : 'This Month'}
          </p>
        </div>

        {/* Total Interactions */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              Activity
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {formatNumber(periodData.totalInteractions)}
          </div>
          <p className="text-sm text-blue-700">
            Interactions
          </p>
        </div>

        {/* Efficiency Score */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6 text-purple-600" />
            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              Efficiency
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {Math.round((timeSavedReport?.efficiency?.[`${selectedPeriod}Efficiency`] || 0) * 100)}%
          </div>
          <p className="text-sm text-purple-700">
            Overall Efficiency
          </p>
        </div>

        {/* AI Commands */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Brain className="w-6 h-6 text-orange-600" />
            <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              AI Usage
            </span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {periodData.byType?.['ai-command']?.count || 0}
          </div>
          <p className="text-sm text-orange-700">
            AI Commands
          </p>
        </div>
      </div>

      {/* Real-Time Insights */}
      {realTimeInsights && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Real-Time Insights
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Productivity */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Productivity</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Hour</span>
                  <span className="text-sm font-medium">{realTimeInsights.productivity?.lastHour || 0} actions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Trend</span>
                  <span className={`text-sm font-medium flex items-center gap-1 ${
                    realTimeInsights.productivity?.trend === 'increasing' ? 'text-green-600' :
                    realTimeInsights.productivity?.trend === 'decreasing' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {realTimeInsights.productivity?.trend === 'increasing' && <ArrowUp className="w-3 h-3" />}
                    {realTimeInsights.productivity?.trend === 'decreasing' && <ArrowDown className="w-3 h-3" />}
                    {realTimeInsights.productivity?.trend || 'stable'}
                  </span>
                </div>
              </div>
            </div>

            {/* Efficiency */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Efficiency</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Time Saved Today</span>
                  <span className="text-sm font-medium">{formatTime(realTimeInsights.efficiency?.timeSavedToday)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Automation Usage</span>
                  <span className="text-sm font-medium">{realTimeInsights.efficiency?.automationUsage || 0}</span>
                </div>
              </div>
            </div>

            {/* Focus */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Focus</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Module</span>
                  <span className="text-sm font-medium capitalize">{realTimeInsights.focus?.currentModule || 'unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Session Time</span>
                  <span className="text-sm font-medium">{formatTime(realTimeInsights.focus?.moduleSessionTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage by Module */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Module Usage
          </h2>
          <SimpleChart 
            data={analytics?.patterns?.frequentModules || []}
            type="bar"
            title="Most Used Modules"
          />
          <div className="mt-4 space-y-2">
            {analytics?.patterns?.frequentModules?.slice(0, 3).map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{item.module}</span>
                <span className="text-sm font-medium">{item.count} uses</span>
              </div>
            ))}
          </div>
        </div>

        {/* Time Saved Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Time Saved by Type
          </h2>
          <SimpleChart 
            data={Object.entries(periodData.byType || {})}
            type="pie"
            title="Automation Types"
          />
          <div className="mt-4 space-y-2">
            {Object.entries(periodData.byType || {}).slice(0, 3).map(([type, data], index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{type.replace('-', ' ')}</span>
                <span className="text-sm font-medium">{formatTime(data.timeSaved)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pattern Recognition Insights */}
      {patterns && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Workflow Patterns & Recommendations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{patterns.totalPatterns || 0}</div>
              <div className="text-sm text-gray-600">Patterns Identified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{patterns.highPotentialPatterns || 0}</div>
              <div className="text-sm text-gray-600">High Potential</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatTime(patterns.totalTimeSavingPotential)}</div>
              <div className="text-sm text-gray-600">Potential Savings</div>
            </div>
          </div>

          {/* Recommended Automations */}
          {patterns.recommendedAutomations && patterns.recommendedAutomations.length > 0 && (
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                Top Automation Recommendations
              </h3>
              <div className="space-y-3">
                {patterns.recommendedAutomations.map((rec, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{rec.name}</h4>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rec.implementation?.roi?.priority === 'high' ? 'bg-green-100 text-green-700' :
                        rec.implementation?.roi?.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {rec.implementation?.roi?.priority || 'low'} priority
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Potential: {formatTime(rec.timeSavedPotential)} saved
                      </span>
                      <span className="text-gray-600">
                        Used {rec.frequency} times
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ROI Analysis */}
      {timeSavedReport?.roi && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            ROI Analysis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(timeSavedReport.roi.monthsToBreakEven * 10) / 10}
              </div>
              <div className="text-sm text-gray-600">Months to Break Even</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(timeSavedReport.roi.roi12Months * 100)}%
              </div>
              <div className="text-sm text-gray-600">12-Month ROI</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatTime(timeSavedReport.roi.monthlyTimeSaved)}
              </div>
              <div className="text-sm text-gray-600">Monthly Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatTime(timeSavedReport.roi.yearlyTimeSaved)}
              </div>
              <div className="text-sm text-gray-600">Yearly Projection</div>
            </div>
          </div>

          {/* ROI Projection Chart */}
          <div className="mt-6">
            <h3 className="text-base font-medium text-gray-900 mb-3">ROI Projection (Next 12 Months)</h3>
            <SimpleChart 
              data={timeSavedReport.projections || []}
              type="line"
              title="Projected ROI Growth"
            />
          </div>
        </div>
      )}

      {/* Insights & Alerts */}
      {timeSavedReport?.insights && timeSavedReport.insights.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            System Insights
          </h2>
          
          <div className="space-y-3">
            {timeSavedReport.insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                insight.type === 'success' ? 'bg-green-50 border-green-400' :
                insight.type === 'opportunity' ? 'bg-yellow-50 border-yellow-400' :
                insight.type === 'warning' ? 'bg-red-50 border-red-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex items-start gap-3">
                  {insight.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />}
                  {insight.type === 'opportunity' && <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />}
                  {insight.type === 'warning' && <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                  {insight.type === 'info' && <Info className="w-5 h-5 text-blue-500 mt-0.5" />}
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    <p className="text-sm font-medium text-gray-800">{insight.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;