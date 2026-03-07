import { useState } from "react";
import { User, ShoppingCart, Phone, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { DesktopMegaNav, MobileMegaNav } from "./MegaMenu";
import SearchAutocomplete from "@/components/SearchAutocomplete";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card shadow-nav">
      {/* Announcement Bar */}
      <div className="bg-accent text-accent-foreground text-center py-2 text-sm font-medium">
        🚚 Free delivery on orders over MMK 500,000 in Yangon Metro
        <Link to="/deals" className="underline ml-2 font-bold">Shop Deals →</Link>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3 flex items-center gap-4 lg:gap-6">
        <button
          className="lg:hidden p-2 text-ikon-text-secondary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <Link to="/" className="shrink-0 flex items-center gap-2">
          <div className="bg-primary rounded-lg px-3 py-1.5">
            <span className="text-primary-foreground font-bold text-xl tracking-tight">IKON</span>
          </div>
          <span className="hidden sm:block text-sm font-medium text-ikon-text-secondary">Mart</span>
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:block flex-1 max-w-2xl">
          <SearchAutocomplete
            inputClassName="w-full pl-12 pr-28 py-3 rounded-lg border-2 border-ikon-border focus:border-primary focus:ring-2 focus:ring-ikon-navy-50 text-base outline-none transition-all bg-card"
            placeholder="Search 4,000+ products by name, brand, or SKU..."
            showButton={true}
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 ml-auto">
          <Link to="/account" className="flex flex-col items-center text-xs text-ikon-text-secondary hover:text-primary transition">
            <User className="w-5 h-5" />
            <span className="hidden sm:block">Account</span>
          </Link>
          <Link to="/cart" className="relative flex flex-col items-center text-xs text-ikon-text-secondary hover:text-primary transition">
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:block">Cart</span>
            <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">0</span>
          </Link>
          <a href="tel:01534216" className="hidden lg:flex flex-col items-center text-xs text-ikon-text-secondary hover:text-primary transition">
            <Phone className="w-5 h-5" />
            <span>Support</span>
          </a>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <SearchAutocomplete
          inputClassName="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ikon-border text-sm outline-none bg-card focus:border-primary"
          placeholder="Search products..."
          showButton={false}
        />
      </div>

      {/* Desktop Navigation - Data-driven Mega Menu */}
      <DesktopMegaNav />

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-card border-t border-ikon-border max-h-[70vh] overflow-y-auto">
          <MobileMegaNav onClose={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};

export default Header;
