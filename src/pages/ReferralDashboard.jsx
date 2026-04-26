import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import ReferralCard from '@/components/referrals/ReferralCard';
import QualificationPanel from '@/components/referrals/QualificationPanel';
import AssignmentPanel from '@/components/referrals/AssignmentPanel';
import ProgressTracker from '@/components/referrals/ProgressTracker';

const STATUS_LABELS = {
  received: 'New Referrals',
  qualified: 'Qualified',
  assigned: 'Assigned',
  active: 'Active',
  completed: 'Completed',
  declined: 'Declined',
};

export default function ReferralDashboard() {
  const queryClient = useQueryClient();
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');

  // Fetch referrals
  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ['referrals'],
    queryFn: () => base44.entities.Referral.list(),
  });

  // Fetch volunteers for assignment
  const { data: volunteers = [] } = useQuery({
    queryKey: ['volunteers'],
    queryFn: () => base44.entities.Volunteer.list(),
  });

  // Qualify referral mutation
  const qualifyMutation = useMutation({
    mutationFn: async ({ referralId, notes }) => {
      const user = await base44.auth.me();
      return base44.entities.Referral.update(referralId, {
        status: 'qualified',
        qualified_by: user.email,
        qualified_date: new Date().toISOString(),
        qualification_notes: notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      setSelectedReferral(null);
    },
  });

  // Decline referral mutation
  const declineMutation = useMutation({
    mutationFn: async ({ referralId, reason }) => {
      return base44.entities.Referral.update(referralId, {
        status: 'declined',
        decline_reason: reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      setSelectedReferral(null);
    },
  });

  // Assign referral mutation
  const assignMutation = useMutation({
    mutationFn: async ({ referralId, volunteerId }) => {
      const volunteer = volunteers.find(v => v.id === volunteerId);
      return base44.entities.Referral.update(referralId, {
        status: 'assigned',
        assigned_to: volunteerId,
        assigned_name: volunteer.full_name,
        assigned_date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      setSelectedReferral(null);
    },
  });

  // Add progress note mutation
  const addNoteMutation = useMutation({
    mutationFn: async ({ referralId, note }) => {
      const user = await base44.auth.me();
      const current = referrals.find(r => r.id === referralId);
      return base44.entities.Referral.update(referralId, {
        progress_notes: [
          ...(current.progress_notes || []),
          {
            date: new Date().toISOString(),
            added_by: user.full_name,
            note,
          },
        ],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
  });

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: referrals.length,
      received: referrals.filter(r => r.status === 'received').length,
      qualified: referrals.filter(r => r.status === 'qualified').length,
      assigned: referrals.filter(r => r.status === 'assigned').length,
      active: referrals.filter(r => r.status === 'active').length,
    };
  }, [referrals]);

  // Filter referrals
  const filteredReferrals = useMemo(() => {
    return referrals.filter(r => {
      const statusMatch = filterStatus === 'all' || r.status === filterStatus;
      const searchMatch = 
        !searchText ||
        r.client_full_name.toLowerCase().includes(searchText.toLowerCase()) ||
        r.referral_number.toLowerCase().includes(searchText.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [referrals, filterStatus, searchText]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Referral Management</h1>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Referral
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <p className="text-xs text-blue-700 font-medium">New</p>
            <p className="text-2xl font-bold text-blue-900">{stats.received}</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-4">
            <p className="text-xs text-purple-700 font-medium">Qualified</p>
            <p className="text-2xl font-bold text-purple-900">{stats.qualified}</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <p className="text-xs text-orange-700 font-medium">Assigned</p>
            <p className="text-2xl font-bold text-orange-900">{stats.assigned}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <p className="text-xs text-green-700 font-medium">Active</p>
            <p className="text-2xl font-bold text-green-900">{stats.active}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referrals List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or referral number..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Referral Cards */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : filteredReferrals.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                No referrals found
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filteredReferrals.map((referral) => (
                <ReferralCard
                  key={referral.id}
                  referral={referral}
                  onClick={() => setSelectedReferral(referral)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="space-y-4">
          {selectedReferral ? (
            <>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-base">Referral Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Referral Number</p>
                    <p className="font-mono font-bold">{selectedReferral.referral_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Client</p>
                    <p className="font-medium">{selectedReferral.client_full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Referrer</p>
                    <p className="font-medium">{selectedReferral.referrer_organization}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contact</p>
                    <p className="text-sm">{selectedReferral.referrer_contact}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedReferral(null)}
                    className="w-full justify-start text-xs"
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>

              <QualificationPanel
                referral={selectedReferral}
                onQualify={(notes) =>
                  qualifyMutation.mutate({ referralId: selectedReferral.id, notes })
                }
                onDecline={(reason) =>
                  declineMutation.mutate({ referralId: selectedReferral.id, reason })
                }
                loading={qualifyMutation.isPending || declineMutation.isPending}
              />

              <AssignmentPanel
                referral={selectedReferral}
                volunteers={volunteers}
                onAssign={(volunteerId) =>
                  assignMutation.mutate({ referralId: selectedReferral.id, volunteerId })
                }
                loading={assignMutation.isPending}
              />

              <ProgressTracker
                referral={selectedReferral}
                onAddNote={(note) =>
                  addNoteMutation.mutate({ referralId: selectedReferral.id, note })
                }
                loading={addNoteMutation.isPending}
              />
            </>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">Select a referral to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}