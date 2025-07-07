import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { BUSINESS_MODES } from '../config/constants';

const useStore = create(
  devtools(
    persist(
      (set) => ({
        // Business Mode
        businessMode: BUSINESS_MODES.NFT,
        setBusinessMode: (mode) => set({ businessMode: mode }),
        
        // Sidebar State
        isSidebarCollapsed: false,
        toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
        
        // Projects
        projects: [],
        addProject: (project) => set((state) => ({ 
          projects: [...state.projects, { ...project, id: Date.now() }] 
        })),
        updateProject: (id, updates) => set((state) => ({
          projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
        })),
        deleteProject: (id) => set((state) => ({
          projects: state.projects.filter(p => p.id !== id)
        })),
        
        // Canvas State (placeholder for future implementation)
        canvasElements: [],
        addCanvasElement: (element) => set((state) => ({
          canvasElements: [...state.canvasElements, { ...element, id: Date.now() }]
        })),
        removeCanvasElement: (id) => set((state) => ({
          canvasElements: state.canvasElements.filter(e => e.id !== id)
        })),
        
        // User Preferences
        theme: 'light',
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: 'atelier-store',
      }
    )
  )
);

export default useStore;