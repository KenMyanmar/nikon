import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import ProductGrid from "@/components/ProductGrid";
import { formatToMMT } from "@/utils/timezone";
import { Skeleton } from "@/components/ui/skeleton";

const PromotionDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: promotion, isLoading: promoLoading } = useQuery({
    queryKey: ["promotion", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["promotion-products", promotion?.target_ids],
    queryFn: async () => {
      if (!promotion?.target_ids || promotion.target_ids.length === 0) return [];
      const { data, error } = await supabase
        .from("products")
        .select("id, description, slug, thumbnail_url, selling_price, unit_cost, stock_status, brand_id, category_id, currency, min_qty, is_active")
        .in("id", promotion.target_ids)
        .eq("is_active", true);
      if (error) throw error;
      return (data || []).map((p) => ({
        ...p,
        brand_name: null,
        brand_logo: null,
      }));
    },
    enabled: !!promotion?.target_ids && promotion.target_ids.length > 0,
  });

  const getDiscountLabel = () => {
    if (!promotion?.discount_value) return null;
    if (promotion.type === "percentage") return `${promotion.discount_value}% OFF`;
    if (promotion.type === "fixed_amount") return `Save ${Number(promotion.discount_value).toLocaleString()} MMK`;
    return null;
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {promoLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        ) : promotion ? (
          <>
            {/* Header */}
            {promotion.banner_image_url && (
              <div className="relative h-[180px] md:h-[240px] rounded-xl overflow-hidden mb-6">
                <img
                  src={promotion.banner_image_url}
                  alt={promotion.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{promotion.title}</h1>
                {getDiscountLabel() && (
                  <span className="bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1 rounded-full">
                    {getDiscountLabel()}
                  </span>
                )}
              </div>
              {promotion.description && (
                <p className="text-muted-foreground mt-2">{promotion.description}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Valid until {formatToMMT(promotion.end_date, "full")}
              </p>
            </div>

            {/* Products */}
            {productsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <p className="text-center py-12 text-muted-foreground">
                No products found for this promotion.
              </p>
            )}
          </>
        ) : (
          <p className="text-center py-12 text-muted-foreground">Promotion not found.</p>
        )}
      </div>
    </MainLayout>
  );
};

export default PromotionDetail;
