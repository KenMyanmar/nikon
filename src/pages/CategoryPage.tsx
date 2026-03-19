import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import ProductGrid from "@/components/ProductGrid";
import FilterSidebar from "@/components/FilterSidebar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";

type SortOption = "newest" | "price_asc" | "price_desc";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSub = searchParams.get("sub") || "";
  const [sort, setSort] = useState<SortOption>("newest");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [stockFilters, setStockFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  // Fetch the category by slug to determine if it's a parent
  const { data: category } = useQuery({
    queryKey: ["category-by-slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, depth, parent_id")
        .eq("slug", slug!)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // If this is a sub-category, fetch parent for breadcrumbs
  const { data: parentCategory } = useQuery({
    queryKey: ["parent-category", category?.parent_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("id", category!.parent_id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!category?.parent_id,
  });

  // Fetch sub-categories with product counts if this is a parent category
  const { data: subCategories = [] } = useQuery({
    queryKey: ["sub-categories", category?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, product_count")
        .eq("parent_id", category!.id)
        .eq("is_active", true)
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data || [];
    },
    enabled: !!category?.id && (category?.depth === 0 || category?.depth === null),
  });

  const isParentWithSubs = subCategories.length > 0;

  // Find active sub-category id
  const activeSubCategory = activeSub
    ? subCategories.find((s) => s.slug === activeSub)
    : null;

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ["category-products", category?.id, activeSub, isParentWithSubs],
    queryFn: async () => {
      if (isParentWithSubs && activeSubCategory) {
        // Specific sub-category
        const { data, error } = await supabase
          .from("products_public")
          .select("id, slug, description, short_description, brand_name, selling_price, currency, stock_status, stock_code, moq, thumbnail_url, created_at, category_name")
          .eq("is_active", true)
          .eq("category_id", activeSubCategory.id)
          .limit(200);
        if (error) throw error;
        return data || [];
      } else if (isParentWithSubs) {
        // All products under parent + its sub-categories
        const allCatIds = [category!.id, ...subCategories.map((s) => s.id)];
        const { data, error } = await supabase
          .from("products_public")
          .select("id, slug, description, short_description, brand_name, selling_price, currency, stock_status, stock_code, moq, thumbnail_url, created_at, category_name")
          .eq("is_active", true)
          .in("category_id", allCatIds)
          .limit(200);
        if (error) throw error;
        return data || [];
      } else {
        // Leaf category or category without subs
        const { data, error } = await supabase
          .from("products_public")
          .select("id, slug, description, short_description, brand_name, selling_price, currency, stock_status, stock_code, moq, thumbnail_url, created_at, category_name")
          .eq("is_active", true)
          .eq("category_id", category!.id)
          .limit(200);
        if (error) throw error;
        return data || [];
      }
    },
    enabled: !!category?.id,
  });

  const categoryName = category?.name || slug;

  const brands = useMemo(() => {
    if (!products) return [];
    const set = new Set(products.map((p) => p.brand_name).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [products]);

  const maxPrice = useMemo(() => {
    if (!products) return 0;
    return Math.max(...products.map((p) => Number(p.selling_price) || 0), 0);
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    let result = products.filter((p) => {
      if (selectedBrands.length && !selectedBrands.includes(p.brand_name || "")) return false;
      if (stockFilters.length && !stockFilters.includes(p.stock_status || "")) return false;
      if (priceRange[1] > 0) {
        const price = Number(p.selling_price) || 0;
        if (price < priceRange[0] || price > priceRange[1]) return false;
      }
      return true;
    });

    if (sort === "newest") result.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    else if (sort === "price_asc") result.sort((a, b) => (Number(a.selling_price) || 0) - (Number(b.selling_price) || 0));
    else if (sort === "price_desc") result.sort((a, b) => (Number(b.selling_price) || 0) - (Number(a.selling_price) || 0));

    return result;
  }, [products, selectedBrands, stockFilters, priceRange, sort]);

  // Build breadcrumbs
  const breadcrumbSegments = useMemo(() => {
    const segs: { label: string; href?: string }[] = [];
    if (parentCategory) {
      segs.push({ label: parentCategory.name, href: `/category/${parentCategory.slug}` });
    }
    if (activeSubCategory) {
      segs.push({ label: categoryName, href: `/category/${slug}` });
      segs.push({ label: activeSubCategory.name });
    } else {
      segs.push({ label: categoryName });
    }
    return segs;
  }, [parentCategory, categoryName, slug, activeSubCategory]);

  const totalAllProducts = isParentWithSubs
    ? subCategories.reduce((sum, s) => sum + s.product_count, 0)
    : 0;

  const handleSubClick = (subSlug: string) => {
    if (subSlug === "") {
      searchParams.delete("sub");
    } else {
      searchParams.set("sub", subSlug);
    }
    setSearchParams(searchParams);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs segments={breadcrumbSegments} />

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-h2 text-foreground">{categoryName}</h1>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="border border-ikon-border rounded-md px-3 py-2 text-sm bg-card text-foreground"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>

        {/* Sub-category pill bar */}
        {isParentWithSubs && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 mb-2">
            <button
              onClick={() => handleSubClick("")}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition border ${
                !activeSub
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/50"
              }`}
            >
              All
              <span className="ml-1.5 text-xs opacity-70">({totalAllProducts})</span>
            </button>
            {subCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSubClick(sub.slug)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition border ${
                  activeSub === sub.slug
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:border-primary/50"
                }`}
              >
                {sub.name}
                <span className="ml-1.5 text-xs opacity-70">({sub.product_count})</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-8">
          <div className="hidden md:block w-60 flex-shrink-0">
            <FilterSidebar
              filterItems={brands}
              selectedItems={selectedBrands}
              onItemsChange={setSelectedBrands}
              stockFilters={stockFilters}
              onStockChange={setStockFilters}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              maxPrice={maxPrice}
            />
          </div>
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-card" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-ikon-text-secondary">No products found in this category.</p>
            ) : (
              <ProductGrid products={filtered as any} />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CategoryPage;
