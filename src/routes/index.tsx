import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Apple, Play, Star, Coffee, Users, MapPin, Sparkles } from "lucide-react";

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
          <a href="#how" className="transition hover:text-[#141210]">how it works</a>
          <a href="#guidelines" className="transition hover:text-[#141210]">guidelines</a>
        </nav>
        <Link
          to="/auth"
          className="group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13.5px] font-medium text-white transition hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(180deg,#ff7a5c,#e85a3c)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.28), 0 10px 22px -12px rgba(232,90,60,0.6)",
          }}
        >
          get the app
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

/* ───────────────────────── HERO ───────────────────────── */

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const [count, setCount] = useState(91336);
  useEffect(() => {
    const t = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 5) + 1), 2200);
    return () => clearInterval(t);
  }, []);

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

        {/* headline */}
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

        {/* subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.28 }}
          className="mt-6 max-w-[54ch] text-[17.5px] leading-[1.55] text-[#4a3f33]"
        >
          browse nearby tables, join one, and make real friendships with people around you.
          today, not someday <span className="inline-block">:)</span>
        </motion.p>

        {/* trust pills */}
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
            📲 <span className="font-semibold text-[#141210]">1M+</span> users
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
            <span className="font-semibold text-[#141210]">4.7</span> on the App Store
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.58 }}
          className="mt-8 flex w-full max-w-md flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Link
            to="/auth"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-[15px] font-medium text-white transition hover:-translate-y-0.5 sm:w-auto"
            style={{
              background: "linear-gradient(180deg,#ff7a5c,#e85a3c)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.3), 0 20px 40px -18px rgba(232,90,60,0.65), 0 4px 10px rgba(232,90,60,0.2)",
            }}
          >
            <Apple className="h-4 w-4 fill-current" strokeWidth={0} />
            download for iOS
          </Link>
          <Link
            to="/auth"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-[15px] font-medium text-[#141210] transition hover:-translate-y-0.5 sm:w-auto"
            style={{
              background: "color-mix(in oklab, white 92%, transparent)",
              border: "1px solid rgba(20,18,16,0.08)",
              boxShadow: "0 10px 22px -14px rgba(20,18,16,0.18)",
            }}
          >
            <Play className="h-4 w-4 fill-current" strokeWidth={0} />
            download for Android
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ───────────────── TRENDING TRIPS MARQUEE ───────────────── */

type Trip = { flag: string; city: string; dates: string; going: string };

const TRIPS: Trip[] = [
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

function TrendingTrips() {
  const doubled = [...TRIPS, ...TRIPS];
  return (
    <section id="trips" className="relative overflow-hidden py-10">
      <div className="mx-auto mb-6 flex max-w-6xl items-center justify-center gap-2 px-6 text-[15px] font-semibold text-[#141210]">
        <span className="text-lg">✈️</span> trending trips
      </div>
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24"
          style={{ background: "linear-gradient(90deg,#f5e6c9,transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24"
          style={{ background: "linear-gradient(-90deg,#f5e6c9,transparent)" }}
        />
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

/* ───────────────── ACTIVITIES TODAY ───────────────── */

type Activity = {
  emoji: string;
  title: string;
  place: string;
  when: string;
  host: string;
  spots: string;
  tone: string;
};

const ACTIVITIES: Activity[] = [
  { emoji: "🍜", title: "ramen crawl, shibuya", place: "Tokyo", when: "tonight · 7:30 pm", host: "Aiko", spots: "3 seats", tone: "#ffe4d8" },
  { emoji: "🌅", title: "sunrise hike, camelback", place: "Phoenix", when: "sat · 5:15 am", host: "Marco", spots: "5 seats", tone: "#fde7c1" },
  { emoji: "☕", title: "focus morning at ozone", place: "Lisbon", when: "tomorrow · 9 am", host: "Sofia", spots: "4 seats", tone: "#e6ddc4" },
  { emoji: "🎨", title: "gallery walk + wine", place: "Barcelona", when: "fri · 6 pm", host: "Nadia", spots: "6 seats", tone: "#ffd8d0" },
  { emoji: "🏄", title: "beginners surf lesson", place: "Bali", when: "sun · 7 am", host: "Kai", spots: "2 seats", tone: "#d6e8dc" },
  { emoji: "🍕", title: "pizza + pasta night", place: "Rome", when: "tonight · 8 pm", host: "Luca", spots: "4 seats", tone: "#ffe0b0" },
];

function Activities() {
  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="font-display text-[clamp(32px,5vw,56px)] font-semibold leading-[1.02] tracking-[-0.03em] text-[#141210]"
          >
            join{" "}
            <span
              className="serif-hero"
              style={{ color: "#e85a3c", fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}
            >
              activities
            </span>{" "}
            happening today
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-[15.5px] leading-[1.55] text-[#4a3f33]">
            real plans by real people. no group chats, no maybe's — just a table with your seat on it.
          </motion.p>
        </motion.div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIVITIES.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-3xl p-5 transition-transform hover:-translate-y-1"
              style={{
                background: "color-mix(in oklab, white 90%, transparent)",
                border: "1px solid rgba(20,18,16,0.06)",
                boxShadow: "0 20px 40px -24px rgba(60,42,20,0.22)",
              }}
            >
              <div
                className="grid h-14 w-14 place-items-center rounded-2xl text-[28px]"
                style={{ background: a.tone }}
              >
                {a.emoji}
              </div>
              <div className="mt-4 font-display text-[17px] font-semibold tracking-[-0.015em] text-[#141210]">
                {a.title}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-[#6b5c48]">
                <MapPin className="h-3 w-3" strokeWidth={2.4} /> {a.place} · {a.when}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[#1a161410] pt-3">
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded-full"
                    style={{ background: "linear-gradient(135deg,#e3a17a,#8b6f3f)" }}
                  />
                  <span className="text-[12px] text-[#4a3f33]">
                    hosted by <span className="font-semibold text-[#141210]">{a.host}</span>
                  </span>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                  style={{ background: "#f0e6cc", color: "#8b6f3f" }}
                >
                  {a.spots}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
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
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-[15px] font-medium text-[#141210] transition hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(180deg,#ffffff,#f5ead6)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 20px 40px -18px rgba(0,0,0,0.5)",
            }}
          >
            <Apple className="h-4 w-4 fill-current" strokeWidth={0} />
            download for iOS
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-[15px] font-medium text-white transition hover:-translate-y-0.5"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              backdropFilter: "blur(12px)",
            }}
          >
            <Play className="h-4 w-4 fill-current" strokeWidth={0} />
            download for Android
          </Link>
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
  return (
    <main className="relative min-h-screen" style={{ background: "#f5e6c9" }}>
      <Nav />
      <Hero />
      <TrendingTrips />
      <Activities />
      <How />
      <CTA />
      <Footer />
    </main>
  );
}
