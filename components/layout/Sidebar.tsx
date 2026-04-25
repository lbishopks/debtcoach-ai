'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, MessageSquare, FileText, BookOpen,
  Shield, Settings, LogOut, Zap, Menu, X, CreditCard,
  Brain, Building2, Calculator, Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Research Assistant', icon: MessageSquare },
  { href: '/letters', label: 'Dispute Letters', icon: FileText },
  { href: '/scripts', label: 'Script Library', icon: BookOpen },
  { href: '/rights', label: 'Know Your Rights', icon: Shield },
  { href: '/situation', label: 'Situation Analyzer', icon: Brain },
  { href: '/dispute', label: 'Bureau Disputes', icon: Building2 },
  { href: '/tools', label: 'Debt Tools', icon: Calculator },
  { href: '/forum', label: 'Community Forum', icon: Users },
]

const bottomItems = [
  { href: '/account', label: 'Account', icon: Settings },
]

interface SidebarProps {
  plan?: string
}

export function Sidebar({ plan = 'free' }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut({ scope: 'global' })
    router.refresh()
    router.push('/')
  }

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="px-4 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-400 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-navy-200" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-tight">DebtCoach AI</h1>
            <p className="text-white/40 text-xs">Debt Negotiation Assistant</p>
          </div>
        </div>
      </div>

      {/* Plan Badge */}
      <div className="px-4 py-3">
        <div className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold',
          plan === 'pro'
            ? 'bg-teal-400/20 text-teal-300 border border-teal-400/20'
            : 'bg-white/5 text-white/50 border border-white/10'
        )}>
          <CreditCard className="w-3.5 h-3.5" />
          {plan === 'pro' ? '✦ Pro Plan' : 'Free Plan'}
          {plan === 'free' && (
            <Link href="/account?tab=billing" className="ml-auto text-teal-400 hover:text-teal-300">
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-teal-400/15 text-teal-300 border border-teal-400/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {item.href === '/chat' && (
                  <span className="ml-auto text-xs bg-teal-400/20 text-teal-300 px-1.5 py-0.5 rounded-md">Web</span>
                )}
                {item.href === '/forum' && (
                  <span className="ml-auto text-xs bg-purple-400/20 text-purple-300 px-1.5 py-0.5 rounded-md">Pro</span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Nav */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-teal-400/15 text-teal-300'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150 w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-navy-200/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-teal-400 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-navy-200" />
          </div>
          <span className="font-bold text-white text-sm">DebtCoach AI</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white/60 hover:text-white p-1">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={cn(
        'md:hidden fixed top-0 left-0 bottom-0 z-40 w-64 bg-navy-100 border-r border-white/10 flex flex-col transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <NavContent />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-col fixed top-0 left-0 bottom-0 bg-navy-100 border-r border-white/10 z-20">
        <NavContent />
      </aside>
    </>
  )
}
