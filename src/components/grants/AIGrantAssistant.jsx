import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Copy, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function AIGrantAssistant({ grant, charityName = 'Age UK Bury', charityNumber = '1080600' }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(null);
  const [expanded, setExpanded] = useState({});

  const generateApplication = async () => {
    setLoading(true);
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an experienced UK charity fundraising professional. Write a compelling grant application for:
Charity: ${charityName} (${charityNumber})
Grant: ${grant.grant_name} from ${grant.funder || 'the funder'}
Amount: £${grant.amount_awarded || 'TBC'}
Project: ${grant.grant_name}
Beneficiaries: Older adults and vulnerable people in the local community
Outcomes: Improved wellbeing, reduced isolation, access to essential support services

Write a complete grant application with all sections.`,
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary: { type: 'string' },
          need_statement: { type: 'string' },
          project_description: { type: 'string' },
          outcomes_impact: { type: 'string' },
          organisation_background: { type: 'string' },
          budget_justification: { type: 'string' },
        },
      },
    });
    setResult(response);
    setLoading(false);
  };

  const copySection = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const sections = result ? [
    { key: 'executive_summary', label: 'Executive Summary', text: result.executive_summary },
    { key: 'need_statement', label: 'Need Statement', text: result.need_statement },
    { key: 'project_description', label: 'Project Description', text: result.project_description },
    { key: 'outcomes_impact', label: 'Outcomes & Impact', text: result.outcomes_impact },
    { key: 'organisation_background', label: 'Organisation Background', text: result.organisation_background },
    { key: 'budget_justification', label: 'Budget Justification', text: result.budget_justification },
  ] : [];

  return (
    <div className="mt-4 space-y-3">
      {!result ? (
        <Button onClick={generateApplication} disabled={loading} className="gap-2 w-full" variant="outline">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-500" />}
          {loading ? 'Generating Application...' : 'AI Draft Application'}
        </Button>
      ) : (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              AI Grant Application Draft
              <Badge className="bg-amber-100 text-amber-800 ml-auto">Ready to use</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sections.map(({ key, label, text }) => (
              <div key={key} className="border border-amber-200 rounded-lg bg-white">
                <button
                  className="w-full flex items-center justify-between p-3 text-left"
                  onClick={() => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))}
                >
                  <span className="font-semibold text-sm">{label}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); copySection(key, text); }}
                      className="p-1 hover:bg-amber-100 rounded"
                    >
                      {copied === key ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>
                    {expanded[key] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {expanded[key] && (
                  <div className="px-3 pb-3 text-sm text-muted-foreground whitespace-pre-wrap border-t border-amber-100 pt-2">
                    {text}
                  </div>
                )}
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setResult(null)} className="w-full text-muted-foreground">
              Regenerate
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}