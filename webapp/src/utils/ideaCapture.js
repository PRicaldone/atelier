/**
 * Idea Capture Utility
 * Allows programmatic addition of ideas to the Ideas module
 */

import { useIdeasStore } from '../modules/ideas/store.js';
import { IdeaCategory, IdeaPriority, IdeaSource } from '../modules/ideas/types.js';

/**
 * Add business model idea to Ideas module
 * @param {string} title - Idea title
 * @param {string} description - Detailed description
 * @param {object} options - Additional options
 */
export function addBusinessModelIdea(title, description, options = {}) {
  const ideaData = {
    title,
    description,
    category: IdeaCategory.PRICING,
    priority: options.priority || IdeaPriority.HIGH,
    source: IdeaSource.BRAINSTORM,
    tags: ['business-model', 'monetization', ...(options.tags || [])],
    relatedModules: options.relatedModules || [],
    metadata: {
      type: 'business-model',
      discussionContext: 'Strategic planning session',
      ...options.metadata
    }
  };

  // Get store instance and add idea
  const store = useIdeasStore.getState();
  store.addIdea(ideaData);
  
  console.log('💡 Business model idea added to Ideas module:', title);
  return ideaData;
}

/**
 * Add development idea to Ideas module
 * @param {string} title - Idea title
 * @param {string} description - Detailed description
 * @param {object} options - Additional options
 */
export function addDevelopmentIdea(title, description, options = {}) {
  const ideaData = {
    title,
    description,
    category: options.category || IdeaCategory.FEATURE,
    priority: options.priority || IdeaPriority.MEDIUM,
    source: IdeaSource.BRAINSTORM,
    tags: ['development', ...(options.tags || [])],
    relatedModules: options.relatedModules || [],
    metadata: {
      type: 'development',
      ...options.metadata
    }
  };

  const store = useIdeasStore.getState();
  store.addIdea(ideaData);
  
  console.log('💡 Development idea added to Ideas module:', title);
  return ideaData;
}

/**
 * Add strategic idea to Ideas module
 * @param {string} title - Idea title
 * @param {string} description - Detailed description
 * @param {object} options - Additional options
 */
export function addStrategicIdea(title, description, options = {}) {
  const ideaData = {
    title,
    description,
    category: IdeaCategory.STRATEGY,
    priority: options.priority || IdeaPriority.HIGH,
    source: IdeaSource.BRAINSTORM,
    tags: ['strategy', ...(options.tags || [])],
    relatedModules: options.relatedModules || [],
    metadata: {
      type: 'strategic',
      ...options.metadata
    }
  };

  const store = useIdeasStore.getState();
  store.addIdea(ideaData);
  
  console.log('💡 Strategic idea added to Ideas module:', title);
  return ideaData;
}

export default {
  addBusinessModelIdea,
  addDevelopmentIdea,
  addStrategicIdea
};