import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-import-key",
};

/** RFC 4180-compliant CSV parser that handles quoted fields with embedded newlines and commas */
function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentField);
        currentField = "";
      } else if (char === "\n" || char === "\r") {
        if (char === "\r" && i + 1 < text.length && text[i + 1] === "\n") {
          i++; // skip \n in \r\n
        }
        currentRow.push(currentField);
        currentField = "";
        if (currentRow.some((f) => f.trim() !== "")) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else {
        currentField += char;
      }
    }
  }

  // Last field/row
  currentRow.push(currentField);
  if (currentRow.some((f) => f.trim() !== "")) {
    rows.push(currentRow);
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const result: Record<string, string>[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (rows[i][idx] || "").trim();
    });
    result.push(row);
  }
  return result;
}

/** Deduplicate array by key, keeping the last occurrence */
function deduplicateBy<T>(arr: T[], keyFn: (item: T) => string | undefined): T[] {
  const map = new Map<string, T>();
  for (const item of arr) {
    const key = keyFn(item);
    if (key !== undefined && key !== "") {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 200);
}

function jsonResp(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth check
  const importKey = req.headers.get("x-import-key");
  const secret = Deno.env.get("IMPORT_SECRET");
  if (!importKey || importKey !== secret) {
    return jsonResp({ error: "Unauthorized" }, 401);
  }

  if (req.method !== "POST") {
    return jsonResp({ error: "Method not allowed" }, 405);
  }

  const url = new URL(req.url);
  const table = url.searchParams.get("table");
  if (!table || !["groups", "categories", "brands", "products"].includes(table)) {
    return jsonResp({ error: "Invalid ?table= param. Use: groups, categories, brands, products" }, 400);
  }

  const body = await req.text();
  const rows = parseCSV(body);
  if (rows.length === 0) {
    return jsonResp({ error: "No data rows found in CSV" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const errors: string[] = [];
  let inserted = 0;
  let updated = 0;

  try {
    if (table === "groups") {
      const records = deduplicateBy(
        rows.map((r) => ({ code: r.code, name: r.name })),
        (r) => r.code
      );
      const { data, error } = await supabase
        .from("product_groups")
        .upsert(records, { onConflict: "code" })
        .select();
      if (error) throw error;
      inserted = data?.length || 0;
    }

    if (table === "categories") {
      const { data: groups } = await supabase
        .from("product_groups")
        .select("id, code");
      const groupMap = new Map((groups || []).map((g) => [g.code, g.id]));

      const records = deduplicateBy(
        rows.map((r) => ({
          name: r.name,
          slug: r.slug,
          group_id: groupMap.get(r.group_code) || null,
        })),
        (r) => r.slug
      );
      const { data, error } = await supabase
        .from("categories")
        .upsert(records, { onConflict: "slug" })
        .select();
      if (error) throw error;
      inserted = data?.length || 0;
    }

    if (table === "brands") {
      const records = deduplicateBy(
        rows.map((r) => ({ name: r.name, slug: r.slug })),
        (r) => r.slug
      );
      const { data, error } = await supabase
        .from("brands")
        .upsert(records, { onConflict: "slug" })
        .select();
      if (error) throw error;
      inserted = data?.length || 0;
    }

    if (table === "products") {
      const { data: cats } = await supabase
        .from("categories")
        .select("id, name");
      const catMap = new Map((cats || []).map((c) => [c.name, c.id]));

      const { data: brands } = await supabase
        .from("brands")
        .select("id, name");
      const brandMap = new Map((brands || []).map((b) => [b.name, b.id]));

      const { data: groups } = await supabase
        .from("product_groups")
        .select("id, code");
      const groupMap = new Map((groups || []).map((g) => [g.code, g.id]));

      const CHUNK = 200;
      for (let i = 0; i < rows.length; i += CHUNK) {
        const chunk = rows.slice(i, i + CHUNK);
        const records = deduplicateBy(
          chunk.map((r) => ({
            stock_code: r.stock_code,
            other_code: r.other_code || null,
            description: r.description,
            short_description: r.short_description || null,
            slug: slugify(`${r.description}-${r.stock_code}`),
            selling_price: null,
            currency: r.currency || "MMK",
            stock_status: r.stock_status || "in_stock",
            moq: parseInt(r.moq) || 1,
            onhand_qty: parseInt(r.onhand_qty) || 0,
            min_qty: parseInt(r.min_qty) || 0,
            max_qty: parseInt(r.max_qty) || 0,
            reorder_qty: parseInt(r.reorder_qty) || 0,
            unit_cost: parseFloat(r.unit_cost) || 0,
            unit_of_measure: r.unit_of_measure || null,
            packing: r.packing || null,
            item_type: r.item_type || null,
            main_vendor: r.main_vendor || null,
            is_active: true,
            is_featured: r.is_featured === "true",
            category_id: catMap.get(r.category) || null,
            brand_id: brandMap.get(r.brand) || null,
            group_id: groupMap.get(r.group_code) || null,
          })),
          (r) => r.stock_code
        );

        const { data, error } = await supabase
          .from("products")
          .upsert(records, { onConflict: "stock_code" })
          .select("id");

        if (error) {
          errors.push(`Chunk ${i / CHUNK + 1}: ${error.message}`);
        } else {
          inserted += data?.length || 0;
        }
      }
    }
  } catch (e) {
    return jsonResp(
      { success: false, table, error: e.message, errors },
      500
    );
  }

  return jsonResp({ success: true, table, inserted, updated, errors });
});
