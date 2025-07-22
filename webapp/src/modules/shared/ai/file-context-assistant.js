/**
 * 🔑 AI ASSISTANT con FILE CONTEXT AWARENESS
 * 
 * 🚨 POLICY: All code, data models, UX/UI flows and architecture
 * MUST comply with the single specification at /docs/BIFLOW-COMPLETE-TYPES.md (current version: v2.0.1).
 * In case of any doubt or discrepancy between code, comments, chat, or other docs,
 * the latest version of this document ALWAYS TAKES PRECEDENCE.
 * No structural changes may be made without reviewing and updating the spec.
 * 
 * This module implements the AI Assistant core feature:
 * - Long-click activation from any Mind Garden (FMG/PMG/BMG) or Scriptorium (FS/PS)
 * - Full file context awareness (all connected/visible files)
 * - Privacy-first: no file access without explicit user consent
 * - Mix of local/cloud files + web/LLM data for maximum assistance
 */

import { fileAccessManager, contentAnalysisQueue } from '../../scriptorium/file-types.js';
import { ucaIntegration } from './UCAIntegrationAdapter.js';

// 🔑 AI Assistant Core Configuration
export const AI_ASSISTANT_CONFIG = {
  // Activation
  activationMethod: 'long-press',      // 'long-press', 'right-click', 'gesture'
  activationDuration: 800,             // ms for long-press
  
  // Context gathering
  maxContextElements: 50,              // Max elements to include in context
  maxFileSize: 50 * 1024 * 1024,      // 50MB max file size for analysis
  maxContextLength: 32000,             // Max tokens for context
  
  // File analysis
  autoAnalyzeOnDrop: true,             // Auto-analyze files when dropped
  batchAnalysis: true,                 // Process multiple files in batch
  
  // Privacy and permissions
  requireExplicitConsent: true,        // Always ask before file access
  rememberConsent: false,              // Don't remember consent between sessions
  showPrivacyInfo: true,               // Show privacy info in dialogs
  
  // Performance
  enableCaching: true,                 // Cache analysis results
  backgroundProcessing: true,          // Process files in background
  progressUpdates: true                // Show progress during processing
};

// 🔑 AI Assistant Class
export class FileContextAssistant {
  constructor(options = {}) {
    this.config = { ...AI_ASSISTANT_CONFIG, ...options };
    this.isActive = false;
    this.currentContext = null;
    this.activeElement = null;
    this.analysisCache = new Map();
    
    // Bind methods
    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.handleLongPress = this.handleLongPress.bind(this);
    
    // Initialize event listeners
    this.initializeEventListeners();
  }
  
  /**
   * Initialize global event listeners for activation
   */
  initializeEventListeners() {
    // Long-press detection for activation
    let longPressTimer = null;
    let pressStartTime = 0;
    
    document.addEventListener('mousedown', (e) => {
      pressStartTime = Date.now();
      longPressTimer = setTimeout(() => {
        this.handleLongPress(e);
      }, this.config.activationDuration);
    });
    
    document.addEventListener('mouseup', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });
    
    document.addEventListener('mousemove', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });
    
    // Touch events for mobile
    document.addEventListener('touchstart', (e) => {
      pressStartTime = Date.now();
      longPressTimer = setTimeout(() => {
        this.handleLongPress(e);
      }, this.config.activationDuration);
    });
    
    document.addEventListener('touchend', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });
    
    document.addEventListener('touchmove', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });
  }
  
  /**
   * Handle long-press activation
   */
  async handleLongPress(event) {
    const target = this.findActivatableTarget(event.target);
    if (!target) return;
    
    // Prevent default browser behavior
    event.preventDefault();
    event.stopPropagation();
    
    // Visual feedback
    this.showActivationFeedback(target);
    
    // Gather context and activate
    await this.activate(target, { x: event.clientX, y: event.clientY });
  }
  
  /**
   * Find the closest activatable target (canvas, mind garden, etc.)
   */
  findActivatableTarget(element) {
    // Look for parent elements that are AI-activatable
    let current = element;
    
    while (current && current !== document.body) {
      // Check for data attributes or classes that indicate AI-activatable areas
      if (current.dataset?.aiActivatable || 
          current.classList?.contains('mind-garden') ||
          current.classList?.contains('scriptorium') ||
          current.classList?.contains('canvas') ||
          current.closest('[data-ai-activatable="true"]')) {
        return current;
      }
      current = current.parentElement;
    }
    
    return null;
  }
  
  /**
   * Show visual feedback for activation
   */
  showActivationFeedback(target) {
    // Add visual indication that AI is being activated
    target.style.transition = 'box-shadow 0.3s ease';
    target.style.boxShadow = '0 0 20px rgba(0, 150, 255, 0.6)';
    
    setTimeout(() => {
      target.style.boxShadow = '';
    }, 2000);
  }
  
  /**
   * Activate AI Assistant with context gathering
   */
  async activate(targetElement, position = { x: 0, y: 0 }) {
    if (this.isActive) {
      this.deactivate();
    }
    
    this.isActive = true;
    this.activeElement = targetElement;
    
    try {
      // Show loading indicator
      this.showLoadingIndicator(position);
      
      // Gather context from current workspace
      this.currentContext = await this.gatherWorkspaceContext(targetElement);
      
      // Show AI assistant interface
      await this.showAssistantInterface(position);
      
    } catch (error) {
      console.error('Failed to activate AI Assistant:', error);
      this.showError('Failed to activate AI Assistant. Please try again.');
      this.deactivate();
    }
  }
  
  /**
   * Gather complete workspace context including files
   * Now enhanced with UCA integration for better content awareness
   */
  async gatherWorkspaceContext(targetElement) {
    const context = {
      // Workspace info
      workspaceType: this.detectWorkspaceType(targetElement),
      workspaceId: this.getWorkspaceId(targetElement),
      
      // Elements in workspace
      elements: [],
      files: [],
      
      // UCA-enhanced content
      ucaContent: [],
      
      // User's current selection/focus
      selectedElements: [],
      focusedElement: null,
      
      // Metadata
      timestamp: Date.now(),
      userPermissions: {},
      ucaVersion: '2.0.1'
    };
    
    // Get all UCA-aware content from workspace
    const ucaContent = await ucaIntegration.getAllWorkspaceContent();
    
    // Filter by current workspace/module
    const workspaceUcaContent = ucaContent.filter(item => {
      if (context.workspaceType === 'mind-garden') {
        return item.source === 'mind-garden';
      } else if (context.workspaceType === 'scriptorium') {
        return item.source === 'scriptorium';
      }
      return true; // Include all if workspace type unclear
    });
    
    // Process UCA content
    for (const ucaItem of workspaceUcaContent) {
      // Check permissions for file-based content
      if (ucaItem.contentType === 'file' || ucaItem.originalElement.filePath) {
        const hasPermission = await ucaIntegration.checkAIPermission(ucaItem.id, 'read');
        if (!hasPermission) {
          continue; // Skip if no permission
        }
      }
      
      // Add to context with full UCA data
      context.ucaContent.push({
        id: ucaItem.id,
        type: ucaItem.contentType,
        metadata: ucaItem.metadata,
        preview: ucaItem.preview,
        aiContext: ucaItem.aiContext,
        source: ucaItem.source
      });
      
      // Legacy support - separate files and elements
      if (ucaItem.contentType === 'file') {
        context.files.push(await this.gatherFileContext(ucaItem.originalElement));
      } else {
        context.elements.push(this.sanitizeElementForContext(ucaItem.originalElement));
      }
    }
    
    // Get selection state
    const allElements = this.getAllWorkspaceElements(targetElement);
    context.selectedElements = this.getSelectedElements(allElements);
    context.focusedElement = this.getFocusedElement();
    
    // Add UCA summary for AI
    context.ucaSummary = {
      totalContent: context.ucaContent.length,
      contentTypes: [...new Set(context.ucaContent.map(c => c.type))],
      hasFiles: context.ucaContent.some(c => c.type === 'file'),
      hasImages: context.ucaContent.some(c => c.type === 'image'),
      hasCode: context.ucaContent.some(c => c.type === 'code')
    };
    
    return context;
  }
  
  /**
   * Gather context from a file element (with permission checks)
   */
  async gatherFileContext(fileElement) {
    // Check if we already have permission
    if (!fileAccessManager.canAccess(fileElement)) {
      // Request permission
      const granted = await fileAccessManager.requestAccess(fileElement, 'AI assistance');
      if (!granted) {
        return null; // User denied access
      }
    }
    
    // Check cache first
    const cacheKey = `${fileElement.id}_${fileElement.file.lastModified}`;
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey);
    }
    
    const fileContext = {
      id: fileElement.id,
      name: fileElement.file.name,
      type: fileElement.file.mimeType,
      category: fileElement.file.category || 'unknown',
      size: fileElement.file.size,
      
      // Available analysis data
      extractedText: fileElement.aiContext?.extractedText || null,
      summary: fileElement.aiContext?.summary || null,
      entities: fileElement.aiContext?.entities || [],
      tags: fileElement.aiContext?.tags || [],
      
      // Analysis status
      analyzed: fileElement.aiContext?.analyzed || false,
      needsAnalysis: !fileElement.aiContext?.analyzed,
      
      // Metadata
      lastModified: fileElement.file.lastModified,
      source: fileElement.file.source
    };
    
    // If not analyzed yet, queue for analysis
    if (!fileContext.analyzed && this.config.autoAnalyzeOnDrop) {
      contentAnalysisQueue.enqueue(fileElement, 'context');
      fileContext.isBeingAnalyzed = true;
    }
    
    // Cache the result
    this.analysisCache.set(cacheKey, fileContext);
    
    return fileContext;
  }
  
  /**
   * Detect workspace type (Mind Garden vs Scriptorium)
   */
  detectWorkspaceType(element) {
    if (element.closest('.mind-garden') || element.dataset.workspaceType === 'mind-garden') {
      return 'mind-garden';
    }
    if (element.closest('.scriptorium') || element.dataset.workspaceType === 'scriptorium') {
      return 'scriptorium';
    }
    if (element.closest('.canvas') || element.dataset.workspaceType === 'canvas') {
      return 'canvas'; // Legacy
    }
    return 'unknown';
  }
  
  /**
   * Get workspace ID for context
   */
  getWorkspaceId(element) {
    return element.dataset.workspaceId || 
           element.closest('[data-workspace-id]')?.dataset.workspaceId ||
           'current';
  }
  
  /**
   * Get all elements in current workspace
   */
  getAllWorkspaceElements(targetElement) {
    // This would integrate with the actual store
    // For now, return mock data
    return [
      { id: '1', type: 'note', content: 'Sample note content' },
      { id: '2', type: 'file', file: { name: 'document.pdf', mimeType: 'application/pdf' } }
    ];
  }
  
  /**
   * Sanitize element data for AI context
   */
  sanitizeElementForContext(element) {
    return {
      id: element.id,
      type: element.type,
      content: element.content || element.data?.content || '',
      title: element.title || element.data?.title || '',
      tags: element.tags || [],
      position: element.position,
      metadata: {
        createdAt: element.createdAt,
        updatedAt: element.updatedAt,
        biflowOrigin: element.biflow?.origin
      }
    };
  }
  
  /**
   * Get currently selected elements
   */
  getSelectedElements(allElements) {
    return allElements.filter(el => el.selected || el.ui?.isSelected);
  }
  
  /**
   * Get currently focused element
   */
  getFocusedElement() {
    return document.activeElement?.dataset.elementId || null;
  }
  
  /**
   * Show loading indicator
   */
  showLoadingIndicator(position) {
    const loader = document.createElement('div');
    loader.id = 'ai-assistant-loader';
    loader.innerHTML = `
      <div style="position: fixed; top: ${position.y}px; left: ${position.x}px; 
                  transform: translate(-50%, -50%); z-index: 10000;
                  background: rgba(0, 0, 0, 0.8); color: white; padding: 15px 20px;
                  border-radius: 8px; display: flex; align-items: center; gap: 10px;">
        <div style="width: 20px; height: 20px; border: 2px solid #fff; border-top: 2px solid transparent; 
                    border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span>🤖 Gathering context...</span>
      </div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `;
    
    document.body.appendChild(loader);
  }
  
  /**
   * Show AI assistant interface
   */
  async showAssistantInterface(position) {
    // Remove loading indicator
    const loader = document.getElementById('ai-assistant-loader');
    if (loader) loader.remove();
    
    // Create AI assistant UI
    const assistant = document.createElement('div');
    assistant.id = 'ai-assistant-interface';
    assistant.innerHTML = `
      <div style="position: fixed; top: ${position.y}px; left: ${position.x}px; 
                  transform: translate(-50%, -50%); z-index: 10000;
                  background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                  width: 400px; max-height: 600px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; padding: 15px 20px; display: flex; align-items: center; gap: 10px;">
          <div style="font-size: 1.2em;">🤖</div>
          <div>
            <div style="font-weight: 600;">AI Assistant</div>
            <div style="font-size: 0.85em; opacity: 0.9;">File Context Aware</div>
          </div>
          <button id="close-assistant" style="margin-left: auto; background: none; border: none; color: white; font-size: 1.2em; cursor: pointer;">×</button>
        </div>
        
        <!-- Context Summary -->
        <div style="padding: 15px 20px; border-bottom: 1px solid #eee; background: #f8f9fa;">
          <div style="font-size: 0.9em; color: #666; margin-bottom: 8px;">Context:</div>
          <div id="context-summary" style="font-size: 0.85em;">
            📋 ${this.currentContext?.elements?.length || 0} elements, 
            📁 ${this.currentContext?.files?.length || 0} files in ${this.currentContext?.workspaceType || 'workspace'}
          </div>
        </div>
        
        <!-- Chat Interface -->
        <div id="chat-messages" style="padding: 15px 20px; height: 300px; overflow-y: auto; background: white;">
          <div style="color: #666; font-size: 0.9em; text-align: center; margin: 50px 0;">
            🔑 I can see all your files and workspace context.<br>
            Ask me anything about your content!
          </div>
        </div>
        
        <!-- Input -->
        <div style="padding: 15px 20px; border-top: 1px solid #eee; background: #f8f9fa;">
          <div style="display: flex; gap: 10px;">
            <input id="ai-input" type="text" placeholder="Ask about your files, summarize, analyze..." 
                   style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 6px; outline: none;">
            <button id="send-message" style="padding: 10px 15px; background: #667eea; color: white; 
                                           border: none; border-radius: 6px; cursor: pointer;">Send</button>
          </div>
          
          <!-- Quick Actions -->
          <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
            <button class="quick-action" data-action="summarize" style="padding: 5px 10px; background: #e3f2fd; 
                                                                         border: 1px solid #2196f3; border-radius: 4px; 
                                                                         font-size: 0.8em; cursor: pointer;">📄 Summarize All</button>
            <button class="quick-action" data-action="analyze-files" style="padding: 5px 10px; background: #f3e5f5; 
                                                                           border: 1px solid #9c27b0; border-radius: 4px; 
                                                                           font-size: 0.8em; cursor: pointer;">🔍 Analyze Files</button>
            <button class="quick-action" data-action="extract-tasks" style="padding: 5px 10px; background: #e8f5e8; 
                                                                           border: 1px solid #4caf50; border-radius: 4px; 
                                                                           font-size: 0.8em; cursor: pointer;">✅ Extract Tasks</button>
          </div>
        </div>
      </div>
      
      <!-- Backdrop -->
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                  background: rgba(0,0,0,0.2); z-index: 9999;" id="assistant-backdrop"></div>
    `;
    
    document.body.appendChild(assistant);
    
    // Setup event listeners
    this.setupAssistantEventListeners();
    
    // Focus input
    document.getElementById('ai-input').focus();
  }
  
  /**
   * Setup event listeners for assistant interface
   */
  setupAssistantEventListeners() {
    // Close buttons
    document.getElementById('close-assistant').onclick = () => this.deactivate();
    document.getElementById('assistant-backdrop').onclick = () => this.deactivate();
    
    // Send message
    const sendMessage = () => {
      const input = document.getElementById('ai-input');
      const message = input.value.trim();
      if (message) {
        this.handleUserMessage(message);
        input.value = '';
      }
    };
    
    document.getElementById('send-message').onclick = sendMessage;
    document.getElementById('ai-input').onkeypress = (e) => {
      if (e.key === 'Enter') sendMessage();
    };
    
    // Quick actions
    document.querySelectorAll('.quick-action').forEach(button => {
      button.onclick = () => {
        const action = button.dataset.action;
        this.handleQuickAction(action);
      };
    });
  }
  
  /**
   * Handle user message
   */
  async handleUserMessage(message) {
    this.addMessageToChat('user', message);
    this.addMessageToChat('assistant', 'Thinking...', true);
    
    try {
      const response = await this.processUserMessage(message);
      this.updateLastMessage(response);
    } catch (error) {
      this.updateLastMessage('Sorry, I encountered an error. Please try again.');
    }
  }
  
  /**
   * Process user message with context
   */
  async processUserMessage(message) {
    // This would integrate with actual AI service
    // For now, return mock response based on context
    
    const fileCount = this.currentContext?.files?.length || 0;
    const elementCount = this.currentContext?.elements?.length || 0;
    
    if (message.toLowerCase().includes('summarize')) {
      return `I can see ${elementCount} elements and ${fileCount} files in your ${this.currentContext?.workspaceType}. Here's a summary: [This would contain actual analysis of your content]`;
    }
    
    if (message.toLowerCase().includes('files')) {
      const fileNames = this.currentContext?.files?.map(f => f.name).join(', ') || 'none';
      return `Your files: ${fileNames}. I can analyze any of these for you.`;
    }
    
    return `I understand you want to know about: "${message}". With access to your ${fileCount} files and ${elementCount} workspace elements, I can help you with analysis, summarization, and content organization.`;
  }
  
  /**
   * Handle quick actions
   */
  async handleQuickAction(action) {
    switch (action) {
      case 'summarize':
        this.handleUserMessage('Please summarize all my content');
        break;
      case 'analyze-files':
        this.handleUserMessage('Analyze all my files and tell me what you find');
        break;
      case 'extract-tasks':
        this.handleUserMessage('Extract action items and tasks from my content');
        break;
    }
  }
  
  /**
   * Add message to chat
   */
  addMessageToChat(sender, content, isLoading = false) {
    const chatContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    const senderIcon = sender === 'user' ? '👤' : '🤖';
    const alignStyle = sender === 'user' ? 'margin-left: 20px; text-align: right;' : 'margin-right: 20px;';
    const bgColor = sender === 'user' ? '#e3f2fd' : '#f5f5f5';
    
    messageDiv.innerHTML = `
      <div style="${alignStyle} margin-bottom: 15px;">
        <div style="display: inline-block; background: ${bgColor}; padding: 10px 15px; 
                    border-radius: 12px; max-width: 80%; font-size: 0.9em;">
          <div style="font-weight: 600; margin-bottom: 5px; display: flex; align-items: center; gap: 5px;">
            ${senderIcon} ${sender === 'user' ? 'You' : 'AI Assistant'}
          </div>
          <div class="message-content">${content}</div>
        </div>
      </div>
    `;
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    if (isLoading) {
      messageDiv.classList.add('loading-message');
    }
  }
  
  /**
   * Update last message content
   */
  updateLastMessage(content) {
    const lastMessage = document.querySelector('.loading-message .message-content');
    if (lastMessage) {
      lastMessage.textContent = content;
      lastMessage.closest('.loading-message').classList.remove('loading-message');
    }
  }
  
  /**
   * Show error message
   */
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
  
  /**
   * Deactivate AI Assistant
   */
  deactivate() {
    this.isActive = false;
    this.currentContext = null;
    this.activeElement = null;
    
    // Remove UI elements
    const assistant = document.getElementById('ai-assistant-interface');
    const loader = document.getElementById('ai-assistant-loader');
    
    if (assistant) assistant.remove();
    if (loader) loader.remove();
  }
}

// 🔑 Global AI Assistant Instance
export const globalAIAssistant = new FileContextAssistant();

// 🔑 Public API
export const aiAssistantAPI = {
  /**
   * Manually activate AI Assistant
   */
  activate: (targetElement, position) => globalAIAssistant.activate(targetElement, position),
  
  /**
   * Deactivate AI Assistant
   */
  deactivate: () => globalAIAssistant.deactivate(),
  
  /**
   * Check if AI Assistant is active
   */
  isActive: () => globalAIAssistant.isActive,
  
  /**
   * Configure AI Assistant
   */
  configure: (options) => {
    Object.assign(globalAIAssistant.config, options);
  },
  
  /**
   * Get current context
   */
  getCurrentContext: () => globalAIAssistant.currentContext
};

// Auto-initialize when module is loaded
console.log('🔑 AI Assistant with File Context Awareness initialized');