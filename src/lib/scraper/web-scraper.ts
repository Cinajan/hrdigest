import { load } from 'cheerio'

type CheerioAPI = ReturnType<typeof load>
import { Source } from '@/lib/supabase/types'
import { ScrapedArticle } from './rss-parser'

const MAX_AGE_DAYS = 14
const FETCH_TIMEOUT = 8000

function isTooOld(date: Date | null): boolean {
  if (!date) return false
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - MAX_AGE_DAYS)
  return date < cutoff
}

async function fetchWithTimeout(url: string): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RecruitPulse/1.0)' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timeoutId)
  }
}

function extractArticleLinks($: CheerioAPI, baseUrl: string): string[] {
  const links = new Set<string>()
  const base = new URL(baseUrl)

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')
    if (!href) return
    try {
      const url = new URL(href, base.origin)
      // Only same-domain links that look like article paths
      if (url.hostname === base.hostname && url.pathname.length > 5) {
        links.add(url.href.split('#')[0].split('?')[0])
      }
    } catch {}
  })

  return Array.from(links).slice(0, 20) // Limit to avoid timeout
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function extractArticleContent($: CheerioAPI, _url: string): {
  title: string
  content: string
  author: string | null
  publishedAt: Date | null
} | null {
  // Remove noise elements
  $('nav, header, footer, aside, .sidebar, .comments, .ads, script, style, noscript').remove()

  const title =
    $('h1').first().text().trim() ||
    $('title').text().trim().split('|')[0].trim() ||
    $('title').text().trim()

  if (!title || title.length < 5) return null

  // Try common article selectors
  const articleSelectors = [
    'article',
    '[role="main"]',
    '.post-content',
    '.entry-content',
    '.article-content',
    '.article-body',
    '.content-body',
    'main',
  ]

  let content = ''
  for (const selector of articleSelectors) {
    const el = $(selector)
    if (el.length) {
      content = el.text().replace(/\s+/g, ' ').trim()
      if (content.length > 200) break
    }
  }

  if (!content || content.length < 200) return null

  // Try to find author
  const author =
    $('[rel="author"]').first().text().trim() ||
    $('[class*="author"]').first().text().trim() ||
    $('[itemprop="author"]').first().text().trim() ||
    null

  // Try to find date
  let publishedAt: Date | null = null
  const dateStr =
    $('time[datetime]').first().attr('datetime') ||
    $('[itemprop="datePublished"]').first().attr('content') ||
    $('[class*="date"]').first().attr('datetime') ||
    null

  if (dateStr) {
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) publishedAt = d
  }

  return {
    title,
    content: content.slice(0, 10000),
    author: author && author.length < 100 ? author : null,
    publishedAt,
  }
}

export async function scrapeWebSource(source: Source): Promise<ScrapedArticle[]> {
  const html = await fetchWithTimeout(source.url)
  const $ = load(html)
  const articleLinks = extractArticleLinks($, source.url)

  const articles: ScrapedArticle[] = []

  for (const link of articleLinks) {
    if (articles.length >= 10) break // Max 10 articles per source per run
    try {
      const articleHtml = await fetchWithTimeout(link)
      const $article = load(articleHtml)
      const extracted = extractArticleContent($article, link)

      if (!extracted) continue
      if (isTooOld(extracted.publishedAt)) continue

      articles.push({
        original_title: extracted.title,
        original_content: extracted.content,
        url: link,
        author: extracted.author,
        published_at: extracted.publishedAt,
        source_id: source.id,
        language: source.language,
        category: source.category,
      })
    } catch {
      // Skip individual article errors, continue with others
      continue
    }
  }

  return articles
}
