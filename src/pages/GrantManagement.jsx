import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Plus, Zap, TrendingUp } from 'lucide-react';
import GrantKanban from '@/components/grants/GrantKanban';
import GrantDeadlineCalendar from '@/components/grants/GrantDeadlineCalendar';

export default function GrantManagement() {
  const { user } = useAuth();
  const [charity, setCharity] = useState(null);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: grants = [] } = useQuery({
    queryKey: ['grants', charity?.id],
    queryFn: async () => {
      if (!charity?.id) return [];
      const data = await base44.entities.Grant.filter({
        charity_id: charity.id
      }, '-deadline');
      return data || [];
    },
    enabled: !!charity?.id
  });

  React.useEffect(() => {
    const loadCharity = async () => {
      try {
        const charities = await base44.entities.Charity.filter({
          created_by: user?.email
        }, '-created_date', 1);
        if (charities && charities.length > 0) {
          setCharity(charities[0]);
        }
      } catch (error) {
        console.error('Failed to load charity:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.email) {
      loadCharity();
    }
  }, [user?.email]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-900">No charity found. Please create a charity first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const awardedTotal = grants
    ?.filter(g => g.status === 'awarded')
    .reduce((sum, g) => sum + (g.amount || 0), 0) || 0;

  const submittedCount = grants?.filter(g => g.status === 'submitted').length || 0;
  const upcomingDeadlines = grants?.filter(g => {
    if (!g.deadline) return false;
    const deadline = new Date(g.deadline);
    const today = new Date();
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return deadline > today && deadline <= in30Days;
  }).length || 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Grant Management</h1>
            <p className="text-muted-foreground mt-1">{charity.name}</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Grant
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Awarded</p>
                <p className="text-3xl font-bold text-green-600">
                  £{awardedTotal.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  From {grants?.filter(g => g.status === 'awarded').length || 0} grants
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Pending Review
                </p>
                <p className="text-3xl font-bold text-blue-600">{submittedCount}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Applications submitted
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Upcoming
                </p>
                <p className="text-3xl font-bold text-amber-600">{upcomingDeadlines}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Due within 30 days
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="kanban" className="w-full">
          <TabsList>
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            <TabsTrigger value="calendar">Deadline Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Grant Pipeline</CardTitle>
                <CardDescription>
                  Drag grants between stages to update their status. Team notifications are sent automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GrantKanban
                  charityId={charity.id}
                  onGrantSelect={setSelectedGrant}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Deadline Timeline</CardTitle>
                <CardDescription>
                  View all grant deadlines in calendar format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GrantDeadlineCalendar grants={grants} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Grant Detail Panel */}
        {selectedGrant && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedGrant.grant_name}</CardTitle>
                  <CardDescription>{selectedGrant.funder_name}</CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {selectedGrant.status || 'prospecting'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold text-primary">
                    £{selectedGrant.amount?.toLocaleString() || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="text-lg font-semibold">
                    {selectedGrant.deadline
                      ? format(new Date(selectedGrant.deadline), 'MMM d, yyyy')
                      : '—'}
                  </p>
                </div>
              </div>

              {selectedGrant.project_description && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Project Description</p>
                  <p className="text-sm text-muted-foreground">{selectedGrant.project_description}</p>
                </div>
              )}

              {selectedGrant.ai_draft_application && (
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-foreground mb-2">AI Draft Application</p>
                  <Button variant="outline" className="text-xs">
                    View Full Draft
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}