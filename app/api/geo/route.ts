import { NextRequest, NextResponse } from 'next/server'
import { getClientIp } from '@/lib/rate-limit'

// Simple in-process cache — avoids hammering ipapi.co on every page load
const _cache = new Map<string, { region: string; ts: number }>()
const CACHE_TTL = 5 * 60_000 // 5 minutes

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req)

    // Localhost — never block in dev
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return NextResponse.json({ blocked: false, region: null })
    }

    // Check cache
    const cached = _cache.get(ip)
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json({ blocked: cached.region === 'CA', region: cached.region })
    }

    // ipapi.co free tier — 1,000 req/day, no key required
    const resp = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'DebtCoachAI/1.0' },
      signal: AbortSignal.timeout(3000),
    })

    if (!resp.ok) {
      // Fail open — don't block if geo API is down
      return NextResponse.json({ blocked: false, region: null })
    }

    const data = await resp.json()
    const region = data?.region_code ?? null

    _cache.set(ip, { region, ts: Date.now() })

    return NextResponse.json({ blocked: region === 'CA', region })
  } catch {
    // Fail open on any error
    return NextResponse.json({ blocked: false, region: null })
  }
}
