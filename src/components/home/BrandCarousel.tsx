import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const BrandCarousel = () => {
  const { data: brands } = useQuery({
    queryKey: ["featured-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("name, slug, logo_url")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const displayBrands = brands || [];
  if (displayBrands.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-card">
      <div className="container mx-auto px-4 text-center mb-8">
        <h2 className="text-h2 text-foreground">Trusted by the World's Best Brands</h2>
        <p className="text-sm text-ikon-text-secondary mt-2">Authorized distributor of 160+ premium international brands</p>
      </div>
      <div className="overflow-hidden">
        <div className="flex animate-scroll-x">
          {[...displayBrands, ...displayBrands].map((brand, i) => (
            <Link
              key={`${brand.slug}-${i}`}
              to={`/brand/${brand.slug}`}
              className="flex-shrink-0 px-8 py-4 mx-2 bg-ikon-bg-secondary rounded-lg flex items-center justify-center min-w-[180px] hover:shadow-card transition"
            >
              {brand.logo_url ? (
                <img src={brand.logo_url} alt={brand.name} className="h-8 object-contain" />
              ) : (
                <span className="text-sm font-bold text-primary tracking-wide whitespace-nowrap">{brand.name}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandCarousel;
