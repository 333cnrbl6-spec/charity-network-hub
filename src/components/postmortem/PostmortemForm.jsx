import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';

export default function PostmortemForm({ incident, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    root_cause: '',
    impact: '',
    timeline: [],
    action_items: []
  });

  const [newTimelineEvent, setNewTimelineEvent] = useState('');
  const [newActionItem, setNewActionItem] = useState({ action: '', owner: '', deadline: '' });

  const handleAddTimelineEvent = () => {
    if (newTimelineEvent.trim()) {
      setFormData({
        ...formData,
        timeline: [
          ...formData.timeline,
          { timestamp: new Date().toISOString(), event: newTimelineEvent }
        ]
      });
      setNewTimelineEvent('');
    }
  };

  const handleAddActionItem = () => {
    if (newActionItem.action.trim()) {
      setFormData({
        ...formData,
        action_items: [...formData.action_items, newActionItem]
      });
      setNewActionItem({ action: '', owner: '', deadline: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Incident Details</CardTitle>
          <CardDescription>Incident #{incident?.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Postmortem Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <textarea
            placeholder="High-level summary of what happened"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="w-full p-2 border rounded-md"
            rows="3"
            required
          />
          <textarea
            placeholder="Root cause analysis"
            value={formData.root_cause}
            onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
            className="w-full p-2 border rounded-md"
            rows="3"
          />
          <textarea
            placeholder="Customer and business impact"
            value={formData.impact}
            onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
            className="w-full p-2 border rounded-md"
            rows="3"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Chronological events during the incident</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Event description"
              value={newTimelineEvent}
              onChange={(e) => setNewTimelineEvent(e.target.value)}
              className="flex-1 p-2 border rounded-md text-sm"
            />
            <Button type="button" variant="outline" onClick={handleAddTimelineEvent}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {formData.timeline.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded">
                <div>
                  <p className="text-sm font-medium">{item.event}</p>
                  <p className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      timeline: formData.timeline.filter((_, i) => i !== idx)
                    });
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Action Items</CardTitle>
          <CardDescription>Preventive measures to avoid recurrence</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Action description"
              value={newActionItem.action}
              onChange={(e) => setNewActionItem({ ...newActionItem, action: e.target.value })}
              className="p-2 border rounded-md text-sm"
            />
            <input
              type="text"
              placeholder="Owner"
              value={newActionItem.owner}
              onChange={(e) => setNewActionItem({ ...newActionItem, owner: e.target.value })}
              className="p-2 border rounded-md text-sm"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={newActionItem.deadline}
                onChange={(e) => setNewActionItem({ ...newActionItem, deadline: e.target.value })}
                className="p-2 border rounded-md text-sm flex-1"
              />
              <Button type="button" variant="outline" onClick={handleAddActionItem}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {formData.action_items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded">
                <div>
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.owner} • Due: {item.deadline}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      action_items: formData.action_items.filter((_, i) => i !== idx)
                    });
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Publishing...' : 'Publish Postmortem'}
      </Button>
    </form>
  );
}