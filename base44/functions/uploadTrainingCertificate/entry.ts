import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { training_id, certificate_file } = await req.json();

    if (!training_id || !certificate_file) {
      return Response.json({ 
        error: 'Training ID and certificate file required' 
      }, { status: 400 });
    }

    // Upload certificate file
    const { file_url } = await base44.integrations.Core.UploadFile({
      file: certificate_file
    });

    // Update training record
    const training = await base44.entities.VolunteerTraining.get(training_id);
    
    if (!training) {
      return Response.json({ error: 'Training record not found' }, { status: 404 });
    }

    await base44.entities.VolunteerTraining.update(training_id, {
      certificate_url: file_url,
      audit_trail: [
        ...(training.audit_trail || []),
        {
          timestamp: new Date().toISOString(),
          user: user.email,
          action: 'certificate_uploaded',
          details: `Certificate uploaded: ${file_url}`
        }
      ]
    });

    return Response.json({
      success: true,
      certificate_url: file_url,
      message: 'Certificate uploaded successfully'
    });

  } catch (error) {
    console.error('Certificate upload failed:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});