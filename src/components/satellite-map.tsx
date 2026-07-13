import { useEffect, useRef } from "react";
import maplibregl, { Map as MLMap, Marker } from "maplibre-gl";
import { CATEGORIES } from "@/lib/categories";

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  category?: string;
}

interface Props {
  pins: MapPin[];
  onPinClick?: (id: string) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
  interactive?: boolean;
  variant?: "dot" | "glass";
}

const SATELLITE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    satellite: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Tiles © Esri",
      maxzoom: 19,
    },
    labels: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    { id: "sat", type: "raster", source: "satellite" },
    { id: "labels", type: "raster", source: "labels", paint: { "raster-opacity": 0.85 } },
  ],
};

function iconFor(category?: string) {
  return CATEGORIES.find((c) => c.id === category)?.icon ?? "📍";
}

export function SatelliteMap({ pins, onPinClick, center = [10, 25], zoom = 1.6, className, interactive = true, variant = "dot" }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: SATELLITE_STYLE,
      center,
      zoom,
      pitch: 30,
      bearing: 0,
      attributionControl: false,
      interactive,
      renderWorldCopies: true,
    });
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = pins.map((pin) => {
      const el = document.createElement("button");
      if (variant === "glass") {
        el.className = "group relative flex items-center justify-center transition-transform hover:scale-110";
        el.innerHTML = `
          <span class="relative flex h-11 w-11 items-center justify-center rounded-full text-lg shadow-[0_8px_24px_rgba(0,0,0,0.35)] ring-1 ring-white/60 backdrop-blur-xl bg-white/25">
            <span class="absolute inset-0 rounded-full bg-gradient-to-b from-white/60 to-white/5"></span>
            <span class="relative drop-shadow">${iconFor(pin.category)}</span>
          </span>
          <span class="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 rounded-[2px] bg-white/40 backdrop-blur-xl ring-1 ring-white/60"></span>
          <span class="absolute inset-0 -z-10 animate-ping rounded-full bg-white/25"></span>
        `;
      } else {
        el.className = "group relative flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-lg ring-2 ring-white/70 transition-transform hover:scale-125 backdrop-blur";
        el.innerHTML = `<span class="h-2.5 w-2.5 rounded-full bg-[oklch(0.55_0.09_55)]"></span><span class="absolute inset-0 -z-10 animate-ping rounded-full bg-white/40"></span>`;
      }
      el.onclick = (e) => { e.stopPropagation(); onPinClick?.(pin.id); };
      const marker = new maplibregl.Marker({ element: el, anchor: variant === "glass" ? "bottom" : "center" })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map);
      return marker;
    });
  }, [pins, onPinClick, variant]);

  return <div ref={containerRef} className={className ?? "h-full w-full"} />;
}

export function flyToLocation(map: MLMap, lng: number, lat: number, zoom = 13) {
  map.flyTo({ center: [lng, lat], zoom, pitch: 45, duration: 2200, essential: true, curve: 1.6 });
}
