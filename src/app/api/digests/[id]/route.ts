import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  // Add or remove articles
  addArticleId: z.string().uuid().optional(),
  removeArticleId: z.string().uuid().optional(),
  articlePositions: z.array(z.object({ id: z.string().uuid(), position: z.number() })).optional(),
})

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
          language,
          source:sources (name, url)
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 404 })
  return NextResponse.json({ data, error: null })
}

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

  const { title, addArticleId, removeArticleId, articlePositions } = parsed.data

  if (title) {
    await supabase.from('digests').update({ title }).eq('id', id)
  }

  if (addArticleId) {
    // Check limit
    const { count } = await supabase
      .from('digest_articles')
      .select('*', { count: 'exact', head: true })
      .eq('digest_id', id)

    if ((count ?? 0) >= 3) {
      return NextResponse.json({ data: null, error: 'Digest může obsahovat maximálně 3 články' }, { status: 400 })
    }

    const { error } = await supabase
      .from('digest_articles')
      .insert({ digest_id: id, article_id: addArticleId, position: count ?? 0 })

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }

  if (removeArticleId) {
    await supabase
      .from('digest_articles')
      .delete()
      .eq('digest_id', id)
      .eq('article_id', removeArticleId)
  }

  if (articlePositions) {
    for (const { id: daId, position } of articlePositions) {
      await supabase.from('digest_articles').update({ position }).eq('id', daId)
    }
  }

  const { data, error } = await supabase
    .from('digests')
    .select(`*, digest_articles (id, position, article:articles (*))`)
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data, error: null })
}
