import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const syncIcons = {
  success: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  error: <AlertCircle className="w-3.5 h-3.5 text-red-500" />,
  pending: <Clock className="w-3.5 h-3.5 text-amber-500" />,
};

const statusColors = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-muted text-muted-foreground border-border",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function BranchStatusTable({ branches }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-lg">Branch Status</CardTitle>
          <Link to="/branches">
            <Button variant="ghost" size="sm" className="text-xs">View All</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {branches.map((branch) => (
            <Link
              key={branch.id}
              to={`/branch/${branch.branch_id}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-heading font-bold text-primary text-sm">
                  {branch.branch_name?.[0] || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium">{branch.branch_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {branch.last_sync_date 
                      ? `Last sync: ${format(new Date(branch.last_sync_date), 'dd MMM yyyy HH:mm')}`
                      : 'Never synced'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {syncIcons[branch.last_sync_result || 'pending']}
                <Badge variant="outline" className={statusColors[branch.status || 'pending']}>
                  {branch.status || 'pending'}
                </Badge>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
          {branches.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No branches registered yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}