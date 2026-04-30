/**
 * FlashDealsRow — Homepage flash deals horizontal rail (Prompt 3 migration).
 *
 * Now consumes canonical <ProductCard variant="flash" />. The hand-rolled
 * mini-card markup that previously lived here has been deleted.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Zap } from "lucide-react";
import ProductCard from "../ProductCard";

const formatTime = (ms: number) => {
  if (ms <= 0) return "00:00:00";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const FlashDealsRow = () => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const { data: deals = [] } = useQuery({
    queryKey: ["flash-deals-homepage"],
    queryFn: async () => {
      const nowIso = new Date().toISOString();
      const { data: fd, error } = await supabase
        .from("flash_deals")
        .select("*")
        .eq("is_active", true)
        .lte("start_time", nowIso)
        .gte("end_time", nowIso)
        .order("sort_order")
        .limit(8);
      if (error) throw error;
      if (!fd || fd.length === 0) return [];

      const productIds = fd.map((d) => d.product_id);
      const { data: products } = await supabase
        .from("products_public")
        .select(
          "id, slug, description, short_description, brand_name, thumbnail_url, stock_status, stock_code, currency, category_name, category_id",
        )
        .in("id", productIds);

      const pMap = new Map((products || []).map((p) => [p.id, p]));
      return fd.map((d) => ({ ...d, product: pMap.get(d.product_id) }));
    },
    staleTime: 5 * 60 * 1000,
  });

  if (deals.length === 0) return null;

  const earliestEnd = Math.min(...deals.map((d) => new Date(d.end_time).getTime()));
  const timeLeft = earliestEnd - now;

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-destructive" strokeWidth={1.75} />
            <h2 className="text-h3 text-foreground">Flash Deals</h2>
            <span className="bg-destructive text-destructive-foreground text-xs font-semibold px-3 py-1 rounded-full">
              {formatTime(timeLeft)}
            </span>
          </div>
          <Link to="/flash-deals" className="text-sm font-semibold text-primary hover:underline">
            View All Deals
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
          {deals.map((deal) => {
            const product = deal.product;
            if (!product) return null;
            return (
              <div key={deal.id} className="min-w-[200px] w-[200px] shrink-0">
                <ProductCard
                  variant="flash"
                  id={product.id || ""}
                  image={product.thumbnail_url || "/placeholder.svg"}
                  title={product.description || ""}
                  brand={product.brand_name || ""}
                  specs={product.short_description || undefined}
                  price={Number(deal.flash_price)}
                  currency={product.currency || "MMK"}
                  stockStatus={
                    (product.stock_status as "in_stock" | "low_stock" | "out_of_stock") ||
                    "in_stock"
                  }
                  sku={product.stock_code || ""}
                  slug={product.slug || ""}
                  categoryId={product.category_id || null}
                  categoryName={product.category_name || undefined}
                  flashSoldCount={deal.sold_count || 0}
                  flashStockLimit={deal.stock_limit}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FlashDealsRow;
