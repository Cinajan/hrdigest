import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const patchSchema = z.object({
  send_day: z.number().int().min(0).max(6).optional(),
  send_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
})

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .single()

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data, error: null })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 })
  }

  const { data: existing } = await supabase.from('settings').select('id').single()
  if (!existing) return NextResponse.json({ data: null, error: 'Settings not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('settings')
    .update(parsed.data)
    .eq('id', existing.id)
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data, error: null })
}
