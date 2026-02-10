import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

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
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const { recipientEmail, recipientName } = await req.json();
    if (!recipientEmail) throw new Error("recipientEmail is required");

    const supabase = createClient(
      "https://ogkieklnxxmvjgikyzog.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9na2lla2xueHhtdmpnaWt5em9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTE0OTcsImV4cCI6MjA4NjIyNzQ5N30.t_QNH0OWpAG5mMFL8MVxbychwoYJljKTobE3lsMi8YU",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // Fetch medications HTML
    const exportResponse = await fetch(
      "https://ogkieklnxxmvjgikyzog.supabase.co/functions/v1/export-medications",
      { headers: { Authorization: authHeader, "Content-Type": "application/json" } }
    );
    const exportData = await exportResponse.json();
    if (exportData.error) throw new Error(exportData.error);

    const resend = new Resend(resendKey);

    const { data: keyInfo } = await supabase
      .from("key_information")
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
            <h1 style="margin: 0;">💊 Medications List</h1>
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
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending medications email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
