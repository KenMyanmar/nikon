import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const QuotationCTA = () => {
  return (
    <section className="bg-primary py-12 md:py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
          Need a Custom Quote for Your Project?
        </h2>
        <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
          Whether you're setting up a new kitchen, renovating a hotel, or ordering in bulk — our team will prepare a competitive quotation within 4 hours.
        </p>
        <Link
          to="/bulk-orders"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8 py-4 rounded-button transition-all text-lg shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          Get a Quote <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
};

export default QuotationCTA;
