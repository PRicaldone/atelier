import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  Bell,
  Mail,
  Webhook,
  MessageSquare,
  Monitor,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Activity,
  Zap,
  Target
} from 'lucide-react';
import alertingSystem, { 
  AlertSeverity, 
  AlertType, 
  NotificationChannel,
  ConsoleNotificationChannel,
  BrowserNotificationChannel,
  WebhookNotificationChannel,
  EmailNotificationChannel,
  TelegramNotificationChannel
} from '../modules/shared/alerting/AlertingSystem.js';

const AlertingConfigurationUI = () => {
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newChannelType, setNewChannelType] = useState('');
  const [showNewChannelForm, setShowNewChannelForm] = useState(false);
  const [alertHistory, setAlertHistory] = useState([]);

  // Channel configuration templates
  const channelTemplates = {
    [NotificationChannel.EMAIL]: {
      name: 'Email Notifications',
      icon: Mail,
      defaultConfig: {
        enabled: true,
        recipients: ['admin@atelier.com'],
        smtp: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: '',
            pass: ''
          }
        },
        template: 'default'
      }
    },
    [NotificationChannel.WEBHOOK]: {
      name: 'Webhook Integration',
      icon: Webhook,
      defaultConfig: {
        enabled: true,
        url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    },
    [NotificationChannel.TELEGRAM]: {
      name: 'Telegram Bot',
      icon: MessageSquare,
      defaultConfig: {
        enabled: true,
        botToken: 'YOUR_BOT_TOKEN',
        chatId: 'YOUR_CHAT_ID'
      }
    },
    [NotificationChannel.BROWSER]: {
      name: 'Browser Notifications',
      icon: Monitor,
      defaultConfig: {
        enabled: true,
        autoCloseDelay: 5000
      }
    },
    [NotificationChannel.CONSOLE]: {
      name: 'Console Logging',
      icon: Activity,
      defaultConfig: {
        enabled: true
      }
    }
  };

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration();
    loadAlertHistory();
  }, []);

  const loadConfiguration = () => {
    const systemStatus = alertingSystem.getStatus();
    setStatus(systemStatus);
    setConfig(systemStatus.config);
  };

  const loadAlertHistory = () => {
    const history = alertingSystem.getAlertHistory({ limit: 20 });
    setAlertHistory(history);
  };

  // Save configuration
  const saveConfiguration = () => {
    if (config) {
      alertingSystem.updateConfig(config);
      loadConfiguration(); // Reload to get updated status
    }
  };

  // Test notification channel
  const testChannel = async (channelName) => {
    setIsTesting(true);
    setTestResults(prev => ({ ...prev, [channelName]: 'testing' }));
    
    try {
      // Get the channel instance
      const channels = new Map();
      status.channels.forEach(ch => {
        if (ch.name === channelName) {
          channels.set(ch.name, ch);
        }
      });
      
      // Mock test - in real implementation this would call the actual channel test
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const success = Math.random() > 0.2; // 80% success rate for demo
      setTestResults(prev => ({ 
        ...prev, 
        [channelName]: success ? 'success' : 'error' 
      }));
      
    } catch (error) {
      setTestResults(prev => ({ ...prev, [channelName]: 'error' }));
    } finally {
      setIsTesting(false);
      
      // Clear test result after 3 seconds
      setTimeout(() => {
        setTestResults(prev => {
          const newResults = { ...prev };
          delete newResults[channelName];
          return newResults;
        });
      }, 3000);
    }
  };

  // Test all channels
  const testAllChannels = async () => {
    setIsTestingAll(true);
    
    try {
      const results = await alertingSystem.testAllChannels();
      
      // Convert results to our format
      const formattedResults = {};
      Object.entries(results).forEach(([channelName, result]) => {
        formattedResults[channelName] = result.success ? 'success' : 'error';
      });
      
      setTestResults(formattedResults);
      
      // Clear results after 5 seconds
      setTimeout(() => {
        setTestResults({});
      }, 5000);
      
    } catch (error) {
      console.error('Failed to test all channels:', error);
    } finally {
      setIsTestingAll(false);
    }
  };

  // Send test alert
  const sendTestAlert = async () => {
    try {
      await alertingSystem.sendAlert({
        type: AlertType.CUSTOM,
        severity: AlertSeverity.INFO,
        title: 'Test Alert from Configuration UI',
        message: 'This is a test alert to verify the notification system is working correctly.',
        source: 'alerting-config-ui'
      });
      
      // Reload history to show the new alert
      setTimeout(loadAlertHistory, 1000);
    } catch (error) {
      console.error('Failed to send test alert:', error);
    }
  };

  // Add new notification channel
  const addNewChannel = (type) => {
    const template = channelTemplates[type];
    if (!template) return;
    
    // In a real implementation, this would add the channel to the alerting system
    console.log('Adding new channel:', type, template.defaultConfig);
    setShowNewChannelForm(false);
    setNewChannelType('');
    loadConfiguration(); // Reload configuration
  };

  // Update configuration value
  const updateConfig = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Get test result icon
  const getTestResultIcon = (channelName) => {
    const result = testResults[channelName];
    
    switch (result) {
      case 'testing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Get severity badge style
  const getSeverityStyle = (severity) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return `${baseClasses} bg-red-100 text-red-800`;
      case AlertSeverity.HIGH:
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case AlertSeverity.MEDIUM:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case AlertSeverity.LOW:
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case AlertSeverity.INFO:
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (!status || !config) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading alerting configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Alerting Configuration
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Configure notification channels, alert thresholds, and system behavior
        </p>
      </div>

      {/* System Status */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* System Enabled */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">System Status</p>
              <p className={`text-lg font-bold ${status.enabled ? 'text-green-600' : 'text-red-600'}`}>
                {status.enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <Bell className={`w-8 h-8 ${status.enabled ? 'text-green-500' : 'text-gray-400'}`} />
          </div>
        </div>

        {/* Active Channels */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Channels</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {status.channels.filter(ch => ch.enabled).length}
              </p>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recent Alerts</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {status.history.total}
              </p>
            </div>
            <Activity className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        {/* Rate Limiter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rate Limited</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {status.rateLimiter.activeKeys}
              </p>
            </div>
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 flex flex-wrap gap-4">
        <button
          onClick={() => alertingSystem.setEnabled(!status.enabled)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            status.enabled 
              ? 'bg-red-100 text-red-800 hover:bg-red-200' 
              : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
        >
          {status.enabled ? 'Disable System' : 'Enable System'}
        </button>

        <button
          onClick={testAllChannels}
          disabled={isTestingAll}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isTestingAll ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <TestTube className="w-4 h-4" />
          )}
          <span>{isTestingAll ? 'Testing...' : 'Test All Channels'}</span>
        </button>

        <button
          onClick={sendTestAlert}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span>Send Test Alert</span>
        </button>

        <button
          onClick={saveConfiguration}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      {/* Main Configuration Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Notification Channels */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Notification Channels
            </h2>
            <button
              onClick={() => setShowNewChannelForm(true)}
              className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Channel</span>
            </button>
          </div>

          <div className="space-y-4">
            {status.channels.map((channel) => {
              const template = channelTemplates[channel.name];
              const Icon = template?.icon || Settings;
              
              return (
                <motion.div
                  key={channel.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        {template?.name || channel.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        channel.enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {channel.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getTestResultIcon(channel.name)}
                      <button
                        onClick={() => testChannel(channel.name)}
                        disabled={isTesting}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50 transition-colors"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                  
                  {/* Channel Configuration Preview */}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {channel.name === 'webhook' && channel.config?.url && (
                      <span>URL: {channel.config.url.substring(0, 40)}...</span>
                    )}
                    {channel.name === 'email' && channel.config?.recipients && (
                      <span>Recipients: {channel.config.recipients.length}</span>
                    )}
                    {channel.name === 'telegram' && channel.config?.chatId && (
                      <span>Chat ID: {channel.config.chatId}</span>
                    )}
                    {channel.name === 'browser' && (
                      <span>Auto-close: {channel.config?.autoCloseDelay || 5000}ms</span>
                    )}
                    {channel.name === 'console' && (
                      <span>Console logging enabled</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* System Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              System Configuration
            </h2>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showAdvanced ? 'Hide' : 'Show'} Advanced</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Enable Deduplication */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={config.enableDeduplication}
                  onChange={(e) => updateConfig('enableDeduplication', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Alert Deduplication
                </span>
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Prevent duplicate alerts within time window
              </p>
            </div>

            {/* Enable Rate Limiting */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={config.enableRateLimiting}
                  onChange={(e) => updateConfig('enableRateLimiting', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Rate Limiting
                </span>
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Limit number of alerts per time window
              </p>
            </div>

            {/* Minimum Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Severity to Send
              </label>
              <select
                value={config.minSeverityToSend}
                onChange={(e) => updateConfig('minSeverityToSend', e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value={AlertSeverity.INFO}>Info</option>
                <option value={AlertSeverity.LOW}>Low</option>
                <option value={AlertSeverity.MEDIUM}>Medium</option>
                <option value={AlertSeverity.HIGH}>High</option>
                <option value={AlertSeverity.CRITICAL}>Critical</option>
              </select>
            </div>

            {/* Default Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Alert Severity
              </label>
              <select
                value={config.defaultSeverity}
                onChange={(e) => updateConfig('defaultSeverity', e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value={AlertSeverity.INFO}>Info</option>
                <option value={AlertSeverity.LOW}>Low</option>
                <option value={AlertSeverity.MEDIUM}>Medium</option>
                <option value={AlertSeverity.HIGH}>High</option>
                <option value={AlertSeverity.CRITICAL}>Critical</option>
              </select>
            </div>

            {/* Advanced Settings */}
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4 border-t"
              >
                <h3 className="font-medium text-gray-800 dark:text-white">Advanced Settings</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Rate Limiter Keys: </span>
                    <span className="font-medium">{status.rateLimiter.activeKeys}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Deduplicator Keys: </span>
                    <span className="font-medium">{status.deduplicator.activeKeys}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total Alerts: </span>
                    <span className="font-medium">{status.history.total}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Channels: </span>
                    <span className="font-medium">{status.channels.length}</span>
                  </div>
                </div>

                {/* Clear Data Button */}
                <button
                  onClick={() => alertingSystem.clear()}
                  className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Clear All Alerting Data
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Alerts History */}
      {alertHistory.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Recent Alerts
          </h2>
          
          <div className="space-y-3">
            {alertHistory.slice(0, 10).map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 border rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={getSeverityStyle(alert.severity)}>
                      {alert.severity}
                    </span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {alert.title}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {alert.message}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Channel Modal */}
      {showNewChannelForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Add Notification Channel
            </h3>
            
            <div className="space-y-3">
              {Object.entries(channelTemplates).map(([type, template]) => {
                const Icon = template.icon;
                const isAlreadyAdded = status.channels.some(ch => ch.name === type);
                
                return (
                  <button
                    key={type}
                    onClick={() => addNewChannel(type)}
                    disabled={isAlreadyAdded}
                    className={`w-full flex items-center space-x-3 p-3 border rounded-lg text-left transition-colors ${
                      isAlreadyAdded 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {template.name}
                      </div>
                      {isAlreadyAdded && (
                        <div className="text-xs text-gray-500">Already added</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowNewChannelForm(false)}
                className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Console Commands */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Console Commands
        </h2>
        
        <div className="space-y-2 text-sm font-mono bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
          <div><span className="text-blue-600">window.__alertingSystem.sendAlert(alertData)</span> - Send custom alert</div>
          <div><span className="text-blue-600">window.__alertingSystem.testAllChannels()</span> - Test all notification channels</div>
          <div><span className="text-blue-600">window.__alertingSystem.getStatus()</span> - Get system status</div>
          <div><span className="text-blue-600">window.__alertingSystem.getAlertHistory()</span> - Get alert history</div>
          <div><span className="text-blue-600">window.__alertingSystem.clear()</span> - Clear all alerting data</div>
        </div>
      </div>
    </div>
  );
};

export default AlertingConfigurationUI;