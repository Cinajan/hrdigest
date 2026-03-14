# RecruitPulse — HR Digest

Automatizovaný týdenní kurátorský digest pro HR/recruitment profesionály. Systém stahuje články z RSS feedů a webů, překládá je do češtiny přes DeepL a umožňuje adminovi schválit výběr a odeslat email příjemcům.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Supabase** — PostgreSQL databáze + Auth
- **Resend** — odesílání emailů
- **DeepL API** — překlad do češtiny
- **Vercel** — hosting + cron jobs

## Rychlý start

### 1. Naklonuj repo a nainstaluj závislosti

```bash
git clone <repo-url>
cd hrdigest
npm install
```

### 2. Nastav environment variables

```bash
cp .env.example .env.local
# Vyplň hodnoty v .env.local
```

### 3. Vytvoř Supabase projekt

1. Jdi na [supabase.com](https://supabase.com) a vytvoř nový projekt
2. V SQL editoru spusť migraci: `supabase/migrations/001_initial_schema.sql`
3. Volitelně spusť seed data: `supabase/seed.sql`
4. Zkopíruj URL a klíče do `.env.local`

### 4. Vytvoř admin účet

V Supabase dashboardu → Authentication → Users → Add user:
- Email: stejný jako `ADMIN_EMAIL` v `.env.local`
- Password: stejný jako `ADMIN_PASSWORD`

### 5. Spusť vývojový server

```bash
npm run dev
```

Otevři [http://localhost:3000](http://localhost:3000)

## Struktura projektu

```
src/
├── app/
│   ├── (admin)/          # Chráněné admin stránky
│   │   ├── dashboard/    # Review článků + správa digestu
│   │   ├── recipients/   # Správa příjemců
│   │   ├── sources/      # Správa zdrojů
│   │   └── settings/     # Nastavení odesílání
│   ├── (public)/         # Veřejný archiv
│   │   └── archive/      # Seznam digestů + detail + detail článku
│   ├── api/              # API routes
│   └── login/            # Login stránka
├── components/
│   ├── admin/            # Admin UI komponenty
│   ├── archive/          # Archiv komponenty
│   └── email/            # React Email šablona
├── lib/
│   ├── supabase/         # Supabase klienti + typy
│   ├── scraper/          # RSS + web scraper
│   └── translator/       # DeepL integrace
└── config/               # Kategorie, výchozí zdroje
```

## Workflow

1. **Scraping** — cron job spouští `/api/cron/scrape` každý den v 6:00
2. **Review** — admin vidí nové články v dashboardu, přidá max. 3 do digestu
3. **Překlad** — anglické články jsou automaticky přeloženy přes DeepL
4. **Odeslání** — admin klikne "Odeslat digest", Resend rozešle email všem aktivním příjemcům
5. **Archiv** — odeslaný digest je dostupný na veřejném archivu

## Deployment na Vercel

1. Propoj GitHub repo s Vercel projektem
2. Nastav environment variables v Vercel dashboardu
3. Cron job (denní scraping v 6:00 UTC) je nakonfigurován v `vercel.json`
4. Pro cron autorizaci nastav `CRON_SECRET` — Vercel automaticky posílá `Authorization: Bearer <secret>`

## Environment Variables

Viz `.env.example` pro úplný seznam s popisy.

## Free tier limity

| Služba | Limit | Využití |
|---|---|---|
| Supabase | 500 MB, 50k řádků | Desítky let provozu |
| DeepL Free | 500k znaků/měsíc | ~36k znaků/měsíc (3 články/týden) |
| Resend Free | 3 000 emailů/měsíc | 80 digestů × 20 příjemců |
| Vercel Free | 1 cron job/den | Stačí |
