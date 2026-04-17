import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Users2, Briefcase, Zap, Gift, Network } from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import RegionalSelector from './RegionalSelector';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/clients', label: 'Clients', icon: Users },
  { path: '/volunteers', label: 'Volunteers', icon: Users2 },
  { path: '/jobs', label: 'Jobs', icon: Briefcase },
  { path: '/sessions', label: 'Sessions', icon: Zap },
  { path: '/grants', label: 'Grants', icon: Gift },
  { path: '/sync-log', label: 'Sync Log', icon: Network },
];

export default function Sidebar() {
  const location = useLocation();
  const [currentRegion, setCurrentRegion] = React.useState('national');
  const [currentBranch, setCurrentBranch] = React.useState(null);

  const handleRegionChange = (region) => {
    setCurrentRegion(region);
    sessionStorage.setItem('selectedRegion', region);
    if (region === 'national') {
      sessionStorage.removeItem('selectedBranch');
      setCurrentBranch(null);
    }
  };

  const handleBranchChange = (branch) => {
    setCurrentBranch(branch);
    sessionStorage.setItem('selectedBranch', JSON.stringify(branch));
    sessionStorage.setItem('selectedRegion', 'branch');
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
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
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