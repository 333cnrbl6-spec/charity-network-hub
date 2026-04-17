import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, AlertTriangle, Edit2 } from 'lucide-react';

const COMPLIANCE_AREAS = {
  dbs_checks: 'DBS Checks',
  safeguarding_training: 'Safeguarding Training',
  health_safety: 'Health & Safety Policy',
  manual_handling: 'Manual Handling',
  dementia_awareness: 'Dementia Awareness',
  boundary_training: 'Boundary Training',
  financial_audit: 'Financial Audit',
  data_protection: 'Data Protection (GDPR)',
  insurance: 'Insurance & Liability',
  accessibility_standards: 'Accessibility Standards',
  quality_standards: 'Organisational Quality Standards',
  incident_reporting: 'Incident Reporting System'
};

export default function BranchComplianceDetail() {
  const { branchId } = useParams();
  const [user, setUser] = useState(null);
  const [userRegion, setUserRegion] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  React.useEffect(() => {
    const getUser = async () => {
      const me = await base44.auth.me();
      setUser(me);
      
      const regionalLeads = await base44.asServiceRole.entities.RegionalLead.filter({
        user_email: me.email
      });
      if (regionalLeads.length > 0) {
        setUserRegion(regionalLeads[0].region);
        setIsOwner(regionalLeads[0].branches_managed?.includes(branchId));
      }
    };
    getUser();
  }, [branchId]);

  const { data: branch } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: () => base44.asServiceRole.entities.BranchConfig.filter({ branch_id: branchId }).then(b => b[0]),
  });

  const { data: records = [] } = useQuery({
    queryKey: ['compliance-records', branchId],
    queryFn: () => base44.asServiceRole.entities.ComplianceRecord.filter({ branch_id: branchId }),
  });

  const canEdit = user?.role === 'admin' || isOwner;
  const complianceRate = records.length > 0 ? Math.round((records.filter(r => r.status === 'compliant').length / records.length) * 100) : 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'at_risk': return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{branch?.branch_name} - Compliance</h1>
          <p className="text-muted-foreground mt-1">Overall Compliance Rate: {complianceRate}%</p>
        </div>
        {canEdit && (
          <Button size="sm" className="gap-2">
            <Edit2 className="w-4 h-4" />
            Update Records
          </Button>
        )}
      </div>

      {/* Compliance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{records.filter(r => r.status === 'compliant').length}</p>
              <p className="text-sm text-muted-foreground">Compliant</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{records.filter(r => r.status === 'at_risk').length}</p>
              <p className="text-sm text-muted-foreground">At Risk</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{records.filter(r => r.status === 'non_compliant').length}</p>
              <p className="text-sm text-muted-foreground">Non-Compliant</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{complianceRate}%</p>
              <p className="text-sm text-muted-foreground">Overall Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Records */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {records.map(record => (
              <div key={record.id} className="border rounded-lg p-4 hover:bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{COMPLIANCE_AREAS[record.compliance_area]}</h3>
                    {record.notes && <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>}
                  </div>
                  <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                </div>
                <div className="flex gap-6 mt-3 text-xs text-muted-foreground">
                  {record.deadline && <p>Due: {new Date(record.deadline).toLocaleDateString()}</p>}
                  {record.last_completed && <p>Completed: {new Date(record.last_completed).toLocaleDateString()}</p>}
                  {record.assigned_to && <p>Assigned: {record.assigned_to}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}