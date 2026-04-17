import React from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import UnifiedBranchView from '@/components/unified/UnifiedBranchView';
import BranchDataPopulator from '@/components/data-population/BranchDataPopulator';

export default function BranchDetails() {
  const { branchId } = useParams();
  const queryClient = useQueryClient();

  const { data: branch } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: async () => {
      const all = await base44.asServiceRole.entities.BranchConfig.list();
      return all.find(b => b.branch_id === branchId);
    },
  });

  if (!branch) {
    return <div className="p-6">Branch not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{branch.branch_name}</h1>
        <p className="text-muted-foreground mt-1">Branch Dashboard</p>
      </div>

      <UnifiedBranchView branchId={branchId} branchName={branch.branch_name} />

      <BranchDataPopulator 
        branchId={branchId}
        branchName={branch?.branch_name}
        onPopulated={() => {
          queryClient.invalidateQueries();
        }}
      />
    </div>
  );
}