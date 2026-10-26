export type UserRole = 'admin' | 'student';
export type SubmissionStatus = 'submitted' | 'reviewed' | 'needs_revision';
export type SubmissionType = 'assignment' | 'portfolio';
export type DeleteRequestStatus = 'pending' | 'approved' | 'rejected';
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';
export type AnnouncementPriority = 'normal' | 'important' | 'urgent';

export const ACADEMY_SKILLS = [
  'Graphic Designing',
  'Video Editing',
  'Digital Marketing',
  'AI Content',
  'Dropshipping',
  'Account Selling',
  'MS Excel & Office',
  'YouTube Automation',
  'Trading & Crypto',
  'Other'
] as const;

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'application/zip',
  'application/x-zip-compressed',
  'video/mp4',
  'audio/mpeg',
  'audio/mp3'
] as const;

export const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.pdf',
  '.docx',
  '.doc',
  '.xlsx',
  '.xls',
  '.pptx',
  '.ppt',
  '.zip',
  '.mp4',
  '.mp3'
] as const;

export const VALIDATION_LIMITS = {
  ID_MAX_LEN: 128,
  ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
  DATE_PATTERN: /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/,
  FULL_NAME_MIN: 2,
  FULL_NAME_MAX: 120,
  PHONE_MAX: 30,
  SKILL_MAX: 80,
  TITLE_MIN: 2,
  TITLE_MAX: 160,
  DESCRIPTION_MAX: 2000,
  DELETE_REASON_MIN: 10,
  DELETE_REASON_MAX: 1000,
  ADMIN_NOTE_MAX: 1000
} as const;

export interface AcademyProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  roll_no?: string;
  batch?: string;
  role: UserRole;
  skill: string;
  admission_date: string; // YYYY-MM-DD (PKT)
  is_approved?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AssignmentRecord {
  id: string;
  title: string;
  description: string;
  skill: string;
  due_date: string; // YYYY-MM-DD (PKT)
  is_published: boolean;
  created_by: string;
  created_at: string;
}

export interface SubmissionRecord {
  id: string;
  student_id: string;
  student_name: string;
  assignment_id: string;
  submission_type?: SubmissionType;
  portfolio_tag?: string;
  title: string;
  description: string;
  skill: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  project_url?: string;
  version?: number;
  parent_submission_id?: string;
  submission_date: string; // YYYY-MM-DD (PKT)
  status: SubmissionStatus;
  rating?: number | null; // 1..5 stars
  marks: number | null; // null when ungraded (stored as -1 in PostgreSQL)
  max_marks: number;
  feedback: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  is_deleted: boolean;
  submitted_at: string;
  updated_at?: string;
}

export interface SubmissionVersionRecord {
  id: string;
  submission_id: string;
  student_id: string;
  version_number: number;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  project_url: string;
  description: string;
  created_at: string;
}

export interface DeleteRequestRecord {
  id: string;
  submission_id: string;
  submission_title: string;
  student_id: string;
  student_name: string;
  reason: string;
  status: DeleteRequestStatus;
  admin_note: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at?: string;
}

export interface MarksHistoryRecord {
  id: string;
  submission_id: string;
  student_id: string;
  old_marks: number | null;
  new_marks: number;
  changed_by: string;
  changed_at: string;
}

export interface StudentProgressSummary {
  student_id: string;
  full_name: string;
  email: string;
  phone: string;
  roll_no?: string;
  skill: string;
  batch?: string;
  admission_date: string;
  is_approved?: boolean;
  is_active: boolean;
  total_submissions: number;
  assignment_count?: number;
  portfolio_count?: number;
  reviewed_count: number;
  avg_rating?: number;
  avg_marks_pct: number;
  last_submission_date: string | null;
  submissions_last_7_days: number;
  submissions_last_30_days: number;
  current_pkt_streak: number;
}

export interface PublicPortfolioRecord {
  id: string;
  submission_id: string;
  student_id: string;
  student_name: string;
  roll_no: string;
  skill: string;
  title: string;
  description: string;
  file_type: string;
  preview_url: string;
  rating: number;
  is_featured: boolean;
  is_public: boolean;
  approved_by: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  skill: string;
  attendance_date: string; // YYYY-MM-DD (PKT)
  status: AttendanceStatus;
  note: string;
  marked_by: string;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementRecord {
  id: string;
  title: string;
  message: string;
  target_skill: string;
  priority: AnnouncementPriority;
  is_published: boolean;
  created_by: string;
  created_at: string;
}

