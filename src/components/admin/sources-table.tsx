'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Source } from '@/lib/supabase/types'
import { CATEGORIES } from '@/config/categories'

export function SourcesTable({ sources }: { sources: Source[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', url: '', type: 'rss', language: 'en', category: 'Trendy' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  async function addSource(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const { error: err } = await res.json()

    if (err) {
      setError(err)
    } else {
      setForm({ name: '', url: '', type: 'rss', language: 'en', category: 'Trendy' })
      setShowForm(false)
      router.refresh()
    }
    setLoading(false)
  }

  async function toggleActive(source: Source) {
    await fetch(`/api/sources/${source.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !source.is_active }),
    })
    router.refresh()
  }

  async function deleteSource(id: string) {
    if (!confirm('Opravdu smazat zdroj? Přidružené články budou také smazány.')) return
    await fetch(`/api/sources/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  function formatDate(d: string | null) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-slate-900 text-white text-sm rounded hover:bg-slate-700 transition-colors"
        >
          + Přidat zdroj
        </button>
      </div>

      {showForm && (
        <form onSubmit={addSource} className="bg-white border border-amber-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-slate-900">Nový zdroj</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Název</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="AIHR Blog"
                className="w-full border border-stone-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">URL</label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                required
                placeholder="https://aihr.com/feed/"
                className="w-full border border-stone-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Typ</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-stone-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="rss">RSS Feed</option>
                <option value="web">Web Scraping</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Jazyk</label>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="w-full border border-stone-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="en">Angličtina (přeložit)</option>
                <option value="cs">Čeština</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-600 mb-1">Kategorie</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-stone-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="px-4 py-1.5 bg-slate-900 text-white text-sm rounded hover:bg-slate-700 disabled:opacity-50 transition-colors">
              {loading ? 'Ukládám…' : 'Přidat'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-1.5 text-slate-600 text-sm hover:text-slate-900 transition-colors">
              Zrušit
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        {sources.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-8">Žádné zdroje</p>
        ) : (
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Zdroj</th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Typ</th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Jazyk</th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Poslední scrape</th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Stav</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sources.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-400 truncate max-w-xs">{s.url}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-stone-100 text-slate-600 px-2 py-0.5 rounded">
                      {s.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 uppercase">{s.language}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(s.last_scraped_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-slate-400'}`}>
                      {s.is_active ? 'Aktivní' : 'Neaktivní'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => toggleActive(s)}
                        className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        {s.is_active ? 'Deaktivovat' : 'Aktivovat'}
                      </button>
                      <button
                        onClick={() => deleteSource(s.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Smazat
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
