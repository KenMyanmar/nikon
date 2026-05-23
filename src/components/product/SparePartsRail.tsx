import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";

interface Props {
  productId: string;
}

/**
 * Reverse-lookup rail for spare parts whose parent_equipment_id matches the
 * current equipment product. Hidden entirely when no spares are linked.
 */
const SparePartsRail = ({ productId }: Props) => {
  const { data: spares } = useQuery({
    queryKey: ["spare-parts", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products_public")
        .select(
          "id, slug, description, short_description, brand_name, selling_price, currency, stock_status, stock_code, moq, thumbnail_url, is_featured, onhand_qty, unit_of_measure",
        )
        .eq("parent_equipment_id", productId)
        .eq("is_active", true)
        .limit(8);
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!spares || spares.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold text-foreground">Spare Parts</h2>
        <span className="text-xs text-muted-foreground">
          Compatible accessories for this equipment
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {spares.map((p) => (
          <ProductCard
            key={p.id}
            id={p.id || ""}
            image={p.thumbnail_url || "/placeholder.svg"}
            title={p.description || ""}
            brand={p.brand_name || ""}
            specs={p.short_description || undefined}
            price={p.selling_price ? Number(p.selling_price) : null}
            currency={p.currency || "MMK"}
            moq={p.moq || undefined}
            stockStatus={
              (p.stock_status as "in_stock" | "low_stock" | "out_of_stock") ||
              "in_stock"
            }
            sku={p.stock_code || ""}
            slug={p.slug || ""}
            isFeatured={p.is_featured || false}
            onhandQty={p.onhand_qty || undefined}
            unitOfMeasure={p.unit_of_measure || undefined}
          />
        ))}
      </div>
    </section>
  );
};

export default SparePartsRail;
