import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "@/hooks/use-toast";
import {
  Trash2, Plus, Send, Loader2, FileText, Upload, X,
  CheckCircle2, ArrowRight, Search,
} from "lucide-react";

interface QuoteItem {
  product_id: string | null;
  name: string;
  quantity: number;
  notes: string;
}

interface UploadedFile {
  name: string;
  size: number;
  url: string;
}

const PROJECT_TYPES = [
  "New Kitchen Setup",
  "Hotel Renovation",
  "Restaurant Opening",
  "Equipment Replacement",
  "Bulk Consumables / Supplies",
  "Other",
];

const TIMELINES = [
  { label: "Urgent (1-2 weeks)", value: "urgent", color: "text-destructive" },
  { label: "Standard (2-4 weeks)", value: "standard", color: "text-amber-500" },
  { label: "Flexible (1-2 months)", value: "flexible", color: "text-green-600" },
];

const BUDGET_RANGES = [
  "Under 500K MMK",
  "500K - 2M MMK",
  "2M - 5M MMK",
  "5M - 10M MMK",
  "Above 10M MMK",
];

const MAX_ITEMS = 20;
const MAX_FILES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/* ─── Product Search Input ─── */
function ProductSearchInput({
  value,
  productId,
  onChange,
}: {
  value: string;
  productId: string | null;
  onChange: (name: string, id: string | null) => void;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: results = [] } = useQuery({
    queryKey: ["product-search", debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < 2) return [];
      const { data } = await supabase
        .from("products")
        .select("id, description, stock_code")
        .eq("is_active", true)
        .or(`description.ilike.%${debouncedQuery}%,stock_code.ilike.%${debouncedQuery}%`)
        .limit(50);
      return data || [];
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  });

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value, null);
            setOpen(true);
          }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Search product name or code..."
          className="w-full border border-border rounded-button pl-9 pr-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-auto bg-popover border border-border rounded-card shadow-lg">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                const name = p.description || p.stock_code;
                setQuery(name);
                onChange(name, p.id);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent/50 transition flex items-center justify-between"
            >
              <span className="truncate text-foreground">{p.description || p.stock_code}</span>
              <span className="text-xs text-muted-foreground ml-2 shrink-0">{p.stock_code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Success View ─── */
function SuccessView({ quoteNumber, email }: { quoteNumber: string; email: string }) {
  return (
    <div className="text-center py-12 max-w-lg mx-auto">
      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-foreground mb-2">Quote Request Received!</h2>
      <p className="text-muted-foreground mb-6">
        Thank you! Your quote request <span className="font-semibold text-foreground select-all">{quoteNumber}</span> has been received.
        We'll review your requirements and send you a personalized quote within 24 business hours.
      </p>
      {email && (
        <p className="text-sm text-muted-foreground mb-8">
          Check your email ({email}) for updates.
        </p>
      )}
      <div className="space-y-4 text-left bg-muted/50 rounded-card p-6 mb-8">
        <h3 className="font-semibold text-foreground text-sm">What happens next?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✅ Our sales team will analyze your requirements</li>
          <li>📧 We'll email you a detailed quote with pricing and availability</li>
          <li>💬 You can accept the quote or request modifications</li>
          <li>🛒 Accepted quotes convert directly to orders</li>
        </ul>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-button hover:bg-primary/90 transition"
        >
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/account?tab=quotes"
          className="inline-flex items-center justify-center gap-2 border border-border text-foreground font-medium px-6 py-3 rounded-button hover:bg-muted transition"
        >
          View Your Quotes
        </Link>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
const RequestQuotePage = () => {
  const { user, openAuthModal } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const fromCart = searchParams.get("from") === "cart";
  const productId = searchParams.get("product");

  // Contact info
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Project details
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [projectType, setProjectType] = useState("");
  const [timeline, setTimeline] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [notes, setNotes] = useState("");

  // Attachments
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // Consent & submit
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ quoteNumber: string; email: string } | null>(null);

  // Auth guard
  useEffect(() => {
    if (!user) openAuthModal();
  }, [user, openAuthModal]);

  // Pre-fill email from auth
  useEffect(() => {
    if (user?.email && !contactEmail) setContactEmail(user.email);
  }, [user]);

  // Get customer ID + pre-fill contact
  const { data: customerData } = useQuery({
    queryKey: ["customer-profile-quote", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, email, phone, company_name")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const customerId = customerData?.id;

  // Pre-fill from customer profile
  useEffect(() => {
    if (customerData) {
      if (customerData.name && !contactPerson) setContactPerson(customerData.name);
      if (customerData.phone && !contactPhone) setContactPhone(customerData.phone);
      if (customerData.company_name && !companyName) setCompanyName(customerData.company_name);
      if (customerData.email && !contactEmail) setContactEmail(customerData.email);
    }
  }, [customerData]);

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
        .from("products")
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
        .from("products")
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
    if (fromCart && cartData && cartData.length > 0 && items.length === 0) setItems(cartData);
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

  const addRow = () => {
    if (items.length >= MAX_ITEMS) {
      toast({ title: "Limit reached", description: `Maximum ${MAX_ITEMS} items per quote.`, variant: "destructive" });
      return;
    }
    setItems([...items, { product_id: null, name: "", quantity: 1, notes: "" }]);
  };

  const removeRow = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: keyof QuoteItem, value: string | number) => {
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const updateItemProduct = (i: number, name: string, id: string | null) => {
    setItems(items.map((item, idx) => idx === i ? { ...item, name, product_id: id } : item));
  };

  // File upload
  const handleFileUpload = useCallback(async (fileList: FileList | null) => {
    if (!fileList || !user) return;
    const files = Array.from(fileList);

    if (uploadedFiles.length + files.length > MAX_FILES) {
      toast({ title: "Too many files", description: `Maximum ${MAX_FILES} files allowed.`, variant: "destructive" });
      return;
    }

    for (const file of files) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({ title: "Invalid file type", description: `${file.name}: Only PDF, JPG, PNG, DOCX allowed.`, variant: "destructive" });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "File too large", description: `${file.name}: Maximum 10MB per file.`, variant: "destructive" });
        return;
      }
    }

    setUploading(true);
    try {
      const newFiles: UploadedFile[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("quote-attachments").upload(path, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("quote-attachments").getPublicUrl(path);
        newFiles.push({ name: file.name, size: file.size, url: urlData.publicUrl });
      }
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }, [user, uploadedFiles.length]);

  const removeFile = (idx: number) => setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Validation
  const isFormValid =
    companyName.trim() &&
    contactPerson.trim() &&
    contactEmail.trim() &&
    contactPhone.trim() &&
    items.length > 0 &&
    items.some((i) => i.name.trim()) &&
    consent;

  const handleSubmit = async () => {
    if (!user) { openAuthModal(); return; }
    if (!customerId) { toast({ title: "Error", description: "Customer profile not found.", variant: "destructive" }); return; }
    if (!isFormValid) {
      toast({ title: "Missing fields", description: "Please fill in all required fields and agree to the terms.", variant: "destructive" });
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
          items: quoteItems as any,
          project_type: projectType || null,
          timeline: timeline || null,
          budget_range: budgetRange || null,
          additional_notes: notes || null,
          company_name: companyName || null,
          contact_person: contactPerson || null,
          contact_email: contactEmail || null,
          contact_phone: contactPhone || null,
          source: "e_mall",
          attachments: uploadedFiles.length > 0
            ? uploadedFiles.map((f) => ({ name: f.name, size: f.size, url: f.url })) as any
            : [],
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

      setSuccessData({ quoteNumber: quote.quote_number, email: contactEmail });
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

  if (successData) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <SuccessView quoteNumber={successData.quoteNumber} email={successData.email} />
        </div>
      </MainLayout>
    );
  }

  const loading = fromCart && cartLoading;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-h1 text-foreground mb-2">Request a Quote</h1>
        <p className="text-muted-foreground mb-8">
          Tell us your requirements and we'll provide a competitive quote within 24 hours.
        </p>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded-card animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Section 1: Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Contact Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Company Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Hotel, Restaurant, or Business Name"
                    className="w-full border border-border rounded-button px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Contact Person <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Your full name"
                    className="w-full border border-border rounded-button px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full border border-border rounded-button px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Phone <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+95 9 XXXX XXXX"
                    className="w-full border border-border rounded-button px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Project Details */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Project Details</h2>
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
            </div>

            {/* Section 3: Products */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Products <span className="text-destructive">*</span>
                </h2>
                <button
                  onClick={addRow}
                  disabled={items.length >= MAX_ITEMS}
                  className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" /> Add Item
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
                  <div className="hidden sm:grid sm:grid-cols-[1fr_80px_1fr_40px] gap-3 text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
                    <span>Product</span>
                    <span>Qty</span>
                    <span>Notes</span>
                    <span></span>
                  </div>
                  {items.map((item, i) => (
                    <div key={i} className="grid sm:grid-cols-[1fr_80px_1fr_40px] gap-3 items-start bg-card rounded-card p-3 shadow-sm border border-border/50">
                      <ProductSearchInput
                        value={item.name}
                        productId={item.product_id}
                        onChange={(name, id) => updateItemProduct(i, name, id)}
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
                        maxLength={200}
                        className="w-full border border-border rounded-button px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <button onClick={() => removeRow(i)} className="p-2 text-muted-foreground hover:text-destructive transition self-center">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {items.length >= MAX_ITEMS && (
                    <p className="text-xs text-muted-foreground text-center">Maximum {MAX_ITEMS} items reached</p>
                  )}
                </div>
              )}
            </div>

            {/* Section 4: Attachments */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Attachments</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Upload floor plans, specifications, or requirements (PDF, JPG, PNG, DOCX — max 10MB each, up to 3 files)
              </p>

              {uploadedFiles.length < MAX_FILES && (
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-card p-6 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {uploading ? "Uploading..." : "Click to upload or drag & drop"}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.docx"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}

              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-muted/50 rounded-button px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{formatSize(file.size)}</span>
                      </div>
                      <button onClick={() => removeFile(idx)} className="p-1 text-muted-foreground hover:text-destructive">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 5: Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Additional Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 1000))}
                rows={3}
                maxLength={1000}
                placeholder="Any other details about your project or requirements..."
                className="w-full border border-border rounded-card px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <p className="text-xs text-muted-foreground text-right mt-1">{notes.length}/1000</p>
            </div>

            {/* Section 6: Consent & Submit */}
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                />
                <span className="text-sm text-muted-foreground">
                  I agree to IKON Mart's{" "}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>{" "}
                  and{" "}
                  <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                </span>
              </label>

              <button
                onClick={handleSubmit}
                disabled={submitting || !isFormValid}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-button font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-base"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {submitting ? "Submitting..." : "Submit Quote Request"}
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RequestQuotePage;
