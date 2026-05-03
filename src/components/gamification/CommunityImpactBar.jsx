import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap } from 'lucide-react';

export default function CommunityImpactBar({ charityId, targetImpactScore = 5000 }) {
  const [stats, setStats] = useState({
    totalImpact: 0,
    totalHours: 0,
    volunteersActive: 0,
    progressPercent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const leaderboard = await base44.entities.VolunteerLeaderboard.filter({
          charity_id: charityId
        });

        if (leaderboard && leaderboard.length > 0) {
          const totalImpact = leaderboard.reduce((sum, v) => sum + (v.impact_score || 0), 0);
          const totalHours = leaderboard.reduce((sum, v) => sum + (v.total_hours || 0), 0);
          const volunteersActive = leaderboard.filter(v => v.total_hours > 0).length;

          const progressPercent = Math.min((totalImpact / targetImpactScore) * 100, 100);

          setStats({
            totalImpact,
            totalHours,
            volunteersActive,
            progressPercent
          });
        }
      } catch (error) {
        console.error('Failed to load impact stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (charityId) {
      loadStats();
    }
  }, [charityId, targetImpactScore]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="w-6 h-6 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isUnlocked = stats.progressPercent >= 100;

  return (
    <Card className={isUnlocked ? 'border-green-200 bg-green-50' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className={`w-5 h-5 ${isUnlocked ? 'text-green-600' : 'text-yellow-500'}`} />
          Community Impact
        </CardTitle>
        <CardDescription>
          {stats.volunteersActive} volunteers contributing {stats.totalHours} hours
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-foreground">Impact Score</span>
            <span className="text-sm font-bold text-primary">
              {stats.totalImpact} / {targetImpactScore}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isUnlocked ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-primary to-blue-500'
              }`}
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.progressPercent.toFixed(0)}% toward goal
          </p>
        </div>

        {isUnlocked && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-3">
            <p className="text-sm font-semibold text-green-800">🎉 Goal Unlocked!</p>
            <p className="text-xs text-green-700 mt-1">
              Your community has achieved the impact target. Celebrate this milestone!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}