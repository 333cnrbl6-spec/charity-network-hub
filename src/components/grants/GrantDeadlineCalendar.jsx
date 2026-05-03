import React, { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';

export default function GrantDeadlineCalendar({ grants = [] }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Group grants by deadline
  const grantsByDate = useMemo(() => {
    const map = {};
    grants?.forEach(grant => {
      if (grant.deadline) {
        const dateKey = format(new Date(grant.deadline), 'yyyy-MM-dd');
        if (!map[dateKey]) {
          map[dateKey] = [];
        }
        map[dateKey].push(grant);
      }
    });
    return map;
  }, [grants]);

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const grantsOnSelectedDate = grantsByDate[selectedDateKey] || [];

  // Get all dates with grants
  const datesWithGrants = Object.keys(grantsByDate).map(dateStr => new Date(dateStr));

  const getStatusColor = (status) => {
    switch (status) {
      case 'awarded':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Grant Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasGrants: datesWithGrants
            }}
            modifiersClassNames={{
              hasGrants: 'bg-amber-100 font-bold'
            }}
          />
        </CardContent>
      </Card>

      {/* Selected Date Grants */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {format(selectedDate, 'MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {grantsOnSelectedDate.length > 0 ? (
            <div className="space-y-3">
              {grantsOnSelectedDate.map(grant => (
                <div
                  key={grant.id}
                  className="border rounded-lg p-3 hover:bg-slate-50 transition"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                      {grant.grant_name}
                    </h4>
                    <Badge className={getStatusColor(grant.status)}>
                      {grant.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {grant.funder_name}
                  </p>
                  <p className="text-sm font-bold text-primary">
                    £{grant.amount?.toLocaleString() || '—'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                No grants due on this date
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}