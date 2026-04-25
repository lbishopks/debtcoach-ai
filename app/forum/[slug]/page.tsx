import { AppShell } from '@/components/layout/AppShell'
import { CategoryPosts } from '@/components/forum/CategoryPosts'

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return (
    <AppShell>
      <CategoryPosts slug={params.slug} />
    </AppShell>
  )
}
