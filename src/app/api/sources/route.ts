import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const sourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  type: z.enum(['rss', 'web']),
  language: z.enum(['cs', 'en']),
  category: z.string().optional(),
  is_active: z.boolean().default(true),
})

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .order('name')

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data, error: null })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const parsed = sourceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('sources')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data, error: null }, { status: 201 })
}
