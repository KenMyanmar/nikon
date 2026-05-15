import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/slugify";

export interface BusinessTypeLandingCategory {
  id: string;
  name: string;
  slug: string;
}

export interface BusinessTypeLandingGroup {
  parent: BusinessTypeLandingCategory;
  items: BusinessTypeLandingCategory[];
}

export interface BusinessTypeLandingData {
  businessType: {
    id: string;
    label: string;
    image_url: string | null;
    link_url: string | null;
  };
  groups: BusinessTypeLandingGroup[];
}

export const useBusinessTypeLanding = (slug: string | undefined) => {
  return useQuery({
    queryKey: ["business-type-landing", slug],
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<BusinessTypeLandingData | null> => {
      if (!slug) return null;

      // 1. Find the business type by slug-of-label
      const { data: types, error: typesErr } = await supabase
        .from("business_types")
        .select("id, label, image_url, link_url")
        .eq("is_active", true);
      if (typesErr) throw typesErr;

      const bt = (types ?? []).find((t) => slugify(t.label) === slug);
      if (!bt) return null;

      // 2. Pull active curated sub-categories with their parent main category
      const { data: mappings, error } = await supabase
        .from("business_type_subcategories")
        .select(
          `
          sort_order,
          created_at,
          category:categories!inner(
            id, name, slug, depth, parent_id, is_active,
            parent:categories!parent_id(id, name, slug, is_active)
          )
        `
        )
        .eq("business_type_id", bt.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;

      // 3. Filter mappings whose category went inactive (defense in depth)
      const active = (mappings ?? []).filter(
        (m: any) => m.category?.is_active
      );

      // 4. Group by parent main category, preserving sort_order within each group
      const grouped = new Map<string, BusinessTypeLandingGroup>();
      for (const m of active as any[]) {
        const cat = m.category;
        const parent = cat.depth === 0 ? cat : cat.parent;
        if (!parent) continue;
        if (!grouped.has(parent.id)) {
          grouped.set(parent.id, {
            parent: { id: parent.id, name: parent.name, slug: parent.slug },
            items: [],
          });
        }
        if (cat.depth === 1) {
          grouped.get(parent.id)!.items.push({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
          });
        }
      }

      // Drop groups with no chips
      const groups = Array.from(grouped.values()).filter(
        (g) => g.items.length > 0
      );

      return {
        businessType: {
          id: bt.id,
          label: bt.label,
          image_url: bt.image_url,
          link_url: bt.link_url,
        },
        groups,
      };
    },
  });
};
