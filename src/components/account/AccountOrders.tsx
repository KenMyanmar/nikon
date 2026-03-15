import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { ChevronDown, ChevronUp, Package, ExternalLink } from "lucide-react";

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  confirmed_cod: "bg-blue-100 text-blue-700",
  awaiting_payment_proof: "bg-red-100 text-red-700",
  payment_under_review: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  packed: "bg-blue-100 text-blue-700",
  out_for_delivery: "bg-amber-100 text-amber-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-gray-100 text-gray-600",
  payment_rejected: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-600",
};

const AccountOrders = () => {
  const { user } = useAuthContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["account-orders", user?.id],
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
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", expandedId!);
      if (error) throw error;
      return data;
    },
    enabled: !!expandedId,
  });

  if (isLoading) return <div className="text-muted-foreground">Loading orders...</div>;

  if (!orders?.length) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-foreground font-semibold">No orders yet</p>
        <p className="text-sm text-muted-foreground">Your orders will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-h3 text-foreground mb-4">My Orders</h2>
      {orders.map((order) => (
        <div key={order.id} className="bg-card rounded-card shadow-card overflow-hidden">
          <button
            onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
            className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition"
          >
            <div className="flex items-center gap-4 text-left">
              <div>
                <p className="font-semibold text-foreground">{order.order_number}</p>
                <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full capitalize ${statusBadge[order.status] || statusBadge.pending}`}>
                {order.status}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-foreground">{order.currency} {Number(order.total || 0).toLocaleString()}</span>
              {expandedId === order.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </button>
          {expandedId === order.id && orderItems && (
            <div className="border-t border-border px-4 pb-4">
              <table className="w-full text-sm mt-3">
                <thead>
                  <tr className="text-left text-muted-foreground">
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
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AccountOrders;
