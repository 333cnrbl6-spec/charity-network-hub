import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { certificate_number, candidate_name, postcode } = await req.json();

    if (!certificate_number || !candidate_name) {
      return Response.json({ 
        error: 'Certificate number and candidate name required' 
      }, { status: 400 });
    }

    // GOV.UK DBS Verification API
    // Note: This uses the official GOV.UK Verify DBS service
    const response = await fetch('https://api.publishing.service.gov.uk/dbs/v1/check', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GOVUK_NOTIFY_API_KEY')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        certificate_number: certificate_number,
        candidate_name: candidate_name,
        include_status: true,
        include_restrictions: true
      })
    });

    if (!response.ok) {
      if (response.status === 404) {
        return Response.json({ 
          status: 'not_found',
          message: 'DBS certificate not found',
          verified: false
        });
      }
      throw new Error(`DBS API error: ${response.status} ${response.statusText}`);
    }

    const dbsData = await response.json();

    // Enrich with local authority contact if postcode provided
    let localAuthorityContact = null;
    if (postcode) {
      const laResponse = await fetch(`https://lga.api.gov.uk/v1/local-authorities?postcode=${postcode}&service=adult_social_care`, {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('LGA_API_KEY')}`,
          'Accept': 'application/json'
        }
      });

      if (laResponse.ok) {
        const laData = await laResponse.json();
        if (laData.authorities?.length > 0) {
          localAuthorityContact = {
            authority_name: laData.authorities[0].name,
            safeguarding_team: laData.authorities[0].services.adult_social_care?.safeguarding,
            contact_email: laData.authorities[0].contact.email,
            contact_phone: laData.authorities[0].contact.phone,
            emergency_duty_phone: laData.authorities[0].contact.emergency_duty,
            referral_url: laData.authorities[0].services.adult_social_care?.referral_portal,
            office_hours: laData.authorities[0].contact.office_hours
          };
        }
      }
    }

    return Response.json({
      verified: dbsData.status === 'clear' || dbsData.status === 'clear_with_info',
      dbs_status: dbsData.status,
      dbs_certificate_number: certificate_number,
      dbs_issue_date: dbsData.issue_date,
      dbs_restrictions: dbsData.restrictions || [],
      dbs_barred_lists: dbsData.barred_lists || [],
      local_authority: localAuthorityContact,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('DBS verification failed:', error);
    return Response.json({ 
      error: error.message,
      verified: false
    }, { status: 500 });
  }
});