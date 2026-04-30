/**
 * RecommendedProducts — Cart/Checkout "Things you'll love" rail (Prompt 3 migration).
 *
 * Now consumes canonical <ProductCard variant="compact" />. Hand-rolled markup deleted.
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";

interface CartItem {
  product_id: string;
  product?: {
    category_id?: string | null;
    group_id?: string | null;
  } | null;
}

interface RecommendedProductsProps {
  cartItems: CartItem[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SELECT =
  "id, slug, description, short_description, brand_name, selling_price, currency, stock_status, stock_code, thumbnail_url, category_id, category_name";

const RecommendedProducts = ({ cartItems }: RecommendedProductsProps) => {
  const { categoryIds, groupIds, cartProductIds } = useMemo(() => {
    const cats = new Set<string>();
    const groups = new Set<string>();
    const ids = new Set<string>();
    cartItems.forEach((item) => {
      ids.add(item.product_id);
      if (item.product?.category_id) cats.add(item.product.category_id);
      if (item.product?.group_id) groups.add(item.product.group_id);
    });
    return {
      categoryIds: Array.from(cats),
      groupIds: Array.from(groups),
      cartProductIds: Array.from(ids),
    };
  }, [cartItems]);

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ["recommendations", cartProductIds, categoryIds, groupIds],
    queryFn: async () => {
      const excludeIds = [...cartProductIds];
      const selectedIds = new Set<string>();

      let sameCat: any[] = [];
      if (categoryIds.length > 0) {
        const { data } = await supabase
          .from("products_public")
          .select(SELECT)
          .in("category_id", categoryIds)
          .not("id", "in", `(${excludeIds.join(",")})`)
          .not("thumbnail_url", "is", null)
          .limit(10);
        sameCat = shuffle(data || []).slice(0, 2);
        sameCat.forEach((p) => selectedIds.add(p.id));
      }

      const featExclude = [...excludeIds, ...Array.from(selectedIds)];
      const { data: featData } = await supabase
        .from("products_public")
        .select(SELECT)
        .eq("is_featured", true)
        .not("id", "in", `(${featExclude.join(",")})`)
        .not("thumbnail_url", "is", null)
        .limit(10);
      const featured = shuffle(featData || []).slice(0, 2);
      featured.forEach((p) => selectedIds.add(p.id));

      let complementary: any[] = [];
      if (groupIds.length > 0 && categoryIds.length > 0) {
        const compExclude = [...excludeIds, ...Array.from(selectedIds)];
        const { data } = await supabase
          .from("products_public")
          .select(SELECT)
          .in("group_id", groupIds)
          .not("category_id", "in", `(${categoryIds.join(",")})`)
          .not("id", "in", `(${compExclude.join(",")})`)
          .not("thumbnail_url", "is", null)
          .limit(10);
        complementary = shuffle(data || []).slice(0, 2);
      }

      let combined = [...sameCat, ...featured, ...complementary];

      if (combined.length < 6) {
        const allIds = [...excludeIds, ...combined.map((p) => p.id)];
        const { data: filler } = await supabase
          .from("products_public")
          .select(SELECT)
          .not("id", "in", `(${allIds.join(",")})`)
          .not("thumbnail_url", "is", null)
          .limit(10);
        const extra = shuffle(filler || []).slice(0, 6 - combined.length);
        combined = [...combined, ...extra];
      }

      return shuffle(combined).slice(0, 6);
    },
    enabled: cartItems.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" strokeWidth={1.75} />
          <h3 className="text-h4 text-foreground">Things you'll love</h3>
        </div>
        <div className="flex gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="min-w-[160px] w-[160px] animate-pulse">
              <div className="aspect-square bg-muted rounded-card" />
              <div className="h-3 bg-muted rounded mt-2 w-16" />
              <div className="h-4 bg-muted rounded mt-1 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="py-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" strokeWidth={1.75} />
        <h3 className="text-h4 text-foreground">Things you'll love</h3>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory md:snap-none md:overflow-x-visible md:grid md:grid-cols-3 lg:grid-cols-6">
        {recommendations.map((p) => (
          <div
            key={p.id}
            className="min-w-[160px] w-[160px] md:min-w-0 md:w-auto snap-start shrink-0"
          >
            <ProductCard
              variant="compact"
              id={p.id}
              image={p.thumbnail_url || "/placeholder.svg"}
              title={p.description || ""}
              brand={p.brand_name || ""}
              specs={p.short_description || undefined}
              price={p.selling_price ? Number(p.selling_price) : null}
              currency={p.currency || "MMK"}
              stockStatus={
                (p.stock_status as "in_stock" | "low_stock" | "out_of_stock") || "in_stock"
              }
              sku={p.stock_code || ""}
              slug={p.slug || ""}
              categoryId={p.category_id || null}
              categoryName={p.category_name || undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
