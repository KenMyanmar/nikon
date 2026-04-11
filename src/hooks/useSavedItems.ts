import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";

/**
 * Returns a Set<string> of product IDs saved by the current user.
 */
export const useSavedProductIds = () => {
  const { user } = useAuthContext();

  const { data: savedIds = new Set<string>(), isLoading } = useQuery({
    queryKey: ["saved-items", user?.id],
    queryFn: async () => {
      // Get customer ID
      const { data: customerId } = await supabase.rpc("get_customer_id_for_user", { _user_id: user!.id });
      if (!customerId) return new Set<string>();

      // Get all saved product IDs across all lists
      const { data, error } = await supabase
        .from("saved_list_items")
        .select("product_id, saved_lists!inner(customer_id)")
        .eq("saved_lists.customer_id", customerId);

      if (error) return new Set<string>();
      return new Set((data || []).map((item: any) => item.product_id as string));
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  return { savedIds, isLoading };
};

/**
 * Toggle save/unsave for a product. Handles auth, default list creation, and optimistic UI.
 */
export const useToggleSave = () => {
  const { user, openAuthModal } = useAuthContext();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ productId, isSaved }: { productId: string; isSaved: boolean }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: customerId } = await supabase.rpc("get_customer_id_for_user", { _user_id: user.id });
      if (!customerId) throw new Error("Customer not found");

      if (isSaved) {
        // Remove from all lists
        const { data: lists } = await supabase
          .from("saved_lists")
          .select("id")
          .eq("customer_id", customerId);

        if (lists?.length) {
          const listIds = lists.map((l) => l.id);
          await supabase
            .from("saved_list_items")
            .delete()
            .in("list_id", listIds)
            .eq("product_id", productId);
        }
        return { action: "removed" as const };
      } else {
        // Find or create default list
        let { data: defaultList } = await supabase
          .from("saved_lists")
          .select("id")
          .eq("customer_id", customerId)
          .eq("is_default", true)
          .maybeSingle();

        if (!defaultList) {
          const { data: created, error: createErr } = await supabase
            .from("saved_lists")
            .insert({ customer_id: customerId, name: "Saved Items", is_default: true })
            .select("id")
            .single();
          if (createErr) throw createErr;
          defaultList = created;
        }

        // Insert (ignore conflict)
        const { error } = await supabase
          .from("saved_list_items")
          .insert({ list_id: defaultList!.id, product_id: productId });

        // Ignore unique constraint violation
        if (error && !error.message.includes("duplicate")) throw error;
        return { action: "saved" as const };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["saved-items"] });
      queryClient.invalidateQueries({ queryKey: ["saved-lists"] });
      if (result.action === "saved") {
        toast.success("Saved to Saved Items");
      } else {
        toast("Removed from Saved Items");
      }
    },
    onError: () => {
      toast.error("Failed to save. Please try again.");
    },
  });

  const toggleSave = (productId: string, isSaved: boolean) => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (mutation.isPending) return;
    mutation.mutate({ productId, isSaved });
  };

  return { toggleSave, isPending: mutation.isPending };
};
