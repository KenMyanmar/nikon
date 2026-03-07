import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Heart } from "lucide-react";

const AccountSavedLists = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [newListName, setNewListName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const { data: lists, isLoading } = useQuery({
    queryKey: ["saved-lists", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_lists").select("*, saved_list_items(id, quantity, product_id)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createList = useMutation({
    mutationFn: async (name: string) => {
      const customerId = (await supabase.rpc("get_customer_id_for_user", { _user_id: user!.id })).data;
      if (!customerId) throw new Error("Customer not found");
      const { error } = await supabase.from("saved_lists").insert({ customer_id: customerId, name });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-lists"] });
      setNewListName("");
      toast({ title: "List created" });
    },
  });

  const renameList = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from("saved_lists").update({ name }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-lists"] });
      setEditingId(null);
      toast({ title: "List renamed" });
    },
  });

  const deleteList = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("saved_list_items").delete().eq("list_id", id);
      const { error } = await supabase.from("saved_lists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-lists"] });
      toast({ title: "List deleted" });
    },
  });

  if (isLoading) return <div className="text-muted-foreground">Loading lists...</div>;

  return (
    <div>
      <h2 className="text-h3 text-foreground mb-4">Saved Lists</h2>

      {/* Create new list */}
      <div className="flex gap-2 mb-6">
        <input
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="New list name..."
          className="flex-1 px-3 py-2 rounded-button border border-input bg-card text-foreground text-sm focus:border-primary outline-none"
        />
        <button
          onClick={() => newListName.trim() && createList.mutate(newListName.trim())}
          disabled={!newListName.trim()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-button text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create
        </button>
      </div>

      {!lists?.length ? (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-foreground font-semibold">No saved lists</p>
          <p className="text-sm text-muted-foreground">Create a list to save products for later.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <div key={list.id} className="bg-card rounded-card shadow-card p-4 flex items-center justify-between">
              {editingId === list.id ? (
                <form onSubmit={(e) => { e.preventDefault(); renameList.mutate({ id: list.id, name: editName }); }} className="flex gap-2 flex-1">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 px-3 py-1.5 rounded-button border border-input bg-card text-foreground text-sm outline-none" autoFocus />
                  <button type="submit" className="text-sm text-primary font-semibold">Save</button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-sm text-muted-foreground">Cancel</button>
                </form>
              ) : (
                <>
                  <div>
                    <p className="font-semibold text-foreground">{list.name}</p>
                    <p className="text-xs text-muted-foreground">{list.saved_list_items?.length || 0} items</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingId(list.id); setEditName(list.name); }} className="p-2 text-muted-foreground hover:text-foreground transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteList.mutate(list.id)} className="p-2 text-muted-foreground hover:text-destructive transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountSavedLists;
