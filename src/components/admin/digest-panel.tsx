'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Digest } from '@/lib/supabase/types'

interface DigestPanelProps {
  digest: (Digest & {
    digest_articles: Array<{
      id: string
      position: number
      article: {
        id: string
        translated_title: string | null
        original_title: string
        category: string | null
        author: string | null
        source?: { name: string }
      }
    }>
  }) | null
}

export function DigestPanel({ digest }: DigestPanelProps) {
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<string | null>(null)

  const articles = digest
    ? [...digest.digest_articles].sort((a, b) => a.position - b.position)
    : []

  async function removeArticle(articleId: string) {
    if (!digest) return
    await fetch(`/api/digests/${digest.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ removeArticleId: articleId }),
    })
    // Reset article status back to new
    await fetch(`/api/articles/${articleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'new' }),
    })
    router.refresh()
  }

  async function sendDigest() {
    if (!digest) return
    setSending(true)
    setSendResult(null)

    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ digestId: digest.id }),
    })
    const { data, error } = await res.json()

    if (error) {
      setSendResult(`Chyba: ${error}`)
    } else {
      setSendResult(`✓ Odesláno ${data.sentCount} z ${data.totalRecipients} příjemcům`)
      setTimeout(() => router.refresh(), 1500)
    }
    setSending(false)
  }

  return (
    <div className="bg-white border border-stone-200 rounded-lg overflow-hidden sticky top-8">
      {/* Header */}
      <div className="bg-slate-900 px-4 py-3">
        <p className="text-amber-400 text-xs tracking-wider uppercase">Aktuální digest</p>
        {digest ? (
          <p className="text-white text-sm font-medium mt-0.5 truncate">{digest.title}</p>
        ) : (
          <p className="text-slate-400 text-xs mt-0.5">Žádný draft — přidejte první článek</p>
        )}
      </div>

      {/* Articles in digest */}
      <div className="p-4 space-y-3 min-h-[120px]">
        {articles.length === 0 ? (
          <p className="text-slate-400 text-xs text-center py-4">
            Zatím žádné články
          </p>
        ) : (
          articles.map((da, index) => {
            const title = da.article.translated_title || da.article.original_title
            return (
              <div key={da.id} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold text-xs mt-0.5 shrink-0">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 leading-snug line-clamp-2">{title}</p>
                  {da.article.source?.name && (
                    <p className="text-xs text-slate-400 mt-0.5">{da.article.source.name}</p>
                  )}
                </div>
                <button
                  onClick={() => removeArticle(da.article.id)}
                  className="text-slate-300 hover:text-red-500 text-xs shrink-0 transition-colors"
                  title="Odebrat z digestu"
                >
                  ✕
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Counter */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1.5 flex-1 rounded-full ${n <= articles.length ? 'bg-amber-500' : 'bg-stone-200'}`}
            />
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-1">{articles.length}/3 článků</p>
      </div>

      {/* Send button */}
      <div className="p-4 border-t border-stone-100">
        {sendResult ? (
          <p className={`text-xs text-center py-2 ${sendResult.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
            {sendResult}
          </p>
        ) : (
          <button
            onClick={sendDigest}
            disabled={!digest || articles.length === 0 || sending}
            className="w-full py-2 px-4 bg-amber-500 text-white text-sm font-medium rounded hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? 'Odesílám…' : 'Odeslat digest'}
          </button>
        )}
        {!digest && (
          <p className="text-xs text-slate-400 text-center mt-2">
            Přidejte alespoň jeden článek
          </p>
        )}
      </div>
    </div>
  )
}
