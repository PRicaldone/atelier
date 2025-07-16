/**
 * URLLauncherNode - Agentic node for opening URLs
 * 
 * Features:
 * - Click to open URLs in browser
 * - Visual preview and favicon fetching
 * - URL validation and security checks
 * - Support for various protocols (http, https, figma, etc.)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  Globe, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Edit3
} from 'lucide-react';

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

// Protocol-specific icons and handling
const PROTOCOL_ICONS = {
  'http': '🌐',
  'https': '🌐',
  'figma': '🎨',
  'sketch': '💎',
  'notion': '📝',
  'slack': '💬',
  'discord': '🎮',
  'spotify': '🎵',
  'zoom': '📹',
  'mailto': '📧',
  'tel': '📞'
};

const URLLauncherNode = ({ element, onUpdate, onExecute }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  
  const { data } = element;
  const { url, title, description, favicon, icon, status, openInNewTab } = data;
  
  const StatusIcon = STATUS_ICONS[status];
  
  // Detect protocol and get appropriate icon
  const getProtocolIcon = useCallback((urlString) => {
    if (!urlString) return '🔗';
    
    try {
      const urlObj = new URL(urlString);
      const protocol = urlObj.protocol.replace(':', '');
      const hostname = urlObj.hostname.toLowerCase();
      
      // Check for specific services
      if (hostname.includes('figma.com')) return PROTOCOL_ICONS.figma;
      if (hostname.includes('notion.so')) return PROTOCOL_ICONS.notion;
      if (hostname.includes('slack.com')) return PROTOCOL_ICONS.slack;
      if (hostname.includes('discord.com')) return PROTOCOL_ICONS.discord;
      if (hostname.includes('spotify.com')) return PROTOCOL_ICONS.spotify;
      if (hostname.includes('zoom.us')) return PROTOCOL_ICONS.zoom;
      
      // Check protocol
      return PROTOCOL_ICONS[protocol] || '🔗';
    } catch {
      return '🔗';
    }
  }, []);
  
  // Validate URL format and security
  const validateURL = useCallback((urlString) => {
    if (!urlString) return { valid: false, error: 'URL is required' };
    
    try {
      const urlObj = new URL(urlString);
      
      // Allowed protocols for security
      const allowedProtocols = [
        'http:', 'https:', 'figma:', 'sketch:', 'notion:', 
        'slack:', 'discord:', 'spotify:', 'zoom:', 'mailto:', 'tel:'
      ];
      
      if (!allowedProtocols.includes(urlObj.protocol)) {
        return { valid: false, error: `Protocol ${urlObj.protocol} not allowed` };
      }
      
      // Block potentially dangerous URLs
      const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0'];
      if (blockedHosts.includes(urlObj.hostname)) {
        return { valid: false, error: 'Local URLs not allowed for security' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Invalid URL format' };
    }
  }, []);
  
  // Handle URL opening
  const handleOpenURL = useCallback(async () => {
    if (!url || isExecuting) return;
    
    setIsExecuting(true);
    
    try {
      // Update status to opening
      onUpdate(element.id, {
        data: { ...data, status: 'opening' }
      });
      
      // Validate URL
      const validation = validateURL(url);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      // Open URL
      if (openInNewTab) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = url;
      }
      
      // Update status to ready
      onUpdate(element.id, {
        data: { ...data, status: 'ready' }
      });
      
      // Notify parent component
      if (onExecute) {
        onExecute('url-opened', { url, title });
      }
      
    } catch (error) {
      console.error('Failed to open URL:', error);
      
      onUpdate(element.id, {
        data: { 
          ...data, 
          status: 'error',
          lastError: error.message
        }
      });
      
      // Show user-friendly error
      alert(`Failed to open URL: ${error.message}`);
      
    } finally {
      setIsExecuting(false);
    }
  }, [url, isExecuting, data, element.id, onUpdate, onExecute, openInNewTab, validateURL]);
  
  // Start editing URL
  const startEditing = useCallback((e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(url || '');
  }, [url]);
  
  // Save URL changes
  const saveURL = useCallback(() => {
    const trimmedURL = editValue.trim();
    
    if (trimmedURL) {
      // Add https:// if no protocol specified
      let finalURL = trimmedURL;
      if (!trimmedURL.includes('://') && !trimmedURL.startsWith('mailto:') && !trimmedURL.startsWith('tel:')) {
        finalURL = `https://${trimmedURL}`;
      }
      
      const validation = validateURL(finalURL);
      const newIcon = getProtocolIcon(finalURL);
      
      // Extract title from URL
      let newTitle = title;
      if (!title || title === 'Enter URL') {
        try {
          const urlObj = new URL(finalURL);
          newTitle = urlObj.hostname;
        } catch {
          newTitle = finalURL;
        }
      }
      
      onUpdate(element.id, {
        data: {
          ...data,
          url: finalURL,
          title: newTitle,
          icon: newIcon,
          status: validation.valid ? 'ready' : 'error',
          lastError: validation.error || null
        }
      });
    }
    
    setIsEditing(false);
  }, [editValue, element.id, data, onUpdate, validateURL, getProtocolIcon, title]);
  
  // Cancel editing
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditValue(url || '');
  }, [url]);
  
  // Handle Enter key in input
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      saveURL();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  }, [saveURL, cancelEditing]);
  
  return (
    <motion.div
      className={`
        relative bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-200 cursor-pointer
        ${status === 'ready' ? 'border-blue-300 dark:border-blue-600' : ''}
        ${status === 'opening' ? 'border-green-300 dark:border-green-600' : ''}
        ${status === 'error' ? 'border-red-300 dark:border-red-600' : ''}
        ${!url ? 'border-gray-300 dark:border-gray-600 border-dashed' : ''}
        ${isHovered ? 'shadow-lg scale-105' : 'shadow-md'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={url && !isEditing ? handleOpenURL : undefined}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Protocol Icon */}
      <div className="absolute top-3 left-3">
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center
          ${status === 'ready' ? 'bg-blue-100 dark:bg-blue-900' : ''}
          ${status === 'opening' ? 'bg-green-100 dark:bg-green-900' : ''}
          ${status === 'error' ? 'bg-red-100 dark:bg-red-900' : ''}
          ${!url ? 'bg-gray-100 dark:bg-gray-700' : ''}
        `}>
          <Globe className={`w-4 h-4 ${STATUS_COLORS[status] || 'text-gray-500'}`} />
        </div>
      </div>
      
      {/* Status Indicator */}
      <div className="absolute top-3 right-3">
        <StatusIcon className={`w-4 h-4 ${STATUS_COLORS[status]}`} />
      </div>
      
      {/* Edit Button */}
      {!isEditing && (
        <div className="absolute top-3 right-10">
          <button
            onClick={startEditing}
            className="w-6 h-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors flex items-center justify-center"
          >
            <Edit3 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      )}
      
      {/* Content */}
      <div className="pt-14 pb-4 px-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{icon}</span>
          <h3 className="font-medium text-gray-900 dark:text-white truncate">
            {title}
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {description}
        </p>
        
        {/* URL Display/Edit */}
        {isEditing ? (
          <div className="mb-4">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={saveURL}
              placeholder="Enter URL..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              autoFocus
            />
          </div>
        ) : url ? (
          <div className="text-xs text-gray-500 dark:text-gray-500 mb-4">
            <div className="truncate" title={url}>
              🔗 {url}
            </div>
          </div>
        ) : null}
        
        {/* Action Button */}
        <div className="flex items-center justify-between">
          {!url ? (
            <button
              onClick={startEditing}
              className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg text-center transition-colors"
            >
              Enter URL
            </button>
          ) : (
            <button
              onClick={handleOpenURL}
              disabled={isExecuting || status === 'opening'}
              className={`
                flex-1 py-2 px-3 text-sm rounded-lg transition-colors flex items-center justify-center gap-2
                ${status === 'ready' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}
                ${status === 'opening' ? 'bg-green-500 text-white cursor-not-allowed' : ''}
                ${status === 'error' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
              `}
            >
              <ExternalLink className="w-3 h-3" />
              {status === 'opening' ? 'Opening...' : 'Open URL'}
            </button>
          )}
        </div>
        
        {/* Error Message */}
        {status === 'error' && data.lastError && (
          <div className="mt-2 text-xs text-red-600 dark:text-red-400">
            {data.lastError}
          </div>
        )}
      </div>
      
      {/* Loading Overlay */}
      {isExecuting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center"
        >
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default URLLauncherNode;