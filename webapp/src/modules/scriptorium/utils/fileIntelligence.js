/**
 * Intelligent File Analysis System
 * Analyzes files and suggests contextual actions and workflows
 */

// Content type detection patterns
const CONTENT_PATTERNS = {
  // Design files
  DESIGN: {
    extensions: ['psd', 'ai', 'sketch', 'fig', 'xd', 'figma'],
    keywords: ['design', 'mockup', 'wireframe', 'prototype'],
    actions: ['extract-colors', 'generate-variations', 'create-specs']
  },
  
  // Documents & Briefs
  BRIEF: {
    extensions: ['pdf', 'doc', 'docx', 'txt', 'md'],
    keywords: ['brief', 'requirements', 'spec', 'project', 'client', 'deliverable'],
    actions: ['extract-requirements', 'create-timeline', 'setup-project']
  },
  
  // Images
  IMAGE: {
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
    keywords: ['photo', 'image', 'visual', 'asset'],
    actions: ['analyze-style', 'extract-colors', 'generate-mood-board']
  },
  
  // Video content
  VIDEO: {
    extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    keywords: ['video', 'footage', 'clip', 'movie'],
    actions: ['extract-frames', 'create-storyboard', 'analyze-content']
  },
  
  // Audio
  AUDIO: {
    extensions: ['mp3', 'wav', 'flac', 'aac'],
    keywords: ['music', 'sound', 'audio', 'voice'],
    actions: ['analyze-tempo', 'extract-waveform', 'sync-video']
  },
  
  // Code & Development
  CODE: {
    extensions: ['js', 'jsx', 'ts', 'tsx', 'css', 'html', 'py', 'json'],
    keywords: ['code', 'script', 'component', 'function'],
    actions: ['analyze-structure', 'generate-docs', 'create-diagram']
  },
  
  // Data files
  DATA: {
    extensions: ['csv', 'xlsx', 'json', 'xml'],
    keywords: ['data', 'analytics', 'metrics', 'report'],
    actions: ['visualize-data', 'create-dashboard', 'extract-insights']
  }
};

// Intelligent suggestions based on file analysis
const SMART_SUGGESTIONS = {
  'design-file': [
    { type: 'COLOR_PALETTE', title: 'Extract Color Palette', priority: 'high' },
    { type: 'STYLE_GUIDE', title: 'Generate Style Guide', priority: 'medium' },
    { type: 'VARIATIONS', title: 'Create Variations', priority: 'medium' }
  ],
  
  'project-brief': [
    { type: 'PROJECT_SETUP', title: 'Setup Project Board', priority: 'high' },
    { type: 'TIMELINE', title: 'Create Timeline', priority: 'high' },
    { type: 'MOOD_BOARD', title: 'Generate Mood Board', priority: 'medium' },
    { type: 'DELIVERABLES', title: 'List Deliverables', priority: 'medium' }
  ],
  
  'image-asset': [
    { type: 'STYLE_ANALYSIS', title: 'Analyze Visual Style', priority: 'high' },
    { type: 'COLOR_EXTRACTION', title: 'Extract Colors', priority: 'medium' },
    { type: 'SIMILAR_ASSETS', title: 'Find Similar Assets', priority: 'low' }
  ],
  
  'video-content': [
    { type: 'STORYBOARD', title: 'Create Storyboard', priority: 'high' },
    { type: 'FRAME_EXTRACTION', title: 'Extract Key Frames', priority: 'medium' },
    { type: 'CONTENT_ANALYSIS', title: 'Analyze Content', priority: 'medium' }
  ]
};

/**
 * Analyzes a file and returns intelligent suggestions
 */
export const analyzeFile = async (file) => {
  if (!file) return null;
  
  const analysis = {
    fileName: file.name,
    fileSize: file.size,
    fileType: getFileExtension(file.name),
    contentType: null,
    suggestions: [],
    automations: [],
    confidence: 0
  };
  
  // Determine content type
  analysis.contentType = detectContentType(file);
  
  // Generate smart suggestions
  analysis.suggestions = generateSuggestions(analysis.contentType, file);
  
  // Suggest automated workflows
  analysis.automations = generateAutomations(analysis.contentType, file);
  
  // Calculate confidence score
  analysis.confidence = calculateConfidence(analysis);
  
  return analysis;
};

/**
 * Detects the content type based on file extension and name
 */
const detectContentType = (file) => {
  const extension = getFileExtension(file.name).toLowerCase();
  const fileName = file.name.toLowerCase();
  
  // Check each content pattern
  for (const [type, pattern] of Object.entries(CONTENT_PATTERNS)) {
    // Check extension match
    if (pattern.extensions.includes(extension)) {
      return type.toLowerCase();
    }
    
    // Check keyword match in filename
    const hasKeyword = pattern.keywords.some(keyword => 
      fileName.includes(keyword)
    );
    
    if (hasKeyword) {
      return type.toLowerCase();
    }
  }
  
  return 'unknown';
};

/**
 * Generates contextual suggestions for the detected content type
 */
const generateSuggestions = (contentType, file) => {
  const suggestionMap = {
    'design': SMART_SUGGESTIONS['design-file'],
    'brief': SMART_SUGGESTIONS['project-brief'],
    'image': SMART_SUGGESTIONS['image-asset'],
    'video': SMART_SUGGESTIONS['video-content']
  };
  
  return suggestionMap[contentType] || [];
};

/**
 * Generates automated workflow suggestions
 */
const generateAutomations = (contentType, file) => {
  const automations = [];
  
  switch (contentType) {
    case 'brief':
      automations.push({
        id: 'auto-project-setup',
        title: 'Auto-setup Project',
        description: 'Create project board, timeline, and deliverable nodes automatically',
        estimatedTime: '30 seconds',
        actions: ['create-board', 'extract-requirements', 'generate-timeline']
      });
      break;
      
    case 'design':
      automations.push({
        id: 'auto-design-analysis',
        title: 'Design Analysis',
        description: 'Extract colors, fonts, and create style guide',
        estimatedTime: '45 seconds',
        actions: ['extract-colors', 'analyze-typography', 'create-style-guide']
      });
      break;
      
    case 'image':
      automations.push({
        id: 'auto-mood-board',
        title: 'Auto Mood Board',
        description: 'Analyze visual style and create matching mood board',
        estimatedTime: '1 minute',
        actions: ['analyze-style', 'find-similar', 'create-mood-board']
      });
      break;
  }
  
  return automations;
};

/**
 * Calculates confidence score for the analysis
 */
const calculateConfidence = (analysis) => {
  let confidence = 0.5; // Base confidence
  
  // Boost confidence if content type is detected
  if (analysis.contentType !== 'unknown') {
    confidence += 0.3;
  }
  
  // Boost confidence if we have suggestions
  if (analysis.suggestions.length > 0) {
    confidence += 0.2;
  }
  
  // Boost confidence if we have automations
  if (analysis.automations.length > 0) {
    confidence += 0.2;
  }
  
  return Math.min(confidence, 1.0);
};

/**
 * Utility function to get file extension
 */
const getFileExtension = (fileName) => {
  return fileName.split('.').pop() || '';
};

/**
 * Mock AI analysis for text content (would use actual AI in production)
 */
export const analyzeTextContent = async (content) => {
  // Simulate AI analysis delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const isProjectBrief = /brief|project|requirement|deliverable|timeline|client/i.test(content);
  const isCreativeContent = /design|visual|brand|logo|color|style/i.test(content);
  
  return {
    type: isProjectBrief ? 'project-brief' : isCreativeContent ? 'creative-brief' : 'document',
    keywords: extractKeywords(content),
    entities: extractEntities(content),
    sentiment: 'neutral',
    confidence: 0.8
  };
};

/**
 * Extract keywords from text content
 */
const extractKeywords = (content) => {
  const words = content.toLowerCase().split(/\W+/);
  const keywords = words.filter(word => 
    word.length > 3 && 
    !['this', 'that', 'with', 'from', 'they', 'been', 'have', 'their'].includes(word)
  );
  
  // Return top 10 most frequent keywords
  const frequency = {};
  keywords.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
};

/**
 * Extract entities (mock implementation)
 */
const extractEntities = (content) => {
  const entities = {
    dates: content.match(/\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/g) || [],
    emails: content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [],
    websites: content.match(/https?:\/\/[^\s]+/g) || [],
    brands: [] // Would use NER model in production
  };
  
  return entities;
};