/**
 * OpenAI API Proxy - Secure server-side API calls
 * Protects API keys and provides rate limiting
 */

import OpenAI from 'openai';

// Initialize OpenAI client with server-side API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY,
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
      model = 'gpt-3.5-turbo',
      max_tokens = 1024,
      temperature = 0.7,
      stream = false
    } = req.body;
    
    // Prepare request for OpenAI
    const openaiRequest = {
      model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      })),
      max_tokens,
      temperature,
      stream
    };
    
    // Make API call to OpenAI
    const startTime = Date.now();
    const response = await openai.chat.completions.create(openaiRequest);
    const duration = Date.now() - startTime;
    
    // Log successful request (without sensitive data)
    console.log('OpenAI API call successful', {
      model,
      duration,
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
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
    console.error('OpenAI API error:', {
      message: error.message,
      type: error.type,
      status: error.status,
      timestamp: new Date().toISOString()
    });
    
    // Handle specific OpenAI errors
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
    
    if (error.status === 500) {
      return res.status(500).json({
        error: 'OpenAI server error',
        message: 'OpenAI service is temporarily unavailable'
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