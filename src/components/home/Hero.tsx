/**
 * Hero.tsx — Homepage hero section (Prompt 1, v5 spec)
 *
 * Copy verified against Prompt 1 spec (Rule 14 revised, Rule 18):
 *   headline = "Myanmar's procurement platform for hotels, restaurants, and cafes"
 *   subhead  = "Stocked. Sourced. Delivered."
 *   CTAs     = "Browse Products" (→ /products), "Open Wholesale Account" (→ /wholesale-signup)
 *   No substitution. Existing in-repo copy is not authoritative.
 *
 * Photography:
 *   src/assets/hero-warehouse-aisle.jpg
 *   Source: Unsplash+ photo ID `On_1eB9U6k0` (warehouse aisle, vanishing-point composition).
 *   License: Unsplash+ License (paid subscription, perpetual commercial use).
 *   Attribution: src/assets/hero-warehouse-aisle.LICENSE.md
 *
 * Composition:
 *   - Desktop: v5 layout. Left-anchored over navy contrast gradient (left-weighted).
 *     Headline broken via explicit <br /> tags into the v5 3-line pattern:
 *       line 1 ends after "platform"
 *       line 2 ends after "hotels,"
 *       line 3 ends with "and cafes"
 *   - Mobile: v5 layout. Bottom-anchored corridor, vertical CTA stack.
 *   - No embedded search input — header search is the only above-the-fold search.
 *   - Exactly two CTAs (primary amber + secondary white-outline).
 *
 * Palette: Contract tokens only — primary navy, accent amber, neutrals. No urgency red.
 */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-warehouse-aisle.jpg";

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
              Myanmar's procurement platform<br />
              for hotels, restaurants,<br />
              and cafes
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/85 max-w-xl">
              Stocked. Sourced. Delivered.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-3 rounded-md transition"
              >
                Browse Products
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/wholesale-signup"
                className="inline-flex items-center gap-2 border border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 font-semibold px-6 py-3 rounded-md transition"
              >
                Open Wholesale Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile layout — bottom-anchored over contrast band (v5) */}
      <div className="relative md:hidden">
        <div className="min-h-[520px] flex flex-col justify-end px-5 pt-16 pb-8">
          <h1 className="font-bold text-primary-foreground tracking-tight leading-[1.15] text-[26px]">
            Myanmar's procurement<br />
            platform for hotels,<br />
            restaurants, and cafes
          </h1>
          <p className="mt-3 text-base text-primary-foreground/90">
            Stocked. Sourced. Delivered.
          </p>

          <div className="mt-5 flex flex-col gap-2.5">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-5 py-3 rounded-md transition"
            >
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/wholesale-signup"
              className="inline-flex items-center justify-center gap-2 border border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 font-semibold px-5 py-3 rounded-md transition"
            >
              Open Wholesale Account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
