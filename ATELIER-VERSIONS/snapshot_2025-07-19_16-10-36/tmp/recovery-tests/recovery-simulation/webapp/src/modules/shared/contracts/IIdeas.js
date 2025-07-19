/**
 * IIdeas Contract - Interface Definition
 * 
 * Formal contract for Ideas module integration with Module Registry
 * Defines required methods and capabilities for Ideas system
 */

/**
 * Core Ideas Interface Contract
 * 
 * This contract ensures that any implementation of the Ideas module
 * provides the essential functionality required for cross-module integration.
 */
export const IIdeas = {
  // Module Identification
  name: 'Ideas',
  version: '1.0.0',
  description: 'Ideas & Commercial Roadmap Management Module',

  // Required Methods - Core CRUD Operations
  requiredMethods: {
    // Idea Management
    addIdea: {
      signature: '(ideaData: Object) => Promise<Idea|null>',
      description: 'Create new idea with validation',
      required: true
    },
    
    updateIdea: {
      signature: '(ideaId: string, updates: Object) => Promise<boolean>',
      description: 'Update existing idea',
      required: true
    },
    
    updateIdeaStatus: {
      signature: '(ideaId: string, newStatus: string) => Promise<boolean>',
      description: 'Change idea status with validation',
      required: true
    },
    
    getIdea: {
      signature: '(ideaId: string) => Promise<Idea|null>',
      description: 'Retrieve single idea by ID',
      required: true
    },
    
    getIdeas: {
      signature: '(filters?: Object) => Promise<Idea[]>',
      description: 'Retrieve filtered list of ideas',
      required: true
    },
    
    deleteIdea: {
      signature: '(ideaId: string) => Promise<boolean>',
      description: 'Soft delete idea (archive)',
      required: true
    },

    // Statistics and Analytics
    getStats: {
      signature: '() => Promise<Object>',
      description: 'Get comprehensive ideas statistics',
      required: true
    },

    // Cross-Module Integration
    getIdeasByModule: {
      signature: '(moduleName: string) => Promise<Idea[]>',
      description: 'Get ideas related to specific module',
      required: true
    },

    // Health and Monitoring
    healthCheck: {
      signature: '() => Promise<Object>',
      description: 'Module health status check',
      required: true
    }
  },

  // Optional Methods - Enhanced Functionality
  optionalMethods: {
    // Bulk Operations
    bulkUpdateIdeas: {
      signature: '(ideaIds: string[], updates: Object) => Promise<boolean>',
      description: 'Update multiple ideas at once'
    },

    // Search and Discovery
    searchIdeas: {
      signature: '(query: string, options?: Object) => Promise<Idea[]>',
      description: 'Advanced search functionality'
    },

    suggestRelatedIdeas: {
      signature: '(context: Object) => Promise<Idea[]>',
      description: 'AI-powered idea suggestions'
    },

    // Export Capabilities
    exportIdeas: {
      signature: '(format: string, filteredOnly?: boolean) => Promise<Object>',
      description: 'Export ideas in various formats'
    },

    // Kanban and Views
    getIdeasByStatus: {
      signature: '() => Promise<Object>',
      description: 'Group ideas by status for kanban view'
    },

    // Module Integration
    addIdeaFromModule: {
      signature: '(moduleName: string, ideaData: Object) => Promise<Idea|null>',
      description: 'Import idea from external module'
    }
  },

  // Data Schema Contracts
  dataTypes: {
    Idea: {
      id: 'string',
      title: 'string',
      description: 'string', 
      category: 'string', // from IdeaCategory enum
      status: 'string',   // from IdeaStatus enum
      priority: 'string', // from IdeaPriority enum
      author: 'string',
      source: 'string',   // from IdeaSource enum
      createdAt: 'string', // ISO timestamp
      updatedAt: 'string', // ISO timestamp
      relatedModules: 'string[]',
      notes: 'string',
      votes: 'number',
      metadata: 'Object',
      tags: 'string[]',
      roiMetrics: 'Object',
      archived: 'boolean'
    },

    IdeaFilters: {
      status: 'string[]',
      category: 'string[]',
      priority: 'string[]',
      author: 'string',
      search: 'string',
      tags: 'string[]',
      relatedModules: 'string[]'
    },

    IdeaStats: {
      total: 'number',
      active: 'number',
      archived: 'number',
      byStatus: 'Object',
      byCategory: 'Object', 
      byPriority: 'Object',
      implementedCount: 'number',
      averageVotes: 'number'
    }
  },

  // Event Contract - Events that module must emit
  eventContract: {
    'ideas:idea:created': {
      description: 'Emitted when new idea is created',
      payload: {
        idea: 'Idea',
        timestamp: 'number'
      }
    },

    'ideas:idea:updated': {
      description: 'Emitted when idea is updated',
      payload: {
        idea: 'Idea',
        changes: 'Object',
        timestamp: 'number'
      }
    },

    'ideas:idea:status:changed': {
      description: 'Emitted when idea status changes',
      payload: {
        idea: 'Idea',
        oldStatus: 'string',
        newStatus: 'string',
        timestamp: 'number'
      }
    },

    'ideas:idea:deleted': {
      description: 'Emitted when idea is deleted/archived',
      payload: {
        ideaId: 'string',
        timestamp: 'number'
      }
    },

    'ideas:bulk:update': {
      description: 'Emitted when bulk operations are performed',
      payload: {
        ideaIds: 'string[]',
        updates: 'Object',
        timestamp: 'number'
      }
    },

    'ideas:exported': {
      description: 'Emitted when ideas are exported',
      payload: {
        format: 'string',
        count: 'number',
        filename: 'string',
        timestamp: 'number'
      }
    }
  },

  // Adapter Contract - Methods adapter must implement
  adapterContract: {
    async: true,
    errorHandling: 'graceful', // Must not throw, return null/false on error
    logging: 'structured',     // Must use ModuleLogger
    
    // Core adapter methods
    requiredAdapterMethods: [
      'addIdea',
      'updateIdea', 
      'updateIdeaStatus',
      'getIdea',
      'getIdeas',
      'deleteIdea',
      'getStats',
      'getIdeasByModule',
      'healthCheck'
    ],

    // Cross-module communication patterns
    crossModulePatterns: {
      'mind-garden': {
        ideaImport: 'Import mind garden nodes as feature ideas',
        ideaExport: 'Export ideas to mind garden for visualization'
      },
      'scriptorium': {
        ideaDocumentation: 'Create documentation from ideas',
        boardCreation: 'Generate idea boards in scriptorium'
      },
      'orchestra': {
        campaignIdeas: 'Ideas for marketing campaigns',
        contentStrategy: 'Strategic content ideas'
      },
      'analytics': {
        ideaTracking: 'Track idea engagement and ROI',
        patternAnalysis: 'Analyze successful idea patterns'
      }
    }
  },

  // Quality Standards
  qualityStandards: {
    performance: {
      maxResponseTime: '200ms', // For CRUD operations
      maxExportTime: '5s',      // For export operations
      memoryUsage: 'efficient'   // Must use lazy loading
    },

    reliability: {
      errorRecovery: 'graceful',
      dataIntegrity: 'guaranteed',
      persistence: 'localStorage'
    },

    security: {
      dataValidation: 'strict',
      xssProtection: 'enabled',
      sanitization: 'automatic'
    }
  },

  // Integration Requirements
  integrationRequirements: {
    moduleRegistry: {
      registration: 'automatic',
      aliases: ['ideas', 'roadmap', 'commercial-ideas'],
      lazyLoading: true
    },

    eventBus: {
      participation: 'full',
      eventEmission: 'structured',
      eventListening: 'optional'
    },

    errorTracking: {
      integration: 'mandatory',
      structuredLogging: true,
      errorReporting: 'automatic'
    },

    analytics: {
      usageTracking: 'enabled',
      performanceMetrics: 'collected',
      roiTracking: 'integrated'
    },

    aiCommandBar: {
      naturalLanguage: 'supported',
      commandSuggestions: 'provided',
      contextAware: true
    }
  }
};

/**
 * Contract Validation Function
 * 
 * Validates that an implementation conforms to the IIdeas contract
 */
export function validateIdeasContract(implementation) {
  const errors = [];
  const warnings = [];

  // Check required methods
  Object.entries(IIdeas.requiredMethods).forEach(([methodName, spec]) => {
    if (typeof implementation[methodName] !== 'function') {
      errors.push(`Missing required method: ${methodName}`);
    }
  });

  // Check adapter methods if adapter is provided
  if (implementation.adapter) {
    IIdeas.adapterContract.requiredAdapterMethods.forEach(methodName => {
      if (typeof implementation.adapter[methodName] !== 'function') {
        errors.push(`Adapter missing required method: ${methodName}`);
      }
    });
  }

  // Check event emission capability
  if (!implementation.eventBus && !window.__eventBus) {
    warnings.push('No event bus available for event emission');
  }

  // Check health check method
  if (typeof implementation.healthCheck === 'function') {
    try {
      const healthResult = implementation.healthCheck();
      if (!healthResult || typeof healthResult.then !== 'function') {
        warnings.push('healthCheck method should return a Promise');
      }
    } catch (error) {
      warnings.push(`healthCheck method throws error: ${error.message}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: errors.length === 0 ? (warnings.length === 0 ? 100 : 90) : 0
  };
}

/**
 * Contract Compliance Helper
 * 
 * Provides utilities for ensuring contract compliance
 */
export const IdeasContractHelper = {
  /**
   * Check if implementation supports a specific feature
   */
  supportsFeature(implementation, featureName) {
    const allMethods = {
      ...IIdeas.requiredMethods,
      ...IIdeas.optionalMethods
    };
    
    return typeof implementation[featureName] === 'function' ||
           (implementation.adapter && typeof implementation.adapter[featureName] === 'function');
  },

  /**
   * Get missing features from implementation
   */
  getMissingFeatures(implementation) {
    const missing = [];
    
    Object.keys(IIdeas.requiredMethods).forEach(methodName => {
      if (!this.supportsFeature(implementation, methodName)) {
        missing.push(methodName);
      }
    });
    
    return missing;
  },

  /**
   * Get contract compliance report
   */
  getComplianceReport(implementation) {
    const validation = validateIdeasContract(implementation);
    const missing = this.getMissingFeatures(implementation);
    
    return {
      ...validation,
      missingFeatures: missing,
      supportedOptionalFeatures: Object.keys(IIdeas.optionalMethods).filter(
        methodName => this.supportsFeature(implementation, methodName)
      ),
      contractVersion: IIdeas.version
    };
  }
};

export default IIdeas;