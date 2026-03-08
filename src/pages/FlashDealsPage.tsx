import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { useAddToCart } from "@/hooks/useCart";
import { ShoppingCart, Loader2, Zap, Home, ChevronRight } from "lucide-react";

const formatTime = (ms: number) => {
  if (ms <= 0) return "00:00:00";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const FlashDealsPage = () => {
  const [now, setNow] = useState(Date.now());
  const { addToCart, isAdding } = useAddToCart();

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["flash-deals-page"],
    queryFn: async () => {
      const { data: fd, error } = await supabase
        .from("flash_deals")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .limit(50);
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

  const earliestEnd = deals.length > 0
    ? Math.min(...deals.map((d) => new Date(d.end_time).getTime()))
    : 0;
  const timeLeft = earliestEnd - now;

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition flex items-center gap-1">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">Flash Deals</span>
        </nav>
      </div>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-red-600 to-orange-500 py-10 md:py-14 text-white">
        <div className="container mx-auto px-4 text-center">
          <Zap className="w-10 h-10 mx-auto mb-3 fill-white" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Flash Deals</h1>
          <p className="text-white/90 mb-4">Limited time offers — grab them before they're gone!</p>
          {timeLeft > 0 && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-5 py-2 rounded-full text-lg font-mono font-bold">
              ⏰ {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </section>

      {/* Grid */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded-card animate-pulse" />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-16">
            <Zap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-h3 text-foreground mb-2">No flash deals right now</h2>
            <p className="text-muted-foreground mb-6">Check back soon for amazing deals!</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-button font-semibold hover:bg-primary/90 transition"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {deals.map((deal) => {
              const product = deal.product;
              if (!product) return null;
              const soldPct = ((deal.sold_count || 0) / deal.stock_limit) * 100;
              const isSoldOut = (deal.sold_count || 0) >= deal.stock_limit;
              const discountPct = deal.discount_percentage || Math.round((1 - deal.flash_price / deal.original_price) * 100);
              const dealEnd = new Date(deal.end_time).getTime() - now;

              return (
                <Link
                  key={deal.id}
                  to={`/product/${product.slug}`}
                  className="relative bg-card rounded-card shadow-card overflow-hidden group hover:shadow-card-hover transition-shadow flex flex-col"
                >
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-card/80 z-10 flex items-center justify-center">
                      <span className="bg-muted-foreground text-white text-lg font-bold px-6 py-2 rounded-button -rotate-12">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                  <div className="relative aspect-square bg-muted/30 overflow-hidden">
                    <img
                      src={product.thumbnail_url || "/placeholder.svg"}
                      alt={product.description}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      -{discountPct}%
                    </span>
                  </div>
                  <div className="p-4 space-y-2 flex flex-col flex-1">
                    <p className="text-sm font-medium text-foreground line-clamp-2">{product.description}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-accent">
                        MMK {Number(deal.flash_price).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        {Number(deal.original_price).toLocaleString()}
                      </span>
                    </div>
                    {/* Stock bar */}
                    <div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            soldPct > 70 ? "bg-red-500" : soldPct > 30 ? "bg-orange-400" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(soldPct, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          {soldPct > 70 ? "🔥 Almost gone!" : soldPct > 30 ? "Selling fast" : "Just started"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {deal.sold_count || 0}/{deal.stock_limit}
                        </span>
                      </div>
                    </div>
                    {/* Per-deal countdown */}
                    <span className="text-xs text-muted-foreground font-mono">
                      ⏰ {formatTime(dealEnd)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isSoldOut) addToCart(product.id, 1, product.description);
                      }}
                      disabled={isAdding || isSoldOut}
                      className="w-full mt-auto bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-semibold py-2.5 rounded-button transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                      Add to Cart
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FlashDealsPage;
