import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RotateCw, ChevronDown } from 'lucide-react';

export default function SyncLog() {
  const [syncLoading, setSyncLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const { data: syncLogs = [] } = useQuery({
    queryKey: ['syncLogs'],
    queryFn: () => base44.entities.SyncLog.list(),
  });

  const handleManualSync = async () => {
    setSyncLoading(true);
    try {
      await base44.functions.invoke('syncToHub', {});
      // Refetch sync logs
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Synchronisation Log</h1>
        <Button onClick={handleManualSync} disabled={syncLoading} className="gap-2">
          <RotateCw className="w-4 h-4" />
          {syncLoading ? 'Syncing...' : 'Sync Now'}
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Report Period</TableHead>
              <TableHead>Synced At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {syncLogs.map(log => (
              <React.Fragment key={log.id}>
                <TableRow>
                  <TableCell>
                    <button
                      onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedId === log.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </TableCell>
                  <TableCell className="font-medium">{log.report_period}</TableCell>
                  <TableCell className="text-sm">{new Date(log.synced_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-xs">{log.response_message}</TableCell>
                </TableRow>
                {expandedId === log.id && log.stats_snapshot && (
                  <TableRow>
                    <TableCell colSpan="5" className="bg-gray-50 p-4">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Total Clients</p>
                          <p className="font-bold text-lg">{log.stats_snapshot.total_clients}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">New Clients</p>
                          <p className="font-bold text-lg">{log.stats_snapshot.new_clients}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Active Volunteers</p>
                          <p className="font-bold text-lg">{log.stats_snapshot.active_volunteers}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Jobs This Month</p>
                          <p className="font-bold text-lg">{log.stats_snapshot.total_jobs}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Completed Jobs</p>
                          <p className="font-bold text-lg">{log.stats_snapshot.completed_jobs}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Sessions</p>
                          <p className="font-bold text-lg">{log.stats_snapshot.total_sessions}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Grants Awarded</p>
                          <p className="font-bold text-lg">{log.stats_snapshot.grants_awarded}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Grant Value</p>
                          <p className="font-bold text-lg">£{log.stats_snapshot.grants_total_value?.toFixed(0)}</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="text-sm text-muted-foreground">
        Total syncs recorded: {syncLogs.length}
      </div>
    </div>
  );
}