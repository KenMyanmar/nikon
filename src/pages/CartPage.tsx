import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "@/hooks/use-toast";
import { Minus, Plus, Trash2, ShoppingCart, LogIn } from "lucide-react";

const CartPage = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: customerId } = useQuery({
    queryKey: ["customer-id", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_customer_id_for_user", {
        _user_id: user!.id,
      });
      if (error) throw error;
      return data as string;
    },
    enabled: !!user,
  });

  const { data: cartItems = [], isLoading: cartLoading } = useQuery({
    queryKey: ["cart", customerId],
    queryFn: async () => {
      const { data: items, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("customer_id", customerId!);
      if (error) throw error;

      if (!items || items.length === 0) return [];

      const productIds = items.map((i) => i.product_id);
      const { data: products, error: pErr } = await supabase
        .from("products_public")
        .select("*")
        .in("id", productIds);
      if (pErr) throw pErr;

      const productMap = new Map(products?.map((p) => [p.id, p]) || []);

      return items.map((item) => ({
        ...item,
        product: productMap.get(item.product_id) || null,
      }));
    },
    enabled: !!customerId,
  });

  const updateQty = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart", customerId] });
      const prev = queryClient.getQueryData(["cart", customerId]);
      queryClient.setQueryData(["cart", customerId], (old: typeof cartItems) =>
        old?.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(["cart", customerId], ctx?.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["cart", customerId] }),
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cart_items").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["cart", customerId] });
      const prev = queryClient.getQueryData(["cart", customerId]);
      queryClient.setQueryData(["cart", customerId], (old: typeof cartItems) =>
        old?.filter((item) => item.id !== id)
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(["cart", customerId], ctx?.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["cart", customerId] }),
  });

  const { subtotal, hasUnpricedItems } = useMemo(() => {
    let total = 0;
    let unpriced = false;
    cartItems.forEach((item) => {
      const price = Number(item.product?.selling_price) || 0;
      if (price === 0) unpriced = true;
      total += price * item.quantity;
    });
    return { subtotal: total, hasUnpricedItems: unpriced };
  }, [cartItems]);

  if (authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-pulse h-8 w-48 bg-muted rounded mx-auto" />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-h2 text-foreground mb-2">Sign in to view your cart</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to manage your cart</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-button font-semibold hover:bg-primary/90 transition"
          >
            <LogIn className="w-4 h-4" /> Sign In
          </Link>
        </div>
      </MainLayout>
    );
  }

  if (cartLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-card" />)}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-h2 text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Start adding products to your cart</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-button font-semibold hover:bg-primary/90 transition"
          >
            Browse Products
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-h1 text-foreground mb-6">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {cartItems.map((item) => {
              const product = item.product;
              if (!product) return null;

              const price = Number(product.selling_price) || 0;
              const moq = product.moq || 1;
              const maxQty = product.onhand_qty || 9999;
              const lineTotal = price * item.quantity;
              const brandInitial = product.brand_name?.charAt(0) || "?";

              return (
                <div key={item.id} className="bg-card rounded-card shadow-card p-4 flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded bg-muted/30 overflow-hidden shrink-0">
                    {product.thumbnail_url ? (
                      <img src={product.thumbnail_url} alt={product.description || ""} className="w-full h-full object-contain p-1" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <span className="text-2xl font-bold text-primary">{brandInitial}</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.brand_name}</p>
                    <p className="text-sm font-semibold text-foreground line-clamp-2">{product.description}</p>

                    <div className="flex items-center gap-4 mt-3">
                      {/* Qty Selector */}
                      <div className="flex items-center border border-ikon-border rounded-button">
                        <button
                          onClick={() => updateQty.mutate({ id: item.id, quantity: Math.max(moq, item.quantity - 1) })}
                          className="p-1.5 hover:bg-muted transition"
                          disabled={item.quantity <= moq}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 text-sm font-medium min-w-[2rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty.mutate({ id: item.id, quantity: Math.min(maxQty, item.quantity + 1) })}
                          className="p-1.5 hover:bg-muted transition"
                          disabled={item.quantity >= maxQty}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Unit Price */}
                      <div className="text-sm">
                        {price > 0 ? (
                          <span className="text-foreground font-medium">{product.currency || "MMK"} {price.toLocaleString()}</span>
                        ) : (
                          <span className="text-primary font-medium">Quote</span>
                        )}
                      </div>

                      {/* Line Total */}
                      {price > 0 && (
                        <div className="text-sm font-bold text-accent ml-auto hidden sm:block">
                          {product.currency || "MMK"} {lineTotal.toLocaleString()}
                        </div>
                      )}

                      {/* Remove */}
                      <button
                        onClick={() => removeItem.mutate(item.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition ml-auto sm:ml-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-card rounded-card shadow-card p-6 sticky top-28">
              <h2 className="text-h4 text-foreground mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">MMK {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-ikon-text-secondary text-xs">Contact for quote</span>
                </div>
                <div className="border-t border-ikon-border pt-3 flex justify-between">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-bold text-foreground text-lg">MMK {subtotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {hasUnpricedItems && (
                  <button className="w-full bg-primary text-primary-foreground py-3 rounded-button font-semibold hover:bg-primary/90 transition">
                    Request Quote
                  </button>
                )}
                <button className="w-full bg-accent text-accent-foreground py-3 rounded-button font-semibold hover:bg-accent/90 transition">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CartPage;
