'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Recipient } from '@/lib/supabase/types'

export function RecipientsTable({ recipients }: { recipients: Recipient[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function addRecipient(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/recipients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    })
    const { error: err } = await res.json()

    if (err) {
      setError(err)
    } else {
      setName('')
      setEmail('')
      setShowForm(false)
      router.refresh()
    }
    setLoading(false)
  }

  async function toggleActive(recipient: Recipient) {
    await fetch(`/api/recipients/${recipient.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !recipient.is_active }),
    })
    router.refresh()
  }

  async function deleteRecipient(id: string) {
    if (!confirm('Opravdu smazat příjemce?')) return
    await fetch(`/api/recipients/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-slate-900 text-white text-sm rounded hover:bg-slate-700 transition-colors"
        >
          + Přidat příjemce
        </button>
      </div>

      {showForm && (
        <form onSubmit={addRecipient} className="bg-white border border-amber-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-slate-900">Nový příjemce</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Jméno</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jana Nováková"
                className="w-full border border-stone-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="jana@firma.cz"
                className="w-full border border-stone-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-slate-900 text-white text-sm rounded hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Ukládám…' : 'Přidat'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-1.5 text-slate-600 text-sm hover:text-slate-900 transition-colors"
            >
              Zrušit
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        {recipients.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-8">Žádní příjemci</p>
        ) : (
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Jméno</th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Email</th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Stav</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recipients.map((r) => (
                <tr key={r.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{r.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{r.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.is_active ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-slate-400'}`}>
                      {r.is_active ? 'Aktivní' : 'Neaktivní'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => toggleActive(r)}
                        className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        {r.is_active ? 'Deaktivovat' : 'Aktivovat'}
                      </button>
                      <button
                        onClick={() => deleteRecipient(r.id)}
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
