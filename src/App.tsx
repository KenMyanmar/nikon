import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminImport from "./pages/AdminImport";
import SearchResults from "./pages/SearchResults";
import CategoryPage from "./pages/CategoryPage";
import ProductDetail from "./pages/ProductDetail";
import BrandPage from "./pages/BrandPage";
import CartPage from "./pages/CartPage";
import AccountPage from "./pages/AccountPage";
import ResetPassword from "./pages/ResetPassword";
import RequestQuotePage from "./pages/RequestQuotePage";
import AllCategoriesPage from "./pages/AllCategoriesPage";
import AllBrandsPage from "./pages/AllBrandsPage";
import FlashDealsPage from "./pages/FlashDealsPage";
import BestSellersPage from "./pages/BestSellersPage";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import About from "./pages/About";
import Promotions from "./pages/Promotions";
import PromotionDetail from "./pages/PromotionDetail";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <ErrorBoundary label="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/import" element={<AdminImport />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/brand/:slug" element={<BrandPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/request-quote" element={<RequestQuotePage />} />
            <Route path="/categories" element={<AllCategoriesPage />} />
            <Route path="/brands" element={<AllBrandsPage />} />
            <Route path="/flash-deals" element={<FlashDealsPage />} />
            <Route path="/best-sellers" element={<BestSellersPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:slug" element={<ArticleDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/promotions/:id" element={<PromotionDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
