import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChefHat } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturedCategories = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["featured-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("name, slug, product_count, image_url")
        .eq("is_active", true)
        .eq("depth", 0)
        .order("sort_order")
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-h2 text-foreground">Shop by Category</h2>
          <p className="text-sm text-ikon-text-secondary mt-2">Browse our comprehensive product catalog</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-card" />
              ))
            : categories?.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className="bg-card rounded-card shadow-card hover:shadow-card-hover transition-all p-6 text-center group"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-ikon-navy-50 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-primary">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <ChefHat className="w-8 h-8" />
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground text-sm md:text-base">{cat.name}</h3>
                  <span className="inline-block mt-2 text-xs font-semibold text-accent">
                    {cat.product_count}+ products
                  </span>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
