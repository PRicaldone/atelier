/**
 * Mind Garden v5.1 - Advanced Topic Extraction System
 * Day 4: Semantic topic modeling and conversation categorization
 */

export class TopicExtractor {
  constructor() {
    this.domainVocabulary = this.initializeDomainVocabulary();
    this.stopWords = this.initializeStopWords();
    this.conceptPatterns = this.initializeConceptPatterns();
    this.topicClusters = this.initializeTopicClusters();
    this.extractionRules = this.initializeExtractionRules();
  }

  /**
   * Initialize domain-specific vocabulary for better topic extraction
   */
  initializeDomainVocabulary() {
    return {
      creative: {
        primary: ['art', 'design', 'creative', 'visual', 'aesthetic', 'style', 'concept', 'inspiration', 'mood', 'theme', 'composition', 'color', 'texture', 'form', 'beauty', 'artistic', 'imagery', 'symbolic'],
        modifiers: ['bold', 'subtle', 'dramatic', 'minimalist', 'complex', 'simple', 'organic', 'geometric'],
        processes: ['brainstorm', 'ideate', 'conceptualize', 'visualize', 'sketch', 'prototype', 'iterate'],
        weight: 1.5
      },
      
      technical: {
        primary: ['code', 'system', 'architecture', 'implementation', 'framework', 'technology', 'software', 'hardware', 'database', 'algorithm', 'performance', 'optimization', 'security', 'scalability'],
        modifiers: ['efficient', 'robust', 'scalable', 'maintainable', 'distributed', 'modular', 'lightweight'],
        processes: ['develop', 'implement', 'deploy', 'configure', 'optimize', 'debug', 'test', 'integrate'],
        weight: 1.8
      },
      
      business: {
        primary: ['strategy', 'market', 'customer', 'product', 'revenue', 'growth', 'competition', 'brand', 'value', 'opportunity', 'risk', 'investment', 'profit', 'business', 'commercial'],
        modifiers: ['strategic', 'competitive', 'profitable', 'sustainable', 'innovative', 'disruptive'],
        processes: ['analyze', 'plan', 'execute', 'measure', 'optimize', 'scale', 'pivot', 'launch'],
        weight: 1.3
      },
      
      academic: {
        primary: ['research', 'study', 'analysis', 'theory', 'hypothesis', 'methodology', 'data', 'evidence', 'conclusion', 'literature', 'academic', 'scientific', 'scholarly'],
        modifiers: ['empirical', 'theoretical', 'quantitative', 'qualitative', 'systematic', 'rigorous'],
        processes: ['investigate', 'examine', 'evaluate', 'compare', 'synthesize', 'critique', 'validate'],
        weight: 1.4
      }
    };
  }

  /**
   * Initialize comprehensive stop words list
   */
  initializeStopWords() {
    return new Set([
      // Common stop words
      'the', 'and', 'that', 'this', 'with', 'from', 'they', 'have', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'would', 'there', 'could', 'other', 'after', 'first', 'well', 'also', 'through', 'much', 'before', 'too', 'very', 'still', 'back', 'good', 'because', 'does', 'most', 'know', 'get', 'here', 'where', 'much', 'some', 'what', 'see', 'him', 'two', 'how', 'its', 'our', 'out', 'day', 'way', 'she', 'may', 'say', 'her', 'use', 'all', 'one', 'now', 'only', 'think', 'come', 'make', 'like', 'into', 'than', 'more', 'many', 'can', 'had', 'has',
      // Conversation fillers
      'really', 'actually', 'basically', 'literally', 'definitely', 'probably', 'maybe', 'perhaps', 'seems', 'appears', 'looks', 'sounds', 'feels', 'kind', 'sort', 'type', 'thing', 'stuff', 'quite', 'rather', 'pretty', 'fairly'
    ]);
  }

  /**
   * Initialize concept extraction patterns
   */
  initializeConceptPatterns() {
    return {
      // Noun phrase patterns
      nounPhrases: [
        /([A-Z][a-z]+ [A-Z][a-z]+)/g, // Title Case phrases
        /([a-z]+ [a-z]+ [a-z]+)/g,    // Three-word phrases
        /([a-z]+ [a-z]+)/g            // Two-word phrases
      ],
      
      // Technical concepts
      technicalTerms: [
        /([a-z]+[A-Z][a-z]*)/g,       // camelCase
        /([a-z]+_[a-z]+)/g,           // snake_case
        /([a-z]+-[a-z]+)/g,           // kebab-case
        /([A-Z]{2,})/g                // ACRONYMS
      ],
      
      // Domain-specific patterns
      creativeTerms: [
        /(color\s+\w+)/gi,
        /(design\s+\w+)/gi,
        /(style\s+\w+)/gi,
        /(art\s+\w+)/gi
      ],
      
      // Process-oriented concepts
      processes: [
        /(how\s+to\s+\w+)/gi,
        /(steps\s+to\s+\w+)/gi,
        /(process\s+of\s+\w+)/gi,
        /(method\s+for\s+\w+)/gi
      ]
    };
  }

  /**
   * Initialize topic clustering categories
   */
  initializeTopicClusters() {
    return {
      tools: ['tool', 'software', 'platform', 'framework', 'library', 'application', 'system'],
      methods: ['method', 'approach', 'technique', 'strategy', 'process', 'procedure', 'workflow'],
      concepts: ['concept', 'idea', 'theory', 'principle', 'notion', 'perspective', 'viewpoint'],
      objects: ['object', 'element', 'component', 'part', 'piece', 'item', 'entity'],
      outcomes: ['result', 'outcome', 'output', 'product', 'deliverable', 'achievement', 'goal'],
      qualities: ['quality', 'characteristic', 'feature', 'attribute', 'property', 'trait', 'aspect']
    };
  }

  /**
   * Initialize topic extraction rules
   */
  initializeExtractionRules() {
    return {
      // Minimum word length for consideration
      minWordLength: 3,
      
      // Maximum phrase length
      maxPhraseLength: 4,
      
      // Minimum frequency for topic consideration
      minFrequency: 2,
      
      // Context window for phrase extraction
      contextWindow: 5,
      
      // Topic confidence thresholds
      confidenceThresholds: {
        high: 0.8,
        medium: 0.6,
        low: 0.4
      },
      
      // Maximum topics to extract
      maxTopics: 10
    };
  }

  /**
   * Main topic extraction method with advanced semantics
   */
  extractTopics(conversationHistory, options = {}) {
    const {
      maxTopics = this.extractionRules.maxTopics,
      includePhrases = true,
      includeContextual = true,
      minConfidence = this.extractionRules.confidenceThresholds.low
    } = options;

    if (!conversationHistory || conversationHistory.length === 0) {
      return [];
    }

    // Prepare text corpus
    const corpus = this.prepareCorpus(conversationHistory);
    
    // Extract different types of topics
    const extractedTopics = new Map();
    
    // 1. Extract single-word topics
    const singleWords = this.extractSingleWordTopics(corpus);
    this.mergeTopics(extractedTopics, singleWords);
    
    // 2. Extract phrase-based topics
    if (includePhrases) {
      const phrases = this.extractPhraseTopics(corpus);
      this.mergeTopics(extractedTopics, phrases);
    }
    
    // 3. Extract domain-specific topics
    const domainTopics = this.extractDomainSpecificTopics(corpus);
    this.mergeTopics(extractedTopics, domainTopics);
    
    // 4. Extract contextual topics
    if (includeContextual) {
      const contextualTopics = this.extractContextualTopics(conversationHistory);
      this.mergeTopics(extractedTopics, contextualTopics);
    }
    
    // 5. Calculate topic relationships and clusters
    const clusteredTopics = this.clusterRelatedTopics(extractedTopics);
    
    // 6. Score and rank topics
    const rankedTopics = this.scoreAndRankTopics(clusteredTopics, corpus);
    
    // 7. Filter by confidence and return top topics
    return rankedTopics
      .filter(topic => topic.confidence >= minConfidence)
      .slice(0, maxTopics);
  }

  /**
   * Prepare text corpus for analysis
   */
  prepareCorpus(conversationHistory) {
    const texts = conversationHistory.map(node => 
      `${node.prompt || ''} ${node.aiResponse || ''}`
    );
    
    return {
      raw: texts.join(' '),
      sentences: this.splitIntoSentences(texts.join(' ')),
      words: this.tokenizeAndClean(texts.join(' ')),
      nodes: conversationHistory.map((node, index) => ({
        ...node,
        index,
        text: `${node.prompt || ''} ${node.aiResponse || ''}`,
        words: this.tokenizeAndClean(`${node.prompt || ''} ${node.aiResponse || ''}`)
      }))
    };
  }

  /**
   * Extract single-word topics with frequency analysis
   */
  extractSingleWordTopics(corpus) {
    const wordFrequency = new Map();
    
    corpus.words.forEach(word => {
      if (!this.stopWords.has(word.toLowerCase()) && 
          word.length >= this.extractionRules.minWordLength) {
        const normalized = word.toLowerCase();
        wordFrequency.set(normalized, (wordFrequency.get(normalized) || 0) + 1);
      }
    });
    
    const topics = new Map();
    
    for (const [word, frequency] of wordFrequency.entries()) {
      if (frequency >= this.extractionRules.minFrequency) {
        topics.set(word, {
          text: word,
          type: 'single_word',
          frequency,
          weight: frequency,
          domain: this.identifyWordDomain(word),
          positions: this.findWordPositions(word, corpus.words)
        });
      }
    }
    
    return topics;
  }

  /**
   * Extract phrase-based topics using n-gram analysis
   */
  extractPhraseTopics(corpus) {
    const phrases = new Map();
    
    // Extract 2-gram and 3-gram phrases
    for (let n = 2; n <= this.extractionRules.maxPhraseLength; n++) {
      const ngrams = this.extractNGrams(corpus.words, n);
      
      for (const [phrase, frequency] of ngrams.entries()) {
        if (frequency >= this.extractionRules.minFrequency && 
            this.isValidPhrase(phrase)) {
          phrases.set(phrase, {
            text: phrase,
            type: 'phrase',
            frequency,
            weight: frequency * n, // Longer phrases get higher weight
            domain: this.identifyPhraseDomain(phrase),
            ngramSize: n
          });
        }
      }
    }
    
    return phrases;
  }

  /**
   * Extract domain-specific topics using vocabulary matching
   */
  extractDomainSpecificTopics(corpus) {
    const domainTopics = new Map();
    
    Object.entries(this.domainVocabulary).forEach(([domain, vocabulary]) => {
      const allTerms = [
        ...vocabulary.primary,
        ...vocabulary.modifiers,
        ...vocabulary.processes
      ];
      
      allTerms.forEach(term => {
        const frequency = this.countTermOccurrences(term, corpus.raw);
        if (frequency > 0) {
          const key = `${domain}_${term}`;
          domainTopics.set(key, {
            text: term,
            type: 'domain_specific',
            domain,
            frequency,
            weight: frequency * vocabulary.weight,
            category: this.categorizeVocabularyTerm(term, vocabulary)
          });
        }
      });
    });
    
    return domainTopics;
  }

  /**
   * Extract contextual topics based on conversation flow
   */
  extractContextualTopics(conversationHistory) {
    const contextualTopics = new Map();
    
    // Analyze conversation progression
    const progression = this.analyzeConversationProgression(conversationHistory);
    
    // Extract topics from conversation turns
    conversationHistory.forEach((node, index) => {
      const context = {
        position: index / conversationHistory.length,
        isStart: index < 2,
        isMiddle: index >= 2 && index < conversationHistory.length - 2,
        isEnd: index >= conversationHistory.length - 2,
        branch: node.branch
      };
      
      const nodeTopics = this.extractNodeContextualTopics(node, context, progression);
      this.mergeTopics(contextualTopics, nodeTopics);
    });
    
    return contextualTopics;
  }

  /**
   * Extract contextual topics from individual conversation node
   */
  extractNodeContextualTopics(node, context, progression) {
    const topics = new Map();
    const text = `${node.prompt || ''} ${node.aiResponse || ''}`;
    
    // Extract question patterns
    if (node.prompt) {
      const questionTopics = this.extractQuestionTopics(node.prompt, context);
      this.mergeTopics(topics, questionTopics);
    }
    
    // Extract answer patterns
    if (node.aiResponse) {
      const answerTopics = this.extractAnswerTopics(node.aiResponse, context);
      this.mergeTopics(topics, answerTopics);
    }
    
    // Extract relationship topics
    const relationshipTopics = this.extractRelationshipTopics(text, context, progression);
    this.mergeTopics(topics, relationshipTopics);
    
    return topics;
  }

  /**
   * Extract topics from question patterns
   */
  extractQuestionTopics(prompt, context) {
    const topics = new Map();
    const promptLower = prompt.toLowerCase();
    
    // Identify question types and extract relevant topics
    const questionPatterns = {
      how: /how (do|can|would|should|might) (\w+(?:\s+\w+)*)/gi,
      what: /what (is|are|would|could|should) (\w+(?:\s+\w+)*)/gi,
      why: /why (do|does|is|are|would|should) (\w+(?:\s+\w+)*)/gi,
      when: /when (do|does|is|are|would|should) (\w+(?:\s+\w+)*)/gi,
      where: /where (do|does|is|are|would|should) (\w+(?:\s+\w+)*)/gi
    };
    
    Object.entries(questionPatterns).forEach(([questionType, pattern]) => {
      const matches = [...promptLower.matchAll(pattern)];
      matches.forEach(match => {
        const topic = match[2].trim();
        if (topic && topic.length > 3) {
          topics.set(`question_${questionType}_${topic}`, {
            text: topic,
            type: 'question_topic',
            questionType,
            weight: 1.5, // Questions often indicate important topics
            context: context.position
          });
        }
      });
    });
    
    return topics;
  }

  /**
   * Extract topics from answer patterns
   */
  extractAnswerTopics(response, context) {
    const topics = new Map();
    
    // Look for explanatory patterns
    const explanationPatterns = [
      /the (\w+(?:\s+\w+)*) is/gi,
      /(\w+(?:\s+\w+)*) refers to/gi,
      /(\w+(?:\s+\w+)*) means/gi,
      /consider (\w+(?:\s+\w+)*)/gi,
      /think about (\w+(?:\s+\w+)*)/gi
    ];
    
    explanationPatterns.forEach(pattern => {
      const matches = [...response.matchAll(pattern)];
      matches.forEach(match => {
        const topic = match[1].trim();
        if (topic && topic.length > 3 && !this.stopWords.has(topic.toLowerCase())) {
          topics.set(`explanation_${topic}`, {
            text: topic,
            type: 'explanation_topic',
            weight: 1.3,
            context: context.position
          });
        }
      });
    });
    
    return topics;
  }

  /**
   * Extract relationship topics between conversation elements
   */
  extractRelationshipTopics(text, context, progression) {
    const topics = new Map();
    
    // Look for relational language
    const relationPatterns = [
      /(\w+(?:\s+\w+)*) connects to (\w+(?:\s+\w+)*)/gi,
      /(\w+(?:\s+\w+)*) relates to (\w+(?:\s+\w+)*)/gi,
      /(\w+(?:\s+\w+)*) builds on (\w+(?:\s+\w+)*)/gi,
      /(\w+(?:\s+\w+)*) leads to (\w+(?:\s+\w+)*)/gi
    ];
    
    relationPatterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        const topic1 = match[1].trim();
        const topic2 = match[2].trim();
        
        if (topic1 && topic2 && topic1.length > 3 && topic2.length > 3) {
          topics.set(`relationship_${topic1}_${topic2}`, {
            text: `${topic1} → ${topic2}`,
            type: 'relationship_topic',
            weight: 1.4,
            source: topic1,
            target: topic2,
            context: context.position
          });
        }
      });
    });
    
    return topics;
  }

  /**
   * Cluster related topics together
   */
  clusterRelatedTopics(topics) {
    const clusters = new Map();
    const processed = new Set();
    
    for (const [key, topic] of topics.entries()) {
      if (processed.has(key)) continue;
      
      const cluster = {
        mainTopic: topic,
        relatedTopics: [],
        totalWeight: topic.weight,
        domains: new Set([topic.domain].filter(Boolean)),
        types: new Set([topic.type])
      };
      
      // Find related topics
      for (const [otherKey, otherTopic] of topics.entries()) {
        if (otherKey === key || processed.has(otherKey)) continue;
        
        const similarity = this.calculateTopicSimilarity(topic, otherTopic);
        if (similarity > 0.7) { // High similarity threshold
          cluster.relatedTopics.push({
            ...otherTopic,
            similarity
          });
          cluster.totalWeight += otherTopic.weight * similarity;
          cluster.domains.add(otherTopic.domain);
          cluster.types.add(otherTopic.type);
          processed.add(otherKey);
        }
      }
      
      clusters.set(key, cluster);
      processed.add(key);
    }
    
    return clusters;
  }

  /**
   * Score and rank topics based on multiple factors
   */
  scoreAndRankTopics(clusters, corpus) {
    const scoredTopics = [];
    
    for (const [key, cluster] of clusters.entries()) {
      const score = this.calculateTopicScore(cluster, corpus);
      const confidence = this.calculateTopicConfidence(cluster, corpus);
      
      scoredTopics.push({
        id: key,
        text: cluster.mainTopic.text,
        type: cluster.mainTopic.type,
        domain: cluster.mainTopic.domain,
        frequency: cluster.mainTopic.frequency,
        weight: cluster.totalWeight,
        score,
        confidence,
        relatedCount: cluster.relatedTopics.length,
        domainCount: cluster.domains.size,
        typeCount: cluster.types.size,
        relatedTopics: cluster.relatedTopics.map(t => t.text)
      });
    }
    
    return scoredTopics.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate comprehensive topic score
   */
  calculateTopicScore(cluster, corpus) {
    const { mainTopic, totalWeight, relatedTopics, domains } = cluster;
    
    let score = 0;
    
    // Base weight score
    score += totalWeight * 0.4;
    
    // Frequency bonus
    score += (mainTopic.frequency || 1) * 0.2;
    
    // Related topics bonus
    score += relatedTopics.length * 0.15;
    
    // Domain diversity bonus
    score += domains.size * 0.1;
    
    // Type-specific bonuses
    if (mainTopic.type === 'domain_specific') score += 0.1;
    if (mainTopic.type === 'phrase') score += 0.05;
    
    // Position bonus (topics mentioned early and late get bonus)
    if (mainTopic.context !== undefined) {
      const positionBonus = mainTopic.context < 0.3 || mainTopic.context > 0.7 ? 0.05 : 0;
      score += positionBonus;
    }
    
    return score;
  }

  /**
   * Calculate topic confidence based on extraction quality
   */
  calculateTopicConfidence(cluster, corpus) {
    const { mainTopic, relatedTopics } = cluster;
    
    let confidence = 0.5; // Base confidence
    
    // Frequency-based confidence
    const maxFrequency = Math.max(...Array.from(corpus.words).map(w => 
      corpus.words.filter(word => word.toLowerCase() === w.toLowerCase()).length
    ));
    const frequencyRatio = (mainTopic.frequency || 1) / maxFrequency;
    confidence += frequencyRatio * 0.3;
    
    // Related topics boost confidence
    confidence += Math.min(relatedTopics.length * 0.1, 0.2);
    
    // Domain-specific topics have higher confidence
    if (mainTopic.domain) confidence += 0.1;
    
    // Phrase topics generally more meaningful
    if (mainTopic.type === 'phrase') confidence += 0.05;
    
    return Math.min(confidence, 1.0);
  }

  // Helper methods
  
  splitIntoSentences(text) {
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  }
  
  tokenizeAndClean(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }
  
  extractNGrams(words, n) {
    const ngrams = new Map();
    
    for (let i = 0; i <= words.length - n; i++) {
      const ngram = words.slice(i, i + n).join(' ');
      if (this.isValidPhrase(ngram)) {
        ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1);
      }
    }
    
    return ngrams;
  }
  
  isValidPhrase(phrase) {
    const words = phrase.split(' ');
    return words.length > 1 && 
           !words.every(word => this.stopWords.has(word)) &&
           words.some(word => word.length > 3);
  }
  
  identifyWordDomain(word) {
    for (const [domain, vocabulary] of Object.entries(this.domainVocabulary)) {
      if (vocabulary.primary.includes(word) || 
          vocabulary.modifiers.includes(word) || 
          vocabulary.processes.includes(word)) {
        return domain;
      }
    }
    return null;
  }
  
  identifyPhraseDomain(phrase) {
    const words = phrase.split(' ');
    const domainScores = {};
    
    words.forEach(word => {
      const domain = this.identifyWordDomain(word);
      if (domain) {
        domainScores[domain] = (domainScores[domain] || 0) + 1;
      }
    });
    
    if (Object.keys(domainScores).length === 0) return null;
    
    return Object.entries(domainScores).reduce((a, b) => 
      domainScores[a[0]] > domainScores[b[0]] ? a : b
    )[0];
  }
  
  findWordPositions(word, words) {
    const positions = [];
    words.forEach((w, index) => {
      if (w.toLowerCase() === word.toLowerCase()) {
        positions.push(index);
      }
    });
    return positions;
  }
  
  countTermOccurrences(term, text) {
    const regex = new RegExp(term, 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }
  
  categorizeVocabularyTerm(term, vocabulary) {
    if (vocabulary.primary.includes(term)) return 'primary';
    if (vocabulary.modifiers.includes(term)) return 'modifier';
    if (vocabulary.processes.includes(term)) return 'process';
    return 'unknown';
  }
  
  analyzeConversationProgression(history) {
    return {
      length: history.length,
      branches: history.map(node => node.branch).filter(Boolean),
      hasProgression: history.length > 3,
      focusShift: this.detectFocusShifts(history)
    };
  }
  
  detectFocusShifts(history) {
    // Simple heuristic for detecting topic focus shifts
    const windows = [];
    const windowSize = 3;
    
    for (let i = 0; i <= history.length - windowSize; i++) {
      const window = history.slice(i, i + windowSize);
      const topics = this.extractSimpleTopics(window);
      windows.push(topics);
    }
    
    return windows.length > 1;
  }
  
  extractSimpleTopics(nodes) {
    const allText = nodes.map(node => 
      `${node.prompt || ''} ${node.aiResponse || ''}`
    ).join(' ');
    
    return this.tokenizeAndClean(allText)
      .filter(word => !this.stopWords.has(word) && word.length > 4)
      .slice(0, 5);
  }
  
  calculateTopicSimilarity(topic1, topic2) {
    // Simple similarity based on text overlap and domain
    let similarity = 0;
    
    // Text similarity
    const words1 = new Set(topic1.text.toLowerCase().split(' '));
    const words2 = new Set(topic2.text.toLowerCase().split(' '));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    similarity += intersection.size / union.size * 0.6;
    
    // Domain similarity
    if (topic1.domain && topic2.domain && topic1.domain === topic2.domain) {
      similarity += 0.3;
    }
    
    // Type similarity
    if (topic1.type === topic2.type) {
      similarity += 0.1;
    }
    
    return similarity;
  }
  
  mergeTopics(targetMap, sourceMap) {
    for (const [key, topic] of sourceMap.entries()) {
      if (targetMap.has(key)) {
        // Merge existing topic
        const existing = targetMap.get(key);
        existing.frequency = (existing.frequency || 0) + (topic.frequency || 1);
        existing.weight += topic.weight;
      } else {
        targetMap.set(key, topic);
      }
    }
  }
}

export default TopicExtractor;