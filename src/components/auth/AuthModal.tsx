import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const companyTypes = ["Hotel", "Restaurant", "Cafe", "Bakery", "Catering", "Other"];

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
    setShowPassword(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      toast({ title: "Welcome back!", description: "You have signed in successfully." });
      resetForm();
      onOpenChange(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (signupPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!name.trim()) {
      setError("Full name is required");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setLoading(false);
      setError(error.message);
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
    setLoading(false);
    toast({ title: "Account created!", description: "Check your email to verify your account." });
    resetForm();
    onOpenChange(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      toast({ title: "Check your email", description: "We sent a password reset link." });
      setMode("login");
    }
  };

  const inputClass = "w-full px-3 py-2.5 rounded-button border border-input bg-card text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition";

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="bg-primary rounded-lg px-3 py-1.5 inline-block mb-3">
              <span className="text-primary-foreground font-bold text-lg tracking-tight">IKON</span>
            </div>
            <h2 className="text-lg font-bold text-foreground">
              {mode === "login" && "Sign In to Your Account"}
              {mode === "signup" && "Create Your Account"}
              {mode === "forgot" && "Reset Password"}
            </h2>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-button bg-destructive/10 text-destructive text-sm">{error}</div>
          )}

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={inputClass} placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="button" onClick={() => { setMode("forgot"); setError(""); }} className="text-sm text-primary hover:underline">Forgot Password?</button>
              <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-button transition flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Sign In
              </button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button type="button" onClick={() => { setMode("signup"); setError(""); }} className="text-primary font-semibold hover:underline">Sign Up</button>
              </p>
            </form>
          )}

          {/* Signup Form */}
          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Full Name *</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="John Doe" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Email *</label>
                <input type="email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className={inputClass} placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Password * <span className="text-muted-foreground font-normal">(min 8 chars)</span></label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required minLength={8} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Phone <span className="text-muted-foreground font-normal">(optional)</span></label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+95 9xxx" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Company Name <span className="text-muted-foreground font-normal">(optional)</span></label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} placeholder="ABC Co." />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Company Type <span className="text-muted-foreground font-normal">(optional)</span></label>
                <select value={companyType} onChange={(e) => setCompanyType(e.target.value)} className={inputClass}>
                  <option value="">Select type...</option>
                  {companyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-button transition flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Create Account
              </button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button type="button" onClick={() => { setMode("login"); setError(""); }} className="text-primary font-semibold hover:underline">Sign In</button>
              </p>
            </form>
          )}

          {/* Forgot Password */}
          {mode === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className={inputClass} placeholder="you@example.com" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-button transition flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Send Reset Link
              </button>
              <button type="button" onClick={() => { setMode("login"); setError(""); }} className="w-full text-sm text-primary hover:underline">Back to Sign In</button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
