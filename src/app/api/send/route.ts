import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { DigestEmail } from '@/components/email/digest-email'
import { z } from 'zod'

const sendSchema = z.object({
  digestId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const body = await request.json()
  const parsed = sendSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 })
  }

  const { digestId } = parsed.data

  // Load digest with articles
  const { data: digest, error: digestError } = await supabase
    .from('digests')
    .select(`
      *,
      digest_articles (
        id,
        position,
        article:articles (
          *,
          source:sources (name, url)
        )
      )
    `)
    .eq('id', digestId)
    .single()

  if (digestError || !digest) {
    return NextResponse.json({ data: null, error: 'Digest nenalezen' }, { status: 404 })
  }

  if (digest.status === 'sent') {
    return NextResponse.json({ data: null, error: 'Digest byl již odeslán' }, { status: 400 })
  }

  const articles = digest.digest_articles
  if (!articles || articles.length === 0) {
    return NextResponse.json({ data: null, error: 'Digest neobsahuje žádné články' }, { status: 400 })
  }

  // Load active recipients
  const { data: recipients, error: recipientsError } = await supabase
    .from('recipients')
    .select('*')
    .eq('is_active', true)

  if (recipientsError) {
    return NextResponse.json({ data: null, error: recipientsError.message }, { status: 500 })
  }

  if (!recipients || recipients.length === 0) {
    return NextResponse.json({ data: null, error: 'Žádní aktivní příjemci' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resend = new Resend(process.env.RESEND_API_KEY)

  // Mark sent_at before sending
  const sentAt = new Date().toISOString()

  // Render email HTML
  const digestWithSentAt = { ...digest, sent_at: sentAt }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emailHtml = await render(DigestEmail({ digest: digestWithSentAt as any, appUrl }))

  const errors: string[] = []
  let sentCount = 0

  for (const recipient of recipients) {
    try {
      const { error } = await resend.emails.send({
        from: 'RecruitPulse <digest@recruitpulse.cz>',
        to: recipient.email,
        subject: `${digest.title}`,
        html: emailHtml,
      })
      if (error) {
        errors.push(`${recipient.email}: ${error.message}`)
      } else {
        sentCount++
      }
    } catch (err) {
      errors.push(`${recipient.email}: ${err instanceof Error ? err.message : 'Chyba'}`)
    }
  }

  if (sentCount > 0) {
    // Mark digest as sent
    await supabase
      .from('digests')
      .update({ status: 'sent', sent_at: sentAt })
      .eq('id', digestId)

    // Mark articles as sent
    const articleIds = (articles as Array<{ article: { id: string } }>).map((da) => da.article.id)
    await supabase
      .from('articles')
      .update({ status: 'sent' })
      .in('id', articleIds)
  }

  return NextResponse.json({
    data: {
      sentCount,
      totalRecipients: recipients.length,
      errors: errors.length > 0 ? errors : undefined,
    },
    error: null,
  })
}
