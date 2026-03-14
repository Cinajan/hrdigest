'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Article } from '@/lib/supabase/types'

interface ArticleListProps {
  articles: (Article & { source?: { name: string; language: string; category: string | null } })[]
  draftDigestId: string | null
}

export function ArticleList({ articles, draftDigestId }: ArticleListProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  async function updateArticle(id: string, patch: Record<string, unknown>) {
    setLoading(id)
    await fetch(`/api/articles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    setLoading(null)
    router.refresh()
  }

  async function addToDigest(articleId: string) {
    if (!draftDigestId) {
      // Create a new draft digest first
      const res = await fetch('/api/digests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `HR Digest — ${new Date().toLocaleDateString('cs-CZ')}` }),
      })
      const { data } = await res.json()
      if (data) {
        await fetch(`/api/digests/${data.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addArticleId: articleId }),
        })
        await updateArticle(articleId, { status: 'approved' })
      }
    } else {
      const res = await fetch(`/api/digests/${draftDigestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addArticleId: articleId }),
      })
      const { error } = await res.json()
      if (error) {
        alert(error)
        return
      }
      await updateArticle(articleId, { status: 'approved' })
    }
  }

  function startEdit(article: Article) {
    setEditing(article.id)
    setEditTitle(article.translated_title || article.original_title)
    setEditContent(article.translated_content || article.original_content)
  }

  async function saveEdit(article: Article) {
    await updateArticle(article.id, {
      translated_title: editTitle,
      translated_content: editContent,
    })
    setEditing(null)
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-lg p-8 text-center">
        <p className="text-slate-400 text-sm">Tento týden žádné nové články</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
        Nové články ({articles.length})
      </h2>

      {articles.map((article) => {
        const isExpanded = expanded === article.id
        const isEditing = editing === article.id
        const isLoading = loading === article.id
        const title = article.translated_title || article.original_title
        const content = article.translated_content || article.original_content

        return (
          <div key={article.id} className="bg-white border border-stone-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {article.source?.language === 'en' && (
                      <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded px-1.5 py-0.5">EN→CZ</span>
                    )}
                    {article.category && (
                      <span className="text-xs text-slate-400">{article.category}</span>
                    )}
                    {article.source?.name && (
                      <span className="text-xs text-slate-400">· {article.source.name}</span>
                    )}
                  </div>

                  {isEditing ? (
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-sm font-medium border border-amber-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  ) : (
                    <h3 className="text-sm font-medium text-slate-900 leading-snug line-clamp-2">
                      {title}
                    </h3>
                  )}

                  {article.author && (
                    <p className="text-xs text-slate-400 mt-1">{article.author}</p>
                  )}
                </div>
              </div>

              {/* Preview / Edit */}
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  className="w-full mt-3 text-xs text-slate-700 border border-amber-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
              ) : (
                <button
                  onClick={() => setExpanded(isExpanded ? null : article.id)}
                  className="mt-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {isExpanded ? 'Skrýt náhled ↑' : 'Zobrazit náhled ↓'}
                </button>
              )}

              {isExpanded && !isEditing && (
                <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-6">
                  {content.slice(0, 600)}…
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex items-center gap-2 flex-wrap">
              {isEditing ? (
                <>
                  <button
                    onClick={() => saveEdit(article)}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-slate-900 text-white text-xs rounded hover:bg-slate-700 disabled:opacity-50 transition-colors"
                  >
                    Uložit
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="px-3 py-1.5 text-slate-600 text-xs hover:text-slate-900 transition-colors"
                  >
                    Zrušit
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => addToDigest(article.id)}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-amber-500 text-white text-xs rounded hover:bg-amber-600 disabled:opacity-50 transition-colors"
                  >
                    + Přidat do digestu
                  </button>
                  <button
                    onClick={() => startEdit(article)}
                    className="px-3 py-1.5 bg-stone-100 text-slate-700 text-xs rounded hover:bg-stone-200 transition-colors"
                  >
                    Upravit překlad
                  </button>
                  <button
                    onClick={() => updateArticle(article.id, { status: 'rejected' })}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-red-500 text-xs hover:text-red-700 transition-colors"
                  >
                    Zamítnout
                  </button>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-slate-400 text-xs hover:text-slate-600 transition-colors"
                  >
                    Originál ↗
                  </a>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
