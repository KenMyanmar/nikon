import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "../ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

const NewArrivals = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["new-arrivals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products_public")
        .select("id, slug, description, short_description, brand_name, selling_price, currency, stock_status, stock_code, moq, onhand_qty, thumbnail_url")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-h2 text-foreground">New Arrivals</h2>
          <Link to="/search?q=" className="text-sm font-semibold text-primary hover:text-accent transition flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="min-w-[220px] md:min-w-[260px] flex-shrink-0">
                  <Skeleton className="h-80 rounded-card" />
                </div>
              ))
            : products?.map((p) => (
                <div key={p.id} className="min-w-[220px] md:min-w-[260px] flex-shrink-0">
                  <ProductCard
                    id={p.id || ""}
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
    </section>
  );
};

export default NewArrivals;
