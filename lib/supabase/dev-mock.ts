/**
 * Dev-only mock Supabase client.
 * Used when DEV_BYPASS_AUTH=true so you can explore the UI without a real Supabase project.
 * Remove / never import this in production.
 */

const DEV_USER = {
  id: 'dev-user-00000000-0000-0000-0000-000000000000',
  email: 'dev@local.test',
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: { full_name: 'Dev User' },
  aud: 'authenticated',
  role: 'authenticated',
}

const DEV_PROFILE = {
  id: DEV_USER.id,
  email: DEV_USER.email,
  full_name: 'Dev User',
  phone: '(555) 555-0100',
  address_line1: '123 Main Street',
  address_line2: null,
  city: 'Los Angeles',
  state: 'CA',
  zip_code: '90001',
  plan: 'pro',           // unlock all gated features
  onboarding_completed: true,
  stripe_customer_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

/** Chainable query builder that returns sensible empty results. */
function makeBuilder(singleDefault: unknown = null) {
  const builder: Record<string, unknown> = {}

  // All filter / ordering methods return the same builder for chaining
  const chain = (..._args: unknown[]) => builder

  builder.select  = chain
  builder.eq      = chain
  builder.neq     = chain
  builder.gt      = chain
  builder.lt      = chain
  builder.gte     = chain
  builder.lte     = chain
  builder.in      = chain
  builder.order   = chain
  builder.limit   = chain
  builder.range   = chain
  builder.filter  = chain
  builder.match   = chain
  builder.not     = chain
  builder.or      = chain
  builder.delete  = chain

  // Mutations — resolve immediately
  builder.upsert = async (..._args: unknown[]) => ({ data: null, error: null })
  builder.insert = async (..._args: unknown[]) => ({ data: null, error: null })
  builder.update = (..._args: unknown[]) => builder   // update().eq() chains back

  // .single() terminates the chain synchronously
  builder.single = () => ({ data: singleDefault, error: null })

  // Make the builder itself awaitable (for list queries like .order().limit())
  builder.then = (
    resolve: (v: unknown) => unknown,
    reject?: (e: unknown) => unknown,
  ) =>
    Promise.resolve({ data: [], error: null, count: 0 }).then(resolve, reject)

  return builder
}

export function createDevClient() {
  return {
    auth: {
      getUser:    async () => ({ data: { user: DEV_USER }, error: null }),
      getSession: async () => ({
        data: { session: { user: DEV_USER, access_token: 'dev-token' } },
        error: null,
      }),
      signOut: async () => ({ error: null }),
    },

    from(table: string) {
      // Return the real profile mock for the users table so pages render properly
      if (table === 'users') return makeBuilder(DEV_PROFILE)
      // Everything else (debts, conversations, letters, subscriptions…) returns null/empty
      return makeBuilder(null)
    },
  }
}
