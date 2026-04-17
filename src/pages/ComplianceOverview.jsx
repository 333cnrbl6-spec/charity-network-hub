import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

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

export default function ComplianceOverview() {
  const [user, setUser] = useState(null);
  const [userRegion, setUserRegion] = useState(null);

  React.useEffect(() => {
    const getUser = async () => {
      const me = await base44.auth.me();
      setUser(me);
      
      // Check if user is regional lead
      const regionalLeads = await base44.entities.RegionalLead.filter({
        user_email: me.email
      });
      if (regionalLeads.length > 0) {
        setUserRegion(regionalLeads[0].region);
      }
    };
    getUser();
  }, []);

  const { data: records = [] } = useQuery({
    queryKey: ['compliance-records'],
    queryFn: () => base44.entities.ComplianceRecord.list(),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => base44.entities.BranchConfig.list(),
  });

  const { data: regionalLeads = [] } = useQuery({
    queryKey: ['regional-leads'],
    queryFn: () => base44.entities.RegionalLead.list(),
  });

  // Filter records based on user role
  const filteredRecords = useMemo(() => {
    if (user?.role === 'admin') {
      return records; // Admins see all
    }
    // Regional leads see only their region
    if (userRegion && records) {
      return records.filter(r => {
        const branch = branches.find(b => b.branch_id === r.branch_id);
        return branch; // TODO: Filter by region once branches have region
      });
    }
    return [];
  }, [records, user?.role, userRegion, branches]);

  // Calculate compliance metrics
  const metrics = useMemo(() => {
    const grouped = {};
    filteredRecords.forEach(r => {
      if (!grouped[r.compliance_area]) {
        grouped[r.compliance_area] = { compliant: 0, at_risk: 0, non_compliant: 0, pending: 0 };
      }
      grouped[r.compliance_area][r.status === 'compliant' ? 'compliant' : r.status === 'at_risk' ? 'at_risk' : r.status === 'non_compliant' ? 'non_compliant' : 'pending']++;
    });
    return grouped;
  }, [filteredRecords]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'at_risk': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'non_compliant': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Compliance Management</h1>
        <p className="text-muted-foreground mt-1">
          {user?.role === 'admin' ? 'Network-wide compliance overview' : `${userRegion} region compliance tracking`}
        </p>
      </div>

      {/* Compliance Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(COMPLIANCE_AREAS).map(([key, label]) => {
          const stats = metrics[key] || { compliant: 0, at_risk: 0, non_compliant: 0, pending: 0 };
          const total = stats.compliant + stats.at_risk + stats.non_compliant + stats.pending;
          const complianceRate = total > 0 ? Math.round((stats.compliant / total) * 100) : 0;

          return (
            <Card key={key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-bold">{complianceRate}%</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>✓ {stats.compliant} compliant</p>
                  <p>⚠ {stats.at_risk} at risk</p>
                  <p>✕ {stats.non_compliant} non-compliant</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Branch</th>
                  <th className="text-left py-3 px-4 font-semibold">Area</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Deadline</th>
                  <th className="text-left py-3 px-4 font-semibold">Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(record => (
                  <tr key={record.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{record.branch_name}</td>
                    <td className="py-3 px-4">{COMPLIANCE_AREAS[record.compliance_area]}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {record.deadline ? new Date(record.deadline).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-xs">{record.assigned_to || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}