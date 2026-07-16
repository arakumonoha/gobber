import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Star, Coffee, Users, MapPin, Hand, Radio, Compass } from "lucide-react";
import { GoogleMap, type GoogleMapHandle } from "@/components/google-map";
import { activitiesQuery } from "@/lib/activities";
import { getLandingStats, type LandingStats } from "@/lib/landing-stats.functions";
import { FloatingFlags } from "@/components/landing/floating-flags";
import { JoinsTicker, TrendingStrip, twemojiUrl } from "@/components/landing/live-signals";
import owlLogo from "@/assets/gobber-owl.png.asset.json";
import { AuthOverlay, openAuth } from "@/components/auth/auth-overlay";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gobber — Visit n Vibe" },
      {
        name: "description",
        content:
          "Gobber turns cities into gathering places. Browse nearby tables, join one, and vibe with people around you. Today, not someday.",
      },
      { property: "og:title", content: "Gobber — Visit n Vibe" },
      {
        property: "og:description",
        content:
          "Browse nearby tables, join one, and vibe with people around you. Today, not someday.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const EASE = [0.22, 1, 0.36, 1] as const;

/* Amber Clarity palette */
const PALETTE = {
  cream: "#FAF3E1",
  paper: "#F4E9CA",
  ink: "#1A1614",
  blue: "#0A84FF",
  blueDeep: "#0057D1",
  blueSoft: "#E0F0FF",
  amber: "#E8A93C",
  amberDeep: "#B4801F",
  amberSoft: "#FBF0D6",
  sage: "#7DA88E",
  sageSoft: "#EAF2E6",
  muted: "#8b7355",
};

const COUNTRY_FLAGS: Record<string, string> = {
  Portugal: "🇵🇹", Japan: "🇯🇵", Thailand: "🇹🇭", Spain: "🇪🇸", Brazil: "🇧🇷",
  "United States": "🇺🇸", USA: "🇺🇸", Netherlands: "🇳🇱", "United Kingdom": "🇬🇧",
  UK: "🇬🇧", Italy: "🇮🇹", France: "🇫🇷", Germany: "🇩🇪", Mexico: "🇲🇽",
  Indonesia: "🇮🇩", Morocco: "🇲🇦", Greece: "🇬🇷", Korea: "🇰🇷", Iceland: "🇮🇸",
  Earth: "🌍",
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

function OwlMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src={owlLogo.url}
      alt="Gobber"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: "drop-shadow(0 6px 12px rgba(60,42,20,0.18))",
      }}
    />
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
  const [active, setActive] = useState<string>("trips");
  const links = [
    { id: "trips", label: "trips", href: "#trips" },
    { id: "live", label: "live map", href: "#live" },
    { id: "how", label: "how it works", href: "#how" },
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`mx-auto mt-3 flex h-14 max-w-6xl items-center justify-between px-3 pl-5 pr-2 transition-all duration-500 ${
          scrolled ? "sm:mt-4" : ""
        }`}
        style={{
          borderRadius: 999,
          marginLeft: "clamp(12px, 3vw, 24px)",
          marginRight: "clamp(12px, 3vw, 24px)",
          background:
            "linear-gradient(180deg, color-mix(in oklab, #FAF3E1 60%, transparent) 0%, color-mix(in oklab, #FAF3E1 38%, transparent) 100%)",
          backdropFilter: "saturate(180%) blur(22px)",
          border: "1px solid rgba(255,255,255,0.55)",
          boxShadow: scrolled
            ? "inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(20,18,16,0.04), 0 20px 40px -20px rgba(20,18,16,0.22), 0 4px 12px -6px rgba(20,18,16,0.08)"
            : "inset 0 1px 0 rgba(255,255,255,0.7), 0 12px 28px -18px rgba(20,18,16,0.18)",
        }}
      >
        <Link to="/" className="flex items-center gap-2">
          <OwlMark size={26} />
          <span className="text-[16px] font-semibold tracking-[-0.02em]" style={{ color: PALETTE.ink }}>
            gobber
          </span>
        </Link>

        <nav
          className="relative hidden items-center gap-1 rounded-full p-1 text-[13px] md:flex"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.25) 100%)",
            border: "1px solid rgba(255,255,255,0.6)",
            backdropFilter: "blur(14px) saturate(160%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(20,18,16,0.04), 0 4px 12px -6px rgba(20,18,16,0.12)",
          }}
        >
          {links.map((l) => {
            const isActive = active === l.id;
            return (
              <a
                key={l.id}
                href={l.href}
                onClick={() => setActive(l.id)}
                className="relative rounded-full px-4 py-1.5 transition"
                style={{ color: isActive ? PALETTE.ink : "#5a4f43" }}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-glass-pill"
                    className="absolute inset-0 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 100%)",
                      border: "1px solid rgba(255,255,255,0.9)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(20,18,16,0.06), 0 6px 14px -6px rgba(20,18,16,0.18)",
                    }}
                  />
                )}
                <span className="relative z-10 font-medium">{l.label}</span>
              </a>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={openAuth}
          className="group relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition hover:-translate-y-0.5"
          style={{
            color: "#ffffff",
            background:
              "linear-gradient(180deg, rgba(28,26,24,0.95) 0%, rgba(20,18,16,0.85) 100%)",
            border: "1px solid rgba(20,18,16,0.9)",
            backdropFilter: "blur(14px) saturate(180%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.3), 0 10px 22px -12px rgba(20,18,16,0.4)",
          }}
        >
          sign in
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </header>
  );
}

/* ───────────── AUTH BUTTONS ───────────── */

function AuthButtons() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <Link
        to="/auth"
        className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-[15px] font-medium transition hover:-translate-y-0.5 sm:w-auto"
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
        className="inline-flex w-full items-center justify-center gap-2.5 rounded-full px-6 py-4 text-[15px] font-medium transition hover:-translate-y-0.5 sm:w-auto"
        style={{
          background: "color-mix(in oklab, white 96%, transparent)",
          color: PALETTE.ink,
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

type NearYou = { city: string; country: string; countryName: string } | null;

function Hero({ stats, nearYou }: { stats: LandingStats | undefined; nearYou: NearYou }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const live = stats?.liveCount ?? 0;
  const totalCities = stats?.totalCities ?? 0;
  const hosts = stats?.activeHosts ?? 0;
  const nearbyCount = nearYou && stats ? stats.perCountry[nearYou.countryName] ?? 0 : 0;

  // Real live count from backend (activities starting now or later)
  const count = live;

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-32"
      style={{
        background: `
          radial-gradient(80% 60% at 50% 0%, #FDF6DF 0%, transparent 55%),
          radial-gradient(70% 50% at 50% 110%, ${PALETTE.blueSoft} 0%, transparent 60%),
          radial-gradient(60% 50% at 10% 40%, ${PALETTE.amberSoft} 0%, transparent 65%),
          radial-gradient(60% 50% at 90% 60%, ${PALETTE.sageSoft} 0%, transparent 65%),
          linear-gradient(180deg, ${PALETTE.cream} 0%, ${PALETTE.paper} 55%, ${PALETTE.cream} 100%)
        `,
      }}
    >
      <FloatingFlags />

      <motion.div style={{ y }} className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        {/* Live counter pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px]"
          style={{ color: "#3a2f24" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7DA88E] opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7DA88E]" />
          </span>
          <span className="font-semibold" style={{ color: PALETTE.ink }}>{count.toLocaleString()}</span>
          <span>{count === 1 ? "table live right now" : "tables live right now"}</span>
          <span className="text-base leading-none">🌍</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.05 }}
          className="mt-8"
        >
          <OwlMark size={88} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
          className="mt-6 font-display font-semibold leading-[1.05] tracking-[-0.035em]"
          style={{
            fontSize: "clamp(52px, 9vw, 120px)",
            color: PALETTE.ink,
            paddingBottom: "0.12em",
          }}
        >
          Visit{" "}
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              fontWeight: 400,
              color: PALETTE.blue,
              letterSpacing: "-0.02em",
            }}
          >
            n
          </span>{" "}
          Vibe
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.32 }}
          className="mt-6 max-w-[54ch] text-[17.5px] leading-[1.55]"
          style={{ color: "#4a3f33" }}
        >
          browse nearby tables, join one, and vibe with people around you.
          today, not someday <span className="inline-block">:)</span>
        </motion.p>

        {/* Live joins ticker */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.4 }}
          className="mt-6"
        >
          <JoinsTicker joins={stats?.joins ?? []} />
        </motion.div>

        {/* Real-time trust pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.5 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2.5"
        >
          <LivePill
            icon={<MapPin className="h-3.5 w-3.5" style={{ color: PALETTE.blue }} strokeWidth={2.4} />}
            value={live}
            label="live worldwide"
            tint="blue"
          />
          {nearYou && nearbyCount > 0 && (
            <LivePill
              icon={<Compass className="h-3.5 w-3.5" style={{ color: PALETTE.amberDeep }} strokeWidth={2.4} />}
              value={nearbyCount}
              label={`near ${nearYou.city}`}
              tint="amber"
            />
          )}
          <LivePill
            icon={<Radio className="h-3.5 w-3.5" style={{ color: PALETTE.sage }} strokeWidth={2.4} />}
            value={hosts}
            label="hosts online now"
            tint="sage"
          />
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px]"
            style={{
              background: "color-mix(in oklab, white 78%, transparent)",
              border: "1px solid rgba(20,18,16,0.06)",
              color: "#3a2f24",
            }}
          >
            🌍 <span className="font-semibold" style={{ color: PALETTE.ink }}>{totalCities}</span> cities
          </div>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px]"
            style={{
              background: "color-mix(in oklab, white 78%, transparent)",
              border: "1px solid rgba(20,18,16,0.06)",
              color: "#3a2f24",
            }}
          >
            <span className="flex text-[#f5b301]">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-3 w-3 fill-current" />
              ))}
            </span>
            <span className="font-semibold" style={{ color: PALETTE.ink }}>4.9</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.62 }}
          className="mt-8"
        >
          <AuthButtons />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.75 }}
          className="mt-4 text-[12px]"
          style={{ color: PALETTE.muted }}
        >
          free forever · no ads · your seat takes 10 seconds
        </motion.p>
      </motion.div>

      {/* smooth dissolve into next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-32"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${PALETTE.cream} 100%)`,
        }}
      />
    </section>
  );
}

function LivePill({ icon, value, label, tint }: { icon: React.ReactNode; value: number; label: string; tint: "blue" | "amber" | "sage" }) {
  const bg = tint === "blue" ? PALETTE.blueSoft : tint === "amber" ? PALETTE.amberSoft : PALETTE.sageSoft;
  const border = tint === "blue" ? `${PALETTE.blue}22` : tint === "amber" ? `${PALETTE.amber}33` : `${PALETTE.sage}33`;
  return (
    <motion.div
      key={`${label}-${value}`}
      initial={{ scale: 0.94 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px]"
      style={{ background: bg, border: `1px solid ${border}`, color: "#3a2f24" }}
    >
      {icon}
      <span className="font-semibold" style={{ color: PALETTE.ink }}>{value.toLocaleString()}</span>
      <span>{label}</span>
    </motion.div>
  );
}

/* ───────────────── LIVE MAP SECTION ───────────────── */

function LiveMap({
  activities,
  stats,
}: {
  activities: { id: string; lat: number; lng: number; category: string; title: string; city: string; country: string }[];
  stats: LandingStats | undefined;
}) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"satellite" | "roadmap">("roadmap");
  const [interactive, setInteractive] = useState(false);
  const mapRef = useRef<GoogleMapHandle>(null);
  useEffect(() => setMounted(true), []);

  const pins = useMemo(
    () =>
      activities.map((a) => ({
        id: a.id,
        lat: a.lat,
        lng: a.lng,
        category: a.category,
        label: a.title,
      })),
    [activities],
  );

  return (
    <section id="live" className="relative px-6 pb-24 pt-32">
      {/* top blend with hero's cream tail */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-40"
        style={{
          background: `linear-gradient(180deg, ${PALETTE.cream} 0%, transparent 100%)`,
        }}
      />
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em]"
            style={{ background: PALETTE.blueSoft, color: PALETTE.blueDeep, border: `1px solid ${PALETTE.blue}22` }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ background: PALETTE.blue }} />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: PALETTE.blue }} />
            </span>
            live map
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1, ease: EASE, delay: 0.15 }}
            className="mt-4 font-display font-semibold leading-[1.02] tracking-[-0.03em]"
            style={{ fontSize: "clamp(32px,5vw,56px)", color: PALETTE.ink }}
          >
            every pin is a{" "}
            <span style={{ color: PALETTE.blue, fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}>
              real
            </span>{" "}
            gathering, right now
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
            className="mt-4 text-[15.5px] leading-[1.55]"
            style={{ color: "#4a3f33" }}
          >
            no algorithm, no feed — just an actual world map of tables you can sit at tonight.
          </motion.p>

          {/* Trending strip pulled from live data */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.42 }}
              className="mt-6 flex justify-center"
            >
              <TrendingStrip trending={stats.trending} fallbackFlags={COUNTRY_FLAGS} />
            </motion.div>
          )}
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
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
            <div className="absolute inset-0" style={{ background: PALETTE.paper }} />
          )}

          {!interactive && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              onClick={() => setInteractive(true)}
              className="absolute inset-0 z-20 flex cursor-pointer flex-col items-center justify-center gap-3 text-white"
              style={{
                background:
                  "linear-gradient(180deg, rgba(10,12,20,0.05) 0%, rgba(10,12,20,0.35) 55%, rgba(10,12,20,0.55) 100%)",
              }}
              aria-label="Explore the map"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-medium"
                style={{
                  background: "color-mix(in oklab, white 94%, transparent)",
                  color: PALETTE.ink,
                  backdropFilter: "blur(16px)",
                  boxShadow: "0 18px 40px -14px rgba(0,0,0,0.45)",
                  border: "1px solid rgba(255,255,255,0.5)",
                }}
              >
                <Hand className="h-4 w-4" style={{ color: PALETTE.blue }} strokeWidth={2.2} />
                Tap to explore the map
              </motion.div>
              <span
                className="text-[11.5px] font-medium uppercase tracking-[0.12em]"
                style={{ color: "rgba(255,255,255,0.85)", textShadow: "0 1px 6px rgba(0,0,0,0.35)" }}
              >
                {activities.length} gathering{activities.length === 1 ? "" : "s"} · worldwide
              </span>
            </motion.button>
          )}

          {interactive && (
            <>
              <div
                className="absolute left-4 top-4 z-10 inline-flex items-center gap-0.5 rounded-full p-1"
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
                      view === v ? "text-white" : "text-[#4a3f33] hover:text-[#141210]"
                    }`}
                    style={view === v ? { background: PALETTE.blue } : undefined}
                  >
                    {v === "satellite" ? "Satellite" : "Street"}
                  </button>
                ))}
              </div>

              <div
                className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px]"
                style={{
                  background: "color-mix(in oklab, white 82%, transparent)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid rgba(20,18,16,0.06)",
                  color: PALETTE.ink,
                }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: PALETTE.sage }} />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: PALETTE.sage }} />
                </span>
                <span className="font-semibold">{activities.length}</span> live
              </div>

              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center pb-5"
                style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.28) 100%)" }}
              >
                <Link
                  to="/discover"
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-medium transition hover:-translate-y-0.5"
                  style={{
                    background: "color-mix(in oklab, white 92%, transparent)",
                    color: PALETTE.ink,
                    backdropFilter: "blur(14px)",
                    boxShadow: "0 14px 28px -16px rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.6)",
                  }}
                >
                  open the full map <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────── TRENDING TRIPS MARQUEE ───────────────── */

type Trip = { flag: string; city: string; count: number };

const CARD_THEMES = [
  { grad: `linear-gradient(155deg, ${PALETTE.blueSoft} 0%, #FFFFFF 60%, ${PALETTE.blueSoft} 100%)`, ring: PALETTE.blue, badge: PALETTE.blue, badgeFg: "#FFFFFF", glow: "0 18px 36px -18px rgba(10,132,255,0.45)" },
  { grad: `linear-gradient(155deg, ${PALETTE.amberSoft} 0%, #FFFFFF 60%, ${PALETTE.amberSoft} 100%)`, ring: PALETTE.amberDeep, badge: PALETTE.amber, badgeFg: PALETTE.ink, glow: "0 18px 36px -18px rgba(180,128,31,0.45)" },
  { grad: `linear-gradient(155deg, ${PALETTE.sageSoft} 0%, #FFFFFF 60%, ${PALETTE.sageSoft} 100%)`, ring: PALETTE.sage, badge: PALETTE.sage, badgeFg: "#FFFFFF", glow: "0 18px 36px -18px rgba(125,168,142,0.5)" },
  { grad: `linear-gradient(155deg, #FFF 0%, ${PALETTE.paper} 100%)`, ring: PALETTE.muted, badge: PALETTE.ink, badgeFg: PALETTE.cream, glow: "0 18px 36px -18px rgba(60,42,20,0.35)" },
];

function TripCard({ t, idx }: { t: Trip; idx: number }) {
  const theme = CARD_THEMES[idx % CARD_THEMES.length];
  return (
    <motion.div
      whileHover={{ y: -6, rotate: -2, scale: 1.06 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl sm:h-28 sm:w-28"
      style={{
        background: theme.grad,
        border: `1px solid color-mix(in oklab, ${theme.ring} 22%, transparent)`,
        boxShadow: theme.glow,
      }}
      role="img"
      aria-label={`${t.city} — ${t.count} live gatherings this week`}
      title={`${t.city} · ${t.count} live`}
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 45%)" }}
      />
      <img src={twemojiUrl(t.flag)} alt="" draggable={false} className="relative h-12 w-12 drop-shadow-sm sm:h-14 sm:w-14" />
      <span
        className="absolute -bottom-1.5 -right-1.5 min-w-[24px] rounded-full px-1.5 text-center text-[11px] font-bold leading-[20px] tracking-tight"
        style={{ background: theme.badge, color: theme.badgeFg, boxShadow: `0 4px 12px ${theme.ring}55`, border: "1.5px solid #fff" }}
      >
        {t.count}
      </span>
    </motion.div>
  );
}


function TrendingMarquee({ trips }: { trips: Trip[] }) {
  if (trips.length === 0) return null;
  const doubled = [...trips, ...trips];
  return (
    <section id="trips" className="relative overflow-hidden py-10">
      <div className="mx-auto mb-6 flex max-w-6xl items-center justify-center gap-2 px-6 text-[15px] font-semibold" style={{ color: PALETTE.ink }}>
        <span className="text-lg">✈️</span> trending trips
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24" style={{ background: `linear-gradient(90deg,${PALETTE.paper},transparent)` }} />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24" style={{ background: `linear-gradient(-90deg,${PALETTE.paper},transparent)` }} />
        <motion.div
          className="flex gap-4 sm:gap-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((t, i) => (
            <TripCard key={i} t={t} idx={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────── HOW IT WORKS ───────────────── */

function How() {
  const steps = [
    { n: "01", icon: MapPin, tint: PALETTE.blue, title: "open the map", body: "every pin is a real gathering nearby — tonight, this weekend, or next city over." },
    { n: "02", icon: Coffee, tint: PALETTE.amberDeep, title: "tap what excites you", body: "see the host, the vibe, who's coming. reserve one of the few spots with a single tap." },
    { n: "03", icon: Users, tint: PALETTE.sage, title: "show up. belong.", body: "meet strangers over dinner, at a trailhead, at a corner café. leave with new group chats." },
  ];
  return (
    <section id="how" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="font-display font-semibold leading-[1.02] tracking-[-0.03em]"
            style={{ fontSize: "clamp(32px,5vw,56px)", color: PALETTE.ink }}
          >
            three taps.{" "}
            <span style={{ color: PALETTE.blue, fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}>
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
                background: `linear-gradient(180deg,${PALETTE.cream} 0%,${PALETTE.paper} 100%)`,
                border: "1px solid rgba(20,18,16,0.06)",
                boxShadow: "0 20px 40px -28px rgba(60,42,20,0.22)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[13px] font-medium tracking-[0.14em]" style={{ color: s.tint }}>{s.n}</span>
                <span
                  className="grid h-10 w-10 place-items-center rounded-full"
                  style={{
                    background: "color-mix(in oklab, white 70%, transparent)",
                    border: "1px solid rgba(20,18,16,0.06)",
                    color: s.tint,
                  }}
                >
                  <s.icon className="h-4 w-4" strokeWidth={2} />
                </span>
              </div>
              <div className="mt-14 font-display text-[22px] font-semibold tracking-[-0.02em]" style={{ color: PALETTE.ink }}>{s.title}</div>
              <p className="mt-2 text-[14px] leading-[1.55]" style={{ color: "#4a3f33" }}>{s.body}</p>
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
          background: `
            radial-gradient(70% 90% at 20% 0%, ${PALETTE.blue}55 0%, transparent 55%),
            radial-gradient(60% 80% at 100% 100%, ${PALETTE.amber}66 0%, transparent 55%),
            linear-gradient(180deg,#1c1815 0%,#0a0908 100%)
          `,
          boxShadow: "0 60px 120px -40px rgba(20,18,16,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <div className="mx-auto mb-6 flex justify-center">
          <OwlMark size={72} />
        </div>
        <div className="text-[11.5px] font-medium uppercase tracking-[0.2em]" style={{ color: "#a8c7ff" }}>
          your seat is waiting
        </div>
        <h2 className="mt-4 font-display font-semibold leading-[1.02] tracking-[-0.03em] text-white" style={{ fontSize: "clamp(34px,5.5vw,60px)" }}>
          today is a{" "}
          <span style={{ color: "#F4C97A", fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}>
            good day
          </span>{" "}
          to meet someone.
        </h2>
        <p className="mx-auto mt-5 max-w-[48ch] text-[15.5px] leading-[1.55]" style={{ color: "#e4d6c6" }}>
          gobber is free. joining a table takes ten seconds. the memory lasts a lot longer.
        </p>
        <div className="mt-9 flex justify-center">
          <AuthButtons />
        </div>
      </div>
    </section>
  );
}

/* ───────────────── FOOTER ───────────────── */

function Footer() {
  return (
    <footer className="px-6 pb-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t pt-8 text-[12.5px] sm:flex-row" style={{ borderColor: "#1a161410", color: "#6b5c48" }}>
        <div className="flex items-center gap-2">
          <OwlMark size={22} />
          <span className="font-semibold" style={{ color: PALETTE.ink }}>gobber</span>
          <span>· visit n vibe, made for meeting people in real life.</span>
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
  const { data: stats } = useQuery({
    queryKey: ["landing-stats"],
    queryFn: () => getLandingStats(),
    refetchInterval: 12_000,
    refetchIntervalInBackground: false,
    staleTime: 8_000,
  });

  const [nearYou, setNearYou] = useState<NearYou>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d?.city) setNearYou({ city: d.city, country: d.country_code, countryName: d.country_name });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const trips = useMemo<Trip[]>(() => {
    if (!stats || stats.trending.length === 0) return [];
    return stats.trending.map((t) => ({
      flag: COUNTRY_FLAGS[t.country] ?? "🌍",
      city: t.city,
      count: t.count,
    }));
  }, [stats]);

  return (
    <main className="relative min-h-screen" style={{ background: PALETTE.paper }}>
      <Nav />
      <Hero stats={stats} nearYou={nearYou} />
      <LiveMap activities={activities} stats={stats} />
      <TrendingMarquee trips={trips} />
      <How />
      <CTA />
      <Footer />
    </main>
  );
}
