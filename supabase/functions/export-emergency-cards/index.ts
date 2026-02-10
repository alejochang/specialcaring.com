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
    if (!authHeader) throw new Error("Missing authorization header");

    const supabase = createClient(
      "https://ogkieklnxxmvjgikyzog.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9na2lla2xueHhtdmpnaWt5em9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTE0OTcsImV4cCI6MjA4NjIyNzQ5N30.t_QNH0OWpAG5mMFL8MVxbychwoYJljKTobE3lsMi8YU",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // Fetch emergency card data
    const { data: cards, error: cardsError } = await supabase
      .from("emergency_cards")
      .select("*");
    if (cardsError) throw cardsError;

    // Fetch key information
    const { data: keyInfo, error: keyInfoError } = await supabase
      .from("key_information")
      .select("*")
      .maybeSingle();
    if (keyInfoError) throw keyInfoError;

    // Fetch emergency protocols
    const { data: protocols, error: protocolsError } = await supabase
      .from("emergency_protocols")
      .select("*");
    if (protocolsError) throw protocolsError;

    // Build HTML for PDF-like content
    const card = cards?.[0];
    const html = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #1a1a1a; }
  h1 { color: #7C3AED; border-bottom: 2px solid #7C3AED; padding-bottom: 8px; }
  h2 { color: #5B21B6; margin-top: 24px; }
  .section { margin-bottom: 24px; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
  .field { margin-bottom: 8px; }
  .label { font-weight: bold; color: #4b5563; }
  .value { margin-left: 8px; }
  .protocol { margin-bottom: 16px; padding: 12px; border-left: 4px solid #7C3AED; background: #faf5ff; }
  .severity-high { border-left-color: #dc2626; }
  .severity-moderate { border-left-color: #f59e0b; }
  .footer { margin-top: 32px; text-align: center; color: #9ca3af; font-size: 12px; }
</style>
</head>
<body>
  <h1>🆘 Emergency Information Card</h1>
  <p style="color: #6b7280;">Generated on ${new Date().toLocaleDateString("en-CA")}</p>

  ${keyInfo ? `
  <div class="section">
    <h2>Personal Information</h2>
    <div class="field"><span class="label">Name:</span><span class="value">${keyInfo.full_name || "N/A"}</span></div>
    <div class="field"><span class="label">Date of Birth:</span><span class="value">${keyInfo.birth_date || "N/A"}</span></div>
    <div class="field"><span class="label">Phone:</span><span class="value">${keyInfo.phone_number || "N/A"}</span></div>
    <div class="field"><span class="label">Address:</span><span class="value">${keyInfo.address || "N/A"}</span></div>
    <div class="field"><span class="label">Health Card:</span><span class="value">${keyInfo.health_card_number || "N/A"}</span></div>
    <div class="field"><span class="label">Insurance:</span><span class="value">${keyInfo.insurance_provider || "N/A"} ${keyInfo.insurance_number ? `(#${keyInfo.insurance_number})` : ""}</span></div>
  </div>

  <div class="section">
    <h2>Emergency Contact</h2>
    <div class="field"><span class="label">Contact:</span><span class="value">${keyInfo.emergency_contact || "N/A"}</span></div>
    <div class="field"><span class="label">Phone:</span><span class="value">${keyInfo.emergency_phone || "N/A"}</span></div>
  </div>

  <div class="section">
    <h2>Medical Information</h2>
    <div class="field"><span class="label">Conditions:</span><span class="value">${keyInfo.medical_conditions || "None listed"}</span></div>
    <div class="field"><span class="label">Allergies:</span><span class="value">${keyInfo.allergies || "None listed"}</span></div>
    ${keyInfo.likes ? `<div class="field"><span class="label">Likes:</span><span class="value">${keyInfo.likes}</span></div>` : ""}
    ${keyInfo.dislikes ? `<div class="field"><span class="label">Dislikes:</span><span class="value">${keyInfo.dislikes}</span></div>` : ""}
    ${keyInfo.do_nots ? `<div class="field"><span class="label">Do Nots:</span><span class="value">${keyInfo.do_nots}</span></div>` : ""}
  </div>
  ` : "<p>No key information saved yet.</p>"}

  ${card ? `
  <div class="section">
    <h2>ID Card Information</h2>
    <div class="field"><span class="label">ID Type:</span><span class="value">${card.id_type || "N/A"}</span></div>
    <div class="field"><span class="label">ID Number:</span><span class="value">${card.id_number || "N/A"}</span></div>
    ${card.issue_date ? `<div class="field"><span class="label">Issue Date:</span><span class="value">${card.issue_date}</span></div>` : ""}
    ${card.expiry_date ? `<div class="field"><span class="label">Expiry Date:</span><span class="value">${card.expiry_date}</span></div>` : ""}
  </div>
  ` : ""}

  ${protocols && protocols.length > 0 ? `
  <h2>Emergency Protocols</h2>
  ${protocols.map((p: any) => `
    <div class="protocol ${p.severity === 'high' ? 'severity-high' : p.severity === 'moderate' ? 'severity-moderate' : ''}">
      <h3>${p.title} <span style="font-size:12px; color:#6b7280;">(${p.severity})</span></h3>
      <div class="field"><span class="label">Immediate Steps:</span><br/>${p.immediate_steps}</div>
      ${p.when_to_call_911 ? `<div class="field"><span class="label">When to Call 911:</span><br/>${p.when_to_call_911}</div>` : ""}
      ${p.emergency_contacts ? `<div class="field"><span class="label">Emergency Contacts:</span><br/>${p.emergency_contacts}</div>` : ""}
      ${p.additional_notes ? `<div class="field"><span class="label">Notes:</span><br/>${p.additional_notes}</div>` : ""}
    </div>
  `).join("")}
  ` : ""}

  <div class="footer">
    <p>Generated by Special Caring — Keep this document in a safe, accessible place.</p>
  </div>
</body>
</html>`;

    return new Response(JSON.stringify({ html, filename: "emergency-card.html" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
