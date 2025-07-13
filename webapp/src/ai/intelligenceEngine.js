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
      
      // Initialize real API clients if keys are available
      if (anthropicKey && anthropicKey !== 'your_anthropic_api_key') {
        this.anthropic = await this.initializeAnthropicClient(anthropicKey)
        console.log('🤖 Anthropic client initialized')
      }
      
      if (openaiKey && openaiKey !== 'your_openai_api_key') {
        this.openai = await this.initializeOpenAIClient(openaiKey)
        console.log('🤖 OpenAI client initialized')
      }
      
      if (!this.anthropic && !this.openai) {
        console.warn('🤖 No valid API keys found - using mock AI Intelligence')
        this.mockMode = true
      } else {
        this.mockMode = false
        console.log('🤖 Real AI Intelligence enabled')
      }
      
      console.log('🤖 AI Intelligence Engine initializing...')
      console.log('🤖 Available clients:', {
        anthropic: !!this.anthropic,
        openai: !!this.openai,
        claudeCode: !!this.claudeCode,
        mockMode: this.mockMode
      })
      
      this.initialized = true
      return true
    } catch (error) {
      console.error('🤖 AI Intelligence initialization failed:', error)
      this.mockMode = true
      this.initialized = true
      return true // Continue with mock mode
    }
  }
  
  // INITIALIZE ANTHROPIC CLIENT
  async initializeAnthropicClient(apiKey) {
    try {
      // Dynamic import to avoid bundling if not needed
      const { default: Anthropic } = await import('@anthropic-ai/sdk')
      return new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Enable browser usage
      })
    } catch (error) {
      console.warn('🤖 Failed to initialize Anthropic client:', error)
      return null
    }
  }
  
  // INITIALIZE OPENAI CLIENT
  async initializeOpenAIClient(apiKey) {
    try {
      // Dynamic import to avoid bundling if not needed
      const { OpenAI } = await import('openai')
      return new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Enable browser usage
      })
    } catch (error) {
      console.warn('🤖 Failed to initialize OpenAI client:', error)
      return null
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
  async transform(content, fromFormat, toFormat, context = {}) {
    if (!this.initialized) {
      console.warn('🤖 Transform skipped - AI not initialized')
      return content
    }
    
    const complexity = this.assessComplexity(content, fromFormat, toFormat)
    const { client, fallback } = await this.routeRequest('transformation', complexity)
    
    console.log('🤖 Transforming content:', { fromFormat, toFormat, complexity })
    
    if (this.mockMode) {
      return this.mockTransform(content, fromFormat, toFormat, context)
    }
    
    try {
      if (fromFormat === 'mindNode' && toFormat === 'expandedIdeas') {
        return await this.expandMindNode(content, context, client || fallback)
      }
      
      if (fromFormat === 'mindNode' && toFormat === 'spreadIdeas') {
        return await this.spreadIdeasFromNode(content, context, client || fallback)
      }
      
      if (fromFormat === 'mindNode' && toFormat === 'canvasNote') {
        return await this.transformNodeToNote(content, context, client || fallback)
      }
      
      // Generic transformation
      return await this.genericTransform(content, fromFormat, toFormat, context, client || fallback)
      
    } catch (error) {
      console.error('🤖 AI transformation failed:', error)
      return this.mockTransform(content, fromFormat, toFormat, context)
    }
  }
  
  // EXPAND MIND NODE WITH AI
  async expandMindNode(nodeContent, context, client) {
    const prompt = `As a creative AI assistant, help expand this idea into deeper, more detailed concepts:

Original Idea: "${nodeContent.title || nodeContent}"
Content: "${nodeContent.content || ''}"
Context: This is from a creative mind mapping session for ${context.projectType || 'a creative project'}.

Please provide 3-5 expanded ideas that:
1. Build upon the original concept
2. Add creative depth and detail
3. Suggest specific implementations or approaches
4. Connect to broader creative themes

Format as a JSON array of objects with 'title' and 'content' fields.`

    if (this.anthropic) {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
      
      try {
        return JSON.parse(response.content[0].text)
      } catch (parseError) {
        console.warn('🤖 Failed to parse AI response, using fallback')
        return this.mockExpandNode(nodeContent)
      }
    }
    
    if (this.openai) {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
      
      try {
        return JSON.parse(response.choices[0].message.content)
      } catch (parseError) {
        console.warn('🤖 Failed to parse AI response, using fallback')
        return this.mockExpandNode(nodeContent)
      }
    }
    
    return this.mockExpandNode(nodeContent)
  }
  
  // SPREAD IDEAS FROM NODE
  async spreadIdeasFromNode(nodeContent, context, client) {
    const prompt = `You are a creative director helping develop NFT/art concepts. Generate ACTUAL CONTENT based on this idea:

Core Idea: "${nodeContent.title || nodeContent}"
Content: "${nodeContent.content || ''}"

IMPORTANT: Generate REAL CONTENT, not development paths. For example:
- If the idea is "emotional states of women", generate ACTUAL emotional states (e.g., "Anticipation", "Vulnerability", "Empowerment")
- If the idea is "color palettes", generate ACTUAL colors and their meanings
- If the idea is "narrative themes", generate ACTUAL story elements

Generate 6-10 specific content items that directly expand the core idea.

Format as JSON array where each object has:
- 'title': The specific item (e.g., "Anticipation", "Nesting Instinct", "Identity Shift")
- 'content': Brief description or details about this specific item
- 'relationship': Use 'content' for all items (they are actual content, not development paths)`

    if (this.anthropic) {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }]
      })
      
      try {
        return JSON.parse(response.content[0].text)
      } catch (parseError) {
        return this.mockSpreadIdeas(nodeContent)
      }
    }
    
    if (this.openai) {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }]
      })
      
      try {
        return JSON.parse(response.choices[0].message.content)
      } catch (parseError) {
        return this.mockSpreadIdeas(nodeContent)
      }
    }
    
    return this.mockSpreadIdeas(nodeContent)
  }
  
  // TRANSFORM NODE TO CANVAS NOTE
  async transformNodeToNote(nodeContent, context, client) {
    const prompt = `Transform this mind map node into a well-structured note for a visual canvas:

Node Title: "${nodeContent.title || nodeContent}"
Node Content: "${nodeContent.content || ''}"
Phase: ${nodeContent.phase || 'concept'}

Create a structured note that:
1. Has a clear, descriptive title
2. Expands the content with actionable details
3. Maintains the creative energy of the original
4. Is suitable for project development

Return as JSON with 'title' and 'content' fields.`

    if (this.anthropic) {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }]
      })
      
      try {
        return JSON.parse(response.content[0].text)
      } catch (parseError) {
        return {
          title: nodeContent.title || 'Expanded Idea',
          content: `${nodeContent.content || nodeContent}\n\n[AI-expanded version with more detail and structure]`
        }
      }
    }
    
    if (this.openai) {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }]
      })
      
      try {
        return JSON.parse(response.choices[0].message.content)
      } catch (parseError) {
        return {
          title: nodeContent.title || 'Expanded Idea',
          content: `${nodeContent.content || nodeContent}\n\n[AI-expanded version with more detail and structure]`
        }
      }
    }
    
    return {
      title: nodeContent.title || 'Expanded Idea',
      content: `${nodeContent.content || nodeContent}\n\n[Enhanced with AI intelligence]`
    }
  }
  
  // GENERIC TRANSFORMATION
  async genericTransform(content, fromFormat, toFormat, context, client) {
    const prompt = `Transform this content from ${fromFormat} to ${toFormat}:
    
Content: "${content}"
Context: ${JSON.stringify(context)}

Provide a natural, useful transformation that maintains the essence while adapting to the new format.`

    if (this.anthropic) {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      })
      
      return response.content[0].text
    }
    
    if (this.openai) {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      })
      
      return response.choices[0].message.content
    }
    
    return `Transformed: ${content} (${fromFormat} → ${toFormat})`
  }
  
  // MOCK TRANSFORMATIONS (fallback)
  mockTransform(content, fromFormat, toFormat, context) {
    if (fromFormat === 'mindNode' && toFormat === 'expandedIdeas') {
      return this.mockExpandNode(content)
    }
    if (fromFormat === 'mindNode' && toFormat === 'spreadIdeas') {
      return this.mockSpreadIdeas(content)
    }
    return `Transformed: ${content} (${fromFormat} → ${toFormat})`
  }
  
  mockExpandNode(nodeContent) {
    const title = nodeContent.title || nodeContent
    return [
      {
        title: `${title} - Technical Implementation`,
        content: `Detailed technical approach for implementing "${title}" with specific tools and methods.`
      },
      {
        title: `${title} - Creative Variations`,
        content: `Alternative creative interpretations and artistic approaches to "${title}".`
      },
      {
        title: `${title} - User Experience`,
        content: `How "${title}" impacts and enhances the user experience and interaction design.`
      }
    ]
  }
  
  mockSpreadIdeas(nodeContent) {
    const title = nodeContent.title || nodeContent
    
    // Example: if talking about emotional states, generate actual emotions
    if (title.toLowerCase().includes('emotion') || title.toLowerCase().includes('states')) {
      return [
        {
          title: `Anticipation`,
          content: `The nervous excitement mixed with uncertainty. Heart racing at first ultrasound, imagining the future.`,
          relationship: 'content'
        },
        {
          title: `Vulnerability`,
          content: `Physical and emotional rawness. Body changing beyond control, identity shifting, feeling exposed.`,
          relationship: 'content'
        },
        {
          title: `Fierce Protection`,
          content: `Primal maternal instinct awakening. Ready to face any challenge for the unborn child.`,
          relationship: 'content'
        },
        {
          title: `Identity Shift`,
          content: `Who am I becoming? The woman I was meets the mother I will be. Internal dialogue of transformation.`,
          relationship: 'content'
        },
        {
          title: `Overwhelming Love`,
          content: `First moment of connection. Feeling movement, seeing the heartbeat, love beyond imagination.`,
          relationship: 'content'
        },
        {
          title: `Exhausted Triumph`,
          content: `Post-birth state. Depleted yet victorious. The marathon completed, new journey beginning.`,
          relationship: 'content'
        }
      ]
    }
    
    // Generic fallback
    return [
      {
        title: `First Aspect of ${title}`,
        content: `Detailed exploration of the first key element within ${title}.`,
        relationship: 'content'
      },
      {
        title: `Second Aspect of ${title}`,
        content: `Another important facet that defines ${title}.`,
        relationship: 'content'
      },
      {
        title: `Third Aspect of ${title}`,
        content: `Additional perspective that enriches understanding of ${title}.`,
        relationship: 'content'
      },
      {
        title: `Fourth Aspect of ${title}`,
        content: `Further dimension that completes the exploration of ${title}.`,
        relationship: 'content'
      }
    ]
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
    
    // Use context-aware suggestions
    const state = this.store?.getState() || context
    const currentModule = state.currentModule || 'canvas'
    
    if (currentModule === 'canvas') {
      return this.generateCanvasSuggestions(state)
    }
    
    // For now, use mock suggestions for other modules
    return this.generateMockSuggestions(context)
  }
  
  // CANVAS-SPECIFIC TECHNICAL SUGGESTIONS
  async generateCanvasSuggestions(state) {
    const elements = state.canvas?.elements || []
    const suggestions = []
    
    // Analyze canvas content for technical suggestions
    const noteElements = elements.filter(el => el.type === 'note')
    const hasEmotionalContent = noteElements.some(note => 
      note.data?.sourceModule === 'mind-garden' || 
      note.data?.title?.toLowerCase().includes('emotion') ||
      note.data?.content?.toLowerCase().includes('feeling')
    )
    
    const hasMultipleRelatedNotes = noteElements.filter(note => 
      note.data?.sourceModule === 'mind-garden'
    ).length >= 3
    
    if (hasEmotionalContent && hasMultipleRelatedNotes) {
      suggestions.push('🎬 Create Houdini setup for emotional particle system - Each emotion drives different particle behavior')
      suggestions.push('🎨 Generate color script from emotional states - Map each emotion to color/material in Karma')
      suggestions.push('⚡ Setup TouchDesigner real-time emotion visualizer - OSC input for live performance')
    }
    
    if (elements.some(el => el.type === 'board')) {
      suggestions.push('📊 Convert board structure to Houdini PDG network for batch processing')
      suggestions.push('🔄 Create project template from current board organization')
    }
    
    if (elements.length > 10) {
      suggestions.push('🗂️ Group related elements into sub-boards for better organization')
      suggestions.push('🏷️ Add tags to elements for automated sorting and filtering')
    }
    
    // If no specific suggestions, provide general technical ones
    if (suggestions.length === 0) {
      suggestions.push('💡 Double-click to add technical notes or reference images')
      suggestions.push('🔗 Import mood boards or technical references')
      suggestions.push('📝 Create a technical requirements board')
    }
    
    return suggestions
  }
  
  // TECHNICAL WORKFLOW SUGGESTIONS
  async generateTechnicalWorkflow(canvasContent) {
    if (!this.initialized || this.mockMode) {
      return this.mockTechnicalWorkflow(canvasContent)
    }
    
    const prompt = `As a VFX/NFT technical director, analyze this creative content and suggest a specific technical workflow:

Canvas Content: ${JSON.stringify(canvasContent)}

Generate a detailed technical workflow including:
1. Specific software and tools (Houdini, Nuke, TouchDesigner, etc.)
2. Node networks and setups
3. Render settings and optimization
4. Pipeline considerations
5. Technical challenges and solutions

Be extremely specific with node names, parameters, and technical details.`

    try {
      if (this.anthropic) {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }]
        })
        return response.content[0].text
      }
      
      if (this.openai) {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }]
        })
        return response.choices[0].message.content
      }
    } catch (error) {
      console.error('🤖 Technical workflow generation failed:', error)
    }
    
    return this.mockTechnicalWorkflow(canvasContent)
  }
  
  // MOCK TECHNICAL WORKFLOW
  mockTechnicalWorkflow(canvasContent) {
    return `Technical Workflow Suggestion:

1. **Houdini Setup** (Main DCC):
   - Create base geometry in SOPs
   - Add particle system with emotion-driven parameters
   - Use CHOPs to map emotional values to particle attributes
   - Setup Karma XPU for fast iterations

2. **TouchDesigner Integration**:
   - OSC input for real-time parameter control
   - GLSL shaders for custom visual effects
   - Export controller data for Houdini

3. **Render Pipeline**:
   - Karma XPU with 4K output
   - Motion blur settings: 0.5 shutter
   - Use cryptomatte for compositing flexibility

4. **Post in Nuke**:
   - Color grading per emotional state
   - Add atmospheric effects
   - Final output: ProRes 4444 for NFT platforms`
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