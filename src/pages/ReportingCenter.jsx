import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Settings, Download, Calendar } from 'lucide-react';
import ReportScheduleManager from '@/components/reporting/ReportScheduleManager';

export default function ReportingCenter() {
  const { user } = useAuth();
  const [charity, setCharity] = useState(null);
  const [activeTab, setActiveTab] = useState('schedule');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadCharity = async () => {
      try {
        const charities = await base44.entities.Charity.filter({
          created_by: user?.email
        }, '-created_date', 1);
        if (charities && charities.length > 0) {
          setCharity(charities[0]);
        }
      } catch (error) {
        console.error('Failed to load charity:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      loadCharity();
    }
  }, [user?.email]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-900">No charity found. Please create a charity first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reporting Center</h1>
          <p className="text-muted-foreground mt-1">
            Manage and schedule monthly impact reports for {charity.name}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:border-primary transition" onClick={() => setActiveTab('schedule')}>
            <CardHeader>
              <Calendar className="w-6 h-6 text-primary mb-2" />
              <CardTitle className="text-base">Schedule Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Set up automatic monthly distribution</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition" onClick={() => setActiveTab('generate')}>
            <CardHeader>
              <Download className="w-6 h-6 text-primary mb-2" />
              <CardTitle className="text-base">Generate Now</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Create an impact report on demand</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition" onClick={() => setActiveTab('history')}>
            <CardHeader>
              <FileText className="w-6 h-6 text-primary mb-2" />
              <CardTitle className="text-base">Report History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View previously generated reports</p>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'schedule' && (
            <ReportScheduleManager charityId={charity.id} />
          )}

          {activeTab === 'generate' && (
            <Card>
              <CardHeader>
                <CardTitle>Generate Impact Report</CardTitle>
                <CardDescription>
                  Create a custom impact report for any time period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded p-4 text-center">
                  <p className="text-blue-900">
                    Use the "Generate Now" button in the Schedule tab to create a report for the current month.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'history' && (
            <Card>
              <CardHeader>
                <CardTitle>Report History</CardTitle>
                <CardDescription>
                  Previously sent and generated reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 border border-slate-200 rounded p-4 text-center text-muted-foreground">
                  <p>Reports will appear here once they are generated and sent.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}