/**
 * Products.tsx — Placeholder route (Prompt 3).
 *
 * Full product-listing page (filters, sort, pagination, faceted search) ships
 * in a later prompt. This stub exists to prevent 404s from product-card click
 * paths and Hero "Browse Products" CTA.
 */
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Package, ArrowLeft, LayoutGrid } from "lucide-react";

const Products = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-secondary flex items-center justify-center mb-6">
            <Package className="w-7 h-7 text-primary" strokeWidth={1.75} />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Product Listing Coming Soon
          </h1>
          <p className="text-muted-foreground mb-8">
            We're building the unified product listing with filters, sort, and faceted
            search. In the meantime, browse by category or jump straight to our best
            sellers.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-5 py-2.5 rounded-md transition"
            >
              <LayoutGrid className="w-4 h-4" strokeWidth={1.75} />
              Browse by Category
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 border border-border text-foreground hover:bg-secondary font-semibold px-5 py-2.5 rounded-md transition"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Products;
