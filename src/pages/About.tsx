import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import {
  Sparkles, ShieldCheck, Handshake, MapPin, Phone, Mail, Clock,
  ChefHat, WashingMachine, Wrench, GraduationCap, ArrowRight,
  Users, MessageSquare, TrendingUp, Award,
} from "lucide-react";

/* ─── Smooth scroll to hash on mount ─── */
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

/* ─── Timeline data ─── */
const TIMELINE = [
  { year: "1995", title: "Johnson Wax Professional", desc: "IKON Business derived from supplying Johnson Wax Professional products." },
  { year: "2001", title: "HoReCa Supply Established", desc: "Hospitality supply business established, serving hotels, restaurants and catering operators across Myanmar." },
  { year: "2010", title: "IKON Trading Co., Ltd.", desc: "IKON Trading Co., Ltd was officially born, formalizing three decades of expertise into a full-service hospitality supply company." },
  { year: "2024", title: "IKON Mart Goes Digital", desc: "IKON Mart launched its online e-commerce platform, breaking geographical barriers and offering B2B and B2C customers access to products and services anytime, anywhere." },
  { year: "Today", title: "4,000+ Products, Hundreds of Clients", desc: "Myanmar's most prominent luxury hospitality one-stop service hub, offering thousands of globally esteemed products to hundreds of enterprise customers." },
];

const PILLARS = [
  { icon: Sparkles, title: "Luxury", text: "Products and services that exceed the expectations of the most discriminating customers. Customers who demand the best get the best from IKON. When you select our services and products, we make your business better, and your customers happier." },
  { icon: ShieldCheck, title: "Quality", text: "Carefully selected products that provide consistent and lasting value. Services that meet exacting standards of Myanmar's hospitality leaders. A management focus on delivering world-class products using efficient, reliable services. We take no shortcuts. We strive to provide enduring value to all our customers so you can focus on your competitive edge." },
  { icon: Handshake, title: "Reliability", text: "When you buy IKON, be assured that your customers will be satisfied, each and every time. When we provide you turnkey services, you can be sure we'll be there for you. We are committed to earning your repeat business. Superior logistics, global sourcing and a strong focus on customer satisfaction make us your dependable friend in the hospitality business." },
];

const STATS = [
  { number: "100+", label: "Laundry Installations" },
  { number: "30+", label: "Years Experience" },
  { number: "4,000+", label: "Products Available" },
  { number: "Hundreds", label: "Enterprise Clients" },
];

const PROJECTS = [
  { name: "Strand Hotel, Yangon", desc: "Designed and installed main kitchen" },
  { name: "Kempinski Hotel, Naypyidaw", desc: "Designed and installed main kitchen" },
  { name: "Novotel Max, Yangon", desc: "Installed 6 kitchens" },
  { name: "Swisscontact Partnership", desc: "Partnership with Swiss Foundation for Technical Cooperation — supporting sustainable development in Myanmar's hospitality sector" },
];

const CLIENT_VALUES = [
  { icon: Users, title: "Personalized Service", desc: "Tailored to each client's specific requirements" },
  { icon: MessageSquare, title: "Open Communication", desc: "Prompt response to concerns and feedback" },
  { icon: Award, title: "Quality Standards", desc: "Consistently monitor and improve service quality" },
  { icon: TrendingUp, title: "Innovation", desc: "Stay updated with industry trends and introduce new solutions" },
];

const SERVICES = [
  { icon: WashingMachine, title: "100+ Laundry Projects" },
  { icon: ChefHat, title: "Kitchen Design & Install" },
  { icon: Wrench, title: "Laundry Turnkey Solutions" },
  { icon: GraduationCap, title: "Expert Training & Support" },
];

const About = () => {
  useScrollToHash();

  return (
    <MainLayout>
      {/* ═══ Section 1: Hero ═══ */}
      <section className="bg-[#0f1729] py-20 md:py-28">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#f59e0b]">
            IKON Trading Co., Ltd.
          </p>
          <h1 className="text-3xl font-bold leading-tight text-white md:text-5xl">
            Myanmar's Most Prominent Luxury
            <br className="hidden md:block" /> Hospitality One-Stop Service Hub
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#d1d5db] md:text-lg">
            30+ years delivering world-class products and turnkey solutions to the HoReCa industry
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg bg-[#f59e0b] px-6 py-3 text-sm font-semibold text-[#1a1f36] transition-colors hover:bg-[#d97706]"
            >
              Explore Products <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/bulk-orders"
              className="inline-flex items-center gap-2 rounded-lg border border-[#f59e0b] px-6 py-3 text-sm font-semibold text-[#f59e0b] transition-colors hover:bg-[#f59e0b]/10"
            >
              Get a Quote <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: Our Story Timeline ═══ */}
      <section id="our-story" className="bg-white py-16 md:py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-900 md:text-3xl">Our Story</h2>

          <div className="relative ml-4 border-l-2 border-[#f59e0b]/30 pl-8 md:ml-0 md:pl-10">
            {TIMELINE.map((t, i) => (
              <div key={i} className="relative mb-10 last:mb-0">
                {/* Dot */}
                <div className="absolute -left-[calc(2rem+5px)] top-1 h-3 w-3 rounded-full border-2 border-[#f59e0b] bg-white md:-left-[calc(2.5rem+5px)]" />
                <span className="mb-1 inline-block rounded bg-[#f59e0b]/10 px-2 py-0.5 text-xs font-bold text-[#f59e0b]">
                  {t.year}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{t.desc}</p>
              </div>
            ))}
          </div>

          <blockquote className="mx-auto mt-12 max-w-3xl border-l-4 border-[#f59e0b] pl-4 text-sm italic leading-relaxed text-gray-600 md:text-base">
            "After 3 decades as a reliable supplier in the HoReCa market, IKON Mart started to change its marketing and distribution landscape with a newly opened showroom and online shop services to both B2B and B2C customers — breaking geographical barriers and allowing customers to access products and services anytime, anywhere."
          </blockquote>
        </div>
      </section>

      {/* ═══ Section 3: Why IKON ═══ */}
      <section id="why-ikon" className="bg-gray-50 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 md:text-3xl">Why IKON</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {PILLARS.map((p) => (
              <div key={p.title} className="rounded-xl bg-white p-6 shadow-sm md:p-8">
                <p.icon className="mb-4 h-8 w-8 text-[#f59e0b]" />
                <h3 className="mb-2 text-xl font-bold text-gray-900">{p.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 4: Turnkey Solutions ═══ */}
      <section id="services" className="bg-white py-16 md:py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <h2 className="mb-3 text-center text-2xl font-bold text-gray-900 md:text-3xl">
            Turnkey Solutions to the Highest Standards
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-sm text-gray-600 md:text-base">
            Over two decades we've developed the ability to design and deliver to enterprise customers new concepts in restaurant, laundry and kitchen operations.
          </p>

          <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {SERVICES.map((s) => (
              <div key={s.title} className="flex flex-col items-center rounded-lg border border-gray-100 bg-gray-50 p-5 text-center">
                <s.icon className="mb-3 h-7 w-7 text-[#f59e0b]" />
                <span className="text-sm font-semibold text-gray-900">{s.title}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-[#f59e0b] md:text-3xl">{s.number}</p>
                <p className="mt-1 text-xs font-medium text-gray-600">{s.label}</p>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-gray-600">
            We listen carefully to what your goals are, and tailor the advice or products we recommend using decades of experience. Our well-trained staff spares no effort to deliver superior distribution, installation, maintenance and training.
          </p>
        </div>
      </section>

      {/* ═══ Section 5: Projects & Clients ═══ */}
      <section id="projects" className="bg-gray-50 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 md:text-3xl">Notable Projects & Clients</h2>

          <div className="mb-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {PROJECTS.map((p) => (
              <div key={p.name} className="rounded-lg bg-white p-5 shadow-sm">
                <h3 className="mb-1 text-sm font-bold text-gray-900">{p.name}</h3>
                <p className="text-xs leading-relaxed text-gray-600">{p.desc}</p>
              </div>
            ))}
          </div>

          <blockquote className="mx-auto mb-10 max-w-3xl text-center text-sm italic text-gray-600 md:text-base">
            "To properly care for our clients in Myanmar's HoReCa market, it is essential to focus on building strong relationships, meeting their unique needs, and providing quality service."
          </blockquote>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {CLIENT_VALUES.map((v) => (
              <div key={v.title} className="flex flex-col items-center text-center">
                <v.icon className="mb-2 h-6 w-6 text-[#f59e0b]" />
                <h4 className="text-sm font-semibold text-gray-900">{v.title}</h4>
                <p className="mt-1 text-xs text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 6: Showroom ═══ */}
      <section id="showrooms" className="bg-white py-16 md:py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 md:text-3xl">Visit Our Showroom</h2>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Map placeholder */}
            <div className="flex items-center justify-center rounded-xl bg-gray-100">
              <iframe
                title="IKON Mart Showroom"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d96.1415933!3d16.8985072!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30c5149b3b53a179%3A0xe43ad227f49b696b!2sIKON+Mart+Showroom!5e0!3m2!1sen!2smm!4v1"
                className="h-64 w-full rounded-xl md:h-full md:min-h-[280px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0 }}
              />
            </div>

            {/* Info */}
            <div>
              <h3 className="mb-4 text-lg font-bold text-gray-900">IKON Mart Showroom</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#f59e0b]" />
                  <span>No. 11, Swel Taw Street, Kyan Khin Su Ward, Mingalardon Township, Yangon, Myanmar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-[#f59e0b]" />
                  <span>09 89009 0301</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-[#f59e0b]" />
                  <span>ikonmartecommerce@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-[#f59e0b]" />
                  <div>
                    <p>Mon–Sat: 9:00 AM – 5:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-gray-600">
                IKON Marts, our Cash & Carry stores, make your procurement easy and efficient. With branches in key markets nationwide, we are prepared to help you please your customers wherever you are.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=16.8985072,96.1415933&destination_place_id=ChIJeaFTOwCVwTARa2mL9CfSOuQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#f59e0b] px-5 py-2.5 text-sm font-semibold text-[#1a1f36] transition-colors hover:bg-[#d97706]"
                >
                  Get Directions <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Contact Us <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 7: Careers CTA ═══ */}
      <section id="careers" className="bg-[#fffbeb] py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">Join the IKON Team</h2>
          <p className="mx-auto mb-8 max-w-xl text-sm text-gray-600 md:text-base">
            We're always looking for passionate people to join our mission of delivering world-class hospitality solutions across Myanmar.
          </p>
          <a
            href="mailto:ikonmartecommerce@gmail.com?subject=Career%20Inquiry"
            className="inline-flex items-center gap-2 rounded-lg bg-[#f59e0b] px-6 py-3 text-sm font-semibold text-[#1a1f36] transition-colors hover:bg-[#d97706]"
          >
            Contact Us About Opportunities <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* ═══ Section 8: CCI Badge ═══ */}
      <section className="bg-gray-50 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-medium text-gray-500">
            Proud Member of <span className="font-semibold text-gray-700">CCI France Myanmar</span>
          </p>
        </div>
      </section>
    </MainLayout>
  );
};

export default About;
