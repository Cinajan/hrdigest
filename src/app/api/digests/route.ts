import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createDigestSchema = z.object({
  title: z.string().min(1),
})

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('digests')
    .select(`
      *,
      digest_articles (
        id,
        position,
        article:articles (
          id,
          translated_title,
          original_title,
          translated_content,
          original_content,
          url,
          author,
          published_at,
          category,
          source:sources (name)
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data, error: null })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const parsed = createDigestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('digests')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data, error: null }, { status: 201 })
}
