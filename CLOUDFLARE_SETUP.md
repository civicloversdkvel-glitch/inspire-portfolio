# Cloudflare Pages deployment

This repository deploys as a Vite static site with Cloudflare Pages Functions for the server-side `/api/*` endpoints.

## Required Pages variables

The following non-secret Supabase project settings are configured for both **Production** and **Preview** in the Cloudflare Pages project:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GEMINI_MODEL`

The Supabase publishable key is intended for public client applications. Never use a Supabase `service_role` key or `sb_secret_*` key in a `VITE_*` variable or browser bundle.

## Optional AI assistant

For Gemini responses, open Cloudflare Dashboard → Workers & Pages → `inspire-portfolio` → Settings → Variables and Secrets. Add `GEMINI_API_KEY` as an **encrypted secret** separately for Production and Preview, then redeploy. The key is intentionally not stored in Git or in the Vite environment.

When the key is absent or Gemini is temporarily unavailable, `/api/chat` returns the academy knowledge-base fallback. The model is configured by `GEMINI_MODEL` (currently set to `gemini-3.8-flash`) and can be changed without editing code.

## API routes

- `POST /api/inquiry`: validates admissions form data and stores it through Supabase using the public key and database RLS; it does not use an elevated service key.
- `POST /api/chat`: uses the encrypted Gemini key when configured, otherwise returns a helpful local academy response.

The in-memory request guard is a best-effort per-isolate safeguard, not a substitute for account-level Cloudflare rate-limiting rules. For a public production site, consider adding a Cloudflare rate-limiting rule to `/api/chat` and `/api/inquiry`.

## Local setup

1. Copy `.env.example` to `.env`.
2. Fill in the Supabase project URL and public publishable/anon key.
3. Add `GEMINI_API_KEY` only if Gemini is required.
4. Run `bun install`, `bun run build`, and `bun run test`.
