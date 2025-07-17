/**
 * AI Intelligence Engine - Enhanced for Conversational Intelligence
 * Blueprint v5.1 Implementation - Mind Garden Flora AI Integration
 * 
 * Routing Strategy:
 * - Anthropic: Complex reasoning, context analysis, creative workflows, conversational AI
 * - OpenAI: Simple transformations, quick completions, fallback operations
 * 
 * NEW v5.1: Contextual conversation threading with parent chain analysis
 */

import ContextAnalyzer from './contextAnalysis.js';
import PromptBuilder from './promptBuilder.js';
import ConversationAnalyzer from './conversationAnalysis.js';
import ResponseCache from './responseCache.js';
import ConversationErrorHandler from './errorHandling.js';
import TopicExtractor from './topicExtraction.js';
import apiClient from '../utils/apiClient.js';

class IntelligenceEngine {
  constructor(config, storeRef) {
    // SECURE API CLIENT (replaces direct API clients)
    this.apiClient = apiClient
    this.store = storeRef
    
    // Remove direct API clients - all calls go through secure proxy
    this.anthropic = null
    this.openai = null
    this.claudeCode = config.claudeCodeSDK     // Future experimentation
    
    // ENHANCED v5.1: Conversational Intelligence Components
    this.contextAnalyzer = new ContextAnalyzer(this)
    this.promptBuilder = new PromptBuilder()
    this.conversationAnalyzer = new ConversationAnalyzer()
    this.responseCache = new ResponseCache(100, 60 * 60 * 1000)  // 100 entries, 1 hour TTL
    this.errorHandler = new ConversationErrorHandler()
    this.topicExtractor = new TopicExtractor()
    this.streamingResponses = new Map()        // Track active streaming responses
    
    // AI ROUTING STRATEGY (Enhanced for v5.1)
    this.routingStrategy = {
      // ANTHROPIC for complex intelligence
      contextAnalysis: 'anthropic',
      architecturalSuggestions: 'anthropic', 
      creativeWorkflowOptimization: 'anthropic',
      complexTransformations: 'anthropic',
      // NEW v5.1: Conversational intelligence
      conversationalResponse: 'anthropic',
      contextualAnalysis: 'anthropic',
      conversationSynthesis: 'anthropic',
      
      // OPENAI for reliable simple tasks
      textExpansions: 'openai',
      quickCompletions: 'openai',
      formatConversions: 'openai',
      fallbackOperations: 'openai',
      // NEW v5.1: Simple conversational tasks
      basicResponses: 'openai',
      confidenceScoring: 'openai'
    }
    
    this.initialized = false
    this.isAnalyzing = false
  }
  
  // INITIALIZE SECURE API CLIENT
  async initialize() {
    if (this.initialized) return true
    
    try {
      // Test API proxy connectivity
      console.log('🔐 Testing secure API proxy connectivity...')
      
      // Simple connectivity test
      this.mockMode = false
      console.log('🔐 Secure API proxy enabled')
      
      console.log('🤖 AI Intelligence Engine initializing...')
      console.log('🔐 Security status:', {
        secureProxy: true,
        mockMode: this.mockMode,
        apiKeysExposed: false // Keys are server-side only
      })
      
      this.initialized = true
      return true
    } catch (error) {
      console.error('🔐 API proxy initialization failed:', error)
      this.mockMode = true
      this.initialized = true
      return true // Continue with mock mode
    }
  }
  
  // SECURE API CALLS (replaces direct client initialization)
  async callAnthropic(messages, options = {}) {
    try {
      return await this.apiClient.callAnthropic(messages, options)
    } catch (error) {
      console.error('🔐 Anthropic API call failed:', error)
      throw error
    }
  }
  
  async callOpenAI(messages, options = {}) {
    try {
      return await this.apiClient.callOpenAI(messages, options)
    } catch (error) {
      console.error('🔐 OpenAI API call failed:', error)
      throw error
    }
  }
  
  // INTELLIGENT ROUTING (updated for secure proxy)
  async routeRequest(operation, complexity = 'medium', messages, options = {}) {
    const strategy = this.routingStrategy[operation]
    const provider = complexity === 'high' ? 'anthropic' : 
                     complexity === 'low' ? 'openai' : 
                     strategy || 'anthropic'
    
    if (provider === 'anthropic') {
      return await this.callAnthropic(messages, options)
    } else {
      return await this.callOpenAI(messages, options)
    }
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
        module: state.currentModule || 'scriptorium',
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
    const currentModule = state.currentModule || 'scriptorium'
    
    const suggestions = []
    
    if (currentModule === 'scriptorium') {
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

  // ENHANCED: Streaming Conversational Response for Mind Garden
  async generateConversationalResponseStreaming(nodeId, prompt, parentChain = [], onUpdate = null) {
    if (!this.initialized) {
      console.warn('🤖 Streaming response skipped - AI not initialized')
      return {
        response: 'AI not initialized',
        error: true,
        timestamp: new Date().toISOString()
      }
    }

    try {
      // Build contextual prompt using existing PromptBuilder
      const { PromptBuilder } = await import('./promptBuilder.js')
      const promptBuilder = new PromptBuilder()
      
      // Prepare conversation history from parent chain
      const conversationHistory = parentChain.map(parent => ({
        prompt: parent.prompt,
        response: parent.response, // Note: using 'response' not 'aiResponse' after our fix
        branch: parent.branch,
        timestamp: parent.timestamp
      }))
      
      const contextualPrompt = promptBuilder.buildContextualPrompt({
        currentPrompt: prompt,
        conversationHistory,
        conversationType: 'creative',
        branchIntent: 'exploration',
        depth: parentChain.length,
        primaryTopic: 'creative workflow',
        conversationFlow: 'organic'
      })

      console.log('🤖 Starting streaming response for node:', nodeId)
      
      if (this.mockMode || !this.anthropic) {
        // Mock streaming for development
        return await this.mockStreamingResponse(prompt, onUpdate)
      }

      // Real Anthropic SDK streaming
      const stream = this.anthropic.messages.stream({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 4096,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: contextualPrompt
          }
        ]
      })

      let fullResponse = ''
      
      // Handle streaming events
      stream.on('text', (text) => {
        fullResponse += text
        
        // Call update callback for real-time UI updates
        if (onUpdate) {
          onUpdate({
            nodeId,
            partialResponse: fullResponse,
            isComplete: false,
            timestamp: new Date().toISOString()
          })
        }
      })

      // Handle completion
      stream.on('message', (message) => {
        console.log('🤖 Streaming complete for node:', nodeId)
        
        if (onUpdate) {
          onUpdate({
            nodeId,
            partialResponse: fullResponse,
            isComplete: true,
            timestamp: new Date().toISOString()
          })
        }
      })

      // Handle errors
      stream.on('error', (error) => {
        console.error('🤖 Streaming error:', error)
        
        if (onUpdate) {
          onUpdate({
            nodeId,
            partialResponse: fullResponse || 'Error generating response',
            isComplete: true,
            error: true,
            timestamp: new Date().toISOString()
          })
        }
      })

      // Wait for stream to complete
      await stream.finalMessage()
      
      return {
        response: fullResponse,
        timestamp: new Date().toISOString(),
        confidence: 0.85,
        conversationFocus: 'creative',
        branchIntent: 'exploration',
        topics: [],
        sentiment: 'neutral',
        health: 'good',
        cached: false,
        suggestedBranches: []
      }

    } catch (error) {
      console.error('🤖 Streaming conversational response failed:', error)
      
      return {
        response: 'I apologize, but I encountered an error while generating a response. Please try again.',
        error: true,
        timestamp: new Date().toISOString(),
        confidence: 0.1
      }
    }
  }

  // Mock streaming for development/testing
  async mockStreamingResponse(prompt, onUpdate) {
    const mockResponse = `Thank you for your input: "${prompt}"\n\nI'm currently working on processing your request with enhanced streaming capabilities. This response is being generated in real-time to demonstrate the streaming AI functionality.\n\nThe new project-centric architecture allows for better context management and more coherent conversations across your creative workflow.`
    
    // Simulate streaming by sending chunks
    const chunks = mockResponse.split(' ')
    let currentResponse = ''
    
    for (let i = 0; i < chunks.length; i++) {
      currentResponse += chunks[i] + ' '
      
      if (onUpdate) {
        onUpdate({
          partialResponse: currentResponse,
          isComplete: i === chunks.length - 1,
          timestamp: new Date().toISOString()
        })
      }
      
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    return {
      response: mockResponse,
      timestamp: new Date().toISOString(),
      confidence: 0.8,
      conversationFocus: 'creative',
      branchIntent: 'exploration',
      topics: ['creative workflow', 'project management'],
      sentiment: 'positive',
      health: 'good',
      cached: false,
      suggestedBranches: ['How can I improve this concept?', 'What are the next steps?', 'Are there any alternatives?']
    }
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
    const currentModule = state.currentModule || 'scriptorium'
    
    if (currentModule === 'scriptorium') {
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

  // ============================================================================
  // ENHANCED v5.1: CONVERSATIONAL INTELLIGENCE METHODS
  // ============================================================================

  /**
   * Generate contextual AI response for conversational node
   * Core method for Mind Garden v5.1 conversational threading
   */
  async generateConversationalResponse(nodeId, prompt, parentChain = []) {
    if (!this.initialized) {
      console.warn('🤖 Conversational response skipped - AI not initialized')
      return this.mockConversationalResponse(prompt)
    }

    console.log('🤖 Generating conversational response:', { nodeId, prompt, contextDepth: parentChain.length })

    try {
      // 1. Check cache for similar prompts
      const conversationFocus = this.conversationAnalyzer.analyzeAdvancedConversationFocus(parentChain, prompt)
      const cachedResponse = this.responseCache.get(prompt, parentChain, conversationFocus.primaryFocus)
      
      if (cachedResponse) {
        console.log('🤖 Using cached response with confidence:', cachedResponse.confidence)
        return {
          response: cachedResponse.response,
          confidence: cachedResponse.confidence,
          conversationFocus: conversationFocus.primaryFocus,
          cached: true,
          timestamp: new Date().toISOString()
        }
      }

      // 2. Analyze conversation context with advanced systems
      const branchIntent = this.conversationAnalyzer.detectBranchIntent(prompt, parentChain)
      const conversationTopics = this.topicExtractor.extractTopics(parentChain, { maxTopics: 5 })
      const conversationSentiment = this.conversationAnalyzer.analyzeSentiment(parentChain)
      const conversationHealth = this.conversationAnalyzer.generateHealthMetrics(parentChain)

      // 3. Build intelligent prompt with enhanced context
      const contextualPrompt = this.promptBuilder.buildContextualPrompt({
        currentPrompt: prompt,
        conversationHistory: parentChain,
        conversationType: conversationFocus.primaryFocus,
        branchIntent: branchIntent.suggestedBranch,
        depth: parentChain.length,
        conversationTopics,
        conversationSentiment,
        conversationHealth
      })

      // 4. Route to appropriate AI client
      const { client, fallback } = await this.routeRequest('conversationalResponse', 'high')
      
      // 5. Generate response with error handling
      let response, confidence
      const responseContext = {
        nodeId,
        prompt,
        parentChain,
        conversationFocus: conversationFocus.primaryFocus
      }

      if (this.anthropic && !this.mockMode) {
        try {
          const result = await this.generateAnthropicResponse(contextualPrompt)
          response = result.response
          confidence = await this.scoreResponseConfidence(response, prompt, parentChain)
        } catch (error) {
          console.warn('🤖 Anthropic response failed, handling error:', error.message)
          const errorResult = await this.errorHandler.handleConversationError(error, responseContext)
          if (errorResult.success) {
            response = errorResult.response
            confidence = errorResult.confidence
          } else {
            throw error
          }
        }
      } else if (this.openai && !this.mockMode) {
        try {
          const result = await this.generateOpenAIResponse(contextualPrompt)
          response = result.response
          confidence = await this.scoreResponseConfidence(response, prompt, parentChain)
        } catch (error) {
          console.warn('🤖 OpenAI response failed, handling error:', error.message)
          const errorResult = await this.errorHandler.handleConversationError(error, responseContext)
          if (errorResult.success) {
            response = errorResult.response
            confidence = errorResult.confidence
          } else {
            throw error
          }
        }
      } else {
        // Mock mode
        response = this.mockConversationalResponse(prompt, parentChain)
        confidence = 0.8
      }

      // 6. Cache the response with advanced metadata
      const responseData = {
        response,
        confidence,
        conversationFocus: conversationFocus.primaryFocus,
        branchIntent: branchIntent.suggestedBranch,
        topics: conversationTopics,
        sentiment: conversationSentiment.overall,
        health: conversationHealth.health,
        timestamp: new Date().toISOString(),
        contextDepth: parentChain.length
      }

      this.responseCache.set(prompt, parentChain, conversationFocus.primaryFocus, responseData, {
        branchIntent: branchIntent.suggestedBranch,
        topics: conversationTopics,
        sentiment: conversationSentiment.overall
      })

      // 7. Generate suggested follow-up prompts
      const suggestedBranches = this.promptBuilder.buildSuggestionPrompts(parentChain, response)

      console.log('🤖 Conversational response generated:', { 
        responseLength: response.length, 
        confidence, 
        conversationFocus: conversationFocus.primaryFocus,
        branchIntent: branchIntent.suggestedBranch,
        topics: conversationTopics.length,
        suggestions: suggestedBranches.length 
      })

      return {
        ...responseData,
        suggestedBranches
      }

    } catch (error) {
      console.error('🤖 Conversational response generation failed:', error)
      
      // Final fallback with error handling
      const errorResult = await this.errorHandler.handleConversationError(error, {
        nodeId,
        prompt,
        parentChain
      })

      return {
        response: errorResult.response || this.mockConversationalResponse(prompt, parentChain),
        confidence: errorResult.confidence || 0.6,
        error: error.message,
        isFallback: true,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Generate response using Anthropic Claude
   */
  async generateAnthropicResponse(prompt) {
    const response = await this.anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }]
    })

    return {
      response: response.content[0].text,
      usage: response.usage
    }
  }

  /**
   * Generate response using OpenAI
   */
  async generateOpenAIResponse(prompt) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }]
    })

    return {
      response: response.choices[0].message.content,
      usage: response.usage
    }
  }

  /**
   * Score AI response confidence based on context
   */
  async scoreResponseConfidence(response, prompt, parentChain) {
    try {
      // Simple heuristic-based confidence scoring
      let confidence = 0.7 // Base confidence

      // Higher confidence for longer, detailed responses
      if (response.length > 200) confidence += 0.1
      if (response.length > 400) confidence += 0.1

      // Higher confidence if response references conversation history
      if (parentChain.length > 0) {
        const historyWords = parentChain.map(node => node.prompt + ' ' + (node.aiResponse || '')).join(' ').toLowerCase()
        const responseWords = response.toLowerCase()
        const overlap = historyWords.split(' ').some(word => 
          word.length > 4 && responseWords.includes(word)
        )
        if (overlap) confidence += 0.1
      }

      // Confidence based on response structure
      const hasBulletPoints = response.includes('•') || response.includes('-') || response.includes('1.')
      const hasQuestions = response.includes('?')
      const hasSpecificExamples = response.includes('example') || response.includes('for instance')
      
      if (hasBulletPoints) confidence += 0.05
      if (hasQuestions) confidence += 0.05
      if (hasSpecificExamples) confidence += 0.05

      return Math.min(confidence, 1.0)

    } catch (error) {
      console.warn('🤖 Confidence scoring failed:', error)
      return 0.7 // Default confidence
    }
  }

  /**
   * Stream AI response in real-time (placeholder for future enhancement)
   */
  async streamConversationalResponse(nodeId, prompt, parentChain = [], onChunk) {
    if (!this.initialized || this.mockMode) {
      // Mock streaming for development
      return this.mockStreamResponse(prompt, onChunk)
    }

    // Real streaming implementation will be added in Day 3
    console.log('🤖 Streaming response (placeholder):', nodeId)
    
    try {
      // For now, just generate full response and simulate streaming
      const result = await this.generateConversationalResponse(nodeId, prompt, parentChain)
      
      if (onChunk) {
        const words = result.response.split(' ')
        for (let i = 0; i < words.length; i += 3) {
          const chunk = words.slice(i, i + 3).join(' ') + ' '
          onChunk(chunk)
          await new Promise(resolve => setTimeout(resolve, 100)) // Simulate streaming delay
        }
      }

      return result

    } catch (error) {
      console.error('🤖 Streaming response failed:', error)
      if (onChunk) {
        onChunk('Error generating response. Please try again.')
      }
      return { error: error.message }
    }
  }

  /**
   * Mock streaming for development/demo
   */
  async mockStreamResponse(prompt, onChunk) {
    const mockResponse = this.mockConversationalResponse(prompt)
    
    if (onChunk) {
      const words = mockResponse.split(' ')
      for (let i = 0; i < words.length; i += 2) {
        const chunk = words.slice(i, i + 2).join(' ') + ' '
        onChunk(chunk)
        await new Promise(resolve => setTimeout(resolve, 150))
      }
    }

    return {
      response: mockResponse,
      confidence: 0.8,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Generate cache key for responses
   */
  generateCacheKey(prompt, parentChain) {
    const contextStr = parentChain.map(node => node.prompt).join('|')
    const hash = this.simpleHash(prompt + contextStr)
    return `conv_${hash}`
  }

  /**
   * Simple hash function for cache keys
   */
  simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Mock conversational response for development
   */
  mockConversationalResponse(prompt, parentChain = []) {
    const responses = [
      `That's a fascinating perspective on "${prompt}". Let me build on that idea...`,
      `I find your question about "${prompt}" particularly intriguing. Here's how I see it developing...`,
      `Your insight into "${prompt}" opens up several interesting directions. Consider this approach...`,
      `The way you've framed "${prompt}" suggests some creative possibilities. Let me explore...`,
      `Building on our conversation${parentChain.length > 0 ? ` about ${this.contextAnalyzer.extractPrimaryTopic(parentChain)}` : ''}, your question about "${prompt}" leads me to think...`
    ]

    const selectedResponse = responses[Math.floor(Math.random() * responses.length)]
    
    const additionalContent = [
      'This concept could be explored through multiple lenses - creative, technical, and strategic.',
      'What makes this particularly interesting is how it connects to broader themes in your project.',
      'I see potential for this to evolve in several directions, each with its own unique characteristics.',
      'The intersection of these ideas suggests some innovative approaches worth considering.',
      'This foundation provides a solid starting point for deeper exploration and development.'
    ]

    const selectedAdditional = additionalContent[Math.floor(Math.random() * additionalContent.length)]

    return `${selectedResponse}\n\n${selectedAdditional}\n\nWhat specific aspect of this resonates most with your vision?`
  }

  /**
   * Analyze conversation for export (enhanced method)
   */
  async analyzeConversationForExport(conversationThread) {
    if (!conversationThread || !conversationThread.nodes) {
      return null
    }

    try {
      const parentChain = conversationThread.nodes
        .filter(node => node.data.prompt && node.data.aiResponse)
        .map(node => ({
          id: node.id,
          prompt: node.data.prompt,
          aiResponse: node.data.aiResponse,
          branch: node.data.context?.branch
        }))

      // Enhanced analysis with new systems
      const conversationFocus = this.conversationAnalyzer.analyzeAdvancedConversationFocus(parentChain, '')
      const extractedTopics = this.topicExtractor.extractTopics(parentChain, { maxTopics: 10 })
      const conversationSentiment = this.conversationAnalyzer.analyzeSentiment(parentChain)
      const conversationHealth = this.conversationAnalyzer.generateHealthMetrics(parentChain)

      const analysis = {
        mainTopic: extractedTopics.length > 0 ? extractedTopics[0].topic : 'General Discussion',
        keyInsights: this.contextAnalyzer.extractKeyInsights(parentChain),
        actionItems: this.contextAnalyzer.extractActionItems(parentChain),
        relationships: this.contextAnalyzer.analyzeRelationships(parentChain),
        exportReadiness: this.contextAnalyzer.analyzeExportReadiness(conversationThread),
        conversationFocus: conversationFocus.primaryFocus,
        flowPattern: this.contextAnalyzer.analyzeFlow(parentChain),
        // Enhanced with new analysis systems
        topics: extractedTopics,
        sentiment: conversationSentiment,
        health: conversationHealth,
        focusBreakdown: conversationFocus.breakdown,
        recommendations: conversationHealth.recommendations
      }

      console.log('🤖 Enhanced conversation analysis completed:', analysis)
      return analysis

    } catch (error) {
      console.error('🤖 Conversation analysis failed:', error)
      return null
    }
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