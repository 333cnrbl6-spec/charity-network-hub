import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function GrantAIAssistant({ grantId, subscriptionTier }) {
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState(null);

  const canUseProfessional = ['professional', 'enterprise'].includes(subscriptionTier);

  const generateDraft = async () => {
    if (!canUseProfessional) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('generateGrantApplication', { grantId });
      setDraft(response.data.draft);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate application');
    } finally {
      setLoading(false);
    }
  };

  if (!canUseProfessional) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="flex items-center gap-3 py-4">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold">Upgrade to Professional</p>
            <p>AI grant assistant available on Professional and Enterprise plans.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Grant Application Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!draft ? (
          <Button onClick={generateDraft} disabled={loading} className="w-full">
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Generate AI Draft
          </Button>
        ) : (
          <div className="space-y-4">
            {Object.entries(draft).map(([key, value]) => (
              <div key={key}>
                <h4 className="font-semibold capitalize mb-2">{key.replace(/_/g, ' ')}</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{value}</p>
              </div>
            ))}
            <Button onClick={generateDraft} variant="outline" className="w-full">
              Regenerate
            </Button>
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded text-sm">{error}</div>
        )}
      </CardContent>
    </Card>
  );
}