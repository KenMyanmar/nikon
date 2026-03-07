import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

const AllBrandsPage = () => {
  const { data: brands, isLoading } = useQuery({
    queryKey: ["all-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("is_active", true)
        .gt("product_count", 0)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Group by first letter
  const grouped: Record<string, typeof brands> = {};
  (brands || []).forEach((b) => {
    const letter = b.name.charAt(0).toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter]!.push(b);
  });
  const letters = Object.keys(grouped).sort();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Brands</span>
        </nav>

        <h1 className="text-3xl font-bold text-primary mb-6">All Brands</h1>

        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-10 w-full rounded-lg" />
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-7 w-12 mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-20 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Letter nav */}
            <div className="flex flex-wrap gap-1 mb-8 p-3 bg-muted rounded-lg">
              {letters.map((letter) => (
                <a
                  key={letter}
                  href={`#brand-${letter}`}
                  className="w-8 h-8 flex items-center justify-center rounded text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {letter}
                </a>
              ))}
            </div>

            <div className="space-y-10">
              {letters.map((letter) => (
                <section key={letter} id={`brand-${letter}`}>
                  <h2 className="text-2xl font-bold text-primary mb-4">{letter}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {grouped[letter]!.map((brand) => (
                      <Link
                        key={brand.id}
                        to={`/brand/${brand.slug}`}
                        className="group p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-md transition-all"
                      >
                        {brand.logo_url ? (
                          <img
                            src={brand.logo_url}
                            alt={brand.name}
                            className="h-10 object-contain mb-2"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center mb-2 text-primary font-bold text-lg">
                            {brand.name.charAt(0)}
                          </div>
                        )}
                        <p className="font-medium text-foreground group-hover:text-primary truncate">
                          {brand.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {brand.product_count} products
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default AllBrandsPage;
