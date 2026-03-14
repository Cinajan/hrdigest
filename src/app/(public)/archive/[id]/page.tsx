import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DigestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: digest } = await supabase
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
          translated_content,
          original_content,
          url,
          author,
          published_at,
          category,
          language,
          source:sources (name)
        )
      )
    `)
    .eq('id', id)
    .eq('status', 'sent')
    .single()

  if (!digest) notFound()

  type DigestArticleRow = { position: number; id: string; article: { id: string; translated_title: string | null; original_title: string; translated_content: string | null; original_content: string; url: string; author: string | null; published_at: string | null; category: string | null; language: string; source: { name: string } | null } }
  const articles = [...((digest.digest_articles ?? []) as DigestArticleRow[])]
    .sort((a, b) => a.position - b.position)

  const sentDate = digest.sent_at
    ? new Date(digest.sent_at).toLocaleDateString('cs-CZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <Link href="/archive" className="text-sm text-slate-400 hover:text-slate-700 transition-colors">
        ← Zpět na archiv
      </Link>

      {/* Digest header */}
      <div className="mt-6 mb-10 pb-8 border-b border-stone-200">
        <p className="text-xs tracking-widest text-amber-600 uppercase mb-2">{sentDate}</p>
        <h1 className="text-3xl font-serif text-slate-900">{digest.title}</h1>
        <p className="text-slate-500 mt-2 text-sm">{articles.length} článků</p>
      </div>

      {/* Articles */}
      <div className="space-y-12">
        {articles.map((da, index) => {
          const article = da.article
          const title = article.translated_title || article.original_title
          const content = article.translated_content || article.original_content
          const excerpt = content.slice(0, 400).replace(/\s+/g, ' ').trim()

          return (
            <article key={da.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-amber-500 font-bold text-sm">{index + 1}</span>
                {article.category && (
                  <span className="text-xs text-slate-400 uppercase tracking-wider">{article.category}</span>
                )}
              </div>

              <h2 className="text-2xl font-serif text-slate-900 leading-tight mb-3">
                {title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                {article.author && <span>{article.author}</span>}
                {article.source?.name && <span>· {article.source.name}</span>}
                {article.published_at && (
                  <span>· {new Date(article.published_at).toLocaleDateString('cs-CZ')}</span>
                )}
              </div>

              <p className="text-slate-600 text-base leading-relaxed mb-4">
                {excerpt}…
              </p>

              <div className="flex items-center gap-4">
                <Link
                  href={`/archive/${id}/article/${article.id}`}
                  className="text-sm font-medium text-slate-900 hover:text-amber-700 transition-colors"
                >
                  Číst celý článek →
                </Link>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Originál ↗
                </a>
              </div>

              {index < articles.length - 1 && (
                <hr className="mt-12 border-stone-200" />
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
