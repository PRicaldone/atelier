/**
 * Health Check Endpoint - Simple API status check
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are accepted'
    });
  }
  
  try {
    // Simple health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        proxy: 'operational',
        storage: 'operational',
        auth: 'operational'
      },
      version: '1.0.0'
    };
    
    res.status(200).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}