import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import UnifiedBranchView from '@/components/unified/UnifiedBranchView';

export default function BranchDetails() {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: branch, isLoading, error } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: async () => {
      const all = await base44.entities.BranchConfig.list();
      return all.find(b => b.branch_id === branchId);
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-foreground">Branch not found</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  The branch "{branchId}" could not be found. Please select a valid branch from the sidebar.
                </p>
                <button
                  onClick={() => navigate('/network')}
                  className="mt-3 text-sm font-medium text-primary hover:underline"
                >
                  View all branches →
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{branch.branch_name}</h1>
        <p className="text-muted-foreground mt-1">Branch Dashboard</p>
      </div>

      <UnifiedBranchView 
        branchId={branchId} 
        branchName={branch.branch_name}
        onDataPopulated={() => queryClient.invalidateQueries({ queryKey: ['branch'] })}
      />
    </div>
  );
}