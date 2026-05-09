import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const SECTION_TITLE = "Trusted by Leading Hotels & Restaurants";

interface ClientLogo {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
}

export default function ClientLogos() {
  const { data: logos, isLoading } = useQuery({
    queryKey: ["client-logos-featured"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<ClientLogo[]> => {
      const { data, error } = await supabase
        .from("client_logos")
        .select("id, name, logo_url, website_url")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ClientLogo[];
    },
  });

  if (!isLoading && (!logos || logos.length === 0)) {
    return null;
  }

  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex items-center gap-4 mb-8 md:mb-10">
          <div className="flex-1 border-t border-border" />
          <h2 className="text-center text-base md:text-lg font-medium text-foreground whitespace-nowrap">
            {SECTION_TITLE}
          </h2>
          <div className="flex-1 border-t border-border" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6 items-center">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center justify-center p-3 md:p-4">
                  <Skeleton className="h-12 md:h-16 w-full" />
                </div>
              ))
            : logos!.map((logo) => {
                const img = (
                  <img
                    src={logo.logo_url}
                    alt={logo.name}
                    title={logo.name}
                    loading="lazy"
                    className="max-h-12 md:max-h-16 w-auto opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-200"
                  />
                );
                return (
                  <div
                    key={logo.id}
                    className="flex items-center justify-center p-3 md:p-4"
                  >
                    {logo.website_url ? (
                      <a
                        href={logo.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={logo.name}
                      >
                        {img}
                      </a>
                    ) : (
                      img
                    )}
                  </div>
                );
              })}
        </div>
      </div>
    </section>
  );
}
