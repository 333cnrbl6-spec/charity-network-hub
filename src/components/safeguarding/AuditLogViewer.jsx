import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

export default function AuditLogViewer({ auditTrail = [] }) {
  const [expandedLogs, setExpandedLogs] = useState({});

  const toggleExpand = (index) => {
    setExpandedLogs(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  if (!auditTrail || auditTrail.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Activity Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No audit trail available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Activity Audit Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {auditTrail.map((entry, index) => (
            <div key={index} className="border rounded-lg p-3 hover:bg-accent/50 transition-colors">
              <button
                onClick={() => toggleExpand(index)}
                className="w-full text-left flex items-center justify-between gap-2"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{entry.user || 'System'}</span>
                    <Badge variant="outline" className="text-xs">
                      {entry.action?.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(entry.timestamp), 'PPP p')}
                  </p>
                  {entry.details && (
                    <p className="text-xs mt-1 text-foreground">{entry.details}</p>
                  )}
                </div>
                {expandedLogs[index] ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {expandedLogs[index] && (
                <div className="mt-3 pt-3 border-t bg-muted/30 rounded p-2 text-xs font-mono space-y-2">
                  {entry.previous_value !== undefined && (
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Previous Value:</p>
                      <pre className="whitespace-pre-wrap text-[11px] bg-background p-2 rounded overflow-x-auto">
                        {formatValue(entry.previous_value)}
                      </pre>
                    </div>
                  )}
                  {entry.new_value !== undefined && (
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">New Value:</p>
                      <pre className="whitespace-pre-wrap text-[11px] bg-background p-2 rounded overflow-x-auto">
                        {formatValue(entry.new_value)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}