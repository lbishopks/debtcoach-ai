import { createAdminClient } from './supabase/server'

const DEFAULTS: Record<string, number | boolean | string> = {
  free_messages_limit: 10,
  free_letters_limit: 3,
  pro_messages_limit: 100,
  pro_letters_limit: -1,
  maintenance_mode: false,
  new_signups_enabled: true,
  ai_chat_enabled: true,
  letter_generation_enabled: true,
}

export async function getPlatformSetting(key: string): Promise<number | boolean | string> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('platform_settings')
      .select('value')
      .eq('key', key)
      .single()
    if (data?.value !== undefined && data.value !== null) return data.value as number | boolean | string
  } catch { /* fall through to default */ }
  return DEFAULTS[key] ?? 0
}

/** Returns the message and letter limits for a given plan. -1 = unlimited. */
export async function getPlanLimits(plan: string): Promise<{ messagesLimit: number; lettersLimit: number }> {
  const prefix = plan === 'pro' ? 'pro' : 'free'
  const [msgs, letters] = await Promise.all([
    getPlatformSetting(`${prefix}_messages_limit`),
    getPlatformSetting(`${prefix}_letters_limit`),
  ])
  return { messagesLimit: Number(msgs), lettersLimit: Number(letters) }
}
