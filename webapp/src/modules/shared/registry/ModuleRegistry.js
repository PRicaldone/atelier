/**
 * Module Registry - Central hub for all module management
 * Provides loose coupling and safe module access
 */
import { moduleRegistryLogger } from '../monitoring/ModuleLogger.js';

class ModuleRegistry {
  constructor() {
    this.modules = new Map();
    this.adapters = new Map();
    this.contracts = new Map();
    this.initPromises = new Map();
    this.aiAgents = new Map();
    this.aiContracts = new Map();
    this.logger = moduleRegistryLogger;
  }

  /**
   * Register a module with optional adapter
   * @param {string} name - Module name
   * @param {Function|Object} moduleFactory - Module factory or instance
   * @param {Object} options - Registration options
   */
  register(name, moduleFactory, options = {}) {
    const { adapter, contract, aliases = [] } = options;
    
    // Store the module factory
    this.modules.set(name, moduleFactory);
    
    // Register aliases for backwards compatibility
    aliases.forEach(alias => {
      this.modules.set(alias, moduleFactory);
    });
    
    // Store adapter if provided
    if (adapter) {
      this.adapters.set(name, adapter);
      aliases.forEach(alias => {
        this.adapters.set(alias, adapter);
      });
    }
    
    // Store contract for validation
    if (contract) {
      this.contracts.set(name, contract);
    }
    
    this.logger.info(
      { message: `Registered module: ${name}`, aliases, hasAdapter: !!adapter, hasContract: !!contract },
      'register',
      { name, aliases, adapter: !!adapter, contract: !!contract }
    );
  }

  /**
   * Get a module instance (lazy initialization)
   * @param {string} name - Module name
   * @returns {Promise<any>} Module instance
   */
  async getModule(name) {
    if (!this.modules.has(name)) {
      this.logger.warning(`Module "${name}" not found`, 'getModule', { name });
      return null;
    }
    
    // Check if already initializing
    if (this.initPromises.has(name)) {
      return this.initPromises.get(name);
    }
    
    // Initialize module
    const moduleFactory = this.modules.get(name);
    const initPromise = this._initializeModule(name, moduleFactory);
    this.initPromises.set(name, initPromise);
    
    return initPromise;
  }

  /**
   * Get module adapter for safe cross-module communication
   * @param {string} name - Module name
   * @returns {Object|null} Module adapter
   */
  getAdapter(name) {
    return this.adapters.get(name) || null;
  }

  /**
   * Safe cross-module method invocation
   * @param {string} moduleName - Target module
   * @param {string} method - Method to invoke
   * @param  {...any} args - Method arguments
   * @returns {Promise<any>} Method result
   */
  async invoke(moduleName, method, ...args) {
    try {
      // Try adapter first (preferred)
      const adapter = this.getAdapter(moduleName);
      if (adapter && adapter[method]) {
        return await adapter[method](...args);
      }
      
      // Fallback to direct module access
      const module = await this.getModule(moduleName);
      if (!module || typeof module[method] !== 'function') {
        throw new Error(`Method "${method}" not found in module "${moduleName}"`);
      }
      
      return await module[method](...args);
    } catch (error) {
      this.logger.error(error, 'invoke', { moduleName, method, args: args.length });
      throw error;
    }
  }

  /**
   * Check if a module is registered
   * @param {string} name - Module name
   * @returns {boolean}
   */
  hasModule(name) {
    return this.modules.has(name);
  }

  /**
   * Register an AI agent
   * @param {string} name - Agent name
   * @param {Object} agent - AI agent instance
   * @param {Object} options - Registration options
   */
  registerAIAgent(name, agent, options = {}) {
    const { contract, aliases = [], capabilities = [] } = options;
    
    // Store the AI agent
    this.aiAgents.set(name, {
      instance: agent,
      capabilities,
      registeredAt: Date.now()
    });
    
    // Register aliases
    aliases.forEach(alias => {
      this.aiAgents.set(alias, this.aiAgents.get(name));
    });
    
    // Store contract for validation
    if (contract) {
      this.aiContracts.set(name, contract);
    }
    
    this.logger.info(
      { message: `Registered AI agent: ${name}`, aliases, capabilities, hasContract: !!contract },
      'registerAIAgent',
      { name, aliases, capabilities, contract: !!contract }
    );
  }

  /**
   * Get an AI agent
   * @param {string} name - Agent name
   * @returns {Object|null} AI agent instance
   */
  getAIAgent(name) {
    const agentInfo = this.aiAgents.get(name);
    return agentInfo ? agentInfo.instance : null;
  }

  /**
   * Check if an AI agent is registered
   * @param {string} name - Agent name
   * @returns {boolean}
   */
  hasAIAgent(name) {
    return this.aiAgents.has(name);
  }

  /**
   * Get AI agent capabilities
   * @param {string} name - Agent name
   * @returns {Array} Agent capabilities
   */
  getAIAgentCapabilities(name) {
    const agentInfo = this.aiAgents.get(name);
    return agentInfo ? agentInfo.capabilities : [];
  }

  /**
   * Invoke AI agent method with safety checks
   * @param {string} agentName - AI agent name
   * @param {string} method - Method to invoke
   * @param {...any} args - Method arguments
   * @returns {Promise<any>} Method result
   */
  async invokeAIAgent(agentName, method, ...args) {
    try {
      const agent = this.getAIAgent(agentName);
      if (!agent) {
        throw new Error(`AI agent "${agentName}" not found`);
      }

      if (typeof agent[method] !== 'function') {
        throw new Error(`Method "${method}" not found in AI agent "${agentName}"`);
      }

      // Validate against contract if exists
      const contract = this.aiContracts.get(agentName);
      if (contract && contract.methods && !contract.methods.includes(method)) {
        throw new Error(`Method "${method}" not allowed by AI agent contract`);
      }

      this.logger.info(
        { message: `Invoking AI agent method: ${agentName}.${method}` },
        'invokeAIAgent',
        { agentName, method, argsCount: args.length }
      );

      return await agent[method](...args);
    } catch (error) {
      this.logger.error(error, 'invokeAIAgent', { agentName, method, args: args.length });
      throw error;
    }
  }

  /**
   * Clear all modules and AI agents (useful for testing)
   */
  clear() {
    this.modules.clear();
    this.adapters.clear();
    this.contracts.clear();
    this.initPromises.clear();
    this.aiAgents.clear();
    this.aiContracts.clear();
  }

  /**
   * Private: Initialize a module
   * @private
   */
  async _initializeModule(name, moduleFactory) {
    try {
      let module;
      
      // Handle different module types
      if (typeof moduleFactory === 'function') {
        // Factory function
        module = await moduleFactory();
      } else if (typeof moduleFactory === 'object' && moduleFactory.default) {
        // ES module
        module = moduleFactory.default;
      } else {
        // Direct object
        module = moduleFactory;
      }
      
      // Validate against contract if exists
      const contract = this.contracts.get(name);
      if (contract) {
        this._validateContract(name, module, contract);
      }
      
      return module;
    } catch (error) {
      this.logger.error(error, '_initializeModule', { name, moduleFactory: typeof moduleFactory });
      throw error;
    }
  }

  /**
   * Private: Validate module against contract
   * @private
   */
  _validateContract(name, module, contract) {
    const missing = [];
    
    // Check required methods
    if (contract.methods) {
      contract.methods.forEach(method => {
        if (typeof module[method] !== 'function') {
          missing.push(`method: ${method}`);
        }
      });
    }
    
    // Check required properties
    if (contract.properties) {
      contract.properties.forEach(prop => {
        if (!(prop in module)) {
          missing.push(`property: ${prop}`);
        }
      });
    }
    
    if (missing.length > 0) {
      const error = new Error(
        `Module "${name}" does not fulfill contract. Missing: ${missing.join(', ')}`
      );
      this.logger.error(error, '_validateContract', { name, missing, contract });
      throw error;
    }
  }

  /**
   * Get module info for debugging
   */
  getInfo() {
    return {
      registeredModules: Array.from(this.modules.keys()),
      adapters: Array.from(this.adapters.keys()),
      contracts: Array.from(this.contracts.keys()),
      initialized: Array.from(this.initPromises.keys()),
      aiAgents: Array.from(this.aiAgents.keys()),
      aiContracts: Array.from(this.aiContracts.keys())
    };
  }
}

// Create singleton instance
export const moduleRegistry = new ModuleRegistry();

// Register intelligence system adapters
const registerIntelligenceSystem = async () => {
  try {
    // Register TaskCoordinator
    const { taskCoordinator } = await import('../intelligence/TaskCoordinator.js');
    moduleRegistry.register('task-coordinator', taskCoordinator, {
      adapter: taskCoordinator,
      aliases: ['intelligence-coordinator', 'task-router']
    });

    // Register ClaudeConnectorsAdapter
    const { claudeConnectorsAdapter } = await import('../intelligence/ClaudeConnectorsAdapter.js');
    moduleRegistry.register('claude-connectors', claudeConnectorsAdapter, {
      adapter: claudeConnectorsAdapter,
      aliases: ['connectors', 'claude-plugins']
    });

    // Register OrchestratorAdapter
    const { orchestratorAdapter } = await import('../intelligence/OrchestratorAdapter.js');
    moduleRegistry.register('orchestrator', orchestratorAdapter, {
      adapter: orchestratorAdapter,
      aliases: ['workflow-orchestrator', 'workflow-engine']
    });

    // Register TaskAnalyzer
    const { taskAnalyzer } = await import('../intelligence/TaskAnalyzer.js');
    moduleRegistry.register('task-analyzer', taskAnalyzer, {
      adapter: taskAnalyzer,
      aliases: ['complexity-analyzer', 'request-analyzer']
    });

    // Register ContextManager
    const { contextManager } = await import('../intelligence/ContextManager.js');
    moduleRegistry.register('context-manager', contextManager, {
      adapter: contextManager,
      aliases: ['context', 'session-manager']
    });

    moduleRegistry.logger.info('Intelligence system registered successfully', 'registerIntelligenceSystem');
  } catch (error) {
    moduleRegistry.logger.error(error, 'registerIntelligenceSystem');
  }
};

// Register AI agents
const registerAIAgents = async () => {
  try {
    // Register SuperClaude AI Agent
    const { superClaudeAgent } = await import('../ai/agents/SuperClaudeAgent.js');
    moduleRegistry.registerAIAgent('superclaude', superClaudeAgent, {
      aliases: ['ai-agent', 'claude-ai', 'board-generator'],
      capabilities: [
        'board_generation',
        'content_analysis',
        'workflow_automation',
        'content_generation',
        'knowledge_organization',
        'connection_suggestions'
      ],
      contract: {
        methods: [
          'generateBoard',
          'analyzeContent',
          'generateWorkflow',
          'getStats',
          'reset'
        ]
      }
    });

    moduleRegistry.logger.info('AI agents registered successfully', 'registerAIAgents');
  } catch (error) {
    moduleRegistry.logger.error(error, 'registerAIAgents');
  }
};

// Auto-register intelligence system and AI agents on load
registerIntelligenceSystem();
registerAIAgents();

// For debugging in console
if (typeof window !== 'undefined') {
  window.__moduleRegistry = moduleRegistry;
}

export default moduleRegistry;