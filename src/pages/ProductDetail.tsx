import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Minus, Plus, ShoppingCart, FileText, Loader2, Zap, Truck, Star, Package, ShieldCheck, ArrowRight, CreditCard, CheckCircle } from "lucide-react";
import { useAddToCart } from "@/hooks/useCart";
import { useMarketingData } from "@/hooks/useMarketingData";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const renderStars = (rating: number, size = 4) => {
  const rounded = Math.round(rating);
  return [1, 2, 3, 4, 5].map((s) => (
    <Star
      key={s}
      className={`w-${size} h-${size} ${s <= rounded ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
    />
  ));
};

const relativeTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

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
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const { addToCart, isAdding } = useAddToCart();
  const { user, openAuthModal } = useAuthContext();
  const navigate = useNavigate();
  const { getFlashDeal, getPromotion } = useMarketingData();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleRequestQuote = () => {
    if (!user) { openAuthModal(); return; }
    if (product?.id) navigate(`/request-quote?product=${product.id}`);
  };

  const LENS_SIZE = 30; // percentage of image container

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(LENS_SIZE / 2, Math.min(100 - LENS_SIZE / 2, x));
    const clampedY = Math.max(LENS_SIZE / 2, Math.min(100 - LENS_SIZE / 2, y));
    setZoomPos({ x: clampedX, y: clampedY });
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

  // Review stats
  const { data: reviewStats } = useQuery({
    queryKey: ["review-stats", product?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("product_review_stats")
        .select("*")
        .eq("product_id", product!.id!)
        .maybeSingle();
      return data;
    },
    enabled: !!product?.id,
  });

  // Approved reviews
  const { data: reviews } = useQuery({
    queryKey: ["product-reviews", product?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, comment, reviewer_name, is_verified_purchase, admin_response, created_at")
        .eq("product_id", product!.id!)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!product?.id,
  });

  // Customer record for review submission
  const { data: currentCustomer } = useQuery({
    queryKey: ["customer-for-review", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("customers")
        .select("id, name, email")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  // Pre-fill reviewer name
  useEffect(() => {
    if (currentCustomer?.name) setReviewerName(currentCustomer.name);
    else if (user?.email) setReviewerName(user.email.split("@")[0]);
  }, [currentCustomer, user]);

  const handleSubmitReview = async () => {
    if (!selectedRating || !currentCustomer?.id || !product?.id) return;
    setIsSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: product.id,
      customer_id: currentCustomer.id,
      rating: selectedRating,
      comment: commentText || null,
      reviewer_name: reviewerName || "Anonymous",
    });
    setIsSubmitting(false);
    if (error) {
      toast({ title: "Error", description: "Could not submit review. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Thank you!", description: "Your review will appear after approval." });
      setSelectedRating(0);
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["product-reviews", product.id] });
      queryClient.invalidateQueries({ queryKey: ["review-stats", product.id] });
    }
  };

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

  // Build key specs for middle column
  const keySpecs: { label: string; value: string }[] = [];
  if (product.brand_name) keySpecs.push({ label: "Brand", value: product.brand_name });
  if (product.category_name) keySpecs.push({ label: "Category", value: product.category_name });
  if (product.stock_code) keySpecs.push({ label: "SKU", value: product.stock_code });
  if (product.unit_of_measure) keySpecs.push({ label: "Unit", value: product.unit_of_measure });
  if (product.packing) keySpecs.push({ label: "Packing", value: product.packing });
  if (product.item_type) keySpecs.push({ label: "Type", value: product.item_type });
  if (product.other_code) keySpecs.push({ label: "Alt Code", value: product.other_code });
  if (product.group_name) keySpecs.push({ label: "Group", value: product.group_name });
  // Add specs from JSONB
  specs.slice(0, 6).forEach(([key, val]) => {
    keySpecs.push({ label: key, value: String(val) });
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          segments={[
            ...(product.group_name ? [{ label: product.group_name, href: "/categories" }] : []),
            ...(product.parent_category_name && product.parent_category_slug
              ? [{ label: product.parent_category_name, href: `/category/${product.parent_category_slug}` }]
              : []),
            ...(product.category_name && product.category_slug
              ? [{ label: product.category_name, href: `/category/${product.category_slug}` }]
              : []),
            { label: product.description || "Product" },
          ]}
        />
        {/* ── 3-Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          {/* COL 1: Image Gallery */}
          <div className="lg:col-span-5 relative">
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
                className="max-w-full max-h-full object-contain"
                draggable={false}
              />

              {/* Lens overlay */}
              {isZooming && (
                <div
                  className="absolute border-2 border-primary/60 bg-primary/10 pointer-events-none z-10 hidden lg:block"
                  style={{
                    width: `${LENS_SIZE}%`,
                    height: `${LENS_SIZE}%`,
                    left: `${zoomPos.x - LENS_SIZE / 2}%`,
                    top: `${zoomPos.y - LENS_SIZE / 2}%`,
                  }}
                />
              )}
            </div>

            {/* Zoom panel — overlays specs column */}
            {isZooming && (
              <div
                className="absolute top-0 left-full ml-4 w-[400px] aspect-square border-2 border-border rounded-lg shadow-xl overflow-hidden bg-background z-50 hidden lg:block"
              >
                <img
                  src={images[selectedImage]?.url}
                  alt="Zoomed view"
                  className="absolute max-w-none"
                  style={{
                    width: `${100 / (LENS_SIZE / 100)}%`,
                    height: `${100 / (LENS_SIZE / 100)}%`,
                    left: `-${(zoomPos.x - LENS_SIZE / 2) / (LENS_SIZE / 100)}%`,
                    top: `-${(zoomPos.y - LENS_SIZE / 2) / (LENS_SIZE / 100)}%`,
                  }}
                />
              </div>
            )}
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

          {/* COL 2: Key Specifications */}
          <div className="lg:col-span-4">
            {/* Brand + Title */}
            {product.brand_name && (
              <div className="flex items-center gap-2 mb-2">
                {product.brand_logo && (
                  <img src={product.brand_logo} alt={product.brand_name} className="h-6 w-auto object-contain" />
                )}
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">{product.brand_name}</span>
              </div>
            )}
            <h1 className="text-lg md:text-xl font-bold text-foreground leading-tight mb-3">{product.description}</h1>

            {/* Star Rating */}
            <div className="flex items-center gap-1.5 mb-4">
              {renderStars(reviewStats?.avg_rating ? Number(reviewStats.avg_rating) : 0, 4)}
              <button onClick={scrollToReviews} className="text-xs text-primary hover:underline ml-1">
                {reviewStats?.review_count ? `(${reviewStats.review_count} reviews)` : "No reviews yet"}
              </button>
            </div>

            {/* Short description */}
            {product.short_description && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">{product.short_description}</p>
            )}

            {/* Features */}
            {product.features && (
              <div className="mb-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Features</h3>
                <ul className="space-y-1.5">
                  {product.features.split(/\n|;/).filter((f: string) => f.trim()).map((feat: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      {feat.trim()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-primary px-4 py-2">
                <h3 className="text-xs font-bold text-primary-foreground uppercase tracking-wider">Key Specifications</h3>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {keySpecs.map(({ label, value }, i) => (
                    <tr key={label} className={i % 2 === 0 ? "bg-muted/30" : "bg-card"}>
                      <td className="px-4 py-2.5 font-medium text-muted-foreground w-2/5 border-r border-border">{label}</td>
                      <td className="px-4 py-2.5 text-foreground font-semibold">{value}</td>
                    </tr>
                  ))}
                  {keySpecs.length === 0 && (
                    <tr><td colSpan={2} className="px-4 py-4 text-center text-muted-foreground text-xs">No specifications available</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Datasheet */}
            {product.datasheet_url && (
              <a
                href={product.datasheet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium mt-4"
              >
                <FileText className="w-4 h-4" /> Download Datasheet (PDF)
              </a>
            )}
          </div>

          {/* COL 3: Price Card */}
          <div className="lg:col-span-3">
            <div className="border-2 border-border rounded-xl p-5 bg-card shadow-card space-y-4 sticky top-24">
              {/* Stock Badge */}
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${stock.textClass} ${stock.bgClass} px-3 py-1 rounded-full`}>
                <span className={`w-2 h-2 ${stock.dotClass} rounded-full`}></span>
                {stock.label}{product.onhand_qty != null && product.onhand_qty > 0 ? ` — ${product.onhand_qty} available` : ""}
              </span>

              {/* Promotion banner */}
              {promotion && !flashDeal && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    🏷️ {promotion.title}
                  </p>
                </div>
              )}

              {/* Flash Deal Banner */}
              {flashDeal && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-red-600 fill-red-600" />
                    <span className="text-xs font-bold text-red-600">Flash Deal — {formatCountdown(flashTimeLeft)}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${flashSoldPct > 70 ? "bg-red-500" : flashSoldPct > 30 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(flashSoldPct, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{flashDeal.sold_count || 0} / {flashDeal.stock_limit} claimed</p>
                </div>
              )}

              {/* Price */}
              <div className="border-t border-border pt-4">
                {flashDeal ? (
                  <div className="space-y-1">
                    <span className="text-2xl font-bold text-accent">
                      {product.currency || "MMK"} {Number(flashDeal.flash_price).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground line-through">
                        {product.currency || "MMK"} {Number(flashDeal.original_price).toLocaleString()}
                      </span>
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        -{flashDeal.discount_percentage || Math.round((1 - flashDeal.flash_price / flashDeal.original_price) * 100)}%
                      </span>
                    </div>
                  </div>
                ) : product.selling_price ? (
                  <div>
                    <span className="text-2xl font-bold text-accent">
                      {product.currency || "MMK"} {Number(activeTier?.unit_price || product.selling_price).toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      / {product.unit_of_measure || "per piece"}
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-semibold text-primary">Price on Request</span>
                )}
              </div>

              {/* Bulk Pricing Tiers */}
              {pricingTiers && pricingTiers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-primary" />
                    Buy more and save
                  </h4>
                  <div className="space-y-1.5">
                    {pricingTiers.map((tier) => {
                      const isActive = activeTier?.id === tier.id;
                      return (
                        <button
                          key={tier.id}
                          onClick={() => setQty(tier.min_qty)}
                          className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-all ${
                            isActive
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${isActive ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                              ✓
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {tier.min_qty}{tier.max_qty ? `–${tier.max_qty}` : "+"} pcs
                            </span>
                          </div>
                          <span className={`text-sm font-bold ${isActive ? "text-primary" : "text-foreground"}`}>
                            {product.currency || "MMK"} {Number(tier.unit_price).toLocaleString()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Quantity</label>
                <div className="flex items-center border border-border rounded-lg overflow-hidden w-full">
                  <button onClick={() => setQty(Math.max(moq, qty - 1))} className="px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 py-2.5 text-sm font-semibold text-foreground text-center border-x border-border">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {moq > 1 && <p className="text-[10px] text-muted-foreground mt-1">Min order: {moq}</p>}
              </div>

              {/* CTAs */}
              <button
                onClick={() => product.id && addToCart(product.id, qty, product.description || "")}
                disabled={isAdding || product.stock_status === "out_of_stock"}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3.5 rounded-button transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 text-base shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                Add to Cart
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleRequestQuote}
                className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold py-3 rounded-button transition-all flex items-center justify-center gap-2 text-sm"
              >
                <FileText className="w-4 h-4" /> Request Bulk Quote
              </button>

              {/* Payment Methods */}
              <div className="pt-2 border-t border-border">
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mb-2">
                  <CreditCard className="w-3.5 h-3.5" /> We Accept
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {paymentMethods.map((pm) => (
                    <span key={pm} className="text-[10px] font-semibold text-foreground bg-muted border border-border rounded px-2 py-0.5">
                      {pm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trust */}
              <div className="space-y-2 text-xs text-muted-foreground pt-2 border-t border-border">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-primary" /> Ships in 1–2 business days
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Trusted by 1,000+ buyers
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Wholesale Benefits Banner ── */}
        <div className="bg-primary rounded-xl p-6 mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-primary-foreground mb-1">Wholesale Benefits</h3>
              <p className="text-primary-foreground/70 text-sm">Get the best prices for your business needs</p>
            </div>
            <div className="flex flex-wrap gap-4 md:gap-8">
              {["Bulk Discounts", "Business Accounts", "Fast Delivery", "Dedicated Support"].map((benefit) => (
                <span key={benefit} className="flex items-center gap-2 text-sm text-primary-foreground font-medium">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">✓</span>
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs: Description / Specifications / Reviews ── */}
        <div className="mb-16" ref={tabsRef}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start bg-muted/50 border border-border rounded-lg p-1">
              <TabsTrigger value="description" className="text-sm font-semibold">Description</TabsTrigger>
              <TabsTrigger value="features" className="text-sm font-semibold">Features</TabsTrigger>
              <TabsTrigger value="specifications" className="text-sm font-semibold">Specifications</TabsTrigger>
              <TabsTrigger value="reviews" className="text-sm font-semibold">Customer Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <div className="bg-card rounded-card shadow-card border border-border p-6 space-y-4">
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.long_description || product.short_description || product.description}
                </div>
                {product.features && (
                  <>
                    <h3 className="text-base font-semibold text-foreground">Features</h3>
                    <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                      {product.features.split(/\n|;/).filter((f: string) => f.trim()).map((feat: string, i: number) => (
                        <li key={i}>{feat.trim()}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="features" className="mt-4">
              <div className="bg-card rounded-card shadow-card border border-border p-6">
                {product.features ? (
                  <ul className="space-y-3">
                    {product.features.split(/\n|;/).filter((f: string) => f.trim()).map((feat: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{feat.trim()}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Features information coming soon.
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
              <div className="bg-card rounded-card shadow-card border border-border p-6 space-y-8">
                {/* Review Summary */}
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Average */}
                  <div className="flex flex-col items-center justify-center gap-2 min-w-[140px]">
                    <span className="text-4xl font-bold text-foreground">
                      {reviewStats?.avg_rating ? Number(reviewStats.avg_rating).toFixed(1) : "—"}
                    </span>
                    <div className="flex gap-0.5">{renderStars(reviewStats?.avg_rating ? Number(reviewStats.avg_rating) : 0, 5)}</div>
                    <span className="text-xs text-muted-foreground">
                      Based on {reviewStats?.review_count || 0} reviews
                    </span>
                  </div>
                  {/* Distribution bars */}
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = Number(reviewStats?.[`${["one", "two", "three", "four", "five"][star - 1]}_star` as keyof typeof reviewStats] || 0);
                      const total = Number(reviewStats?.review_count || 0);
                      const pct = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-3 text-sm">
                          <span className="w-8 text-right text-muted-foreground font-medium">{star}★</span>
                          <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-8 text-muted-foreground text-xs">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews List */}
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4 border-t border-border pt-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex gap-0.5">{renderStars(review.rating, 4)}</div>
                          <span className="text-sm font-semibold text-foreground">{review.reviewer_name}</span>
                          {review.is_verified_purchase && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">{relativeTime(review.created_at!)}</span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                        {review.admin_response && (
                          <div className="ml-6 bg-muted/50 border border-border rounded-lg p-3 mt-1">
                            <p className="text-xs font-semibold text-foreground mb-1">IKON Mart replied:</p>
                            <p className="text-xs text-muted-foreground">{review.admin_response}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
                  </div>
                )}

                {/* Review Submission Form */}
                <div className="border-t border-border pt-6">
                  {user ? (
                    <div className="space-y-4 max-w-lg">
                      <h3 className="text-base font-semibold text-foreground">Share Your Feedback</h3>
                      {/* Star selector */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onMouseEnter={() => setHoverRating(s)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setSelectedRating(s)}
                            className="p-0.5"
                          >
                            <Star
                              className={`w-7 h-7 transition-colors ${
                                s <= (hoverRating || selectedRating)
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          </button>
                        ))}
                        {selectedRating > 0 && (
                          <span className="text-xs text-muted-foreground ml-2">{selectedRating}/5</span>
                        )}
                      </div>
                      <Input
                        placeholder="Your name"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        className="max-w-xs"
                      />
                      <Textarea
                        placeholder="Tell us about your experience with this product..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={3}
                      />
                      <button
                        onClick={handleSubmitReview}
                        disabled={isSubmitting || selectedRating === 0}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-6 rounded-button transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                        Submit Review
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      <button onClick={openAuthModal} className="text-primary hover:underline font-medium">Sign in</button> to leave a review.
                    </p>
                  )}
                </div>
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
