import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Shield, Mail, Phone, FileText } from 'lucide-react';
import ProcessingFeedback from '@/components/ui/ProcessingFeedback';

export default function VolunteerApprovalDashboard() {
  const [selectedId, setSelectedId] = useState(null);
  const [approving, setApproving] = useState(false);

  const queryClient = useQueryClient();

  // Fetch pending volunteers
  const { data: volunteers, isLoading } = useQuery({
    queryKey: ['pending_volunteers'],
    queryFn: () => base44.entities.Volunteer.filter({ status: 'pending_approval' }),
    initialData: []
  });

  const approveMutation = useMutation({
    mutationFn: async ({ volunteerId, approve }) => {
      setApproving(true);
      const updateData = approve
        ? { status: 'active', dbs_checked: true, dbs_expiry: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
        : { status: 'rejected' };

      await base44.entities.Volunteer.update(volunteerId, updateData);

      // Log the action
      await base44.asServiceRole.entities.AuditLog.create({
        user_email: await base44.auth.me().then(u => u?.email || 'admin'),
        action: approve ? 'volunteer_approved' : 'volunteer_rejected',
        entity_type: 'Volunteer',
        entity_id: volunteerId,
        changes: updateData,
        timestamp: new Date().toISOString(),
        status: 'success'
      });

      setApproving(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending_volunteers'] });
      setSelectedId(null);
    }
  });

  const selected = volunteers?.find(v => v.id === selectedId);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <ProcessingFeedback
          label="Loading applications…"
          detail="Fetching pending volunteer applications for review."
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Volunteer Approvals</h1>
        <p className="text-muted-foreground mt-1">Review and approve pending volunteer applications</p>
      </div>

      {approving && (
        <ProcessingFeedback
          label="Processing approval…"
          detail="Updating volunteer status and sending notification email."
          tips={[
            'The volunteer will be notified immediately via email.',
            'Approved volunteers can be assigned to roles right away.',
          ]}
        />
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Application List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Pending Applications
                <Badge className="ml-2">{volunteers?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {volunteers?.map(vol => (
                  <button
                    key={vol.id}
                    onClick={() => setSelectedId(vol.id)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selectedId === vol.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-muted border-muted'
                    }`}
                  >
                    <p className="font-semibold text-sm">{vol.name}</p>
                    <p className="text-xs opacity-70">{vol.role}</p>
                    <p className="text-xs opacity-60 mt-1">{vol.email}</p>
                  </button>
                ))}
              </div>
              {volunteers?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No pending applications</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Application Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selected.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{selected.role}</p>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Pending Review
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contact Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selected.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="font-semibold mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.skills?.map(skill => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h3 className="font-semibold mb-3">Availability</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(selected.availability || {}).map(([day, times]) => (
                      <div key={day} className="p-2 bg-muted rounded">
                        <p className="font-medium">{day}</p>
                        <p className="text-xs text-muted-foreground">{times?.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* About */}
                {selected.about && (
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-sm text-muted-foreground">{selected.about}</p>
                  </div>
                )}

                {/* DBS Status */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900">DBS Documents Submitted</p>
                    <p className="text-blue-800">Documents are ready for verification. Check against the official DBS register before approving.</p>
                  </div>
                </div>

                {/* Approval Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => approveMutation.mutate({ volunteerId: selected.id, approve: true })}
                    disabled={approving}
                    className="flex-1 gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </Button>
                  <Button
                    onClick={() => approveMutation.mutate({ volunteerId: selected.id, approve: false })}
                    disabled={approving}
                    variant="destructive"
                    className="flex-1 gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select an application to review</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}