import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import VolunteerMatchingRecommendations from './VolunteerMatchingRecommendations';

const AVAILABLE_SKILLS = [
  'Befriending', 'Home Maintenance', 'Gardening', 'IT Support',
  'Shopping Assistance', 'Driving', 'Cooking/Meals', 'Handyman Skills'
];

export default function JobCreationWithMatching() {
  const [showForm, setShowForm] = useState(false);
  const [createdJobId, setCreatedJobId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    scheduled_date: '',
    scheduled_time: '',
    required_skills: [],
    estimated_duration: ''
  });

  const queryClient = useQueryClient();

  const createJobMutation = useMutation({
    mutationFn: async (data) => {
      const job = await base44.entities.Job.create({
        ...data,
        status: 'open',
        created_date: new Date().toISOString()
      });
      return job;
    },
    onSuccess: (job) => {
      setCreatedJobId(job.id);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setFormData({
        title: '',
        description: '',
        location: '',
        scheduled_date: '',
        scheduled_time: '',
        required_skills: [],
        estimated_duration: ''
      });
    }
  });

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.includes(skill)
        ? prev.required_skills.filter(s => s !== skill)
        : [...prev.required_skills, skill]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createJobMutation.mutate(formData);
  };

  if (createdJobId) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-green-900 font-semibold">✓ Job created successfully! Now finding the best volunteers...</p>
          </CardContent>
        </Card>
        <VolunteerMatchingRecommendations jobId={createdJobId} jobTitle={formData.title} />
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setCreatedJobId(null);
            setShowForm(true);
          }}
        >
          Create Another Job
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="w-full gap-2">
          <Plus className="w-4 h-4" /> Create New Job
        </Button>
      ) : (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Create New Job Request</CardTitle>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Job Title *</label>
                <Input
                  placeholder="e.g., Home Maintenance - Gutter Cleaning"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Detailed description of the work needed..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Location *</label>
                  <Input
                    placeholder="Postcode or address"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estimated Duration</label>
                  <Input
                    placeholder="e.g., 2 hours"
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date *</label>
                  <Input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time *</label>
                  <Input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Required Skills</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SKILLS.map(skill => (
                    <Badge
                      key={skill}
                      variant={formData.required_skills.includes(skill) ? 'default' : 'outline'}
                      className="cursor-pointer px-3 py-2"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createJobMutation.isPending} className="flex-1">
                  Create Job & Get Recommendations
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}