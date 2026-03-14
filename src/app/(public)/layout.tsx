import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="border-b border-stone-200 bg-white px-6 py-4 flex items-center justify-between">
        <Link href="/archive" className="flex items-center gap-3">
          <span className="text-xs tracking-widest text-amber-600 uppercase font-medium">RecruitPulse</span>
          <span className="text-slate-300">|</span>
          <span className="text-sm text-slate-500">HR Digest Archiv</span>
        </Link>
        <Link href="/login" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
          Admin →
        </Link>
      </nav>
      <main>{children}</main>
    </div>
  )
}
