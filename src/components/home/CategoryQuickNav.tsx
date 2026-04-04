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
  count: number;
}

const categoryConfig: Record<string, CategoryConfig> = {
  TWD: { color: "#6366F1", icon: UtensilsCrossed, name: "Tableware", slug: "tableware", count: 1006 },
  SPS: { color: "#8B5CF6", icon: Settings, name: "Spare Parts", slug: "spare-parts", count: 723 },
  KUT: { color: "#EC4899", icon: ChefHat, name: "Kitchen Utensils", slug: "kitchen-utensils", count: 453 },
  HKG: { color: "#14B8A6", icon: SprayCan, name: "Housekeeping", slug: "housekeeping-supplies", count: 410 },
  ABL: { color: "#F59E0B", icon: Bed, name: "Bedroom", slug: "bedroom-supplies", count: 219 },
  FBS: { color: "#EF4444", icon: Coffee, name: "F&B Solutions", slug: "f-b-solutions", count: 51 },
  KSR: { color: "#F97316", icon: Flame, name: "Kitchen Services", slug: "kitchen-services", count: 184 },
  FSR: { color: "#10B981", icon: Soup, name: "Food Services", slug: "food-services", count: 261 },
  BQE: { color: "#3B82F6", icon: Armchair, name: "Buffet & Banquet", slug: "buffet-banquet", count: 24 },
  LPR: { color: "#06B6D4", icon: WashingMachine, name: "Laundry", slug: "laundry-solutions", count: 12 },
};

const CategoryQuickNav = () => {
  const { data: groups = [], isLoading } = useQuery({
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

  const cards = groups
    .map((g) => ({ group: g, config: categoryConfig[g.code] }))
    .filter((c) => c.config);

  if (cards.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-6">
      {/* Desktop / Tablet grid */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(({ group, config }) => (
          <CategoryCard key={group.id} config={config} />
        ))}
      </div>

      {/* Mobile horizontal scroll */}
      <div className="flex md:hidden gap-3 overflow-x-auto scroll-snap-x-mandatory pb-2 no-scrollbar">
        {cards.map(({ group, config }) => (
          <CategoryCard key={group.id} config={config} mobile />
        ))}
      </div>
    </section>
  );
};

const CategoryCard = ({ config, mobile }: { config: CategoryConfig; mobile?: boolean }) => {
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
        <p className="text-xs text-muted-foreground mt-0.5">{config.count.toLocaleString()} items</p>
      </div>
    </Link>
  );
};

export default CategoryQuickNav;
