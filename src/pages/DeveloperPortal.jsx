import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/lib/PermissionContext';
import { AlertCircle, Code2, Settings, BarChart3 } from 'lucide-react';

export default function DeveloperPortal() {
  const permissions = usePermissions();
  const DEVELOPER_EMAIL = '333cnrbl6@gmail.com';
  const isDeveloper = permissions.email === DEVELOPER_EMAIL;

  if (!isDeveloper) {
    return (
      <div className="min-h-screen bg-red-50 p-6 flex items-center justify-center">
        <Card className="max-w-md border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="w-6 h-6" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-800">
              This portal is restricted to authorized developers only.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tools = [
    {
      icon: Code2,
      title: 'API Documentation',
      description: 'Manage and view API integrations',
      coming: false
    },
    {
      icon: Settings,
      title: 'System Configuration',
      description: 'Advanced platform settings and configuration',
      coming: true
    },
    {
      icon: BarChart3,
      title: 'Metrics & Monitoring',
      description: 'View platform metrics and system health',
      coming: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Developer Portal</h1>
          <p className="text-slate-600 mt-2">Admin and developer tools for CharityHub</p>
        </div>

        <Card className="border-2 border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="text-indigo-900">Welcome, Developer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-indigo-800">
              You have full access to platform administration, system configuration, and advanced tools.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {tools.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Icon className="w-6 h-6 text-indigo-600" />
                    {tool.coming && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <CardTitle className="mt-2">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{tool.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data Isolation & Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-slate-900 mb-2">Current Status</p>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>✓ Permission context active</li>
                <li>✓ Tier-based feature gating enabled</li>
                <li>✓ Data isolation enforced</li>
                <li>✓ Developer access verified</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}