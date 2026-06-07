import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MainLayout from "@/components/layout/MainLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useBusinessTypeLanding } from "@/hooks/useBusinessTypeLanding";
import NotFound from "./NotFound";
import { BRAND } from "@/config/brand";

const CHIP_CLASSES =
  "inline-flex items-center rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground transition hover:ring-2 hover:ring-primary/20 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

const BusinessTypeLandingPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useBusinessTypeLanding(slug);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-4 w-40 mb-4" />
          <Skeleton className="h-9 w-60 mb-8" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mb-8">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 w-32 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">
            Something went wrong loading this page. Please try again.
          </p>
        </div>
      </MainLayout>
    );
  }

  if (!data) {
    return <NotFound />;
  }

  const { businessType, groups } = data;
  const label = businessType.label;
  const canonical = `/business/${slug}`;
  const description = `Wholesale ${label.toLowerCase()} supplies in Myanmar: tableware, kitchen equipment, linen, and more. Free quotes, nationwide delivery.`;
  const title = `${label} Supplies & Equipment — ${BRAND.name}`;

  return (
    <MainLayout>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        {businessType.image_url && (
          <meta property="og:image" content={businessType.image_url} />
        )}
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs segments={[{ label }]} />

        <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-8">
          {label}
        </h1>

        {groups.length === 0 ? (
          <div className="rounded-lg border border-border bg-background p-8 text-center">
            <p className="text-foreground mb-4">
              We're still curating this section.
            </p>
            <Link
              to="/products"
              className="text-primary font-medium hover:underline"
            >
              Browse our full catalog →
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {groups.map((group) => (
                <section key={group.parent.id}>
                  <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
                    {group.parent.name}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/category/${sub.slug}`}
                        className={CHIP_CLASSES}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-12 rounded-lg border border-border bg-background p-6 md:p-8">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                Need help finding the right products?
              </h3>
              <p className="text-muted-foreground mb-4">
                Our team can put together a tailored quote for your{" "}
                {label.toLowerCase()} business.
              </p>
              <div className="flex flex-wrap gap-3">
                {/* "Browse all {label} products" hidden in v1 — phase 2 once ?business= filter exists */}
                <Button asChild>
                  <Link to="/request-quote">Get a Quote →</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default BusinessTypeLandingPage;
