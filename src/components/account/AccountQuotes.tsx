import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { FileText } from "lucide-react";

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  responded: "bg-blue-100 text-blue-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-700",
};

const AccountQuotes = () => {
  const { user } = useAuthContext();

  const { data: quotes, isLoading } = useQuery({
    queryKey: ["account-quotes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) return <div className="text-muted-foreground">Loading quotes...</div>;

  if (!quotes?.length) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-foreground font-semibold">No quotes yet</p>
        <p className="text-sm text-muted-foreground">Your quote requests will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-h3 text-foreground mb-4">My Quotes</h2>
      <div className="space-y-3">
        {quotes.map((q) => {
          const items = Array.isArray(q.items) ? q.items : [];
          return (
            <div key={q.id} className="bg-card rounded-card shadow-card p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{q.quote_number}</p>
                <p className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleDateString()} · {items.length} item{items.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex items-center gap-3">
                {q.total_quoted && <span className="font-bold text-foreground">MMK {Number(q.total_quoted).toLocaleString()}</span>}
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full capitalize ${statusBadge[q.status] || statusBadge.pending}`}>
                  {q.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccountQuotes;
