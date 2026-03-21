import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";

const TopBrandsShowcase = () => {
  const { data: brands = [] } = useQuery({
    queryKey: ["top-brands-homepage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name, slug, logo_url, product_count, is_featured")
        .eq("is_active", true)
        .gt("product_count", 0)
        .order("product_count", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (brands.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold text-foreground">Top Brands</h2>
        <Link
          to="/brands"
          className="flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            to={`/brand/${brand.slug}`}
            className="flex-shrink-0 w-[120px] md:w-[140px] flex flex-col items-center p-3 rounded-lg border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all"
          >
            {brand.logo_url ? (
              <img
                src={brand.logo_url}
                alt={brand.name}
                className="w-12 h-12 object-contain rounded"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                {brand.name.charAt(0)}
              </div>
            )}
            <span className="text-xs font-medium text-foreground mt-2 text-center truncate w-full">
              {brand.name}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {brand.product_count} products
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TopBrandsShowcase;
