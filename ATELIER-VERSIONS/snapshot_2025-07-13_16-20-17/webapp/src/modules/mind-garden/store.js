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

        // Transform nodes to canvas elements
        const canvasElements = selectedNodes.map(node => ({
          id: `mind_${node.id}_${Date.now()}`,
          type: 'note',
          position: {
            x: node.position.x,
            y: node.position.y
          },
          data: {
            title: node.data.title || 'Untitled',
            content: node.data.content || '',
            backgroundColor: getPhaseColor(node.data.phase),
            sourceModule: 'mind-garden',
            sourceId: node.id,
            tags: node.data.tags || [],
            mindGardenPhase: node.data.phase
          }
        }));

        // Add to canvas through unified store
        // Get current canvas elements
        const currentCanvasElements = unifiedStore.canvas.elements || [];
        
        // Add all new elements at once by directly setting the canvas state
        const updatedElements = [...currentCanvasElements, ...canvasElements];
        
        // Use a direct state update since addCanvasElement expects (type, position)
        useUnifiedStore.setState((state) => ({
          canvas: {
            ...state.canvas,
            elements: updatedElements,
            selectedIds: canvasElements.map(el => el.id)
          },
          lastActivity: new Date().toISOString()
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
    initializeStore: () => {
      if (get().initialized) return;
      
      get().loadFromLocalStorage();
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

// Helper function to get phase colors
function getPhaseColor(phase) {
  switch (phase) {
    case 'narrative': return '#3B82F6';
    case 'formal': return '#10B981';
    case 'symbolic': return '#8B5CF6';
    default: return '#6B7280';
  }
}