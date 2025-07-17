/**
 * Ideas Module - Type Definitions
 * 
 * Professional-grade type system for Ideas & Commercial Roadmap Module
 * Integrated with Atelier's enterprise architecture
 */

// Idea Status Lifecycle
export const IdeaStatus = {
  BRAINSTORMING: 'brainstorming',
  TO_VALIDATE: 'to-validate', 
  PLANNED: 'planned',
  ROADMAP: 'roadmap',
  IN_PROGRESS: 'in-progress',
  IMPLEMENTED: 'implemented',
  DISCARDED: 'discarded'
};

// Idea Categories
export const IdeaCategory = {
  FEATURE: 'feature',
  PRICING: 'pricing', 
  STRATEGY: 'strategy',
  UX: 'UX',
  INTEGRATION: 'integration',
  MISC: 'misc'
};

// Priority Levels
export const IdeaPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Source of Idea
export const IdeaSource = {
  USER: 'user',
  AI: 'ai',
  ANALYTICS: 'analytics',
  FEEDBACK: 'feedback',
  BRAINSTORM: 'brainstorm'
};

/**
 * Core Idea Object Structure
 * @typedef {Object} AtelierIdea
 * @property {string} id - Unique identifier (format: idea-YYYY-MM-DD-XXX)
 * @property {string} title - Short descriptive title
 * @property {string} description - Detailed description
 * @property {string} category - Category from IdeaCategory
 * @property {string} status - Current status from IdeaStatus
 * @property {string} priority - Priority level from IdeaPriority
 * @property {string} author - Creator of the idea
 * @property {string} source - Source type from IdeaSource
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 * @property {string[]} relatedModules - Associated Atelier modules
 * @property {string} notes - Additional notes and context
 * @property {number} votes - Community votes/interest score
 * @property {Object} metadata - Additional structured metadata
 * @property {string[]} tags - Free-form tags for organization
 * @property {Object} roiMetrics - ROI estimation and tracking
 * @property {boolean} archived - Soft delete flag
 */

// Status transition validation rules
export const StatusTransitions = {
  [IdeaStatus.BRAINSTORMING]: [IdeaStatus.TO_VALIDATE, IdeaStatus.DISCARDED],
  [IdeaStatus.TO_VALIDATE]: [IdeaStatus.PLANNED, IdeaStatus.BRAINSTORMING, IdeaStatus.DISCARDED],
  [IdeaStatus.PLANNED]: [IdeaStatus.ROADMAP, IdeaStatus.TO_VALIDATE, IdeaStatus.DISCARDED],
  [IdeaStatus.ROADMAP]: [IdeaStatus.IN_PROGRESS, IdeaStatus.PLANNED],
  [IdeaStatus.IN_PROGRESS]: [IdeaStatus.IMPLEMENTED, IdeaStatus.ROADMAP],
  [IdeaStatus.IMPLEMENTED]: [], // Terminal state
  [IdeaStatus.DISCARDED]: [IdeaStatus.BRAINSTORMING] // Can resurrect ideas
};

// Category colors for UI
export const CategoryColors = {
  [IdeaCategory.FEATURE]: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  [IdeaCategory.PRICING]: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  [IdeaCategory.STRATEGY]: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  [IdeaCategory.UX]: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
  [IdeaCategory.INTEGRATION]: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  [IdeaCategory.MISC]: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' }
};

// Status colors for UI
export const StatusColors = {
  [IdeaStatus.BRAINSTORMING]: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  [IdeaStatus.TO_VALIDATE]: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  [IdeaStatus.PLANNED]: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
  [IdeaStatus.ROADMAP]: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  [IdeaStatus.IN_PROGRESS]: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  [IdeaStatus.IMPLEMENTED]: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  [IdeaStatus.DISCARDED]: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }
};

// Export filters and sorting options
export const FilterOptions = {
  status: Object.values(IdeaStatus),
  category: Object.values(IdeaCategory),
  priority: Object.values(IdeaPriority),
  source: Object.values(IdeaSource),
  modules: ['scriptorium', 'mind-garden', 'orchestra', 'analytics', 'intelligence']
};

export const SortOptions = {
  CREATED_DATE: 'createdAt',
  UPDATED_DATE: 'updatedAt', 
  TITLE: 'title',
  PRIORITY: 'priority',
  VOTES: 'votes',
  STATUS: 'status'
};

// Default idea template
export const createIdeaTemplate = (overrides = {}) => ({
  id: `idea-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substr(2, 3)}`,
  title: '',
  description: '',
  category: IdeaCategory.MISC,
  status: IdeaStatus.BRAINSTORMING,
  priority: IdeaPriority.MEDIUM,
  author: 'System',
  source: IdeaSource.USER,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  relatedModules: [],
  notes: '',
  votes: 0,
  metadata: {},
  tags: [],
  roiMetrics: {
    estimatedTimeSaved: 0,
    implementationCost: 0,
    confidenceScore: 0
  },
  archived: false,
  ...overrides
});

// Event types for EventBus integration
export const IdeasEvents = {
  IDEA_CREATED: 'ideas:idea:created',
  IDEA_UPDATED: 'ideas:idea:updated', 
  IDEA_STATUS_CHANGED: 'ideas:idea:status:changed',
  IDEA_DELETED: 'ideas:idea:deleted',
  IDEA_ARCHIVED: 'ideas:idea:archived',
  IDEAS_BULK_UPDATE: 'ideas:bulk:update',
  IDEAS_EXPORTED: 'ideas:exported'
};

export default {
  IdeaStatus,
  IdeaCategory,
  IdeaPriority,
  IdeaSource,
  StatusTransitions,
  CategoryColors,
  StatusColors,
  FilterOptions,
  SortOptions,
  createIdeaTemplate,
  IdeasEvents
};