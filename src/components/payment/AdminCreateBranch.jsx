import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function AdminCreateBranch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    branch_id: '',
    branch_name: '',
    manager_email: '',
    plan: 'starter'
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  if (user?.role !== 'admin') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Admin Only</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You need admin access to create branches.</p>
        </CardContent>
      </Card>
    );
  }

  const handleCreate = async () => {
    if (!formData.branch_id || !formData.branch_name || !formData.manager_email) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create branch subscription
      const res = await base44.functions.invoke('createBranchSubscription', {
        branch_id: formData.branch_id,
        branch_name: formData.branch_name,
        email: formData.manager_email,
        plan: formData.plan
      });

      // Invite branch manager
      await base44.users.inviteUser(formData.manager_email, 'admin');

      setSuccess(true);
      setFormData({ branch_id: '', branch_name: '', manager_email: '', plan: 'starter' });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create branch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Branch</CardTitle>
        <CardDescription>Add a new Age UK branch to the network</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="flex gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>Branch created and invite sent to {formData.manager_email}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Branch ID</label>
            <Input
              placeholder="e.g., manchester, bury"
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value.toLowerCase() })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Branch Name</label>
            <Input
              placeholder="e.g., Age UK Manchester"
              value={formData.branch_name}
              onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Branch Manager Email</label>
            <Input
              type="email"
              placeholder="manager@branch.org"
              value={formData.manager_email}
              onChange={(e) => setFormData({ ...formData, manager_email: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Plan</label>
            <Select value={formData.plan} onValueChange={(v) => setFormData({ ...formData, plan: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starter">Starter - £49.99/month</SelectItem>
                <SelectItem value="professional">Professional - £99.99/month</SelectItem>
                <SelectItem value="enterprise">Enterprise - £249.99/month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleCreate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="animate-spin mr-2" /> : ''}
            Create Branch & Send Invite
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}