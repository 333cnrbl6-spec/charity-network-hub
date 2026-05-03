import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BADGE_DEFINITIONS = {
  hours_25: { name: 'Getting Started', emoji: '🌱', milestone: 25 },
  hours_50: { name: 'Half Century', emoji: '⭐', milestone: 50 },
  hours_100: { name: 'Century Club', emoji: '🔥', milestone: 100 },
  hours_250: { name: 'Quarter Thousand', emoji: '💎', milestone: 250 },
  impact_hero: { name: 'Impact Hero', emoji: '🦸', milestone: 500 }, // 500 impact score
  streak_10: { name: 'Consistent', emoji: '✨', milestone: 10 }, // 10 consecutive months
  streak_30: { name: 'Dedicated', emoji: '👑', milestone: 30 }, // 30 consecutive months
  top_contributor: { name: 'Top Contributor', emoji: '🏆', milestone: 1 }, // Top 3 in charity
  community_champion: { name: 'Community Champion', emoji: '🌟', milestone: 1 } // Top 10 overall
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { charity_id, branch_id } = await req.json();

    if (!charity_id) {
      return Response.json({ error: 'charity_id required' }, { status: 400 });
    }

    // Get all volunteers
    const volunteers = await base44.asServiceRole.entities.Volunteer.filter({
      charity_id
    });

    if (!volunteers || volunteers.length === 0) {
      return Response.json({ success: true, updated_count: 0, badges_awarded: 0 });
    }

    let updatedCount = 0;
    let badgesAwarded = 0;

    // Calculate for each volunteer
    for (const volunteer of volunteers) {
      // Get sessions for this volunteer
      const sessions = await base44.asServiceRole.entities.Session.filter({
        volunteer_id: volunteer.id,
        status: 'completed'
      });

      const totalHours = sessions?.reduce((sum, s) => sum + (s.hours_worked || 0), 0) || 0;
      const sessionsCompleted = sessions?.length || 0;
      
      // Impact score = hours × 1.5 for completed sessions, +10 per positive outcome
      let impactScore = totalHours * 1.5;
      const positiveOutcomes = sessions?.filter(s => s.outcome === 'positive').length || 0;
      impactScore += positiveOutcomes * 10;

      // Get existing leaderboard entry
      const existingEntry = await base44.asServiceRole.entities.VolunteerLeaderboard.filter({
        volunteer_id: volunteer.id,
        charity_id
      });

      // Check for new badges
      const newBadges = [];
      
      // Hours-based badges
      if (totalHours >= 25 && (!existingEntry || !existingEntry[0]?.badges_earned?.includes('hours_25'))) {
        newBadges.push('hours_25');
      }
      if (totalHours >= 50 && (!existingEntry || !existingEntry[0]?.badges_earned?.includes('hours_50'))) {
        newBadges.push('hours_50');
      }
      if (totalHours >= 100 && (!existingEntry || !existingEntry[0]?.badges_earned?.includes('hours_100'))) {
        newBadges.push('hours_100');
      }
      if (totalHours >= 250 && (!existingEntry || !existingEntry[0]?.badges_earned?.includes('hours_250'))) {
        newBadges.push('hours_250');
      }

      // Impact-based badges
      if (impactScore >= 500 && (!existingEntry || !existingEntry[0]?.badges_earned?.includes('impact_hero'))) {
        newBadges.push('impact_hero');
      }

      // Award badges to database
      for (const badgeType of newBadges) {
        const badgeDef = BADGE_DEFINITIONS[badgeType];
        await base44.asServiceRole.entities.VolunteerBadge.create({
          volunteer_id: volunteer.id,
          charity_id,
          branch_id: volunteer.branch_id || branch_id,
          badge_type: badgeType,
          badge_name: badgeDef.name,
          icon_emoji: badgeDef.emoji,
          earned_at: new Date().toISOString(),
          milestone_type: badgeType.startsWith('hours') ? 'hours' : 'impact',
          milestone_value: badgeDef.milestone
        });
        badgesAwarded++;
      }

      // Update or create leaderboard entry
      const leaderboardData = {
        volunteer_id: volunteer.id,
        charity_id,
        branch_id: volunteer.branch_id || branch_id,
        volunteer_name: volunteer.full_name || 'Unknown',
        total_hours: totalHours,
        impact_score: Math.round(impactScore),
        sessions_completed: sessionsCompleted,
        badges_count: (existingEntry?.[0]?.badges_earned?.length || 0) + newBadges.length,
        badges_earned: [...(existingEntry?.[0]?.badges_earned || []), ...newBadges],
        last_updated: new Date().toISOString()
      };

      if (existingEntry && existingEntry.length > 0) {
        await base44.asServiceRole.entities.VolunteerLeaderboard.update(existingEntry[0].id, leaderboardData);
      } else {
        await base44.asServiceRole.entities.VolunteerLeaderboard.create(leaderboardData);
      }

      updatedCount++;
    }

    // Assign ranks based on impact score
    const allLeaderboard = await base44.asServiceRole.entities.VolunteerLeaderboard.filter({
      charity_id
    });

    if (allLeaderboard && allLeaderboard.length > 0) {
      const sorted = allLeaderboard.sort((a, b) => b.impact_score - a.impact_score);
      for (let i = 0; i < sorted.length; i++) {
        await base44.asServiceRole.entities.VolunteerLeaderboard.update(sorted[i].id, {
          rank: i + 1
        });

        // Award top contributor badge (top 3)
        if (i < 3 && !sorted[i].badges_earned?.includes('top_contributor')) {
          const badgeDef = BADGE_DEFINITIONS['top_contributor'];
          await base44.asServiceRole.entities.VolunteerBadge.create({
            volunteer_id: sorted[i].volunteer_id,
            charity_id,
            branch_id: sorted[i].branch_id,
            badge_type: 'top_contributor',
            badge_name: badgeDef.name,
            icon_emoji: badgeDef.emoji,
            earned_at: new Date().toISOString(),
            milestone_type: 'rank',
            milestone_value: i + 1
          });
          badgesAwarded++;
        }
      }
    }

    return Response.json({
      success: true,
      updated_count: updatedCount,
      badges_awarded: badgesAwarded,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});