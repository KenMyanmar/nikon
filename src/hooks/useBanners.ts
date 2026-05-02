import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  position: string;
  sort_order: number;
};

export type BannerPosition = "hero" | "promotional" | "category";

/**
 * Fetch active banners for a given position, respecting the optional
 * starts_at / ends_at scheduling window. Sorted by sort_order ASC.
 *
 * Banners are CRM-managed; stale time matches the project caching policy
 * (5 minutes — see Core memory).
 */
export const useBanners = (position: BannerPosition) => {
  return useQuery({
    queryKey: ["banners", position],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("banners")
        .select(
          "id, title, subtitle, image_url, link_url, position, sort_order"
        )
        .eq("position", position)
        .eq("is_active", true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return (data ?? []) as Banner[];
    },
    staleTime: 5 * 60 * 1000,
  });
};
