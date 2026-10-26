# 04 — UI/UX Design Brief
**Product:** The Inspire Business Academy Platform · v1.0 · Derived from the existing app's visual language (blue-900 headers, yellow accent, Inter, rounded cards) and expanded into a desktop-first-capable, mobile-first responsive system. Routes/screens: `03_App_Flow.md`.

## 1. Design intent
Professional, trustworthy, youthful academy brand for Pakistani students and parents. Feels like a modern edtech product — **not** a phone mock-up inside a desktop page (the old 400 px simulator frame is removed). Tone: confident, encouraging ("Learn • Earn • Grow"). Four visually consistent surfaces: **Public**, **Student**, **Junior Admin**, **Senior Admin** (admin = denser, table/data oriented; student = friendly, rounded, motivational).

## 2. Brand & colour system (CSS variables / Tailwind v4 `@theme`)
| Token | Value (Tailwind ref) | Use |
|---|---|---|
| `--brand-900` | `#1E3A8A` (blue-900) | Headers, hero, sidebar (student), primary dark |
| `--brand-700` | `#1D4ED8` (blue-700) | Primary buttons, links, active nav |
| `--brand-600` | `#2563EB` | Hover/secondary actions |
| `--brand-50/100` | `#EFF6FF / #DBEAFE` | Soft backgrounds, active chips |
| `--accent-400/500` | `#FACC15 / #EAB308` (yellow) | Accent word "BUSINESS ACADEMY", CTA "Apply Now", FAB, highlights (text on yellow = brand-900) |
| `--success` | `#16A34A` (green-600) / bg `#F0FDF4` | Completed, ≥ thresholds |
| `--warning` | `#CA8A04` / bg `#FEFCE8` | Mid progress, insights |
| `--danger` | `#DC2626` / bg `#FEF2F2` | Errors, low progress, destructive |
| `--info` | `#4F46E5` (indigo-600) | Weekly reports, info |
| Module accents (kept from app) | Tasks blue · Reports indigo · Portfolio purple · Targets yellow · Learning green · Courses teal · Games orange/indigo · Shortcuts pink/purple · Chatbot teal | Icon chips on dashboard tiles |
| Neutrals | gray-50 page bg `#F9FAFB`, gray-100 borders, gray-500 secondary text, gray-800 body text, gray-900 dark | |
| Dark mode | Not at launch (P2). Variables prepared; games keep their dark themes (quiz/shooter gray-900, bubble cyan-950). |
Contrast: body text ≥ 4.5:1 (gray-800 on white ✔; white on blue-900 ✔; **never** yellow-400 text on white — use on blue-900 only; brand-900 on yellow ✔). Status never by colour alone (icon + label).
Logo: existing academy logo (currently hot-linked from postimg) → re-hosted in `public/images/logo.png` (final asset via images workflow). Favicon from logo; OG default image 1200×630.

## 3. Typography
Font **Inter** (400/500/600/700/800) via Google Fonts with `font-display: swap`, fallback `system-ui, sans-serif`. Scale (rem): Display 3–3.75 (hero, extrabold, tracking-wide, uppercase brand name) · H1 2–2.25 · H2 1.5 · H3 1.25 · Body 1 (16 px minimum on mobile inputs to avoid iOS zoom) · Small 0.875 · Caption 0.75 · Overline 0.6875 uppercase tracking-wider (section labels like the original "CORE TARGETS"). Line height 1.5 body, 1.2 headings. Roman-Urdu text uses same font; Urdu script (P2) → *Noto Nastaliq Urdu* / *Noto Sans Arabic* with RTL.

## 4. Layout & grid
Container max-width 1200 px (public), 1280 px (app content area); 12-col grid desktop, 4-col mobile; spacing scale 4 px base (4/8/12/16/24/32/48/64); section padding public 64–96 px desktop / 40 px mobile. Radii: inputs/buttons 12 px, cards 16 px, hero blocks/modals 24 px, avatars full. Shadows: `sm` cards, `md` hover, `xl` modals. Breakpoints: `sm 640 · md 768 · lg 1024 · xl 1280`.
- **Public:** sticky white header (blur on scroll), full-bleed hero in `brand-900` with soft yellow/blue blurred shapes (reuse Splash decoration), alternating white/gray-50 sections, rich footer (dark blue-950).
- **Student desktop:** fixed left sidebar 260 px (brand-900, white text, active item brand-50/yellow marker), top bar 64 px (search, bell, avatar), content gray-50. Pages open with a **page header band** (title, subtitle, actions) echoing the original rounded blue headers (rounded-b-2xl on mobile, flat on desktop).
- **Student mobile:** top app bar + bottom tab bar (5 items + More sheet); safe-area padding; thumb-reachable primary actions (FAB for upload, sticky Save buttons).
- **Admin:** collapsible sidebar (slate-900 for Senior, blue-950 for Junior to make the role instantly recognisable + role badge in header), top bar with global search, breadcrumbs; data tables with sticky header, column toggles, row hover, right-side detail drawers (480–640 px) to keep context.

## 5. Component library (build once in `components/ui`, used everywhere)
| Component | Spec |
|---|---|
| **Button** | variants primary (brand-700), accent (yellow, brand-900 text), secondary (white/border), ghost, danger; sizes sm/md/lg (min 44 px touch height); loading spinner; icon-left/right; focus ring 2 px brand-600 + offset |
| **Input / Select / Textarea / NumberInput** | 12 px radius, gray-200 border, focus brand-600 ring; label above (required asterisk red + `aria-required`), helper & error text below (`aria-describedby`); NumberInput with +/− steppers and target suffix "/ 30" |
| **Card** | white, border gray-100, shadow-sm, p-4/5; variants: stat, tile (icon circle + label, active:scale-95), list-row, project card (16:10 thumbnail, title, chips, author) |
| **ProgressBar / ProgressRing** | 8–10 px rounded track gray-100; fill colour by rule (tasks: ≥100 green, ≥50 yellow, else red; targets: ≥80/≥40); animated width (motion, disabled for reduced-motion); ring = SVG circle path (as original performance score) with centre number |
| **Badge/Chip** | status colours: Draft gray, Submitted blue, Under review indigo, Changes requested amber, Approved teal, Published green, Rejected red, Archived slate; skill/category chips outline |
| **Tabs / Segmented control** | Showcase/Practice, Daily/Weekly/Monthly; keyboard arrow navigation |
| **Accordion** | Learning sections, course modules, FAQ (`aria-expanded`), chevron rotation |
| **Modal / Drawer / BottomSheet / ConfirmDialog** | focus trap, Esc to close, scroll lock, mobile = bottom sheet with drag handle; ConfirmDialog states consequence ("This assigns a permanent roll number") |
| **Toast (sonner)** | top-right desktop / top-center mobile, 4 s, success/error/info with icon |
| **Table** | responsive: becomes stacked cards < 768 px; sort, filter bar, pagination (page size 10/25/50), bulk-select |
| **FileDropzone / UploadCard** | dashed brand-200 border, drag-over highlight, camera option on mobile, progress, retry, cancel, type/size hints |
| **MarkdownView / MarkdownEditor** | typographic styles for lessons (h2/h3, lists, bold, code, tables); editor split (textarea + preview tabs on mobile) |
| **Charts (Recharts)** | brand palette (blue-600, indigo-500, yellow-400, green-500), tooltips, accessible data table fallback |
| **NotificationBell** | badge count (max 9+), dropdown latest 5, [View all] |
| **SearchPalette** | `Ctrl/⌘+K` modal, grouped results, arrow-key nav |
| **EmptyState / ErrorState / Skeleton / OfflineBanner / PermissionGate** | illustrated icon (lucide, 48 px, gray-300), 1–2 lines, CTA |
| **Avatar** | image or initials on brand-100; roll-number chip `IBA-2026-0001` monospace with copy |
| **Stepper** | application wizard with progress dots and step names |
| **GameShell** | full-screen themed container with HUD, pause/quit, result card |

## 6. Page patterns & key screen directions
- **Public Home:** Hero (H1 "THE INSPIRE **BUSINESS ACADEMY**" yellow second line, subline "Learn • Earn • Grow", two CTAs, hero illustration/photo of students — real photo from owner; fallback abstract shapes), trust bar (stats), "Skills you can learn" icon grid (6 skills), course cards, featured projects (3–6 cards), how admission works (4 steps: Register → Apply → Approval → Start learning), testimonials/achievements (when available), announcements strip, contact card with big WhatsApp button, footer.
- **Portfolio:** masonry/grid of project cards; sticky filter bar (search, category chips, sort); project page = large gallery + sticky info panel (tools, tags, links, share).
- **Student Dashboard:** greeting + roll chip; two-column desktop (left 2/3: today's progress, insights, assignments; right 1/3: streak card with flame, performance ring, announcements); mobile single column; 8+ quick tiles in 2×N grid with coloured icon circles (as original).
- **Daily Tasks:** big touch-friendly rows; number input right-aligned with steppers; progress bar under each row; sticky bottom "Write today's report"; "Saved ✓" micro-feedback.
- **Reports:** hub with ring + insights + chart card; forms single-column max-w-xl, grouped sections (Metrics / Reflection) with section headers in overline style; required fields marked; sticky Save.
- **Courses/Lessons:** lesson page two-column desktop (left outline tree, right article max-w-prose 70ch); mobile outline in a bottom-sheet; progress bar at top; "Mark as Read" sticky footer.
- **Portfolio workspace:** file grid with hover overlay (eye icon), list mode compact; FAB yellow "+" bottom-right; preview lightbox dark overlay.
- **Games:** each themed (Quiz dark with HP hearts; Puzzle light blue; Memory purple flip cards with 3D rotateY; Shooter dark with animated enemy; Bubble cyan floating bubbles). Keep original playful look; ensure keyboard/tap alternatives and `prefers-reduced-motion` simplifies movement (enemy changes position without animation).
- **Admin:** KPI card row (4–6 across), chart grid, "Needs attention" tables; detail drawers; filter bars persisted in URL query; audit log monospace JSON viewer.
- **Auth pages:** split layout — left brand panel (logo, tagline, benefits), right form card; mobile = form only with logo on top.

## 7. Interaction & motion
Use `motion` sparingly: route fade/slide 200–300 ms (as original), card fade-up stagger ≤ 50 ms, progress bar fills 500–800 ms ease-out, accordion height animate, modal scale/slide. Streak flame subtle pulse when ≥ 3. Confetti-free; celebratory states are text + icon (🏆 "Amazing work!"). `prefers-reduced-motion`: disable transforms/stagger, keep opacity only. No auto-playing media with sound.

## 8. Forms & validation UX
Inline validation on blur and on submit; error text in danger colour with icon; summary banner for long forms; field-level server errors mapped; disabled primary button until valid for report forms (as original) **with** explanation tooltip ("Fill the required fields marked *"); phone input accepts `03xx-xxxxxxx`/`+92`; password field with show/hide + strength meter; autosave indicators for application draft and daily log; dirty-form leave-prompt; numeric inputs: `inputmode="numeric"`, no negative; date fields use native pickers on mobile.

## 9. Responsive behaviour
| Width | Behaviour |
|---|---|
| < 640 | Single column; bottom tab bar (student); tables → cards; modals → bottom sheets; hero H1 2rem; hide secondary chart legends |
| 640–1023 | 2-column grids; sidebar collapsed to icons (admin) / drawer (student) |
| ≥ 1024 | Full sidebar; 3–4 column grids; drawers on the right |
Touch targets ≥ 44×44 px; no horizontal scroll (except chip rows with fade edge); images `object-fit: cover` with fixed aspect ratios to avoid layout shift; test at 360×640, 768×1024, 1440×900. Low-end devices: avoid heavy blur/backdrop-filter on lists, lazy-load games/charts.

## 10. Accessibility (WCAG 2.1 AA)
Semantic landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page, skip-to-content link; visible focus; full keyboard operation (accordions, tabs, dialogs, drag-reorder puzzle has Up/Down buttons); `aria-live="polite"` for toasts, autosave status and search result counts; labels for all inputs & icon-only buttons (`aria-label`); alt text for all project images (required field "Image description" on upload, default title); form errors announced; colour is never the only indicator; zoom to 200 % without loss; captions/transcripts guidance for video; reduced-motion respected; language attribute `lang="en"` with `lang="ur" dir="rtl"` for Urdu fragments. axe-core in CI.

## 11. Imagery & icons
Icons: **lucide-react** (consistent 1.75–2 px stroke; sizes 16/20/24). Course icons: full mapping for Monitor, FileText, Table, Presentation, Image, Video, Bot, Youtube, Code, Facebook, Megaphone, ShoppingCart, TrendingUp (fixes the original fallback bug). Photography: real academy/student photos (owner-supplied), warm, natural; no stock handshake clichés. Illustrations (if AI-generated): flat, blue/yellow palette, rounded shapes, transparent PNG. Project thumbnails 16:10 (min 1280×800), WebP/JPG, auto-resized; avatars 512×512. All images lazy-loaded with width/height; placeholders gray-100 shimmer.
(Final image list/IDs/URLs are produced later in the **Images workflow**; until then use neutral gradient placeholders — never random stock URLs.)

## 12. Content & voice
English UI; encouraging Roman-Urdu microcopy retained where it came from the original (e.g. daily reminder). Short, active labels ("Save Report", "Submit for review"). Error copy is helpful and blame-free ("We couldn't upload this file. Check your internet and try again."). Currency "Rs 1,500"; dates "24 Oct 2026"; time 12-hour with PKT. Numbers use Western digits.

## 13. Public vs authenticated visual differences
Public: larger type, generous whitespace, marketing imagery, yellow CTAs. Student: compact friendly cards, progress-centric visuals, streak/gamification accents. Admin: neutral, information-dense, role-colour sidebar, no decorative imagery; destructive/approval actions clearly separated with confirmation.

## 14. Design deliverables expectation for AI Studio
Implement tokens in `src/styles/index.css` using Tailwind v4 `@theme`; create the component library first (see `06_Implementation_Plan.md` step 2); every screen uses shared components only; no inline one-off colours outside tokens; no `alert/confirm/prompt`; no phone-frame wrapper; keep the original celebratory and playful tone in student areas.
