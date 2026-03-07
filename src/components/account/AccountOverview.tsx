import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Package, FileText, Heart } from "lucide-react";

const AccountOverview = () => {
  const { user } = useAuthContext();

  const { data: customer } = useQuery({
    queryKey: ["customer-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("customers").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["account-stats", user?.id],
    queryFn: async () => {
      const customerId = await supabase.rpc("get_customer_id_for_user", { _user_id: user!.id });
      if (!customerId.data) return { orders: 0, quotes: 0, lists: 0 };
      const [orders, quotes, lists] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("customer_id", customerId.data),
        supabase.from("quotes").select("*", { count: "exact", head: true }).eq("customer_id", customerId.data),
        supabase.from("saved_lists").select("*", { count: "exact", head: true }).eq("customer_id", customerId.data),
      ]);
      return { orders: orders.count || 0, quotes: quotes.count || 0, lists: lists.count || 0 };
    },
    enabled: !!user,
  });

  const cards = [
    { label: "Orders", count: stats?.orders || 0, icon: Package, color: "text-blue-600 bg-blue-50" },
    { label: "Quotes", count: stats?.quotes || 0, icon: FileText, color: "text-purple-600 bg-purple-50" },
    { label: "Saved Lists", count: stats?.lists || 0, icon: Heart, color: "text-accent bg-accent/10" },
  ];

  return (
    <div>
      <h2 className="text-h3 text-foreground mb-2">Welcome back, {customer?.name || "there"}!</h2>
      <p className="text-sm text-muted-foreground mb-6">Here's a summary of your account.</p>
      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-card shadow-card p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${c.color}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{c.count}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountOverview;
