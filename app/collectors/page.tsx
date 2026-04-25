import { AppShell } from '@/components/layout/AppShell'
import { CollectorChecker } from '@/components/collectors/CollectorChecker'

export default function CollectorsPage() {
  return (
    <AppShell>
      <CollectorChecker />
    </AppShell>
  )
}
