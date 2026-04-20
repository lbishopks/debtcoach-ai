'use client'

import { useState } from 'react'
import { TosModal } from '@/components/TosModal'
import { CURRENT_TOS_VERSION } from '@/lib/tos-version'

interface TosGuardProps {
  children: React.ReactNode
  tosVersion: string | null
}

/**
 * Client-side gate that blocks app access until the user accepts the current ToS.
 * - `tosVersion` comes from the server (the version they last accepted, or null if never).
 * - If it already matches CURRENT_TOS_VERSION, renders children immediately with no modal.
 * - Otherwise renders children behind TosModal; flips to accepted once the user clicks Accept.
 */
export function TosGuard({ children, tosVersion }: TosGuardProps) {
  const alreadyAccepted = tosVersion === CURRENT_TOS_VERSION
  const [accepted, setAccepted] = useState(alreadyAccepted)

  if (!accepted) {
    return (
      <>
        {/* Render children blurred/inert behind the modal so layout doesn't jump on accept */}
        <div className="pointer-events-none select-none blur-sm" aria-hidden="true">
          {children}
        </div>
        <TosModal previousVersion={tosVersion} onAccepted={() => setAccepted(true)} />
      </>
    )
  }

  return <>{children}</>
}
