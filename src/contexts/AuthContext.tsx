import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import AuthModal from "@/components/auth/AuthModal";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signOut: async () => {},
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Early check: if URL has recovery token, redirect to reset page immediately
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery") && window.location.pathname !== "/reset-password") {
      window.location.href = "/reset-password" + window.location.hash;
      return; // Page will reload — skip setting up listener
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // Don't set user as logged in — redirect to reset page
        if (window.location.pathname !== "/reset-password") {
          window.location.href = "/reset-password";
        }
        return;
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      openAuthModal: () => setModalOpen(true),
      closeAuthModal: () => setModalOpen(false),
      signOut,
    }}>
      {children}
      <AuthModal open={modalOpen} onOpenChange={setModalOpen} />
    </AuthContext.Provider>
  );
};
