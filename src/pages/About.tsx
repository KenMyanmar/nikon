import { useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { MapPin, Phone, Mail, ArrowRight, Sparkles, ShieldCheck, Handshake } from "lucide-react";
import { BRAND } from "@/config/brand";

/**
 * About page — generic template. Three short sections sourced from
 * BRAND constants in src/config/brand.ts. Replace the {TOKEN}
 * placeholders there to customize for a specific deployment.
 */
const PROMISES = [
  {
    icon: Sparkles,
    title: "{PROMISE_1_TITLE}",
    text: "{PROMISE_1_DESCRIPTION}",
  },
  {
    icon: ShieldCheck,
    title: "{PROMISE_2_TITLE}",
    text: "{PROMISE_2_DESCRIPTION}",
  },
  {
    icon: Handshake,
    title: "{PROMISE_3_TITLE}",
    text: "{PROMISE_3_DESCRIPTION}",
  },
];

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `About ${BRAND.name}`;
  }, []);

  return (
    <MainLayout>
      {/* Section 1: Our Story */}
      <section className="bg-primary py-16 md:py-24">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
            About {BRAND.name}
          </p>
          <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-5xl">
            Your Myanmar B2B Procurement Partner
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-primary-foreground/85 md:text-lg">
            {BRAND.tagline}
          </p>
        </div>
      </section>

      <section id="our-story" className="bg-background py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">Our Story</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            {`About ${BRAND.name} — your Myanmar B2B procurement partner. {ADD_YOUR_STORY_HERE}`}
          </p>
        </div>
      </section>

      {/* Section 2: Our Promise */}
      <section className="bg-muted/30 py-16 md:py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground md:text-3xl">
            Our Promise
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {PROMISES.map((p) => (
              <div key={p.title} className="rounded-md border border-border bg-card p-6">
                <p.icon className="mb-4 h-7 w-7 text-primary" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">{p.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Get in Touch */}
      <section id="contact" className="bg-background py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">Get in Touch</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{BRAND.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <span>{BRAND.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <span>{BRAND.email}</span>
            </div>
          </div>

          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Contact Us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </MainLayout>
  );
};

export default About;
