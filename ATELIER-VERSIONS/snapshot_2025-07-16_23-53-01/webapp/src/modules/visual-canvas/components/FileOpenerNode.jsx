/**
 * FileOpenerNode - Agentic node for opening files
 * 
 * Features:
 * - Click to open files in default or specified application
 * - Visual feedback for file type and status
 * - Security validation and user confirmation
 * - Cross-platform file path handling
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  Code, 
  Settings,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Lightbulb,
  Zap
} from 'lucide-react';
import { analyzeFile, analyzeTextContent } from '../utils/fileIntelligence.js';

// File type icons mapping
const FILE_TYPE_ICONS = {
  // Documents
  'pdf': FileText,
  'doc': FileText,
  'docx': FileText,
  'txt': FileText,
  'md': FileText,
  
  // Images
  'jpg': Image,
  'jpeg': Image,
  'png': Image,
  'gif': Image,
  'svg': Image,
  'psd': Image,
  'ai': Image,
  'fig': Image,
  'sketch': Image,
  
  // Video
  'mp4': Video,
  'mov': Video,
  'avi': Video,
  'mkv': Video,
  
  // Audio
  'mp3': Music,
  'wav': Music,
  'flac': Music,
  
  // Code
  'js': Code,
  'jsx': Code,
  'ts': Code,
  'tsx': Code,
  'css': Code,
  'html': Code,
  'py': Code,
  'json': Code,
  
  // Archives
  'zip': Archive,
  'rar': Archive,
  '7z': Archive,
  
  // Default
  'unknown': FileText
};

const STATUS_COLORS = {
  ready: 'text-green-600 dark:text-green-400',
  opening: 'text-blue-600 dark:text-blue-400',
  error: 'text-red-600 dark:text-red-400'
};

const STATUS_ICONS = {
  ready: CheckCircle,
  opening: Clock,
  error: AlertTriangle
};

const FileOpenerNode = ({ element, onUpdate, onExecute }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { data } = element;
  const { 
    filePath, 
    fileName, 
    description, 
    fileType, 
    icon, 
    status, 
    exists,
    // New intelligent properties
    analysis,
    suggestions,
    automations,
    confidence
  } = data;
  
  // Get appropriate icon for file type
  const FileIcon = FILE_TYPE_ICONS[fileType] || FILE_TYPE_ICONS.unknown;
  const StatusIcon = STATUS_ICONS[status];
  
  // Extract file extension from path
  const getFileType = useCallback((path) => {
    if (!path) return 'unknown';
    const extension = path.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  }, []);
  
  // Format file size for display
  const formatFileSize = useCallback((bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }, []);
  
  // Handle file opening action
  const handleOpenFile = useCallback(async () => {
    if (!filePath || isExecuting) return;
    
    setIsExecuting(true);
    
    try {
      // Update status to opening
      onUpdate(element.id, {
        data: { ...data, status: 'opening' }
      });
      
      // Security validation
      const isSecurePath = validateFilePath(filePath);
      if (!isSecurePath) {
        throw new Error('File path not allowed for security reasons');
      }
      
      // Execute file opening
      const result = await openFile(filePath, data.application);
      
      if (result.success) {
        onUpdate(element.id, {
          data: { ...data, status: 'ready' }
        });
        
        // Notify parent component
        if (onExecute) {
          onExecute('file-opened', { filePath, fileName });
        }
      } else {
        throw new Error(result.error || 'Failed to open file');
      }
      
    } catch (error) {
      console.error('Failed to open file:', error);
      
      onUpdate(element.id, {
        data: { 
          ...data, 
          status: 'error',
          lastError: error.message
        }
      });
      
      // Show user-friendly error
      alert(`Failed to open file: ${error.message}`);
      
    } finally {
      setIsExecuting(false);
    }
  }, [filePath, isExecuting, data, element.id, onUpdate, onExecute]);
  
  // File path validation for security
  const validateFilePath = useCallback((path) => {
    if (!path) return false;
    
    // Blocked paths for security
    const blockedPaths = [
      '/System/',
      '/usr/bin/',
      '/etc/',
      'C:\\Windows\\System32\\',
      'C:\\Windows\\SysWOW64\\'
    ];
    
    // Check if path contains blocked directories
    const isBlocked = blockedPaths.some(blocked => 
      path.toLowerCase().includes(blocked.toLowerCase())
    );
    
    return !isBlocked;
  }, []);
  
  // Mock file opening function (replace with Electron API in production)
  const openFile = useCallback(async (path, application = 'auto') => {
    // Simulate file opening delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would use Electron's shell.openPath
    // or spawn a specific application
    if (typeof window !== 'undefined' && window.electron) {
      return window.electron.openFile(path, application);
    }
    
    // Fallback for web version - open in browser if it's a URL-like path
    if (path.startsWith('http')) {
      window.open(path, '_blank');
      return { success: true };
    }
    
    // Mock success for demo
    console.log(`Would open file: ${path} with ${application}`);
    return { success: true };
  }, []);
  
  // Handle file selection via file input with intelligent analysis
  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const newFileType = getFileType(file.name);
    const newIcon = FILE_TYPE_ICONS[newFileType] ? '📄' : '📁';
    
    // Start file analysis
    setIsAnalyzing(true);
    
    try {
      // Basic file info update
      onUpdate(element.id, {
        data: {
          ...data,
          filePath: file.path || file.name,
          fileName: file.name,
          fileType: newFileType,
          fileSize: file.size,
          lastModified: file.lastModified,
          icon: newIcon,
          exists: true,
          status: 'ready'
        }
      });
      
      // Perform intelligent analysis
      const fileAnalysis = await analyzeFile(file);
      
      if (fileAnalysis) {
        // Update with analysis results
        onUpdate(element.id, {
          data: {
            ...data,
            filePath: file.path || file.name,
            fileName: file.name,
            fileType: newFileType,
            fileSize: file.size,
            lastModified: file.lastModified,
            icon: newIcon,
            exists: true,
            status: 'ready',
            analysis: fileAnalysis,
            suggestions: fileAnalysis.suggestions,
            automations: fileAnalysis.automations,
            confidence: fileAnalysis.confidence
          }
        });
        
        // Show suggestions if confidence is high
        if (fileAnalysis.confidence > 0.7) {
          setShowSuggestions(true);
        }
        
        // Notify parent about intelligent suggestions
        if (onExecute && fileAnalysis.suggestions.length > 0) {
          onExecute('file-analyzed', {
            fileName: file.name,
            analysis: fileAnalysis,
            suggestions: fileAnalysis.suggestions
          });
        }
      }
      
    } catch (error) {
      console.error('File analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [element.id, data, onUpdate, onExecute, getFileType]);
  
  return (
    <motion.div
      className={`
        relative bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-200 cursor-pointer
        ${status === 'ready' ? 'border-green-300 dark:border-green-600' : ''}
        ${status === 'opening' ? 'border-blue-300 dark:border-blue-600' : ''}
        ${status === 'error' ? 'border-red-300 dark:border-red-600' : ''}
        ${!filePath ? 'border-gray-300 dark:border-gray-600 border-dashed' : ''}
        ${isHovered ? 'shadow-lg scale-105' : 'shadow-md'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={filePath ? handleOpenFile : undefined}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* File Type Icon */}
      <div className="absolute top-3 left-3">
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center
          ${status === 'ready' ? 'bg-green-100 dark:bg-green-900' : ''}
          ${status === 'opening' ? 'bg-blue-100 dark:bg-blue-900' : ''}
          ${status === 'error' ? 'bg-red-100 dark:bg-red-900' : ''}
          ${!filePath ? 'bg-gray-100 dark:bg-gray-700' : ''}
        `}>
          <FileIcon className={`w-4 h-4 ${STATUS_COLORS[status] || 'text-gray-500'}`} />
        </div>
      </div>
      
      {/* Status Indicator */}
      <div className="absolute top-3 right-3">
        {isAnalyzing ? (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <StatusIcon className={`w-4 h-4 ${STATUS_COLORS[status]}`} />
        )}
      </div>
      
      {/* AI Analysis Indicator */}
      {(suggestions?.length > 0 || confidence > 0.7) && !isAnalyzing && (
        <div className="absolute top-3 right-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSuggestions(!showSuggestions);
            }}
            className="w-6 h-6 bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 rounded transition-colors flex items-center justify-center"
            title="View AI Suggestions"
          >
            <Brain className="w-3 h-3 text-purple-600 dark:text-purple-400" />
          </button>
        </div>
      )}
      
      {/* Content */}
      <div className="pt-14 pb-4 px-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{icon}</span>
          <h3 className="font-medium text-gray-900 dark:text-white truncate">
            {fileName}
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {description}
        </p>
        
        {/* File Info */}
        {filePath && (
          <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
            <div className="truncate" title={filePath}>
              📁 {filePath}
            </div>
            {data.fileSize && (
              <div>
                💾 {formatFileSize(data.fileSize)}
              </div>
            )}
          </div>
        )}
        
        {/* Action Button */}
        <div className="mt-4 flex items-center justify-between">
          {!filePath ? (
            <label className="flex-1">
              <input
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="w-full py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg text-center transition-colors">
                Select File
              </div>
            </label>
          ) : (
            <button
              onClick={handleOpenFile}
              disabled={isExecuting || status === 'opening'}
              className={`
                flex-1 py-2 px-3 text-sm rounded-lg transition-colors flex items-center justify-center gap-2
                ${status === 'ready' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                ${status === 'opening' ? 'bg-blue-500 text-white cursor-not-allowed' : ''}
                ${status === 'error' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
              `}
            >
              <ExternalLink className="w-3 h-3" />
              {status === 'opening' ? 'Opening...' : 'Open File'}
            </button>
          )}
        </div>
        
        {/* AI Suggestions Panel */}
        {showSuggestions && suggestions?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700"
          >
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                AI Suggestions
              </span>
              {confidence && (
                <span className="text-xs text-purple-500 dark:text-purple-400">
                  {Math.round(confidence * 100)}% confident
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onExecute) {
                      onExecute('execute-suggestion', {
                        suggestion,
                        fileName,
                        analysis
                      });
                    }
                  }}
                  className="w-full text-left p-2 text-xs bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded border border-purple-200 dark:border-purple-600 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-3 h-3 text-purple-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {suggestion.title}
                    </span>
                    {suggestion.priority === 'high' && (
                      <span className="px-1 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded">
                        Priority
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Automations */}
            {automations?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Quick Actions
                  </span>
                </div>
                
                {automations.slice(0, 2).map((automation, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onExecute) {
                        onExecute('execute-automation', {
                          automation,
                          fileName,
                          analysis
                        });
                      }
                    }}
                    className="w-full text-left p-2 text-xs bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded transition-colors mb-1"
                  >
                    <div className="font-medium">{automation.title}</div>
                    <div className="text-purple-100 text-xs">{automation.description}</div>
                    <div className="text-purple-200 text-xs mt-1">⚡ {automation.estimatedTime}</div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Loading Overlay */}
      {(isExecuting || isAnalyzing) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center"
        >
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {isAnalyzing && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs">
              Analyzing file...
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default FileOpenerNode;