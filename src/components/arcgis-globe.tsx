import { useEffect, useRef, useState } from "react";

// ArcGIS JS API loaded from Esri's CDN. No API key required for the default
// basemaps. Renders a slow-spinning 3D globe as an ambient preview.

const ARCGIS_VERSION = "4.30";
const ARCGIS_CSS = `https://js.arcgis.com/${ARCGIS_VERSION}/esri/themes/light/main.css`;
const ARCGIS_JS = `https://js.arcgis.com/${ARCGIS_VERSION}/`;

let loaderPromise: Promise<any> | null = null;

function loadArcgis(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if ((window as any).require) return Promise.resolve((window as any).require);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${ARCGIS_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = ARCGIS_CSS;
      document.head.appendChild(link);
    }
    const existing = document.querySelector(`script[src="${ARCGIS_JS}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve((window as any).require));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = ARCGIS_JS;
    script.async = true;
    script.onload = () => resolve((window as any).require);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return loaderPromise;
}

export function ArcgisGlobe({
  className,
  basemap = "satellite",
  spin = true,
}: {
  className?: string;
  basemap?: "satellite" | "hybrid" | "topo-vector" | "gray-vector" | "streets-navigation-vector";
  spin?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let spinTimer: ReturnType<typeof setInterval> | undefined;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    loadArcgis()
      .then((require) => {
        if (cancelled || !containerRef.current) return;
        require(
          ["esri/Map", "esri/views/SceneView"],
          (Map: any, SceneView: any) => {
            if (cancelled || !containerRef.current) return;
            const map = new Map({ basemap });
            const view = new SceneView({
              container: containerRef.current,
              map,
              camera: {
                position: { longitude: 20, latitude: 15, z: 22000000 },
                heading: 0,
                tilt: 0,
              },
              environment: {
                background: { type: "color", color: [0, 0, 0, 0] },
                starsEnabled: false,
                atmosphereEnabled: true,
                atmosphere: { quality: "high" },
                lighting: { type: "virtual" },
              },
              ui: { components: [] },
              alphaCompositingEnabled: true,
              // preview-only: no drag/zoom/keyboard so it can't get "stuck"
              navigation: {
                mouseWheelZoomEnabled: false,
                browserTouchPanEnabled: false,
                momentumEnabled: false,
              },
            });
            // block interaction completely for a stable ambient preview
            view.on("drag", (e: any) => e.stopPropagation());
            view.on("mouse-wheel", (e: any) => e.stopPropagation());
            view.on("key-down", (e: any) => e.stopPropagation());

            viewRef.current = view;
            view.when(() => {
              if (cancelled) return;
              setReady(true);
              if (!spin || prefersReduced) return;
              // throttled spin: ~4°/sec at 8fps updates — cheap and smooth
              spinTimer = setInterval(() => {
                if (!viewRef.current || document.hidden) return;
                const cam = viewRef.current.camera.clone();
                cam.position.longitude = ((cam.position.longitude + 0.5) + 540) % 360 - 180;
                viewRef.current.goTo(cam, { animate: false });
              }, 125);
            });
          },
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (spinTimer) clearInterval(spinTimer);
      if (viewRef.current) {
        try {
          viewRef.current.destroy();
        } catch {}
        viewRef.current = null;
      }
    };
  }, [basemap, spin]);


  return (
    <div className={className} style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0, background: "#0b1220" }} />
      {!ready && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background:
              "radial-gradient(60% 60% at 50% 50%, #12233d 0%, #060a14 100%)",
            color: "rgba(255,255,255,0.55)",
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          loading globe…
        </div>
      )}
    </div>
  );
}
