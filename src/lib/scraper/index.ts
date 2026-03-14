import { createServiceClient } from '@/lib/supabase/server'
import { Source } from '@/lib/supabase/types'
import { scrapeRssFeed, ScrapedArticle } from './rss-parser'
import { scrapeWebSource } from './web-scraper'

export interface ScrapeResult {
  source: string
  articlesFound: number
  articlesSaved: number
  error?: string
}

async function scrapeSource(source: Source): Promise<ScrapedArticle[]> {
  if (source.type === 'rss') {
    return scrapeRssFeed(source)
  }
  return scrapeWebSource(source)
}

async function saveArticles(
  supabase: ReturnType<typeof createServiceClient>,
  articles: ScrapedArticle[]
): Promise<number> {
  if (articles.length === 0) return 0

  const rows = articles.map((a) => ({
    source_id: a.source_id,
    original_title: a.original_title,
    original_content: a.original_content,
    url: a.url,
    author: a.author,
    published_at: a.published_at?.toISOString() ?? null,
    language: a.language,
    category: a.category,
    status: 'new' as const,
  }))

  const { error, data } = await supabase
    .from('articles')
    .upsert(rows, { onConflict: 'url', ignoreDuplicates: true })
    .select('id')

  if (error) throw new Error(error.message)
  return data?.length ?? 0
}

export async function runScraping(): Promise<ScrapeResult[]> {
  const supabase = createServiceClient()

  const { data: sources, error } = await supabase
    .from('sources')
    .select('*')
    .eq('is_active', true)

  if (error) throw new Error(`Failed to load sources: ${error.message}`)
  if (!sources || sources.length === 0) return []

  const results: ScrapeResult[] = []

  for (const source of sources as Source[]) {
    const result: ScrapeResult = {
      source: source.name,
      articlesFound: 0,
      articlesSaved: 0,
    }

    try {
      const articles = await scrapeSource(source)
      result.articlesFound = articles.length

      if (articles.length > 0) {
        result.articlesSaved = await saveArticles(supabase, articles)
      }

      // Update last_scraped_at
      await supabase
        .from('sources')
        .update({ last_scraped_at: new Date().toISOString() })
        .eq('id', source.id)
    } catch (err) {
      result.error = err instanceof Error ? err.message : 'Unknown error'
    }

    results.push(result)
  }

  return results
}
