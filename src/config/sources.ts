import { SourceType, SourceLanguage } from '@/lib/supabase/types'

export interface DefaultSource {
  name: string
  url: string
  type: SourceType
  language: SourceLanguage
  category: string
}

export const DEFAULT_SOURCES: DefaultSource[] = [
  { name: 'Matěj Matolín Blog', url: 'https://matejmatolin.com/blog', type: 'web', language: 'cs', category: 'Sourcing' },
  { name: 'HR Forum', url: 'https://hrforum.cz', type: 'web', language: 'cs', category: 'Trendy' },
  { name: 'LMC Magazine', url: 'https://magazine.lmc.eu/cs', type: 'web', language: 'cs', category: 'Employer branding' },
  { name: 'Recruitis Blog', url: 'https://recruitis.io/blog', type: 'web', language: 'cs', category: 'Tipy & triky' },
  { name: 'ERE.net', url: 'https://www.ere.net/feed/', type: 'rss', language: 'en', category: 'Trendy' },
  { name: 'AIHR Blog', url: 'https://www.aihr.com/blog/feed/', type: 'rss', language: 'en', category: 'Trendy' },
  { name: 'RecruitingDaily', url: 'https://recruitingdaily.com/feed/', type: 'rss', language: 'en', category: 'Tipy & triky' },
  { name: 'LinkedIn Talent Blog', url: 'https://www.linkedin.com/blog/talent', type: 'web', language: 'en', category: 'Sourcing' },
]
