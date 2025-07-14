import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  createConversationalNode, 
  createConversationThread,
  NODE_STATES,
  BRANCH_TYPES,
  getNextState
} from './types/conversationTypes';

// Initial demo data
const initialNodes = [
  {
    id: '1',
    type: 'card',
    position: { x: 400, y: 100 },
    data: { 
      title: 'Mind Garden Root',
      content: 'Start your creative journey here',
      type: 'text',
      phase: 'narrative',
      tags: ['concept', 'start']
    },
  },
  {
    id: '2',
    type: 'card',
    position: { x: 200, y: 250 },
    data: { 
      title: 'Visual References',
      content: 'Collect inspiring images and mood boards',
      type: 'image',
      phase: 'formal',
      hasSuggestions: true
    },
  },
  {
    id: '3',
    type: 'card', 
    position: { x: 600, y: 250 },
    data: { 
      title: 'Technical Notes',
      content: 'Houdini setup ideas and VFX breakdown',
      type: 'text',
      phase: 'formal',
      tags: ['houdini', 'vfx']
    },
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'organic',
    data: { strength: 2, color: 'rgba(16, 185, 129, 0.5)' }
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    type: 'organic',
    data: { strength: 1.5, animated: true }
  },
];

export const useMindGardenStore = create(
  subscribeWithSelector((set, get) => ({
    // Core state
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    currentPhase: 'dump',
    exportHistory: [],
    initialized: false,

    // ENHANCED v5.1: Conversation Threading State
    conversations: new Map(),           // nodeId → conversation thread
    nodeRelationships: new Map(),       // nodeId → { parent, children }
    contextCache: new Map(),            // nodeId → processed context
    
    // AI Intelligence State
    aiResponses: new Map(),             // nodeId → AI response data
    contextDepth: new Map(),            // nodeId → context depth level
    aiConfidence: new Map(),            // nodeId → response confidence score
    
    // Visual State Management
    nodeStates: new Map(),              // nodeId → visual state
    selectedThread: null,               // Currently selected conversation thread
    focusedNodeId: null,                // Currently focused node for keyboard nav

    // ENHANCED v5.1: Conversation Management Methods
    
    // Create a new conversational node
    createConversationalNode: (position, parentId = null, branchType = BRANCH_TYPES.EXPLORATION) => {
      console.log('🌱 Store: createConversationalNode called', { position, parentId, branchType });
      
      const parentNode = parentId ? get().nodes.find(n => n.id === parentId) : null;
      const parentChain = parentNode ? [...(parentNode.data.context?.parentChain || []), parentId] : [];
      
      console.log('🌱 Store: Parent chain built:', parentChain);
      
      const newNode = createConversationalNode({
        position,
        context: {
          parentChain,
          depth: parentChain.length,
          branch: branchType,
          focus: 'creative'
        },
        onUpdate: (nodeId, updates) => get().updateConversationalNode(nodeId, updates),
        onCreateChild: (nodeId, config) => get().createChildNode(nodeId, config),
        onCreateSibling: (nodeId, config) => get().createSiblingNode(nodeId, config)
      });

      console.log('🌱 Store: New node created:', newNode);
      
      // Add to nodes
      set((state) => ({
        nodes: [...state.nodes, newNode]
      }));

      console.log('🌱 Store: Node added to state, total nodes:', get().nodes.length);

      // Update relationships
      get().updateNodeRelationships(newNode.id, parentId);
      
      // Initialize conversation thread
      if (!parentId) {
        get().initializeConversationThread(newNode.id);
      }

      get().saveToLocalStorage();
      console.log('🌱 Store: Node creation complete, returning ID:', newNode.id);
      return newNode.id;
    },

    // Update conversational node data
    updateConversationalNode: (nodeId, updates) => {
      set((state) => ({
        nodes: state.nodes.map(node => 
          node.id === nodeId 
            ? { 
                ...node, 
                data: { ...node.data, ...updates },
                selected: false // Ensure visual state is clean
              } 
            : node
        )
      }));

      // Update AI-related caches if response was added
      if (updates.aiResponse) {
        get().aiResponses.set(nodeId, {
          response: updates.aiResponse,
          timestamp: updates.timestamp || new Date().toISOString(),
          confidence: updates.context?.aiConfidence || 0.8
        });

        get().aiConfidence.set(nodeId, updates.context?.aiConfidence || 0.8);
      }

      // Update state tracking
      if (updates.state) {
        get().nodeStates.set(nodeId, updates.state);
      }

      get().saveToLocalStorage();
    },

    // Create child node (conversation continuation)
    createChildNode: (parentId, config = {}) => {
      const parentNode = get().nodes.find(n => n.id === parentId);
      if (!parentNode) return null;

      // Calculate position below parent
      const childPosition = {
        x: parentNode.position.x + (Math.random() - 0.5) * 100, // Small random offset
        y: parentNode.position.y + 150
      };

      const childId = get().createConversationalNode(
        childPosition, 
        parentId, 
        config.context?.branch || BRANCH_TYPES.EXPLORATION
      );

      // Create enhanced conversation edge
      const newEdge = {
        id: `edge_${parentId}_${childId}`,
        source: parentId,
        target: childId,
        type: 'conversation',
        data: { 
          strength: 'medium',
          branch: config.context?.branch || BRANCH_TYPES.EXPLORATION,
          confidence: 0.8,
          animated: true,
          contextDepth: (config.context?.depth || 0) + 1
        }
      };

      set((state) => ({
        edges: [...state.edges, newEdge]
      }));

      // Update parent state to 'branching'
      get().nodeStates.set(parentId, NODE_STATES.BRANCHING);

      return childId;
    },

    // Create sibling node (conversation variation)
    createSiblingNode: (siblingId, config = {}) => {
      const siblingNode = get().nodes.find(n => n.id === siblingId);
      if (!siblingNode) return null;

      const parentId = siblingNode.data.context?.parentChain?.slice(-1)[0] || null;
      
      // Calculate position next to sibling
      const siblingPosition = {
        x: siblingNode.position.x + 250, // Offset to the right
        y: siblingNode.position.y + (Math.random() - 0.5) * 50
      };

      const newSiblingId = get().createConversationalNode(
        siblingPosition,
        parentId,
        config.context?.branch || BRANCH_TYPES.REFINEMENT
      );

      // Create edge connection if there's a parent
      if (parentId) {
        const newEdge = {
          id: `edge_${parentId}_${newSiblingId}`,
          source: parentId,
          target: newSiblingId,
          type: 'conversation',
          data: { 
            strength: 'medium',
            branch: config.context?.branch || BRANCH_TYPES.REFINEMENT,
            confidence: 0.7,
            animated: false,
            contextDepth: config.context?.depth || 0
          }
        };

        set((state) => ({
          edges: [...state.edges, newEdge]
        }));
      }

      return newSiblingId;
    },

    // Update node relationships tracking
    updateNodeRelationships: (nodeId, parentId) => {
      const relationships = get().nodeRelationships;
      
      // Initialize relationship for this node
      if (!relationships.has(nodeId)) {
        relationships.set(nodeId, { parent: parentId, children: [] });
      }

      // Update parent's children list
      if (parentId && relationships.has(parentId)) {
        const parentRel = relationships.get(parentId);
        if (!parentRel.children.includes(nodeId)) {
          parentRel.children.push(nodeId);
          relationships.set(parentId, parentRel);
        }
      }

      set({ nodeRelationships: relationships });
    },

    // Initialize conversation thread
    initializeConversationThread: (rootNodeId) => {
      const thread = createConversationThread(rootNodeId, []);
      get().conversations.set(rootNodeId, thread);
      return thread.id;
    },

    // Build parent chain context for AI processing
    buildParentChain: (nodeId) => {
      const node = get().nodes.find(n => n.id === nodeId);
      if (!node || !node.data.context?.parentChain) return [];

      const parentChain = [];
      for (const parentId of node.data.context.parentChain) {
        const parentNode = get().nodes.find(n => n.id === parentId);
        if (parentNode) {
          parentChain.push({
            id: parentId,
            prompt: parentNode.data.prompt,
            response: parentNode.data.aiResponse, // Fix: renamed aiResponse to response for PromptBuilder compatibility
            branch: parentNode.data.context?.branch,
            timestamp: parentNode.data.timestamp
          });
        }
      }

      return parentChain;
    },

    // Get conversation thread for export
    getConversationThread: (nodeId) => {
      // Find the root of this conversation
      let currentNode = get().nodes.find(n => n.id === nodeId);
      if (!currentNode) return null;

      // Traverse up to find root
      while (currentNode.data.context?.parentChain?.length > 0) {
        const parentId = currentNode.data.context.parentChain[0];
        const parentNode = get().nodes.find(n => n.id === parentId);
        if (!parentNode) break;
        currentNode = parentNode;
      }

      const rootId = currentNode.id;
      
      // Collect all nodes in this conversation thread
      const threadNodes = [];
      const visited = new Set();
      
      const collectNodes = (nodeId) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        
        const node = get().nodes.find(n => n.id === nodeId);
        if (node) {
          threadNodes.push(node);
          
          // Find children
          const relationships = get().nodeRelationships;
          const nodeRel = relationships.get(nodeId);
          if (nodeRel?.children) {
            nodeRel.children.forEach(childId => collectNodes(childId));
          }
        }
      };

      collectNodes(rootId);
      
      return {
        rootId,
        nodes: threadNodes,
        metadata: {
          totalDepth: Math.max(...threadNodes.map(n => n.data.context?.depth || 0)),
          branchCount: threadNodes.filter(n => n.data.context?.branch !== BRANCH_TYPES.EXPLORATION).length,
          nodeCount: threadNodes.length
        }
      };
    },

    // Focus management for keyboard navigation
    setFocusedNode: (nodeId) => {
      set({ focusedNodeId: nodeId });
    },

    // Node management (enhanced)
    setNodes: (nodes) => {
      if (typeof nodes === 'function') {
        set((state) => ({ nodes: nodes(state.nodes) }));
      } else {
        set({ nodes });
      }
      get().saveToLocalStorage();
    },

    setEdges: (edges) => {
      if (typeof edges === 'function') {
        set((state) => ({ edges: edges(state.edges) }));
      } else {
        set({ edges });
      }
      get().saveToLocalStorage();
    },

    setViewport: (viewport) => {
      set({ viewport });
      get().saveToLocalStorage();
    },

    addNode: (node) => {
      set((state) => ({
        nodes: [...state.nodes, node]
      }));
      get().saveToLocalStorage();
    },

    updateNode: (nodeId, updates) => {
      set((state) => ({
        nodes: state.nodes.map(node => 
          node.id === nodeId ? { ...node, ...updates } : node
        )
      }));
      get().saveToLocalStorage();
    },

    removeNode: (nodeId) => {
      set((state) => ({
        nodes: state.nodes.filter(node => node.id !== nodeId),
        edges: state.edges.filter(edge => 
          edge.source !== nodeId && edge.target !== nodeId
        )
      }));
      get().saveToLocalStorage();
    },

    addEdge: (edge) => {
      set((state) => ({
        edges: [...state.edges, edge]
      }));
      get().saveToLocalStorage();
    },

    // Export functionality
    exportToCanvas: async (nodeIds) => {
      const { nodes } = get();
      const selectedNodes = nodes.filter(node => nodeIds.includes(node.id));
      
      if (selectedNodes.length === 0) {
        console.warn('🌱 No nodes selected for export');
        return false;
      }

      try {
        // Get unified store
        const { useUnifiedStore } = await import('../../store/unifiedStore');
        const unifiedStore = useUnifiedStore.getState();

        // Transform nodes to canvas elements (with all required Canvas properties)
        console.log('🌱 DEBUG: selectedNodes structure:', selectedNodes);
        const canvasElements = selectedNodes.map(node => {
          console.log('🌱 DEBUG: node structure:', node);
          console.log('🌱 DEBUG: node.data:', node.data);
          return {
            id: `mind_${node.id}_${Date.now()}`,
            type: 'note',
            position: {
              x: node.position.x,
              y: node.position.y
            },
            size: {
              width: null, // Let Canvas component determine adaptive size
              height: null
            },
            rotation: 0,
            visible: true,
            data: {
              title: node.data.title || 'Untitled',
              content: node.data.content || '',
              backgroundColor: getPhaseColor(node.data.phase),
              sourceModule: 'mind-garden',
              sourceId: node.id,
              tags: node.data.tags || [],
              mindGardenPhase: node.data.phase
            }
          };
        });

        // Add to canvas through Canvas Store using proper Canvas element creation
        const { useCanvasStore } = await import('../visual-canvas/store');
        const { createCanvasElement } = await import('../visual-canvas/types');
        
        // Create proper Canvas elements and merge with our data
        const properCanvasElements = canvasElements.map(element => {
          const baseElement = createCanvasElement(element.type, element.position);
          const mergedElement = {
            ...baseElement,
            data: { ...baseElement.data, ...element.data }
          };
          console.log('🐛 Created canvas element:', JSON.stringify(mergedElement, null, 2));
          return mergedElement;
        });
        
        // Add elements to Canvas Store state (support adaptive sizing)
        useCanvasStore.setState((state) => ({
          ...state,
          elements: [...state.elements, ...properCanvasElements],
          selectedIds: properCanvasElements.map(el => el.id)
        }));
        
        // Force save to localStorage immediately
        const canvasStore = useCanvasStore.getState();
        canvasStore.saveCurrentLevelToHierarchy();
        
        // Also update Unified Store for coordination
        useUnifiedStore.setState((state) => ({
          lastActivity: new Date().toISOString(),
          currentModule: 'canvas'
        }));

        // Record export history
        const exportRecord = {
          id: `export_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          nodeCount: selectedNodes.length,
          nodeIds: nodeIds,
          canvasElementIds: canvasElements.map(el => el.id)
        };

        set((state) => ({
          exportHistory: [...state.exportHistory, exportRecord].slice(-10) // Keep last 10
        }));
        
        // Also update unified store's Mind Garden export history
        unifiedStore.addMindGardenExport?.(exportRecord);

        console.log('🌱 Successfully exported', selectedNodes.length, 'nodes to Canvas');
        return true;

      } catch (error) {
        console.error('🌱 Export to Canvas failed:', error);
        return false;
      }
    },

    // Persistence
    saveToLocalStorage: () => {
      const { nodes, edges, viewport, currentPhase, exportHistory } = get();
      const data = {
        nodes,
        edges,
        viewport,
        currentPhase,
        exportHistory,
        timestamp: Date.now()
      };
      
      try {
        localStorage.setItem('ATELIER_MIND_GARDEN', JSON.stringify(data));
      } catch (error) {
        console.error('🌱 Failed to save to localStorage:', error);
      }
    },

    loadFromLocalStorage: () => {
      try {
        const saved = localStorage.getItem('ATELIER_MIND_GARDEN');
        if (saved) {
          const data = JSON.parse(saved);
          set({
            nodes: data.nodes || initialNodes,
            edges: data.edges || initialEdges,
            viewport: data.viewport || { x: 0, y: 0, zoom: 1 },
            currentPhase: data.currentPhase || 'dump',
            exportHistory: data.exportHistory || []
          });
          console.log('🌱 Loaded Mind Garden from localStorage');
          return true;
        }
      } catch (error) {
        console.error('🌱 Failed to load from localStorage:', error);
      }
      
      // Fallback to initial data
      set({
        nodes: initialNodes,
        edges: initialEdges,
        viewport: { x: 0, y: 0, zoom: 1 },
        currentPhase: 'dump',
        exportHistory: []
      });
      console.log('🌱 Initialized with default data');
      return false;
    },

    // Sync with unified store
    syncToUnified: async () => {
      try {
        const { useUnifiedStore } = await import('../../store/unifiedStore');
        const unifiedStore = useUnifiedStore.getState();
        const { nodes, edges, viewport, currentPhase } = get();

        unifiedStore.setMindGardenState?.({
          nodes,
          edges,
          viewport,
          currentPhase,
          lastActivity: new Date().toISOString()
        });
      } catch (error) {
        console.error('🌱 Failed to sync to unified store:', error);
      }
    },

    // Initialize store
    // Calculate centered viewport for nodes
    getCenteredViewport: (nodes) => {
      if (!nodes || nodes.length === 0) {
        return { x: 0, y: 0, zoom: 1 };
      }

      // Calculate bounding box of all nodes
      const positions = nodes.map(node => node.position);
      const minX = Math.min(...positions.map(p => p.x));
      const maxX = Math.max(...positions.map(p => p.x));
      const minY = Math.min(...positions.map(p => p.y));
      const maxY = Math.max(...positions.map(p => p.y));

      // Calculate center point of nodes
      const nodesCenterX = (minX + maxX) / 2;
      const nodesCenterY = (minY + maxY) / 2;

      // Calculate screen center (accounting for sidebars and UI)
      const screenCenterX = window.innerWidth / 2;
      const screenCenterY = window.innerHeight / 2;

      // ReactFlow viewport offset calculation
      // Negative values move the content towards center
      const zoom = 1;
      return {
        x: screenCenterX - (nodesCenterX * zoom),
        y: screenCenterY - (nodesCenterY * zoom),
        zoom: zoom
      };
    },

    initializeStore: () => {
      if (get().initialized) return;
      
      get().loadFromLocalStorage();
      
      // Center viewport on loaded nodes
      const currentNodes = get().nodes;
      if (currentNodes.length > 0) {
        const centeredViewport = get().getCenteredViewport(currentNodes);
        set({ viewport: centeredViewport });
      }
      
      set({ initialized: true });
      
      // Sync to unified store
      setTimeout(() => get().syncToUnified(), 100);
    },

    // Clear all data
    clearAll: () => {
      set({
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        exportHistory: []
      });
      get().saveToLocalStorage();
    },

    // Helper methods for keyboard navigation
    getNode: (nodeId) => {
      return get().nodes.find(n => n.id === nodeId);
    },

    getNodes: () => {
      return get().nodes;
    },

    getEdges: () => {
      return get().edges;
    },

    getNodeChildren: (nodeId) => {
      const edges = get().edges.filter(e => e.source === nodeId);
      const childIds = edges.map(e => e.target);
      return get().nodes.filter(n => childIds.includes(n.id));
    },

    getNodeSiblings: (nodeId) => {
      const node = get().getNode(nodeId);
      if (!node) return [];
      
      // Get parent ID from context
      const parentChain = node.data.context?.parentChain || [];
      const parentId = parentChain[parentChain.length - 1] || null;
      
      if (!parentId) return [];
      
      // Get all children of the parent
      const siblings = get().getNodeChildren(parentId);
      
      // Filter out the current node
      return siblings.filter(n => n.id !== nodeId);
    },

    selectNode: (nodeId) => {
      set((state) => ({
        nodes: state.nodes.map(n => ({
          ...n,
          selected: n.id === nodeId
        }))
      }));
    },

    getViewport: () => {
      return get().viewport;
    },

    setViewport: (newViewport, options = {}) => {
      set({ viewport: newViewport });
    }
  }))
);

// Helper function to get phase colors (more vibrant for Canvas notes)
function getPhaseColor(phase) {
  switch (phase) {
    case 'narrative': return '#DBEAFE'; // Light blue background
    case 'formal': return '#D1FAE5';    // Light green background  
    case 'symbolic': return '#EDE9FE';  // Light purple background
    default: return '#FEF3C7';         // Light yellow instead of gray
  }
}