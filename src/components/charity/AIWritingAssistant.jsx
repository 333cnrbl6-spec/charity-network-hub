import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, RefreshCw, AlertCircle, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Generic AI writing assistant.
 * mode: 'grant' | 'thank_you' | 'campaign' | 'impact'
 */
export default function AIWritingAssistant({ mode, data, charity, subscriptionTier }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(null);

  const isPro = ['professional', 'enterprise'].includes(subscriptionTier);

  const prompts = {
    grant: {
      label: 'AI Draft Application',
      icon: Sparkles,
      build: () => ({
        prompt: `You are an experienced UK charity fundraising professional with 15 years of grant writing experience. Write a compelling grant application for:
Charity: ${charity?.name} (registered number: ${charity?.charity_number})
Grant: ${data?.grant_name} from ${data?.funder_name}
Amount requested: £${data?.amount}
Project title: ${data?.project_title || data?.grant_name}
Project description: ${data?.project_description || ''}
Target beneficiaries: ${data?.beneficiaries || ''}
Intended outcomes: ${data?.outcomes || ''}
Write in formal but accessible UK English. Include: Executive Summary, Statement of Need, Project Description, Outcomes & Impact Measurement, Organisation Background & Track Record, Budget Justification.`,
        schema: {
          type: 'object',
          properties: {
            executive_summary: { type: 'string' },
            need_statement: { type: 'string' },
            project_description: { type: 'string' },
            outcomes_impact: { type: 'string' },
            organisation_background: { type: 'string' },
            budget_justification: { type: 'string' }
          }
        }
      })
    },
    thank_you: {
      label: 'Generate Thank You Letter',
      icon: Sparkles,
      build: () => ({
        prompt: `You are a charity communications professional. Write a warm, heartfelt thank you letter from ${charity?.name} to donor ${data?.donor_name} for their donation of £${data?.amount} made on ${new Date(data?.donation_date).toLocaleDateString('en-GB')}. ${data?.campaign_id ? 'This donation supported our campaign.' : ''} Make it personal, genuine and impactful. Mention the real difference this contribution will make. Write in UK English. Keep it to 3 paragraphs.`,
        schema: {
          type: 'object',
          properties: {
            subject: { type: 'string' },
            salutation: { type: 'string' },
            body_paragraph_1: { type: 'string' },
            body_paragraph_2: { type: 'string' },
            closing_paragraph: { type: 'string' },
            sign_off: { type: 'string' }
          }
        }
      })
    },
    campaign: {
      label: 'Draft Campaign Description',
      icon: Sparkles,
      build: () => ({
        prompt: `You are a UK charity digital fundraising specialist. Write a compelling, emotionally engaging campaign description for: Charity: ${charity?.name}, Campaign: "${data?.title}", Goal: £${data?.goal_amount}, Campaign period: ${data?.start_date ? new Date(data.start_date).toLocaleDateString('en-GB') : 'TBC'} to ${data?.end_date ? new Date(data.end_date).toLocaleDateString('en-GB') : 'TBC'}. Write in UK English. Include a powerful opening, impact statement, call to action, and a thank you sentence.`,
        schema: {
          type: 'object',
          properties: {
            headline: { type: 'string' },
            opening: { type: 'string' },
            impact_statement: { type: 'string' },
            call_to_action: { type: 'string' },
            thank_you: { type: 'string' }
          }
        }
      })
    },
    impact: {
      label: 'Write Impact Report Section',
      icon: Sparkles,
      build: () => ({
        prompt: `You are a UK charity impact reporting specialist. Write a compelling impact report section for ${charity?.name} (registered charity ${charity?.charity_number}). Charity cause area: ${charity?.cause_area}. Annual income: £${charity?.annual_income?.toLocaleString() || 'undisclosed'}. Team size: ${charity?.team_size || 'unknown'}. Write in formal UK English suitable for trustees, funders and the Charity Commission. Include: Key Achievements, Beneficiary Stories framework, Financial Summary narrative, Forward Look.`,
        schema: {
          type: 'object',
          properties: {
            key_achievements: { type: 'string' },
            beneficiary_impact: { type: 'string' },
            financial_narrative: { type: 'string' },
            forward_look: { type: 'string' }
          }
        }
      })
    }
  };

  const config = prompts[mode];

  const generate = async () => {
    if (!isPro) return;
    setLoading(true);
    setResult(null);
    const { prompt, schema } = config.build();
    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });
    setResult(res);
    setLoading(false);
  };

  const copySection = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isPro) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-center gap-3 py-4">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold">Professional plan required</p>
            <p>AI writing tools are available on Professional (£79/mo) and Enterprise plans. <a href="/charity-pricing" className="underline">Upgrade now</a> or <a href="#" className="underline">apply for a charity discount</a>.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="w-4 h-4 text-purple-600" />
          {config.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result ? (
          <Button onClick={generate} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />{config.label}</>}
          </Button>
        ) : (
          <div className="space-y-4">
            {Object.entries(result).map(([key, value]) => (
              <div key={key} className="group">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold capitalize text-gray-700">{key.replace(/_/g, ' ')}</h4>
                  <button onClick={() => copySection(key, value)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600">
                    {copied === key ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border leading-relaxed">{value}</p>
              </div>
            ))}
            <Button onClick={generate} disabled={loading} variant="outline" className="w-full gap-2">
              <RefreshCw className="w-4 h-4" /> Regenerate
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}