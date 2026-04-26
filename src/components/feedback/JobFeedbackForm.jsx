import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { X, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { playSuccess, playClick, playError } from '@/lib/audio';

const QUALITY_OPTIONS = [
  { value: 'poor', label: 'Poor', color: 'bg-red-100 text-red-800' },
  { value: 'fair', label: 'Fair', color: 'bg-orange-100 text-orange-800' },
  { value: 'good', label: 'Good', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'very_good', label: 'Very Good', color: 'bg-blue-100 text-blue-800' },
  { value: 'excellent', label: 'Excellent', color: 'bg-green-100 text-green-800' },
];

const STRENGTHS = [
  'Punctuality',
  'Helpfulness',
  'Professionalism',
  'Communication',
  'Problem-solving',
  'Empathy',
  'Reliability',
];

const IMPROVEMENTS = [
  'Punctuality',
  'Responsiveness',
  'Professionalism',
  'Communication skills',
  'Follow-up',
  'Cultural sensitivity',
  'Patience',
];

export default function JobFeedbackForm({ job, onSubmit }) {
  const [satisfactionScore, setSatisfactionScore] = useState(5);
  const [serviceQuality, setServiceQuality] = useState('good');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [selectedStrengths, setSelectedStrengths] = useState([]);
  const [selectedImprovements, setSelectedImprovements] = useState([]);
  const [notes, setNotes] = useState('');
  const [followUpNeeded, setFollowUpNeeded] = useState(false);
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const submitFeedback = useMutation({
    mutationFn: async () => {
      const feedbackData = {
        job_id: job.id,
        client_id: job.client_id,
        client_name: job.client_name,
        volunteer_id: job.volunteer_id,
        volunteer_name: job.volunteer_name,
        satisfaction_score: satisfactionScore,
        would_recommend: wouldRecommend,
        service_quality: serviceQuality,
        key_areas: selectedStrengths,
        improvements: selectedImprovements,
        qualitative_notes: notes,
        follow_up_needed: followUpNeeded,
        follow_up_notes: followUpNotes,
        feedback_date: new Date().toISOString(),
        job_type: job.job_type,
        branch_id: job.branch_id,
      };

      return base44.entities.JobFeedback.create(feedbackData);
    },
    onSuccess: () => {
      playSuccess();
      queryClient.invalidateQueries({ queryKey: ['jobFeedback'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      onSubmit?.();
    },
    onError: (error) => {
      playError();
      console.error('Failed to submit feedback:', error);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitFeedback.mutateAsync();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Client Feedback
        </CardTitle>
        <CardDescription>
          {job.client_name} • {job.job_type?.replace('-', ' ')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Satisfaction Score */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Overall Satisfaction (1-5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => {
                    setSatisfactionScore(score);
                    playClick();
                  }}
                  className={`p-3 rounded-lg transition-all ${
                    satisfactionScore === score
                      ? 'bg-primary text-white scale-110'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <Star className={`w-5 h-5 ${satisfactionScore === score ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Service Quality */}
          <div>
            <label className="block text-sm font-semibold mb-3">Service Quality</label>
            <div className="grid grid-cols-5 gap-2">
              {QUALITY_OPTIONS.map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setServiceQuality(value);
                    playClick();
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    serviceQuality === value
                      ? `${color} ring-2 ring-primary`
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Would Recommend */}
          <div>
            <label className="block text-sm font-semibold mb-3">Would Recommend?</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setWouldRecommend(true);
                  playClick();
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  wouldRecommend
                    ? 'bg-green-100 text-green-800 ring-2 ring-green-500'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 inline mr-2" />
                Yes
              </button>
              <button
                type="button"
                onClick={() => {
                  setWouldRecommend(false);
                  playClick();
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  !wouldRecommend
                    ? 'bg-red-100 text-red-800 ring-2 ring-red-500'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <AlertCircle className="w-4 h-4 inline mr-2" />
                No
              </button>
            </div>
          </div>

          {/* What Went Well */}
          <div>
            <label className="block text-sm font-semibold mb-3">What Went Well?</label>
            <div className="grid grid-cols-2 gap-2">
              {STRENGTHS.map((strength) => (
                <button
                  key={strength}
                  type="button"
                  onClick={() => {
                    setSelectedStrengths((prev) =>
                      prev.includes(strength)
                        ? prev.filter((s) => s !== strength)
                        : [...prev, strength]
                    );
                    playClick();
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedStrengths.includes(strength)
                      ? 'bg-green-100 text-green-800 ring-2 ring-green-500'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {strength}
                </button>
              ))}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div>
            <label className="block text-sm font-semibold mb-3">Areas for Improvement</label>
            <div className="grid grid-cols-2 gap-2">
              {IMPROVEMENTS.map((improvement) => (
                <button
                  key={improvement}
                  type="button"
                  onClick={() => {
                    setSelectedImprovements((prev) =>
                      prev.includes(improvement)
                        ? prev.filter((i) => i !== improvement)
                        : [...prev, improvement]
                    );
                    playClick();
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedImprovements.includes(improvement)
                      ? 'bg-orange-100 text-orange-800 ring-2 ring-orange-500'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {improvement}
                </button>
              ))}
            </div>
          </div>

          {/* Qualitative Notes */}
          <div>
            <label className="block text-sm font-semibold mb-2">Additional Comments</label>
            <Textarea
              placeholder="Any other feedback or observations about the service..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24"
            />
          </div>

          {/* Follow-up */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setFollowUpNeeded(!followUpNeeded);
                playClick();
              }}
              className="flex items-center gap-2 font-semibold text-sm text-amber-900 mb-2"
            >
              <input
                type="checkbox"
                checked={followUpNeeded}
                onChange={() => {}}
                className="w-4 h-4 rounded"
              />
              Follow-up Action Needed
            </button>
            {followUpNeeded && (
              <Textarea
                placeholder="What follow-up is needed? (e.g., visit next week, referral to social services...)"
                value={followUpNotes}
                onChange={(e) => setFollowUpNotes(e.target.value)}
                className="min-h-16"
              />
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || submitFeedback.isPending}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}