import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Search, Star, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const AllBrandsPage = () => {
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const azRef = useRef<HTMLDivElement>(null);

  // Query 1: All brands
  const { data: brands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ["all-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("is_active", true)
        .gt("product_count", 0)
        .order("name");
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Query 2: Brand-category mapping via RPC-style raw query through products join
  const { data: brandCategoryData = [] } = useQuery({
    queryKey: ["brand-category-map"],
    queryFn: async () => {
      // Fetch all products with brand_id and category_id
      const { data: products, error: pErr } = await supabase
        .from("products")
        .select("brand_id, category_id")
        .eq("is_active", true)
        .not("brand_id", "is", null)
        .not("category_id", "is", null);
      if (pErr) throw pErr;

      // Fetch all active categories
      const { data: categories, error: cErr } = await supabase
        .from("categories")
        .select("id, name, slug, parent_id, depth")
        .eq("is_active", true);
      if (cErr) throw cErr;

      const catMap = new Map((categories || []).map(c => [c.id, c]));

      // Build brand → main_category → count mapping
      const mapping: Record<string, Record<string, { cat_id: string; cat_name: string; count: number }>> = {};

      for (const p of (products || [])) {
        if (!p.brand_id || !p.category_id) continue;
        const cat = catMap.get(p.category_id);
        if (!cat) continue;

        // Resolve main category (depth=0)
        let mainCat = cat.depth === 0 ? cat : (cat.parent_id ? catMap.get(cat.parent_id) : null);
        if (!mainCat || mainCat.depth !== 0) continue;

        if (!mapping[p.brand_id]) mapping[p.brand_id] = {};
        if (!mapping[p.brand_id][mainCat.id]) {
          mapping[p.brand_id][mainCat.id] = { cat_id: mainCat.id, cat_name: mainCat.name, count: 0 };
        }
        mapping[p.brand_id][mainCat.id].count++;
      }

      return mapping;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Derived: featured brands with fallback to fill minimum 6
  const featuredBrands = useMemo(() => {
    const featured = brands.filter(b => b.is_featured);
    if (featured.length >= 6) {
      return featured.sort((a, b) => b.product_count - a.product_count);
    }
    const featuredIds = new Set(featured.map(b => b.id));
    const topByCount = brands
      .filter(b => !featuredIds.has(b.id))
      .sort((a, b) => b.product_count - a.product_count)
      .slice(0, 6 - featured.length);
    return [...featured, ...topByCount].sort((a, b) => b.product_count - a.product_count);
  }, [brands]);

  // Derived: categories with their brands, sorted by brand count desc
  const categoryBrands = useMemo(() => {
    if (!brandCategoryData || typeof brandCategoryData !== 'object') return [];

    // Collect all categories and their brands
    const catBrands: Record<string, { cat_id: string; cat_name: string; brands: { brand: typeof brands[0]; count: number }[] }> = {};

    for (const brand of brands) {
      const brandMapping = (brandCategoryData as Record<string, Record<string, { cat_id: string; cat_name: string; count: number }>>)[brand.id];
      if (!brandMapping) continue;
      for (const entry of Object.values(brandMapping)) {
        if (!catBrands[entry.cat_id]) {
          catBrands[entry.cat_id] = { cat_id: entry.cat_id, cat_name: entry.cat_name, brands: [] };
        }
        catBrands[entry.cat_id].brands.push({ brand, count: entry.count });
      }
    }

    // Sort brands within each category by count desc
    for (const cat of Object.values(catBrands)) {
      cat.brands.sort((a, b) => b.count - a.count);
    }

    // Sort categories by number of brands desc
    return Object.values(catBrands).sort((a, b) => b.brands.length - a.brands.length);
  }, [brands, brandCategoryData]);

  // Derived: A-Z grouping
  const grouped = useMemo(() => {
    const g: Record<string, typeof brands> = {};
    for (const b of brands) {
      const letter = b.name.charAt(0).toUpperCase();
      if (!g[letter]) g[letter] = [];
      g[letter].push(b);
    }
    return g;
  }, [brands]);
  const activeLetters = useMemo(() => new Set(Object.keys(grouped)), [grouped]);

  // Search filtering
  const searchTerm = search.trim().toLowerCase();
  const filteredBrands = useMemo(() => {
    if (!searchTerm) return null;
    return brands.filter(b => b.name.toLowerCase().includes(searchTerm));
  }, [brands, searchTerm]);

  const isSearching = searchTerm.length > 0;

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const scrollToLetter = (letter: string) => {
    const el = document.getElementById(`brand-az-${letter}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Brands</span>
        </nav>

        {/* Header + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-primary">Explore Our Brands</h1>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search brands..."
              className="pl-10 pr-9"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>

        {brandsLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            {[1, 2, 3].map(i => (
              <div key={i}>
                <Skeleton className="h-7 w-40 mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(j => <Skeleton key={j} className="h-20 rounded-lg" />)}
                </div>
              </div>
            ))}
          </div>
        ) : isSearching ? (
          /* Search Results */
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredBrands?.length || 0} brand{filteredBrands?.length !== 1 ? "s" : ""} matching "{search}"
            </p>
            {filteredBrands && filteredBrands.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredBrands.map(brand => (
                  <BrandCard key={brand.id} brand={brand} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">No brands found. Try a different search term.</p>
            )}
          </div>
        ) : (
          <>
            {/* Featured / Top Brands */}
            {featuredBrands.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  <h2 className="text-xl font-bold text-foreground">Top Brands</h2>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {featuredBrands.map(brand => (
                    <Link
                      key={brand.id}
                      to={`/brand/${brand.slug}`}
                      className="group flex-shrink-0 w-40 sm:w-48 p-4 bg-card rounded-lg border-l-4 border-l-amber-400 border border-border hover:shadow-lg transition-all"
                    >
                      {brand.logo_url ? (
                        <img src={brand.logo_url} alt={brand.name} className="h-12 w-12 object-contain mb-3 rounded" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center mb-3 text-primary-foreground font-bold text-lg">
                          {brand.name.charAt(0)}
                        </div>
                      )}
                      <p className="font-semibold text-foreground group-hover:text-primary truncate text-sm">
                        {brand.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {brand.product_count} products
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Browse by Category */}
            {categoryBrands.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-bold text-foreground mb-4">Browse by Category</h2>
                <div className="space-y-4">
                  {categoryBrands.map(cat => {
                    const isExpanded = expandedCategories.has(cat.cat_id);
                    const displayBrands = isExpanded ? cat.brands : cat.brands.slice(0, 8);
                    return (
                      <div key={cat.cat_id} className="bg-card border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleCategory(cat.cat_id)}
                          className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-foreground">{cat.cat_name}</h3>
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                              {cat.brands.length} brand{cat.brands.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        </button>
                        <div className="px-5 pb-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {displayBrands.map(({ brand, count }) => (
                              <Link
                                key={brand.id}
                                to={`/brand/${brand.slug}`}
                                className="group flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
                              >
                                {brand.logo_url ? (
                                  <img src={brand.logo_url} alt={brand.name} className="h-8 w-8 object-contain rounded" />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                                    {brand.name.charAt(0)}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-foreground group-hover:text-primary truncate">{brand.name}</p>
                                  <p className="text-xs text-muted-foreground">{count} products</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                          {cat.brands.length > 8 && !isExpanded && (
                            <button
                              onClick={() => toggleCategory(cat.cat_id)}
                              className="mt-2 text-sm text-primary hover:underline font-medium"
                            >
                              Show all {cat.brands.length} brands →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Sticky A-Z Bar */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border py-2 mb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div className="flex flex-wrap gap-1 justify-center">
                {ALPHABET.map(letter => {
                  const hasLetter = activeLetters.has(letter);
                  return (
                    <button
                      key={letter}
                      onClick={() => hasLetter && scrollToLetter(letter)}
                      disabled={!hasLetter}
                      className={`w-8 h-8 flex items-center justify-center rounded text-xs font-semibold transition-colors ${
                        hasLetter
                          ? "text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer"
                          : "text-muted-foreground/40 cursor-default"
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* All Brands A-Z */}
            <section ref={azRef}>
              <h2 className="text-xl font-bold text-foreground mb-6">All Brands A–Z</h2>
              <div className="space-y-10">
                {Object.keys(grouped).sort().map(letter => (
                  <div key={letter} id={`brand-az-${letter}`}>
                    <h3 className="text-2xl font-bold text-primary mb-3">{letter}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {grouped[letter].map(brand => (
                        <BrandCard key={brand.id} brand={brand} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </MainLayout>
  );
};

// Reusable brand card component
const BrandCard = ({ brand }: { brand: { id: string; name: string; slug: string; logo_url: string | null; product_count: number } }) => (
  <Link
    to={`/brand/${brand.slug}`}
    className="group p-3 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-md transition-all"
  >
    <div className="flex items-center gap-3">
      {brand.logo_url ? (
        <img src={brand.logo_url} alt={brand.name} className="h-9 w-9 object-contain rounded" />
      ) : (
        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
          {brand.name.charAt(0)}
        </div>
      )}
      <div className="min-w-0">
        <p className="font-medium text-sm text-foreground group-hover:text-primary truncate">{brand.name}</p>
        <p className="text-xs text-muted-foreground">{brand.product_count} products</p>
      </div>
    </div>
  </Link>
);

export default AllBrandsPage;
