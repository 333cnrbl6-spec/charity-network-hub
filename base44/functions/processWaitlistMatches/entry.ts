import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all waiting clients
    const waitlistClients = await base44.entities.Waitlist.filter({
      status: 'waiting',
    });

    if (!waitlistClients || waitlistClients.length === 0) {
      return Response.json({
        success: true,
        message: 'No clients on waitlist',
        matched: 0,
      });
    }

    // Fetch all active volunteers
    const activeVolunteers = await base44.entities.Volunteer.filter({
      status: 'active',
    });

    if (!activeVolunteers || activeVolunteers.length === 0) {
      return Response.json({
        success: true,
        message: 'No active volunteers available',
        matched: 0,
      });
    }

    let matchedCount = 0;
    const matches = [];

    // For each waitlist client, try to find a matching volunteer
    for (const waitlistEntry of waitlistClients) {
      // Find volunteers in the same area/branch with the required service type
      const matchingVolunteer = activeVolunteers.find(v => {
        const areaMatch = !waitlistEntry.required_area || 
          v.area === waitlistEntry.required_area ||
          v.area?.includes(waitlistEntry.required_area);
        
        // Check if volunteer role supports the service type needed
        const supportedServices = {
          'home-visit': ['befriender', 'admin', 'other'],
          'telephone-check': ['befriender', 'admin', 'other'],
          'transport': ['driver', 'admin'],
          'shopping-assist': ['driver', 'admin', 'other'],
          'benefits-advice': ['admin', 'other'],
          'digital-help': ['digital-champion', 'admin', 'other'],
          'befriending': ['befriender', 'ageing-well-facilitator', 'admin', 'other'],
          'scams-advice': ['admin', 'other'],
          'hospital-discharge': ['befriender', 'admin', 'other'],
          'other': ['admin', 'other'],
        };

        const roleMatch = supportedServices[waitlistEntry.service_type]?.includes(v.role) || false;
        
        return areaMatch && roleMatch;
      });

      if (matchingVolunteer) {
        // Update waitlist entry to matched
        await base44.entities.Waitlist.update(waitlistEntry.id, {
          status: 'matched',
          matched_volunteer_id: matchingVolunteer.id,
          matched_volunteer_name: matchingVolunteer.full_name,
        });

        // Update client status to active
        await base44.entities.Client.update(waitlistEntry.client_id, {
          status: 'active',
          key_worker: matchingVolunteer.full_name,
        });

        // Create a job record for the matched volunteer and client
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + 3); // Schedule 3 days from now

        await base44.entities.Job.create({
          client_id: waitlistEntry.client_id,
          client_name: waitlistEntry.client_name,
          volunteer_id: matchingVolunteer.id,
          volunteer_name: matchingVolunteer.full_name,
          job_type: waitlistEntry.service_type,
          scheduled_date: scheduledDate.toISOString(),
          status: 'scheduled',
          notes: `Automatic match from waitlist: ${waitlistEntry.reason_for_waitlist || 'Volunteer became available'}`,
        });

        matchedCount++;
        matches.push({
          clientName: waitlistEntry.client_name,
          volunteerName: matchingVolunteer.full_name,
          serviceType: waitlistEntry.service_type,
        });
      }
    }

    return Response.json({
      success: true,
      message: `Processed waitlist: ${matchedCount} client(s) matched and activated`,
      matched: matchedCount,
      matches,
    });
  } catch (error) {
    console.error('Waitlist processing error:', error);
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
});