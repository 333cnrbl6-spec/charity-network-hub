import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function BulkBranchPopulator({ branches, onPopulated }) {
  const [loading, setLoading] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState(branches.map(b => b.branch_id));
  const [counts, setCounts] = useState({
    clients: 10,
    volunteers: 5,
    jobs: 8,
    sessions: 4,
    grants: 3,
    complianceAreas: 12
  });
  const [error, setError] = useState(null);

  const handleBulkPopulate = async () => {
    setLoading(true);
    setError(null);
    try {
      await base44.functions.invoke('bulkPopulateBranches', {
        branch_ids: selectedBranches,
        counts
      });
      onPopulated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleBranch = (branchId) => {
    setSelectedBranches(prev => 
      prev.includes(branchId) 
        ? prev.filter(id => id !== branchId)
        : [...prev, branchId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bulk Populate Test Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Branches</label>
          <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-3 bg-muted/30">
            {branches.map(branch => (
              <label key={branch.branch_id} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={selectedBranches.includes(branch.branch_id)}
                  onChange={() => toggleBranch(branch.branch_id)}
                  disabled={loading}
                  className="cursor-pointer"
                />
                <span className="text-sm">{branch.branch_name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium">Clients per branch</label>
            <Input 
              type="number" 
              value={counts.clients} 
              onChange={(e) => setCounts({...counts, clients: parseInt(e.target.value)})}
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Volunteers per branch</label>
            <Input 
              type="number" 
              value={counts.volunteers} 
              onChange={(e) => setCounts({...counts, volunteers: parseInt(e.target.value)})}
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Jobs per branch</label>
            <Input 
              type="number" 
              value={counts.jobs} 
              onChange={(e) => setCounts({...counts, jobs: parseInt(e.target.value)})}
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Sessions per branch</label>
            <Input 
              type="number" 
              value={counts.sessions} 
              onChange={(e) => setCounts({...counts, sessions: parseInt(e.target.value)})}
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Grants per branch</label>
            <Input 
              type="number" 
              value={counts.grants} 
              onChange={(e) => setCounts({...counts, grants: parseInt(e.target.value)})}
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Compliance Areas</label>
            <Input 
              type="number" 
              value={counts.complianceAreas} 
              min="1"
              max="12"
              onChange={(e) => setCounts({...counts, complianceAreas: parseInt(e.target.value)})}
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <Button 
          onClick={handleBulkPopulate} 
          disabled={loading || selectedBranches.length === 0}
          className="w-full gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Creating Data...' : `Populate ${selectedBranches.length} Branch${selectedBranches.length !== 1 ? 'es' : ''}`}
        </Button>
      </CardContent>
    </Card>
  );
}