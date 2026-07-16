import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LandingStats } from "@/lib/landing-stats.functions";

const CATEGORY_ICON: Record<string, string> = {
  Dinner: "🍜",
  Adventure: "🏞️",
  Coffee: "☕",
  Nightlife: "🌙",
  Workout: "🏃",
  Culture: "🎨",
  Music: "🎧",
};

function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function JoinsTicker({ joins }: { joins: LandingStats["joins"] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!joins.length) return;
    const t = setInterval(() => setI((v) => (v + 1) % joins.length), 4200);
    return () => clearInterval(t);
  }, [joins.length]);

  if (!joins.length) {
    return (
      <div
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] text-[#5a4a35]"
        style={{
          background: "color-mix(in oklab, white 78%, transparent)",
          border: "1px solid rgba(20,18,16,0.06)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#7DA88E]" />
        waiting for the first table to fill…
      </div>
    );
  }

  const j = joins[i];
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] text-[#1A1614]"
      style={{
        background: "color-mix(in oklab, white 82%, transparent)",
        border: "1px solid rgba(20,18,16,0.06)",
        backdropFilter: "blur(12px)",
      }}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E8A93C] opacity-80" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#E8A93C]" />
      </span>
      <span className="shrink-0">{CATEGORY_ICON[j.category] ?? "✨"}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={`${j.when}-${i}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          className="whitespace-nowrap"
        >
          <span className="font-semibold">{j.name}</span> joined{" "}
          <span className="italic text-[#0057D1]">{j.title}</span> · {j.city}
          <span className="ml-2 text-[#8b7355]">{timeAgo(j.when)}</span>
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function TrendingStrip({
  trending,
  fallbackFlags,
}: {
  trending: LandingStats["trending"];
  fallbackFlags: Record<string, string>;
}) {
  if (trending.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8b6f3f]">
        trending 24h
      </span>
      {trending.slice(0, 8).map((t) => {
        const flag = fallbackFlags[t.country] ?? "🌍";
        return (
          <motion.div
            key={t.city}
            whileHover={{ y: -3, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-[22px] leading-none"
            style={{
              background: "color-mix(in oklab, white 88%, transparent)",
              border: "1px solid rgba(20,18,16,0.06)",
              boxShadow: "0 10px 22px -14px rgba(60,42,20,0.28)",
            }}
            role="img"
            aria-label={`${t.city} — ${t.count} trending`}
            title={`${t.city} · ${t.count} live`}
          >
            <span aria-hidden>{flag}</span>
            <span
              className="absolute -bottom-1 -right-1 min-w-[18px] rounded-full px-1 text-center text-[10px] font-semibold leading-[16px]"
              style={{ background: "#E8A93C", color: "#1A1614", boxShadow: "0 2px 6px rgba(60,42,20,0.25)" }}
            >
              {t.count}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

