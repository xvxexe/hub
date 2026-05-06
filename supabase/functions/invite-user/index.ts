import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Max-Age": "86400",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Errore sconosciuto";
}

function buildRedirectTo(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  if (!origin.startsWith("https://") && !origin.startsWith("http://localhost")) return undefined;

  const cleanOrigin = origin.replace(/\/$/, "");
  const isGithubPages = cleanOrigin.endsWith("github.io");
  const basePath = isGithubPages ? "/hub" : "";
  return `${cleanOrigin}${basePath}/#/dashboard/login`;
}

async function getAdminContext(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceKey) {
    throw new Error("Config Supabase mancante nella Edge Function");
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return { response: json({ error: "Sessione mancante" }, 401) };
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) {
    return { response: json({ error: userError?.message ?? "Sessione non valida" }, 401) };
  }

  const { data: caller, error: callerError } = await adminClient
    .from("profiles")
    .select("role,active")
    .eq("id", userData.user.id)
    .single();

  if (callerError || !caller?.active || caller.role !== "admin") {
    return { response: json({ error: "Solo admin attivi possono gestire inviti e utenti" }, 403) };
  }

  return { adminClient, userData, supabaseUrl };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });

  try {
    const redirectTo = buildRedirectTo(req);

    if (req.method === "GET") {
      return json({ ok: true, function: "invite-user", version: 7, redirectTo: redirectTo ?? null });
    }

    if (req.method !== "POST") return json({ error: "Metodo non consentito" }, 405);

    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const action = String(body.action ?? "create_invite");

    const context = await getAdminContext(req);
    if (context.response) return context.response;
    const adminClient = context.adminClient!;
    const userData = context.userData!;

    if (action === "delete_user") {
      const email = String(body.email ?? "").trim().toLowerCase();
      const userId = String(body.userId ?? "").trim();
      if (!email && !userId) return json({ error: "Email o userId obbligatorio" }, 400);

      let targetUserId = userId;
      if (!targetUserId) {
        const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (error) return json({ error: error.message }, 500);
        const target = data.users.find((user) => String(user.email ?? "").toLowerCase() === email);
        if (!target) return json({ deleted: false, notFound: true, message: "Utente non trovato in Supabase Auth" });
        targetUserId = target.id;
      }

      await adminClient.from("profiles").delete().eq("id", targetUserId);
      await adminClient.from("invitations").delete().eq("email", email);

      const { error: deleteError } = await adminClient.auth.admin.deleteUser(targetUserId);
      if (deleteError) return json({ error: deleteError.message }, 500);
      return json({ deleted: true, userId: targetUserId });
    }

    const email = String(body.email ?? "").trim().toLowerCase();
    const fullName = String(body.full_name ?? body.fullName ?? "").trim();
    const role = String(body.role ?? "employee").trim().toLowerCase();
    const allowedRoles = ["admin", "accounting", "employee"];

    if (!email || !email.includes("@")) return json({ error: "Email non valida" }, 400);
    if (!fullName) return json({ error: "Nome completo obbligatorio" }, 400);
    if (!allowedRoles.includes(role)) return json({ error: "Ruolo non valido" }, 400);
    if (!redirectTo) return json({ error: "Origine sito non valida per generare il link invito" }, 400);

    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "invite",
      email,
      options: { redirectTo, data: { full_name: fullName, role } },
    });

    if (linkError || !linkData?.user) {
      return json({ error: linkError?.message ?? "Creazione link invito non riuscita" }, 400);
    }

    const { error: profileError } = await adminClient.from("profiles").upsert({
      id: linkData.user.id,
      email,
      full_name: fullName,
      role,
      active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

    if (profileError) return json({ error: profileError.message }, 400);

    await adminClient.from("invitations").insert({
      email,
      full_name: fullName,
      role,
      status: "created_in_auth",
      invited_by: userData.user.id,
    });

    return json({
      ok: true,
      mode: "manual_invite_link",
      redirectTo,
      user: { id: linkData.user.id, email, full_name: fullName, role, active: true },
      actionLink: linkData.properties?.action_link ?? null,
      message: "Utente creato e profilo assegnato. Copia il link invito e invialo manualmente all’utente.",
    });
  } catch (error) {
    console.error("Unhandled invite-user error", error);
    return json({ error: errorMessage(error) }, 500);
  }
});
