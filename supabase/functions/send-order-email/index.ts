import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Accept either a direct communication_id or a webhook payload
    const payload = await req.json();
    let communicationId: string;

    if (payload.communication_id) {
      communicationId = payload.communication_id;
    } else if (payload.type === "INSERT" && payload.record?.id) {
      communicationId = payload.record.id;
    } else {
      throw new Error("Missing communication_id or webhook record");
    }

    // Fetch the communication record
    const { data: comm, error: commError } = await supabase
      .from("customer_communications")
      .select("id, subject, body, channel, status, customer_id, order_id, template_key")
      .eq("id", communicationId)
      .single();

    if (commError || !comm) {
      throw new Error(`Communication not found: ${commError?.message || communicationId}`);
    }

    // Skip if already processed
    if (comm.status === "delivered" || comm.status === "sent") {
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "already delivered" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only process email channel
    if (comm.channel !== "email") {
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: `channel is ${comm.channel}, not email` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get customer email for logging
    const { data: customer } = await supabase
      .from("customers")
      .select("email, name")
      .eq("id", comm.customer_id)
      .single();

    // --- EMAIL SENDING PLACEHOLDER ---
    // Currently skipping actual email delivery.
    // To enable real emails later, add Resend/SMTP logic here.
    console.log(`[PLACEHOLDER] Would send email to ${customer?.email || 'unknown'}: "${comm.subject}"`);

    // Mark as delivered (pipeline is wired, email sending skipped for now)
    await supabase
      .from("customer_communications")
      .update({ status: "delivered", sent_at: new Date().toISOString() })
      .eq("id", communicationId);

    console.log(`Communication ${communicationId} marked as delivered (email sending placeholder)`);

    return new Response(
      JSON.stringify({ success: true, communication_id: communicationId, placeholder: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("send-order-email error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
