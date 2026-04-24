/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['jspdf'],
  },

  // ─── Security Headers ──────────────────────────────────────────────────────
  // Applied to every response. These close common attack vectors and prevent
  // content from being embedded in iframes on third-party sites (clickjacking).
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent this app from being loaded inside an iframe on another domain
          { key: 'X-Frame-Options', value: 'DENY' },
          // Stop browsers from MIME-sniffing the content type
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Only send the origin in the Referer header (not the full URL path)
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restrict access to browser features we don't use
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          // Legacy XSS filter (belt-and-suspenders for older browsers)
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Tell browsers to always use HTTPS for this origin
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      // Cache-busting for API routes — never cache auth or AI responses
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
