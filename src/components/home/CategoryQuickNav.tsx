import { Link } from "react-router-dom";
import {
  UtensilsCrossed, Settings, ChefHat, SprayCan, Bed,
  Coffee, Flame, Soup, Armchair, WashingMachine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Category Rail (Prompt 2 — Path A: neutral icon tiles)
 *
 * Design Contract compliance:
 *   - Tile: bg-card, 1px border, 8px radius, no resting shadow
 *   - Icon chip: 48×48, bg-muted, 8px radius
 *   - Icon: Lucide line, 24px, text-primary, strokeWidth 1.75
 *   - Hover: border primary/30, chip primary/10
 *   - Focus-visible: hover state + 2px navy outline at offset 2
 *   - No per-tile accent colors, no pastels, no badges, no emoji
 */

interface CategoryConfig {
  icon: LucideIcon;
  name: string;
  slug: string;
}

const categoryConfig: Record<string, CategoryConfig> = {
  TWD: { icon: UtensilsCrossed, name: "Tableware", slug: "tableware" },
  SPS: { icon: Settings, name: "Spare Parts", slug: "spare-parts" },
  KUT: { icon: ChefHat, name: "Kitchen Utensils", slug: "kitchen-utensils" },
  HKG: { icon: SprayCan, name: "Housekeeping", slug: "housekeeping-supplies" },
  ABL: { icon: Bed, name: "Bedroom", slug: "bedroom-supplies" },
  FBS: { icon: Coffee, name: "Food & Beverage", slug: "f-and-b-solutions" },
  KSR: { icon: Flame, name: "Kitchen Services", slug: "kitchen-services" },
  FSR: { icon: Soup, name: "Food Services", slug: "food-services" },
  BQE: { icon: Armchair, name: "Buffet & Banquet", slug: "buffet-and-banquet" },
  LPR: { icon: WashingMachine, name: "Laundry", slug: "laundry-solutions" },
};

const CategoryQuickNav = () => {
  const { data: groups = [], isLoading: loadingGroups } = useQuery({
    queryKey: ["product-groups-nav"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_groups")
        .select("id, code, name, sort_order")
        .neq("code", "MKM")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: parentCategories = [], isLoading: loadingCats } = useQuery({
    queryKey: ["parent-categories-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("name, slug, product_count")
        .eq("depth", 0)
        .eq("is_active", true);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = loadingGroups || loadingCats;

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-10">
        <div className="h-7 w-48 mb-6">
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  const countBySlug = new Map(
    parentCategories.map((c) => [c.slug, c.product_count ?? 0])
  );

  const cards = groups
    .map((g) => {
      const config = categoryConfig[g.code];
      if (!config) return null;
      return {
        config,
        count: countBySlug.get(config.slug) ?? 0,
      };
    })
    .filter((c): c is { config: CategoryConfig; count: number } => c !== null)
    .sort((a, b) => a.config.name.localeCompare(b.config.name));

  if (cards.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-6">
        Shop by category
      </h2>

      {/* Desktop / Tablet flat grid */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(({ config, count }) => (
          <CategoryCard key={config.slug} config={config} count={count} />
        ))}
      </div>

      {/* Mobile horizontal snap-scroll */}
      <div className="flex md:hidden gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 no-scrollbar">
        {cards.map(({ config, count }) => (
          <CategoryCard key={config.slug} config={config} count={count} mobile />
        ))}
      </div>
    </section>
  );
};

const CategoryCard = ({
  config,
  count,
  mobile,
}: {
  config: CategoryConfig;
  count: number;
  mobile?: boolean;
}) => {
  const Icon = config.icon;

  return (
    <Link
      to={`/category/${config.slug}`}
      className={[
        "group flex items-center h-24 rounded-lg p-4 bg-card border border-border",
        "transition-colors duration-200",
        "hover:border-primary/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary/30",
        mobile ? "min-w-[200px] snap-start flex-shrink-0" : "",
      ].join(" ")}
    >
      <div
        className={[
          "flex items-center justify-center w-12 h-12 rounded-lg flex-shrink-0 bg-muted",
          "transition-colors duration-200",
          "group-hover:bg-primary/10 group-focus-visible:bg-primary/10",
        ].join(" ")}
      >
        <Icon size={24} strokeWidth={1.75} className="text-primary" />
      </div>
      <div className="ml-4 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{config.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {count.toLocaleString()} items
        </p>
      </div>
    </Link>
  );
};

export default CategoryQuickNav;
