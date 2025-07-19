import React, { useState, useEffect } from 'react';
import WelcomePage from './WelcomePage';
import { welcomeAnalyticsUtils } from '../../utils/welcomeAnalytics';

/**
 * Demo component for testing Welcome Page with Poetry System
 * 
 * Includes:
 * - Live analytics display
 * - Theme switching
 * - Analytics controls
 * - Debug information
 */

const WelcomeDemo = () => {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState({});
  const [insights, setInsights] = useState({});

  // Update analytics display
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(welcomeAnalyticsUtils.getStats());
      setInsights(welcomeAnalyticsUtils.getInsights());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Mock EventBus for testing if not available
  useEffect(() => {
    if (!window.__eventBus) {
      window.__eventBus = {
        events: {},
        on: function(event, callback) {
          if (!this.events[event]) this.events[event] = [];
          this.events[event].push(callback);
        },
        emit: function(event, data) {
          console.log(`EventBus: ${event}`, data);
          if (this.events[event]) {
            this.events[event].forEach(callback => callback({ type: event, ...data }));
          }
          // Also check wildcard listeners
          Object.keys(this.events).forEach(pattern => {
            if (pattern.includes('*') && event.startsWith(pattern.replace('*', ''))) {
              this.events[pattern].forEach(callback => callback({ type: event, ...data }));
            }
          });
        }
      };
    }
  }, []);

  const handleTestInteraction = () => {
    // Simulate user interactions for testing
    welcomeAnalyticsUtils.simulateEngagement();
    
    // Update display
    setAnalytics(welcomeAnalyticsUtils.getStats());
    setInsights(welcomeAnalyticsUtils.getInsights());
  };

  const handleResetAnalytics = () => {
    welcomeAnalyticsUtils.reset();
    setAnalytics({});
    setInsights({});
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Main Welcome Page */}
      <WelcomePage />
      
      {/* Analytics Overlay */}
      <div 
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {/* Toggle Analytics Button */}
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          style={{
            padding: '8px 16px',
            backgroundColor: showAnalytics ? '#ef4444' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'JetBrains Mono, monospace',
            cursor: 'pointer'
          }}
        >
          {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
        </button>

        {/* Test Controls */}
        <button
          onClick={handleTestInteraction}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'JetBrains Mono, monospace',
            cursor: 'pointer'
          }}
        >
          Test Interaction
        </button>

        <button
          onClick={handleResetAnalytics}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'JetBrains Mono, monospace',
            cursor: 'pointer'
          }}
        >
          Reset Analytics
        </button>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && (
        <div
          style={{
            position: 'fixed',
            top: '120px',
            right: '20px',
            width: '300px',
            maxHeight: '70vh',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '11px',
            fontFamily: 'JetBrains Mono, monospace',
            overflow: 'auto',
            zIndex: 999
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
            Welcome Analytics
          </h3>
          
          {/* Session Stats */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#10b981' }}>Session</h4>
            <div>Duration: {Math.round((analytics.duration || 0) / 1000)}s</div>
            <div>Interactions: {analytics.interactions || 0}</div>
            <div>Statements Viewed: {analytics.statementsViewed || 0}</div>
            <div>Cycling Frequency: {analytics.cyclingFrequency || 0}</div>
            <div>Prompt Engagement: {analytics.promptEngagement || 0}</div>
          </div>

          {/* User Insights */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#3b82f6' }}>Insights</h4>
            <div>Engagement: {insights.engagementLevel || 'none'}</div>
            <div>Session Type: {insights.sessionType || 'none'}</div>
            <div>Favorite Module: {insights.favoriteModule || 'none'}</div>
            <div>Preferred Gestures: {insights.preferredGestures?.join(', ') || 'none'}</div>
          </div>

          {/* Gesture Usage */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#f59e0b' }}>Gestures</h4>
            {Object.entries(analytics.gestureUsage || {}).map(([gesture, count]) => (
              <div key={gesture}>{gesture}: {count}</div>
            ))}
            {Object.keys(analytics.gestureUsage || {}).length === 0 && (
              <div style={{ opacity: 0.6 }}>No gestures used yet</div>
            )}
          </div>

          {/* Module Preferences */}
          <div>
            <h4 style={{ margin: '0 0 8px 0', color: '#8b5cf6' }}>Modules</h4>
            {Object.entries(analytics.modulePreferences || {}).map(([module, count]) => (
              <div key={module}>{module}: {count}</div>
            ))}
            {Object.keys(analytics.modulePreferences || {}).length === 0 && (
              <div style={{ opacity: 0.6 }}>No modules visited yet</div>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={() => {
              const data = welcomeAnalyticsUtils.export();
              console.log('Analytics Export:', data);
              navigator.clipboard?.writeText(JSON.stringify(data, null, 2));
            }}
            style={{
              marginTop: '16px',
              padding: '6px 12px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Export to Console & Clipboard
          </button>
        </div>
      )}

      {/* Debug Info */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '10px',
          fontFamily: 'JetBrains Mono, monospace',
          zIndex: 999
        }}
      >
        <div>Welcome Poetry Demo</div>
        <div>EventBus: {window.__eventBus ? '✅' : '❌'}</div>
        <div>Analytics: {window.__welcomeAnalytics ? '✅' : '❌'}</div>
      </div>
    </div>
  );
};

export default WelcomeDemo;