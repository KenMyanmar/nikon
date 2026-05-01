import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  MapPin, Phone, Mail, Clock, Facebook, Instagram,
  MessageCircle, MessageSquare, ChevronDown,
  Calendar, Award, BadgeCheck,
} from "lucide-react";

const ABOUT_LINKS = [
  { label: "Our Story", href: "/about" },
  { label: "Why IKON", href: "/about#why-ikon" },
  { label: "Our Brands", href: "/brands" },
  { label: "Our Projects", href: "/about#projects" },
  { label: "Showrooms", href: "/about#showrooms" },
  { label: "Careers", href: "/careers" },
];

const SERVICE_LINKS = [
  { label: "My Account", href: "/account" },
  { label: "Order Tracking", href: "/orders" },
  { label: "Shipping & Delivery", href: "/delivery-info" },
  { label: "Bulk Orders / Get a Quote", href: "/request-quote" },
  { label: "Contact Us", href: "/contact" },
];

const RESOURCE_LINKS = [
  { label: "Kitchen Equipment Guides", href: "/articles?tag=kitchen" },
  { label: "Hospitality Trends", href: "/articles?tag=insights" },
  { label: "Brand Spotlights", href: "/articles?tag=brands" },
  { label: "Care & Maintenance", href: "/articles?tag=care" },
  { label: "Buyer's Guides", href: "/articles?tag=guides" },
];

const SOCIALS = [
  { icon: Facebook, href: "https://facebook.com/ikonmart", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com/ikonmart", label: "Instagram" },
  { icon: MessageCircle, href: "https://m.me/ikonmart", label: "Messenger" },
  { icon: MessageSquare, href: "https://wa.me/95XXXXXXXXX", label: "WhatsApp" },
  { icon: Mail, href: "mailto:ikonmartecommerce@gmail.com", label: "Email" },
];

/**
 * Prompt 6: Pillars replaced concrete-claim copy. Vague "Luxury / Quality /
 * Reliability" exec-suite copy retained on /about Vision section, not Footer.
 * Icons rendered at 20px in muted-foreground (no amber, no decorative motion)
 * to keep visual emphasis on copy.
 */
const PILLARS = [
  { icon: Calendar, title: "Since 1995", tagline: "30 years supplying Myanmar HoReCa" },
  { icon: Award, title: "160+ Brands", tagline: "Authorized distributor network" },
  { icon: BadgeCheck, title: "CCI France Myanmar", tagline: "Member" },
];

const PAYMENTS = ["KBZ Pay", "Wave", "CB Pay", "Bank Transfer", "COD"];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Returns Policy", href: "/returns-policy" },
  { label: "Cookie Policy", href: "/cookies" },
];

/* ─── Accordion Section (mobile only) ─── */
function AccordionSection({
  title,
  children,
  open,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-primary-foreground/10 md:hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 text-primary-foreground/60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 pb-4" : "max-h-0"}`}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Link list renderer ─── */
function FooterLinks({ links }: { links: { label: string; href: string }[] }) {
  return (
    <ul className="space-y-2">
      {links.map((l) => (
        <li key={l.href}>
          <Link
            to={l.href}
            className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ─── Footer ─── */
const Footer = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["footer-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug, product_count")
        .eq("is_active", true)
        .eq("depth", 0)
        .order("sort_order", { ascending: true });
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const categoryLinks = [
    ...categories.slice(0, 10).map((c) => ({
      label: c.name,
      href: `/category/${c.slug}`,
    })),
  ];

  const toggle = (s: string) => setOpenSection(openSection === s ? null : s);

  const handleSubscribe = () => {
    if (email) {
      window.location.href = `mailto:ikonmartecommerce@gmail.com?subject=Newsletter%20Signup&body=Please add ${encodeURIComponent(email)} to the newsletter.`;
    }
  };

  return (
    <footer>
      {/* ──── ZONE 1: Newsletter ──── */}
      <div className="bg-primary/95">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-primary-foreground">
            Stay updated with new products & HoReCa insights
          </p>
          <div className="flex w-full gap-2 md:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="h-9 flex-1 rounded-md border border-primary-foreground/20 bg-primary px-3 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:border-accent focus:outline-none md:w-64"
            />
            <button
              onClick={handleSubscribe}
              className="h-9 whitespace-nowrap rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* ──── ZONE 2: Main Grid ──── */}
      <div className="bg-primary">
        <div className="container mx-auto px-4 py-10">
          {/* Desktop grid */}
          <div className="hidden gap-8 md:grid md:grid-cols-3 lg:grid-cols-5">
            {/* Col 1 — About */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                About IKON
              </h4>
              <FooterLinks links={ABOUT_LINKS} />
              <div className="mt-5 space-y-1.5 text-xs text-primary-foreground/70">
                <div className="flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>No. 11, Swal Taw Street, Kyan Khin Su Ward, Mingalardon Township, Yangon</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 shrink-0" />
                  <span>09 89009 0301</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span>ikonmartecommerce@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Col 2 — Categories (dynamic) */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                Shop by Category
              </h4>
              <FooterLinks links={categoryLinks} />
              <Link
                to="/flash-deals"
                className="mt-2 inline-block text-sm font-medium text-accent transition-colors hover:text-accent/80"
              >
                Flash Deals →
              </Link>
            </div>

            {/* Col 3 — Customer Service */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                Customer Service
              </h4>
              <FooterLinks links={SERVICE_LINKS} />
            </div>

            {/* Col 4 — Resources */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                Resources
              </h4>
              <FooterLinks links={RESOURCE_LINKS} />
            </div>

            {/* Col 5 — Connect */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                Connect
              </h4>
              <div className="mb-4 flex gap-3">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    <s.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
              <div className="space-y-1.5 text-xs text-primary-foreground/70">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 shrink-0" /> Mingalardon, Yangon
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 shrink-0" /> 09 89009 0301
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 shrink-0" /> Mon–Sat: 9:00 AM – 5:00 PM
                </div>
                <p className="mt-2 text-primary-foreground/60">CCI France Myanmar Member</p>
              </div>
            </div>
          </div>

          {/* Mobile accordion */}
          <div className="md:hidden">
            <AccordionSection title="About IKON" open={openSection === "about"} onToggle={() => toggle("about")}>
              <FooterLinks links={ABOUT_LINKS} />
              <div className="mt-3 space-y-1.5 text-xs text-primary-foreground/70">
                <div className="flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>No. 11, Swal Taw Street, Kyan Khin Su Ward, Mingalardon Township, Yangon</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 shrink-0" />
                  <span>09 89009 0301</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span>ikonmartecommerce@gmail.com</span>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection title="Shop by Category" open={openSection === "category"} onToggle={() => toggle("category")}>
              <FooterLinks links={categoryLinks} />
              <Link to="/flash-deals" className="mt-2 inline-block text-sm font-medium text-accent">
                Flash Deals →
              </Link>
            </AccordionSection>

            <AccordionSection title="Customer Service" open={openSection === "service"} onToggle={() => toggle("service")}>
              <FooterLinks links={SERVICE_LINKS} />
            </AccordionSection>

            <AccordionSection title="Resources" open={openSection === "resources"} onToggle={() => toggle("resources")}>
              <FooterLinks links={RESOURCE_LINKS} />
            </AccordionSection>

            {/* Connect — always visible on mobile */}
            <div className="border-t border-primary-foreground/10 pt-4">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground">
                Connect With Us
              </h4>
              <div className="mb-3 flex gap-4">
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="text-primary-foreground/70 hover:text-primary-foreground">
                    <s.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
              <div className="space-y-1.5 text-xs text-primary-foreground/70">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 shrink-0" /> Mingalardon, Yangon
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 shrink-0" /> 09 89009 0301
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 shrink-0" /> Mon–Sat: 9:00 AM – 5:00 PM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──── ZONE 3A: Concrete-claim Pillars (Prompt 6) ──── */}
      <div className="bg-primary/95 border-t border-primary-foreground/10">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-5 md:flex-row md:justify-around">
          {PILLARS.map((p) => (
            <div key={p.title} className="flex items-center gap-3">
              <p.icon className="h-5 w-5 shrink-0 text-primary-foreground/60" />
              <div>
                <p className="text-sm font-semibold text-primary-foreground">{p.title}</p>
                <p className="text-xs text-primary-foreground/70">{p.tagline}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──── ZONE 3B: Payment Methods ──── */}
      <div className="bg-primary/95 border-t border-primary-foreground/10">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-2 px-4 py-4">
          {PAYMENTS.map((p) => (
            <span
              key={p}
              className="rounded-full border border-primary-foreground/20 px-3 py-1 text-xs text-primary-foreground/70"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* ──── ZONE 3C: Copyright & Legal ──── */}
      <div className="bg-primary/95 border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-4 text-center">
          <p className="text-xs text-primary-foreground/60">
            © {new Date().getFullYear()} IKON Trading Co., Ltd. All rights reserved.
          </p>
          <div className="mt-1.5 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} to={l.href} className="text-xs text-primary-foreground/60 transition-colors hover:text-accent">
                {l.label}
              </Link>
            ))}
          </div>
          <p className="mt-1.5 text-xs italic text-primary-foreground/70">
            Myanmar's Trusted HoReCa Supplier Since 1995
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
