import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { SearchProductRow } from "@/integrations/supabase/rpc-types";
import MainLayout from "@/components/layout/MainLayout";
import ProductGrid from "@/components/ProductGrid";
import FilterSidebar from "@/components/FilterSidebar";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [stockFilters, setStockFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  const { data: results, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["search", q],
    queryFn: async (): Promise<SearchProductRow[]> => {
      if (!q.trim()) return [];
      const { data, error } = await supabase.rpc("search_products", {
        search_term: q,
        result_limit: 50,
      });
      if (error) throw error;
      return ((data as unknown) as SearchProductRow[]) || [];
    },
    enabled: q.length > 0,
  });

  const brands = useMemo(() => {
    if (!results) return [];
    const set = new Set(results.map((r) => r.brand_name).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [results]);

  const maxPrice = useMemo(() => {
    if (!results || results.length === 0) return 0;
    return Math.max(...results.map((r) => Number(r.selling_price) || 0), 0);
  }, [results]);

  const filtered = useMemo(() => {
    if (!results) return [];
    const list = results
      // Defensive: drop rows missing the primary key — they'd crash downstream
      .filter((r) => !!r && !!r.id)
      .filter((r) => {
        if (selectedBrands.length && (!r.brand_name || !selectedBrands.includes(r.brand_name))) return false;
        if (stockFilters.length && (!r.stock_status || !stockFilters.includes(r.stock_status))) return false;
        if (priceRange[1] > 0) {
          const price = Number(r.selling_price) || 0;
          if (price < priceRange[0] || price > priceRange[1]) return false;
        }
        return true;
      });
    list.sort((a, b) => {
      const aHas = a.thumbnail_url ? 0 : 1;
      const bHas = b.thumbnail_url ? 0 : 1;
      return aHas - bHas;
    });
    return list;
  }, [results, selectedBrands, stockFilters, priceRange]);

  return (
    <MainLayout>
      <ErrorBoundary label="SearchResults">
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
              ) : isError ? (
                <div className="bg-card border border-border rounded-card p-8 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    Something went wrong with your search
                  </h2>
                  <p className="text-sm text-muted-foreground mb-5">
                    {(error as Error)?.message || "Please try again in a moment."}
                  </p>
                  <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-button bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60"
                  >
                    <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                    Try again
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-ikon-text-secondary">No products found. Try a different search term.</p>
              ) : (
                <ProductGrid products={filtered as any} />
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </MainLayout>
  );
};

export default SearchResults;
