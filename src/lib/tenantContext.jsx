/**
 * Multi-Tenant Context & Utilities
 * 
 * Architecture:
 *  - Each "Tenant" is an organisation (e.g. Age UK Bury, Mind Manchester)
 *  - All entities reference tenant_id for data isolation
 *  - Platform admins (role === 'admin') see ALL tenants
 *  - Tenant admins see only their own tenant's data
 *  - Users are scoped to their tenant via TenantUser records
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const [currentTenant, setCurrentTenant] = useState(null);
  const [tenantUser, setTenantUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTenantContext();
  }, []);

  const loadTenantContext = async () => {
    try {
      const user = await base44.auth.me();
      if (!user) { setLoading(false); return; }

      // Platform admins: no tenant scoping required
      if (user.role === 'admin') { setLoading(false); return; }

      // For tenant users: look up their TenantUser record
      const tenantUsers = await base44.entities.TenantUser.filter({ user_email: user.email });
      const tu = tenantUsers?.[0];
      if (!tu) { setLoading(false); return; }

      setTenantUser(tu);

      const tenants = await base44.entities.Tenant.filter({ tenant_id: tu.tenant_id });
      if (tenants?.[0]) setCurrentTenant(tenants[0]);
    } catch (e) {
      console.warn('Tenant context load failed:', e.message);
    }
    setLoading(false);
  };

  return (
    <TenantContext.Provider value={{ currentTenant, tenantUser, loading, reload: loadTenantContext }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}

// ─── Tier feature gates ────────────────────────────────────────────────────────
export const TIER_MODULES = {
  essential: [
    'incident_management', 'client_directory', 'volunteer_directory',
    'email_alerts', 'basic_audit_trail', 'knowledge_base'
  ],
  professional: [
    'incident_management', 'client_directory', 'volunteer_directory',
    'email_alerts', 'audit_trail', 'knowledge_base',
    'ai_risk_assessment', 'analytics_dashboard', 'dbs_verification',
    'external_notifications', 'training_tracking', 'peer_review',
    'safeguarding_analytics', 'referral_letter_generator', 'secure_file_upload'
  ],
  enterprise: [
    'incident_management', 'client_directory', 'volunteer_directory',
    'email_alerts', 'audit_trail', 'knowledge_base',
    'ai_risk_assessment', 'analytics_dashboard', 'dbs_verification',
    'external_notifications', 'training_tracking', 'peer_review',
    'safeguarding_analytics', 'referral_letter_generator', 'secure_file_upload',
    'multi_location', 'custom_branding', 'api_access', 'sso',
    'advanced_reporting', 'white_label'
  ]
};

export function hasModule(tenant, module) {
  if (!tenant) return false;
  const tier = tenant.subscription_tier || 'essential';
  const tierModules = TIER_MODULES[tier] || TIER_MODULES.essential;
  const enabled = tenant.enabled_modules || [];
  return tierModules.includes(module) || enabled.includes(module);
}

export function isActiveSubscription(tenant) {
  if (!tenant) return false;
  return ['trial', 'active'].includes(tenant.subscription_status);
}

export const TIER_LABELS = {
  essential: { label: 'Essential', color: 'bg-blue-100 text-blue-800', price: '£299/mo' },
  professional: { label: 'Professional', color: 'bg-purple-100 text-purple-800', price: '£799/mo' },
  enterprise: { label: 'Enterprise', color: 'bg-amber-100 text-amber-800', price: 'Custom' },
};

export const STATUS_LABELS = {
  trial: { label: 'Trial', color: 'bg-yellow-100 text-yellow-800' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  suspended: { label: 'Suspended', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
  pending_payment: { label: 'Payment Pending', color: 'bg-orange-100 text-orange-800' },
};