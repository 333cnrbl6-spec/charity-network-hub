import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { addDays, differenceInDays } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all branches
    const branches = await base44.asServiceRole.entities.BranchConfig.filter({});
    if (!branches || branches.length === 0) {
      return Response.json({ message: 'No branches found', processed: 0 });
    }

    const today = new Date();
    const alertThreshold = 30; // Days until expiry to trigger alert
    const results = [];

    for (const branch of branches) {
      try {
        const branchId = branch.id;
        const charityId = branch.charity_id;

        // === DBS RISK CALCULATION ===
        const volunteers = await base44.asServiceRole.entities.Volunteer.filter({
          branch_id: branchId
        });

        let dbsExpiredCount = 0;
        let dbsExpiringCount = 0;

        volunteers?.forEach(vol => {
          if (vol.dbs_expiry_date) {
            const expiryDate = new Date(vol.dbs_expiry_date);
            const daysUntilExpiry = differenceInDays(expiryDate, today);

            if (daysUntilExpiry < 0) {
              dbsExpiredCount++;
            } else if (daysUntilExpiry <= alertThreshold) {
              dbsExpiringCount++;
            }
          }
        });

        const dbsRiskScore = Math.min(
          (dbsExpiredCount * 50 + dbsExpiringCount * 25) / (volunteers?.length || 1) || 0,
          100
        );

        // === TRAINING RISK CALCULATION ===
        const trainings = await base44.asServiceRole.entities.VolunteerTraining.filter({
          branch_id: branchId
        });

        let trainingExpiredCount = 0;
        let trainingExpiringCount = 0;

        trainings?.forEach(training => {
          if (training.expiry_date) {
            const expiryDate = new Date(training.expiry_date);
            const daysUntilExpiry = differenceInDays(expiryDate, today);

            if (daysUntilExpiry < 0) {
              trainingExpiredCount++;
            } else if (daysUntilExpiry <= alertThreshold) {
              trainingExpiringCount++;
            }
          }
        });

        const trainingRiskScore = Math.min(
          (trainingExpiredCount * 40 + trainingExpiringCount * 20) / (volunteers?.length || 1) || 0,
          100
        );

        // === INCIDENT RISK CALCULATION ===
        const thirtyDaysAgo = addDays(today, -30);
        const incidents = await base44.asServiceRole.entities.SafeguardingIncident.filter({
          branch_id: branchId
        });

        const recentIncidents = incidents?.filter(i => 
          i.created_date && new Date(i.created_date) >= thirtyDaysAgo
        ) || [];

        const unresolvedHighPriority = incidents?.filter(i =>
          i.priority === 'high' && i.status !== 'resolved'
        ) || [];

        const incidentRiskScore = Math.min(
          (recentIncidents.length * 15) + (unresolvedHighPriority.length * 35),
          100
        );

        // === OVERALL RISK CALCULATION ===
        const overallRiskScore = Math.round(
          (dbsRiskScore * 0.4 + trainingRiskScore * 0.35 + incidentRiskScore * 0.25)
        );

        // Determine risk level
        let overallRiskLevel = 'low';
        if (overallRiskScore >= 75) {
          overallRiskLevel = 'critical';
        } else if (overallRiskScore >= 50) {
          overallRiskLevel = 'high';
        } else if (overallRiskScore >= 25) {
          overallRiskLevel = 'medium';
        }

        // Generate recommendations
        const recommendations = [];
        if (dbsExpiredCount > 0) {
          recommendations.push(`${dbsExpiredCount} volunteer(s) have expired DBS checks - immediate action required`);
        }
        if (dbsExpiringCount > 0) {
          recommendations.push(`${dbsExpiringCount} DBS check(s) expiring within 30 days - renew soon`);
        }
        if (trainingExpiredCount > 0) {
          recommendations.push(`${trainingExpiredCount} training certification(s) have expired - reschedule immediately`);
        }
        if (trainingExpiringCount > 0) {
          recommendations.push(`${trainingExpiringCount} training(s) expiring within 30 days - book renewal`);
        }
        if (unresolvedHighPriority.length > 0) {
          recommendations.push(`${unresolvedHighPriority.length} unresolved high-priority incident(s) - require escalation`);
        }

        // Check for existing risk score
        const existingScores = await base44.asServiceRole.entities.SafeguardingRiskScore.filter({
          branch_id: branchId
        });

        const riskScoreId = existingScores?.[0]?.id;

        // Determine if alert should be sent (only if risk level changed to high/critical, or score increased significantly)
        let shouldAlert = false;
        if (overallRiskLevel === 'critical' || overallRiskLevel === 'high') {
          const previousScore = existingScores?.[0]?.overall_risk_score || 0;
          const scoreDiff = overallRiskScore - previousScore;
          shouldAlert = scoreDiff > 15 || overallRiskLevel === 'critical';
        }

        // Update or create risk score
        if (riskScoreId) {
          await base44.asServiceRole.entities.SafeguardingRiskScore.update(riskScoreId, {
            overall_risk_level: overallRiskLevel,
            overall_risk_score: overallRiskScore,
            dbs_risk_score: Math.round(dbsRiskScore),
            dbs_expired_count: dbsExpiredCount,
            dbs_expiring_soon_count: dbsExpiringCount,
            training_risk_score: Math.round(trainingRiskScore),
            training_expired_count: trainingExpiredCount,
            training_expiring_soon_count: trainingExpiringCount,
            incident_risk_score: Math.round(incidentRiskScore),
            incidents_last_30_days: recentIncidents.length,
            high_priority_incidents: unresolvedHighPriority.length,
            last_calculated: new Date().toISOString(),
            recommendations,
            alert_sent: shouldAlert
          });
        } else {
          await base44.asServiceRole.entities.SafeguardingRiskScore.create({
            branch_id: branchId,
            charity_id: charityId,
            overall_risk_level: overallRiskLevel,
            overall_risk_score: overallRiskScore,
            dbs_risk_score: Math.round(dbsRiskScore),
            dbs_expired_count: dbsExpiredCount,
            dbs_expiring_soon_count: dbsExpiringCount,
            training_risk_score: Math.round(trainingRiskScore),
            training_expired_count: trainingExpiredCount,
            training_expiring_soon_count: trainingExpiringCount,
            incident_risk_score: Math.round(incidentRiskScore),
            incidents_last_30_days: recentIncidents.length,
            high_priority_incidents: unresolvedHighPriority.length,
            last_calculated: new Date().toISOString(),
            recommendations,
            alert_sent: shouldAlert
          });
        }

        results.push({
          branch_id: branchId,
          risk_level: overallRiskLevel,
          risk_score: overallRiskScore,
          should_alert: shouldAlert
        });
      } catch (err) {
        console.error(`Error processing branch ${branch.id}:`, err);
        results.push({ branch_id: branch.id, error: err.message });
      }
    }

    return Response.json({
      success: true,
      processed: results.length,
      results
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});