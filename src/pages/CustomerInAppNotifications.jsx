import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Bell, X, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CustomerInAppNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  const { data: alerts = [] } = useQuery({
    queryKey: ['charityAlerts'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return [];
      const charities = await base44.entities.Charity.filter({
        created_by: user.email
      });
      if (!charities.length) return [];
      
      const allAlerts = await base44.entities.Alert.filter({
        charity_id: charities[0].id,
        is_read: false
      });
      return allAlerts;
    },
    refetchInterval: 30000 // Check every 30 seconds
  });

  const markAsRead = async (alertId) => {
    await base44.entities.Alert.update(alertId, { is_read: true });
  };

  const getIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Notification Bell Icon */}
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowPanel(!showPanel)}
          className="relative rounded-full"
        >
          <Bell className="w-5 h-5" />
          {alerts.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {alerts.length}
            </span>
          )}
        </Button>

        {/* Notification Panel */}
        {showPanel && (
          <div className="absolute bottom-12 right-0 w-96 bg-white border rounded-lg shadow-2xl p-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Notifications</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPanel(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                All caught up! ✓
              </p>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 border rounded-lg ${getSeverityClass(alert.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getIcon(alert.severity)}
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{alert.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {alert.description}
                        </p>
                        <button
                          onClick={() => markAsRead(alert.id)}
                          className="text-xs text-primary mt-2 hover:underline"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast-style notifications for new critical alerts */}
      {alerts
        .filter((a) => a.severity === 'critical')
        .map((alert) => (
          <div
            key={alert.id}
            className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3 w-80 animate-pulse"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-red-800">{alert.title}</p>
                <p className="text-xs text-red-600 mt-1">{alert.description}</p>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}