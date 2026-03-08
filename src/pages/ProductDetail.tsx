import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, ShoppingCart, FileText, Loader2, Zap, Truck, BadgeDollarSign, ShieldCheck, Check } from "lucide-react";
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

const wholesaleBenefits = [
  "Bulk Discounts Available",
  "Business Account Credit Terms",
  "Fast Delivery — Yangon Metro",
  "Dedicated Account Manager",
];

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [now, setNow] = useState(Date.now());
  const { addToCart, isAdding } = useAddToCart();
  const { user, openAuthModal } = useAuthContext();
  const navigate = useNavigate();
  const { getFlashDeal, getPromotion } = useMarketingData();

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

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
        .select("id, slug, description, short_description, brand_name, selling_price, currency, stock_status, stock_code, moq, thumbnail_url, is_featured, onhand_qty, unit_of_measure")
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
          <div className="grid lg:grid-cols-12 gap-8">
            <Skeleton className="aspect-square rounded-card lg:col-span-5" />
            <div className="space-y-4 lg:col-span-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-1/3" />
            </div>
            <Skeleton className="h-64 rounded-card lg:col-span-3" />
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
  const flashTimeLeft = flashDeal ? new Date(flashDeal.end_time).getTime() - now : 0;
  const flashSoldPct = flashDeal ? ((flashDeal.sold_count || 0) / flashDeal.stock_limit) * 100 : 0;

  // Build images array from product.images or fallback to thumbnail
  const images: string[] = [];
  if (product.images && Array.isArray(product.images)) {
    (product.images as string[]).forEach((img) => {
      if (typeof img === "string" && img) images.push(img);
    });
  }
  if (images.length === 0 && product.thumbnail_url) {
    images.push(product.thumbnail_url);
  }
  if (images.length === 0) {
    images.push("/placeholder.svg");
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-5">
            <div className="bg-card rounded-card shadow-card p-6 flex items-center justify-center aspect-square mb-3">
              <img
                src={images[selectedImage]}
                alt={product.description || ""}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg border-2 overflow-hidden shrink-0 transition-colors ${
                      i === selectedImage ? "border-primary" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MIDDLE: Product Info & Specs */}
          <div className="lg:col-span-4 space-y-5">
            {product.brand_name && (
              <div className="flex items-center gap-2">
                {product.brand_logo && (
                  <img src={product.brand_logo} alt={product.brand_name} className="h-6 w-auto object-contain" />
                )}
                <span className="text-sm font-semibold text-primary uppercase tracking-wide">{product.brand_name}</span>
              </div>
            )}

            <h1 className="text-h2 text-foreground">{product.description}</h1>

            {product.short_description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{product.short_description}</p>
            )}

            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${stock.textClass} ${stock.bgClass} px-3 py-1 rounded-full`}>
                <span className={`w-2 h-2 ${stock.dotClass} rounded-full`}></span>
                {stock.label}
              </span>
              <span className="text-sm text-muted-foreground">SKU: {product.stock_code}</span>
            </div>

            {product.category_name && (
              <p className="text-xs text-muted-foreground">Category: <span className="font-medium text-foreground">{product.category_name}</span></p>
            )}

            {/* Promotion Info */}
            {promotion && !flashDeal && (
              <div className="bg-primary/5 border border-primary/20 rounded-card p-3">
                <p className="text-sm font-semibold text-primary flex items-center gap-1.5">
                  🏷️ {promotion.title}
                </p>
                {promotion.description && (
                  <p className="text-xs text-muted-foreground mt-1">{promotion.description}</p>
                )}
              </div>
            )}

            {/* Key Specs as label:value rows */}
            {specs.length > 0 && (
              <div className="border-t border-border pt-4 space-y-0">
                <h3 className="text-sm font-semibold text-foreground mb-3">Specifications</h3>
                {specs.map(([key, val], i) => (
                  <div key={key} className={`flex justify-between py-2.5 text-sm ${i < specs.length - 1 ? "border-b border-border" : ""}`}>
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-medium text-foreground text-right">{String(val)}</span>
                  </div>
                ))}
              </div>
            )}

            {product.unit_of_measure && (
              <p className="text-xs text-muted-foreground">Unit of Measure: <span className="font-medium">{product.unit_of_measure}</span></p>
            )}
          </div>

          {/* RIGHT: Price Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            {/* Price Box */}
            <div className="bg-card rounded-card shadow-card p-5 space-y-4 border border-border">
              {/* Flash Deal Banner */}
              {flashDeal && (
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent fill-accent" />
                    <span className="text-xs font-bold text-accent">Flash Deal — {formatCountdown(flashTimeLeft)}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${flashSoldPct > 70 ? "bg-accent" : flashSoldPct > 30 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(flashSoldPct, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{flashDeal.sold_count || 0} / {flashDeal.stock_limit} claimed</p>
                </div>
              )}

              {/* Price */}
              {flashDeal ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-accent">
                      {product.currency || "MMK"} {Number(flashDeal.flash_price).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      {product.currency || "MMK"} {Number(flashDeal.original_price).toLocaleString()}
                    </span>
                    <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                      -{flashDeal.discount_percentage || Math.round((1 - flashDeal.flash_price / flashDeal.original_price) * 100)}%
                    </span>
                  </div>
                </div>
              ) : product.selling_price ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-accent">
                    {product.currency || "MMK"} {Number(product.selling_price).toLocaleString()}
                  </span>
                  {product.unit_of_measure && (
                    <span className="text-sm text-muted-foreground">/ {product.unit_of_measure}</span>
                  )}
                </div>
              ) : (
                <span className="text-lg font-semibold text-primary">Price on Request</span>
              )}

              {/* Ships info */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck className="w-4 h-4 text-primary" />
                Ships in 1–2 business days
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Quantity</label>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button onClick={() => setQty(Math.max(moq, qty - 1))} className="px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2.5 text-sm font-semibold text-foreground min-w-[3rem] text-center border-x border-border">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {moq > 1 && <p className="text-[10px] text-muted-foreground mt-1">Minimum order: {moq} units</p>}
              </div>

              {/* CTA Buttons */}
              <button
                onClick={() => product.id && addToCart(product.id, qty, product.description || "")}
                disabled={isAdding || product.stock_status === "out_of_stock"}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3 rounded-button transition flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
              >
                {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                Add to Cart
              </button>

              <button
                onClick={handleRequestQuote}
                className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold py-3 rounded-button transition flex items-center justify-center gap-2 text-sm"
              >
                <FileText className="w-5 h-5" /> Request Bulk Quote
              </button>
            </div>

            {/* Wholesale Benefits */}
            <div className="bg-card rounded-card shadow-card p-5 border border-border">
              <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <BadgeDollarSign className="w-4 h-4 text-primary" />
                Wholesale Benefits
              </h4>
              <ul className="space-y-2.5">
                {wholesaleBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust mini bar */}
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                Trusted by 1,000+ HoReCa Professionals
              </p>
            </div>
          </div>
        </div>

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
                    isFeatured={p.is_featured || false}
                    onhandQty={p.onhand_qty || undefined}
                    unitOfMeasure={p.unit_of_measure || undefined}
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
