import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, FolderOpen } from "lucide-react";

const AllCategoriesPage = () => {
  const { data: mainCategories, isLoading: mainLoading } = useQuery({
    queryKey: ["main-categories-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, product_count")
        .eq("depth", 0)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: subCategories, isLoading: subLoading } = useQuery({
    queryKey: ["sub-categories-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, parent_id, product_count")
        .eq("depth", 1)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = mainLoading || subLoading;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">All Categories</span>
        </nav>

        <h1 className="text-3xl font-bold text-primary mb-10">All Categories</h1>

        {isLoading ? (
          <div className="space-y-10">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-7 w-48 mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-24 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {(mainCategories || []).map((main) => {
              const subs = (subCategories || []).filter((s) => s.parent_id === main.id);
              return (
                <section key={main.id}>
                  <Link
                    to={`/category/${main.slug}`}
                    className="text-xl font-bold text-primary mb-4 pb-2 border-b border-border block hover:text-accent transition"
                  >
                    {main.name}
                  </Link>
                  {subs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subs.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/category/${cat.slug}`}
                          className="group flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-md transition-all"
                        >
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FolderOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground group-hover:text-primary truncate">
                              {cat.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {cat.product_count} products
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No sub-categories yet.</p>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AllCategoriesPage;
