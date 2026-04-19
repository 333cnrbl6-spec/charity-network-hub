import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileCheck, Plus, Trash2 } from 'lucide-react';

export default function PeerReviewSubmission({ incident, onSubmitSuccess }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    executive_summary: '',
    investigation_summary: '',
    recommended_actions: [{ action: '', responsible_person: '', due_date: '', priority: 'medium' }],
    assigned_reviewer: '',
    lessons_learned: '',
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.PeerReview.create({
        incident_id: incident.id,
        incident_reference: incident.incident_reference,
        submitted_by: user.email,
        submitted_by_name: user.full_name,
        submission_date: new Date().toISOString(),
        ...data,
        recommended_actions: data.recommended_actions.filter(a => a.action),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peer-reviews'] });
      if (onSubmitSuccess) onSubmitSuccess();
    },
  });

  const addAction = () => {
    setFormData({
      ...formData,
      recommended_actions: [
        ...formData.recommended_actions,
        { action: '', responsible_person: '', due_date: '', priority: 'medium' },
      ],
    });
  };

  const removeAction = (index) => {
    setFormData({
      ...formData,
      recommended_actions: formData.recommended_actions.filter((_, i) => i !== index),
    });
  };

  const updateAction = (index, field, value) => {
    const updated = [...formData.recommended_actions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, recommended_actions: updated });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-primary" />
          Submit for Peer Review
        </CardTitle>
        <CardDescription>
          Complete your incident report and submit for sign-off by a senior manager
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Executive Summary */}
        <div>
          <label className="text-sm font-medium mb-2 block">Executive Summary *</label>
          <Textarea
            placeholder="Brief summary of the incident, severity, and key actions taken"
            value={formData.executive_summary}
            onChange={e => setFormData({ ...formData, executive_summary: e.target.value })}
            className="min-h-20"
          />
        </div>

        {/* Investigation Summary */}
        <div>
          <label className="text-sm font-medium mb-2 block">Investigation Findings *</label>
          <Textarea
            placeholder="Detailed findings from your investigation"
            value={formData.investigation_summary}
            onChange={e => setFormData({ ...formData, investigation_summary: e.target.value })}
            className="min-h-24"
          />
        </div>

        {/* Lessons Learned */}
        <div>
          <label className="text-sm font-medium mb-2 block">Lessons Learned</label>
          <Textarea
            placeholder="What can the organization learn from this incident?"
            value={formData.lessons_learned}
            onChange={e => setFormData({ ...formData, lessons_learned: e.target.value })}
            className="min-h-20"
          />
        </div>

        {/* Recommended Actions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Recommended Actions</label>
            <Button size="sm" variant="outline" onClick={addAction} className="gap-1">
              <Plus className="w-3 h-3" />
              Add Action
            </Button>
          </div>

          <div className="space-y-3">
            {formData.recommended_actions.map((action, idx) => (
              <div key={idx} className="p-4 border rounded-lg space-y-3">
                <Textarea
                  placeholder="Describe the action"
                  value={action.action}
                  onChange={e => updateAction(idx, 'action', e.target.value)}
                  className="min-h-16 text-sm"
                />

                <div className="grid grid-cols-3 gap-3">
                  <Input
                    placeholder="Responsible person"
                    value={action.responsible_person}
                    onChange={e => updateAction(idx, 'responsible_person', e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    type="date"
                    value={action.due_date}
                    onChange={e => updateAction(idx, 'due_date', e.target.value)}
                    className="text-sm"
                  />
                  <Select
                    value={action.priority}
                    onValueChange={val => updateAction(idx, 'priority', val)}
                  >
                    <SelectTrigger className="h-9">
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

                {formData.recommended_actions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAction(idx)}
                    className="text-destructive hover:text-destructive gap-1 h-8"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Assign Reviewer */}
        <div>
          <label className="text-sm font-medium mb-2 block">Assign Reviewer *</label>
          <Input
            placeholder="Email of senior manager to review"
            type="email"
            value={formData.assigned_reviewer}
            onChange={e => setFormData({ ...formData, assigned_reviewer: e.target.value })}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-2 justify-end">
          <Button
            onClick={() => submitMutation.mutate(formData)}
            disabled={
              !formData.executive_summary ||
              !formData.investigation_summary ||
              !formData.assigned_reviewer ||
              submitMutation.isPending
            }
            className="gap-2"
          >
            <FileCheck className="w-4 h-4" />
            {submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}