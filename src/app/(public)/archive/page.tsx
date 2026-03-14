import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function ArchivePage() {
  const supabase = await createClient()

  const { data: digests } = await supabase
    .from('digests')
    .select(`
      id,
      title,
      sent_at,
      digest_articles (
        article:articles (
          translated_title,
          original_title,
          category
        )
      )
    `)
    .eq('status', 'sent')
    .order('sent_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-xs tracking-widest text-amber-600 uppercase mb-2">Archiv</p>
        <h1 className="text-3xl font-serif text-slate-900">HR Digest</h1>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
          Týdenní výběr nejzajímavějších článků z oblasti HR a recruitmentu, přeložených do češtiny.
        </p>
      </div>

      {!digests || digests.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-lg p-8 text-center">
          <p className="text-slate-400">Zatím žádné odeslané digesty</p>
        </div>
      ) : (
        <div className="space-y-4">
          {digests.map((digest) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const articles: Array<{ translated_title: string | null; original_title: string }> = ((digest.digest_articles ?? []) as any[]).map((da) => da.article).flat()
            const sentDate = digest.sent_at
              ? new Date(digest.sent_at).toLocaleDateString('cs-CZ', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : ''

            return (
              <Link key={digest.id} href={`/archive/${digest.id}`} className="block">
                <div className="bg-white border border-stone-200 rounded-lg p-6 hover:border-amber-300 hover:shadow-sm transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 mb-1">{sentDate}</p>
                      <h2 className="text-lg font-serif text-slate-900 group-hover:text-amber-700 transition-colors">
                        {digest.title}
                      </h2>
                      <div className="mt-3 space-y-1">
                        {articles.slice(0, 3).map((a, i) => (
                          <p key={i} className="text-sm text-slate-500 flex items-start gap-2">
                            <span className="text-amber-400 shrink-0">·</span>
                            {a.translated_title || a.original_title}
                          </p>
                        ))}
                      </div>
                    </div>
                    <span className="text-slate-300 group-hover:text-amber-400 transition-colors text-lg ml-4">→</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
