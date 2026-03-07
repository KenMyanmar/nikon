import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, ShoppingCart, FileText, Loader2 } from "lucide-react";
import { useAddToCart } from "@/hooks/useCart";

const stockConfig = {
  in_stock: { label: "In Stock", dotClass: "bg-emerald-500", textClass: "text-emerald-700", bgClass: "bg-emerald-50" },
  low_stock: { label: "Low Stock", dotClass: "bg-amber-500", textClass: "text-amber-700", bgClass: "bg-amber-50" },
  out_of_stock: { label: "Out of Stock", dotClass: "bg-red-500", textClass: "text-red-700", bgClass: "bg-red-50" },
};

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [qty, setQty] = useState(1);
  const { addToCart, isAdding } = useAddToCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products_public")
        .select("*")
        .eq("slug", slug!)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: related } = useQuery({
    queryKey: ["related-products", product?.category_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products_public")
        .select("id, slug, description, short_description, brand_name, selling_price, currency, stock_status, stock_code, moq, thumbnail_url")
        .eq("is_active", true)
        .eq("category_id", product!.category_id!)
        .neq("id", product!.id!)
        .limit(6);
      if (error) throw error;
      return data;
    },
    enabled: !!product?.category_id && !!product?.id,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-card" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-1/3" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-h2 text-foreground">Product not found</h1>
        </div>
      </MainLayout>
    );
  }

  const stock = stockConfig[(product.stock_status as keyof typeof stockConfig) || "in_stock"];
  const specs = product.specifications && typeof product.specifications === "object" && !Array.isArray(product.specifications)
    ? Object.entries(product.specifications as Record<string, string>)
    : [];
  const moq = product.moq || 1;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Image */}
          <div className="bg-card rounded-card shadow-card p-8 flex items-center justify-center aspect-square">
            <img
              src={product.thumbnail_url || "/placeholder.svg"}
              alt={product.description || ""}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Details */}
          <div className="space-y-4">
            {product.brand_name && (
              <p className="text-sm font-semibold text-primary uppercase tracking-wide">{product.brand_name}</p>
            )}
            <h1 className="text-h2 text-foreground">{product.description}</h1>
            {product.short_description && (
              <p className="text-sm text-ikon-text-secondary">{product.short_description}</p>
            )}

            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${stock.textClass} ${stock.bgClass} px-3 py-1 rounded-full`}>
                <span className={`w-2 h-2 ${stock.dotClass} rounded-full`}></span>
                {stock.label}
              </span>
              <span className="text-sm text-ikon-text-tertiary">SKU: {product.stock_code}</span>
            </div>

            {/* Price */}
            <div className="pt-2">
              {product.selling_price ? (
                <span className="text-2xl font-bold text-accent">
                  {product.currency || "MMK"} {Number(product.selling_price).toLocaleString()}
                </span>
              ) : (
                <span className="text-lg font-semibold text-primary">Price on Request</span>
              )}
            </div>

            {/* Quantity + Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center border border-ikon-border rounded-md">
                <button onClick={() => setQty(Math.max(moq, qty - 1))} className="px-3 py-2 text-ikon-text-secondary hover:text-foreground">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm font-semibold text-foreground min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-ikon-text-secondary hover:text-foreground">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {moq > 1 && <span className="text-xs text-ikon-text-tertiary">MOQ: {moq}</span>}
            </div>

            <div className="flex gap-3 pt-2">
              <button className="flex-1 bg-accent hover:bg-ikon-red-dark text-accent-foreground font-semibold py-3 rounded-button transition flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
              <button className="flex-1 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold py-3 rounded-button transition flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" /> Request Quote
              </button>
            </div>

            {product.unit_of_measure && (
              <p className="text-xs text-ikon-text-tertiary">Unit: {product.unit_of_measure}</p>
            )}
          </div>
        </div>

        {/* Specifications */}
        {specs.length > 0 && (
          <div className="mb-16">
            <h2 className="text-h3 text-foreground mb-4">Specifications</h2>
            <div className="bg-card rounded-card shadow-card overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {specs.map(([key, val], i) => (
                    <tr key={key} className={i % 2 === 0 ? "bg-ikon-bg-secondary" : ""}>
                      <td className="px-4 py-3 font-medium text-foreground w-1/3">{key}</td>
                      <td className="px-4 py-3 text-ikon-text-secondary">{String(val)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Related Products */}
        {related && related.length > 0 && (
          <div>
            <h2 className="text-h3 text-foreground mb-6">Related Products</h2>
            <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4">
              {related.map((p) => (
                <div key={p.id} className="min-w-[220px] md:min-w-[260px] flex-shrink-0">
                  <ProductCard
                    image={p.thumbnail_url || "/placeholder.svg"}
                    title={p.description || ""}
                    brand={p.brand_name || ""}
                    specs={p.short_description || undefined}
                    price={p.selling_price ? Number(p.selling_price) : null}
                    currency={p.currency || "MMK"}
                    moq={p.moq || undefined}
                    stockStatus={(p.stock_status as "in_stock" | "low_stock" | "out_of_stock") || "in_stock"}
                    sku={p.stock_code || ""}
                    slug={p.slug || ""}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProductDetail;
