# MedPull — Autonomous Build Run Summary

_Run completed 2026-06-09. All 18 `ai` checklist tasks built, tested, and committed._

MedPull is an AI front-desk / lead-capture product for independent healthcare
clinics. This repo was built autonomously against the live checklist artifact,
implementing every task tagged `ai` (and only those). Stack: **Next.js 15
(App Router) + TypeScript + Tailwind v4 + Prisma**. Local DB is SQLite; the
schema and all data access are written so switching to Postgres is a
connection-string change (no SQLite-only features; statuses are app-validated
strings, money is integer cents). Everything runs via `npm run dev` — no deploy.

## To restore the suppressed sections (without faking it)

Two homepage sections are intentionally **suppressed** (commented out in
`src/app/page.tsx`, code kept) because they require real, verifiable content:

1. **"Trusted by" logo strip** (`<LogoMarquee />`). To restore, you need:
   - A handful of real pilot/customer clinics willing to be named.
   - Written permission to display each clinic's name and/or logo.
   - The logo image assets (drop into `public/`, wire into `LogoMarquee`).

2. **Testimonials + case studies** (`<SocialProof />`, content in
   `src/content/social-proof.ts`). To restore, you need:
   - Real quotes from named clients, with **written consent** to publish their
     name, role, and words (FTC requires endorsements be genuine — current
     entries are representative samples, not real customers).
   - For case studies: verified, clinic-approved metrics (calls recovered,
     booking lift, time-to-live), ideally with the clinic's sign-off.
   - Then set each entry's `placeholder: false` is already done — just replace
     the sample copy/names with the real, consented content and re-add
     `<SocialProof />` (and `<LogoMarquee />`) to `page.tsx`.

The on-page stats are now **cited**: the "why it matters" band uses McQueenie et
al., *BMC Medicine* 2019 (missed appointments & mortality); the problem band
cites industry phone-access analyses. To strengthen further, confirm those
industry figures against primary sources or substitute your own pilot data.

---

## Check these off manually on the artifact

All 18 `ai` tasks are complete in code; tick each box on the checklist:

`p1-1` `p1-2` `p1-3` `p1-5` `p1-6` `p1-8` `p2-1` `p2-2` `p2-6` `p3-1` `p3-2`
`p3-3` `p4-3` `p4-4` `p4-6` `p5-1` `p5-2` `p5-3`

(`manual` and `hybrid` tasks were intentionally not built.)

---

## Task status

| id | title | status | commit |
|----|-------|--------|--------|
| p1-3 | Database backend for popup lead submissions | ✅ done | `a3775f6` |
| p1-2 | Interest popup form with TCPA consent | ✅ done | `2007228` |
| p1-1 | Landing page redesign (Kairos-inspired) | ✅ done | `eff5fc4` |
| p1-6 | Social proof section (placeholder slots) | ✅ done | `9aebc87` |
| p1-8 | EHR integration roadmap page | ✅ done | `c19d93a` |
| p1-5 | PostHog analytics instrumentation | ✅ done | `bf80964` |
| p2-1 | Admin dashboard for leads | ✅ done | `64f375c` |
| p2-2 | Lead scoring | ✅ done | `5af6ed8` |
| p2-6 | Calendar embed (Cal.com) | ✅ done | `05a304b` |
| p3-1 | Twilio SMS module (DRY_RUN) | ✅ done | `3c0a351` |
| p3-2 | Automated follow-up sequence engine | ✅ done | `956253a` |
| p3-3 | Opt-out handling + quiet hours | ✅ done | `cf93309` |
| p4-3 | Multi-step clinic pilot intake form | ✅ done | `fadc887` |
| p4-4 | Secure intake backend | ✅ done | `1828844` |
| p4-6 | Reporting dashboard | ✅ done | `d706577` |
| p5-1 | Referral tracking + commission ledger | ✅ done | `18ed96b` |
| p5-2 | Intern dashboard | ✅ done | `81e1dc1` |
| p5-3 | Pricing tier calculator | ✅ done | `c6527fa` |

Supporting commit: scaffold `10c41da`.
**18 / 18 `ai` tasks done in code.** Check the boxes off manually on the artifact.
`manual` and `hybrid` tasks were never touched, per scope.

Verification at completion: `npm run build` passes, `npm test` → **53 tests
passing** across 13 files, `npm run lint` clean.

---

## What was built (per task)

**p1-3 — Lead DB backend.** `Lead` model (clinic/contact/email/phone, consent +
consentAt, source, status, timestamps). `POST /api/leads` with zod validation.
Key files: `prisma/schema.prisma`, `src/lib/validators.ts`,
`src/app/api/leads/route.ts`.

**p1-2 — Interest popup.** Auto-opens (with a 7-day localStorage snooze) or via
any CTA (`kanthi:open-popup` event); clinic/contact/email/phone + a TCPA consent
checkbox. Posts to the p1-3 backend. Key files: `src/components/LeadPopup.tsx`.
_Placeholder:_ consent copy `CONSENT_PLACEHOLDER` marked `TODO(steve)`.

**p1-1 — Landing page.** Original, clinic-focused page in the spirit of the
reference (studied via `logs/kairos-design-brief.md`): announcement bar, frosted
nav, two-tone hero with a CSS-built dashboard mockup, logo marquee, problem
stats, feature accordion, interactive ROI calculator, 3-step how-it-works, FAQ,
dark CTA + footer. Teal/pine palette and Sora/Inter fonts (kin to the reference,
not a clone); all copy original. Key files: `src/app/page.tsx`,
`src/components/landing/*`, `src/app/globals.css`. _Placeholders:_ all stats and
the ROI model are marked illustrative / `TODO(steve)`.

**p1-6 — Social proof.** Testimonials + case studies rendered from
`src/content/social-proof.ts`; every entry is flagged `placeholder` and badged
"PLACEHOLDER" in the UI, with an empty-state pointing to checklist p1-7. Key
files: `src/components/landing/SocialProof.tsx`.

**p1-8 — EHR roadmap.** `/ehr-roadmap` timeline (calendar live; athenahealth,
Epic planned). Driven by `src/content/ehr-roadmap.ts`; all timeframes/scope are
`TODO(steve)` placeholders.

**p1-5 — Analytics.** PostHog behind `NEXT_PUBLIC_POSTHOG_KEY`, a complete no-op
when unset. Tracks `$pageview` (load + route change) and popup
viewed/started/submitted. Key files: `src/lib/analytics.ts`,
`src/components/AnalyticsProvider.tsx`.

**p2-1 — Admin dashboard.** `/admin`, password-gated by `ADMIN_PASSWORD` via
middleware + a SHA-256 cookie session. Lead list with free-text search, status
filter, sort, and inline status updates (new/contacted/scheduled/closed). Key
files: `src/lib/auth.ts`, `src/middleware.ts`, `src/app/admin/*`,
`src/app/api/admin/*`.

**p2-2 — Lead scoring.** Weighted-rules config in `src/config/lead-scoring.ts`
(consent, work email, source intent, recency, …) + tier thresholds; admin shows
a score/tier column and "highest score" sort. _Placeholder:_ all weights/tiers
`TODO(steve)` to calibrate.

**p2-6 — Calendar embed.** `/book` renders a Cal.com iframe from `CAL_COM_URL`
(auto-prefixes https) and shows a graceful CTA empty state when unset.

**p3-1 — Twilio SMS.** Single send path `sendSms()` logs every attempt to a
`Message` table; **DRY_RUN is default-on** — sends only when `SMS_DRY_RUN=false`
AND Twilio creds exist, otherwise logs to DB/console. Live send uses the Twilio
REST API (no SDK dependency). Suppression + quiet-hours guards are enforced here.
Key files: `src/lib/sms.ts`.

**p3-2 — Follow-up engine.** Configurable steps/delays in
`src/config/followup-sequence.ts`; `runFollowups()` sends the next due step to
active consented leads through the p3-1 module. Idempotent (terminal Message
statuses prevent resend; quiet-hours skips retry). Cron runner:
`npm run followups` (`scripts/run-followups.ts`). _Placeholder:_ message copy
`TODO(steve)`.

**p3-3 — Opt-out + quiet hours.** `POST /api/sms/inbound` (Twilio webhook)
parses STOP/START, manages a `Suppression` table, and logs inbound messages.
No sends outside 8am–9pm lead-local (default `America/Los_Angeles`). Key files:
`src/lib/opt-out.ts`, `src/lib/suppression.ts`, `src/lib/quiet-hours.ts`.
_TODO(steve):_ enable `X-Twilio-Signature` validation in production.

**p4-3 — Pilot intake form.** `/intake` 4-step form (practice details, systems,
volume, contacts) with client + server zod validation. Posts to `/api/intake`.
_Placeholder:_ intake consent copy `TODO(steve)`.

**p4-4 — Secure intake backend.** Separate `IntakeSubmission` + `IntakeAudit`
tables. Sensitive contact fields are **encrypted at rest (AES-256-GCM,
`INTAKE_ENCRYPTION_KEY`)** — the API refuses submissions if the key is unset.
Append-only audit log on create and on admin view. `/admin/intake` decrypts for
review (audited). Key files: `src/lib/crypto.ts`, `src/lib/intake.ts`.

**p4-6 — Reporting dashboard.** `/admin/reports`: form completion & drop-off
rates, a 30-day submissions chart, and the lead status funnel. A server-side
`FormEvent` table + `/api/events` beacon make the funnel work without PostHog.

**p5-1 — Referral tracking.** `Intern` model with unique referral codes; `?ref=`
codes attribute leads on create (signup commission) and accrue a conversion
commission when a referred lead reaches "scheduled". Idempotent via
`@@unique([leadId, kind])`. Ledger in integer cents. Seed: `npm run seed:interns`.
_Placeholder:_ rates in `src/config/commissions.ts` `TODO(steve)`.

**p5-2 — Intern dashboard.** `/intern`, gated by `INTERN_PASSWORD`. Per-intern
referred leads, conversions, commission breakdown (pending/approved/paid/total),
leaderboard sort, and a copyable referral link. Cross-realm isolated from admin.

**p5-3 — Pricing calculator.** `/pricing` interactive calculator recommends a
tier and estimates monthly cost from call volume + locations, driven by
`src/config/pricing-tiers.ts`. _Placeholder:_ all tiers/prices/limits
`TODO(steve)`, badged "PLACEHOLDER" in the UI.

### Autonomous decisions worth noting
- **Palette/fonts shifted** from the reference's green to a teal/pine family with
  Sora/Inter, per the brief's originality guidance — kin, not clone.
- **Shared-password auth** (not multi-user) for admin/intern — appropriate for an
  internal tool; one SHA-256 cookie session, constant-time compare.
- **Field-level encryption refuses to run without a key** rather than silently
  storing plaintext PHI.
- **Money as integer cents** everywhere to avoid float drift.
- **Funnel events stored server-side** so reporting works with zero PostHog setup.
- The repo was scaffolded greenfield — no existing MedPull repo was found on
  Steve's GitHub or in `~/projects`.

---

## Needs Steve

**Env vars to fill (`.env`; see `.env.example`):**
- `NEXT_PUBLIC_POSTHOG_KEY` / `_HOST` — create a PostHog account (checklist p1-4);
  analytics no-op until set.
- `ADMIN_PASSWORD`, `INTERN_PASSWORD` — currently dev defaults
  (`medpull-admin-dev`, `medpull-intern-dev`); set real secrets.
- `CAL_COM_URL` — set up Cal.com (checklist p2-5); booking shows empty state until set.
- `SMS_DRY_RUN` / `TWILIO_*` — finish A2P 10DLC (checklist p0-2); keep DRY_RUN on
  until creds + compliance are ready.
- `INTAKE_ENCRYPTION_KEY` — a dev key is set; generate a real one for production
  (`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)
  and store it securely. **Rotating this key makes existing encrypted intake
  fields unreadable.**

**Placeholder content / copy to replace (all marked `TODO(steve)`):**
- TCPA consent copy (popup) and intake consent copy.
- Landing-page statistics and ROI calculator assumptions.
- Social-proof testimonials + case studies (checklist p1-7).
- EHR roadmap timelines & scope (checklist p0-9).
- Lead scoring weights/thresholds (checklist p0-6).
- Follow-up message copy.
- Commission rates / structure (checklist p0-7).
- Pricing tiers, prices, and limits (checklist p0-8).

**Decisions blocked on Phase 0:**
- HIPAA infrastructure + BAAs (p0-3, p4-1/p4-5) before real PHI flows.
- Build-vs-buy for sales automation (p0-5) — current build is the "custom" path.
- Enable `X-Twilio-Signature` validation on the inbound SMS webhook in production.

---

## How to run

```bash
cd ~/projects/kanthi
cp .env.example .env        # then fill values (a working .env is already present for local dev)
npm install
npm run db:push             # creates the SQLite schema (prisma/dev.db)
npm run dev                 # http://localhost:3000

# optional demo data
npm run seed:interns        # placeholder interns ALEX2026 / SAM2026
```

- **Tests:** `npm test` (Vitest, 53 tests). **Build:** `npm run build`. **Lint:** `npm run lint`.
- **Public pages:** `/` (landing + popup), `/book`, `/ehr-roadmap`, `/intake`, `/pricing`.
- **Admin dashboard:** `/admin` — password `ADMIN_PASSWORD` (dev: `medpull-admin-dev`).
  Sub-pages: `/admin/reports`, `/admin/intake`.
- **Intern dashboard:** `/intern` — password `INTERN_PASSWORD` (dev: `medpull-intern-dev`).
- **Follow-up sequence (cron):** `npm run followups` — safe/idempotent, respects
  DRY_RUN + suppression + quiet hours. Example crontab (every 15 min):
  `*/15 * * * * cd ~/projects/kanthi && npm run followups >> logs/followups.log 2>&1`
- **Inbound SMS webhook:** point your Twilio number's "A message comes in" to
  `POST /api/sms/inbound` (handles STOP/START).
