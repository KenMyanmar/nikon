import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import ProductGrid from "@/components/ProductGrid";
import FilterSidebar from "@/components/FilterSidebar";
import { Skeleton } from "@/components/ui/skeleton";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [stockFilters, setStockFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", q],
    queryFn: async () => {
      if (!q.trim()) return [];
      const { data, error } = await supabase.rpc("search_products", {
        search_term: q,
        result_limit: 50,
      });
      if (error) throw error;
      return data || [];
    },
    enabled: q.length > 0,
  });

  const brands = useMemo(() => {
    if (!results) return [];
    const set = new Set(results.map((r: any) => r.brand_name).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [results]);

  const maxPrice = useMemo(() => {
    if (!results) return 0;
    return Math.max(...results.map((r: any) => Number(r.selling_price) || 0), 0);
  }, [results]);

  const filtered = useMemo(() => {
    if (!results) return [];
    const list = results.filter((r: any) => {
      if (selectedBrands.length && !selectedBrands.includes(r.brand_name)) return false;
      if (stockFilters.length && !stockFilters.includes(r.stock_status)) return false;
      if (priceRange[1] > 0) {
        const price = Number(r.selling_price) || 0;
        if (price < priceRange[0] || price > priceRange[1]) return false;
      }
      return true;
    });
    // Products with images first
    list.sort((a: any, b: any) => {
      const aHas = a.thumbnail_url ? 0 : 1;
      const bHas = b.thumbnail_url ? 0 : 1;
      if (aHas !== bHas) return aHas - bHas;
      return 0;
    });
    return list;
  }, [results, selectedBrands, stockFilters, priceRange]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-h2 text-foreground mb-6">
          {isLoading ? "Searching..." : `${filtered.length} results for "${q}"`}
        </h1>
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
              <p className="text-ikon-text-secondary">No products found. Try a different search term.</p>
            ) : (
              <ProductGrid products={filtered as any} />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchResults;
