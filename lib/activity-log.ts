import { createAdminClient } from '@/lib/supabase/server'

export type ActivityAction =
  | 'chat'
  | 'letter_generated'
  | 'guide_personalized'
  | 'situation_analyzed'
  | 'dispute_generated'
  | 'forum_post_created'
  | 'forum_reply_created'
  | 'subscription_started'
  | 'subscription_cancelled'

/**
 * Fire-and-forget activity logger. Never throws — a logging failure
 * must never break the actual user action.
 */
export async function logActivity(
  userId: string,
  action: ActivityAction,
  metadata: Record<string, unknown> = {},
) {
  try {
    const admin = createAdminClient()
    await admin.from('activity_log').insert({ user_id: userId, action, metadata })
  } catch {
    // Silently swallow — logging is best-effort
  }
}
