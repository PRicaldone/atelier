import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { BUSINESS_MODES } from '../config/constants';

// =============================================================================
// UNIFIED STORE ARCHITECTURE
// Central intelligence hub for cross-module communication and AI integration
// =============================================================================

/**
 * Unified Store State Structure
 * Consolidates all module states for intelligent cross-module operations
 */
const createUnifiedState = () => ({
  // System Status
  initialized: false,
  aiReady: false,
  currentModule: 'canvas',
  lastActivity: null,
  
  // Business & App State
  businessMode: BUSINESS_MODES.NFT,
  theme: 'light',
  isSidebarCollapsed: false,
  
  // Canvas State (from visual-canvas/store.js)
  canvas: {
    elements: [],
    selectedIds: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    gridEnabled: true,
    snapToGrid: true,
    currentBoardId: null,
    boardHistory: [],
    boardViewports: {},
    autoSaveEnabled: true
  },
  
  // AI Intelligence State
  ai: {
    suggestions: [],
    context: null,
    lastAnalysis: null,
    analysisHistory: [],
    suggestionsAccepted: 0,
    suggestionsGenerated: 0
  },
  
  // Mind Garden State (future)
  mindGarden: {
    nodes: [],
    edges: [],
    selectedNodes: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    exportHistory: []
  },
  
  // Projects State
  projects: [],
  
  // Cross-Module Navigation
  navigation: {
    history: [],
    breadcrumbs: [],
    activeConnections: []
  }
});

/**
 * Canvas Actions
 * Manages visual canvas operations with AI context awareness
 */
const createCanvasActions = (set, get) => ({
  // Element Management
  addCanvasElement: (type, position) => {
    const newElement = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: {},
      created: new Date().toISOString()
    };
    
    set((state) => ({
      canvas: {
        ...state.canvas,
        elements: [...state.canvas.elements, newElement],
        selectedIds: [newElement.id]
      },
      lastActivity: new Date().toISOString()
    }));
    
    // Trigger AI context analysis
    get().analyzeCanvasContext();
  },
  
  removeCanvasElement: (id) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        elements: state.canvas.elements.filter(e => e.id !== id),
        selectedIds: state.canvas.selectedIds.filter(sid => sid !== id)
      },
      lastActivity: new Date().toISOString()
    }));
  },
  
  updateCanvasElement: (id, updates) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        elements: state.canvas.elements.map(e => 
          e.id === id ? { ...e, ...updates } : e
        )
      },
      lastActivity: new Date().toISOString()
    }));
  },
  
  setCanvasViewport: (viewport) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        viewport
      }
    }));
  },
  
  selectCanvasElements: (ids) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        selectedIds: Array.isArray(ids) ? ids : [ids]
      }
    }));
  }
});

/**
 * AI Intelligence Actions
 * Handles AI suggestions, context analysis, and cross-module intelligence
 */
const createAIActions = (set, get) => ({
  // Context Analysis
  analyzeCanvasContext: async () => {
    const state = get();
    const { canvas, currentModule } = state;
    
    // Simulate AI analysis (replace with real AI later)
    const contextAnalysis = {
      timestamp: new Date().toISOString(),
      module: currentModule,
      elementCount: canvas.elements.length,
      selectedCount: canvas.selectedIds.length,
      viewport: canvas.viewport,
      patterns: [],
      suggestions: []
    };
    
    set((state) => ({
      ai: {
        ...state.ai,
        context: contextAnalysis,
        lastAnalysis: contextAnalysis.timestamp,
        analysisHistory: [...state.ai.analysisHistory, contextAnalysis].slice(-10)
      }
    }));
    
    // Auto-generate suggestions based on context
    get().generateAISuggestions(contextAnalysis);
  },
  
  generateAISuggestions: (context) => {
    const suggestionTemplates = [
      `💡 Add animated transitions to ${context?.elementCount || 0} canvas elements`,
      `🎨 Consider using warmer color palette for ${context?.module || 'current'} module`,
      `⚡ Optimize rendering performance with virtualization`,
      `🔄 Add auto-save functionality`,
      `📊 Create analytics dashboard for usage patterns`,
      `🌙 Implement dark mode toggle`,
      `📱 Optimize layout for mobile devices`,
      `🚀 Add keyboard shortcuts for faster workflow`,
      `🎯 Create project template for ${context?.module || 'current'} workflow`,
      `🔍 Implement advanced search and filtering`
    ];
    
    const newSuggestions = Array.from({ length: 3 }, () => 
      suggestionTemplates[Math.floor(Math.random() * suggestionTemplates.length)]
    );
    
    set((state) => ({
      ai: {
        ...state.ai,
        suggestions: [...state.ai.suggestions, ...newSuggestions],
        suggestionsGenerated: state.ai.suggestionsGenerated + newSuggestions.length
      }
    }));
    
    return newSuggestions;
  },
  
  acceptAISuggestion: (suggestionIndex) => {
    set((state) => ({
      ai: {
        ...state.ai,
        suggestions: state.ai.suggestions.filter((_, index) => index !== suggestionIndex),
        suggestionsAccepted: state.ai.suggestionsAccepted + 1
      }
    }));
  },
  
  clearAISuggestions: () => {
    set((state) => ({
      ai: {
        ...state.ai,
        suggestions: []
      }
    }));
  }
});

/**
 * Navigation Actions
 * Handles cross-module navigation with history and context preservation
 */
const createNavigationActions = (set, get) => ({
  navigateToModule: (module, context = {}) => {
    const currentModule = get().currentModule;
    
    set((state) => ({
      currentModule: module,
      lastActivity: new Date().toISOString(),
      navigation: {
        ...state.navigation,
        history: [...state.navigation.history, {
          from: currentModule,
          to: module,
          timestamp: new Date().toISOString(),
          context
        }].slice(-20), // Keep last 20 navigations
        breadcrumbs: [
          ...state.navigation.breadcrumbs.filter(b => b.module !== module),
          { module, timestamp: new Date().toISOString() }
        ].slice(-5) // Keep last 5 breadcrumbs
      }
    }));
    
    // Analyze context when switching modules
    setTimeout(() => get().analyzeCanvasContext(), 100);
  }
});

/**
 * System Actions
 * Handles system initialization, preferences, and global state
 */
const createSystemActions = (set, get) => ({
  initializeStore: () => {
    set({
      initialized: true,
      aiReady: true,
      lastActivity: new Date().toISOString()
    });
    
    // Initial context analysis
    setTimeout(() => get().analyzeCanvasContext(), 500);
  },
  
  setBusinessMode: (mode) => {
    set({ businessMode: mode });
  },
  
  setTheme: (theme) => {
    set({ theme });
  },
  
  toggleSidebar: () => {
    set((state) => ({ 
      isSidebarCollapsed: !state.isSidebarCollapsed 
    }));
  },
  
  // Project Management
  addProject: (project) => {
    set((state) => ({
      projects: [...state.projects, { 
        ...project, 
        id: Date.now(),
        created: new Date().toISOString()
      }]
    }));
  },
  
  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map(p => 
        p.id === id ? { ...p, ...updates, updated: new Date().toISOString() } : p
      )
    }));
  },
  
  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter(p => p.id !== id)
    }));
  }
});

/**
 * Unified Store
 * Main store combining all modules with AI intelligence layer
 */
export const useUnifiedStore = create(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        // State
        ...createUnifiedState(),
        
        // Actions
        ...createCanvasActions(set, get),
        ...createAIActions(set, get),
        ...createNavigationActions(set, get),
        ...createSystemActions(set, get),
        
        // Computed/Derived State
        getCanvasElementCount: () => get().canvas.elements.length,
        getAISuggestionCount: () => get().ai.suggestions.length,
        getCurrentModuleContext: () => ({
          module: get().currentModule,
          elementCount: get().canvas.elements.length,
          suggestionsCount: get().ai.suggestions.length,
          lastActivity: get().lastActivity
        })
      })),
      {
        name: 'atelier-unified-store',
        // Only persist essential data, not computed state
        partialize: (state) => ({
          businessMode: state.businessMode,
          theme: state.theme,
          canvas: state.canvas,
          projects: state.projects,
          ai: {
            suggestionsAccepted: state.ai.suggestionsAccepted,
            suggestionsGenerated: state.ai.suggestionsGenerated
          }
        })
      }
    ),
    {
      name: 'unified-store'
    }
  )
);

// Selectors for optimized re-renders
export const useCanvasState = () => useUnifiedStore(state => state.canvas);
export const useAIState = () => useUnifiedStore(state => state.ai);
export const useNavigationState = () => useUnifiedStore(state => state.navigation);
export const useCurrentModule = () => useUnifiedStore(state => state.currentModule);

// Auto-initialize store
useUnifiedStore.getState().initializeStore();