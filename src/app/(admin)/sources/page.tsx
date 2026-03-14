import { createClient } from '@/lib/supabase/server'
import { SourcesTable } from '@/components/admin/sources-table'

export default async function SourcesPage() {
  const supabase = await createClient()
  const { data: sources } = await supabase
    .from('sources')
    .select('*')
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-slate-900">Zdroje článků</h1>
        <p className="text-sm text-slate-500 mt-1">
          {sources?.filter((s) => s.is_active).length ?? 0} aktivních zdrojů
        </p>
      </div>
      <SourcesTable sources={sources ?? []} />
    </div>
  )
}
