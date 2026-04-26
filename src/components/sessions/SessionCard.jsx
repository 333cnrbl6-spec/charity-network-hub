import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SessionCard({ session, onClick }) {
  const scheduled = new Date(session.scheduled_date);
  const isToday = scheduled.toDateString() === new Date().toDateString();
  const isSoon = scheduled < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const capacityPercent = (session.attendees_count / session.max_capacity) * 100;

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-lg transition-shadow hover:border-primary"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-2">{session.session_name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {session.session_type.replace('_', ' ')}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              isToday && 'bg-red-100 text-red-800 border-red-300',
              isSoon && !isToday && 'bg-orange-100 text-orange-800 border-orange-300'
            )}
          >
            {isToday ? 'Today' : isSoon ? 'Soon' : scheduled.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Attendance */}
        <div className="flex items-center gap-2 text-xs">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <div className="flex-1">
            <span className="text-muted-foreground">
              {session.attendees_count} / {session.max_capacity} registered
            </span>
          </div>
          <span className="font-medium text-xs">{Math.round(capacityPercent)}%</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${Math.min(capacityPercent, 100)}%` }}
          />
        </div>

        {/* Details */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{scheduled.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{session.location}</span>
          </div>
          {session.facilitator && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-3 h-3" />
              <span>{session.facilitator}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}