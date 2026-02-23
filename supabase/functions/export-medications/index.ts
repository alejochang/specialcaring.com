import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIdentifier, rateLimitHeaders } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RATE_LIMIT_MAX = 10; // Max requests per window
const RATE_LIMIT_WINDOW = 60000; // 1 minute

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    const rateLimitResult = checkRateLimit(clientId, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);

    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
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

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { data: medications, error: medsError } = await supabase
      .from("medications")
      .select("*")
      .order("name");
    if (medsError) throw medsError;

    // Use secure view for consistent RLS enforcement
    const { data: keyInfo } = await supabase
      .from("children_secure")
      .select("full_name")
      .maybeSingle();

    const formatFrequency = (freq: string) => {
      const mapping: Record<string, string> = {
        once_daily: "Once Daily", twice_daily: "Twice Daily",
        three_times_daily: "Three Times Daily", four_times_daily: "Four Times Daily",
        every_morning: "Every Morning", every_night: "Every Night",
        as_needed: "As Needed", weekly: "Weekly", monthly: "Monthly", other: "Custom",
      };
      return mapping[freq] || freq;
    };

    const html = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #1a1a1a; }
  h1 { color: #7C3AED; border-bottom: 2px solid #7C3AED; padding-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th { background: #7C3AED; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
  td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
  tr:nth-child(even) { background: #f9fafb; }
  .med-detail { margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; page-break-inside: avoid; }
  .med-detail h3 { color: #5B21B6; margin: 0 0 12px 0; }
  .field { margin-bottom: 6px; }
  .label { font-weight: bold; color: #4b5563; }
  .footer { margin-top: 32px; text-align: center; color: #9ca3af; font-size: 12px; }
</style>
</head>
<body>
  <h1>Medications List</h1>
  <p style="color: #6b7280;">
    ${keyInfo?.full_name ? `For: ${keyInfo.full_name} — ` : ""}Generated on ${new Date().toLocaleDateString("en-CA")}
  </p>

  ${medications && medications.length > 0 ? `
  <table>
    <tr>
      <th>Medication</th>
      <th>Dosage</th>
      <th>Frequency</th>
      <th>Purpose</th>
      <th>Prescriber</th>
    </tr>
    ${medications.map((m: any) => `
    <tr>
      <td><strong>${m.name}</strong></td>
      <td>${m.dosage || "-"}</td>
      <td>${formatFrequency(m.frequency)}</td>
      <td>${m.purpose || "-"}</td>
      <td>${m.prescriber || "-"}</td>
    </tr>
    `).join("")}
  </table>

  <h2 style="color: #5B21B6; margin-top: 32px;">Detailed Information</h2>
  ${medications.map((m: any) => `
  <div class="med-detail">
    <h3>${m.name} — ${m.dosage}</h3>
    <div class="field"><span class="label">Frequency:</span> ${formatFrequency(m.frequency)}</div>
    ${m.purpose ? `<div class="field"><span class="label">Purpose:</span> ${m.purpose}</div>` : ""}
    ${m.prescriber ? `<div class="field"><span class="label">Prescriber:</span> ${m.prescriber}</div>` : ""}
    ${m.start_date ? `<div class="field"><span class="label">Start Date:</span> ${m.start_date}</div>` : ""}
    ${m.end_date ? `<div class="field"><span class="label">End Date:</span> ${m.end_date}</div>` : ""}
    ${m.instructions ? `<div class="field"><span class="label">Instructions:</span> ${m.instructions}</div>` : ""}
  </div>
  `).join("")}
  ` : "<p>No medications have been added yet.</p>"}

  <div class="footer">
    <p>Generated by Special Caring — Share this document with your care team.</p>
  </div>
</body>
</html>`;

    return new Response(JSON.stringify({ html, filename: "medications-list.html" }), {
      headers: {
        ...corsHeaders,
        ...rateLimitHeaders(rateLimitResult, RATE_LIMIT_MAX),
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
