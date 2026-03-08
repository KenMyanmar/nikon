import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Minus, Plus, ShoppingCart, FileText, Loader2, Zap, Truck, Star, Package, ShieldCheck, ArrowRight, CreditCard } from "lucide-react";
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

const paymentMethods = ["KBZ Bank", "KBZ Pay", "AYA Pay", "MPU", "CBPay"];

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [activeTab, setActiveTab] = useState("description");
  const imgRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
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

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const scrollToReviews = () => {
    setActiveTab("reviews");
    setTimeout(() => tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
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

  const { data: productExtra } = useQuery({
    queryKey: ["product-extra", product?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("long_description, tags")
        .eq("id", product!.id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!product?.id,
  });

  const { data: productImages } = useQuery({
    queryKey: ["product-images", product?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", product!.id!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!product?.id,
  });

  const { data: pricingTiers } = useQuery({
    queryKey: ["pricing-tiers", product?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_tiers")
        .select("*")
        .eq("product_id", product!.id!)
        .order("min_qty", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!product?.id,
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
            <div className="space-y-4 lg:col-span-7">
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
  const flashTimeLeft = flashDeal ? new Date(flashDeal.end_time).getTime() - now : 0;
  const flashSoldPct = flashDeal ? ((flashDeal.sold_count || 0) / flashDeal.stock_limit) * 100 : 0;

  // Determine active pricing tier based on qty
  const activeTier = pricingTiers?.find((t) => qty >= t.min_qty && (t.max_qty == null || qty <= t.max_qty));

  // Build images array
  const images: { url: string; alt: string }[] = [];
  if (productImages && productImages.length > 0) {
    productImages.forEach((img) => {
      images.push({ url: img.image_url, alt: img.alt_text || product.description || "" });
    });
  } else if (product.images && Array.isArray(product.images)) {
    (product.images as string[]).forEach((img) => {
      if (typeof img === "string" && img) images.push({ url: img, alt: product.description || "" });
    });
  }
  if (images.length === 0 && product.thumbnail_url) {
    images.push({ url: product.thumbnail_url, alt: product.description || "" });
  }
  if (images.length === 0) {
    images.push({ url: "/placeholder.svg", alt: "Product placeholder" });
  }

  // Build info rows for specifications tab
  const infoRows: { label: string; value: string }[] = [];
  if (product.brand_name) infoRows.push({ label: "Brand", value: product.brand_name });
  if (product.category_name) infoRows.push({ label: "Category", value: product.category_name });
  if (product.group_name) infoRows.push({ label: "Group", value: product.group_name });
  if (product.stock_code) infoRows.push({ label: "SKU / Stock Code", value: product.stock_code });
  if (product.other_code) infoRows.push({ label: "Alt Code", value: product.other_code });
  if (product.unit_of_measure) infoRows.push({ label: "Unit of Measure", value: product.unit_of_measure });
  if (product.packing) infoRows.push({ label: "Packing", value: product.packing });
  if (product.item_type) infoRows.push({ label: "Type", value: product.item_type });
  if (moq > 1) infoRows.push({ label: "Min Order Qty", value: `${moq} units` });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* ── 2-Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          {/* LEFT: Image Gallery with Zoom */}
          <div className="lg:col-span-5">
            <div
              ref={imgRef}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleImageMouseMove}
              className="bg-card rounded-card shadow-card p-4 flex items-center justify-center aspect-square mb-3 border border-border overflow-hidden cursor-crosshair relative"
            >
              <img
                src={images[selectedImage]?.url}
                alt={images[selectedImage]?.alt}
                className="max-w-full max-h-full object-contain transition-transform duration-150 ease-out"
                style={isZooming ? {
                  transform: "scale(2.5)",
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                } : undefined}
                draggable={false}
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg border-2 overflow-hidden shrink-0 transition-colors ${
                      i === selectedImage ? "border-primary" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div className="lg:col-span-7 space-y-5">
            {/* Brand */}
            {product.brand_name && (
              <div className="flex items-center gap-2">
                {product.brand_logo && (
                  <img src={product.brand_logo} alt={product.brand_name} className="h-6 w-auto object-contain" />
                )}
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">{product.brand_name}</span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">{product.description}</h1>

            {/* Star Rating Row */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 text-muted-foreground/30" />
              ))}
              <button onClick={scrollToReviews} className="text-xs text-primary hover:underline ml-1">
                0 reviews
              </button>
            </div>

            {/* Short description — max 2 lines */}
            {product.short_description && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{product.short_description}</p>
            )}

            {/* Stock + SKU + Quantity inline */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${stock.textClass} ${stock.bgClass} px-3 py-1 rounded-full`}>
                <span className={`w-2 h-2 ${stock.dotClass} rounded-full`}></span>
                {stock.label}{product.onhand_qty != null && product.onhand_qty > 0 ? ` - ${product.onhand_qty}` : ""}
              </span>
              {product.stock_code && (
                <span className="text-xs text-muted-foreground">SKU: <span className="font-semibold text-foreground">{product.stock_code}</span></span>
              )}
            </div>

            {/* Promotion banner */}
            {promotion && !flashDeal && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-sm font-semibold text-primary flex items-center gap-1.5">
                  🏷️ {promotion.title}
                </p>
                {promotion.description && (
                  <p className="text-xs text-muted-foreground mt-1">{promotion.description}</p>
                )}
              </div>
            )}

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

            {/* ── Price Block ── */}
            <div className="border-t border-b border-border py-4">
              {flashDeal ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-accent">
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
                  <span className="text-3xl font-bold text-accent">
                    {product.currency || "MMK"} {Number(activeTier?.unit_price || product.selling_price).toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    / {product.unit_of_measure || "per piece"}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-semibold text-primary">Price on Request</span>
              )}
            </div>

            {/* Buy More & Save — Visual Tier Cards */}
            {pricingTiers && pricingTiers.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-primary" />
                  Buy more and save
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {pricingTiers.map((tier) => {
                    const isActive = activeTier?.id === tier.id;
                    return (
                      <button
                        key={tier.id}
                        onClick={() => setQty(tier.min_qty)}
                        className={`rounded-lg border-2 px-4 py-2.5 text-center transition-all min-w-[110px] ${
                          isActive
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-muted/30 hover:border-primary/40"
                        }`}
                      >
                        <div className="text-[10px] text-muted-foreground font-medium">
                          {tier.min_qty}{tier.max_qty ? `–${tier.max_qty}` : "+"} pcs
                        </div>
                        <div className={`text-sm font-bold ${isActive ? "text-primary" : "text-foreground"}`}>
                          {product.currency || "MMK"} {Number(tier.unit_price).toLocaleString()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Quantity</label>
              <div className="flex items-center border border-border rounded-lg overflow-hidden w-fit">
                <button onClick={() => setQty(Math.max(moq, qty - 1))} className="px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 py-2.5 text-sm font-semibold text-foreground min-w-[3.5rem] text-center border-x border-border">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {moq > 1 && <p className="text-[10px] text-muted-foreground mt-1">Min order: {moq}</p>}
            </div>

            {/* Full-Width CTA Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() => product.id && addToCart(product.id, qty, product.description || "")}
                disabled={isAdding || product.stock_status === "out_of_stock"}
                className="w-full bg-gradient-to-r from-accent to-accent/85 hover:from-accent/90 hover:to-accent/75 text-accent-foreground font-bold py-3.5 px-6 rounded-button transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 text-base shadow-md hover:shadow-lg"
              >
                {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                Add to Cart
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleRequestQuote}
                className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold py-3 px-6 rounded-button transition-all flex items-center justify-center gap-2.5 text-sm"
              >
                <FileText className="w-5 h-5" /> Request Quote
              </button>
            </div>

            {/* Payment Methods Strip */}
            <div className="flex items-center gap-3 flex-wrap pt-1">
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" /> We Accept:
              </span>
              {paymentMethods.map((pm) => (
                <span key={pm} className="text-[10px] font-semibold text-foreground bg-muted border border-border rounded px-2 py-0.5">
                  {pm}
                </span>
              ))}
            </div>

            {/* Trust Signals */}
            <div className="flex items-center gap-5 text-xs text-muted-foreground pt-2 border-t border-border">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-primary" /> Ships in 1–2 business days
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Trusted by 1,000+ buyers
              </span>
            </div>

            {/* Datasheet */}
            {product.datasheet_url && (
              <a
                href={product.datasheet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
              >
                <FileText className="w-4 h-4" /> Download Datasheet (PDF)
              </a>
            )}
          </div>
        </div>

        {/* ── Tabs: Description / Specifications / Reviews ── */}
        <div className="mb-16" ref={tabsRef}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start bg-muted/50 border border-border rounded-lg p-1">
              <TabsTrigger value="description" className="text-sm font-semibold">Description</TabsTrigger>
              <TabsTrigger value="specifications" className="text-sm font-semibold">Specifications</TabsTrigger>
              <TabsTrigger value="reviews" className="text-sm font-semibold">Customer Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <div className="bg-card rounded-card shadow-card border border-border p-6">
                {productExtra?.long_description ? (
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {productExtra.long_description}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.short_description || product.description || "Detailed description coming soon. Contact us for more information about this product."}
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="mt-4">
              <div className="bg-card rounded-card shadow-card border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {infoRows.map(({ label, value }, i) => (
                      <tr key={label} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                        <td className="px-5 py-3 font-medium text-muted-foreground w-1/3 border-r border-border">{label}</td>
                        <td className="px-5 py-3 text-foreground font-semibold">{value}</td>
                      </tr>
                    ))}
                    {specs.map(([key, val], i) => (
                      <tr key={key} className={(infoRows.length + i) % 2 === 0 ? "bg-muted/30" : ""}>
                        <td className="px-5 py-3 font-medium text-muted-foreground w-1/3 border-r border-border">{key}</td>
                        <td className="px-5 py-3 text-foreground font-semibold">{String(val)}</td>
                      </tr>
                    ))}
                    {infoRows.length === 0 && specs.length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-5 py-8 text-center text-muted-foreground">No specifications available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <div className="bg-card rounded-card shadow-card border border-border p-8 text-center space-y-3">
                <Star className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                <h3 className="text-sm font-bold text-foreground">No reviews yet</h3>
                <p className="text-xs text-muted-foreground">Be the first to review this product.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Related Products ── */}
        {related && related.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-foreground mb-6">Related Products</h2>
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
