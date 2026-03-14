const MYMEMORY_API = 'https://api.mymemory.translated.net/get'
const CHUNK_SIZE = 490

function splitIntoChunks(text: string): string[] {
  if (text.length <= CHUNK_SIZE) return [text]

  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    let end = start + CHUNK_SIZE
    if (end >= text.length) {
      chunks.push(text.slice(start))
      break
    }
    const lastSpace = text.lastIndexOf(' ', end)
    if (lastSpace > start) end = lastSpace
    chunks.push(text.slice(start, end))
    start = end + 1
  }

  return chunks
}

async function translateChunk(text: string): Promise<string> {
  const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=en|cs`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`MyMemory API error: ${res.status}`)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json()
  if (data.responseStatus !== 200) throw new Error(`MyMemory error: ${data.responseDetails}`)
  return data.responseData.translatedText as string
}

export async function translateToCzech(text: string): Promise<string> {
  const chunks = splitIntoChunks(text)
  const results: string[] = []
  for (const chunk of chunks) {
    results.push(await translateChunk(chunk))
  }
  return results.join(' ')
}

export async function translateArticle(
  title: string,
  content: string
): Promise<{ translatedTitle: string; translatedContent: string }> {
  const [translatedTitle, translatedContent] = await Promise.all([
    translateToCzech(title),
    translateToCzech(content),
  ])
  return { translatedTitle, translatedContent }
}

export async function translatePendingArticles(): Promise<void> {
  const { createServiceClient } = await import('@/lib/supabase/server')
  const supabase = createServiceClient()

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, original_title, original_content')
    .eq('status', 'new')
    .eq('language', 'en')
    .is('translated_title', null)
    .limit(20)

  if (error || !articles || articles.length === 0) return

  for (const article of articles) {
    try {
      const { translatedTitle, translatedContent } = await translateArticle(
        article.original_title,
        article.original_content
      )
      await supabase
        .from('articles')
        .update({ translated_title: translatedTitle, translated_content: translatedContent })
        .eq('id', article.id)
    } catch (err) {
      console.error(`Translation failed for article ${article.id}:`, err)
    }
  }
}
