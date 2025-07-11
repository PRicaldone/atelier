import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCanvasStore } from '../../store.js';
import { Link, ExternalLink, Globe, Eye, EyeOff, Trash2 } from 'lucide-react';

export const LinkCard = ({ element }) => {
  const { updateElement } = useCanvasStore();
  const [isEditing, setIsEditing] = useState(!element.data.url);
  const [tempUrl, setTempUrl] = useState(element.data.url || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const { data } = element;

  const handleUrlSubmit = async () => {
    if (!tempUrl.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Simple URL validation and formatting
      let url = tempUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // Extract domain for title if no title exists
      const domain = new URL(url).hostname.replace('www.', '');
      
      updateElement(element.id, {
        data: {
          ...data,
          url,
          title: data.title || domain,
          description: data.description || `Link to ${domain}`,
          preview: true
        }
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Invalid URL:', error);
      // Keep editing mode open for invalid URLs
    }
    
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleUrlSubmit();
    }
    if (e.key === 'Escape') {
      setTempUrl(data.url || '');
      setIsEditing(false);
    }
  };

  const openLink = () => {
    if (data.url) {
      window.open(data.url, '_blank', 'noopener,noreferrer');
    }
  };

  const togglePreview = () => {
    updateElement(element.id, {
      data: {
        ...data,
        preview: !data.preview
      }
    });
  };

  const removeLink = () => {
    updateElement(element.id, {
      data: {
        ...data,
        url: '',
        title: 'Untitled Link',
        description: '',
        favicon: null,
        thumbnail: null
      }
    });
    setTempUrl('');
    setIsEditing(true);
  };

  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url).origin;
      return `${domain}/favicon.ico`;
    } catch {
      return null;
    }
  };

  return (
    <motion.div
      className="w-full h-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-200 relative overflow-hidden group"
      whileHover={{ y: -2 }}
    >
      {isEditing ? (
        // URL input state
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
          <Link size={32} className="text-gray-400 dark:text-gray-500 mb-3" />
          <input
            type="url"
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleUrlSubmit}
            placeholder="Enter URL (e.g., example.com)"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            autoFocus
            disabled={isLoading}
          />
          <div className="flex space-x-2">
            <button
              onClick={handleUrlSubmit}
              disabled={isLoading || !tempUrl.trim()}
              className="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white text-xs rounded hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Add Link'}
            </button>
            {data.url && (
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-gray-500 dark:bg-gray-600 text-white text-xs rounded hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        // Link display state
        <div className="w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              {data.favicon ? (
                <img
                  src={data.favicon}
                  alt="Favicon"
                  className="w-4 h-4 flex-shrink-0"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <Globe size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {getDomain(data.url)}
              </span>
            </div>
            
            {/* Controls */}
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={togglePreview}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title={data.preview ? 'Hide preview' : 'Show preview'}
              >
                {data.preview ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
              <button
                onClick={openLink}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Open link"
              >
                <ExternalLink size={12} />
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Edit URL"
              >
                <Link size={12} />
              </button>
              <button
                onClick={removeLink}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900 text-red-500 dark:text-red-400 rounded"
                title="Remove link"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-3 cursor-pointer" onClick={openLink}>
            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
              {data.title || 'Untitled Link'}
            </h3>
            
            {data.description && data.preview && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-2">
                {data.description}
              </p>
            )}

            {/* Thumbnail preview */}
            {data.thumbnail && data.preview && (
              <div className="mt-2">
                <img
                  src={data.thumbnail}
                  alt="Link preview"
                  className="w-full h-16 object-cover rounded border"
                />
              </div>
            )}

            {/* URL display */}
            <div className="mt-auto pt-2">
              <span className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors truncate block">
                {data.url}
              </span>
            </div>
          </div>

          {/* Link indicator */}
          <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full opacity-60" />
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Globe size={24} className="text-blue-500 dark:text-blue-400" />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};