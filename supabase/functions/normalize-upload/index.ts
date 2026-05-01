// Internal-use edge function for Prompt 5 normalization batch.
// Accepts {path, base64, contentType} and writes to product-images-normalized bucket
// using the service role key. Protected by a shared secret header.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-batch-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    // Shared-secret auth: pipeline passes the service role key as x-batch-token.
    const expected = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const got = req.headers.get("x-batch-token");
    if (!expected || got !== expected) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { path, base64, contentType } = body ?? {};
    if (
      typeof path !== "string" ||
      typeof base64 !== "string" ||
      !path.length ||
      !base64.length
    ) {
      return new Response(JSON.stringify({ error: "bad_request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Path safety: confine to bucket root, no traversal.
    if (path.includes("..") || path.startsWith("/")) {
      return new Response(JSON.stringify({ error: "bad_path" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bin = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { error } = await supabase.storage
      .from("product-images-normalized")
      .upload(path, bin, {
        contentType: contentType || "image/webp",
        upsert: true,
      });
    if (error) {
      return new Response(
        JSON.stringify({ error: "upload_failed", detail: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    return new Response(JSON.stringify({ ok: true, path }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "exception", detail: String(e) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
