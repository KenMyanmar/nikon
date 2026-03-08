import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown } from "lucide-react";
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

// Desktop mega dropdown content — 3-column grid, no absolute inside
const MegaMenuDropdown = ({
  group,
  categories,
}: {
  group: ProductGroup;
  categories: Category[];
}) => {
  const groupCategories = categories.filter((c) => c.group_id === group.id);
  const totalProducts = groupCategories.reduce((sum, c) => sum + c.product_count, 0);

  return (
    <div className="absolute left-0 right-0 top-full w-full bg-card border-t-2 border-primary shadow-xl z-50">
      <div className="max-w-[1280px] mx-auto px-8 py-6">
        <div className="grid grid-cols-[1fr_200px_200px] gap-8">
          {/* Categories Column */}
          <div className="min-w-0">
            <h3 className="text-xs uppercase tracking-[0.05em] font-bold text-primary mb-4">
              {group.name}
            </h3>
            <div className={`grid ${groupCategories.length > 6 ? "grid-cols-2" : "grid-cols-1"} gap-x-8 gap-y-2`}>
              {groupCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="flex items-center gap-2 py-1.5 text-sm text-ikon-text-secondary hover:text-accent transition group/item min-w-0"
                >
                  <span className="truncate min-w-0 group-hover/item:translate-x-1 transition-transform">
                    {cat.name}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    ({cat.product_count})
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Featured Brands Column */}
          <div className="min-w-0">
            <h3 className="text-xs uppercase tracking-[0.05em] font-bold text-primary mb-4">
              Top Brands
            </h3>
            <div className="space-y-3">
              {groupCategories.slice(0, 4).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="block text-sm text-ikon-text-secondary hover:text-accent transition"
                >
                  <span className="font-medium truncate block">{cat.name}</span>
                  <span className="text-xs text-muted-foreground">{cat.product_count} products</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Promo Column */}
          <div className="bg-ikon-bg-tertiary rounded-lg p-6 min-w-0">
            <h3 className="font-bold text-primary mb-2 break-words">
              Browse {group.name}
            </h3>
            <p className="text-sm text-ikon-text-secondary mb-1">
              {groupCategories.length} categories
            </p>
            <p className="text-sm text-ikon-text-secondary mb-4">
              {totalProducts.toLocaleString()} products
            </p>
            <Link
              to="/categories"
              className="text-sm font-semibold text-accent hover:underline"
            >
              View All →
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
  const navRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (groupId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveGroup(groupId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveGroup(null), 150);
  };

  return (
    <nav className="hidden lg:block bg-primary relative" ref={navRef}>
      <div className="container mx-auto px-4">
        <div className="flex items-center overflow-x-auto scrollbar-hide">
          {groups.map((group) => (
            <div
              key={group.id}
              onMouseEnter={() => handleMouseEnter(group.id)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`flex items-center gap-1 px-4 py-3 text-primary-foreground text-sm font-medium transition whitespace-nowrap ${
                  activeGroup === group.id ? "bg-ikon-navy-light" : "hover:bg-ikon-navy-light"
                }`}
              >
                {group.name}
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
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
            to="/flash-deals"
            className="px-4 py-3 text-accent-foreground text-sm font-bold bg-accent hover:bg-ikon-red-dark transition whitespace-nowrap"
          >
            ⚡ Flash Deals
          </Link>
        </div>
      </div>
      {/* Dropdown renders at nav level, not per-item */}
      {activeGroup && (
        <div
          onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
          onMouseLeave={handleMouseLeave}
        >
          <MegaMenuDropdown
            group={groups.find((g) => g.id === activeGroup)!}
            categories={categories}
          />
        </div>
      )}
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
                    <span className="truncate min-w-0">{cat.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">({cat.product_count})</span>
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
        to="/flash-deals"
        className="block py-2.5 px-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-md"
        onClick={onClose}
      >
        ⚡ Flash Deals
      </Link>
    </div>
  );
};

const MegaMenu = () => null;
export default MegaMenu;
