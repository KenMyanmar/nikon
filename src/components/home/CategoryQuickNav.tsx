import { Link } from "react-router-dom";
import {
  UtensilsCrossed, Settings, ChefHat, SprayCan, Bed,
  Coffee, Flame, Soup, Armchair, WashingMachine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryConfig {
  color: string;
  icon: LucideIcon;
  name: string;
  slug: string;
}

const categoryConfig: Record<string, CategoryConfig> = {
  TWD: { color: "#6366F1", icon: UtensilsCrossed, name: "Tableware", slug: "tableware" },
  SPS: { color: "#8B5CF6", icon: Settings, name: "Spare Parts", slug: "spare-parts" },
  KUT: { color: "#EC4899", icon: ChefHat, name: "Kitchen Utensils", slug: "kitchen-utensils" },
  HKG: { color: "#14B8A6", icon: SprayCan, name: "Housekeeping", slug: "housekeeping-supplies" },
  ABL: { color: "#F59E0B", icon: Bed, name: "Bedroom", slug: "bedroom-supplies" },
  FBS: { color: "#EF4444", icon: Coffee, name: "F&B Solutions", slug: "f-and-b-solutions" },
  KSR: { color: "#F97316", icon: Flame, name: "Kitchen Services", slug: "kitchen-services" },
  FSR: { color: "#10B981", icon: Soup, name: "Food Services", slug: "food-services" },
  BQE: { color: "#3B82F6", icon: Armchair, name: "Buffet & Banquet", slug: "buffet-and-banquet" },
  LPR: { color: "#06B6D4", icon: WashingMachine, name: "Laundry", slug: "laundry-solutions" },
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
    staleTime: 10 * 60 * 1000,
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
    staleTime: 10 * 60 * 1000,
  });

  const isLoading = loadingGroups || loadingCats;

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-[14px]" />
          ))}
        </div>
      </section>
    );
  }

  // Match parent category by slug for fresh product_count
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
    <section className="container mx-auto px-4 py-6">
      {/* Desktop / Tablet grid */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(({ config, count }) => (
          <CategoryCard key={config.slug} config={config} count={count} />
        ))}
      </div>

      {/* Mobile horizontal scroll */}
      <div className="flex md:hidden gap-3 overflow-x-auto scroll-snap-x-mandatory pb-2 no-scrollbar">
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
  const bg6 = `${config.color}0F`;   // 6% opacity
  const bg15 = `${config.color}26`;  // 15% opacity
  const bg40 = `${config.color}66`;  // 40% opacity

  return (
    <Link
      to={`/category/${config.slug}`}
      className={`
        flex items-center h-28 rounded-[14px] p-5 border transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-md group
        ${mobile ? "min-w-[200px] snap-start flex-shrink-0" : ""}
      `}
      style={{
        backgroundColor: bg6,
        borderColor: bg15,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget.style.borderColor = bg40);
      }}
      onMouseLeave={(e) => {
        (e.currentTarget.style.borderColor = bg15);
      }}
    >
      <div
        className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0"
        style={{ backgroundColor: bg15 }}
      >
        <Icon size={24} style={{ color: config.color }} />
      </div>
      <div className="ml-4 min-w-0">
        <p className="font-semibold text-sm text-foreground line-clamp-1">{config.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{count.toLocaleString()} items</p>
      </div>
    </Link>
  );
};

export default CategoryQuickNav;
