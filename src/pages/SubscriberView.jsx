import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/lib/PermissionContext';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock } from 'lucide-react';

export default function SubscriberView() {
  const { tier, modules, email, loading } = usePermissions();
  const [data, setData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // TODO: Call backend function that loads ONLY current user's subscription data
      // const response = await base44.functions.invoke('loadCurrentUserSubscription', {});
      // setData(response.data);
      
      setData({
        tier,
        email,
        charities: 1,
        volunteers: 5,
        clients: 12,
      });
    } catch (err) {
      console.error('Failed to load subscription:', err);
    }
  };

  const allModules = {
    'dashboard': 'Dashboard',
    'charities': 'Charity Management',
    'volunteers': 'Volunteer Management',
    'clients': 'Client Management',
    'reporting': 'Advanced Reporting',
    'analytics': 'Analytics & Insights',
    'compliance': 'Compliance Hub',
    'api': 'API Access',
    'integrations': 'Third-party Integrations',
    'advanced_admin': 'Advanced Admin Tools'
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Subscription</h1>
          <p className="text-slate-600 mt-2">Account: {email}</p>
        </div>

        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl capitalize">{tier} Plan</CardTitle>
              <Badge>Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {data && (
              <>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-semibold">Charities</p>
                    <p className="text-2xl font-bold text-blue-900">{data.charities}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-semibold">Volunteers</p>
                    <p className="text-2xl font-bold text-green-900">{data.volunteers}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 font-semibold">Clients</p>
                    <p className="text-2xl font-bold text-purple-900">{data.clients}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Your Modules</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(allModules).map(([key, label]) => (
                      <div 
                        key={key}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          modules.includes(key) 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {modules.includes(key) ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={modules.includes(key) ? 'text-slate-900' : 'text-slate-500'}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}