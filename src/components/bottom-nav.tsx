import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Compass, Map, Plus, Plane, User } from "lucide-react";

const TABS = [
  { to: "/discover", label: "Discover", Icon: Compass },
  { to: "/explore", label: "Explore", Icon: Map },
  { to: "/host", label: "Host", Icon: Plus },
  { to: "/trips", label: "Trips", Icon: Plane },
  { to: "/profile", label: "Profile", Icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeIdx = TABS.findIndex((t) => pathname === t.to || pathname.startsWith(t.to + "/"));

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit max-w-[92vw] items-center gap-1 rounded-full px-2 py-1.5"
      style={{
        background: "rgba(255,253,247,0.55)",
        border: "1px solid rgba(255,255,255,0.6)",
        backdropFilter: "blur(24px) saturate(180%)",
        boxShadow: "0 10px 40px -12px rgba(60,42,20,0.25), inset 0 1px 0 rgba(255,255,255,0.8)",
      }}
    >
      {TABS.map((t, i) => {
        const isActive = i === activeIdx;
        return (
          <Link
            key={t.to}
            to={t.to}
            aria-label={t.label}
            aria-current={isActive ? "page" : undefined}
            className="relative flex h-11 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium tracking-tight text-[#2b1d0f] transition-colors hover:text-[#0f0d0b]"
          >
            {isActive && (
              <motion.span
                layoutId="bottom-nav-active"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="absolute inset-0 rounded-full bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_8px_-4px_rgba(60,42,20,0.2)]"
              />
            )}
            <t.Icon className="relative h-4 w-4" strokeWidth={2.2} aria-hidden />
            <span className="relative hidden sm:inline">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
