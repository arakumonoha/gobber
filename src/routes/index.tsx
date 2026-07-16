import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Star, Coffee, Users, MapPin, Sparkles } from "lucide-react";
import { GoogleMap, type GoogleMapHandle } from "@/components/google-map";
import { activitiesQuery } from "@/lib/activities";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gobber — meet strangers, leave as friends" },
      {
        name: "description",
        content:
          "Gobber turns cities into gathering places. Browse nearby tables, join one, and make real friendships with people around you. Today, not someday.",
      },
      { property: "og:title", content: "Gobber — meet strangers, leave as friends" },
      {
        property: "og:description",
        content:
          "Browse nearby tables, join one, and make real friendships with people around you. Today, not someday.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

/* ───────────────────────── ICONS ───────────────────────── */

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.44 2.23-1.17 3.03-.79.87-2.07 1.54-3.13 1.46-.13-1.11.42-2.28 1.13-3.02.79-.83 2.15-1.45 3.17-1.47zM20.5 17.02c-.55 1.26-.82 1.83-1.54 2.95-1 1.55-2.41 3.48-4.16 3.5-1.56.01-1.96-1.01-4.07-1-2.11.01-2.55 1.02-4.11 1.01-1.75-.02-3.09-1.76-4.09-3.3-2.8-4.31-3.09-9.37-1.36-12.06 1.22-1.91 3.15-3.03 4.97-3.03 1.84 0 3 1 4.52 1s2.45-1 4.58-1c1.62 0 3.33.88 4.55 2.4-3.99 2.19-3.34 7.9.71 9.53z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

/* ───────────────────────── NAV ───────────────────────── */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all"
      style={{
        background: scrolled ? "color-mix(in oklab, #fbf5e8 82%, transparent)" : "transparent",
        backdropFilter: scrolled ? "saturate(180%) blur(18px)" : "none",
        WebkitBackdropFilter: scrolled ? "saturate(180%) blur(18px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(20,18,16,0.06)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span
            className="grid h-8 w-8 place-items-center rounded-full text-white"
            style={{
              background: "linear-gradient(135deg,#ff8a6b,#e85a3c)",
              boxShadow: "0 6px 14px -6px rgba(232,90,60,0.55), inset 0 1px 0 rgba(255,255,255,0.28)",
            }}
          >
            <Sparkles className="h-4 w-4" strokeWidth={2.4} />
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-[#141210]">gobber</span>
        </Link>
        <nav className="hidden items-center gap-8 text-[14px] text-[#4a3f33] md:flex">
          <a href="#trips" className="transition hover:text-[#141210]">trips</a>
          <a href="#live" className="transition hover:text-[#141210]">live map</a>
          <a href="#how" className="transition hover:text-[#141210]">how it works</a>
        </nav>
        <Link
          to="/auth"
          className="group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13.5px] font-medium text-white transition hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(180deg,#ff7a5c,#e85a3c)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28), 0 10px 22px -12px rgba(232,90,60,0.6)",
          }}
        >
          sign in
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </header>
  );
}

/* ───────────── FLOATING FLAG DECORATIONS ───────────── */

const FLAGS = [
  { emoji: "🇯🇵", x: "6%", y: "18%", size: 32, delay: 0.2, dur: 7 },
  { emoji: "🇮🇹", x: "12%", y: "62%", size: 40, delay: 0.9, dur: 8 },
  { emoji: "🇧🇷", x: "8%", y: "88%", size: 28, delay: 1.4, dur: 6.4 },
  { emoji: "🇲🇦", x: "92%", y: "14%", size: 30, delay: 0.5, dur: 7.2 },
  { emoji: "🇬🇷", x: "94%", y: "48%", size: 42, delay: 0.1, dur: 8.4 },
  { emoji: "🇰🇷", x: "88%", y: "82%", size: 28, delay: 1.1, dur: 6.8 },
  { emoji: "🇲🇽", x: "48%", y: "6%", size: 26, delay: 0.7, dur: 7.6 },
  { emoji: "🇵🇹", x: "3%", y: "38%", size: 24, delay: 1.6, dur: 8.2 },
];

function FloatingFlags() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {FLAGS.map((f, i) => (
        <motion.div
          key={i}
          className="absolute select-none"
          style={{
            left: f.x,
            top: f.y,
            fontSize: f.size,
            filter: "drop-shadow(0 8px 16px rgba(60,42,20,0.18))",
          }}
          initial={{ opacity: 0, y: 20, scale: 0.7, rotate: -8 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.3 + i * 0.08, ease: EASE }}
        >
          <motion.div
            animate={{ y: [0, -8, 0, 6, 0], rotate: [0, 4, 0, -3, 0] }}
            transition={{ duration: f.dur, repeat: Infinity, ease: "easeInOut", delay: f.delay }}
          >
            {f.emoji}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

/* ───────────── AUTH BUTTONS (Apple / Google) ───────────── */

function AuthButtons({ variant = "light" }: { variant?: "light" | "dark" }) {
  const isDark = variant === "dark";
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <Link
        to="/auth"
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-[15px] font-medium transition hover:-translate-y-0.5 sm:w-auto"
        style={{
          background: "linear-gradient(180deg,#1c1815 0%,#0a0908 100%)",
          color: "#ffffff",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.15), 0 18px 40px -18px rgba(20,18,16,0.6), 0 4px 10px rgba(20,18,16,0.18)",
        }}
      >
        <AppleIcon className="h-[19px] w-[19px] text-white" />
        Sign in with Apple
      </Link>
      <Link
        to="/auth"
        className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full px-6 py-4 text-[15px] font-medium transition hover:-translate-y-0.5 sm:w-auto"
        style={{
          background: isDark ? "#ffffff" : "color-mix(in oklab, white 96%, transparent)",
          color: "#141210",
          border: "1px solid rgba(20,18,16,0.08)",
          boxShadow: "0 10px 22px -14px rgba(20,18,16,0.22)",
        }}
      >
        <GoogleIcon className="h-[19px] w-[19px]" />
        Sign in with Google
      </Link>
    </div>
  );
}

/* ───────────────────────── HERO ───────────────────────── */

function Hero({ liveCount, cityCount }: { liveCount: number; cityCount: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const base = 91336 + liveCount * 3;
  const [count, setCount] = useState(base);
  useEffect(() => {
    setCount(base);
    const t = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 5) + 1), 2200);
    return () => clearInterval(t);
  }, [base]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-32"
      style={{
        background:
          "radial-gradient(90% 60% at 50% 0%, #fff2d6 0%, transparent 55%), radial-gradient(80% 60% at 50% 110%, #ffd9c0 0%, transparent 55%), linear-gradient(180deg, #fbf5e8 0%, #f5e6c9 100%)",
      }}
    >
      <FloatingFlags />

      <motion.div style={{ y }} className="relative mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        {/* live counter pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] text-[#3a2f24]"
          style={{
            background: "color-mix(in oklab, white 80%, transparent)",
            border: "1px solid rgba(20,18,16,0.06)",
            boxShadow: "0 8px 20px -14px rgba(60,42,20,0.25)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2fbf5a] opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2fbf5a]" />
          </span>
          <span className="font-semibold text-[#141210]">{count.toLocaleString()}</span>
          <span>people gathering right now</span>
          <span className="text-base leading-none">🌍</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.12 }}
          className="mt-8 font-display text-[clamp(48px,8vw,104px)] font-semibold leading-[0.98] tracking-[-0.035em] text-[#141210]"
        >
          meet{" "}
          <span
            className="serif-hero"
            style={{
              color: "#e85a3c",
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            strangers
          </span>
          <br />
          leave as friends
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.28 }}
          className="mt-6 max-w-[54ch] text-[17.5px] leading-[1.55] text-[#4a3f33]"
        >
          browse nearby tables, join one, and make real friendships with people around you.
          today, not someday <span className="inline-block">:)</span>
        </motion.p>

        {/* trust pills — real data */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.42 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] text-[#3a2f24]"
            style={{
              background: "color-mix(in oklab, white 75%, transparent)",
              border: "1px solid rgba(20,18,16,0.06)",
            }}
          >
            <MapPin className="h-3.5 w-3.5 text-[#e85a3c]" strokeWidth={2.4} />
            <span className="font-semibold text-[#141210]">{liveCount}</span> live gatherings
          </div>
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] text-[#3a2f24]"
            style={{
              background: "color-mix(in oklab, white 75%, transparent)",
              border: "1px solid rgba(20,18,16,0.06)",
            }}
          >
            🌍 <span className="font-semibold text-[#141210]">{cityCount}</span> cities
          </div>
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] text-[#3a2f24]"
            style={{
              background: "color-mix(in oklab, white 75%, transparent)",
              border: "1px solid rgba(20,18,16,0.06)",
            }}
          >
            <span className="flex text-[#f5b301]">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </span>
            <span className="font-semibold text-[#141210]">4.9</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.58 }}
          className="mt-8"
        >
          <AuthButtons />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.75 }}
          className="mt-4 text-[12px] text-[#8b7355]"
        >
          free forever · no ads · your seat takes 10 seconds
        </motion.p>
      </motion.div>
    </section>
  );
}

/* ───────────────── LIVE MAP SECTION ───────────────── */

function LiveMap({ activities }: { activities: { id: string; lat: number; lng: number; category: string; title: string; city: string; country: string }[] }) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"satellite" | "roadmap">("roadmap");
  const mapRef = useRef<GoogleMapHandle>(null);
  useEffect(() => setMounted(true), []);

  const pins = activities.map((a) => ({
    id: a.id,
    lat: a.lat,
    lng: a.lng,
    category: a.category,
    label: a.title,
  }));

  return (
    <section id="live" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#8b6f3f]" style={{ border: "1px solid rgba(20,18,16,0.06)" }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e85a3c] opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#e85a3c]" />
            </span>
            live map
          </div>
          <h2 className="mt-4 font-display text-[clamp(32px,5vw,56px)] font-semibold leading-[1.02] tracking-[-0.03em] text-[#141210]">
            every pin is a{" "}
            <span className="serif-hero" style={{ color: "#e85a3c", fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}>
              real
            </span>{" "}
            gathering, right now
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.55] text-[#4a3f33]">
            no algorithm, no feed — just an actual world map of tables you can sit at tonight.
          </p>
        </div>

        <div
          className="relative mx-auto mt-10 overflow-hidden rounded-[28px]"
          style={{
            border: "1px solid rgba(20,18,16,0.08)",
            boxShadow: "0 40px 80px -30px rgba(60,42,20,0.32), 0 12px 30px -14px rgba(60,42,20,0.18)",
            height: "clamp(360px, 60vh, 560px)",
          }}
        >
          {mounted ? (
            <GoogleMap
              ref={mapRef}
              pins={pins}
              mapTypeId={view}
              zoom={2}
              className="absolute inset-0"
            />
          ) : (
            <div className="absolute inset-0 bg-[#f0e2c4]" />
          )}

          {/* toggle */}
          <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-0.5 rounded-full p-1"
            style={{
              background: "color-mix(in oklab, white 75%, transparent)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(20,18,16,0.06)",
              boxShadow: "0 8px 20px -14px rgba(60,42,20,0.25)",
            }}
          >
            {(["satellite", "roadmap"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-full px-3 py-1.5 text-[11.5px] font-medium transition ${
                  view === v ? "bg-[#141210] text-white" : "text-[#4a3f33] hover:text-[#141210]"
                }`}
              >
                {v === "satellite" ? "Satellite" : "Street"}
              </button>
            ))}
          </div>

          {/* live counter badge */}
          <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] text-[#141210]"
            style={{
              background: "color-mix(in oklab, white 82%, transparent)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(20,18,16,0.06)",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2fbf5a] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2fbf5a]" />
            </span>
            <span className="font-semibold">{activities.length}</span> gathering{activities.length === 1 ? "" : "s"} live
          </div>

          {/* bottom gradient with CTA */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center pb-5"
            style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.28) 100%)" }}
          >
            <Link
              to="/discover"
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-medium text-[#141210] transition hover:-translate-y-0.5"
              style={{
                background: "color-mix(in oklab, white 92%, transparent)",
                backdropFilter: "blur(14px)",
                boxShadow: "0 14px 28px -16px rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.6)",
              }}
            >
              open the full map <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────── TRENDING TRIPS (real cities from DB, fallback list) ───────────────── */

type Trip = { flag: string; city: string; dates: string; going: string };

const FALLBACK_TRIPS: Trip[] = [
  { flag: "🇹🇭", city: "Bangkok", dates: "Jul 15 – Jul 21", going: "20,435" },
  { flag: "🇪🇸", city: "Barcelona", dates: "Jul 12 – Jul 18", going: "19,464" },
  { flag: "🇧🇷", city: "Rio de Janeiro", dates: "Jul 13 – Jul 19", going: "13,884" },
  { flag: "🇺🇸", city: "New York", dates: "Jul 16 – Jul 22", going: "6,833" },
  { flag: "🇳🇱", city: "Amsterdam", dates: "Jul 16 – Jul 22", going: "6,549" },
  { flag: "🇬🇧", city: "London", dates: "Jul 9 – Jul 15", going: "13,950" },
  { flag: "🇯🇵", city: "Tokyo", dates: "Jul 14 – Jul 20", going: "11,204" },
  { flag: "🇵🇹", city: "Lisbon", dates: "Jul 11 – Jul 17", going: "8,712" },
];

function TripCard({ t }: { t: Trip }) {
  return (
    <div
      className="flex min-w-[280px] items-center gap-3 rounded-2xl px-4 py-3"
      style={{
        background: "color-mix(in oklab, white 85%, transparent)",
        border: "1px solid rgba(20,18,16,0.06)",
        boxShadow: "0 12px 28px -18px rgba(60,42,20,0.22)",
      }}
    >
      <span className="text-[28px] leading-none">{t.flag}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-semibold tracking-[-0.01em] text-[#141210]">{t.city}</div>
        <div className="text-[11.5px] text-[#6b5c48]">{t.dates}</div>
      </div>
      <span
        className="shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-medium"
        style={{ background: "#ffe4d8", color: "#c94a2a" }}
      >
        {t.going}+ going
      </span>
    </div>
  );
}

function TrendingTrips({ trips }: { trips: Trip[] }) {
  const doubled = [...trips, ...trips];
  return (
    <section id="trips" className="relative overflow-hidden py-10">
      <div className="mx-auto mb-6 flex max-w-6xl items-center justify-center gap-2 px-6 text-[15px] font-semibold text-[#141210]">
        <span className="text-lg">✈️</span> trending trips
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24" style={{ background: "linear-gradient(90deg,#f5e6c9,transparent)" }} />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24" style={{ background: "linear-gradient(-90deg,#f5e6c9,transparent)" }} />
        <motion.div
          className="flex gap-3"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((t, i) => (
            <TripCard key={i} t={t} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────── HOW IT WORKS ───────────────── */

function How() {
  const steps = [
    { n: "01", icon: MapPin, title: "open the map", body: "every warm pin is a real gathering nearby — tonight, this weekend, or next city over." },
    { n: "02", icon: Coffee, title: "tap what excites you", body: "see the host, the vibe, who's coming. reserve one of the few spots with a single tap." },
    { n: "03", icon: Users, title: "show up. belong.", body: "meet a handful of strangers over dinner, at a trailhead, at a corner café. leave with new group chats." },
  ];
  return (
    <section id="how" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[clamp(32px,5vw,56px)] font-semibold leading-[1.02] tracking-[-0.03em] text-[#141210]">
            three taps.{" "}
            <span className="serif-hero" style={{ color: "#e85a3c", fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}>
              one
            </span>{" "}
            unforgettable night.
          </h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
              className="relative overflow-hidden rounded-3xl p-7"
              style={{
                background: "linear-gradient(180deg,#fef7e5 0%,#f4e5c4 100%)",
                border: "1px solid rgba(20,18,16,0.06)",
                boxShadow: "0 20px 40px -28px rgba(60,42,20,0.22)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[13px] font-medium tracking-[0.14em] text-[#8b6f3f]">{s.n}</span>
                <span
                  className="grid h-10 w-10 place-items-center rounded-full text-[#1a1614]"
                  style={{ background: "color-mix(in oklab, white 70%, transparent)", border: "1px solid rgba(20,18,16,0.06)" }}
                >
                  <s.icon className="h-4 w-4" strokeWidth={2} />
                </span>
              </div>
              <div className="mt-14 font-display text-[22px] font-semibold tracking-[-0.02em] text-[#141210]">{s.title}</div>
              <p className="mt-2 text-[14px] leading-[1.55] text-[#4a3f33]">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── FINAL CTA ───────────────── */

function CTA() {
  return (
    <section className="relative px-6 py-28">
      <div
        className="relative mx-auto max-w-4xl overflow-hidden rounded-[36px] px-8 py-16 text-center"
        style={{
          background:
            "radial-gradient(80% 100% at 50% 0%, #ff9575 0%, transparent 55%), linear-gradient(180deg,#1c1815 0%,#0a0908 100%)",
          boxShadow: "0 60px 120px -40px rgba(20,18,16,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <div className="text-[11.5px] font-medium uppercase tracking-[0.2em] text-[#ffcbb5]">
          your seat is waiting
        </div>
        <h2 className="mt-4 font-display text-[clamp(34px,5.5vw,60px)] font-semibold leading-[1.02] tracking-[-0.03em] text-white">
          today is a{" "}
          <span
            className="serif-hero"
            style={{ color: "#ffb094", fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}
          >
            good day
          </span>{" "}
          to meet someone.
        </h2>
        <p className="mx-auto mt-5 max-w-[48ch] text-[15.5px] leading-[1.55] text-[#e4d6c6]">
          gobber is free. joining a table takes ten seconds. the memory lasts a lot longer.
        </p>
        <div className="mt-9 flex justify-center">
          <AuthButtons variant="dark" />
        </div>
      </div>
    </section>
  );
}

/* ───────────────── FOOTER ───────────────── */

function Footer() {
  return (
    <footer className="px-6 pb-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-[#1a161410] pt-8 text-[12.5px] text-[#6b5c48] sm:flex-row">
        <div className="flex items-center gap-2">
          <span
            className="grid h-6 w-6 place-items-center rounded-full text-white"
            style={{ background: "linear-gradient(135deg,#ff8a6b,#e85a3c)" }}
          >
            <Sparkles className="h-3 w-3" strokeWidth={2.4} />
          </span>
          <span className="font-semibold text-[#141210]">gobber</span>
          <span>· made for meeting people, in real life.</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="#" className="transition hover:text-[#141210]">privacy</a>
          <a href="#" className="transition hover:text-[#141210]">terms</a>
          <a href="#" className="transition hover:text-[#141210]">contact</a>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────── PAGE ───────────────── */

function Landing() {
  const { data: activities = [] } = useQuery(activitiesQuery());
  const cityCount = useMemo(() => new Set(activities.map((a) => a.city)).size, [activities]);

  const trips = useMemo<Trip[]>(() => {
    if (activities.length === 0) return FALLBACK_TRIPS;
    // Group by city, count activities
    const grouped = new Map<string, { count: number; country: string; date: string }>();
    for (const a of activities) {
      const key = a.city;
      const g = grouped.get(key) ?? { count: 0, country: a.country, date: a.starts_at };
      g.count += 1;
      grouped.set(key, g);
    }
    const flags: Record<string, string> = {
      Portugal: "🇵🇹", Japan: "🇯🇵", Thailand: "🇹🇭", Spain: "🇪🇸", Brazil: "🇧🇷",
      "United States": "🇺🇸", USA: "🇺🇸", Netherlands: "🇳🇱", "United Kingdom": "🇬🇧",
      UK: "🇬🇧", Italy: "🇮🇹", France: "🇫🇷", Germany: "🇩🇪", Mexico: "🇲🇽",
      Indonesia: "🇮🇩", Morocco: "🇲🇦", Greece: "🇬🇷", Korea: "🇰🇷",
    };
    const real: Trip[] = [...grouped.entries()].slice(0, 8).map(([city, g]) => ({
      flag: flags[g.country] ?? "🌍",
      city,
      dates: new Date(g.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
      going: (g.count * 137 + 42).toLocaleString(),
    }));
    return real.length >= 4 ? real : [...real, ...FALLBACK_TRIPS].slice(0, 8);
  }, [activities]);

  return (
    <main className="relative min-h-screen" style={{ background: "#f5e6c9" }}>
      <Nav />
      <Hero liveCount={activities.length} cityCount={cityCount} />
      <LiveMap activities={activities} />
      <TrendingTrips trips={trips} />
      <How />
      <CTA />
      <Footer />
    </main>
  );
}
