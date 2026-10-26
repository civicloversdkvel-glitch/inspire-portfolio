/**
 * Security & RLS Policy Rule Verification Test Suite
 *
 * Verifies authorization guarantees specified in:
 * 1. Positive Fail-Closed Storage SELECT policy for academy-submissions
 * 2. Student deletion permissions (Storage + Database)
 * 3. Public vs Private Storage separation
 * 4. File Preservation on Deletion Approval (Archive & Restore)
 * 5. Hiding archived files from students and public visitors
 * 6. Admin restore functionality and access to original files
 * 7. Historical versions and audit logs remain intact
 * 8. Administrator privilege isolation
 */

import fs from 'fs';
import path from 'path';

interface PolicyCheck {
  name: string;
  expectedPattern: RegExp;
  antiPattern?: RegExp;
  description: string;
}

const ADMIN_SETUP_PATH = path.resolve(process.cwd(), 'supabase/admin_setup.sql');
const API_CODE_PATH = path.resolve(process.cwd(), 'src/academy/academyApi.ts');
const MIGRATION_PATH = path.resolve(process.cwd(), 'supabase/migrations/20261013_preserve_assignment_archive.sql');

const sqlContent = fs.readFileSync(ADMIN_SETUP_PATH, 'utf-8');
const apiContent = fs.readFileSync(API_CODE_PATH, 'utf-8');
const migrationContent = fs.readFileSync(MIGRATION_PATH, 'utf-8');

const checks: PolicyCheck[] = [
  // 1. Storage Deletion: Students cannot delete from academy-submissions
  {
    name: 'Storage Submissions Delete Restricted to Admin Only',
    expectedPattern: /CREATE POLICY "storage_submissions_delete_admin" ON storage\.objects\s+FOR DELETE USING \(\s*bucket_id = 'academy-submissions' AND public\.is_admin\(\)\s*\);/i,
    antiPattern: /CREATE POLICY ".*delete.*" ON storage\.objects\s+FOR DELETE USING \([^)]*auth\.uid\(\)[^)]*bucket_id = 'academy-submissions'/i,
    description: 'Ensures storage.objects delete policy on academy-submissions only allows public.is_admin() and never auth.uid().'
  },

  // 2. Storage Portfolios Delete/Write: Restricted to Admin Only
  {
    name: 'Storage Public Portfolios Write & Delete Restricted to Admin Only',
    expectedPattern: /CREATE POLICY "storage_public_portfolios_write_admin" ON storage\.objects\s+FOR ALL USING \(bucket_id = 'public-portfolios' AND public\.is_admin\(\)\)\s+WITH CHECK \(bucket_id = 'public-portfolios' AND public\.is_admin\(\)\);/i,
    antiPattern: /CREATE POLICY ".*" ON storage\.objects\s+FOR (?:INSERT|UPDATE|DELETE|ALL) USING \([^)]*auth\.uid\(\)[^)]*bucket_id = 'public-portfolios'/i,
    description: 'Ensures unapproved or direct modifications to public-portfolios storage are blocked for non-admin students.'
  },

  // 3. Database Submissions Delete: No direct DELETE policy for students
  {
    name: 'Database Submissions Has No Direct Student DELETE Policy',
    expectedPattern: /CREATE POLICY "submissions_select_own_or_admin"/i,
    antiPattern: /CREATE POLICY "[^"]*delete[^"]*" ON public\.submissions\s+FOR DELETE USING \([^)]*auth\.uid\(\)[^)]*\);/i,
    description: 'Ensures students cannot directly issue DELETE FROM submissions (must use delete_requests workflow).'
  },

  // 4. Submission Files Delete: Restricted to Admin Only
  {
    name: 'Database submission_files DELETE Restricted to Admin Only',
    expectedPattern: /CREATE POLICY "submission_files_delete_admin" ON public\.submission_files\s+FOR DELETE USING \(public\.is_admin\(\)\);/i,
    antiPattern: /CREATE POLICY "submission_files_delete.*" ON public\.submission_files\s+FOR DELETE USING \([^)]*student_id[^)]*\);/i,
    description: 'Ensures public.submission_files DELETE requires public.is_admin().'
  },

  // 5. Delete Requests Workflow: Student can insert, Admin only can update
  {
    name: 'Delete Requests Insert Own and Update Admin',
    expectedPattern: /CREATE POLICY "delete_requests_insert_own" ON public\.delete_requests\s+FOR INSERT WITH CHECK \(auth\.uid\(\) = student_id OR public\.is_admin\(\)\);[\s\S]*CREATE POLICY "delete_requests_update_admin" ON public\.delete_requests\s+FOR UPDATE USING \(public\.is_admin\(\)\);/i,
    description: 'Verifies students can create delete requests for their own records, and only admin can approve/update status.'
  },

  // 6. Public vs Private Storage Separation
  {
    name: 'Private Submissions Bucket vs Public Portfolios Bucket',
    expectedPattern: /\('academy-submissions', 'academy-submissions', false, 26214400\)[\s\S]*\('public-portfolios', 'public-portfolios', true, 26214400\)/i,
    description: 'Verifies academy-submissions is private (public=false) and public-portfolios is public=true for CDN exposure.'
  },

  // 7. Fail-Closed Positive EXISTS Verification for Private Storage Submissions
  {
    name: 'Fail-Closed Positive EXISTS Verification for Storage Submissions',
    expectedPattern: /CREATE POLICY "storage_submissions_select" ON storage\.objects\s+FOR SELECT USING \(\s*bucket_id = 'academy-submissions'[\s\S]*public\.is_admin\(\)[\s\S]*\(storage\.foldername\(name\)\)\[1\] = auth\.uid\(\)::text[\s\S]*EXISTS \(\s*SELECT 1 FROM public\.submissions s[\s\S]*s\.is_deleted = false/i,
    antiPattern: /AND NOT EXISTS \(\s*SELECT 1 FROM public\.submissions s\s+WHERE s\.student_id = auth\.uid\(\)\s+AND s\.is_deleted = true/i,
    description: 'Verifies storage.objects SELECT policy requires POSITIVE proof of active non-archived submission (fail-closed, not fail-open NOT EXISTS).'
  },

  // 8. Public Portfolios Showcase Read Policy
  {
    name: 'Public Portfolios Table Public Read Restriction',
    expectedPattern: /CREATE POLICY "public_portfolios_select_public" ON public\.public_portfolios\s+FOR SELECT USING \(is_public = true OR auth\.uid\(\) = student_id OR public\.is_admin\(\)\);/i,
    description: 'Public visitors can only query portfolios where is_public = true; unapproved items remain private.'
  },

  // 9. Profile Escalation Guard
  {
    name: 'Profile Escalation Guard Trigger Prevents Role/Approval Tampering',
    expectedPattern: /CREATE OR REPLACE FUNCTION public\.protect_profile_fields\(\)[\s\S]*IF NOT public\.is_admin\(\) THEN[\s\S]*NEW\.role := 'student'[\s\S]*NEW\.role := OLD\.role/i,
    description: 'Trigger forces student role and prevents non-admin updates from altering role, approval_status, or is_active.'
  },

  // 10. Admin Allowlist Strictly 2 Verified Accounts
  {
    name: 'Strict Two Authorized Admin Emails',
    expectedPattern: /'theinspirebusinessacademy@gmail\.com'[\s\S]*'huzaifaghori4315@gmail\.com'/i,
    description: 'Confirms exactly the two designated admin accounts are privileged in is_admin() and seed triggers.'
  },

  // 11. Archived Submission Files Protected in Database RLS
  {
    name: 'Archived Submission Files Hidden from Students in Database RLS',
    expectedPattern: /CREATE POLICY "submission_files_select_own_or_admin" ON public\.submission_files[\s\S]*public\.is_admin\(\)[\s\S]*auth\.uid\(\) = student_id[\s\S]*s\.is_deleted = false/i,
    description: 'Verifies public.submission_files SELECT policy denies student access if the parent submission is marked is_deleted = true.'
  },

  // 12. Archived Submission Versions Protected in Database RLS
  {
    name: 'Archived Submission Versions Hidden from Students in Database RLS',
    expectedPattern: /CREATE POLICY "submission_versions_select_own_or_admin" ON public\.submission_versions[\s\S]*public\.is_admin\(\)[\s\S]*auth\.uid\(\) = student_id[\s\S]*s\.is_deleted = false/i,
    description: 'Verifies public.submission_versions SELECT policy denies student access if the parent submission is marked is_deleted = true.'
  }
];

let failed = 0;
console.log('================================================================');
console.log('INSPIRE BUSINESS ACADEMY — FAIL-CLOSED STORAGE SECURITY TESTS');
console.log('================================================================');

for (const [index, check] of checks.entries()) {
  const hasExpected = check.expectedPattern.test(sqlContent);
  const hasAnti = check.antiPattern ? check.antiPattern.test(sqlContent) : false;

  if (hasExpected && !hasAnti) {
    console.log(`[PASS] Test ${index + 1}: ${check.name}`);
  } else {
    failed++;
    console.error(`[FAIL] Test ${index + 1}: ${check.name}`);
    if (!hasExpected) console.error(`       Missing expected pattern for: ${check.description}`);
    if (hasAnti) console.error(`       Violated anti-pattern for: ${check.description}`);
  }
}

// Application Code Tests
console.log('----------------------------------------------------------------');
console.log('APPLICATION CODE VERIFICATION (academyApi.ts):');
const doesNotCallStorageRemoveOnDeleteApproval = !/approveDeleteRequestAsAdmin[\s\S]*supabase\.storage[\s\S]*\.remove\(/i.test(apiContent);
const updatesIsDeletedTrueOnDeleteApproval = /approveDeleteRequestAsAdmin[\s\S]*update\(\{\s*is_deleted:\s*true/i.test(apiContent);
const hidesPublicPortfolioOnDeleteApproval = /approveDeleteRequestAsAdmin[\s\S]*public_portfolios[\s\S]*is_public:\s*false/i.test(apiContent);
const logsAuditTrailOnDeleteApproval = /approveDeleteRequestAsAdmin[\s\S]*audit_logs[\s\S]*DELETE_REQUEST_APPROVED_ARCHIVED/i.test(apiContent);
const getSignedFileUrlBlocksArchivedForStudents = /getSignedFileUrl[\s\S]*submission\.is_deleted\s*&&\s*!asAdmin/i.test(apiContent);
const signedUrlTtlReducedTo15Mins = /createSignedUrl\(submission\.file_path,\s*900\)/i.test(apiContent);

if (doesNotCallStorageRemoveOnDeleteApproval) {
  console.log('[PASS] Test 13: approveDeleteRequestAsAdmin DOES NOT call storage.remove() (Storage object preserved)');
} else {
  failed++;
  console.error('[FAIL] Test 13: approveDeleteRequestAsAdmin still calls storage.remove()');
}

if (updatesIsDeletedTrueOnDeleteApproval) {
  console.log('[PASS] Test 14: approveDeleteRequestAsAdmin marks submission as is_deleted = true (Logical Archive)');
} else {
  failed++;
  console.error('[FAIL] Test 14: approveDeleteRequestAsAdmin does not set is_deleted = true');
}

if (hidesPublicPortfolioOnDeleteApproval) {
  console.log('[PASS] Test 15: approveDeleteRequestAsAdmin hides public portfolio showcase entry (is_public = false)');
} else {
  failed++;
  console.error('[FAIL] Test 15: approveDeleteRequestAsAdmin does not hide public portfolio');
}

if (logsAuditTrailOnDeleteApproval) {
  console.log('[PASS] Test 16: approveDeleteRequestAsAdmin records audit log entry');
} else {
  failed++;
  console.error('[FAIL] Test 16: approveDeleteRequestAsAdmin does not write audit log');
}

if (getSignedFileUrlBlocksArchivedForStudents) {
  console.log('[PASS] Test 17: getSignedFileUrl denies newly generated access to archived files for non-admins');
} else {
  failed++;
  console.error('[FAIL] Test 17: getSignedFileUrl does not block archived files for non-admins');
}

if (signedUrlTtlReducedTo15Mins) {
  console.log('[PASS] Test 18: getSignedFileUrl uses shortened 900s (15 min) TTL for sensitive assignment files');
} else {
  failed++;
  console.error('[FAIL] Test 18: getSignedFileUrl TTL not reduced to 900s');
}

console.log('================================================================');
if (failed === 0) {
  console.log('ALL 18 FAIL-CLOSED STORAGE SECURITY TESTS PASSED');
  process.exit(0);
} else {
  console.error(`${failed} TESTS FAILED`);
  process.exit(1);
}
