import React, { useState } from 'react';
import { Search, CheckCircle2, XCircle, AlertTriangle, MapPin, FileText, Phone, Mail, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DBSVerificationTool() {
  const [formData, setFormData] = useState({
    certificate_number: '',
    candidate_name: '',
    postcode: ''
  });
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVerify = async () => {
    if (!formData.certificate_number || !formData.candidate_name) {
      toast.error('Missing required fields', { description: 'Certificate number and candidate name are required' });
      return;
    }

    setVerifying(true);
    try {
      const { data } = await base44.functions.invoke('verifyDBSAndLocalAuthority', {
        certificate_number: formData.certificate_number,
        candidate_name: formData.candidate_name,
        postcode: formData.postcode
      });

      setResult(data);

      if (data.verified) {
        toast.success('DBS verification successful', {
          description: `Status: ${data.dbs_status.replace(/_/g, ' ')}`
        });
      } else if (data.status === 'not_found') {
        toast.error('DBS certificate not found', {
          description: 'Please check the certificate number and candidate name'
        });
      } else {
        toast.warning('DBS verification completed with concerns', {
          description: `Status: ${data.dbs_status}`
        });
      }
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error('Verification failed', { description: error.message });
    } finally {
      setVerifying(false);
    }
  };

  const getDBSStatusColor = (status) => {
    switch (status) {
      case 'clear':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'clear_with_info':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'not_clear':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          DBS Verification & Local Authority Lookup
        </CardTitle>
        <CardDescription>
          Real-time DBS certificate verification and adult social care referral contacts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Form */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>DBS Certificate Number *</Label>
            <Input
              placeholder="e.g., 123456789012"
              value={formData.certificate_number}
              onChange={(e) => handleInputChange('certificate_number', e.target.value.toUpperCase())}
              maxLength={12}
            />
          </div>
          <div>
            <Label>Candidate Name *</Label>
            <Input
              placeholder="Full name as on certificate"
              value={formData.candidate_name}
              onChange={(e) => handleInputChange('candidate_name', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Postcode (for local authority lookup)</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="e.g., M1 1AA"
              value={formData.postcode}
              onChange={(e) => handleInputChange('postcode', e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <Button
          onClick={handleVerify}
          disabled={verifying}
          className="w-full"
        >
          {verifying ? (
            <>
              <Search className="w-4 h-4 animate-spin mr-2" />
              Verifying with GOV.UK Services...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Verify DBS & Find Local Authority
            </>
          )}
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-4 border-t pt-4 mt-4">
            {/* DBS Status */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  DBS Certificate Status
                </h4>
                <Badge className={getDBSStatusColor(result.dbs_status)}>
                  {result.verified ? (
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  {result.dbs_status?.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Certificate Number</p>
                  <p className="font-mono font-semibold">{result.dbs_certificate_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Issue Date</p>
                  <p className="font-semibold">{result.dbs_issue_date ? new Date(result.dbs_issue_date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              {result.dbs_restrictions?.length > 0 && (
                <div className="mt-3 border border-yellow-200 rounded-lg p-3 bg-yellow-50">
                  <p className="text-xs font-semibold text-yellow-900 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Restrictions/Conditions
                  </p>
                  <ul className="text-xs text-yellow-800 list-disc list-inside mt-1">
                    {result.dbs_restrictions.map((restriction, idx) => (
                      <li key={idx}>{restriction}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.dbs_barred_lists?.length > 0 && (
                <div className="mt-3 border border-red-200 rounded-lg p-3 bg-red-50">
                  <p className="text-xs font-semibold text-red-900 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Barred Lists
                  </p>
                  <p className="text-xs text-red-800">
                    {result.dbs_barred_lists.join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Local Authority Contact */}
            {result.local_authority && (
              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <h4 className="font-semibold flex items-center gap-2 mb-3 text-blue-900">
                  <MapPin className="w-4 h-4" />
                  Local Authority Adult Social Care
                </h4>

                <p className="font-bold text-blue-900 mb-3">{result.local_authority.authority_name}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-blue-700" />
                    <span className="text-blue-800">
                      <strong>Main:</strong> {result.local_authority.contact_phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-red-700" />
                    <span className="text-red-800">
                      <strong>Emergency Duty:</strong> {result.local_authority.emergency_duty_phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-blue-700" />
                    <span className="text-blue-800">
                      <strong>Email:</strong> {result.local_authority.contact_email}
                    </span>
                  </div>
                  {result.local_authority.referral_url && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-3 h-3 text-blue-700" />
                      <a
                        href={result.local_authority.referral_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 underline"
                      >
                        Online Referral Portal
                      </a>
                    </div>
                  )}
                  {result.local_authority.office_hours && (
                    <p className="text-xs text-blue-700 mt-2">
                      <strong>Office Hours:</strong> {result.local_authority.office_hours}
                    </p>
                  )}
                </div>

                {result.local_authority.safeguarding_team && (
                  <div className="mt-3 border-t border-blue-200 pt-3">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Safeguarding Team:</p>
                    <p className="text-xs text-blue-800">{result.local_authority.safeguarding_team}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Usage Notes */}
        <div className="border-t pt-4 mt-4 text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-2">
            <AlertTriangle className="w-3 h-3" />
            DBS certificate format validation + local authority lookup
          </p>
          <p>
            For full DBS status verification, organisations must register with DBS. Contact: 0300 020 0190
          </p>
          <p>
            Local authority contacts provided for statutory safeguarding referrals
          </p>
        </div>
      </CardContent>
    </Card>
  );
}