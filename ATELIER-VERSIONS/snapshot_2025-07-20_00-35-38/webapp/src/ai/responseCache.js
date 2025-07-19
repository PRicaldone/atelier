/**
 * Mind Garden v5.1 - Advanced AI Response Caching System
 * Day 4: Intelligent caching with context awareness and prediction
 */

export class ResponseCache {
  constructor(maxSize = 100, ttl = 60 * 60 * 1000) { // 1 hour TTL
    this.cache = new Map();
    this.accessTimes = new Map();
    this.hitCounts = new Map();
    this.contextIndex = new Map(); // Context-based indexing
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      contextualHits: 0
    };
  }

  /**
   * Generate intelligent cache key based on prompt and context
   */
  generateCacheKey(prompt, parentChain = [], conversationFocus = 'creative') {
    // Create a context fingerprint
    const contextFingerprint = this.createContextFingerprint(parentChain);
    
    // Normalize prompt for better cache hits
    const normalizedPrompt = this.normalizePrompt(prompt);
    
    // Create composite key
    const compositeKey = `${conversationFocus}:${contextFingerprint}:${normalizedPrompt}`;
    
    return this.hashKey(compositeKey);
  }

  /**
   * Create context fingerprint for similar conversation patterns
   */
  createContextFingerprint(parentChain) {
    if (!parentChain || parentChain.length === 0) {
      return 'root';
    }

    // Extract key patterns from parent chain
    const patterns = {
      depth: parentChain.length,
      branches: parentChain.map(node => node.branch || 'exploration'),
      topics: this.extractKeyTopics(parentChain),
      sentiment: this.calculateChainSentiment(parentChain)
    };

    // Create fingerprint
    const fingerprint = [
      `d${patterns.depth}`,
      `b${patterns.branches.slice(-2).join('')}`, // Last 2 branches
      `t${patterns.topics.slice(0, 2).join('')}`, // Top 2 topics
      `s${patterns.sentiment}`
    ].join('_');

    return fingerprint;
  }

  /**
   * Normalize prompt for better cache matching
   */
  normalizePrompt(prompt) {
    return prompt
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 200); // Limit length
  }

  /**
   * Hash key for storage efficiency
   */
  hashKey(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Store response with intelligent metadata
   */
  set(prompt, parentChain, conversationFocus, response, metadata = {}) {
    const key = this.generateCacheKey(prompt, parentChain, conversationFocus);
    
    // Check if we need to evict items
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUseful();
    }

    const cacheEntry = {
      response,
      metadata: {
        ...metadata,
        timestamp: Date.now(),
        contextDepth: parentChain?.length || 0,
        conversationFocus,
        originalPrompt: prompt,
        parentChainSize: parentChain?.length || 0
      },
      accessCount: 0,
      lastAccessed: Date.now()
    };

    this.cache.set(key, cacheEntry);
    this.accessTimes.set(key, Date.now());
    this.hitCounts.set(key, 0);
    
    // Update context index for semantic search
    this.updateContextIndex(key, prompt, parentChain, conversationFocus);

    return key;
  }

  /**
   * Retrieve response with fuzzy matching
   */
  get(prompt, parentChain, conversationFocus) {
    const primaryKey = this.generateCacheKey(prompt, parentChain, conversationFocus);
    
    // Try exact match first
    if (this.cache.has(primaryKey)) {
      const entry = this.cache.get(primaryKey);
      if (!this.isExpired(entry)) {
        this.recordHit(primaryKey);
        this.stats.hits++;
        return {
          ...entry,
          cacheHit: 'exact',
          confidence: 1.0
        };
      } else {
        this.cache.delete(primaryKey);
      }
    }

    // Try contextual matching
    const contextualMatch = this.findContextualMatch(prompt, parentChain, conversationFocus);
    if (contextualMatch) {
      this.stats.contextualHits++;
      return {
        ...contextualMatch,
        cacheHit: 'contextual',
        confidence: contextualMatch.similarity
      };
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Find similar cached responses based on context
   */
  findContextualMatch(prompt, parentChain, conversationFocus) {
    const normalizedPrompt = this.normalizePrompt(prompt);
    const currentFingerprint = this.createContextFingerprint(parentChain);
    
    let bestMatch = null;
    let bestSimilarity = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        continue;
      }

      // Check conversation focus match
      if (entry.metadata.conversationFocus !== conversationFocus) {
        continue;
      }

      // Calculate prompt similarity
      const normalizedCached = this.normalizePrompt(entry.metadata.originalPrompt);
      const promptSimilarity = this.calculateTextSimilarity(normalizedPrompt, normalizedCached);
      
      // Calculate context similarity
      const contextSimilarity = this.calculateContextSimilarity(
        currentFingerprint,
        this.createContextFingerprint(entry.metadata.parentChain || [])
      );

      // Combined similarity score
      const overallSimilarity = (promptSimilarity * 0.7) + (contextSimilarity * 0.3);

      if (overallSimilarity > bestSimilarity && overallSimilarity > 0.6) { // Threshold for contextual match
        bestMatch = {
          ...entry,
          similarity: overallSimilarity,
          matchReason: `Prompt: ${Math.round(promptSimilarity * 100)}%, Context: ${Math.round(contextSimilarity * 100)}%`
        };
        bestSimilarity = overallSimilarity;
      }
    }

    if (bestMatch) {
      this.recordHit(this.findKeyByEntry(bestMatch));
    }

    return bestMatch;
  }

  /**
   * Calculate text similarity using simple word overlap
   */
  calculateTextSimilarity(text1, text2) {
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size; // Jaccard similarity
  }

  /**
   * Calculate context similarity based on fingerprints
   */
  calculateContextSimilarity(fingerprint1, fingerprint2) {
    if (fingerprint1 === fingerprint2) return 1.0;
    
    const parts1 = fingerprint1.split('_');
    const parts2 = fingerprint2.split('_');
    
    let matches = 0;
    const totalParts = Math.max(parts1.length, parts2.length);
    
    for (let i = 0; i < Math.min(parts1.length, parts2.length); i++) {
      if (parts1[i] === parts2[i]) {
        matches++;
      } else if (parts1[i].charAt(0) === parts2[i].charAt(0)) {
        // Same category, different value
        matches += 0.5;
      }
    }
    
    return matches / totalParts;
  }

  /**
   * Evict least useful cache entries
   */
  evictLeastUseful() {
    let leastUsefulKey = null;
    let lowestScore = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      // Calculate usefulness score
      const age = Date.now() - entry.lastAccessed;
      const hitCount = this.hitCounts.get(key) || 0;
      const recency = Math.max(0, this.ttl - age) / this.ttl;
      
      // Lower score = less useful
      const usefulnessScore = (hitCount + 1) * recency;
      
      if (usefulnessScore < lowestScore) {
        lowestScore = usefulnessScore;
        leastUsefulKey = key;
      }
    }

    if (leastUsefulKey) {
      this.cache.delete(leastUsefulKey);
      this.accessTimes.delete(leastUsefulKey);
      this.hitCounts.delete(leastUsefulKey);
      this.stats.evictions++;
    }
  }

  /**
   * Record cache hit and update statistics
   */
  recordHit(key) {
    if (this.cache.has(key)) {
      const entry = this.cache.get(key);
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      this.hitCounts.set(key, (this.hitCounts.get(key) || 0) + 1);
    }
  }

  /**
   * Check if cache entry has expired
   */
  isExpired(entry) {
    return Date.now() - entry.metadata.timestamp > this.ttl;
  }

  /**
   * Update context index for semantic search
   */
  updateContextIndex(key, prompt, parentChain, conversationFocus) {
    const topics = this.extractKeyTopics([{ prompt, aiResponse: '' }]);
    
    topics.forEach(topic => {
      if (!this.contextIndex.has(topic)) {
        this.contextIndex.set(topic, new Set());
      }
      this.contextIndex.get(topic).add(key);
    });
  }

  /**
   * Extract key topics from conversation
   */
  extractKeyTopics(nodes) {
    const allText = nodes
      .map(node => `${node.prompt || ''} ${node.aiResponse || ''}`)
      .join(' ')
      .toLowerCase();

    // Simple keyword extraction
    const words = allText
      .split(/\s+/)
      .filter(word => word.length > 4)
      .filter(word => !/^(the|and|that|this|with|from|they|have|been|were|said|each|which|their|could|should|would)$/.test(word));

    // Count word frequency
    const wordCounts = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    // Return top words
    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Calculate sentiment for context fingerprinting
   */
  calculateChainSentiment(parentChain) {
    const allText = parentChain
      .map(node => `${node.prompt || ''} ${node.aiResponse || ''}`)
      .join(' ')
      .toLowerCase();

    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'problem', 'issue'];

    let sentiment = 0;
    positiveWords.forEach(word => {
      sentiment += (allText.split(word).length - 1);
    });
    negativeWords.forEach(word => {
      sentiment -= (allText.split(word).length - 1);
    });

    if (sentiment > 0) return 'pos';
    if (sentiment < 0) return 'neg';
    return 'neu';
  }

  /**
   * Find cache key by entry (helper method)
   */
  findKeyByEntry(targetEntry) {
    for (const [key, entry] of this.cache.entries()) {
      if (entry === targetEntry) return key;
    }
    return null;
  }

  /**
   * Predict likely next prompts based on cache patterns
   */
  predictNextPrompts(currentPrompt, parentChain, conversationFocus) {
    const predictions = [];
    const currentFingerprint = this.createContextFingerprint(parentChain);
    
    // Find similar conversation patterns
    const similarPatterns = [];
    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata.conversationFocus === conversationFocus) {
        const similarity = this.calculateContextSimilarity(
          currentFingerprint,
          this.createContextFingerprint(entry.metadata.parentChain || [])
        );
        
        if (similarity > 0.5) {
          similarPatterns.push({
            entry,
            similarity,
            nextPrompt: this.inferNextPrompt(entry)
          });
        }
      }
    }

    // Sort by similarity and extract predictions
    return similarPatterns
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map(pattern => ({
        prompt: pattern.nextPrompt,
        confidence: pattern.similarity,
        reasoning: 'Based on similar conversation patterns'
      }))
      .filter(prediction => prediction.prompt);
  }

  /**
   * Infer what might come next based on cached entry
   */
  inferNextPrompt(entry) {
    // This is a simplified heuristic - in a real system, this would be more sophisticated
    const response = entry.response;
    
    if (response.includes('how') || response.includes('How')) {
      return 'How would we implement this?';
    }
    if (response.includes('consider') || response.includes('explore')) {
      return 'What alternatives should we consider?';
    }
    if (response.includes('problem') || response.includes('challenge')) {
      return 'How can we overcome these challenges?';
    }
    
    return null;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    const contextualHitRate = this.stats.hits > 0 ? (this.stats.contextualHits / this.stats.hits) * 100 : 0;

    return {
      ...this.stats,
      totalRequests,
      hitRate: Math.round(hitRate),
      contextualHitRate: Math.round(contextualHitRate),
      cacheSize: this.cache.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Estimate memory usage
   */
  estimateMemoryUsage() {
    let totalSize = 0;
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length * 2; // UTF-16 chars
      totalSize += JSON.stringify(entry).length * 2;
    }
    return Math.round(totalSize / 1024); // KB
  }

  /**
   * Clear expired entries
   */
  cleanup() {
    const before = this.cache.size;
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        this.accessTimes.delete(key);
        this.hitCounts.delete(key);
      }
    }
    const cleaned = before - this.cache.size;
    return { cleaned, remaining: this.cache.size };
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.accessTimes.clear();
    this.hitCounts.clear();
    this.contextIndex.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      contextualHits: 0
    };
  }

  /**
   * Export cache for persistence
   */
  export() {
    return {
      cache: Array.from(this.cache.entries()),
      accessTimes: Array.from(this.accessTimes.entries()),
      hitCounts: Array.from(this.hitCounts.entries()),
      stats: this.stats,
      timestamp: Date.now()
    };
  }

  /**
   * Import cache from persistence
   */
  import(data) {
    if (!data || !data.cache) return false;
    
    try {
      this.cache = new Map(data.cache);
      this.accessTimes = new Map(data.accessTimes || []);
      this.hitCounts = new Map(data.hitCounts || []);
      this.stats = data.stats || this.stats;
      
      // Rebuild context index
      this.contextIndex.clear();
      for (const [key, entry] of this.cache.entries()) {
        this.updateContextIndex(
          key,
          entry.metadata.originalPrompt,
          entry.metadata.parentChain,
          entry.metadata.conversationFocus
        );
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import cache:', error);
      return false;
    }
  }
}

export default ResponseCache;