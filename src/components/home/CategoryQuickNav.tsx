import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Category Rail — photographic tiles.
 *
 * Data: parent categories (depth=0, is_active=true), ordered by sort_order ASC.
 * Each tile uses categories.image_url as a full-bleed background with a
 * gradient scrim, the full category name and product count.
 *
 * Design Contract: 1px border, 8px radius (rounded-xl), no resting shadow.
 * Hover scale on the image is interaction feedback (allowed), not ambient
 * decorative motion.
 */

interface ParentCategory {
  name: string;
  slug: string;
  image_url: string | null;
  product_count: number | null;
}

const CategoryQuickNav = () => {
  const { data: categories = [], isLoading } = useQuery<ParentCategory[]>({
    queryKey: ["parent-categories-rail"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("name, slug, image_url, product_count")
        .eq("depth", 0)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as ParentCategory[];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-10">
        <Skeleton className="h-7 w-48 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-6">
        Shop by category
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <CategoryTile key={cat.slug} category={cat} />
        ))}
      </div>
    </section>
  );
};

const CategoryTile = ({ category }: { category: ParentCategory }) => {
  const count = category.product_count ?? 0;

  return (
    <Link
      to={`/category/${category.slug}`}
      className="group relative block overflow-hidden rounded-xl aspect-[4/3] border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {category.image_url ? (
        <>
          <img
            src={category.image_url}
            alt={category.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-lg font-semibold text-white leading-tight">
              {category.name}
            </p>
            <p className="text-sm text-white/80 mt-0.5">
              {count.toLocaleString()} items
            </p>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <p className="text-lg font-semibold text-foreground leading-tight">
            {category.name}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {count.toLocaleString()} items
          </p>
        </div>
      )}
    </Link>
  );
};

export default CategoryQuickNav;
