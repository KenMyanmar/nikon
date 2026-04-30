import { useState, useRef, useEffect } from "react";
import { User, ShoppingCart, Phone, Menu, X, ChevronDown, LogOut, Package, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { DesktopMegaNav, MobileMegaNav } from "./MegaMenu";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCartCount } from "@/hooks/useCart";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, openAuthModal, signOut } = useAuthContext();
  const { data: cartCount } = useCartCount();

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Account";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-card shadow-nav">
      {/* Announcement Bar — neutral utility strip */}
      <div className="bg-secondary text-foreground text-center py-2 text-sm font-medium">
        Free delivery on orders over MMK 500,000 in Yangon Metro
        <Link to="/flash-deals" className="underline ml-2 text-primary">Shop Deals →</Link>
        <span className="mx-2 text-muted-foreground">|</span>
        <Link to="/promotions" className="underline text-primary">Promotions</Link>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3 flex items-center gap-4 lg:gap-6">
        <button
          className="lg:hidden p-2 text-muted-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <Link to="/" className="shrink-0 flex items-center gap-2">
          <img src="/favicon.png" alt="IKON Mart" className="h-10 w-auto object-contain" />
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:block flex-1 max-w-2xl">
          <SearchAutocomplete
            inputClassName="w-full pl-12 pr-28 py-3 rounded-lg border-2 border-input focus:border-primary focus:ring-2 focus:ring-ring/20 text-base outline-none transition-all bg-card"
            placeholder="Search 4,000+ products by name, brand, or SKU..."
            showButton={true}
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Account */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:block max-w-[80px] truncate">{firstName}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-card shadow-card-hover border border-border py-1 z-50">
                  <Link to="/account" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition">
                    <User className="w-4 h-4 text-muted-foreground" /> My Account
                  </Link>
                  <Link to="/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition">
                    <Package className="w-4 h-4 text-muted-foreground" /> My Orders
                  </Link>
                  <Link to="/account" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition">
                    <Heart className="w-4 h-4 text-muted-foreground" /> Saved Lists
                  </Link>
                  <hr className="my-1 border-border" />
                  <button onClick={() => { signOut(); setDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-muted/50 transition">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={openAuthModal} className="flex flex-col items-center text-xs text-muted-foreground hover:text-primary transition">
              <User className="w-5 h-5" />
              <span className="hidden sm:block">Account</span>
            </button>
          )}

          {/* Cart */}
          <Link to="/cart" className="relative flex flex-col items-center text-xs text-muted-foreground hover:text-primary transition">
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:block">Cart</span>
            {cartCount && cartCount > 0 ? (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            ) : null}
          </Link>

          <a href="tel:01534216" className="hidden lg:flex flex-col items-center text-xs text-muted-foreground hover:text-primary transition">
            <Phone className="w-5 h-5" />
            <span>Support</span>
          </a>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <SearchAutocomplete
          inputClassName="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input text-sm outline-none bg-card focus:border-primary"
          placeholder="Search products..."
          showButton={false}
        />
      </div>

      {/* Desktop Navigation */}
      <DesktopMegaNav />

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-card border-t border-border max-h-[70vh] overflow-y-auto">
          <MobileMegaNav onClose={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};

export default Header;
