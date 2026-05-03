import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Mail, Phone, Zap } from 'lucide-react';
import ProcessingFeedback from '@/components/ui/ProcessingFeedback';

export default function VolunteerMatchingRecommendations({ jobId, jobTitle }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [assigning, setAssigning] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('matchVolunteersToJobs', {
        job_id: jobId
      });
      
      if (response.data?.success) {
        setRecommendations(response.data);
      } else {
        setError(response.data?.error || 'Failed to fetch recommendations');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignVolunteer = async (volunteerId) => {
    setAssigning(true);
    try {
      await base44.entities.Job.update(jobId, {
        assigned_volunteer_id: volunteerId,
        status: 'assigned'
      });

      // Send notification email
      const volunteer = recommendations.recommendations.find(r => r.volunteer_id === volunteerId);
      await base44.integrations.Core.SendEmail({
        to: volunteer.volunteer_email,
        subject: `New Job Assignment: ${jobTitle}`,
        body: `
Hello ${volunteer.volunteer_name},

You've been assigned to a new job:

Job: ${jobTitle}
Date: ${recommendations.job_details.scheduled_date}
Time: ${recommendations.job_details.scheduled_time}
Location: ${recommendations.job_details.location}

Please confirm your availability by replying to this email.

Best regards,
The Assignment Team
        `
      });

      setSelectedVolunteer(null);
      setRecommendations(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getMatchBg = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-blue-50 border-blue-200';
    if (score >= 40) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <CardTitle>Smart Volunteer Matching</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setExpanded(!expanded);
              if (!expanded && !recommendations && !loading) {
                fetchRecommendations();
              }
            }}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">AI-powered recommendations based on skills, location, and availability</p>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {loading && (
            <ProcessingFeedback
              label="Finding best matches…"
              detail="Analyzing volunteer skills, location, and availability."
              tips={[
                'Matches are ranked by compatibility score.',
                'Green scores indicate excellent fits.',
              ]}
            />
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {recommendations && !loading && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-2xl font-bold text-primary">{recommendations.recommendations.length}</p>
                  <p className="text-xs text-muted-foreground">Top Matches</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-2xl font-bold text-primary">{recommendations.total_matches}</p>
                  <p className="text-xs text-muted-foreground">Total Qualified</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-2xl font-bold text-primary">{recommendations.recommendations[0]?.match_percentage || 0}%</p>
                  <p className="text-xs text-muted-foreground">Best Match</p>
                </div>
              </div>

              {/* Recommendations List */}
              <div className="space-y-3">
                {recommendations.recommendations.map((rec, idx) => (
                  <div
                    key={rec.volunteer_id}
                    className={`border rounded-lg p-4 cursor-pointer transition hover:shadow-md ${
                      selectedVolunteer === rec.volunteer_id
                        ? getMatchBg(rec.match_score)
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedVolunteer(selectedVolunteer === rec.volunteer_id ? null : rec.volunteer_id)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{rec.volunteer_name}</p>
                          <Badge variant="outline" className="text-xs">#{idx + 1}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.hours_contributed} hours contributed</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-3xl font-bold ${getMatchColor(rec.match_score)}`}>
                          {rec.match_percentage}%
                        </p>
                        <p className="text-xs text-muted-foreground">Match Score</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <Progress value={rec.match_score} className="mb-3" />

                    {/* Details */}
                    {selectedVolunteer === rec.volunteer_id && (
                      <div className="space-y-4 mt-4 pt-4 border-t">
                        {/* Match Breakdown */}
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Match Breakdown:</p>
                          {rec.details.map((detail, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{detail.category}</span>
                              <div className="flex items-center gap-2">
                                {detail.matched?.length > 0 && (
                                  <span className="text-xs">{detail.matched.join(', ')}</span>
                                )}
                                {detail.match && (
                                  <Badge variant="outline" className="text-xs capitalize">{detail.match}</Badge>
                                )}
                                <span className="font-semibold">{detail.score} pts</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Contact & Assignment */}
                        <div className="space-y-3 pt-3 border-t">
                          <div className="flex gap-2">
                            <a
                              href={`mailto:${rec.volunteer_email}`}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted hover:bg-primary/10 rounded text-sm"
                            >
                              <Mail className="w-4 h-4" /> Email
                            </a>
                            <a
                              href={`tel:${rec.volunteer_phone}`}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted hover:bg-primary/10 rounded text-sm"
                            >
                              <Phone className="w-4 h-4" /> Call
                            </a>
                          </div>
                          <Button
                            onClick={() => handleAssignVolunteer(rec.volunteer_id)}
                            disabled={assigning}
                            className="w-full gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Assign This Volunteer
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {recommendations.recommendations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No qualified volunteers found for this job.</p>
                  <p className="text-xs mt-1">Consider adjusting job requirements or expanding search.</p>
                </div>
              )}
            </div>
          )}

          {!loading && !recommendations && (
            <Button onClick={fetchRecommendations} className="w-full gap-2">
              <Zap className="w-4 h-4" /> Get Smart Recommendations
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}