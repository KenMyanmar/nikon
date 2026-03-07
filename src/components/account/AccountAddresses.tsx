import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, MapPin, Star } from "lucide-react";

interface AddressForm {
  label: string;
  address_line: string;
  township: string;
  city: string;
  region: string;
  contact_phone: string;
  delivery_notes: string;
}

const emptyForm: AddressForm = { label: "", address_line: "", township: "", city: "", region: "", contact_phone: "", delivery_notes: "" };

const AccountAddresses = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(emptyForm);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("customer_addresses").select("*").order("is_default", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const customerId = (await supabase.rpc("get_customer_id_for_user", { _user_id: user!.id })).data;
      if (!customerId) throw new Error("Customer not found");
      if (editingId) {
        const { error } = await supabase.from("customer_addresses").update({ ...form }).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("customer_addresses").insert({ ...form, customer_id: customerId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      toast({ title: editingId ? "Address updated" : "Address added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customer_addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast({ title: "Address deleted" });
    },
  });

  const setDefault = useMutation({
    mutationFn: async (id: string) => {
      const customerId = (await supabase.rpc("get_customer_id_for_user", { _user_id: user!.id })).data;
      if (!customerId) throw new Error("Customer not found");
      await supabase.from("customer_addresses").update({ is_default: false }).eq("customer_id", customerId);
      const { error } = await supabase.from("customer_addresses").update({ is_default: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast({ title: "Default address updated" });
    },
  });

  const inputClass = "w-full px-3 py-2 rounded-button border border-input bg-card text-foreground text-sm focus:border-primary outline-none";

  if (isLoading) return <div className="text-muted-foreground">Loading addresses...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h3 text-foreground">Addresses</h2>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-button text-sm font-semibold hover:bg-primary/90 transition flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Address
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="bg-card rounded-card shadow-card p-4 space-y-3 mb-6">
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-foreground mb-1 block">Label</label><input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className={inputClass} placeholder="Home / Office" /></div>
            <div><label className="text-xs font-medium text-foreground mb-1 block">Contact Phone</label><input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className={inputClass} /></div>
          </div>
          <div><label className="text-xs font-medium text-foreground mb-1 block">Address Line *</label><input required value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} className={inputClass} /></div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div><label className="text-xs font-medium text-foreground mb-1 block">Township</label><input value={form.township} onChange={(e) => setForm({ ...form, township: e.target.value })} className={inputClass} /></div>
            <div><label className="text-xs font-medium text-foreground mb-1 block">City</label><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} /></div>
            <div><label className="text-xs font-medium text-foreground mb-1 block">Region</label><input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className={inputClass} /></div>
          </div>
          <div><label className="text-xs font-medium text-foreground mb-1 block">Delivery Notes</label><textarea value={form.delivery_notes} onChange={(e) => setForm({ ...form, delivery_notes: e.target.value })} className={inputClass} rows={2} /></div>
          <div className="flex gap-2">
            <button type="submit" disabled={saveMutation.isPending} className="bg-primary text-primary-foreground px-6 py-2 rounded-button text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50">{editingId ? "Update" : "Save"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </form>
      )}

      {!addresses?.length && !showForm ? (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-foreground font-semibold">No addresses yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses?.map((addr) => (
            <div key={addr.id} className="bg-card rounded-card shadow-card p-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-foreground">{addr.label || "Address"}</p>
                  {addr.is_default && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Default</span>}
                </div>
                <p className="text-sm text-muted-foreground">{addr.address_line}</p>
                <p className="text-xs text-muted-foreground">{[addr.township, addr.city, addr.region].filter(Boolean).join(", ")}</p>
                {addr.contact_phone && <p className="text-xs text-muted-foreground mt-1">📞 {addr.contact_phone}</p>}
              </div>
              <div className="flex items-center gap-1">
                {!addr.is_default && (
                  <button onClick={() => setDefault.mutate(addr.id)} className="p-2 text-muted-foreground hover:text-primary transition" title="Set as default">
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => { setEditingId(addr.id); setForm({ label: addr.label || "", address_line: addr.address_line, township: addr.township || "", city: addr.city || "", region: addr.region || "", contact_phone: addr.contact_phone || "", delivery_notes: addr.delivery_notes || "" }); setShowForm(true); }} className="p-2 text-muted-foreground hover:text-foreground transition">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteMutation.mutate(addr.id)} className="p-2 text-muted-foreground hover:text-destructive transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountAddresses;
