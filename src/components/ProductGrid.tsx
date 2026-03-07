import ProductCard from "./ProductCard";

interface Product {
  id: string;
  slug: string;
  description: string;
  short_description?: string | null;
  brand_name?: string | null;
  selling_price?: number | null;
  currency?: string | null;
  stock_status?: string | null;
  stock_code?: string | null;
  moq?: number | null;
  thumbnail_url?: string | null;
}

interface ProductGridProps {
  products: Product[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          image={p.thumbnail_url || "/placeholder.svg"}
          title={p.description}
          brand={p.brand_name || ""}
          specs={p.short_description || undefined}
          price={p.selling_price ? Number(p.selling_price) : null}
          currency={p.currency || "MMK"}
          moq={p.moq || undefined}
          stockStatus={(p.stock_status as "in_stock" | "low_stock" | "out_of_stock") || "in_stock"}
          sku={p.stock_code || ""}
          slug={p.slug}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
