import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ClientLogo {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
}

const ClientLogos = () => {
  const { data: logos } = useQuery({
    queryKey: ["client-logos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_logos")
        .select("id, name, logo_url, website_url")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as ClientLogo[];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!logos || logos.length === 0) return null;

  const LogoItem = ({ logo }: { logo: ClientLogo }) => {
    const img = (
      <img
        src={logo.logo_url}
        alt={logo.name}
        loading="lazy"
        className="h-[50px] md:h-[60px] w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:scale-105 transition-all duration-200"
      />
    );

    const wrapped = logo.website_url ? (
      <a href={logo.website_url} target="_blank" rel="noopener noreferrer">
        {img}
      </a>
    ) : (
      img
    );

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex-shrink-0 px-4 md:px-6 flex items-center justify-center">
            {wrapped}
          </div>
        </TooltipTrigger>
        <TooltipContent>{logo.name}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <section className="py-10 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Trusted By Our Clients
        </p>
        <p className="text-center text-xs text-muted-foreground mb-8 max-w-lg mx-auto">
          Premium hospitality brands across Myanmar rely on IKON Mart for quality supply solutions
        </p>
      </div>

      <TooltipProvider delayDuration={200}>
        <div className="relative group">
          <div className="flex animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-4">
            {logos.map((logo) => (
              <LogoItem key={logo.id} logo={logo} />
            ))}
            {/* Duplicate for seamless loop */}
            {logos.map((logo) => (
              <LogoItem key={`dup-${logo.id}`} logo={logo} />
            ))}
          </div>
        </div>
      </TooltipProvider>
    </section>
  );
};

export default ClientLogos;
