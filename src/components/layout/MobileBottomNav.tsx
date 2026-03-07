import { Home, Grid3X3, Search, ShoppingCart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const MobileBottomNav = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/categories", icon: Grid3X3, label: "Categories" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/cart", icon: ShoppingCart, label: "Cart", badge: 0 },
    { path: "/account", icon: User, label: "Account" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-ikon-border shadow-lg z-50 md:hidden">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center text-xs transition relative ${
              isActive(item.path) ? "text-primary font-medium" : "text-ikon-text-tertiary"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="mt-0.5">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute -top-1 right-0 bg-accent text-accent-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
