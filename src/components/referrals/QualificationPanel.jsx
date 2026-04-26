import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, X } from 'lucide-react';

export default function QualificationPanel({ referral, onQualify, onDecline, loading }) {
  const [notes, setNotes] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [mode, setMode] = useState('assess');

  if (referral.status !== 'received') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Already Qualified</p>
              <p className="text-sm text-green-800">Status: {referral.status.replace('_', ' ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Qualification Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded">
          <div>
            <p className="text-xs text-muted-foreground">Age</p>
            <p className="font-medium">
              {referral.client_dob ? 
                new Date().getFullYear() - new Date(referral.client_dob).getFullYear() :
                'N/A'
              }
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Postcode</p>
            <p className="font-medium">{referral.client_postcode || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Referral Source</p>
            <p className="font-medium">{referral.referral_source.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Urgency</p>
            <Badge variant="secondary" className="w-fit">{referral.urgency}</Badge>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Referral Reason</p>
          <p className="text-sm text-muted-foreground p-2 bg-muted rounded">
            {referral.referral_reason}
          </p>
        </div>

        {mode === 'assess' && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Qualification Notes</label>
              <Textarea
                placeholder="Assessment and eligibility notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 min-h-20"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => onQualify(notes)}
                disabled={loading}
                className="flex-1"
              >
                Qualify Referral
              </Button>
              <Button
                variant="outline"
                onClick={() => setMode('decline')}
                disabled={loading}
              >
                Decline
              </Button>
            </div>
          </div>
        )}

        {mode === 'decline' && (
          <div className="space-y-3 p-3 bg-destructive/10 rounded">
            <div>
              <label className="text-sm font-medium">Reason for Declining</label>
              <Textarea
                placeholder="Explain why this referral cannot be served..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="mt-1 min-h-20"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => onDecline(declineReason)}
                disabled={loading}
                className="flex-1"
              >
                Confirm Decline
              </Button>
              <Button
                variant="outline"
                onClick={() => setMode('assess')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}