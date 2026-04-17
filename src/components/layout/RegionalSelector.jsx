import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronDown, Globe, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const REGIONS = {
  national: { name: 'National Overview', icon: Globe },
  north_west: { name: 'North West', branches: ['manchester', 'salford', 'trafford', 'wigan', 'bury', 'bolton', 'stockport'] },
  london: { name: 'London', branches: [] },
  south_east: { name: 'South East', branches: [] },
  south_west: { name: 'South West', branches: [] },
  midlands: { name: 'Midlands', branches: [] },
  north_east: { name: 'North East', branches: [] },
  yorkshire: { name: 'Yorkshire & Humber', branches: [] },
  east_midlands: { name: 'East Midlands', branches: [] },
  east: { name: 'East', branches: [] },
  wales: { name: 'Wales', branches: [] },
};

export default function RegionalSelector({ onRegionChange, onBranchChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('national');
  const [expandedRegion, setExpandedRegion] = useState(null);
  const [branches, setBranches] = useState([]);
  const [branchesByRegion, setBranchByRegion] = useState({});

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await base44.asServiceRole.entities.BranchConfig.list();
        setBranches(data || []);
        
        // Map branches to regions
        const mapping = {};
        Object.keys(REGIONS).forEach(regionKey => {
          if (REGIONS[regionKey].branches) {
            mapping[regionKey] = data.filter(b => 
              REGIONS[regionKey].branches.includes(b.branch_id)
            );
          }
        });
        setBranchByRegion(mapping);
      } catch (error) {
        console.log('Could not fetch branches');
      }
    };
    fetchBranches();
  }, []);

  const handleRegionSelect = (regionKey) => {
    setSelectedRegion(regionKey);
    setExpandedRegion(expandedRegion === regionKey ? null : regionKey);
    onRegionChange(regionKey);
    if (regionKey === 'national') {
      setIsOpen(false);
    }
  };

  const handleBranchSelect = (branch) => {
    onBranchChange(branch);
    setIsOpen(false);
  };

  const regionLabel = REGIONS[selectedRegion]?.name || 'National Overview';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-sidebar-accent/30 hover:bg-sidebar-accent/50 text-sidebar-foreground text-sm transition-colors"
      >
        <div className="flex items-center gap-2 truncate text-left flex-1">
          {selectedRegion === 'national' ? (
            <Globe className="w-4 h-4 flex-shrink-0" />
          ) : (
            <MapPin className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="truncate">{regionLabel}</span>
        </div>
        <ChevronDown className={cn("w-4 h-4 flex-shrink-0 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-sidebar-accent border border-sidebar-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto pointer-events-auto">
          {/* National Overview */}
          <button
            onClick={() => handleRegionSelect('national')}
            className={cn(
              "w-full text-left px-3 py-2.5 text-sm font-medium hover:bg-sidebar-accent-foreground/10 transition-colors border-b border-sidebar-border",
              selectedRegion === 'national' && "bg-sidebar-primary text-sidebar-primary-foreground"
            )}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            National Overview
          </button>

          {/* Regions */}
          {Object.entries(REGIONS).map(([key, region]) => {
            if (key === 'national') return null;
            const regionBranches = branchesByRegion[key] || [];
            return (
              <div key={key}>
                <button
                  onClick={() => handleRegionSelect(key)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 text-sm hover:bg-sidebar-accent-foreground/10 transition-colors flex items-center justify-between",
                    selectedRegion === key && "bg-sidebar-primary/20"
                  )}
                >
                  <span>{region.name}</span>
                  {regionBranches.length > 0 && (
                    <span className="text-xs bg-sidebar-primary/50 px-2 py-0.5 rounded">
                      {regionBranches.length}
                    </span>
                  )}
                </button>

                {/* Branches in Region */}
                {expandedRegion === key && regionBranches.length > 0 && regionBranches.map(branch => (
                  <button
                    key={branch.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBranchSelect(branch);
                    }}
                    className="w-full text-left px-6 py-2 text-xs hover:bg-sidebar-accent-foreground/10 transition-colors border-l-2 border-sidebar-primary/30"
                  >
                    {branch.branch_name}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}