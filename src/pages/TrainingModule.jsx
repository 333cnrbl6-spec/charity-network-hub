import React from 'react';
import { Award, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VolunteerTrainingForm from '@/components/training/VolunteerTrainingForm';
import TrainingExpiryDashboard from '@/components/training/TrainingExpiryDashboard';

export default function TrainingModule() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
          <Award className="w-10 h-10 text-primary" />
          Volunteer Training Tracker
        </h1>
        <p className="text-muted-foreground mt-2">
          Track mandatory safeguarding training, DBS renewals, and professional development with automated expiry alerts
        </p>
      </div>

      {/* Compliance Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Training Compliance Framework
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>Mandatory Training:</strong> DBS (3 years) • Safeguarding Adults (2 years) • Safeguarding Children (2 years) • Manual Handling (1 year)</p>
          <p><strong>Recommended:</strong> Dementia Awareness • Mental Capacity Act • GDPR & Data Protection • Equality & Diversity</p>
          <p><strong>Role-Specific:</strong> First Aid • Food Hygiene • Medication Awareness • Moving & Handling</p>
          <p><strong>Automated Alerts:</strong> 90 days • 60 days • 30 days before expiry • Immediate on expiry</p>
          <p><strong>Certificate Storage:</strong> Secure file upload with audit trail</p>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Form */}
        <VolunteerTrainingForm />

        {/* Expiry Dashboard */}
        <TrainingExpiryDashboard />
      </div>
    </div>
  );
}