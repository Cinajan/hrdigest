import { NextRequest, NextResponse } from 'next/server'
import { runScraping } from '@/lib/scraper'
import { translatePendingArticles } from '@/lib/translator'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const expectedSecret = `Bearer ${process.env.CRON_SECRET}`
  if (authHeader !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const scrapeResults = await runScraping()
    await translatePendingArticles()

    return NextResponse.json({
      data: {
        message: 'Scraping and translation completed',
        results: scrapeResults,
      },
      error: null,
    })
  } catch (err) {
    console.error('Cron error:', err)
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
