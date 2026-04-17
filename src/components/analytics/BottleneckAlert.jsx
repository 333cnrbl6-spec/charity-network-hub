import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

export default function BottleneckAlert({ bottlenecks }) {
  if (bottlenecks.length === 0) return null;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          Bottleneck Alert
        </CardTitle>
        <CardDescription>Tasks stuck in workflow requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bottlenecks.map((bottleneck, idx) => (
            <div key={idx} className="p-3 bg-white rounded border border-red-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{bottleneck.title}</h4>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {bottleneck.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      #{bottleneck.channel}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-red-100 text-red-800">
                    {bottleneck.daysStuck} days
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    {bottleneck.priority} priority
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}