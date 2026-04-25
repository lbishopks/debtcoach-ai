import { AppShell } from '@/components/layout/AppShell'
import { PostThread } from '@/components/forum/PostThread'

export default function PostPage({ params }: { params: { id: string } }) {
  return (
    <AppShell>
      <PostThread postId={params.id} />
    </AppShell>
  )
}
