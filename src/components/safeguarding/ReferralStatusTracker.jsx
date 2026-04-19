import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, AlertCircle, CheckCircle2, FileText, Plus, Edit2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const RESPONSE_SLA = {
  police: 24,
  social_services: 48,
  cqc: 72,
  lado: 72,
  other: 96,
};

const AGENCY_COLORS = {
  police: 'bg-blue-100 text-blue-800 border-blue-200',
  social_services: 'bg-purple-100 text-purple-800 border-purple-200',
  cqc: 'bg-amber-100 text-amber-800 border-amber-200',
  lado: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200',
};

const STATUS_ICONS = {
  pending: Clock,
  acknowledged: Clock,
  investigating: FileText,
  completed: CheckCircle2,
  overdue: AlertCircle,
};

export default function ReferralStatusTracker({ incident, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  if (!incident.external_referrals || incident.external_referrals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            External Referral Tracking
          </CardTitle>
          <CardDescription>Monitor progress of statutory agency referrals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No external referrals have been made yet.</p>
            {incident.ai_risk_assessment?.statutory_referral_required && (
              <p className="text-sm text-orange-600 font-medium">
                ⚠️ This incident requires statutory referral to external agencies.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getReferralAgencyType = (agencyName) => {
    const name = agencyName.toLowerCase();
    if (name.includes('police')) return 'police';
    if (name.includes('social') || name.includes('services')) return 'social_services';
    if (name.includes('cqc')) return 'cqc';
    if (name.includes('lado')) return 'lado';
    return 'other';
  };

  const getResponseStatus = (referral) => {
    const agencyType = getReferralAgencyType(referral.agency);
    const slaDays = RESPONSE_SLA[agencyType];
    const daysElapsed = differenceInDays(new Date(), new Date(referral.referral_date));

    if (referral.outcome === 'completed') return 'completed';
    if (daysElapsed > slaDays && !referral.outcome) return 'overdue';
    if (referral.outcome === 'acknowledged') return 'acknowledged';
    if (referral.outcome === 'investigating') return 'investigating';

    return 'pending';
  };

  const handleUpdateReferral = async (referralIdx) => {
    if (onUpdate) {
      const updatedReferrals = [...incident.external_referrals];
      updatedReferrals[referralIdx] = {
        ...updatedReferrals[referralIdx],
        ...editData,
      };
      await onUpdate('external_referrals', updatedReferrals);
      setEditingId(null);
      setEditData({});
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          External Referral Tracking
        </CardTitle>
        <CardDescription>Monitor progress of statutory agency referrals and response times</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {incident.external_referrals.map((referral, idx) => {
            const agencyType = getReferralAgencyType(referral.agency);
            const slaDays = RESPONSE_SLA[agencyType];
            const daysElapsed = differenceInDays(new Date(), new Date(referral.referral_date));
            const status = getResponseStatus(referral);
            const StatusIcon = STATUS_ICONS[status] || Clock;

            const isOverdue = status === 'overdue';
            const isCompleted = status === 'completed';

            return (
              <div
                key={idx}
                className={`border rounded-lg p-4 ${
                  isOverdue
                    ? 'border-red-300 bg-red-50'
                    : isCompleted
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <StatusIcon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isOverdue
                          ? 'text-red-600'
                          : isCompleted
                            ? 'text-green-600'
                            : 'text-blue-600'
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-sm">{referral.agency}</p>
                      {referral.contact_name && (
                        <p className="text-xs text-muted-foreground">{referral.contact_name}</p>
                      )}
                    </div>
                  </div>
                  {editingId !== idx && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingId(idx);
                        setEditData(referral);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {editingId === idx ? (
                  <div className="space-y-3 mb-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Status
                      </label>
                      <Select
                        value={editData.outcome || 'pending'}
                        onValueChange={v => setEditData({ ...editData, outcome: v })}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending Response</SelectItem>
                          <SelectItem value="acknowledged">Acknowledged</SelectItem>
                          <SelectItem value="investigating">Investigating</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Reference Number (optional)
                      </label>
                      <Input
                        size="sm"
                        value={editData.reference_number || ''}
                        onChange={e => setEditData({ ...editData, reference_number: e.target.value })}
                        placeholder="e.g., PS123456"
                        className="h-8 text-sm"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateReferral(idx)}
                        className="text-xs"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          setEditData({});
                        }}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Referral Date:</span>
                      <span className="font-medium">{format(new Date(referral.referral_date), 'PPP')}</span>
                    </div>

                    {referral.reference_number && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Reference:</span>
                        <span className="font-mono font-medium">{referral.reference_number}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        className={`${AGENCY_COLORS[agencyType]} border`}
                        variant="outline"
                      >
                        {referral.outcome
                          ? referral.outcome.replace(/_/g, ' ').charAt(0).toUpperCase() +
                            referral.outcome.replace(/_/g, ' ').slice(1)
                          : 'Pending'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-muted-foreground">Response Time:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{daysElapsed} days</span>
                        <span className="text-xs text-muted-foreground">
                          (SLA: {slaDays} hours)
                        </span>
                      </div>
                    </div>

                    {isOverdue && !isCompleted && (
                      <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-900 font-medium">
                        ⚠️ OVERDUE: Response expected within {slaDays} hours of referral
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SLA Reference Guide */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-semibold text-blue-900 mb-2">Response Time SLAs:</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
            <div>🚔 Police: 24 hours</div>
            <div>👥 Social Services: 48 hours</div>
            <div>📋 CQC: 72 hours</div>
            <div>⚖️ LADO: 72 hours</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}