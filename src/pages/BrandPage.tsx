import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import ProductGrid from "@/components/ProductGrid";
import FilterSidebar from "@/components/FilterSidebar";
import { ChevronRight } from "lucide-react";

type SortOption = "relevance" | "name_asc" | "price_low" | "price_high" | "newest";

const BrandPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [stockFilters, setStockFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  const { data: brand, isLoading: brandLoading } = useQuery({
    queryKey: ["brand", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("slug", slug!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["brand-products", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products_public")
        .select("*")
        .eq("brand_slug", slug!)
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => p.category_name && cats.add(p.category_name));
    return Array.from(cats).sort();
  }, [products]);

  const maxPrice = useMemo(() => {
    return Math.max(0, ...products.map((p) => Number(p.selling_price) || 0));
  }, [products]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedCategories.length > 0) {
      result = result.filter((p) => p.category_name && selectedCategories.includes(p.category_name));
    }
    if (stockFilters.length > 0) {
      result = result.filter((p) => p.stock_status && stockFilters.includes(p.stock_status));
    }
    if (priceRange[0] > 0) {
      result = result.filter((p) => Number(p.selling_price) >= priceRange[0]);
    }
    if (priceRange[1] > 0) {
      result = result.filter((p) => Number(p.selling_price) <= priceRange[1]);
    }

    switch (sortBy) {
      case "name_asc":
        result.sort((a, b) => (a.description || "").localeCompare(b.description || ""));
        break;
      case "price_low":
        result.sort((a, b) => (Number(a.selling_price) || 0) - (Number(b.selling_price) || 0));
        break;
      case "price_high":
        result.sort((a, b) => (Number(b.selling_price) || 0) - (Number(a.selling_price) || 0));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime());
        break;
    }

    return result;
  }, [products, selectedCategories, stockFilters, priceRange, sortBy]);

  if (brandLoading || productsLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-32 bg-muted rounded-card" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-muted rounded-card" />)}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!brand) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-h2 text-foreground">Brand not found</h1>
          <Link to="/" className="text-primary font-semibold mt-4 inline-block">← Back to Home</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span>Brands</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{brand.name}</span>
        </nav>

        {/* Brand Header */}
        <div className="bg-card rounded-card shadow-card p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center gap-6">
          {brand.logo_url ? (
            <img src={brand.logo_url} alt={brand.name} className="h-20 md:h-24 object-contain" />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-3xl md:text-4xl font-bold text-primary-foreground">
                {brand.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="text-center md:text-left">
            <h1 className="text-h1 text-foreground">{brand.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{brand.product_count} products</p>
            {brand.description && (
              <p className="text-sm text-ikon-text-secondary mt-2 max-w-2xl">{brand.description}</p>
            )}
          </div>
        </div>

        {/* Sort + Count Bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">{filtered.length} products</p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="border border-ikon-border rounded-button px-3 py-2 text-sm bg-card"
          >
            <option value="relevance">Relevance</option>
            <option value="name_asc">Name A-Z</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {/* Content */}
        <div className="flex gap-8">
          <div className="hidden md:block w-56 shrink-0">
            <FilterSidebar
              filterLabel="Category"
              filterItems={categories}
              selectedItems={selectedCategories}
              onItemsChange={setSelectedCategories}
              stockFilters={stockFilters}
              onStockChange={setStockFilters}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              maxPrice={maxPrice}
            />
          </div>
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">No products available</p>
                <Link to="/" className="text-primary font-semibold mt-4 inline-block">Browse all products</Link>
              </div>
            ) : (
              <ProductGrid products={filtered} />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BrandPage;
