import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function TrainingComplianceDashboard() {
  const { data: trainings = [] } = useQuery({
    queryKey: ['volunteer-trainings'],
    queryFn: () => base44.entities.VolunteerTraining.list(),
  });

  const complianceStats = useMemo(() => {
    const now = new Date();
    let compliant = 0;
    let expiringWithin30 = 0;
    let expired = 0;
    const byVolunteer = new Map();

    for (const training of trainings) {
      if (!training.expiry_date) continue;

      const daysUntilExpiry = differenceInDays(new Date(training.expiry_date), now);
      const isExpired = daysUntilExpiry <= 0;
      const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

      if (isExpired) expired++;
      else if (isExpiringSoon) expiringWithin30++;
      else compliant++;

      // Track by volunteer
      if (!byVolunteer.has(training.volunteer_id)) {
        byVolunteer.set(training.volunteer_id, {
          name: training.volunteer_name,
          email: training.volunteer_email,
          trainings: [],
        });
      }

      byVolunteer.get(training.volunteer_id).trainings.push({
        type: training.training_type,
        expiry: training.expiry_date,
        daysUntilExpiry,
        status: isExpired ? 'expired' : isExpiringSoon ? 'expiring_soon' : 'compliant',
      });
    }

    return {
      compliant,
      expiringWithin30,
      expired,
      total: trainings.length,
      byVolunteer,
    };
  }, [trainings]);

  const nonCompliantVolunteers = Array.from(complianceStats.byVolunteer.values()).filter(v =>
    v.trainings.some(t => t.status === 'expired' || t.status === 'expiring_soon')
  );

  const complianceRate = complianceStats.total
    ? Math.round(((complianceStats.total - complianceStats.expired) / complianceStats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Compliance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceRate}%</div>
            <p className="text-xs text-muted-foreground mt-2">Of all trainings current</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Compliant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{complianceStats.compliant}</div>
            <p className="text-xs text-muted-foreground mt-2">Up to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{complianceStats.expiringWithin30}</div>
            <p className="text-xs text-muted-foreground mt-2">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{complianceStats.expired}</div>
            <p className="text-xs text-muted-foreground mt-2">Non-compliant</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert if expired trainings exist */}
      {complianceStats.expired > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="w-5 h-5" />
              Non-Compliant Staff
            </CardTitle>
            <CardDescription className="text-red-800">
              {complianceStats.expired} training record(s) have expired
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-900">
              Staff with expired safeguarding training should not work with vulnerable adults until
              training is renewed.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Non-Compliant Volunteers List */}
      {nonCompliantVolunteers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Volunteers Requiring Action</CardTitle>
            <CardDescription>
              {nonCompliantVolunteers.length} volunteer(s) with expired or expiring training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nonCompliantVolunteers.map(volunteer => (
                <div key={volunteer.email} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{volunteer.name}</p>
                      <p className="text-xs text-muted-foreground">{volunteer.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {volunteer.trainings
                      .filter(t => t.status === 'expired' || t.status === 'expiring_soon')
                      .map((training, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <span className="text-muted-foreground">
                            {training.type.replace(/_/g, ' ')}
                          </span>

                          <div className="flex items-center gap-2">
                            {training.status === 'expired' ? (
                              <>
                                <Badge className="bg-red-100 text-red-800 border-red-200">
                                  Expired
                                </Badge>
                                <span className="text-xs text-red-600 font-medium">
                                  {Math.abs(training.daysUntilExpiry)} days ago
                                </span>
                              </>
                            ) : (
                              <>
                                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                  Expiring
                                </Badge>
                                <span className="text-xs text-amber-600 font-medium">
                                  In {training.daysUntilExpiry} days
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Guidance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Training Renewal Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <div>
            <p className="font-semibold mb-1">📋 Mandatory Training Types:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Safeguarding (annual refresh required)</li>
              <li>DBS Check Renewal (every 3 years)</li>
              <li>Manual Handling (annual)</li>
              <li>First Aid (3 yearly)</li>
              <li>Food Hygiene (depends on role)</li>
            </ul>
          </div>

          <div className="pt-2 border-t">
            <p className="font-semibold mb-1">🔄 Renewal Process:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Arrange training with provider</li>
              <li>Complete training before expiry</li>
              <li>Upload certificate to system</li>
              <li>Manager verifies completion</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}