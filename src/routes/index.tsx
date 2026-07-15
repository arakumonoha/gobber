import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, useMotionValue, useSpring, type Variants } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Sparkles,
  Users,
  Compass,
  Globe2,
  Coffee,
  Mountain,
  Utensils,
  Star,
  Wifi,
  Zap,
  Check,
} from "lucide-react";



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gobber — Meet strangers. Leave with friends." },
      {
        name: "description",
        content:
          "Gobber turns cities into gathering places. Discover intimate dinners, spontaneous hikes and small adventures hosted by people nearby — and become the reason someone remembers a city.",
      },
      { property: "og:title", content: "Gobber — Meet strangers. Leave with friends." },
      {
        property: "og:description",
        content:
          "Discover intimate dinners, hikes and adventures happening around you. Real-life gatherings for curious travelers and locals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

/* ───────────────────────── NAV ───────────────────────── */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: EASE }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4"
    >
      <div
        className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full px-5 transition-all"
        style={{
          background: scrolled
            ? "color-mix(in oklab, white 74%, transparent)"
            : "color-mix(in oklab, white 22%, transparent)",
          backdropFilter: "saturate(180%) blur(24px)",
          WebkitBackdropFilter: "saturate(180%) blur(24px)",
          boxShadow: scrolled
            ? "0 1px 2px rgba(50,34,15,0.05), 0 20px 50px -30px rgba(50,34,15,0.22)"
            : "none",
          border: "1px solid rgba(20,18,16,0.05)",
        }}
      >
        <Link to="/" className="flex items-center gap-2">
          <span
            className="grid h-7 w-7 place-items-center rounded-full text-white"
            style={{
              background: "linear-gradient(180deg, #1c1815 0%, #0a0908 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            <Globe2 className="h-3.5 w-3.5" strokeWidth={2.4} />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-[#141210]">
            Gobber
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-[13.5px] text-[#4a3f33] md:flex">
          <a href="#story" className="transition hover:text-[#141210]">Story</a>
          <a href="#how" className="transition hover:text-[#141210]">How it works</a>
          <a href="#features" className="transition hover:text-[#141210]">Features</a>
          <a href="#voices" className="transition hover:text-[#141210]">Voices</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="hidden rounded-full px-4 py-1.5 text-[13.5px] text-[#4a3f33] transition hover:text-[#141210] sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            className="group inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-[13.5px] font-medium text-white transition"
            style={{
              background: "linear-gradient(180deg, #1c1815 0%, #0a0908 100%)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.08) inset, 0 10px 24px -14px rgba(20,18,16,0.6)",
            }}
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

/* ─────────── AMBIENT BACKGROUND (orbs + grid + noise) ─────────── */

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* base warm gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 85% -10%, #ffe9c4 0%, transparent 55%), radial-gradient(90% 70% at -10% 110%, #ffd7b0 0%, transparent 55%), linear-gradient(180deg, #fbf5e8 0%, #f4e8cf 100%)",
        }}
      />
      {/* colored orbs */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4 }}
        className="absolute -left-32 top-24 h-[420px] w-[420px] rounded-full"
        style={{
          background: "radial-gradient(closest-side, rgba(255,151,102,0.55), transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <motion.div
        aria-hidden
        animate={{ y: [0, -24, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-24 top-10 h-[520px] w-[520px] rounded-full"
        style={{
          background: "radial-gradient(closest-side, rgba(139,111,63,0.35), transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <motion.div
        aria-hidden
        animate={{ y: [0, 18, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-200px] left-1/3 h-[520px] w-[520px] rounded-full"
        style={{
          background: "radial-gradient(closest-side, rgba(232,161,122,0.4), transparent 70%)",
          filter: "blur(90px)",
        }}
      />
      {/* faint grid */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hero-grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#1a1614" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
      {/* subtle grain */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.08 0 0 0 0 0.05 0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}

/* ─────────── PRODUCT MOCKUP (interactive map card) ─────────── */

function HeroMock() {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 120, damping: 18 });
  const sy = useSpring(ry, { stiffness: 120, damping: 18 });

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 8);
    rx.set(-py * 8);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  const pins = [
    { x: "22%", y: "34%", name: "Fabrique", tag: "Coffee", tone: "#8b6f3f", live: 6 },
    { x: "48%", y: "48%", name: "Ozone Lab", tag: "Focus", tone: "#c96a3a", live: 12 },
    { x: "70%", y: "30%", name: "Casa Verde", tag: "Terrace", tone: "#5a7d5a", live: 4 },
    { x: "60%", y: "68%", name: "Kōhī Bar", tag: "Quiet", tone: "#3a5a7d", live: 9 },
  ];

  const avatars = ["#c9a97a","#e3a17a","#8b6f3f","#c96a3a","#6b5c48"];

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: EASE, delay: 0.5 }}
      style={{ perspective: 1400 }}
      className="relative w-full"
    >
      <motion.div
        style={{ rotateX: sx, rotateY: sy, transformStyle: "preserve-3d" }}
        className="relative overflow-hidden rounded-[28px]"
      >
        <div
          className="relative aspect-[4/5] w-full"
          style={{
            background: "linear-gradient(180deg, #fdf6e6 0%, #f0dfb7 100%)",
            boxShadow:
              "0 60px 120px -40px rgba(50,34,15,0.45), 0 12px 40px -20px rgba(50,34,15,0.2), inset 0 1px 0 rgba(255,255,255,0.7)",
            border: "1px solid rgba(20,18,16,0.06)",
          }}
        >
          {/* map surface */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 90% at 30% 30%, #ecd7a8 0%, transparent 60%), radial-gradient(50% 70% at 78% 72%, #d9c290 0%, transparent 60%), linear-gradient(180deg, #efe0bd 0%, #e3cf9e 100%)",
            }}
          />
          {/* roads */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 500" fill="none">
            {[
              "M 0 120 C 100 90, 220 160, 400 130",
              "M 0 260 C 140 220, 260 300, 400 260",
              "M 0 380 C 120 340, 280 420, 400 380",
              "M 80 0 C 60 140, 180 260, 140 500",
              "M 260 0 C 300 140, 220 320, 300 500",
            ].map((d, i) => (
              <path key={i} d={d} stroke="#8b6f3f" strokeOpacity="0.28" strokeWidth="1" />
            ))}
          </svg>

          {/* connection lines between pins */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.path
              d="M 22 34 Q 35 42 48 48"
              stroke="#1a1614" strokeOpacity="0.35" strokeWidth="0.25" fill="none" strokeDasharray="1 1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, delay: 1 }}
            />
            <motion.path
              d="M 48 48 Q 60 40 70 30"
              stroke="#1a1614" strokeOpacity="0.35" strokeWidth="0.25" fill="none" strokeDasharray="1 1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, delay: 1.3 }}
            />
            <motion.path
              d="M 48 48 Q 56 58 60 68"
              stroke="#1a1614" strokeOpacity="0.35" strokeWidth="0.25" fill="none" strokeDasharray="1 1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, delay: 1.6 }}
            />
          </svg>

          {/* animated pins */}
          {pins.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.9 + i * 0.15, duration: 0.7, ease: EASE }}
              style={{ left: p.x, top: p.y }}
              className="absolute -translate-x-1/2 -translate-y-full"
            >
              <div className="relative">
                <motion.span
                  className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ background: p.tone }}
                  animate={{ boxShadow: [`0 0 0 0 ${p.tone}55`, `0 0 0 14px ${p.tone}00`] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.4 }}
                />
                <div
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-medium text-[#1a1614]"
                  style={{
                    background: "color-mix(in oklab, white 85%, transparent)",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 10px 24px -8px rgba(50,34,15,0.35)",
                    border: "1px solid rgba(20,18,16,0.06)",
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.tone }} />
                  {p.name}
                  <span className="text-[9.5px] text-[#8b6f3f]">· {p.live}</span>
                </div>
                <div
                  className="mx-auto mt-1 h-2.5 w-2.5 rounded-full"
                  style={{
                    background: "linear-gradient(180deg, #1c1815, #0a0908)",
                    boxShadow: "0 3px 8px rgba(20,18,16,0.5)",
                  }}
                />
              </div>
            </motion.div>
          ))}

          {/* Floating profile card - top right */}
          <motion.div
            initial={{ opacity: 0, x: 30, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8, ease: EASE }}
            className="absolute right-3 top-3 flex items-center gap-2.5 rounded-2xl px-3 py-2"
            style={{
              background: "color-mix(in oklab, white 88%, transparent)",
              backdropFilter: "blur(18px)",
              border: "1px solid rgba(20,18,16,0.06)",
              boxShadow: "0 14px 30px -14px rgba(50,34,15,0.3)",
            }}
          >
            <div className="relative h-8 w-8 rounded-full" style={{ background: "linear-gradient(135deg,#e3a17a,#8b6f3f)" }}>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#5a9d5a]" />
            </div>
            <div className="pr-1">
              <div className="text-[11px] font-semibold tracking-[-0.01em] text-[#141210]">Mira joined</div>
              <div className="text-[10px] text-[#6b5c48]">Ozone Lab · now</div>
            </div>
          </motion.div>

          {/* Availability chip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 0.7, ease: EASE }}
            className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-medium text-[#1a1614]"
            style={{
              background: "color-mix(in oklab, white 85%, transparent)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(20,18,16,0.06)",
              boxShadow: "0 8px 20px -8px rgba(50,34,15,0.25)",
            }}
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-[#5a9d5a]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            Live · 214 nearby
          </motion.div>

          {/* Bottom café card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8, ease: EASE }}
            className="absolute inset-x-3 bottom-3 rounded-2xl p-4"
            style={{
              background: "color-mix(in oklab, white 90%, transparent)",
              backdropFilter: "blur(22px)",
              border: "1px solid rgba(20,18,16,0.06)",
              boxShadow: "0 24px 50px -20px rgba(50,34,15,0.35)",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#c96a3a]">
                  <Zap className="h-3 w-3" strokeWidth={2.6} /> Table forming
                </div>
                <div className="mt-1 font-display text-[16px] font-semibold tracking-[-0.02em] text-[#141210]">
                  Deep-work morning at Ozone Lab
                </div>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-[#6b5c48]">
                  <span className="inline-flex items-center gap-1"><Wifi className="h-3 w-3" /> 320 Mb</span>
                  <span className="inline-flex items-center gap-1"><Coffee className="h-3 w-3" /> Specialty</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> 4 seats</span>
                </div>
              </div>
              <button
                className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium text-white"
                style={{
                  background: "linear-gradient(180deg,#c96a3a,#a3512a)",
                  boxShadow: "0 8px 18px -8px rgba(201,106,58,0.6)",
                }}
              >
                Join
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex -space-x-2">
                {avatars.map((c, i) => (
                  <div key={i} className="h-6 w-6 rounded-full border-2 border-white" style={{ background: c }} />
                ))}
                <div className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-[#1c1815] text-[9px] font-semibold text-white">
                  +3
                </div>
              </div>
              <span className="text-[10.5px] text-[#6b5c48]">Starts in 12 min</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating notification card */}
      <motion.div
        initial={{ opacity: 0, x: 40, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.9, duration: 0.9, ease: EASE }}
        className="absolute -right-6 top-1/3 hidden w-[220px] rounded-2xl p-3 md:block"
        style={{
          background: "color-mix(in oklab, white 92%, transparent)",
          backdropFilter: "blur(22px)",
          border: "1px solid rgba(20,18,16,0.06)",
          boxShadow: "0 30px 60px -20px rgba(50,34,15,0.4)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: "linear-gradient(135deg,#5a9d5a,#3d7b3d)" }}>
            <Check className="h-4 w-4 text-white" strokeWidth={3} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-[#141210]">You&rsquo;re in</div>
            <div className="truncate text-[10.5px] text-[#6b5c48]">Casa Verde · 3:00 PM</div>
          </div>
        </div>
      </motion.div>

      {/* Floating stat card */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 2.1, duration: 0.9, ease: EASE }}
        className="absolute -left-6 bottom-24 hidden w-[200px] rounded-2xl p-3 md:block"
        style={{
          background: "color-mix(in oklab, white 92%, transparent)",
          backdropFilter: "blur(22px)",
          border: "1px solid rgba(20,18,16,0.06)",
          boxShadow: "0 30px 60px -20px rgba(50,34,15,0.4)",
        }}
      >
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#8b6f3f]">This week</div>
        <div className="mt-1 font-display text-[22px] font-semibold tracking-[-0.02em] text-[#141210]">
          38 new tables
        </div>
        <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-[#1a161410]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "72%" }}
            transition={{ delay: 2.4, duration: 1.2, ease: EASE }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#c96a3a,#e3a17a)" }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────── HERO ────────────────────────── */

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden px-6 pb-24 pt-32 lg:pt-36"
    >
      <HeroBackdrop />

      <motion.div
        style={{ y }}
        className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10"
      >
        {/* LEFT — copy */}
        <div className="relative max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,18,16,0.08)] bg-white/55 px-3 py-1 text-[11.5px] font-medium uppercase tracking-[0.14em] text-[#4a3f33] backdrop-blur"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c96a3a] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#c96a3a]" />
            </span>
            Live in 42 cities · 1,280 cafés
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.12 }}
            className="serif-hero mt-6 text-[clamp(44px,6.4vw,84px)] leading-[0.98] tracking-[-0.035em] text-[#141210]"
          >
            Work anywhere.
            <br />
            <span style={{ color: "#c96a3a" }}>Connect</span>{" "}
            <em style={{ fontStyle: "italic", fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}>
              everywhere.
            </em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.28 }}
            className="mt-6 max-w-[52ch] text-[17px] leading-[1.6] text-[#4a3f33]"
            style={{ fontFamily: "'SF Pro Text', -apple-system, 'Figtree', sans-serif" }}
          >
            Gobber is where remote workers find their next café, their next focus table, and the people
            worth sharing it with. Discover coworking-ready spots nearby — join a live table in one tap.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.42 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/auth"
              className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-medium text-white transition hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(180deg, #1c1815 0%, #0a0908 100%)",
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.08) inset, 0 24px 40px -18px rgba(20,18,16,0.55), 0 6px 12px rgba(20,18,16,0.15)",
              }}
            >
              Get started — it&rsquo;s free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/auth"
              className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-medium text-[#141210] transition hover:-translate-y-0.5"
              style={{
                background: "color-mix(in oklab, white 70%, transparent)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(20,18,16,0.09)",
                boxShadow: "0 10px 22px -14px rgba(20,18,16,0.25)",
              }}
            >
              <Compass className="h-4 w-4 text-[#8b6f3f]" strokeWidth={2.4} />
              Explore spaces
              <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>

          {/* trust row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.6 }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["#c9a97a","#e3a17a","#8b6f3f","#c96a3a","#6b5c48"].map((c, i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-[#fbf5e8]" style={{ background: c }} />
                ))}
              </div>
              <div className="text-[12.5px] leading-tight text-[#4a3f33]">
                <div className="font-semibold text-[#141210]">62,000+ members</div>
                <div className="text-[#6b5c48]">joined this year</div>
              </div>
            </div>
            <div className="h-8 w-px bg-[#1a161418]" />
            <TrustStat value="4.9" label="App Store" icon={<Star className="h-3 w-3 fill-current" />} />
            <div className="h-8 w-px bg-[#1a161418]" />
            <TrustStat value="1,280" label="Cafés listed" icon={<Coffee className="h-3 w-3" />} />
            <div className="h-8 w-px bg-[#1a161418]" />
            <TrustStat value="42" label="Cities" icon={<Globe2 className="h-3 w-3" />} />
          </motion.div>
        </div>

        {/* RIGHT — product mock */}
        <div className="relative">
          <HeroMock />
        </div>
      </motion.div>
    </section>
  );
}

function TrustStat({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white/60 text-[#8b6f3f] backdrop-blur" style={{ border: "1px solid rgba(20,18,16,0.06)" }}>
        {icon}
      </span>
      <div className="text-[12.5px] leading-tight">
        <div className="font-semibold text-[#141210]">{value}</div>
        <div className="text-[#6b5c48]">{label}</div>
      </div>
    </div>
  );
}


/* ─────────────────────── SECTION SHELL ─────────────────────── */

function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative px-6 py-32 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="max-w-3xl"
        >
          {eyebrow && (
            <motion.div
              variants={fadeUp}
              className="mb-4 inline-flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.16em] text-[#8b6f3f]"
            >
              <span className="h-px w-6 bg-[#c9a97a]" />
              {eyebrow}
            </motion.div>
          )}
          <motion.h2
            variants={fadeUp}
            className="serif-hero text-[clamp(36px,5.5vw,64px)] text-[#141210]"
          >
            {title}
          </motion.h2>
          {subtitle && (
            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-[54ch] text-[17px] leading-[1.55] text-[#4a3f33]"
            >
              {subtitle}
            </motion.p>
          )}
        </motion.div>
        {children && <div className="mt-16">{children}</div>}
      </div>
    </section>
  );
}

/* ─────────────────────── STORY: PROBLEM ─────────────────────── */

function Story() {
  return (
    <Section
      id="story"
      eyebrow="The problem"
      title={
        <>
          You landed somewhere new.{" "}
          <span style={{ color: "#8b6f3f" }}>Now what?</span>
        </>
      }
      subtitle="The best trips aren't measured in landmarks — they're measured in the strangers who become stories. But finding them is the part every app skips."
    >
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        className="grid gap-6 md:grid-cols-3"
      >
        {[
          {
            title: "Hotels are lonely.",
            body: "You booked the trip of a lifetime. You've eaten alone every night this week.",
          },
          {
            title: "Group chats are noise.",
            body: "500 messages, zero plans. Nobody actually commits to showing up.",
          },
          {
            title: "Dating apps aren't it.",
            body: "You wanted a friend, a hike, a proper conversation — not another swipe.",
          },
        ].map((c) => (
          <motion.div
            key={c.title}
            variants={fadeUp}
            className="rounded-3xl p-7"
            style={{
              background: "color-mix(in oklab, white 60%, transparent)",
              border: "1px solid rgba(20,18,16,0.06)",
              boxShadow: "0 1px 2px rgba(60,42,20,0.04), 0 6px 20px -12px rgba(60,42,20,0.10)",
            }}
          >
            <div className="font-display text-[20px] font-semibold tracking-[-0.02em] text-[#141210]">
              {c.title}
            </div>
            <p className="mt-2 text-[14.5px] leading-[1.55] text-[#4a3f33]">{c.body}</p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/* ─────────────────── HOW IT WORKS ─────────────────── */

function How() {
  const steps = [
    {
      n: "01",
      title: "Open the map.",
      body: "Every warm pin is a real gathering happening near you — tonight, this weekend, or next city over.",
      icon: Compass,
    },
    {
      n: "02",
      title: "Tap what excites you.",
      body: "See the host, the vibe, who's coming. Reserve one of the few spots with a single tap.",
      icon: MapPin,
    },
    {
      n: "03",
      title: "Show up. Belong.",
      body: "Meet six strangers over dinner, at a trailhead, in a corner café. Leave with new group chats.",
      icon: Users,
    },
  ];
  return (
    <Section
      id="how"
      eyebrow="How it works"
      title={
        <>
          Three taps.{" "}
          <span style={{ color: "#8b6f3f" }}>One unforgettable night.</span>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
            className="relative overflow-hidden rounded-3xl p-8"
            style={{
              background: "linear-gradient(180deg, #fdf6e6 0%, #f3e6ca 100%)",
              border: "1px solid rgba(20,18,16,0.06)",
              boxShadow: "0 20px 50px -30px rgba(60,42,20,0.25)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-[13px] font-medium tracking-[0.14em] text-[#8b6f3f]">
                {s.n}
              </span>
              <span
                className="grid h-10 w-10 place-items-center rounded-full text-[#1a1614]"
                style={{
                  background: "color-mix(in oklab, white 70%, transparent)",
                  border: "1px solid rgba(20,18,16,0.06)",
                }}
              >
                <s.icon className="h-4 w-4" strokeWidth={2} />
              </span>
            </div>
            <div className="mt-16 font-display text-[24px] font-semibold tracking-[-0.02em] text-[#141210]">
              {s.title}
            </div>
            <p className="mt-3 text-[14.5px] leading-[1.55] text-[#4a3f33]">{s.body}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ─────────────────── FEATURES ─────────────────── */

function Features() {
  return (
    <Section
      id="features"
      eyebrow="Features"
      title={
        <>
          Crafted for people who{" "}
          <span style={{ color: "#8b6f3f" }}>actually show up.</span>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-6">
        <FeatureCard
          className="md:col-span-4"
          title="A world map, not a feed."
          body="Zoom into any city. Every pin is a real plan by a real host — no algorithmic noise."
          visual={
            <div className="relative h-52 w-full overflow-hidden rounded-2xl">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(60% 90% at 30% 40%, #e8d4a8 0%, transparent 60%), radial-gradient(50% 80% at 80% 70%, #d9c290 0%, transparent 60%), linear-gradient(180deg, #efe0bd 0%, #e3cf9e 100%)",
                }}
              />
              {[["18%", "35%"], ["45%", "55%"], ["72%", "30%"], ["60%", "72%"]].map(
                ([x, y], i) => (
                  <motion.div
                    key={i}
                    className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      left: x,
                      top: y,
                      background: "linear-gradient(180deg, #1c1815, #0a0908)",
                      boxShadow: "0 0 0 6px rgba(28,24,21,0.12), 0 4px 10px rgba(0,0,0,0.3)",
                    }}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.4, delay: i * 0.4, repeat: Infinity, ease: EASE }}
                  />
                ),
              )}
            </div>
          }
        />
        <FeatureCard
          className="md:col-span-2"
          title="Small groups only."
          body="4–8 humans per gathering. Enough to spark. Small enough to actually connect."
          visual={
            <div className="flex h-52 items-center justify-center">
              <div className="flex -space-x-3">
                {["#c9a97a", "#8b6f3f", "#e3a17a", "#6b5c48", "#a68856"].map((c, i) => (
                  <motion.div
                    key={i}
                    className="h-12 w-12 rounded-full border-4 border-[#fbf3e2]"
                    style={{ background: c }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, delay: i * 0.25, repeat: Infinity, ease: EASE }}
                  />
                ))}
              </div>
            </div>
          }
        />
        <FeatureCard
          className="md:col-span-2"
          title="Verified faces."
          body="Every profile is real. Every host is reviewed. Show up with zero social anxiety."
          visual={
            <div className="grid h-52 place-items-center">
              <div
                className="grid h-24 w-24 place-items-center rounded-full"
                style={{
                  background: "linear-gradient(180deg, #1c1815, #0a0908)",
                  boxShadow: "0 20px 40px -20px rgba(20,18,16,0.6)",
                }}
              >
                <Sparkles className="h-8 w-8 text-[#f3e6ca]" strokeWidth={1.6} />
              </div>
            </div>
          }
        />
        <FeatureCard
          className="md:col-span-4"
          title="Host anything. In minutes."
          body="Pick a spot on the map, name your gathering, set a time. Your city just got warmer."
          visual={
            <div
              className="flex h-52 items-center justify-between rounded-2xl p-5"
              style={{
                background: "color-mix(in oklab, white 65%, transparent)",
                border: "1px solid rgba(20,18,16,0.06)",
              }}
            >
              <div className="space-y-2">
                <div className="h-3 w-32 rounded-full bg-[#e8dcc0]" />
                <div className="h-3 w-24 rounded-full bg-[#e8dcc0]" />
                <div className="h-3 w-40 rounded-full bg-[#e8dcc0]" />
              </div>
              <div
                className="rounded-full px-5 py-2.5 text-[13px] font-medium text-white"
                style={{ background: "linear-gradient(180deg, #1c1815, #0a0908)" }}
              >
                Publish
              </div>
            </div>
          }
        />
      </div>
    </Section>
  );
}

function FeatureCard({
  title,
  body,
  visual,
  className = "",
}: {
  title: string;
  body: string;
  visual: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: EASE }}
      className={`overflow-hidden rounded-3xl p-6 ${className}`}
      style={{
        background: "color-mix(in oklab, white 60%, transparent)",
        border: "1px solid rgba(20,18,16,0.06)",
        boxShadow: "0 1px 2px rgba(60,42,20,0.04), 0 20px 40px -24px rgba(60,42,20,0.18)",
      }}
    >
      <div>{visual}</div>
      <div className="mt-6">
        <div className="font-display text-[19px] font-semibold tracking-[-0.02em] text-[#141210]">
          {title}
        </div>
        <p className="mt-1.5 text-[14px] leading-[1.55] text-[#4a3f33]">{body}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────────── USE CASES ─────────────────── */

function UseCases() {
  const cases = [
    { icon: Utensils, title: "Sunset dinner in Barcelona", tag: "Dinner · 6 spots" },
    { icon: Mountain, title: "Sunrise hike above Kyoto", tag: "Hike · 4 spots" },
    { icon: Coffee, title: "Third-wave coffee crawl, CDMX", tag: "Coffee · 8 spots" },
    { icon: Sparkles, title: "Rooftop jazz in Lisbon", tag: "Nightlife · 10 spots" },
  ];
  return (
    <Section
      eyebrow="In the wild"
      title={
        <>
          A thousand small nights,{" "}
          <span style={{ color: "#8b6f3f" }}>happening right now.</span>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cases.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: EASE, delay: i * 0.06 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl p-5"
            style={{
              background: "linear-gradient(180deg, #fdf6e6 0%, #f3e6ca 100%)",
              border: "1px solid rgba(20,18,16,0.06)",
              boxShadow: "0 10px 30px -20px rgba(60,42,20,0.2)",
            }}
          >
            <span
              className="mb-6 inline-grid h-9 w-9 place-items-center rounded-full text-[#1a1614]"
              style={{
                background: "color-mix(in oklab, white 70%, transparent)",
                border: "1px solid rgba(20,18,16,0.06)",
              }}
            >
              <c.icon className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="font-display text-[15.5px] font-semibold tracking-[-0.015em] text-[#141210]">
              {c.title}
            </div>
            <div className="mt-1 text-[12px] uppercase tracking-[0.1em] text-[#8b6f3f]">
              {c.tag}
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ─────────────────── VOICES ─────────────────── */

function Voices() {
  const quotes = [
    {
      body: "Went to Lisbon alone. Left with six friends and a group chat that still won't shut up.",
      name: "Amelia R.",
      loc: "Designer · London",
    },
    {
      body: "It's the first app that made me actually leave the hotel. The pins are the internet's best-kept secret.",
      name: "Kenji T.",
      loc: "Founder · Tokyo",
    },
    {
      body: "Hosted a dinner in my apartment. Eight strangers, one paella, zero awkwardness. Doing it every Sunday now.",
      name: "Marta B.",
      loc: "Chef · Barcelona",
    },
  ];
  return (
    <Section
      id="voices"
      eyebrow="Voices"
      title={
        <>
          The proof isn't the app.{" "}
          <span style={{ color: "#8b6f3f" }}>It's the group photos after.</span>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-3">
        {quotes.map((q, i) => (
          <motion.figure
            key={q.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
            className="flex h-full flex-col justify-between rounded-3xl p-7"
            style={{
              background: "color-mix(in oklab, white 65%, transparent)",
              border: "1px solid rgba(20,18,16,0.06)",
              boxShadow: "0 20px 50px -30px rgba(60,42,20,0.22)",
            }}
          >
            <div className="flex gap-0.5 text-[#c9a97a]">
              {Array.from({ length: 5 }).map((_, k) => (
                <Star key={k} className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
              ))}
            </div>
            <blockquote className="mt-4 text-[17px] leading-[1.5] tracking-[-0.01em] text-[#1a1614]">
              "{q.body}"
            </blockquote>
            <figcaption className="mt-6 text-[12.5px] text-[#6b5c48]">
              <span className="font-medium text-[#141210]">{q.name}</span> · {q.loc}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </Section>
  );
}

/* ─────────────────── FINAL CTA ─────────────────── */

function FinalCTA() {
  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: EASE }}
          className="relative overflow-hidden rounded-[36px] px-8 py-20 text-center"
          style={{
            background:
              "radial-gradient(120% 120% at 50% 0%, #2a2320 0%, #0a0908 65%)",
            boxShadow:
              "0 40px 100px -40px rgba(20,18,16,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* soft warm glow */}
          <div
            className="pointer-events-none absolute inset-x-0 -bottom-40 h-[500px]"
            style={{
              background:
                "radial-gradient(closest-side, rgba(255,200,140,0.35), rgba(255,200,140,0) 70%)",
              filter: "blur(20px)",
            }}
          />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11.5px] font-medium uppercase tracking-[0.16em] text-[#e8dcc0] backdrop-blur">
              <Sparkles className="h-3 w-3" strokeWidth={2.4} />
              Your city is waiting
            </div>
            <h2 className="serif-hero mx-auto mt-6 max-w-[16ch] text-[clamp(40px,6vw,80px)] text-white">
              Say yes to a night{" "}
              <span style={{ color: "#e3c88f" }}>you didn't plan.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-[46ch] text-[16px] leading-[1.55] text-[#c9bfab]">
              Create your profile in under a minute. Discover gatherings tonight.
              Become the reason someone remembers your city.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/auth"
                className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium text-[#141210]"
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, #f3e6ca 100%)",
                  boxShadow:
                    "0 1px 0 rgba(255,255,255,0.9) inset, 0 20px 40px -18px rgba(0,0,0,0.6)",
                }}
              >
                Create your account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-[15px] font-medium text-white backdrop-blur"
              >
                I already have one
              </Link>
            </div>
            <div className="mt-6 text-[12px] text-[#8f8676]">
              Free to join · No cards, no algorithms, no noise.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────── FOOTER ─────────────────── */

function Footer() {
  return (
    <footer className="relative px-6 pb-12 pt-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-[rgba(20,18,16,0.08)] pt-8 text-[12.5px] text-[#6b5c48] sm:flex-row">
        <div className="flex items-center gap-2">
          <span
            className="grid h-6 w-6 place-items-center rounded-full text-white"
            style={{ background: "linear-gradient(180deg, #1c1815, #0a0908)" }}
          >
            <Globe2 className="h-3 w-3" strokeWidth={2.4} />
          </span>
          <span className="font-medium text-[#141210]">Gobber</span>
          <span className="opacity-60">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#story" className="transition hover:text-[#141210]">Story</a>
          <a href="#features" className="transition hover:text-[#141210]">Features</a>
          <Link to="/auth" className="transition hover:text-[#141210]">Sign in</Link>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────── PAGE ─────────────────── */

function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f5eddc] text-[#141210]">
      <Nav />
      <main>
        <Hero />
        {/* spacing to clear absolute hero mock */}
        <div className="h-[42vw] max-h-[560px]" aria-hidden />
        <Story />
        <How />
        <Features />
        <UseCases />
        <Voices />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
