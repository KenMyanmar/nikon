import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMarketingData } from "@/hooks/useMarketingData";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "@/hooks/use-toast";
import {
  Truck, CreditCard, CheckCircle, Plus, Banknote,
  Loader2, ChevronDown, ChevronUp, MapPin, AlertTriangle, PartyPopper, Zap, Tag, Lock
} from "lucide-react";
import RecommendedProducts from "@/components/RecommendedProducts";

interface AppliedCoupon {
  code: string;
  title: string;
  discount: number;
  type: string;
  discount_value: number;
  max_discount_amount: number | null;
}

const TOWNSHIPS = [
  "Kamayut", "Hlaing", "Bahan", "Sanchaung", "Kyimyindaing", "Dagon",
  "Thingangyun", "South Okkalapa", "North Okkalapa", "Insein",
  "Mingalar Taung Nyunt", "Tamwe", "Yankin", "Mayangone", "Thaketa",
  "Pazundaung", "Latha", "Lanmadaw", "Botataung"
];

const REGIONS = ["Yangon", "Mandalay", "Other"];

const regionToZone: Record<string, string> = {
  Yangon: "yangon_metro",
  Mandalay: "mandalay",
  Other: "other",
};

const STEPS = [
  { label: "Delivery", icon: Truck },
  { label: "Payment", icon: CreditCard },
  { label: "Confirmation", icon: CheckCircle },
];

const fmt = (n: number) => `MMK ${n.toLocaleString()}`;

const Checkout = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getFlashDeal, getPromotion } = useMarketingData();
  const [step, setStep] = useState(1);
  const placingRef = useRef(false);

  // ── Customer ID
  const { data: customerId } = useQuery({
    queryKey: ["customer-id", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_customer_id_for_user", { _user_id: user!.id });
      if (error) throw error;
      return data as string;
    },
    enabled: !!user,
  });

  // ── Customer info
  const { data: customer } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").eq("id", customerId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
  });

  // ── Cart items
  const { data: cartItems = [], isLoading: cartCheckoutLoading } = useQuery({
    queryKey: ["cart-checkout", customerId],
    queryFn: async () => {
      const { data: items, error } = await supabase.from("cart_items").select("*").eq("customer_id", customerId!);
      if (error) throw error;
      if (!items?.length) return [];
      const pIds = items.map((i) => i.product_id);
      const { data: products } = await supabase.from("products_public").select("*").in("id", pIds);
      const pMap = new Map(products?.map((p) => [p.id, p]) || []);
      return items.map((i) => ({ ...i, product: pMap.get(i.product_id) }));
    },
    enabled: !!customerId,
  });

  // ── Saved addresses
  const { data: addresses = [], refetch: refetchAddresses } = useQuery({
    queryKey: ["addresses", customerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("customer_addresses").select("*").eq("customer_id", customerId!).order("is_default", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
  });

  // ── Delivery fees
  const { data: deliveryFees = [] } = useQuery({
    queryKey: ["delivery-fees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("delivery_fees").select("*").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const getEffectivePrice = useCallback((productId: string, sellingPrice: number, categoryId?: string | null, brandId?: string | null, quantity?: number) => {
    const flashDeal = getFlashDeal(productId);
    const now = new Date();
    if (flashDeal && new Date(flashDeal.start_time) <= now && new Date(flashDeal.end_time) >= now && (flashDeal.sold_count ?? 0) < flashDeal.stock_limit) {
      return { price: flashDeal.flash_price, originalPrice: sellingPrice, isFlashDeal: true, isPromotion: false, promoTitle: null as string | null };
    }
    const promotion = getPromotion(productId, categoryId, brandId);
    if (promotion && sellingPrice > 0) {
      if (promotion.type === "percentage" && promotion.discount_value) {
        let discounted = sellingPrice * (1 - promotion.discount_value / 100);
        if (promotion.max_discount_amount && promotion.max_discount_amount > 0) {
          discounted = Math.max(discounted, sellingPrice - promotion.max_discount_amount);
        }
        return { price: Math.round(discounted), originalPrice: sellingPrice, isFlashDeal: false, isPromotion: true, promoTitle: promotion.title };
      } else if (promotion.type === "fixed_amount" && promotion.discount_value) {
        return { price: Math.round(sellingPrice - promotion.discount_value), originalPrice: sellingPrice, isFlashDeal: false, isPromotion: true, promoTitle: promotion.title };
      } else if (promotion.type === "buy_x_get_y" && promotion.buy_quantity && promotion.get_quantity && quantity) {
        const groupSize = promotion.buy_quantity + promotion.get_quantity;
        const freeItems = Math.floor(quantity / groupSize) * promotion.get_quantity;
        const paidQty = quantity - freeItems;
        const effectivePerUnit = paidQty > 0 ? Math.round((sellingPrice * paidQty) / quantity) : sellingPrice;
        return { price: effectivePerUnit, originalPrice: sellingPrice, isFlashDeal: false, isPromotion: true, promoTitle: `B${promotion.buy_quantity}G${promotion.get_quantity}` };
      }
    }
    return { price: sellingPrice, originalPrice: 0, isFlashDeal: false, isPromotion: false, promoTitle: null as string | null };
  }, [getFlashDeal, getPromotion]);

  // ── Unpriced vs priced item detection
  const unpricedItems = useMemo(() => cartItems.filter(
    (i) => !i.product?.selling_price || Number(i.product.selling_price) === 0
  ), [cartItems]);

  const pricedItems = useMemo(() => cartItems.filter(
    (i) => i.product?.selling_price && Number(i.product.selling_price) > 0
  ), [cartItems]);

  const hasUnpricedItems = unpricedItems.length > 0;
  const allUnpriced = pricedItems.length === 0 && cartItems.length > 0;

  const subtotal = useMemo(() => pricedItems.reduce((s, i) => {
    const { price } = getEffectivePrice(i.product_id, Number(i.product?.selling_price) || 0, i.product?.category_id, i.product?.brand_id, i.quantity);
    return s + price * i.quantity;
  }, 0), [pricedItems, getEffectivePrice]);

  // ── Delivery state
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [addrForm, setAddrForm] = useState({
    contact_name: "", contact_phone: "", address_line: "",
    township: "", city: "Yangon", region: "Yangon",
    delivery_notes: "", save: true, label: "",
  });

  // Pre-fill from customer
  useEffect(() => {
    if (customer) {
      setAddrForm((f) => ({
        ...f,
        contact_name: f.contact_name || customer.name || "",
        contact_phone: f.contact_phone || customer.phone || "",
      }));
    }
  }, [customer]);

  // Auto-select default address
  useEffect(() => {
    if (addresses.length && !selectedAddressId) {
      const def = addresses.find((a) => a.is_default) || addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const activeRegion = showNewAddress ? addrForm.region : (selectedAddress?.region || "Yangon");
  const zone = regionToZone[activeRegion] || "other";
  const feeRow = deliveryFees.find((f) => f.zone === zone);
  const deliveryFee = feeRow ? (feeRow.min_free_delivery && subtotal >= Number(feeRow.min_free_delivery) ? 0 : Number(feeRow.fee)) : 5000;
  const freeThreshold = feeRow?.min_free_delivery ? Number(feeRow.min_free_delivery) : null;
  const codEligible = feeRow?.cod_eligible !== false;
  const maxCod = feeRow?.max_cod_amount ? Number(feeRow.max_cod_amount) : null;
  const estimatedDays = feeRow?.estimated_days || "2-4 days";

  // ── Coupon from cart (persisted in sessionStorage)
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      const stored = sessionStorage.getItem("appliedCoupon");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const fullPriceSubtotal = useMemo(() => {
    let fullPrice = 0;
    cartItems.forEach((i) => {
      const { price, isFlashDeal, isPromotion } = getEffectivePrice(i.product_id, Number(i.product?.selling_price) || 0, i.product?.category_id, i.product?.brand_id, i.quantity);
      if (!isFlashDeal && !isPromotion) {
        fullPrice += price * i.quantity;
      }
    });
    return fullPrice;
  }, [cartItems, getEffectivePrice]);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || fullPriceSubtotal === 0) return 0;
    let discount = 0;
    if (appliedCoupon.type === "percentage") {
      discount = fullPriceSubtotal * (appliedCoupon.discount_value / 100);
      if (appliedCoupon.max_discount_amount) discount = Math.min(discount, appliedCoupon.max_discount_amount);
    } else {
      discount = appliedCoupon.discount_value;
    }
    return Math.min(discount, fullPriceSubtotal);
  }, [appliedCoupon, fullPriceSubtotal]);

  const total = subtotal + deliveryFee - couponDiscount;

  // Clear coupon when no full-price items remain
  useEffect(() => {
    if (fullPriceSubtotal === 0 && appliedCoupon) {
      setAppliedCoupon(null);
      sessionStorage.removeItem("appliedCoupon");
    }
  }, [fullPriceSubtotal, appliedCoupon]);

  // ── Payment state
  const [paymentMethod, setPaymentMethod] = useState<string>("dinger_prebuilt");
  const [placing, setPlacing] = useState(false);

  // ── Dinger state
  const [dingerEmail, setDingerEmail] = useState("");
  const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(true);
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("Yangon");

  // Pre-fill email from customer
  useEffect(() => {
    if (customer?.email && !dingerEmail) {
      setDingerEmail(customer.email);
    }
  }, [customer, dingerEmail]);

  // ── Order result
  const [orderResult, setOrderResult] = useState<any>(null);

  // ── Handle return from Dinger payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const reason = params.get("reason");
    const returnOrderId = params.get("orderId");

    if (paymentStatus === "failed") {
      toast({ title: "Payment Failed", description: `Payment ${reason || "was not completed"}. Please try again.`, variant: "destructive" });
      // Clean URL params
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (paymentStatus === "success" && returnOrderId) {
      // Fetch order and show confirmation
      supabase
        .from("orders")
        .select("id, order_number, total, shipping_cost, payment_method, payment_status")
        .eq("id", returnOrderId)
        .single()
        .then(({ data, error }) => {
          if (data && !error) {
            setOrderResult({
              order_id: data.id,
              order_number: data.order_number,
              total: data.total,
              delivery_fee: data.shipping_cost,
            });
            setPaymentMethod(data.payment_method || "dinger_prebuilt");
            setStep(3);
            sessionStorage.removeItem("appliedCoupon");
            queryClient.invalidateQueries({ queryKey: ["cart-count"] });
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            queryClient.invalidateQueries({ queryKey: ["cart-checkout"] });
          }
        });
      // Clean URL params
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [queryClient]);

  // ── Redirect if not logged in or cart empty
  useEffect(() => {
    if (!authLoading && !user) navigate("/cart");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (customerId && !cartCheckoutLoading && cartItems.length === 0 && step < 3) navigate("/cart");
  }, [customerId, cartCheckoutLoading, cartItems, step, navigate]);

  // ── Handlers
  const handleSaveAddress = async () => {
    if (!customerId) return;
    const { data, error } = await supabase.from("customer_addresses").insert({
      customer_id: customerId,
      label: addrForm.label || "Home",
      address_line: addrForm.address_line,
      township: addrForm.township,
      city: addrForm.city,
      region: addrForm.region,
      contact_phone: addrForm.contact_phone,
      delivery_notes: addrForm.delivery_notes,
      is_default: addresses.length === 0,
    }).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return null; }
    await refetchAddresses();
    setSelectedAddressId(data.id);
    setShowNewAddress(false);
    return data.id;
  };

  const handleContinueToPayment = async () => {
    if (showNewAddress) {
      if (!addrForm.contact_name || !addrForm.contact_phone || !addrForm.address_line || !addrForm.township) {
        toast({ title: "Missing fields", description: "Please fill in all required address fields", variant: "destructive" });
        return;
      }
      if (addrForm.save) {
        const newId = await handleSaveAddress();
        if (!newId) return;
      }
    }
    if (!selectedAddressId && !showNewAddress) {
      toast({ title: "Select address", description: "Please select or add a delivery address", variant: "destructive" });
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDingerCheckout = async () => {
    if (placingRef.current) return;
    if (!dingerEmail) {
      toast({ title: "Email required", description: "Please enter your email address for payment", variant: "destructive" });
      return;
    }
    placingRef.current = true;
    setPlacing(true);

    try {
      const addressId = selectedAddressId!;
      const addr = addresses.find((a) => a.id === addressId);
      const idempotencyKey = `${customerId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      // Step 1: Place the order
      const { data: orderData, error: orderError } = await (supabase.rpc as any)("place_order", {
        p_customer_id: customerId,
        p_idempotency_key: idempotencyKey,
        p_payment_method: "dinger_prebuilt",
        p_delivery_address_id: addressId,
        p_delivery_zone: zone,
        p_contact_name: addr?.contact_phone ? (addrForm.contact_name || customer?.name || "") : (addrForm.contact_name || customer?.name || ""),
        p_contact_phone: addr?.contact_phone || addrForm.contact_phone || customer?.phone || "",
        p_customer_notes: (showNewAddress ? addrForm.delivery_notes : addr?.delivery_notes) || null,
        p_payment_proof_url: null,
        p_payment_reference: null,
        p_coupon_code: appliedCoupon?.code || null,
      });

      if (orderError) throw orderError;
      if (!orderData?.success) throw new Error(orderData?.error || "Failed to place order");

      // Step 2: Call Dinger checkout Edge Function
      const resolvedBillingAddress = billingSameAsDelivery
        ? (addr?.address_line || addrForm.address_line)
        : billingAddress;
      const resolvedBillingCity = billingSameAsDelivery
        ? (addr?.city || addrForm.city || "Yangon")
        : billingCity;

      const { data, error } = await supabase.functions.invoke("dingar-checkout", {
        body: {
          orderId: orderData.order_id,
          customerEmail: dingerEmail,
          billingAddress: resolvedBillingAddress,
          billingCity: resolvedBillingCity,
        },
      });

      if (error) throw error;

      if (data?.success && data?.redirectUrl) {
        // Step 3: Redirect to Dinger's hosted checkout
        window.location.href = data.redirectUrl;
      } else {
        throw new Error(data?.error || "Failed to initiate payment");
      }
    } catch (err: any) {
      toast({ title: "Payment Error", description: err.message || "Payment initiation failed. Please try again.", variant: "destructive" });
      console.error("Dinger checkout error:", err);
    } finally {
      setPlacing(false);
      placingRef.current = false;
    }
  };

  const handlePlaceOrder = async () => {
    if (placingRef.current) return;
    placingRef.current = true;
    setPlacing(true);

    try {
      const addressId = selectedAddressId!;
      const addr = addresses.find((a) => a.id === addressId);
      const idempotencyKey = `${customerId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const { data, error } = await (supabase.rpc as any)("place_order", {
        p_customer_id: customerId,
        p_idempotency_key: idempotencyKey,
        p_payment_method: paymentMethod,
        p_delivery_address_id: addressId,
        p_delivery_zone: zone,
        p_contact_name: addr?.contact_phone ? (addrForm.contact_name || customer?.name || "") : (addrForm.contact_name || customer?.name || ""),
        p_contact_phone: addr?.contact_phone || addrForm.contact_phone || customer?.phone || "",
        p_customer_notes: (showNewAddress ? addrForm.delivery_notes : addr?.delivery_notes) || null,
        p_payment_proof_url: null,
        p_payment_reference: null,
        p_coupon_code: appliedCoupon?.code || null,
      });

      if (error) throw error;

      if (data?.success) {
        setOrderResult(data);
        setStep(3);
        sessionStorage.removeItem("appliedCoupon");
        queryClient.invalidateQueries({ queryKey: ["cart-count"] });
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["cart-checkout"] });
      } else {
        toast({ title: "Order Failed", description: data?.error || "Failed to place order", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setPlacing(false);
      placingRef.current = false;
    }
  };

  if (authLoading) return <MainLayout><div className="container mx-auto px-4 py-16 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div></MainLayout>;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Step Progress */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted ? "bg-emerald-500" : isActive ? "bg-accent" : "bg-muted"
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5 text-white" /> : <Icon className={`w-5 h-5 ${isActive ? "text-accent-foreground" : "text-muted-foreground"}`} />}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${isActive ? "text-accent" : isCompleted ? "text-emerald-600" : "text-muted-foreground"}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`w-16 sm:w-24 h-0.5 mx-2 mt-[-16px] ${step > stepNum ? "bg-emerald-500" : "bg-muted"}`} />}
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <>
            <StepDelivery
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              setSelectedAddressId={setSelectedAddressId}
              showNewAddress={showNewAddress}
              setShowNewAddress={setShowNewAddress}
              addrForm={addrForm}
              setAddrForm={setAddrForm}
              deliveryFee={deliveryFee}
              freeThreshold={freeThreshold}
              subtotal={subtotal}
              estimatedDays={estimatedDays}
              codEligible={codEligible}
              maxCod={maxCod}
              total={total}
              onContinue={handleContinueToPayment}
            />
            <RecommendedProducts cartItems={cartItems} />
          </>
        )}

        {step === 2 && (
          <StepPayment
            cartItems={cartItems}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            total={total}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            placing={placing}
            onPlaceOrder={handlePlaceOrder}
            onDingerCheckout={handleDingerCheckout}
            onBack={() => setStep(1)}
            codEligible={codEligible}
            maxCod={maxCod}
            getEffectivePrice={getEffectivePrice}
            couponDiscount={couponDiscount}
            couponCode={appliedCoupon?.code || null}
            dingerEmail={dingerEmail}
            setDingerEmail={setDingerEmail}
            billingSameAsDelivery={billingSameAsDelivery}
            setBillingSameAsDelivery={setBillingSameAsDelivery}
            billingAddress={billingAddress}
            setBillingAddress={setBillingAddress}
            billingCity={billingCity}
            setBillingCity={setBillingCity}
            hasUnpricedItems={hasUnpricedItems}
            allUnpriced={allUnpriced}
            unpricedCount={unpricedItems.length}
          />
        )}

        {step === 3 && orderResult && (
          <StepConfirmation
            orderResult={orderResult}
            paymentMethod={paymentMethod}
          />
        )}
      </div>
    </MainLayout>
  );
};

/* ─── Step 1: Delivery ─── */
interface DeliveryProps {
  addresses: any[];
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string) => void;
  showNewAddress: boolean;
  setShowNewAddress: (v: boolean) => void;
  addrForm: any;
  setAddrForm: (fn: any) => void;
  deliveryFee: number;
  freeThreshold: number | null;
  subtotal: number;
  estimatedDays: string;
  codEligible: boolean;
  maxCod: number | null;
  total: number;
  onContinue: () => void;
}

const StepDelivery = ({
  addresses, selectedAddressId, setSelectedAddressId,
  showNewAddress, setShowNewAddress, addrForm, setAddrForm,
  deliveryFee, freeThreshold, subtotal, estimatedDays,
  codEligible, maxCod, total, onContinue,
}: DeliveryProps) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-foreground">Delivery Address</h2>

    {/* Saved addresses */}
    {addresses.length > 0 && !showNewAddress && (
      <div className="space-y-3">
        {addresses.map((addr) => (
          <label
            key={addr.id}
            className={`block p-4 rounded-lg border-2 cursor-pointer transition ${
              selectedAddressId === addr.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="address"
                checked={selectedAddressId === addr.id}
                onChange={() => setSelectedAddressId(addr.id)}
                className="mt-1 accent-[hsl(var(--accent))]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span className="font-semibold text-foreground">{addr.label || "Address"}</span>
                  {addr.is_default && <span className="text-[10px] bg-accent/20 text-accent-foreground px-1.5 py-0.5 rounded font-medium">Default</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{addr.address_line}</p>
                <p className="text-sm text-muted-foreground">{[addr.township, addr.city, addr.region].filter(Boolean).join(", ")}</p>
                {addr.contact_phone && <p className="text-xs text-muted-foreground mt-1">📞 {addr.contact_phone}</p>}
              </div>
            </div>
          </label>
        ))}
      </div>
    )}

    <button
      onClick={() => setShowNewAddress(!showNewAddress)}
      className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition"
    >
      <Plus className="w-4 h-4" /> {showNewAddress ? "Use saved address" : "Add New Address"}
    </button>

    {/* New address form */}
    {showNewAddress && (
      <div className="bg-card rounded-lg border border-border p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Contact Name *</label>
            <input value={addrForm.contact_name} onChange={(e) => setAddrForm((f: any) => ({ ...f, contact_name: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Phone Number *</label>
            <input value={addrForm.contact_phone} onChange={(e) => setAddrForm((f: any) => ({ ...f, contact_phone: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder="09-XXX-XXX-XXXX" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Address Line *</label>
          <input value={addrForm.address_line} onChange={(e) => setAddrForm((f: any) => ({ ...f, address_line: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Street, building number" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Township *</label>
            <select value={addrForm.township} onChange={(e) => setAddrForm((f: any) => ({ ...f, township: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select...</option>
              {TOWNSHIPS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">City</label>
            <input value={addrForm.city} onChange={(e) => setAddrForm((f: any) => ({ ...f, city: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Region *</label>
            <select value={addrForm.region} onChange={(e) => setAddrForm((f: any) => ({ ...f, region: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Label</label>
          <input value={addrForm.label} onChange={(e) => setAddrForm((f: any) => ({ ...f, label: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Home, Office" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Delivery Notes</label>
          <textarea value={addrForm.delivery_notes} onChange={(e) => setAddrForm((f: any) => ({ ...f, delivery_notes: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring" rows={2} placeholder="Special instructions..." />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={addrForm.save} onChange={(e) => setAddrForm((f: any) => ({ ...f, save: e.target.checked }))}
            className="accent-[hsl(var(--accent))]" />
          Save this address for future orders
        </label>
      </div>
    )}

    {/* Delivery info */}
    <div className="bg-card rounded-lg border border-border p-4">
      <h3 className="text-sm font-semibold text-foreground mb-2">Delivery Details</h3>
      {deliveryFee === 0 ? (
        <p className="text-sm text-emerald-600 font-medium">🎉 FREE Delivery!</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Delivery: <span className="font-semibold text-foreground">{fmt(deliveryFee)}</span>
          {freeThreshold && <span className="ml-1">(Free on orders over {fmt(freeThreshold)})</span>}
        </p>
      )}
      <p className="text-xs text-muted-foreground mt-1">Estimated: {estimatedDays}</p>

      {!codEligible && (
        <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded p-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">COD is not available for this delivery zone.</p>
        </div>
      )}
      {codEligible && maxCod && total > maxCod && (
        <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded p-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">COD is limited to orders under {fmt(maxCod)} for this zone. Online payment recommended.</p>
        </div>
      )}
    </div>

    <button onClick={onContinue} className="w-full sm:w-auto bg-accent text-accent-foreground py-3 px-8 rounded-lg font-semibold hover:bg-accent/90 transition">
      Continue to Payment
    </button>
  </div>
);

/* ─── Step 2: Payment ─── */
interface PaymentProps {
  cartItems: any[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  setPaymentMethod: (m: string) => void;
  placing: boolean;
  onPlaceOrder: () => void;
  onDingerCheckout: () => void;
  onBack: () => void;
  couponDiscount: number;
  couponCode: string | null;
  codEligible: boolean;
  maxCod: number | null;
  getEffectivePrice: (productId: string, sellingPrice: number, categoryId?: string | null, brandId?: string | null, quantity?: number) => { price: number; originalPrice: number; isFlashDeal: boolean; isPromotion: boolean; promoTitle: string | null };
  dingerEmail: string;
  setDingerEmail: (v: string) => void;
  billingSameAsDelivery: boolean;
  setBillingSameAsDelivery: (v: boolean) => void;
  billingAddress: string;
  setBillingAddress: (v: string) => void;
  billingCity: string;
  setBillingCity: (v: string) => void;
  hasUnpricedItems: boolean;
  allUnpriced: boolean;
  unpricedCount: number;
}

const StepPayment = ({
  cartItems, subtotal, deliveryFee, total,
  paymentMethod, setPaymentMethod, placing, onPlaceOrder, onDingerCheckout,
  onBack, codEligible, maxCod, getEffectivePrice, couponDiscount, couponCode,
  dingerEmail, setDingerEmail, billingSameAsDelivery, setBillingSameAsDelivery,
  billingAddress, setBillingAddress, billingCity, setBillingCity,
  hasUnpricedItems, allUnpriced, unpricedCount,
}: PaymentProps) => {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const codDisabled = !codEligible || (maxCod !== null && total > maxCod);

  const methods = [
    {
      id: "dinger_prebuilt", label: "Pay with Dinger", icon: CreditCard, disabled: false,
      desc: "KBZ Pay, AYA Pay, Wave, Visa, Mastercard & more",
    },
    {
      id: "cod", label: "Cash on Delivery", icon: Banknote, disabled: codDisabled,
      desc: codDisabled ? "Not available for this order" : "Pay cash when your order arrives",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-6">
        <button onClick={onBack} className="text-sm text-primary hover:underline">← Back to Delivery</button>
        <h2 className="text-xl font-bold text-foreground">Payment Method</h2>

        {/* Unpriced items warning banners */}
        {allUnpriced && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">All items in your cart require a quote</p>
              <p className="text-xs text-destructive/80 mt-1">Please contact us for pricing before placing an order.</p>
            </div>
          </div>
        )}
        {hasUnpricedItems && !allUnpriced && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{unpricedCount} item{unpricedCount > 1 ? "s" : ""} won't be included in this order</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Items without prices require a quote and will be excluded. Contact us for pricing on those items.</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {methods.map((m) => (
            <div key={m.id}>
              <label className={`block p-4 rounded-lg border-2 transition ${
                m.disabled ? "opacity-50 cursor-not-allowed border-border" :
                paymentMethod === m.id ? "border-accent bg-accent/5 cursor-pointer" : "border-border hover:border-accent/40 cursor-pointer"
              }`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="payment" checked={paymentMethod === m.id} disabled={m.disabled}
                    onChange={() => !m.disabled && setPaymentMethod(m.id)} className="accent-[hsl(var(--accent))]" />
                  <m.icon className={`w-5 h-5 ${paymentMethod === m.id ? "text-accent" : "text-muted-foreground"}`} />
                  <div>
                    <p className="font-semibold text-foreground">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                </div>
              </label>

              {/* Dinger expanded UI */}
              {paymentMethod === "dinger_prebuilt" && m.id === "dinger_prebuilt" && (
                <div className="mt-2 ml-4 p-4 bg-card rounded-lg border border-border space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={dingerEmail}
                      onChange={(e) => setDingerEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="your@email.com"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={billingSameAsDelivery}
                      onChange={(e) => setBillingSameAsDelivery(e.target.checked)}
                      className="accent-[hsl(var(--accent))]"
                    />
                    Billing address same as delivery address
                  </label>

                  {!billingSameAsDelivery && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Billing Address *</label>
                        <input
                          value={billingAddress}
                          onChange={(e) => setBillingAddress(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Street, building number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">City *</label>
                        <input
                          value={billingCity}
                          onChange={(e) => setBillingCity(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Yangon"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={onDingerCheckout}
                    disabled={placing || !dingerEmail || allUnpriced}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-lg font-bold text-base transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {placing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
                    {placing ? "Processing..." : `Proceed to Secure Payment — ${fmt(total)}`}
                  </button>

                  <p className="text-xs text-muted-foreground text-center">
                    You'll be redirected to choose your payment method (KBZ Pay, AYA Pay, Wave, Visa, Mastercard, etc.)
                  </p>
                </div>
              )}

              {paymentMethod === "cod" && m.id === "cod" && !codDisabled && (
                <div className="mt-2 ml-4 p-3 bg-card rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Payment collected by our delivery driver.</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Place Order button for COD only */}
        {paymentMethod === "cod" && (
          <button
            onClick={onPlaceOrder}
            disabled={placing || allUnpriced}
            className="w-full bg-accent text-accent-foreground py-3.5 rounded-lg font-bold text-base hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {placing ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {placing ? "Placing Order..." : `Place Order · ${fmt(total)}`}
          </button>
        )}
      </div>

      {/* Order Summary */}
      <div className="lg:w-80 shrink-0">
        <div className="bg-card rounded-lg border border-border p-4 lg:sticky lg:top-28">
          <button onClick={() => setSummaryOpen(!summaryOpen)} className="lg:hidden w-full flex items-center justify-between text-sm font-semibold text-foreground mb-2">
            Order Summary ({cartItems.length} items) {summaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <div className={`${summaryOpen ? "block" : "hidden"} lg:block`}>
            <h3 className="hidden lg:block text-sm font-semibold text-foreground mb-3">Order Summary</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {cartItems.map((item) => {
                const p = item.product;
                if (!p) return null;
                const { price, originalPrice, isFlashDeal, isPromotion, promoTitle } = getEffectivePrice(item.product_id, Number(p.selling_price) || 0, p.category_id, p.brand_id, item.quantity);
                return (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <div className="w-10 h-10 rounded bg-muted/30 overflow-hidden shrink-0">
                      {p.thumbnail_url ? <img src={p.thumbnail_url} alt="" className="w-full h-full object-contain" /> : <div className="w-full h-full bg-primary/10" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground line-clamp-1">{p.description}</p>
                      <div className="flex items-center gap-1">
                        {isFlashDeal && <Zap className="w-3 h-3 text-destructive" />}
                        {isPromotion && <Tag className="w-3 h-3 text-primary" />}
                        <p className="text-[10px] text-muted-foreground">
                          {item.quantity} × {(isFlashDeal || isPromotion) && <span className="line-through mr-1">{originalPrice.toLocaleString()}</span>}
                          <span className={isFlashDeal ? "text-destructive font-medium" : isPromotion ? "text-primary font-medium" : ""}>{price.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-foreground shrink-0">{(price * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            <hr className="my-3 border-border" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">{fmt(subtotal)}</span></div>
              {couponDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-emerald-600 font-medium flex items-center gap-1"><Tag className="w-3 h-3" />Coupon ({couponCode})</span>
                  <span className="text-emerald-600 font-medium">-{fmt(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className={deliveryFee === 0 ? "text-emerald-600 font-medium" : "text-foreground"}>{deliveryFee === 0 ? "FREE" : fmt(deliveryFee)}</span></div>
              <hr className="border-border" />
              <div className="flex justify-between font-bold text-base"><span className="text-foreground">Total</span><span className="text-accent">{fmt(total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Step 3: Confirmation ─── */
const StepConfirmation = ({ orderResult, paymentMethod }: { orderResult: any; paymentMethod: string | null }) => {
  const navigate = useNavigate();

  const getStatusInfo = () => {
    if (paymentMethod === "cod") return { label: "Confirmed", color: "bg-emerald-100 text-emerald-700", msg: "Our team will prepare your order for delivery." };
    if (paymentMethod === "dinger_prebuilt") return { label: "Payment Confirmed", color: "bg-emerald-100 text-emerald-700", msg: "Your payment has been verified. We'll prepare your order for delivery." };
    return { label: "Processing", color: "bg-amber-100 text-amber-700", msg: "Your order is being processed." };
  };

  const status = getStatusInfo();

  return (
    <div className="max-w-lg mx-auto text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
          <PartyPopper className="w-10 h-10 text-emerald-600" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground">Order Placed Successfully!</h2>
        <p className="text-muted-foreground mt-1">Order Number: <span className="font-mono font-bold text-foreground">{orderResult.order_number}</span></p>
      </div>

      <div className="bg-card rounded-lg border border-border p-4 text-left space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${status.color}`}>{status.label}</span>
        </div>
        <p className="text-sm text-muted-foreground">{status.msg}</p>
        <hr className="border-border" />
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-muted-foreground">Payment:</span> <span className="font-medium text-foreground capitalize">{paymentMethod === "dinger_prebuilt" ? "Dinger" : paymentMethod?.replace("_", " ")}</span></div>
          <div><span className="text-muted-foreground">Total:</span> <span className="font-bold text-accent">{fmt(Number(orderResult.total))}</span></div>
          {orderResult.delivery_fee > 0 && <div><span className="text-muted-foreground">Delivery:</span> <span className="text-foreground">{fmt(Number(orderResult.delivery_fee))}</span></div>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={() => navigate("/orders")} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition">
          View My Orders
        </button>
        <button onClick={() => navigate("/")} className="px-6 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted/50 transition">
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default Checkout;
