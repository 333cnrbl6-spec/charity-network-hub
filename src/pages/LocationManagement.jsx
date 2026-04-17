import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Users2, Briefcase, Zap, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { playSuccess, playClick } from '@/lib/audio';

const BRANCH_URLS = {
  manchester: 'https://mcr-care-compass.base44.app',
  bury: 'https://bury-care-connect.base44.app',
  stockport: 'https://stockport-care-connect.base44.app',
  wigan: 'https://wigancare-hub-connect.base44.app',
  trafford: 'https://trafford-care-sync.base44.app',
  salford: 'https://salford-care-link.base44.app',
  bolton: 'https://bolton-age-uk.base44.app',
  lancashire: 'https://lancashire-age-uk.base44.app',
  wirral: 'https://wirral-age-uk.base44.app',
  sefton: 'https://sefton-age-uk.base44.app',
  liverpool: 'https://liverpool-age-uk.base44.app'
};

export default function LocationManagement() {
  const [loadingBranch, setLoadingBranch] = useState(null);
  const [distributing, setDistributing] = useState(false);
  const [distributionStatus, setDistributionStatus] = useState({});

  const { data: locations = [] } = useQuery({
    queryKey: ['locationConfigs'],
    queryFn: () => base44.entities.LocationConfig.list(),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => base44.entities.BranchConfig.list(),
  });

  const handleDistributeLocation = async (branchId) => {
    playClick();
    setLoadingBranch(branchId);
    try {
      // Fetch location config via backend
      const response = await base44.functions.invoke('getLocationConfig', {
        branch_id: branchId
      });

      if (response.data?.success) {
        const config = response.data.data;
        
        // Store in hub's LocationConfig entity
        const existing = locations.find(l => l.branch_id === branchId);
        
        if (existing) {
          await base44.entities.LocationConfig.update(existing.id, config);
        } else {
          await base44.entities.LocationConfig.create(config);
        }

        setDistributionStatus(prev => ({
          ...prev,
          [branchId]: { status: 'success', message: 'Location config synced to hub' }
        }));

        playSuccess();
      }
    } catch (error) {
      console.error('Distribution error:', error);
      setDistributionStatus(prev => ({
        ...prev,
        [branchId]: { status: 'error', message: error.message }
      }));
    } finally {
      setLoadingBranch(null);
    }
  };

  const handleBulkDistribute = async () => {
    playClick();
    setDistributing(true);
    try {
      for (const branchId of Object.keys(BRANCH_URLS)) {
        await handleDistributeLocation(branchId);
        // Small delay between distributions
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      playSuccess();
    } finally {
      setDistributing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <LoadingIndicator isLoading={distributing} message="Distributing location configs..." />

      <div>
        <h1 className="text-3xl font-bold text-foreground">Location Configuration Management</h1>
        <p className="text-muted-foreground mt-1">Manage and distribute branch location data with real demographics</p>
      </div>

      {/* Action Bar */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">Bulk Distribution</p>
            <p className="text-sm text-muted-foreground">Sync all location configs to hub database</p>
          </div>
          <Button 
            onClick={handleBulkDistribute}
            disabled={distributing}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {distributing ? 'Distributing...' : 'Distribute All'}
          </Button>
        </CardContent>
      </Card>

      {/* Location Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(BRANCH_URLS).map(([branchId, url]) => {
          const location = locations.find(l => l.branch_id === branchId);
          const status = distributionStatus[branchId];

          return (
            <Card key={branchId} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg capitalize">{branchId}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{url}</p>
                  </div>
                  {location && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Synced
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-3">
                {/* Status Message */}
                {status && (
                  <div className={`p-2 rounded text-xs ${status.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {status.message}
                  </div>
                )}

                {/* Preview Data (if available) */}
                {location ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{location.demographics?.population_65_plus?.toLocaleString()} ages 65+</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{location.postcode_area}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-muted-foreground" />
                      <span>{location.services?.length} services</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users2 className="w-4 h-4 text-muted-foreground" />
                      <span>{location.staff_roles?.length} staff roles</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic">No config synced yet</div>
                )}
              </CardContent>

              <div className="p-3 border-t">
                <Button
                  onClick={() => handleDistributeLocation(branchId)}
                  disabled={loadingBranch === branchId || distributing}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                >
                  {loadingBranch === branchId ? (
                    <>Syncing...</>
                  ) : location ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Update Config
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Sync Location
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Synced Configs Summary */}
      {locations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Synced Locations ({locations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {locations.map(loc => (
                <div key={loc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{loc.branch_name}</p>
                    <p className="text-xs text-muted-foreground">{loc.postcode_area} • {loc.location_type}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{loc.demographics?.population_65_plus?.toLocaleString()} seniors</p>
                    <p className="text-xs">{loc.services?.length || 0} services</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}