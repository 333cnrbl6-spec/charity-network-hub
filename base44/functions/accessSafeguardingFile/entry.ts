import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileId } = await req.json();

    if (!fileId) {
      return Response.json({ error: 'File ID required' }, { status: 400 });
    }

    // Get file record
    const fileRecord = await base44.asServiceRole.entities.SafeguardingFile.get(fileId);
    
    if (!fileRecord || fileRecord.is_deleted) {
      return Response.json({ error: 'File not found or deleted' }, { status: 404 });
    }

    // Check access permissions
    const incident = await base44.entities.SafeguardingIncident.get(fileRecord.incident_id);
    if (!incident) {
      return Response.json({ error: 'Associated incident not found' }, { status: 404 });
    }

    // Only allow access if user is safeguarding lead, admin, or uploader
    const hasAccess = 
      user.role === 'admin' ||
      user.email === incident.safeguarding_lead_assigned ||
      user.email === fileRecord.uploaded_by ||
      incident.confidentiality_level !== 'highly_confidential';

    if (!hasAccess) {
      // Log unauthorized access attempt
      await base44.asServiceRole.entities.SafeguardingFile.update(fileId, {
        access_log: [
          ...(fileRecord.access_log || []),
          {
            timestamp: new Date().toISOString(),
            user: user.email,
            action: 'access_denied',
            reason: 'Insufficient permissions',
            ip_address: 'logged'
          }
        ]
      });

      return Response.json({ error: 'Access denied: Insufficient permissions' }, { status: 403 });
    }

    // Check if signed URL has expired
    const now = new Date();
    const urlExpires = new Date(fileRecord.url_expires_at);
    
    let signedUrl = fileRecord.signed_url;
    
    if (now > urlExpires) {
      // Generate new signed URL (expires in 24 hours for re-access)
      const newSignedUrl = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri: fileRecord.file_uri,
        expires_in: 24 * 60 * 60 // 24 hours
      });
      
      signedUrl = newSignedUrl.signed_url;
      
      // Update file record with new URL
      await base44.asServiceRole.entities.SafeguardingFile.update(fileId, {
        signed_url: signedUrl,
        url_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Log access
    await base44.asServiceRole.entities.SafeguardingFile.update(fileId, {
      download_count: (fileRecord.download_count || 0) + 1,
      last_accessed: now.toISOString(),
      access_log: [
        ...(fileRecord.access_log || []),
        {
          timestamp: now.toISOString(),
          user: user.email,
          user_name: user.full_name,
          action: 'file_accessed',
          access_type: 'view_download',
          ip_address: 'logged'
        }
      ]
    });

    console.log(`File accessed: ${fileRecord.file_reference} by ${user.email}`);

    return Response.json({
      success: true,
      file_reference: fileRecord.file_reference,
      filename: fileRecord.original_filename,
      file_type: fileRecord.file_type,
      file_size_bytes: fileRecord.file_size_bytes,
      file_category: fileRecord.file_category,
      signed_url: signedUrl,
      expires_in: 24 * 60 * 60,
      download_count: (fileRecord.download_count || 0) + 1,
      message: 'File access granted and logged'
    });

  } catch (error) {
    console.error('File access failed:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});