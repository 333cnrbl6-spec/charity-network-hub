import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, TrendingDown, Zap } from 'lucide-react';

const getStatusColor = (status) => {
  switch (status) {
    case 'healthy':
      return 'bg-green-50 border-green-200 text-green-900';
    case 'warning':
      return 'bg-amber-50 border-amber-200 text-amber-900';
    case 'critical':
      return 'bg-red-50 border-red-200 text-red-900';
    default:
      return 'bg-slate-50 border-slate-200';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-amber-600" />;
    case 'critical':
      return <TrendingDown className="w-5 h-5 text-red-600" />;
    default:
      return null;
  }
};

const getScoreColor = (score) => {
  if (score >= 85) return 'text-green-600';
  if (score >= 70) return 'text-amber-600';
  return 'text-red-600';
};

export default function HealthReportViewer() {
  const [selectedReport, setSelectedReport] = useState(null);

  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ['collectiveHealthReports'],
    queryFn: () => base44.entities.CollectiveHealthReport.list('-generated_at', 10),
  });

  const latestReport = reports[0];

  const handleGenerateNow = async () => {
    try {
      await base44.functions.invoke('generateCollectiveHealthReport', {});
      refetch();
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Latest Report Summary */}
      {latestReport && (
        <Card className={`border-2 ${getStatusColor(latestReport.status)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(latestReport.status)}
                  Collective Health Score
                </CardTitle>
                <CardDescription>{latestReport.report_week}</CardDescription>
              </div>
              <Badge variant={latestReport.status === 'healthy' ? 'default' : 'outline'}>
                {latestReport.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <div className={`text-4xl font-bold ${getScoreColor(latestReport.collective_health_score)}`}>
                  {latestReport.collective_health_score}
                </div>
                <p className="text-sm text-muted-foreground mt-1">out of 100</p>
              </div>
              <div className="flex-1 space-y-2">
                {latestReport.flagged_products.length > 0 && (
                  <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                    <p className="text-sm font-semibold text-red-900 mb-1">⚠️ Flagged Products</p>
                    <p className="text-sm text-red-800">{latestReport.flagged_products.join(', ')}</p>
                  </div>
                )}
                {latestReport.recommendations.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-blue-900 mb-2">📋 Recommendations</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      {latestReport.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="flex-shrink-0">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Breakdown */}
      {latestReport && (
        <Card>
          <CardHeader>
            <CardTitle>Product Health Breakdown</CardTitle>
            <CardDescription>Performance metrics for all four SynergyFlow products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestReport.products.map(product => (
                <div 
                  key={product.product_name}
                  className={`rounded-lg border p-4 ${
                    product.flagged ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold">{product.product_name}</h3>
                    {product.flagged && (
                      <Badge variant="destructive" className="text-xs">Flagged</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Parity</span>
                        <span className={`font-semibold ${getScoreColor(product.parity_score)}`}>
                          {product.parity_score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            product.parity_score >= 85 ? 'bg-green-600' :
                            product.parity_score >= 70 ? 'bg-amber-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${product.parity_score}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs border-t pt-2">
                      <div>
                        <p className="text-muted-foreground">Impact</p>
                        <p className="font-semibold">{product.impact_score}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Growth</p>
                        <p className="font-semibold">+{product.growth_rate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Clients</p>
                        <p className="font-semibold">{product.client_count.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {product.flag_reason && (
                    <p className="text-xs text-red-700 mt-3 pt-3 border-t">{product.flag_reason}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action and History */}
      <div className="flex gap-3">
        <Button onClick={handleGenerateNow} className="gap-2">
          <Zap className="w-4 h-4" />
          Generate Report Now
        </Button>
      </div>

      {/* Report History */}
      {reports.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Report History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {reports.map(report => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{report.report_week}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.generated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${getScoreColor(report.collective_health_score)}`}>
                        {report.collective_health_score}
                      </span>
                      {getStatusIcon(report.status)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}