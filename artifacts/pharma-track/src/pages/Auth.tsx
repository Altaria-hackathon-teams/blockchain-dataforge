import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, Briefcase, AlertCircle } from "lucide-react";
import { useStore, UserRole } from "@/lib/store";

interface AuthProps {
  mode: "login" | "register";
}

export function Auth({ mode }: AuthProps) {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "MANUFACTURER" as UserRole });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useStore();

  const isLogin = mode === "login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Hardcoded credentials for demo
    const validUsers = {
      "mfg@altaria.com": { password: "admin123", role: "MANUFACTURER", name: "Altaria Manufacturer" },
      "supplier@altaria.com": { password: "admin123", role: "SUPPLIER", name: "Regional Supplier" },
      "local@altaria.com": { password: "admin123", role: "LOCAL_SHOP", name: "Local Pharmacy" }
    };

    const userEntry = validUsers[form.email as keyof typeof validUsers];

    // Simulate network delay
    await new Promise(r => setTimeout(r, 600));

    if (isLogin) {
      if (!userEntry || userEntry.password !== form.password || userEntry.role !== form.role) {
        setError("Invalid email, password, or role.");
        setLoading(false);
        return;
      }
      login({ name: userEntry.name, email: form.email, role: userEntry.role as UserRole });
    } else {
      // Allow any registration for demo purposes
      login({ name: form.name || form.email.split("@")[0], email: form.email, role: form.role });
    }

    setLoading(false);
    
    // Route based on role
    if (form.role === "MANUFACTURER") {
      navigate("/manufacturer");
    } else if (form.role === "SUPPLIER") {
      navigate("/track");
    } else {
      navigate("/verify");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Back to landing */}
      <Link href="/">
        <button className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to home
        </button>
      </Link>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-md mx-6"
        >
          {/* Card */}
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-8 shadow-2xl">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-600/40">
                <Pill className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                {isLogin ? "Welcome back" : "Create account"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {isLogin ? "Sign in to PharmaTrace" : "Join the PharmaTrace platform"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-500 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Name — register only */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="Dr. Jane Doe"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all"
                    />
                  </div>
                </motion.div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Account Type
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all appearance-none cursor-pointer"
                  >
                    <option value="MANUFACTURER">Manufacturer</option>
                    <option value="SUPPLIER">Distributor / Supplier</option>
                    <option value="LOCAL_SHOP">Local Shop / Pharmacy</option>
                  </select>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="you@pharmatrace.io"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-700/40"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <>
                    {isLogin ? "Sign in" : "Create account"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Toggle mode */}
            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <Link href={isLogin ? "/register" : "/login"}>
                <span className="text-blue-400 font-semibold hover:text-blue-300 cursor-pointer transition-colors">
                  {isLogin ? "Register" : "Log in"}
                </span>
              </Link>
            </p>

            {/* Trust badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Secured with end-to-end encryption
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
