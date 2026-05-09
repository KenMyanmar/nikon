import { Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Service } from "@/hooks/useServices";

export default function ServiceCard({ service }: { service: Service }) {
  const IconComp =
    (service.icon &&
      (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
        service.icon
      ]) ||
    LucideIcons.Sparkles;

  const quoteHref = service.cta_query
    ? `/request-quote?${service.cta_query}`
    : `/request-quote?service=${service.slug}`;

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      {service.image_url ? (
        <img
          src={service.image_url}
          alt={service.title}
          className="w-full h-44 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-44 bg-muted flex items-center justify-center">
          <IconComp className="w-12 h-12 text-primary" />
        </div>
      )}
      <CardContent className="flex-1 flex flex-col gap-3 p-5">
        <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
        {service.short_description && (
          <p className="text-sm text-muted-foreground flex-1 whitespace-pre-wrap">
            {service.short_description}
          </p>
        )}
        <Button asChild variant="default" className="w-fit mt-auto">
          <Link to={quoteHref}>
            {service.cta_label || "Request a Quote"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
