import { AppShell } from '@/components/layout/AppShell'
import { ViolationLog } from '@/components/violations/ViolationLog'

export default function ViolationsPage() {
  return (
    <AppShell>
      <ViolationLog />
    </AppShell>
  )
}
