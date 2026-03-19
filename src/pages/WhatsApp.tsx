import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import {
  ShieldCheck,
  Key,
  Lock,
  Smartphone,
  Save,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { Settings } from '../types';

export function WhatsApp() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    user_id: '',
    twilio_mode: 'platform',
    twilio_sid: '',
    twilio_token: '',
    twilio_number: '',
    notifications_enabled: true,
  });

  useEffect(() => {
    fetchSettings();
  }, [user]);

  async function fetchSettings() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSuccess(false);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ ...settings, user_id: user.id, updated_at: new Date().toISOString() });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900">WhatsApp Configuration</h1>
        <p className="text-zinc-500">Choose how you want to connect your WhatsApp numbers.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => setSettings({ ...settings, twilio_mode: 'platform' })}
          className={cn(
            'p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden',
            settings.twilio_mode === 'platform'
              ? 'border-emerald-600 bg-emerald-50/30'
              : 'border-zinc-200 bg-white hover:border-zinc-300'
          )}
        >
          <div className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center mb-4',
            settings.twilio_mode === 'platform' ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-500'
          )}>
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Use WholesaleAI Numbers</h3>
          <p className="text-sm text-zinc-500 mt-2">
            Quick setup using our pre-configured Twilio numbers. Best for small to medium businesses.
          </p>
          <ul className="mt-4 space-y-2">
            {['No Twilio account required', 'Instant activation', 'Managed infrastructure'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-zinc-600">
                <CheckCircle2 size={14} className="text-emerald-600" />
                {f}
              </li>
            ))}
          </ul>
          {settings.twilio_mode === 'platform' && (
            <div className="absolute top-4 right-4 text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
          )}
        </button>

        <button
          onClick={() => setSettings({ ...settings, twilio_mode: 'custom' })}
          className={cn(
            'p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden',
            settings.twilio_mode === 'custom'
              ? 'border-emerald-600 bg-emerald-50/30'
              : 'border-zinc-200 bg-white hover:border-zinc-300'
          )}
        >
          <div className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center mb-4',
            settings.twilio_mode === 'custom' ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-500'
          )}>
            <Smartphone size={24} />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Use Your Own Numbers</h3>
          <p className="text-sm text-zinc-500 mt-2">
            Connect your own Twilio account for full control over numbers and billing.
          </p>
          <ul className="mt-4 space-y-2">
            {['Your own branding', 'Direct Twilio billing', 'Full data ownership'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-zinc-600">
                <CheckCircle2 size={14} className="text-emerald-600" />
                {f}
              </li>
            ))}
          </ul>
          {settings.twilio_mode === 'custom' && (
            <div className="absolute top-4 right-4 text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
          )}
        </button>
      </div>

      {settings.twilio_mode === 'custom' && (
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-4 rounded-2xl text-sm">
            <Info size={20} className="shrink-0" />
            <p>
              Find these in your{' '}
              <a
                href="https://www.twilio.com/console"
                target="_blank"
                rel="noreferrer"
                className="underline font-bold inline-flex items-center gap-1"
              >
                Twilio Console <ExternalLink size={12} />
              </a>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                <Key size={16} className="text-zinc-400" /> Twilio Account SID
              </label>
              <input
                type="text"
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx"
                value={settings.twilio_sid || ''}
                onChange={(e) => setSettings({ ...settings, twilio_sid: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                <Lock size={16} className="text-zinc-400" /> Twilio Auth Token
              </label>
              <input
                type="password"
                placeholder="••••••••••••••••••••••••"
                value={settings.twilio_token || ''}
                onChange={(e) => setSettings({ ...settings, twilio_token: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                <Smartphone size={16} className="text-zinc-400" /> WhatsApp Number
              </label>
              <input
                type="text"
                placeholder="+14155552671"
                value={settings.twilio_number || ''}
                onChange={(e) => setSettings({ ...settings, twilio_number: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Notifications</h3>
            <p className="text-sm text-zinc-500">Get alerted when a lead needs attention.</p>
          </div>
          <button
            onClick={() =>
              setSettings({ ...settings, notifications_enabled: !settings.notifications_enabled })
            }
            className={cn(
              'w-12 h-6 rounded-full transition-colors relative',
              settings.notifications_enabled ? 'bg-emerald-600' : 'bg-zinc-200'
            )}
          >
            <div
              className={cn(
                'absolute top-1 w-4 h-4 bg-white rounded-full transition-all',
                settings.notifications_enabled ? 'left-7' : 'left-1'
              )}
            />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        {success && (
          <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
            <CheckCircle2 size={16} />
            Settings saved successfully
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-100"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
          Save Configuration
        </button>
      </div>
    </div>
  );
}
