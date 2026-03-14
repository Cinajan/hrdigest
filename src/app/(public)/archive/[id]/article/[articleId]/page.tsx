import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string; articleId: string }>
}) {
  const { id, articleId } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('articles')
    .select('*, source:sources(name, url)')
    .eq('id', articleId)
    .eq('status', 'sent')
    .single()

  if (!article) notFound()

  const title = article.translated_title || article.original_title
  const content = article.translated_content || article.original_content

  // Format content into paragraphs
  const paragraphs = content
    .split(/\n\n+/)
    .map((p: string) => p.replace(/\s+/g, ' ').trim())
    .filter((p: string) => p.length > 20)

  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('cs-CZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <Link href={`/archive/${id}`} className="text-sm text-slate-400 hover:text-slate-700 transition-colors">
        ← Zpět na digest
      </Link>

      {/* Article header */}
      <div className="mt-8 mb-8">
        {article.category && (
          <p className="text-xs tracking-widest text-amber-600 uppercase mb-3">{article.category}</p>
        )}
        <h1 className="text-3xl font-serif text-slate-900 leading-tight">{title}</h1>

        <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-slate-400">
          {article.author && <span>{article.author}</span>}
          {article.source?.name && (
            <>
              <span>·</span>
              <a
                href={article.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-700 transition-colors"
              >
                {article.source.name}
              </a>
            </>
          )}
          {publishedDate && (
            <>
              <span>·</span>
              <span>{publishedDate}</span>
            </>
          )}
        </div>

        {article.language === 'en' && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded px-2 py-0.5">
              Přeloženo z angličtiny
            </span>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Originál ↗
            </a>
          </div>
        )}
      </div>

      <hr className="border-stone-200 mb-8" />

      {/* Article content */}
      <div className="prose prose-stone prose-lg max-w-none">
        {paragraphs.length > 0 ? (
          paragraphs.map((para: string, i: number) => (
            <p key={i} className="text-slate-700 leading-relaxed mb-5 text-base">
              {para}
            </p>
          ))
        ) : (
          <p className="text-slate-700 leading-relaxed">{content}</p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-10 pt-8 border-t border-stone-200">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-slate-900 border border-slate-300 rounded px-4 py-2 hover:bg-stone-100 transition-colors"
        >
          Číst originální článek ↗
        </a>
      </div>
    </div>
  )
}
