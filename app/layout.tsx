import type { Metadata } from 'next'
import Script from 'next/script'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const ADSENSE_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID

export const metadata: Metadata = {
  title: 'DebtCoach AI — AI-Powered Debt Negotiation',
  description: 'Understand your rights, negotiate settlements, generate dispute letters, and track your debt-free journey with AI.',
  keywords: 'debt negotiation, debt settlement, FDCPA, dispute letter, debt coach, credit repair',
  openGraph: {
    title: 'DebtCoach AI',
    description: 'AI-powered debt negotiation assistant',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a2f47',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            },
            success: {
              iconTheme: { primary: '#00C9B1', secondary: '#0F1C2E' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0F1C2E' },
            },
          }}
        />
      </body>
    </html>
  )
}
