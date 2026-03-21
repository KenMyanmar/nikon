import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UtensilsCrossed, Settings, ChefHat, SprayCan, Bed,
  Wine, Wrench, Coffee, ConciergeBell, Shirt,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Tableware": UtensilsCrossed,
  "Spare Parts": Settings,
  "Kitchen Utensils": ChefHat,
  "Housekeeping Supplies": SprayCan,
  "Bedroom Supplies": Bed,
  "F & B Solutions": Wine,
  "Kitchen Services": Wrench,
  "Food Services": Coffee,
  "Buffet & Banquet": ConciergeBell,
  "Laundry Solutions": Shirt,
};

const SHORT_NAMES: Record<string, string> = {
  "Housekeeping Supplies": "Housekeeping",
  "Laundry Solutions": "Laundry",
  "F & B Solutions": "F&B",
  "Bedroom Supplies": "Bedroom",
  "Buffet & Banquet": "Buffet",
  "Kitchen Services": "Kitchen Svc",
  "Food Services": "Food Svc",
  "Kitchen Utensils": "Utensils",
  "Spare Parts": "Parts",
};

const CategoryQuickNav = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories-quicknav"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, product_count")
        .eq("depth", 0)
        .eq("is_active", true)
        .order("product_count", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-5 gap-2 md:gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-2 md:p-3 rounded-lg border border-border bg-card">
              <Skeleton className="w-5 h-5 md:w-6 md:h-6 rounded-full" />
              <Skeleton className="h-3 w-12 mt-1" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-4">
      <div className="grid grid-cols-5 gap-2 md:gap-3">
        {categories.slice(0, 10).map((cat) => {
          const Icon = CATEGORY_ICONS[cat.name] || UtensilsCrossed;
          const shortName = SHORT_NAMES[cat.name] || cat.name;
          return (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="flex flex-col items-center justify-center p-2 md:p-3 rounded-lg border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all group"
            >
              <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-[10px] md:text-xs font-medium text-foreground mt-1 text-center leading-tight truncate w-full">
                {shortName}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryQuickNav;
