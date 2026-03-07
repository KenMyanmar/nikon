import { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, Mail, Lock, UserIcon, Phone, Building2, ChevronLeft } from "lucide-react";
import ikonLogo from "@/assets/ikon-logo.png";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const companyTypes = ["Hotel", "Restaurant", "Cafe", "Bakery", "Catering", "Other"];

const mapAuthError = (msg: string): string => {
  if (msg.includes("Invalid login credentials")) return "Incorrect email or password.";
  if (msg.includes("already registered") || msg.includes("already been registered")) return "An account with this email already exists. Try signing in.";
  if (msg.includes("rate") || msg.includes("too many")) return "Too many attempts. Please wait a moment.";
  if (msg.includes("fetch") || msg.includes("network") || msg.includes("Failed to fetch")) return "Connection error. Please try again.";
  if (msg.includes("Password should be at least")) return "Password must be at least 8 characters.";
  return msg;
};

const getPasswordStrength = (password: string): { label: string; percent: number; color: string } => {
  if (!password) return { label: "", percent: 0, color: "bg-muted" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { label: "Weak", percent: 25, color: "bg-destructive" };
  if (score <= 3) return { label: "Medium", percent: 60, color: "bg-[hsl(var(--warning,45_93%_47%))]" };
  return { label: "Strong", percent: 100, color: "bg-[hsl(var(--success,142_76%_36%))]" };
};

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup fields
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("");

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(signupPassword), [signupPassword]);

  const resetForm = () => {
    setError("");
    setLoginEmail("");
    setLoginPassword("");
    setName("");
    setSignupEmail("");
    setSignupPassword("");
    setPhone("");
    setCompanyName("");
    setCompanyType("");
    setForgotEmail("");
    setForgotSent(false);
    setShowPassword(false);
  };

  const switchMode = (next: "login" | "signup" | "forgot") => {
    setError("");
    setShowPassword(false);
    setForgotSent(false);
    setMode(next);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (authError) {
        setError(mapAuthError(authError.message));
        return;
      }
      const firstName = data.user?.user_metadata?.full_name?.split(" ")[0] || data.user?.email?.split("@")[0] || "";
      toast({ title: `Welcome back, ${firstName}!` });
      resetForm();
      onOpenChange(false);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Full name is required."); return; }
    if (signupPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: signupEmail.trim(),
        password: signupPassword,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: window.location.origin,
        },
      });
      if (authError) {
        setError(mapAuthError(authError.message));
        return;
      }
      // Create customer row
      if (data.user) {
        await supabase.from("customers").insert({
          user_id: data.user.id,
          name: name.trim(),
          email: signupEmail.trim(),
          phone: phone.trim() || null,
          company_name: companyName.trim() || null,
          company_type: companyType || null,
        });
      }
      // Auto-confirmed (session exists) → close immediately
      if (data.session) {
        toast({ title: "Account created! Welcome to IKON Mart 🎉" });
        resetForm();
        onOpenChange(false);
      } else {
        // Email confirmation required
        toast({ title: "Account created!", description: "Check your email to verify your account." });
        resetForm();
        onOpenChange(false);
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) {
        setError(mapAuthError(resetError.message));
        return;
      }
      setForgotSent(true);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition";
  const inputClassNoIcon =
    "w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition";

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { resetForm(); setMode("login"); } }}>
      <DialogContent className="w-full sm:max-w-md p-0 gap-0 overflow-hidden border-0 rounded-xl shadow-2xl max-h-[85vh] flex flex-col">
        <div className="overflow-y-auto flex-1 p-6 sm:p-8">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img src={ikonLogo} alt="IKON Mart" className="h-14 w-auto object-contain" />
          </div>

          {/* Title */}
          <h2 className="text-center text-lg font-bold text-foreground mb-1">
            {mode === "login" && "Sign In to Your Account"}
            {mode === "signup" && "Create Your Account"}
            {mode === "forgot" && "Reset Password"}
          </h2>
          {mode === "login" && (
            <p className="text-center text-sm text-muted-foreground mb-5">Welcome back to IKON Mart</p>
          )}
          {mode === "signup" && (
            <p className="text-center text-sm text-muted-foreground mb-5">Join Myanmar's trusted commercial supplier</p>
          )}
          {mode === "forgot" && (
            <p className="text-center text-sm text-muted-foreground mb-5">Enter your email to receive a reset link</p>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
              {error}
            </div>
          )}

          {/* ===== LOGIN ===== */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={inputClass} placeholder="you@example.com" autoComplete="email" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type={showPassword ? "text" : "password"} required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition" placeholder="••••••••" autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => switchMode("forgot")} className="text-sm text-primary hover:underline font-medium">Forgot Password?</button>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Sign In
              </button>
              <p className="text-center text-sm text-muted-foreground pt-2">
                Don't have an account?{" "}
                <button type="button" onClick={() => switchMode("signup")} className="text-primary font-semibold hover:underline">Sign Up</button>
              </p>
            </form>
          )}

          {/* ===== SIGNUP ===== */}
          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name *</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="John Doe" autoComplete="name" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className={inputClass} placeholder="you@example.com" autoComplete="email" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Password * <span className="text-muted-foreground font-normal">(min 8 chars)</span></label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type={showPassword ? "text" : "password"} required minLength={8} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition" placeholder="••••••••" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {signupPassword.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Strength</span>
                      <span className="text-xs font-medium text-muted-foreground">{passwordStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Phone <span className="text-muted-foreground font-normal">(optional)</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+95 9xxx" autoComplete="tel" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Company Name <span className="text-muted-foreground font-normal">(optional)</span></label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} placeholder="ABC Co." autoComplete="organization" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Company Type <span className="text-muted-foreground font-normal">(optional)</span></label>
                <select value={companyType} onChange={(e) => setCompanyType(e.target.value)} className={inputClassNoIcon}>
                  <option value="">Select type...</option>
                  {companyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm mt-1">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create Account
              </button>
              <p className="text-center text-sm text-muted-foreground pt-1">
                Already have an account?{" "}
                <button type="button" onClick={() => switchMode("login")} className="text-primary font-semibold hover:underline">Sign In</button>
              </p>
            </form>
          )}

          {/* ===== FORGOT PASSWORD ===== */}
          {mode === "forgot" && (
            <div className="space-y-4">
              {!forgotSent ? (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className={inputClass} placeholder="you@example.com" autoComplete="email" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Send Reset Link
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm text-foreground font-medium mb-1">Check your inbox</p>
                  <p className="text-sm text-muted-foreground">We sent a reset link to <strong>{forgotEmail}</strong></p>
                </div>
              )}
              <button type="button" onClick={() => switchMode("login")} className="w-full flex items-center justify-center gap-1 text-sm text-primary hover:underline font-medium">
                <ChevronLeft className="w-4 h-4" /> Back to Sign In
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
