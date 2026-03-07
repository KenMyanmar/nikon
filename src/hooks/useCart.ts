import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const getCustomerId = async (userId: string): Promise<string | null> => {
  const { data } = await supabase.rpc("get_customer_id_for_user", { _user_id: userId });
  return data as string | null;
};

export const useCartCount = () => {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: ["cart-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const customerId = await getCustomerId(user.id);
      if (!customerId) return 0;
      const { count } = await supabase
        .from("cart_items")
        .select("*", { count: "exact", head: true })
        .eq("customer_id", customerId);
      return count || 0;
    },
    enabled: !!user,
  });
};

export const useAddToCart = () => {
  const { user, openAuthModal } = useAuthContext();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      if (!user) throw new Error("Not authenticated");
      const customerId = await getCustomerId(user.id);
      if (!customerId) throw new Error("Customer not found");

      // Check if product already in cart
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("customer_id", customerId)
        .eq("product_id", productId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_items")
          .insert({ customer_id: customerId, product_id: productId, quantity });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      queryClient.invalidateQueries({ queryKey: ["cart-items"] });
    },
  });

  const addToCart = (productId: string, quantity?: number, productName?: string) => {
    if (!user) {
      openAuthModal();
      return;
    }
    mutation.mutate(
      { productId, quantity },
      {
        onSuccess: () => {
          toast({ title: "Added to cart", description: productName || "Product added successfully" });
        },
        onError: (err) => {
          toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
        },
      }
    );
  };

  return { addToCart, isAdding: mutation.isPending };
};
