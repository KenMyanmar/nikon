import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Eye, BookOpen } from "lucide-react";
import { format } from "date-fns";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  tags: string[] | null;
  published_at: string | null;
  view_count: number | null;
  is_featured: boolean | null;
  author_name: string | null;
}

const TAG_FILTERS = [
  { label: "All", value: "" },
  { label: "Kitchen Guides", value: "kitchen" },
  { label: "Hospitality Trends", value: "insights" },
  { label: "Brand Spotlights", value: "brands" },
  { label: "Care & Maintenance", value: "care" },
  { label: "Buyer's Guides", value: "guides" },
];

const TAG_COLORS: Record<string, string> = {
  kitchen: "bg-blue-100 text-blue-700",
  insights: "bg-purple-100 text-purple-700",
  brands: "bg-green-100 text-green-700",
  care: "bg-orange-100 text-orange-700",
  guides: "bg-rose-100 text-rose-700",
};

const PAGE_SIZE = 9;

const ArticleCard = ({ article }: { article: Article }) => (
  <Link
    to={`/articles/${article.slug}`}
    className="group block max-w-[340px] w-full bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
  >
    <div className="aspect-[16/10] bg-gradient-to-br from-[#1a1f36] to-[#2d3561] overflow-hidden">
      {article.featured_image_url ? (
        <img
          src={article.featured_image_url}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-white/30" />
        </div>
      )}
    </div>
    <div className="p-4 space-y-2">
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {article.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[tag] || "bg-gray-100 text-gray-600"}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#f59e0b] transition-colors">
        {article.title}
      </h3>
      {article.excerpt && (
        <p className="text-sm text-gray-500 line-clamp-2">{article.excerpt}</p>
      )}
      <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
        {article.published_at && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(article.published_at), "MMM d, yyyy")}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {article.view_count || 0}
        </span>
      </div>
    </div>
  </Link>
);

const Articles = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get("tag") || "";
  const [page, setPage] = useState(0);

  const { data: featured } = useQuery({
    queryKey: ["emall-featured-article"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("articles")
        .select("id, title, slug, excerpt, featured_image_url, published_at, view_count, author_name, tags")
        .eq("status", "published")
        .eq("is_featured", true)
        .order("sort_order", { ascending: true })
        .limit(1)
        .single();
      return data as Article | null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["emall-articles", activeTag, page],
    queryFn: async () => {
      let query = (supabase as any)
        .from("articles")
        .select("id, title, slug, excerpt, featured_image_url, tags, published_at, view_count, is_featured, author_name")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(0, (page + 1) * PAGE_SIZE - 1);

      if (activeTag) {
        query = query.contains("tags", [activeTag]);
      }

      const { data } = await query;
      return (data || []) as Article[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleTagClick = (tag: string) => {
    setPage(0);
    if (tag) {
      setSearchParams({ tag });
    } else {
      setSearchParams({});
    }
  };

  const showFeatured = !activeTag && featured;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resources & Insights</h1>
          <p className="text-gray-500 mt-2">
            Expert guides, industry trends, and tips from IKON's 30+ years in Myanmar's hospitality industry.
          </p>
        </div>

        {/* Tag Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TAG_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleTagClick(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeTag === f.value
                  ? "bg-[#f59e0b] text-[#1a1f36] border-[#f59e0b]"
                  : "border-gray-300 text-gray-600 hover:border-[#f59e0b] hover:text-[#f59e0b]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Featured Hero */}
        {showFeatured && (
          <Link
            to={`/articles/${featured.slug}`}
            className="group mb-10 block rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-[60%] aspect-[16/10] md:aspect-auto bg-gradient-to-br from-[#1a1f36] to-[#2d3561] overflow-hidden">
                {featured.featured_image_url ? (
                  <img
                    src={featured.featured_image_url}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full min-h-[200px] flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white/20" />
                  </div>
                )}
              </div>
              <div className="md:w-[40%] p-6 flex flex-col justify-center space-y-3">
                {featured.tags && featured.tags.length > 0 && (
                  <div className="flex gap-1">
                    {featured.tags.map((t) => (
                      <span key={t} className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[t] || "bg-gray-100 text-gray-600"}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-[#f59e0b] transition-colors">
                  {featured.title}
                </h2>
                {featured.excerpt && <p className="text-gray-500 line-clamp-3">{featured.excerpt}</p>}
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  {featured.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(featured.published_at), "MMM d, yyyy")}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {featured.view_count || 0} views
                  </span>
                </div>
                <span className="text-[#f59e0b] font-medium text-sm">Read More →</span>
              </div>
            </div>
          </Link>
        )}

        {/* Article Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="max-w-[340px] w-full space-y-3">
                <Skeleton className="aspect-[16/10] rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No articles found</h3>
            <p className="text-gray-400 mt-1">Check back soon for new content.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center sm:justify-items-start">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            {articles.length >= (page + 1) * PAGE_SIZE && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-[#f59e0b] hover:text-[#f59e0b] transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Articles;
