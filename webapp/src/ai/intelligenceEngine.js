/**
 * AI Intelligence Engine - Hybrid Architecture
 * Blueprint v4.1 Implementation
 * 
 * Routing Strategy:
 * - Anthropic: Complex reasoning, context analysis, creative workflows
 * - OpenAI: Simple transformations, quick completions, fallback operations
 */

class IntelligenceEngine {
  constructor(config, storeRef) {
    // HYBRID AI CLIENTS
    this.anthropic = config.anthropicClient    // Complex reasoning & context
    this.openai = config.openaiClient          // Simple transformations & speed
    this.claudeCode = config.claudeCodeSDK     // Future experimentation
    this.store = storeRef
    
    // AI ROUTING STRATEGY
    this.routingStrategy = {
      // ANTHROPIC for complex intelligence
      contextAnalysis: 'anthropic',
      architecturalSuggestions: 'anthropic', 
      creativeWorkflowOptimization: 'anthropic',
      complexTransformations: 'anthropic',
      
      // OPENAI for reliable simple tasks
      textExpansions: 'openai',
      quickCompletions: 'openai',
      formatConversions: 'openai',
      fallbackOperations: 'openai'
    }
    
    this.initialized = false
    this.isAnalyzing = false
  }
  
  // INITIALIZE AI CLIENTS
  async initialize() {
    if (this.initialized) return true
    
    try {
      // Check if API keys are available
      const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
      
      if (!anthropicKey && !openaiKey) {
        console.warn('🤖 No AI API keys found - AI Intelligence disabled')
        return false
      }
      
      console.log('🤖 AI Intelligence Engine initializing...')
      console.log('🤖 Available clients:', {
        anthropic: !!anthropicKey,
        openai: !!openaiKey,
        claudeCode: !!this.claudeCode
      })
      
      this.initialized = true
      return true
    } catch (error) {
      console.error('🤖 AI Intelligence initialization failed:', error)
      return false
    }
  }
  
  // INTELLIGENT ROUTING
  async routeRequest(operation, complexity = 'medium') {
    const strategy = this.routingStrategy[operation]
    const client = complexity === 'high' ? this.anthropic : 
                   complexity === 'low' ? this.openai : 
                   this[strategy] || this.anthropic
    
    return { client, fallback: this.openai }
  }
  
  // CONTEXT ANALYSIS (Anthropic optimized)
  async analyzeContext() {
    if (!this.initialized || this.isAnalyzing) {
      console.log('🤖 Context analysis skipped - not ready or already analyzing')
      return null
    }
    
    this.isAnalyzing = true
    
    try {
      const { client, fallback } = await this.routeRequest('contextAnalysis', 'high')
      const state = this.store.getState()
      
      console.log('🤖 Analyzing canvas context...', {
        module: state.currentModule,
        canvasElements: state.canvas.elements?.length || 0,
        hasAI: !!this.anthropic || !!this.openai
      })
      
      // MOCK ANALYSIS for now (will be replaced with real AI)
      const mockAnalysis = {
        timestamp: Date.now(),
        module: state.currentModule || 'canvas',
        elementsCount: state.canvas.elements?.length || 0,
        suggestions: this.generateMockSuggestions(state),
        context: {
          workSession: 'Canvas editing session',
          activeProject: null,
          recentActions: ['canvas_loaded', 'elements_analyzed']
        }
      }
      
      // Update unified store with analysis
      this.store.setState(prevState => ({
        ai: {
          ...prevState.ai,
          context: mockAnalysis.context,
          suggestions: mockAnalysis.suggestions,
          analysisHistory: [
            ...(prevState.ai.analysisHistory || []).slice(-4), // Keep last 5
            mockAnalysis
          ]
        }
      }))
      
      console.log('🤖 Context analysis completed:', mockAnalysis)
      return mockAnalysis
      
    } catch (error) {
      console.error('🤖 Context analysis failed:', error)
      return null
    } finally {
      this.isAnalyzing = false
    }
  }
  
  // GENERATE MOCK SUGGESTIONS (temporary) - Return simple strings for UI compatibility
  generateMockSuggestions(state) {
    const elementsCount = state.canvas.elements?.length || 0
    const currentModule = state.currentModule || 'canvas'
    
    const suggestions = []
    
    if (currentModule === 'canvas') {
      if (elementsCount === 0) {
        suggestions.push('💡 Start your creative workflow - Add a project board to organize your ideas')
        suggestions.push('📝 Capture your thoughts - Create notes to document your creative process')
      } else if (elementsCount < 5) {
        suggestions.push('🎯 Organize with boards - Group related elements into themed collections')
        suggestions.push('✨ Add visual elements - Include images to enhance your project')
        suggestions.push('🔗 Connect ideas - Use links to reference external resources')
      } else {
        suggestions.push('🌱 Export to Mind Garden - Continue ideation in the Mind Garden module')
        suggestions.push('📊 Create project structure - Transform your canvas into a structured project')
        suggestions.push('🎨 Enhance visual design - Apply consistent styling and themes')
      }
    }
    
    return suggestions
  }
  
  // CONTENT TRANSFORMATION (Route by complexity)
  async transform(content, fromFormat, toFormat, context) {
    if (!this.initialized) {
      console.warn('🤖 Transform skipped - AI not initialized')
      return content
    }
    
    const complexity = this.assessComplexity(content, fromFormat, toFormat)
    const { client, fallback } = await this.routeRequest('transformation', complexity)
    
    console.log('🤖 Transforming content:', { fromFormat, toFormat, complexity })
    
    // MOCK TRANSFORMATION for now
    return `Transformed: ${content} (${fromFormat} → ${toFormat})`
  }
  
  // ASSESS TRANSFORMATION COMPLEXITY
  assessComplexity(content, fromFormat, toFormat) {
    if (fromFormat === 'mindNode' && toFormat === 'canvasBoard') return 'high'
    if (content.length > 500) return 'high'
    if (fromFormat === toFormat) return 'low'
    return 'medium'
  }
  
  // PROACTIVE SUGGESTIONS (Anthropic for creativity)
  async generateSuggestions(context) {
    if (!this.initialized) {
      console.warn('🤖 Suggestions skipped - AI not initialized')
      return []
    }
    
    const { client } = await this.routeRequest('contextAnalysis', 'high')
    
    // For now, use mock suggestions
    return this.generateMockSuggestions(context)
  }
  
  // GET CURRENT SUGGESTION COUNT
  getSuggestionCount() {
    if (!this.store) return 0
    const state = this.store.getState()
    return state.ai?.suggestions?.length || 0
  }
  
  // CLEAR SUGGESTIONS
  clearSuggestions() {
    if (!this.store) return
    
    this.store.setState(prevState => ({
      ai: {
        ...prevState.ai,
        suggestions: []
      }
    }))
    
    console.log('🤖 AI suggestions cleared')
  }
  
  // FUTURE: Claude Code SDK Integration
  async experimentWithClaudeCode(operation, data) {
    if (!this.claudeCode) return null
    
    try {
      // Experimental parallel execution for comparison
      const claudeResult = await this.claudeCode.execute(operation, data)
      const standardResult = await this.anthropic.complete(/* same operation */)
      
      // Log performance comparison for future optimization
      this.logPerformanceComparison(claudeResult, standardResult)
      
      return claudeResult
    } catch (error) {
      console.warn('🤖 Claude Code SDK experiment failed:', error)
      return null
    }
  }
  
  // PERFORMANCE LOGGING
  logPerformanceComparison(result1, result2) {
    console.log('🤖 AI Performance Comparison:', {
      claudeCode: result1?.performance,
      standard: result2?.performance,
      timestamp: Date.now()
    })
  }
}

export default IntelligenceEngine