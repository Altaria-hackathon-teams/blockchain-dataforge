import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ShieldCheck,
  TrendingUp,
  Route,
  Boxes,
  GitBranch,
  Activity,
  ArrowRight,
  Pill,
  Lock,
  Zap,
  Globe,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

// ─── Mouse-repel particles canvas ────────────────────────────────────────────
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Track mouse on window (not just canvas)
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener("mousemove", onMove);

    // Generate particles
    const PARTICLE_COUNT = 120;
    type Particle = {
      ox: number; oy: number; x: number; y: number;
      r: number; opacity: number; vx: number; vy: number;
    };
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      ox: Math.random() * canvas.width,
      oy: Math.random() * canvas.height,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 1,
      opacity: Math.random() * 0.4 + 0.1,
      vx: 0, vy: 0,
    }));

    let animId: number;
    const REPEL_RADIUS = 130;
    const REPEL_STRENGTH = 5;

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_RADIUS) {
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          p.vx += (dx / dist) * force * REPEL_STRENGTH;
          p.vy += (dy / dist) * force * REPEL_STRENGTH;
        }

        // Spring back to origin
        p.vx += (p.ox - p.x) * 0.03;
        p.vy += (p.oy - p.y) * 0.03;
        // Damping
        p.vx *= 0.82;
        p.vy *= 0.82;

        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 140, 255, ${p.opacity})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

// ─── Animated word-by-word headline ──────────────────────────────────────────
const words = ["Predictive.", "Tamper-proof.", "Optimized."];

function AnimatedHeadline() {
  const [visible, setVisible] = useState<boolean[]>(Array(words.length).fill(false));

  useEffect(() => {
    words.forEach((_, i) => {
      setTimeout(() => {
        setVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 400 + i * 300);
    });
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
      {words.map((word, i) => (
        <motion.span
          key={word}
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={visible[i] ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-foreground"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Blockchain Verification",
    desc: "Every batch is cryptographically sealed using SHA-256 hash chains. Any tampering is detected instantly.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: TrendingUp,
    title: "AI Predictive Insights",
    desc: "Machine-learning models predict supply disruptions and flag anomalies before they escalate.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
  {
    icon: Route,
    title: "Smart Routing",
    desc: "Dynamic routing engine calculates the optimal cold-chain path across the distribution network in real-time.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    icon: Boxes,
    title: "Batch Registration",
    desc: "Manufacturers can register, serialise, and release pharmaceutical batches to the immutable ledger in seconds.",
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-100",
  },
  {
    icon: GitBranch,
    title: "Provenance Tracking",
    desc: "Visualise every custody handoff — manufacturer → distributor → pharmacy — in a live timeline.",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
  },
  {
    icon: Activity,
    title: "Real-time Dashboard",
    desc: "Unified command console with live KPIs, counterfeit alerts, and geographic distribution maps.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-100",
  },
];

const STATS = [
  { label: "Batches Tracked", value: "2.4M+", icon: Boxes },
  { label: "Counterfeits Blocked", value: "18,300+", icon: Lock },
  { label: "Countries Active", value: "42", icon: Globe },
  { label: "Uptime", value: "99.99%", icon: Zap },
];

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function Landing() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-300 ${
      isDark ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"
    }`}>
      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 inset-x-0 z-50 border-b backdrop-blur-md transition-colors duration-300 ${
        isDark
          ? "bg-slate-900/80 border-slate-800/60"
          : "bg-white/80 border-slate-200/60"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Pill className="h-4 w-4 text-white" />
            </div>
            <span className={`font-bold text-lg tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}>PharmaTrace</span>
          </div>

          <nav className={`hidden md:flex items-center gap-8 text-sm font-medium ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}>
            <a href="#features" className={`hover:${ isDark ? "text-white" : "text-slate-900" } transition-colors`}>Features</a>
            <a href="#stats" className={`hover:${ isDark ? "text-white" : "text-slate-900" } transition-colors`}>Impact</a>
            <a href="#how" className={`hover:${ isDark ? "text-white" : "text-slate-900" } transition-colors`}>How it works</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className={`relative flex items-center w-12 h-6 rounded-full border transition-colors duration-300 ${
                isDark ? "bg-slate-700 border-slate-600" : "bg-blue-100 border-blue-200"
              }`}
            >
              <Sun className={`absolute left-1 h-3.5 w-3.5 transition-all ${ isDark ? "opacity-30 text-slate-400" : "opacity-100 text-amber-500" }`} />
              <Moon className={`absolute right-1 h-3.5 w-3.5 transition-all ${ isDark ? "opacity-100 text-blue-300" : "opacity-30 text-slate-400" }`} />
              <div
                className={`absolute h-[18px] w-[18px] rounded-full shadow-md transition-all duration-300 ${
                  isDark ? "bg-blue-400 left-6" : "bg-white left-0.5"
                }`}
              />
            </button>

            <Link href="/login">
              <button className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                isDark
                  ? "text-slate-300 hover:text-white hover:bg-slate-800"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              }`}>
                Log in
              </button>
            </Link>
            <Link href="/register">
              <button className={`text-sm font-semibold px-4 py-2 rounded-full transition-all shadow-sm ${
                isDark
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "bg-slate-900 text-white hover:bg-slate-700"
              }`}>
                Get started
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className={`relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden ${
        isDark ? "bg-slate-950" : "bg-white"
      }`}>
        <ParticleBackground />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-widest mb-8"
          >
            <Pill className="h-3.5 w-3.5" />
            Pharmaceutical Supply Chain Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className={`text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-4 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            The future of<br />
            <span className="text-blue-600">drug provenance</span>
          </motion.h1>

          <div className="text-3xl md:text-4xl font-bold tracking-tight mb-8 h-14 flex items-center justify-center">
            <AnimatedHeadline />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 1.1 }}
            className={`text-lg max-w-2xl mx-auto mb-10 leading-relaxed ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            PharmaTrace brings blockchain-grade authenticity, AI-powered predictions, and real-time
            supply chain visibility to every pill — from the manufacturer's floor to the patient's hand.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/register">
              <button className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all shadow-lg hover:scale-[1.03] ${
                isDark
                  ? "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/30"
                  : "bg-slate-900 text-white hover:bg-slate-700 shadow-slate-900/20"
              }`}>
                Start for free
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/dashboard">
              <button className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all hover:scale-[1.03] border ${
                isDark
                  ? "text-slate-300 border-slate-600 hover:bg-slate-800 hover:text-white"
                  : "text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50"
              }`}>
                Explore the dashboard
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Fade bottom */}
        <div className={`absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t ${
          isDark ? "from-slate-950" : "from-white"
        } to-transparent z-10`} />
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────────── */}
      <section id="stats" className="py-20 bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {STATS.map(({ label, value, icon: Icon }) => (
              <motion.div key={label} variants={fadeUp} className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 mb-4">
                  <Icon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-3xl md:text-4xl font-black tracking-tight text-white">{value}</div>
                <div className="text-sm text-slate-400 mt-1">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section id="features" className={`py-24 ${ isDark ? "bg-slate-900" : "bg-white" }`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="text-center mb-16"
          >
            <div className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Platform Capabilities</div>
            <h2 className={`text-4xl md:text-5xl font-extrabold tracking-tight ${ isDark ? "text-white" : "text-slate-900" }`}>
              Everything in one console
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              From the moment a batch is manufactured to its final delivery — PharmaTrace covers the entire journey.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map(({ icon: Icon, title, desc, color, bg, border }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: "0 20px 40px -8px rgba(0,0,0,0.10)" }}
                className={`rounded-2xl border ${ isDark ? "border-slate-700/50 bg-slate-800/60" : `${border} ${bg}` } p-6 transition-all duration-300 cursor-default`}
              >
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm mb-5 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className={`font-bold text-lg mb-2 ${ isDark ? "text-white" : "text-slate-900" }`}>{title}</h3>
                <p className={`text-sm leading-relaxed ${ isDark ? "text-slate-400" : "text-slate-500" }`}>{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="how" className={`py-24 ${ isDark ? "bg-slate-950" : "bg-slate-50" }`}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="text-center mb-16"
          >
            <div className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Workflow</div>
            <h2 className={`text-4xl md:text-5xl font-extrabold tracking-tight ${ isDark ? "text-white" : "text-slate-900" }`}>How PharmaTrace works</h2>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2" />
            {[
              { step: "01", title: "Manufacturer registers a batch", desc: "Drug manufacturer logs the batch ID, composition, and expiry on the PharmaTrace ledger. A genesis block is created and sealed." },
              { step: "02", title: "Provenance chain builds automatically", desc: "Every custody handoff — distributor, cold-chain, regional hub — appends a new cryptographically-linked block." },
              { step: "03", title: "Stakeholders verify authenticity", desc: "Pharmacies, regulators, and patients can scan a QR code or enter a batch ID to verify authenticity in under a second." },
              { step: "04", title: "AI surfaces risks proactively", desc: "PharmaTrace's models continuously monitor for anomalies, temperature deviations, and counterfeit patterns — alerting teams before harm occurs." },
            ].map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 mb-12 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"}`}>
                  <div className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">{step}</div>
                  <h3 className={`text-xl font-bold mb-2 ${ isDark ? "text-white" : "text-slate-900" }`}>{title}</h3>
                  <p className={`text-sm leading-relaxed ${ isDark ? "text-slate-400" : "text-slate-500" }`}>{desc}</p>
                </div>
                <div className="relative z-10 h-12 w-12 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-blue-600/30">
                  {step}
                </div>
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
              Secure your supply chain.<br />
              <span className="text-blue-400">Start today.</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
              Join hundreds of pharmaceutical companies using PharmaTrace to protect patients and comply with regulations globally.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-semibold text-base hover:bg-blue-500 transition-all shadow-lg shadow-blue-700/40 hover:scale-[1.03]">
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="inline-flex items-center gap-2 border border-slate-600 text-slate-300 px-8 py-4 rounded-full font-semibold text-base hover:bg-slate-800 hover:text-white transition-all hover:scale-[1.03]">
                  Try demo dashboard
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="py-10 bg-slate-950 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Pill className="h-3.5 w-3.5 text-white" />
            </div>
            PharmaTrace
          </div>
          <div className="text-xs text-slate-500">© 2026 PharmaTrace. All rights reserved.</div>
          <div className="flex gap-6 text-xs text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
