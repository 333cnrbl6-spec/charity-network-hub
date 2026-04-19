import React from 'react';
import { CheckCircle2, GitBranch, AlertCircle, Loader2, Globe, Building2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { REGIONS } from '@/lib/ageukBranches';

export default function StepBranchConnect({ branch, status, branchRecord, onRetry }) {
  const region = branch ? REGIONS[branch.region] : null;

  return (
    <div className="space-y-4">
      {/* Checking / provisioning */}
      {status === 'checking' && (
        <div className="flex flex-col items-center py-8 gap-4">
          <div className="relative">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">Provisioning <strong>{branch?.name}</strong>…</p>
            <p className="text-xs text-muted-foreground">Setting up your branch workspace, loading regional data and compliance templates</p>
          </div>
          <div className="w-full space-y-2 text-xs text-muted-foreground">
            {['Registering branch in hub network', 'Generating regional demo data', 'Loading compliance templates', 'Configuring your workspace'].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin text-primary/60 flex-shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Found existing */}
      {status === 'found' && (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900 text-sm">Branch Already Connected ✓</p>
              <p className="text-xs text-green-800 mt-0.5">
                {branch?.name} is registered and active in the hub. You're joining an existing team.
              </p>
            </div>
          </div>
          <BranchDetails branch={branch} record={branchRecord} region={region} />
        </div>
      )}

      {/* Newly created */}
      {status === 'created' && (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <GitBranch className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 text-sm">Branch Provisioned & Connected ✓</p>
              <p className="text-xs text-blue-800 mt-0.5">
                <strong>{branch?.name}</strong> is the first subscriber from this branch — it's been provisioned with realistic regional data and connected to the national hub. Your workspace is ready.
              </p>
            </div>
          </div>
          <BranchDetails branch={branch} record={branchRecord} region={region} isNew />
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 text-sm">Connection Issue</p>
              <p className="text-xs text-red-800 mt-0.5">
                Could not connect to the hub right now. You can continue — this can be resolved later by your branch admin.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onRetry} className="w-full gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Retry connection
          </Button>
        </div>
      )}

      {/* Architecture note */}
      <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground">
        <Globe className="w-3.5 h-3.5 inline mr-1.5" />
        <strong>Hub & Spoke:</strong> Your branch operates with full autonomy — local finance, governance and staff data stays local. Only aggregate metrics sync to the national hub.
      </div>
    </div>
  );
}

function BranchDetails({ branch, record, region, isNew }) {
  return (
    <div className="border border-border rounded-lg p-3 flex items-start gap-3 text-sm">
      <Building2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
      <div className="space-y-1 flex-1">
        <p className="font-semibold">{branch?.name}</p>
        <p className="text-xs text-muted-foreground">
          Branch ID: <code className="bg-muted px-1 rounded">{branch?.id}</code>
          {' · '}{branch?.city} · Postcode: {branch?.postcode}
        </p>
        {region && (
          <p className="text-xs text-muted-foreground">Region: {region.label}</p>
        )}
        <div className="flex gap-2 pt-1">
          <Badge variant="default" className="text-xs">{record?.status || 'active'}</Badge>
          {isNew && <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">Newly provisioned</Badge>}
        </div>
      </div>
    </div>
  );
}