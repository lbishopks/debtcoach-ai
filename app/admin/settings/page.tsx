'use client'
import { useEffect, useState } from 'react'
import { Loader2, Save, CheckCircle, AlertTriangle, Copy, ExternalLink } from 'lucide-react'

type Settings = Record<string, unknown>

const MIGRATION_SQL = `-- Run this in Supabase SQL Editor to enable dynamic settings
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO platform_settings (key, value) VALUES
  ('free_messages_limit', '10'),
  ('free_letters_limit', '3'),
  ('pro_messages_limit', '100'),
  ('pro_letters_limit', '-1'),
  ('maintenance_mode', 'false'),
  ('new_signups_enabled', 'true'),
  ('ai_chat_enabled', 'true'),
  ('letter_generation_enabled', 'true'),
  ('site_name', '"DebtCoach AI"'),
  ('support_email', '""')
ON CONFLICT (key) DO NOTHING;`

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${value ? 'bg-teal-400' : 'bg-white/10'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}

function NumInput({ value, onChange, label, hint }: { value: number; onChange: (v: number) => void; label: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div>
        <div className="text-white/70 text-sm">{label}</div>
        {hint && <div className="text-white/30 text-xs mt-0.5">{hint}</div>}
      </div>
      <input
        type="number"
        value={value === -1 ? '' : value}
        placeholder={value === -1 ? '∞ unlimited' : ''}
        onChange={e => onChange(e.target.value === '' ? -1 : parseInt(e.target.value) || 0)}
        className="w-24 bg-white/6 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm text-right focus:outline-none focus:border-teal-400/50 transition-colors"
      />
    </div>
  )
}

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium
      ${type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'}`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      {msg}
    </div>
  )
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tableExists, setTableExists] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [sqlCopied, setSqlCopied] = useState(false)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        setSettings(d.settings || {})
        setTableExists(d.tableExists !== false)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const set = (key: string, value: unknown) => setSettings(s => ({ ...s, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error('Failed to save')
      showToast('Settings saved', 'success')
    } catch {
      showToast('Failed to save settings', 'error')
    }
    setSaving(false)
  }

  const copySQL = () => {
    navigator.clipboard.writeText(MIGRATION_SQL)
    setSqlCopied(true)
    setTimeout(() => setSqlCopied(false), 2000)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-white/40 text-sm mt-1">Platform configuration and feature controls</p>
        </div>
        {tableExists && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-teal-400 hover:bg-teal-300 text-[#0a0f1a] font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All
          </button>
        )}
      </div>

      {/* Migration notice */}
      {!tableExists && (
        <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-amber-400 font-semibold text-sm">Database table required</h3>
              <p className="text-white/50 text-sm mt-1">
                Run this SQL in your{' '}
                <a href="https://supabase.com/dashboard/project/yubrdlycqjvaqlxoilzp/sql" target="_blank" rel="noopener noreferrer"
                  className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-1">
                  Supabase SQL Editor <ExternalLink className="w-3 h-3" />
                </a>{' '}
                to enable dynamic settings:
              </p>
              <div className="mt-3 relative">
                <pre className="bg-black/30 rounded-lg p-4 text-[11px] text-white/50 overflow-x-auto">{MIGRATION_SQL}</pre>
                <button
                  onClick={copySQL}
                  className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/15 rounded-lg text-white/60 text-xs transition-colors"
                >
                  {sqlCopied ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  {sqlCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform Status */}
      <div className="bg-white/4 border border-white/8 rounded-xl p-5">
        <h2 className="text-white font-semibold text-sm mb-4">Platform Status</h2>
        <div className="space-y-1">
          {[
            { key: 'maintenance_mode', label: 'Maintenance Mode', hint: 'When enabled, the site shows a maintenance page to non-admins', danger: true },
            { key: 'new_signups_enabled', label: 'New Signups Enabled', hint: 'Allow new users to create accounts' },
            { key: 'ai_chat_enabled', label: 'AI Chat Enabled', hint: 'Enable the AI coaching chat feature' },
            { key: 'letter_generation_enabled', label: 'Letter Generation Enabled', hint: 'Allow users to generate dispute letters' },
          ].map(({ key, label, hint, danger }) => (
            <div key={key} className={`flex items-center justify-between py-3 border-b border-white/5 last:border-0 ${danger && settings[key] ? 'bg-red-500/5 -mx-2 px-2 rounded-lg' : ''}`}>
              <div>
                <div className={`text-sm font-medium ${danger && settings[key] ? 'text-red-400' : 'text-white/70'}`}>{label}</div>
                {hint && <div className="text-white/30 text-xs mt-0.5">{hint}</div>}
              </div>
              <Toggle
                value={!!settings[key]}
                onChange={v => set(key, v)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Plan Limits */}
      <div className="bg-white/4 border border-white/8 rounded-xl p-5">
        <h2 className="text-white font-semibold text-sm mb-1">Plan Limits</h2>
        <p className="text-white/30 text-xs mb-4">Set -1 for unlimited. Changes take effect immediately after saving.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2 pb-2 border-b border-white/8">Free Plan</h3>
            <NumInput
              label="AI Messages / month"
              value={Number(settings.free_messages_limit ?? 10)}
              onChange={v => set('free_messages_limit', v)}
            />
            <NumInput
              label="Letters / month"
              value={Number(settings.free_letters_limit ?? 3)}
              onChange={v => set('free_letters_limit', v)}
            />
          </div>
          <div>
            <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2 pb-2 border-b border-white/8">Pro Plan</h3>
            <NumInput
              label="AI Messages / month"
              hint="-1 = unlimited"
              value={Number(settings.pro_messages_limit ?? -1)}
              onChange={v => set('pro_messages_limit', v)}
            />
            <NumInput
              label="Letters / month"
              hint="-1 = unlimited"
              value={Number(settings.pro_letters_limit ?? -1)}
              onChange={v => set('pro_letters_limit', v)}
            />
          </div>
        </div>
      </div>

      {/* Site Config */}
      <div className="bg-white/4 border border-white/8 rounded-xl p-5">
        <h2 className="text-white font-semibold text-sm mb-4">Site Configuration</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-white/40 text-xs font-medium uppercase tracking-wider">Site Name</label>
            <input
              value={String(settings.site_name ?? 'DebtCoach AI')}
              onChange={e => set('site_name', e.target.value)}
              className="w-full bg-white/6 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-400/50 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-white/40 text-xs font-medium uppercase tracking-wider">Support Email</label>
            <input
              value={String(settings.support_email ?? '')}
              onChange={e => set('support_email', e.target.value)}
              className="w-full bg-white/6 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-400/50 transition-colors"
              placeholder="support@example.com"
            />
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white/4 border border-white/8 rounded-xl p-5">
        <h2 className="text-white font-semibold text-sm mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Supabase Dashboard', href: 'https://supabase.com/dashboard/project/yubrdlycqjvaqlxoilzp' },
            { label: 'Stripe Dashboard', href: 'https://dashboard.stripe.com' },
            { label: 'Railway Dashboard', href: 'https://railway.com/project/fa241fac-195e-4098-8798-943293e6aa0c' },
            { label: 'Supabase SQL Editor', href: 'https://supabase.com/dashboard/project/yubrdlycqjvaqlxoilzp/sql' },
            { label: 'Railway Variables', href: 'https://railway.com/project/fa241fac-195e-4098-8798-943293e6aa0c/service/d6460444-83fd-4ac0-85b4-63949062f87f/variables' },
            { label: 'Resend Emails', href: 'https://resend.com/emails' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 bg-white/4 hover:bg-white/8 border border-white/8 rounded-lg text-white/50 hover:text-white text-xs transition-all"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              {label}
            </a>
          ))}
        </div>
      </div>

      {tableExists && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-400 hover:bg-teal-300 text-[#0a0f1a] font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All Settings
          </button>
        </div>
      )}
    </div>
  )
}
