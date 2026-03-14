-- Seed data for testing

-- Sources
INSERT INTO sources (name, url, type, language, category, is_active) VALUES
  ('Matěj Matolín Blog', 'https://matejmatolin.com/blog', 'web', 'cs', 'Sourcing', true),
  ('HR Forum', 'https://hrforum.cz', 'web', 'cs', 'Trendy', true),
  ('LMC Magazine', 'https://magazine.lmc.eu/cs', 'web', 'cs', 'Employer branding', true),
  ('Recruitis Blog', 'https://recruitis.io/blog', 'web', 'cs', 'Tipy & triky', true),
  ('ERE.net', 'https://www.ere.net/feed/', 'rss', 'en', 'Trendy', true),
  ('AIHR Blog', 'https://www.aihr.com/blog/feed/', 'rss', 'en', 'Trendy', true),
  ('RecruitingDaily', 'https://recruitingdaily.com/feed/', 'rss', 'en', 'Tipy & triky', true),
  ('LinkedIn Talent Blog', 'https://www.linkedin.com/blog/talent', 'web', 'en', 'Sourcing', true);

-- Recipients
INSERT INTO recipients (name, email, is_active) VALUES
  ('Jana Nováková', 'jana.novakova@example.com', true),
  ('Petr Svoboda', 'petr.svoboda@example.com', true);

-- Sample sent digest
INSERT INTO digests (title, status, sent_at) VALUES
  ('HR Digest #1 — Testovací vydání', 'sent', NOW() - INTERVAL '7 days');
