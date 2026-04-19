import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function PeerReviewQueue() {
  const queryClient = useQueryClient();
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewerNotes, setReviewerNotes] = useState('');

  const { data: reviews = [] } = useQuery({
    queryKey: ['peer-reviews'],
    queryFn: () => base44.entities.PeerReview.list(),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const approveMutation = useMutation({
    mutationFn: async (review) => {
      const updated = await base44.entities.PeerReview.update(review.id, {
        status: 'approved',
        reviewer_notes: reviewerNotes,
        review_date: new Date().toISOString(),
        sign_off_date: new Date().toISOString(),
      });

      // Update incident status to closed
      await base44.entities.SafeguardingIncident.update(review.incident_id, {
        status: 'closed',
      });

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peer-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['safeguarding-incidents'] });
      setSelectedReview(null);
      setReviewerNotes('');
    },
  });

  const requestChangesMutation = useMutation({
    mutationFn: async (review) => {
      return base44.entities.PeerReview.update(review.id, {
        status: 'changes_requested',
        reviewer_notes: reviewerNotes,
        changes_requested_date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peer-reviews'] });
      setSelectedReview(null);
      setReviewerNotes('');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (review) => {
      return base44.entities.PeerReview.update(review.id, {
        status: 'rejected',
        reviewer_notes: reviewerNotes,
        review_date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peer-reviews'] });
      setSelectedReview(null);
      setReviewerNotes('');
    },
  });

  const pendingReviews = useMemo(
    () => reviews.filter(r => r.status === 'pending' && r.assigned_reviewer === currentUser?.email),
    [reviews, currentUser]
  );

  const inProgressReviews = useMemo(
    () => reviews.filter(r => r.status === 'under_review' && r.assigned_reviewer === currentUser?.email),
    [reviews, currentUser]
  );

  const completedReviews = useMemo(
    () =>
      reviews.filter(
        r => (r.status === 'approved' || r.status === 'rejected') &&
          r.assigned_reviewer === currentUser?.email
      ),
    [reviews, currentUser]
  );

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Peer Review Queue</h2>
        <p className="text-sm text-muted-foreground">
          Review and sign-off on safeguarding incident reports from your team
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingReviews.length})
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            In Review ({inProgressReviews.length})
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Completed ({completedReviews.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Reviews */}
        <TabsContent value="pending" className="space-y-4">
          {pendingReviews.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-muted-foreground">No pending reviews</p>
            </Card>
          ) : (
            pendingReviews.map(review => (
              <Card key={review.id} className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{review.incident_reference}</CardTitle>
                      <CardDescription>
                        Submitted by {review.submitted_by_name} on{' '}
                        {format(new Date(review.submission_date), 'PPP')}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                      PENDING
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Executive Summary</p>
                    <p className="text-sm text-muted-foreground">
                      {review.executive_summary}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedReview(review);
                      setReviewerNotes('');
                    }}
                    className="w-full"
                  >
                    Review Now
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* In Progress */}
        <TabsContent value="in_progress" className="space-y-4">
          {inProgressReviews.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-muted-foreground">No reviews in progress</p>
            </Card>
          ) : (
            inProgressReviews.map(review => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{review.incident_reference}</CardTitle>
                      <CardDescription>
                        Last updated: {format(new Date(review.changes_requested_date), 'PPP')}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                      IN REVIEW
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{review.reviewer_notes}</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedReview(review);
                      setReviewerNotes(review.reviewer_notes || '');
                    }}
                  >
                    Continue Review
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Completed */}
        <TabsContent value="completed" className="space-y-4">
          {completedReviews.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-muted-foreground">No completed reviews</p>
            </Card>
          ) : (
            completedReviews.map(review => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{review.incident_reference}</CardTitle>
                      <CardDescription>
                        {review.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                        {format(new Date(review.review_date), 'PPP')}
                      </CardDescription>
                    </div>
                    <Badge
                      className={
                        review.status === 'approved'
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : 'bg-red-100 text-red-800 border-red-300'
                      }
                    >
                      {review.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{selectedReview.incident_reference}</CardTitle>
              <CardDescription>
                Submitted by {selectedReview.submitted_by_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-2">Executive Summary</p>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  {selectedReview.executive_summary}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Investigation Findings</p>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  {selectedReview.investigation_summary}
                </p>
              </div>

              {selectedReview.recommended_actions?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Recommended Actions</p>
                  <div className="space-y-2">
                    {selectedReview.recommended_actions.map((action, idx) => (
                      <div key={idx} className="p-3 border rounded-lg text-sm">
                        <p className="font-medium">{action.action}</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          {action.responsible_person} • {action.due_date} •{' '}
                          <Badge variant="outline">{action.priority}</Badge>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Your Reviewer Notes *</label>
                <Textarea
                  placeholder="Provide feedback, concerns, or approval comments"
                  value={reviewerNotes}
                  onChange={e => setReviewerNotes(e.target.value)}
                  className="min-h-24"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedReview(null);
                    setReviewerNotes('');
                  }}
                >
                  Cancel
                </Button>

                {selectedReview.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      className="text-orange-600 border-orange-200"
                      onClick={() => requestChangesMutation.mutate(selectedReview)}
                      disabled={!reviewerNotes || requestChangesMutation.isPending}
                    >
                      Request Changes
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => approveMutation.mutate(selectedReview)}
                      disabled={!reviewerNotes || approveMutation.isPending}
                    >
                      Approve & Close
                    </Button>
                  </>
                )}

                {selectedReview.status === 'changes_requested' && (
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => approveMutation.mutate(selectedReview)}
                    disabled={!reviewerNotes || approveMutation.isPending}
                  >
                    Approve & Close
                  </Button>
                )}

                {selectedReview.status === 'pending' && (
                  <Button
                    variant="destructive"
                    onClick={() => rejectMutation.mutate(selectedReview)}
                    disabled={!reviewerNotes || rejectMutation.isPending}
                  >
                    Reject
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}