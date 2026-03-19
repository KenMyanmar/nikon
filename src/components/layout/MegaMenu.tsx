import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronRight, Menu, X, Zap } from "lucide-react";
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

const SHORT_NAMES: Record<string, string> = {
  "Housekeeping Supplies": "Housekeeping",
  "Laundry Solutions": "Laundry",
  "F & B Solutions": "F&B",
  "Bedroom Supplies": "Bedroom",
  "Buffet & Banquet": "Buffet",
  "Food Services": "Food Services",
};

const NAV_LIMIT = 8;

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

// ─── All Categories Mega Overlay ─────────────────────────────────────────
const AllCategoriesOverlay = ({
  mainCategories,
  subCategories,
  onClose,
}: {
  mainCategories: MainCategory[];
  subCategories: SubCategory[];
  onClose: () => void;
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(
    mainCategories[0]?.id || null
  );

  const hoveredSubs = useMemo(
    () => subCategories.filter((s) => s.parent_id === hoveredId),
    [subCategories, hoveredId]
  );

  const hoveredCat = mainCategories.find((c) => c.id === hoveredId);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="absolute left-0 right-0 top-full z-50 bg-card border-t-2 border-primary shadow-2xl">
        <div className="max-w-[1280px] mx-auto flex min-h-[400px]">
          {/* Left column — all main categories */}
          <div className="w-[240px] border-r border-border bg-secondary/50 py-4 shrink-0">
            {mainCategories.map((cat) => (
              <button
                key={cat.id}
                onMouseEnter={() => setHoveredId(cat.id)}
                onClick={() => { onClose(); }}
                className={`w-full flex items-center justify-between px-5 py-2.5 text-sm transition ${
                  hoveredId === cat.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Link
                  to={`/category/${cat.slug}`}
                  className="flex-1 text-left"
                  onClick={onClose}
                >
                  {cat.name}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
              </button>
            ))}
            <div className="border-t border-border mt-3 pt-3 px-5">
              <Link
                to="/brands"
                className="text-sm font-medium text-accent hover:underline"
                onClick={onClose}
              >
                Browse Brands →
              </Link>
            </div>
          </div>

          {/* Right area — sub-categories of hovered */}
          <div className="flex-1 p-6">
            {hoveredCat && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">
                    {hoveredCat.name}
                  </h3>
                  <Link
                    to={`/category/${hoveredCat.slug}`}
                    className="text-sm font-semibold text-accent hover:underline"
                    onClick={onClose}
                  >
                    View All →
                  </Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
                  {hoveredSubs.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/category/${sub.slug}`}
                      className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-accent transition group"
                      onClick={onClose}
                    >
                      <span className="group-hover:translate-x-1 transition-transform truncate">
                        {sub.name}
                      </span>
                      <span className="text-xs opacity-60 shrink-0">
                        ({sub.product_count})
                      </span>
                    </Link>
                  ))}
                </div>
                {hoveredSubs.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No sub-categories yet.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Individual category hover dropdown ──────────────────────────────────
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
                  className="flex items-center gap-2 py-1.5 text-sm text-muted-foreground hover:text-accent transition group/item min-w-0"
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
          <div className="bg-secondary rounded-lg p-6 min-w-0">
            <h3 className="font-bold text-primary mb-2 break-words">
              Browse {mainCategory.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-1">
              {subs.length} sub-categories
            </p>
            <p className="text-sm text-muted-foreground mb-4">
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

// ─── "More ▾" dropdown ───────────────────────────────────────────────────
const MoreDropdown = ({
  categories,
  subCategories,
}: {
  categories: MainCategory[];
  subCategories: SubCategory[];
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (categories.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-4 py-3 text-primary-foreground text-[13px] font-medium hover:bg-[hsl(var(--ikon-navy-light))] transition whitespace-nowrap"
      >
        More
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute top-full left-0 bg-card border border-border shadow-xl rounded-b-lg min-w-[220px] z-50 py-2">
          {categories.map((cat) => {
            const subs = subCategories.filter((s) => s.parent_id === cat.id);
            return (
              <div key={cat.id} className="group">
                <Link
                  to={`/category/${cat.slug}`}
                  className="flex items-center justify-between px-4 py-2.5 text-sm text-foreground hover:bg-muted transition"
                  onClick={() => setOpen(false)}
                >
                  {cat.name}
                  {subs.length > 0 && (
                    <ChevronRight className="w-3 h-3 opacity-40" />
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Desktop Nav Bar ─────────────────────────────────────────────────────
export const DesktopMegaNav = () => {
  const { mainCategories, subCategories } = useNavData();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sort by product_count descending
  const sorted = useMemo(
    () => [...mainCategories].sort((a, b) => b.product_count - a.product_count),
    [mainCategories]
  );

  const navCategories = sorted.slice(0, NAV_LIMIT);
  const moreCategories = sorted.slice(NAV_LIMIT);

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveId(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveId(null), 150);
  };

  const shortName = (name: string) => SHORT_NAMES[name] || name;

  return (
    <nav className="hidden lg:block bg-primary relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center">
          {/* ☰ All Categories button */}
          <button
            onClick={() => { setOverlayOpen(!overlayOpen); setActiveId(null); }}
            className={`flex items-center gap-2 px-4 py-3 text-primary-foreground text-[13px] font-semibold transition whitespace-nowrap shrink-0 ${
              overlayOpen
                ? "bg-[hsl(var(--ikon-navy-light))]"
                : "bg-[hsl(var(--ikon-navy-dark))] hover:bg-[hsl(var(--ikon-navy-light))]"
            }`}
          >
            {overlayOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            All Categories
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-primary-foreground/20 shrink-0" />

          {/* Top 8 categories */}
          {navCategories.map((cat) => (
            <div
              key={cat.id}
              onMouseEnter={() => { handleMouseEnter(cat.id); setOverlayOpen(false); }}
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

          {/* More dropdown */}
          <MoreDropdown categories={moreCategories} subCategories={subCategories} />

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
      {activeId && !overlayOpen && (
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

      {/* All Categories overlay */}
      {overlayOpen && (
        <AllCategoriesOverlay
          mainCategories={[...mainCategories].sort((a, b) => a.name.localeCompare(b.name))}
          subCategories={subCategories}
          onClose={() => setOverlayOpen(false)}
        />
      )}
    </nav>
  );
};

// ─── Mobile Accordion Nav ────────────────────────────────────────────────
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
                      className="flex items-center justify-between py-1.5 text-sm text-muted-foreground hover:text-accent transition"
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
      <div className="border-t border-border mt-2 pt-2 space-y-1">
        <Link
          to="/categories"
          className="block py-2.5 px-3 text-sm font-medium text-primary hover:bg-muted rounded-md"
          onClick={onClose}
        >
          All Categories →
        </Link>
        <Link
          to="/brands"
          className="block py-2.5 px-3 text-sm font-medium text-foreground hover:bg-muted rounded-md"
          onClick={onClose}
        >
          Browse Brands
        </Link>
        <Link
          to="/flash-deals"
          className="block py-2.5 px-3 text-sm font-bold text-destructive hover:bg-destructive/10 rounded-md"
          onClick={onClose}
        >
          ⚡ Flash Deals
        </Link>
      </div>
    </div>
  );
};

const MegaMenu = () => null;
export default MegaMenu;
