import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Service role for admin operations
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    const ninetyDaysFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000));

    // Get all training records
    const allTraining = await base44.asServiceRole.entities.VolunteerTraining.filter({});
    
    // Filter for records with expiry dates that need monitoring
    const trainingWithExpiry = allTraining.filter(t => 
      t.expiry_date && 
      t.renewal_required !== false &&
      t.expiry_alerts_enabled !== false
    );

    const expiringSoon = [];
    const expired = [];
    const alertsSent = [];

    trainingWithExpiry.forEach(training => {
      const expiryDate = new Date(training.expiry_date);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Update days until expiry
      training.days_until_expiry = daysUntilExpiry;

      // Check if expired
      if (daysUntilExpiry < 0) {
        expired.push({
          ...training,
          days_overdue: Math.abs(daysUntilExpiry)
        });
      } 
      // Check if expiring within 90 days
      else if (daysUntilExpiry <= 90) {
        expiringSoon.push({
          ...training,
          urgency: daysUntilExpiry <= 30 ? 'critical' : daysUntilExpiry <= 60 ? 'high' : 'medium',
          days_until_expiry: daysUntilExpiry
        });
      }
    });

    // Create alerts for expired training
    for (const record of expired) {
      const existingAlert = await base44.asServiceRole.entities.NetworkAlert.filter({
        branch_id: `training_${record.id}`,
        alert_type: 'training_expired',
        resolved: false
      });

      if (existingAlert.length === 0) {
        await base44.asServiceRole.entities.NetworkAlert.create({
          branch_id: `training_${record.id}`,
          alert_type: 'training_expired',
          message: `Training expired: ${record.volunteer_name} - ${record.training_type.replace(/_/g, ' ').toUpperCase()} expired ${record.days_overdue} day(s) ago`,
          severity: 'high',
          resolved: false
        });
        alertsSent.push({
          volunteer: record.volunteer_name,
          training: record.training_type,
          type: 'expired',
          days_overdue: record.days_overdue
        });
      }
    }

    // Create alerts for training expiring within 30 days
    for (const record of expiringSoon.filter(r => r.urgency === 'critical')) {
      const existingAlert = await base44.asServiceRole.entities.NetworkAlert.filter({
        branch_id: `training_${record.id}`,
        alert_type: 'training_expiring_soon',
        resolved: false
      });

      if (existingAlert.length === 0) {
        await base44.asServiceRole.entities.NetworkAlert.create({
          branch_id: `training_${record.id}`,
          alert_type: 'training_expiring_soon',
          message: `Training expiring soon: ${record.volunteer_name} - ${record.training_type.replace(/_/g, ' ')} expires in ${record.days_until_expiry} day(s)`,
          severity: 'medium',
          resolved: false
        });
        alertsSent.push({
          volunteer: record.volunteer_name,
          training: record.training_type,
          type: 'expiring_soon',
          days_until_expiry: record.days_until_expiry
        });
      }
    }

    // Update training statuses
    for (const record of expired) {
      if (record.status !== 'expired') {
        await base44.asServiceRole.entities.VolunteerTraining.update(record.id, {
          status: 'expired',
          days_until_expiry: record.days_until_expiry
        });
      }
    }

    for (const record of expiringSoon) {
      if (record.status !== 'expiring_soon') {
        await base44.asServiceRole.entities.VolunteerTraining.update(record.id, {
          status: 'expiring_soon',
          days_until_expiry: record.days_until_expiry
        });
      }
    }

    return Response.json({
      total_training_records: trainingWithExpiry.length,
      expired_count: expired.length,
      expiring_soon_count: expiringSoon.length,
      alerts_created: alertsSent.length,
      expired: expired,
      expiring_soon: expiringSoon,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('Training expiry check failed:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});