/**
 * ModuleContext - Context detection and management for Intelligence System
 * 
 * Provides context-aware suggestions, analysis, and execution
 * based on current module and user state.
 */

import { createModuleLogger } from '../monitoring/ModuleLogger.js';

// Module types
export const ModuleTypes = {
  MIND_GARDEN: 'mind-garden',
  SCRIPTORIUM: 'scriptorium',
  ORCHESTRA: 'orchestra',
  GENERAL: 'general'
};

// Context categories
export const ContextCategories = {
  IMPORT: 'import',
  EXPORT: 'export',
  CREATE: 'create',
  ANALYZE: 'analyze',
  AUTOMATE: 'automate',
  ORGANIZE: 'organize',
  COLLABORATE: 'collaborate',
  REPORT: 'report'
};

// Action templates per module
export const ModuleActionTemplates = {
  [ModuleTypes.MIND_GARDEN]: {
    [ContextCategories.IMPORT]: [
      'Import my Notion pages as nodes',
      'Add Asana tasks to mind map',
      'Load Google Drive files as visual nodes',
      'Convert Airtable records to concepts',
      'Import project structure from filesystem'
    ],
    [ContextCategories.EXPORT]: [
      'Export selected nodes to Scriptorium board',
      'Save mind map as PDF to Drive',
      'Create Notion pages from branches',
      'Export connections to Airtable',
      'Generate report from current map'
    ],
    [ContextCategories.CREATE]: [
      'Create new mind map from topic',
      'Generate concept map from documents',
      'Build knowledge graph from sources',
      'Create visual summary of project',
      'Generate idea connections automatically'
    ],
    [ContextCategories.ANALYZE]: [
      'Analyze concept relationships',
      'Find knowledge gaps in map',
      'Identify key themes and patterns',
      'Generate insights from connections',
      'Create learning path from concepts'
    ],
    [ContextCategories.AUTOMATE]: [
      'Auto-connect related concepts',
      'Generate sub-topics for nodes',
      'Create smart node layouts',
      'Setup automatic knowledge updates',
      'Enable intelligent node suggestions'
    ]
  },

  [ModuleTypes.SCRIPTORIUM]: {
    [ContextCategories.IMPORT]: [
      'Create board with Drive project files',
      'Add Notion meeting notes to board',
      'Import Asana tasks as visual cards',
      'Load Airtable data as elements',
      'Add mind map nodes to canvas'
    ],
    [ContextCategories.EXPORT]: [
      'Export board as PDF report',
      'Save elements to Google Drive',
      'Create Notion page from board',
      'Generate presentation slides',
      'Export to Figma for design'
    ],
    [ContextCategories.CREATE]: [
      'Create project dashboard',
      'Build client presentation board',
      'Generate visual timeline',
      'Create process workflow diagram',
      'Design information architecture'
    ],
    [ContextCategories.ANALYZE]: [
      'Analyze element relationships',
      'Generate board insights',
      'Create visual data summary',
      'Identify layout patterns',
      'Suggest board improvements'
    ],
    [ContextCategories.ORGANIZE]: [
      'Auto-organize elements by type',
      'Create smart element grouping',
      'Generate optimal layout',
      'Apply design templates',
      'Organize by priority/status'
    ],
    [ContextCategories.COLLABORATE]: [
      'Share board with team',
      'Setup collaborative editing',
      'Create team review workflow',
      'Generate feedback collection',
      'Enable real-time comments'
    ]
  },

  [ModuleTypes.ORCHESTRA]: {
    [ContextCategories.IMPORT]: [
      'Import campaign assets from Drive',
      'Load content from Notion',
      'Add social media posts from Airtable',
      'Import client brief from documents',
      'Load brand assets from filesystem'
    ],
    [ContextCategories.EXPORT]: [
      'Export campaign to all platforms',
      'Save assets to client Drive',
      'Create campaign report PDF',
      'Generate social media package',
      'Export analytics to Airtable'
    ],
    [ContextCategories.CREATE]: [
      'Create multi-platform campaign',
      'Build content calendar',
      'Generate social media series',
      'Create client presentation',
      'Build automated workflow'
    ],
    [ContextCategories.ANALYZE]: [
      'Analyze campaign performance',
      'Generate engagement insights',
      'Create ROI analysis',
      'Identify top-performing content',
      'Suggest optimization strategies'
    ],
    [ContextCategories.AUTOMATE]: [
      'Setup automated posting',
      'Create response workflows',
      'Build lead nurturing sequence',
      'Setup performance monitoring',
      'Create alert systems'
    ],
    [ContextCategories.COLLABORATE]: [
      'Setup client approval workflow',
      'Create team collaboration space',
      'Build feedback collection system',
      'Setup stakeholder reporting',
      'Enable real-time updates'
    ]
  }
};

// Context-aware patterns per module
export const ModulePatterns = {
  [ModuleTypes.MIND_GARDEN]: {
    // Patterns that indicate mind garden specific actions
    nodePatterns: [
      /create.*node/i,
      /add.*concept/i,
      /connect.*ideas/i,
      /mind.*map/i,
      /knowledge.*graph/i,
      /visual.*thinking/i
    ],
    
    // Import patterns
    importPatterns: [
      /import.*notion.*pages/i,
      /load.*asana.*tasks/i,
      /add.*drive.*files/i,
      /convert.*to.*nodes/i
    ],
    
    // Export patterns
    exportPatterns: [
      /export.*to.*scriptorium/i,
      /save.*mind.*map/i,
      /create.*board.*from.*nodes/i,
      /generate.*report/i
    ]
  },

  [ModuleTypes.SCRIPTORIUM]: {
    // Canvas specific patterns
    canvasPatterns: [
      /create.*board/i,
      /add.*element/i,
      /visual.*layout/i,
      /canvas.*design/i,
      /board.*organization/i
    ],
    
    // Dashboard patterns
    dashboardPatterns: [
      /dashboard/i,
      /project.*overview/i,
      /client.*presentation/i,
      /visual.*summary/i
    ]
  },

  [ModuleTypes.ORCHESTRA]: {
    // Campaign patterns
    campaignPatterns: [
      /campaign/i,
      /social.*media/i,
      /content.*calendar/i,
      /marketing.*automation/i,
      /multi.*platform/i
    ],
    
    // Automation patterns
    automationPatterns: [
      /automate/i,
      /schedule/i,
      /workflow/i,
      /trigger/i,
      /when.*then/i
    ]
  }
};

/**
 * ModuleContext - Context detection and management
 */
export class ModuleContext {
  constructor() {
    this.logger = createModuleLogger('module-context');
    this.currentModule = ModuleTypes.GENERAL;
    this.contextHistory = [];
    this.userPreferences = new Map();
    this.moduleState = new Map();
  }

  /**
   * Set current module context
   */
  setCurrentModule(module) {
    this.currentModule = module;
    this.logger.info(`Module context changed to: ${module}`, 'setCurrentModule');
  }

  /**
   * Get context-aware suggestions
   */
  getContextSuggestions(module = this.currentModule, category = null) {
    const moduleTemplates = ModuleActionTemplates[module];
    if (!moduleTemplates) return [];

    if (category) {
      return moduleTemplates[category] || [];
    }

    // Return all suggestions for the module
    return Object.values(moduleTemplates).flat();
  }

  /**
   * Get suggestions by category
   */
  getSuggestionsByCategory(module = this.currentModule, category) {
    const moduleTemplates = ModuleActionTemplates[module];
    if (!moduleTemplates || !moduleTemplates[category]) return [];

    return moduleTemplates[category];
  }

  /**
   * Analyze user input for context
   */
  analyzeInputContext(input, module = this.currentModule) {
    const analysis = {
      module,
      input,
      categories: [],
      patterns: [],
      confidence: 0,
      suggestions: []
    };

    const modulePatterns = ModulePatterns[module];
    if (!modulePatterns) return analysis;

    // Check patterns for each category
    for (const [patternType, patterns] of Object.entries(modulePatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          analysis.patterns.push({
            type: patternType,
            pattern: pattern.toString(),
            confidence: 0.8
          });
        }
      }
    }

    // Determine categories based on keywords
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('import') || inputLower.includes('add') || inputLower.includes('load')) {
      analysis.categories.push(ContextCategories.IMPORT);
    }
    if (inputLower.includes('export') || inputLower.includes('save') || inputLower.includes('download')) {
      analysis.categories.push(ContextCategories.EXPORT);
    }
    if (inputLower.includes('create') || inputLower.includes('generate') || inputLower.includes('build')) {
      analysis.categories.push(ContextCategories.CREATE);
    }
    if (inputLower.includes('analyze') || inputLower.includes('insight') || inputLower.includes('pattern')) {
      analysis.categories.push(ContextCategories.ANALYZE);
    }
    if (inputLower.includes('automate') || inputLower.includes('schedule') || inputLower.includes('workflow')) {
      analysis.categories.push(ContextCategories.AUTOMATE);
    }
    if (inputLower.includes('organize') || inputLower.includes('group') || inputLower.includes('sort')) {
      analysis.categories.push(ContextCategories.ORGANIZE);
    }
    if (inputLower.includes('share') || inputLower.includes('collaborate') || inputLower.includes('team')) {
      analysis.categories.push(ContextCategories.COLLABORATE);
    }
    if (inputLower.includes('report') || inputLower.includes('summary') || inputLower.includes('analytics')) {
      analysis.categories.push(ContextCategories.REPORT);
    }

    // Calculate confidence
    analysis.confidence = Math.min(
      (analysis.patterns.length * 0.3) + (analysis.categories.length * 0.2) + 0.5,
      1.0
    );

    // Generate context-aware suggestions
    if (analysis.categories.length > 0) {
      analysis.suggestions = analysis.categories
        .map(cat => this.getSuggestionsByCategory(module, cat))
        .flat()
        .slice(0, 5);
    }

    return analysis;
  }

  /**
   * Get module-specific execution hints
   */
  getExecutionHints(module = this.currentModule, taskAnalysis) {
    const hints = {
      module,
      optimizations: [],
      warnings: [],
      suggestions: []
    };

    // Module-specific optimizations
    switch (module) {
      case ModuleTypes.MIND_GARDEN:
        if (taskAnalysis.services.some(s => s.name === 'notion')) {
          hints.optimizations.push('Consider creating hierarchical nodes for Notion pages');
        }
        if (taskAnalysis.complexity === 'simple') {
          hints.optimizations.push('Direct node creation will be fastest');
        }
        break;

      case ModuleTypes.SCRIPTORIUM:
        if (taskAnalysis.services.length > 2) {
          hints.optimizations.push('Consider using dashboard template for multi-source data');
        }
        if (taskAnalysis.actions.some(a => a.type === 'READ')) {
          hints.optimizations.push('Visual elements will be auto-organized by type');
        }
        break;

      case ModuleTypes.ORCHESTRA:
        if (taskAnalysis.complexity === 'complex') {
          hints.optimizations.push('Multi-step workflow recommended for campaign management');
        }
        if (taskAnalysis.services.some(s => s.name === 'zapier')) {
          hints.warnings.push('Zapier integrations may require additional setup time');
        }
        break;
    }

    return hints;
  }

  /**
   * Update user preferences based on actions
   */
  updateUserPreferences(module, action, success) {
    const key = `${module}-${action}`;
    const current = this.userPreferences.get(key) || { count: 0, success: 0 };
    
    current.count++;
    if (success) current.success++;
    
    this.userPreferences.set(key, current);
    
    this.logger.info(`Updated user preferences: ${key}`, 'updateUserPreferences', {
      count: current.count,
      successRate: current.success / current.count
    });
  }

  /**
   * Get personalized suggestions based on history
   */
  getPersonalizedSuggestions(module = this.currentModule, limit = 5) {
    const suggestions = this.getContextSuggestions(module);
    const preferences = Array.from(this.userPreferences.entries())
      .filter(([key]) => key.startsWith(`${module}-`))
      .sort(([, a], [, b]) => (b.success / b.count) - (a.success / a.count));

    // Prioritize successful actions
    const prioritized = [];
    const remaining = [...suggestions];

    for (const [key, pref] of preferences) {
      if (pref.success / pref.count > 0.7) {
        // Find matching suggestions
        const matching = remaining.filter(s => 
          s.toLowerCase().includes(key.split('-')[1])
        );
        prioritized.push(...matching);
        
        // Remove from remaining
        matching.forEach(m => {
          const index = remaining.indexOf(m);
          if (index > -1) remaining.splice(index, 1);
        });
      }
    }

    // Add remaining suggestions
    prioritized.push(...remaining);

    return prioritized.slice(0, limit);
  }

  /**
   * Get context statistics
   */
  getStats() {
    return {
      currentModule: this.currentModule,
      contextHistory: this.contextHistory.length,
      userPreferences: this.userPreferences.size,
      moduleState: Object.fromEntries(this.moduleState),
      availableModules: Object.values(ModuleTypes),
      availableCategories: Object.values(ContextCategories)
    };
  }
}

// Create singleton instance
export const moduleContext = new ModuleContext();

// Make available for console debugging
if (typeof window !== 'undefined') {
  window.__moduleContext = moduleContext;
}

export default moduleContext;