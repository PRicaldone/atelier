/**
 * Mind Garden v5.1 - Intelligent Prompt Builder
 * Builds contextual prompts for AI based on conversation history
 */

import { CONVERSATION_FOCUS, BRANCH_TYPES } from '../modules/mind-garden/types/conversationTypes';

export class PromptBuilder {
  constructor() {
    this.systemPrompts = new Map();
    this.initializeSystemPrompts();
  }

  /**
   * Initialize system prompts for different conversation types
   */
  initializeSystemPrompts() {
    this.systemPrompts.set(CONVERSATION_FOCUS.CREATIVE, {
      identity: "You are a creative AI assistant specializing in artistic and conceptual development",
      approach: "Focus on imaginative thinking, visual concepts, and creative exploration",
      style: "Be inspiring, open-minded, and encourage bold creative directions",
      language: "IMPORTANT: Always respond in the same language as the user's input. If the user writes in Italian, respond in Italian. If in English, respond in English."
    });

    this.systemPrompts.set(CONVERSATION_FOCUS.TECHNICAL, {
      identity: "You are a technical AI assistant with expertise in software development and implementation",
      approach: "Provide specific, actionable technical guidance with concrete examples",
      style: "Be precise, practical, and include specific tools, frameworks, and implementation details",
      language: "IMPORTANT: Always respond in the same language as the user's input. If the user writes in Italian, respond in Italian. If in English, respond in English."
    });

    this.systemPrompts.set(CONVERSATION_FOCUS.STRATEGIC, {
      identity: "You are a strategic AI assistant focused on planning and goal achievement",
      approach: "Think systematically about objectives, timelines, and resource allocation",
      style: "Be structured, goal-oriented, and consider broader implications and dependencies",
      language: "IMPORTANT: Always respond in the same language as the user's input. If the user writes in Italian, respond in Italian. If in English, respond in English."
    });

    this.systemPrompts.set(CONVERSATION_FOCUS.ANALYTICAL, {
      identity: "You are an analytical AI assistant specializing in critical thinking and evaluation",
      approach: "Examine ideas from multiple angles, identify strengths and weaknesses",
      style: "Be thorough, objective, and provide balanced analysis with evidence-based reasoning",
      language: "IMPORTANT: Always respond in the same language as the user's input. If the user writes in Italian, respond in Italian. If in English, respond in English."
    });
  }

  /**
   * Build contextual prompt for AI response generation
   */
  buildContextualPrompt({ 
    currentPrompt, 
    conversationHistory, 
    conversationType, 
    branchIntent, 
    depth, 
    primaryTopic, 
    conversationFlow 
  }) {
    const systemPrompt = this.systemPrompts.get(conversationType) || this.systemPrompts.get(CONVERSATION_FOCUS.CREATIVE);
    
    console.log('🎯 PromptBuilder debug:', { 
      currentPrompt, 
      conversationHistoryLength: conversationHistory?.length || 0,
      depth,
      lastExchangePrompt: conversationHistory?.[conversationHistory.length - 1]?.prompt,
      lastExchangeResponseExists: !!conversationHistory?.[conversationHistory.length - 1]?.response,
      lastExchangeResponseLength: conversationHistory?.[conversationHistory.length - 1]?.response?.length || 0,
      lastExchangeResponsePreview: conversationHistory?.[conversationHistory.length - 1]?.response?.substring(0, 100) + '...'
    });
    
    // Build the comprehensive prompt
    const prompt = this.assemblePrompt({
      systemPrompt,
      currentPrompt,
      conversationHistory,
      branchIntent,
      depth,
      primaryTopic,
      conversationFlow,
      conversationType
    });

    return prompt;
  }

  /**
   * Assemble the complete AI prompt
   */
  assemblePrompt({ 
    systemPrompt, 
    currentPrompt, 
    conversationHistory, 
    branchIntent, 
    depth, 
    primaryTopic, 
    conversationFlow,
    conversationType 
  }) {
    const sections = [];

    // 1. System Identity and Approach
    sections.push(`${systemPrompt.identity}. ${systemPrompt.approach} ${systemPrompt.style}\n\n${systemPrompt.language}`);

    // 2. Current Context
    sections.push(`\n**Current Context:**
- Conversation Topic: ${primaryTopic}
- Conversation Type: ${conversationType}
- Current Depth: ${depth} levels deep
- Flow Pattern: ${conversationFlow}
- Branch Intent: ${branchIntent}`);

    // 3. Conversation History (if exists)
    if (conversationHistory && conversationHistory.length > 0) {
      const lastExchange = conversationHistory[conversationHistory.length - 1];
      
      // For child nodes: emphasize the AI response more
      if (lastExchange && lastExchange.response && depth > 0) {
        sections.push(`\n**Previous Context:**`);
        sections.push(`The user previously asked: "${lastExchange.prompt}"`);
        sections.push(`\n**Most Recent AI Response (THIS IS THE KEY CONTEXT):**`);
        sections.push(`"${lastExchange.response}"`);
        sections.push(`\n**Current User Input:** "${currentPrompt}"`);
        sections.push(`\nThe user is now asking you to work with/respond to the AI response above, not the original question.`);
      } else {
        // For root nodes: show normal history
        sections.push(`\n**Conversation History:**`);
        conversationHistory.forEach((exchange, index) => {
          sections.push(`\n${index + 1}. User: "${exchange.prompt}"`);
          if (exchange.response) {
            sections.push(`   AI: "${this.truncateResponse(exchange.response)}"`);
          }
          if (exchange.branch && exchange.branch !== BRANCH_TYPES.EXPLORATION) {
            sections.push(`   [Branch: ${exchange.branch}]`);
          }
        });
      }
    }

    // 4. Branch-Specific Instructions
    sections.push(this.getBranchInstructions(branchIntent, depth));

    // 5. Current User Input
    sections.push(`\n**Current User Input:** "${currentPrompt}"`);

    // 6. Response Guidelines
    sections.push(this.getResponseGuidelines(conversationType, branchIntent, depth));

    return sections.join('\n');
  }

  /**
   * Get branch-specific instructions
   */
  getBranchInstructions(branchIntent, depth) {
    switch (branchIntent) {
      case BRANCH_TYPES.EXPLORATION:
        return `\n**Branch Focus - Exploration:**
- Build naturally on the conversation history
- Explore new directions and possibilities
- Ask thought-provoking questions
- Suggest related concepts and connections
- Maintain creative momentum${depth > 2 ? '\n- Synthesize insights from earlier exchanges' : ''}`;

      case BRANCH_TYPES.REFINEMENT:
        return `\n**Branch Focus - Refinement:**
- Improve and polish the current concepts
- Add depth and detail to existing ideas
- Identify areas for enhancement
- Suggest specific improvements
- Focus on quality over quantity${depth > 2 ? '\n- Reference earlier conversation points for consistency' : ''}`;

      case BRANCH_TYPES.IMPLEMENTATION:
        return `\n**Branch Focus - Implementation:**
- Provide actionable, concrete guidance
- Break down concepts into specific steps
- Suggest tools, methods, and resources
- Consider practical constraints and challenges
- Focus on "how-to" rather than "what-if"${depth > 2 ? '\n- Build on the foundation established in earlier exchanges' : ''}`;

      case BRANCH_TYPES.CRITIQUE:
        return `\n**Branch Focus - Critical Analysis:**
- Examine ideas objectively and thoroughly
- Identify potential problems and limitations
- Suggest alternative approaches
- Consider different perspectives and viewpoints
- Balance criticism with constructive suggestions${depth > 2 ? '\n- Evaluate the entire conversation thread for consistency' : ''}`;

      default:
        return '\n**Branch Focus:** Continue the natural flow of conversation with thoughtful responses.';
    }
  }

  /**
   * Get response guidelines based on context
   */
  getResponseGuidelines(conversationType, branchIntent, depth) {
    const baseGuidelines = `\n**Response Guidelines:**
- Length: 2-4 paragraphs (100-300 words)
- Tone: Professional yet conversational
- Structure: Clear and well-organized
- Relevance: Directly address the user's input while building on conversation history`;

    const contextSpecific = this.getContextSpecificGuidelines(conversationType);
    const depthGuidelines = this.getDepthGuidelines(depth);

    return `${baseGuidelines}\n${contextSpecific}${depthGuidelines}`;
  }

  /**
   * Get guidelines specific to conversation type
   */
  getContextSpecificGuidelines(conversationType) {
    switch (conversationType) {
      case CONVERSATION_FOCUS.CREATIVE:
        return `- Creativity: Use vivid language and inspiring examples
- Imagination: Encourage bold thinking and artistic vision
- Visual: Include references to colors, textures, compositions when relevant`;

      case CONVERSATION_FOCUS.TECHNICAL:
        return `- Specificity: Include specific tools, frameworks, and code examples
- Practicality: Focus on implementable solutions
- Accuracy: Ensure technical details are correct and current`;

      case CONVERSATION_FOCUS.STRATEGIC:
        return `- Structure: Organize ideas into clear phases or steps
- Planning: Consider timelines, resources, and dependencies
- Goals: Connect responses to broader objectives and outcomes`;

      case CONVERSATION_FOCUS.ANALYTICAL:
        return `- Evidence: Support points with reasoning and examples
- Balance: Present multiple perspectives fairly
- Depth: Examine underlying assumptions and implications`;

      default:
        return '- Adaptability: Respond naturally to the conversation flow';
    }
  }

  /**
   * Get guidelines based on conversation depth
   */
  getDepthGuidelines(depth) {
    if (depth === 0) {
      return `\n- Foundation: Set a strong foundation for future conversation
- Clarity: Ensure your response is easy to understand and build upon`;
    } else if (depth <= 2) {
      return `\n- Building: Build meaningfully on the established foundation
- Connections: Make clear connections to previous exchanges`;
    } else if (depth <= 5) {
      return `\n- Synthesis: Synthesize insights from the conversation thread
- Evolution: Show how ideas have evolved and developed
- Depth: Add sophisticated nuance to the discussion`;
    } else {
      return `\n- Mastery: Demonstrate deep understanding of the conversation thread
- Integration: Seamlessly integrate all previous context
- Sophistication: Provide expert-level insights and connections`;
    }
  }

  /**
   * Truncate AI response for context (keep it manageable)
   */
  truncateResponse(response, maxLength = 150) {
    if (!response || response.length <= maxLength) {
      return response;
    }
    
    const truncated = response.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > maxLength * 0.8 ? 
      truncated.substring(0, lastSpace) + '...' : 
      truncated + '...';
  }

  /**
   * Build confidence scoring prompt
   */
  buildConfidencePrompt(prompt, conversationHistory) {
    return `Evaluate your confidence in responding to this prompt given the conversation context:

Prompt: "${prompt}"
Context Depth: ${conversationHistory.length} previous exchanges

Rate your confidence (0.0-1.0) based on:
- How well you understand the user's intent
- Your ability to provide helpful, accurate information
- The clarity of the conversation context
- Your expertise in the topic area

Return only a number between 0.0 and 1.0.`;
  }

  /**
   * Build suggestion prompts for conversation continuation
   */
  buildSuggestionPrompts(conversationHistory, currentResponse) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return [];
    }

    const lastExchange = conversationHistory[conversationHistory.length - 1];
    const topic = this.extractTopicKeywords(lastExchange);

    return [
      `How might we implement ${topic}?`,
      `What are the challenges with ${topic}?`,
      `Can you explore alternatives to ${topic}?`,
      `What would be the next step for ${topic}?`
    ].slice(0, 3); // Limit to 3 suggestions
  }

  /**
   * Extract topic keywords for suggestions
   */
  extractTopicKeywords(exchange) {
    const text = `${exchange.prompt} ${exchange.response || ''}`.toLowerCase();
    const words = text.split(/\s+/)
      .filter(word => word.length > 4)
      .filter(word => !['should', 'would', 'could', 'might', 'think', 'about'].includes(word));
    
    return words.slice(0, 2).join(' ') || 'this concept';
  }

  /**
   * Build streaming prompt for real-time responses
   */
  buildStreamingPrompt(basePrompt) {
    return `${basePrompt}

**STREAMING INSTRUCTIONS:**
- Respond in a natural, conversational flow
- Start with the most important points
- Structure your response to be readable as it streams
- Use clear transitions between ideas
- End with a complete thought

Begin your response:`;
  }
}

export default PromptBuilder;