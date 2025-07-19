/**
 * TaskPreviewModal - AI Command Preview Interface
 * 
 * Provides transparent preview of AI command execution with detailed
 * step-by-step breakdown, risk assessment, and customization options.
 * 
 * Features:
 * - Visual workflow steps
 * - Impact analysis
 * - Risk warnings
 * - Execution customization
 * - Time estimates
 * - Cancel/proceed options
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Play, Pause, Clock, AlertTriangle, CheckCircle, 
  Info, Settings, Eye, Shield, Zap, ArrowRight,
  FileText, Database, ExternalLink, Cpu, Timer,
  BarChart3, TrendingUp, Users, Lock
} from 'lucide-react';

const TaskPreviewModal = ({ 
  isOpen, 
  onClose, 
  preview, 
  onExecute, 
  onExecuteWithOptions 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showTechnical, setShowTechnical] = useState(false);

  // Initialize selected options with defaults
  useEffect(() => {
    if (preview?.customization) {
      const defaults = {};
      Object.entries(preview.customization).forEach(([category, options]) => {
        Object.entries(options).forEach(([option, config]) => {
          if (config.enabled) {
            defaults[`${category}.${option}`] = config.enabled;
          }
        });
      });
      setSelectedOptions(defaults);
    }
  }, [preview]);

  if (!isOpen || !preview) return null;

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': 'text-red-600 bg-red-50 border-red-200',
      'high': 'text-orange-600 bg-orange-50 border-orange-200',
      'medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'low': 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors[severity] || colors.low;
  };

  const getRecommendationColor = (action) => {
    const colors = {
      'highly_recommended': 'bg-green-500',
      'safe_to_proceed': 'bg-blue-500',
      'caution_advised': 'bg-yellow-500',
      'review_required': 'bg-red-500',
      'error': 'bg-red-600'
    };
    return colors[action] || colors.safe_to_proceed;
  };

  const getStepTypeIcon = (type) => {
    const icons = {
      'preparation': <Settings className="w-4 h-4" />,
      'connector': <Database className="w-4 h-4" />,
      'orchestration': <Cpu className="w-4 h-4" />,
      'processing': <BarChart3 className="w-4 h-4" />,
      'integration': <ArrowRight className="w-4 h-4" />,
      'finalization': <CheckCircle className="w-4 h-4" />
    };
    return icons[type] || <Info className="w-4 h-4" />;
  };

  const handleOptionChange = (optionKey, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionKey]: value
    }));
  };

  const handleExecute = () => {
    if (onExecuteWithOptions) {
      onExecuteWithOptions(selectedOptions);
    } else {
      onExecute();
    }
  };

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">AI Command Preview</h2>
            <p className="text-sm text-gray-600 mt-1 truncate">{preview.command}</p>
          </div>
          
          {/* Recommendation Badge */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium ${getRecommendationColor(preview.recommendedAction?.action)}`}>
            {preview.recommendedAction?.action === 'highly_recommended' && <TrendingUp className="w-4 h-4" />}
            {preview.recommendedAction?.action === 'safe_to_proceed' && <CheckCircle className="w-4 h-4" />}
            {preview.recommendedAction?.action === 'caution_advised' && <AlertTriangle className="w-4 h-4" />}
            {preview.recommendedAction?.action === 'review_required' && <Shield className="w-4 h-4" />}
            {preview.recommendedAction?.message}
          </div>
          
          <button
            onClick={onClose}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { key: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
            { key: 'steps', label: 'Steps', icon: <ArrowRight className="w-4 h-4" /> },
            { key: 'impact', label: 'Impact', icon: <BarChart3 className="w-4 h-4" /> },
            { key: 'risks', label: 'Risks', icon: <Shield className="w-4 h-4" /> },
            { key: 'options', label: 'Options', icon: <Settings className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What will happen</h3>
                <p className="text-gray-700 leading-relaxed">{preview.summary}</p>
              </div>

              {/* AI Explanation */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Reasoning</h3>
                <p className="text-gray-700 leading-relaxed">{preview.explanation}</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Timer className="w-4 h-4" />
                    <span className="text-sm font-medium">Duration</span>
                  </div>
                  <div className="text-lg font-bold text-blue-900">
                    {formatDuration(preview.timeline?.totalDuration || 0)}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">Time Saved</span>
                  </div>
                  <div className="text-lg font-bold text-green-900">
                    {formatDuration(preview.impact?.timeSaved || 0)}
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <ArrowRight className="w-4 h-4" />
                    <span className="text-sm font-medium">Steps</span>
                  </div>
                  <div className="text-lg font-bold text-purple-900">
                    {preview.steps?.length || 0}
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-600 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Services</span>
                  </div>
                  <div className="text-lg font-bold text-orange-900">
                    {preview.impact?.externalServices?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Steps Tab */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Execution Steps</h3>
              
              <div className="space-y-3">
                {preview.steps?.map((step, index) => (
                  <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          {getStepTypeIcon(step.type)}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{step.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatDuration(step.duration)}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{step.description}</p>
                        
                        {/* Step Details */}
                        {step.details?.actions && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-700">Actions:</div>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {step.details.actions.map((action, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Risk Indicators */}
                        {step.details?.risks && (
                          <div className="mt-2 flex items-center gap-2">
                            {step.details.risks.map((risk, idx) => (
                              <span key={idx} className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(risk)}`}>
                                {risk} risk
                              </span>
                            ))}
                            {!step.details.reversible && (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">
                                Irreversible
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Impact Tab */}
          {activeTab === 'impact' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Impact Analysis</h3>
              
              {/* Modules Affected */}
              {preview.impact?.modules?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Modules Affected</h4>
                  <div className="flex flex-wrap gap-2">
                    {preview.impact.modules.map(module => (
                      <span key={module} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {module}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* External Services */}
              {preview.impact?.externalServices?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">External Services</h4>
                  <div className="space-y-2">
                    {preview.impact.externalServices.map(service => (
                      <div key={service} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <ExternalLink className="w-4 h-4 text-gray-500" />
                        <span className="text-sm capitalize">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Visible Changes */}
              {preview.impact?.userVisible?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">User Visible Changes</h4>
                  <div className="space-y-2">
                    {preview.impact.userVisible.map((change, idx) => (
                      <div key={idx} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="font-medium text-yellow-800">{change.module}</div>
                        <div className="text-sm text-yellow-700">{change.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* State Changes */}
              {preview.impact?.stateChanges?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Permanent Changes</h4>
                  <div className="space-y-2">
                    {preview.impact.stateChanges.map((change, idx) => (
                      <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-center gap-2 text-red-700 mb-1">
                          <Lock className="w-4 h-4" />
                          <span className="font-medium">Irreversible Change</span>
                        </div>
                        <div className="text-sm text-red-600">{change.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Risks Tab */}
          {activeTab === 'risks' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
              
              {preview.risks?.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">No Risks Detected</h4>
                  <p className="text-gray-600">This command appears safe to execute.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {preview.risks?.map((risk, idx) => (
                    <div key={idx} className={`border rounded-lg p-4 ${getSeverityColor(risk.severity)}`}>
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{risk.category.replace('_', ' ')}</h4>
                            <span className="px-2 py-1 text-xs rounded-full bg-current bg-opacity-20">
                              {risk.severity}
                            </span>
                          </div>
                          <p className="mb-2">{risk.description}</p>
                          <div className="text-sm opacity-80">
                            <strong>Mitigation:</strong> {risk.mitigation}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Options Tab */}
          {activeTab === 'options' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Execution Options</h3>
                <button
                  onClick={() => setShowTechnical(!showTechnical)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showTechnical ? 'Hide' : 'Show'} Technical Details
                </button>
              </div>
              
              {preview.customization && Object.entries(preview.customization).map(([category, options]) => (
                <div key={category}>
                  <h4 className="font-medium text-gray-900 mb-3 capitalize">{category} Options</h4>
                  <div className="space-y-3">
                    {Object.entries(options).map(([optionKey, config]) => {
                      const fullKey = `${category}.${optionKey}`;
                      return (
                        <div key={optionKey} className="flex items-start gap-3 p-3 border border-gray-200 rounded">
                          <input
                            type="checkbox"
                            id={fullKey}
                            checked={selectedOptions[fullKey] || false}
                            onChange={(e) => handleOptionChange(fullKey, e.target.checked)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <label htmlFor={fullKey} className="font-medium text-gray-900 cursor-pointer">
                              {config.description}
                            </label>
                            <p className="text-sm text-gray-600 mt-1">{config.impact}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Technical Details */}
              {showTechnical && preview.technical && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Technical Details</h4>
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(preview.technical, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Est. {formatDuration(preview.timeline?.totalDuration || 0)}
            </div>
            {preview.impact?.timeSaved > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                Saves {formatDuration(preview.impact.timeSaved)}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            {preview.canExecute ? (
              <button
                onClick={handleExecute}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Execute Command
              </button>
            ) : (
              <button
                disabled
                className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Cannot Execute
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPreviewModal;