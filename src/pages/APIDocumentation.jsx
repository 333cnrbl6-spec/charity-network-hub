import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Lock } from 'lucide-react';

export default function APIDocumentation() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">CharityHub API</h1>
        <p className="text-muted-foreground">Enterprise feature for custom integrations</p>
      </div>

      {/* Access Tier */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Enterprise Only
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">This API is available for Enterprise customers only.</p>
          <p className="text-sm text-muted-foreground mt-2">Contact sales@charityhub.com for API access</p>
        </CardContent>
      </Card>

      {/* Base URL */}
      <Card>
        <CardHeader>
          <CardTitle>Base URL</CardTitle>
        </CardHeader>
        <CardContent>
          <code className="bg-slate-900 text-slate-100 p-3 rounded-lg block text-sm">
            https://api.charityhub.co.uk/v1
          </code>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Bearer Token</p>
            <code className="bg-slate-100 text-slate-900 p-2 rounded text-xs block mb-2">
              Authorization: Bearer YOUR_API_KEY
            </code>
            <p className="text-sm text-muted-foreground">Get your API key from Settings → API Keys</p>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Available Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Donors */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge>GET</Badge>
              <code className="text-sm">/donors</code>
            </div>
            <p className="text-sm text-muted-foreground">List all donors for your charity</p>
            <code className="bg-slate-100 p-2 rounded-lg block text-xs mt-2">
              curl -H "Authorization: Bearer API_KEY" https://api.charityhub.co.uk/v1/donors
            </code>
          </div>

          {/* Donations */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge>GET</Badge>
              <code className="text-sm">/donations</code>
            </div>
            <p className="text-sm text-muted-foreground">List all donations</p>
          </div>

          {/* Campaigns */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge>GET</Badge>
              <code className="text-sm">/campaigns</code>
            </div>
            <p className="text-sm text-muted-foreground">List all campaigns</p>
          </div>

          {/* Create Donation */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">POST</Badge>
              <code className="text-sm">/donations</code>
            </div>
            <p className="text-sm text-muted-foreground">Create a new donation record</p>
            <code className="bg-slate-100 p-2 rounded-lg block text-xs mt-2 overflow-x-auto">
{`{
  "donor_id": "donor-123",
  "amount": 50,
  "payment_method": "card",
  "campaign_id": "campaign-456"
}`}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Requests per minute:</span>
              <span className="font-medium">1000</span>
            </div>
            <div className="flex justify-between">
              <span>Requests per day:</span>
              <span className="font-medium">100,000</span>
            </div>
            <p className="text-muted-foreground mt-3">Contact support for higher limits</p>
          </div>
        </CardContent>
      </Card>

      {/* Status Codes */}
      <Card>
        <CardHeader>
          <CardTitle>Response Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex gap-4">
              <span className="font-mono font-medium min-w-16">200</span>
              <span>Success</span>
            </div>
            <div className="flex gap-4">
              <span className="font-mono font-medium min-w-16">400</span>
              <span>Bad request</span>
            </div>
            <div className="flex gap-4">
              <span className="font-mono font-medium min-w-16">401</span>
              <span>Unauthorized</span>
            </div>
            <div className="flex gap-4">
              <span className="font-mono font-medium min-w-16">429</span>
              <span>Rate limit exceeded</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-3">API support is available for Enterprise customers</p>
          <div className="space-y-2 text-sm">
            <p>📧 <a href="mailto:api@charityhub.com" className="text-primary hover:underline">api@charityhub.com</a></p>
            <p>💬 <a href="#" className="text-primary hover:underline">Slack integration channel</a></p>
            <p>📚 <a href="#" className="text-primary hover:underline">Full API docs</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}