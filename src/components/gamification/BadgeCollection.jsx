import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BadgeCollection({ volunteerId, charityId }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const data = await base44.entities.VolunteerBadge.filter({
          volunteer_id: volunteerId,
          charity_id: charityId
        });
        setBadges(data || []);
      } catch (error) {
        console.error('Failed to load badges:', error);
      } finally {
        setLoading(false);
      }
    };

    if (volunteerId && charityId) {
      loadBadges();
    }
  }, [volunteerId, charityId]);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Achievements ({badges.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Complete volunteer hours to earn badges
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition"
                title={badge.description}
              >
                <span className="text-3xl">{badge.icon_emoji}</span>
                <p className="text-xs font-semibold text-center leading-tight">
                  {badge.badge_name}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}