-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sources table
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('rss', 'web')),
  language TEXT NOT NULL CHECK (language IN ('cs', 'en')),
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  original_title TEXT NOT NULL,
  original_content TEXT NOT NULL,
  translated_title TEXT,
  translated_content TEXT,
  url TEXT NOT NULL UNIQUE,
  author TEXT,
  published_at TIMESTAMPTZ,
  language TEXT NOT NULL CHECK (language IN ('cs', 'en')),
  category TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'approved', 'rejected', 'sent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Digests table
CREATE TABLE digests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Digest articles (M:N)
CREATE TABLE digest_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  digest_id UUID NOT NULL REFERENCES digests(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  UNIQUE(digest_id, article_id)
);

-- Recipients table
CREATE TABLE recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settings table (single row)
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  send_day INTEGER NOT NULL DEFAULT 5 CHECK (send_day >= 0 AND send_day <= 6),
  send_time TIME NOT NULL DEFAULT '09:00',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO settings (send_day, send_time) VALUES (5, '09:00');

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER sources_updated_at BEFORE UPDATE ON sources FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER digests_updated_at BEFORE UPDATE ON digests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER recipients_updated_at BEFORE UPDATE ON recipients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS policies
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Admin has full access (authenticated users)
CREATE POLICY "Admin full access" ON sources FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON articles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON digests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON digest_articles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON recipients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public read access for archive (digests + articles that are sent)
CREATE POLICY "Public read sent digests" ON digests FOR SELECT TO anon USING (status = 'sent');
CREATE POLICY "Public read sent articles" ON articles FOR SELECT TO anon USING (status = 'sent');
CREATE POLICY "Public read digest_articles" ON digest_articles FOR SELECT TO anon USING (true);
CREATE POLICY "Public read sources" ON sources FOR SELECT TO anon USING (true);

-- Service role bypass (for cron/server operations)
CREATE POLICY "Service role full access" ON sources FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON articles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON digests FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON digest_articles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON recipients FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON settings FOR ALL TO service_role USING (true) WITH CHECK (true);
