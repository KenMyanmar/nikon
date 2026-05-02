import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shop by Business Type — DB-driven navigation aid.
 *
 * Reads from the `business_types` table (managed by staff via CRM).
 * Returns null when there are no active rows so we don't render an empty
 * heading. Visuals match the original hardcoded version exactly.
 */

interface BusinessType {
  id: string;
  label: string;
  image_url: string | null;
  link_url: string;
  sort_order: number;
}

const useBusinessTypes = () => {
  return useQuery({
    queryKey: ["business-types"],
    queryFn: async (): Promise<BusinessType[]> => {
      const { data, error } = await supabase
        .from("business_types")
        .select("id, label, image_url, link_url, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BusinessType[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

const SectionHeading = () => (
  <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-6">
    Shop by Business Type
  </h2>
);

const GRID_CLASSES = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4";

const BusinessTypeCard = ({ biz }: { biz: BusinessType }) => {
  const isExternal = /^https?:\/\//i.test(biz.link_url);
  const cardClasses =
    "group relative block overflow-hidden rounded-xl aspect-[3/2] border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

  const inner = (
    <>
      {biz.image_url && (
        <img
          src={biz.image_url}
          alt={biz.label}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl md:text-2xl font-bold text-white drop-shadow-md">
          {biz.label}
        </span>
      </div>
    </>
  );

  if (isExternal) {
    return (
      <a
        href={biz.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClasses}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link to={biz.link_url} className={cardClasses}>
      {inner}
    </Link>
  );
};

const ShopByBusinessType = () => {
  const { data, isLoading, error } = useBusinessTypes();

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-10">
        <SectionHeading />
        <div className={GRID_CLASSES}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/2] rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (error || !data || data.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-10">
      <SectionHeading />
      <div className={GRID_CLASSES}>
        {data.map((biz) => (
          <BusinessTypeCard key={biz.id} biz={biz} />
        ))}
      </div>
    </section>
  );
};

export default ShopByBusinessType;
