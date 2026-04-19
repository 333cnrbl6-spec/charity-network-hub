import React, { useState } from 'react';
import { Banknote, CheckCircle2, AlertCircle, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useGrants, useClients } from '@/hooks/useEntityQueries';

export default function GiftAidEligibilityChecker() {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState(null);
  const { data: grants = [] } = useGrants();
  const { data: clients = [] } = useClients();

  const checkGiftAidEligibility = async () => {
    setChecking(true);
    try {
      const { data } = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `You are a UK tax compliance expert specialising in Gift Aid for charities.

Analyse these grants and clients for Gift Aid eligibility:
Grants: ${JSON.stringify(grants)}
Clients: ${JSON.stringify(clients)}

For each grant/donation, assess:
1. Donor Type — Individual, Company, Trust (only UK taxpayers eligible)
2. Gift Aid Declaration — Valid declaration on file?
3. Tax Paid — Has donor paid enough UK income/capital gains tax?
4. Minimum Donation — Is it worth processing (minimum £1 recommended)?
5. Compliance Flags — Any issues (non-UK donor, insufficient tax, invalid declaration)?

Calculate:
- Total eligible for Gift Aid
- Potential Gift Aid value (25% of eligible donations)
- Missing declarations count
- Action items for maximising Gift Aid claims

Output structured JSON for Gift Aid reporting.`,
        response_json_schema: {
          type: 'object',
          properties: {
            total_grants_analysed: { type: 'number' },
            eligible_count: { type: 'number' },
            eligible_amount: { type: 'number' },
            potential_gift_aid: { type: 'number' },
            missing_declarations: { type: 'number' },
            ineligible_count: { type: 'number' },
            ineligible_reasons: { type: 'array', items: { type: 'string' } },
            grants: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  grant_id: { type: 'string' },
                  grant_name: { type: 'string' },
                  amount: { type: 'number' },
                  eligible: { type: 'boolean' },
                  reason: { type: 'string' },
                  gift_aid_value: { type: 'number' },
                  action_required: { type: 'string' },
                },
                required: ['grant_id', 'grant_name', 'amount', 'eligible'],
              },
            },
            recommendations: { type: 'array', items: { type: 'string' } },
          },
          required: ['total_grants_analysed', 'eligible_count', 'potential_gift_aid'],
        },
      });

      setResults(data);
      toast.success('Gift Aid eligibility check complete', {
        description: `£${data.potential_gift_aid.toLocaleString()} potential Gift Aid`,
      });
    } catch (error) {
      console.error('Gift Aid check failed:', error);
      toast.error('Check failed', { description: error.message });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="w-5 h-5 text-green-600" />
          Gift Aid Eligibility Checker
        </CardTitle>
        <CardDescription>HMRC-compliant Gift Aid assessment — maximise tax reclaims on eligible donations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={checkGiftAidEligibility} disabled={checking} className="w-full">
          {checking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Checking HMRC Eligibility...
            </>
          ) : (
            'Run Gift Aid Eligibility Assessment'
          )}
        </Button>

        {results && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="border rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Grants Analysed</p>
                <p className="text-2xl font-bold">{results.total_grants_analysed}</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Eligible</p>
                <p className="text-2xl font-bold text-green-600">{results.eligible_count}</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Potential Gift Aid</p>
                <p className="text-2xl font-bold text-green-600">£{results.potential_gift_aid.toLocaleString()}</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Missing Declarations</p>
                <p className="text-2xl font-bold text-orange-600">{results.missing_declarations}</p>
              </div>
            </div>

            {/* Recommendations */}
            {results.recommendations?.length > 0 && (
              <div className="border rounded-lg p-4 bg-green-50">
                <p className="font-semibold text-green-900 text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Recommendations to Maximise Gift Aid
                </p>
                <ul className="text-xs space-y-1 list-disc list-inside text-green-800">
                  {results.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Grant Breakdown */}
            {results.grants?.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Grant-by-Grant Analysis</p>
                <div className="max-h-64 overflow-auto space-y-2">
                  {results.grants.map((g) => (
                    <div key={g.grant_id} className="border rounded-lg p-3 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{g.grant_name}</p>
                        <p className="text-xs text-muted-foreground">
                          £{g.amount.toLocaleString()} • {g.eligible ? 'Eligible' : 'Not Eligible'}
                        </p>
                        {!g.eligible && g.reason && (
                          <p className="text-xs text-orange-600 mt-1">{g.reason}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {g.eligible && g.gift_aid_value > 0 && (
                          <p className="text-sm font-bold text-green-600">+£{g.gift_aid_value}</p>
                        )}
                        <Badge variant={g.eligible ? 'default' : 'outline'} className="mt-1">
                          {g.eligible ? '✓' : '✗'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export */}
            <Button variant="outline" className="w-full gap-2">
              <FileText className="w-4 h-4" />
              Export Gift Aid Report for HMRC
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}