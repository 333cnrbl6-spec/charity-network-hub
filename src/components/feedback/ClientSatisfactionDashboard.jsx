import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Star, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ClientSatisfactionDashboard({ charityId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await base44.functions.invoke('aggregateClientSatisfaction', {
          charity_id: charityId,
          months: 6
        });
        setData(result);
      } catch (error) {
        console.error('Failed to load satisfaction data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (charityId) {
      loadData();
    }
  }, [charityId]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data?.overall_stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">No feedback data available yet</p>
        </CardContent>
      </Card>
    );
  }

  const stats = data.overall_stats;
  const trends = data.monthly_trends || [];

  const getTrendColor = (direction) => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Star className="w-3 h-3" />
                Overall Satisfaction
              </p>
              <p className="text-3xl font-bold text-primary">
                {stats.avg_satisfaction}/5
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.total_responses} responses
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Support Quality</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.avg_quality}/5
              </p>
              <p className="text-xs text-muted-foreground">Average rating</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Volunteer Rating</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.avg_volunteer}/5
              </p>
              <p className="text-xs text-muted-foreground">Average rating</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                Would Recommend
              </p>
              <p className="text-3xl font-bold text-green-600">
                {stats.recommendation_rate}%
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className={cn('w-3 h-3', getTrendColor(stats.trend_direction))} />
                <span className={cn('text-xs font-semibold', getTrendColor(stats.trend_direction))}>
                  {stats.trend_direction === 'up' ? 'Improving' : stats.trend_direction === 'down' ? 'Declining' : 'Stable'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      {trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Satisfaction Trends (6 Months)</CardTitle>
            <CardDescription>
              Monthly average ratings over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip
                  formatter={(value) => value.toFixed(2)}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avg_satisfaction"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Overall Satisfaction"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="avg_quality"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Support Quality"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="avg_volunteer"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Volunteer Rating"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Response Rate */}
      {trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Feedback Response Rate</CardTitle>
            <CardDescription>
              Number of feedback responses per month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="responses" fill="#8b5cf6" name="Responses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}