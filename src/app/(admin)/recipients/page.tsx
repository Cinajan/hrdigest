import { createClient } from '@/lib/supabase/server'
import { RecipientsTable } from '@/components/admin/recipients-table'

export default async function RecipientsPage() {
  const supabase = await createClient()
  const { data: recipients } = await supabase
    .from('recipients')
    .select('*')
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-slate-900">Příjemci</h1>
        <p className="text-sm text-slate-500 mt-1">
          {recipients?.filter((r) => r.is_active).length ?? 0} aktivních příjemců
        </p>
      </div>
      <RecipientsTable recipients={recipients ?? []} />
    </div>
  )
}
