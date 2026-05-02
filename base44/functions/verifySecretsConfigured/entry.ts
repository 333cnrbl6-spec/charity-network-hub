import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { required_keys } = await req.json();
    const keysToCheck = required_keys || [
      'SENDGRID_API_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET'
    ];

    const results = {};
    let allConfigured = true;

    // Check SENDGRID
    const sgKey = Deno.env.get('SENDGRID_API_KEY');
    if (!sgKey) {
      results.sendgrid = { 
        valid: false, 
        status: 'missing',
        error: 'SENDGRID_API_KEY not set'
      };
      allConfigured = false;
    } else {
      try {
        // Verify API key is valid by calling SendGrid
        const response = await fetch('https://api.sendgrid.com/v3/mail/validate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sgKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: 'test@example.com' }] }],
            from: { email: 'test@example.com' },
            subject: 'Test',
            content: [{ type: 'text/plain', value: 'Test' }]
          })
        });

        results.sendgrid = {
          valid: response.status !== 401 && response.status !== 403,
          status: response.ok ? 'ready' : 'auth_failed',
          status_code: response.status
        };
        
        if (response.status === 401 || response.status === 403) {
          allConfigured = false;
        }
      } catch (err) {
        results.sendgrid = { valid: false, status: 'error', error: err.message };
        allConfigured = false;
      }
    }

    // Check STRIPE
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      results.stripe = { 
        valid: false, 
        status: 'missing',
        error: 'STRIPE_SECRET_KEY not set'
      };
      allConfigured = false;
    } else {
      try {
        // Verify Stripe key by calling API
        const response = await fetch('https://api.stripe.com/v1/balance', {
          headers: {
            'Authorization': `Bearer ${stripeKey}`
          }
        });

        const isLiveKey = stripeKey.startsWith('sk_live_');
        results.stripe = {
          valid: response.status !== 401,
          status: isLiveKey ? 'ready_live' : 'ready_test',
          is_live: isLiveKey,
          status_code: response.status
        };

        if (response.status === 401) {
          allConfigured = false;
        }
      } catch (err) {
        results.stripe = { valid: false, status: 'error', error: err.message };
        allConfigured = false;
      }
    }

    // Check STRIPE WEBHOOK SECRET
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      results.stripe_webhook = { 
        valid: false, 
        status: 'missing',
        error: 'STRIPE_WEBHOOK_SECRET not set'
      };
      allConfigured = false;
    } else {
      results.stripe_webhook = {
        valid: webhookSecret.length > 20,
        status: webhookSecret.length > 20 ? 'ready' : 'invalid_format'
      };
    }

    return Response.json({
      all_configured: allConfigured,
      ready_to_launch: allConfigured,
      timestamp: new Date().toISOString(),
      sendgrid: results.sendgrid,
      stripe: results.stripe,
      stripe_webhook: results.stripe_webhook,
      message: allConfigured 
        ? '✅ All secrets configured correctly. Ready to launch!'
        : '❌ Some secrets are missing or invalid. See details above.'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});