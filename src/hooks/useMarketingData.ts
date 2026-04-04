import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FlashDeal {
  id: string;
  product_id: string;
  flash_price: number;
  original_price: number;
  discount_percentage: number | null;
  end_time: string;
  start_time: string;
  sold_count: number | null;
  stock_limit: number;
  badge_text: string | null;
  title: string | null;
  sort_order: number | null;
}

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  type: string;
  discount_value: number | null;
  applies_to: string;
  target_ids: string[] | null;
  start_date: string;
  end_date: string;
  banner_image_url: string | null;
  buy_quantity: number | null;
  get_quantity: number | null;
  priority: number | null;
  min_order_amount: number | null;
  max_discount_amount: number | null;
}

export const useFlashDeals = () => {
  return useQuery({
    queryKey: ["flash-deals-active"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("flash_deals")
        .select("*")
        .eq("is_active", true)
        .lte("start_time", now)
        .gte("end_time", now)
        .order("sort_order");
      if (error) throw error;
      return (data || []) as FlashDeal[];
    },
    staleTime: 60 * 1000,
  });
};

export const usePromotions = () => {
  return useQuery({
    queryKey: ["promotions-active"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", now)
        .gte("end_date", now)
        .order("priority", { ascending: false });
      if (error) throw error;
      return (data || []) as Promotion[];
    },
    staleTime: 60 * 1000,
  });
};

export const useMarketingData = () => {
  const { data: flashDeals = [] } = useFlashDeals();
  const { data: promotions = [] } = usePromotions();

  const flashDealMap = new Map<string, FlashDeal>();
  flashDeals.forEach((fd) => flashDealMap.set(fd.product_id, fd));

  const getFlashDeal = (productId: string): FlashDeal | undefined => {
    return flashDealMap.get(productId);
  };

  const getPromotion = (
    productId: string,
    categoryId?: string | null,
    brandId?: string | null
  ): Promotion | undefined => {
    return promotions.find((promo) => {
      if (promo.applies_to === "all") return true;
      if (promo.applies_to === "product" && promo.target_ids?.includes(productId)) return true;
      if (promo.applies_to === "category" && categoryId && promo.target_ids?.includes(categoryId)) return true;
      if (promo.applies_to === "brand" && brandId && promo.target_ids?.includes(brandId)) return true;
      return false;
    });
  };

  return { flashDeals, promotions, getFlashDeal, getPromotion };
};

export type { FlashDeal, Promotion };
