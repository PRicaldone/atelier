/**
 * WIP Protection Indicator - Visual indicator for work in progress protection
 * Shows current protection status and provides quick save access
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Save, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Settings,
  X
} from 'lucide-react';
import wipProtection from '../utils/wipProtection';

const WIPProtectionIndicator = () => {
  const [stats, setStats] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Initial load
    setStats(wipProtection.getStats());

    // Subscribe to WIP protection events
    const unsubscribe = wipProtection.subscribe((event, data) => {
      setStats(wipProtection.getStats());
      
      // Auto-expand on protection activation
      if (event === 'protection_activated') {
        setExpanded(true);
        setTimeout(() => setExpanded(false), 5000); // Auto-collapse after 5s
      }
    });

    // Periodic updates
    const interval = setInterval(() => {
      setStats(wipProtection.getStats());
    }, 10000); // Every 10 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleSave = () => {
    wipProtection.triggerSave();
  };

  const handleClearSession = () => {
    if (confirm('Are you sure you want to clear the current work session? This will reset protection tracking.')) {
      wipProtection.clearSession();
    }
  };

  const toggleVisibility = () => {
    setVisible(!visible);
    localStorage.setItem('ATELIER_WIP_INDICATOR_VISIBLE', (!visible).toString());
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const getProtectionColor = () => {
    if (!stats?.isEnabled) return 'text-gray-400 bg-gray-50';
    if (stats?.protectionActive) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getProtectionIcon = () => {
    if (!stats?.isEnabled) return <Shield className="w-4 h-4 text-gray-400" />;
    if (stats?.protectionActive) return <ShieldAlert className="w-4 h-4 text-orange-600" />;
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  const getStatusText = () => {
    if (!stats?.isEnabled) return 'Disabled';
    if (stats?.protectionActive) return 'Protected';
    return 'Monitoring';
  };

  if (!visible) {
    return (
      <button
        onClick={toggleVisibility}
        className="fixed bottom-4 left-4 z-50 p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
        title="Show WIP Protection"
      >
        <Eye className="w-4 h-4 text-gray-600" />
      </button>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className={`bg-white border rounded-lg shadow-lg transition-all duration-300 ${getProtectionColor()}`}>
        {/* Main Indicator */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 p-3 hover:bg-gray-50 w-full text-left transition-colors"
        >
          {getProtectionIcon()}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">WIP Protection</span>
              <span className="text-xs px-2 py-0.5 bg-white bg-opacity-50 rounded">
                {getStatusText()}
              </span>
            </div>
            {stats.protectionActive && (
              <div className="text-xs opacity-75 mt-1">
                {stats.session.unsavedFiles} unsaved • {formatDuration(stats.session.duration)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {stats.protectionActive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                title="Save Now"
              >
                <Save className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility();
              }}
              className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
              title="Hide Indicator"
            >
              <EyeOff className="w-3 h-3" />
            </button>
          </div>
        </button>

        {/* Expanded Details */}
        {expanded && (
          <div className="border-t bg-white p-4 space-y-3">
            {/* Session Stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Session Duration</span>
                <div className="font-medium">{formatDuration(stats.session.duration)}</div>
              </div>
              <div>
                <span className="text-gray-500">Changes</span>
                <div className="font-medium">{stats.session.changes}</div>
              </div>
              <div>
                <span className="text-gray-500">Unsaved Files</span>
                <div className="font-medium">{stats.session.unsavedFiles}</div>
              </div>
              <div>
                <span className="text-gray-500">Text Changes</span>
                <div className="font-medium">{stats.session.textChanges}</div>
              </div>
            </div>

            {/* Last Save */}
            {stats.session.lastSave && (
              <div className="text-xs">
                <span className="text-gray-500">Last Save: </span>
                <span className="font-medium">
                  {formatDuration(Date.now() - stats.session.lastSave)} ago
                </span>
              </div>
            )}

            {/* Recent Changes */}
            {stats.recentChanges && stats.recentChanges.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-2">Recent Changes</div>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {stats.recentChanges.slice(-3).map((change, index) => (
                    <div key={index} className="text-xs flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        change.type === 'input' ? 'bg-blue-400' :
                        change.type === 'storage' ? 'bg-green-400' :
                        change.type === 'dom' ? 'bg-purple-400' : 'bg-gray-400'
                      }`} />
                      <span className="flex-1 truncate">
                        {change.type === 'input' && 'Form input'}
                        {change.type === 'storage' && `Storage: ${change.key?.split('_').pop()}`}
                        {change.type === 'dom' && `DOM changes: ${change.mutations}`}
                        {change.type === 'contenteditable' && 'Content edit'}
                      </span>
                      <span className="text-gray-400">
                        {Math.round((Date.now() - change.timestamp) / 1000)}s
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t">
              {stats.protectionActive && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-3 h-3" />
                  Save Now
                </button>
              )}
              
              <button
                onClick={handleClearSession}
                className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>

              <button
                onClick={() => {
                  console.log('WIP Protection Stats:', stats);
                  console.log('WIP Protection Instance:', wipProtection);
                }}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-3 h-3" />
                Debug
              </button>
            </div>

            {/* Status Messages */}
            {stats.protectionActive && (
              <div className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                <AlertTriangle className="w-3 h-3 text-orange-600 mt-0.5" />
                <div>
                  <div className="font-medium text-orange-800">Work In Progress Protected</div>
                  <div className="text-orange-700 mt-1">
                    Your changes are being tracked. Save regularly to prevent data loss.
                  </div>
                </div>
              </div>
            )}

            {!stats.isEnabled && (
              <div className="flex items-start gap-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                <Shield className="w-3 h-3 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-700">Protection Disabled</div>
                  <div className="text-gray-600 mt-1">
                    WIP protection is currently disabled.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Save Pulse */}
        {stats.protectionActive && stats.session.duration > 5 * 60 * 1000 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default WIPProtectionIndicator;