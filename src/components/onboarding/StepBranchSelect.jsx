import React, { useState, useMemo } from 'react';
import { Search, MapPin, CheckCircle2 } from 'lucide-react';
import { AGE_UK_BRANCHES, REGIONS, getBranchesByRegion } from '@/lib/ageukBranches';
import { Badge } from '@/components/ui/badge';

export default function StepBranchSelect({ selectedBranch, onSelect }) {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');

  const filtered = useMemo(() => {
    return AGE_UK_BRANCHES.filter(b => {
      const matchSearch = !search ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.city.toLowerCase().includes(search.toLowerCase()) ||
        b.postcode.toLowerCase().includes(search.toLowerCase());
      const matchRegion = regionFilter === 'all' || b.region === regionFilter;
      return matchSearch && matchRegion;
    });
  }, [search, regionFilter]);

  const regionCounts = useMemo(() => {
    const counts = {};
    AGE_UK_BRANCHES.forEach(b => {
      counts[b.region] = (counts[b.region] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Select your Age UK branch. It will be automatically placed in the correct region and hub structure.
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, city or postcode…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Region filter pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setRegionFilter('all')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${regionFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          All regions ({AGE_UK_BRANCHES.length})
        </button>
        {Object.entries(REGIONS).map(([id, r]) => regionCounts[id] ? (
          <button
            key={id}
            onClick={() => setRegionFilter(id)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${regionFilter === id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {r.label.replace(' England', '').replace(' of England', '')} ({regionCounts[id]})
          </button>
        ) : null)}
      </div>

      {/* Branch list */}
      <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No branches found. Try a different search.</p>
        )}
        {filtered.map(branch => {
          const isSelected = selectedBranch?.id === branch.id;
          const region = REGIONS[branch.region];
          return (
            <button
              key={branch.id}
              onClick={() => onSelect(branch)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all flex items-center justify-between gap-3 ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-transparent bg-muted/40 hover:border-primary/30 hover:bg-muted/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{branch.name}</p>
                  <p className="text-xs text-muted-foreground">{branch.city} · {branch.postcode}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="text-xs py-0 hidden sm:inline-flex">
                  {region?.label.split(' ')[0]}
                </Badge>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
              </div>
            </button>
          );
        })}
      </div>

      {selectedBranch && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">{selectedBranch.name}</p>
            <p className="text-xs text-muted-foreground">
              {REGIONS[selectedBranch.region]?.label} · Postcode area: {selectedBranch.postcode}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}