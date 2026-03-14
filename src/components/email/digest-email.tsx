import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Font,
  Preview,
  Heading,
} from '@react-email/components'
import { Article, Digest } from '@/lib/supabase/types'

interface DigestEmailProps {
  digest: Digest & {
    digest_articles: Array<{
      position: number
      article: Article & { source?: { name: string } }
    }>
  }
  appUrl: string
}

function getArticleTitle(article: Article): string {
  return article.translated_title || article.original_title
}

function getArticleExcerpt(article: Article): string {
  const content = article.translated_content || article.original_content
  return content.slice(0, 300).replace(/\s+/g, ' ').trim() + '…'
}

export function DigestEmail({ digest, appUrl }: DigestEmailProps) {
  const articles = [...digest.digest_articles]
    .sort((a, b) => a.position - b.position)
    .map((da) => da.article)

  const sentDate = digest.sent_at
    ? new Date(digest.sent_at).toLocaleDateString('cs-CZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <Html lang="cs">
      <Head>
        <Font
          fontFamily="Georgia"
          fallbackFontFamily="serif"
          webFont={{
            url: 'https://fonts.gstatic.com/s/georgia/v1/KFOmCnqEu92Fr1Me5Q.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{digest.title} — váš týdenní HR přehled</Preview>
      <Body style={{ backgroundColor: '#f9f7f4', fontFamily: 'Georgia, serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }}>
          {/* Header */}
          <Section style={{ backgroundColor: '#1a1a2e', padding: '32px 40px' }}>
            <Text style={{ color: '#e8b86d', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 8px' }}>
              RecruitPulse
            </Text>
            <Heading as="h1" style={{ color: '#ffffff', fontSize: '26px', fontWeight: 'normal', margin: '0 0 8px', lineHeight: '1.3' }}>
              {digest.title}
            </Heading>
            <Text style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
              {sentDate}
            </Text>
          </Section>

          {/* Intro */}
          <Section style={{ padding: '32px 40px 16px' }}>
            <Text style={{ color: '#374151', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
              Dobrý den, přinášíme vám výběr nejzajímavějších článků z oblasti HR a recruitmentu za tento týden.
            </Text>
          </Section>

          <Hr style={{ borderColor: '#e5e7eb', margin: '0 40px' }} />

          {/* Articles */}
          {articles.map((article, index) => (
            <Section key={article.id} style={{ padding: index === 0 ? '32px 40px 24px' : '24px 40px' }}>
              <Text style={{ color: '#e8b86d', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 8px' }}>
                {article.category || 'HR & Recruitment'}
              </Text>
              <Heading as="h2" style={{ color: '#1a1a2e', fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px', lineHeight: '1.4' }}>
                {getArticleTitle(article)}
              </Heading>
              {article.author && (
                <Text style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 12px' }}>
                  Autor: {article.author} {article.source?.name ? `· ${article.source.name}` : ''}
                </Text>
              )}
              <Text style={{ color: '#374151', fontSize: '15px', lineHeight: '1.7', margin: '0 0 16px' }}>
                {getArticleExcerpt(article)}
              </Text>
              <Link
                href={`${appUrl}/archive/${digest.id}/article/${article.id}`}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#1a1a2e',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontFamily: 'Arial, sans-serif',
                  padding: '10px 20px',
                  textDecoration: 'none',
                  letterSpacing: '0.5px',
                }}
              >
                Číst celý článek →
              </Link>
              {index < articles.length - 1 && (
                <Hr style={{ borderColor: '#e5e7eb', marginTop: '24px', marginBottom: '0' }} />
              )}
            </Section>
          ))}

          {/* Footer */}
          <Section style={{ backgroundColor: '#f3f4f6', padding: '24px 40px', marginTop: '16px' }}>
            <Text style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 8px', fontFamily: 'Arial, sans-serif' }}>
              Tento digest byl sestaven a odeslán systémem RecruitPulse.
            </Text>
            <Link href={`${appUrl}/archive`} style={{ color: '#1a1a2e', fontSize: '12px', fontFamily: 'Arial, sans-serif' }}>
              Prohlédnout archiv všech digestů →
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
