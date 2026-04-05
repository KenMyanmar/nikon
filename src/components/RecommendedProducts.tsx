import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAddToCart } from "@/hooks/useCart";
import { Sparkles, ShoppingCart, Loader2 } from "lucide-react";

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

const RecommendedProducts = ({ cartItems }: RecommendedProductsProps) => {
  const { addToCart, isAdding } = useAddToCart();

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

      // Strategy 1: Same category
      let sameCat: any[] = [];
      if (categoryIds.length > 0) {
        const { data } = await supabase
          .from("products_public")
          .select("id, slug, description, selling_price, currency, thumbnail_url, brand_name, category_name")
          .in("category_id", categoryIds)
          .not("id", "in", `(${excludeIds.join(",")})`)
          .not("thumbnail_url", "is", null)
          .limit(10);
        sameCat = shuffle(data || []).slice(0, 2);
        sameCat.forEach((p) => selectedIds.add(p.id));
      }

      // Strategy 2: Featured
      const featExclude = [...excludeIds, ...Array.from(selectedIds)];
      const { data: featData } = await supabase
        .from("products_public")
        .select("id, slug, description, selling_price, currency, thumbnail_url, brand_name, category_name")
        .eq("is_featured", true)
        .not("id", "in", `(${featExclude.join(",")})`)
        .not("thumbnail_url", "is", null)
        .limit(10);
      const featured = shuffle(featData || []).slice(0, 2);
      featured.forEach((p) => selectedIds.add(p.id));

      // Strategy 3: Complementary group (same group, different category)
      let complementary: any[] = [];
      if (groupIds.length > 0 && categoryIds.length > 0) {
        const compExclude = [...excludeIds, ...Array.from(selectedIds)];
        const { data } = await supabase
          .from("products_public")
          .select("id, slug, description, selling_price, currency, thumbnail_url, brand_name, category_name")
          .in("group_id", groupIds)
          .not("category_id", "in", `(${categoryIds.join(",")})`)
          .not("id", "in", `(${compExclude.join(",")})`)
          .not("thumbnail_url", "is", null)
          .limit(10);
        complementary = shuffle(data || []).slice(0, 2);
      }

      let combined = [...sameCat, ...featured, ...complementary];

      // Fill to 6 if short
      if (combined.length < 6) {
        const allIds = [...excludeIds, ...combined.map((p) => p.id)];
        const { data: filler } = await supabase
          .from("products_public")
          .select("id, slug, description, selling_price, currency, thumbnail_url, brand_name, category_name")
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
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="text-h4 text-foreground">Things you'll love</h3>
        </div>
        <div className="flex gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="min-w-[140px] md:min-w-[180px] animate-pulse">
              <div className="aspect-square bg-muted rounded-lg" />
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
        <Sparkles className="w-5 h-5 text-accent" />
        <h3 className="text-h4 text-foreground">Things you'll love</h3>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory md:snap-none md:overflow-x-visible md:flex-wrap">
        {recommendations.map((product) => {
          const price = Number(product.selling_price) || 0;
          return (
            <div
              key={product.id}
              className="min-w-[140px] w-[140px] md:min-w-[180px] md:w-auto md:flex-1 max-w-[220px] snap-start shrink-0 bg-card rounded-card shadow-card overflow-hidden flex flex-col"
            >
              <Link to={`/product/${product.slug || product.id}`} className="block">
                <div className="aspect-square bg-secondary/30 p-2">
                  <img
                    src={product.thumbnail_url!}
                    alt={product.description || ""}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              </Link>

              <div className="p-2 flex flex-col flex-1">
                {product.brand_name && (
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">
                    {product.brand_name}
                  </span>
                )}
                <Link
                  to={`/product/${product.slug || product.id}`}
                  className="text-xs font-medium text-foreground line-clamp-2 hover:text-primary transition-colors mt-0.5 flex-1"
                >
                  {product.description}
                </Link>

                <div className="mt-1.5">
                  {price > 0 ? (
                    <span className="text-sm font-bold text-foreground">
                      {product.currency || "MMK"} {price.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-primary">Quote</span>
                  )}
                </div>

                <button
                  onClick={() => addToCart(product.id, 1, product.description || undefined)}
                  disabled={isAdding}
                  className="mt-2 w-full flex items-center justify-center gap-1 bg-primary text-primary-foreground text-xs font-semibold py-1.5 rounded-button hover:bg-primary/90 transition disabled:opacity-50"
                >
                  <ShoppingCart className="w-3 h-3" />
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedProducts;
