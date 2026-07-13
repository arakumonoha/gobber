import { useEffect, useRef } from "react";
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
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  cursor?: "default" | "crosshair";
  ghostPin?: { lat: number; lng: number } | null;
  mapTypeId?: "satellite" | "hybrid" | "roadmap" | "terrain";
}

declare global {
  interface Window {
    google: any;
    __nomadInitGmap?: () => void;
    __nomadGmapReady?: Promise<void>;
  }
}

function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps) return Promise.resolve();
  if (window.__nomadGmapReady) return window.__nomadGmapReady;

  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;

  window.__nomadGmapReady = new Promise<void>((resolve, reject) => {
    window.__nomadInitGmap = () => resolve();
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__nomadInitGmap&channel=${channel}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps JS API"));
    document.head.appendChild(script);
  });
  return window.__nomadGmapReady;
}

function iconFor(category?: string) {
  return CATEGORIES.find((c) => c.id === category)?.icon ?? "📍";
}

// Warm editorial styling for roadmap/hybrid — matches the Warm Sand palette.
const CLASSY_MAP_STYLES: any[] = [
  { elementType: "geometry", stylers: [{ color: "#f3ead9" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5b4a36" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f7efe0" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c8b48a" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#ecdfc4" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e6d8b5" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#a8c7d8" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4a6b7a" }] },
];

function pinElement(category: string | undefined, ghost = false) {
  const el = document.createElement("div");
  el.style.transform = "translate(-50%, -100%)";
  el.style.cursor = "pointer";
  el.innerHTML = `
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
      <div style="position:relative;display:flex;height:44px;width:44px;align-items:center;justify-content:center;border-radius:9999px;
                  background:${ghost ? "rgba(139,115,85,0.75)" : "rgba(255,255,255,0.28)"};
                  box-shadow:0 10px 28px rgba(0,0,0,0.35);
                  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
                  border:1px solid rgba(255,255,255,0.65);font-size:20px;">
        <div style="position:absolute;inset:0;border-radius:9999px;background:linear-gradient(to bottom,rgba(255,255,255,0.6),rgba(255,255,255,0.05));"></div>
        <span style="position:relative;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.35));">${ghost ? "📍" : iconFor(category)}</span>
      </div>
      <div style="width:8px;height:8px;transform:rotate(45deg);margin-top:-4px;background:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.65);backdrop-filter:blur(14px);"></div>
    </div>
  `;
  return el;
}

export function GoogleMap({
  pins,
  onPinClick,
  onMapClick,
  center = { lat: 25, lng: 10 },
  zoom = 2,
  className,
  cursor = "default",
  ghostPin = null,
  mapTypeId = "hybrid",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const ghostRef = useRef<any>(null);
  const clickListenerRef = useRef<any>(null);

  // Init
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then(() => {
      if (cancelled || !containerRef.current) return;
      const g = window.google;
      mapRef.current = new g.maps.Map(containerRef.current, {
        center,
        zoom,
        mapTypeId,
        tilt: 0,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "greedy",
        styles: mapTypeId === "roadmap" ? CLASSY_MAP_STYLES : undefined,
        backgroundColor: "#f3ead9",
      });
    }).catch((e) => console.error(e));

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      ghostRef.current?.setMap(null);
      ghostRef.current = null;
      if (clickListenerRef.current) clickListenerRef.current.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cursor + click handler
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setOptions({ draggableCursor: cursor === "crosshair" ? "crosshair" : undefined });
    if (clickListenerRef.current) {
      clickListenerRef.current.remove();
      clickListenerRef.current = null;
    }
    if (onMapClick) {
      clickListenerRef.current = map.addListener("click", (e: any) => {
        if (!e.latLng) return;
        onMapClick({ lng: e.latLng.lng(), lat: e.latLng.lat() });
      });
    }
    return () => {
      if (clickListenerRef.current) {
        clickListenerRef.current.remove();
        clickListenerRef.current = null;
      }
    };
  }, [onMapClick, cursor]);

  // Ghost pin
  useEffect(() => {
    let raf: number;
    const attach = () => {
      const map = mapRef.current;
      const g = window.google;
      if (!map || !g) {
        raf = requestAnimationFrame(attach);
        return;
      }
      ghostRef.current?.setMap(null);
      ghostRef.current = null;
      if (ghostPin) {
        ghostRef.current = new g.maps.marker.AdvancedMarkerElement
          ? null
          : new g.maps.OverlayView();
        // Use a plain Marker with a custom label via a DOM overlay for reliability.
        const overlay = new g.maps.OverlayView();
        overlay.onAdd = function () {
          const panes = this.getPanes();
          this.div = pinElement(undefined, true);
          this.div.style.position = "absolute";
          panes.floatPane.appendChild(this.div);
        };
        overlay.draw = function () {
          const proj = this.getProjection();
          if (!proj || !this.div) return;
          const pos = proj.fromLatLngToDivPixel(new g.maps.LatLng(ghostPin.lat, ghostPin.lng));
          this.div.style.left = pos.x + "px";
          this.div.style.top = pos.y + "px";
        };
        overlay.onRemove = function () {
          if (this.div) {
            this.div.remove();
            this.div = null;
          }
        };
        overlay.setMap(map);
        ghostRef.current = overlay;
      }
    };
    attach();
    return () => cancelAnimationFrame(raf);
  }, [ghostPin]);

  // Pins
  useEffect(() => {
    let raf: number;
    const attach = () => {
      const map = mapRef.current;
      const g = window.google;
      if (!map || !g) {
        raf = requestAnimationFrame(attach);
        return;
      }
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = pins.map((pin) => {
        const overlay: any = new g.maps.OverlayView();
        overlay.onAdd = function () {
          const panes = this.getPanes();
          const el = pinElement(pin.category);
          el.addEventListener("click", (ev) => {
            ev.stopPropagation();
            onPinClick?.(pin.id);
          });
          el.style.position = "absolute";
          panes.floatPane.appendChild(el);
          this.div = el;
        };
        overlay.draw = function () {
          const proj = this.getProjection();
          if (!proj || !this.div) return;
          const pos = proj.fromLatLngToDivPixel(new g.maps.LatLng(pin.lat, pin.lng));
          this.div.style.left = pos.x + "px";
          this.div.style.top = pos.y + "px";
        };
        overlay.onRemove = function () {
          if (this.div) {
            this.div.remove();
            this.div = null;
          }
        };
        overlay.setMap(map);
        return overlay;
      });
    };
    attach();
    return () => cancelAnimationFrame(raf);
  }, [pins, onPinClick]);

  return <div ref={containerRef} className={className ?? "h-full w-full"} />;
}
