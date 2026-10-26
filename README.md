# Inspire Business Academy

A responsive academy website and student learning portal for **The Inspire Business Academy**, Sadiqabad, Pakistan.

## What’s included

- Public website: home, about, course catalogue, skills, announcements, student showcase, and admissions/contact.
- Student portal: registration/login, profile, assignments, file uploads, submission history, attendance, and notifications.
- Admin area: student management, assignment/submission review, and academy administration tools.
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
5. In the Supabase SQL Editor, run `supabase/admin_setup.sql` for the academy schema, RLS policies, storage buckets, and auth triggers. Then apply both committed migrations in order: `supabase/migrations/20261026_admission_inquiries.sql` and `supabase/migrations/20261026_harden_admin_rpc.sql`.
6. Install dependencies and start the app:

   ```bash
   npm install
   npm run dev
   ```

The development server serves the React app and the `/api/*` endpoints together.

## Build and checks

```bash
npm run build
npm run lint
npm test
```

## Security notes

- Never put a Supabase service-role key or `sb_secret_*` key in a `VITE_*` variable or browser bundle.
- The admission form uses the public/anon key with a database policy that permits insert-only access to the inquiry table; public visitors cannot read or update inquiries.
- Keep secrets in your deployment platform’s environment/secrets settings, not in Git.
- Create/approve academy administrator accounts only through the configured server-side admin allowlist and Supabase admin workflow.

## Deployment

Deploy the Node server with the same environment variables, build the frontend with `npm run build`, and ensure the hosting service supports a long-running Node/Express process. Configure Supabase Auth redirect URLs for the production domain and verify storage policies before accepting real student uploads.

## Academy contact

**The Inspire Business Academy**  
Near Shimla Point, beside NGS School Mehrabad, Sadiqabad, Punjab, Pakistan  
WhatsApp: [0309 3534289](https://wa.me/923093534289)

*Learn • Earn • Grow*
