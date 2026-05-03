import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Initialize credit pricing structure.
 * Run once during deployment to set up operation costs.
 * Cost model: 1 credit = £0.01, so 100 credits = £1.00
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Clear existing pricing (development only)
    // In production, be careful with this
    const existing = await base44.asServiceRole.entities.CreditPricing.list();
    for (const item of existing) {
      try {
        await base44.asServiceRole.entities.CreditPricing.delete(item.id);
      } catch (e) {
        // Continue if delete fails
      }
    }

    // Define pricing structure
    const pricing = [
      {
        operation_type: 'ai_grant_writing',
        base_cost_credits: 75, // £0.75 per grant application
        starter_monthly_allowance: 100, // 1-2 grants per month free
        professional_monthly_allowance: 500, // 6-7 grants
        enterprise_monthly_allowance: 2000, // 26+ grants
        trial_allowance: 300, // 4 grant applications
        description: 'AI-powered grant application generation'
      },
      {
        operation_type: 'ai_report_generation',
        base_cost_credits: 50, // £0.50 per report
        starter_monthly_allowance: 50,
        professional_monthly_allowance: 300,
        enterprise_monthly_allowance: 1500,
        trial_allowance: 200,
        description: 'AI-generated impact or compliance reports'
      },
      {
        operation_type: 'ai_thank_you_letter',
        base_cost_credits: 30, // £0.30 per letter
        starter_monthly_allowance: 100,
        professional_monthly_allowance: 500,
        enterprise_monthly_allowance: 2000,
        trial_allowance: 150,
        description: 'AI-generated donor thank you letters'
      },
      {
        operation_type: 'ai_job_matching',
        base_cost_credits: 10, // £0.10 per job match (low cost, high value)
        starter_monthly_allowance: 200,
        professional_monthly_allowance: 1000,
        enterprise_monthly_allowance: 5000,
        trial_allowance: 500,
        description: 'Smart volunteer-to-job matching'
      },
      {
        operation_type: 'ai_insights',
        base_cost_credits: 40, // £0.40 per insight batch
        starter_monthly_allowance: 50,
        professional_monthly_allowance: 300,
        enterprise_monthly_allowance: 1500,
        trial_allowance: 100,
        description: 'AI-generated strategic insights & recommendations'
      },
      {
        operation_type: 'pdf_export',
        base_cost_credits: 5, // £0.05 per export (minimal cost)
        starter_monthly_allowance: 100,
        professional_monthly_allowance: 500,
        enterprise_monthly_allowance: 5000,
        trial_allowance: 200,
        description: 'PDF export (impact report, volunteer list, etc)'
      },
      {
        operation_type: 'api_call',
        base_cost_credits: 2, // £0.02 per 100 API calls (bulk batched)
        starter_monthly_allowance: 5000,
        professional_monthly_allowance: 25000,
        enterprise_monthly_allowance: 100000,
        trial_allowance: 10000,
        description: 'Direct API calls (if exposed externally)'
      },
      {
        operation_type: 'data_export_bulk',
        base_cost_credits: 25, // £0.25 per bulk export
        starter_monthly_allowance: 20,
        professional_monthly_allowance: 100,
        enterprise_monthly_allowance: 1000,
        trial_allowance: 50,
        description: 'Bulk data export (CSV, Excel of all volunteers/sessions)'
      },
      {
        operation_type: 'email_campaign',
        base_cost_credits: 1, // £0.01 per email (external delivery cost)
        starter_monthly_allowance: 1000,
        professional_monthly_allowance: 10000,
        enterprise_monthly_allowance: 100000,
        trial_allowance: 2000,
        description: 'Bulk email send (volunteer reminders, newsletters)'
      }
    ];

    let created = 0;
    for (const item of pricing) {
      try {
        await base44.asServiceRole.entities.CreditPricing.create({
          ...item,
          active: true
        });
        created++;
      } catch (e) {
        console.log(`Failed to create pricing for ${item.operation_type}:`, e.message);
      }
    }

    return Response.json({
      success: true,
      pricing_records_created: created,
      total_pricing_types: pricing.length,
      message: 'Credit pricing structure initialized'
    });
  } catch (error) {
    console.error('seedCreditPricing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});