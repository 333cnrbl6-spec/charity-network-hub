import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, CheckCircle2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors = {
  received: 'bg-blue-100 text-blue-800',
  qualified: 'bg-purple-100 text-purple-800',
  assigned: 'bg-orange-100 text-orange-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  declined: 'bg-red-100 text-red-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
};

const urgencyColors = {
  routine: 'bg-secondary',
  priority: 'bg-yellow-500',
  urgent: 'bg-destructive',
};

const statusIcons = {
  received: Clock,
  qualified: CheckCircle2,
  assigned: User,
  active: CheckCircle2,
};

export default function ReferralCard({ referral, onClick }) {
  const StatusIcon = statusIcons[referral.status] || AlertCircle;
  const referralDate = new Date(referral.referral_date);
  const daysAgo = Math.floor((new Date() - referralDate) / (1000 * 60 * 60 * 24));

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-sm truncate">{referral.client_full_name}</CardTitle>
              <Badge className={statusColors[referral.status]} variant="outline">
                {referral.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{referral.referral_number}</p>
          </div>
          <Badge className={urgencyColors[referral.urgency]}>
            {referral.urgency}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <User className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">{referral.referrer_organization}</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">
            {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
          </span>
        </div>

        {referral.required_services && referral.required_services.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {referral.required_services.slice(0, 2).map((service) => (
              <Badge key={service} variant="secondary" className="text-xs">
                {service.replace('_', ' ')}
              </Badge>
            ))}
            {referral.required_services.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{referral.required_services.length - 2}
              </Badge>
            )}
          </div>
        )}

        {referral.assigned_name && (
          <div className="text-xs pt-2 border-t">
            <span className="text-muted-foreground">Assigned to: </span>
            <span className="font-medium">{referral.assigned_name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}