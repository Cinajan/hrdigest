export type SourceType = 'rss' | 'web'
export type SourceLanguage = 'cs' | 'en'
export type ArticleStatus = 'new' | 'approved' | 'rejected' | 'sent'
export type DigestStatus = 'draft' | 'sent'

export interface Source {
  id: string
  name: string
  url: string
  type: SourceType
  language: SourceLanguage
  category: string | null
  is_active: boolean
  last_scraped_at: string | null
  created_at: string
  updated_at: string
}

export interface Article {
  id: string
  source_id: string
  original_title: string
  original_content: string
  translated_title: string | null
  translated_content: string | null
  url: string
  author: string | null
  published_at: string | null
  language: SourceLanguage
  category: string | null
  status: ArticleStatus
  created_at: string
  updated_at: string
  source?: Source
}

export interface Digest {
  id: string
  title: string
  status: DigestStatus
  sent_at: string | null
  created_at: string
  updated_at: string
  articles?: DigestArticle[]
}

export interface DigestArticle {
  id: string
  digest_id: string
  article_id: string
  position: number
  article?: Article
}

export interface Recipient {
  id: string
  name: string
  email: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Settings {
  id: string
  send_day: number
  send_time: string
  updated_at: string
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}
