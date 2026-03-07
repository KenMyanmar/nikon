import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const companyTypes = ["Hotel", "Restaurant", "Cafe", "Bakery", "Catering", "Other"];

const AccountProfile = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("");

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("customers").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (customer) {
      setName(customer.name || "");
      setPhone(customer.phone || "");
      setCompanyName(customer.company_name || "");
      setCompanyType(customer.company_type || "");
    }
  }, [customer]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("customers").update({
        name: name.trim(),
        phone: phone.trim() || null,
        company_name: companyName.trim() || null,
        company_type: companyType || null,
      }).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-profile"] });
      toast({ title: "Profile updated" });
    },
  });

  const inputClass = "w-full px-3 py-2.5 rounded-button border border-input bg-card text-foreground text-sm focus:border-primary outline-none";

  if (isLoading) return <div className="text-muted-foreground">Loading profile...</div>;

  return (
    <div>
      <h2 className="text-h3 text-foreground mb-4">Profile</h2>
      <form onSubmit={(e) => { e.preventDefault(); updateProfile.mutate(); }} className="bg-card rounded-card shadow-card p-6 space-y-4 max-w-lg">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
          <input value={user?.email || ""} readOnly className={`${inputClass} bg-muted cursor-not-allowed`} />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Company Name</label>
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Company Type</label>
          <select value={companyType} onChange={(e) => setCompanyType(e.target.value)} className={inputClass}>
            <option value="">Select type...</option>
            {companyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button type="submit" disabled={updateProfile.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-8 rounded-button transition flex items-center gap-2 disabled:opacity-60">
          {updateProfile.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
        </button>
      </form>
    </div>
  );
};

export default AccountProfile;
