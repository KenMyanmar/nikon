import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * Quote CTA — homepage banner.
 *
 * Navy primary background, amber accent button. Token-only colors
 * (Design Contract). No raw hexes, no decorative gradients.
 */
const QuoteCTA = () => {
  return (
    <section className="bg-primary py-12 md:py-16">
      <div className="container mx-auto px-4 text-center max-w-2xl">
        <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground">
          Need a Custom Quote for Your Project?
        </h2>
        <p className="text-primary-foreground/70 mt-3">
          Tell us what you need and our team will prepare a tailored quotation
          for your hotel, restaurant, or catering business.
        </p>
        <Link
          to="/request-quote"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8 py-4 rounded-button transition-colors text-lg mt-6 active:scale-[0.98]"
        >
          Request a Quote <ArrowRight className="w-5 h-5" />
        </Link>
        <p className="mt-3 text-sm text-primary-foreground/60">
          Or call us at 09 89009 0301
        </p>
      </div>
    </section>
  );
};

export default QuoteCTA;
