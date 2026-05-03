import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { format } from 'date-fns';

export default function LaunchReadinessDashboard() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState(null);

  const runValidation = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('validateLaunchReadiness', {});
      setResults(response.data);
      setLastRun(new Date());
    } catch (error) {
      console.error('Validation failed:', error);
      setResults({ status: 'error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runValidation();
  }, []);

  const CheckItem = ({ name, check, icon: Icon }) => {
    const isPass = check?.status === 'ok' || check?.status === 'passed';
    const isWarning = check?.status === 'warning';
    const isFailed = check?.status === 'failed';

    return (
      <div className="flex items-center gap-4 p-4 border rounded-lg">
        <div className="flex-shrink-0">
          {isPass && <CheckCircle2 className="w-6 h-6 text-green-600" />}
          {isWarning && <AlertTriangle className="w-6 h-6 text-yellow-600" />}
          {isFailed && <AlertCircle className="w-6 h-6 text-red-600" />}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">{check?.error || check?.status || 'Pending'}</p>
        </div>
        <div>
          <Badge variant={isPass ? 'default' : isWarning ? 'secondary' : 'destructive'}>
            {check?.status || 'pending'}
          </Badge>
        </div>
      </div>
    );
  };

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Launch Readiness</h1>
            <p className="text-muted-foreground mt-1">
              Pre-deployment validation checks to ensure system readiness
            </p>
          </div>
          <Button
            onClick={runValidation}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Run Check
          </Button>
        </div>

        {/* Status Summary */}
        <Card className={results.overall_pass ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={results.overall_pass ? 'text-green-900' : 'text-red-900'}>
                {results.overall_pass ? '✓ Ready to Launch' : '✗ Not Ready'}
              </CardTitle>
              <div className="text-right">
                <p className="text-2xl font-bold">{results.overall_pass ? 'PASS' : 'FAIL'}</p>
                <p className="text-sm text-muted-foreground">
                  {lastRun ? format(lastRun, 'MMM d, yyyy HH:mm:ss') : 'Just now'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Checks</p>
                <p className="text-2xl font-bold">{Object.keys(results.checks).length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{results.critical_issues}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Issues</p>
                <p className="text-2xl font-bold text-yellow-600">{results.total_issues}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Checks */}
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold text-foreground">Validation Checks</h2>
          
          <CheckItem
            name="Critical Path Tests"
            check={results.checks.critical_paths}
            icon={Zap}
          />
          
          <CheckItem
            name="Prelaunch Checklist"
            check={results.checks.prelaunch_checklist}
            icon={AlertCircle}
          />
          
          <CheckItem
            name="Data Integrity & Isolation"
            check={results.checks.data_integrity}
            icon={AlertCircle}
          />
          
          <CheckItem
            name="Credit System"
            check={results.checks.credit_system}
            icon={AlertCircle}
          />
          
          <CheckItem
            name="Email Delivery"
            check={results.checks.email_system}
            icon={AlertCircle}
          />
          
          <CheckItem
            name="Security Validation"
            check={results.checks.security_validation}
            icon={AlertCircle}
          />
        </div>

        {/* Issues Found */}
        {results.issues_found && results.issues_found.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-900">Issues Found ({results.issues_found.length})</CardTitle>
              <CardDescription className="text-yellow-800">
                Address these before launching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.issues_found.map((issue, idx) => (
                  <div key={idx} className="flex gap-4 p-3 bg-white rounded border border-yellow-200">
                    <div className="flex-shrink-0">
                      {issue.severity === 'critical' && (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      {issue.severity === 'high' && (
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                      )}
                      {issue.severity === 'medium' && (
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-foreground">{issue.issue}</p>
                      <p className="text-xs text-muted-foreground mt-1">{issue.detail}</p>
                    </div>
                    <Badge variant={issue.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {issue.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Launch Recommendation */}
        <Card>
          <CardHeader>
            <CardTitle>Launch Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.overall_pass ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-900 font-semibold">✓ All systems nominal</p>
                <p className="text-sm text-green-800 mt-1">
                  Your system passes all pre-deployment checks. You're ready to launch with confidence.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-900 font-semibold">✗ Action required before launch</p>
                <p className="text-sm text-red-800 mt-1">
                  Please fix the {results.critical_issues} critical issue(s) before proceeding with launch.
                </p>
              </div>
            )}
            
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">Recommended next steps:</p>
              <ol className="text-sm space-y-2 text-foreground list-decimal list-inside">
                <li>Review all issues above</li>
                <li>Fix critical issues immediately</li>
                <li>Run validation again to confirm</li>
                <li>Schedule launch window</li>
                <li>Notify stakeholders</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}