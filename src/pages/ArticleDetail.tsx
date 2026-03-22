import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Eye, BookOpen, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  featured_image_url: string | null;
  tags: string[] | null;
  published_at: string | null;
  view_count: number | null;
  author_name: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

const TAG_DISPLAY: Record<string, string> = {
  kitchen: "Kitchen Equipment Guides",
  insights: "Hospitality Trends",
  brands: "Brand Spotlights",
  care: "Care & Maintenance",
  guides: "Buyer's Guides",
};

const TAG_COLORS: Record<string, string> = {
  kitchen: "bg-blue-100 text-blue-700",
  insights: "bg-purple-100 text-purple-700",
  brands: "bg-green-100 text-green-700",
  care: "bg-orange-100 text-orange-700",
  guides: "bg-rose-100 text-rose-700",
};

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["emall-article", slug],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      if (error) throw error;
      return data as Article;
    },
    enabled: !!slug,
  });

  // Increment view count
  useEffect(() => {
    if (article?.id) {
      (supabase as any).rpc("increment_article_views", { article_id: article.id });
    }
  }, [article?.id]);

  // Set page title
  useEffect(() => {
    if (article) {
      document.title = article.meta_title || article.title;
    }
    return () => { document.title = "IKON E-Mall"; };
  }, [article]);

  const { data: related = [] } = useQuery({
    queryKey: ["emall-related-articles", article?.id, article?.tags],
    queryFn: async () => {
      if (!article?.tags?.length) return [];
      const { data } = await (supabase as any)
        .from("articles")
        .select("id, title, slug, excerpt, featured_image_url, tags, published_at, view_count")
        .eq("status", "published")
        .overlaps("tags", article.tags)
        .neq("id", article.id)
        .order("published_at", { ascending: false })
        .limit(3);
      return (data || []) as Article[];
    },
    enabled: !!article,
    staleTime: 5 * 60 * 1000,
  });

  const firstTag = article?.tags?.[0];
  const tagDisplayName = firstTag ? TAG_DISPLAY[firstTag] || "Resources" : "Resources";

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="aspect-[16/9] rounded-lg" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </MainLayout>
    );
  }

  if (error || !article) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Article Not Found</h1>
          <p className="text-gray-500 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Link to="/articles" className="text-[#f59e0b] font-medium hover:underline">
            ← Back to Resources
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumbs
          segments={[
            { label: "Resources", href: "/articles" },
            { label: tagDisplayName, href: firstTag ? `/articles?tag=${firstTag}` : "/articles" },
            { label: article.title },
          ]}
        />

        {/* Header */}
        <div className="mt-6 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-500">
            <span>By {article.author_name || "IKON Editorial"}</span>
            {article.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(article.published_at), "MMMM d, yyyy")}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {article.view_count || 0} views
            </span>
          </div>
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/articles?tag=${tag}`}
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${TAG_COLORS[tag] || "bg-gray-100 text-gray-600"}`}
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Featured Image */}
        {article.featured_image_url && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={article.featured_image_url}
              alt={article.title}
              className="w-full max-h-[400px] object-cover"
            />
          </div>
        )}

        {/* Body */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-[#f59e0b] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-[#f59e0b] prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        {/* CTA Banner */}
        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-6 md:p-8 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Need help choosing the right equipment?</h3>
          <p className="text-gray-600 text-sm mb-5">Our team has 30+ years of experience outfitting hotels, restaurants, and cafés across Myanmar.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/request-quote"
              className="px-6 py-2.5 bg-[#f59e0b] text-[#1a1f36] font-semibold rounded-lg hover:bg-[#d97706] transition-colors"
            >
              Get a Quote →
            </Link>
            <Link
              to="/"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:border-[#f59e0b] hover:text-[#f59e0b] transition-colors"
            >
              Browse Products →
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/articles/${r.slug}`}
                  className="group block rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[16/10] bg-gradient-to-br from-[#1a1f36] to-[#2d3561] overflow-hidden">
                    {r.featured_image_url ? (
                      <img src={r.featured_image_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-white/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-1.5">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-[#f59e0b] transition-colors">
                      {r.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {r.published_at && <span>{format(new Date(r.published_at), "MMM d")}</span>}
                      <span>{r.view_count || 0} views</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-10 pt-6 border-t border-gray-100">
          <Link to="/articles" className="text-[#f59e0b] font-medium text-sm flex items-center gap-1 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Resources
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default ArticleDetail;
