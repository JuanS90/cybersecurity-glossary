import { createSupabaseContext } from "@supabase/server";

type AccountAction =
  | "create_student"
  | "create_teacher"
  | "list_student_accounts"
  | "list_teacher_accounts"
  | "set_student_status"
  | "set_teacher_status"
  | "reset_student_password"
  | "complete_own_password_change";

type AccountProfile = {
  user_id: string;
  role: "superadmin" | "teacher" | "student";
  status: "active" | "disabled";
  must_change_password: boolean;
};

const maxBodyLength = 8_192;
const temporaryPasswordLength = 12;
const passwordAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%_-";
const passwordGroups = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnopqrstuvwxyz", "23456789", "!@#$%_-"];

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
}

function jsonResponse(
  origin: string,
  body: Record<string, unknown>,
  status = 200,
) {
  return Response.json(body, {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function randomIndex(length: number): number {
  const limit = Math.floor(0x1_0000_0000 / length) * length;
  const value = new Uint32Array(1);
  do {
    crypto.getRandomValues(value);
  } while (value[0] >= limit);
  return value[0] % length;
}

function makeTemporaryPassword(): string {
  const characters = passwordGroups.map((group) => group[randomIndex(group.length)]);
  while (characters.length < temporaryPasswordLength) {
    characters.push(passwordAlphabet[randomIndex(passwordAlphabet.length)]);
  }
  for (let index = characters.length - 1; index > 0; index--) {
    const swapIndex = randomIndex(index + 1);
    [characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
  }
  return characters.join("");
}

function inputText(body: Record<string, unknown>, field: string, maxLength: number) {
  const value = body[field];
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength
    ? value.trim()
    : null;
}

function isAccountAction(value: unknown): value is AccountAction {
  return value === "create_student"
    || value === "create_teacher"
    || value === "list_student_accounts"
    || value === "list_teacher_accounts"
    || value === "set_student_status"
    || value === "set_teacher_status"
    || value === "reset_student_password"
    || value === "complete_own_password_change";
}

async function loadCallerProfile(ctx: Awaited<ReturnType<typeof createSupabaseContext>>["data"]) {
  if (!ctx?.userClaims?.id) return null;
  const { data, error } = await ctx.supabase
    .from("profiles")
    .select("user_id, role, status, must_change_password")
    .eq("user_id", ctx.userClaims.id)
    .maybeSingle();
  if (error || !data) return null;
  return data as AccountProfile;
}

async function loadTargetProfile(
  admin: NonNullable<Awaited<ReturnType<typeof createSupabaseContext>>["data"]>["supabaseAdmin"],
  userId: string,
) {
  const { data, error } = await admin
    .from("profiles")
    .select("user_id, role, status, must_change_password")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as AccountProfile;
}

async function handleRequest(request: Request, origin: string) {
  const { data: ctx, error: authError } = await createSupabaseContext(request, { auth: "user" });
  if (authError || !ctx?.userClaims?.id) {
    return jsonResponse(origin, { error: "Authentication required." }, authError?.status ?? 401);
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    return jsonResponse(origin, { error: "A JSON request is required." }, 415);
  }

  const rawBody = await request.text();
  if (rawBody.length > maxBodyLength) {
    return jsonResponse(origin, { error: "Request is too large." }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse(origin, { error: "Invalid request." }, 400);
  }
  if (!isRecord(body) || !isAccountAction(body.action)) {
    return jsonResponse(origin, { error: "Unsupported account operation." }, 400);
  }

  const caller = await loadCallerProfile(ctx);
  if (!caller || caller.status !== "active") {
    return jsonResponse(origin, { error: "An active course profile is required." }, 403);
  }
  if (caller.must_change_password && body.action !== "complete_own_password_change") {
    return jsonResponse(origin, { error: "Change the temporary password before using account tools." }, 403);
  }

  const callerId = ctx.userClaims.id;
  const admin = ctx.supabaseAdmin;

  if (body.action === "complete_own_password_change") {
    if (caller.must_change_password) {
      const { error: profileError } = await admin
        .from("profiles")
        .update({ must_change_password: false })
        .eq("user_id", callerId);
      if (profileError) {
        return jsonResponse(
          origin,
          { error: "The password changed, but account activation is incomplete. Retry to finish." },
          503,
        );
      }
    }
    return jsonResponse(origin, { ok: true });
  }

  const requiresSuperadmin = body.action === "create_teacher"
    || body.action === "set_teacher_status"
    || body.action === "list_teacher_accounts";
  if (requiresSuperadmin && caller.role !== "superadmin") {
    return jsonResponse(origin, { error: "This role cannot perform that account operation." }, 403);
  }
  if (!requiresSuperadmin && caller.role !== "teacher" && caller.role !== "superadmin") {
    return jsonResponse(origin, { error: "This role cannot perform that account operation." }, 403);
  }

  if (body.action === "create_student" || body.action === "create_teacher") {
    const email = inputText(body, "email", 254)?.toLowerCase();
    const displayName = inputText(body, "display_name", 100);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !displayName) {
      return jsonResponse(origin, { error: "Provide a valid email and display name." }, 400);
    }

    const temporaryPassword = makeTemporaryPassword();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
    });
    if (createError || !created.user) {
      return jsonResponse(origin, { error: "The account could not be created." }, 409);
    }

    const role = body.action === "create_teacher" ? "teacher" : "student";
    const { error: profileError } = await admin.from("profiles").insert({
      user_id: created.user.id,
      display_name: displayName,
      role,
      status: "active",
      must_change_password: true,
      created_by: callerId,
    });
    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id);
      return jsonResponse(origin, { error: "The account profile could not be created." }, 500);
    }

    return jsonResponse(origin, {
      user_id: created.user.id,
      email,
      temporary_password: temporaryPassword,
      must_change_password: true,
    }, 201);
  }

  if (body.action === "list_student_accounts" || body.action === "list_teacher_accounts") {
    const role = body.action === "list_teacher_accounts" ? "teacher" : "student";
    const { data: profiles, error: profileError } = await admin
      .from("profiles")
      .select("user_id, display_name, role, status, created_at")
      .eq("role", role)
      .order("display_name", { ascending: true });
    if (profileError) return jsonResponse(origin, { error: "Accounts could not be loaded." }, 500);

    const emails = new Map<string, string>();
    for (let page = 1; page <= 100; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) return jsonResponse(origin, { error: "Accounts could not be loaded." }, 500);
      for (const user of data.users) {
        if (user.email) emails.set(user.id, user.email);
      }
      if (data.users.length < 1000) break;
      if (page === 100) return jsonResponse(origin, { error: "Account list is too large to load." }, 503);
    }

    return jsonResponse(origin, {
      accounts: (profiles ?? []).map((profile) => ({
        user_id: profile.user_id,
        display_name: profile.display_name,
        email: emails.get(profile.user_id) ?? "",
        role: profile.role,
        status: profile.status,
        created_at: profile.created_at,
      })),
    });
  }

  if (body.action === "set_student_status" || body.action === "set_teacher_status") {
    const userId = inputText(body, "user_id", 64);
    const status = body.status;
    const expectedTargetRole = body.action === "set_teacher_status" ? "teacher" : "student";
    if (!userId || userId === callerId || (status !== "active" && status !== "disabled")) {
      return jsonResponse(origin, { error: "Invalid account status request." }, 400);
    }
    const target = await loadTargetProfile(admin, userId);
    if (!target || target.role !== expectedTargetRole) {
      return jsonResponse(origin, { error: "The target account was not found for this operation." }, 404);
    }
    const { error } = await admin.from("profiles").update({ status }).eq("user_id", userId);
    if (error) return jsonResponse(origin, { error: "The account status could not be changed." }, 500);
    return jsonResponse(origin, { ok: true, user_id: userId, status });
  }

  if (body.action === "reset_student_password") {
    const userId = inputText(body, "user_id", 64);
    if (!userId || userId === callerId) {
      return jsonResponse(origin, { error: "Invalid account reset request." }, 400);
    }
    const target = await loadTargetProfile(admin, userId);
    if (!target || target.role !== "student" || target.status !== "active") {
      return jsonResponse(origin, { error: "An active student account is required." }, 404);
    }

    const { error: lockError } = await admin
      .from("profiles")
      .update({ must_change_password: true })
      .eq("user_id", userId);
    if (lockError) return jsonResponse(origin, { error: "The account could not be prepared for reset." }, 500);

    const temporaryPassword = makeTemporaryPassword();
    const { error: resetError } = await admin.auth.admin.updateUserById(userId, {
      password: temporaryPassword,
    });
    if (resetError) {
      await admin
        .from("profiles")
        .update({ must_change_password: target.must_change_password })
        .eq("user_id", userId);
      return jsonResponse(origin, { error: "The password could not be reset." }, 500);
    }

    return jsonResponse(origin, {
      user_id: userId,
      temporary_password: temporaryPassword,
      must_change_password: true,
    });
  }

  return jsonResponse(origin, { error: "Unsupported account operation." }, 400);
}

Deno.serve(async (request: Request) => {
  const expectedOrigin = Deno.env.get("APP_ORIGIN");
  const origin = request.headers.get("origin");

  if (!expectedOrigin) {
    return new Response("Account function is not configured.", { status: 503 });
  }
  if (!origin || origin !== expectedOrigin) {
    return new Response("Origin not allowed.", { status: 403 });
  }
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }
  if (request.method !== "POST") {
    return jsonResponse(origin, { error: "Method not allowed." }, 405);
  }
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBodyLength) {
    return jsonResponse(origin, { error: "Request is too large." }, 413);
  }

  try {
    return await handleRequest(request, origin);
  } catch {
    return jsonResponse(origin, { error: "The account operation could not be completed." }, 500);
  }
});
