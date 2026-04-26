import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AssignmentPanel({ referral, volunteers, onAssign, loading }) {
  const [selectedVolunteer, setSelectedVolunteer] = useState('');

  const isAssigned = referral.status === 'assigned' || referral.status === 'active';
  const canAssign = referral.status === 'qualified';

  const assignedPerson = volunteers.find(v => v.id === referral.assigned_to);

  if (!canAssign && !isAssigned) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-900">
              Referral must be qualified before assignment
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAssigned) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Assigned To
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-medium">{referral.assigned_name}</p>
          <p className="text-sm text-muted-foreground">
            Assigned {new Date(referral.assigned_date).toLocaleDateString()}
          </p>
          {referral.first_contact_date && (
            <div className="pt-2 border-t">
              <Badge className="bg-green-100 text-green-800">
                First contact: {new Date(referral.first_contact_date).toLocaleDateString()}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Assign Volunteer/Staff</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Coordinator</label>
          <Select value={selectedVolunteer} onValueChange={setSelectedVolunteer}>
            <SelectTrigger>
              <SelectValue placeholder="Choose coordinator..." />
            </SelectTrigger>
            <SelectContent>
              {volunteers.map((vol) => (
                <SelectItem key={vol.id} value={vol.id}>
                  {vol.full_name} ({vol.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedVolunteer && (
          <div className="p-3 bg-muted rounded">
            <p className="text-xs text-muted-foreground mb-1">Will be assigned</p>
            <p className="font-medium">
              {volunteers.find(v => v.id === selectedVolunteer)?.full_name}
            </p>
          </div>
        )}

        <Button
          onClick={() => onAssign(selectedVolunteer)}
          disabled={!selectedVolunteer || loading}
          className="w-full"
        >
          Confirm Assignment
        </Button>
      </CardContent>
    </Card>
  );
}