import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, ShoppingCart, FileText, Loader2, Zap } from "lucide-react";
import { useAddToCart } from "@/hooks/useCart";
import { useMarketingData } from "@/hooks/useMarketingData";
const stockConfig = {
  in_stock: { label: "In Stock", dotClass: "bg-emerald-500", textClass: "text-emerald-700", bgClass: "bg-emerald-50" },
  low_stock: { label: "Low Stock", dotClass: "bg-amber-500", textClass: "text-amber-700", bgClass: "bg-amber-50" },
  out_of_stock: { label: "Out of Stock", dotClass: "bg-red-500", textClass: "text-red-700", bgClass: "bg-red-50" },
};

const formatCountdown = (ms: number) => {
  if (ms <= 0) return "00:00:00";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [qty, setQty] = useState(1);
  const [now, setNow] = useState(Date.now());
  const { addToCart, isAdding } = useAddToCart();
  const { user, openAuthModal } = useAuthContext();
  const navigate = useNavigate();
  const { getFlashDeal, getPromotion } = useMarketingData();

  const handleRequestQuote = () => {
    if (!user) { openAuthModal(); return; }
    if (product?.id) navigate(`/request-quote?product=${product.id}`);
  };

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products_public")
        .select("*")
        .eq("slug", slug!)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: related } = useQuery({
    queryKey: ["related-products", product?.category_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products_public")
        .select("id, slug, description, short_description, brand_name, selling_price, currency, stock_status, stock_code, moq, thumbnail_url")
        .eq("is_active", true)
        .eq("category_id", product!.category_id!)
        .neq("id", product!.id!)
        .limit(6);
      if (error) throw error;
      return data;
    },
    enabled: !!product?.category_id && !!product?.id,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-card" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-1/3" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-h2 text-foreground">Product not found</h1>
        </div>
      </MainLayout>
    );
  }

  const stock = stockConfig[(product.stock_status as keyof typeof stockConfig) || "in_stock"];
  const specs = product.specifications && typeof product.specifications === "object" && !Array.isArray(product.specifications)
    ? Object.entries(product.specifications as Record<string, string>)
    : [];
  const moq = product.moq || 1;
  const flashDeal = product.id ? getFlashDeal(product.id) : undefined;
  const promotion = product.id ? getPromotion(product.id, product.category_id, product.brand_id) : undefined;

  // Countdown timer for flash deals
  useEffect(() => {
    if (!flashDeal) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [flashDeal]);

  const flashTimeLeft = flashDeal ? new Date(flashDeal.end_time).getTime() - now : 0;
  const flashSoldPct = flashDeal ? ((flashDeal.sold_count || 0) / flashDeal.stock_limit) * 100 : 0;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Image */}
          <div className="bg-card rounded-card shadow-card p-8 flex items-center justify-center aspect-square">
            <img
              src={product.thumbnail_url || "/placeholder.svg"}
              alt={product.description || ""}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Details */}
          <div className="space-y-4">
            {product.brand_name && (
              <p className="text-sm font-semibold text-primary uppercase tracking-wide">{product.brand_name}</p>
            )}
            <h1 className="text-h2 text-foreground">{product.description}</h1>
            {product.short_description && (
              <p className="text-sm text-ikon-text-secondary">{product.short_description}</p>
            )}

            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${stock.textClass} ${stock.bgClass} px-3 py-1 rounded-full`}>
                <span className={`w-2 h-2 ${stock.dotClass} rounded-full`}></span>
                {stock.label}
              </span>
              <span className="text-sm text-ikon-text-tertiary">SKU: {product.stock_code}</span>
            </div>

            {/* Flash Deal Banner */}
            {flashDeal && (
              <div className="bg-accent/10 border border-accent/30 rounded-card p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent fill-accent" />
                  <span className="text-sm font-bold text-accent">Flash Deal — Ends in {formatCountdown(flashTimeLeft)}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${flashSoldPct > 70 ? "bg-accent" : flashSoldPct > 30 ? "bg-orange-400" : "bg-emerald-500"}`}
                    style={{ width: `${Math.min(flashSoldPct, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{flashDeal.sold_count || 0} of {flashDeal.stock_limit} claimed</p>
              </div>
            )}

            {/* Price */}
            <div className="pt-2">
              {flashDeal ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-accent">
                    {product.currency || "MMK"} {Number(flashDeal.flash_price).toLocaleString()}
                  </span>
                  <span className="text-base text-muted-foreground line-through">
                    {product.currency || "MMK"} {Number(flashDeal.original_price).toLocaleString()}
                  </span>
                  <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    -{flashDeal.discount_percentage || Math.round((1 - flashDeal.flash_price / flashDeal.original_price) * 100)}%
                  </span>
                </div>
              ) : product.selling_price ? (
                <span className="text-2xl font-bold text-accent">
                  {product.currency || "MMK"} {Number(product.selling_price).toLocaleString()}
                </span>
              ) : (
                <span className="text-lg font-semibold text-primary">Price on Request</span>
              )}
            </div>

            {/* Quantity + Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center border border-ikon-border rounded-md">
                <button onClick={() => setQty(Math.max(moq, qty - 1))} className="px-3 py-2 text-ikon-text-secondary hover:text-foreground">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm font-semibold text-foreground min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-ikon-text-secondary hover:text-foreground">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {moq > 1 && <span className="text-xs text-ikon-text-tertiary">MOQ: {moq}</span>}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => product.id && addToCart(product.id, qty, product.description || "")}
                disabled={isAdding}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 rounded-button transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />} Add to Cart
              </button>
              <button
                onClick={handleRequestQuote}
                className="flex-1 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold py-3 rounded-button transition flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" /> Request Quote
              </button>
            </div>

            {/* Promotion Info */}
            {promotion && !flashDeal && (
              <div className="bg-primary/5 border border-primary/20 rounded-card p-3">
                <p className="text-sm font-semibold text-primary flex items-center gap-1.5">
                  🏷️ {promotion.title}
                </p>
                {promotion.description && (
                  <p className="text-xs text-muted-foreground mt-1">{promotion.description}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">Discount applied automatically at checkout</p>
              </div>
            )}

            {product.unit_of_measure && (
              <p className="text-xs text-ikon-text-tertiary">Unit: {product.unit_of_measure}</p>
            )}
          </div>
        </div>

        {/* Specifications */}
        {specs.length > 0 && (
          <div className="mb-16">
            <h2 className="text-h3 text-foreground mb-4">Specifications</h2>
            <div className="bg-card rounded-card shadow-card overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {specs.map(([key, val], i) => (
                    <tr key={key} className={i % 2 === 0 ? "bg-ikon-bg-secondary" : ""}>
                      <td className="px-4 py-3 font-medium text-foreground w-1/3">{key}</td>
                      <td className="px-4 py-3 text-ikon-text-secondary">{String(val)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Related Products */}
        {related && related.length > 0 && (
          <div>
            <h2 className="text-h3 text-foreground mb-6">Related Products</h2>
            <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4">
              {related.map((p) => (
                <div key={p.id} className="min-w-[220px] md:min-w-[260px] flex-shrink-0">
                  <ProductCard
                    id={p.id || ""}
                    image={p.thumbnail_url || "/placeholder.svg"}
                    title={p.description || ""}
                    brand={p.brand_name || ""}
                    specs={p.short_description || undefined}
                    price={p.selling_price ? Number(p.selling_price) : null}
                    currency={p.currency || "MMK"}
                    moq={p.moq || undefined}
                    stockStatus={(p.stock_status as "in_stock" | "low_stock" | "out_of_stock") || "in_stock"}
                    sku={p.stock_code || ""}
                    slug={p.slug || ""}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProductDetail;
