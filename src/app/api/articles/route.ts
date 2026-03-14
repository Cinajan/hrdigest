import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const querySchema = z.object({
  status: z.enum(['new', 'approved', 'rejected', 'sent']).optional(),
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const parsed = querySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 })
  }

  const { status, category, limit, offset } = parsed.data

  let query = supabase
    .from('articles')
    .select('*, source:sources(id, name, url, language, category)', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)
  if (category) query = query.eq('category', category)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })

  return NextResponse.json({ data: { articles: data, total: count }, error: null })
}
