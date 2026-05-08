import { useState, useRef, useEffect } from "react";
import { User, ShoppingCart, Menu, X, ChevronDown, LogOut, Package, Heart, Search } from "lucide-react";
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

/** Custom shouldered/curved-skirt badge silhouette, white fill + navy stroke. */
const BadgeShape = () => (
  <svg
    viewBox="0 0 200 72"
    width="200"
    height="72"
    aria-hidden="true"
    className="block"
    style={{ filter: "drop-shadow(0 6px 14px rgba(27,42,78,0.18))" }}
  >
    {/* Shouldered top with curved skirt that flares wider at the bottom. */}
    <path
      d="
        M 16 4
        Q 28 0 40 4
        L 160 4
        Q 172 0 184 4
        Q 196 8 196 24
        L 196 44
        Q 196 56 188 60
        Q 176 66 160 66
        Q 130 70 100 70
        Q 70 70 40 66
        Q 24 66 12 60
        Q 4 56 4 44
        L 4 24
        Q 4 8 16 4
        Z
      "
      fill="hsl(var(--card))"
      stroke="hsl(var(--primary))"
      strokeWidth="1.5"
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

      {/* ─── Desktop utility row (lg+) — badge sits inline after links ─ */}
      <div className="hidden lg:block relative bg-card border-b border-border z-20">
        <div className="container mx-auto px-6">
          <div className="flex items-center h-[48px]">
            {/* Left — utility text menu */}
            <nav aria-label="Primary" className="flex items-center gap-5 shrink-0">
              {UTILITY_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    `text-[12px] tracking-[0.06em] font-semibold uppercase transition-colors ${
                      isActive
                        ? "text-primary border-b-2 border-accent pb-0.5"
                        : "text-foreground/85 hover:text-primary"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Inline IKON badge — sits after links, skirt overflows into navy bar below */}
            <Link
              to="/"
              aria-label="IKON Mart — Home"
              className="relative ml-6 shrink-0 block self-end translate-y-3"
              style={{ width: 200, height: 64 }}
            >
              <div className="relative w-[200px] h-[64px]">
                <BadgeShape />
                <div className="absolute inset-0 flex items-center justify-center gap-2 px-4">
                  <img src="/favicon.png" alt="" className="h-8 w-auto object-contain" />
                  <span className="text-base font-extrabold tracking-wide text-primary leading-none">
                    IKON Mart
                  </span>
                </div>
              </div>
            </Link>

            {/* Right — icons + search + account */}
            <div className="ml-auto flex items-center gap-4">
              <Link
                to="/account"
                aria-label="Wishlist"
                className="text-foreground/80 hover:text-primary transition"
              >
                <Heart className="w-[18px] h-[18px]" />
              </Link>

              <Link
                to="/cart"
                aria-label="Cart"
                className="relative text-foreground/80 hover:text-primary transition"
              >
                <ShoppingCart className="w-[18px] h-[18px]" />
                {cartCount && cartCount > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[10px] min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                ) : null}
              </Link>

              {/* Search unit — input + navy submit, single 32px tall unit */}
              <div className="w-[260px] h-[32px] flex rounded-md overflow-hidden border border-border bg-card">
                <SearchAutocomplete
                  className="flex-1 h-full"
                  hideLeftIcon
                  placeholder="What are you looking for?"
                  inputClassName="w-full h-full px-3 text-[13px] bg-card outline-none placeholder:text-muted-foreground/70"
                  showButton
                  buttonClassName="w-10 h-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition shrink-0"
                  buttonContent={<Search className="w-4 h-4" />}
                />
              </div>

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    aria-label="Account"
                    className="flex items-center gap-1 text-foreground/80 hover:text-primary transition"
                  >
                    <User className="w-[18px] h-[18px]" />
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
                <button
                  onClick={openAuthModal}
                  aria-label="Sign in"
                  className="text-foreground/80 hover:text-primary transition"
                >
                  <User className="w-[18px] h-[18px]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Desktop category bar (untouched, no overlay) ────────────── */}
      <div className="hidden lg:block">
        <DesktopMegaNav />
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
