import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { job_id } = await req.json();

    // Fetch job details
    const job = await base44.asServiceRole.entities.Job.get(job_id);
    if (!job) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    // Fetch all active volunteers
    const volunteers = await base44.asServiceRole.entities.Volunteer.list();
    const activeVolunteers = volunteers.filter(v => v.status === 'active' && v.dbs_checked);

    const matches = [];

    for (const volunteer of activeVolunteers) {
      let score = 0;
      const details = [];

      // 1. Skills match (40 points max)
      const jobSkills = job.required_skills || [];
      if (jobSkills.length > 0) {
        const volunteerSkills = volunteer.skills || [];
        const matchedSkills = jobSkills.filter(s => volunteerSkills.includes(s));
        const skillScore = (matchedSkills.length / jobSkills.length) * 40;
        score += skillScore;
        details.push({
          category: 'Skills',
          matched: matchedSkills,
          required: jobSkills,
          score: Math.round(skillScore)
        });
      } else {
        score += 40; // No specific skills required
        details.push({ category: 'Skills', matched: [], required: [], score: 40 });
      }

      // 2. Location match (30 points max)
      if (job.location && volunteer.location) {
        // Simple location matching: exact match = 30, nearby = 20, other = 0
        if (job.location === volunteer.location) {
          score += 30;
          details.push({ category: 'Location', proximity: 'same', score: 30 });
        } else if (isNearby(job.location, volunteer.location)) {
          score += 20;
          details.push({ category: 'Location', proximity: 'nearby', score: 20 });
        } else {
          details.push({ category: 'Location', proximity: 'different', score: 0 });
        }
      } else {
        score += 15; // Partial credit if location data missing
        details.push({ category: 'Location', proximity: 'unknown', score: 15 });
      }

      // 3. Availability match (30 points max)
      const jobDay = getDay(job.scheduled_date);
      const jobTime = getTimeOfDay(job.scheduled_time);
      
      if (volunteer.availability?.[jobDay]?.includes(jobTime)) {
        score += 30;
        details.push({ category: 'Availability', match: 'available', score: 30 });
      } else if (volunteer.availability?.[jobDay]) {
        score += 15; // Day available but not specific time
        details.push({ category: 'Availability', match: 'partial', score: 15 });
      } else {
        details.push({ category: 'Availability', match: 'unavailable', score: 0 });
      }

      if (score > 0) {
        matches.push({
          volunteer_id: volunteer.id,
          volunteer_name: volunteer.name,
          volunteer_email: volunteer.email,
          volunteer_phone: volunteer.phone,
          match_score: Math.round(score),
          match_percentage: Math.round((score / 100) * 100),
          details,
          distance_miles: calculateDistance(job.location, volunteer.location),
          last_job_date: volunteer.last_job_date,
          hours_contributed: volunteer.hours_contributed || 0
        });
      }
    }

    // Sort by score descending
    matches.sort((a, b) => b.match_score - a.match_score);

    // Get top 5 recommendations
    const topMatches = matches.slice(0, 5);

    // Log the matching process
    await base44.asServiceRole.entities.AuditLog.create({
      user_email: 'system@charityhub.org',
      action: 'volunteer_matching_executed',
      entity_type: 'Job',
      entity_id: job_id,
      changes: {
        total_volunteers_evaluated: activeVolunteers.length,
        qualified_matches: matches.length,
        top_recommendations: topMatches.length
      },
      timestamp: new Date().toISOString(),
      status: 'success'
    });

    return Response.json({
      success: true,
      job_id,
      job_details: {
        title: job.title,
        location: job.location,
        required_skills: job.required_skills,
        scheduled_date: job.scheduled_date,
        scheduled_time: job.scheduled_time
      },
      recommendations: topMatches,
      total_matches: matches.length
    });
  } catch (error) {
    console.error('Volunteer matching error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Helper functions
function getDay(dateString) {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

function getTimeOfDay(timeString) {
  if (!timeString) return 'Morning';
  const hour = parseInt(timeString.split(':')[0]);
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

function isNearby(location1, location2) {
  // Simple postal area matching (first part of postcode)
  if (!location1 || !location2) return false;
  return location1.substring(0, 2) === location2.substring(0, 2);
}

function calculateDistance(location1, location2) {
  // Placeholder: In production, use proper geolocation library
  if (location1 === location2) return 0;
  if (isNearby(location1, location2)) return 2;
  return 5;
}