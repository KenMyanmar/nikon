/**
 * Hero.tsx — Homepage hero section (Prompt 1, v5 spec)
 *
 * Photography:
 *   src/assets/hero-warehouse-aisle.jpg
 *   Source: Unsplash+ photo ID `On_1eB9U6k0` (warehouse aisle, vanishing-point composition).
 *   License: Unsplash+ License (paid subscription, perpetual commercial use).
 *   Attribution & download record: src/assets/hero-warehouse-aisle.LICENSE.md
 *
 * Composition:
 *   - Desktop: v5 layout. Headline left-anchored over navy contrast gradient (left-weighted).
 *     Line breaks are EXPLICIT via <br /> tags (not flex-wrap drift) so production matches
 *     the approved mockup regardless of font-engine kerning.
 *   - Mobile: v5 layout. Bottom-anchored text corridor with full-width contrast band.
 *     Vertical CTA stack. (NOT v4's middle-anchored composition.)
 *
 * Palette: Contract tokens only — primary navy, accent amber, neutrals. No urgency red.
 */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-warehouse-aisle.jpg";
import SearchAutocomplete from "@/components/SearchAutocomplete";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-primary">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        {/* Desktop: left-weighted navy gradient (v5). Mobile: full-width darkening + bottom band. */}
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              "linear-gradient(90deg, hsl(var(--primary) / 0.92) 0%, hsl(var(--primary) / 0.78) 45%, hsl(var(--primary) / 0.35) 100%)",
          }}
        />
        <div
          className="absolute inset-0 md:hidden"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--primary) / 0.35) 0%, hsl(var(--primary) / 0.55) 50%, hsl(var(--primary) / 0.92) 100%)",
          }}
        />
      </div>

      {/* Desktop layout — left-anchored, vertically centered */}
      <div className="relative hidden md:block">
        <div className="container mx-auto px-6 lg:px-10 min-h-[560px] lg:min-h-[640px] flex items-center">
          <div className="max-w-3xl py-20">
            <h1 className="font-bold text-primary-foreground tracking-tight leading-[1.1] text-[40px] lg:text-[48px]">
              Myanmar's Trusted Marketplace for Kitchen,<br />
              Hotel, Restaurant &amp; Commercial<br />
              Supplies
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/80 max-w-xl">
              4,000+ products from 160+ premium international brands. Trade pricing,
              bulk quotes, and verified stock — built for HoReCa procurement.
            </p>

            <div className="mt-8 max-w-xl">
              <SearchAutocomplete
                inputClassName="w-full pl-12 pr-28 py-4 rounded-md text-base outline-none shadow-lg bg-card text-foreground border border-border"
                showButton={true}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-3 rounded-md transition"
              >
                Browse Catalogue
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/request-quote"
                className="inline-flex items-center gap-2 border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 font-semibold px-6 py-3 rounded-md transition"
              >
                Request a Quote
              </Link>
              <Link
                to="/wholesale-signup"
                className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground font-medium px-2 py-3 underline-offset-4 hover:underline transition"
              >
                Wholesale Signup
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile layout — bottom-anchored over contrast band (v5) */}
      <div className="relative md:hidden">
        <div className="min-h-[520px] flex flex-col justify-end px-5 pt-16 pb-8">
          <h1 className="font-bold text-primary-foreground tracking-tight leading-[1.15] text-[28px]">
            Myanmar's Trusted Marketplace<br />
            for Kitchen, Hotel, Restaurant<br />
            &amp; Commercial Supplies
          </h1>
          <p className="mt-3 text-sm text-primary-foreground/85">
            4,000+ products from 160+ premium international brands.
          </p>

          <div className="mt-5">
            <SearchAutocomplete
              inputClassName="w-full pl-11 pr-24 py-3 rounded-md text-sm outline-none shadow-lg bg-card text-foreground border border-border"
              showButton={true}
            />
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            <Link
              to="/categories"
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-5 py-3 rounded-md transition"
            >
              Browse Catalogue
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/request-quote"
              className="inline-flex items-center justify-center gap-2 border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 font-semibold px-5 py-3 rounded-md transition"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
