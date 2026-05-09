import { useState, useRef, useEffect } from "react";
import { User, ShoppingCart, Menu, X, ChevronDown, LogOut, Package, Heart, Search, Bell } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { DesktopMegaNav, MobileMegaNav } from "./MegaMenu";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCartCount } from "@/hooks/useCart";
import ikonMartLogo from "@/assets/ikon-mart-logo.png";

/**
 * Version A.4 header (old-style marketplace concept).
 *
 * Top utility menu — rendered order is locked:
 *   HOME · ABOUT US · ARTICLES · CONTACT US
 *
 * Intentionally deferred (product decision, NOT missing):
 *   E-SHOP · OUR SERVICES · OUR PRODUCTS
 *
 * Desktop: announcement bar hidden; clean 2-band header with custom SVG
 * shouldered badge straddling the seam between utility row and navy bar.
 */
const UTILITY_LINKS = [
  { label: "HOME", to: "/" },
  { label: "ABOUT US", to: "/about" },
  { label: "ARTICLES", to: "/articles" },
  { label: "CONTACT US", to: "/contact" },
] as const;

/** Compact tab-style badge: slim, flat, navy, dipping into the category bar. */
const BADGE_W = 132;
const BADGE_H = 44;
const BADGE_DIP = 16;

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, openAuthModal, signOut } = useAuthContext();
  const { data: cartCount } = useCartCount();

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
      {/* Announcement Bar — mobile only on Version A.4 */}
      <div className="md:hidden bg-secondary text-foreground text-center py-2 text-sm font-medium">
        Free delivery on orders over MMK 500,000 in Yangon Metro
        <Link to="/flash-deals" className="underline ml-2 text-primary">Shop Deals →</Link>
      </div>

      {/* ─── Desktop utility row (md+) ──────────────────────────────── */}
      <div className="hidden md:block relative bg-card border-b border-border z-20 overflow-visible">
        <div className="container mx-auto px-6 relative">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-6 h-[60px] overflow-visible">
            {/* LEFT: utility links */}
            <nav aria-label="Primary" className="flex items-center gap-5 min-w-0 justify-self-start">
              {UTILITY_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    `text-[11px] tracking-[0.08em] font-medium uppercase transition-colors ${
                      isActive ? "text-primary" : "text-foreground/80 hover:text-primary"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* CENTER: tab-style logo badge dipping into navy bar */}
            <div
              className="relative z-50 flex items-start justify-center overflow-visible"
              style={{ transform: `translateY(${BADGE_DIP}px)` }}
            >
              <Link
                to="/"
                aria-label="IKON Mart — Home"
                className="flex items-center justify-center bg-primary shrink-0"
                style={{
                  width: BADGE_W,
                  height: BADGE_H,
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  boxShadow: "0 6px 14px -6px rgba(0,0,0,0.25)",
                }}
              >
                <img
                  src={ikonMartLogo}
                  alt="IKON Mart"
                  className="block max-h-[32px] w-auto object-contain"
                />
              </Link>
            </div>

            {/* RIGHT: icons + search + account */}
            <div className="flex items-center gap-3 min-w-0 w-full justify-self-end">
              <Link to="/account" aria-label="Wishlist" className="relative text-foreground/80 hover:text-primary transition shrink-0">
                <Heart className="w-[18px] h-[18px]" />
                <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[10px] min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center font-bold">0</span>
              </Link>
              <Link to="/cart" aria-label="Cart" className="relative text-foreground/80 hover:text-primary transition shrink-0">
                <ShoppingCart className="w-[18px] h-[18px]" />
                <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[10px] min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center font-bold">{cartCount ?? 0}</span>
              </Link>
              <Link to="/account" aria-label="Notifications" className="relative text-foreground/80 hover:text-primary transition shrink-0">
                <Bell className="w-[18px] h-[18px]" />
              </Link>

              {/* Search unit: input + visible navy button */}
              <div className="flex-1 min-w-[220px] max-w-[360px] h-[36px] flex rounded-md overflow-hidden border border-border bg-card">
                <SearchAutocomplete
                  className="flex-1 h-full min-w-0 flex"
                  hideLeftIcon
                  placeholder="Search products..."
                  inputClassName="flex-1 h-full px-3 text-[13px] bg-card outline-none placeholder:text-muted-foreground/70 min-w-0"
                  showButton
                  buttonClassName="w-11 h-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition shrink-0"
                  buttonContent={<Search className="w-4 h-4" />}
                />
              </div>

              <div className="shrink-0">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    aria-label="Account"
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition"
                  >
                    <User className="w-4 h-4" />
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
                <button
                  onClick={openAuthModal}
                  aria-label="Sign in"
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition"
                >
                  <User className="w-4 h-4" />
                </button>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Desktop category bar ────────────────────────────────────── */}
      <div className="hidden lg:block relative z-10">
        <DesktopMegaNav centerGapWidth={BADGE_W + 24} />
      </div>

      {/* ─── Mobile header (<lg) ────────────────────────────────────── */}
      <div className="lg:hidden">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <button
            aria-label="Menu"
            className="p-2 text-muted-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.png" alt="IKON Mart" className="h-9 w-auto object-contain" />
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <Link to="/account" aria-label="Wishlist" className="text-muted-foreground hover:text-primary">
              <Heart className="w-5 h-5" />
            </Link>
            <Link to="/cart" aria-label="Cart" className="relative text-muted-foreground hover:text-primary">
              <ShoppingCart className="w-5 h-5" />
              {cartCount && cartCount > 0 ? (
                <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              ) : null}
            </Link>
            {user ? (
              <Link to="/account" aria-label="Account" className="text-muted-foreground hover:text-primary">
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <button onClick={openAuthModal} aria-label="Sign in" className="text-muted-foreground hover:text-primary">
                <User className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile search */}
        <div className="px-4 pb-3">
          <SearchAutocomplete
            inputClassName="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input text-sm outline-none bg-card focus:border-primary"
            placeholder="Search products..."
            showButton={false}
          />
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="bg-card border-t border-border max-h-[70vh] overflow-y-auto">
            <MobileMegaNav onClose={() => setMobileMenuOpen(false)} />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
