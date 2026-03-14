import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/admin/logout-button'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top nav */}
      <nav className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-amber-400 text-xs tracking-widest uppercase font-medium">RecruitPulse</span>
          <div className="flex items-center gap-1">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/recipients">Příjemci</NavLink>
            <NavLink href="/sources">Zdroje</NavLink>
            <NavLink href="/settings">Nastavení</NavLink>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/archive" className="text-slate-400 hover:text-white text-xs transition-colors">
            Archiv →
          </Link>
          <LogoutButton />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
    >
      {children}
    </Link>
  )
}
