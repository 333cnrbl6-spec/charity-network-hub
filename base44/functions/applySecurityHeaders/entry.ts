import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Middleware handler - call this in your API gateway or before route handlers
Deno.serve(async (req) => {
  // Only validate for non-preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'https://app.charityhub.com',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  try {
    const base44 = createClientFromRequest(req);
    
    return Response.json({ status: 'security_headers_applied' }, {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Access-Control-Allow-Origin': 'https://app.charityhub.com',
        'Access-Control-Allow-Credentials': 'true',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});