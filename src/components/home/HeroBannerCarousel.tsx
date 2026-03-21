import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const HeroBannerCarousel = () => {
  const [current, setCurrent] = useState(0);

  const { data: banners = [] } = useQuery({
    queryKey: ["banners-hero"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .eq("position", "hero")
        .order("sort_order");
      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000,
  });

  const next = useCallback(() => {
    if (banners.length > 0) setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next, banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[current];
  const Wrapper = banner.link_url ? Link : "div";
  const wrapperProps = banner.link_url ? { to: banner.link_url } : {};

  return (
  <section className="container mx-auto px-4 pt-2">
    <div className="relative w-full h-[160px] md:h-[250px] overflow-hidden rounded-lg">
      <Wrapper {...(wrapperProps as any)} className="block relative w-full h-full">
        <img
          src={banner.image_url}
          alt={banner.title || "Banner"}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        {(banner.title || banner.subtitle) && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
            <div className="container mx-auto px-6 md:px-12">
              {banner.title && (
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 max-w-lg">
                  {banner.title}
                </h2>
              )}
              {banner.subtitle && (
                <p className="text-sm md:text-lg text-white/90 max-w-md">
                  {banner.subtitle}
                </p>
              )}
            </div>
          </div>
        )}
      </Wrapper>

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === current ? "bg-white scale-110" : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
    </section>
  );
};

export default HeroBannerCarousel;
