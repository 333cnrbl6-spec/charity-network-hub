import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  { label: 'Morning (8am-12pm)', value: 'morning' },
  { label: 'Afternoon (12pm-5pm)', value: 'afternoon' },
  { label: 'Evening (5pm-8pm)', value: 'evening' },
];

export default function AvailabilityScheduler({ onAvailabilityChange }) {
  const [availability, setAvailability] = React.useState({});

  const toggleDay = (day, timeSlot) => {
    const key = `${day}-${timeSlot}`;
    const newAvailability = { ...availability };
    if (newAvailability[key]) {
      delete newAvailability[key];
    } else {
      newAvailability[key] = true;
    }
    setAvailability(newAvailability);
    onAvailabilityChange(newAvailability);
  };

  const getDayAvailability = (day) => {
    return TIME_SLOTS.filter(ts => availability[`${day}-${ts.value}`]).length;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {DAYS.map(day => (
          <Card key={day} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm">{day}</h4>
              <Badge variant="outline" className="text-xs">
                {getDayAvailability(day)} slots
              </Badge>
            </div>
            <div className="space-y-2">
              {TIME_SLOTS.map(slot => {
                const isChecked = availability[`${day}-${slot.value}`];
                return (
                  <div key={slot.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`${day}-${slot.value}`}
                      checked={isChecked || false}
                      onCheckedChange={() => toggleDay(day, slot.value)}
                    />
                    <Label
                      htmlFor={`${day}-${slot.value}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {slot.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Select the days and times you are available to volunteer.
      </p>
    </div>
  );
}