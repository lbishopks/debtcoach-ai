'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, CreditCard, FileText, BarChart2, MessageSquare,
  Settings, Zap, Menu, X, ChevronRight, LogOut, ArrowLeft
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/billing', label: 'Billing', icon: CreditCard },
  { href: '/admin/letters', label: 'Letters', icon: FileText },
  { href: '/admin/forum', label: 'Forum', icon: MessageSquare },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminShell({ children, userEmail }: { children: React.ReactNode; userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut({ scope: 'global' })
    router.refresh()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-60 bg-navy-100 border-r border-white/8 z-30 flex flex-col
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-navy-200" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-none">DebtCoach AI</div>
              <div className="text-teal-400 text-[10px] font-medium mt-0.5">Admin Panel</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group
                  ${active
                    ? 'bg-teal-400/15 text-teal-400 font-medium'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="w-3 h-3 opacity-50" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: app link + user */}
        <div className="p-3 border-t border-white/8 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to App</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
          <div className="px-3 py-2 text-[11px] text-white/25 truncate">
            {userEmail}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="md:hidden sticky top-0 z-10 bg-[#0a0f1a]/95 backdrop-blur border-b border-white/8 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-white/60 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold text-sm">Admin</span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
