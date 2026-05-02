import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, charity_id, key_name, permissions, key_id } = await req.json();

    if (action === 'generate') {
      // Generate new API key
      const keyString = `sk_${crypto.getRandomValues(new Uint8Array(32)).toString()}`;
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(keyString));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const keyPreview = keyString.slice(-4);

      const apiKey = await base44.entities.APIKey.create({
        charity_id,
        name: key_name,
        key_hash: hashHex,
        key_preview: keyPreview,
        permissions,
        created_by: user.email
      });

      return Response.json({ 
        success: true, 
        api_key: keyString,
        key_id: apiKey.id,
        message: 'Save this key securely—you won\'t be able to view it again'
      });
    }

    if (action === 'revoke') {
      await base44.entities.APIKey.update(key_id, { status: 'revoked' });
      return Response.json({ success: true, message: 'API key revoked' });
    }

    if (action === 'list') {
      const keys = await base44.entities.APIKey.filter({ charity_id });
      return Response.json({ keys });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});