import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

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

    // Node management
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