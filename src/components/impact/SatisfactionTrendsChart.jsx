import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Users, ThumbsUp, AlertCircle } from 'lucide-react';

export default function SatisfactionTrendsChart({ jobFeedback = [] }) {
  const stats = useMemo(() => {
    if (!jobFeedback || jobFeedback.length === 0) {
      return {
        averageScore: 0,
        totalFeedback: 0,
        recommendationRate: 0,
        monthlyTrends: [],
        qualityDistribution: [],
        topStrengths: [],
        topImprovements: [],
      };
    }

    // Basic stats
    const avgScore = (jobFeedback.reduce((sum, f) => sum + (f.satisfaction_score || 0), 0) / jobFeedback.length).toFixed(1);
    const recommendCount = jobFeedback.filter(f => f.would_recommend).length;
    const recommendRate = ((recommendCount / jobFeedback.length) * 100).toFixed(0);

    // Service quality distribution
    const qualityCount = jobFeedback.reduce((acc, f) => {
      acc[f.service_quality] = (acc[f.service_quality] || 0) + 1;
      return acc;
    }, {});

    const qualityDistribution = [
      { name: 'Excellent', value: qualityCount['excellent'] || 0, color: '#22c55e' },
      { name: 'Very Good', value: qualityCount['very_good'] || 0, color: '#3b82f6' },
      { name: 'Good', value: qualityCount['good'] || 0, color: '#eab308' },
      { name: 'Fair', value: qualityCount['fair'] || 0, color: '#f97316' },
      { name: 'Poor', value: qualityCount['poor'] || 0, color: '#ef4444' },
    ].filter(q => q.value > 0);

    // Monthly trends
    const monthlyData = {};
    jobFeedback.forEach(f => {
      const date = new Date(f.feedback_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, scores: [], count: 0 };
      }
      monthlyData[monthKey].scores.push(f.satisfaction_score);
      monthlyData[monthKey].count += 1;
    });

    const monthlyTrends = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([month, data]) => ({
        month: month.split('-')[1], // Just show month number
        avgScore: (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1),
        count: data.count,
      }));

    // Top strengths and improvements
    const strengthCounts = {};
    const improvementCounts = {};

    jobFeedback.forEach(f => {
      f.key_areas?.forEach(strength => {
        strengthCounts[strength] = (strengthCounts[strength] || 0) + 1;
      });
      f.improvements?.forEach(improvement => {
        improvementCounts[improvement] = (improvementCounts[improvement] || 0) + 1;
      });
    });

    const topStrengths = Object.entries(strengthCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const topImprovements = Object.entries(improvementCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      averageScore: avgScore,
      totalFeedback: jobFeedback.length,
      recommendationRate: recommendRate,
      monthlyTrends,
      qualityDistribution,
      topStrengths,
      topImprovements,
    };
  }, [jobFeedback]);

  if (stats.totalFeedback === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Satisfaction Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>No feedback recorded yet. Staff will see feedback forms after completing jobs.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{stats.averageScore}</p>
              <p className="text-sm text-muted-foreground mt-1">Average Score / 5</p>
              <div className="flex justify-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.round(stats.averageScore) ? 'text-yellow-500' : 'text-gray-300'}>
                    ★
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">{stats.recommendationRate}%</p>
              <p className="text-sm text-muted-foreground mt-1">Would Recommend</p>
              <div className="mt-2">
                <ThumbsUp className="w-5 h-5 mx-auto text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{stats.totalFeedback}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Feedback</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      {stats.monthlyTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Monthly Satisfaction Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip formatter={(value) => `${value}/5`} />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#8b5cf6"
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  strokeWidth={2}
                  name="Avg Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Quality Distribution */}
        {stats.qualityDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Service Quality Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.qualityDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {stats.qualityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="text-green-600">+</span> Top Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topStrengths.length > 0 ? (
                stats.topStrengths.map(({ name, count }) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{name}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Improvements */}
      {stats.topImprovements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topImprovements.map(({ name, count }) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{name}</span>
                  <Badge variant="outline" className="bg-orange-50">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}