import React, { useState } from 'react';
import { Upload, FileText, Calendar, CheckCircle2, AlertTriangle, Clock, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TRAINING_TYPES = [
  { value: 'dbs_basic', label: 'DBS Basic Check', renewal: 36 },
  { value: 'dbs_enhanced', label: 'DBS Enhanced Check', renewal: 36 },
  { value: 'safeguarding_adults', label: 'Safeguarding Adults', renewal: 24 },
  { value: 'safeguarding_children', label: 'Safeguarding Children', renewal: 24 },
  { value: 'manual_handling', label: 'Manual Handling', renewal: 12 },
  { value: 'first_aid', label: 'First Aid', renewal: 36 },
  { value: 'food_hygiene', label: 'Food Hygiene', renewal: 36 },
  { value: 'dementia_awareness', label: 'Dementia Awareness', renewal: 24 },
  { value: 'mental_capacity_act', label: 'Mental Capacity Act', renewal: 24 },
  { value: 'gdpr_data_protection', label: 'GDPR & Data Protection', renewal: 24 },
  { value: 'health_safety', label: 'Health & Safety', renewal: 12 },
  { value: 'boundaries_confidentiality', label: 'Boundaries & Confidentiality', renewal: 24 },
  { value: 'equality_diversity', label: 'Equality & Diversity', renewal: 24 },
  { value: 'moving_handling', label: 'Moving & Handling', renewal: 12 },
  { value: 'medication_awareness', label: 'Medication Awareness', renewal: 12 },
  { value: 'infection_control', label: 'Infection Control', renewal: 12 },
  { value: 'fire_safety', label: 'Fire Safety', renewal: 12 },
  { value: 'safeguarding_refresher', label: 'Safeguarding Refresher', renewal: 12 },
  { value: 'dbs_renewal', label: 'DBS Renewal', renewal: 36 },
];

const COMPLIANCE_COLORS = {
  mandatory: 'bg-red-100 text-red-800 border-red-300',
  recommended: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  optional: 'bg-blue-100 text-blue-800 border-blue-300',
};

const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  booked: 'bg-purple-100 text-purple-800',
  expired: 'bg-red-100 text-red-800',
  expiring_soon: 'bg-orange-100 text-orange-800',
};

export default function VolunteerTrainingForm() {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [certificateFile, setCertificateFile] = useState(null);
  const [formData, setFormData] = useState({
    volunteer_id: '',
    volunteer_name: '',
    volunteer_email: '',
    training_type: '',
    training_provider: '',
    completion_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    certificate_number: '',
    notes: '',
    compliance_category: 'mandatory',
    renewal_required: true,
    renewal_frequency_months: 24,
  });

  const { data: volunteers = [] } = useQuery({
    queryKey: ['volunteers'],
    queryFn: () => base44.entities.Volunteer.list(),
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTrainingTypeChange = (value) => {
    const selected = TRAINING_TYPES.find(t => t.value === value);
    setFormData(prev => ({
      ...prev,
      training_type: value,
      renewal_frequency_months: selected?.renewal || 24
    }));
  };

  const handleVolunteerChange = (value) => {
    const volunteer = volunteers.find(v => v.id === value);
    setFormData(prev => ({
      ...prev,
      volunteer_id: value,
      volunteer_name: volunteer?.full_name || '',
      volunteer_email: volunteer?.email || ''
    }));
  };

  const calculateExpiryDate = (completionDate, months) => {
    const date = new Date(completionDate);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    if (!formData.volunteer_id || !formData.training_type || !formData.completion_date) {
      toast.error('Missing required fields', {
        description: 'Volunteer, training type, and completion date are required'
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create training record
      const trainingData = {
        ...formData,
        status: 'completed',
        expiry_alerts_enabled: true,
        audit_trail: [{
          timestamp: new Date().toISOString(),
          user: 'admin',
          action: 'training_recorded',
          details: `Training recorded: ${formData.training_type}`
        }]
      };

      const { id } = await base44.entities.VolunteerTraining.create(trainingData);

      // Upload certificate if provided
      if (certificateFile) {
        await base44.functions.invoke('uploadTrainingCertificate', {
          training_id: id,
          certificate_file: certificateFile
        });
      }

      toast.success('Training recorded successfully', {
        description: `${formData.volunteer_name} - ${formData.training_type.replace(/_/g, ' ')}`
      });

      // Reset form
      setFormData({
        volunteer_id: '',
        volunteer_name: '',
        volunteer_email: '',
        training_type: '',
        training_provider: '',
        completion_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        certificate_number: '',
        notes: '',
        compliance_category: 'mandatory',
        renewal_required: true,
        renewal_frequency_months: 24,
      });
      setCertificateFile(null);
      queryClient.invalidateQueries({ queryKey: ['volunteerTraining'] });
    } catch (error) {
      console.error('Failed to record training:', error);
      toast.error('Failed to record training', { description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Record Volunteer Training
        </CardTitle>
        <CardDescription>
          Log training completion, upload certificates, and set expiry tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Volunteer Selection */}
        <div>
          <Label>Select Volunteer *</Label>
          <Select value={formData.volunteer_id} onValueChange={handleVolunteerChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose volunteer" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {volunteers.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.full_name} - {v.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Training Type */}
        <div>
          <Label>Training Type *</Label>
          <Select value={formData.training_type} onValueChange={handleTrainingTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select training" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {TRAINING_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label} (Renewal: {type.renewal} months)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Training Provider */}
        <div>
          <Label>Training Provider</Label>
          <Input
            placeholder="e.g., Age UK Training, Red Cross, etc."
            value={formData.training_provider}
            onChange={(e) => handleInputChange('training_provider', e.target.value)}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Completion Date *</Label>
            <Input
              type="date"
              value={formData.completion_date}
              onChange={(e) => {
                handleInputChange('completion_date', e.target.value);
                if (formData.renewal_frequency_months) {
                  handleInputChange('expiry_date', calculateExpiryDate(e.target.value, formData.renewal_frequency_months));
                }
              }}
            />
          </div>
          <div>
            <Label>Expiry Date</Label>
            <Input
              type="date"
              value={formData.expiry_date}
              onChange={(e) => handleInputChange('expiry_date', e.target.value)}
            />
          </div>
        </div>

        {/* Certificate */}
        <div>
          <Label>Certificate Number</Label>
          <Input
            placeholder="Certificate reference"
            value={formData.certificate_number}
            onChange={(e) => handleInputChange('certificate_number', e.target.value)}
          />
        </div>

        <div>
          <Label>Upload Certificate (PDF/Image)</Label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setCertificateFile(e.target.files[0])}
              className="hidden"
              id="certificate-upload"
            />
            <label htmlFor="certificate-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {certificateFile ? certificateFile.name : 'Click to upload certificate'}
              </p>
            </label>
          </div>
        </div>

        {/* Compliance Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Compliance Category</Label>
            <Select value={formData.compliance_category} onValueChange={(val) => handleInputChange('compliance_category', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mandatory">Mandatory</SelectItem>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="optional">Optional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Renewal Frequency (Months)</Label>
            <Input
              type="number"
              value={formData.renewal_frequency_months}
              onChange={(e) => {
                const months = parseInt(e.target.value);
                handleInputChange('renewal_frequency_months', months);
                if (formData.completion_date) {
                  handleInputChange('expiry_date', calculateExpiryDate(formData.completion_date, months));
                }
              }}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label>Notes</Label>
          <Textarea
            placeholder="Additional notes about training"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="min-h-20"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full"
        >
          {submitting ? (
            <>
              <Clock className="w-4 h-4 animate-spin mr-2" />
              Recording Training...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Record Training
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}