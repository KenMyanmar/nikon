import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Ear, PenRuler, Wrench } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useServices } from "@/hooks/useServices";
import ServiceCard from "@/components/services/ServiceCard";

const TITLE = "Our Services — IKON Mart";
const DESC =
  "Turnkey hospitality solutions: commercial laundry design, kitchen installation, distribution, maintenance, and training across Myanmar.";

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

const STEPS = [
  {
    icon: Ear,
    title: "Listen",
    body:
      "We listen carefully to what your goals are and tailor the advice and products we recommend using decades of experience.",
  },
  {
    icon: PenRuler,
    title: "Design & Source",
    body:
      "Our well-trained staff designs the layout and sources the right equipment, building it around how your business actually runs.",
  },
  {
    icon: Wrench,
    title: "Install, Train, Support",
    body:
      "Superior installation, hands-on training, and ongoing maintenance — we are always there to meet challenges as they arise.",
  },
];

const PROJECTS = ["Strand Hotel", "Kempinski Naypyidaw", "Novotel Max"];

export default function ServicesPage() {
  const { data: services, isLoading } = useServices();

  useEffect(() => {
    document.title = TITLE;
    setMeta("description", DESC);
    setMeta("og:title", TITLE, "property");
    setMeta("og:description", DESC, "property");
  }, []);

  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
            Turnkey Solutions To the Highest Standards
          </h1>
          <p className="mt-5 text-base md:text-lg text-primary-foreground/80">
            Over two decades, IKON has designed and delivered new concepts in
            restaurant, laundry, and kitchen operations for enterprise customers
            across Myanmar.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/request-quote">
                Request a Quote <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/brands">View Our Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border bg-muted/40">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          Over 100 laundries delivered · Strand Hotel · Kempinski Naypyidaw ·
          Novotel Max — main kitchens designed and installed by IKON.
        </div>
      </section>

      {/* Services grid */}
      <section className="container mx-auto px-4 py-14">
        <div className="max-w-2xl mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            Technical Services Encompass
          </h2>
          <p className="mt-2 text-muted-foreground">
            From concept to opening day — and every service call after.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full h-44" />
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-9 w-32 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : services && services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-10 text-center">
              <h3 className="text-lg font-semibold text-foreground">
                Services coming soon
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We're finalising our service offering for the new e-mall. In the
                meantime, get in touch and we'll tailor a turnkey proposal.
              </p>
              <Button asChild className="mt-5">
                <Link to="/contact">
                  Get in touch <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* How we deliver */}
      <section className="bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 py-14">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              How We Deliver
            </h2>
            <p className="mt-2 text-muted-foreground">
              A consistent process refined over hundreds of hospitality
              installations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Step {i + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {step.body}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Notable projects */}
      <section className="container mx-auto px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              Notable Projects
            </h2>
            <p className="mt-2 text-muted-foreground">
              Marquee installations across Myanmar's hospitality sector.
            </p>
          </div>
          <Link
            to="/about#projects"
            className="text-sm font-medium text-primary hover:underline"
          >
            See all projects →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROJECTS.map((p) => (
            <Card key={p}>
              <CardContent className="p-6">
                <p className="text-base font-semibold text-foreground">{p}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Designed and installed by IKON.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-14 text-center max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Have a project in mind?
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            Tell us your goals — we'll tailor a turnkey proposal.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/request-quote">
                Request a Quote <ArrowRight className="w-4 h-4 ml-1" />
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
    </MainLayout>
  );
}
