import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAddToCart } from "@/hooks/useCart";
import { ShoppingCart, Loader2, Zap } from "lucide-react";

const formatTime = (ms: number) => {
  if (ms <= 0) return "00:00:00";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const FlashDealsRow = () => {
  const [now, setNow] = useState(Date.now());
  const { addToCart, isAdding } = useAddToCart();

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const { data: deals = [] } = useQuery({
    queryKey: ["flash-deals-homepage"],
    queryFn: async () => {
      const { data: fd, error } = await supabase
        .from("flash_deals")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .limit(8);
      if (error) throw error;
      if (!fd || fd.length === 0) return [];

      const productIds = fd.map((d) => d.product_id);
      const { data: products } = await supabase
        .from("products")
        .select("id, description, thumbnail_url, stock_code, slug")
        .in("id", productIds);

      const pMap = new Map((products || []).map((p) => [p.id, p]));
      return fd.map((d) => ({ ...d, product: pMap.get(d.product_id) }));
    },
    staleTime: 60 * 1000,
  });

  if (deals.length === 0) return null;

  const earliestEnd = Math.min(...deals.map((d) => new Date(d.end_time).getTime()));
  const timeLeft = earliestEnd - now;

  return (
    <section className="py-8 bg-gradient-to-r from-[hsl(var(--accent)/0.05)] to-[hsl(var(--ikon-red-light))]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-accent fill-accent" />
            <h2 className="text-h3 text-foreground">Flash Deals</h2>
            <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
              {formatTime(timeLeft)}
            </span>
          </div>
          <Link to="/flash-deals" className="text-sm font-semibold text-accent hover:underline">
            View All Deals →
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
          {deals.map((deal) => {
            const product = deal.product;
            if (!product) return null;
            const soldPct = ((deal.sold_count || 0) / deal.stock_limit) * 100;
            const discountPct = deal.discount_percentage || Math.round((1 - deal.flash_price / deal.original_price) * 100);

            return (
              <Link
                key={deal.id}
                to={`/product/${product.slug}`}
                className="min-w-[200px] w-[200px] bg-card rounded-card shadow-card overflow-hidden shrink-0 group hover:shadow-card-hover transition-shadow"
              >
                <div className="relative aspect-square bg-muted/30 overflow-hidden">
                  <img
                    src={product.thumbnail_url || "/placeholder.svg"}
                    alt={product.description}
                    className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
                    -{discountPct}%
                  </span>
                  {soldPct > 70 && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      🔥 Almost Gone!
                    </span>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-xs text-foreground font-medium line-clamp-2 leading-snug">
                    {product.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-accent">
                      MMK {Number(deal.flash_price).toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      {Number(deal.original_price).toLocaleString()}
                    </span>
                  </div>
                  {/* Stock bar */}
                  <div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          soldPct > 70 ? "bg-accent" : soldPct > 30 ? "bg-orange-400" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(soldPct, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {deal.sold_count || 0}/{deal.stock_limit} sold
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart(product.id, 1, product.description);
                    }}
                    disabled={isAdding}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-semibold py-2 rounded-button transition flex items-center justify-center gap-1"
                  >
                    {isAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShoppingCart className="w-3 h-3" />}
                    Add to Cart
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FlashDealsRow;
