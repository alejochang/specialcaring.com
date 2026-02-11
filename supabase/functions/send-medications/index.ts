import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { checkRateLimit, getClientIdentifier, rateLimitHeaders } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Stricter rate limit for email sending
const RATE_LIMIT_MAX = 5; // Max emails per window
const RATE_LIMIT_WINDOW = 300000; // 5 minutes

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not configured");

    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment configuration");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    // Apply rate limiting
    const clientId = getClientIdentifier(req);
    const rateLimitResult = checkRateLimit(`email:${clientId}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);

    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: "Email rate limit exceeded. Please try again later." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            ...rateLimitHeaders(rateLimitResult, RATE_LIMIT_MAX),
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { recipientEmail, recipientName } = await req.json();
    if (!recipientEmail) throw new Error("recipientEmail is required");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // Fetch medications HTML - use internal function call with env vars
    const exportResponse = await fetch(
      `${supabaseUrl}/functions/v1/export-medications`,
      { headers: { Authorization: authHeader, "Content-Type": "application/json" } }
    );
    const exportData = await exportResponse.json();
    if (exportData.error) throw new Error(exportData.error);

    const resend = new Resend(resendKey);

    // Use secure view for consistent RLS enforcement
    const { data: keyInfo } = await supabase
      .from("key_information_secure")
      .select("full_name")
      .maybeSingle();

    const patientName = keyInfo?.full_name || "your loved one";

    const emailResult = await resend.emails.send({
      from: "Special Caring <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Medications List for ${patientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #7C3AED; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Medications List</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Shared via Special Caring</p>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Hi${recipientName ? ` ${recipientName}` : ""},</p>
            <p>Please find the current medications list for <strong>${patientName}</strong> below.</p>
            <p style="color: #6b7280; font-size: 14px;">Please review and keep this information up to date with your healthcare provider.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            ${exportData.html}
          </div>
        </div>
      `,
    });

    console.log("Medications email sent:", emailResult);

    return new Response(JSON.stringify({ success: true, data: emailResult }), {
      headers: {
        ...corsHeaders,
        ...rateLimitHeaders(rateLimitResult, RATE_LIMIT_MAX),
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error sending medications email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
