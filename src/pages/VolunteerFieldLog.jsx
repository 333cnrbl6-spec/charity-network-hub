import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import PhotoCapture from '@/components/fieldwork/PhotoCapture';
import ClientSignOff from '@/components/fieldwork/ClientSignOff';
import LocationVerify from '@/components/fieldwork/LocationVerify';

export default function VolunteerFieldLog() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  // Get current user
  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  // Fetch assigned jobs for this volunteer
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['my-jobs', user?.id],
    enabled: !!user?.id,
    queryFn: () =>
      base44.entities.Job.filter({
        volunteer_id: user.id,
        status: 'scheduled',
      }),
  });

  // Form state
  const [selectedJob, setSelectedJob] = useState('');
  const [completionStatus, setCompletionStatus] = useState('completed');
  const [workSummary, setWorkSummary] = useState('');
  const [duration, setDuration] = useState('30');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);
  const [location, setLocation] = useState(null);
  const [clientFeedback, setClientFeedback] = useState(null);

  // Submit outcome mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const job = jobs.find(j => j.id === selectedJob);
      const signatureBase64 = clientFeedback?.signature;
      let signatureUrl = null;

      if (signatureBase64) {
        const blob = await fetch(signatureBase64).then(r => r.blob());
        const file = new File([blob], 'signature.png', { type: 'image/png' });
        const uploadResult = await base44.integrations.Core.UploadFile({ file });
        signatureUrl = uploadResult.file_url;
      }

      return base44.entities.VisitOutcome.create({
        job_id: job.id,
        volunteer_id: user.id,
        volunteer_name: user.full_name,
        client_id: job.client_id,
        client_name: job.client_name,
        visit_date: new Date().toISOString(),
        duration_minutes: parseInt(duration),
        completion_status: completionStatus,
        work_summary: workSummary,
        photos,
        client_feedback: clientFeedback?.feedback,
        client_satisfaction: clientFeedback?.satisfaction,
        client_signed_off: !!clientFeedback?.signature,
        client_signature_url: signatureUrl,
        location_verified: !!location,
        location_coords: location,
        notes,
        follow_up_required: completionStatus !== 'completed',
        submitted_at: new Date().toISOString(),
      });
    },
    onSuccess: async () => {
      // Mark job as completed
      const job = jobs.find(j => j.id === selectedJob);
      await base44.entities.Job.update(job.id, { status: 'completed' });

      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });

      // Reset form
      setSelectedJob('');
      setWorkSummary('');
      setNotes('');
      setPhotos([]);
      setLocation(null);
      setClientFeedback(null);
    },
  });

  const selectedJobData = jobs.find(j => j.id === selectedJob);
  const isFormValid = selectedJob && workSummary && clientFeedback?.signature;

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur z-40 -mx-4 px-4 py-3 border-b">
          <h1 className="text-2xl font-bold">Field Visit Log</h1>
          <p className="text-xs text-muted-foreground">Log outcomes, photos & sign-offs</p>
        </div>

        {isLoading ? (
          <Card className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </Card>
        ) : jobs.length === 0 ? (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-sm text-amber-900">No scheduled visits</p>
            </CardContent>
          </Card>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitMutation.mutate();
            }}
            className="space-y-4"
          >
            {/* Job Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select Visit</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a visit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.client_name} • {job.job_type.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedJobData && (
              <>
                {/* Job Details */}
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Client</p>
                      <p className="font-medium">{selectedJobData.client_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Service Type</p>
                      <p className="font-medium">{selectedJobData.job_type.replace('_', ' ')}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Completion Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Visit Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'completed', label: 'Completed' },
                        { value: 'partial', label: 'Partial' },
                        { value: 'unable_to_complete', label: 'Unable' },
                        { value: 'rescheduled', label: 'Reschedule' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setCompletionStatus(opt.value)}
                          className={`p-2 rounded border text-xs font-medium transition-colors ${
                            completionStatus === opt.value
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-border hover:bg-muted'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Duration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      {['15', '30', '45', '60'].map((min) => (
                        <button
                          key={min}
                          type="button"
                          onClick={() => setDuration(min)}
                          className={`flex-1 py-2 rounded border text-sm font-medium transition-colors ${
                            duration === min
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-border'
                          }`}
                        >
                          {min}m
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Work Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">What was done?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Describe the work completed..."
                      value={workSummary}
                      onChange={(e) => setWorkSummary(e.target.value)}
                      className="min-h-20 text-sm"
                      required
                    />
                  </CardContent>
                </Card>

                {/* Photos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Work Photos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PhotoCapture photos={photos} onPhotosChange={setPhotos} />
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Additional Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Any issues or follow-ups needed?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-16 text-sm"
                    />
                  </CardContent>
                </Card>

                {/* Location Verification */}
                <LocationVerify onLocationVerified={setLocation} />

                {/* Client Sign-Off */}
                <ClientSignOff
                  onSignOff={setClientFeedback}
                  loading={submitMutation.isPending}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!isFormValid || submitMutation.isPending}
                  className="w-full h-12"
                  size="lg"
                >
                  {submitMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Submit Visit Outcome
                </Button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}