import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Users2, Briefcase, Zap, Gift, Network, Globe, Map, AlertCircle, MapPin, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import RegionalSelector from './RegionalSelector';
import { playClick, playCover } from '@/lib/audio';



export default function Sidebar() {
  const location = useLocation();
  const [currentRegion, setCurrentRegion] = React.useState('national');
  const [currentBranch, setCurrentBranch] = React.useState(null);
  const [viewMode, setViewMode] = React.useState('national'); // 'national', 'regional', 'branch'

  // Sync sidebar state with URL changes
  React.useEffect(() => {
    if (location.pathname.startsWith('/regional/')) {
      const region = location.pathname.split('/')[2];
      setCurrentRegion(region);
      setViewMode('regional');
      sessionStorage.setItem('selectedRegion', region);
    } else if (location.pathname.startsWith('/branch/')) {
      const branchId = location.pathname.split('/')[2];
      setViewMode('branch');
      setCurrentRegion('branch');
    } else if (location.pathname === '/') {
      setCurrentRegion('national');
      setViewMode('national');
      sessionStorage.setItem('selectedRegion', 'national');
    }
  }, [location.pathname]);

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

  // Navigation items based on view mode
  const getNavItems = () => {
    if (viewMode === 'branch' && currentBranch) {
      // Branch view - only branch-specific data
      return [
        { icon: LayoutDashboard, label: 'Overview', path: `/branch/${currentBranch.branch_id}` },
        { icon: Users, label: 'Clients', path: '/clients' },
        { icon: Users2, label: 'Volunteers', path: '/volunteers' },
        { icon: Briefcase, label: 'Jobs', path: '/jobs' },
        { icon: Zap, label: 'Sessions', path: '/sessions' },
        { icon: Gift, label: 'Grants', path: '/grants' },
        { icon: Network, label: 'Sync Log', path: '/sync-log' },
      ];
    }
    
    if (viewMode === 'regional') {
      // Regional view - aggregate regional data
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Globe, label: 'Regional View', path: `/regional/${currentRegion}` },
        { icon: Map, label: 'Network Map', path: '/map' },
        { icon: Network, label: 'Network Overview', path: '/network' },
        { icon: Network, label: 'Sync Status', path: '/sync-log' },
      ];
    }

    // National view - all aggregates
    return [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      { icon: Rocket, label: 'Onboarding', path: '/onboarding' },
      { icon: Globe, label: 'Network Overview', path: '/network' },
      { icon: Map, label: 'Network Map', path: '/map' },
      { icon: MapPin, label: 'Locations', path: '/locations' },
      { icon: Network, label: 'Compliance', path: '/compliance' },
      { icon: Zap, label: 'Sync Log', path: '/sync-log' },
    ];
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar text-sidebar-foreground flex flex-col z-50">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Network className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-sm leading-tight">Age UK</h1>
            <p className="text-xs text-sidebar-foreground/60">Network Hub</p>
          </div>
        </div>

        {/* Regional & Branch Selector */}
        <RegionalSelector 
          onRegionChange={handleRegionChange}
          onBranchChange={handleBranchChange}
        />
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {getNavItems().map((item) => {
           const isActive = location.pathname === item.path || 
             (item.path !== '/' && location.pathname.startsWith(item.path));
           return (
             <Link
               key={item.path}
               to={item.path}
               onClick={playClick}
               className={cn(
                 "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                 isActive
                   ? "bg-sidebar-accent text-sidebar-accent-foreground"
                   : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
               )}
             >
               <item.icon className="w-4.5 h-4.5" />
               {item.label}
             </Link>
           );
         })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/40">
          Federation Admin v1.0
        </div>
      </div>
    </aside>
  );
}