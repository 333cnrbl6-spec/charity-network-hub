import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function BranchDataPopulator({ branchId, branchName, onPopulated }) {
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({
    clients: 10,
    volunteers: 5,
    jobs: 8,
    sessions: 4,
    grants: 3,
    complianceAreas: 12
  });
  const [error, setError] = useState(null);

  const handlePopulate = async () => {
    setLoading(true);
    setError(null);
    try {
      await base44.functions.invoke('populateBranchData', {
        branch_id: branchId,
        branch_name: branchName,
        counts
      });
      onPopulated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Populate Test Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium">Clients</label>
            <Input 
              type="number" 
              value={counts.clients} 
              onChange={(e) => setCounts({...counts, clients: parseInt(e.target.value)})}
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Volunteers</label>
            <Input 
              type="number" 
              value={counts.volunteers} 
              onChange={(e) => setCounts({...counts, volunteers: parseInt(e.target.value)})}
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Jobs</label>
            <Input 
              type="number" 
              value={counts.jobs} 
              onChange={(e) => setCounts({...counts, jobs: parseInt(e.target.value)})}
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Sessions</label>
            <Input 
              type="number" 
              value={counts.sessions} 
              onChange={(e) => setCounts({...counts, sessions: parseInt(e.target.value)})}
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Grants</label>
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
          onClick={handlePopulate} 
          disabled={loading}
          className="w-full gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Creating Data...' : 'Populate with Test Data'}
        </Button>
      </CardContent>
    </Card>
  );
}