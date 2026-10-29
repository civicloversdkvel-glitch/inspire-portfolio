# Inspire Business Academy

A responsive academy website and student learning portal for **The Inspire Business Academy**, Sadiqabad, Pakistan.

## What’s included

- Public website: home, about, course catalogue, skills, announcements, student showcase, and student support.
- Student portal: registration/login, profile, assignments, file uploads, submission history, attendance, and notifications.
- Admin area: student management, assignment/submission review, academy announcements, and a lead inbox for admission inquiries.
- AI academic assistant endpoint with optional server-side Gemini configuration.
- Supabase-backed authentication, database policies, and private assignment storage.
- Responsive layout, SEO/social metadata, and WhatsApp contact paths.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- React Router
- Supabase Auth, Postgres, and Storage
- Express server for API routes

## Local setup

1. Install a supported recent Node.js release (Node 20+ recommended).
2. Copy `.env.example` to `.env`.
3. Set the Supabase project URL and **publishable/anon** key:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - For the server inquiry route, set `SUPABASE_URL` and `SUPABASE_ANON_KEY` to the same project URL and publishable/anon key, or use the `VITE_*` fallbacks.
4. Configure `GEMINI_API_KEY` only if the AI assistant should use Gemini.
5. In the Supabase SQL Editor, run `supabase/admin_setup.sql` for the academy schema, RLS policies, storage buckets, and auth triggers. Then apply each migration once, in order: `supabase/migrations/20261026_academy_foreign_key_indexes.sql`, `supabase/migrations/20261026_admission_inquiries.sql`, `supabase/migrations/20261026_harden_admin_rpc.sql`, and `supabase/migrations/20261028_optimize_rls_policy_overlaps.sql`, and `supabase/migrations/20261028_fix_signup_profile_trigger.sql`. For an existing project, check its migration history first and do not manually replay migrations that are already applied.
6. Install dependencies and start the app:

   ```bash
   bun install
   bun run dev
   ```

The development server serves the React app and the remaining `/api/*` endpoints together. A GitHub Actions workflow runs type-check, production build, and tests on pushes and pull requests to `main`.

## Build and checks

```bash
bun run build
bun run lint
bun run test
```

## Security notes

- Never put a Supabase service-role key or `sb_secret_*` key in a `VITE_*` variable or browser bundle.
- The public admission inquiry form and API have been retired. Legacy inquiry records are retained, but new public submissions are disabled. Student registrations are pending until academy staff approve the student's roll number.
- Keep secrets in your deployment platform’s environment/secrets settings, not in Git.
- Create/approve academy administrator accounts only through the configured server-side admin allowlist and Supabase admin workflow.

## Deployment

**Cloudflare Pages (current deployment):** the frontend builds with `npm run build` into `dist`; the `functions/api/` routes provide `/api/chat` and `/api/inquiry`. Supabase URL/public-key variables are configured for both Production and Preview. Add `GEMINI_API_KEY` as an encrypted Cloudflare secret to enable live Gemini responses; without it, the chat route uses the academy knowledge-base fallback. Configure Supabase Auth redirect URLs for the production and preview domains, and verify private storage policies before accepting real student uploads. The root `server.ts` remains available for local development and deployments to a Node-compatible host.

## Academy contact

**The Inspire Business Academy**  
Near Shimla Point, beside NGS School Mehrabad, Sadiqabad, Punjab, Pakistan  
WhatsApp: [0309 3534289](https://wa.me/923093534289)

*Learn • Earn • Grow*
