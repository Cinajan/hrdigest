import { createClient } from '@/lib/supabase/server'
import { ArticleList } from '@/components/admin/article-list'
import { DigestPanel } from '@/components/admin/digest-panel'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: articles },
    { data: digests },
  ] = await Promise.all([
    supabase
      .from('articles')
      .select('*, source:sources(id, name, language, category)')
      .eq('status', 'new')
      .order('published_at', { ascending: false })
      .limit(50),
    supabase
      .from('digests')
      .select(`
        *,
        digest_articles (
          id,
          position,
          article:articles (
            id,
            translated_title,
            original_title,
            category,
            author,
            source:sources(name)
          )
        )
      `)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1),
  ])

  const currentDraft = digests?.[0] ?? null

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            {articles?.length ?? 0} nových článků čeká na review
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Article review — 2/3 width */}
        <div className="lg:col-span-2">
          <ArticleList articles={articles ?? []} draftDigestId={currentDraft?.id ?? null} />
        </div>

        {/* Digest panel — 1/3 width */}
        <div className="lg:col-span-1">
          <DigestPanel digest={currentDraft} />
        </div>
      </div>
    </div>
  )
}
