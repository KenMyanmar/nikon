import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import * as LucideIcons from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useService } from "@/hooks/useService";
import { BRAND } from "@/config/brand";

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: service, isLoading, isError, refetch } = useService(slug);

  useEffect(() => {
    if (!service) return;
    document.title = `${service.title} — ${BRAND.name} Services`;
    setMeta(
      "description",
      service.short_description ??
        `${service.title} — turnkey hospitality solutions from ${BRAND.name}.`
    );
    setMeta("og:title", `${service.title} — ${BRAND.name}`, "property");
    setMeta(
      "og:description",
      service.short_description ?? `Turnkey hospitality solutions from ${BRAND.name}.`,
      "property"
    );
    if (service.image_url) {
      setMeta("og:image", service.image_url, "property");
    }
  }, [service]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs
          segments={[
            { label: "Services", href: "/services" },
            { label: service?.title ?? "…" },
          ]}
        />

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="w-full aspect-[4/3] md:aspect-[16/7] rounded-md" />
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-4/6" />
            <Skeleton className="h-12 w-48" />
          </div>
        ) : isError ? (
          <Card>
            <CardContent className="p-10 text-center space-y-4">
              <p className="text-foreground">
                Something went wrong loading this service.
              </p>
              <Button onClick={() => refetch()}>Retry</Button>
            </CardContent>
          </Card>
        ) : !service ? (
          <Card className="border-dashed">
            <CardContent className="p-10 text-center space-y-4">
              <h1 className="text-xl font-semibold text-foreground">
                This service isn't available.
              </h1>
              <p className="text-sm text-muted-foreground">
                It may have been removed or is not yet published.
              </p>
              <Button asChild variant="outline">
                <Link to="/services">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Services
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ServiceContent service={service} />
        )}
      </div>
    </MainLayout>
  );
}

function ServiceContent({ service }: { service: NonNullable<ReturnType<typeof useService>["data"]> }) {
  const IconComp =
    (service.icon &&
      (LucideIcons as unknown as Record<
        string,
        React.ComponentType<{ className?: string }>
      >)[service.icon]) ||
    Sparkles;

  const quoteHref = service.cta_query
    ? `/request-quote?${service.cta_query}`
    : `/request-quote?service=${service.slug}`;
  const ctaLabel = service.cta_label || "Request a Quote";

  return (
    <article className="max-w-4xl mx-auto">
      {/* Hero */}
      {service.image_url ? (
        <img
          src={service.image_url}
          alt={service.title}
          className="w-full aspect-[4/3] md:aspect-[16/7] object-cover rounded-md border border-border"
        />
      ) : (
        <div className="w-full aspect-[4/3] md:aspect-[16/7] bg-muted flex items-center justify-center rounded-md border border-border">
          <IconComp className="w-20 h-20 text-primary" />
        </div>
      )}

      {/* Title + lede */}
      <header className="mt-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
          {service.title}
        </h1>
        {service.short_description && (
          <p className="mt-4 text-lg text-muted-foreground whitespace-pre-wrap">
            {service.short_description}
          </p>
        )}
      </header>

      {/* Body */}
      {service.long_description && (
        <div className="mt-8 prose prose-neutral max-w-none whitespace-pre-wrap text-foreground">
          {service.long_description}
        </div>
      )}

      {/* CTA banner */}
      <section className="mt-12 bg-primary text-primary-foreground rounded-md">
        <div className="px-6 py-10 text-center">
          <h2 className="text-2xl font-semibold">
            Request a Quote for {service.title}
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            Tell us your goals — we'll tailor a turnkey proposal.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to={quoteHref}>
                {ctaLabel} <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Back link */}
      <div className="mt-10">
        <Link
          to="/services"
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> All services
        </Link>
      </div>
    </article>
  );
}
