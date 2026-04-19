import React, { useState } from 'react';
import { AlertTriangle, Shield, Users, Clock, MapPin, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import SecureFileUpload from './SecureFileUpload';

const INCIDENT_TYPES = [
  { value: 'physical_abuse', label: 'Physical Abuse', icon: '🚨' },
  { value: 'emotional_abuse', label: 'Emotional/Psychological Abuse', icon: '⚠️' },
  { value: 'sexual_abuse', label: 'Sexual Abuse', icon: '🚨' },
  { value: 'financial_abuse', label: 'Financial/Material Abuse', icon: '💰' },
  { value: 'neglect', label: 'Neglect', icon: '⚠️' },
  { value: 'discriminatory_abuse', label: 'Discriminatory Abuse', icon: '⚠️' },
  { value: 'domestic_violence', label: 'Domestic Violence', icon: '🚨' },
  { value: 'modern_slavery', label: 'Modern Slavery', icon: '🚨' },
  { value: 'organisational_abuse', label: 'Organisational/Institutional Abuse', icon: '⚠️' },
  { value: 'self_neglect', label: 'Self-Neglect', icon: '⚠️' },
  { value: 'radicalisation', label: 'Radicalisation/Prevent', icon: '🚨' },
  { value: 'cse_child_sexual_exploitation', label: 'Child Sexual Exploitation', icon: '🚨' },
  { value: 'fgm_female_genital_mutilation', label: 'Female Genital Mutilation (FGM)', icon: '🚨' },
  { value: 'honour_based_violence', label: 'Honour-Based Violence', icon: '🚨' },
  { value: 'near_miss', label: 'Near Miss (No harm occurred)', icon: 'ℹ️' },
  { value: 'concern_disclosure', label: 'Concern/Disclosure', icon: 'ℹ️' },
  { value: 'allegation_against_staff', label: 'Allegation Against Staff/Volunteer', icon: '🚨' },
  { value: 'other', label: 'Other', icon: 'ℹ️' },
];

export default function SafeguardingIncidentForm() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    incident_date: new Date().toISOString().split('T')[0],
    incident_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    incident_type: '',
    incident_location: '',
    incident_description: '',
    people_involved: [],
    vulnerable_adult: {
      name: '',
      age: '',
      client_id: '',
      risk_factors: [],
      capacity_concerns: false,
      immediate_danger: false,
    },
    witnesses: [],
    actions_taken: '',
  });
  const [aiAssessment, setAiAssessment] = useState(null);
  const [runningAI, setRunningAI] = useState(false);
  const [createdIncidentId, setCreatedIncidentId] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVulnerableAdultChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      vulnerable_adult: { ...prev.vulnerable_adult, [field]: value },
    }));
  };

  const runAISeverityClassification = async () => {
    setRunningAI(true);
    try {
      const { data } = await base44.integrations.Core.InvokeLLM({
        model: 'claude_opus_4_6',
        prompt: `You are a UK safeguarding expert. Analyse this incident report and classify severity.

INCIDENT DETAILS:
Type: ${formData.incident_type}
Date/Time: ${formData.incident_date} ${formData.incident_time}
Location: ${formData.incident_location}
Description: ${formData.incident_description}

VULNERABLE ADULT:
Name: ${formData.vulnerable_adult.name}
Age: ${formData.vulnerable_adult.age}
Immediate Danger: ${formData.vulnerable_adult.immediate_danger}
Capacity Concerns: ${formData.vulnerable_adult.capacity_concerns}
Risk Factors: ${formData.vulnerable_adult.risk_factors.join(', ')}

ACTIONS TAKEN: ${formData.actions_taken}

CLASSIFY using UK safeguarding standards (Care Act 2014, HM Government Working Together to Safeguard Adults):

**Severity Levels:**
- CRITICAL: Immediate life-threatening situation, serious harm occurred, crime in progress, requires emergency services (999)
- HIGH: Significant harm risk, urgent safeguarding response needed, statutory referral required (adult social care, police, LADO)
- MEDIUM: Moderate risk, safeguarding lead investigation needed, may require external referral
- LOW: Minor concern, no immediate harm, can be managed with internal support

**Assess:**
1. Immediate risk to vulnerable adult or others
2. Risk score (0-100)
3. Risk factors present
4. Recommended immediate actions
5. Statutory referral requirements (adult social care, police, CQC, LADO, Prevent, etc.)
6. Urgency level

Output structured JSON for incident management.`,
        response_json_schema: {
          type: 'object',
          properties: {
            severity_level: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            immediate_risk: { type: 'boolean' },
            risk_score: { type: 'number' },
            risk_factors: { type: 'array', items: { type: 'string' } },
            recommended_actions: { type: 'array', items: { type: 'string' } },
            statutory_referral_required: { type: 'boolean' },
            referral_agencies: { type: 'array', items: { type: 'string' } },
            urgency: { type: 'string', enum: ['immediate', 'within_24_hours', 'within_72_hours', 'routine'] },
            emergency_services_required: { type: 'boolean' },
            safeguarding_lead_notification: { type: 'string', enum: ['immediate_phone_call', 'within_1_hour', 'within_24_hours', 'email_only'] },
          },
          required: ['severity_level', 'immediate_risk', 'risk_score', 'urgency'],
        },
      });

      setAiAssessment(data);
      toast.success('AI severity classification complete', {
        description: `Severity: ${data.severity_level.toUpperCase()} | Risk Score: ${data.risk_score}/100`,
      });
    } catch (error) {
      console.error('AI assessment failed:', error);
      toast.error('AI assessment failed', { description: error.message });
    } finally {
      setRunningAI(false);
    }
  };

  const handleSubmitIncident = async () => {
    setSubmitting(true);
    try {
      // Generate reference number
      const year = new Date().getFullYear();
      const existingIncidents = await base44.entities.SafeguardingIncident.filter({});
      const incidentCount = existingIncidents.filter(i => i.incident_reference.includes(year.toString())).length;
      const reference = `SG-${year}-${String(incidentCount + 1).padStart(3, '0')}`;

      // Calculate data retention date (6 years)
      const retentionDate = new Date(formData.incident_date);
      retentionDate.setFullYear(retentionDate.getFullYear() + 6);

      // Create incident record
      const incident = {
        incident_reference: reference,
        reported_by: user.email,
        reported_by_name: user.full_name,
        reported_by_role: user.role === 'admin' ? 'staff' : 'volunteer',
        incident_date: `${formData.incident_date}T${formData.incident_time}:00`,
        incident_location: formData.incident_location,
        incident_type: formData.incident_type,
        incident_description: formData.incident_description,
        vulnerable_adult_details: formData.vulnerable_adult,
        actions_taken: formData.actions_taken,
        ai_severity_classification: aiAssessment.severity_level,
        ai_risk_assessment: aiAssessment,
        status: 'reported',
        confidentiality_level: aiAssessment.severity_level === 'critical' || aiAssessment.severity_level === 'high' ? 'highly_confidential' : 'restricted',
        data_retention_date: retentionDate.toISOString().split('T')[0],
        audit_trail: [{
          timestamp: new Date().toISOString(),
          user: user.email,
          action: 'incident_reported',
          details: `Initial report submitted by ${user.full_name}`,
        }],
      };

      await base44.entities.SafeguardingIncident.create(incident);

      // Trigger management alerts for high/critical severity
      if (aiAssessment.severity_level === 'critical' || aiAssessment.severity_level === 'high') {
        await triggerManagementAlert(incident, aiAssessment);
      }

      toast.success('Incident reported successfully', {
        description: `Reference: ${reference}`,
      });

      // Reset form
      setFormData({
        incident_date: new Date().toISOString().split('T')[0],
        incident_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        incident_type: '',
        incident_location: '',
        incident_description: '',
        people_involved: [],
        vulnerable_adult: {
          name: '',
          age: '',
          client_id: '',
          risk_factors: [],
          capacity_concerns: false,
          immediate_danger: false,
        },
        witnesses: [],
        actions_taken: '',
      });
      setAiAssessment(null);
      setCreatedIncidentId(incident.id);
      setStep(4); // Move to file upload step
    } catch (error) {
      console.error('Failed to submit incident:', error);
      toast.error('Failed to submit incident', { description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilesUpdate = () => {
    // Refresh incident data after file upload
    console.log('Files updated for incident');
  };

  const triggerManagementAlert = async (incident, assessment) => {
    // This would trigger email/SMS alerts to safeguarding lead
    // For now, log to console
    console.log('ALERT TRIGGERED:', {
      severity: incident.ai_severity_classification,
      reference: incident.incident_reference,
      urgency: assessment.urgency,
      requires_emergency_services: assessment.emergency_services_required,
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Incident Type *</Label>
                <Select value={formData.incident_type} onValueChange={(val) => handleInputChange('incident_type', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {INCIDENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Incident Date *</Label>
                <Input
                  type="date"
                  value={formData.incident_date}
                  onChange={(e) => handleInputChange('incident_date', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Incident Time *</Label>
              <Input
                type="time"
                value={formData.incident_time}
                onChange={(e) => handleInputChange('incident_time', e.target.value)}
              />
            </div>

            <div>
              <Label>Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Where did the incident occur?"
                  value={formData.incident_location}
                  onChange={(e) => handleInputChange('incident_location', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Description of Incident *</Label>
              <Textarea
                className="min-h-32"
                placeholder="Provide a detailed, factual account of what happened. Include who, what, when, where. Avoid opinions or assumptions."
                value={formData.incident_description}
                onChange={(e) => handleInputChange('incident_description', e.target.value)}
              />
            </div>

            <Button onClick={() => setStep(2)} disabled={!formData.incident_type || !formData.incident_description} className="w-full">
              Next: Vulnerable Adult Details <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name of Vulnerable Adult</Label>
                <Input
                  value={formData.vulnerable_adult.name}
                  onChange={(e) => handleVulnerableAdultChange('name', e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label>Age</Label>
                <Input
                  type="number"
                  value={formData.vulnerable_adult.age}
                  onChange={(e) => handleVulnerableAdultChange('age', e.target.value)}
                  placeholder="Age"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="immediate_danger"
                  checked={formData.vulnerable_adult.immediate_danger}
                  onChange={(e) => handleVulnerableAdultChange('immediate_danger', e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="immediate_danger" className="text-red-600 font-semibold">
                  ⚠️ Immediate Danger
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="capacity_concerns"
                  checked={formData.vulnerable_adult.capacity_concerns}
                  onChange={(e) => handleVulnerableAdultChange('capacity_concerns', e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="capacity_concerns">Mental Capacity Concerns</Label>
              </div>
            </div>

            <div>
              <Label>Actions Taken So Far</Label>
              <Textarea
                className="min-h-24"
                placeholder="What immediate actions have you taken? (e.g., first aid, called emergency services, informed manager)"
                value={formData.actions_taken}
                onChange={(e) => handleInputChange('actions_taken', e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Next: AI Assessment <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-blue-50">
              <p className="font-semibold text-blue-900 mb-2">AI Severity Classification</p>
              <p className="text-sm text-blue-800 mb-3">
                Claude AI will analyse the incident details and classify severity according to UK safeguarding standards.
              </p>
              {aiAssessment ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border rounded-lg p-3 bg-white">
                      <p className="text-xs text-muted-foreground">Severity Level</p>
                      <p className={`text-lg font-bold ${
                        aiAssessment.severity_level === 'critical' ? 'text-red-600' :
                        aiAssessment.severity_level === 'high' ? 'text-orange-600' :
                        aiAssessment.severity_level === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {aiAssessment.severity_level.toUpperCase()}
                      </p>
                    </div>
                    <div className="border rounded-lg p-3 bg-white">
                      <p className="text-xs text-muted-foreground">Risk Score</p>
                      <p className="text-lg font-bold">{aiAssessment.risk_score}/100</p>
                    </div>
                  </div>

                  {aiAssessment.recommended_actions?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-1">Recommended Actions:</p>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        {aiAssessment.recommended_actions.map((action, idx) => (
                          <li key={idx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiAssessment.statutory_referral_required && (
                    <div className="border border-red-200 rounded-lg p-3 bg-red-50">
                      <p className="text-sm font-semibold text-red-900">⚠️ Statutory Referral Required</p>
                      <p className="text-xs text-red-800">
                        Agencies: {aiAssessment.referral_agencies.join(', ')}
                      </p>
                    </div>
                  )}

                  <div className="border rounded-lg p-3 bg-white">
                    <p className="text-xs text-muted-foreground">Urgency</p>
                    <p className="text-sm font-semibold">{aiAssessment.urgency.replace(/_/g, ' ').toUpperCase()}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-blue-700">Click "Run AI Assessment" to classify severity</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={runAISeverityClassification}
                disabled={runningAI || !!aiAssessment}
                className="flex-1"
              >
                {runningAI ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin mr-2" />
                    Running AI Assessment...
                  </>
                ) : aiAssessment ? (
                  '✓ Assessment Complete'
                ) : (
                  'Run AI Assessment'
                )}
              </Button>
            </div>

            {aiAssessment && (
              <Button
                onClick={handleSubmitIncident}
                disabled={submitting}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {submitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin mr-2" />
                    Submitting Incident Report...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Submit Safeguarding Incident Report
                  </>
                )}
              </Button>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-green-50">
              <p className="font-semibold text-green-900 mb-2">✓ Incident Successfully Reported</p>
              <p className="text-sm text-green-800">
                Reference: <strong>{existingIncidents?.incident_reference || 'Pending'}</strong>
              </p>
              <p className="text-xs text-green-700 mt-2">
                You can now attach supporting evidence files (photos, documents, witness statements).
              </p>
            </div>

            {createdIncidentId && (
              <SecureFileUpload
                incidentId={createdIncidentId}
                existingFiles={existingIncidents?.attached_files || []}
                onFilesUpdate={handleFilesUpdate}
              />
            )}

            <Button onClick={() => { setCreatedIncidentId(null); setStep(1); }} className="w-full" variant="outline">
              Report Another Incident
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Safeguarding Incident Reporting
        </CardTitle>
        <CardDescription>
          Secure, confidential incident reporting system with AI-powered severity classification
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          Step {step} of 3:{' '}
          {step === 1 ? 'Incident Details' : step === 2 ? 'Vulnerable Adult Information' : 'AI Assessment & Submission'}
        </div>

        {renderStep()}

        {/* Confidentiality Notice */}
        <div className="mt-6 border-t pt-4">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Shield className="w-3 h-3" />
            This form is confidential. All submissions are logged with audit trails and accessible only to authorised safeguarding leads.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}