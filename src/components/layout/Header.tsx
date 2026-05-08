import { useState, useRef, useEffect } from "react";
import { User, ShoppingCart, Menu, X, ChevronDown, LogOut, Package, Heart, Search, Bell } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { DesktopMegaNav, MobileMegaNav } from "./MegaMenu";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCartCount } from "@/hooks/useCart";

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

/** Refined shouldered badge silhouette — flatter, lighter, slightly skirted. */
const BADGE_W = 158;
const BADGE_H = 56;
const BadgeShape = () => (
  <svg
    viewBox="0 0 158 58"
    width={BADGE_W}
    height={BADGE_H}
    aria-hidden="true"
    className="block"
    style={{ filter: "drop-shadow(0 4px 10px rgba(27,42,78,0.12))" }}
  >
    <path
      d="
        M 12 3
        L 146 3
        Q 155 3 155 14
        L 155 38
        Q 155 47 147 50
        Q 130 55 79 55
        Q 28 55 11 50
        Q 3 47 3 38
        L 3 14
        Q 3 3 12 3
        Z
      "
      fill="hsl(var(--card))"
      stroke="hsl(var(--primary))"
      strokeWidth="1"
    />
  </svg>
);

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
      <div className="lg:hidden bg-secondary text-foreground text-center py-2 text-sm font-medium">
        Free delivery on orders over MMK 500,000 in Yangon Metro
        <Link to="/flash-deals" className="underline ml-2 text-primary">Shop Deals →</Link>
      </div>

      {/* ─── Desktop utility row (lg+) ──────────────────────────────── */}
      <div className="hidden lg:block relative bg-card border-b border-border z-20 overflow-visible">
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center justify-between h-[46px] overflow-visible">
            <nav aria-label="Primary" className="flex items-center gap-5 shrink-0 pr-[180px]">
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

            <Link
              to="/"
              aria-label="IKON Mart — Home"
              className="absolute left-1/2 -translate-x-1/2 z-30 block"
              style={{ width: BADGE_W, height: BADGE_H, top: 6 }}
            >
              <div className="relative" style={{ width: BADGE_W, height: BADGE_H }}>
                <BadgeShape />
                <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                  <span className="text-[13px] font-bold tracking-[0.18em] text-primary">IKON</span>
                  <span className="text-[9px] font-semibold tracking-[0.15em] text-primary mt-0.5">Mart</span>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-3 shrink-0 pl-[180px]">
              <Link to="/account" aria-label="Wishlist" className="relative text-foreground/80 hover:text-primary transition">
                <Heart className="w-[17px] h-[17px]" />
                <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[10px] min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center font-bold">0</span>
              </Link>
              <Link to="/cart" aria-label="Cart" className="relative text-foreground/80 hover:text-primary transition">
                <ShoppingCart className="w-[17px] h-[17px]" />
                <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[10px] min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center font-bold">{cartCount ?? 0}</span>
              </Link>
              <div className="w-[240px] h-[30px] flex rounded-md overflow-hidden border border-border bg-card shrink-0">
                <SearchAutocomplete
                  className="flex-1 h-full"
                  hideLeftIcon
                  placeholder="What are you looking for?"
                  inputClassName="w-full h-full px-3 text-[12px] bg-card outline-none placeholder:text-muted-foreground/70"
                  showButton
                  buttonClassName="w-9 h-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition shrink-0"
                  buttonContent={<Search className="w-3.5 h-3.5" />}
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
      <div className="hidden lg:block">
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
