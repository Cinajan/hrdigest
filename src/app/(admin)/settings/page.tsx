import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/admin/settings-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('settings').select('*').single()

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h1 className="text-2xl font-serif text-slate-900">Nastavení</h1>
        <p className="text-sm text-slate-500 mt-1">Kdy se odesílá digest</p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  )
}
