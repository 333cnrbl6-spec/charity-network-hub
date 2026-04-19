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

  const getActionBadgeColor = (action) => {
    if (action.includes('created') || action.includes('submitted')) return 'bg-green-100 text-green-800';
    if (action.includes('deleted') || action.includes('rejected')) return 'bg-red-100 text-red-800';
    if (action.includes('updated') || action.includes('modified')) return 'bg-blue-100 text-blue-800';
    if (action.includes('notification') || action.includes('alert')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
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
                    <span className="font-medium text-sm">{entry.user_name || entry.user || 'System'}</span>
                    <Badge className={`text-xs ${getActionBadgeColor(entry.action)}`}>
                      {entry.action?.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(entry.timestamp), 'PPP p')}
                  </p>
                  {entry.changed_fields && entry.changed_fields.length > 0 && (
                    <p className="text-xs mt-1 text-amber-700 font-medium">
                      {entry.changed_fields.length} field(s) changed: {entry.changed_fields.join(', ')}
                    </p>
                  )}
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
                <div className="mt-3 pt-3 border-t bg-muted/30 rounded p-2 text-xs space-y-2">
                  {entry.field_changes && Object.keys(entry.field_changes).length > 0 && (
                    <div>
                      <p className="font-medium text-muted-foreground mb-2">Field Changes:</p>
                      {Object.entries(entry.field_changes).map(([field, changes]) => (
                        <div key={field} className="mb-3 p-2 bg-background rounded border-l-2 border-blue-400">
                          <p className="font-semibold text-foreground mb-1">{field.replace(/_/g, ' ')}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground mb-1">Previous:</p>
                              <pre className="whitespace-pre-wrap text-[10px] bg-red-50 p-1 rounded">
                                {formatValue(changes.previous)}
                              </pre>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">New:</p>
                              <pre className="whitespace-pre-wrap text-[10px] bg-green-50 p-1 rounded">
                                {formatValue(changes.new)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  {entry.ip_address && (
                    <p className="text-xs text-muted-foreground pt-2 border-t">IP: {entry.ip_address}</p>
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