import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const patchSchema = z.object({
  status: z.enum(['new', 'approved', 'rejected', 'sent']).optional(),
  translated_title: z.string().optional(),
  translated_content: z.string().optional(),
  category: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const body = await request.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('articles')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })

  return NextResponse.json({ data, error: null })
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('articles')
    .select('*, source:sources(id, name, url, language, category)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 404 })

  return NextResponse.json({ data, error: null })
}
