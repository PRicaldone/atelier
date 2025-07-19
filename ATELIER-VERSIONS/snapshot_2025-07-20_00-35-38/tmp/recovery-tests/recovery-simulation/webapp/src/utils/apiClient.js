/**
 * Secure API Client - Handles all API calls through server-side proxy
 * Replaces direct API calls to protect sensitive keys
 */

class APIClient {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : window.location.origin;
  }

  /**
   * Make secure API call through proxy
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}/api/${endpoint}`;
    
    const defaultOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(options.body || {})
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 60;
        throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
      }
      
      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API call failed (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Call Anthropic API through secure proxy
   */
  async callAnthropic(messages, options = {}) {
    const requestBody = {
      messages,
      model: options.model || 'claude-3-haiku-20240307',
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature || 0.7,
      system: options.system
    };

    const response = await this.makeRequest('anthropic', { body: requestBody });
    return response.data;
  }

  /**
   * Call OpenAI API through secure proxy
   */
  async callOpenAI(messages, options = {}) {
    const requestBody = {
      messages,
      model: options.model || 'gpt-3.5-turbo',
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature || 0.7,
      stream: options.stream || false
    };

    const response = await this.makeRequest('openai', { body: requestBody });
    return response.data;
  }

  /**
   * Helper method for chat completions
   */
  async chatCompletion(provider, messages, options = {}) {
    if (provider === 'anthropic') {
      return await this.callAnthropic(messages, options);
    } else if (provider === 'openai') {
      return await this.callOpenAI(messages, options);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Generate text with retry logic
   */
  async generateText(prompt, options = {}) {
    const provider = options.provider || 'anthropic';
    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 1000;
    
    const messages = [{ role: 'user', content: prompt }];
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.chatCompletion(provider, messages, options);
        
        // Extract text from response based on provider
        if (provider === 'anthropic') {
          return response.content[0]?.text || '';
        } else if (provider === 'openai') {
          return response.choices[0]?.message?.content || '';
        }
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }

  /**
   * Stream text generation (for future implementation)
   */
  async streamText(prompt, options = {}, onChunk) {
    // TODO: Implement streaming for real-time responses
    throw new Error('Streaming not yet implemented');
  }
}

// Create singleton instance
const apiClient = new APIClient();

export default apiClient;

// Export individual methods for backward compatibility
export const callAnthropic = (messages, options) => apiClient.callAnthropic(messages, options);
export const callOpenAI = (messages, options) => apiClient.callOpenAI(messages, options);
export const generateText = (prompt, options) => apiClient.generateText(prompt, options);
export const chatCompletion = (provider, messages, options) => apiClient.chatCompletion(provider, messages, options);