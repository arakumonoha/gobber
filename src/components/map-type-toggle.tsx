import { Layers, Map as MapIcon } from "lucide-react";

export type MapView = "satellite" | "roadmap";

interface Props {
  value: MapView;
  onChange: (v: MapView) => void;
  className?: string;
}

export function MapTypeToggle({ value, onChange, className }: Props) {
  return (
    <div
      className={`glass-panel inline-flex items-center gap-0.5 rounded-full p-1 ${className ?? ""}`}
    >
      <button
        onClick={() => onChange("satellite")}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
          value === "satellite" ? "bg-ink text-background shadow" : "text-foreground/70 hover:text-foreground"
        }`}
        aria-pressed={value === "satellite"}
      >
        <Layers className="h-3.5 w-3.5" />
        Satellite
      </button>
      <button
        onClick={() => onChange("roadmap")}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
          value === "roadmap" ? "bg-ink text-background shadow" : "text-foreground/70 hover:text-foreground"
        }`}
        aria-pressed={value === "roadmap"}
      >
        <MapIcon className="h-3.5 w-3.5" />
        Street
      </button>
    </div>
  );
}
