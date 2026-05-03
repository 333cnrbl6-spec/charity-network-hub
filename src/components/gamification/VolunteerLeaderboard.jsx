import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, Medal } from 'lucide-react';

export default function VolunteerLeaderboard({ charityId, limit = 10 }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await base44.entities.VolunteerLeaderboard.filter(
          { charity_id: charityId },
          '-impact_score',
          limit
        );
        setLeaderboard(data || []);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (charityId) {
      loadLeaderboard();
    }
  }, [charityId, limit]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '📍';
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200';
      case 2:
        return 'bg-slate-50 border-slate-200';
      case 3:
        return 'bg-orange-50 border-orange-200';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Volunteers
        </CardTitle>
        <CardDescription>Ranked by impact score and hours contributed</CardDescription>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No volunteer data yet</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((volunteer) => (
              <div
                key={volunteer.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${getRankColor(volunteer.rank)}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xl w-6">{getRankIcon(volunteer.rank)}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{volunteer.volunteer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {volunteer.total_hours}h • {volunteer.sessions_completed} sessions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-bold text-sm text-primary flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {volunteer.impact_score}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {volunteer.badges_count} badges
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}