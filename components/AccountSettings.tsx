'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { US_STATES, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  User, CreditCard, Shield, CheckCircle, Zap, ExternalLink,
  MessageSquare, FileText, Trash2, AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface PlanLimits {
  messagesLimit: number
  lettersLimit: number
}

interface Props {
  profile: any
  subscription: any
  letterCount: number
  conversationCount: number
  userId: string
  freeLimits: PlanLimits
  proLimits: PlanLimits
}

function fmtLimit(n: number, unit: string): string {
  if (n === -1) return 'Unlimited'
  return `${n}/${unit}`
}

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
]

function AccountSettingsInner({ profile, subscription, letterCount, conversationCount, userId, freeLimits, proLimits }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile')
  const [loading, setLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  // Profile state
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [addressLine1, setAddressLine1] = useState(profile?.address_line1 || '')
  const [addressLine2, setAddressLine2] = useState(profile?.address_line2 || '')
  const [city, setCity] = useState(profile?.city || '')
  const [state, setState] = useState(profile?.state || '')
  const [zipCode, setZipCode] = useState(profile?.zip_code || '')

  // Security state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const successParam = searchParams.get('success')
  useEffect(() => {
    if (successParam) {
      toast.success('🎉 Welcome to Pro! Your account has been upgraded.')
      router.replace('/account?tab=billing')
    }
  }, [successParam])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('users').update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        address_line1: addressLine1.trim() || null,
        address_line2: addressLine2.trim() || null,
        city: city.trim() || null,
        state,
        zip_code: zipCode.trim() || null,
      }).eq('id', userId)
      if (error) throw error
      toast.success('Profile updated!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Password updated!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async (priceType: string) => {
    setCheckoutLoading(priceType)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceType }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error(data.error)
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone.'
    )
    if (!confirmed) return
    const doubleConfirm = confirm('This action is PERMANENT. All debts, letters, and conversations will be deleted. Continue?')
    if (!doubleConfirm) return

    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success('Account deletion requested. Contact support@debtcoachai.com to complete.')
      router.push('/')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const isPro = profile?.plan === 'pro'
  const subEndDate = subscription?.current_period_end ? formatDate(subscription.current_period_end) : null

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="section-header">Account Settings</h1>
        <p className="section-subheader">Manage your profile, billing, and security</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-white/10">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'pb-3 px-1 flex items-center gap-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.id
                  ? 'border-teal-400 text-teal-300'
                  : 'border-transparent text-white/40 hover:text-white/70'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-white font-semibold mb-4">Personal Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Full Legal Name *"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As it appears on your ID"
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 555-5555"
                />
              </div>
              <Input
                label="Email Address"
                value={profile?.email || ''}
                disabled
                hint="Email cannot be changed here."
              />
              <div className="border-t border-white/10 pt-4">
                <p className="text-white/50 text-xs mb-3 flex items-center gap-1.5">
                  <span>📮</span> Mailing Address — used in every dispute letter and credit bureau dispute
                </p>
                <div className="space-y-3">
                  <Input
                    label="Street Address"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="123 Main Street"
                  />
                  <Input
                    label="Apt / Suite / Unit (optional)"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Apt 4B"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <Input
                        label="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Chicago"
                      />
                    </div>
                    <div className="col-span-1">
                      <Select
                        label="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        options={[{ value: '', label: 'State...' }, ...US_STATES.map(s => ({ value: s, label: s }))]}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        label="ZIP Code"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="60601"
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <Button type="submit" loading={loading}>Save Changes</Button>
            </form>
          </div>

          {/* Stats */}
          <div className="card">
            <h2 className="text-white font-semibold mb-4">Your Activity</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <MessageSquare className="w-5 h-5 text-teal-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{conversationCount}</p>
                <p className="text-white/40 text-xs">AI Conversations</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <FileText className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{letterCount}</p>
                <p className="text-white/40 text-xs">Letters Generated</p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card border-red-500/20">
            <h2 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </h2>
            <p className="text-white/50 text-sm mb-4">
              Permanently delete your account and all associated data.
            </p>
            <Button variant="danger" size="sm" onClick={handleDeleteAccount} icon={<Trash2 className="w-4 h-4" />}>
              Delete Account
            </Button>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Current Plan */}
          <div className={cn('card', isPro && 'border-teal-400/30 bg-teal-400/5')}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className={cn('w-5 h-5', isPro ? 'text-teal-400' : 'text-white/40')} />
                  <h2 className="text-white font-semibold">{isPro ? 'Pro Plan' : 'Free Plan'}</h2>
                  {isPro && <span className="badge bg-teal-400/20 text-teal-300">Active</span>}
                </div>
                {subEndDate && (
                  <p className="text-white/40 text-xs mt-1">Renews on {subEndDate}</p>
                )}
              </div>
              {isPro && (
                <Button variant="secondary" size="sm" icon={<ExternalLink className="w-4 h-4" />}
                  onClick={async () => {
                    const res = await fetch('/api/stripe/portal', { method: 'POST' })
                    const data = await res.json()
                    if (data.url) window.location.href = data.url
                  }}>
                  Manage
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: 'AI Messages',
                  free: fmtLimit(freeLimits.messagesLimit, 'mo'),
                  pro: fmtLimit(proLimits.messagesLimit, 'mo'),
                },
                {
                  label: 'Dispute Letters',
                  free: fmtLimit(freeLimits.lettersLimit, 'mo'),
                  pro: fmtLimit(proLimits.lettersLimit, 'mo'),
                },
                { label: 'Script Library', free: 'Basic', pro: 'Full + AI personalized' },
                { label: 'PDF Downloads', free: '✗', pro: '✓' },
              ].map(feat => (
                <div key={feat.label} className="bg-white/5 rounded-xl p-3">
                  <p className="text-white/50 text-xs mb-1">{feat.label}</p>
                  <p className={cn('text-sm font-medium', isPro ? 'text-teal-300' : 'text-white/70')}>
                    {isPro ? feat.pro : feat.free}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Options */}
          {!isPro && (
            <div>
              <h2 className="text-white font-semibold mb-4">Upgrade to Pro</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="card border-teal-400/20 bg-teal-400/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-semibold">Monthly</p>
                    <span className="badge bg-teal-400/20 text-teal-300 text-xs">Most Flexible</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">$9.99<span className="text-white/40 text-base font-normal">/mo</span></p>
                  <p className="text-white/40 text-xs mb-4">Cancel anytime</p>
                  <Button
                    className="w-full"
                    onClick={() => handleCheckout('monthly')}
                    loading={checkoutLoading === 'monthly'}
                  >
                    Upgrade Monthly
                  </Button>
                </div>

                <div className="card border-yellow-500/20 bg-yellow-500/5 relative">
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="bg-yellow-400 text-navy-200 text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-semibold">Annual</p>
                    <span className="badge bg-yellow-500/20 text-yellow-300 text-xs">Save $41/yr</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">$79<span className="text-white/40 text-base font-normal">/yr</span></p>
                  <p className="text-white/40 text-xs mb-4">$6.58/month billed annually</p>
                  <Button
                    className="w-full"
                    onClick={() => handleCheckout('yearly')}
                    loading={checkoutLoading === 'yearly'}
                  >
                    Upgrade Annual
                  </Button>
                </div>
              </div>

              {/* One-time report */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-1">Full AI Debt Analysis Report</h3>
                    <p className="text-white/50 text-xs">One-time PDF report: complete strategy, all scripts, dispute letters for one debt</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-white font-bold">$4.99</p>
                    <p className="text-white/40 text-xs">one-time</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => handleCheckout('report')}
                  loading={checkoutLoading === 'report'}
                >
                  Get Report — $4.99
                </Button>
              </div>
            </div>
          )}

          {isPro && (
            <div className="card">
              <h2 className="text-white font-semibold mb-3">Manage Subscription</h2>
              <p className="text-white/50 text-sm mb-4">
                To cancel, update payment method, or view invoices, use the Stripe billing portal.
              </p>
              <Button
                variant="secondary"
                icon={<ExternalLink className="w-4 h-4" />}
                onClick={async () => {
                  toast.loading('Opening billing portal...')
                  const res = await fetch('/api/stripe/portal', { method: 'POST' })
                  const data = await res.json()
                  if (data.url) window.location.href = data.url
                  toast.dismiss()
                }}
              >
                Open Billing Portal
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="card">
          <h2 className="text-white font-semibold mb-4">Change Password</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" loading={loading}>Update Password</Button>
          </form>
        </div>
      )}
    </div>
  )
}

export function AccountSettings(props: Props) {
  return (
    <Suspense fallback={<div className="p-8 text-white/50">Loading account…</div>}>
      <AccountSettingsInner {...props} />
    </Suspense>
  )
}
