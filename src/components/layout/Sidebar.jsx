import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Users2, Briefcase, Zap, Gift, Network, Globe,
  Map, AlertCircle, MapPin, Rocket, Upload, Heart, GitBranch, Search,
  TrendingUp, ShieldCheck, Building2, Settings, CalendarDays, ClipboardList,
  LogOut, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import RegionalSelector from './RegionalSelector';
import { playClick } from '@/lib/audio';

// ─────────────────────────────────────────────
// Nav item sets, scaled by role
// ─────────────────────────────────────────────

const VOLUNTEER_NAV = [
  { icon: LayoutDashboard, label: 'My Schedule', path: '/staff-portal' },
  { icon: Briefcase,       label: 'My Jobs',     path: '/jobs' },
  { icon: Users,           label: 'My Clients',  path: '/clients' },
];

const STAFF_NAV = [
  { icon: LayoutDashboard, label: 'Staff Dashboard', path: '/staff-portal' },
  { icon: Briefcase,       label: 'Jobs',            path: '/jobs' },
  { icon: Users,           label: 'Clients',         path: '/clients' },
  { icon: Zap,             label: 'Sessions',        path: '/sessions' },
];

const COORDINATOR_NAV = [
  { icon: LayoutDashboard, label: 'Coordinator Dashboard', path: '/coordinator-portal' },
  { icon: Briefcase,       label: 'Jobs',                  path: '/jobs' },
  { icon: Users,           label: 'Clients',               path: '/clients' },
  { icon: ClipboardList,   label: 'Team',                  path: '/volunteers' },
  { icon: CalendarDays,    label: 'Sessions',               path: '/sessions' },
  { icon: Gift,            label: 'Grants',                 path: '/grants' },
  { icon: ShieldCheck,     label: 'Safeguarding',           path: '/safeguarding' },
];

const OPS_MANAGER_NAV = [
  { icon: LayoutDashboard, label: 'Operations Dashboard', path: '/branch-ops' },
  { icon: Users,           label: 'Clients',              path: '/clients' },
  { icon: Users2,          label: 'Volunteers & Staff',   path: '/volunteers' },
  { icon: Briefcase,       label: 'Jobs',                 path: '/jobs' },
  { icon: Zap,             label: 'Sessions',             path: '/sessions' },
  { icon: Gift,            label: 'Grants',               path: '/grants' },
  { icon: AlertCircle,     label: 'Compliance',           path: '/compliance' },
  { icon: ShieldCheck,     label: 'Safeguarding',         path: '/safeguarding' },
  { icon: Network,         label: 'Sync & Reports',       path: '/sync-log' },
];

const BRANCH_CEO_NAV = [
  { icon: LayoutDashboard, label: 'CEO Dashboard',    path: '/branch-ceo' },
  { icon: TrendingUp,      label: 'Branch Analytics', path: '/charity-analytics' },
  { icon: Users,           label: 'Clients',          path: '/clients' },
  { icon: Users2,          label: 'Volunteers',       path: '/volunteers' },
  { icon: Briefcase,       label: 'Jobs',             path: '/jobs' },
  { icon: Gift,            label: 'Grants',           path: '/grants' },
  { icon: AlertCircle,     label: 'Compliance',       path: '/compliance' },
  { icon: ShieldCheck,     label: 'Safeguarding',     path: '/safeguarding' },
  { icon: Network,         label: 'Hub Reports',      path: '/sync-log' },
  { icon: Search,          label: 'Smart Search',     path: '/search' },
];

const BRANCH_NAV = (branchId) => [
  { icon: LayoutDashboard, label: 'Branch Dashboard', path: `/branch/${branchId}` },
  { icon: Users,           label: 'Clients',          path: '/clients' },
  { icon: Users2,          label: 'Volunteers',       path: '/volunteers' },
  { icon: Briefcase,       label: 'Jobs',             path: '/jobs' },
  { icon: Zap,             label: 'Sessions',         path: '/sessions' },
  { icon: Gift,            label: 'Grants & AI',      path: '/grants' },
  { icon: Search,          label: 'Smart Search',     path: '/search' },
  { icon: TrendingUp,      label: 'Analytics',        path: '/charity-analytics' },
  { icon: AlertCircle,     label: 'Compliance',       path: '/compliance' },
  { icon: Network,         label: 'Sync & Reports',   path: '/sync-log' },
];

const REGIONAL_NAV = (region) => [
  { icon: LayoutDashboard, label: 'Regional Dashboard',  path: `/regional/${region}` },
  { icon: Users,           label: 'All Clients',         path: '/clients' },
  { icon: Users2,          label: 'All Volunteers',      path: '/volunteers' },
  { icon: Briefcase,       label: 'All Jobs',            path: '/jobs' },
  { icon: Zap,             label: 'All Sessions',        path: '/sessions' },
  { icon: Gift,            label: 'All Grants',          path: '/grants' },
  { icon: MapPin,          label: 'Branch Map',          path: '/map' },
  { icon: AlertCircle,     label: 'Compliance Overview', path: '/compliance' },
  { icon: Network,         label: 'Sync & Reports',      path: '/sync-log' },
];

const NATIONAL_NAV = [
  { icon: LayoutDashboard, label: 'Hub Dashboard',       path: '/' },
  { icon: Heart,           label: 'Impact Dashboard',    path: '/impact' },
  { icon: TrendingUp,      label: 'Impact Analytics',    path: '/charity-analytics' },
  { icon: Search,          label: 'Smart Search',        path: '/search' },
  { icon: Globe,           label: 'Network Overview',    path: '/network' },
  { icon: MapPin,          label: 'Branch Locations',    path: '/locations' },
  { icon: Map,             label: 'Network Map',         path: '/map' },
  { icon: AlertCircle,     label: 'Network Compliance',  path: '/compliance' },
  { icon: Rocket,          label: 'Branch Onboarding',  path: '/onboarding' },
  { icon: Upload,          label: 'Data Import',         path: '/import' },
  { icon: Network,         label: 'Sync & Reports',      path: '/sync-log' },
  { icon: GitBranch,       label: 'Network Expansion',   path: '/expansion' },
  { icon: ShieldCheck,     label: 'Safeguarding Hub',    path: '/safeguarding' },
  { icon: Building2,       label: 'Platform Admin',      path: '/platform-admin' },
];

// ─────────────────────────────────────────────
// Role → sidebar label
// ─────────────────────────────────────────────
const ROLE_LABEL = {
  volunteer:                   'Volunteer Portal',
  branch_staff:                'Staff Portal',
  branch_department_coordinator: 'Coordinator Portal',
  branch_service_manager:      'Service Manager',
  branch_operations_manager:   'Operations Manager',
  branch_ceo:                  'Branch CEO',
  area_manager:                'Area Manager',
  national_governance:         'National Governance',
  national_director:           'National Director',
};

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [currentRegion, setCurrentRegion] = useState('national');
  const [currentBranch, setCurrentBranch] = useState(null);
  const [viewMode, setViewMode] = useState('national');

  const orgRole = user?.org_role;
  const branchId = user?.branch_id;

  // Determine if this user gets a role-scoped sidebar (non-hub users)
  const isRoleScoped = orgRole && !['national_director', 'national_governance'].includes(orgRole) && user?.role !== 'admin';
  const isHubUser = !isRoleScoped;

  // Sync hub sidebar state with URL changes (only for hub users)
  useEffect(() => {
    if (!isHubUser) return;
    if (location.pathname.startsWith('/regional/')) {
      const region = location.pathname.split('/')[2];
      setCurrentRegion(region);
      setViewMode('regional');
      sessionStorage.setItem('selectedRegion', region);
    } else if (location.pathname.startsWith('/branch/')) {
      setViewMode('branch');
      setCurrentRegion('branch');
    } else if (location.pathname === '/') {
      setCurrentRegion('national');
      setViewMode('national');
      sessionStorage.setItem('selectedRegion', 'national');
    }
  }, [location.pathname, isHubUser]);

  const handleRegionChange = (region) => {
    playClick();
    setCurrentRegion(region);
    setViewMode(region === 'national' ? 'national' : 'regional');
    sessionStorage.setItem('selectedRegion', region);
    if (region === 'national') {
      sessionStorage.removeItem('selectedBranch');
      setCurrentBranch(null);
    }
  };

  const handleBranchChange = (branch) => {
    playClick();
    setCurrentBranch(branch);
    setViewMode('branch');
    sessionStorage.setItem('selectedBranch', JSON.stringify(branch));
    sessionStorage.setItem('selectedRegion', 'branch');
  };

  // ── Choose the right nav items ──
  const getNavItems = () => {
    if (isRoleScoped) {
      switch (orgRole) {
        case 'volunteer':                     return VOLUNTEER_NAV;
        case 'branch_staff':                  return STAFF_NAV;
        case 'branch_department_coordinator': return COORDINATOR_NAV;
        case 'branch_service_manager':        return OPS_MANAGER_NAV;
        case 'branch_operations_manager':     return OPS_MANAGER_NAV;
        case 'branch_ceo':                    return BRANCH_CEO_NAV;
        case 'area_manager':
          return currentBranch
            ? BRANCH_NAV(currentBranch.branch_id)
            : REGIONAL_NAV(currentRegion === 'national' ? 'north_west' : currentRegion);
        default:                              return COORDINATOR_NAV;
      }
    }

    // Hub / national users: dynamic by view mode
    if (viewMode === 'branch' && currentBranch) return BRANCH_NAV(currentBranch.branch_id);
    if (viewMode === 'regional')               return REGIONAL_NAV(currentRegion);
    return NATIONAL_NAV;
  };

  const branchLabel = isRoleScoped
    ? (user?.branch_name || branchId || 'Age UK Branch')
    : (currentBranch?.branch_name || 'Age UK Network');

  const roleLabel = isRoleScoped
    ? (ROLE_LABEL[orgRole] || orgRole)
    : (viewMode === 'branch' ? 'Branch View' : viewMode === 'regional' ? 'Regional View' : 'Network Hub');

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar text-sidebar-foreground flex flex-col z-50">
      {/* Header */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <Network className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="font-heading font-bold text-sm leading-tight truncate">{branchLabel}</h1>
            <p className="text-xs text-sidebar-foreground/60 truncate">{roleLabel}</p>
          </div>
        </div>

        {/* User identity chip */}
        {user && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-sidebar-accent/40 mb-3">
            <div className="w-6 h-6 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-bold shrink-0">
              {user.full_name?.charAt(0) || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium leading-tight truncate text-sidebar-foreground">{user.full_name || user.email}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{user.job_title || ROLE_LABEL[orgRole] || 'User'}</p>
            </div>
          </div>
        )}

        {/* Hub users get the region/branch selector */}
        {isHubUser && (
          <RegionalSelector
            onRegionChange={handleRegionChange}
            onBranchChange={handleBranchChange}
          />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {getNavItems().map((item, index) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={`${item.label}-${index}`}
              to={item.path}
              onClick={playClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        <Link to="/my-organisation" onClick={playClick} className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
          <Building2 className="w-3.5 h-3.5" /> My Organisation
        </Link>
        <Link to="/pricing" onClick={playClick} className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
          <Settings className="w-3.5 h-3.5" /> Pricing & Plans
        </Link>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Log Out
        </button>
        <div className="pt-1 text-xs text-sidebar-foreground/30">SafeGuard Pro v2.0</div>
      </div>
    </aside>
  );
}