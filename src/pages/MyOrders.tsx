import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "@/hooks/use-toast";
import {
  Package, ChevronDown, ChevronUp, Upload, Loader2, LogIn, AlertTriangle, X
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string }> = {
  confirmed_cod: { label: "Confirmed", color: "bg-blue-100 text-blue-700" },
  awaiting_payment_proof: { label: "Awaiting Payment", color: "bg-red-100 text-red-700" },
  payment_under_review: { label: "Payment Under Review", color: "bg-amber-100 text-amber-700" },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700" },
  packed: { label: "Packed", color: "bg-blue-100 text-blue-700" },
  out_for_delivery: { label: "Out for Delivery", color: "bg-amber-100 text-amber-700" },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-600" },
  payment_rejected: { label: "Payment Rejected", color: "bg-red-100 text-red-700" },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-600" },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-700" },
};

const fmt = (n: number) => `MMK ${n.toLocaleString()}`;

const MyOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: customerId } = useQuery({
    queryKey: ["customer-id", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_customer_id_for_user", { _user_id: user!.id });
      if (error) throw error;
      return data as string;
    },
    enabled: !!user,
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: orderItems } = useQuery({
    queryKey: ["order-items", expandedId],
    queryFn: async () => {
      const { data, error } = await supabase.from("order_items").select("*").eq("order_id", expandedId!);
      if (error) throw error;
      return data;
    },
    enabled: !!expandedId,
  });

  if (authLoading) return <MainLayout><div className="container mx-auto px-4 py-16 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div></MainLayout>;

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Sign in to view your orders</h1>
          <Link to="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition">
            <LogIn className="w-4 h-4" /> Go Home
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-xl font-bold text-foreground mb-6">My Orders</h1>

        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-foreground font-semibold">No orders yet</p>
            <p className="text-sm text-muted-foreground mb-4">Your orders will appear here.</p>
            <Link to="/" className="text-primary font-medium hover:underline">Start Shopping →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const sc = statusConfig[order.status] || statusConfig.pending;
              const isExpanded = expandedId === order.id;
              const canUploadProof = ["awaiting_payment_proof", "payment_rejected"].includes(order.status);

              return (
                <div key={order.id} className="bg-card rounded-lg border border-border overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition"
                  >
                    <div className="flex items-center gap-4 text-left flex-1 min-w-0">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 text-[10px] font-medium rounded-full whitespace-nowrap ${sc.color}`}>{sc.label}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-foreground text-sm">{fmt(Number(order.total || 0))}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border px-4 pb-4 space-y-4">
                      {/* Order details */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm pt-3">
                        <div><span className="text-muted-foreground block text-xs">Payment</span><span className="text-foreground capitalize">{order.payment_method?.replace("_", " ") || "—"}</span></div>
                        <div><span className="text-muted-foreground block text-xs">Payment Status</span><span className="text-foreground capitalize">{order.payment_status?.replace("_", " ") || "—"}</span></div>
                        <div><span className="text-muted-foreground block text-xs">Delivery Zone</span><span className="text-foreground capitalize">{order.delivery_zone?.replace("_", " ") || "—"}</span></div>
                        <div><span className="text-muted-foreground block text-xs">Shipping</span><span className="text-foreground">{fmt(Number(order.shipping_cost || 0))}</span></div>
                      </div>

                      {/* Rejection reason */}
                      {order.status === "payment_rejected" && order.payment_rejection_reason && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded p-3">
                          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-red-700">Payment Rejected</p>
                            <p className="text-red-600">{order.payment_rejection_reason}</p>
                          </div>
                        </div>
                      )}

                      {/* Upload proof */}
                      {canUploadProof && customerId && (
                        <UploadProofButton orderId={order.id} customerId={customerId} onUploaded={() => queryClient.invalidateQueries({ queryKey: ["my-orders"] })} />
                      )}

                      {/* Order items */}
                      {orderItems && (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-muted-foreground text-xs">
                              <th className="pb-2">Product</th>
                              <th className="pb-2">Qty</th>
                              <th className="pb-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderItems.map((item) => (
                              <tr key={item.id} className="border-t border-border/50">
                                <td className="py-2 text-foreground">{item.product_name || item.sku || "—"}</td>
                                <td className="py-2 text-muted-foreground">{item.quantity}</td>
                                <td className="py-2 text-right font-medium text-foreground">{Number(item.total).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

/* Upload Proof Button */
const UploadProofButton = ({ orderId, customerId, onUploaded }: { orderId: string; customerId: string; onUploaded: () => void }) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${customerId}/${orderId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("payment-proofs").upload(path, file);
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from("payment-proofs").getPublicUrl(path);

      const { error: updateErr } = await supabase
        .from("orders")
        .update({
          payment_proof_url: publicUrl,
          status: "payment_under_review",
          payment_status: "under_review",
        })
        .eq("id", orderId);
      if (updateErr) throw updateErr;

      toast({ title: "Uploaded!", description: "Payment proof submitted for review." });
      onUploaded();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition disabled:opacity-50"
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uploading ? "Uploading..." : "Upload Payment Proof"}
      </button>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
    </div>
  );
};

export default MyOrders;
