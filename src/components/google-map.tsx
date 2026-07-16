import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { CATEGORIES } from "@/lib/categories";

export interface GoogleMapHandle {
  panTo: (lat: number, lng: number, zoom?: number) => void;
  resetHeading: () => void;
  getHeading: () => number;
}

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
  onLongPress?: (lngLat: { lng: number; lat: number }) => void;
  onHeadingChange?: (heading: number) => void;
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

function categoryMeta(category?: string) {
  const c = CATEGORIES.find((x) => x.id === category);
  return {
    icon: c?.icon ?? "📍",
    tint: c?.tint ?? "#1a1614",
    tintSoft: c?.tintSoft ?? "#f0e8d4",
  };
}

// Apple Maps-inspired styling — soft, minimal, editorial. Pairs with Warm Sand palette.
const CLASSY_MAP_STYLES: any[] = [
  { elementType: "geometry", stylers: [{ color: "#f5f1ea" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b5a44" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#faf7f0" }, { weight: 3 }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#d4c4a0" }, { weight: 0.6 }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#b8a075" }, { weight: 0.8 }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#4a3d2c" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#ede2c9" }] },
  { featureType: "landscape.natural.terrain", elementType: "geometry", stylers: [{ color: "#e5d7b8" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#f0e8d4" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#d4e3c0" }, { visibility: "on" }] },
  { featureType: "poi.park", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#ece2c8" }, { weight: 0.5 }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#fdf6e3" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#d4b876" }, { weight: 0.6 }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road.arterial", elementType: "labels", stylers: [{ visibility: "simplified" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#b8d4e0" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#5a7a88" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#e8f0f5" }, { weight: 2 }] },
];

// Inject pin CSS once (hover/pop animation, drop-in)
let __gobberPinStylesInjected = false;
function ensurePinStyles() {
  if (typeof document === "undefined" || __gobberPinStylesInjected) return;
  __gobberPinStylesInjected = true;
  const style = document.createElement("style");
  style.setAttribute("data-gobber-pin", "");
  style.textContent = `
    @keyframes gobber-pin-drop {
      0% { transform: translate(-50%, -140%) scale(0.6); opacity: 0; }
      60% { transform: translate(-50%, -96%) scale(1.08); opacity: 1; }
      100% { transform: translate(-50%, -100%) scale(1); opacity: 1; }
    }
    @keyframes gobber-pin-pulse {
      0%, 100% { opacity: 0.55; transform: translate(-50%, -50%) scale(1); }
      50% { opacity: 0; transform: translate(-50%, -50%) scale(2.2); }
    }
    .gobber-pin {
      position: absolute;
      cursor: pointer;
      transform: translate(-50%, -100%);
      animation: gobber-pin-drop 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
      transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1), filter 260ms ease;
      will-change: transform;
    }
    .gobber-pin:hover { transform: translate(-50%, -108%) scale(1.06); filter: brightness(1.04); z-index: 10; }
    .gobber-pin-body {
      position: relative;
      display: flex;
      height: 44px;
      width: 44px;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.55);
      backdrop-filter: blur(20px) saturate(180%);
      box-shadow:
        0 1px 0 rgba(255,255,255,0.9) inset,
        0 0 0 1px rgba(255,255,255,0.55),
        0 14px 32px -10px rgba(20,14,8,0.45),
        0 4px 10px -4px rgba(20,14,8,0.35);
    }
    .gobber-pin-ring {
      position: absolute; inset: 3px; border-radius: 9999px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 1px 0 rgba(255,255,255,0.9) inset;
    }
    .gobber-pin-icon {
      position: relative; font-size: 20px; line-height: 1;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25));
    }
    .gobber-pin-stem {
      position: absolute;
      left: 50%; bottom: -5px;
      width: 10px; height: 10px;
      transform: translateX(-50%) rotate(45deg);
      background: rgba(255, 255, 255, 0.55);
      backdrop-filter: blur(20px) saturate(180%);
      box-shadow: 0 8px 12px -4px rgba(20,14,8,0.35);
      border-radius: 2px;
    }
    .gobber-pin-halo {
      position: absolute; left: 50%; top: 50%;
      width: 44px; height: 44px; border-radius: 9999px;
      transform: translate(-50%, -50%);
      pointer-events: none;
      animation: gobber-pin-pulse 2.6s ease-out infinite;
    }
    .gobber-pin-ghost .gobber-pin-body { background: rgba(232, 90, 60, 0.9); }
    .gobber-pin-ghost .gobber-pin-stem { background: rgba(232, 90, 60, 0.9); }
  `;
  document.head.appendChild(style);
}

function pinElement(category: string | undefined, ghost = false) {
  ensurePinStyles();
  const { icon, tint, tintSoft } = categoryMeta(category);
  const el = document.createElement("div");
  el.className = `gobber-pin${ghost ? " gobber-pin-ghost" : ""}`;
  el.innerHTML = `
    <div class="gobber-pin-body">
      <span class="gobber-pin-halo" style="background:${ghost ? "rgba(232,90,60,0.35)" : tint + "55"};"></span>
      <div class="gobber-pin-ring" style="background:${ghost ? "rgba(255,255,255,0.28)" : "linear-gradient(180deg," + tintSoft + "ee," + tintSoft + "aa)"};">
        <span class="gobber-pin-icon">${ghost ? "📍" : icon}</span>
      </div>
    </div>
    <div class="gobber-pin-stem" style="${ghost ? "" : "background:" + tintSoft + "cc;"}"></div>
  `;
  el.style.setProperty("--tint", tint);
  return el;
}


export const GoogleMap = forwardRef<GoogleMapHandle, Props>(function GoogleMap({
  pins,
  onPinClick,
  onMapClick,
  onLongPress,
  onHeadingChange,
  center = { lat: 25, lng: 10 },
  zoom = 2,
  className,
  cursor = "default",
  ghostPin = null,
  mapTypeId = "hybrid",
}, ref) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const ghostRef = useRef<any>(null);
  const clickListenerRef = useRef<any>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressListeners = useRef<any[]>([]);
  const headingListenerRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    panTo: (lat: number, lng: number, z?: number) => {
      const map = mapRef.current;
      const g = window.google;
      if (!map || !g) return;
      map.panTo(new g.maps.LatLng(lat, lng));
      if (typeof z === "number") map.setZoom(z);
    },
    resetHeading: () => {
      const map = mapRef.current;
      if (!map) return;
      map.setHeading(0);
      map.setTilt(mapTypeId === "roadmap" ? 0 : 45);
    },
    getHeading: () => mapRef.current?.getHeading?.() ?? 0,
  }), [mapTypeId]);



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
        tilt: 45,
        heading: 0,
        disableDefaultUI: true,
        zoomControl: false,
        gestureHandling: "greedy",
        styles: mapTypeId === "roadmap" ? CLASSY_MAP_STYLES : undefined,
        backgroundColor: "#0b1220",
        minZoom: 3,
        maxZoom: 20,
        isFractionalZoomEnabled: true,
        clickableIcons: true,
        keyboardShortcuts: false,
        rotateControl: false,
        scaleControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        restriction: {
          latLngBounds: { north: 85, south: -85, west: -180, east: 180 },
          strictBounds: true,
        },
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

  // React to map type changes
  useEffect(() => {
    const map = mapRef.current;
    const g = window.google;
    if (!map || !g) return;
    map.setMapTypeId(mapTypeId);
    map.setOptions({
      styles: mapTypeId === "roadmap" ? CLASSY_MAP_STYLES : undefined,
      tilt: mapTypeId === "roadmap" ? 0 : 45,
    });
  }, [mapTypeId]);

  // Cursor + click handler
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setOptions({ draggableCursor: cursor === "crosshair" ? "crosshair" : undefined });
    if (clickListenerRef.current) {
      clickListenerRef.current.remove();
      clickListenerRef.current = null;
    }
    // Always attach a click listener so we can intercept POI clicks (which carry a placeId).
    // - POI click → let Google's native info window show; do NOT trigger onMapClick (no accidental pin).
    // - Blank map click → forward to onMapClick if provided (add-pin flow).
    clickListenerRef.current = map.addListener("click", (e: any) => {
      if (e?.placeId) {
        // A place (shop / restaurant / landmark) was clicked. Google's built-in
        // info window will open automatically. Never fire onMapClick here.
        return;
      }
      if (!onMapClick || !e.latLng) return;
      onMapClick({ lng: e.latLng.lng(), lat: e.latLng.lat() });
    });
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
        const overlay: any = new g.maps.OverlayView();
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

  // Long-press to trigger onLongPress (touch + mouse)
  useEffect(() => {
    const map = mapRef.current;
    const g = window.google;
    if (!map || !g) return;
    longPressListeners.current.forEach((l) => l.remove());
    longPressListeners.current = [];
    if (!onLongPress) return;

    let startLatLng: any = null;
    const clearTimer = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };
    const down = map.addListener("mousedown", (e: any) => {
      if (!e.latLng) return;
      startLatLng = e.latLng;
      clearTimer();
      longPressTimer.current = setTimeout(() => {
        onLongPress({ lat: startLatLng.lat(), lng: startLatLng.lng() });
        // Haptic-ish feedback
        if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(12);
      }, 480);
    });
    const up = map.addListener("mouseup", clearTimer);
    const drag = map.addListener("dragstart", clearTimer);
    longPressListeners.current = [down, up, drag];
    return () => {
      clearTimer();
      longPressListeners.current.forEach((l) => l.remove());
      longPressListeners.current = [];
    };
  }, [onLongPress]);

  // Heading changes -> notify parent (for compass button)
  useEffect(() => {
    const map = mapRef.current;
    const g = window.google;
    if (!map || !g || !onHeadingChange) return;
    headingListenerRef.current?.remove();
    headingListenerRef.current = map.addListener("heading_changed", () => {
      onHeadingChange(map.getHeading() ?? 0);
    });
    return () => {
      headingListenerRef.current?.remove();
      headingListenerRef.current = null;
    };
  }, [onHeadingChange]);

  return <div ref={containerRef} className={className ?? "h-full w-full"} />;
});

