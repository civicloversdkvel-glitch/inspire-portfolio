# 06 — Implementation Plan (internal execution plan for Google AI Studio)
**Product:** The Inspire Business Academy Platform · v1.0
**Audience:** Google AI Studio (Pass 1 message: `Follow the plan`; Pass 2 message: compare & finalize) — and later ChatGPT (Supabase setup + PR changes).
This is **one internal build order**, not a set of user prompts. Build everything in this single run, in this order, then self-check against §9–§10. Source of truth for names: `05_Backend_Schema.md`. Requirements: `01_PRD.md`; technical rules: `02_TRD.md`; screens/flows: `03_App_Flow.md`; look & feel: `04_UI_UX_Design_Brief.md`.

---

## 0. Ground rules (read first)
1. **Stack:** React 19 + TypeScript (strict) + Vite + Tailwind CSS 4 + `react-router-dom` (BrowserRouter via `createBrowserRouter`) + `motion` + `lucide-react` + `@tanstack/react-query` + `react-hook-form` + `zod` + `@supabase/supabase-js` + `recharts` + `react-markdown` (+`remark-gfm`, `rehype-sanitize`) + `react-helmet-async` + `date-fns` + `date-fns-tz` + `sonner` + `jszip`. Nothing else without reason.
2. **No Supabase project exists yet.** Write Supabase-ready code: all data access only in `src/services/*`, using exact table/column/RPC names from `05_Backend_Schema.md`. Read `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `import.meta.env` — never hardcode keys, never create database, never use a service-role key anywhere in frontend code.
3. **Preview mode:** if env vars are missing, the app must still run in AI Studio: `src/lib/env.ts` exports `isBackendConfigured`; when false, services route to `src/services/demo/*` (in-memory, non-persistent sample data built from `src/data/seed/*`, one fake student and fake admin selectable on the login page marked **"PREVIEW — not real accounts"**). Demo adapters must implement the same function signatures as the real services so switching is automatic. Demo code is isolated in `services/demo/` and disabled whenever `isBackendConfigured` is true. **Never** store real data in `localStorage` (only UI prefs).
4. **Remove from original:** phone-frame wrapper, `MemoryRouter`, bottom-nav-only navigation, `window.prompt/alert/confirm`, localStorage/IndexedDB data layer, client-side Gemini calls & API-key modal, `vite.config.ts` `define` of `GEMINI_API_KEY`, Capacitor packages & `android/` folder, `express`, `dotenv`, `framer-motion`, duplicate `vite`, `bun.lock`.
5. **Preserve every original feature** listed in `01_PRD.md` Part A (F-01…F-32) in its target form (FR IDs). Keep original business rules/formulas exactly (BR-05…BR-12) and original text strings (task labels, banners, game messages, report field labels).
6. Seed content: the original data files (`coursesContent.ts`, `learningContent.ts`, `shortcutsData.ts`, `gamesContent.ts`) must exist in `src/data/seed/` (copy verbatim; the owner uploads them with the plan). If they are not provided, create the structure with a clearly marked 3-item placeholder and add a `TODO(owner-supplied)` note — **do not invent course content**.
7. TypeScript `strict: true`; no `@ts-ignore`; no `any` in services/domain; ESLint-free `npm run lint` = `tsc --noEmit` must pass; `npm run build` must pass.
8. Accessibility & responsive requirements apply to every screen (see `04`).

---

## 1. Step 1 — Repository setup & cleanup
- `package.json`: name `inspire-business-academy`; scripts `dev` (`vite --port=3000 --host=0.0.0.0`), `build` (`vite build`), `preview`, `lint` (`tsc --noEmit`), `test` (`vitest run`); add dependencies above; remove those listed in Rule 4.
- Files: `.npmrc` containing exactly `legacy-peer-deps=true`; keep **only** `package-lock.json`; `.gitignore` (node_modules, dist, `.env*` except `.env.example`, `.dev.vars`); `.env.example` with placeholders only:
  ```
  VITE_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
  VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
  VITE_SITE_URL="https://YOUR-DOMAIN"
  VITE_APP_NAME="The Inspire Business Academy"
  ```
- `index.html`: title "The Inspire Business Academy", description, theme-color `#1E3A8A`, Inter font preconnect, `lang="en"`.
- `public/_redirects`: `/* /index.html 200`; `public/robots.txt`; `public/_headers` (security headers per TRD §10.4); `public/manifest.webmanifest` (P2 stub); favicon/logo placeholder (`public/images/logo.png`; use the existing logo URL `https://i.postimg.cc/JnQzmwGX/download.png` only as a temporary `LOGO_URL` constant in `lib/constants.ts`).
- `vite.config.ts`: react + tailwind plugins, alias `@` → `./src`, **no `define` secrets**.
- `tsconfig.json`: strict, `paths` `@/* → src/*`.
- Create the directory layout from TRD §2.1 (empty modules with barrel files where helpful).

## 2. Step 2 — Design system & app shell
1. `src/styles/index.css`: Tailwind v4 `@import "tailwindcss"; @theme { … tokens from 04 §2 … }`, Inter, `.no-scrollbar`, reduced-motion media query.
2. `components/ui/*` per `04` §5 (Button, Input, Select, Textarea, NumberInput, Checkbox, Switch, Card, Badge, Tabs, Accordion, Modal, Drawer, BottomSheet, ConfirmDialog, Table, Pagination, ProgressBar, ProgressRing, Skeleton, EmptyState, ErrorState, OfflineBanner, Avatar, FileDropzone, MarkdownView, MarkdownEditor, Stepper, SearchPalette, NotificationBell, StatCard). Each documented with props types.
3. Layouts: `PublicLayout`, `AuthLayout`, `StudentLayout` (sidebar + mobile tab bar + "More" sheet containing all original items), `AdminLayout` (variant `senior|junior`, permission-driven menu).
4. `lib/*`: `supabase.ts` (create client only if configured), `env.ts`, `dates.ts` (Asia/Karachi helpers: `todayPK`, `isoWeekStartPK`, `monthStartPK`, `formatDate`), `format.ts` (`formatPKR`, `formatBytes`), `utils.ts` (`cn`), `queryClient.ts`, `constants.ts` (roles, statuses, limits).
5. `router.tsx` per TRD §2.2 with `RequireRole`, `RequirePermission`, `NotFound`, `Forbidden`, `Suspended`; lazy routes for games, charts, admin, markdown editor.
6. `ErrorBoundary`, toast provider (`sonner`), React Query provider, Helmet provider, auth provider (`useAuth`: session, profile, role, permissions, `signIn/Out`).

## 3. Step 3 — Domain logic (pure, tested)
Implement in `src/domain/` exactly as TRD §2.9 and PRD BR-05…BR-12: `streak.ts`, `performance.ts`, `insights.ts`, `weekly.ts` (best/worst day score = orders×10 + messages; growth), `progress.ts` (course %, learning %), `targets.ts` (effective target resolution student→batch→global), `reports.ts` (period ids, late windows), `games.ts` (xp/level, score clamps). Add Vitest unit tests incl. Karachi midnight (23:55/00:05), Sunday week, month rollover, streak with gaps.

## 4. Step 4 — Types & services layer (Supabase-ready)
- `types/domain.ts` mirroring `05_Backend_Schema.md` tables (snake_case fields) and enums; `types/forms.ts` zod schemas for: signUp, application (all fields §PRD 9.2.1), dailyLog, dailyReport, weeklyReport, monthlyReport, project, portfolioFile, assignmentSubmission, inquiry, profile, settings, cms blocks, quiz/puzzle/memory content, shortcut, announcement, adminInvite.
- `services/_errors.ts` mapping Postgres/RLS error codes; each service exports typed async functions using the **exact** names: e.g. `services/dailyLogs.ts` → `getDailyLog(date)`, `upsertDailyLog(date, patch)` (RPC `upsert_daily_log`), `listDailyLogs(range)`; `services/reports.ts` → `submitReport(kind, payload)` (RPC `submit_report`), `listReports(kind, filters)`, `getReport(kind,id)`, `deleteReport`; `services/applications.ts` → `getMyApplication`, `saveApplicationDraft`, `submitApplication` (RPC `submit_application`); `services/admin/applications.ts` → `listApplications`, `decideApplication` (RPC `decide_application`); `services/projects.ts` → `createProject`, `updateProject`, `submitProject` (RPC `submit_project`), `requestRevision`, `archiveProject`; `services/admin/projects.ts` → `listProjectQueue`, `reviewProject`, `publishProject`, `unpublishProject`, `setFeatured`; `services/storage.ts` → `uploadPortfolioFile` (validation, progress, retry, row insert, rollback on failure), `getSignedUrl`, `deletePortfolioFile`; `services/games.ts` → `submitGameResult`, `getGameProgress`, content getters; `services/search.ts` → `globalSearch` (RPC `global_search`); `services/chat.ts` → `POST /api/chat` with bearer token; `services/notifications.ts`; `services/legacyImport.ts` → parse + `import_legacy_backup`; others per TRD §2.1.
- Public services read **only** `public_*_v` views and RPC `submit_contact_inquiry`.
- `services/demo/*` implement the same signatures with in-memory data (Rule 3).
- Query hooks in `hooks/queries/*` wrap services (keys per module).

## 5. Step 5 — Public website (FR-001…FR-014)
Pages in `features/public/`: Home, About, Courses, CourseDetail (public), Portfolio (list: search, category chips, tag filter, sort, grid/list toggle, pagination), ProjectDetail (gallery lightbox, share, related), StudentPublic, Achievements, Skills, Announcements, Contact (honeypot, success/rate-limit states), Apply (admission entry with steps), Privacy, Terms (CMS-driven text with fallback placeholder `TODO(owner-supplied)`), NotFound/Forbidden/Suspended/Maintenance. Content from `site_content` (fallback constants in `features/public/defaults.ts`: academy name, tagline "Learn • Earn • Grow", owner "Adeel Bhatti", phone/WhatsApp "03093534289", address "Near Shimla Point, Beside NGS School Mehrabad, Sadiqabad"). SEO via Helmet (title/description/OG/canonical per page). Cloudflare Functions: `functions/sitemap.xml.ts`, `functions/portfolio/[slug].ts`.

## 6. Step 6 — Authentication, registration, application
`features/auth/`: Register, VerifyEmail, Login (role-based redirect + `next`), ForgotPassword, ResetPassword, SessionExpired modal, Suspended. `features/application/`: wizard (4 steps, autosave draft, guardian logic for age < 18, Pakistani phone validation, consents), status cards for every `application_status`, withdraw/reopen. Guards: applicants can only reach `/app/application`.

## 7. Step 7 — Student portal (FR-040…FR-069)
Build in this order: Skills selection → Dashboard → Daily Tasks (+history) → Reports hub + Daily/Weekly/Monthly forms + History/detail → Targets → Learning Guide → Courses/CourseDetail/Lesson (Markdown) → Portfolio files workspace (upload modal, preview, edit, move, delete, storage usage) → Projects (form, list, detail, timeline) → Assignments → Games hub + five games (port the original logic with the fixes listed in PRD A3: no stale closures, save result on finish **and** quit, natural end for Bubble Shooter, accessible reorder in Puzzle) → Shortcuts → Search + palette → AI Assistant (UI of original; calls `/api/chat`; fallback mode; no key modal) → Profile (avatar upload) → Notifications → Settings (account, preferences, reminder time, Data page: download JSON, export portfolio ZIP via JSZip, legacy import with preview) → Help.
Keep original UI strings and thresholds (see `03` §3). Daily log autosave debounced 400 ms with "Saved ✓".

## 8. Step 8 — Admin panels (FR-080…FR-102)
`AdminLayout` with permission-aware sidebar (map in `03` §6). Modules: Dashboards (KPI cards + Recharts, filters), Applications (table + drawer + decision dialogs with required reasons + approve confirmation), Students (table + detail tabs + suspend/withdraw + roll-number correction with re-auth dialog), Batches, Reports review, Assignments, Projects moderation (approve/reject/changes **then** separate publish/unpublish, feature), Content management (course/module/lesson tree with Markdown editor + preview, learning sections, skills, targets, game content, shortcuts), Website CMS (draft/preview/publish/revisions, achievements, media), Announcements, Inquiries, Admins & Permissions (invite Junior via Edge Function `admin-invite-junior`), Settings, Analytics & Exports (CSV with confirmation), Audit log viewer, Backups. Every mutation calls the named RPC/service; UI hides what the user cannot do **but never relies on hiding**.

## 9. Step 9 — Polish & QA (self-check before finishing)
- Responsive pass at 360/768/1024/1440; keyboard & focus pass; reduced-motion; empty/loading/error states on every list; confirmation on all destructive actions; no console errors; no `localStorage` data; no secret strings in code (`grep -ri "service_role\|AIza\|sk-"` must be empty).
- `npm run lint` and `npm run build` pass; `dist` generated; `public/_redirects` present.
- Seed counts (when data files provided): 10 courses/39 modules/124 lessons, 8 learning sections/40 subsections, 133 shortcuts, 8 quiz questions, 2 puzzles, 4 memory pairs, 6 skills.
- Create `docs/CHANGELOG-AI-STUDIO.md` listing what was built, what runs in preview mode only, and known gaps.

## 10. Pass 2 checklist (compare & finalize message)
When the same six files are supplied again with *"re-analyse, compare, fix remaining and finalize"*, perform:
1. Walk PRD §9 requirement table FR-by-FR; list missing/partial items and complete them.
2. Compare every service function/table/column/RPC name with `05_Backend_Schema.md`; fix mismatches in code (never rename schema names).
3. Verify routes against PRD §18; guards correct per role/permission.
4. Verify env handling (`VITE_*`), no hard-coded keys, no service-role usage, preview mode only when unconfigured.
5. Cloudflare readiness: `npm run build`/`dist`, `_redirects`, `_headers`, only `package-lock.json`, `.npmrc`, Functions compile with Web APIs only, `.env.example` complete.
6. Remove dead code & unused deps; ensure bundle splitting (games/charts/admin lazy).
7. Confirm original-feature parity table (F-01…F-32 → FR) is fully implemented; update `docs/CHANGELOG-AI-STUDIO.md`.

## 11. Dependencies between steps
Step 1 → 2 → 3 → 4 are strictly sequential (shell and types before screens). Step 5 and 6 need 2 & 4. Step 7 needs 3, 4, 6. Step 8 needs 4 and the permission model (`useRole`, `usePermission`). Step 9 last. Do not start a screen before its zod schema and service signature exist.

## 12. QA test checklist (to be executed after Supabase setup; maps to PRD AC-xx)
| # | Scenario | Expected | Ref |
|---|---|---|---|
| 1 | Visitor opens `/app` | Redirect to `/login` | AC-01 |
| 2 | Pending applicant calls student-only data | Denied | AC-02 |
| 3 | Student A reads Student B reports/files | None | AC-03 |
| 4 | Student updates own role/approval/roll number | Rejected | AC-04 |
| 5 | Student assigns own roll number | Impossible (no path) | BR-02 |
| 6 | Parallel approvals | Unique roll numbers | AC-05 |
| 7 | Junior without permission performs senior action | Denied + UI hidden | AC-07 |
| 8 | Private/draft project in public search | Absent | AC-08 |
| 9 | Unpublished project file via public URL | 404/denied | AC-08 |
| 10 | File delete/replace | Orphans cleaned | TR-053 |
| 11 | Failed/interrupted upload | No DB row, cleanup queued | AC-13 |
| 12 | Unauthorized DB ops | RLS error | RLS tests |
| 13 | Games/learning after migration | Work like original | F-15…F-23 |
| 14 | Report date boundaries (PKT) | Correct day/week/month | AC-09/10 |
| 15 | Dashboard numbers vs tables | Equal | AC-20 |
| 16 | Suspended user old session | Denied | AC-16 |
| 17 | Bundle/network secrets | None | AC-15 |
| 18 | Public pages private info | None | AC-08 |

## 13. Handoff notes for later stages
- **Images workflow** (after Pass 2): hero, logo, favicon, OG default, course covers, skill icons, empty-state illustrations, team/owner photo; keep component props `src` configurable via `lib/constants.ts` so URL replacement is trivial.
- **AI Gateway** (chatbot): `functions/api/chat.ts` stays a stub returning `503 ai_unavailable` until the Cloudflare-confirmed integration prompt is applied; the frontend fallback mode must already work.
- **GitHub export → ChatGPT**: ChatGPT creates the Supabase project from `05_Backend_Schema.md` + actual code, fixes mismatches by Pull Request only, reports required env variables (TRD §13).
- **Cloudflare**: build `npm run build`, output `dist`, Node 20, set `VITE_*` before deploy.

## 14. Definition of Done (build run)
All P0 and P1 FRs have a screen/route and service call; preview mode usable; lint/build pass; no secrets; names match schema; changelog written; known gaps listed honestly. **Not done** until the Supabase database, RLS tests, admin bootstrap, email provider, Cloudflare AI Gateway and real content are completed in later stages.
