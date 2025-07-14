/**
 * Mind Garden v5.1 - Conversation Types and Constants
 * Flora AI-inspired conversational intelligence system
 */

// Node States - Visual and functional states for conversational nodes
export const NODE_STATES = {
  EMPTY: 'empty',           // Ready for user input
  THINKING: 'thinking',     // AI processing context
  STREAMING: 'streaming',   // AI response being generated
  COMPLETE: 'complete',     // Has prompt + response
  EDITING: 'editing',       // User editing content
  BRANCHING: 'branching'    // Creating child/sibling nodes
};

// Branch Types - Different conversation exploration directions
export const BRANCH_TYPES = {
  EXPLORATION: 'exploration',       // Continue exploring ideas
  REFINEMENT: 'refinement',         // Refine/improve current idea
  IMPLEMENTATION: 'implementation', // Move toward implementation
  CRITIQUE: 'critique'              // Analyze problems/challenges
};

// Conversation Focus Types - Different thinking modes
export const CONVERSATION_FOCUS = {
  CREATIVE: 'creative',       // Creative ideation and brainstorming
  TECHNICAL: 'technical',     // Technical problem-solving
  STRATEGIC: 'strategic',     // Strategic planning and analysis
  ANALYTICAL: 'analytical'    // Deep analysis and critique
};

// Context Depth Levels - Visual indicators for conversation depth
export const CONTEXT_DEPTH = {
  FRESH: { level: 0, indicator: '○', color: 'gray-400', meaning: 'Fresh start' },
  LIGHT: { level: 1, indicator: '◐', color: 'blue-400', meaning: 'Light context' },
  MEDIUM: { level: 2, indicator: '◑', color: 'blue-600', meaning: 'Medium context' },
  DEEP: { level: 3, indicator: '●', color: 'blue-800', meaning: 'Deep context' }
};

// AI Confidence Levels
export const CONFIDENCE_LEVELS = {
  LOW: { threshold: 0.6, opacity: 0.7, label: 'Low confidence' },
  MEDIUM: { threshold: 0.8, opacity: 0.85, label: 'Medium confidence' },
  HIGH: { threshold: 1.0, opacity: 1.0, label: 'High confidence' }
};

// Connection Strength - Visual representation of node relationships
export const CONNECTION_STRENGTH = {
  WEAK: { width: 1, opacity: 0.3, label: 'Weak relationship' },
  MEDIUM: { width: 2, opacity: 0.6, label: 'Medium relationship' },
  STRONG: { width: 3, opacity: 1.0, label: 'Strong relationship' }
};

// Keyboard Navigation Map
export const KEYBOARD_ACTIONS = {
  ENTER: 'generateResponse',
  TAB: 'createChildNode',
  SHIFT_TAB: 'createSiblingNode',
  ESCAPE: 'exitEditing',
  F2: 'enterEditMode',
  CTRL_E: 'exportThread',
  CTRL_Z: 'undo',
  CTRL_Y: 'redo',
  DELETE: 'deleteNode',
  BACKSPACE: 'deleteNode'
};

// Default Node Structure for Conversational Nodes
export const createConversationalNode = (overrides = {}) => ({
  id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type: 'conversational',
  
  // Core content
  data: {
    prompt: '',
    aiResponse: '',
    combinedText: '',
    timestamp: new Date().toISOString(),
    
    // Conversation context
    context: {
      parentChain: [],                    // Array of parent node IDs
      depth: 0,                          // Context depth level
      branch: BRANCH_TYPES.EXPLORATION,  // Branch type
      focus: CONVERSATION_FOCUS.CREATIVE, // Conversation focus
      aiConfidence: null                 // AI response confidence (0-1)
    },
    
    // Visual state
    state: NODE_STATES.EMPTY,
    
    // Metadata
    aiGenerated: false,
    sourceNode: null,
    relationship: null,
    tags: [],
    
    // Callbacks for parent communication
    onUpdate: null,
    onCreateChild: null,
    onCreateSibling: null,
    
    ...overrides
  },
  
  // ReactFlow positioning (will be calculated)
  position: { x: 0, y: 0 },
  
  // Default styling
  selected: false,
  dragging: false
});

// Conversation Thread Structure
export const createConversationThread = (rootNodeId, nodes = []) => ({
  id: `thread_${Date.now()}`,
  rootNodeId,
  nodes: nodes,
  metadata: {
    created: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    totalDepth: Math.max(...nodes.map(n => n.data.context?.depth || 0)),
    branchCount: nodes.filter(n => n.data.context?.branch !== BRANCH_TYPES.EXPLORATION).length,
    mainTopic: null, // Will be extracted by AI
    keyInsights: [], // Will be extracted by AI
    exportable: false
  }
});

// Branch Type Styling Configuration
export const getBranchStyling = (branchType) => {
  const styles = {
    [BRANCH_TYPES.EXPLORATION]: {
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      color: '#3B82F6'
    },
    [BRANCH_TYPES.REFINEMENT]: {
      border: 'border-purple-500',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      color: '#8B5CF6'
    },
    [BRANCH_TYPES.IMPLEMENTATION]: {
      border: 'border-green-500',
      bg: 'bg-green-50',
      text: 'text-green-700',
      color: '#10B981'
    },
    [BRANCH_TYPES.CRITIQUE]: {
      border: 'border-red-500',
      bg: 'bg-red-50',
      text: 'text-red-700',
      color: '#EF4444'
    }
  };
  
  return styles[branchType] || styles[BRANCH_TYPES.EXPLORATION];
};

// Context Depth Helper
export const getContextIndicator = (depth = 0) => {
  if (depth === 0) return CONTEXT_DEPTH.FRESH;
  if (depth === 1) return CONTEXT_DEPTH.LIGHT;
  if (depth <= 3) return CONTEXT_DEPTH.MEDIUM;
  return CONTEXT_DEPTH.DEEP;
};

// AI Confidence Helper
export const getConfidenceLevel = (confidence = 0) => {
  if (confidence >= CONFIDENCE_LEVELS.HIGH.threshold) return CONFIDENCE_LEVELS.HIGH;
  if (confidence >= CONFIDENCE_LEVELS.MEDIUM.threshold) return CONFIDENCE_LEVELS.MEDIUM;
  return CONFIDENCE_LEVELS.LOW;
};

// Connection Strength Helper
export const getConnectionStrength = (relationship, confidence = 0.5) => {
  // Calculate strength based on relationship type and AI confidence
  if (relationship === 'direct' && confidence > 0.8) return CONNECTION_STRENGTH.STRONG;
  if (relationship === 'direct' || confidence > 0.6) return CONNECTION_STRENGTH.MEDIUM;
  return CONNECTION_STRENGTH.WEAK;
};

// Export structure for Canvas integration
export const createCanvasExportStructure = (conversationThread) => ({
  type: 'conversation_export',
  timestamp: new Date().toISOString(),
  source: {
    threadId: conversationThread.id,
    nodeCount: conversationThread.nodes.length,
    depth: conversationThread.metadata.totalDepth
  },
  canvas: {
    boards: [],      // Will be populated by export intelligence
    elements: [],    // Converted conversation nodes
    connections: []  // Relationship mappings
  },
  metadata: {
    mainTopic: conversationThread.metadata.mainTopic,
    keyInsights: conversationThread.metadata.keyInsights,
    exportOptions: {
      preserveFlow: true,
      groupByTopic: true,
      includeMetadata: true
    }
  }
});

// Validation helpers
export const validateNodeState = (state) => {
  return Object.values(NODE_STATES).includes(state);
};

export const validateBranchType = (branchType) => {
  return Object.values(BRANCH_TYPES).includes(branchType);
};

export const validateConversationFocus = (focus) => {
  return Object.values(CONVERSATION_FOCUS).includes(focus);
};

// Node transition helpers
export const getNextState = (currentState, action) => {
  const transitions = {
    [NODE_STATES.EMPTY]: {
      startTyping: NODE_STATES.EDITING,
      generateResponse: NODE_STATES.THINKING
    },
    [NODE_STATES.EDITING]: {
      generateResponse: NODE_STATES.THINKING,
      exitEdit: NODE_STATES.EMPTY
    },
    [NODE_STATES.THINKING]: {
      startStreaming: NODE_STATES.STREAMING,
      error: NODE_STATES.EDITING
    },
    [NODE_STATES.STREAMING]: {
      complete: NODE_STATES.COMPLETE,
      error: NODE_STATES.EDITING
    },
    [NODE_STATES.COMPLETE]: {
      edit: NODE_STATES.EDITING,
      createBranch: NODE_STATES.BRANCHING,
      regenerate: NODE_STATES.THINKING
    },
    [NODE_STATES.BRANCHING]: {
      complete: NODE_STATES.COMPLETE
    }
  };

  return transitions[currentState]?.[action] || currentState;
};

export default {
  NODE_STATES,
  BRANCH_TYPES,
  CONVERSATION_FOCUS,
  CONTEXT_DEPTH,
  CONFIDENCE_LEVELS,
  CONNECTION_STRENGTH,
  KEYBOARD_ACTIONS,
  createConversationalNode,
  createConversationThread,
  getBranchStyling,
  getContextIndicator,
  getConfidenceLevel,
  getConnectionStrength,
  createCanvasExportStructure,
  validateNodeState,
  validateBranchType,
  validateConversationFocus,
  getNextState
};