import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Heart, X, ImageOff } from "lucide-react";
import { Link } from "react-router-dom";

const AccountSavedLists = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [newListName, setNewListName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [expandedList, setExpandedList] = useState<string | null>(null);

  const { data: lists, isLoading } = useQuery({
    queryKey: ["saved-lists", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_lists")
        .select("*, saved_list_items(id, product_id, products:product_id(id, slug, description, selling_price, currency, thumbnail_url, images, stock_status))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createList = useMutation({
    mutationFn: async (name: string) => {
      const { data: customerId } = await supabase.rpc("get_customer_id_for_user", { _user_id: user!.id });
      if (!customerId) throw new Error("Customer not found");
      const { error } = await supabase.from("saved_lists").insert({ customer_id: customerId, name });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-lists"] });
      setNewListName("");
      toast.success("List created");
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
      toast.success("List renamed");
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
      toast.success("List deleted");
    },
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from("saved_list_items").delete().eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-lists"] });
      queryClient.invalidateQueries({ queryKey: ["saved-items"] });
      toast("Removed from list");
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
        <div className="space-y-4">
          {lists.map((list) => {
            const items = (list as any).saved_list_items || [];
            const isExpanded = expandedList === list.id;

            return (
              <div key={list.id} className="bg-card rounded-card shadow-card overflow-hidden">
                {/* List header */}
                <div className="p-4 flex items-center justify-between">
                  {editingId === list.id ? (
                    <form onSubmit={(e) => { e.preventDefault(); renameList.mutate({ id: list.id, name: editName }); }} className="flex gap-2 flex-1">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 px-3 py-1.5 rounded-button border border-input bg-card text-foreground text-sm outline-none" autoFocus />
                      <button type="submit" className="text-sm text-primary font-semibold">Save</button>
                      <button type="button" onClick={() => setEditingId(null)} className="text-sm text-muted-foreground">Cancel</button>
                    </form>
                  ) : (
                    <>
                      <button onClick={() => setExpandedList(isExpanded ? null : list.id)} className="text-left flex-1">
                        <p className="font-semibold text-foreground">{list.name}</p>
                        <p className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                      </button>
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

                {/* Expanded product grid */}
                {isExpanded && items.length > 0 && (
                  <div className="border-t border-border p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {items.map((item: any) => {
                        const product = item.products;
                        if (!product) return null;
                        const thumb = product.thumbnail_url || (Array.isArray(product.images) && product.images[0]) || null;

                        return (
                          <div key={item.id} className="relative group bg-muted/30 rounded-lg border border-border overflow-hidden">
                            <button
                              onClick={() => removeItem.mutate(item.id)}
                              className="absolute top-1.5 right-1.5 p-1 bg-card/90 rounded-full text-muted-foreground hover:text-destructive transition z-10 opacity-0 group-hover:opacity-100"
                              title="Remove"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <Link to={`/product/${product.slug}`} className="block">
                              <div className="aspect-square bg-background flex items-center justify-center p-2">
                                {thumb ? (
                                  <img src={thumb} alt={product.description} className="max-w-full max-h-full object-contain" />
                                ) : (
                                  <ImageOff className="w-8 h-8 text-muted-foreground/40" />
                                )}
                              </div>
                              <div className="p-2">
                                <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight">{product.description}</p>
                                {product.selling_price ? (
                                  <p className="text-sm font-bold text-accent mt-1">
                                    {product.currency || "MMK"} {Number(product.selling_price).toLocaleString()}
                                  </p>
                                ) : (
                                  <p className="text-xs text-primary font-semibold mt-1">Request Quote</p>
                                )}
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {isExpanded && items.length === 0 && (
                  <div className="border-t border-border p-6 text-center text-sm text-muted-foreground">
                    No items in this list yet.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AccountSavedLists;
