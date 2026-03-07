import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "@/hooks/use-toast";
import { Trash2, Plus, Send, Loader2, FileText } from "lucide-react";

interface QuoteItem {
  product_id: string | null;
  name: string;
  quantity: number;
  notes: string;
}

const PROJECT_TYPES = [
  "Kitchen Setup",
  "Restaurant Renovation",
  "Hotel Fit-Out",
  "Catering Event",
  "Regular Supply",
  "Other",
];

const TIMELINES = [
  { label: "Urgent (1 week)", value: "urgent" },
  { label: "Standard (2-4 weeks)", value: "standard" },
  { label: "Flexible (1-3 months)", value: "flexible" },
];

const BUDGET_RANGES = [
  "Under 5M MMK",
  "5-20M MMK",
  "20-50M MMK",
  "50-100M MMK",
  "Over 100M MMK",
];

const RequestQuotePage = () => {
  const { user, openAuthModal } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const fromCart = searchParams.get("from") === "cart";
  const productId = searchParams.get("product");

  const [items, setItems] = useState<QuoteItem[]>([]);
  const [projectType, setProjectType] = useState("");
  const [timeline, setTimeline] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!user) openAuthModal();
  }, [user, openAuthModal]);

  // Get customer ID
  const { data: customerId } = useQuery({
    queryKey: ["customer-id", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_customer_id_for_user", { _user_id: user!.id });
      if (error) throw error;
      return data as string;
    },
    enabled: !!user,
  });

  // Load cart items
  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ["cart-for-quote", customerId],
    queryFn: async () => {
      const { data: cartItems, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("customer_id", customerId!);
      if (error) throw error;
      if (!cartItems?.length) return [];

      const productIds = cartItems.map((i) => i.product_id);
      const { data: products } = await supabase
        .from("products_public")
        .select("id, description, stock_code")
        .in("id", productIds);

      const pMap = new Map(products?.map((p) => [p.id, p]) || []);
      return cartItems.map((ci) => {
        const p = pMap.get(ci.product_id);
        return {
          product_id: ci.product_id,
          name: p?.description || p?.stock_code || "Unknown Product",
          quantity: ci.quantity,
          notes: "",
        } as QuoteItem;
      });
    },
    enabled: fromCart && !!customerId,
  });

  // Load single product
  const { data: singleProduct } = useQuery({
    queryKey: ["product-for-quote", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products_public")
        .select("id, description, stock_code, moq")
        .eq("id", productId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  // Seed items from cart
  useEffect(() => {
    if (fromCart && cartData && cartData.length > 0 && items.length === 0) {
      setItems(cartData);
    }
  }, [cartData, fromCart]);

  // Seed item from single product
  useEffect(() => {
    if (singleProduct && items.length === 0) {
      setItems([{
        product_id: singleProduct.id,
        name: singleProduct.description || singleProduct.stock_code || "",
        quantity: singleProduct.moq || 1,
        notes: "",
      }]);
    }
  }, [singleProduct]);

  const addRow = () => setItems([...items, { product_id: null, name: "", quantity: 1, notes: "" }]);
  const removeRow = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof QuoteItem, value: string | number) => {
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async () => {
    if (!user) { openAuthModal(); return; }
    if (!customerId) { toast({ title: "Error", description: "Customer profile not found.", variant: "destructive" }); return; }
    if (items.length === 0 || items.every((i) => !i.name.trim())) {
      toast({ title: "Add items", description: "Please add at least one item to your quote request.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const quoteItems = items.filter((i) => i.name.trim()).map((i) => ({
        product_id: i.product_id,
        name: i.name,
        quantity: i.quantity,
        notes: i.notes,
      }));

      const { data: quote, error } = await supabase
        .from("quotes")
        .insert({
          customer_id: customerId,
          status: "pending",
          items: quoteItems,
          project_type: projectType || null,
          timeline: timeline || null,
          budget_range: budgetRange || null,
          additional_notes: notes || null,
        })
        .select("quote_number")
        .single();

      if (error) throw error;

      // Clear cart if from cart
      if (fromCart) {
        await supabase.from("cart_items").delete().eq("customer_id", customerId);
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      }

      toast({
        title: "Quote Request Submitted!",
        description: `Your quote request #${quote.quote_number} has been submitted. We'll respond within 24 hours.`,
      });

      navigate("/account?tab=quotes");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to submit quote request.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-h2 text-foreground mb-2">Sign in to request a quote</h1>
          <p className="text-muted-foreground">You need to be logged in to submit a quote request.</p>
        </div>
      </MainLayout>
    );
  }

  const loading = fromCart && cartLoading;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-h1 text-foreground mb-2">Request a Quote</h1>
        <p className="text-muted-foreground mb-8">Fill in the details below and our team will get back to you within 24 hours.</p>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded-card animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Project Details */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Project Type</label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full border border-border rounded-button px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select...</option>
                  {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Timeline</label>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full border border-border rounded-button px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select...</option>
                  {TIMELINES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Budget Range</label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full border border-border rounded-button px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select...</option>
                  {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground">Items</label>
                <button onClick={addRow} className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Row
                </button>
              </div>

              {items.length === 0 ? (
                <div className="border border-dashed border-border rounded-card p-8 text-center">
                  <p className="text-muted-foreground text-sm mb-3">No items added yet</p>
                  <button onClick={addRow} className="text-sm text-primary hover:text-primary/80 font-medium">
                    + Add an item
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Header */}
                  <div className="hidden sm:grid sm:grid-cols-[1fr_80px_1fr_40px] gap-3 text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
                    <span>Product Name</span>
                    <span>Qty</span>
                    <span>Notes</span>
                    <span></span>
                  </div>
                  {items.map((item, i) => (
                    <div key={i} className="grid sm:grid-cols-[1fr_80px_1fr_40px] gap-3 items-start bg-card rounded-card p-3 shadow-sm border border-border/50">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(i, "name", e.target.value)}
                        placeholder="Product name or description"
                        className="w-full border border-border rounded-button px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(i, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full border border-border rounded-button px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => updateItem(i, "notes", e.target.value)}
                        placeholder="Any specific requirements"
                        className="w-full border border-border rounded-button px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <button onClick={() => removeRow(i)} className="p-2 text-muted-foreground hover:text-destructive transition self-center">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Additional Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any other details about your project or requirements..."
                className="w-full border border-border rounded-card px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-button font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-60 text-base"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Submit Quote Request
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RequestQuotePage;
