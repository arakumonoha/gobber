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
      className={`relative inline-flex items-center gap-1 rounded-full p-[5px] ring-1 ring-black/[0.06] ${className ?? ""}`}
      style={{
        background:
          "linear-gradient(180deg, rgba(255,252,246,0.82) 0%, rgba(246,238,224,0.72) 100%)",
        backdropFilter: "saturate(180%) blur(24px)",
        boxShadow:
          "0 20px 44px -20px rgba(60,40,14,0.35), 0 1px 0 rgba(255,255,255,0.9) inset, 0 -1px 0 rgba(90,60,20,0.05) inset",
      }}
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
            className="relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold tracking-[-0.005em] transition-colors"
          >
            {active && (
              <motion.span
                layoutId="map-toggle-glass"
                transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.7 }}
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, #ffffff 0%, #fbf5e8 100%)",
                  boxShadow:
                    "0 10px 22px -10px rgba(60,40,14,0.38), 0 1px 0 rgba(255,255,255,1) inset, 0 0 0 1px rgba(90,60,20,0.09)",
                }}
              />
            )}
            <motion.span
              animate={{ scale: active ? 1.06 : 1, rotate: active ? [0, -8, 0] : 0 }}
              transition={{
                scale: { type: "spring", stiffness: 500, damping: 18 },
                rotate: { duration: 0.45, ease: [0.22, 1, 0.36, 1], times: [0, 0.5, 1] },
              }}
              className="relative z-10 inline-flex"
            >
              <Icon className={`h-3.5 w-3.5 ${active ? "text-[#1a1108]" : "text-[#6b533a]"}`} strokeWidth={2.4} />
            </motion.span>
            <span className={`relative z-10 ${active ? "text-[#1a1108]" : "text-[#6b533a]"}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
