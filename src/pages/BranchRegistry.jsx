import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Copy, CheckCircle2, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusColors = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-muted text-muted-foreground border-border",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
};

const syncIcons = {
  success: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  error: <AlertCircle className="w-3.5 h-3.5 text-red-500" />,
  pending: <Clock className="w-3.5 h-3.5 text-amber-500" />,
};

function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'auk_';
  for (let i = 0; i < 32; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

export default function BranchRegistry() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ branch_id: '', branch_name: '', status: 'active' });
  const queryClient = useQueryClient();

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branchConfigs'],
    queryFn: () => base44.entities.BranchConfig.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BranchConfig.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branchConfigs'] });
      setDialogOpen(false);
      setForm({ branch_id: '', branch_name: '', status: 'active' });
      toast.success('Branch registered successfully');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BranchConfig.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branchConfigs'] });
      toast.success('Branch removed');
    },
  });

  const handleCreate = () => {
    const apiKey = generateApiKey();
    createMutation.mutate({
      ...form,
      api_key: apiKey,
      last_sync_result: 'pending',
    });
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Branch Registry</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage authorised branches and API keys</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Register New Branch</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Branch ID</Label>
                <Input placeholder="e.g. bury" value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Branch Name</Label>
                <Input placeholder="e.g. Age UK Bury" value={form.branch_name} onChange={(e) => setForm({ ...form, branch_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} disabled={!form.branch_id || !form.branch_name} className="w-full">
                Register Branch
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch</TableHead>
                <TableHead>Branch ID</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>Sync Result</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.branch_name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{b.branch_id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {b.api_key?.substring(0, 12)}...
                      </code>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyKey(b.api_key)}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[b.status || 'pending']}>
                      {b.status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {b.last_sync_date ? format(new Date(b.last_sync_date), 'dd MMM yyyy HH:mm') : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {syncIcons[b.last_sync_result || 'pending']}
                      <span className="text-xs capitalize">{b.last_sync_result || 'pending'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(b.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {branches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                    No branches registered yet. Click "Add Branch" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}