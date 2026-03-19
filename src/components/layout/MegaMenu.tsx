import { useState, useRef, useMemo } from "react";
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

interface MainCategory {
  id: string;
  name: string;
  slug: string;
  product_count: number;
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  product_count: number;
}

export const useNavData = () => {
  const { data: mainCategories = [] } = useQuery({
    queryKey: ["main-categories-nav"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, product_count")
        .eq("depth", 0)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return (data || []) as MainCategory[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: subCategories = [] } = useQuery({
    queryKey: ["sub-categories-nav"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, parent_id, product_count")
        .eq("depth", 1)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return (data || []) as SubCategory[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return { mainCategories, subCategories };
};

// Desktop mega dropdown content
const MegaMenuDropdown = ({
  mainCategory,
  subCategories,
}: {
  mainCategory: MainCategory;
  subCategories: SubCategory[];
}) => {
  const subs = useMemo(
    () => subCategories.filter((s) => s.parent_id === mainCategory.id),
    [subCategories, mainCategory.id]
  );

  const totalProducts = subs.reduce((sum, s) => sum + s.product_count, 0);

  return (
    <div className="absolute left-0 right-0 top-full w-full bg-card border-t-2 border-primary shadow-xl z-50">
      <div className="max-w-[1280px] mx-auto px-8 py-6">
        <div className="grid grid-cols-[1fr_200px] gap-8">
          <div className="min-w-0">
            <h3 className="text-xs uppercase tracking-[0.05em] font-bold text-primary mb-4">
              {mainCategory.name}
            </h3>
            <div className={`grid ${subs.length > 6 ? "grid-cols-2" : "grid-cols-1"} gap-x-8 gap-y-0.5`}>
              {subs.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/category/${sub.slug}`}
                  className="flex items-center gap-2 py-1.5 text-sm text-ikon-text-secondary hover:text-accent transition group/item min-w-0"
                >
                  <span className="truncate min-w-0 group-hover/item:translate-x-1 transition-transform">
                    {sub.name}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    ({sub.product_count})
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-ikon-bg-tertiary rounded-lg p-6 min-w-0">
            <h3 className="font-bold text-primary mb-2 break-words">
              Browse {mainCategory.name}
            </h3>
            <p className="text-sm text-ikon-text-secondary mb-1">
              {subs.length} sub-categories
            </p>
            <p className="text-sm text-ikon-text-secondary mb-4">
              {totalProducts.toLocaleString()} products
            </p>
            <Link
              to={`/category/${mainCategory.slug}`}
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
  const { mainCategories, subCategories } = useNavData();
  const [activeId, setActiveId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveId(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveId(null), 150);
  };

  return (
    <nav className="hidden lg:block bg-primary relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center overflow-x-auto scrollbar-hide">
          {mainCategories.map((cat) => (
            <div
              key={cat.id}
              onMouseEnter={() => handleMouseEnter(cat.id)}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                to={`/category/${cat.slug}`}
                className={`flex items-center gap-1 px-4 py-3 text-primary-foreground text-sm font-medium transition whitespace-nowrap ${
                  activeId === cat.id ? "bg-ikon-navy-light" : "hover:bg-ikon-navy-light"
                }`}
              >
                {cat.name}
                <ChevronDown className="w-3 h-3 opacity-60" />
              </Link>
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
            className="px-4 py-3 text-white text-sm font-bold bg-red-600 hover:bg-red-700 transition whitespace-nowrap"
          >
            ⚡ Flash Deals
          </Link>
        </div>
      </div>
      {activeId && (
        <div
          onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
          onMouseLeave={handleMouseLeave}
        >
          <MegaMenuDropdown
            mainCategory={mainCategories.find((c) => c.id === activeId)!}
            subCategories={subCategories}
          />
        </div>
      )}
    </nav>
  );
};

// Mobile accordion nav
export const MobileMegaNav = ({ onClose }: { onClose: () => void }) => {
  const { mainCategories, subCategories } = useNavData();

  return (
    <div className="px-4 py-3">
      <Accordion type="multiple" className="space-y-1">
        {mainCategories.map((cat) => {
          const subs = subCategories.filter((s) => s.parent_id === cat.id);
          return (
            <AccordionItem key={cat.id} value={cat.id} className="border-none">
              <div className="flex items-center">
                <Link
                  to={`/category/${cat.slug}`}
                  className="flex-1 py-2.5 px-3 text-sm font-medium text-foreground hover:text-accent transition truncate"
                  onClick={onClose}
                >
                  {cat.name}
                </Link>
                {subs.length > 0 && (
                  <AccordionTrigger className="py-2 px-2 hover:no-underline [&>svg]:w-3 [&>svg]:h-3" />
                )}
              </div>
              {subs.length > 0 && (
                <AccordionContent className="pl-6 pb-1">
                  {subs.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/category/${sub.slug}`}
                      className="flex items-center justify-between py-1.5 text-sm text-ikon-text-secondary hover:text-accent transition"
                      onClick={onClose}
                    >
                      <span className="truncate">{sub.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({sub.product_count})</span>
                    </Link>
                  ))}
                </AccordionContent>
              )}
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
