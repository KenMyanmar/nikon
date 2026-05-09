import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Service {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  long_description: string | null;
  icon: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_query: string | null;
  is_featured: boolean | null;
  sort_order: number | null;
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Service[]> => {
      const { data, error } = await supabase
        .from("services" as any)
        .select(
          "id, slug, title, short_description, long_description, icon, image_url, cta_label, cta_query, is_featured, sort_order"
        )
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Service[];
    },
  });
}
