import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2, Calendar, FileText, Bell, Award, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

const URGENCY_COLORS = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

const COMPLIANCE_COLORS = {
  mandatory: 'bg-red-100 text-red-800 border-red-300',
  recommended: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  optional: 'bg-blue-100 text-blue-800 border-blue-300',
};

export default function TrainingExpiryDashboard() {
  const [checking, setChecking] = useState(false);
  const [expiringData, setExpiringData] = useState({ expired: [], expiring_soon: [] });

  const { data: trainingRecords = [], refetch } = useQuery({
    queryKey: ['volunteerTraining'],
    queryFn: () => base44.entities.VolunteerTraining.list(),
  });

  const checkExpiry = async () => {
    setChecking(true);
    try {
      const { data } = await base44.functions.invoke('checkTrainingExpiry', {});
      setExpiringData({
        expired: data.expired || [],
        expiring_soon: data.expiring_soon || []
      });
      toast.success('Expiry check complete', {
        description: `${data.expired_count} expired, ${data.expiring_soon_count} expiring soon`
      });
      refetch();
    } catch (error) {
      console.error('Expiry check failed:', error);
      toast.error('Expiry check failed', { description: error.message });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkExpiry();
  }, []);

  const getUrgencyBadge = (urgency, days) => {
    const color = URGENCY_COLORS[urgency] || URGENCY_COLORS.medium;
    return (
      <Badge className={color}>
        {urgency === 'critical' ? (
          <AlertTriangle className="w-3 h-3 mr-1" />
        ) : (
          <Clock className="w-3 h-3 mr-1" />
        )}
        {days} {days === 1 ? 'day' : 'days'}
      </Badge>
    );
  };

  const expiredCount = expiringData.expired.length;
  const expiringSoonCount = expiringData.expiring_soon.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Training Expiry Dashboard
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={checkExpiry}
            disabled={checking}
          >
            <Clock className={`w-3 h-3 mr-1 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking...' : 'Check Now'}
          </Button>
        </CardTitle>
        <CardDescription>
          Monitor training expiry dates and automated alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="border rounded-lg p-3 text-center bg-red-50">
            <p className="text-xs text-red-800 font-semibold mb-1">Expired</p>
            <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
          </div>
          <div className="border rounded-lg p-3 text-center bg-orange-50">
            <p className="text-xs text-orange-800 font-semibold mb-1">Expiring Soon</p>
            <p className="text-2xl font-bold text-orange-600">{expiringSoonCount}</p>
          </div>
          <div className="border rounded-lg p-3 text-center bg-green-50">
            <p className="text-xs text-green-800 font-semibold mb-1">Current</p>
            <p className="text-2xl font-bold text-green-600">
              {trainingRecords.filter(t => t.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Expired Training */}
        {expiredCount > 0 && (
          <div>
            <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Expired Training ({expiredCount})
            </h4>
            <div className="space-y-2">
              {expiringData.expired.map((record) => (
                <div
                  key={record.id}
                  className="border-2 border-red-300 rounded-lg p-3 bg-red-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={COMPLIANCE_COLORS[record.compliance_category]}>
                          {record.compliance_category}
                        </Badge>
                        <Badge className="bg-red-100 text-red-800">
                          EXPIRED
                        </Badge>
                      </div>
                      <p className="font-bold text-sm">{record.volunteer_name}</p>
                      <p className="text-xs mt-1">
                        {record.training_type.replace(/_/g, ' ')} • 
                        Expired {record.days_overdue} day(s) ago
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Provider: {record.training_provider || 'N/A'} • 
                        Certificate: {record.certificate_number || 'Not uploaded'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-red-600">
                        {new Date(record.expiry_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expiring Soon */}
        {expiringSoonCount > 0 && (
          <div>
            <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Expiring Soon ({expiringSoonCount})
            </h4>
            <div className="space-y-2">
              {expiringData.expiring_soon.map((record) => (
                <div
                  key={record.id}
                  className={`border-2 rounded-lg p-3 ${URGENCY_COLORS[record.urgency]}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={COMPLIANCE_COLORS[record.compliance_category]}>
                          {record.compliance_category}
                        </Badge>
                        {getUrgencyBadge(record.urgency, record.days_until_expiry)}
                      </div>
                      <p className="font-bold text-sm">{record.volunteer_name}</p>
                      <p className="text-xs mt-1">
                        {record.training_type.replace(/_/g, ' ')} • 
                        Expires in {record.days_until_expiry} day(s)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Provider: {record.training_provider || 'N/A'} • 
                        Certificate: {record.certificate_number || 'Not uploaded'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold">
                        {new Date(record.expiry_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Alerts */}
        {expiredCount === 0 && expiringSoonCount === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-12 h-8 mx-auto mb-2 text-green-600" />
            <p>All training up to date</p>
            <p className="text-xs mt-1">No expired or expiring training</p>
          </div>
        )}

        {/* Info Box */}
        <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
          <p className="text-xs text-blue-800 flex items-center gap-2">
            <Bell className="w-3 h-3" />
            Automated alerts sent for training expiring within 90 days. Critical alerts for 30 days or less.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}