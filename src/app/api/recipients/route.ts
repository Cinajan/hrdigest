import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const recipientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recipients')
    .select('*')
    .order('name')

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  return NextResponse.json({ data, error: null })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const parsed = recipientSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('recipients')
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ data: null, error: 'Tento email je již registrován' }, { status: 409 })
    }
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, error: null }, { status: 201 })
}
