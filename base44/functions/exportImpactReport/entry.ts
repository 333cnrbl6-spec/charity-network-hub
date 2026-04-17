import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all data
    const [jobs, volunteers, clients, grants, sessions] = await Promise.all([
      base44.entities.Job.list(),
      base44.entities.Volunteer.list(),
      base44.entities.Client.list(),
      base44.entities.Grant.list(),
      base44.entities.Session.list(),
    ]);

    // Calculate metrics
    const completedJobs = jobs.filter(j => j.status === 'completed').length;
    const totalJobHours = jobs.reduce((sum, j) => sum + (j.duration_minutes || 0), 0) / 60;
    const uniqueClientsServed = new Set(jobs.map(j => j.client_id)).size;
    const sessionAttendees = sessions.reduce((sum, s) => sum + (s.attendees_count || 0), 0);
    const awardedGrants = grants.filter(g => g.status === 'awarded');
    const grantsValue = awardedGrants.reduce((sum, g) => sum + (g.amount_awarded || 0), 0);
    const activeVolunteers = volunteers.filter(v => v.status === 'active').length;
    const totalVolunteerHours = volunteers.reduce((sum, v) => sum + (v.hours_contributed || 0), 0);

    // Create simple HTML report
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        h1 { color: #7c3aed; margin-bottom: 5px; }
        .subtitle { color: #999; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
        .metric { padding: 15px; background: #f5f5f5; border-radius: 8px; border-left: 4px solid #7c3aed; }
        .metric-number { font-size: 28px; font-weight: bold; color: #7c3aed; }
        .metric-label { color: #999; font-size: 12px; text-transform: uppercase; margin-top: 5px; }
        .section { margin: 30px 0; }
        .section h2 { color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f5f5f5; font-weight: bold; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>Age UK Network Impact Report</h1>
      <p class="subtitle">Generated ${new Date().toLocaleDateString('en-GB')}</p>

      <div class="metrics">
        <div class="metric">
          <div class="metric-number">${uniqueClientsServed.toLocaleString()}</div>
          <div class="metric-label">Lives Touched</div>
        </div>
        <div class="metric">
          <div class="metric-number">${totalVolunteerHours.toLocaleString()}</div>
          <div class="metric-label">Volunteer Hours</div>
        </div>
        <div class="metric">
          <div class="metric-number">£${(grantsValue / 1000).toFixed(0)}k</div>
          <div class="metric-label">Grants Awarded</div>
        </div>
        <div class="metric">
          <div class="metric-number">${activeVolunteers}</div>
          <div class="metric-label">Active Volunteers</div>
        </div>
      </div>

      <div class="section">
        <h2>Support & Services Summary</h2>
        <table>
          <tr>
            <th>Metric</th>
            <th>Count</th>
          </tr>
          <tr>
            <td>Jobs Completed</td>
            <td>${completedJobs}</td>
          </tr>
          <tr>
            <td>Total Support Hours</td>
            <td>${Math.round(totalJobHours)}</td>
          </tr>
          <tr>
            <td>Session Attendees</td>
            <td>${sessionAttendees.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Successful Grant Awards</td>
            <td>${awardedGrants.length}</td>
          </tr>
        </table>
      </div>

      <div class="section">
        <h2>Volunteer Recognition</h2>
        <p>We have <strong>${activeVolunteers}</strong> active volunteers contributing their time and expertise to support our communities. These individuals have collectively contributed <strong>${totalVolunteerHours.toLocaleString()}</strong> hours of volunteer work.</p>
      </div>

      <div class="section">
        <h2>Financial Impact</h2>
        <p>Our grants and financial support have made a direct difference in people's lives. We have successfully awarded <strong>£${(grantsValue / 1000).toFixed(0)}k</strong> across <strong>${awardedGrants.length}</strong> grants, helping with costs like heating, housing, benefits, and care support.</p>
      </div>

      <div class="footer">
        <p>Age UK Network Hub | Confidential Report | ${new Date().getFullYear()}</p>
      </div>
    </body>
    </html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});