import { Link, useLocation } from "@tanstack/react-router";
import { Compass, Plus, User, Globe2 } from "lucide-react";
import { motion } from "framer-motion";

type NavItem = { to: "/discover" | "/explore" | "/host" | "/profile"; icon: typeof Compass; label: string; featured?: boolean };
const items: NavItem[] = [
  { to: "/discover", icon: Compass, label: "Discover" },
  { to: "/explore", icon: Globe2, label: "Explore" },
  { to: "/host", icon: Plus, label: "Host", featured: true },
  { to: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const loc = useLocation();
  return (
    <motion.nav
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 28 }}
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-5 pt-2 sm:px-6"
    >
      <div
        className="mx-auto flex max-w-[420px] items-center justify-between rounded-full px-2.5 py-2 ring-1 ring-black/[0.04]"
        style={{
          background: "color-mix(in oklab, white 78%, transparent)",
          backdropFilter: "saturate(180%) blur(28px)",
          WebkitBackdropFilter: "saturate(180%) blur(28px)",
          boxShadow:
            "0 1px 2px rgba(50,34,15,0.05), 0 20px 60px -24px rgba(50,34,15,0.22)",
        }}
      >
        {items.map((item) => {
          const active = loc.pathname === item.to;
          const Icon = item.icon;
          if (item.featured) {
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-label={item.label}
                className="group relative -my-2 flex h-12 w-12 items-center justify-center rounded-full text-white transition"
                style={{
                  background: "linear-gradient(180deg, #1c1815 0%, #0a0908 100%)",
                  boxShadow:
                    "0 10px 28px -12px rgba(20,18,16,0.65), inset 0 1px 0 rgba(255,255,255,0.12)",
                }}
              >
                <motion.span
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 380, damping: 22 }}
                  className="flex h-full w-full items-center justify-center"
                >
                  <Icon className="h-[19px] w-[19px]" strokeWidth={2.2} />
                </motion.span>
              </Link>
            );
          }
          return (
            <Link
              key={item.to}
              to={item.to}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-1.5"
            >
              {active && (
                <motion.span
                  layoutId="nav-glass-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 -z-0 rounded-full ring-1 ring-black/[0.05]"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,247,232,0.78) 100%)",
                    backdropFilter: "saturate(180%) blur(14px)",
                    WebkitBackdropFilter: "saturate(180%) blur(14px)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.9), 0 6px 16px -8px rgba(60,42,20,0.25)",
                  }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.92 }}
                className="relative z-10 flex flex-col items-center"
              >
                <Icon
                  className={`h-[19px] w-[19px] transition-colors ${
                    active ? "text-[#1a1614]" : "text-[#9a8770]"
                  }`}
                  strokeWidth={active ? 2.2 : 1.7}
                />
                <span
                  className={`mt-0.5 text-[9.5px] tracking-[0.02em] transition-colors ${
                    active ? "font-semibold text-[#1a1614]" : "font-medium text-[#9a8770]"
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
