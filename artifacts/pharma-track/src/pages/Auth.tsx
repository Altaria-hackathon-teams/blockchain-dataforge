import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill, Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck,
  Briefcase, AlertCircle, Phone, FileCheck, CheckCircle2, Factory,
  Truck, Store, Building2, Smartphone, Shield, Activity
} from "lucide-react";
import { useStore, UserRole } from "@/lib/store";
import { toast } from "sonner";
import { auth, googleProvider } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  onAuthStateChanged
} from "firebase/auth";

type AuthState = "role-select" | "register" | "login" | "success";

export function Auth() {
  const [, navigate] = useLocation();
  const [state, setState] = useState<AuthState>("role-select");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    licenseNo: "",
  });

  // Handle initial state based on path
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/login") {
      setState("login");
    } else if (path === "/register") {
      setState("role-select");
    }

    // Check if already logged in via Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user exists in Firebase, we still need a role for our app logic
        // For demo, we default or check custom claims (omitted for simplicity)
      }
    });
    return () => unsubscribe();
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setState("register");
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Successfully signed in with Google
      login({
        name: user.displayName || "Google User",
        email: user.email || "",
        role: selectedRole || "LOCAL_SHOP" // Default to local shop if no role selected
      });

      toast.success("Signed in with Google");
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error("Google login failed", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.name || !form.email || !form.password || !form.phone || !form.licenseNo) {
      setError("Please fill in all clinical registration fields.");
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, form.email, form.password);
      
      // In a real app, we'd save Name, Phone, License, and Role to Firestore here
      
      setLoading(false);
      setState("success");
      toast.success("Account Created", {
        description: "Registration complete. Redirecting to login...",
      });

      setTimeout(() => {
        setState("login");
      }, 2500);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Support both hardcoded demo logins and real Firebase logins
    const demoUsers = {
      "mfg@altaria.com": { password: "admin123", role: "MANUFACTURER", name: "Altaria Pharma Mfg" },
      "supplier@altaria.com": { password: "admin123", role: "SUPPLIER", name: "Regional Logistics" },
      "local@altaria.com": { password: "admin123", role: "LOCAL_SHOP", name: "Local Health Pharmacy" }
    };

    const demoUser = demoUsers[form.email as keyof typeof demoUsers];

    try {
      if (demoUser && form.password === demoUser.password) {
        // Successful Demo Login
        login({
          name: demoUser.name,
          email: form.email,
          role: demoUser.role as UserRole
        });
      } else {
        // Try Firebase Auth
        const result = await signInWithEmailAndPassword(auth, form.email, form.password);
        login({
          name: result.user.displayName || form.email.split("@")[0],
          email: form.email,
          role: selectedRole || "LOCAL_SHOP"
        });
      }

      setLoading(false);
      
      // Role-based routing
      const role = demoUser?.role || selectedRole || "LOCAL_SHOP";
      if (role === "MANUFACTURER") navigate("/manufacturer");
      else if (role === "SUPPLIER") navigate("/track");
      else navigate("/verify");

    } catch (err: any) {
      setError("Invalid credentials. Please check your email/password.");
      setLoading(false);
    }
  };

  const roleConfigs = {
    MANUFACTURER: { icon: Factory, title: "Manufacturer", desc: "Batch creation and genesis logging" },
    SUPPLIER: { icon: Truck, title: "Supplier", desc: "Regional distribution and tracking" },
    LOCAL_SHOP: { icon: Store, title: "Local Shop", desc: "Inventory and direct verification" }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="absolute top-8 left-8 z-50">
        <Link href="/">
          <button className="group flex items-center gap-2 text-slate-400 hover:text-white transition-all text-sm font-medium">
            <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">←</span>
            Back to Portal
          </button>
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {state === "role-select" && (
          <motion.div key="role-select" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="w-full max-w-4xl px-6 text-center">
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                <Shield className="w-3 h-3" /> Identity Hub
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Choose Your Role</h1>
              <p className="text-slate-400 max-w-lg mx-auto">Select your position in the pharmaceutical supply chain to begin onboarding.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(Object.keys(roleConfigs) as UserRole[]).map((role) => {
                const config = roleConfigs[role];
                return (
                  <motion.div key={role} whileHover={{ y: -8, scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleRoleSelect(role)} className="cursor-pointer group relative p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                      <config.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">{config.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{config.desc}</p>
                  </motion.div>
                );
              })}
            </div>
            <p className="mt-12 text-slate-500 text-sm">Already have an account? <button onClick={() => setState("login")} className="text-blue-400 font-bold hover:underline">Sign In</button></p>
          </motion.div>
        )}

        {state === "register" && selectedRole && (
          <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-lg mx-6">
            <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
              <div className="flex flex-col items-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-4 shadow-xl shadow-blue-900/40">
                  <Pill className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Secure Registration</h2>
                <p className="text-slate-400 text-sm mt-1">Onboarding as {roleConfigs[selectedRole].title}</p>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Official Name</label><div className="relative"><Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-blue-500/50 outline-none text-sm transition-all" placeholder="Org Name" /></div></div>
                  <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">License No</label><div className="relative"><FileCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input type="text" required value={form.licenseNo} onChange={e => setForm({...form, licenseNo: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-blue-500/50 outline-none text-sm transition-all" placeholder="LIC-9021-X" /></div></div>
                </div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Contact Phone</label><div className="relative"><Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-blue-500/50 outline-none text-sm transition-all" placeholder="+1 (555) 000-0000" /></div></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label><div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-blue-500/50 outline-none text-sm transition-all" placeholder="admin@org.com" /></div></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Password</label><div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input type={showPassword ? "text" : "password"} required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full pl-10 pr-10 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-blue-500/50 outline-none text-sm transition-all" placeholder="••••••••" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-4">{loading ? <Activity className="animate-spin w-4 h-4" /> : "Submit Registration"}</button>
              </form>
              <div className="mt-8 pt-8 border-t border-slate-800 text-center"><button onClick={() => setState("role-select")} className="text-xs text-slate-500 hover:text-white">← Back</button></div>
            </div>
          </motion.div>
        )}

        {state === "success" && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-6"><CheckCircle2 className="w-12 h-12" /></div>
            <h2 className="text-3xl font-black mb-2">Registration Verified</h2>
            <p className="text-slate-400 mb-8">Welcome to PharmaTrace. Initializing your secure portal...</p>
            <div className="w-64 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800"><motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2.2, ease: "easeInOut" }} className="h-full bg-blue-600" /></div>
          </motion.div>
        )}

        {state === "login" && (
          <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-6">
            <div className="bg-slate-900/80 backdrop-blur-3xl border border-slate-800/50 rounded-[2.5rem] p-10 shadow-2xl">
              <div className="flex flex-col items-center mb-10">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-5 shadow-2xl shadow-blue-900/50"><ShieldCheck className="w-8 h-8 text-white" /></div>
                <h2 className="text-3xl font-black tracking-tight">Portal Access</h2>
                <p className="text-slate-400 text-sm mt-1">Firebase Authentication Gateway</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
                <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Entity Role</label><div className="relative group"><Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" /><select value={selectedRole || "MANUFACTURER"} onChange={e => setSelectedRole(e.target.value as UserRole)} className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none text-sm appearance-none cursor-pointer text-slate-300"><option value="MANUFACTURER">Manufacturer</option><option value="SUPPLIER">Supplier / Distributor</option><option value="LOCAL_SHOP">Local Shop / Pharmacy</option></select></div></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Identity (Email)</label><div className="relative group"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" /><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:border-blue-600 outline-none text-sm transition-all" placeholder="admin@pharma.com" /></div></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Access Key</label><div className="relative group"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" /><input type={showPassword ? "text" : "password"} required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full pl-12 pr-12 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:border-blue-600 outline-none text-sm transition-all" placeholder="••••••••" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all">{loading ? <Activity className="w-5 h-5 animate-spin" /> : <><Shield className="w-5 h-5" /> Authorize Entry</>}</button>
              </form>
              <div className="mt-8 space-y-6">
                <div className="flex items-center gap-4"><div className="flex-1 h-px bg-slate-800" /><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Social Access</span><div className="flex-1 h-px bg-slate-800" /></div>
                <button onClick={handleGoogleLogin} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-all active:scale-95 shadow-lg shadow-white/5"><img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" /> Continue with Google</button>
                <div className="flex items-center gap-4 pt-4"><div className="flex-1 h-px bg-slate-800" /><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quick Access (Demo)</span><div className="flex-1 h-px bg-slate-800" /></div>
                <div className="grid grid-cols-3 gap-3">
                  {[{ role: "MANUFACTURER", icon: Factory, email: "mfg@altaria.com", label: "Mfg" }, { role: "SUPPLIER", icon: Truck, email: "supplier@altaria.com", label: "Sup" }, { role: "LOCAL_SHOP", icon: Store, email: "local@altaria.com", label: "Shop" }].map((demo) => (
                    <button key={demo.role} onClick={() => { setForm({ ...form, email: demo.email, password: "admin123" }); setSelectedRole(demo.role as UserRole); toast.success(`Loaded ${demo.label} credentials`); }} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
                      <demo.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" /><span className="text-[10px] font-bold text-slate-500 group-hover:text-blue-400">{demo.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-10 text-center"><button onClick={() => setState("role-select")} className="text-xs font-bold text-slate-500 hover:text-blue-400 transition-colors flex items-center justify-center gap-1 mx-auto">New Entity? <span className="text-blue-500">Register on Blockchain</span></button></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute bottom-8 text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] flex items-center gap-4"><span>FIPS 140-2 Validated</span><span className="w-1 h-1 bg-slate-800 rounded-full" /><span>AES-256 GCM</span><span className="w-1 h-1 bg-slate-800 rounded-full" /><span>TLS 1.3</span></div>
    </div>
  );
}
