import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendLetterEmail } from '@/lib/email'
import { sanitize, safeError } from '@/lib/validation'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const letterContent = sanitize(body.letterContent ?? '', 20000)
    const letterTitle = sanitize(body.letterTitle ?? 'Your Dispute Letter', 200)
    const recipientEmail = user.email

    if (!letterContent || !recipientEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await sendLetterEmail(recipientEmail, letterTitle, letterContent)

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: (data as any)?.id })
  } catch (err: any) {
    return safeError(err, 'email-letter')
  }
}
