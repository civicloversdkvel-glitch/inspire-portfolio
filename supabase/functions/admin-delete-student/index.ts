import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function readKey(primaryName: string, collectionName: string): string {
  const direct = Deno.env.get(primaryName);
  if (direct) return direct;
  const collection = Deno.env.get(collectionName);
  if (!collection) return "";
  try {
    const parsed = JSON.parse(collection);
    return parsed.default || "";
  } catch {
    return "";
  }
}

async function collectFiles(
  admin: ReturnType<typeof createClient>,
  bucket: string,
  folder: string,
): Promise<string[]> {
  const paths: string[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await admin.storage.from(bucket).list(folder, {
      limit: 100,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw new Error(`Storage list failed for ${bucket}: ${error.message}`);
    const entries = data || [];
    for (const entry of entries) {
      const path = `${folder}/${entry.name}`;
      if (entry.id == null && entry.metadata == null) {
        paths.push(...await collectFiles(admin, bucket, path));
      } else {
        paths.push(path);
      }
    }
    if (entries.length < 100) break;
    offset += 100;
  }
  return paths;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return response({ error: "Method not allowed." }, 405);

  try {
    const authorization = req.headers.get("Authorization") || "";
    const token = authorization.replace(/^Bearer\s+/i, "").trim();
    if (!token) return response({ error: "Administrator sign-in required." }, 401);

    const url = Deno.env.get("SUPABASE_URL") || "";
    const anonKey = readKey("SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEYS");
    const serviceKey = readKey("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEYS");
    if (!url || !anonKey || !serviceKey) {
      return response({ error: "Server-side Supabase keys are not configured." }, 500);
    }

    const userClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: authData, error: authError } = await userClient.auth.getUser(token);
    if (authError || !authData.user) {
      return response({ error: "Your session is invalid or expired. Please sign in again." }, 401);
    }
    const actor = authData.user;

    const { data: actorProfile, error: actorProfileError } = await admin
      .from("profiles")
      .select("id, email, role, is_active")
      .eq("id", actor.id)
      .maybeSingle();
    if (actorProfileError) throw actorProfileError;

    const actorEmail = (actor.email || "").trim().toLowerCase();
    if (actorEmail === "hr498412@gmail.com") {
      return response({ error: "Access denied: Administrator privileges are required." }, 403);
    }
    let isAdmin = [
      "theinspirebusinessacademy@gmail.com",
      "huzaifaghori4315@gmail.com",
    ].includes(actorEmail) || Boolean(
      actorProfile &&
      (actorProfile.role === "admin" || actorProfile.role === "super_admin") &&
      actorProfile.is_active !== false
    );
    if (!isAdmin) {
      const { data: adminRow, error: adminRowError } = await admin
        .from("admins")
        .select("uid")
        .eq("uid", actor.id)
        .maybeSingle();
      if (adminRowError && !String(adminRowError.message || "").toLowerCase().includes("does not exist")) {
        throw adminRowError;
      }
      isAdmin = Boolean(adminRow);
    }
    if (!isAdmin) return response({ error: "Access denied: only active academy administrators can delete students." }, 403);

    const payload = await req.json().catch(() => ({}));
    const studentId = String(payload.studentId || "").trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(studentId)) {
      return response({ error: "A valid student ID is required." }, 400);
    }
    if (studentId === actor.id) {
      return response({ error: "You cannot delete your own administrator account." }, 403);
    }

    const { data: student, error: studentError } = await admin
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("id", studentId)
      .maybeSingle();
    if (studentError) throw studentError;
    if (!student || student.role !== "student") {
      return response({ error: "This account is not a student. Admin accounts are protected." }, 404);
    }

    // Block portal access first. If a later cleanup step fails, the account remains disabled.
    const { error: blockError } = await admin
      .from("profiles")
      .update({ is_active: false, approval_status: "blocked", updated_at: new Date().toISOString() })
      .eq("id", studentId)
      .eq("role", "student");
    if (blockError) throw blockError;

    // Remove student-owned files, but leave academy assignment resources untouched.
    for (const bucket of ["academy-submissions", "assignment-files", "public-portfolios"]) {
      const paths = await collectFiles(admin, bucket, studentId);
      for (let i = 0; i < paths.length; i += 100) {
        const { error } = await admin.storage.from(bucket).remove(paths.slice(i, i + 100));
        if (error) throw new Error(`Could not remove student files from ${bucket}: ${error.message}`);
      }
    }

    const ownedTables = [
      "public_portfolios",
      "submission_marks_history",
      "submission_versions",
      "submission_files",
      "delete_requests",
      "submissions",
      "attendance",
      "certificates",
      "notifications",
    ];
    for (const table of ownedTables) {
      const { error } = await admin.from(table).delete().eq("student_id", studentId);
      if (error) throw new Error(`Could not clean ${table}: ${error.message}`);
    }

    const { error: authDeleteError } = await admin.auth.admin.deleteUser(studentId);
    if (authDeleteError) throw new Error(`Student data was cleaned, but Auth account deletion failed: ${authDeleteError.message}`);

    const { error: profileDeleteError } = await admin
      .from("profiles")
      .delete()
      .eq("id", studentId)
      .eq("role", "student");
    if (profileDeleteError) {
      throw new Error(`Auth account deleted, but profile cleanup failed: ${profileDeleteError.message}`);
    }

    await admin.from("audit_logs").insert({
      actor_id: actor.id,
      actor_email: actor.email || actorProfile?.email || "",
      action: "student.deleted",
      target_resource: `profiles/${studentId}`,
      metadata: { student_name: student.full_name, student_email: student.email },
    });

    return response({
      success: true,
      studentId,
      studentName: student.full_name,
      message: "Student account and academy records permanently deleted.",
    });
  } catch (error) {
    console.error("admin-delete-student error:", error);
    return response({ error: error instanceof Error ? error.message : "Student deletion failed." }, 500);
  }
});
