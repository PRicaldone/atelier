/**
 * ContextManager - Context preservation and sharing across intelligence systems
 * 
 * Manages context data that flows between:
 * - TaskCoordinator executions
 * - Claude Connectors operations
 * - Orchestrator workflows
 * - Cross-system communication
 */

import { createModuleLogger } from '../monitoring/ModuleLogger.js';
import { eventBus } from '../events/EventBus.js';

// Context scope levels
export const ContextScopes = {
  TASK: 'task',           // Single task execution
  SESSION: 'session',     // Current user session
  WORKFLOW: 'workflow',   // Workflow execution
  GLOBAL: 'global'        // Cross-session persistent
};

// Context data types
export const ContextTypes = {
  USER_INPUT: 'user_input',
  SYSTEM_STATE: 'system_state',
  EXECUTION_RESULT: 'execution_result',
  WORKFLOW_DATA: 'workflow_data',
  CONNECTOR_AUTH: 'connector_auth',
  PREFERENCES: 'preferences',
  CACHE: 'cache'
};

// Context storage strategies
export const StorageStrategies = {
  MEMORY: 'memory',
  LOCAL_STORAGE: 'local_storage',
  SESSION_STORAGE: 'session_storage',
  INDEXED_DB: 'indexed_db'
};

/**
 * ContextEntry - Individual context data entry
 */
export class ContextEntry {
  constructor(key, value, type = ContextTypes.SYSTEM_STATE, scope = ContextScopes.TASK, options = {}) {
    this.key = key;
    this.value = value;
    this.type = type;
    this.scope = scope;
    this.timestamp = Date.now();
    this.expiresAt = options.ttl ? Date.now() + options.ttl : null;
    this.metadata = {
      source: options.source || 'unknown',
      version: options.version || '1.0',
      encrypted: options.encrypted || false,
      compressed: options.compressed || false,
      ...options.metadata
    };
    this.accessCount = 0;
    this.lastAccessed = null;
  }

  /**
   * Check if context entry is expired
   */
  isExpired() {
    return this.expiresAt && Date.now() > this.expiresAt;
  }

  /**
   * Update access statistics
   */
  markAccessed() {
    this.accessCount++;
    this.lastAccessed = Date.now();
  }

  /**
   * Clone the entry
   */
  clone() {
    return new ContextEntry(
      this.key,
      this.value,
      this.type,
      this.scope,
      {
        ttl: this.expiresAt ? this.expiresAt - Date.now() : null,
        source: this.metadata.source,
        version: this.metadata.version,
        encrypted: this.metadata.encrypted,
        compressed: this.metadata.compressed,
        metadata: this.metadata
      }
    );
  }
}

/**
 * ContextManager - Main context management system
 */
export class ContextManager {
  constructor() {
    this.logger = createModuleLogger('context-manager');
    this.contexts = new Map(); // In-memory storage
    this.listeners = new Map(); // Event listeners for context changes
    this.config = {
      maxEntries: 10000,
      defaultTtl: 3600000, // 1 hour
      cleanupInterval: 300000, // 5 minutes
      compressionThreshold: 1024, // 1KB
      encryptionEnabled: false
    };
    
    this.initializeStorage();
    this.startCleanupInterval();
    this.initializeEventHandlers();
  }

  /**
   * Initialize storage systems
   */
  initializeStorage() {
    // Load persistent contexts from localStorage
    this.loadPersistentContexts();
    
    // Initialize storage adapters
    this.storageAdapters = {
      [StorageStrategies.MEMORY]: this.contexts,
      [StorageStrategies.LOCAL_STORAGE]: localStorage,
      [StorageStrategies.SESSION_STORAGE]: sessionStorage,
      [StorageStrategies.INDEXED_DB]: null // TODO: Implement IndexedDB adapter
    };
  }

  /**
   * Load persistent contexts from localStorage
   */
  loadPersistentContexts() {
    try {
      const persistentData = localStorage.getItem('ATELIER_PERSISTENT_CONTEXT');
      if (persistentData) {
        const contexts = JSON.parse(persistentData);
        for (const [key, data] of Object.entries(contexts)) {
          const entry = new ContextEntry(
            data.key,
            data.value,
            data.type,
            data.scope,
            data.metadata
          );
          entry.timestamp = data.timestamp;
          entry.expiresAt = data.expiresAt;
          entry.accessCount = data.accessCount;
          entry.lastAccessed = data.lastAccessed;
          
          if (!entry.isExpired()) {
            this.contexts.set(key, entry);
          }
        }
        this.logger.info(`Loaded ${this.contexts.size} persistent contexts`, 'loadPersistentContexts');
      }
    } catch (error) {
      this.logger.error(error, 'loadPersistentContexts');
    }
  }

  /**
   * Save persistent contexts to localStorage
   */
  savePersistentContexts() {
    try {
      const persistentContexts = {};
      for (const [key, entry] of this.contexts) {
        if (entry.scope === ContextScopes.GLOBAL || entry.scope === ContextScopes.SESSION) {
          persistentContexts[key] = {
            key: entry.key,
            value: entry.value,
            type: entry.type,
            scope: entry.scope,
            timestamp: entry.timestamp,
            expiresAt: entry.expiresAt,
            accessCount: entry.accessCount,
            lastAccessed: entry.lastAccessed,
            metadata: entry.metadata
          };
        }
      }
      
      localStorage.setItem('ATELIER_PERSISTENT_CONTEXT', JSON.stringify(persistentContexts));
      this.logger.info(`Saved ${Object.keys(persistentContexts).length} persistent contexts`, 'savePersistentContexts');
    } catch (error) {
      this.logger.error(error, 'savePersistentContexts');
    }
  }

  /**
   * Start cleanup interval
   */
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupExpiredContexts();
    }, this.config.cleanupInterval);
  }

  /**
   * Initialize event handlers
   */
  initializeEventHandlers() {
    // Listen for task completion to preserve context
    eventBus.on('task-coordinator:state:changed', (data) => {
      if (data.newState === 'completed' || data.newState === 'failed') {
        this.preserveTaskContext(data.taskId, data.data);
      }
    });

    // Listen for workflow completion
    eventBus.on('orchestrator:workflow:completed', (data) => {
      this.preserveWorkflowContext(data.workflowId, data.result);
    });

    // Listen for connector operations
    eventBus.on('claude-connectors:operation:success', (data) => {
      this.preserveConnectorContext(data.connectorId, data.operation, data.result);
    });
  }

  /**
   * Set context entry
   */
  setContext(key, value, type = ContextTypes.SYSTEM_STATE, scope = ContextScopes.TASK, options = {}) {
    const entry = new ContextEntry(key, value, type, scope, options);
    
    // Check storage limits
    if (this.contexts.size >= this.config.maxEntries) {
      this.cleanupOldContexts();
    }
    
    this.contexts.set(key, entry);
    
    // Emit context change event
    eventBus.emit('context-manager:context:set', {
      key,
      type,
      scope,
      timestamp: entry.timestamp
    });
    
    // Save persistent contexts if needed
    if (scope === ContextScopes.GLOBAL || scope === ContextScopes.SESSION) {
      this.savePersistentContexts();
    }
    
    this.logger.debug(`Context set: ${key} (${type}:${scope})`, 'setContext');
    return entry;
  }

  /**
   * Get context entry
   */
  getContext(key, defaultValue = null) {
    const entry = this.contexts.get(key);
    
    if (!entry) {
      return defaultValue;
    }
    
    if (entry.isExpired()) {
      this.contexts.delete(key);
      return defaultValue;
    }
    
    entry.markAccessed();
    
    // Emit context access event
    eventBus.emit('context-manager:context:accessed', {
      key,
      type: entry.type,
      scope: entry.scope,
      accessCount: entry.accessCount
    });
    
    return entry.value;
  }

  /**
   * Get context entry with metadata
   */
  getContextEntry(key) {
    const entry = this.contexts.get(key);
    
    if (!entry || entry.isExpired()) {
      return null;
    }
    
    entry.markAccessed();
    return entry;
  }

  /**
   * Check if context exists
   */
  hasContext(key) {
    const entry = this.contexts.get(key);
    return entry && !entry.isExpired();
  }

  /**
   * Delete context entry
   */
  deleteContext(key) {
    const deleted = this.contexts.delete(key);
    
    if (deleted) {
      eventBus.emit('context-manager:context:deleted', { key });
      this.logger.debug(`Context deleted: ${key}`, 'deleteContext');
    }
    
    return deleted;
  }

  /**
   * Clear contexts by scope
   */
  clearScope(scope) {
    let deletedCount = 0;
    
    for (const [key, entry] of this.contexts) {
      if (entry.scope === scope) {
        this.contexts.delete(key);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      eventBus.emit('context-manager:scope:cleared', { scope, deletedCount });
      this.logger.info(`Cleared ${deletedCount} contexts from scope: ${scope}`, 'clearScope');
    }
    
    return deletedCount;
  }

  /**
   * Clear contexts by type
   */
  clearType(type) {
    let deletedCount = 0;
    
    for (const [key, entry] of this.contexts) {
      if (entry.type === type) {
        this.contexts.delete(key);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      eventBus.emit('context-manager:type:cleared', { type, deletedCount });
      this.logger.info(`Cleared ${deletedCount} contexts of type: ${type}`, 'clearType');
    }
    
    return deletedCount;
  }

  /**
   * Get contexts by scope
   */
  getContextsByScope(scope) {
    const contexts = {};
    
    for (const [key, entry] of this.contexts) {
      if (entry.scope === scope && !entry.isExpired()) {
        entry.markAccessed();
        contexts[key] = entry.value;
      }
    }
    
    return contexts;
  }

  /**
   * Get contexts by type
   */
  getContextsByType(type) {
    const contexts = {};
    
    for (const [key, entry] of this.contexts) {
      if (entry.type === type && !entry.isExpired()) {
        entry.markAccessed();
        contexts[key] = entry.value;
      }
    }
    
    return contexts;
  }

  /**
   * Preserve task context
   */
  preserveTaskContext(taskId, data) {
    const contextKey = `task_${taskId}`;
    this.setContext(
      contextKey,
      data,
      ContextTypes.EXECUTION_RESULT,
      ContextScopes.SESSION,
      {
        source: 'task-coordinator',
        ttl: this.config.defaultTtl
      }
    );
  }

  /**
   * Preserve workflow context
   */
  preserveWorkflowContext(workflowId, result) {
    const contextKey = `workflow_${workflowId}`;
    this.setContext(
      contextKey,
      result,
      ContextTypes.WORKFLOW_DATA,
      ContextScopes.SESSION,
      {
        source: 'orchestrator',
        ttl: this.config.defaultTtl
      }
    );
  }

  /**
   * Preserve connector context
   */
  preserveConnectorContext(connectorId, operation, result) {
    const contextKey = `connector_${connectorId}_${operation}`;
    this.setContext(
      contextKey,
      result,
      ContextTypes.EXECUTION_RESULT,
      ContextScopes.SESSION,
      {
        source: 'claude-connectors',
        ttl: this.config.defaultTtl
      }
    );
  }

  /**
   * Create context snapshot
   */
  createSnapshot(scope = null) {
    const snapshot = {
      timestamp: Date.now(),
      scope: scope || 'all',
      contexts: {}
    };
    
    for (const [key, entry] of this.contexts) {
      if (!scope || entry.scope === scope) {
        if (!entry.isExpired()) {
          snapshot.contexts[key] = {
            value: entry.value,
            type: entry.type,
            scope: entry.scope,
            timestamp: entry.timestamp,
            metadata: entry.metadata
          };
        }
      }
    }
    
    return snapshot;
  }

  /**
   * Restore from snapshot
   */
  restoreSnapshot(snapshot) {
    let restoredCount = 0;
    
    for (const [key, data] of Object.entries(snapshot.contexts)) {
      const entry = new ContextEntry(
        key,
        data.value,
        data.type,
        data.scope,
        data.metadata
      );
      entry.timestamp = data.timestamp;
      
      this.contexts.set(key, entry);
      restoredCount++;
    }
    
    this.logger.info(`Restored ${restoredCount} contexts from snapshot`, 'restoreSnapshot');
    return restoredCount;
  }

  /**
   * Cleanup expired contexts
   */
  cleanupExpiredContexts() {
    let deletedCount = 0;
    
    for (const [key, entry] of this.contexts) {
      if (entry.isExpired()) {
        this.contexts.delete(key);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      this.logger.info(`Cleaned up ${deletedCount} expired contexts`, 'cleanupExpiredContexts');
    }
    
    return deletedCount;
  }

  /**
   * Cleanup old contexts (LRU strategy)
   */
  cleanupOldContexts() {
    const entries = Array.from(this.contexts.entries());
    
    // Sort by last accessed time (oldest first)
    entries.sort((a, b) => (a[1].lastAccessed || 0) - (b[1].lastAccessed || 0));
    
    // Remove oldest 10% of entries
    const toRemove = Math.floor(entries.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.contexts.delete(entries[i][0]);
    }
    
    this.logger.info(`Cleaned up ${toRemove} old contexts`, 'cleanupOldContexts');
    return toRemove;
  }

  /**
   * Get context statistics
   */
  getStats() {
    const stats = {
      totalContexts: this.contexts.size,
      byScope: {},
      byType: {},
      memoryUsage: 0,
      oldestContext: null,
      newestContext: null
    };
    
    for (const [key, entry] of this.contexts) {
      // Count by scope
      stats.byScope[entry.scope] = (stats.byScope[entry.scope] || 0) + 1;
      
      // Count by type
      stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
      
      // Calculate memory usage (rough estimation)
      stats.memoryUsage += JSON.stringify(entry.value).length;
      
      // Track oldest/newest
      if (!stats.oldestContext || entry.timestamp < stats.oldestContext.timestamp) {
        stats.oldestContext = { key, timestamp: entry.timestamp };
      }
      if (!stats.newestContext || entry.timestamp > stats.newestContext.timestamp) {
        stats.newestContext = { key, timestamp: entry.timestamp };
      }
    }
    
    return stats;
  }

  /**
   * Health check
   */
  async healthCheck() {
    const stats = this.getStats();
    const isHealthy = stats.totalContexts < this.config.maxEntries;
    
    return {
      status: isHealthy ? 'healthy' : 'warning',
      totalContexts: stats.totalContexts,
      maxEntries: this.config.maxEntries,
      memoryUsage: stats.memoryUsage,
      utilizationRate: stats.totalContexts / this.config.maxEntries
    };
  }
}

// Create singleton instance
export const contextManager = new ContextManager();

// Make available for console debugging
if (typeof window !== 'undefined') {
  window.__contextManager = contextManager;
}

export default contextManager;