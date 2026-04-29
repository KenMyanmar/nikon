import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  Phone, Mail, MapPin, Clock, MessageCircle, Check, ChevronRight,
  Send, Briefcase, Wrench, ShoppingBag, Hammer, Globe,
} from "lucide-react";

/* ─── Smooth scroll on hash change ─── */
function useScrollToHash() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);
}

const HERO_BG =
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1920&q=70";
const KITCHEN_BG =
  "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&w=1200&q=70";

const MAPS_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3818.6!2d96.13!3d16.91!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDU0JzM2LjAiTiA5NsKwMDcnNDguMCJF!5e0!3m2!1sen!2smm!4v1!5m2!1sen!2smm";

const BUSINESS_TYPES = ["Restaurant", "Hotel", "Cafe", "Catering"] as const;
const INQUIRY_TYPES = [
  "Equipment purchase",
  "Maintenance service",
  "Kitchen project",
  "General inquiry",
] as const;

const DEPARTMENTS = [
  { icon: Briefcase, label: "Sales", email: "sales@ikonmart.com" },
  { icon: Hammer, label: "Projects", email: "project@ikonmart.com" },
  { icon: Wrench, label: "Service", email: "service@ikonmart.com" },
  { icon: ShoppingBag, label: "Spares", email: "spares@ikonmart.com" },
  { icon: Globe, label: "E-commerce", email: "ecomm@ikonse.com" },
];

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  company: z.string().trim().max(150).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").max(255),
  business_type: z.array(z.string()).max(10),
  inquiry_type: z.array(z.string()).max(10),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

type InfoCard = {
  icon: typeof Phone;
  label: string;
  lines: string[];
  borderClass: string;
  badgeBgClass: string;
  labelColorClass: string;
  action?: { text: string; href: string };
};

const INFO_CARDS: InfoCard[] = [
  {
    icon: Phone,
    label: "CALL US",
    lines: ["01-8650230", "01-8650231"],
    borderClass: "border-l-primary",
    badgeBgClass: "bg-primary",
    labelColorClass: "text-primary",
    action: { text: "Chat with Sales Team", href: "#inquiry" },
  },
  {
    icon: Mail,
    label: "EMAIL",
    lines: ["webadmin@ikonmart.com"],
    borderClass: "border-l-amber-500",
    badgeBgClass: "bg-amber-500",
    labelColorClass: "text-amber-600",
    action: { text: "Chat with Sales Team", href: "#inquiry" },
  },
  {
    icon: MapPin,
    label: "VISIT OUR OFFICE",
    lines: ["No.11 Swal Taw Street,", "Mingalardon Township, Yangon"],
    borderClass: "border-l-emerald-600",
    badgeBgClass: "bg-emerald-600",
    labelColorClass: "text-emerald-700",
  },
  {
    icon: Clock,
    label: "BUSINESS HOURS",
    lines: ["Mon – Sat", "9:00 AM – 5:00 PM"],
    borderClass: "border-l-amber-400",
    badgeBgClass: "bg-amber-400",
    labelColorClass: "text-amber-600",
  },
];

const Contact = () => {
  useScrollToHash();

  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    message: "",
  });
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  const [inquiryTypes, setInquiryTypes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggle = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = inquirySchema.safeParse({
      ...form,
      business_type: businessTypes,
      inquiry_type: inquiryTypes,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_inquiries").insert({
      name: parsed.data.name,
      company: parsed.data.company || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email,
      business_type: parsed.data.business_type,
      inquiry_type: parsed.data.inquiry_type,
      message: parsed.data.message || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to send inquiry. Please try again.");
      return;
    }
    toast.success("Inquiry sent — our team will reach out shortly.");
    setForm({ name: "", company: "", phone: "", email: "", message: "" });
    setBusinessTypes([]);
    setInquiryTypes([]);
  };

  return (
    <MainLayout>
      {/* ═══ Section 1: Hero ═══ */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#0f1729]/85 via-[#1B3A5C]/55 to-transparent"
          aria-hidden
        />
        <div className="relative container mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="max-w-2xl text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Contact IKON Mart
            </h1>
            <p className="mt-4 text-base md:text-lg text-white/85 max-w-xl">
              Our team is ready to assist with equipment sourcing, kitchen planning, and HoReCa procurement.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#contact-info"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full font-medium hover:bg-primary/90 transition shadow-card"
              >
                <Phone className="w-4 h-4" /> Call Us
              </a>
              <a
                href="#contact-info"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-full font-medium hover:bg-[#1ebe57] transition shadow-card"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp / Viber
              </a>
              <a
                href="#inquiry"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full font-medium hover:bg-primary/90 transition shadow-card"
              >
                <Send className="w-4 h-4" /> Send Inquiry
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: Contact Info Cards ═══ */}
      <section id="contact-info" className="bg-ikon-bg-secondary py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INFO_CARDS.map((c) => (
              <div
                key={c.label}
                className={`bg-card rounded-card shadow-card p-5 border-l-4 ${c.borderClass} flex flex-col`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${c.badgeBgClass} text-white`}
                  >
                    <c.icon className="w-5 h-5" />
                  </div>
                  <h3 className={`text-xs font-bold tracking-wide ${c.labelColorClass}`}>
                    {c.label}
                  </h3>
                </div>
                <div className="mt-3 space-y-0.5">
                  {c.lines.map((l) => (
                    <p key={l} className="text-sm font-medium text-foreground">
                      {l}
                    </p>
                  ))}
                </div>
                {c.action && (
                  <a
                    href={c.action.href}
                    className={`mt-3 pt-3 border-t border-border/60 inline-flex items-center justify-between text-sm font-medium ${c.labelColorClass} hover:underline`}
                  >
                    <span>{c.action.text}</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 3: Map + Inquiry Form ═══ */}
      <section className="bg-card py-14">
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Map */}
          <div>
            <div className="rounded-card overflow-hidden shadow-card border border-border bg-card">
              <iframe
                src={MAPS_EMBED}
                width="100%"
                height="380"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="IKON Mart office location"
              />
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=No.11+Swal+Taw+Street+Mingalardon+Yangon"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-button font-medium hover:bg-primary/90 transition shadow-card"
            >
              <MapPin className="w-4 h-4" /> Get Directions
            </a>
          </div>

          {/* Right: Form */}
          <form
            id="inquiry"
            onSubmit={onSubmit}
            className="bg-card rounded-card shadow-card p-6 border border-border"
          >
            <h2 className="text-2xl font-bold text-foreground mb-1">Send Us an Inquiry</h2>
            <p className="text-muted-foreground mb-5 text-sm">
              Fill in the details and our team will get back to you.
            </p>

            <div className="space-y-3">
              <input
                required
                maxLength={100}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name *"
                className="w-full px-3 py-2.5 rounded-button border border-input bg-background text-sm outline-none focus:border-primary"
              />
              <input
                maxLength={150}
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company / Hotel"
                className="w-full px-3 py-2.5 rounded-button border border-input bg-background text-sm outline-none focus:border-primary"
              />
              <input
                maxLength={40}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone / WhatsApp"
                className="w-full px-3 py-2.5 rounded-button border border-input bg-background text-sm outline-none focus:border-primary"
              />
              <input
                required
                type="email"
                maxLength={255}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email *"
                className="w-full px-3 py-2.5 rounded-button border border-input bg-background text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-foreground mb-2">Business Type</p>
              <div className="flex flex-wrap gap-2">
                {BUSINESS_TYPES.map((t) => {
                  const on = businessTypes.includes(t);
                  return (
                    <button
                      type="button"
                      key={t}
                      onClick={() => toggle(businessTypes, setBusinessTypes, t)}
                      className={`px-4 py-1.5 rounded-full text-sm border transition ${
                        on
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-input hover:border-primary"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-foreground mb-2">Inquiry Type</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {INQUIRY_TYPES.map((t) => {
                  const on = inquiryTypes.includes(t);
                  return (
                    <label
                      key={t}
                      className="flex items-center gap-2 text-sm cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggle(inquiryTypes, setInquiryTypes, t)}
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <span className="text-foreground">{t}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <textarea
              maxLength={1000}
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell us a bit more about your project (optional)"
              className="mt-5 w-full px-3 py-2.5 rounded-button border border-input bg-background text-sm outline-none focus:border-primary resize-none"
            />

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-button font-semibold hover:bg-primary/90 transition disabled:opacity-60"
            >
              {submitting ? "Sending..." : (
                <>
                  Send Inquiry <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* ═══ Section 4: Why Contact IKON Mart? ═══ */}
      <section className="bg-ikon-bg-secondary py-14">
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
              Why Contact IKON Mart?
            </h2>
            <ul className="space-y-3">
              {[
                "30+ years HoReCa experience",
                "International equipment brands",
                "Professional kitchen planning",
                "Installation & after-sales service",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex w-6 h-6 items-center justify-center rounded-full bg-emerald-600/15 text-emerald-700 shrink-0">
                    <Check className="w-4 h-4" />
                  </span>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-card shadow-card aspect-[4/3] bg-cover bg-center"
            style={{ backgroundImage: `url(${KITCHEN_BG})` }}
            aria-hidden
          />
        </div>
      </section>

      {/* ═══ Section 5: Departments ═══ */}
      <section id="departments" className="bg-card py-14">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            Contact by Department
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DEPARTMENTS.map((d) => (
              <a
                key={d.label}
                href={`mailto:${d.email}`}
                className="bg-card rounded-card border border-border hover:shadow-card-hover hover:-translate-y-0.5 transition p-4 flex items-center gap-3"
              >
                <div className="shrink-0 w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <d.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground leading-tight">{d.label}</p>
                  <p className="text-sm text-muted-foreground truncate">{d.email}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Contact;
