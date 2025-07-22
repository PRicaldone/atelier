/**
 * 🔑 FILE SYSTEM TYPES - Core Features Implementation
 * 
 * 🚨 POLICY: All code, data models, UX/UI flows and architecture
 * MUST comply with the single specification at /docs/BIFLOW-COMPLETE-TYPES.md (current version: v2.0.1).
 * In case of any doubt or discrepancy between code, comments, chat, or other docs,
 * the latest version of this document ALWAYS TAKES PRECEDENCE.
 * No structural changes may be made without reviewing and updating the spec.
 * 
 * This module implements the three core features:
 * 1. 🔑 File Link & Live Open
 * 2. 🔑 AI Assistant con File Context Awareness  
 * 3. 🔑 Universal Content Awareness (UCA)
 */

// 🔑 CORE FEATURE: File Types and Sources
export const FILE_SOURCES = {
  LOCAL: 'local',           // Local file system
  GOOGLE_DRIVE: 'gdrive',   // Google Drive
  DROPBOX: 'dropbox',       // Dropbox
  ICLOUD: 'icloud',         // iCloud Drive
  ONEDRIVE: 'onedrive',     // Microsoft OneDrive
  URL: 'url',               // Web URL/Link
  CLIPBOARD: 'clipboard',   // Clipboard content
  CAMERA: 'camera',         // Camera capture
  SCREEN: 'screen'          // Screen capture
};

// 🔑 CORE FEATURE: Universal Content Types
export const CONTENT_TYPES = {
  // Images
  IMAGE: 'image',
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_PNG: 'image/png',
  IMAGE_GIF: 'image/gif',
  IMAGE_WEBP: 'image/webp',
  IMAGE_SVG: 'image/svg+xml',
  
  // Video
  VIDEO: 'video',
  VIDEO_MP4: 'video/mp4',
  VIDEO_WEBM: 'video/webm',
  VIDEO_MOV: 'video/quicktime',
  VIDEO_AVI: 'video/x-msvideo',
  
  // Audio
  AUDIO: 'audio',
  AUDIO_MP3: 'audio/mpeg',
  AUDIO_WAV: 'audio/wav',
  AUDIO_OGG: 'audio/ogg',
  AUDIO_M4A: 'audio/mp4',
  
  // Documents
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS: 'application/vnd.ms-excel',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT: 'application/vnd.ms-powerpoint',
  PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  
  // Text
  TEXT: 'text/plain',
  HTML: 'text/html',
  CSS: 'text/css',
  JAVASCRIPT: 'text/javascript',
  JSON: 'application/json',
  XML: 'application/xml',
  
  // Archives
  ZIP: 'application/zip',
  RAR: 'application/x-rar-compressed',
  TAR: 'application/x-tar',
  GZIP: 'application/gzip',
  
  // Web
  URL: 'text/uri-list',
  LINK: 'link',
  
  // Generic
  UNKNOWN: 'application/octet-stream'
};

// 🔑 CORE FEATURE: File Element Data Structure
export const createFileElement = (file, source = FILE_SOURCES.LOCAL, options = {}) => {
  const now = Date.now();
  
  return {
    // Base element properties
    id: options.id || `file_${now}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'file',
    
    // 🔑 File-specific properties
    file: {
      // Basic info
      name: file.name || options.name || 'Untitled File',
      size: file.size || options.size || 0,
      lastModified: file.lastModified || options.lastModified || now,
      
      // Source and access
      source: source,
      path: options.path || null,           // Local file path
      url: options.url || null,             // Cloud/web URL
      cloudId: options.cloudId || null,     // Cloud service file ID
      
      // Content type detection
      mimeType: file.type || options.mimeType || CONTENT_TYPES.UNKNOWN,
      extension: getFileExtension(file.name || options.name || ''),
      category: getContentCategory(file.type || options.mimeType),
      
      // Permissions and access
      permissions: {
        read: options.permissions?.read !== false,
        write: options.permissions?.write || false,
        share: options.permissions?.share || false,
        download: options.permissions?.download !== false
      },
      
      // Security and privacy
      accessGranted: false,                 // User must grant access before AI can read
      lastAccessedAt: null,
      accessHistory: []
    },
    
    // 🔑 Universal Content Awareness properties
    preview: {
      // Auto-generated preview data
      thumbnail: null,                      // Base64 thumbnail for images/video
      snippet: null,                        // Text snippet for documents
      metadata: {},                         // Extracted metadata (EXIF, duration, etc.)
      
      // Rendering info
      renderer: getPreferredRenderer(file.type || options.mimeType),
      canPreview: canGeneratePreview(file.type || options.mimeType),
      needsProcessing: needsServerProcessing(file.type || options.mimeType),
      
      // Status
      isReady: false,
      isProcessing: false,
      processingProgress: 0,
      error: null
    },
    
    // 🔑 AI Context Awareness properties
    aiContext: {
      // Content analysis
      analyzed: false,
      analysisType: null,                   // 'text', 'image', 'audio', 'video', 'document'
      extractedText: null,                  // OCR, transcription, document text
      entities: [],                         // Named entities, objects, topics
      summary: null,                        // AI-generated summary
      
      // Relationships
      relatedElements: [],                  // IDs of related elements in workspace
      tags: [],                             // Auto-generated tags
      categories: [],                       // Auto-categorization
      
      // User interaction
      userPrompts: [],                      // User AI prompts about this file
      aiResponses: [],                      // AI responses about this file
      
      // Processing status
      processingQueue: [],                  // Queued AI operations
      lastAnalyzedAt: null,
      analysisVersion: '1.0'
    },
    
    // 🔑 UI and interaction properties
    ui: {
      // Visual representation
      position: options.position || { x: 0, y: 0 },
      size: options.size || { width: 200, height: 150 },
      
      // Display options
      showPreview: options.showPreview !== false,
      showFilename: options.showFilename !== false,
      showMetadata: options.showMetadata || false,
      
      // Interaction state
      isSelected: false,
      isHovered: false,
      isOpened: false,                      // File opened in mini-view
      isBeingDragged: false,
      
      // Layout
      zIndex: options.zIndex || 1,
      rotation: options.rotation || 0,
      opacity: options.opacity || 1
    },
    
    // Timestamps
    createdAt: now,
    updatedAt: now,
    lastInteractedAt: now,
    
    // BiFlow compliance
    biflow: {
      origin: options.biflowOrigin || 'manual',
      promotedFrom: options.promotedFrom || null,
      canPromote: true,
      preserveOnPromotion: ['file', 'preview', 'aiContext']
    }
  };
};

// 🔑 Helper Functions

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename) => {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.slice(lastDot + 1).toLowerCase() : '';
};

/**
 * Get content category from MIME type
 */
export const getContentCategory = (mimeType) => {
  if (!mimeType) return 'unknown';
  
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('text/')) return 'text';
  if (mimeType === CONTENT_TYPES.PDF) return 'document';
  if (mimeType.includes('word') || mimeType.includes('excel') || mimeType.includes('powerpoint')) return 'document';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive';
  if (mimeType === CONTENT_TYPES.JSON || mimeType === CONTENT_TYPES.XML) return 'data';
  
  return 'unknown';
};

/**
 * Get preferred renderer for content type
 */
export const getPreferredRenderer = (mimeType) => {
  const category = getContentCategory(mimeType);
  
  switch (category) {
    case 'image': return 'ImageRenderer';
    case 'video': return 'VideoRenderer';
    case 'audio': return 'AudioRenderer';
    case 'document': return 'DocumentRenderer';
    case 'text': return 'TextRenderer';
    case 'archive': return 'ArchiveRenderer';
    default: return 'GenericRenderer';
  }
};

/**
 * Check if content can be previewed
 */
export const canGeneratePreview = (mimeType) => {
  const category = getContentCategory(mimeType);
  return ['image', 'video', 'audio', 'text'].includes(category) || mimeType === CONTENT_TYPES.PDF;
};

/**
 * Check if content needs server-side processing
 */
export const needsServerProcessing = (mimeType) => {
  const category = getContentCategory(mimeType);
  return ['video', 'document', 'archive'].includes(category);
};

// 🔑 CORE FEATURE: File Access Management
export const fileAccessManager = {
  /**
   * Request access to file for AI processing
   */
  requestAccess: async (fileElement, purpose = 'analysis') => {
    if (fileElement.file.accessGranted) {
      return true;
    }
    
    // Show permission dialog to user
    const granted = await showFileAccessDialog(fileElement, purpose);
    
    if (granted) {
      fileElement.file.accessGranted = true;
      fileElement.file.lastAccessedAt = Date.now();
      fileElement.file.accessHistory.push({
        timestamp: Date.now(),
        purpose,
        granted: true
      });
    }
    
    return granted;
  },
  
  /**
   * Revoke access to file
   */
  revokeAccess: (fileElement) => {
    fileElement.file.accessGranted = false;
    fileElement.aiContext = {
      ...fileElement.aiContext,
      analyzed: false,
      extractedText: null,
      entities: [],
      summary: null
    };
  },
  
  /**
   * Check if AI can access file
   */
  canAccess: (fileElement) => {
    return fileElement.file.accessGranted && fileElement.file.permissions.read;
  }
};

// 🔑 CORE FEATURE: Content Analysis Queue
export const contentAnalysisQueue = {
  queue: [],
  processing: false,
  
  /**
   * Add file to analysis queue
   */
  enqueue: (fileElement, analysisType = 'auto') => {
    if (!fileAccessManager.canAccess(fileElement)) {
      throw new Error('File access not granted');
    }
    
    const task = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fileElement,
      analysisType,
      priority: getPriority(fileElement.file.mimeType),
      enqueuedAt: Date.now(),
      status: 'queued'
    };
    
    contentAnalysisQueue.queue.push(task);
    contentAnalysisQueue.processNext();
    
    return task.id;
  },
  
  /**
   * Process next item in queue
   */
  processNext: async () => {
    if (contentAnalysisQueue.processing || contentAnalysisQueue.queue.length === 0) {
      return;
    }
    
    contentAnalysisQueue.processing = true;
    const task = contentAnalysisQueue.queue.shift();
    
    try {
      task.status = 'processing';
      const result = await analyzeFile(task.fileElement, task.analysisType);
      
      // Update file element with analysis results
      task.fileElement.aiContext = {
        ...task.fileElement.aiContext,
        ...result,
        analyzed: true,
        lastAnalyzedAt: Date.now()
      };
      
      task.status = 'completed';
      
    } catch (error) {
      console.error('Analysis failed:', error);
      task.status = 'failed';
      task.error = error.message;
    }
    
    contentAnalysisQueue.processing = false;
    
    // Process next item
    if (contentAnalysisQueue.queue.length > 0) {
      setTimeout(() => contentAnalysisQueue.processNext(), 100);
    }
  }
};

// 🔑 Helper Functions (to be implemented)

/**
 * Show file access permission dialog
 */
const showFileAccessDialog = async (fileElement, purpose) => {
  // Implementation will show modal dialog
  // For now, return true for development
  return new Promise((resolve) => {
    const dialog = document.createElement('div');
    dialog.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                  background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 10000;">
        <h3>🔑 File Access Request</h3>
        <p>Allow AI to access <strong>${fileElement.file.name}</strong> for ${purpose}?</p>
        <p style="font-size: 0.9em; color: #666;">This file will be analyzed to provide intelligent assistance.</p>
        <div style="display: flex; gap: 10px; margin-top: 15px;">
          <button id="grant-access" style="padding: 8px 16px; background: #0066cc; color: white; border: none; border-radius: 4px;">Allow</button>
          <button id="deny-access" style="padding: 8px 16px; background: #ccc; border: none; border-radius: 4px;">Deny</button>
        </div>
      </div>
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;"></div>
    `;
    
    document.body.appendChild(dialog);
    
    dialog.querySelector('#grant-access').onclick = () => {
      document.body.removeChild(dialog);
      resolve(true);
    };
    
    dialog.querySelector('#deny-access').onclick = () => {
      document.body.removeChild(dialog);
      resolve(false);
    };
  });
};

/**
 * Get analysis priority based on file type
 */
const getPriority = (mimeType) => {
  const category = getContentCategory(mimeType);
  
  switch (category) {
    case 'text': return 1; // Highest priority
    case 'image': return 2;
    case 'document': return 3;
    case 'audio': return 4;
    case 'video': return 5; // Lowest priority (processing intensive)
    default: return 3;
  }
};

/**
 * Analyze file content (placeholder implementation)
 */
const analyzeFile = async (fileElement, analysisType) => {
  const category = getContentCategory(fileElement.file.mimeType);
  
  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const result = {
    analysisType: category,
    extractedText: null,
    entities: [],
    summary: null,
    tags: [],
    categories: [category]
  };
  
  // Category-specific analysis
  switch (category) {
    case 'text':
      result.extractedText = 'Sample extracted text...';
      result.summary = 'This is a text document about...';
      result.tags = ['document', 'text'];
      break;
      
    case 'image':
      result.entities = ['object1', 'object2'];
      result.summary = 'Image contains...';
      result.tags = ['visual', 'image'];
      break;
      
    case 'document':
      result.extractedText = 'Sample PDF content...';
      result.summary = 'Document summary...';
      result.tags = ['document', 'pdf'];
      break;
      
    default:
      result.summary = `${category} file: ${fileElement.file.name}`;
      result.tags = [category];
  }
  
  return result;
};

// 🔑 Export file utilities
export const fileUtils = {
  createFileElement,
  fileAccessManager,
  contentAnalysisQueue,
  getFileExtension,
  getContentCategory,
  getPreferredRenderer,
  canGeneratePreview,
  needsServerProcessing
};