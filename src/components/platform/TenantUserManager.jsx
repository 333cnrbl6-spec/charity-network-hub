import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_LABELS = {
  tenant_admin: { label: 'Admin', color: 'bg-purple-100 text-purple-800' },
  safeguarding_lead: { label: 'Safeguarding Lead', color: 'bg-red-100 text-red-800' },
  manager: { label: 'Manager', color: 'bg-blue-100 text-blue-800' },
  staff: { label: 'Staff', color: 'bg-gray-100 text-gray-800' },
  volunteer: { label: 'Volunteer', color: 'bg-green-100 text-green-800' },
  trustee: { label: 'Trustee', color: 'bg-amber-100 text-amber-800' },
};

export default function TenantUserManager({ tenantId, currentUserEmail }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');
  const [inviting, setInviting] = useState(false);

  const load = async () => {
    setLoading(true);
    const tu = await base44.entities.TenantUser.filter({ tenant_id: tenantId });
    setUsers(tu || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [tenantId]);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    await base44.users.inviteUser(inviteEmail, 'user');
    await base44.entities.TenantUser.create({
      tenant_id: tenantId,
      user_email: inviteEmail,
      tenant_role: inviteRole,
      is_active: true,
      invited_by: currentUserEmail || '',
    });
    toast.success(`Invited ${inviteEmail} as ${ROLE_LABELS[inviteRole]?.label}`);
    setInviteEmail('');
    setInviteRole('staff');
    setInviting(false);
    load();
  };

  const handleRemove = async (u) => {
    await base44.entities.TenantUser.update(u.id, { is_active: false });
    toast.success(`${u.user_email} removed`);
    load();
  };

  return (
    <div className="space-y-4">
      {/* Invite Row */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Invite Team Member</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="email" placeholder="email@yourorg.org.uk"
              value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleInvite} disabled={!inviteEmail || inviting} className="gap-2">
              {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm">Team Members ({users.filter(u => u.is_active).length})</CardTitle>
          <Button variant="ghost" size="sm" onClick={load} className="gap-1 h-7 text-xs">
            <RefreshCw className="w-3 h-3" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-6"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></div>
          ) : users.filter(u => u.is_active).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-6 h-6 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No team members yet. Invite someone above.</p>
            </div>
          ) : (
            <div className="divide-y">
              {users.filter(u => u.is_active).map(u => {
                const role = ROLE_LABELS[u.tenant_role] || ROLE_LABELS.staff;
                const isSelf = u.user_email === currentUserEmail;
                return (
                  <div key={u.id} className="flex items-center gap-3 py-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">
                      {u.user_email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.user_name || u.user_email}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.user_email}</p>
                    </div>
                    <Badge className={`text-xs ${role.color}`}>{role.label}</Badge>
                    {!isSelf && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(u)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}