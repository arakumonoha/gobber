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

import memojiGroup from "@/assets/memoji-group.png";

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

/* ───────────────────── ATMOSPHERIC BG ───────────────────── */

function AtmosphericGlobe() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* soft warm wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 55% at 50% 108%, rgba(255,230,190,0.55) 0%, transparent 55%), radial-gradient(1200px 900px at 50% -10%, #fbf4e3 0%, transparent 55%), linear-gradient(180deg, #f5eddc 0%, #efe3c9 100%)",
        }}
      />
      {/* faint grid */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M 56 0 L 0 0 0 56" fill="none" stroke="#1a1614" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* horizon curve */}
      <div
        className="absolute -bottom-[48vh] left-1/2 h-[100vh] w-[140vw] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,220,170,0.55), rgba(255,220,170,0) 70%)",
          filter: "blur(20px)",
        }}
      />
    </div>
  );
}

/* ─────────────────── PRODUCT MOCK (hero) ─────────────────── */

function HeroMock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1.2, ease: EASE, delay: 0.35 }}
      className="relative mx-auto mt-20 w-full max-w-[980px]"
      style={{ perspective: 1600 }}
    >
      <div
        className="relative overflow-hidden rounded-[28px]"
        style={{
          background: "linear-gradient(180deg, #fdf6e6 0%, #f3e6ca 100%)",
          boxShadow:
            "0 40px 90px -30px rgba(50,34,15,0.35), 0 8px 24px -12px rgba(50,34,15,0.15), inset 0 1px 0 rgba(255,255,255,0.6)",
          border: "1px solid rgba(20,18,16,0.06)",
        }}
      >
        {/* Fake map surface */}
        <div className="relative aspect-[16/9] w-full">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 90% at 30% 40%, #e8d4a8 0%, transparent 60%), radial-gradient(50% 80% at 80% 70%, #d9c290 0%, transparent 60%), linear-gradient(180deg, #efe0bd 0%, #e3cf9e 100%)",
            }}
          />
          {/* topographic lines */}
          <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 800 450">
            {Array.from({ length: 14 }).map((_, i) => (
              <path
                key={i}
                d={`M0 ${40 + i * 30} C 150 ${20 + i * 30}, 350 ${80 + i * 30}, 800 ${30 + i * 30}`}
                stroke="#8b6f3f"
                strokeOpacity="0.25"
                strokeWidth="0.7"
                fill="none"
              />
            ))}
          </svg>

          {/* Floating pins */}
          {[
            { x: "22%", y: "38%", label: "Sunset supper", cat: "Dinner", delay: 0.6 },
            { x: "55%", y: "26%", label: "Coffee crawl", cat: "Coffee", delay: 0.9 },
            { x: "72%", y: "60%", label: "Ridge hike", cat: "Hike", delay: 1.2 },
          ].map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -14, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: p.delay, duration: 0.7, ease: EASE }}
              className="absolute -translate-x-1/2 -translate-y-full"
              style={{ left: p.x, top: p.y }}
            >
              <div
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-medium text-[#1a1614]"
                style={{
                  background: "color-mix(in oklab, white 78%, transparent)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 8px 20px -8px rgba(50,34,15,0.35)",
                  border: "1px solid rgba(20,18,16,0.06)",
                }}
              >
                <MapPin className="h-3 w-3 text-[#8b6f3f]" strokeWidth={2.4} />
                {p.label}
              </div>
              <div
                className="mx-auto mt-0.5 h-2 w-2 rounded-full"
                style={{
                  background: "linear-gradient(180deg, #1c1815, #0a0908)",
                  boxShadow: "0 2px 6px rgba(20,18,16,0.5)",
                }}
              />
            </motion.div>
          ))}

          {/* Bottom activity card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8, ease: EASE }}
            className="absolute inset-x-4 bottom-4 rounded-2xl p-4"
            style={{
              background: "color-mix(in oklab, white 82%, transparent)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(20,18,16,0.06)",
              boxShadow: "0 20px 40px -20px rgba(50,34,15,0.3)",
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8b6f3f]">
                  Tonight · Lisbon
                </div>
                <div className="mt-0.5 font-display text-[17px] font-semibold tracking-[-0.02em] text-[#141210]">
                  Rooftop paella with 6 nomads
                </div>
                <div className="mt-0.5 text-[12px] text-[#6b5c48]">
                  Hosted by Mira · 2 spots left
                </div>
              </div>
              <div className="flex -space-x-2">
                {["#c9a97a", "#8b6f3f", "#e3a17a", "#6b5c48"].map((c, i) => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-white"
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Reflection */}
      <div
        className="mx-auto mt-2 h-16 w-[85%] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(50,34,15,0.18), rgba(50,34,15,0) 70%)",
          filter: "blur(14px)",
        }}
      />
    </motion.div>
  );
}

/* ────────────────────────── HERO ────────────────────────── */

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 pt-32"
    >
      <AtmosphericGlobe />
      <motion.div style={{ y, opacity }} className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,18,16,0.08)] bg-white/50 px-3 py-1 text-[11.5px] font-medium uppercase tracking-[0.14em] text-[#4a3f33] backdrop-blur"
        >
          <Sparkles className="h-3 w-3 text-[#8b6f3f]" strokeWidth={2.4} />
          Now gathering in 40+ cities
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
          className="serif-hero mx-auto mt-6 max-w-[18ch] text-[clamp(48px,8.5vw,110px)] text-[#141210]"
        >
          Meet strangers.{" "}
          <span style={{ color: "#8b6f3f" }}>Leave with friends.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.35 }}
          className="mx-auto mt-6 max-w-[52ch] text-[17px] leading-[1.55] text-[#4a3f33]"
        >
          Gobber turns cities into gathering places. Discover intimate dinners,
          spontaneous hikes and small adventures — hosted by curious people, minutes from where you are.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.5 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/auth"
            className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-medium text-white"
            style={{
              background: "linear-gradient(180deg, #1c1815 0%, #0a0908 100%)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.08) inset, 0 20px 40px -20px rgba(20,18,16,0.6), 0 4px 10px rgba(20,18,16,0.15)",
            }}
          >
            Start gathering
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-medium text-[#141210]"
            style={{
              background: "color-mix(in oklab, white 65%, transparent)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(20,18,16,0.08)",
            }}
          >
            Sign in
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-8 flex items-center justify-center gap-3 text-[12px] text-[#6b5c48]"
        >
          <img
            src={memojiGroup}
            alt=""
            className="h-9 w-auto object-contain"
            style={{ filter: "drop-shadow(0 6px 12px rgba(50,34,15,0.15))" }}
          />
          <span>Joined this week by 2,400+ curious wanderers</span>
        </motion.div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0">
        <HeroMock />
      </div>
    </section>
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
