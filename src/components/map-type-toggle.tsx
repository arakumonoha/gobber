import { Layers, Map as MapIcon } from "lucide-react";
import { motion } from "framer-motion";

export type MapView = "satellite" | "roadmap";

interface Props {
  value: MapView;
  onChange: (v: MapView) => void;
  className?: string;
}

const OPTIONS: { id: MapView; label: string; Icon: typeof Layers }[] = [
  { id: "satellite", label: "Satellite", Icon: Layers },
  { id: "roadmap", label: "Street", Icon: MapIcon },
];

export function MapTypeToggle({ value, onChange, className }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Map view"
      className={`relative inline-flex items-center gap-0.5 rounded-full p-1 border border-white/40 bg-white/25 backdrop-blur-2xl shadow-[0_8px_24px_-12px_rgba(60,40,10,0.25),inset_0_1px_0_rgba(255,255,255,0.6)] ${className ?? ""}`}
    >
      {OPTIONS.map(({ id, label, Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            aria-pressed={active}
            onClick={() => onChange(id)}
            className="relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors"
          >
            {active && (
              <motion.span
                layoutId="map-toggle-glass"
                transition={{ type: "spring", stiffness: 400, damping: 32, mass: 0.7 }}
                className="absolute inset-0 rounded-full border border-white/60 bg-white/55 backdrop-blur-xl shadow-[0_6px_18px_-8px_rgba(60,40,10,0.35),inset_0_1px_0_rgba(255,255,255,0.8)]"
              />
            )}
            <motion.span
              animate={{ scale: active ? 1.06 : 1, rotate: active ? [0, -8, 0] : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              className="relative z-10 inline-flex"
            >
              <Icon className={`h-3.5 w-3.5 ${active ? "text-[#2a1c0c]" : "text-foreground/60"}`} />
            </motion.span>
            <span className={`relative z-10 ${active ? "text-[#2a1c0c]" : "text-foreground/70"}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
