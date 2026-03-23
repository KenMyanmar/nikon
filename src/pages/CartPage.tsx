import { useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMarketingData } from "@/hooks/useMarketingData";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "@/hooks/use-toast";
import { Minus, Plus, Trash2, ShoppingCart, LogIn, Tag, X, Loader2, ChevronDown, Zap } from "lucide-react";

interface AppliedCoupon {
  code: string;
  title: string;
  discount: number;
  type: string;
  discount_value: number;
  max_discount_amount: number | null;
}

const CartPage = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { getFlashDeal, getPromotion } = useMarketingData();
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const { data: customerId } = useQuery({
    queryKey: ["customer-id", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_customer_id_for_user", {
        _user_id: user!.id,
      });
      if (error) throw error;
      return data as string;
    },
    enabled: !!user,
  });

  const { data: cartItems = [], isLoading: cartLoading } = useQuery({
    queryKey: ["cart", customerId],
    queryFn: async () => {
      const { data: items, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("customer_id", customerId!);
      if (error) throw error;

      if (!items || items.length === 0) return [];

      const productIds = items.map((i) => i.product_id);
      const { data: products, error: pErr } = await supabase
        .from("products_public")
        .select("*")
        .in("id", productIds);
      if (pErr) throw pErr;

      const productMap = new Map(products?.map((p) => [p.id, p]) || []);

      return items.map((item) => ({
        ...item,
        product: productMap.get(item.product_id) || null,
      }));
    },
    enabled: !!customerId,
  });

  const updateQty = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart", customerId] });
      const prev = queryClient.getQueryData(["cart", customerId]);
      queryClient.setQueryData(["cart", customerId], (old: typeof cartItems) =>
        old?.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(["cart", customerId], ctx?.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["cart", customerId] }),
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cart_items").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["cart", customerId] });
      const prev = queryClient.getQueryData(["cart", customerId]);
      queryClient.setQueryData(["cart", customerId], (old: typeof cartItems) =>
        old?.filter((item) => item.id !== id)
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(["cart", customerId], ctx?.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["cart", customerId] }),
  });

  const getEffectivePrice = useCallback((item: any) => {
    const flashDeal = getFlashDeal(item.product_id);
    const now = new Date();
    const basePrice = Number(item.product?.selling_price) || 0;

    // Flash deal takes priority
    if (flashDeal && new Date(flashDeal.start_time) <= now && new Date(flashDeal.end_time) >= now && (flashDeal.sold_count ?? 0) < flashDeal.stock_limit) {
      return { price: flashDeal.flash_price, originalPrice: basePrice, isFlashDeal: true, isPromotion: false, promoTitle: null as string | null };
    }

    // Promotion discount
    const promotion = getPromotion(item.product_id, item.product?.category_id, item.product?.brand_id);
    if (promotion && basePrice > 0) {
      if (promotion.type === "percentage" && promotion.discount_value) {
        let discounted = basePrice * (1 - promotion.discount_value / 100);
        if (promotion.max_discount_amount && promotion.max_discount_amount > 0) {
          discounted = Math.max(discounted, basePrice - promotion.max_discount_amount);
        }
        return { price: Math.round(discounted), originalPrice: basePrice, isFlashDeal: false, isPromotion: true, promoTitle: promotion.title };
      } else if (promotion.type === "fixed_amount" && promotion.discount_value) {
        return { price: Math.round(basePrice - promotion.discount_value), originalPrice: basePrice, isFlashDeal: false, isPromotion: true, promoTitle: promotion.title };
      } else if (promotion.type === "buy_x_get_y" && promotion.buy_quantity && promotion.get_quantity) {
        const groupSize = promotion.buy_quantity + promotion.get_quantity;
        const freeItems = Math.floor(item.quantity / groupSize) * promotion.get_quantity;
        const paidQty = item.quantity - freeItems;
        // Return per-unit effective price adjusted for free items
        const effectivePerUnit = paidQty > 0 ? Math.round((basePrice * paidQty) / item.quantity) : basePrice;
        return { price: effectivePerUnit, originalPrice: basePrice, isFlashDeal: false, isPromotion: true, promoTitle: `Buy ${promotion.buy_quantity} Get ${promotion.get_quantity} Free` };
      }
    }

    return { price: basePrice, originalPrice: 0, isFlashDeal: false, isPromotion: false, promoTitle: null as string | null };
  }, [getFlashDeal, getPromotion]);

  const { subtotal, hasUnpricedItems } = useMemo(() => {
    let total = 0;
    let unpriced = false;
    cartItems.forEach((item) => {
      const { price } = getEffectivePrice(item);
      if (price === 0) unpriced = true;
      total += price * item.quantity;
    });
    return { subtotal: total, hasUnpricedItems: unpriced };
  }, [cartItems, getEffectivePrice]);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    let discount = 0;
    if (appliedCoupon.type === "percentage") {
      discount = subtotal * (appliedCoupon.discount_value / 100);
      if (appliedCoupon.max_discount_amount) discount = Math.min(discount, appliedCoupon.max_discount_amount);
    } else {
      discount = appliedCoupon.discount_value;
    }
    return Math.min(discount, subtotal);
  }, [appliedCoupon, subtotal]);

  const displayTotal = subtotal - couponDiscount;

  const handleApplyCoupon = (coupon: AppliedCoupon) => {
    setAppliedCoupon(coupon);
    // Persist to sessionStorage for checkout
    sessionStorage.setItem("appliedCoupon", JSON.stringify(coupon));
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    sessionStorage.removeItem("appliedCoupon");
  };

  const handleProceedToCheckout = () => {
    // Coupon is already in sessionStorage
    navigate("/checkout");
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-pulse h-8 w-48 bg-muted rounded mx-auto" />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-h2 text-foreground mb-2">Sign in to view your cart</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to manage your cart</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-button font-semibold hover:bg-primary/90 transition"
          >
            <LogIn className="w-4 h-4" /> Sign In
          </Link>
        </div>
      </MainLayout>
    );
  }

  if (cartLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-card" />)}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-h2 text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Start adding products to your cart</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-button font-semibold hover:bg-primary/90 transition"
          >
            Browse Products
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-h1 text-foreground mb-6">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {cartItems.map((item) => {
              const product = item.product;
              if (!product) return null;

              const { price, originalPrice, isFlashDeal, isPromotion, promoTitle } = getEffectivePrice(item);
              const moq = product.moq || 1;
              const maxQty = product.onhand_qty || 9999;
              const lineTotal = price * item.quantity;
              const brandInitial = product.brand_name?.charAt(0) || "?";

              return (
                <div key={item.id} className="bg-card rounded-card shadow-card p-4 flex gap-4">
                  {/* Image */}
                  <Link to={`/products/${product.id}`} className="w-20 h-20 rounded bg-muted/30 overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                    {product.thumbnail_url ? (
                      <img src={product.thumbnail_url} alt={product.description || ""} className="w-full h-full object-contain p-1" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <span className="text-2xl font-bold text-primary">{brandInitial}</span>
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.brand_name}</p>
                    <Link to={`/products/${product.id}`} className="text-sm font-semibold text-foreground line-clamp-2 hover:text-[#F97316] hover:underline transition-colors">{product.description}</Link>

                    <div className="flex items-center gap-4 mt-3">
                      {/* Qty Selector */}
                      <div className="flex items-center border border-ikon-border rounded-button">
                        <button
                          onClick={() => updateQty.mutate({ id: item.id, quantity: Math.max(moq, item.quantity - 1) })}
                          className="p-1.5 hover:bg-muted transition"
                          disabled={item.quantity <= moq}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 text-sm font-medium min-w-[2rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty.mutate({ id: item.id, quantity: Math.min(maxQty, item.quantity + 1) })}
                          className="p-1.5 hover:bg-muted transition"
                          disabled={item.quantity >= maxQty}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Unit Price */}
                      <div className="text-sm">
                        {price > 0 ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isFlashDeal && (
                              <>
                                <span className="inline-flex items-center gap-0.5 bg-destructive/10 text-destructive text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  <Zap className="w-3 h-3" /> Flash
                                </span>
                                <span className="text-muted-foreground line-through text-xs">{originalPrice.toLocaleString()}</span>
                              </>
                            )}
                            {isPromotion && (
                              <>
                                <span className="inline-flex items-center gap-0.5 bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  <Tag className="w-3 h-3" /> {promoTitle || "Promo"}
                                </span>
                                <span className="text-muted-foreground line-through text-xs">{originalPrice.toLocaleString()}</span>
                              </>
                            )}
                            <span className={`font-medium ${isFlashDeal ? "text-destructive" : isPromotion ? "text-primary" : "text-foreground"}`}>
                              {product.currency || "MMK"} {price.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-primary font-medium">Quote</span>
                        )}
                      </div>

                      {/* Line Total */}
                      {price > 0 && (
                        <div className="text-sm font-bold text-accent ml-auto hidden sm:block">
                          {product.currency || "MMK"} {lineTotal.toLocaleString()}
                        </div>
                      )}

                      {/* Remove */}
                      <button
                        onClick={() => removeItem.mutate(item.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition ml-auto sm:ml-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-card rounded-card shadow-card p-6 sticky top-28">
              <h2 className="text-h4 text-foreground mb-4">Order Summary</h2>
              <CouponInput
                subtotal={subtotal}
                cartItems={cartItems}
                appliedCoupon={appliedCoupon}
                onApply={handleApplyCoupon}
                onRemove={handleRemoveCoupon}
              />
              <div className="space-y-3 text-sm mt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">MMK {subtotal.toLocaleString()}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-emerald-600 font-medium">Coupon ({appliedCoupon?.code})</span>
                    <span className="text-emerald-600 font-medium">-MMK {couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground text-xs">Calculated at checkout</span>
                </div>
                <div className="border-t border-ikon-border pt-3 flex justify-between">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-bold text-foreground text-lg">MMK {displayTotal.toLocaleString()}</span>
                </div>
              </div>

              {hasUnpricedItems && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-700 font-medium">Some items require a price quotation. Remove unpriced items or use "Request Quote" for those items to proceed to checkout.</p>
                </div>
              )}

              <div className="mt-6 space-y-3">
                {hasUnpricedItems && (
                  <button
                    onClick={() => navigate("/request-quote?from=cart")}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-button font-semibold hover:bg-primary/90 transition"
                  >
                    Request Quote
                  </button>
                )}
                <button
                  onClick={handleProceedToCheckout}
                  disabled={hasUnpricedItems || subtotal === 0}
                  className="w-full bg-accent text-accent-foreground py-3 rounded-button font-semibold hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

/* Coupon Input Component */
interface CouponInputProps {
  subtotal: number;
  cartItems: any[];
  appliedCoupon: AppliedCoupon | null;
  onApply: (coupon: AppliedCoupon) => void;
  onRemove: () => void;
}

const CouponInput = ({ subtotal, cartItems, appliedCoupon, onApply, onRemove }: CouponInputProps) => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;
    setValidating(true);
    setError("");
    try {
      const { data, error: qErr } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (qErr) throw qErr;
      if (!data) { setError("Invalid or expired promo code"); return; }

      // Date range validation
      const now = new Date().toISOString();
      if (data.start_date && data.start_date > now) {
        setError("This coupon is not yet active");
        return;
      }
      if (data.end_date && data.end_date < now) {
        setError("This coupon has expired");
        return;
      }

      // Usage limit
      if (data.max_uses && (data.used_count || 0) >= data.max_uses) {
        setError("This coupon has been fully redeemed");
        return;
      }

      // Min order amount
      if (data.min_order_amount && subtotal < Number(data.min_order_amount)) {
        setError(`Minimum order of MMK ${Number(data.min_order_amount).toLocaleString()} required`);
        return;
      }

      // applies_to + target_ids validation
      if (data.applies_to === "product" && data.target_ids?.length > 0) {
        const cartProductIds = cartItems.map((item: any) => item.product_id);
        const hasEligible = data.target_ids.some((id: string) => cartProductIds.includes(id));
        if (!hasEligible) {
          setError("This coupon does not apply to items in your cart");
          return;
        }
      }
      if (data.applies_to === "category" && data.target_ids?.length > 0) {
        const cartCategoryIds = cartItems.map((item: any) => item.product?.category_id).filter(Boolean);
        const hasEligible = data.target_ids.some((id: string) => cartCategoryIds.includes(id));
        if (!hasEligible) {
          setError("This coupon does not apply to items in your cart");
          return;
        }
      }
      if (data.applies_to === "brand" && data.target_ids?.length > 0) {
        const cartBrandIds = cartItems.map((item: any) => item.product?.brand_id).filter(Boolean);
        const hasEligible = data.target_ids.some((id: string) => cartBrandIds.includes(id));
        if (!hasEligible) {
          setError("This coupon does not apply to items in your cart");
          return;
        }
      }

      let discount = 0;
      const discountValue = Number(data.discount_value);
      if (data.type === "percentage") {
        discount = subtotal * (discountValue / 100);
        if (data.max_discount_amount) discount = Math.min(discount, Number(data.max_discount_amount));
      } else if (data.type === "fixed_amount") {
        discount = discountValue;
      }
      discount = Math.min(discount, subtotal);

      onApply({
        code: data.code,
        title: data.title,
        discount,
        type: data.type,
        discount_value: discountValue,
        max_discount_amount: data.max_discount_amount ? Number(data.max_discount_amount) : null,
      });
      setCode("");
      setOpen(false);
    } catch {
      setError("Error validating coupon");
    } finally {
      setValidating(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="text-xs font-bold text-emerald-700">{appliedCoupon.code} applied!</p>
              <p className="text-[10px] text-emerald-600">You save MMK {appliedCoupon.discount.toLocaleString()}</p>
            </div>
          </div>
          <button onClick={onRemove} className="text-muted-foreground hover:text-destructive">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
      >
        <Tag className="w-4 h-4" />
        Have a promo code?
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-background uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleApply}
              disabled={validating || !code.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition disabled:opacity-60"
            >
              {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
            </button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default CartPage;