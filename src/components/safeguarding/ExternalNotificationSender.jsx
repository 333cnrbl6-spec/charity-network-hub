import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Send, AlertTriangle, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const EXTERNAL_AGENCIES = [
  { id: 'police', name: 'Local Police Force', email: 'safeguarding@police.uk', icon: '🚔' },
  { id: 'adult_social_care', name: 'Adult Social Care', email: 'referrals@socialcare.gov.uk', icon: '👥' },
  { id: 'local_authority', name: 'Local Authority Safeguarding', email: 'safeguarding@localauthority.gov.uk', icon: '🏛️' },
  { id: 'nhs', name: 'NHS Safeguarding Team', email: 'safeguarding@nhs.uk', icon: '🏥' },
  { id: 'cqc', name: 'Care Quality Commission', email: 'enquiries@cqc.org.uk', icon: '✓' },
  { id: 'charity_commission', name: 'Charity Commission', email: 'referrals@charitycommission.gsi.gov.uk', icon: '📋' },
];

export default function ExternalNotificationSender({ incident, onNotificationSent }) {
  const [selectedAgencies, setSelectedAgencies] = useState([]);
  const [sending, setSending] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [sentNotifications, setSentNotifications] = useState([]);

  // Load existing notifications from audit trail
  const existingNotifications = incident?.audit_trail?.filter(
    entry => entry.action === 'external_notification_sent'
  ) || [];

  const handleSendNotification = async () => {
    if (selectedAgencies.length === 0) {
      toast.error('Please select at least one agency');
      return;
    }

    setSending(true);
    try {
      for (const agencyId of selectedAgencies) {
        const agency = EXTERNAL_AGENCIES.find(a => a.id === agencyId);
        
        const response = await base44.functions.invoke('sendExternalAgencyNotification', {
          incident_id: incident.id,
          incident_reference: incident.incident_reference,
          agency_id: agencyId,
          agency_name: agency.name,
          agency_email: agency.email,
          custom_message: notificationMessage,
          incident_details: {
            type: incident.incident_type,
            description: incident.incident_description,
            location: incident.incident_location,
            date: incident.incident_date,
            severity: incident.ai_severity_classification,
            reported_by: incident.reported_by_name,
          }
        });

        if (response.data.success) {
          setSentNotifications(prev => [...prev, {
            agency: agency.name,
            timestamp: new Date().toISOString(),
            status: 'sent'
          }]);
          toast.success(`Notification sent to ${agency.name}`);
        }
      }

      setSelectedAgencies([]);
      setNotificationMessage('');
      
      if (onNotificationSent) {
        onNotificationSent();
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast.error('Failed to send notifications');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          External Agency Notifications
        </CardTitle>
        <CardDescription>
          Send immediate notifications to external agencies about this incident
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alert for high-risk incidents */}
        {(incident.ai_severity_classification === 'critical' || incident.ai_severity_classification === 'high') && (
          <div className="flex gap-3 p-3 bg-orange-100 border border-orange-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-orange-900">High-Risk Incident</p>
              <p className="text-xs text-orange-800 mt-1">
                This incident has been classified as high-risk. External agency notification is recommended.
              </p>
            </div>
          </div>
        )}

        {/* Agency Selection */}
        <div>
          <p className="text-sm font-medium mb-2">Select Agencies to Notify</p>
          <div className="grid grid-cols-2 gap-2">
            {EXTERNAL_AGENCIES.map(agency => (
              <label key={agency.id} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-accent cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAgencies.includes(agency.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAgencies([...selectedAgencies, agency.id]);
                    } else {
                      setSelectedAgencies(selectedAgencies.filter(id => id !== agency.id));
                    }
                  }}
                  className="rounded"
                  disabled={sending}
                />
                <span className="text-sm">
                  <span className="mr-1">{agency.icon}</span>
                  {agency.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Message */}
        <div>
          <p className="text-sm font-medium mb-2">Additional Message (Optional)</p>
          <textarea
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
            placeholder="Add any additional context or instructions for the external agencies..."
            className="w-full p-2 border rounded-lg text-sm h-20 font-body resize-none"
            disabled={sending}
          />
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSendNotification}
          disabled={sending || selectedAgencies.length === 0}
          className="w-full gap-2"
          size="lg"
        >
          <Send className="w-4 h-4" />
          {sending ? 'Sending Notifications...' : 'Send Notifications'}
        </Button>

        {/* Notification History */}
        {existingNotifications.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Notification History
            </p>
            <div className="space-y-2">
              {existingNotifications.map((notif, idx) => {
                const details = notif.details ? JSON.parse(notif.details) : {};
                return (
                  <div key={idx} className="p-2 bg-white rounded text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{details.agency_name}</span>
                      <Badge variant="outline" className="text-xs">Sent</Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {new Date(notif.timestamp).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}