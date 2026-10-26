/**
 * Final End-to-End Verification Test Suite
 * Inspire Business Academy — Vercel Preview Readiness
 */

import fs from 'fs';
import path from 'path';
import {
  BOOTSTRAPPED_ADMIN_EMAILS,
  isBootstrappedAdminEmail,
  SUBMISSIONS_STORAGE_BUCKET,
  PUBLIC_PORTFOLIOS_STORAGE_BUCKET
} from '../src/academy/supabase';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`[PASS] ${testName}`);
  } else {
    failed++;
    console.error(`[FAIL] ${testName}`);
    if (detail) console.error(`       ${detail}`);
  }
}

console.log('================================================================');
console.log('INSPIRE BUSINESS ACADEMY — FINAL PRE-DEPLOYMENT E2E VERIFICATION');
console.log('================================================================');

// -----------------------------------------------------------------------------
// 1. Strict Two-Administrator Allowlist Verification
// -----------------------------------------------------------------------------
console.log('\n--- 1. ADMINISTRATOR AUTHORIZATION & LEGACY ACCOUNT GUARDS ---');

assert(
  BOOTSTRAPPED_ADMIN_EMAILS.length === 2,
  'Admin Registry contains exactly two authorized accounts',
  `Found ${BOOTSTRAPPED_ADMIN_EMAILS.length} accounts: ${BOOTSTRAPPED_ADMIN_EMAILS.join(', ')}`
);

assert(
  BOOTSTRAPPED_ADMIN_EMAILS.includes('theinspirebusinessacademy@gmail.com'),
  'Authorized Admin 1 (theinspirebusinessacademy@gmail.com) present'
);

assert(
  BOOTSTRAPPED_ADMIN_EMAILS.includes('huzaifaghori4315@gmail.com'),
  'Authorized Admin 2 (huzaifaghori4315@gmail.com) present'
);

assert(
  isBootstrappedAdminEmail('theinspirebusinessacademy@gmail.com') === true,
  'isBootstrappedAdminEmail returns true for Admin 1'
);

assert(
  isBootstrappedAdminEmail('huzaifaghori4315@gmail.com') === true,
  'isBootstrappedAdminEmail returns true for Admin 2'
);

assert(
  isBootstrappedAdminEmail('hr498412@gmail.com') === false,
  'Legacy account hr498412@gmail.com is strictly excluded from isBootstrappedAdminEmail'
);

assert(
  isBootstrappedAdminEmail('random_student@gmail.com') === false,
  'Arbitrary student email rejected by isBootstrappedAdminEmail'
);

assert(
  isBootstrappedAdminEmail(null) === false && isBootstrappedAdminEmail(undefined) === false,
  'Null and undefined safely handled by isBootstrappedAdminEmail'
);

// Source checks for hr498412 guards in auth context & API
const authContextSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/academy/AcademyAuthContext.tsx'), 'utf-8');
const apiSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/academy/academyApi.ts'), 'utf-8');

assert(
  authContextSrc.includes("const isLegacyStudent = cleanEmail === 'hr498412@gmail.com';") &&
  authContextSrc.includes("!isLegacyStudent"),
  'AcademyAuthContext strictly forces student role for legacy account hr498412@gmail.com'
);

assert(
  authContextSrc.includes("email === 'hr498412@gmail.com'") &&
  authContextSrc.includes("isListedAdmin = false;"),
  'AcademyAuthContext forbids isListedAdmin for hr498412@gmail.com'
);

assert(
  authContextSrc.includes("email !== 'hr498412@gmail.com' &&\n          (existingProfile.role !== 'admin'"),
  'AcademyAuthContext prevents auto-upgrade to admin for hr498412@gmail.com'
);

assert(
  apiSrc.includes("if (email === 'hr498412@gmail.com') {\n    throw new Error('Access denied: Administrator privileges are required for this action.');\n  }"),
  'academyApi.ts explicitly blocks hr498412@gmail.com in assertAdminAuthorized'
);

// -----------------------------------------------------------------------------
// 2. Admin Routing & Normalization Verification
// -----------------------------------------------------------------------------
console.log('\n--- 2. ADMIN ROUTING & HASH ROUTER NORMALIZATION ---');

const appSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf-8');

assert(
  appSrc.includes('path="/admin/login"') && appSrc.includes('<AdminLogin />'),
  'Dedicated route /admin/login registered'
);

assert(
  appSrc.includes('path="/admin"') && appSrc.includes('<AdminDashboard />'),
  'Dedicated route /admin registered'
);

assert(
  appSrc.includes('path="/admin/students"') && appSrc.includes('<AdminStudents />'),
  'Dedicated route /admin/students registered'
);

assert(
  appSrc.includes('path="/admin/students/:id"') && appSrc.includes('<AdminStudentDetail />'),
  'Dedicated route /admin/students/:id registered'
);

assert(
  appSrc.includes("window.location.replace(`${window.location.origin}/#${pathname}${search}`);"),
  'Direct path URL normalizer active (redirects /admin to /#/admin without reload loops)'
);

assert(
  appSrc.includes("isAdminRoute") &&
  appSrc.includes("location.pathname === '/admin'") &&
  appSrc.includes("window.location.hash === '#/admin'"),
  'AppContainer routes directly to AdminRoutes when visiting admin hash or path'
);

// -----------------------------------------------------------------------------
// 3. Absence of Visible Admin Entry Points
// -----------------------------------------------------------------------------
console.log('\n--- 3. VISIBILITY AUDIT: PUBLIC & STUDENT SURFACES ---');

const homeSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/screens/Home.tsx'), 'utf-8');
const hubSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/academy/AcademyHub.tsx'), 'utf-8');
const loginSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/academy/AcademyLogin.tsx'), 'utf-8');
const bottomNavSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/components/BottomNav.tsx'), 'utf-8');

assert(
  !homeSrc.includes('Admin Console') && !homeSrc.includes('/admin'),
  'src/screens/Home.tsx has NO Admin Console card or /admin links'
);

assert(
  !hubSrc.includes('Admin Console Available') && !hubSrc.includes('/admin'),
  'src/academy/AcademyHub.tsx has NO Admin Console Available banner or /admin links'
);

assert(
  !loginSrc.includes('Academy Staff & Admin Sign In') && !loginSrc.includes('/admin/login'),
  'src/academy/AcademyLogin.tsx has NO staff/admin sign-in links'
);

assert(
  !bottomNavSrc.includes('/admin'),
  'src/components/BottomNav.tsx has NO admin links'
);

assert(
  homeSrc.includes("path: '/academy'") && homeSrc.includes("path: '/public-portfolio'"),
  'Student Portal and Public Showcase buttons remain intact on Home dashboard'
);

// -----------------------------------------------------------------------------
// 4. Core Workflows & Storage Security
// -----------------------------------------------------------------------------
console.log('\n--- 4. WORKFLOW ARCHITECTURE & STORAGE CONTRACT ---');

assert(
  SUBMISSIONS_STORAGE_BUCKET === 'academy-submissions',
  'Private submissions bucket constant is academy-submissions'
);

assert(
  PUBLIC_PORTFOLIOS_STORAGE_BUCKET === 'public-portfolios',
  'Public portfolios bucket constant is public-portfolios'
);

const sqlSrc = fs.readFileSync(path.resolve(process.cwd(), 'supabase/admin_setup.sql'), 'utf-8');

assert(
  sqlSrc.includes("bucket_id = 'academy-submissions'") &&
  sqlSrc.includes("public.is_admin()") &&
  sqlSrc.includes("s.is_deleted = false"),
  'Database storage policy uses POSITIVE fail-closed EXISTS verification requiring is_deleted = false'
);

assert(
  /CREATE POLICY "storage_submissions_delete_admin" ON storage\.objects\s+FOR DELETE USING \(\s*bucket_id = 'academy-submissions' AND public\.is_admin\(\)\s*\);/i.test(sqlSrc),
  'Students cannot directly delete files from academy-submissions storage'
);

assert(
  sqlSrc.includes("NEW.rating := OLD.rating;") &&
  sqlSrc.includes("NEW.marks := OLD.marks;") &&
  sqlSrc.includes("trg_protect_submission_review_fields"),
  'Ratings and marks can only be updated by verified administrators (enforced by trigger)'
);

const doesNotCallRemove = !/approveDeleteRequestAsAdmin[\s\S]*supabase\.storage[\s\S]*\.remove\(/i.test(apiSrc);
const updatesIsDeleted = /approveDeleteRequestAsAdmin[\s\S]*update\(\{\s*is_deleted:\s*true/i.test(apiSrc);
assert(
  doesNotCallRemove && updatesIsDeleted,
  'Delete request approval archives record without deleting file from storage'
);

// -----------------------------------------------------------------------------
// 5. Deployment Configuration & Backend Purity
// -----------------------------------------------------------------------------
console.log('\n--- 5. DEPLOYMENT & CLOUD BACKEND AUDIT ---');

const pkgSrc = fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8');
const pkg = JSON.parse(pkgSrc);

assert(
  !pkg.dependencies['firebase'] && !pkg.devDependencies?.['firebase'],
  'package.json contains NO Firebase packages'
);

assert(
  Boolean(pkg.dependencies['@supabase/supabase-js']),
  'Supabase is declared as dependency in package.json'
);

const vercelSrc = fs.readFileSync(path.resolve(process.cwd(), 'vercel.json'), 'utf-8');
const vercel = JSON.parse(vercelSrc);

assert(
  vercel.outputDirectory === 'dist',
  'vercel.json outputDirectory is configured as dist'
);

assert(
  Array.isArray(vercel.rewrites) && vercel.rewrites.some((r: any) => r.destination === '/index.html'),
  'vercel.json configures client-side SPA rewrites to /index.html'
);

const redirectsPath = path.resolve(process.cwd(), 'public/_redirects');
assert(
  fs.existsSync(redirectsPath) && fs.readFileSync(redirectsPath, 'utf-8').includes('/index.html'),
  'Cloudflare Pages SPA rewrite rule configured in public/_redirects'
);

const distIndexPath = path.resolve(process.cwd(), 'dist/index.html');
assert(
  fs.existsSync(distIndexPath),
  'Production build output dist/index.html is compiled and ready'
);

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`TOTAL E2E CHECKS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
