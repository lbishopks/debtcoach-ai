import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { z } from 'zod'

const schema = z.object({
  text: z.string().min(1).max(2000),
})

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const rl = rateLimit(ip, 'practice-tts', { limit: 30, windowMs: 60_000 })
    if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ useBrowserTts: true })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const resp = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: parsed.data.text,
        voice: 'onyx', // deep, authoritative male voice — good for debt collector role
        speed: 0.95,
      }),
    })

    if (!resp.ok) {
      const err = await resp.text()
      console.error('OpenAI TTS error:', resp.status, err)
      return NextResponse.json({ useBrowserTts: true })
    }

    return new Response(resp.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('TTS error:', err)
    return NextResponse.json({ useBrowserTts: true })
  }
}
