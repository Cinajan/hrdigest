import Parser from 'rss-parser'
import { Source } from '@/lib/supabase/types'

export interface ScrapedArticle {
  original_title: string
  original_content: string
  url: string
  author: string | null
  published_at: Date | null
  source_id: string
  language: 'cs' | 'en'
  category: string | null
}

const parser = new Parser({
  timeout: 8000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; RecruitPulse/1.0)',
  },
})

const MAX_AGE_DAYS = 14

function isTooOld(date: Date | null): boolean {
  if (!date) return false
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - MAX_AGE_DAYS)
  return date < cutoff
}

export async function scrapeRssFeed(source: Source): Promise<ScrapedArticle[]> {
  const feed = await parser.parseURL(source.url)
  const articles: ScrapedArticle[] = []

  for (const item of feed.items) {
    if (!item.link || !item.title) continue

    const publishedAt = item.pubDate ? new Date(item.pubDate) : null
    if (isTooOld(publishedAt)) continue

    const content = item['content:encoded'] || item.content || item.summary || ''
    const cleanContent = stripHtml(content).slice(0, 10000)

    if (!cleanContent || cleanContent.length < 100) continue

    articles.push({
      original_title: item.title.trim(),
      original_content: cleanContent,
      url: item.link,
      author: item.creator || item.author || null,
      published_at: publishedAt,
      source_id: source.id,
      language: source.language,
      category: source.category,
    })
  }

  return articles
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}
