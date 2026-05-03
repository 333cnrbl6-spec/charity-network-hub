import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RiskScoreCard({ score, branch, onClick }) {
  if (!score) return null;

  const getRiskColor = (level) => {
    switch (level) {
      case 'critical':
        return 'bg-red-50 border-red-300 hover:border-red-500';
      case 'high':
        return 'bg-orange-50 border-orange-300 hover:border-orange-500';
      case 'medium':
        return 'bg-yellow-50 border-yellow-300 hover:border-yellow-500';
      default:
        return 'bg-green-50 border-green-300 hover:border-green-500';
    }
  };

  const getRiskBadgeColor = (level) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all border-2',
        getRiskColor(score.overall_risk_level)
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{branch?.branch_name || 'Branch'}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date(score.last_calculated).toLocaleDateString()}
            </p>
          </div>
          {getRiskIcon(score.overall_risk_level)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Risk Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Risk</span>
            <Badge className={getRiskBadgeColor(score.overall_risk_level)}>
              {score.overall_risk_level.toUpperCase()}
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full',
                score.overall_risk_level === 'critical' ? 'bg-red-600' :
                score.overall_risk_level === 'high' ? 'bg-orange-500' :
                score.overall_risk_level === 'medium' ? 'bg-yellow-500' :
                'bg-green-600'
              )}
              style={{ width: `${score.overall_risk_score}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {score.overall_risk_score}/100
          </p>
        </div>

        {/* Component Scores */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">DBS</p>
            <p className="text-lg font-bold text-slate-900">{score.dbs_risk_score || 0}</p>
            {score.dbs_expired_count > 0 && (
              <p className="text-xs text-red-600 font-semibold">{score.dbs_expired_count} expired</p>
            )}
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Training</p>
            <p className="text-lg font-bold text-slate-900">{score.training_risk_score || 0}</p>
            {score.training_expired_count > 0 && (
              <p className="text-xs text-red-600 font-semibold">{score.training_expired_count} expired</p>
            )}
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Incidents</p>
            <p className="text-lg font-bold text-slate-900">{score.incident_risk_score || 0}</p>
            {score.incidents_last_30_days > 0 && (
              <p className="text-xs text-orange-600 font-semibold">{score.incidents_last_30_days} recent</p>
            )}
          </div>
        </div>

        {/* Critical Issues */}
        {(score.dbs_expired_count > 0 || score.training_expired_count > 0 || score.high_priority_incidents > 0) && (
          <div className="bg-red-100 border border-red-300 rounded p-2 mt-3">
            <p className="text-xs font-semibold text-red-800">⚠️ Immediate Action Required</p>
            {score.dbs_expired_count > 0 && (
              <p className="text-xs text-red-700 mt-1">• {score.dbs_expired_count} expired DBS</p>
            )}
            {score.training_expired_count > 0 && (
              <p className="text-xs text-red-700">• {score.training_expired_count} expired training</p>
            )}
            {score.high_priority_incidents > 0 && (
              <p className="text-xs text-red-700">• {score.high_priority_incidents} unresolved high-priority incidents</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}