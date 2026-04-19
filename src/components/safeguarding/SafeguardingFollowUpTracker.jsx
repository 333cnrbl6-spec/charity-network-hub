import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2, Calendar, FileText, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useSafeguardingIncidents } from '@/hooks/useEntityQueries';

const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

export default function SafeguardingFollowUpTracker() {
  const { data: incidents = [] } = useSafeguardingIncidents();
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingNote, setAddingNote] = useState(null);
  const [progressNote, setProgressNote] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');

  useEffect(() => {
    checkFollowUps();
  }, [incidents]);

  const checkFollowUps = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('checkSafeguardingFollowUps', {});
      setFollowUps(data.incidents || []);
    } catch (error) {
      console.error('Failed to check follow-ups:', error);
      toast.error('Failed to check follow-ups', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgressNote = async (incidentId) => {
    if (!progressNote.trim()) {
      toast.error('Progress note required', { description: 'Please add a progress update' });
      return;
    }

    try {
      await base44.functions.invoke('addSafeguardingProgressNote', {
        incident_id: incidentId,
        progress_note: progressNote,
        status_update: statusUpdate || undefined
      });

      toast.success('Progress note added', {
        description: 'Follow-up timer reset for 48 hours'
      });

      setProgressNote('');
      setStatusUpdate('');
      setAddingNote(null);
      checkFollowUps();
    } catch (error) {
      console.error('Failed to add progress note:', error);
      toast.error('Failed to add progress note', { description: error.message });
    }
  };

  const getOverdueBadge = (daysOverdue) => {
    if (daysOverdue === 0) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Due Now
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-800">
        <AlertTriangle className="w-3 h-3 mr-1" />
        {daysOverdue} Day{daysOverdue > 1 ? 's' : ''} Overdue
      </Badge>
    );
  };

  const overdueCount = followUps.filter(f => f.is_overdue).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Follow-Up Tracker
          </div>
          {overdueCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              <Bell className="w-3 h-3 mr-1" />
              {overdueCount} Overdue
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          48-hour progress monitoring for active safeguarding incidents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 animate-spin" />
            <p>Checking follow-ups...</p>
          </div>
        ) : followUps.length > 0 ? (
          <div className="space-y-3">
            {followUps.map((followUp) => (
              <div
                key={followUp.id}
                className={`border-2 rounded-lg p-4 ${SEVERITY_COLORS[followUp.severity]} ${
                  followUp.is_overdue ? 'border-dashed border-red-400' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={SEVERITY_COLORS[followUp.severity]}>
                        {followUp.severity.toUpperCase()}
                      </Badge>
                      {getOverdueBadge(followUp.days_overdue)}
                    </div>
                    <p className="font-bold text-sm">{followUp.reference}</p>
                    <p className="text-xs mt-1">
                      Status: {followUp.status.replace(/_/g, ' ')} • 
                      Last update: {new Date(followUp.last_update).toLocaleDateString()}
                    </p>
                    {followUp.safeguarding_lead && (
                      <p className="text-xs mt-1">
                        Assigned to: {followUp.safeguarding_lead}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold">
                      {followUp.hours_since_update} hours
                    </p>
                    <p className="text-xs text-muted-foreground">
                      since last update
                    </p>
                  </div>
                </div>

                {addingNote === followUp.id ? (
                  <div className="border-t pt-3 mt-3 space-y-3">
                    <div>
                      <Label>Progress Note *</Label>
                      <Textarea
                        className="min-h-24"
                        placeholder="Document progress, actions taken, decisions made, next steps..."
                        value={progressNote}
                        onChange={(e) => setProgressNote(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Status Update (Optional)</Label>
                      <select
                        className="w-full border rounded-md p-2 text-sm"
                        value={statusUpdate}
                        onChange={(e) => setStatusUpdate(e.target.value)}
                      >
                        <option value="">No change</option>
                        <option value="under_review">Under Review</option>
                        <option value="investigating">Investigating</option>
                        <option value="external_referral_made">External Referral Made</option>
                        <option value="closed">Closed</option>
                        <option value="escalated_to_authorities">Escalated to Authorities</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAddingNote(null);
                          setProgressNote('');
                          setStatusUpdate('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddProgressNote(followUp.id)}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Save Progress Note
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAddingNote(followUp.id);
                      setProgressNote('');
                      setStatusUpdate('');
                    }}
                    className="w-full"
                  >
                    <FileText className="w-3 h-3 mr-2" />
                    Add Progress Note
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-600" />
            <p>All incidents up to date</p>
            <p className="text-xs mt-1">No follow-ups due in the last 48 hours</p>
          </div>
        )}

        {/* Summary Stats */}
        {followUps.length > 0 && (
          <div className="border-t pt-4 mt-4 grid grid-cols-3 gap-3 text-xs">
            <div className="text-center">
              <p className="text-muted-foreground">Total Due</p>
              <p className="font-bold text-lg">{followUps.length}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Overdue</p>
              <p className="font-bold text-lg text-red-600">{overdueCount}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">On Time</p>
              <p className="font-bold text-lg text-green-600">{followUps.length - overdueCount}</p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
          <p className="text-xs text-blue-800 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Safeguarding leads are prompted every 48 hours to update progress notes. Overdue reviews are automatically logged in the alerts dashboard.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}