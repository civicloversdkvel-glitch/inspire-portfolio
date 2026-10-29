# Inspire Business Academy

A responsive public website and private student workspace for **The Inspire Business Academy**, Sadiqabad, Pakistan.

## Student portal

- Student registration and sign-in
- Registration requires the academy-issued roll number
- New accounts remain pending until academy staff verify and approve them
- Approved students can upload assignments and projects, view submission history, and check teacher feedback
- Student profiles, attendance, announcements, and learning resources
- Admin workspace for student verification and assignment/submission review

## Public website

- Academy overview, courses, skills, announcements, and student showcase
- Student support contact details
- Direct links to student registration and login
- Responsive design and SEO/social preview metadata

## Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS 4 and React Router
- Supabase Auth, Postgres, and Storage
- Express server for API routes and optional Gemini academic assistant

## Local setup

1. Use a recent Node.js release (Node 20+ recommended).
2. Copy `.env.example` to `.env`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the Supabase project.
4. Set `GEMINI_API_KEY` only if the AI assistant should use Gemini.
5. Ensure the Supabase schema and policies are installed from `supabase/admin_setup.sql` and the repository's ordered migrations. For an existing project, check migration history first and do not replay already-applied migrations.
6. Install dependencies and start the app:

   ```bash
   bun install
   bun run dev
   ```

## Checks

```bash
bun run lint
bun run build
bun run test
```

GitHub Actions is configured to run type-checking, a production build, and tests for pushes and pull requests to `main`.

## Security

- Never expose a Supabase service-role key or `sb_secret_*` key in browser variables or Git.
- The public admission inquiry form and API have been removed. Legacy inquiry records are retained for history, but public intake is disabled.
- New student accounts start pending. Only academy staff can approve them; pending or inactive accounts cannot access submission records or upload assignment files.
- Admin privileges are controlled by the server-side email allowlist and the academy admin workflow.

## Deployment

The frontend builds to `dist`. The Cloudflare Pages `functions/api/` routes provide the remaining `/api/chat` endpoint. Configure Supabase Auth redirect URLs for production and preview domains, and store any Gemini key as an encrypted deployment secret.

## Academy contact

**The Inspire Business Academy**  
Near Shimla Point, beside NGS School Mehrabad, Sadiqabad, Punjab, Pakistan  
WhatsApp: [0309 3534289](https://wa.me/923093534289)

*Learn • Earn • Grow*
