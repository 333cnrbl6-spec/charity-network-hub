import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map } from 'lucide-react';

const REGION_COORDS = {
  north_west: { x: 20, y: 30 },
  london: { x: 60, y: 75 },
  south_east: { x: 70, y: 75 },
  south_west: { x: 30, y: 80 },
  midlands: { x: 45, y: 50 },
  north_east: { x: 65, y: 15 },
  yorkshire: { x: 55, y: 35 },
  east_midlands: { x: 55, y: 55 },
  east: { x: 75, y: 50 },
  wales: { x: 10, y: 45 },
};

export default function NetworkMap() {
  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => base44.asServiceRole.entities.BranchConfig.list(),
  });

  const activeBranches = branches.filter(b => b.status === 'active').length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Network Map</h1>
        <p className="text-muted-foreground mt-1">Age UK presence across the UK</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Branches by Region</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(REGION_COORDS).map(([region, _]) => {
              const regionBranches = branches.filter(b => {
                const branchRegion = {
                  manchester: 'north_west', salford: 'north_west', trafford: 'north_west',
                  wigan: 'north_west', bury: 'north_west', bolton: 'north_west',
                  stockport: 'north_west',
                };
                return branchRegion[b.branch_id] === region;
              });
              
              const active = regionBranches.filter(b => b.status === 'active').length;
              
              return (
                <div key={region} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Map className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium capitalize">{region.replace('_', ' ')}</span>
                  </div>
                  <Badge variant={active > 0 ? 'default' : 'outline'}>
                    {active} active
                  </Badge>
                </div>
              );
            })}
          </div>
          <div className="mt-6 p-3 bg-muted rounded-lg text-sm">
            <p className="font-medium">{activeBranches} branches active network-wide</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}