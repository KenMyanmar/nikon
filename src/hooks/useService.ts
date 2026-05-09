import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Service } from "@/hooks/useServices";

export function useService(slug: string | undefined) {
  return useQuery({
    queryKey: ["service", slug],
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Service | null> => {
      const { data, error } = await supabase
        .from("services" as any)
        .select(
          "id, slug, title, short_description, long_description, icon, image_url, cta_label, cta_query, is_featured, sort_order"
        )
        .eq("slug", slug as string)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Service) ?? null;
    },
  });
}
