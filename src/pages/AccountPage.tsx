import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import AccountOverview from "@/components/account/AccountOverview";
import AccountOrders from "@/components/account/AccountOrders";
import AccountQuotes from "@/components/account/AccountQuotes";
import AccountSavedLists from "@/components/account/AccountSavedLists";
import AccountAddresses from "@/components/account/AccountAddresses";
import AccountProfile from "@/components/account/AccountProfile";
import { LayoutDashboard, Package, FileText, Heart, MapPin, User } from "lucide-react";

const sections = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "orders", label: "Orders", icon: Package },
  { key: "quotes", label: "Quotes", icon: FileText },
  { key: "lists", label: "Saved Lists", icon: Heart },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "profile", label: "Profile", icon: User },
];

const AccountPage = () => {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  const renderSection = () => {
    switch (activeSection) {
      case "orders": return <AccountOrders />;
      case "quotes": return <AccountQuotes />;
      case "lists": return <AccountSavedLists />;
      case "addresses": return <AccountAddresses />;
      case "profile": return <AccountProfile />;
      default: return <AccountOverview />;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <a href="/" className="hover:text-primary">Home</a>
          <span className="mx-2">›</span>
          <span className="text-foreground font-medium">My Account</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="bg-card rounded-card shadow-card overflow-hidden">
              {sections.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition hover:bg-muted/50 ${
                    activeSection === s.key ? "bg-primary/5 text-primary border-l-2 border-primary" : "text-muted-foreground"
                  }`}
                >
                  <s.icon className="w-4 h-4" /> {s.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Mobile Tabs */}
          <div className="lg:hidden flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
            {sections.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`shrink-0 px-3 py-2 text-xs font-semibold rounded-full transition ${
                  activeSection === s.key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {renderSection()}
          </main>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccountPage;
