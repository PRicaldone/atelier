/**
 * Anthropic API Proxy - Secure server-side API calls
 * Protects API keys and provides rate limiting
 */

import { Anthropic } from '@anthropic-ai/sdk';

// Initialize Anthropic client with server-side API key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY,
});

// Rate limiting configuration
const RATE_LIMIT = {
  requests: 100, // requests per window
  window: 60 * 60 * 1000, // 1 hour in milliseconds
  requestCounts: new Map(),
};

/**
 * Simple rate limiting based on IP
 */
function checkRateLimit(req) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.window;
  
  // Clean old entries
  for (const [key, data] of RATE_LIMIT.requestCounts) {
    if (data.timestamp < windowStart) {
      RATE_LIMIT.requestCounts.delete(key);
    }
  }
  
  const userRequests = RATE_LIMIT.requestCounts.get(ip) || { count: 0, timestamp: now };
  
  if (userRequests.count >= RATE_LIMIT.requests) {
    return { allowed: false, remaining: 0 };
  }
  
  // Update counter
  userRequests.count++;
  userRequests.timestamp = now;
  RATE_LIMIT.requestCounts.set(ip, userRequests);
  
  return { 
    allowed: true, 
    remaining: RATE_LIMIT.requests - userRequests.count 
  };
}

/**
 * Validate request payload
 */
function validateRequest(body) {
  const errors = [];
  
  if (!body.messages || !Array.isArray(body.messages)) {
    errors.push('messages must be an array');
  }
  
  if (body.messages && body.messages.length === 0) {
    errors.push('messages cannot be empty');
  }
  
  if (body.max_tokens && (typeof body.max_tokens !== 'number' || body.max_tokens < 1 || body.max_tokens > 4096)) {
    errors.push('max_tokens must be a number between 1 and 4096');
  }
  
  if (body.model && typeof body.model !== 'string') {
    errors.push('model must be a string');
  }
  
  return errors;
}

/**
 * Serverless function handler
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }
  
  try {
    // Check rate limiting
    const rateCheck = checkRateLimit(req);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(RATE_LIMIT.window / 1000)
      });
    }
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT.requests);
    res.setHeader('X-RateLimit-Remaining', rateCheck.remaining);
    
    // Validate request body
    const validationErrors = validateRequest(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Invalid request',
        details: validationErrors
      });
    }
    
    // Extract and sanitize parameters
    const {
      messages,
      model = 'claude-3-haiku-20240307',
      max_tokens = 1024,
      temperature = 0.7,
      system
    } = req.body;
    
    // Prepare request for Anthropic
    const anthropicRequest = {
      model,
      max_tokens,
      temperature,
      messages: messages.map(msg => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      }))
    };
    
    // Add system message if provided
    if (system) {
      anthropicRequest.system = system;
    }
    
    // Make API call to Anthropic
    const startTime = Date.now();
    const response = await anthropic.messages.create(anthropicRequest);
    const duration = Date.now() - startTime;
    
    // Log successful request (without sensitive data)
    console.log('Anthropic API call successful', {
      model,
      duration,
      inputTokens: response.usage?.input_tokens || 0,
      outputTokens: response.usage?.output_tokens || 0,
      timestamp: new Date().toISOString()
    });
    
    // Return response
    res.status(200).json({
      success: true,
      data: response,
      meta: {
        duration,
        rateLimit: {
          remaining: rateCheck.remaining,
          limit: RATE_LIMIT.requests
        }
      }
    });
    
  } catch (error) {
    console.error('Anthropic API error:', {
      message: error.message,
      type: error.type,
      timestamp: new Date().toISOString()
    });
    
    // Handle specific Anthropic errors
    if (error.status === 400) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Invalid request parameters'
      });
    }
    
    if (error.status === 401) {
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'API authentication failed'
      });
    }
    
    if (error.status === 429) {
      return res.status(429).json({
        error: 'API rate limit exceeded',
        message: 'Please try again later'
      });
    }
    
    // Generic error response
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}

// Export for testing
export { validateRequest, checkRateLimit };