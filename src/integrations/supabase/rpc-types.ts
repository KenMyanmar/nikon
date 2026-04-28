// Hand-maintained types for Supabase RPCs.
// The auto-generated `types.ts` file is overwritten on schema sync, so RPC
// row types that need stable typing in app code live here instead.

export interface SearchProductRow {
  id: string;
  stock_code: string | null;
  other_code: string | null;
  description: string;
  short_description: string | null;
  slug: string | null;
  selling_price: number | null;
  currency: string | null;
  stock_status: string | null;
  thumbnail_url: string | null;
  moq: number | null;
  onhand_qty: number | null;
  is_featured: boolean | null;
  brand_name: string | null;
  brand_slug: string | null;
  brand_logo: string | null;
  category_name: string | null;
  category_slug: string | null;
  group_name: string | null;
  rank: number | null;
}
