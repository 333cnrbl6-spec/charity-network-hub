/**
 * Tenant Admin Backend Function
 * Handles: create tenant, update tenant, suspend/reactivate, provision user, get tenant stats
 * All operations require platform admin role.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Platform admin required' }, { status: 403 });

    const body = await req.json();
    const { action } = body;

    // ─── Create Tenant ────────────────────────────────────────────────────────
    if (action === 'create_tenant') {
      const { org_name, org_type, charity_number, primary_contact_name, primary_contact_email,
              primary_contact_phone, address, postcode, region, subscription_tier, billing_cycle } = body;

      if (!org_name || !primary_contact_email) {
        return Response.json({ error: 'org_name and primary_contact_email required' }, { status: 400 });
      }

      const tenant_id = org_name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 40) + '-' + Date.now().toString(36);

      const tierPrices = { essential: 299, professional: 799, enterprise: 0 };
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 30);

      const enabledModules = {
        essential: ['incident_management', 'client_directory', 'volunteer_directory', 'email_alerts', 'basic_audit_trail', 'knowledge_base'],
        professional: ['incident_management', 'client_directory', 'volunteer_directory', 'email_alerts', 'audit_trail', 'knowledge_base', 'ai_risk_assessment', 'analytics_dashboard', 'dbs_verification', 'external_notifications', 'training_tracking', 'peer_review', 'safeguarding_analytics', 'referral_letter_generator', 'secure_file_upload'],
        enterprise: ['incident_management', 'client_directory', 'volunteer_directory', 'email_alerts', 'audit_trail', 'knowledge_base', 'ai_risk_assessment', 'analytics_dashboard', 'dbs_verification', 'external_notifications', 'training_tracking', 'peer_review', 'safeguarding_analytics', 'referral_letter_generator', 'secure_file_upload', 'multi_location', 'custom_branding', 'api_access', 'sso', 'advanced_reporting', 'white_label']
      };

      const tier = subscription_tier || 'professional';

      const tenant = await base44.asServiceRole.entities.Tenant.create({
        tenant_id,
        org_name,
        org_type: org_type || 'independent_charity',
        charity_number: charity_number || '',
        primary_contact_name: primary_contact_name || '',
        primary_contact_email,
        primary_contact_phone: primary_contact_phone || '',
        address: address || '',
        postcode: postcode || '',
        region: region || '',
        subscription_tier: tier,
        subscription_status: 'trial',
        trial_ends_date: trialEnd.toISOString().split('T')[0],
        billing_cycle: billing_cycle || 'monthly',
        monthly_fee_gbp: tierPrices[tier] || 799,
        enabled_modules: enabledModules[tier] || enabledModules.professional,
        max_users: tier === 'essential' ? 5 : null,
        user_count: 1,
        onboarded: false,
        health_score: 0,
        last_active_date: new Date().toISOString()
      });

      // Create the first TenantUser (primary contact as tenant_admin)
      await base44.asServiceRole.entities.TenantUser.create({
        tenant_id,
        user_email: primary_contact_email,
        user_name: primary_contact_name || '',
        tenant_role: 'tenant_admin',
        is_active: true,
        invited_by: user.email,
        enabled_modules: enabledModules[tier] || enabledModules.professional
      });

      // Audit log
      await base44.asServiceRole.entities.TenantAuditLog.create({
        tenant_id,
        actor_email: user.email,
        actor_name: user.full_name || user.email,
        action: 'tenant_created',
        new_value: { org_name, subscription_tier: tier }
      });

      return Response.json({ success: true, tenant });
    }

    // ─── Update Tenant ────────────────────────────────────────────────────────
    if (action === 'update_tenant') {
      const { id, updates } = body;
      const tenant = await base44.asServiceRole.entities.Tenant.update(id, updates);

      await base44.asServiceRole.entities.TenantAuditLog.create({
        tenant_id: updates.tenant_id || id,
        actor_email: user.email,
        actor_name: user.full_name || user.email,
        action: 'tenant_updated',
        new_value: updates
      });

      return Response.json({ success: true, tenant });
    }

    // ─── Activate (convert trial → active) ───────────────────────────────────
    if (action === 'activate_tenant') {
      const { id, tenant_id } = body;
      const tenant = await base44.asServiceRole.entities.Tenant.update(id, { subscription_status: 'active' });

      await base44.asServiceRole.entities.TenantAuditLog.create({
        tenant_id,
        actor_email: user.email,
        actor_name: user.full_name || user.email,
        action: 'tenant_activated',
        new_value: { subscription_status: 'active' }
      });

      return Response.json({ success: true, tenant });
    }

    // ─── Suspend / Reactivate ─────────────────────────────────────────────────
    if (action === 'suspend_tenant' || action === 'reactivate_tenant') {
      const { id, tenant_id } = body;
      const newStatus = action === 'suspend_tenant' ? 'suspended' : 'active';
      const tenant = await base44.asServiceRole.entities.Tenant.update(id, { subscription_status: newStatus });

      await base44.asServiceRole.entities.TenantAuditLog.create({
        tenant_id,
        actor_email: user.email,
        actor_name: user.full_name || user.email,
        action: action === 'suspend_tenant' ? 'tenant_suspended' : 'tenant_reactivated',
        new_value: { subscription_status: newStatus }
      });

      return Response.json({ success: true, tenant });
    }

    // ─── Get Platform Stats ───────────────────────────────────────────────────
    if (action === 'get_platform_stats') {
      const [tenants, tenantUsers] = await Promise.all([
        base44.asServiceRole.entities.Tenant.list(),
        base44.asServiceRole.entities.TenantUser.list()
      ]);

      const stats = {
        total_tenants: tenants.length,
        active_tenants: tenants.filter(t => t.subscription_status === 'active').length,
        trial_tenants: tenants.filter(t => t.subscription_status === 'trial').length,
        suspended_tenants: tenants.filter(t => t.subscription_status === 'suspended').length,
        total_users: tenantUsers.filter(u => u.is_active).length,
        by_tier: {
          essential: tenants.filter(t => t.subscription_tier === 'essential').length,
          professional: tenants.filter(t => t.subscription_tier === 'professional').length,
          enterprise: tenants.filter(t => t.subscription_tier === 'enterprise').length,
        },
        mrr: tenants
          .filter(t => t.subscription_status === 'active')
          .reduce((sum, t) => sum + (t.monthly_fee_gbp || 0), 0),
      };

      return Response.json({ success: true, stats, tenants });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});