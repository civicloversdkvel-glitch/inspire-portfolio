-- Cover the remaining foreign keys identified by the Supabase performance advisor.
create index if not exists audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index if not exists certificates_student_id_idx on public.certificates(student_id);
create index if not exists submission_marks_history_student_id_idx on public.submission_marks_history(student_id);
create index if not exists submission_versions_student_id_idx on public.submission_versions(student_id);
