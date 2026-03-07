import { useState } from "react";
import { Search, User, ShoppingCart, Phone, Menu, X, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import MegaMenu from "./MegaMenu";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card shadow-nav">
      {/* Announcement Bar */}
      <div className="bg-accent text-accent-foreground text-center py-2 text-sm font-medium">
        🚚 Free delivery on orders over MMK 500,000 in Yangon Metro
        <Link to="/deals" className="underline ml-2 font-bold">Shop Deals →</Link>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3 flex items-center gap-4 lg:gap-6">
        {/* Mobile menu toggle */}
        <button
          className="lg:hidden p-2 text-ikon-text-secondary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Logo */}
        <Link to="/" className="shrink-0 flex items-center gap-2">
          <div className="bg-primary rounded-lg px-3 py-1.5">
            <span className="text-primary-foreground font-bold text-xl tracking-tight">IKON</span>
          </div>
          <span className="hidden sm:block text-sm font-medium text-ikon-text-secondary">Mart</span>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-2xl relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ikon-text-tertiary" />
          <input
            type="text"
            placeholder="Search 4,000+ products by name, brand, or SKU..."
            className="w-full pl-12 pr-28 py-3 rounded-lg border-2 border-ikon-border focus:border-primary focus:ring-2 focus:ring-ikon-navy-50 text-base outline-none transition-all bg-card"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-accent-foreground px-5 py-1.5 rounded-md text-sm font-semibold hover:bg-ikon-red-dark transition">
            Search
          </button>
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ikon-text-tertiary" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ikon-border text-sm outline-none bg-card focus:border-primary"
          />
        </div>
      </div>

      {/* Desktop Navigation Bar */}
      <nav className="hidden lg:block bg-primary">
        <div className="container mx-auto px-4 flex items-center">
          <button
            className="flex items-center gap-1 px-4 py-3 text-primary-foreground text-sm font-medium hover:bg-ikon-navy-light transition"
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
          >
            Products <ChevronDown className="w-4 h-4" />
          </button>
          <Link to="/industries" className="px-4 py-3 text-primary-foreground text-sm font-medium hover:bg-ikon-navy-light transition">Industries</Link>
          <Link to="/brands" className="px-4 py-3 text-primary-foreground text-sm font-medium hover:bg-ikon-navy-light transition">Brands</Link>
          <Link to="/bulk-orders" className="px-4 py-3 text-primary-foreground text-sm font-medium hover:bg-ikon-navy-light transition">Bulk Orders</Link>
          <Link to="/deals" className="px-4 py-3 text-accent-foreground text-sm font-bold bg-accent hover:bg-ikon-red-dark transition">🔥 Deals</Link>
          <Link to="/support" className="px-4 py-3 text-primary-foreground text-sm font-medium hover:bg-ikon-navy-light transition">Support</Link>
        </div>
      </nav>

      {/* Mega Menu */}
      {megaMenuOpen && (
        <div
          onMouseEnter={() => setMegaMenuOpen(true)}
          onMouseLeave={() => setMegaMenuOpen(false)}
        >
          <MegaMenu />
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-card border-t border-ikon-border">
          <div className="px-4 py-3 space-y-1">
            <Link to="/categories" className="block py-2.5 px-3 text-sm font-medium text-foreground hover:bg-ikon-navy-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>Products</Link>
            <Link to="/industries" className="block py-2.5 px-3 text-sm font-medium text-foreground hover:bg-ikon-navy-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>Industries</Link>
            <Link to="/brands" className="block py-2.5 px-3 text-sm font-medium text-foreground hover:bg-ikon-navy-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>Brands</Link>
            <Link to="/bulk-orders" className="block py-2.5 px-3 text-sm font-medium text-foreground hover:bg-ikon-navy-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>Bulk Orders</Link>
            <Link to="/deals" className="block py-2.5 px-3 text-sm font-bold text-accent hover:bg-ikon-red-light rounded-md" onClick={() => setMobileMenuOpen(false)}>🔥 Deals</Link>
            <Link to="/support" className="block py-2.5 px-3 text-sm font-medium text-foreground hover:bg-ikon-navy-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>Support</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
