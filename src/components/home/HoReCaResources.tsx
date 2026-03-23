import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  tags: string[] | null;
}

const TAG_DISPLAY: Record<string, string> = {
  kitchen: "Kitchen Guides",
  insights: "Hospitality Trends",
  brands: "Brand Spotlights",
  care: "Care & Maintenance",
  guides: "Buyer's Guides",
};

const HoReCaResources = () => {
  const { data: articles } = useQuery({
    queryKey: ["homepage-articles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("articles" as any)
        .select("id, title, slug, excerpt, featured_image_url, tags")
        .eq("status", "published")
        .order("is_featured", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(3);
      return (data as unknown as Article[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!articles || articles.length === 0) return null;

  return (
    <section className="bg-background py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-2">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              HoReCa Resources
            </h2>
            <p className="text-muted-foreground mt-2">
              Tips, guides, and insights for hospitality professionals
            </p>
          </div>
          <Link
            to="/articles"
            className="text-sm font-medium text-[#F97316] hover:underline inline-flex items-center gap-1"
          >
            View All Articles <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => {
            const firstTag = article.tags?.[0];
            return (
              <Link
                key={article.id}
                to={`/articles/${article.slug}`}
                className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 max-w-[340px] mx-auto w-full"
              >
                <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                  {article.featured_image_url ? (
                    <img
                      src={article.featured_image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      {firstTag && (
                        <span className="text-sm font-medium text-muted-foreground">
                          {TAG_DISPLAY[firstTag] || firstTag}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {firstTag && (
                    <span className="text-xs uppercase font-semibold text-[#F97316]">
                      {TAG_DISPLAY[firstTag] || firstTag}
                    </span>
                  )}
                  <h3 className="text-base font-semibold text-foreground line-clamp-2 mt-1 group-hover:text-[#F97316] transition-colors">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {article.excerpt}
                    </p>
                  )}
                  <span className="text-sm font-medium text-[#F97316] mt-3 inline-flex items-center gap-1">
                    Read More <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HoReCaResources;
