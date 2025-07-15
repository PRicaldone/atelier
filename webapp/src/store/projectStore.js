/**
 * Unified Project Store - Central project management and AI coordination
 * 
 * This store manages projects as unified containers for all modules:
 * - Canvas elements and boards
 * - MindGarden conversations and AI history
 * - Shared AI context and configuration
 * - Cross-module exports and connections
 * 
 * Key Features:
 * - Project-scoped data storage
 * - AI configuration per project type
 * - Unified workspace management
 * - Cross-module intelligence sharing
 */

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { nanoid } from 'nanoid';

// Project types with different AI configurations
export const PROJECT_TYPES = {
  NFT: 'nft',
  VFX: 'vfx', 
  BRANDING: 'branding',
  GENERAL: 'general'
};

// Project phases for workflow management
export const PROJECT_PHASES = {
  IDEATION: 'ideation',
  DEVELOPMENT: 'development',
  REFINEMENT: 'refinement',
  PRODUCTION: 'production',
  LAUNCH: 'launch',
  COMPLETE: 'complete'
};

// AI model configurations per project type
const AI_CONFIGS = {
  [PROJECT_TYPES.NFT]: {
    model: 'claude-3-5-sonnet-latest',
    temperature: 0.7,
    maxTokens: 4096,
    systemPrompt: `You are an expert NFT creative assistant. You help with:
- Digital art concepts and visual storytelling
- NFT collection planning and roadmaps
- Community building and marketing strategies
- Technical implementation for blockchain integration
- Creative project management and workflow optimization

Focus on innovative, community-driven approaches that create genuine value.`,
    features: ['creative_writing', 'visual_concepts', 'community_building', 'technical_guidance']
  },
  
  [PROJECT_TYPES.VFX]: {
    model: 'claude-3-5-sonnet-latest',
    temperature: 0.6,
    maxTokens: 4096,
    systemPrompt: `You are a VFX pipeline specialist and creative technical director. You help with:
- Visual effects pipeline design and optimization
- Houdini, Maya, and industry tool workflows
- Technical problem-solving and scripting
- Project management for VFX productions
- Creative technical solutions and innovations

Focus on efficient, industry-standard approaches that deliver high-quality results.`,
    features: ['technical_solutions', 'pipeline_optimization', 'tool_integration', 'problem_solving']
  },
  
  [PROJECT_TYPES.BRANDING]: {
    model: 'claude-3-5-sonnet-latest',
    temperature: 0.8,
    maxTokens: 4096,
    systemPrompt: `You are a brand strategist and creative director. You help with:
- Brand identity development and positioning
- Visual identity systems and design principles
- Marketing strategy and audience development
- Creative campaign concepts and execution
- Brand consistency across all touchpoints

Focus on authentic, memorable brand experiences that resonate with target audiences.`,
    features: ['brand_strategy', 'visual_identity', 'marketing_concepts', 'audience_development']
  },
  
  [PROJECT_TYPES.GENERAL]: {
    model: 'claude-3-5-sonnet-latest',
    temperature: 0.7,
    maxTokens: 4096,
    systemPrompt: `You are a versatile creative assistant. You help with:
- Creative ideation and concept development
- Project planning and workflow optimization
- Problem-solving and strategic thinking
- Cross-disciplinary creative solutions
- Adaptive support for any creative challenge

Focus on flexible, thoughtful assistance that adapts to the specific needs of each project.`,
    features: ['creative_ideation', 'project_planning', 'problem_solving', 'adaptive_support']
  }
};

// Default project template structure
const createDefaultProject = (name, type = PROJECT_TYPES.GENERAL) => ({
  id: nanoid(),
  name,
  type,
  phase: PROJECT_PHASES.IDEATION,
  created: new Date().toISOString(),
  modified: new Date().toISOString(),
  
  // Project metadata
  metadata: {
    description: '',
    tags: [],
    deadline: null,
    priority: 'medium',
    collaborators: [],
    notes: ''
  },
  
  // AI configuration
  aiConfig: { ...AI_CONFIGS[type] },
  
  // Unified workspace containing all modules
  workspace: {
    // Mind Garden conversations and AI history
    mindGarden: {
      conversations: [],
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      aiHistory: [],
      contextCache: new Map(),
      exportHistory: []
    },
    
    // Canvas elements and boards
    canvas: {
      elements: [],
      boards: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedIds: [],
      currentBoardId: null,
      boardHistory: [],
      gridEnabled: true,
      snapToGrid: true
    },
    
    // Shared cross-module data
    shared: {
      exports: [], // Cross-module export history
      connections: [], // Links between Canvas and MindGarden
      aiContext: {}, // Shared AI context across modules
      timeline: [], // Project timeline and milestones
      assets: [] // Shared assets and references
    }
  },
  
  // Project settings
  settings: {
    autoSave: true,
    aiEnabled: true,
    collaborationEnabled: false,
    exportFormat: 'json',
    theme: 'light'
  }
});

// Main Project Store
export const useProjectStore = create(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        // Current state
        initialized: false,
        currentProjectId: null,
        projects: {},
        
        // Project management
        createProject: (name, type = PROJECT_TYPES.GENERAL) => {
          const newProject = createDefaultProject(name, type);
          
          set((state) => ({
            projects: {
              ...state.projects,
              [newProject.id]: newProject
            },
            currentProjectId: newProject.id
          }));
          
          console.log('📁 Created new project:', newProject.name, newProject.type);
          return newProject.id;
        },
        
        selectProject: (projectId) => {
          const project = get().projects[projectId];
          if (!project) {
            console.warn('📁 Project not found:', projectId);
            return false;
          }
          
          set({ currentProjectId: projectId });
          console.log('📁 Selected project:', project.name);
          return true;
        },
        
        updateProject: (projectId, updates) => {
          const project = get().projects[projectId];
          if (!project) return false;
          
          set((state) => ({
            projects: {
              ...state.projects,
              [projectId]: {
                ...project,
                ...updates,
                modified: new Date().toISOString()
              }
            }
          }));
          
          return true;
        },
        
        deleteProject: (projectId) => {
          const { [projectId]: deleted, ...remainingProjects } = get().projects;
          
          set((state) => ({
            projects: remainingProjects,
            currentProjectId: state.currentProjectId === projectId ? null : state.currentProjectId
          }));
          
          console.log('📁 Deleted project:', projectId);
          return true;
        },
        
        // Current project helpers
        getCurrentProject: () => {
          const { currentProjectId, projects } = get();
          return currentProjectId ? projects[currentProjectId] : null;
        },
        
        getCurrentProjectWorkspace: () => {
          const project = get().getCurrentProject();
          return project ? project.workspace : null;
        },
        
        // Workspace updates
        updateWorkspace: (module, updates) => {
          const { currentProjectId } = get();
          if (!currentProjectId) return false;
          
          set((state) => ({
            projects: {
              ...state.projects,
              [currentProjectId]: {
                ...state.projects[currentProjectId],
                workspace: {
                  ...state.projects[currentProjectId].workspace,
                  [module]: {
                    ...state.projects[currentProjectId].workspace[module],
                    ...updates
                  }
                },
                modified: new Date().toISOString()
              }
            }
          }));
          
          return true;
        },
        
        // AI configuration management
        updateAIConfig: (updates) => {
          const { currentProjectId } = get();
          if (!currentProjectId) return false;
          
          set((state) => ({
            projects: {
              ...state.projects,
              [currentProjectId]: {
                ...state.projects[currentProjectId],
                aiConfig: {
                  ...state.projects[currentProjectId].aiConfig,
                  ...updates
                },
                modified: new Date().toISOString()
              }
            }
          }));
          
          return true;
        },
        
        // Cross-module operations
        addCrossModuleConnection: (fromModule, fromId, toModule, toId, type = 'export') => {
          const { currentProjectId } = get();
          if (!currentProjectId) return false;
          
          const connection = {
            id: nanoid(),
            fromModule,
            fromId,
            toModule,
            toId,
            type,
            created: new Date().toISOString()
          };
          
          set((state) => ({
            projects: {
              ...state.projects,
              [currentProjectId]: {
                ...state.projects[currentProjectId],
                workspace: {
                  ...state.projects[currentProjectId].workspace,
                  shared: {
                    ...state.projects[currentProjectId].workspace.shared,
                    connections: [
                      ...state.projects[currentProjectId].workspace.shared.connections,
                      connection
                    ]
                  }
                },
                modified: new Date().toISOString()
              }
            }
          }));
          
          return connection.id;
        },
        
        // Project templates
        createProjectFromTemplate: (templateType, name) => {
          const projectId = get().createProject(name, templateType);
          const project = get().projects[projectId];
          
          // Add template-specific initial data
          switch (templateType) {
            case PROJECT_TYPES.NFT:
              get().updateWorkspace('mindGarden', {
                nodes: [
                  // Pre-populate with NFT-specific conversation starters
                  {
                    id: 'nft-starter-concept',
                    type: 'conversational',
                    position: { x: 400, y: 200 },
                    data: {
                      prompt: "What's the core concept and story behind this NFT collection?",
                      context: { branch: 'exploration', depth: 0 }
                    }
                  }
                ]
              });
              break;
              
            case PROJECT_TYPES.VFX:
              get().updateWorkspace('canvas', {
                elements: [
                  // Pre-populate with VFX pipeline template
                  {
                    id: 'vfx-pipeline-board',
                    type: 'board',
                    position: { x: 200, y: 200 },
                    data: {
                      title: 'VFX Pipeline',
                      elements: []
                    }
                  }
                ]
              });
              break;
              
            case PROJECT_TYPES.BRANDING:
              get().updateWorkspace('mindGarden', {
                nodes: [
                  {
                    id: 'brand-identity-starter',
                    type: 'conversational',
                    position: { x: 400, y: 200 },
                    data: {
                      prompt: "What are the core values and personality of this brand?",
                      context: { branch: 'exploration', depth: 0 }
                    }
                  }
                ]
              });
              break;
          }
          
          return projectId;
        },
        
        // Initialization
        initialize: () => {
          const { projects, currentProjectId } = get();
          
          // If no projects exist, create a default one
          if (Object.keys(projects).length === 0) {
            const defaultProjectId = get().createProject('My First Project', PROJECT_TYPES.GENERAL);
            console.log('📁 Created default project:', defaultProjectId);
          }
          
          // If no current project, select the first available
          if (!currentProjectId && Object.keys(projects).length > 0) {
            const firstProjectId = Object.keys(projects)[0];
            get().selectProject(firstProjectId);
          }
          
          set({ initialized: true });
          console.log('📁 Project Store initialized');
        },
        
        // Statistics and insights
        getProjectStats: () => {
          const { projects } = get();
          
          return {
            totalProjects: Object.keys(projects).length,
            projectsByType: Object.values(projects).reduce((acc, project) => {
              acc[project.type] = (acc[project.type] || 0) + 1;
              return acc;
            }, {}),
            projectsByPhase: Object.values(projects).reduce((acc, project) => {
              acc[project.phase] = (acc[project.phase] || 0) + 1;
              return acc;
            }, {}),
            recentProjects: Object.values(projects)
              .sort((a, b) => new Date(b.modified) - new Date(a.modified))
              .slice(0, 5)
          };
        }
      })),
      {
        name: 'atelier-project-store',
        version: 1,
        
        // Custom serialization for Maps and complex objects
        serialize: (state) => {
          const serialized = { ...state };
          
          // Convert Maps to objects for serialization
          Object.values(serialized.projects).forEach(project => {
            if (project.workspace?.mindGarden?.contextCache instanceof Map) {
              project.workspace.mindGarden.contextCache = Object.fromEntries(
                project.workspace.mindGarden.contextCache
              );
            }
          });
          
          return JSON.stringify(serialized);
        },
        
        deserialize: (str) => {
          const state = JSON.parse(str);
          
          // Convert objects back to Maps
          Object.values(state.projects).forEach(project => {
            if (project.workspace?.mindGarden?.contextCache && 
                typeof project.workspace.mindGarden.contextCache === 'object') {
              project.workspace.mindGarden.contextCache = new Map(
                Object.entries(project.workspace.mindGarden.contextCache)
              );
            }
          });
          
          return state;
        }
      }
    ),
    {
      name: 'Project Store'
    }
  )
);

// Export useful constants and helpers
export { AI_CONFIGS, createDefaultProject };