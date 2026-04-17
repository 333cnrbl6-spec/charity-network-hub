import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, CheckCircle2, Shield, TrendingDown } from 'lucide-react';

export default function RiskScorecardViewer() {
  const [expandedProduct, setExpandedProduct] = useState(null);

  const { data: scorecards = [], isLoading } = useQuery({
    queryKey: ['governanceRiskScorecards'],
    queryFn: () => base44.entities.GovernanceRiskScorecard.list('-generated_at', 10),
    refetchInterval: 300000 // 5 minutes
  });

  const latestScorecard = scorecards[0];

  const getRiskColor = (score) => {
    if (score >= 70) return 'bg-red-50 border-red-200';
    if (score >= 50) return 'bg-orange-50 border-orange-200';
    if (score >= 30) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'low':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      default:
        return null;
    }
  };

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
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
      {latestScorecard ? (
        <>
          {/* Overall Risk Summary */}
          <Card className={`border-2 ${getRiskColor(latestScorecard.overall_risk_score)}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6" />
                  <div>
                    <CardTitle>Governance Risk Scorecard</CardTitle>
                    <CardDescription>{latestScorecard.scan_week}</CardDescription>
                  </div>
                </div>
                <Badge className="text-lg px-3 py-1" variant={
                  latestScorecard.risk_level === 'low' ? 'default' :
                  latestScorecard.risk_level === 'critical' ? 'destructive' : 'outline'
                }>
                  {latestScorecard.risk_level.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Risk Score */}
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-4xl font-bold">{latestScorecard.overall_risk_score}</div>
                  <p className="text-sm text-muted-foreground">Risk Score (0-100)</p>
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Policy Coverage</span>
                      <span className="font-semibold">{latestScorecard.policy_coverage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${latestScorecard.policy_coverage}%` }}
                      />
                    </div>
                  </div>

                  {latestScorecard.critical_violations.length > 0 && (
                    <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      {latestScorecard.critical_violations.length} Critical Violations
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critical Violations */}
          {latestScorecard.critical_violations.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Issues Requiring Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {latestScorecard.critical_violations.map((violation, idx) => (
                    <li key={idx} className="flex gap-2 text-red-800 text-sm">
                      <span className="flex-shrink-0">•</span>
                      <span>{violation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Product Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Product Risk Assessment
              </CardTitle>
              <CardDescription>Per-product governance compliance status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {latestScorecard.products_assessed.map(product => (
                  <div key={product.product_name}>
                    <button
                      onClick={() => setExpandedProduct(
                        expandedProduct === product.product_name ? null : product.product_name
                      )}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${getRiskColor(product.risk_score)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {product.compliant ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            getRiskIcon('high')
                          )}
                          <h3 className="font-semibold">{product.product_name}</h3>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold">{product.risk_score}%</p>
                            <p className="text-xs text-muted-foreground">Risk Score</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold">{product.violations?.length || 0}</p>
                            <p className="text-xs text-muted-foreground">Violations</p>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Violations */}
                    {expandedProduct === product.product_name && product.violations?.length > 0 && (
                      <div className="mt-2 ml-4 space-y-2 border-l-2 border-muted pl-4">
                        {product.violations.map((violation, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`text-xs border ${getSeverityBadgeColor(violation.severity)}`}>
                                {violation.severity}
                              </Badge>
                              <span className="font-medium text-xs">{violation.policy_name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground ml-20">{violation.finding}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mitigation Recommendations */}
          {latestScorecard.mitigation_recommendations?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Mitigation Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {latestScorecard.mitigation_recommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 text-primary">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Scorecard History */}
          {scorecards.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Scorecard History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {scorecards.map(card => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{card.scan_week}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(card.generated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm">{card.overall_risk_score}</span>
                        {getRiskIcon(card.risk_level)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-30" />
            <p className="text-muted-foreground">No governance risk scorecards available yet</p>
            <p className="text-sm text-muted-foreground mt-1">Weekly scans run every Monday at 8am</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}