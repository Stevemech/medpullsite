# Deploying MedPull (Next.js) to Vercel

The site is a Next.js app (SSR + API routes + middleware + Postgres), so it
needs a Next-capable host. Vercel is the natural fit. This repo is already
prepared for it: Prisma targets Postgres, `prisma generate` runs on install and
build, and SEO/OG metadata uses `NEXT_PUBLIC_SITE_URL`.

> The app lives in the **`medpull-app/`** subfolder of the `medpullsite` repo.
> The old static `index.html` at the repo root stays where it is — Vercel only
> builds `medpull-app/`, and once DNS points at Vercel that root site is no
> longer served.

---

## 1. Create a Postgres database (Neon — free tier)

1. Create a project at https://neon.tech (or Supabase / Vercel Postgres).
2. Copy **two** connection strings:
   - **Pooled** (has `-pooler` in the host) → used by the app at runtime.
   - **Direct** (no `-pooler`) → used once to create the tables.
3. Create the schema (run locally, one time):
   ```bash
   cd medpull-app
   DATABASE_URL="<DIRECT postgres url>" npx prisma db push
   ```
   This creates every table (leads, messages, intake, interns, etc.).
   Optionally seed demo interns: `DATABASE_URL="<direct url>" npm run seed:interns`

## 2. Import the repo into Vercel

1. https://vercel.com → **Add New → Project** → import `Stevemech/medpullsite`.
2. **Root Directory: `medpull-app`** (important — the app is in this subfolder).
3. Framework preset auto-detects **Next.js**. Leave build/install commands default
   (`npm run build` already runs `prisma generate`).

## 3. Environment variables (Vercel → Project → Settings → Environment Variables)

Set these for **Production** (and Preview if you want):

| Variable | Value |
|---|---|
| `DATABASE_URL` | the **pooled** Neon URL (add `?sslmode=require`) |
| `NEXT_PUBLIC_SITE_URL` | `https://medpull.org` |
| `ADMIN_PASSWORD` | a strong secret (admin dashboard) |
| `INTERN_PASSWORD` | a strong secret (intern dashboard) |
| `INTAKE_ENCRYPTION_KEY` | a fresh 32-byte base64 key (see below) — **set once and never change it**, or existing encrypted intake becomes unreadable |
| `DEFAULT_LEAD_TIMEZONE` | `America/Los_Angeles` (or your default) |

Generate the encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Optional (features stay off/no-op until set):
`NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `CAL_COM_URL`,
`SMS_DRY_RUN` (keep `"true"` until A2P is approved), `TWILIO_ACCOUNT_SID`,
`TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`.

Then **Deploy**. You'll get a `*.vercel.app` URL — open it and verify the site,
submit the popup, and log in at `/admin` to confirm the lead landed.

## 4. Point medpull.org at Vercel

medpull.org currently resolves to **GitHub Pages** (DNS is in Route 53).

1. In Vercel → Project → **Domains** → add `medpull.org` and `www.medpull.org`.
   Vercel shows the exact records to set.
2. In **Route 53** (hosted zone for medpull.org), update:
   - Apex `medpull.org`: replace the GitHub Pages **A** records
     (185.199.108–111.153) with Vercel's **A** record → `76.76.21.21`
     (or an ALIAS/ANAME to `cname.vercel-dns.com` if your registrar supports it).
   - `www.medpull.org`: **CNAME** → `cname.vercel-dns.com`.
3. In the **GitHub repo → Settings → Pages**, remove the custom domain
   (`medpull.org`) so Pages stops claiming it, and delete the root `CNAME` file
   on a later cleanup commit.
4. Wait for DNS to propagate; Vercel auto-issues the TLS cert. medpull.org now
   serves the Next.js app.

## 5. After it's live

- **Auto-deploys:** Vercel rebuilds on every push to the production branch
  (`main`). Schema changes need another `prisma db push` against the prod DB.
- **Twilio inbound webhook:** point your number's "A message comes in" to
  `https://medpull.org/api/sms/inbound`.
- **Connection limits:** the pooled `DATABASE_URL` is what keeps serverless
  functions from exhausting Postgres connections — don't swap it for the direct
  URL at runtime.

## Local development note

The app now uses Postgres in every environment. For local `npm run dev`, point
`DATABASE_URL` at any Postgres (a free Neon dev branch or a Docker postgres),
then `npx prisma db push`. (SQLite is no longer the local default.)
