/**
 * ReportBuilder — coordinator/manager tool to compile and send team impact reports
 * Calls the compileManagerReport backend function and lets the user send it by email.
 */
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileBarChart2, Loader2, Send, ChevronDown, ChevronUp, CheckCircle2, Users, Clock, Zap, Gift } from 'lucide-react';

const PERIODS = [
  { value: 'week',  label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
];

export default function ReportBuilder() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [recipientEmail, setRecipientEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [showText, setShowText] = useState(false);
  const [sendState, setSendState] = useState('idle'); // idle | sending | done

  const handleCompile = async () => {
    setLoading(true);
    setReport(null);
    setSendState('idle');
    const payload = { period };
    if (period === 'custom') {
      payload.start_date = startDate;
      payload.end_date = endDate;
    }
    const res = await base44.functions.invoke('compileManagerReport', payload);
    setReport(res.data);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!report || !recipientEmail) return;
    setSendState('sending');
    await base44.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: `Team Impact Report — ${report.period} — ${user?.branch_name || 'Age UK'}`,
      body: report.report_text,
    });
    setSendState('done');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <FileBarChart2 className="w-5 h-5 text-primary" />
        <div>
          <h2 className="font-semibold text-base">Report Builder</h2>
          <p className="text-xs text-muted-foreground">Compile and send team impact reports to your manager</p>
        </div>
      </div>

      {/* Period selector */}
      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  period === p.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {period === 'custom' && (
            <div className="flex gap-3 flex-wrap">
              <div className="space-y-1 flex-1 min-w-[140px]">
                <label className="text-xs font-medium text-muted-foreground">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="space-y-1 flex-1 min-w-[140px]">
                <label className="text-xs font-medium text-muted-foreground">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          )}

          <Button onClick={handleCompile} disabled={loading || (period === 'custom' && (!startDate || !endDate))} className="w-full gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Compiling report…</> : 'Compile Report'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {report && (
        <div className="space-y-4">
          {/* Headline KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: CheckCircle2, label: 'Jobs Completed', value: `${report.headline.jobs_completed}/${report.headline.jobs_total}`, color: 'text-green-600' },
              { icon: Users, label: 'Clients Supported', value: report.headline.clients_supported, color: 'text-primary' },
              { icon: Clock, label: 'Hours Delivered', value: `${report.headline.total_hours}h`, color: 'text-primary' },
              { icon: Gift, label: 'Grant Value', value: `£${report.headline.grant_value_gbp.toLocaleString('en-GB')}`, color: 'text-amber-600' },
            ].map(({ icon: Icon, label, value, color }) => (
              <Card key={label}>
                <CardContent className="pt-4 text-center">
                  <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Staff breakdown */}
          {report.staff_summary.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Staff / Volunteer Activity</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {report.staff_summary.map(s => (
                    <div key={s.name} className="flex items-center gap-3 text-sm">
                      <span className="font-medium w-36 truncate flex-shrink-0">{s.name}</span>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">{s.jobs_completed} jobs</Badge>
                        <Badge variant="outline" className="text-xs">{s.clients_seen} clients</Badge>
                        <Badge variant="outline" className="text-xs">{s.hours}h</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw report text toggle */}
          <Card>
            <CardContent className="pt-4">
              <button
                onClick={() => setShowText(v => !v)}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground w-full"
              >
                {showText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showText ? 'Hide' : 'Preview'} full report text
              </button>
              {showText && (
                <pre className="mt-3 text-xs text-foreground bg-muted/50 rounded-lg p-4 whitespace-pre-wrap overflow-x-auto max-h-72 overflow-y-auto font-mono">
                  {report.report_text}
                </pre>
              )}
            </CardContent>
          </Card>

          {/* Send section */}
          {sendState === 'done' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 text-sm text-green-900">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Report sent to <strong>{recipientEmail}</strong>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Send report to</label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    placeholder="manager@ageuk.org.uk"
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <Button onClick={handleSend} disabled={sendState === 'sending' || !recipientEmail} className="w-full gap-2">
                  {sendState === 'sending'
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                    : <><Send className="w-4 h-4" /> Send to Manager</>
                  }
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}