import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2, Check, Trash2 } from 'lucide-react';

export default function WizardStep2TeamInvites({ charityId, onComplete }) {
  const [email, setEmail] = useState('');
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);

  const validateEmail = (emailStr) => {
    // RFC 5322 simplified regex (covers 99% of valid emails)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(emailStr.trim());
  };

  const addInvite = (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter an email');
      return;
    }

    const emailTrimmed = email.trim().toLowerCase();

    // Validate email format
    if (!validateEmail(emailTrimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    // Check for duplicates (case-insensitive)
    if (invites.some(inv => inv.email.toLowerCase() === emailTrimmed)) {
      setError('This email is already added');
      return;
    }

    // Rate limit: max 20 invites per session (prevent spam)
    if (invites.length >= 20) {
      setError('Maximum 20 team members can be invited at once');
      return;
    }

    setInvites([...invites, { email: emailTrimmed, status: 'pending' }]);
    setEmail('');
    setError(null);
  };

  const removeInvite = (emailToRemove) => {
    setInvites(invites.filter(inv => inv.email !== emailToRemove));
  };

  const handleSendInvites = async () => {
    if (invites.length === 0) {
      // Allow skipping team invites
      setCompleted(true);
      setTimeout(() => {
        onComplete();
      }, 1000);
      return;
    }

    setLoading(true);
    try {
      // Set 15-second timeout for invite batch
      const inviteTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Invite timeout - please try again')), 15000)
      );

      // Send invites sequentially with error handling per invite
      const inviteResults = [];
      for (const invite of invites) {
        try {
          await Promise.race([
            base44.users.inviteUser(invite.email, 'user'),
            inviteTimeout
          ]);
          inviteResults.push({ email: invite.email, success: true });
        } catch (inviteErr) {
          // Log which email failed but continue with others
          console.warn(`Failed to invite ${invite.email}:`, inviteErr);
          inviteResults.push({ email: invite.email, success: false, error: inviteErr.message });
        }
      }

      const successCount = inviteResults.filter(r => r.success).length;

      if (successCount === 0) {
        setError('Failed to send any invites. Please try again.');
        setLoading(false);
        return;
      }

      // Log the invites in audit (record success and failures)
      await base44.functions.invoke('logAuditEvent', {
        charity_id: charityId,
        action: 'team_members_invited_onboarding',
        entity_type: 'User',
        changes: {
          invites_sent: successCount,
          invites_failed: inviteResults.filter(r => !r.success).length,
          emails: inviteResults.map(r => ({ email: r.email, sent: r.success }))
        }
      });

      // Show partial success message if some failed
      if (successCount < invites.length) {
        setError(`Sent ${successCount} of ${invites.length} invites. Some failed.`);
      }

      setCompleted(true);
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (err) {
      if (err.message.includes('timeout')) {
        setError('Request took too long. Please try again.');
      } else {
        setError(err.message || 'Failed to send invites');
      }
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <p className="text-lg font-medium text-center">
          {invites.length > 0 ? 'Invites sent successfully!' : 'Skipped team invites'}
        </p>
        <p className="text-sm text-muted-foreground text-center">Moving to next step...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>Tip:</strong> You can add team members now or skip and do it later. They'll be able to help manage volunteers once they accept their invite.
        </p>
      </div>

      <form onSubmit={addInvite} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="colleague@charity.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            variant="outline"
            disabled={loading || !email.trim()}
          >
            Add
          </Button>
        </div>
      </form>

      {error && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="flex items-start gap-3 pt-4">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="font-medium text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Invites List */}
      {invites.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Team Members to Invite ({invites.length})</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {invites.map(invite => (
              <div
                key={invite.email}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">{invite.email}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {invite.status}
                  </Badge>
                </div>
                <button
                  type="button"
                  onClick={() => removeInvite(invite.email)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={handleSendInvites}
        className="w-full"
        disabled={loading}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {loading
          ? 'Sending Invites...'
          : invites.length > 0
          ? `Send ${invites.length} Invite${invites.length > 1 ? 's' : ''} & Continue`
          : 'Skip & Continue'}
      </Button>
    </div>
  );
}