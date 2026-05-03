import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only check
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const results = {
      timestamp: new Date().toISOString(),
      status: 'running',
      checks: {
        critical_paths: null,
        prelaunch_checklist: null,
        data_integrity: null,
        credit_system: null,
        email_system: null,
        security_validation: null
      },
      overall_pass: false,
      issues_found: []
    };

    try {
      results.checks.critical_paths = await base44.functions.invoke('runCriticalPathTests', {});
    } catch (err) {
      results.checks.critical_paths = { status: 'failed', error: err.message };
      results.issues_found.push({ severity: 'critical', issue: 'Critical path tests failed', detail: err.message });
    }

    try {
      results.checks.prelaunch_checklist = await base44.functions.invoke('prelaunchChecklist', {});
    } catch (err) {
      results.checks.prelaunch_checklist = { status: 'failed', error: err.message };
      results.issues_found.push({ severity: 'high', issue: 'Prelaunch checklist failed', detail: err.message });
    }

    try {
      results.checks.data_integrity = await base44.functions.invoke('validateDataIsolation', {});
    } catch (err) {
      results.checks.data_integrity = { status: 'failed', error: err.message };
      results.issues_found.push({ severity: 'critical', issue: 'Data isolation breach detected', detail: err.message });
    }

    try {
      const charities = await base44.entities.Charity.list('-created_date', 5);
      const creditTests = [];
      for (const charity of charities || []) {
        const credits = await base44.entities.CharityCredits.filter({ charity_id: charity.id });
        if (!credits || credits.length === 0) {
          creditTests.push({ charity_id: charity.id, status: 'no_credits_initialized' });
        } else {
          creditTests.push({ charity_id: charity.id, status: 'ok', balance: credits[0].credits_available });
        }
      }
      results.checks.credit_system = { status: 'ok', tested_charities: creditTests };
    } catch (err) {
      results.checks.credit_system = { status: 'failed', error: err.message };
      results.issues_found.push({ severity: 'high', issue: 'Credit system validation failed', detail: err.message });
    }

    try {
      const emailLogs = await base44.entities.EmailLog.filter({ status: 'failed' }, '-sent_at', 10);
      if (emailLogs && emailLogs.length > 5) {
        results.checks.email_system = { status: 'warning', failed_count: emailLogs.length };
        results.issues_found.push({ severity: 'medium', issue: 'High email failure rate', detail: `${emailLogs.length} failed emails in last batch` });
      } else {
        results.checks.email_system = { status: 'ok', failed_count: emailLogs?.length || 0 };
      }
    } catch (err) {
      results.checks.email_system = { status: 'failed', error: err.message };
    }

    try {
      const securityAudits = await base44.entities.SecurityAuditLog.filter(
        { severity: 'critical' },
        '-timestamp',
        10
      );
      if (securityAudits && securityAudits.length > 0) {
        results.checks.security_validation = { status: 'warning', critical_events: securityAudits.length };
        results.issues_found.push({ severity: 'critical', issue: 'Security incidents detected', detail: `${securityAudits.length} critical events` });
      } else {
        results.checks.security_validation = { status: 'ok', critical_events: 0 };
      }
    } catch (err) {
      results.checks.security_validation = { status: 'failed', error: err.message };
    }

    // Calculate overall status
    const criticalIssues = results.issues_found.filter(i => i.severity === 'critical');
    const allChecksPassed = Object.values(results.checks).every(check => check?.status !== 'failed');

    results.overall_pass = allChecksPassed && criticalIssues.length === 0;
    results.status = results.overall_pass ? 'passed' : 'failed';
    results.critical_issues = criticalIssues.length;
    results.total_issues = results.issues_found.length;

    // Store results in database
    try {
      await base44.entities.SystemStatus.create({
        status: results.overall_pass ? 'operational' : 'degraded',
        message: `Launch readiness check: ${results.status} (${results.total_issues} issues)`,
        uptime_percentage: results.overall_pass ? 99.9 : 95.0
      });
    } catch (logErr) {
      console.warn('Could not log to SystemStatus:', logErr);
    }

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});