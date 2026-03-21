import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, Zap, Tag } from "lucide-react";
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

interface TopBrand {
  id: string;
  name: string;
  slug: string;
  product_count: number;
}

const SHORT_NAMES: Record<string, string> = {
  "Housekeeping Supplies": "Housekeeping",
  "Laundry Solutions": "Laundry",
  "F & B Solutions": "F&B",
  "Bedroom Supplies": "Bedroom",
  "Buffet & Banquet": "Buffet",
  "Kitchen Utensils": "Utensils",
  "Kitchen Services": "Kitchen Svc",
  "Food Services": "Food Svc",
  "Spare Parts": "Spare Parts",
};

export const useNavData = () => {
  const { data: mainCategories = [] } = useQuery({
    queryKey: ["main-categories-nav"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, product_count")
        .eq("depth", 0)
        .eq("is_active", true)
        .order("product_count", { ascending: false });
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
        .order("product_count", { ascending: false });
      if (error) throw error;
      return (data || []) as SubCategory[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: topBrands = [] } = useQuery({
    queryKey: ["top-brands-nav"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name, slug, product_count")
        .eq("is_active", true)
        .gt("product_count", 0)
        .order("product_count", { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data || []) as TopBrand[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return { mainCategories, subCategories, topBrands };
};

// ─── Individual category hover dropdown ──────────────────────────────────
const MegaMenuDropdown = ({
  mainCategory,
  subCategories,
  topBrands,
}: {
  mainCategory: MainCategory;
  subCategories: SubCategory[];
  topBrands: TopBrand[];
}) => {
  const subs = useMemo(
    () => subCategories.filter((s) => s.parent_id === mainCategory.id),
    [subCategories, mainCategory.id]
  );

  return (
    <div className="absolute left-0 right-0 top-full w-full bg-card border-t-2 border-primary shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="max-w-[1280px] mx-auto px-8 py-6">
        <div className="grid grid-cols-[1fr_220px] gap-8">
          {/* Left — Sub-categories */}
          <div className="min-w-0">
            <h3 className="text-xs uppercase tracking-[0.05em] font-bold text-primary mb-4">
              {mainCategory.name}
            </h3>
            <div className={`grid ${subs.length > 6 ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"} gap-x-8 gap-y-0.5`}>
              {subs.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/category/${sub.slug}`}
                  className="flex items-center gap-2 py-1.5 text-sm text-muted-foreground hover:text-accent transition group/item min-w-0"
                >
                  <span className="truncate min-w-0 group-hover/item:translate-x-1 transition-transform">
                    {sub.name}
                  </span>
                  <span className="text-xs text-muted-foreground/60 shrink-0">
                    ({sub.product_count})
                  </span>
                </Link>
              ))}
            </div>
            {subs.length === 0 && (
              <p className="text-sm text-muted-foreground">No sub-categories yet.</p>
            )}
            <div className="mt-4 pt-3 border-t border-border">
              <Link
                to={`/category/${mainCategory.slug}`}
                className="text-sm font-semibold text-accent hover:underline"
              >
                View All {mainCategory.name} →
              </Link>
            </div>
          </div>

          {/* Right — Popular Brands */}
          <div className="bg-secondary rounded-lg p-5 min-w-0">
            <h4 className="text-xs uppercase tracking-[0.05em] font-bold text-primary mb-3">
              Popular Brands
            </h4>
            <div className="space-y-1">
              {topBrands.slice(0, 4).map((brand) => (
                <Link
                  key={brand.id}
                  to={`/brand/${brand.slug}`}
                  className="flex items-center justify-between py-1.5 text-sm text-muted-foreground hover:text-accent transition"
                >
                  <span className="truncate">{brand.name}</span>
                  <span className="text-xs text-muted-foreground/60 shrink-0 ml-2">
                    ({brand.product_count})
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <Link
                to="/brands"
                className="text-sm font-semibold text-accent hover:underline"
              >
                View All Brands →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Desktop Nav Bar ─────────────────────────────────────────────────────
export const DesktopMegaNav = () => {
  const { mainCategories, subCategories, topBrands } = useNavData();
  const [activeId, setActiveId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shortName = (name: string) => SHORT_NAMES[name] || name;

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
        <div className="flex items-center">
          {/* All 10 categories */}
          {mainCategories.map((cat) => (
            <div
              key={cat.id}
              onMouseEnter={() => handleMouseEnter(cat.id)}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                to={`/category/${cat.slug}`}
                className={`flex items-center gap-1 px-3 py-3 text-primary-foreground text-[13px] font-medium transition whitespace-nowrap ${
                  activeId === cat.id ? "bg-[hsl(var(--ikon-navy-light))]" : "hover:bg-[hsl(var(--ikon-navy-light))]"
                }`}
              >
                {shortName(cat.name)}
                <ChevronDown className="w-3 h-3 opacity-60" />
              </Link>
            </div>
          ))}

          {/* Divider */}
          <div className="w-px h-6 bg-primary-foreground/20 shrink-0 mx-1" />

          {/* Brands standalone link */}
          <Link
            to="/brands"
            className="flex items-center gap-1.5 px-3 py-3 text-primary-foreground text-[13px] font-medium hover:bg-[hsl(var(--ikon-navy-light))] transition whitespace-nowrap"
          >
            <Tag className="w-3.5 h-3.5 opacity-70" />
            Brands
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Flash Deals */}
          <Link
            to="/flash-deals"
            className="flex items-center gap-1.5 px-4 py-3 text-white text-[13px] font-bold bg-destructive hover:bg-[hsl(var(--ikon-red-dark))] transition whitespace-nowrap shrink-0"
          >
            <Zap className="w-3.5 h-3.5" />
            Flash Deals
          </Link>
        </div>
      </div>

      {/* Category hover dropdown */}
      {activeId && (
        <div
          onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
          onMouseLeave={handleMouseLeave}
        >
          <MegaMenuDropdown
            mainCategory={mainCategories.find((c) => c.id === activeId)!}
            subCategories={subCategories}
            topBrands={topBrands}
          />
        </div>
      )}
    </nav>
  );
};

// ─── Mobile Accordion Nav ────────────────────────────────────────────────
export const MobileMegaNav = ({ onClose }: { onClose: () => void }) => {
  const { mainCategories, subCategories } = useNavData();

  // Sort by product_count DESC (already sorted from query)
  const sorted = mainCategories;

  return (
    <div className="px-4 py-3">
      {/* Prominent buttons at top */}
      <div className="flex gap-2 mb-4">
        <Link
          to="/flash-deals"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-destructive text-white font-bold text-sm transition hover:opacity-90"
          onClick={onClose}
        >
          <Zap className="w-4 h-4" />
          Flash Deals
        </Link>
        <Link
          to="/brands"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm transition hover:opacity-90"
          onClick={onClose}
        >
          <Tag className="w-4 h-4" />
          Browse Brands
        </Link>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
        Categories
      </p>

      <Accordion type="multiple" className="space-y-0.5">
        {sorted.map((cat) => {
          const subs = subCategories.filter((s) => s.parent_id === cat.id);
          return (
            <AccordionItem key={cat.id} value={cat.id} className="border-none">
              <div className="flex items-center">
                <Link
                  to={`/category/${cat.slug}`}
                  className="flex-1 flex items-center justify-between py-2.5 px-3 text-sm font-medium text-foreground hover:text-accent transition"
                  onClick={onClose}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">({cat.product_count})</span>
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
                      className="flex items-center justify-between py-1.5 text-sm text-muted-foreground hover:text-accent transition"
                      onClick={onClose}
                    >
                      <span className="truncate">{sub.name}</span>
                      <span className="text-xs text-muted-foreground/60 ml-2">({sub.product_count})</span>
                    </Link>
                  ))}
                </AccordionContent>
              )}
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

const MegaMenu = () => null;
export default MegaMenu;
