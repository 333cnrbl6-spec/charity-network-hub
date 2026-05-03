import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Plus, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportScheduleManager({ charityId }) {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [formData, setFormData] = useState({
    schedule_enabled: false,
    report_frequency: 'monthly',
    send_day_of_month: 1,
    stakeholder_emails: [],
    include_sections: {
      volunteer_hours: true,
      grant_milestones: true,
      activity_summary: true,
      financial_impact: true,
      client_outcomes: true
    }
  });

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const result = await base44.entities.ReportScheduleConfig.filter({
          charity_id: charityId
        });
        if (result && result.length > 0) {
          setFormData(result[0]);
          setSchedule(result[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to load schedule:', error);
        setLoading(false);
      }
    };
    loadSchedule();
  }, [charityId]);

  const handleAddEmail = (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      alert('Please enter a valid email');
      return;
    }

    if (formData.stakeholder_emails.includes(newEmail.trim())) {
      alert('Email already added');
      return;
    }

    setFormData({
      ...formData,
      stakeholder_emails: [...formData.stakeholder_emails, newEmail.trim()]
    });
    setNewEmail('');
  };

  const handleRemoveEmail = (emailToRemove) => {
    setFormData({
      ...formData,
      stakeholder_emails: formData.stakeholder_emails.filter(e => e !== emailToRemove)
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (schedule && schedule.id) {
        // Update existing
        await base44.entities.ReportScheduleConfig.update(schedule.id, {
          schedule_enabled: formData.schedule_enabled,
          report_frequency: formData.report_frequency,
          send_day_of_month: formData.send_day_of_month,
          stakeholder_emails: formData.stakeholder_emails,
          include_sections: formData.include_sections
        });
      } else {
        // Create new
        await base44.entities.ReportScheduleConfig.create({
          charity_id: charityId,
          ...formData
        });
      }
      alert('Report schedule saved successfully');
    } catch (error) {
      alert('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateNow = async () => {
    try {
      setSaving(true);
      const result = await base44.functions.invoke('generateMonthlyImpactReport', {
        charity_id: charityId
      });
      if (result.file_url) {
        window.open(result.file_url, '_blank');
      }
    } catch (error) {
      alert('Failed to generate report: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Enable Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Schedule Setup
          </CardTitle>
          <CardDescription>Enable automatic monthly impact reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="enabled"
              checked={formData.schedule_enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, schedule_enabled: checked })
              }
            />
            <label htmlFor="enabled" className="text-sm font-medium cursor-pointer">
              Enable automatic monthly reports
            </label>
            {formData.schedule_enabled && (
              <Badge className="ml-auto bg-green-100 text-green-800">Active</Badge>
            )}
          </div>

          {formData.schedule_enabled && (
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <label className="text-sm font-medium">Report Frequency</label>
                <Select
                  value={formData.report_frequency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, report_frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Send on Day of Month</label>
                <Select
                  value={String(formData.send_day_of_month)}
                  onValueChange={(value) =>
                    setFormData({ ...formData, send_day_of_month: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={String(day)}>
                        Day {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stakeholder Emails */}
      <Card>
        <CardHeader>
          <CardTitle>Stakeholder Distribution List</CardTitle>
          <CardDescription>Who should receive the monthly reports?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="email@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddEmail(e)}
            />
            <Button onClick={handleAddEmail} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {formData.stakeholder_emails.length > 0 ? (
            <div className="space-y-2">
              {formData.stakeholder_emails.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded border"
                >
                  <span className="text-sm">{email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEmail(email)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recipients added yet</p>
          )}
        </CardContent>
      </Card>

      {/* Report Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Report Sections</CardTitle>
          <CardDescription>Choose which sections to include</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(formData.include_sections).map(([key, enabled]) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={key}
                checked={enabled}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    include_sections: { ...formData.include_sections, [key]: checked }
                  })
                }
              />
              <label htmlFor={key} className="text-sm cursor-pointer">
                {key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Last Sent Info */}
      {schedule?.last_sent && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              Last report sent: <span className="font-semibold">{format(new Date(schedule.last_sent), 'MMM d, yyyy')}</span>
            </p>
            {schedule?.next_scheduled && (
              <p className="text-sm text-blue-900 mt-1">
                Next report: <span className="font-semibold">{format(new Date(schedule.next_scheduled), 'MMM d, yyyy')}</span>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button
          onClick={handleGenerateNow}
          variant="outline"
          disabled={saving}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Generate Now
        </Button>
      </div>
    </div>
  );
}