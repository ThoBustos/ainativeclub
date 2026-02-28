# Commit plan – Supabase auth + members + cleanup

Use this after reviewing `git diff --staged`. Commit in the order below (or squash if you prefer one commit).

---

## Step 0: Review staged changes

```bash
git status
git diff --staged --stat
git diff --staged   # full diff
```

Decide:
- **Include `.claude/`?** It’s the `/spawn` skill. Add it if you want the skill in the repo; otherwise `git reset HEAD .claude/` and add `.claude/` to `.gitignore` if needed.

---

## Proposed commit order

### 1. `chore: add Supabase SSR, zod, and security headers`

**Files:** `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `next.config.ts`

- Add `@supabase/ssr`, `zod`
- Add security headers in Next config (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)

```bash
git add package.json package-lock.json pnpm-lock.yaml next.config.ts
git commit -m "chore: add @supabase/ssr, zod, and security headers"
```

---

### 2. `feat(db): add members table and generated types`

**Files:** `supabase/migrations/20260228153249_add_members_table.sql`, `src/lib/database.types.ts`

- New migration: `members` table, enums `member_role` / `member_status`, RLS, triggers
- Regenerated `database.types.ts` with `members` and enums

```bash
git add supabase/migrations/20260228153249_add_members_table.sql src/lib/database.types.ts
git commit -m "feat(db): add members table and generated types"
```

---

### 3. `chore: add env validation with zod`

**Files:** `src/lib/env.ts`

- Validates client env (Supabase URL/anon key) and server env (service role, Resend, etc.)
- Exports `clientEnv` and `serverEnv()`

```bash
git add src/lib/env.ts
git commit -m "chore: add env validation with zod"
```

---

### 4. `refactor(supabase): replace supabase-server with SSR client/server/admin`

**Files:**  
- **Deleted:** `src/lib/supabase-server.ts`  
- **Added:** `src/lib/supabase/client.ts`, `server.ts`, `admin.ts`, `middleware.ts`  
- **Added:** `src/middleware.ts` (root Next middleware using Supabase session refresh)

Replaces single server client with SSR-safe client/server/admin and middleware for session refresh.

```bash
git add src/lib/supabase-server.ts src/lib/supabase/ src/middleware.ts
git commit -m "refactor(supabase): replace supabase-server with SSR client/server/admin"
```

---

### 5. `feat(auth): add auth callback, signout, and session middleware`

**Files:** `src/app/auth/callback/route.ts`, `src/app/auth/signout/route.ts`

- Callback exchanges code for session and redirects
- Signout clears session and redirects

```bash
git add src/app/auth/
git commit -m "feat(auth): add auth callback, signout, and session middleware"
```

---

### 6. `feat(auth): add login, not-a-member, and portal with loading/error`

**Files:**  
- `src/app/login/page.tsx`, `src/app/login/loading.tsx`  
- `src/app/not-a-member/page.tsx`, `src/app/not-a-member/loading.tsx`  
- `src/app/portal/page.tsx`, `src/app/portal/loading.tsx`, `src/app/portal/error.tsx`  
- `src/app/error.tsx` (root error boundary)

```bash
git add src/app/login/ src/app/not-a-member/ src/app/portal/ src/app/error.tsx
git commit -m "feat(auth): add login, not-a-member, and portal with loading/error"
```

---

### 7. `refactor(actions): use admin client and validated env in applications and waitlist`

**Files:** `src/app/actions/applications.ts`, `src/app/actions/waitlist.ts`

- Zod validation for application and waitlist input
- Use `createAdminClient()` and `serverEnv()` instead of `createServerClient()` and `process.env`

```bash
git add src/app/actions/applications.ts src/app/actions/waitlist.ts
git commit -m "refactor(actions): use admin client and validated env in applications and waitlist"
```

---

### 8. `feat(ui): skip link, landing header with member login, remove ApplicationForm`

**Files:**  
- **Modified:** `src/app/layout.tsx` (skip to main content link), `src/app/page.tsx` (header + Member Login link, `id="main-content"`)  
- **Deleted:** `src/components/landing/ApplicationForm.tsx`  
- **Modified:** `src/components/ui/terminal-card.tsx` (minor change)

Application form removed from landing; actions are now used elsewhere (e.g. from other pages or future form components).

```bash
git add src/app/layout.tsx src/app/page.tsx src/components/landing/ApplicationForm.tsx src/components/ui/terminal-card.tsx
git commit -m "feat(ui): skip link, landing header with member login, remove ApplicationForm"
```

---

### 9. `feat(types): add centralized type exports`

**Files:** `src/types/index.ts`

- Re-exports DB types and adds aliases (`Member`, `Application`, `MemberRole`, etc.)

```bash
git add src/types/index.ts
git commit -m "feat(types): add centralized type exports"
```

---

### 10. (Optional) `chore: add .claude spawn skill`

**Files:** `.claude/skills/spawn/SKILL.md`

Only if you want the `/spawn` skill in the repo.

```bash
git add .claude/
git commit -m "chore: add .claude spawn skill"
```

To leave it out:

```bash
git reset HEAD .claude/
# Optionally add .claude/ to .gitignore
```

---

## One-commit alternative

If you prefer a single commit:

```bash
git add -A
git commit -m "feat: Supabase SSR auth, members table, env validation, login/portal and UI updates"
```

---

## Quick reference – file → commit

| Commit | Files |
|--------|--------|
| 1 | package.json, package-lock.json, pnpm-lock.yaml, next.config.ts |
| 2 | supabase/migrations/..., src/lib/database.types.ts |
| 3 | src/lib/env.ts |
| 4 | src/lib/supabase-server.ts (D), src/lib/supabase/*, src/middleware.ts |
| 5 | src/app/auth/* |
| 6 | src/app/login/*, src/app/not-a-member/*, src/app/portal/*, src/app/error.tsx |
| 7 | src/app/actions/applications.ts, src/app/actions/waitlist.ts |
| 8 | src/app/layout.tsx, src/app/page.tsx, ApplicationForm.tsx (D), terminal-card.tsx |
| 9 | src/types/index.ts |
| 10 (opt) | .claude/ |
