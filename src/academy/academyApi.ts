import {
  supabase,
  isSupabaseConfigured,
  assertSupabaseConfigured,
  createIsolatedAuthClient,
  SUBMISSIONS_STORAGE_BUCKET,
  PUBLIC_PORTFOLIOS_STORAGE_BUCKET,
  computePKTStreak,
  getPKTDateDaysAgo,
  getSavedRollNo,
  getTodayPKT,
  handleSupabaseError,
  isBootstrappedAdminEmail,
  OperationType,
  sanitizeFileName,
  setSavedRollNo,
  validateSubmissionUrl,
  validateUploadFile
} from './supabase';
import {
  AcademyProfile,
  AnnouncementPriority,
  AnnouncementRecord,
  AssignmentRecord,
  AttendanceRecord,
  AttendanceStatus,
  DeleteRequestRecord,
  MarksHistoryRecord,
  PublicPortfolioRecord,
  StudentProgressSummary,
  SubmissionRecord,
  SubmissionStatus,
  SubmissionType,
  SubmissionVersionRecord,
  UserRole,
  VALIDATION_LIMITS
} from './types';

// =============================================================================
// INTERNAL HELPERS & ADMIN AUTHORIZATION GUARD
// =============================================================================

async function assertAdminAuthorized(): Promise<string> {
  assertSupabaseConfigured();
  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr || !sessionData.session?.user) {
    throw new Error('Administrator authentication required. Please sign in at /admin/login.');
  }

  const currentUser = sessionData.session.user;
  const email = (currentUser.email || '').trim().toLowerCase();

  if (email === 'hr498412@gmail.com') {
    throw new Error('Access denied: Administrator privileges are required for this action.');
  }

  if (isBootstrappedAdminEmail(email)) {
    return currentUser.id;
  }

  try {
    const { data: adminRow } = await supabase
      .from('admins')
      .select('uid')
      .eq('uid', currentUser.id)
      .maybeSingle();

    if (adminRow) {
      return currentUser.id;
    }
  } catch {
    // fallback to profiles check below
  }

  const { data: profileRow, error: profileErr } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', currentUser.id)
    .maybeSingle();

  if (profileErr) {
    handleSupabaseError(profileErr, OperationType.GET, `profiles/${currentUser.id}`);
  }

  if (
    profileRow &&
    (profileRow.role === 'admin' || profileRow.role === 'super_admin') &&
    profileRow.is_active !== false
  ) {
    return currentUser.id;
  }

  throw new Error('Access denied: Administrator privileges are required for this action.');
}

function toIso(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (val instanceof Date) return val.toISOString();
  return new Date().toISOString();
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read selected file.'));
    reader.readAsDataURL(file);
  });
}

function decodeAssignmentIdMeta(rawAssignmentId: string | undefined): {
  submission_type: SubmissionType;
  portfolio_tag?: string;
} {
  if (!rawAssignmentId) {
    return { submission_type: 'assignment' };
  }
  if (rawAssignmentId.startsWith('portfolio_')) {
    const tag = rawAssignmentId.replace('portfolio_', '') || 'showcase';
    return { submission_type: 'portfolio', portfolio_tag: tag };
  }
  return { submission_type: 'assignment' };
}

function mapSubmissionRow(data: Record<string, any>): SubmissionRecord {
  const rawMarks = typeof data.marks === 'number' ? data.marks : Number(data.marks ?? -1);
  const marks = isNaN(rawMarks) || rawMarks < 0 ? null : rawMarks;
  const maxMarks = typeof data.max_marks === 'number' && data.max_marks > 0 ? data.max_marks : 10;

  let rating: number | null =
    typeof data.rating === 'number' && data.rating >= 1 && data.rating <= 5 ? data.rating : null;
  if (rating === null && marks !== null && maxMarks > 0) {
    rating = Math.max(1, Math.min(5, Math.round((marks / maxMarks) * 5)));
  }

  const decodedMeta = decodeAssignmentIdMeta(data.assignment_id);
  const subType: SubmissionType =
    data.submission_type === 'portfolio' || decodedMeta.submission_type === 'portfolio'
      ? 'portfolio'
      : 'assignment';
  const portfolioTag = data.portfolio_tag || decodedMeta.portfolio_tag;

  return {
    id: String(data.id),
    student_id: String(data.student_id),
    student_name: String(data.student_name || 'Student'),
    assignment_id: String(data.assignment_id || ''),
    submission_type: subType,
    portfolio_tag: portfolioTag,
    title: String(data.title || ''),
    description: String(data.description || ''),
    skill: String(data.skill || 'General'),
    file_path: String(data.file_path || ''),
    file_name: String(data.file_name || ''),
    file_type: String(data.file_type || 'application/octet-stream'),
    file_size: Number(data.file_size || 0),
    project_url: data.project_url ? String(data.project_url) : '',
    version: typeof data.version === 'number' && data.version >= 1 ? data.version : 1,
    parent_submission_id: data.parent_submission_id ? String(data.parent_submission_id) : '',
    submission_date: String(data.submission_date || getTodayPKT()),
    status: (data.status || 'submitted') as SubmissionStatus,
    rating,
    marks,
    max_marks: maxMarks,
    feedback: data.feedback ? String(data.feedback) : null,
    reviewed_by: data.reviewed_by ? String(data.reviewed_by) : null,
    reviewed_at: data.reviewed_at ? String(data.reviewed_at) : null,
    is_deleted: Boolean(data.is_deleted),
    submitted_at: toIso(data.submitted_at),
    updated_at: toIso(data.updated_at)
  };
}

function mapDeleteRequestRow(data: Record<string, any>): DeleteRequestRecord {
  return {
    id: String(data.id),
    submission_id: String(data.submission_id),
    submission_title: String(data.submission_title || 'Submission'),
    student_id: String(data.student_id),
    student_name: String(data.student_name || 'Student'),
    reason: String(data.reason || ''),
    status: data.status,
    admin_note: data.admin_note ? String(data.admin_note) : null,
    resolved_by: data.resolved_by ? String(data.resolved_by) : null,
    resolved_at: data.resolved_at ? String(data.resolved_at) : null,
    created_at: toIso(data.created_at),
    updated_at: toIso(data.updated_at)
  };
}

// =============================================================================
// 1. ASSIGNMENTS
// =============================================================================

export async function fetchPublishedAssignments(): Promise<AssignmentRecord[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('is_published', true)
      .order('due_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(raw => ({
      id: String(raw.id),
      title: String(raw.title || ''),
      description: String(raw.description || ''),
      skill: String(raw.skill || 'General'),
      due_date: String(raw.due_date || getTodayPKT()),
      is_published: Boolean(raw.is_published),
      created_by: String(raw.created_by || ''),
      created_at: toIso(raw.created_at)
    }));
  } catch (err) {
    handleSupabaseError(err, OperationType.LIST, 'assignments');
  }
}

export async function createAssignmentAsAdmin(input: {
  adminId: string;
  title: string;
  description: string;
  skill: string;
  dueDate: string;
}): Promise<AssignmentRecord> {
  await assertAdminAuthorized();
  const cleanTitle = input.title.trim();
  const cleanDesc = input.description.trim();
  if (cleanTitle.length < 3 || cleanTitle.length > VALIDATION_LIMITS.TITLE_MAX) {
    throw new Error('Assignment title must be between 3 and 160 characters.');
  }

  const id = `asg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const nowIso = new Date().toISOString();
  const payload = {
    id,
    title: cleanTitle,
    description: cleanDesc,
    skill: input.skill,
    due_date: input.dueDate || getTodayPKT(),
    is_published: true,
    created_by: input.adminId,
    created_at: nowIso
  };

  try {
    const { data, error } = await supabase
      .from('assignments')
      .insert(payload)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    const row = data || payload;
    return {
      id: String(row.id),
      title: String(row.title),
      description: String(row.description || ''),
      skill: String(row.skill || 'General'),
      due_date: String(row.due_date || getTodayPKT()),
      is_published: Boolean(row.is_published),
      created_by: String(row.created_by || ''),
      created_at: toIso(row.created_at)
    };
  } catch (err) {
    handleSupabaseError(err, OperationType.CREATE, `assignments/${id}`);
  }
}

// =============================================================================
// 2. SUBMISSIONS (DAILY ASSIGNMENTS + PORTFOLIO UPLOADS)
// =============================================================================

export async function createStudentSubmission(params: {
  studentId: string;
  studentName: string;
  assignmentId?: string;
  submissionType: SubmissionType;
  portfolioTag?: 'showcase' | 'practice';
  title: string;
  description: string;
  skill: string;
  file?: File | null;
  projectUrl?: string;
  resubmitSubmissionId?: string;
}): Promise<SubmissionRecord> {
  assertSupabaseConfigured();
  const {
    studentId,
    studentName,
    assignmentId = '',
    submissionType,
    portfolioTag = 'showcase',
    title,
    description,
    skill,
    file = null,
    projectUrl = '',
    resubmitSubmissionId = ''
  } = params;

  const cleanTitle = title.trim();
  const cleanDesc = description.trim();
  const cleanUrl = projectUrl.trim();

  if (cleanTitle.length < VALIDATION_LIMITS.TITLE_MIN || cleanTitle.length > VALIDATION_LIMITS.TITLE_MAX) {
    throw new Error(`Title must be between ${VALIDATION_LIMITS.TITLE_MIN} and ${VALIDATION_LIMITS.TITLE_MAX} characters.`);
  }
  if (cleanDesc.length > VALIDATION_LIMITS.DESCRIPTION_MAX) {
    throw new Error(`Description cannot exceed ${VALIDATION_LIMITS.DESCRIPTION_MAX} characters.`);
  }

  if (!file && !cleanUrl) {
    throw new Error('Please attach a work file or provide a project/assignment URL.');
  }

  if (file) {
    const fileCheck = validateUploadFile(file);
    if (!fileCheck.valid) {
      throw new Error(fileCheck.error || 'Invalid file.');
    }
  }

  if (cleanUrl) {
    const urlCheck = validateSubmissionUrl(cleanUrl);
    if (!urlCheck.valid) {
      throw new Error(urlCheck.error || 'Invalid project URL.');
    }
  }

  const todayPKT = getTodayPKT();
  const nowIso = new Date().toISOString();

  // Check if this is a resubmission of an existing submission
  let existingSub: SubmissionRecord | null = null;
  if (resubmitSubmissionId) {
    const { data: existingRow } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', resubmitSubmissionId)
      .eq('student_id', studentId)
      .maybeSingle();
    if (existingRow) {
      existingSub = mapSubmissionRow(existingRow);
    }
  }

  const submissionId = existingSub
    ? existingSub.id
    : `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const nextVersion = existingSub ? (existingSub.version || 1) + 1 : 1;

  let safeName = cleanUrl ? 'External Project Link' : 'submission';
  let filePath = cleanUrl;
  let mimeType = cleanUrl && !file ? 'text/uri-list' : 'application/octet-stream';
  let fileSize = 0;

  if (file) {
    safeName = sanitizeFileName(file.name);
    filePath = `${studentId}/${todayPKT}/${submissionId}-v${nextVersion}-${safeName}`;
    mimeType = file.type || 'application/octet-stream';
    fileSize = file.size;

    // 1. Upload binary file to Supabase Storage bucket `academy-submissions`
    let storageUploaded = false;
    try {
      const { error: uploadError } = await supabase.storage
        .from(SUBMISSIONS_STORAGE_BUCKET)
        .upload(filePath, file, {
          contentType: mimeType,
          upsert: true
        });
      if (!uploadError) {
        storageUploaded = true;
      }
    } catch {
      // Will fallback to submission_files table below if bucket is not yet created
    }

    // 2. Store fallback / preview record in `public.submission_files`
    try {
      const dataUrl = file.size <= 12 * 1024 * 1024 ? await fileToDataUrl(file) : '';
      if (dataUrl || !storageUploaded) {
        const fallbackUrl = dataUrl || (await fileToDataUrl(file));
        await supabase.from('submission_files').upsert(
          {
            id: submissionId,
            student_id: studentId,
            file_path: filePath,
            file_name: safeName,
            file_type: mimeType,
            file_size: file.size,
            data_url: fallbackUrl,
            created_at: nowIso
          },
          { onConflict: 'id' }
        );
      }
    } catch (fallbackErr) {
      if (!storageUploaded) {
        handleSupabaseError(fallbackErr, OperationType.CREATE, `submission_files/${submissionId}`);
      }
    }
  } else if (cleanUrl) {
    // Store URL fallback entry in submission_files so signed URL lookup also resolves seamlessly
    try {
      await supabase.from('submission_files').upsert(
        {
          id: submissionId,
          student_id: studentId,
          file_path: cleanUrl,
          file_name: 'External Project Link',
          file_type: 'text/uri-list',
          file_size: 0,
          data_url: cleanUrl,
          created_at: nowIso
        },
        { onConflict: 'id' }
      );
    } catch {
      // ignore if submission_files table is optional for URL-only
    }
  }

  // Record version history entry in `public.submission_versions`
  try {
    if (existingSub && nextVersion === 2) {
      // Ensure v1 is also recorded if it wasn't recorded earlier
      await supabase.from('submission_versions').upsert(
        {
          id: `ver_${existingSub.id}_1`,
          submission_id: existingSub.id,
          student_id: studentId,
          version_number: 1,
          file_path: existingSub.file_path,
          file_name: existingSub.file_name,
          file_type: existingSub.file_type,
          file_size: existingSub.file_size,
          project_url: existingSub.project_url || '',
          description: existingSub.description || '',
          created_at: existingSub.submitted_at
        },
        { onConflict: 'id' }
      );
    }
    await supabase.from('submission_versions').upsert(
      {
        id: `ver_${submissionId}_${nextVersion}`,
        submission_id: submissionId,
        student_id: studentId,
        version_number: nextVersion,
        file_path: filePath,
        file_name: safeName,
        file_type: mimeType,
        file_size: fileSize,
        project_url: cleanUrl,
        description: cleanDesc,
        created_at: nowIso
      },
      { onConflict: 'id' }
    );
  } catch {
    // Ignore if submission_versions table is not yet created
  }

  const encodedAssignmentId =
    submissionType === 'portfolio' ? `portfolio_${portfolioTag}` : assignmentId;

  if (existingSub) {
    try {
      const updateBase = {
        title: cleanTitle,
        description: cleanDesc,
        skill: (skill.trim() || existingSub.skill || 'General').slice(0, 80),
        file_path: filePath,
        file_name: safeName,
        file_type: mimeType,
        file_size: fileSize,
        submission_date: todayPKT,
        status: 'submitted' as const,
        updated_at: nowIso
      };

      let { data, error } = await supabase
        .from('submissions')
        .update({
          ...updateBase,
          project_url: cleanUrl,
          version: nextVersion
        })
        .eq('id', existingSub.id)
        .eq('student_id', studentId)
        .select('*')
        .maybeSingle();

      if (error && String(error.message || '').includes('column')) {
        const retry = await supabase
          .from('submissions')
          .update(updateBase)
          .eq('id', existingSub.id)
          .eq('student_id', studentId)
          .select('*')
          .maybeSingle();
        data = retry.data;
        error = retry.error;
      }

      if (error) throw error;
      return mapSubmissionRow(
        data || {
          ...existingSub,
          ...updateBase,
          project_url: cleanUrl,
          version: nextVersion
        }
      );
    } catch (err) {
      handleSupabaseError(err, OperationType.UPDATE, `submissions/${existingSub.id}`);
    }
  }

  const baseSubmissionPayload = {
    id: submissionId,
    student_id: studentId,
    student_name: (studentName || 'Student').slice(0, 120),
    assignment_id: encodedAssignmentId,
    title: cleanTitle,
    description: cleanDesc,
    skill: (skill.trim() || 'General').slice(0, 80),
    file_path: filePath,
    file_name: safeName,
    file_type: mimeType,
    file_size: fileSize,
    submission_date: todayPKT,
    status: 'submitted' as const,
    marks: -1,
    max_marks: 10,
    feedback: '',
    reviewed_by: '',
    reviewed_at: '',
    is_deleted: false,
    submitted_at: nowIso,
    updated_at: nowIso
  };

  try {
    const extendedPayload = {
      ...baseSubmissionPayload,
      submission_type: submissionType,
      portfolio_tag: portfolioTag,
      project_url: cleanUrl,
      version: 1
    };

    let { data, error } = await supabase
      .from('submissions')
      .insert(extendedPayload)
      .select('*')
      .maybeSingle();

    if (error && String(error.message || '').includes('column')) {
      // Fallback if table does not have optional columns yet
      const retry = await supabase
        .from('submissions')
        .insert(baseSubmissionPayload)
        .select('*')
        .maybeSingle();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;

    return mapSubmissionRow(
      data || {
        ...extendedPayload
      }
    );
  } catch (err) {
    handleSupabaseError(err, OperationType.CREATE, `submissions/${submissionId}`);
  }
}

export async function fetchSubmissionVersionHistory(
  submissionId: string
): Promise<SubmissionVersionRecord[]> {
  assertSupabaseConfigured();
  try {
    const { data, error } = await supabase
      .from('submission_versions')
      .select('*')
      .eq('submission_id', submissionId)
      .order('version_number', { ascending: false });

    if (error) throw error;
    return (data || []).map(raw => ({
      id: String(raw.id),
      submission_id: String(raw.submission_id),
      student_id: String(raw.student_id),
      version_number: Number(raw.version_number || 1),
      file_path: String(raw.file_path || ''),
      file_name: String(raw.file_name || ''),
      file_type: String(raw.file_type || 'application/octet-stream'),
      file_size: Number(raw.file_size || 0),
      project_url: String(raw.project_url || ''),
      description: String(raw.description || ''),
      created_at: toIso(raw.created_at)
    }));
  } catch {
    return [];
  }
}

export async function fetchStudentSubmissions(studentId: string): Promise<SubmissionRecord[]> {
  assertSupabaseConfigured();
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('student_id', studentId)
      .eq('is_deleted', false)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(row => mapSubmissionRow(row));
  } catch (err) {
    handleSupabaseError(err, OperationType.LIST, 'submissions');
  }
}

export async function fetchAllSubmissionsForAdmin(
  includeArchived = false
): Promise<SubmissionRecord[]> {
  await assertAdminAuthorized();
  try {
    let query = supabase
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (!includeArchived) {
      query = query.eq('is_deleted', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(row => mapSubmissionRow(row));
  } catch (err) {
    handleSupabaseError(err, OperationType.LIST, 'submissions');
  }
}

export async function archiveSubmissionAsAdmin(submissionId: string): Promise<void> {
  await assertAdminAuthorized();
  try {
    const { error } = await supabase
      .from('submissions')
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId);
    if (error) throw error;
  } catch (err) {
    handleSupabaseError(err, OperationType.UPDATE, `submissions/${submissionId}`);
  }
}

export async function restoreSubmissionAsAdmin(submissionId: string): Promise<void> {
  await assertAdminAuthorized();
  try {
    const { error } = await supabase
      .from('submissions')
      .update({
        is_deleted: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId);
    if (error) throw error;
  } catch (err) {
    handleSupabaseError(err, OperationType.UPDATE, `submissions/${submissionId}`);
  }
}

export async function getSignedFileUrl(
  submission: SubmissionRecord,
  asAdmin = false
): Promise<string> {
  assertSupabaseConfigured();

  // If submission is archived/deleted, students must NOT be granted newly generated file access.
  // Only administrators viewing archived submissions can generate URLs for archived files.
  if (submission.is_deleted && !asAdmin) {
    throw new Error('This submission has been archived and its file is no longer accessible.');
  }

  try {
    // 0. If this is an external URL submission without a stored binary file, return the URL directly
    if (
      submission.project_url &&
      (!submission.file_path ||
        submission.file_path === submission.project_url ||
        submission.file_type === 'text/uri-list')
    ) {
      return submission.project_url;
    }
    if (submission.file_path && /^https?:\/\//i.test(submission.file_path)) {
      return submission.file_path;
    }

    // 1. Try Supabase Storage signed URL first (15-minute / 900s expiry for security)
    if (submission.file_path) {
      const { data: signedData, error: signedError } = await supabase.storage
        .from(SUBMISSIONS_STORAGE_BUCKET)
        .createSignedUrl(submission.file_path, 900);

      if (!signedError && signedData?.signedUrl) {
        return signedData.signedUrl;
      }
    }

    // 2. Fallback to public.submission_files data_url
    const { data: fileRow, error: fileErr } = await supabase
      .from('submission_files')
      .select('data_url')
      .eq('id', submission.id)
      .maybeSingle();

    if (fileErr) throw fileErr;
    if (fileRow?.data_url) {
      return String(fileRow.data_url);
    }

    if (submission.project_url) {
      return submission.project_url;
    }

    throw new Error('File object not found in Supabase Storage or submission_files.');
  } catch (err) {
    handleSupabaseError(err, OperationType.GET, `submission_files/${submission.id}`);
  }
}

export async function reviewSubmissionAsAdmin(params: {
  submission: SubmissionRecord;
  adminId: string;
  rating: number; // 1..5 stars
  marks: number;
  maxMarks: number;
  status: 'reviewed' | 'needs_revision';
  feedback: string;
}): Promise<void> {
  await assertAdminAuthorized();
  const { submission, adminId, rating, marks, maxMarks, status, feedback } = params;
  if (rating < 1 || rating > 5) {
    throw new Error('Star rating must be between 1 and 5.');
  }
  if (marks < 0 || marks > maxMarks) {
    throw new Error(`Marks must be between 0 and ${maxMarks}.`);
  }
  const cleanFeedback = feedback.trim();
  if (cleanFeedback.length > VALIDATION_LIMITS.DESCRIPTION_MAX) {
    throw new Error('Feedback cannot exceed 2000 characters.');
  }

  const reviewedAtIso = new Date().toISOString();

  try {
    const baseUpdate = {
      status,
      marks,
      max_marks: maxMarks,
      feedback: cleanFeedback,
      reviewed_by: adminId,
      reviewed_at: reviewedAtIso,
      updated_at: reviewedAtIso
    };

    let { error } = await supabase
      .from('submissions')
      .update({ ...baseUpdate, rating })
      .eq('id', submission.id);

    if (error && String(error.message || '').includes('column')) {
      const retry = await supabase
        .from('submissions')
        .update(baseUpdate)
        .eq('id', submission.id);
      error = retry.error;
    }

    if (error) throw error;

    if (submission.marks !== marks) {
      const histId = `mh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await supabase.from('submission_marks_history').insert({
        id: histId,
        submission_id: submission.id,
        student_id: submission.student_id,
        old_marks: submission.marks === null ? -1 : submission.marks,
        new_marks: marks,
        changed_by: adminId,
        changed_at: reviewedAtIso
      });
    }
  } catch (err) {
    handleSupabaseError(err, OperationType.UPDATE, `submissions/${submission.id}`);
  }
}

export async function fetchMarksHistory(submissionId: string): Promise<MarksHistoryRecord[]> {
  assertSupabaseConfigured();
  try {
    const { data, error } = await supabase
      .from('submission_marks_history')
      .select('*')
      .eq('submission_id', submissionId)
      .order('changed_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(raw => ({
      id: String(raw.id),
      submission_id: String(raw.submission_id),
      student_id: String(raw.student_id),
      old_marks: Number(raw.old_marks) < 0 ? null : Number(raw.old_marks),
      new_marks: Number(raw.new_marks),
      changed_by: String(raw.changed_by || ''),
      changed_at: toIso(raw.changed_at)
    }));
  } catch (err) {
    handleSupabaseError(err, OperationType.LIST, 'submission_marks_history');
  }
}

// =============================================================================
// 3. DELETE REQUESTS (STUDENT REQUEST -> ADMIN APPROVE / REJECT)
// =============================================================================

export async function createDeleteRequest(params: {
  submissionId: string;
  submissionTitle: string;
  studentId: string;
  studentName: string;
  reason: string;
}): Promise<DeleteRequestRecord> {
  assertSupabaseConfigured();
  const { submissionId, submissionTitle, studentId, studentName, reason } = params;
  const cleanReason = reason.trim();
  if (cleanReason.length < VALIDATION_LIMITS.DELETE_REASON_MIN) {
    throw new Error(`Please provide a clear reason (at least ${VALIDATION_LIMITS.DELETE_REASON_MIN} characters).`);
  }
  if (cleanReason.length > VALIDATION_LIMITS.DELETE_REASON_MAX) {
    throw new Error(`Reason cannot exceed ${VALIDATION_LIMITS.DELETE_REASON_MAX} characters.`);
  }

  const existingReqs = await fetchStudentDeleteRequests(studentId);
  const alreadyPending = existingReqs.some(
    r => r.submission_id === submissionId && r.status === 'pending'
  );
  if (alreadyPending) {
    throw new Error('A pending delete request already exists for this submission.');
  }

  const reqId = `delreq_${submissionId}_${Date.now()}`;
  const nowIso = new Date().toISOString();
  const payload = {
    id: reqId,
    submission_id: submissionId,
    submission_title: submissionTitle.slice(0, 160),
    student_id: studentId,
    student_name: (studentName || 'Student').slice(0, 120),
    reason: cleanReason,
    status: 'pending' as const,
    admin_note: '',
    resolved_by: '',
    resolved_at: '',
    created_at: nowIso,
    updated_at: nowIso
  };

  try {
    const { data, error } = await supabase
      .from('delete_requests')
      .insert(payload)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return mapDeleteRequestRow(data || payload);
  } catch (err) {
    handleSupabaseError(err, OperationType.CREATE, `delete_requests/${reqId}`);
  }
}

export async function fetchStudentDeleteRequests(studentId: string): Promise<DeleteRequestRecord[]> {
  assertSupabaseConfigured();
  try {
    const { data, error } = await supabase
      .from('delete_requests')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(row => mapDeleteRequestRow(row));
  } catch (err) {
    handleSupabaseError(err, OperationType.LIST, 'delete_requests');
  }
}

export async function fetchAllDeleteRequestsForAdmin(): Promise<DeleteRequestRecord[]> {
  await assertAdminAuthorized();
  try {
    const { data, error } = await supabase
      .from('delete_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(row => mapDeleteRequestRow(row));
  } catch (err) {
    handleSupabaseError(err, OperationType.LIST, 'delete_requests');
  }
}

export async function approveDeleteRequestAsAdmin(params: {
  request: DeleteRequestRecord;
  adminId: string;
  adminNote?: string;
}): Promise<void> {
  await assertAdminAuthorized();
  const { request, adminId, adminNote = 'Approved by Admin (Archived)' } = params;
  const resolvedAtIso = new Date().toISOString();

  try {
    // 1. Mark delete request as approved
    const { error: reqErr } = await supabase
      .from('delete_requests')
      .update({
        status: 'approved',
        admin_note: adminNote.trim().slice(0, 1000),
        resolved_by: adminId,
        resolved_at: resolvedAtIso,
        updated_at: resolvedAtIso
      })
      .eq('id', request.id);

    if (reqErr) throw reqErr;

    // 2. Mark submission as is_deleted = true (logically archived)
    // NOTE: We intentionally PRESERVE the storage object in `academy-submissions`
    // and `submission_files` record so administrators can inspect, retain version history,
    // and restore the submission at any time without forcing re-upload.
    const { error: subErr } = await supabase
      .from('submissions')
      .update({
        is_deleted: true,
        updated_at: resolvedAtIso
      })
      .eq('id', request.submission_id);

    if (subErr) throw subErr;

    // 3. If this submission was approved on public portfolios showcase, hide/unpublish it
    try {
      await supabase
        .from('public_portfolios')
        .update({
          is_public: false,
          updated_at: resolvedAtIso
        })
        .eq('submission_id', request.submission_id);
    } catch {
      // ignore if public_portfolios table not present
    }

    // 4. Record audit log entry
    try {
      await supabase
        .from('audit_logs')
        .insert({
          actor_id: adminId,
          action: 'DELETE_REQUEST_APPROVED_ARCHIVED',
          target_resource: `submissions/${request.submission_id}`,
          metadata: {
            request_id: request.id,
            student_id: request.student_id,
            student_name: request.student_name,
            submission_title: request.submission_title,
            admin_note: adminNote
          }
        });
    } catch {
      // ignore if audit_logs table not present
    }
  } catch (err) {
    handleSupabaseError(err, OperationType.UPDATE, `delete_requests/${request.id}`);
  }
}

export async function rejectDeleteRequestAsAdmin(params: {
  request: DeleteRequestRecord;
  adminId: string;
  adminNote: string;
}): Promise<void> {
  await assertAdminAuthorized();
  const { request, adminId, adminNote } = params;
  const cleanNote = adminNote.trim();
  if (cleanNote.length < 3) {
    throw new Error('Please enter a brief rejection note (at least 3 characters).');
  }

  const resolvedAtIso = new Date().toISOString();

  try {
    const { error } = await supabase
      .from('delete_requests')
      .update({
        status: 'rejected',
        admin_note: cleanNote.slice(0, 1000),
        resolved_by: adminId,
        resolved_at: resolvedAtIso,
        updated_at: resolvedAtIso
      })
      .eq('id', request.id);

    if (error) throw error;
  } catch (err) {
    handleSupabaseError(err, OperationType.UPDATE, `delete_requests/${request.id}`);
  }
}

// =============================================================================
// 4. STUDENTS & PROGRESS
// =============================================================================

export async function fetchAllStudentsWithProgress(): Promise<StudentProgressSummary[]> {
  await assertAdminAuthorized();
  try {
    const [profilesRes, submissionsRes] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('submissions').select('*').eq('is_deleted', false)
    ]);

    if (profilesRes.error) throw profilesRes.error;
    if (submissionsRes.error) throw submissionsRes.error;

    const students: AcademyProfile[] = (profilesRes.data || [])
      .map(raw => {
        const uid = String(raw.id);
        const role: UserRole =
          raw.role === 'admin' || raw.role === 'super_admin' || isBootstrappedAdminEmail(raw.email)
            ? 'admin'
            : 'student';
        return {
          id: uid,
          email: String(raw.email || ''),
          full_name: String(raw.full_name || 'Student'),
          phone: String(raw.phone || ''),
          roll_no: String(raw.roll_no || getSavedRollNo(uid) || ''),
          batch: String(raw.batch || ''),
          role,
          skill: String(raw.skill || 'Graphic Designing'),
          admission_date: String(raw.admission_date || getTodayPKT()),
          is_approved: raw.is_approved !== false && raw.approval_status !== 'rejected',
          is_active: raw.is_active !== false && raw.approval_status !== 'blocked',
          created_at: toIso(raw.created_at),
          updated_at: toIso(raw.updated_at)
        };
      })
      .filter(p => p.role === 'student');

    const activeSubmissions = submissionsRes.data || [];
    const date7DaysAgo = getPKTDateDaysAgo(6);
    const date30DaysAgo = getPKTDateDaysAgo(29);

    return students
      .map(student => {
        const subs = activeSubmissions.filter(s => String(s.student_id) === student.id);
        const reviewed = subs.filter(
          s =>
            s.status === 'reviewed' &&
            typeof Number(s.marks) === 'number' &&
            Number(s.marks) >= 0 &&
            Number(s.max_marks) > 0
        );
        const avgPct =
          reviewed.length > 0
            ? Number(
                (
                  reviewed.reduce(
                    (acc, s) => acc + (Number(s.marks) / Number(s.max_marks)) * 100,
                    0
                  ) / reviewed.length
                ).toFixed(1)
              )
            : 0;

        const avgRating = reviewed.length > 0 ? Number((avgPct / 20).toFixed(1)) : 0;

        const subDates = subs.map(s => String(s.submission_date || '')).filter(Boolean);
        const sortedDates = [...subDates].sort((a, b) => b.localeCompare(a));

        const assignmentCount = subs.filter(
          s =>
            s.submission_type !== 'portfolio' &&
            !String(s.assignment_id || '').startsWith('portfolio_')
        ).length;
        const portfolioCount = subs.length - assignmentCount;

        return {
          student_id: student.id,
          full_name: student.full_name,
          email: student.email,
          phone: student.phone,
          roll_no: student.roll_no || '',
          skill: student.skill,
          batch: student.batch || '',
          admission_date: student.admission_date,
          is_approved: student.is_approved !== false,
          is_active: student.is_active,
          total_submissions: subs.length,
          assignment_count: assignmentCount,
          portfolio_count: portfolioCount,
          reviewed_count: reviewed.length,
          avg_rating: avgRating,
          avg_marks_pct: avgPct,
          last_submission_date: sortedDates[0] || null,
          submissions_last_7_days: subDates.filter(d => d >= date7DaysAgo).length,
          submissions_last_30_days: subDates.filter(d => d >= date30DaysAgo).length,
          current_pkt_streak: computePKTStreak(subDates)
        };
      })
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
  } catch (err) {
    handleSupabaseError(err, OperationType.LIST, 'profiles');
  }
}

export async function fetchStudentById(studentId: string): Promise<AcademyProfile | null> {
  assertSupabaseConfigured();
  try {
    const { data: raw, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', studentId)
      .maybeSingle();

    if (error) throw error;
    if (!raw) return null;

    return {
      id: String(raw.id),
      email: String(raw.email || ''),
      full_name: String(raw.full_name || 'Student'),
      phone: String(raw.phone || ''),
      roll_no: String(raw.roll_no || getSavedRollNo(studentId) || ''),
      batch: String(raw.batch || ''),
      role: raw.role === 'admin' || raw.role === 'super_admin' ? 'admin' : 'student',
      skill: String(raw.skill || 'Graphic Designing'),
      admission_date: String(raw.admission_date || getTodayPKT()),
      is_approved: raw.is_approved !== false,
      is_active: raw.is_active !== false,
      created_at: toIso(raw.created_at),
      updated_at: toIso(raw.updated_at)
    };
  } catch (err) {
    handleSupabaseError(err, OperationType.GET, `profiles/${studentId}`);
  }
}

export async function updateOwnStudentProfile(
  studentId: string,
  updates: {
    full_name: string;
    phone: string;
    roll_no?: string;
    skill?: string;
    batch?: string;
  }
): Promise<void> {
  assertSupabaseConfigured();
  const cleanName = updates.full_name.trim();
  const cleanPhone = updates.phone.trim();
  const cleanRollNo = typeof updates.roll_no === 'string' ? updates.roll_no.trim() : undefined;
  const cleanSkill = typeof updates.skill === 'string' ? updates.skill.trim() : undefined;
  const cleanBatch = typeof updates.batch === 'string' ? updates.batch.trim() : undefined;

  if (cleanName.length < VALIDATION_LIMITS.FULL_NAME_MIN || cleanName.length > VALIDATION_LIMITS.FULL_NAME_MAX) {
    throw new Error('Full name must be between 2 and 120 characters.');
  }
  if (cleanPhone.length > VALIDATION_LIMITS.PHONE_MAX) {
    throw new Error('Phone number cannot exceed 30 characters.');
  }

  if (typeof cleanRollNo === 'string') {
    setSavedRollNo(studentId, cleanRollNo);
  }

  try {
    const payload: Record<string, any> = {
      full_name: cleanName,
      phone: cleanPhone,
      updated_at: new Date().toISOString()
    };
    if (typeof cleanRollNo === 'string') {
      payload.roll_no = cleanRollNo;
    }
    if (cleanSkill) {
      payload.skill = cleanSkill.slice(0, VALIDATION_LIMITS.SKILL_MAX);
    }
    if (typeof cleanBatch === 'string') {
      payload.batch = cleanBatch.slice(0, 60);
    }

    const { error } = await supabase.from('profiles').update(payload).eq('id', studentId);
    if (error) throw error;
  } catch (err) {
    handleSupabaseError(err, OperationType.UPDATE, `profiles/${studentId}`);
  }
}

export async function adminUpdateStudentProfile(
  studentId: string,
  updates: {
    full_name: string;
    phone: string;
    roll_no?: string;
    skill: string;
    admission_date: string;
    is_approved?: boolean;
    is_active: boolean;
  }
): Promise<void> {
  await assertAdminAuthorized();
  const cleanName = updates.full_name.trim();
  const cleanPhone = updates.phone.trim();
  const cleanRollNo = typeof updates.roll_no === 'string' ? updates.roll_no.trim() : undefined;

  if (cleanName.length < 2 || cleanName.length > 120) {
    throw new Error('Full name must be between 2 and 120 characters.');
  }

  if (typeof cleanRollNo === 'string') {
    setSavedRollNo(studentId, cleanRollNo);
  }

  try {
    const payload: Record<string, any> = {
      full_name: cleanName,
      phone: cleanPhone,
      skill: updates.skill,
      admission_date: updates.admission_date,
      is_approved: updates.is_approved !== false,
      approval_status:
        updates.is_active === false
          ? 'blocked'
          : updates.is_approved === false
          ? 'pending'
          : 'approved',
      is_active: updates.is_active,
      updated_at: new Date().toISOString()
    };
    if (typeof cleanRollNo === 'string') {
      payload.roll_no = cleanRollNo;
    }

    const { error } = await supabase.from('profiles').update(payload).eq('id', studentId);
    if (error) throw error;
  } catch (err) {
    handleSupabaseError(err, OperationType.UPDATE, `profiles/${studentId}`);
  }
}

export async function adminCreateStudentAccount(params: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  rollNo?: string;
  skill: string;
  admissionDate: string;
}): Promise<AcademyProfile> {
  await assertAdminAuthorized();
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanName = params.fullName.trim();
  const cleanPhone = params.phone.trim();
  const cleanRollNo = (params.rollNo || '').trim();
  const cleanAdmission = params.admissionDate || getTodayPKT();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid student email address.');
  }
  if (params.password.length < 6) {
    throw new Error('Initial password must be at least 6 characters.');
  }
  if (cleanName.length < 2) {
    throw new Error('Student full name is required.');
  }

  const nowIso = new Date().toISOString();

  // 1. Try SECURITY DEFINER RPC `admin_create_student` first (creates confirmed user directly)
  try {
    const { data: rpcUid, error: rpcError } = await supabase.rpc('admin_create_student', {
      p_email: cleanEmail,
      p_password: params.password,
      p_full_name: cleanName,
      p_phone: cleanPhone,
      p_roll_no: cleanRollNo,
      p_skill: params.skill,
      p_admission_date: cleanAdmission
    });

    if (!rpcError && rpcUid) {
      const uidStr = String(rpcUid);
      if (cleanRollNo) {
        setSavedRollNo(uidStr, cleanRollNo);
      }
      return {
        id: uidStr,
        email: cleanEmail,
        full_name: cleanName,
        phone: cleanPhone,
        roll_no: cleanRollNo,
        role: 'student',
        skill: params.skill,
        admission_date: cleanAdmission,
        is_approved: true,
        is_active: true,
        created_at: nowIso,
        updated_at: nowIso
      };
    }
  } catch {
    // Fall back to isolated client signup below
  }

  // 2. Fallback: Use isolated non-persisted Supabase Auth client so Admin stays logged in
  const isolatedClient = createIsolatedAuthClient();
  const { data: signUpData, error: signUpError } = await isolatedClient.auth.signUp({
    email: cleanEmail,
    password: params.password,
    options: {
      data: {
        full_name: cleanName,
        phone: cleanPhone,
        roll_no: cleanRollNo,
        skill: params.skill,
        admission_date: cleanAdmission,
        role: 'student'
      }
    }
  });

  if (signUpError || !signUpData.user) {
    throw new Error(signUpError?.message || 'Failed to create student account.');
  }

  const newUid = signUpData.user.id;
  if (cleanRollNo) {
    setSavedRollNo(newUid, cleanRollNo);
  }

  const profilePayload = {
    id: newUid,
    email: cleanEmail,
    full_name: cleanName,
    phone: cleanPhone,
    roll_no: cleanRollNo,
    role: 'student' as const,
    approval_status: 'approved',
    is_approved: true,
    is_active: true,
    skill: params.skill,
    admission_date: cleanAdmission,
    created_at: nowIso,
    updated_at: nowIso
  };

  const { error: upsertErr } = await supabase
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' });

  if (upsertErr) {
    handleSupabaseError(upsertErr, OperationType.CREATE, `profiles/${newUid}`);
  }

  return profilePayload;
}

// =============================================================================
// 5. PUBLIC PORTFOLIO SHOWCASE (ADMIN APPROVALS & PUBLIC VISITOR GALLERY)
// =============================================================================

function mapPublicPortfolioRow(raw: Record<string, any>): PublicPortfolioRecord {
  return {
    id: String(raw.id || ''),
    submission_id: String(raw.submission_id || ''),
    student_id: String(raw.student_id || ''),
    student_name: String(raw.student_name || 'Student'),
    roll_no: String(raw.roll_no || ''),
    skill: String(raw.skill || 'General'),
    title: String(raw.title || 'Project Showcase'),
    description: String(raw.description || ''),
    file_type: String(raw.file_type || 'application/octet-stream'),
    preview_url: String(raw.preview_url || ''),
    rating: typeof raw.rating === 'number' && raw.rating >= 1 && raw.rating <= 5 ? raw.rating : 5,
    is_featured: Boolean(raw.is_featured),
    is_public: raw.is_public !== false,
    approved_by: String(raw.approved_by || ''),
    created_at: toIso(raw.created_at),
    updated_at: toIso(raw.updated_at)
  };
}

export async function fetchPublicPortfolios(): Promise<PublicPortfolioRecord[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('public_portfolios')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || [])
      .map(row => mapPublicPortfolioRow(row))
      .sort((a, b) => {
        if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
        return b.created_at.localeCompare(a.created_at);
      });
  } catch (err) {
    handleSupabaseError(err, OperationType.LIST, 'public_portfolios');
  }
}

export async function fetchStudentPublicPortfolios(studentId: string): Promise<PublicPortfolioRecord[]> {
  assertSupabaseConfigured();
  try {
    const { data, error } = await supabase
      .from('public_portfolios')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(row => mapPublicPortfolioRow(row));
  } catch (err) {
    handleSupabaseError(err, OperationType.LIST, 'public_portfolios');
  }
}

export async function fetchAllPublicPortfoliosForAdmin(): Promise<PublicPortfolioRecord[]> {
  await assertAdminAuthorized();
  try {
    const { data, error } = await supabase
      .from('public_portfolios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(row => mapPublicPortfolioRow(row));
  } catch (err) {
    handleSupabaseError(err, OperationType.LIST, 'public_portfolios');
  }
}

export async function approveSubmissionForPublicPortfolio(params: {
  submission: SubmissionRecord;
  rollNo?: string;
  isFeatured?: boolean;
  adminId: string;
}): Promise<PublicPortfolioRecord> {
  await assertAdminAuthorized();
  const { submission, rollNo = '', isFeatured = false, adminId } = params;
  const itemId = `pub_${submission.id}`.slice(0, 120).replace(/[^a-zA-Z0-9_-]/g, '_');

  let previewUrl = '';
  try {
    // 1. Copy file into public-portfolios storage bucket if available so public visitors have a fast CDN URL
    if (submission.file_path) {
      const { data: downloadedBlob } = await supabase.storage
        .from(SUBMISSIONS_STORAGE_BUCKET)
        .download(submission.file_path);

      if (downloadedBlob) {
        const publicPath = `${submission.student_id}/${itemId}-${sanitizeFileName(submission.file_name)}`;
        const { error: pubUpErr } = await supabase.storage
          .from(PUBLIC_PORTFOLIOS_STORAGE_BUCKET)
          .upload(publicPath, downloadedBlob, {
            contentType: submission.file_type || 'application/octet-stream',
            upsert: true
          });

        if (!pubUpErr) {
          const { data: pubUrlData } = supabase.storage
            .from(PUBLIC_PORTFOLIOS_STORAGE_BUCKET)
            .getPublicUrl(publicPath);
          if (pubUrlData?.publicUrl) {
            previewUrl = pubUrlData.publicUrl;
          }
        }
      }
    }

    // 2. Fallback to submission_files data_url if previewUrl not populated yet
    if (!previewUrl) {
      const { data: fileRow } = await supabase
        .from('submission_files')
        .select('data_url')
        .eq('id', submission.id)
        .maybeSingle();

      if (fileRow?.data_url) {
        previewUrl = String(fileRow.data_url);
      }
    }
  } catch {
    // Proceed with empty previewUrl if file preview cannot be generated
  }

  const safeRating =
    submission.rating && submission.rating >= 1 && submission.rating <= 5 ? submission.rating : 5;
  const nowIso = new Date().toISOString();

  const payload = {
    id: itemId,
    submission_id: submission.id,
    student_id: submission.student_id,
    student_name: (submission.student_name || 'Student').slice(0, 120),
    roll_no: (rollNo || getSavedRollNo(submission.student_id) || '').slice(0, 40),
    skill: (submission.skill || 'General').slice(0, 80),
    title: (submission.title || 'Project Showcase').slice(0, 160),
    description: (submission.description || '').slice(0, 2000),
    file_type: (submission.file_type || 'application/octet-stream').slice(0, 120),
    preview_url: previewUrl,
    rating: safeRating,
    is_featured: Boolean(isFeatured),
    is_public: true,
    approved_by: adminId,
    created_at: nowIso,
    updated_at: nowIso
  };

  try {
    const { data, error } = await supabase
      .from('public_portfolios')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return mapPublicPortfolioRow(data || payload);
  } catch (err) {
    handleSupabaseError(err, OperationType.CREATE, `public_portfolios/${itemId}`);
  }
}

export async function updatePublicPortfolioItemAsAdmin(params: {
  item: PublicPortfolioRecord;
  title?: string;
  description?: string;
  rating?: number;
  isFeatured?: boolean;
  isPublic?: boolean;
}): Promise<void> {
  await assertAdminAuthorized();
  const { item } = params;
  const nextTitle = (params.title ?? item.title).trim().slice(0, 160);
  const nextDesc = (params.description ?? item.description).trim().slice(0, 2000);
  const nextRating = Math.max(1, Math.min(5, Math.round(params.rating ?? item.rating)));
  const nextFeatured = params.isFeatured ?? item.is_featured;
  const nextPublic = params.isPublic ?? item.is_public;

  try {
    const { error } = await supabase
      .from('public_portfolios')
      .update({
        title: nextTitle,
        description: nextDesc,
        rating: nextRating,
        is_featured: nextFeatured,
        is_public: nextPublic,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id);

    if (error) throw error;
  } catch (err) {
    handleSupabaseError(err, OperationType.UPDATE, `public_portfolios/${item.id}`);
  }
}

export async function removePublicPortfolioItemAsAdmin(itemId: string): Promise<void> {
  await assertAdminAuthorized();
  try {
    const { error } = await supabase.from('public_portfolios').delete().eq('id', itemId);
    if (error) throw error;
  } catch (err) {
    handleSupabaseError(err, OperationType.DELETE, `public_portfolios/${itemId}`);
  }
}

// =============================================================================
// 6. STUDENT ATTENDANCE (PKT)
// =============================================================================

function mapAttendanceRow(raw: Record<string, any>): AttendanceRecord {
  return {
    id: String(raw.id || ''),
    student_id: String(raw.student_id || ''),
    student_name: String(raw.student_name || 'Student'),
    skill: String(raw.skill || 'General'),
    attendance_date: String(raw.attendance_date || getTodayPKT()),
    status: (raw.status || 'present') as AttendanceStatus,
    note: String(raw.note || ''),
    marked_by: String(raw.marked_by || ''),
    created_at: toIso(raw.created_at),
    updated_at: toIso(raw.updated_at)
  };
}

export async function fetchStudentAttendance(studentId: string): Promise<AttendanceRecord[]> {
  assertSupabaseConfigured();
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('attendance_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(row => mapAttendanceRow(row));
  } catch (err) {
    handleSupabaseError(err, OperationType.LIST, 'attendance');
  }
}

export async function fetchAllAttendanceForAdmin(): Promise<AttendanceRecord[]> {
  await assertAdminAuthorized();
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('attendance_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(row => mapAttendanceRow(row));
  } catch (err) {
    handleSupabaseError(err, OperationType.LIST, 'attendance');
  }
}

export async function markStudentAttendanceAsAdmin(params: {
  studentId: string;
  studentName: string;
  skill: string;
  attendanceDate: string;
  status: AttendanceStatus;
  note?: string;
  adminId: string;
}): Promise<AttendanceRecord> {
  await assertAdminAuthorized();
  const { studentId, studentName, skill, attendanceDate, status, note = '', adminId } = params;
  const cleanDate = VALIDATION_LIMITS.DATE_PATTERN.test(attendanceDate)
    ? attendanceDate
    : getTodayPKT();
  const recordId = `att_${studentId}_${cleanDate}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  const cleanNote = note.trim().slice(0, 500);
  const nowIso = new Date().toISOString();

  const payload = {
    id: recordId,
    student_id: studentId,
    student_name: (studentName || 'Student').slice(0, 120),
    skill: (skill || 'General').slice(0, 80),
    attendance_date: cleanDate,
    status,
    note: cleanNote,
    marked_by: adminId,
    created_at: nowIso,
    updated_at: nowIso
  };

  try {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return mapAttendanceRow(data || payload);
  } catch (err) {
    handleSupabaseError(err, OperationType.WRITE, `attendance/${recordId}`);
  }
}

// =============================================================================
// 7. ACADEMY ANNOUNCEMENTS
// =============================================================================

function mapAnnouncementRow(raw: Record<string, any>): AnnouncementRecord {
  const rawSkill = String(raw.target_skill || 'All');
  return {
    id: String(raw.id || ''),
    title: String(raw.title || ''),
    message: String(raw.message || ''),
    target_skill: rawSkill === 'All Skills' ? 'All' : rawSkill,
    priority: (raw.priority || 'normal') as AnnouncementPriority,
    is_published: raw.is_published !== false,
    created_by: String(raw.created_by || ''),
    created_at: toIso(raw.created_at)
  };
}

export async function fetchPublishedAnnouncements(): Promise<AnnouncementRecord[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(row => mapAnnouncementRow(row));
  } catch (err) {
    handleSupabaseError(err, OperationType.LIST, 'announcements');
  }
}

export async function createAnnouncementAsAdmin(params: {
  title: string;
  message: string;
  targetSkill: string;
  priority: AnnouncementPriority;
  adminId: string;
}): Promise<AnnouncementRecord> {
  await assertAdminAuthorized();
  const cleanTitle = params.title.trim();
  const cleanMsg = params.message.trim();
  if (cleanTitle.length < 3 || cleanTitle.length > 160) {
    throw new Error('Announcement title must be between 3 and 160 characters.');
  }
  if (cleanMsg.length < 3 || cleanMsg.length > 2000) {
    throw new Error('Announcement message must be between 3 and 2000 characters.');
  }

  const id = `ann_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const nowIso = new Date().toISOString();
  const payload = {
    id,
    title: cleanTitle,
    message: cleanMsg,
    target_skill: (params.targetSkill || 'All').slice(0, 80),
    priority: params.priority,
    is_published: true,
    created_by: params.adminId,
    created_at: nowIso
  };

  try {
    const { data, error } = await supabase
      .from('announcements')
      .insert(payload)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return mapAnnouncementRow(data || payload);
  } catch (err) {
    handleSupabaseError(err, OperationType.CREATE, `announcements/${id}`);
  }
}

export async function deleteAnnouncementAsAdmin(announcementId: string): Promise<void> {
  await assertAdminAuthorized();
  try {
    const { error } = await supabase.from('announcements').delete().eq('id', announcementId);
    if (error) throw error;
  } catch (err) {
    handleSupabaseError(err, OperationType.DELETE, `announcements/${announcementId}`);
  }
}
