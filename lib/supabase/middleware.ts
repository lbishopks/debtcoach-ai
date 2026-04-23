import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Simple in-process cache for maintenance mode (30s TTL)
let _maintenanceCache: { value: boolean; ts: number } | null = null
const MAINTENANCE_CACHE_TTL = 30_000

async function getMaintenanceMode(): Promise<boolean> {
  const now = Date.now()
  if (_maintenanceCache && now - _maintenanceCache.ts < MAINTENANCE_CACHE_TTL) {
    return _maintenanceCache.value
  }
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/platform_settings?key=eq.maintenance_mode&select=value`,
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
        cache: 'no-store',
      }
    )
    if (!res.ok) return false
    const [row] = await res.json() as { value: boolean }[]
    const value = row?.value === true
    _maintenanceCache = { value, ts: now }
    return value
  } catch {
    return false
  }
}

// Per-user plan cache (60s TTL) — avoids a DB hit on every request
const _planCache = new Map<string, { plan: string; ts: number }>()
const PLAN_CACHE_TTL = 60_000 // 60 seconds

async function getUserPlan(userId: string, bustCache = false): Promise<string> {
  const now = Date.now()
  if (!bustCache) {
    const cached = _planCache.get(userId)
    if (cached && now - cached.ts < PLAN_CACHE_TTL) return cached.plan
  }
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=plan&limit=1`,
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
        cache: 'no-store',
      }
    )
    const [row] = await res.json() as { plan: string }[]
    const plan = row?.plan || 'free'
    _planCache.set(userId, { plan, ts: now })
    return plan
  } catch {
    return 'free' // fail open — individual API routes still enforce limits
  }
}

function isAdmin(email: string | undefined): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  return !!email && adminEmails.includes(email.toLowerCase())
}

export async function updateSession(request: NextRequest) {
  // Dev bypass — ONLY allowed in local development, never in production
  if (process.env.DEV_BYPASS_AUTH === 'true') {
    if (process.env.NODE_ENV === 'production') {
      // Hard block: this flag must never reach production
      console.error('SECURITY: DEV_BYPASS_AUTH is set in production — blocking all requests')
      return new NextResponse('Forbidden', { status: 403 })
    }
    console.warn('⚠️  DEV_BYPASS_AUTH is enabled — all auth checks skipped. Development only.')
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Maintenance mode — bypass for admins, /maintenance page, /auth routes, and API/static assets
  const isMaintenancePage = pathname === '/maintenance'
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  const isAuthRoute2 = pathname.startsWith('/auth')

  if (!isMaintenancePage && !isAdminRoute && !isAuthRoute2) {
    const maintenance = await getMaintenanceMode()
    if (maintenance && !isAdmin(user?.email)) {
      const url = request.nextUrl.clone()
      url.pathname = '/maintenance'
      return NextResponse.redirect(url)
    }
  }

  const isProtectedRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/letters') ||
    pathname.startsWith('/scripts') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/admin') ||
    pathname === '/subscribe'

  const isAuthRoute = pathname.startsWith('/auth')

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Subscription gate — authenticated users on app routes must have an active plan
  // /subscribe and /admin are exempt; API routes enforce their own limits
  const isSubscribeRoute = pathname === '/subscribe'
  const isApiRoute = pathname.startsWith('/api/')

  if (user && isProtectedRoute && !isSubscribeRoute && !isAdminRoute && !isApiRoute && !isAdmin(user.email)) {
    // Bust cache when coming back from Stripe payment (success redirect includes ?processing=true)
    const bustCache = request.nextUrl.searchParams.has('processing')
    const plan = await getUserPlan(user.id, bustCache)

    if (plan !== 'pro') {
      const url = request.nextUrl.clone()
      url.pathname = '/subscribe'
      // Clear query params to avoid infinite redirect loops
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
