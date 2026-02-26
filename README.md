# AI Native Club

The club for AI-native builders. A community for technical founders (50K-2M ARR) who ship fast with AI.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (Postgres + RLS)
- **Email:** Resend
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Resend account

### Setup

1. Clone the repo:
```bash
git clone https://github.com/ThoBustos/ainativeclub.git
cd ainativeclub
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
```bash
# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Push the database schema
npm run db:push
```

4. Create `.env.local` from the template:
```bash
cp .env.example .env.local
```

5. Fill in your environment variables (see `.env.example` for descriptions)

6. Run the dev server:
```bash
npm run dev
```

Open [http://localhost:4015](http://localhost:4015) to see the app.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 4015) |
| `npm run build` | Build for production |
| `npm run db:push` | Push migrations to Supabase |
| `npm run db:types` | Generate TypeScript types from schema |
| `npm run db:migrate` | Create a new migration |
| `npm run storybook` | Start Storybook (port 4016) |

## Project Structure

```
src/
├── app/
│   ├── actions/         # Server Actions (form submissions)
│   ├── apply/           # Application page
│   └── page.tsx         # Landing page
├── components/
│   ├── landing/         # Landing page components
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── database.types.ts    # Auto-generated Supabase types
│   └── supabase-server.ts   # Server-side Supabase client
└── stories/             # Storybook stories
supabase/
└── migrations/          # Database migrations
```

## License

MIT
