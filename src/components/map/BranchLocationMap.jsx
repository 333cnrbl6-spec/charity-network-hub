import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';

// Branch coordinates (UK locations)
const BRANCH_COORDS = {
  manchester: { lat: 53.4808, lng: -2.2426, region: 'north_west' },
  bury: { lat: 53.5931, lng: -2.2968, region: 'north_west' },
  stockport: { lat: 53.4084, lng: -2.1636, region: 'north_west' },
  wigan: { lat: 53.5440, lng: -2.6275, region: 'north_west' },
  trafford: { lat: 53.4101, lng: -2.3425, region: 'north_west' },
  salford: { lat: 53.4876, lng: -2.2908, region: 'north_west' },
  bolton: { lat: 53.5761, lng: -2.4273, region: 'north_west' },
  lancashire: { lat: 54.0406, lng: -2.2719, region: 'north_west' },
  wirral: { lat: 53.3764, lng: -3.0180, region: 'north_west' },
  sefton: { lat: 53.4719, lng: -2.8597, region: 'north_west' },
  liverpool: { lat: 53.4084, lng: -2.9916, region: 'north_west' },
};

const REGIONS = {
  north_west: 'North West',
  london: 'London',
  south_east: 'South East',
  south_west: 'South West',
  midlands: 'Midlands',
  north_east: 'North East',
  yorkshire: 'Yorkshire',
  east_midlands: 'East Midlands',
  east: 'East',
  wales: 'Wales',
};

export default function BranchLocationMap({ branches, selectedRegion = 'all', onSelectBranch }) {
  const filteredBranches = useMemo(() => {
    return Object.entries(BRANCH_COORDS).filter(([branchId]) => {
      if (selectedRegion === 'all') return true;
      return BRANCH_COORDS[branchId].region === selectedRegion;
    }).map(([branchId, coords]) => {
      const branchData = branches?.find(b => b.branch_id === branchId);
      return {
        id: branchId,
        ...coords,
        isOnline: branchData?.status === 'active',
        branchData
      };
    });
  }, [branches, selectedRegion]);

  const mapCenter = filteredBranches.length > 0 
    ? [
        filteredBranches.reduce((sum, b) => sum + b.lat, 0) / filteredBranches.length,
        filteredBranches.reduce((sum, b) => sum + b.lng, 0) / filteredBranches.length
      ]
    : [54.5973, -3.4360];

  return (
    <div className="w-full h-96 rounded-lg border overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={selectedRegion === 'all' ? 6 : 10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; CartoDB &copy; OpenStreetMap contributors'
        />

        {filteredBranches.map(branch => (
          <CircleMarker
            key={branch.id}
            center={[branch.lat, branch.lng]}
            radius={branch.isOnline ? 10 : 7}
            fillColor={branch.isOnline ? '#22c55e' : '#ef4444'}
            color={branch.isOnline ? '#16a34a' : '#dc2626'}
            weight={2}
            opacity={1}
            fillOpacity={0.7}
            eventHandlers={{
              click: () => onSelectBranch?.(branch.id)
            }}
          >
            <Popup>
              <div className="p-2 space-y-1">
                <p className="font-semibold capitalize text-sm">{branch.id}</p>
                <Badge variant={branch.isOnline ? 'default' : 'destructive'} className="text-xs">
                  {branch.isOnline ? 'Online' : 'Offline'}
                </Badge>
                {branch.branchData && (
                  <p className="text-xs text-muted-foreground">
                    Status: {branch.branchData.status}
                  </p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}