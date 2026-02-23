import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Find all children owned by this user
    const { data: ownedAccess } = await adminClient
      .from("child_access")
      .select("child_id")
      .eq("user_id", userId)
      .eq("role", "owner");

    const ownedChildIds = (ownedAccess || []).map((a: { child_id: string }) => a.child_id);

    // 2. Delete owned children (cascade deletes all child data via FK)
    if (ownedChildIds.length > 0) {
      const { error: childrenError } = await adminClient
        .from("children")
        .delete()
        .in("id", ownedChildIds);

      if (childrenError) {
        console.error("Error deleting children:", childrenError);
        return new Response(JSON.stringify({ error: "Failed to delete children data" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 3. Remove user's non-owner child_access entries
    await adminClient.from("child_access").delete().eq("user_id", userId);

    // 4. Clean up user-specific tables
    await Promise.all([
      adminClient.from("profiles").delete().eq("id", userId),
      adminClient.from("user_roles").delete().eq("user_id", userId),
      adminClient.from("push_subscriptions").delete().eq("user_id", userId),
      adminClient.from("notification_preferences").delete().eq("user_id", userId),
    ]);

    // 5. Delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Delete auth user error:", deleteError);
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
