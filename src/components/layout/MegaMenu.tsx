import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProductGroup {
  id: string;
  name: string;
  code: string;
  sort_order: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  group_id: string | null;
  product_count: number;
}

// Shared hook for nav data
export const useNavData = () => {
  const { data: groups = [] } = useQuery({
    queryKey: ["product-groups-nav"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_groups")
        .select("id, name, code, sort_order")
        .order("sort_order");
      if (error) throw error;
      return data as ProductGroup[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories-nav"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, group_id, product_count")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return { groups, categories };
};

// Desktop mega dropdown content
const MegaMenuDropdown = ({
  group,
  categories,
}: {
  group: ProductGroup;
  categories: Category[];
}) => {
  const groupCategories = categories.filter((c) => c.group_id === group.id);

  return (
    <div className="absolute left-0 w-full bg-card shadow-xl border-t-2 border-primary z-50">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-8">
          {/* Categories */}
          <div className="col-span-2">
            <h3 className="text-xs uppercase tracking-wider font-bold text-primary mb-4">
              {group.name}
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {groupCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="flex items-center justify-between py-1.5 text-sm text-ikon-text-secondary hover:text-accent transition group/item"
                >
                  <span className="group-hover/item:translate-x-1 transition-transform">{cat.name}</span>
                  <span className="text-xs text-muted-foreground">{cat.product_count}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Promo */}
          <div className="bg-ikon-navy-50 rounded-card p-6">
            <h3 className="font-bold text-primary mb-2">Browse {group.name}</h3>
            <p className="text-sm text-ikon-text-secondary mb-4">
              {groupCategories.length} categories available
            </p>
            <Link
              to="/categories"
              className="text-sm font-semibold text-accent hover:underline"
            >
              View All Categories →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Desktop nav bar
export const DesktopMegaNav = () => {
  const { groups, categories } = useNavData();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  return (
    <nav className="hidden lg:block bg-primary relative">
      <div className="container mx-auto px-4 flex items-center">
        {groups.map((group) => (
          <div
            key={group.id}
            className="relative"
            onMouseEnter={() => setActiveGroup(group.id)}
            onMouseLeave={() => setActiveGroup(null)}
          >
            <button className="flex items-center gap-1 px-4 py-3 text-primary-foreground text-sm font-medium hover:bg-ikon-navy-light transition whitespace-nowrap">
              {group.name}
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
            {activeGroup === group.id && (
              <MegaMenuDropdown group={group} categories={categories} />
            )}
          </div>
        ))}
        <Link
          to="/categories"
          className="px-4 py-3 text-primary-foreground text-sm font-medium hover:bg-ikon-navy-light transition whitespace-nowrap"
        >
          All Categories
        </Link>
        <Link
          to="/brands"
          className="px-4 py-3 text-primary-foreground text-sm font-medium hover:bg-ikon-navy-light transition whitespace-nowrap"
        >
          Brands
        </Link>
        <Link
          to="/deals"
          className="px-4 py-3 text-accent-foreground text-sm font-bold bg-accent hover:bg-ikon-red-dark transition whitespace-nowrap"
        >
          🔥 Deals
        </Link>
      </div>
    </nav>
  );
};

// Mobile accordion nav
export const MobileMegaNav = ({ onClose }: { onClose: () => void }) => {
  const { groups, categories } = useNavData();

  return (
    <div className="px-4 py-3">
      <Accordion type="multiple" className="space-y-1">
        {groups.map((group) => {
          const groupCats = categories.filter((c) => c.group_id === group.id);
          return (
            <AccordionItem key={group.id} value={group.id} className="border-none">
              <AccordionTrigger className="py-2.5 px-3 text-sm font-medium text-foreground hover:bg-ikon-navy-50 rounded-md hover:no-underline">
                {group.name}
              </AccordionTrigger>
              <AccordionContent className="pl-6 pb-1">
                {groupCats.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    className="flex items-center justify-between py-2 text-sm text-ikon-text-secondary hover:text-accent transition"
                    onClick={onClose}
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs text-muted-foreground">{cat.product_count}</span>
                  </Link>
                ))}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      <Link
        to="/categories"
        className="block py-2.5 px-3 text-sm font-medium text-primary hover:bg-ikon-navy-50 rounded-md mt-1"
        onClick={onClose}
      >
        All Categories →
      </Link>
      <Link
        to="/brands"
        className="block py-2.5 px-3 text-sm font-medium text-foreground hover:bg-ikon-navy-50 rounded-md"
        onClick={onClose}
      >
        Brands
      </Link>
      <Link
        to="/deals"
        className="block py-2.5 px-3 text-sm font-bold text-accent hover:bg-ikon-red-light rounded-md"
        onClick={onClose}
      >
        🔥 Deals
      </Link>
    </div>
  );
};

// Default export for backward compat
const MegaMenu = () => null;
export default MegaMenu;
