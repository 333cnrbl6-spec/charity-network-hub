import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle2, Star } from 'lucide-react';

export default function FeedbackCollection() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const feedbackToken = window.location.pathname.split('/feedback/')[1];
  const sessionId = searchParams.get('session');

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const result = await base44.entities.ClientFeedback.filter({
          feedback_token: feedbackToken
        });

        if (!result || result.length === 0) {
          setError('Invalid or expired feedback link');
          setLoading(false);
          return;
        }

        const feedbackData = result[0];
        if (feedbackData.status === 'collected') {
          setError('Feedback has already been submitted');
          setLoading(false);
          return;
        }

        setFeedback(feedbackData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load feedback form');
        setLoading(false);
      }
    };

    if (feedbackToken) {
      loadFeedback();
    }
  }, [feedbackToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate required fields
      if (!feedback.satisfaction_rating || !feedback.support_quality_rating || !feedback.volunteer_rating) {
        setError('Please rate all experience areas');
        setSubmitting(false);
        return;
      }

      // Update feedback record
      await base44.entities.ClientFeedback.update(feedback.id, {
        satisfaction_rating: feedback.satisfaction_rating,
        support_quality_rating: feedback.support_quality_rating,
        volunteer_rating: feedback.volunteer_rating,
        would_recommend: feedback.would_recommend,
        feedback_text: feedback.feedback_text,
        collected_at: new Date().toISOString(),
        status: 'collected'
      });

      setSuccess(true);
    } catch (err) {
      setError('Failed to submit feedback: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">{error}</p>
                <p className="text-sm text-red-700 mt-1">
                  Please check your email for a valid feedback link
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
              <h2 className="text-xl font-semibold text-green-900">Thank You!</h2>
              <p className="text-green-700">
                Your feedback has been submitted successfully. We appreciate your time and input!
              </p>
              <p className="text-sm text-green-600 mt-4">
                This information helps us improve our services.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Your Feedback Matters</CardTitle>
            <CardDescription>
              Help us improve by sharing your experience. This takes about 2 minutes.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Overall Satisfaction */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">
                  How satisfied are you with your overall experience? *
                </label>
                <RadioGroup
                  value={String(feedback.satisfaction_rating || '')}
                  onValueChange={(val) =>
                    setFeedback({ ...feedback, satisfaction_rating: parseInt(val) })
                  }
                >
                  <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <div key={rating} className="flex items-center gap-2">
                        <RadioGroupItem value={String(rating)} id={`sat-${rating}`} />
                        <label
                          htmlFor={`sat-${rating}`}
                          className="cursor-pointer flex items-center gap-1"
                        >
                          {Array(rating)
                            .fill(null)
                            .map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                        </label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Support Quality */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">
                  How would you rate the quality of support you received? *
                </label>
                <RadioGroup
                  value={String(feedback.support_quality_rating || '')}
                  onValueChange={(val) =>
                    setFeedback({ ...feedback, support_quality_rating: parseInt(val) })
                  }
                >
                  <div className="space-y-2">
                    {[
                      { value: 5, label: 'Excellent' },
                      { value: 4, label: 'Good' },
                      { value: 3, label: 'Satisfactory' },
                      { value: 2, label: 'Poor' },
                      { value: 1, label: 'Very Poor' }
                    ].map(option => (
                      <div key={option.value} className="flex items-center gap-2">
                        <RadioGroupItem value={String(option.value)} id={`quality-${option.value}`} />
                        <label htmlFor={`quality-${option.value}`} className="cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Volunteer Rating */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">
                  How would you rate the volunteer/staff member? *
                </label>
                <RadioGroup
                  value={String(feedback.volunteer_rating || '')}
                  onValueChange={(val) =>
                    setFeedback({ ...feedback, volunteer_rating: parseInt(val) })
                  }
                >
                  <div className="space-y-2">
                    {[
                      { value: 5, label: 'Excellent' },
                      { value: 4, label: 'Good' },
                      { value: 3, label: 'Satisfactory' },
                      { value: 2, label: 'Poor' },
                      { value: 1, label: 'Very Poor' }
                    ].map(option => (
                      <div key={option.value} className="flex items-center gap-2">
                        <RadioGroupItem value={String(option.value)} id={`vol-${option.value}`} />
                        <label htmlFor={`vol-${option.value}`} className="cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Would Recommend */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="recommend"
                  checked={feedback.would_recommend || false}
                  onCheckedChange={(checked) =>
                    setFeedback({ ...feedback, would_recommend: checked })
                  }
                />
                <label htmlFor="recommend" className="text-sm cursor-pointer">
                  I would recommend this service to others
                </label>
              </div>

              {/* Open Feedback */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Any additional comments? (optional)
                </label>
                <Textarea
                  placeholder="Share any feedback, suggestions, or concerns..."
                  value={feedback.feedback_text || ''}
                  onChange={(e) =>
                    setFeedback({ ...feedback, feedback_text: e.target.value })
                  }
                  className="h-24"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}