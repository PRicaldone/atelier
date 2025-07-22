/**
 * 🔑 UNIVERSAL CONTENT AWARENESS (UCA) - PRO Trinity Amplifier
 * 
 * 🚨 POLICY: All code, data models, UX/UI flows and architecture
 * MUST comply with the single specification at /docs/BIFLOW-COMPLETE-TYPES.md (current version: v2.0.1).
 * In case of any doubt or discrepancy between code, comments, chat, or other docs,
 * the latest version of this document ALWAYS TAKES PRECEDENCE.
 * No structural changes may be made without reviewing and updating the spec.
 * 
 * This module implements Universal Content Awareness:
 * - Auto-recognition of any dropped/pasted content
 * - Smart preview generation for all content types
 * - Extensible renderer system
 * - Works across all Mind Garden (FMG/PMG/BMG) and Scriptorium (FS/PS) spaces
 */

import { 
  CONTENT_TYPES, 
  getContentCategory, 
  getPreferredRenderer,
  createFileElement 
} from '../../scriptorium/file-types.js';

// 🔑 UCA Configuration
export const UCA_CONFIG = {
  // Content recognition
  enableAutoRecognition: true,
  enablePreviewGeneration: true,
  enableMetadataExtraction: true,
  
  // Preview settings
  thumbnailSize: { width: 200, height: 150 },
  maxPreviewSize: 5 * 1024 * 1024, // 5MB
  previewQuality: 0.8,
  
  // Performance
  enableLazyLoading: true,
  enableCaching: true,
  maxCacheSize: 100 * 1024 * 1024, // 100MB
  
  // Extensibility
  enablePlugins: true,
  enableCustomRenderers: true
};

// 🔑 Content Recognizer System
export class UniversalContentRecognizer {
  constructor(config = {}) {
    this.config = { ...UCA_CONFIG, ...config };
    this.renderers = new Map();
    this.processors = new Map();
    this.cache = new Map();
    
    // Initialize default renderers
    this.initializeDefaultRenderers();
    
    // Initialize event listeners
    this.initializeEventListeners();
  }
  
  /**
   * Initialize default content renderers
   */
  initializeDefaultRenderers() {
    // Image renderer
    this.registerRenderer('ImageRenderer', {
      supportedTypes: [CONTENT_TYPES.IMAGE, CONTENT_TYPES.IMAGE_JPEG, CONTENT_TYPES.IMAGE_PNG, 
                       CONTENT_TYPES.IMAGE_GIF, CONTENT_TYPES.IMAGE_WEBP, CONTENT_TYPES.IMAGE_SVG],
      render: this.renderImage.bind(this),
      generatePreview: this.generateImagePreview.bind(this)
    });
    
    // Video renderer
    this.registerRenderer('VideoRenderer', {
      supportedTypes: [CONTENT_TYPES.VIDEO, CONTENT_TYPES.VIDEO_MP4, CONTENT_TYPES.VIDEO_WEBM, 
                       CONTENT_TYPES.VIDEO_MOV, CONTENT_TYPES.VIDEO_AVI],
      render: this.renderVideo.bind(this),
      generatePreview: this.generateVideoPreview.bind(this)
    });
    
    // Audio renderer
    this.registerRenderer('AudioRenderer', {
      supportedTypes: [CONTENT_TYPES.AUDIO, CONTENT_TYPES.AUDIO_MP3, CONTENT_TYPES.AUDIO_WAV, 
                       CONTENT_TYPES.AUDIO_OGG, CONTENT_TYPES.AUDIO_M4A],
      render: this.renderAudio.bind(this),
      generatePreview: this.generateAudioPreview.bind(this)
    });
    
    // Document renderer
    this.registerRenderer('DocumentRenderer', {
      supportedTypes: [CONTENT_TYPES.PDF, CONTENT_TYPES.DOC, CONTENT_TYPES.DOCX, 
                       CONTENT_TYPES.XLS, CONTENT_TYPES.XLSX, CONTENT_TYPES.PPT, CONTENT_TYPES.PPTX],
      render: this.renderDocument.bind(this),
      generatePreview: this.generateDocumentPreview.bind(this)
    });
    
    // Text renderer
    this.registerRenderer('TextRenderer', {
      supportedTypes: [CONTENT_TYPES.TEXT, CONTENT_TYPES.HTML, CONTENT_TYPES.CSS, 
                       CONTENT_TYPES.JAVASCRIPT, CONTENT_TYPES.JSON, CONTENT_TYPES.XML],
      render: this.renderText.bind(this),
      generatePreview: this.generateTextPreview.bind(this)
    });
    
    // Link renderer
    this.registerRenderer('LinkRenderer', {
      supportedTypes: [CONTENT_TYPES.URL, CONTENT_TYPES.LINK],
      render: this.renderLink.bind(this),
      generatePreview: this.generateLinkPreview.bind(this)
    });
    
    // Archive renderer
    this.registerRenderer('ArchiveRenderer', {
      supportedTypes: [CONTENT_TYPES.ZIP, CONTENT_TYPES.RAR, CONTENT_TYPES.TAR, CONTENT_TYPES.GZIP],
      render: this.renderArchive.bind(this),
      generatePreview: this.generateArchivePreview.bind(this)
    });
    
    // Generic fallback renderer
    this.registerRenderer('GenericRenderer', {
      supportedTypes: ['*'], // Catches all
      render: this.renderGeneric.bind(this),
      generatePreview: this.generateGenericPreview.bind(this)
    });
  }
  
  /**
   * Initialize global event listeners for content drops
   */
  initializeEventListeners() {
    // File drop events
    document.addEventListener('dragover', this.handleDragOver.bind(this));
    document.addEventListener('drop', this.handleDrop.bind(this));
    
    // Paste events
    document.addEventListener('paste', this.handlePaste.bind(this));
    
    // Input file change events
    document.addEventListener('change', this.handleFileInput.bind(this));
  }
  
  /**
   * Handle drag over events
   */
  handleDragOver(event) {
    const target = this.findContentTarget(event.target);
    if (!target) return;
    
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    
    // Visual feedback
    target.classList.add('uca-drag-over');
  }
  
  /**
   * Handle drop events
   */
  async handleDrop(event) {
    const target = this.findContentTarget(event.target);
    if (!target) return;
    
    event.preventDefault();
    target.classList.remove('uca-drag-over');
    
    try {
      const items = this.extractDroppedItems(event);
      const recognizedContent = await this.recognizeContent(items);
      
      // Process each recognized content item
      for (const content of recognizedContent) {
        await this.processContent(content, target);
      }
      
    } catch (error) {
      console.error('Failed to process dropped content:', error);
      this.showError('Failed to process dropped content');
    }
  }
  
  /**
   * Handle paste events
   */
  async handlePaste(event) {
    const target = this.findContentTarget(event.target);
    if (!target) return;
    
    try {
      const items = this.extractPastedItems(event);
      if (items.length === 0) return;
      
      event.preventDefault();
      
      const recognizedContent = await this.recognizeContent(items);
      
      // Process each recognized content item
      for (const content of recognizedContent) {
        await this.processContent(content, target);
      }
      
    } catch (error) {
      console.error('Failed to process pasted content:', error);
      this.showError('Failed to process pasted content');
    }
  }
  
  /**
   * Handle file input changes
   */
  async handleFileInput(event) {
    if (event.target.type !== 'file') return;
    
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    try {
      const recognizedContent = await this.recognizeContent(files);
      
      // Find appropriate target (or use default)
      const target = this.findContentTarget(event.target) || document.body;
      
      // Process each file
      for (const content of recognizedContent) {
        await this.processContent(content, target);
      }
      
    } catch (error) {
      console.error('Failed to process selected files:', error);
      this.showError('Failed to process selected files');
    }
  }
  
  /**
   * Find content-aware target element
   */
  findContentTarget(element) {
    let current = element;
    
    while (current && current !== document.body) {
      if (current.dataset?.contentAware || 
          current.classList?.contains('content-aware') ||
          current.classList?.contains('mind-garden') ||
          current.classList?.contains('scriptorium') ||
          current.classList?.contains('canvas')) {
        return current;
      }
      current = current.parentElement;
    }
    
    return null;
  }
  
  /**
   * Extract items from drop event
   */
  extractDroppedItems(event) {
    const items = [];
    
    // Handle files
    if (event.dataTransfer.files.length > 0) {
      items.push(...Array.from(event.dataTransfer.files));
    }
    
    // Handle URLs/text
    if (event.dataTransfer.items) {
      for (const item of event.dataTransfer.items) {
        if (item.type === 'text/uri-list') {
          item.getAsString(url => {
            items.push({ type: 'url', data: url });
          });
        } else if (item.type === 'text/plain') {
          item.getAsString(text => {
            // Check if it's a URL
            if (this.isValidURL(text)) {
              items.push({ type: 'url', data: text });
            } else {
              items.push({ type: 'text', data: text });
            }
          });
        }
      }
    }
    
    return items;
  }
  
  /**
   * Extract items from paste event
   */
  extractPastedItems(event) {
    const items = [];
    
    // Handle clipboard files
    if (event.clipboardData.files.length > 0) {
      items.push(...Array.from(event.clipboardData.files));
    }
    
    // Handle clipboard text/URLs
    if (event.clipboardData.items) {
      for (const item of event.clipboardData.items) {
        if (item.type === 'text/plain') {
          item.getAsString(text => {
            if (this.isValidURL(text)) {
              items.push({ type: 'url', data: text });
            } else {
              items.push({ type: 'text', data: text });
            }
          });
        } else if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) items.push(file);
        }
      }
    }
    
    return items;
  }
  
  /**
   * Recognize content type and prepare for processing
   */
  async recognizeContent(items) {
    const recognizedContent = [];
    
    for (const item of items) {
      try {
        let contentType, data, metadata = {};
        
        if (item instanceof File) {
          // File object
          contentType = item.type || this.detectTypeFromName(item.name);
          data = item;
          metadata = {
            name: item.name,
            size: item.size,
            lastModified: item.lastModified
          };
        } else if (item.type === 'url') {
          // URL
          contentType = CONTENT_TYPES.URL;
          data = item.data;
          metadata = await this.extractURLMetadata(item.data);
        } else if (item.type === 'text') {
          // Text
          contentType = CONTENT_TYPES.TEXT;
          data = item.data;
          metadata = { length: item.data.length };
        } else {
          // Unknown type
          contentType = CONTENT_TYPES.UNKNOWN;
          data = item;
        }
        
        const recognizedItem = {
          contentType,
          category: getContentCategory(contentType),
          data,
          metadata,
          renderer: getPreferredRenderer(contentType),
          id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        
        recognizedContent.push(recognizedItem);
        
      } catch (error) {
        console.error('Failed to recognize content item:', error);
      }
    }
    
    return recognizedContent;
  }
  
  /**
   * Process recognized content and create elements
   */
  async processContent(content, targetElement) {
    try {
      // Show processing indicator
      this.showProcessingIndicator(targetElement, content);
      
      // Generate preview if possible
      if (this.config.enablePreviewGeneration) {
        content.preview = await this.generatePreview(content);
      }
      
      // Extract metadata if enabled
      if (this.config.enableMetadataExtraction) {
        content.metadata = { ...content.metadata, ...(await this.extractMetadata(content)) };
      }
      
      // Create file element
      const fileElement = this.createContentElement(content);
      
      // Add to workspace
      this.addElementToWorkspace(fileElement, targetElement);
      
      // Hide processing indicator
      this.hideProcessingIndicator(targetElement);
      
      // Show success feedback
      this.showSuccessFeedback(targetElement, content);
      
    } catch (error) {
      console.error('Failed to process content:', error);
      this.hideProcessingIndicator(targetElement);
      this.showError(`Failed to process ${content.metadata.name || 'content'}`);
    }
  }
  
  /**
   * Generate preview for content
   */
  async generatePreview(content) {
    const renderer = this.renderers.get(content.renderer);
    if (!renderer || !renderer.generatePreview) {
      return null;
    }
    
    try {
      return await renderer.generatePreview(content);
    } catch (error) {
      console.error('Failed to generate preview:', error);
      return null;
    }
  }
  
  /**
   * Extract metadata from content
   */
  async extractMetadata(content) {
    const metadata = {};
    
    if (content.data instanceof File) {
      // File metadata
      if (content.category === 'image') {
        metadata.dimensions = await this.getImageDimensions(content.data);
      } else if (content.category === 'video') {
        metadata.duration = await this.getVideoDuration(content.data);
      } else if (content.category === 'audio') {
        metadata.duration = await this.getAudioDuration(content.data);
      }
    } else if (content.contentType === CONTENT_TYPES.URL) {
      // URL metadata
      metadata.urlInfo = await this.extractURLMetadata(content.data);
    }
    
    return metadata;
  }
  
  /**
   * Create content element from recognized content
   */
  createContentElement(content) {
    const elementData = {
      name: content.metadata.name || content.metadata.title || 'Untitled',
      mimeType: content.contentType,
      size: content.metadata.size || 0
    };
    
    const element = createFileElement(
      content.data instanceof File ? content.data : elementData,
      content.contentType === CONTENT_TYPES.URL ? 'url' : 'local',
      {
        preview: content.preview,
        metadata: content.metadata,
        renderer: content.renderer
      }
    );
    
    return element;
  }
  
  /**
   * Add element to workspace
   */
  addElementToWorkspace(element, targetElement) {
    // This would integrate with the actual workspace store
    // For now, create visual representation
    this.createVisualElement(element, targetElement);
  }
  
  /**
   * Create visual representation of element
   */
  createVisualElement(element, targetElement) {
    const visualElement = document.createElement('div');
    visualElement.className = 'uca-element';
    visualElement.dataset.elementId = element.id;
    
    const renderer = this.renderers.get(element.preview.renderer);
    if (renderer) {
      visualElement.innerHTML = renderer.render(element);
    } else {
      visualElement.innerHTML = this.renderGeneric(element);
    }
    
    // Position element
    const rect = targetElement.getBoundingClientRect();
    visualElement.style.position = 'absolute';
    visualElement.style.left = `${Math.random() * (rect.width - 200)}px`;
    visualElement.style.top = `${Math.random() * (rect.height - 150)}px`;
    visualElement.style.zIndex = '1000';
    
    targetElement.appendChild(visualElement);
  }
  
  // 🔑 Default Renderers
  
  /**
   * Render image content
   */
  renderImage(element) {
    const preview = element.preview.thumbnail || '';
    return `
      <div class="uca-image-element" style="width: 200px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <img src="${preview}" alt="${element.file.name}" style="width: 100%; height: 120px; object-fit: cover;">
        <div style="padding: 10px; background: white;">
          <div style="font-weight: 600; font-size: 0.9em; margin-bottom: 4px;">${element.file.name}</div>
          <div style="font-size: 0.8em; color: #666;">${this.formatFileSize(element.file.size)}</div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render video content
   */
  renderVideo(element) {
    const preview = element.preview.thumbnail || '';
    const duration = element.metadata.duration ? this.formatDuration(element.metadata.duration) : '';
    
    return `
      <div class="uca-video-element" style="width: 200px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="position: relative;">
          <img src="${preview}" alt="${element.file.name}" style="width: 100%; height: 120px; object-fit: cover;">
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                      width: 40px; height: 40px; background: rgba(0,0,0,0.7); border-radius: 50%; 
                      display: flex; align-items: center; justify-content: center; color: white;">▶</div>
          ${duration ? `<div style="position: absolute; bottom: 5px; right: 5px; background: rgba(0,0,0,0.7); 
                                    color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8em;">${duration}</div>` : ''}
        </div>
        <div style="padding: 10px; background: white;">
          <div style="font-weight: 600; font-size: 0.9em; margin-bottom: 4px;">${element.file.name}</div>
          <div style="font-size: 0.8em; color: #666;">${this.formatFileSize(element.file.size)}</div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render audio content
   */
  renderAudio(element) {
    const duration = element.metadata.duration ? this.formatDuration(element.metadata.duration) : '';
    
    return `
      <div class="uca-audio-element" style="width: 200px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    display: flex; align-items: center; justify-content: center; color: white;">
          <div style="text-align: center;">
            <div style="font-size: 2em;">🎵</div>
            ${duration ? `<div style="font-size: 0.9em; margin-top: 5px;">${duration}</div>` : ''}
          </div>
        </div>
        <div style="padding: 10px; background: white;">
          <div style="font-weight: 600; font-size: 0.9em; margin-bottom: 4px;">${element.file.name}</div>
          <div style="font-size: 0.8em; color: #666;">${this.formatFileSize(element.file.size)}</div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render document content
   */
  renderDocument(element) {
    const icon = this.getDocumentIcon(element.file.mimeType);
    
    return `
      <div class="uca-document-element" style="width: 200px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="height: 80px; background: #f8f9fa; display: flex; align-items: center; justify-content: center;">
          <div style="font-size: 3em;">${icon}</div>
        </div>
        <div style="padding: 10px; background: white;">
          <div style="font-weight: 600; font-size: 0.9em; margin-bottom: 4px;">${element.file.name}</div>
          <div style="font-size: 0.8em; color: #666;">${this.formatFileSize(element.file.size)}</div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render text content
   */
  renderText(element) {
    const snippet = element.preview.snippet || '';
    
    return `
      <div class="uca-text-element" style="width: 200px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="padding: 15px; background: white; height: 120px; overflow: hidden;">
          <div style="font-size: 0.8em; line-height: 1.4; color: #333;">${snippet}</div>
        </div>
        <div style="padding: 10px; background: #f8f9fa; border-top: 1px solid #eee;">
          <div style="font-weight: 600; font-size: 0.9em; margin-bottom: 4px;">${element.file.name}</div>
          <div style="font-size: 0.8em; color: #666;">Text Document</div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render link content
   */
  renderLink(element) {
    const metadata = element.metadata.urlInfo || {};
    
    return `
      <div class="uca-link-element" style="width: 200px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="padding: 15px; background: white;">
          ${metadata.favicon ? `<img src="${metadata.favicon}" style="width: 20px; height: 20px; margin-bottom: 10px;">` : '🌐'}
          <div style="font-weight: 600; font-size: 0.9em; margin-bottom: 8px;">${metadata.title || 'Link'}</div>
          <div style="font-size: 0.8em; color: #666; line-height: 1.3;">${metadata.description || element.data}</div>
        </div>
        <div style="padding: 10px; background: #f8f9fa; border-top: 1px solid #eee;">
          <div style="font-size: 0.8em; color: #666;">${metadata.domain || 'Web Link'}</div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render archive content
   */
  renderArchive(element) {
    return `
      <div class="uca-archive-element" style="width: 200px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="height: 80px; background: #fff3cd; display: flex; align-items: center; justify-content: center;">
          <div style="font-size: 3em;">📦</div>
        </div>
        <div style="padding: 10px; background: white;">
          <div style="font-weight: 600; font-size: 0.9em; margin-bottom: 4px;">${element.file.name}</div>
          <div style="font-size: 0.8em; color: #666;">${this.formatFileSize(element.file.size)} Archive</div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render generic content
   */
  renderGeneric(element) {
    return `
      <div class="uca-generic-element" style="width: 200px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="height: 80px; background: #e9ecef; display: flex; align-items: center; justify-content: center;">
          <div style="font-size: 3em;">📄</div>
        </div>
        <div style="padding: 10px; background: white;">
          <div style="font-weight: 600; font-size: 0.9em; margin-bottom: 4px;">${element.file.name}</div>
          <div style="font-size: 0.8em; color: #666;">${this.formatFileSize(element.file.size)}</div>
        </div>
      </div>
    `;
  }
  
  // 🔑 Preview Generators (placeholder implementations)
  
  generateImagePreview(content) {
    return new Promise((resolve) => {
      if (content.data instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ thumbnail: e.target.result });
        reader.readAsDataURL(content.data);
      } else {
        resolve({ thumbnail: '' });
      }
    });
  }
  
  generateVideoPreview(content) {
    return new Promise((resolve) => {
      // Placeholder: would generate video thumbnail
      resolve({ thumbnail: '', duration: null });
    });
  }
  
  generateAudioPreview(content) {
    return new Promise((resolve) => {
      // Placeholder: would generate waveform
      resolve({ waveform: '', duration: null });
    });
  }
  
  generateDocumentPreview(content) {
    return new Promise((resolve) => {
      // Placeholder: would generate document preview
      resolve({ snippet: 'Document preview...', pageCount: null });
    });
  }
  
  generateTextPreview(content) {
    return new Promise((resolve) => {
      if (typeof content.data === 'string') {
        const snippet = content.data.substring(0, 200) + (content.data.length > 200 ? '...' : '');
        resolve({ snippet });
      } else {
        resolve({ snippet: '' });
      }
    });
  }
  
  generateLinkPreview(content) {
    return new Promise(async (resolve) => {
      try {
        const metadata = await this.extractURLMetadata(content.data);
        resolve({ linkPreview: metadata });
      } catch (error) {
        resolve({ linkPreview: null });
      }
    });
  }
  
  generateArchivePreview(content) {
    return new Promise((resolve) => {
      // Placeholder: would show archive contents
      resolve({ contents: [] });
    });
  }
  
  generateGenericPreview(content) {
    return new Promise((resolve) => {
      resolve({ icon: '📄' });
    });
  }
  
  // 🔑 Utility Methods
  
  registerRenderer(name, renderer) {
    this.renderers.set(name, renderer);
  }
  
  isValidURL(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
  
  detectTypeFromName(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const typeMap = {
      jpg: CONTENT_TYPES.IMAGE_JPEG,
      jpeg: CONTENT_TYPES.IMAGE_JPEG,
      png: CONTENT_TYPES.IMAGE_PNG,
      gif: CONTENT_TYPES.IMAGE_GIF,
      webp: CONTENT_TYPES.IMAGE_WEBP,
      svg: CONTENT_TYPES.IMAGE_SVG,
      mp4: CONTENT_TYPES.VIDEO_MP4,
      webm: CONTENT_TYPES.VIDEO_WEBM,
      mov: CONTENT_TYPES.VIDEO_MOV,
      mp3: CONTENT_TYPES.AUDIO_MP3,
      wav: CONTENT_TYPES.AUDIO_WAV,
      pdf: CONTENT_TYPES.PDF,
      doc: CONTENT_TYPES.DOC,
      docx: CONTENT_TYPES.DOCX,
      txt: CONTENT_TYPES.TEXT,
      json: CONTENT_TYPES.JSON,
      zip: CONTENT_TYPES.ZIP
    };
    return typeMap[ext] || CONTENT_TYPES.UNKNOWN;
  }
  
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
  
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  getDocumentIcon(mimeType) {
    if (mimeType === CONTENT_TYPES.PDF) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel')) return '📊';
    if (mimeType.includes('powerpoint')) return '📽️';
    return '📄';
  }
  
  async extractURLMetadata(url) {
    // Placeholder: would fetch URL metadata
    return {
      title: 'Web Page',
      description: 'Description from web page',
      domain: new URL(url).hostname,
      favicon: ''
    };
  }
  
  async getImageDimensions(file) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = URL.createObjectURL(file);
    });
  }
  
  async getVideoDuration(file) {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => resolve(video.duration);
      video.onerror = () => resolve(0);
      video.src = URL.createObjectURL(file);
    });
  }
  
  async getAudioDuration(file) {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => resolve(audio.duration);
      audio.onerror = () => resolve(0);
      audio.src = URL.createObjectURL(file);
    });
  }
  
  showProcessingIndicator(target, content) {
    const indicator = document.createElement('div');
    indicator.className = 'uca-processing-indicator';
    indicator.innerHTML = `
      <div style="position: absolute; top: 10px; right: 10px; z-index: 1001;
                  background: rgba(0, 150, 255, 0.9); color: white; padding: 8px 12px;
                  border-radius: 6px; font-size: 0.8em; display: flex; align-items: center; gap: 8px;">
        <div style="width: 16px; height: 16px; border: 2px solid white; border-top: 2px solid transparent; 
                    border-radius: 50%; animation: spin 1s linear infinite;"></div>
        Processing ${content.metadata.name || 'content'}...
      </div>
    `;
    target.appendChild(indicator);
  }
  
  hideProcessingIndicator(target) {
    const indicator = target.querySelector('.uca-processing-indicator');
    if (indicator) indicator.remove();
  }
  
  showSuccessFeedback(target, content) {
    const feedback = document.createElement('div');
    feedback.innerHTML = `
      <div style="position: absolute; top: 10px; right: 10px; z-index: 1001;
                  background: rgba(76, 175, 80, 0.9); color: white; padding: 8px 12px;
                  border-radius: 6px; font-size: 0.8em;">
        ✅ Added ${content.metadata.name || 'content'}
      </div>
    `;
    target.appendChild(feedback);
    
    setTimeout(() => feedback.remove(), 3000);
  }
  
  showError(message) {
    const error = document.createElement('div');
    error.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; z-index: 10001;
                  background: #f44336; color: white; padding: 15px 20px;
                  border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
        ⚠️ ${message}
      </div>
    `;
    
    document.body.appendChild(error);
    
    setTimeout(() => {
      if (error.parentNode) {
        error.parentNode.removeChild(error);
      }
    }, 5000);
  }
}

// 🔑 Global UCA Instance
export const globalUCA = new UniversalContentRecognizer();

// 🔑 Public API
export const ucaAPI = {
  /**
   * Initialize UCA on specific elements
   */
  initialize: (elements) => {
    elements.forEach(element => {
      element.dataset.contentAware = 'true';
    });
  },
  
  /**
   * Register custom renderer
   */
  registerRenderer: (name, renderer) => globalUCA.registerRenderer(name, renderer),
  
  /**
   * Process content manually
   */
  processContent: (content, target) => globalUCA.processContent(content, target),
  
  /**
   * Configure UCA
   */
  configure: (options) => {
    Object.assign(globalUCA.config, options);
  }
};

// Auto-initialize when module is loaded
console.log('🔑 Universal Content Awareness (UCA) initialized');