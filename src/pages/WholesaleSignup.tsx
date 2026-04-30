/**
 * WholesaleSignup.tsx — Placeholder route.
 * Full wholesale onboarding flow ships in a later prompt.
 */
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Building2, ArrowLeft } from "lucide-react";

const WholesaleSignup = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-secondary flex items-center justify-center mb-6">
            <Building2 className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Wholesale Signup — Coming Soon
          </h1>
          <p className="text-muted-foreground mb-8">
            We're finalising the trade account onboarding flow. In the meantime, you can
            request a custom quote and our procurement team will set you up directly.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/request-quote"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-5 py-2.5 rounded-md transition"
            >
              Request a Quote
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 border border-border text-foreground hover:bg-secondary font-semibold px-5 py-2.5 rounded-md transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default WholesaleSignup;
