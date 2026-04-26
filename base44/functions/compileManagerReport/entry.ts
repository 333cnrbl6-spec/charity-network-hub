import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * compileManagerReport
 * Compiles a team impact report for a coordinator/manager.
 * Aggregates job completion, client activity, volunteer hours, grants, and sessions
 * for a given date range (defaults to current week).
 *
 * Payload: { period?: 'week' | 'month' | 'custom', start_date?: string, end_date?: string }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // Only coordinators, managers, ops, CEO, admin
    const allowedRoles = [
      'branch_department_coordinator',
      'branch_service_manager',
      'branch_operations_manager',
      'branch_ceo',
      'admin',
    ];
    if (!allowedRoles.includes(user.org_role) && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: insufficient role' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const period = body.period || 'week';

    // ── Date range calculation ──
    const now = new Date();
    let startDate, endDate;

    if (period === 'custom' && body.start_date && body.end_date) {
      startDate = new Date(body.start_date);
      endDate = new Date(body.end_date);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else {
      // Default: current Mon–Sun week
      const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon=0
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    }

    const fmtDate = (d) => d.toISOString().split('T')[0];

    // ── Fetch all relevant data in parallel ──
    const [jobs, clients, volunteers, sessions, grants] = await Promise.all([
      base44.entities.Job.list('-scheduled_date', 500),
      base44.entities.Client.list('-created_date', 500),
      base44.entities.Volunteer.filter({ status: 'active' }),
      base44.entities.Session.list('-scheduled_date', 200),
      base44.entities.Grant.list('-date_awarded', 200),
    ]);

    // ── Filter to date range ──
    const inRange = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= startDate && d <= endDate;
    };

    const periodJobs     = jobs.filter(j => inRange(j.scheduled_date));
    const completedJobs  = periodJobs.filter(j => j.status === 'completed');
    const cancelledJobs  = periodJobs.filter(j => j.status === 'cancelled');
    const noAnswerJobs   = periodJobs.filter(j => j.status === 'no-answer');
    const scheduledJobs  = periodJobs.filter(j => j.status === 'scheduled');

    const periodSessions = sessions.filter(s => inRange(s.scheduled_date));
    const completedSessions = periodSessions.filter(s => s.status === 'completed');

    const periodGrants   = grants.filter(g => inRange(g.date_awarded) && g.status === 'awarded');

    const newClients     = clients.filter(c => inRange(c.date_registered) || inRange(c.created_date));
    const activeClients  = clients.filter(c => c.status === 'active');

    // ── Volunteer / staff breakdown ──
    const staffBreakdown = {};
    for (const job of completedJobs) {
      if (!job.volunteer_name) continue;
      if (!staffBreakdown[job.volunteer_name]) {
        staffBreakdown[job.volunteer_name] = { jobs_completed: 0, clients_seen: new Set(), hours: 0 };
      }
      staffBreakdown[job.volunteer_name].jobs_completed += 1;
      staffBreakdown[job.volunteer_name].clients_seen.add(job.client_name);
      staffBreakdown[job.volunteer_name].hours += (job.duration_minutes || 60) / 60;
    }
    const staffSummary = Object.entries(staffBreakdown).map(([name, stats]) => ({
      name,
      jobs_completed: stats.jobs_completed,
      clients_seen: stats.clients_seen.size,
      hours: parseFloat(stats.hours.toFixed(1)),
    })).sort((a, b) => b.jobs_completed - a.jobs_completed);

    // ── Job type breakdown ──
    const jobTypeBreakdown = {};
    for (const job of completedJobs) {
      const type = job.job_type || 'other';
      jobTypeBreakdown[type] = (jobTypeBreakdown[type] || 0) + 1;
    }

    // ── Unique clients supported ──
    const clientsSupported = [...new Set(completedJobs.map(j => j.client_name).filter(Boolean))];

    // ── Total hours ──
    const totalHours = completedJobs.reduce((sum, j) => sum + (j.duration_minutes || 60), 0) / 60;

    // ── Grant totals ──
    const totalGrantValue = periodGrants.reduce((sum, g) => sum + (g.amount_awarded || 0), 0);

    // ── Session attendance ──
    const totalAttendees = completedSessions.reduce((sum, s) => sum + (s.attendees_count || 0), 0);

    // ── Build narrative report text ──
    const periodLabel = period === 'week'
      ? `Week ${fmtDate(startDate)} to ${fmtDate(endDate)}`
      : period === 'month'
        ? `Month of ${startDate.toLocaleString('en-GB', { month: 'long', year: 'numeric' })}`
        : `${fmtDate(startDate)} to ${fmtDate(endDate)}`;

    const reportText = `
AGE UK — TEAM IMPACT REPORT
============================
Compiled by: ${user.full_name} (${user.email})
Branch: ${user.branch_name || 'Age UK'}
Period: ${periodLabel}
Generated: ${now.toLocaleString('en-GB')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HEADLINE FIGURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Jobs completed:        ${completedJobs.length} of ${periodJobs.length} scheduled
✓ Clients supported:     ${clientsSupported.length}
✓ Total hours delivered: ${totalHours.toFixed(1)}h
✓ Sessions run:          ${completedSessions.length} (${totalAttendees} attendees)
✓ Grants/benefits:       ${periodGrants.length} awarded (£${totalGrantValue.toLocaleString('en-GB')})
✓ New clients registered:${newClients.length}
✓ Active client base:    ${activeClients.length}
⚠ Cancelled:             ${cancelledJobs.length}
⚠ No answer:             ${noAnswerJobs.length}
⚠ Still scheduled:       ${scheduledJobs.length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STAFF / VOLUNTEER BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${staffSummary.length > 0
  ? staffSummary.map(s => `  ${s.name.padEnd(28)} ${String(s.jobs_completed).padStart(3)} jobs  ${String(s.clients_seen).padStart(3)} clients  ${String(s.hours).padStart(5)}h`).join('\n')
  : '  No completed jobs recorded this period.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JOB TYPE BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${Object.entries(jobTypeBreakdown).length > 0
  ? Object.entries(jobTypeBreakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => `  ${type.replace(/-/g, ' ').padEnd(30)} ${count}`)
      .join('\n')
  : '  No data.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLIENTS SUPPORTED THIS PERIOD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${clientsSupported.length > 0 ? clientsSupported.map(c => `  • ${c}`).join('\n') : '  None recorded.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SESSIONS DELIVERED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${completedSessions.length > 0
  ? completedSessions.map(s => `  • ${s.session_name || s.session_type} — ${s.attendees_count || 0} attendees`).join('\n')
  : '  No sessions this period.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GRANTS & BENEFITS AWARDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${periodGrants.length > 0
  ? periodGrants.map(g => `  • ${g.grant_name} — £${(g.amount_awarded || 0).toLocaleString('en-GB')} (${g.client_name || 'unknown client'})`).join('\n')
  : '  No grants awarded this period.'}

============================
END OF REPORT
`.trim();

    return Response.json({
      period: periodLabel,
      start_date: fmtDate(startDate),
      end_date: fmtDate(endDate),
      generated_by: user.full_name,
      generated_at: now.toISOString(),
      headline: {
        jobs_completed: completedJobs.length,
        jobs_total: periodJobs.length,
        clients_supported: clientsSupported.length,
        total_hours: parseFloat(totalHours.toFixed(1)),
        sessions_run: completedSessions.length,
        session_attendees: totalAttendees,
        grants_awarded: periodGrants.length,
        grant_value_gbp: totalGrantValue,
        new_clients: newClients.length,
        active_clients: activeClients.length,
        cancelled_jobs: cancelledJobs.length,
        no_answer_jobs: noAnswerJobs.length,
      },
      staff_summary: staffSummary,
      job_type_breakdown: jobTypeBreakdown,
      clients_supported: clientsSupported,
      report_text: reportText,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});