import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, flag_name, enabled, tiers } = await req.json();

    if (action === 'get') {
      // Get all feature flags
      const flags = await base44.entities.FeatureFlag.list();
      return Response.json({ flags });
    }

    if (action === 'get_single') {
      const flags = await base44.entities.FeatureFlag.filter({
        feature_name: flag_name
      });
      if (!flags.length) {
        return Response.json({ error: 'Flag not found' }, { status: 404 });
      }
      return Response.json({ flag: flags[0] });
    }

    if (action === 'set') {
      // Create or update flag
      const existing = await base44.entities.FeatureFlag.filter({
        feature_name: flag_name
      });

      if (existing.length > 0) {
        // Update
        await base44.entities.FeatureFlag.update(existing[0].id, {
          enabled,
          tiers: tiers || existing[0].tiers
        });
        return Response.json({
          status: 'updated',
          flag_name,
          enabled,
          tiers
        });
      } else {
        // Create
        await base44.entities.FeatureFlag.create({
          feature_name: flag_name,
          display_name: flag_name.replace(/_/g, ' '),
          enabled,
          tiers: tiers || {
            starter: false,
            professional: true,
            enterprise: true
          }
        });
        return Response.json({
          status: 'created',
          flag_name,
          enabled,
          tiers
        });
      }
    }

    if (action === 'check') {
      // Check if feature enabled for specific tier
      const flags = await base44.entities.FeatureFlag.filter({
        feature_name: flag_name
      });

      if (!flags.length) {
        return Response.json({ enabled: false });
      }

      const flag = flags[0];
      const tierEnabled = flag.tiers?.[tiers] ?? false;
      const globallyEnabled = flag.enabled ?? true;

      return Response.json({
        enabled: globallyEnabled && tierEnabled,
        flag
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});