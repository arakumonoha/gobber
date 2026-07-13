import { Link, useLocation } from "@tanstack/react-router";
import { Compass, PlusCircle, CalendarHeart, User } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { to: "/", icon: Compass, label: "Discover" },
  { to: "/trips", icon: CalendarHeart, label: "Trips" },
  { to: "/host", icon: PlusCircle, label: "Host", featured: true },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

export function BottomNav() {
  const loc = useLocation();
  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 24 }}
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 pt-2 sm:px-6"
    >
      <div className="mx-auto flex max-w-md items-center justify-around rounded-full glass px-2 py-2 shadow-float">
        {items.map((item) => {
          const active = loc.pathname === item.to || (item.to === "/" && loc.pathname === "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative flex flex-col items-center gap-0.5 rounded-full px-4 py-2 text-[10px] font-medium transition ${
                item.featured
                  ? "bg-primary text-primary-foreground -my-1 shadow-lg"
                  : active
                  ? "text-clay"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={item.featured ? "h-5 w-5" : "h-[18px] w-[18px]"} strokeWidth={active || item.featured ? 2.4 : 1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
