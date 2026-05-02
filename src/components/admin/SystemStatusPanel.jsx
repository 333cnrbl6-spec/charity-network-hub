import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function SystemStatusPanel() {
  const [status, setStatus] = useState('operational');
  const [message, setMessage] = useState('All systems operational');
  const [incidentType, setIncidentType] = useState('none');
  const [severity, setSeverity] = useState('low');
  const [affectedServices, setAffectedServices] = useState('');
  const [saving, setSaving] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await base44.entities.SystemStatus.list();
        if (data.length > 0) {
          const latest = data[0];
          setCurrentStatus(latest);
          setStatus(latest.status);
          setMessage(latest.message);
          setIncidentType(latest.incident_type);
          setSeverity(latest.severity);
          setAffectedServices(latest.affected_services?.join(', ') || '');
        }
      } catch (error) {
        console.error('Failed to fetch status:', error);
      }
    };

    fetchStatus();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        status,
        message,
        incident_type: incidentType,
        severity,
        affected_services: affectedServices.split(',').map(s => s.trim()).filter(Boolean),
        started_at: status !== 'operational' ? new Date().toISOString() : null,
        resolved_at: status === 'operational' ? new Date().toISOString() : null
      };

      if (currentStatus) {
        await base44.entities.SystemStatus.update(currentStatus.id, data);
      } else {
        await base44.entities.SystemStatus.create(data);
      }

      alert('Status updated successfully');
    } catch (error) {
      console.error('Failed to save status:', error);
      alert('Error saving status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'operational' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            System Status Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">System Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operational">✅ Operational</SelectItem>
                <SelectItem value="degraded">⚠️ Degraded</SelectItem>
                <SelectItem value="down">🔴 Down</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-2">Status Message</label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., Database maintenance in progress"
            />
          </div>

          {/* Incident Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Incident Type</label>
            <Select value={incidentType} onValueChange={setIncidentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="maintenance">Scheduled Maintenance</SelectItem>
                <SelectItem value="performance">Performance Degradation</SelectItem>
                <SelectItem value="outage">Service Outage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          {status !== 'operational' && (
            <div>
              <label className="block text-sm font-medium mb-2">Severity</label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Affected Services */}
          {status !== 'operational' && (
            <div>
              <label className="block text-sm font-medium mb-2">Affected Services (comma-separated)</label>
              <Input
                value={affectedServices}
                onChange={(e) => setAffectedServices(e.target.value)}
                placeholder="e.g., API, Dashboard, Payments"
              />
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full"
          >
            {saving ? 'Saving...' : 'Update Status'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}