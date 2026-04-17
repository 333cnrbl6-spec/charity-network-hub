import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Users2, Briefcase, Zap, Gift, Network, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [branches, setBranches] = React.useState([]);
  const [currentBranch, setCurrentBranch] = React.useState(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await base44.entities.BranchConfig.list();
        setBranches(data || []);
        if (data && data.length > 0) {
          setCurrentBranch(data[0]);
        }
      } catch (error) {
        console.log('No branches available yet');
      }
    };
    fetchBranches();
  }, []);

  const handleBranchSelect = (branch) => {
    setCurrentBranch(branch);
    setIsDropdownOpen(false);
    // Store in session for reference
    sessionStorage.setItem('selectedBranch', JSON.stringify(branch));
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

        {/* Branch Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-sidebar-accent/30 hover:bg-sidebar-accent/50 text-sidebar-foreground text-sm transition-colors"
          >
            <span className="truncate text-left">
              {currentBranch ? currentBranch.branch_name : 'Select Branch'}
            </span>
            <ChevronDown className={cn("w-4 h-4 flex-shrink-0 transition-transform", isDropdownOpen && "rotate-180")} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-sidebar-accent border border-sidebar-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              {branches.length > 0 ? (
                branches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => handleBranchSelect(branch)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-sidebar-accent-foreground/10 transition-colors",
                      currentBranch?.id === branch.id && "bg-sidebar-primary text-sidebar-primary-foreground"
                    )}
                  >
                    {branch.branch_name}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-sidebar-foreground/50">No branches available</div>
              )}
            </div>
          )}
        </div>
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