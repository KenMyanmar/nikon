import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import ProductGrid from "@/components/ProductGrid";
import FilterSidebar from "@/components/FilterSidebar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";

type SortOption = "newest" | "price_asc" | "price_desc";

const BestSellersPage = () => {
  const [sort, setSort] = useState<SortOption>("newest");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [stockFilters, setStockFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  const { data: products, isLoading } = useQuery({
    queryKey: ["best-sellers-page"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products_public")
        .select(
          "id, slug, description, short_description, brand_name, brand_logo, selling_price, currency, stock_status, stock_code, moq, onhand_qty, thumbnail_url, created_at, category_name"
        )
        .eq("is_active", true)
        .eq("is_featured", true)
        .not("thumbnail_url", "is", null)
        .neq("thumbnail_url", "")
        .order("onhand_qty", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });

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

    result.sort((a, b) => {
      const aHas = a.thumbnail_url ? 0 : 1;
      const bHas = b.thumbnail_url ? 0 : 1;
      if (aHas !== bHas) return aHas - bHas;
      return 0;
    });

    return result;
  }, [products, selectedBrands, stockFilters, priceRange, sort]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs segments={[{ label: "Best Sellers" }]} />

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-h2 text-foreground">Best Selling Products</h1>
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
              <p className="text-ikon-text-secondary">No best-selling products found.</p>
            ) : (
              <ProductGrid products={filtered as any} />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BestSellersPage;
