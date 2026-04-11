import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured — connect Resend in Lovable Cloud settings");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Accept either a direct communication_id or a webhook payload
    const payload = await req.json();
    let communicationId: string;

    if (payload.communication_id) {
      communicationId = payload.communication_id;
    } else if (payload.type === "INSERT" && payload.record?.id) {
      // DB webhook payload format
      communicationId = payload.record.id;
    } else {
      throw new Error("Missing communication_id or webhook record");
    }

    // Fetch the communication record with customer email
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

    // Get customer email
    const { data: customer, error: custError } = await supabase
      .from("customers")
      .select("email, name")
      .eq("id", comm.customer_id)
      .single();

    if (custError || !customer?.email) {
      // Update status to failed — no email to send to
      await supabase
        .from("customer_communications")
        .update({ status: "failed" })
        .eq("id", communicationId);

      throw new Error(`Customer email not found for customer_id: ${comm.customer_id}`);
    }

    // Send via Resend connector gateway
    const emailResponse = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: "IkonMart Orders <onboarding@resend.dev>",
        to: [customer.email],
        subject: comm.subject || "Order Update",
        html: comm.body || "",
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      // Update status to failed
      await supabase
        .from("customer_communications")
        .update({ status: "failed" })
        .eq("id", communicationId);

      throw new Error(`Resend API failed [${emailResponse.status}]: ${JSON.stringify(emailResult)}`);
    }

    // Update status to delivered
    await supabase
      .from("customer_communications")
      .update({ status: "delivered", sent_at: new Date().toISOString() })
      .eq("id", communicationId);

    console.log(`Email delivered for communication ${communicationId} to ${customer.email}`);

    return new Response(
      JSON.stringify({ success: true, communication_id: communicationId, resend_id: emailResult.id }),
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
