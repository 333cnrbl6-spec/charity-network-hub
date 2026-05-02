import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';

export default function WhiteLabelPanel({ charityId, charityName, charityTier }) {
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const existing = await base44.entities.WhiteLabelConfig.filter({
          charity_id: charityId
        });

        if (existing.length > 0) {
          setConfig(existing[0]);
        } else {
          setConfig({
            charity_id: charityId,
            org_name: charityName,
            primary_color: '#8b5cf6',
            footer_text: '',
            enable_powered_by: true
          });
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      } finally {
        setLoading(false);
      }
    };

    if (charityTier === 'enterprise') {
      fetchConfig();
    }
  }, [charityId, charityName, charityTier]);

  // Enterprise only feature
  if (charityTier !== 'enterprise') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Enterprise Feature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            White-labeling is available for Enterprise customers only.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Current plan: <strong>{charityTier}</strong>
          </p>
          <Button className="mt-4">Contact Sales</Button>
        </CardContent>
      </Card>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      if (config.id) {
        await base44.entities.WhiteLabelConfig.update(config.id, config);
      } else {
        await base44.entities.WhiteLabelConfig.create(config);
      }
      alert('Configuration saved');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>White-Label Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium mb-2">Primary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={config.primary_color}
                onChange={(e) => setConfig({...config, primary_color: e.target.value})}
                className="h-10 rounded border"
              />
              <Input
                value={config.primary_color}
                onChange={(e) => setConfig({...config, primary_color: e.target.value})}
                placeholder="#8b5cf6"
              />
            </div>
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-medium mb-2">Logo URL</label>
            <Input
              value={config.logo_url || ''}
              onChange={(e) => setConfig({...config, logo_url: e.target.value})}
              placeholder="https://..."
            />
          </div>

          {/* Custom Domain */}
          <div>
            <label className="block text-sm font-medium mb-2">Custom Domain</label>
            <Input
              value={config.custom_domain || ''}
              onChange={(e) => setConfig({...config, custom_domain: e.target.value})}
              placeholder="app.myCharity.org"
            />
          </div>

          {/* Footer Text */}
          <div>
            <label className="block text-sm font-medium mb-2">Footer Text</label>
            <Textarea
              value={config.footer_text || ''}
              onChange={(e) => setConfig({...config, footer_text: e.target.value})}
              placeholder="© 2026 My Charity. All rights reserved."
              className="h-20"
            />
          </div>

          {/* Powered By Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="powered-by"
              checked={config.enable_powered_by}
              onChange={(e) => setConfig({...config, enable_powered_by: e.target.checked})}
              className="w-4 h-4"
            />
            <label htmlFor="powered-by" className="text-sm font-medium">
              Show "Powered by CharityHub" footer
            </label>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 rounded-lg p-4" style={{borderColor: config.primary_color}}>
            <div className="space-y-3">
              <h3 style={{color: config.primary_color}} className="font-bold">{config.org_name}</h3>
              <p className="text-sm text-slate-600">
                {config.footer_text || 'Your custom footer text will appear here'}
              </p>
              {config.enable_powered_by && (
                <p className="text-xs text-slate-500">Powered by CharityHub</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}