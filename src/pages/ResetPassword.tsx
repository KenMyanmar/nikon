import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Lock, Eye, EyeOff, CheckCircle, Circle, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ikonLogo from "@/assets/ikon-logo.png";

type Status = "loading" | "ready" | "success" | "error";

const rules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

export default function ResetPassword() {
  const [status, setStatus] = useState<Status>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const allPassed = rules.every((r) => r.test(password));
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStatus("ready");
      }
    });

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const hash = window.location.hash;
        if (hash.includes("type=recovery")) {
          setStatus("ready");
          return;
        }
        setStatus("ready");
      } else {
        setTimeout(() => {
          setStatus((prev) => (prev === "loading" ? "error" : prev));
        }, 5000);
      }
    };
    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allPassed || !passwordsMatch) return;

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setStatus("success");
      toast({ title: "Password updated!", description: "Redirecting..." });
      await supabase.auth.signOut();
      setTimeout(() => navigate("/"), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-primary/5 to-background">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-lg p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <img src={ikonLogo} alt="IKON Mart" className="h-10 object-contain" />
          </div>

          {/* Loading State */}
          {status === "loading" && (
            <div className="text-center space-y-4 py-8">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto" />
              <p className="text-foreground font-semibold">Verifying your reset link...</p>
              <p className="text-sm text-muted-foreground">Please wait</p>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="text-center space-y-4 py-8">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
              <h2 className="text-xl font-bold text-foreground">Reset Link Expired</h2>
              <p className="text-sm text-muted-foreground">
                This password reset link has expired or is invalid.
              </p>
              <Button onClick={() => navigate("/")} className="mt-4">
                Request a New Reset Link
              </Button>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="text-center space-y-4 py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h2 className="text-xl font-bold text-foreground">Password Updated Successfully!</h2>
              <p className="text-sm text-muted-foreground">
                Your password has been changed. Redirecting you to login...
              </p>
              <div className="w-full bg-muted rounded-full h-1.5 mt-4 overflow-hidden">
                <div className="bg-green-500 h-full rounded-full animate-[shrink_3s_linear_forwards]" />
              </div>
              <Button variant="link" onClick={() => navigate("/")}>
                Go to Login
              </Button>
            </div>
          )}

          {/* Ready State — Form */}
          {status === "ready" && (
            <>
              <div className="text-center space-y-2">
                <ShieldCheck className="w-10 h-10 text-amber-500 mx-auto" />
                <h1 className="text-xl font-bold text-foreground">Set Your New Password</h1>
                <p className="text-sm text-muted-foreground">
                  Choose a strong password for your IKON Mart account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9 pr-10"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <p className={`text-xs flex items-center gap-1 ${passwordsMatch ? "text-green-600" : "text-destructive"}`}>
                      {passwordsMatch ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </p>
                  )}
                </div>

                {/* Strength Checklist */}
                <div className="space-y-1.5 pt-1">
                  {rules.map((rule) => {
                    const passed = rule.test(password);
                    return (
                      <div key={rule.label} className="flex items-center gap-2 text-xs">
                        {passed ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                        )}
                        <span className={passed ? "text-green-600" : "text-muted-foreground"}>
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Button
                  type="submit"
                  disabled={!allPassed || !passwordsMatch || isSubmitting}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Update Password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
