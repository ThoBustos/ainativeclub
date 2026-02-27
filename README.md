# >_ AI Native Club

The landing page. Nothing more.

**[ainativeclub.com](https://ainativeclub.com)**

---

## Stack

```
Next.js 16      → App Router, Server Actions
Supabase        → Postgres + RLS
Resend          → Transactional email
Tailwind        → Styling
Vercel          → Deploy
```

## Run

```bash
npm install
cp .env.example .env.local  # fill in your keys
npm run dev                  # localhost:4015
```

## Env

```bash
# Supabase (supabase.com → Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend (resend.com → API Keys)
RESEND_API_KEY=
RESEND_FROM_EMAIL=notifications@yourdomain.com
NOTIFICATION_EMAIL=you@email.com
```

## Database

```bash
supabase link --project-ref YOUR_REF
npm run db:push
```

## Structure

```
src/app/
├── page.tsx              # Landing
├── apply/page.tsx        # Application form
├── actions/              # Server Actions
├── opengraph-image.tsx   # Dynamic OG
├── icon.tsx              # Dynamic favicon
└── sitemap.ts            # Auto sitemap

src/lib/
├── supabase-server.ts    # Typed Supabase client
└── database.types.ts     # Generated types
```

## Design

Direction A: Silent Confidence.

One animation. The blinking cursor. Everything else is still.

---

MIT
