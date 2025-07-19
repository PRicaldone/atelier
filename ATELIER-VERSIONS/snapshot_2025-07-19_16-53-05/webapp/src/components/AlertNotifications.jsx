/**
 * Alert Notifications Component - UI for displaying alerts
 * Handles toast notifications, modals, and persistent alerts
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle,
  Bell,
  BellOff
} from 'lucide-react';
import alertSystem, { AlertSeverity, AlertChannel } from '../utils/alertSystem';

const AlertNotifications = () => {
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);
  const [persistentAlerts, setPersistentAlerts] = useState([]);
  const [muted, setMuted] = useState(() => {
    return localStorage.getItem('ATELIER_ALERTS_MUTED') === 'true';
  });

  useEffect(() => {
    // Subscribe to alert system events
    const unsubscribe = alertSystem.subscribe((event, data) => {
      if (muted && data.severity !== AlertSeverity.CRITICAL) {
        return; // Don't show non-critical alerts when muted
      }

      switch (event) {
        case 'alert_created':
          if (data.channel === AlertChannel.PERSISTENT) {
            setPersistentAlerts(prev => [data, ...prev.slice(0, 4)]); // Keep max 5
          }
          break;
        case 'alert_dismissed':
          setPersistentAlerts(prev => prev.filter(a => a.id !== data.id));
          break;
      }
    });

    // Listen for custom events
    const handleToast = (event) => {
      if (muted && event.detail.type !== AlertSeverity.CRITICAL) return;
      
      const toast = {
        id: `toast_${Date.now()}`,
        ...event.detail,
        timestamp: new Date()
      };
      
      setToasts(prev => [toast, ...prev.slice(0, 4)]); // Keep max 5 toasts
      
      // Auto-dismiss after duration
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, toast.duration || 5000);
    };

    const handleModal = (event) => {
      setModal({
        id: `modal_${Date.now()}`,
        ...event.detail,
        timestamp: new Date()
      });
    };

    const handlePersistent = (event) => {
      if (muted && event.detail.severity !== AlertSeverity.CRITICAL) return;
      
      setPersistentAlerts(prev => [event.detail, ...prev.slice(0, 4)]);
    };

    window.addEventListener('atelier:toast', handleToast);
    window.addEventListener('atelier:modal', handleModal);
    window.addEventListener('atelier:persistent', handlePersistent);

    return () => {
      unsubscribe();
      window.removeEventListener('atelier:toast', handleToast);
      window.removeEventListener('atelier:modal', handleModal);
      window.removeEventListener('atelier:persistent', handlePersistent);
    };
  }, [muted]);

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    localStorage.setItem('ATELIER_ALERTS_MUTED', newMuted.toString());
  };

  const dismissToast = (toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  };

  const dismissModal = () => {
    setModal(null);
  };

  const dismissPersistent = (alertId) => {
    alertSystem.dismissAlert(alertId);
    setPersistentAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case AlertSeverity.CRITICAL:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case AlertSeverity.ERROR:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case AlertSeverity.WARNING:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case AlertSeverity.INFO:
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getAlertColors = (type) => {
    switch (type) {
      case AlertSeverity.CRITICAL:
        return 'bg-red-50 border-red-200 text-red-800';
      case AlertSeverity.ERROR:
        return 'bg-red-50 border-red-200 text-red-800';
      case AlertSeverity.WARNING:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case AlertSeverity.INFO:
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  const getToastColors = (type) => {
    switch (type) {
      case AlertSeverity.CRITICAL:
        return 'bg-red-600 text-white';
      case AlertSeverity.ERROR:
        return 'bg-red-500 text-white';
      case AlertSeverity.WARNING:
        return 'bg-yellow-500 text-white';
      case AlertSeverity.INFO:
        return 'bg-blue-500 text-white';
      default:
        return 'bg-green-500 text-white';
    }
  };

  return (
    <>
      {/* Mute Toggle (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={toggleMute}
          className="fixed top-4 right-20 z-50 p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          title={muted ? 'Unmute Alerts' : 'Mute Alerts'}
        >
          {muted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
        </button>
      )}

      {/* Persistent Alerts Banner */}
      {persistentAlerts.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-red-600 to-red-700 text-white p-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <span className="font-medium">{persistentAlerts[0].title}</span>
                <span className="ml-2 text-red-100">{persistentAlerts[0].message}</span>
              </div>
            </div>
            <button
              onClick={() => dismissPersistent(persistentAlerts[0].id)}
              className="p-1 hover:bg-red-800 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto max-w-sm p-4 rounded-lg shadow-lg transform transition-all duration-300 ${getToastColors(toast.type)}`}
          >
            <div className="flex items-start gap-3">
              {getAlertIcon(toast.type)}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{toast.title}</h4>
                <p className="text-sm opacity-90 mt-1">{toast.message}</p>
                
                {toast.actions && toast.actions.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {toast.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className="px-3 py-1 text-xs bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="flex-shrink-0 p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Alert */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getAlertIcon(modal.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {modal.title}
                  </h3>
                  <p className="text-gray-700 mb-4">
                    {modal.message}
                  </p>
                  
                  {modal.details && Object.keys(modal.details).length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 rounded border">
                      <details className="text-sm">
                        <summary className="cursor-pointer font-medium text-gray-600 mb-2">
                          Technical Details
                        </summary>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto">
                          {JSON.stringify(modal.details, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                {modal.actions && modal.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.action();
                      dismissModal();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
                <button
                  onClick={dismissModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Alerts Sidebar (if more than 1) */}
      {persistentAlerts.length > 1 && (
        <div className="fixed right-4 top-20 z-40 w-80 space-y-2">
          {persistentAlerts.slice(1).map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border shadow-sm ${getAlertColors(alert.severity)}`}
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.severity)}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <p className="text-sm opacity-75 mt-1">{alert.message}</p>
                  
                  {alert.actions && alert.actions.length > 0 && (
                    <div className="mt-2 space-x-2">
                      {alert.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={action.action}
                          className="text-xs underline hover:no-underline"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => dismissPersistent(alert.id)}
                  className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default AlertNotifications;