import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Lightbulb, TrendingUp, AlertTriangle, Target, Loader2, Copy, Check } from 'lucide-react';

export default function AIInsights({ insightType, data }) {
  const [copied, setCopied] = useState(false);

  const { mutate: generateInsights, isPending, data: insights } = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateAIInsights', {
        insightType,
        data
      });
      return response.data;
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseInsights = (text) => {
    const sections = [];
    const lines = text.split('\n');
    let currentSection = null;

    lines.forEach(line => {
      if (line.match(/^\d+\.\s+/)) {
        if (currentSection) sections.push(currentSection);
        const title = line.replace(/^\d+\.\s+/, '').split(':')[0];
        currentSection = {
          title,
          content: [line.replace(/^\d+\.\s+\w+:\s*/, '')]
        };
      } else if (currentSection && line.trim()) {
        currentSection.content.push(line);
      }
    });

    if (currentSection) sections.push(currentSection);
    return sections;
  };

  const getSectionIcon = (title) => {
    if (title.includes('Trend')) return <TrendingUp className="w-5 h-5" />;
    if (title.includes('Risk') || title.includes('Anomal')) return <AlertTriangle className="w-5 h-5" />;
    if (title.includes('Recommend')) return <Target className="w-5 h-5" />;
    return <Lightbulb className="w-5 h-5" />;
  };

  const getSectionColor = (title) => {
    if (title.includes('Risk') || title.includes('Anomal')) return 'bg-red-50 border-red-200';
    if (title.includes('Recommend')) return 'bg-green-50 border-green-200';
    return 'bg-blue-50 border-blue-200';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              AI-Driven Insights & Analysis
            </CardTitle>
            <CardDescription>LLM-powered trend analysis and recommendations</CardDescription>
          </div>
          <Button
            onClick={() => generateInsights()}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4" />
                Generate Insights
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {!insights ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Click "Generate Insights" to analyze data and receive AI recommendations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {parseInsights(insights.analysis).map((section, idx) => (
              <div 
                key={idx}
                className={`rounded-lg border-2 p-4 ${getSectionColor(section.title)}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {getSectionIcon(section.title)}
                  <h3 className="font-semibold text-sm">{section.title}</h3>
                </div>

                <div className="space-y-2">
                  {section.content.map((line, lineIdx) => {
                    if (line.match(/^[-•*]/)) {
                      return (
                        <div key={lineIdx} className="flex gap-2 text-sm">
                          <span className="text-muted-foreground">•</span>
                          <span>{line.replace(/^[-•*]\s*/, '')}</span>
                        </div>
                      );
                    }
                    return line.trim() && (
                      <p key={lineIdx} className="text-sm">{line}</p>
                    );
                  })}
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => copyToClipboard(insights.analysis)}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Analysis
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
              <AlertCircle className="w-3 h-3" />
              <span>Generated at {new Date(insights.generated_at).toLocaleString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}