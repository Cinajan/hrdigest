'use client'

import { useState } from 'react'
import { Settings } from '@/lib/supabase/types'
import { SEND_DAYS } from '@/config/categories'

export function SettingsForm({ settings }: { settings: Settings | null }) {
  const [sendDay, setSendDay] = useState(settings?.send_day ?? 5)
  const [sendTime, setSendTime] = useState(settings?.send_time?.slice(0, 5) ?? '09:00')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ send_day: sendDay, send_time: sendTime }),
    })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-lg p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Den odesílání
        </label>
        <select
          value={sendDay}
          onChange={(e) => setSendDay(Number(e.target.value))}
          className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          {SEND_DAYS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Čas odesílání
        </label>
        <input
          type="time"
          value={sendTime}
          onChange={(e) => setSendTime(e.target.value)}
          className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-slate-900 text-white text-sm rounded hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Ukládám…' : 'Uložit nastavení'}
        </button>
        {saved && <span className="text-sm text-green-600">✓ Uloženo</span>}
      </div>

      <p className="text-xs text-slate-400 border-t border-stone-100 pt-4">
        Poznámka: Automatické odesílání přes Vercel Cron je nutné nakonfigurovat v souboru <code className="bg-stone-100 px-1 rounded">vercel.json</code>.
        Digest se odesílá manuálně z dashboardu po schválení článků.
      </p>
    </form>
  )
}
