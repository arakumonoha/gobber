# Gobber — Full Source Code

Every source file in the project. Auto-generated files (`routeTree.gen.ts`, Supabase `types.ts`) are omitted.

## package.json
```json
{
  "name": "tanstack_start_ts",
  "private": true,
  "sideEffects": false,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@fontsource/figtree": "^5.2.10",
    "@fontsource/instrument-serif": "^5.2.8",
    "@fontsource/outfit": "^5.2.8",
    "@hookform/resolvers": "^5.2.2",
    "@lovable.dev/cloud-auth-js": "^1.1.2",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-aspect-ratio": "^1.1.8",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-context-menu": "^2.2.16",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-hover-card": "^1.1.15",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-menubar": "^1.1.16",
    "@radix-ui/react-navigation-menu": "^1.2.14",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-toggle-group": "^1.1.11",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@supabase/supabase-js": "^2.110.2",
    "@tailwindcss/vite": "^4.2.1",
    "@tanstack/react-query": "^5.101.1",
    "@tanstack/react-router": "^1.170.16",
    "@tanstack/react-start": "^1.168.26",
    "@tanstack/router-plugin": "^1.168.18",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "embla-carousel-react": "^8.6.0",
    "framer-motion": "^12.42.2",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.575.0",
    "maplibre-gl": "^5.24.0",
    "react": "^19.2.0",
    "react-day-picker": "^9.14.0",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.71.2",
    "react-resizable-panels": "^4.6.5",
    "recharts": "^2.15.4",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tailwindcss": "^4.2.1",
    "tw-animate-css": "^1.3.4",
    "vaul": "^1.1.2",
    "vite-tsconfig-paths": "^6.0.2",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@eslint/js": "^9.32.0",
    "@lovable.dev/vite-tanstack-config": "2.7.6",
    "@types/node": "^22.16.5",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@vitejs/plugin-react": "^5.2.0",
    "eslint": "^9.32.0",
    "eslint-config-prettier": "^10.1.1",
    "eslint-plugin-prettier": "^5.2.6",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "nitro": "3.0.260603-beta",
    "prettier": "^3.7.3",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.56.1",
    "vite": "^8.0.16"
  }
}

```

## vite.config.ts
```ts
// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});

```

## `src/components/arcgis-globe.tsx`

```tsx
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

```

## `src/components/auth/atmospheric-globe.tsx`

```tsx
import { motion } from "framer-motion";

/**
 * Atmospheric globe — environmental lighting suggestion, not an illustration.
 * Only the upper curvature emerges. Continents are barely-perceptible warm patches.
 * No blue, no outlines, no map rendering. Opacity around 5–8%.
 */
export function AtmosphericGlobe() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[58vh] overflow-hidden"
      aria-hidden
    >
      {/* Ambient warm floor light — the "atmosphere" glow */}
      <div
        className="absolute inset-x-0 bottom-0 h-[46vh]"
        style={{
          background:
            "radial-gradient(80% 60% at 50% 100%, rgba(255, 232, 190, 0.55) 0%, rgba(248, 224, 180, 0.18) 45%, transparent 72%)",
        }}
      />

      {/* Barely-there sphere curvature — soft ivory sitting inside the wash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: "-88vh",
          width: "220vw",
          height: "128vh",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 28%, rgba(255,246,228,0.55) 0%, rgba(240,224,192,0.14) 42%, transparent 70%)",
          boxShadow:
            "inset 0 60px 120px rgba(255, 244, 220, 0.35), inset 0 -80px 160px rgba(160, 122, 78, 0.06)",
        }}
      />

      {/* Continent suggestions — extremely low opacity warm smudges. No shapes, no outlines. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[46vh]"
        style={{
          opacity: 0.055,
          mixBlendMode: "multiply",
          backgroundImage:
            "radial-gradient(ellipse 22% 6% at 22% 78%, #6b4a24 0%, transparent 65%)," +
            "radial-gradient(ellipse 18% 5% at 44% 84%, #6b4a24 0%, transparent 65%)," +
            "radial-gradient(ellipse 26% 7% at 68% 80%, #6b4a24 0%, transparent 65%)," +
            "radial-gradient(ellipse 14% 4% at 82% 88%, #6b4a24 0%, transparent 65%)",
        }}
      />

      {/* Horizon line light — the ridge where atmosphere catches the sun */}
      <div
        className="absolute inset-x-0"
        style={{
          bottom: "40vh",
          height: "12vh",
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(255, 240, 210, 0.35) 50%, transparent 100%)",
          filter: "blur(24px)",
        }}
      />
    </div>
  );
}

```

## `src/components/auth/auth-overlay.tsx`

```tsx
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, ArrowRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

const EASE = [0.22, 1, 0.36, 1] as const;

export function openAuth() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("open-auth"));
  }
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.44 2.23-1.17 3.03-.79.87-2.07 1.54-3.13 1.46-.13-1.11.42-2.28 1.13-3.02.79-.83 2.15-1.45 3.17-1.47zM20.5 17.02c-.55 1.26-.82 1.83-1.54 2.95-1 1.55-2.41 3.48-4.16 3.5-1.56.01-1.96-1.01-4.07-1-2.11.01-2.55 1.02-4.11 1.01-1.75-.02-3.09-1.76-4.09-3.3-2.8-4.31-3.09-9.37-1.36-12.06 1.22-1.91 3.15-3.03 4.97-3.03 1.84 0 3 1 4.52 1s2.45-1 4.58-1c1.62 0 3.33.88 4.55 2.4-3.99 2.19-3.34 7.9.71 9.53z" />
    </svg>
  );
}
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function InlineField(props: {
  type: string; placeholder: string; value: string; onChange: (v: string) => void;
  autoFocus?: boolean; onSubmit?: () => void; submitting?: boolean; showSubmit?: boolean; autoComplete?: string;
}) {
  const { type, placeholder, value, onChange, autoFocus, onSubmit, submitting, showSubmit, autoComplete } = props;
  return (
    <motion.div
      className="relative"
      whileFocus={{ scale: 1.01 }}
    >
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        onKeyDown={(e) => { if (e.key === "Enter" && onSubmit) { e.preventDefault(); onSubmit(); } }}
        className="h-[48px] w-full rounded-[12px] px-4 pr-12 text-[15px] tracking-[-0.01em] text-[#0f0d0b] placeholder:text-[#2b1d0f] outline-none transition-all duration-300 focus:bg-white/45 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.35),inset_0_1px_0_rgba(255,255,255,0.85)]"
        style={{
          background: "rgba(255,255,255,0.22)",
          border: "1px solid rgba(255,255,255,0.55)",
          backdropFilter: "blur(18px) saturate(180%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(20,18,16,0.05), 0 4px 12px -8px rgba(60,42,20,0.15)",
        }}
      />
      {showSubmit && (
        <motion.button
          type="button" onClick={onSubmit} disabled={submitting || !value}
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="absolute right-1.5 top-1/2 flex h-[36px] w-[36px] -translate-y-1/2 items-center justify-center rounded-full bg-[#0f0d0b] text-white transition disabled:opacity-30"
          aria-label="Continue"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" strokeWidth={2.4} />}
        </motion.button>
      )}
    </motion.div>
  );
}


function SocialButton({ children, onClick, loading, disabled, label }: {
  children: React.ReactNode; onClick: () => void; loading?: boolean; disabled?: boolean; label: string;
}) {
  return (
    <motion.button
      onClick={onClick} disabled={disabled}
      whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      aria-label={label}
      className="group flex h-[48px] flex-1 items-center justify-center rounded-[12px] transition-colors hover:bg-white/35 disabled:opacity-60"
      style={{
        background: "rgba(255,255,255,0.22)",
        border: "1px solid rgba(255,255,255,0.55)",
        backdropFilter: "blur(18px) saturate(180%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.75), 0 6px 18px -12px rgba(60,42,20,0.25)",
      }}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-[#0f0d0b]" />
      ) : (
        <span className="inline-flex transition-transform duration-500 group-hover:rotate-[12deg] group-hover:scale-110">
          {children}
        </span>
      )}
    </motion.button>
  );
}


function AuthCard({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState<null | "apple" | "google" | "form">(null);

  async function submit() {
    setLoading("form");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name || email.split("@")[0] } },
        });
        if (error) throw error;
        toast.success("Welcome to Gobber");
        navigate({ to: "/discover" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/discover" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally { setLoading(null); }
  }
  async function google() {
    setLoading("google");
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) { toast.error(res.error.message ?? "Google sign-in failed"); setLoading(null); return; }
    if (res.redirected) return;
    navigate({ to: "/discover" });
  }
  async function apple() {
    setLoading("apple");
    const res = await lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin });
    if (res.error) { toast.error(res.error.message ?? "Apple sign-in failed"); setLoading(null); return; }
    if (res.redirected) return;
    navigate({ to: "/discover" });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 10, scale: 0.97, filter: "blur(8px)" }}
      transition={{ duration: 0.45, ease: EASE }}
      className="relative z-10 w-full max-w-[380px] overflow-hidden rounded-[26px]"
      style={{
        background: "linear-gradient(180deg, rgba(255,253,247,0.35) 0%, rgba(255,247,230,0.22) 100%)",
        backdropFilter: "saturate(180%) blur(48px)",
        border: "1px solid rgba(255,255,255,0.55)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.75) inset, 0 40px 90px -30px rgba(60,42,20,0.4), 0 10px 30px -18px rgba(60,42,20,0.18)",
      }}
    >
      <motion.button
        onClick={onClose}
        aria-label="Close"
        whileHover={{ rotate: 90, scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
        className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full text-[#2b1d0f] transition-colors hover:bg-black/5"
      >
        <X className="h-4 w-4" />
      </motion.button>

      <div className="px-7 pt-10 pb-6">
        <div className="space-y-2.5 text-left">
          <AnimatePresence mode="wait" initial={false}>
            {step === "email" ? (
              <motion.div key="email" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.3, ease: EASE }} className="space-y-2.5">
                {mode === "signup" && (
                  <InlineField type="text" placeholder="Name" value={name} onChange={setName} autoComplete="name" />
                )}
                <InlineField type="email" placeholder="Email" value={email} onChange={setEmail} autoFocus autoComplete="email" showSubmit onSubmit={() => email && setStep("password")} />
              </motion.div>
            ) : (
              <motion.div key="password" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.3, ease: EASE }} className="space-y-2">
                <div className="flex items-center justify-between px-1 text-[12.5px] text-[#2b1d0f]">
                  <span className="truncate">{email}</span>
                  <button onClick={() => setStep("email")} className="text-[#2b1d0f] hover:underline">Change</button>
                </div>
                <InlineField type="password" placeholder="Password" value={password} onChange={setPassword} autoFocus autoComplete={mode === "signin" ? "current-password" : "new-password"} showSubmit submitting={loading === "form"} onSubmit={submit} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-[#1a1614]/10" />
          <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[#2b1d0f]">or</span>
          <span className="h-px flex-1 bg-[#1a1614]/10" />
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <SocialButton onClick={apple} loading={loading === "apple"} disabled={!!loading} label="Continue with Apple">
            <AppleIcon className="h-[19px] w-[19px] text-[#0f0d0b]" />
          </SocialButton>
          <SocialButton onClick={google} loading={loading === "google"} disabled={!!loading} label="Continue with Google">
            <GoogleIcon className="h-[19px] w-[19px]" />
          </SocialButton>
        </div>

        <div className="mt-6 text-center text-[13px] text-[#2b1d0f]">
          {mode === "signin" ? (
            <>New here?{" "}<button onClick={() => { setMode("signup"); setStep("email"); }} className="font-medium text-[#2b1d0f] hover:underline">Create an account</button></>
          ) : (
            <>Already have an account?{" "}<button onClick={() => { setMode("signin"); setStep("email"); }} className="font-medium text-[#2b1d0f] hover:underline">Sign in</button></>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function AuthOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-auth", onOpen);
    return () => window.removeEventListener("open-auth", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="auth-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-5"
          style={{
            background: "rgba(30,22,12,0.28)",
            backdropFilter: "blur(22px) saturate(140%)",
          }}
          onClick={() => setOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full flex justify-center">
            <AuthCard onClose={() => setOpen(false)} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

```

## `src/components/auth/avatar-cluster.tsx`

```tsx
import { motion } from "framer-motion";
import { useMemo } from "react";
import owl from "@/assets/avatars/owl.png";
import cap from "@/assets/avatars/cap.png";
import hijab from "@/assets/avatars/hijab.png";
import shark from "@/assets/avatars/shark.png";
import blue from "@/assets/avatars/blue.png";
import poop from "@/assets/avatars/poop.png";
import unicorn from "@/assets/avatars/unicorn.png";
import dog from "@/assets/avatars/dog.png";
import glasses from "@/assets/avatars/glasses.png";
import mustache from "@/assets/avatars/mustache.png";

type Spec = {
  src: string;
  /** center position in 0..1 of container (both axes) */
  cx: number;
  cy: number;
  /** size as fraction of container width */
  size: number;
  rotate: number;
  breathDuration: number;
  breathDelay: number;
  floatAmp: number;
};

// Hand-composed constellation — varying sizes, balanced weight, no clipping.
// All (cx ± size/2, cy ± size/2) stay comfortably inside [0.02, 0.98].
const SPECS: Spec[] = [
  // Anchors — the three largest, forming a loose triangle
  { src: unicorn,  cx: 0.30, cy: 0.42, size: 0.30, rotate: -4, breathDuration: 7.4, breathDelay: 0.1, floatAmp: 5 },
  { src: mustache, cx: 0.70, cy: 0.32, size: 0.28, rotate:  3, breathDuration: 6.8, breathDelay: 0.6, floatAmp: 4 },
  { src: dog,      cx: 0.62, cy: 0.72, size: 0.26, rotate: -2, breathDuration: 7.0, breathDelay: 0.3, floatAmp: 4 },

  // Mid-size supporting cast
  { src: hijab,    cx: 0.20, cy: 0.14, size: 0.20, rotate: -6, breathDuration: 6.2, breathDelay: 0.9, floatAmp: 3 },
  { src: glasses,  cx: 0.86, cy: 0.62, size: 0.20, rotate:  6, breathDuration: 6.4, breathDelay: 0.4, floatAmp: 3 },
  { src: blue,     cx: 0.14, cy: 0.72, size: 0.22, rotate: -3, breathDuration: 6.6, breathDelay: 1.1, floatAmp: 4 },

  // Small accents — negative-space fillers
  { src: owl,      cx: 0.48, cy: 0.10, size: 0.15, rotate: -8, breathDuration: 5.6, breathDelay: 0.2, floatAmp: 3 },
  { src: shark,    cx: 0.88, cy: 0.14, size: 0.16, rotate:  8, breathDuration: 5.8, breathDelay: 0.7, floatAmp: 3 },
  { src: cap,      cx: 0.42, cy: 0.88, size: 0.16, rotate:  4, breathDuration: 5.9, breathDelay: 1.3, floatAmp: 3 },
  { src: poop,     cx: 0.06, cy: 0.40, size: 0.14, rotate: -5, breathDuration: 5.5, breathDelay: 0.5, floatAmp: 2 },
];

function AvatarItem({ spec, box }: { spec: Spec; box: number }) {
  const size = spec.size * box;
  const left = spec.cx * box - size / 2;
  const top = spec.cy * box - size / 2;

  // Larger avatars sit forward
  const z = Math.round(spec.size * 100);
  const shadowStrength = 0.14 + spec.size * 0.35;

  return (
    <motion.div
      className="absolute"
      style={{ left, top, width: size, height: size, zIndex: z, transformOrigin: "50% 60%" }}
      initial={{ opacity: 0, y: 14, scale: 0.82 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.9,
        delay: 0.2 + spec.breathDelay * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.div
        className="h-full w-full"
        animate={{
          y: [0, -spec.floatAmp, 0, spec.floatAmp * 0.4, 0],
          rotate: [spec.rotate, spec.rotate + 1.4, spec.rotate - 0.6, spec.rotate],
          scale: [1, 1.015, 1, 0.995, 1],
        }}
        transition={{
          duration: spec.breathDuration,
          delay: spec.breathDelay,
          repeat: Infinity,
          ease: [0.45, 0, 0.55, 1],
        }}
      >
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-[50%]"
          style={{
            bottom: -size * 0.05,
            width: size * 0.7,
            height: size * 0.11,
            background: `radial-gradient(ellipse at center, rgba(78, 52, 22, ${shadowStrength}) 0%, transparent 70%)`,
            filter: "blur(6px)",
          }}
        />
        <img
          src={spec.src}
          alt=""
          draggable={false}
          className="relative h-full w-full select-none object-contain"
          style={{
            filter: `drop-shadow(0 ${8 + spec.size * 20}px ${14 + spec.size * 30}px rgba(78, 52, 22, ${0.16 + spec.size * 0.3}))`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

/**
 * Constellation of independently-animated avatars — varying sizes,
 * generous negative space, no clipping, no center placeholder.
 */
export function AvatarCluster({ sizePx = 360 }: { sizePx?: number }) {
  const specs = useMemo(() => SPECS, []);
  return (
    <div
      className="relative mx-auto"
      style={{ width: sizePx, height: sizePx }}
      aria-hidden
    >
      {/* Ambient scene light behind the group */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 55% at 50% 50%, rgba(255, 236, 200, 0.5) 0%, transparent 72%)",
          filter: "blur(10px)",
        }}
      />
      {specs.map((s, i) => (
        <AvatarItem key={i} spec={s} box={sizePx} />
      ))}
    </div>
  );
}

```

## `src/components/auth/memoji-orbit.tsx`

```tsx
import { motion } from "framer-motion";
import m1 from "@/assets/people-v2/m1.png.asset.json";
import m2 from "@/assets/people-v2/m2.png.asset.json";
import m3 from "@/assets/people-v2/m3.png.asset.json";
import m4 from "@/assets/people-v2/m4.png.asset.json";
import m5 from "@/assets/people-v2/m5.png.asset.json";
import m6 from "@/assets/people-v2/m6.png.asset.json";
import m7 from "@/assets/people-v2/m7.png.asset.json";
import m8 from "@/assets/people-v2/m8.png.asset.json";

/**
 * Tight symmetric memoji bundle — Apple keynote style group photo.
 * Back row: 3 faces. Front row: 4 faces overlapping. One anchor face front-center.
 * Composition is mirrored across the vertical axis for visual balance.
 * Each face breathes independently.
 */

const EASE = [0.45, 0, 0.55, 1] as const;

// Coordinates in a 460x360 stage. Tight bundle — heads overlap into one mass.
// Mirror-symmetric around x=230.
type M = { src: { url: string }; x: number; y: number; size: number; z: number; rot: number; delay: number };
const BUNDLE: M[] = [
  // Back row (raised, slightly smaller, peeking behind)
  { src: m2, x: 168, y: 82,  size: 132, z: 1, rot: -7, delay: 0.0 },
  { src: m3, x: 230, y: 66,  size: 144, z: 2, rot: 0,  delay: 0.6 },
  { src: m4, x: 292, y: 82,  size: 132, z: 1, rot: 7,  delay: 1.1 },
  // Middle wings
  { src: m5, x: 120, y: 176, size: 138, z: 3, rot: -12, delay: 0.4 },
  { src: m8, x: 340, y: 176, size: 138, z: 3, rot: 12,  delay: 1.0 },
  // Front row — big anchors, tightly touching
  { src: m6, x: 190, y: 206, size: 152, z: 5, rot: -4,  delay: 0.8 },
  { src: m1, x: 275, y: 224, size: 128, z: 6, rot: 2,   delay: 0.5 },
  { src: m7, x: 305, y: 196, size: 138, z: 4, rot: 6,   delay: 0.2 },
];



export function MemojiOrbit() {
  return (
    <div
      className="relative mx-auto"
      style={{ width: "min(360px, 100%)", aspectRatio: "460 / 260" }}
      aria-hidden
    >
      {/* Warm ground shadow beneath the group */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: "6%",
          width: "72%",
          height: "10%",
          background:
            "radial-gradient(ellipse at center, rgba(90,60,25,0.28) 0%, rgba(90,60,25,0) 70%)",
          filter: "blur(10px)",
        }}
      />

      {BUNDLE.map((m, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${(m.x / 460) * 100}%`,
            top: `${(m.y / 300) * 100}%`,
            width: `${(m.size / 460) * 100}%`,
            aspectRatio: "1 / 1",
            transform: "translate(-50%, -50%)",
            zIndex: m.z,
          }}
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.75,
            delay: 0.1 + i * 0.07,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <motion.div
            className="h-full w-full"
            style={{ rotate: m.rot }}
            animate={{
              y: [0, -3.5, 0, 2, 0],
              rotate: [m.rot, m.rot + 1.2, m.rot, m.rot - 1.2, m.rot],
            }}
            transition={{
              duration: 6 + (i % 3) * 0.6,
              repeat: Infinity,
              ease: EASE,
              delay: m.delay,
            }}
          >
            <img
              src={m.src.url}
              alt=""
              draggable={false}
              className="h-full w-full select-none"
              style={{
                objectFit: "contain",
                filter:
                  "drop-shadow(0 10px 18px rgba(60,42,20,0.22)) drop-shadow(0 2px 4px rgba(60,42,20,0.14))",
              }}
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

```

## `src/components/auth/premium-button.tsx`

```tsx
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type Variant = "dark" | "light" | "outline";

export function PremiumButton({
  onClick,
  disabled,
  loading,
  variant = "light",
  icon,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const base =
    "relative inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium tracking-[-0.012em] transition-colors will-change-transform disabled:opacity-70";

  const styles: Record<Variant, React.CSSProperties> = {
    dark: {
      background: "linear-gradient(180deg, #1c1815 0%, #0a0908 100%)",
      color: "#fff",
      boxShadow:
        "0 1px 0 rgba(255,255,255,0.06) inset, 0 12px 30px -16px rgba(20,18,16,0.6), 0 2px 6px rgba(20,18,16,0.12)",
    },
    light: {
      background: "linear-gradient(180deg, #ffffff 0%, #fbf7ee 100%)",
      color: "#141210",
      boxShadow:
        "0 1px 0 rgba(255,255,255,0.9) inset, 0 8px 24px -14px rgba(60,42,20,0.28), 0 1px 2px rgba(60,42,20,0.06)",
    },
    outline: {
      background: "rgba(255,255,255,0.55)",
      color: "#141210",
      boxShadow:
        "inset 0 0 0 1px rgba(20,18,16,0.10), 0 6px 18px -12px rgba(60,42,20,0.18)",
      backdropFilter: "saturate(180%) blur(14px)",
      WebkitBackdropFilter: "saturate(180%) blur(14px)",
    },
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ y: -1.5 }}
      whileTap={{ scale: 0.975, y: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={base}
      style={styles[variant]}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {icon}
          <span>{children}</span>
        </>
      )}
    </motion.button>
  );
}

```

## `src/components/blocked-panel.tsx`

```tsx
import { Link } from "@tanstack/react-router";
import { Loader2, Ban, ShieldOff } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useBlockedByMe, useBlockMutation } from "@/lib/follows";
import { toast } from "sonner";

export function BlockedPanel() {
  const { user } = useUser();
  const { data: blocked = [], isLoading } = useBlockedByMe(user?.id);
  const mut = useBlockMutation(user?.id);

  if (!user) return null;

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-1.5 px-1">
        <Ban className="h-3.5 w-3.5 text-muted-foreground" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Blocked</h2>
        {blocked.length > 0 && <span className="text-[11px] text-muted-foreground">· {blocked.length}</span>}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
      ) : blocked.length === 0 ? (
        <div className="rounded-2xl bg-card p-5 text-center shadow-glass">
          <p className="text-[13px] text-muted-foreground">You haven't blocked anyone.</p>
        </div>
      ) : (
        <ul className="space-y-2 rounded-2xl bg-card p-2 shadow-glass">
          {blocked.map((p) => {
            const initials = (p.display_name || p.username).slice(0, 2).toUpperCase();
            return (
              <li key={p.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-secondary/40">
                <Link to="/u/$username" params={{ username: p.username }} className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cover bg-center text-xs font-semibold text-white"
                    style={{ backgroundImage: p.avatar_url ? `url(${p.avatar_url})` : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))" }}
                  >
                    {!p.avatar_url && initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-ink">@{p.username}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{p.display_name || "Traveler"}</p>
                  </div>
                </Link>
                <button
                  onClick={async () => { await mut.mutateAsync({ targetId: p.id, block: false }); toast.success(`Unblocked @${p.username}`); }}
                  disabled={mut.isPending}
                  className="inline-flex h-8 items-center gap-1 rounded-lg bg-secondary px-3 text-[12px] font-semibold text-ink disabled:opacity-60"
                >
                  <ShieldOff className="h-3.5 w-3.5" /> Unblock
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

```

## `src/components/bottom-nav.tsx`

```tsx
import { Link, useLocation } from "@tanstack/react-router";
import { Compass, Plus, User, Globe2, Ticket } from "lucide-react";
import { motion } from "framer-motion";

type NavItem = { to: "/discover" | "/explore" | "/host" | "/trips" | "/profile"; icon: typeof Compass; label: string; featured?: boolean };
const items: NavItem[] = [
  { to: "/discover", icon: Compass, label: "Discover" },
  { to: "/explore", icon: Globe2, label: "Explore" },
  { to: "/host", icon: Plus, label: "Host", featured: true },
  { to: "/trips", icon: Ticket, label: "Trips" },
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

```

## `src/components/draggable-sheet.tsx`

```tsx
import { motion, useMotionValue, animate, useTransform, PanInfo } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Loader2, ChevronDown } from "lucide-react";

/**
 * Apple Maps-style draggable bottom sheet with snap points and optional pull-to-refresh.
 * Snap points are expressed as "distance from bottom of viewport" in px.
 */
interface Props {
  snapPoints: number[]; // e.g. [140, 380, 720] — peek, mid, full
  initialSnap?: number; // index
  children: ReactNode;
  onRefresh?: () => Promise<unknown> | void;
  className?: string;
  headerClassName?: string;
  onSnapChange?: (index: number) => void;
}

const SPRING = { type: "spring" as const, stiffness: 320, damping: 34, mass: 0.9 };

export function DraggableSheet({
  snapPoints,
  initialSnap = 0,
  children,
  onRefresh,
  className,
  headerClassName,
  onSnapChange,
}: Props) {
  const [vh, setVh] = useState(() => (typeof window !== "undefined" ? window.innerHeight : 800));
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : false,
  );
  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    window.addEventListener("resize", onResize);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("resize", onResize);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  // sheet's "top" y position from viewport top
  const topFor = (idx: number) => vh - snapPoints[idx];
  const y = useMotionValue(topFor(initialSnap));
  const [snapIdx, setSnapIdx] = useState(initialSnap);
  const snapIndex = useRef(initialSnap);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const pullY = useMotionValue(0);
  const pullOpacity = useTransform(pullY, [0, 80], [0, 1]);
  const pullRotate = useTransform(pullY, [0, 120], [0, 360]);

  useEffect(() => {
    animate(y, topFor(snapIndex.current), SPRING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vh]);

  function snapTo(idx: number) {
    const clamped = Math.max(0, Math.min(snapPoints.length - 1, idx));
    snapIndex.current = clamped;
    setSnapIdx(clamped);
    animate(y, topFor(clamped), SPRING);
    onSnapChange?.(clamped);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const currentTop = y.get();
    const velocity = info.velocity.y;
    // pick nearest snap, biased by velocity
    let bestIdx = snapIndex.current;
    let bestDist = Infinity;
    snapPoints.forEach((_p, i) => {
      const dist = Math.abs(topFor(i) - (currentTop + velocity * 0.15));
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    });
    snapTo(bestIdx);
  }

  async function handlePullRefresh() {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setRefreshing(false), 400);
      animate(pullY, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  }

  // Only allow dragging the sheet body from the handle area or when scroll is at top
  const canDragSheet = useRef(true);
  function onContentScroll() {
    if (!scrollRef.current) return;
    canDragSheet.current = scrollRef.current.scrollTop <= 0;
  }

  function toggleDesktop() {
    // Toggle between the smallest (closed/peek) and the largest (open) snap.
    const target = snapIndex.current === snapPoints.length - 1 ? 0 : snapPoints.length - 1;
    snapTo(target);
  }

  const isExpanded = snapIdx === snapPoints.length - 1;

  return (
    <motion.div
      drag={isDesktop ? false : "y"}
      dragConstraints={{ top: topFor(snapPoints.length - 1), bottom: topFor(0) }}
      dragElastic={{ top: 0.02, bottom: 0.08 }}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      style={{ y, height: vh }}
      className={`absolute inset-x-0 top-0 z-20 rounded-t-3xl glass shadow-float ${isDesktop ? "" : "touch-none"} ${className ?? ""}`}
    >
      {/* Handle — drag grip on mobile/tablet, click-to-toggle on desktop */}
      {isDesktop ? (
        <button
          type="button"
          onClick={toggleDesktop}
          aria-label={isExpanded ? "Collapse gatherings" : "Expand gatherings"}
          aria-expanded={isExpanded}
          className={`group flex w-full flex-col items-center pt-2.5 pb-1 select-none ${headerClassName ?? ""}`}
        >
          <motion.div
            className="flex h-6 items-center justify-center rounded-full px-2 text-[#3d3120]/70 transition-colors group-hover:text-[#0f0d0b]"
            whileTap={{ scale: 0.92 }}
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={SPRING}
          >
            <ChevronDown className="h-4 w-4" strokeWidth={2.4} />
          </motion.div>
        </button>
      ) : (
        <div className={`flex flex-col items-center pt-2.5 pb-1 select-none ${headerClassName ?? ""}`}>
          <motion.div
            className="h-1.5 w-10 rounded-full bg-foreground/40"
            whileTap={{ scaleX: 1.4, backgroundColor: "rgba(0,0,0,0.6)" }}
            transition={{ duration: 0.2 }}
          />
        </div>
      )}

      {/* Pull-to-refresh indicator */}
      {onRefresh && (
        <motion.div
          style={{ opacity: pullOpacity }}
          className="pointer-events-none absolute inset-x-0 top-8 flex justify-center"
        >
          <motion.div style={{ rotate: pullRotate }} className="rounded-full bg-white/70 p-1.5 shadow-glass backdrop-blur">
            <Loader2 className={`h-4 w-4 text-clay ${refreshing ? "animate-spin" : ""}`} />
          </motion.div>
        </motion.div>
      )}

      <div
        ref={scrollRef}
        onScroll={onContentScroll}
        onTouchStart={() => {
          if (scrollRef.current) canDragSheet.current = scrollRef.current.scrollTop <= 0;
        }}
        className="h-full overflow-y-auto overscroll-contain pb-40 touch-pan-y"
        onPointerMoveCapture={(e) => {
          // Pull-to-refresh gesture: only when at top and dragging down
          if (!onRefresh) return;
          const el = scrollRef.current;
          if (!el || el.scrollTop > 0) return;
          if (e.movementY > 0) {
            const next = Math.min(140, pullY.get() + e.movementY);
            pullY.set(next);
          }
        }}
        onPointerUpCapture={() => {
          if (!onRefresh) return;
          if (pullY.get() > 70) handlePullRefresh();
          else animate(pullY, 0, { type: "spring", stiffness: 300, damping: 30 });
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

```

## `src/components/friends-panel.tsx`

```tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Search, UserPlus, Loader2, AtSign, X, Users, Sparkles, Check, ChevronRight } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import {
  useFollowCounts,
  useFollowersList,
  useFollowingList,
  useSearchProfiles,
  useFollowMutation,
  useIsFollowing,
  useFollowsMe,
  type ProfileLite,
} from "@/lib/follows";
import { useRankedSuggestions } from "@/lib/notifications";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BlockedPanel } from "@/components/blocked-panel";

export function FriendsPanel() {
  const { user } = useUser();
  const { data: counts } = useFollowCounts(user?.id);
  const { data: suggested = [], isLoading: loadingSuggested } = useRankedSuggestions(user?.id, 8);
  const [openList, setOpenList] = useState<"followers" | "following" | null>(null);
  const [openFind, setOpenFind] = useState(false);

  return (
    <>
      {/* Prominent stats bar — Instagram style */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <StatButton value={counts?.followers ?? 0} label="Followers" onClick={() => setOpenList("followers")} />
        <StatButton value={counts?.following ?? 0} label="Following" onClick={() => setOpenList("following")} />
      </div>

      {/* Find people row */}
      <button
        onClick={() => setOpenFind(true)}
        className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-card p-3.5 text-left shadow-glass transition active:scale-[0.99]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Search className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-ink">Find people</p>
          <p className="text-[12px] text-muted-foreground">Search by @username or name</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Blocked people */}
      <BlockedPanel />


      {/* Suggested for you */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Suggested for you</h2>
          </div>
        </div>
        {loadingSuggested ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : suggested.length === 0 ? (
          <div className="rounded-2xl bg-card p-6 text-center shadow-glass">
            <Users className="mx-auto h-6 w-6 text-muted-foreground/60" />
            <p className="mt-2 text-[13px] font-medium text-ink">No suggestions right now</p>
            <p className="text-[12px] text-muted-foreground">Check back after more travelers join Gobber.</p>
          </div>
        ) : (
          <div className="-mx-5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <div className="flex gap-3 px-5 pb-2">
              {suggested.map((p) => (
                <SuggestionCard key={p.id} profile={p} myId={user?.id} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Followers / Following modal */}
      <FollowListDialog
        open={openList !== null}
        onClose={() => setOpenList(null)}
        initialTab={openList ?? "followers"}
        myId={user?.id}
      />

      {/* Find people modal */}
      <FindPeopleDialog open={openFind} onClose={() => setOpenFind(false)} myId={user?.id} />
    </>
  );
}

function StatButton({ value, label, onClick }: { value: number; label: string; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="rounded-2xl bg-card p-4 text-left shadow-glass transition hover:bg-card/80"
    >
      <p className="text-3xl font-semibold tracking-tight text-ink">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </motion.button>
  );
}

function SuggestionCard({ profile, myId }: { profile: ProfileLite & { mutual_count?: number }; myId: string | undefined }) {
  const { data: isFollowing } = useIsFollowing(myId, profile.id);
  const mut = useFollowMutation(myId);
  const initials = (profile.display_name || profile.username).slice(0, 2).toUpperCase();
  const mutuals = profile.mutual_count ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-[150px] shrink-0 rounded-2xl bg-card p-3 text-center shadow-glass"
    >
      <Link to="/u/$username" params={{ username: profile.username }} className="block">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cover bg-center text-base font-semibold text-white ring-2 ring-white"
          style={{ backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))" }}
        >
          {!profile.avatar_url && initials}
        </div>
        <p className="mt-2 truncate text-[13px] font-semibold text-ink">{profile.display_name || profile.username}</p>
        <p className="truncate text-[11px] text-muted-foreground">@{profile.username}</p>
        {mutuals > 0 ? (
          <p className="mt-0.5 truncate text-[10.5px] font-medium text-primary/80">
            {mutuals} mutual{mutuals === 1 ? "" : "s"}
          </p>
        ) : (
          <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground/70">New on Gobber</p>
        )}
      </Link>
      <FollowButton
        compact
        isFollowing={!!isFollowing}
        loading={mut.isPending}
        onClick={() => mut.mutate({ targetId: profile.id, follow: !isFollowing })}
      />
    </motion.div>
  );
}

/* ---------- Follow button (Instagram-style) ---------- */
function FollowButton({
  isFollowing,
  followsMe,
  loading,
  onClick,
  compact,
}: {
  isFollowing: boolean;
  followsMe?: boolean;
  loading: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const label = isFollowing ? "Following" : followsMe ? "Follow back" : "Follow";
  const base = compact
    ? "mt-2.5 h-8 w-full rounded-lg text-[12px] font-semibold"
    : "h-9 rounded-lg px-4 text-[13px] font-semibold";
  const style = isFollowing
    ? "bg-secondary text-ink hover:bg-secondary/80"
    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm";
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      disabled={loading}
      onClick={onClick}
      className={`${base} ${style} inline-flex items-center justify-center gap-1 transition disabled:opacity-60`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isFollowing ? (
        <><Check className="h-3.5 w-3.5" /> {label}</>
      ) : (
        <><UserPlus className="h-3.5 w-3.5" /> {label}</>
      )}
    </motion.button>
  );
}

/* ---------- Followers/Following dialog ---------- */
function FollowListDialog({
  open,
  onClose,
  initialTab,
  myId,
}: {
  open: boolean;
  onClose: () => void;
  initialTab: "followers" | "following";
  myId: string | undefined;
}) {
  const [tab, setTab] = useState<"followers" | "following">(initialTab);
  const [q, setQ] = useState("");
  const { data: followers = [], isLoading: lf } = useFollowersList(myId);
  const { data: following = [], isLoading: lg } = useFollowingList(myId);

  // Sync tab when reopening from a different stat
  useMemo(() => { if (open) setTab(initialTab); }, [open, initialTab]);

  const source = tab === "followers" ? followers : following;
  const loading = tab === "followers" ? lf : lg;
  const filtered = q.trim().length
    ? source.filter((p) => (p.username + " " + (p.display_name ?? "")).toLowerCase().includes(q.toLowerCase()))
    : source;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-3xl border-0 bg-card p-0 shadow-glass">
        <DialogHeader className="border-b border-black/[0.06] px-5 py-4">
          <DialogTitle className="text-center text-[15px] font-semibold text-ink">
            {tab === "followers" ? `${followers.length} Followers` : `${following.length} Following`}
          </DialogTitle>
        </DialogHeader>

        {/* Tab pills */}
        <div className="relative mx-5 mt-4 flex rounded-full bg-secondary/70 p-1">
          {(["followers", "following"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative flex-1 rounded-full px-3 py-1.5 text-[12px] font-semibold capitalize transition-colors"
            >
              {tab === t && (
                <motion.span
                  layoutId="follow-dialog-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-white shadow-sm ring-1 ring-black/[0.04]"
                />
              )}
              <span className={`relative z-10 ${tab === t ? "text-ink" : "text-muted-foreground"}`}>{t}</span>
            </button>
          ))}
        </div>

        {/* Inline search */}
        <div className="relative mx-5 mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="h-10 rounded-xl bg-secondary/60 pl-9 pr-9 text-[13px]"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-2 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">
              {q ? "No one matches." : tab === "followers" ? "No followers yet — share Gobber with a friend." : "You're not following anyone yet."}
            </p>
          ) : (
            <ul className="space-y-1">
              <AnimatePresence initial={false}>
                {filtered.map((p) => (
                  <FriendRow key={p.id} profile={p} myId={myId} />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Find people dialog ---------- */
function FindPeopleDialog({ open, onClose, myId }: { open: boolean; onClose: () => void; myId: string | undefined }) {
  const [q, setQ] = useState("");
  const { data: results = [], isLoading } = useSearchProfiles(q);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && (onClose(), setQ(""))}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-3xl border-0 bg-card p-0 shadow-glass">
        <DialogHeader className="border-b border-black/[0.06] px-5 py-4">
          <DialogTitle className="text-center text-[15px] font-semibold text-ink">Find people</DialogTitle>
        </DialogHeader>
        <div className="relative mx-5 mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search @username or name"
            className="h-11 rounded-xl bg-secondary/60 pl-9 pr-9"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="max-h-[60vh] min-h-[240px] overflow-y-auto px-2 py-3">
          {q.trim().length < 2 ? (
            <div className="px-6 py-10 text-center">
              <AtSign className="mx-auto h-6 w-6 text-muted-foreground/60" />
              <p className="mt-2 text-[13px] font-medium text-ink">Search for travelers</p>
              <p className="text-[12px] text-muted-foreground">Type at least 2 characters.</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : results.length === 0 ? (
            <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">No one matches "{q}"</p>
          ) : (
            <ul className="space-y-1">
              {results.map((p) => (
                <FriendRow key={p.id} profile={p} myId={myId} />
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Friend row (used in dialogs) ---------- */
function FriendRow({ profile, myId }: { profile: ProfileLite; myId: string | undefined }) {
  const isMe = myId === profile.id;
  const { data: isFollowing } = useIsFollowing(myId, profile.id);
  const { data: followsMe } = useFollowsMe(myId, profile.id);
  const mut = useFollowMutation(myId);
  const initials = (profile.display_name || profile.username).slice(0, 2).toUpperCase();

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-secondary/50"
    >
      <Link to="/u/$username" params={{ username: profile.username }} className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cover bg-center text-sm font-semibold text-white ring-1 ring-black/[0.04]"
          style={{ backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))" }}
        >
          {!profile.avatar_url && initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[14px] font-semibold text-ink">{profile.username}</p>
            {followsMe && !isMe && (
              <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Follows you</span>
            )}
          </div>
          <p className="truncate text-[12px] text-muted-foreground">
            {profile.display_name || "Traveler"}
            {profile.home_city && <span> · {profile.home_city}</span>}
          </p>
        </div>
      </Link>
      {!isMe && (
        <FollowButton
          isFollowing={!!isFollowing}
          followsMe={!!followsMe}
          loading={mut.isPending}
          onClick={() => mut.mutate({ targetId: profile.id, follow: !isFollowing })}
        />
      )}
    </motion.li>
  );
}

```

## `src/components/google-map.tsx`

```tsx
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { CATEGORIES } from "@/lib/categories";

export interface GoogleMapHandle {
  panTo: (lat: number, lng: number, zoom?: number) => void;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  locate: () => Promise<{ lat: number; lng: number } | null>;
  resetHeading: () => void;
  getHeading: () => number;
}

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  category?: string;
  mine?: boolean;
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

// Inject pin CSS once (Apple Maps-style teardrop with glass morphism)
let __gobberPinStylesInjected = false;
function ensurePinStyles() {
  if (typeof document === "undefined" || __gobberPinStylesInjected) return;
  __gobberPinStylesInjected = true;
  const style = document.createElement("style");
  style.setAttribute("data-gobber-pin", "");
  style.textContent = `
    @keyframes gobber-pin-drop {
      0% { transform: translate(-50%, -180%) scale(0.4); opacity: 0; }
      55% { transform: translate(-50%, -96%) scale(1.12); opacity: 1; }
      78% { transform: translate(-50%, -102%) scale(0.96); }
      100% { transform: translate(-50%, -100%) scale(1); opacity: 1; }
    }
    @keyframes gobber-pin-halo {
      0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
      50% { opacity: 0; transform: translate(-50%, -50%) scale(2.4); }
    }
    @keyframes gobber-pin-mine-glow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(255,180,60,0.55), 0 14px 32px -10px rgba(20,14,8,0.5), 0 1px 0 rgba(255,255,255,0.9) inset; }
      50% { box-shadow: 0 0 0 8px rgba(255,180,60,0), 0 14px 32px -10px rgba(20,14,8,0.5), 0 1px 0 rgba(255,255,255,0.9) inset; }
    }
    .gobber-pin {
      position: absolute;
      cursor: pointer;
      transform: translate(-50%, -100%);
      animation: gobber-pin-drop 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
      transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1), filter 260ms ease;
      will-change: transform;
      -webkit-tap-highlight-color: transparent;
    }
    .gobber-pin:hover { transform: translate(-50%, -108%) scale(1.06); filter: brightness(1.05); z-index: 20; }

    /* Teardrop body — apple maps silhouette */
    .gobber-pin-drop {
      position: relative;
      width: 44px;
      height: 54px;
      filter: drop-shadow(0 10px 14px rgba(20,14,8,0.32)) drop-shadow(0 2px 4px rgba(20,14,8,0.28));
    }
    .gobber-pin-drop svg { width: 100%; height: 100%; display: block; }

    /* Inner glass disc sits inside the circular head of the teardrop */
    .gobber-pin-face {
      position: absolute;
      top: 4px; left: 50%;
      width: 36px; height: 36px;
      transform: translateX(-50%);
      border-radius: 9999px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.42);
      backdrop-filter: blur(14px) saturate(180%);
      box-shadow:
        0 1px 0 rgba(255,255,255,0.95) inset,
        0 -1px 0 rgba(0,0,0,0.06) inset,
        0 0 0 1px rgba(255,255,255,0.55);
    }
    .gobber-pin-icon {
      font-size: 18px; line-height: 1;
      filter: drop-shadow(0 1px 1.5px rgba(0,0,0,0.28));
    }

    .gobber-pin-halo {
      position: absolute; left: 50%; top: 22px;
      width: 40px; height: 40px; border-radius: 9999px;
      transform: translate(-50%, -50%);
      pointer-events: none;
      animation: gobber-pin-halo 2.8s ease-out infinite;
      z-index: -1;
    }

    /* Ghost (placement preview) */
    .gobber-pin-ghost { opacity: 0.92; }
    .gobber-pin-ghost .gobber-pin-face { background: rgba(255,255,255,0.55); }

    /* Mine: amber halo + amber ring around glass disc */
    .gobber-pin-mine .gobber-pin-face {
      background: rgba(255,247,232,0.62);
      animation: gobber-pin-mine-glow 2.4s ease-in-out infinite;
    }
    .gobber-pin-mine-badge {
      position: absolute;
      top: -2px; right: -2px;
      width: 14px; height: 14px;
      border-radius: 9999px;
      background: linear-gradient(180deg,#ffb640,#e88a1a);
      box-shadow: 0 0 0 2px #fffaf0, 0 2px 4px rgba(20,14,8,0.35);
    }
  `;
  document.head.appendChild(style);
}

function pinElement(category: string | undefined, opts: { ghost?: boolean; mine?: boolean } = {}) {
  ensurePinStyles();
  const { ghost = false, mine = false } = opts;
  const { icon, tint } = categoryMeta(category);
  const fill = ghost ? "#e85a3c" : mine ? "#f0a020" : tint;
  const el = document.createElement("div");
  el.className = `gobber-pin${ghost ? " gobber-pin-ghost" : ""}${mine ? " gobber-pin-mine" : ""}`;
  el.innerHTML = `
    <span class="gobber-pin-halo" style="background:${fill}55;"></span>
    <div class="gobber-pin-drop">
      <svg viewBox="0 0 44 54" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="g-${Math.random().toString(36).slice(2, 8)}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${fill}" stop-opacity="1"/>
            <stop offset="100%" stop-color="${fill}" stop-opacity="0.82"/>
          </linearGradient>
        </defs>
        <path d="M22 1.5c11.32 0 20.5 8.7 20.5 19.42 0 7.9-5.05 15-11.4 21.3-3.4 3.37-6.9 6.06-8.35 7.14a1.25 1.25 0 0 1-1.5 0c-1.45-1.08-4.95-3.77-8.35-7.14C6.55 35.92 1.5 28.82 1.5 20.92 1.5 10.2 10.68 1.5 22 1.5z"
              fill="${fill}"
              stroke="rgba(255,255,255,0.85)" stroke-width="1.4"/>
      </svg>
      <div class="gobber-pin-face">
        <span class="gobber-pin-icon">${ghost ? "📍" : icon}</span>
      </div>
      ${mine ? '<span class="gobber-pin-mine-badge"></span>' : ""}
    </div>
  `;
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
    flyTo: (lat: number, lng: number, z?: number) => {
      const map = mapRef.current;
      const g = window.google;
      if (!map || !g) return;
      const target = new g.maps.LatLng(lat, lng);
      const currentZoom = map.getZoom?.() ?? 3;
      const finalZoom = typeof z === "number" ? z : Math.max(currentZoom, 11);
      // Ease out: zoom out slightly, pan, then zoom in — feels cinematic
      if (finalZoom > currentZoom + 4) {
        map.setZoom(Math.max(currentZoom - 1, 3));
      }
      map.panTo(target);
      setTimeout(() => {
        map.panTo(target);
        map.setZoom(finalZoom);
      }, 380);
    },
    zoomIn: () => {
      const map = mapRef.current;
      if (!map) return;
      map.setZoom((map.getZoom?.() ?? 3) + 1);
    },
    zoomOut: () => {
      const map = mapRef.current;
      if (!map) return;
      map.setZoom((map.getZoom?.() ?? 3) - 1);
    },
    locate: () =>
      new Promise((resolve) => {
        if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const map = mapRef.current;
            const g = window.google;
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            if (map && g) {
              map.panTo(new g.maps.LatLng(lat, lng));
              map.setZoom(13);
            }
            resolve({ lat, lng });
          },
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 8000 },
        );
      }),
    resetHeading: () => {
      const map = mapRef.current;
      if (!map) return;
      map.setHeading(0);
      map.setTilt(0);
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
        mapTypeId: mapTypeId === "satellite" ? "hybrid" : mapTypeId,
        // Google deprecated 45° raster tilt in Maps JS v3.65; keep flat for
        // less GPU work, no deprecation warning, and no extra tile fetches.
        tilt: 0,
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
    const effective = mapTypeId === "satellite" ? "hybrid" : mapTypeId;
    map.setMapTypeId(effective);
    map.setOptions({
      styles: mapTypeId === "roadmap" ? CLASSY_MAP_STYLES : undefined,
      tilt: 0,
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
          this.div = pinElement(undefined, { ghost: true });
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
          const el = pinElement(pin.category, { mine: pin.mine });
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


```

## `src/components/landing/floating-3d-maps.tsx`

```tsx
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GoogleMap, type GoogleMapHandle } from "@/components/google-map";

type City = { name: string; flag: string; lat: number; lng: number; zoom: number };

const CITIES: City[] = [
  { name: "Tokyo", flag: "🇯🇵", lat: 35.6595, lng: 139.7005, zoom: 14 },
  { name: "Lisbon", flag: "🇵🇹", lat: 38.7069, lng: -9.1355, zoom: 14 },
  { name: "Barcelona", flag: "🇪🇸", lat: 41.4036, lng: 2.1744, zoom: 14 },
  { name: "New York", flag: "🇺🇸", lat: 40.758, lng: -73.9855, zoom: 14 },
  { name: "Marrakech", flag: "🇲🇦", lat: 31.6295, lng: -7.9811, zoom: 14 },
  { name: "Bali", flag: "🇮🇩", lat: -8.5069, lng: 115.2625, zoom: 13 },
  { name: "Reykjavik", flag: "🇮🇸", lat: 64.1466, lng: -21.9426, zoom: 13 },
  { name: "Mexico City", flag: "🇲🇽", lat: 19.4326, lng: -99.1332, zoom: 13 },
  { name: "Cape Town", flag: "🇿🇦", lat: -33.9249, lng: 18.4241, zoom: 13 },
  { name: "Paris", flag: "🇫🇷", lat: 48.8566, lng: 2.3522, zoom: 14 },
];

function MapCard({
  startIndex,
  interval,
  transform,
  width,
  height,
  floatDelay = 0,
}: {
  startIndex: number;
  interval: number;
  transform: string;
  width: number;
  height: number;
  floatDelay?: number;
}) {
  const [i, setI] = useState(startIndex);
  const [fading, setFading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mapRef = useRef<GoogleMapHandle>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const c = CITIES[i];
    mapRef.current?.panTo(c.lat, c.lng, c.zoom);
  }, [i, mounted]);

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setI((prev) => (prev + 3) % CITIES.length);
        setTimeout(() => setFading(false), 900);
      }, 700);
    }, interval);
    return () => clearInterval(t);
  }, [interval]);

  const city = CITIES[i];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: startIndex * 0.15 }}
      style={{
        width,
        height,
        transform,
        transformStyle: "preserve-3d",
        filter: "drop-shadow(0 30px 50px rgba(30,20,10,0.35))",
      }}
    >
      <motion.div
        animate={{ y: [0, -10, 0, 8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: floatDelay }}
        className="relative h-full w-full overflow-hidden rounded-[22px]"
        style={{
          border: "1px solid rgba(255,255,255,0.55)",
          background: "#0f0d0b",
        }}
      >
        <motion.div
          animate={{ opacity: fading ? 0.3 : 1, filter: fading ? "blur(2px)" : "blur(0px)" }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {mounted && (
            <GoogleMap
              ref={mapRef}
              pins={[]}
              mapTypeId="satellite"
              zoom={CITIES[startIndex].zoom}
              center={{ lat: CITIES[startIndex].lat, lng: CITIES[startIndex].lng }}
              className="absolute inset-0"
            />
          )}
        </motion.div>

        {/* Interaction blocker */}
        <div className="absolute inset-0 z-10" />

        {/* Warm color grade + top gloss */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,240,200,0.10) 0%, transparent 30%, rgba(20,10,4,0.55) 100%)",
            mixBlendMode: "multiply",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.18), transparent)",
          }}
        />

        {/* Label */}
        <motion.div
          key={city.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: fading ? 0 : 1, y: fading ? -4 : 0 }}
          transition={{ duration: 0.6 }}
          className="absolute bottom-3 left-3 text-white"
        >
          <div className="flex items-center gap-1.5 text-[9.5px] font-medium uppercase tracking-[0.18em] opacity-80">
            <span>{city.flag}</span>
            <span>live now</span>
          </div>
          <div className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em]">{city.name}</div>
        </motion.div>

        {/* Live ping */}
        <div className="absolute right-3 top-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E8A93C] opacity-90" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E8A93C]" />
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Floating3DMaps() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="pointer-events-auto absolute left-[3%] top-[16%] hidden md:block">
        <MapCard
          startIndex={0}
          interval={6200}
          width={250}
          height={175}
          transform="perspective(1400px) rotateX(22deg) rotateY(-16deg) rotateZ(-5deg)"
        />
      </div>
      <div className="pointer-events-auto absolute right-[3%] top-[10%] hidden md:block">
        <MapCard
          startIndex={2}
          interval={6800}
          width={290}
          height={205}
          floatDelay={1.4}
          transform="perspective(1400px) rotateX(19deg) rotateY(14deg) rotateZ(4deg)"
        />
      </div>
      <div className="pointer-events-auto absolute right-[9%] bottom-[6%] hidden lg:block">
        <MapCard
          startIndex={5}
          interval={7200}
          width={220}
          height={160}
          floatDelay={2.6}
          transform="perspective(1400px) rotateX(24deg) rotateY(-8deg) rotateZ(-2deg)"
        />
      </div>
      <div className="pointer-events-auto absolute left-[7%] bottom-[8%] hidden lg:block">
        <MapCard
          startIndex={7}
          interval={5800}
          width={210}
          height={150}
          floatDelay={0.7}
          transform="perspective(1400px) rotateX(20deg) rotateY(10deg) rotateZ(5deg)"
        />
      </div>
    </div>
  );
}

```

## `src/components/landing/floating-flags.tsx`

```tsx
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// Scattered flag "slots" that continuously cycle through different flags.
// Each slot fades a flag in, floats it upward, then fades it out and swaps
// to the next flag in the pool — creating a soft, endless loop.
type Slot = { top: string; left: string; size: number; delay: number; mobile?: boolean };

// Mirrored left/right pairs for a balanced, symmetric composition.
const SLOTS: Slot[] = [
  // top band
  { top: "12%", left: "7%",  size: 56, delay: 0.0, mobile: true },
  { top: "12%", left: "93%", size: 56, delay: 0.6, mobile: true },
  // upper-mid band
  { top: "30%", left: "3%",  size: 48, delay: 1.2 },
  { top: "30%", left: "97%", size: 48, delay: 1.8 },
  // mid band
  { top: "50%", left: "5%",  size: 52, delay: 0.4 },
  { top: "50%", left: "95%", size: 52, delay: 1.0 },
  // lower-mid band
  { top: "70%", left: "8%",  size: 58, delay: 0.3, mobile: true },
  { top: "70%", left: "92%", size: 58, delay: 0.9, mobile: true },
  // bottom band
  { top: "86%", left: "14%", size: 46, delay: 1.5 },
  { top: "86%", left: "86%", size: 46, delay: 2.1 },
];

const FLAG_POOL = [
  "🇯🇵","🇫🇷","🇮🇹","🇺🇸","🇪🇸","🇬🇧","🇩🇪","🇧🇷","🇦🇺","🇮🇳",
  "🇲🇽","🇰🇷","🇨🇦","🇳🇱","🇵🇹","🇹🇭","🇿🇦","🇦🇷","🇸🇬","🇬🇷",
  "🇹🇷","🇸🇪","🇳🇴","🇮🇩","🇻🇳","🇨🇭","🇦🇪","🇮🇪","🇵🇱","🇨🇱",
];

function twemojiUrl(emoji: string): string {
  const cps: string[] = [];
  for (const ch of emoji) {
    const cp = ch.codePointAt(0);
    if (cp && cp !== 0xfe0f) cps.push(cp.toString(16));
  }
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${cps.join("-")}.svg`;
}

const CYCLE_MS = 8000; // total lifetime of each flag before swapping

function FlagSlot({ slot, index }: { slot: Slot; index: number }) {
  // Deterministic starting offset per slot so flags don't all swap in unison.
  const [step, setStep] = useState(index * 3);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      setStep((s) => s + 1);
      interval = setInterval(() => setStep((s) => s + 1), CYCLE_MS);
    }, slot.delay * 1000);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [slot.delay]);

  const flag = FLAG_POOL[step % FLAG_POOL.length];

  return (
    <div
      className={`absolute select-none ${slot.mobile ? "" : "hidden sm:block"}`}
      style={{
        top: slot.top,
        left: slot.left,
        width: `clamp(${Math.round(slot.size * 0.55)}px, ${slot.size / 14}vw, ${slot.size}px)`,
        lineHeight: 1,
        filter: "drop-shadow(0 12px 24px rgba(60,42,20,0.22))",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={flag + step}
          src={twemojiUrl(flag)}
          alt=""
          loading="lazy"
          draggable={false}
          className="block h-auto w-full"
          initial={{ opacity: 0, y: 24, scale: 0.75 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [24, 0, -18, -48],
            scale: [0.75, 1, 1, 0.9],
          }}
          exit={{ opacity: 0, y: -60, scale: 0.85 }}
          transition={{
            duration: CYCLE_MS / 1000,
            times: [0, 0.12, 0.85, 1],
            ease: "easeInOut",
          }}
        />
      </AnimatePresence>
    </div>
  );
}

export function FloatingFlags() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {SLOTS.map((s, i) => (
        <FlagSlot key={i} slot={s} index={i} />
      ))}
    </div>
  );
}

```

## `src/components/landing/live-signals.tsx`

```tsx
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LandingStats } from "@/lib/landing-stats.functions";

export function twemojiUrl(emoji: string): string {
  const cps: string[] = [];
  for (const ch of emoji) {
    const cp = ch.codePointAt(0);
    if (cp && cp !== 0xfe0f) cps.push(cp.toString(16));
  }
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${cps.join("-")}.svg`;
}

const CATEGORY_ICON: Record<string, string> = {
  Dinner: "🍜",
  Adventure: "🏞️",
  Coffee: "☕",
  Nightlife: "🌙",
  Workout: "🏃",
  Culture: "🎨",
  Music: "🎧",
};

function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function JoinsTicker({ joins }: { joins: LandingStats["joins"] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!joins.length) return;
    const t = setInterval(() => setI((v) => (v + 1) % joins.length), 4200);
    return () => clearInterval(t);
  }, [joins.length]);

  if (!joins.length) {
    return (
      <div
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] text-[#5a4a35]"
        style={{
          background: "color-mix(in oklab, white 78%, transparent)",
          border: "1px solid rgba(20,18,16,0.06)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#7DA88E]" />
        waiting for the first table to fill…
      </div>
    );
  }

  const j = joins[i];
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] text-[#1A1614]"
      style={{
        background: "color-mix(in oklab, white 82%, transparent)",
        border: "1px solid rgba(20,18,16,0.06)",
        backdropFilter: "blur(12px)",
      }}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E8A93C] opacity-80" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#E8A93C]" />
      </span>
      <span className="shrink-0">{CATEGORY_ICON[j.category] ?? "✨"}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={`${j.when}-${i}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          className="whitespace-nowrap"
        >
          <span className="font-semibold">{j.name}</span> joined{" "}
          <span className="italic text-[#0057D1]">{j.title}</span> · {j.city}
          <span className="ml-2 text-[#8b7355]">{timeAgo(j.when)}</span>
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function TrendingStrip({
  trending,
  fallbackFlags,
}: {
  trending: LandingStats["trending"];
  fallbackFlags: Record<string, string>;
}) {
  if (trending.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8b6f3f]">
        trending 24h
      </span>
      {trending.slice(0, 8).map((t, idx) => {
        const flag = fallbackFlags[t.country] ?? "🌍";
        const themes = [
          { bg: "linear-gradient(150deg, #E0F0FF 0%, #FFFFFF 100%)", ring: "#0A84FF", badge: "#0A84FF", fg: "#FFFFFF" },
          { bg: "linear-gradient(150deg, #FBF0D6 0%, #FFFFFF 100%)", ring: "#B4801F", badge: "#E8A93C", fg: "#1A1614" },
          { bg: "linear-gradient(150deg, #EAF2E6 0%, #FFFFFF 100%)", ring: "#7DA88E", badge: "#7DA88E", fg: "#FFFFFF" },
        ];
        const th = themes[idx % themes.length];
        return (
          <motion.div
            key={t.city}
            whileHover={{ y: -4, scale: 1.1, rotate: -3 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-[22px] leading-none"
            style={{
              background: th.bg,
              border: `1px solid color-mix(in oklab, ${th.ring} 25%, transparent)`,
              boxShadow: `0 10px 22px -12px ${th.ring}66`,
            }}
            role="img"
            aria-label={`${t.city} — ${t.count} trending`}
            title={`${t.city} · ${t.count} live`}
          >
            <img src={twemojiUrl(flag)} alt="" className="h-6 w-6" draggable={false} />
            <span
              className="absolute -bottom-1 -right-1 min-w-[18px] rounded-full px-1 text-center text-[10px] font-bold leading-[16px]"
              style={{ background: th.badge, color: th.fg, boxShadow: `0 2px 6px ${th.ring}55`, border: "1.5px solid #fff" }}
            >
              {t.count}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}


```

## `src/components/map-type-toggle.tsx`

```tsx
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

```

## `src/components/message-bell.tsx`

```tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, MapPin, Users, ChevronLeft, MoreHorizontal, LogOut, UserMinus, Search, X, Paperclip, SquarePen } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { useUser } from "@/hooks/use-user";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  useConversations,
  useUnreadMessagesTotal,
  useMessages,
  useSendMessage,
  useMessagesRealtime,
  useMarkConvRead,
  useLeaveConv,
  useRemoveMember,
  useStartDM,
  useMutualFollowers,
  type ConversationSummary,
  type MemberRow,
} from "@/lib/messages";
import { toast } from "sonner";

export function MessageBell() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  useMessagesRealtime(user?.id, activeId ?? undefined);
  const unread = useUnreadMessagesTotal(user?.id);

  if (!user) return null;

  return (
    <>
      <button
        aria-label={`Messages${unread ? `, ${unread} unread` : ""}`}
        onClick={() => setOpen(true)}
        className="fixed right-[68px] top-[calc(env(safe-area-inset-top,0px)+12px)] z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/55 shadow-glass backdrop-blur-2xl transition active:scale-95"
        style={{ WebkitBackdropFilter: "blur(24px) saturate(1.4)" }}
      >
        <MessageCircle className="h-[18px] w-[18px] text-ink" strokeWidth={2.2} />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="dot"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-md ring-2 ring-white"
            >
              {unread > 99 ? "99+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <Sheet
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setActiveId(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full max-w-md border-l border-white/40 bg-white/80 p-0 backdrop-blur-2xl sm:max-w-md"
          style={{ WebkitBackdropFilter: "blur(28px) saturate(1.5)" }}
        >
          {activeId ? (
            <ChatView convId={activeId} onBack={() => setActiveId(null)} />
          ) : (
            <InboxView onOpen={(id) => setActiveId(id)} />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

// ============ INBOX ============
function InboxView({ onOpen }: { onOpen: (id: string) => void }) {
  const { user } = useUser();
  const { data: convs = [], isLoading } = useConversations(user?.id);
  const [tab, setTab] = useState<"dm" | "location">("dm");
  const [composeOpen, setComposeOpen] = useState(false);

  const filtered = convs.filter((c) => c.type === tab);

  return (
    <div className="flex h-full flex-col">
      {/* Centered header with symmetric side actions (New on left, native close on right) */}
      <div className="relative flex items-center justify-center border-b border-black/5 px-14 py-4">
        <button
          onClick={() => setComposeOpen(true)}
          aria-label="New message"
          className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/[0.06] text-ink transition hover:bg-black/[0.09] active:scale-95"
        >
          <SquarePen className="h-4 w-4" strokeWidth={2.2} />
        </button>
        <div className="text-center">
          <h2 className="text-[17px] font-semibold tracking-tight text-ink">Messages</h2>
          <p className="text-[11.5px] text-muted-foreground">Friends & gatherings</p>
        </div>
      </div>

      {/* Tabs — equal columns, centered */}
      <div className="mx-4 mt-3 grid grid-cols-2 gap-1 rounded-full bg-black/[0.05] p-1">
        {(["dm", "location"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative flex h-8 items-center justify-center gap-1.5 rounded-full text-[12.5px] font-semibold transition ${
              tab === t ? "bg-white text-ink shadow-sm" : "text-muted-foreground hover:text-ink"
            }`}
          >
            {t === "dm" ? <MessageCircle className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
            {t === "dm" ? "Direct" : "Gatherings"}
          </button>
        ))}
      </div>


      <div className="mt-2 flex-1 overflow-y-auto px-2 py-2">
        {isLoading ? (
          <div className="p-6 text-center text-[13px] text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-black/5">
              {tab === "dm" ? <MessageCircle className="h-6 w-6 text-muted-foreground" /> : <MapPin className="h-6 w-6 text-muted-foreground" />}
            </div>
            <p className="text-[14px] font-semibold text-ink">
              {tab === "dm" ? "No conversations yet" : "No gathering chats"}
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {tab === "dm"
                ? "Message a mutual friend to start a chat."
                : "Join or host a gathering — a chat auto-opens for everyone going."}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {filtered.map((c) => (
              <ConvItem key={c.id} c={c} onOpen={() => onOpen(c.id)} />
            ))}
          </ul>
        )}
      </div>

      <ComposeDialog open={composeOpen} onOpenChange={setComposeOpen} onOpenConv={(id) => { setComposeOpen(false); onOpen(id); }} />
    </div>
  );
}

function ConvItem({ c, onOpen }: { c: ConversationSummary; onOpen: () => void }) {
  const { user } = useUser();
  const other = c.type === "dm" ? c.members.find((m) => m.user_id !== user?.id) : null;
  const title =
    c.type === "location"
      ? c.title || "Gathering"
      : other?.profile?.display_name || (other?.profile?.username ? `@${other.profile.username}` : "Direct message");
  const avatarUrl = c.type === "dm" ? other?.profile?.avatar_url : null;
  const initials = (title || "?").slice(0, 2).toUpperCase();

  return (
    <li>
      <button
        onClick={onOpen}
        className="group flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-black/[0.04]"
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cover bg-center text-[13px] font-semibold text-white ring-2 ring-white"
          style={{
            backgroundImage: avatarUrl
              ? `url(${avatarUrl})`
              : c.type === "location"
                ? "linear-gradient(135deg, oklch(0.75 0.14 55), oklch(0.55 0.12 40))"
                : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))",
          }}
        >
          {!avatarUrl && (c.type === "location" ? <MapPin className="h-5 w-5" /> : initials)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-[14px] font-semibold text-ink">{title}</p>
            <span className="shrink-0 text-[10.5px] text-muted-foreground">
              {formatDistanceToNowStrict(new Date(c.last_message_at), { addSuffix: false })}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <p className="line-clamp-1 flex-1 text-[12.5px] text-muted-foreground">
              {c.last_body || (c.type === "location" ? `${c.members.length} going` : "Say hi 👋")}
            </p>
            {c.unread > 0 && (
              <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                {c.unread}
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}

// ============ CHAT VIEW ============
function ChatView({ convId, onBack }: { convId: string; onBack: () => void }) {
  const { user } = useUser();
  const { data: convs = [] } = useConversations(user?.id);
  const conv = convs.find((c) => c.id === convId);
  const { data: msgs = [] } = useMessages(convId);
  const send = useSendMessage(convId);
  const markRead = useMarkConvRead(convId, user?.id);
  const leave = useLeaveConv();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convId, msgs.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [msgs.length]);

  useEffect(() => {
    if (!file) {
      setFilePreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!conv) return <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>;

  const other = conv.type === "dm" ? conv.members.find((m) => m.user_id !== user?.id) : null;
  const title =
    conv.type === "location"
      ? conv.title || "Gathering"
      : other?.profile?.display_name || (other?.profile?.username ? `@${other.profile.username}` : "Direct");
  const subtitle =
    conv.type === "location"
      ? `${conv.members.length} going${conv.expires_at ? ` · closes ${formatDistanceToNowStrict(new Date(conv.expires_at), { addSuffix: true })}` : ""}`
      : other?.profile?.username
        ? `@${other.profile.username}`
        : "";

  function pickFile(f: File | null) {
    if (!f) return;
    const MAX = 25 * 1024 * 1024;
    if (f.size > MAX) {
      toast.error("File too large (max 25MB)");
      return;
    }
    if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) {
      toast.error("Only images and videos");
      return;
    }
    setFile(f);
  }

  async function handleSend() {
    const body = text.trim();
    const f = file;
    if (!body && !f) return;
    setText("");
    setFile(null);
    try {
      await send.mutateAsync({ body, file: f });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send");
      setText(body);
      setFile(f);
    }
  }


  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-black/5 px-3 py-3">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5">
          <ChevronLeft className="h-5 w-5 text-ink" />
        </button>
        <button
          onClick={() => setMembersOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2 py-1 text-left hover:bg-black/[0.03]"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cover bg-center text-white"
            style={{
              backgroundImage: other?.profile?.avatar_url
                ? `url(${other.profile.avatar_url})`
                : conv.type === "location"
                  ? "linear-gradient(135deg, oklch(0.75 0.14 55), oklch(0.55 0.12 40))"
                  : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))",
            }}
          >
            {conv.type === "location" && <MapPin className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[14.5px] font-semibold text-ink">{title}</p>
            {subtitle && <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
        </button>
        <button onClick={() => setMembersOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5">
          <Users className="h-4.5 w-4.5 text-ink" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3">
        {msgs.length === 0 ? (
          <div className="mt-10 text-center text-[13px] text-muted-foreground">
            {conv.type === "location" ? "Say hi to your fellow travellers." : "Say something nice."}
          </div>
        ) : (
          <ul className="flex flex-col gap-0.5 px-1">
            {msgs.map((m, i) => {
              const mine = m.sender_id === user?.id;
              const prev = msgs[i - 1];
              const next = msgs[i + 1];
              const sameAsPrev = prev?.sender_id === m.sender_id;
              const sameAsNext = next?.sender_id === m.sender_id;
              const t = new Date(m.created_at);
              const prevT = prev ? new Date(prev.created_at) : null;
              // Show a centered timestamp separator on the first message or when >15 min gap
              const showTimestamp = !prev || (prevT && t.getTime() - prevT.getTime() > 15 * 60 * 1000);
              const groupBreak = showTimestamp || !sameAsPrev;
              const showName = conv.type === "location" && !mine && groupBreak;
              const sender = conv.members.find((mm) => mm.user_id === m.sender_id);
              const groupedWithNext = sameAsNext && next && new Date(next.created_at).getTime() - t.getTime() <= 15 * 60 * 1000;
              const tailTight = groupedWithNext;
              const bubbleRadius = mine
                ? `rounded-[22px] ${tailTight ? "rounded-br-md" : ""}`
                : `rounded-[22px] ${tailTight ? "rounded-bl-md" : ""}`;
              const now = new Date();
              const sameDay = t.toDateString() === now.toDateString();
              const timeLabel = sameDay
                ? t.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
                : t.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
              return (
                <div key={m.id}>
                  {showTimestamp && (
                    <div className="my-3 flex items-center justify-center">
                      <span className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground/80">
                        {timeLabel}
                      </span>
                    </div>
                  )}
                  <li
                    className={`flex ${mine ? "justify-end" : "justify-start"} ${
                      groupBreak ? "mt-1.5" : "mt-0"
                    }`}
                  >
                    <div className={`flex max-w-[75%] flex-col ${mine ? "items-end" : "items-start"}`}>
                      {showName && (
                        <p className="mb-1 pl-3 text-[10.5px] font-medium text-muted-foreground">
                          {sender?.profile?.display_name || sender?.profile?.username || "Member"}
                        </p>
                      )}
                      {m.media_url && m.signed_url && (
                        <div
                          className="mb-1 overflow-hidden rounded-[22px]"
                          style={{ maxWidth: 260 }}
                        >
                          {m.media_type === "video" ? (
                            <video
                              src={m.signed_url}
                              controls
                              playsInline
                              className="block max-h-80 w-full bg-black object-contain"
                            />
                          ) : (
                            <a href={m.signed_url} target="_blank" rel="noreferrer">
                              <img
                                src={m.signed_url}
                                alt="attachment"
                                className="block max-h-80 w-full object-cover"
                                loading="lazy"
                              />
                            </a>
                          )}
                        </div>
                      )}
                      {m.body && (
                        <div
                          title={t.toLocaleString()}
                          className={`whitespace-pre-wrap break-words px-3.5 py-2 text-[14.5px] leading-[1.35] ${bubbleRadius} ${
                            mine
                              ? "bg-primary text-white shadow-[0_1px_1px_rgba(0,0,0,0.06)]"
                              : "bg-black/[0.06] text-ink"
                          }`}
                        >
                          {m.body}
                        </div>
                      )}
                    </div>
                  </li>
                </div>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-black/5 bg-white/50 p-3 backdrop-blur-xl">
        <AnimatePresence>
          {file && filePreview && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mb-2 flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 p-2 shadow-sm"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-black/5">
                {file.type.startsWith("video/") ? (
                  <video src={filePreview} className="h-full w-full object-cover" muted playsInline />
                ) : (
                  <img src={filePreview} alt="preview" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium text-ink">{file.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {file.type.startsWith("video/") ? "Video" : "Photo"} · {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
                aria-label="Remove attachment"
              >
                <X className="h-4 w-4 text-ink" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-end gap-2 rounded-full border border-black/10 bg-white px-2 py-1.5 shadow-sm">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              pickFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={send.isPending}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/70 transition hover:bg-black/5 active:scale-95 disabled:opacity-40"
            aria-label="Attach photo or video"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder={file ? "Add a caption…" : "Message"}
            className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-[14px] outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={handleSend}
            disabled={(!text.trim() && !file) || send.isPending}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition active:scale-95 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>


      <MembersSheet
        open={membersOpen}
        onOpenChange={setMembersOpen}
        conv={conv}
        onLeave={async () => {
          if (!user) return;
          await leave.mutateAsync({ conversationId: conv.id, userId: user.id });
          toast.success("Left conversation");
          setMembersOpen(false);
          onBack();
        }}
      />
    </div>
  );
}

// ============ MEMBERS ============
function MembersSheet({
  open,
  onOpenChange,
  conv,
  onLeave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  conv: ConversationSummary;
  onLeave: () => void;
}) {
  const { user } = useUser();
  const remove = useRemoveMember();
  const iAmOwner = conv.members.some((m) => m.user_id === user?.id && m.role === "owner");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-sm border-l border-white/40 bg-white/85 p-0 backdrop-blur-2xl"
        style={{ WebkitBackdropFilter: "blur(28px) saturate(1.5)" }}
      >
        <div className="border-b border-black/5 px-5 py-4">
          <h3 className="text-[16px] font-semibold text-ink">
            {conv.type === "location" ? "Gathering members" : "Chat details"}
          </h3>
          <p className="text-[11.5px] text-muted-foreground">{conv.members.length} member{conv.members.length === 1 ? "" : "s"}</p>
        </div>
        <div className="max-h-[calc(100dvh-160px)] overflow-y-auto px-2 py-2">
          <ul className="flex flex-col">
            {conv.members.map((m) => (
              <MemberRow2
                key={m.id}
                m={m}
                iAmOwner={iAmOwner}
                isMe={m.user_id === user?.id}
                onRemove={async () => {
                  await remove.mutateAsync({ conversationId: conv.id, userId: m.user_id });
                  toast.success("Removed from chat");
                }}
              />
            ))}
          </ul>
        </div>
        <div className="border-t border-black/5 p-4">
          <button
            onClick={onLeave}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-black/5 py-2.5 text-[13px] font-semibold text-ink transition hover:bg-black/10"
          >
            <LogOut className="h-4 w-4" />
            Leave chat
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MemberRow2({
  m,
  iAmOwner,
  isMe,
  onRemove,
}: {
  m: MemberRow;
  iAmOwner: boolean;
  isMe: boolean;
  onRemove: () => void;
}) {
  const initials = (m.profile?.display_name || m.profile?.username || "?").slice(0, 2).toUpperCase();
  const canRemove = iAmOwner && !isMe && m.role !== "owner";
  return (
    <li className="flex items-center gap-3 rounded-2xl px-3 py-2.5">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cover bg-center text-[12px] font-semibold text-white"
        style={{
          backgroundImage: m.profile?.avatar_url
            ? `url(${m.profile.avatar_url})`
            : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))",
        }}
      >
        {!m.profile?.avatar_url && initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-ink">
          {m.profile?.display_name || m.profile?.username || "User"} {isMe && <span className="text-muted-foreground">(you)</span>}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {m.role === "owner" ? "Host · owner" : m.profile?.username ? `@${m.profile.username}` : "Member"}
        </p>
      </div>
      {canRemove && (
        <button
          onClick={onRemove}
          className="flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-1 text-[11.5px] font-medium text-ink transition hover:bg-red-500/10 hover:text-red-600"
        >
          <UserMinus className="h-3.5 w-3.5" />
          Remove
        </button>
      )}
    </li>
  );
}

// ============ COMPOSE (start DM) ============
function ComposeDialog({
  open,
  onOpenChange,
  onOpenConv,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onOpenConv: (id: string) => void;
}) {
  const { user } = useUser();
  const { data: mutuals = [], isLoading } = useMutualFollowers(user?.id);
  const startDM = useStartDM();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return mutuals;
    return mutuals.filter(
      (p) => (p.username ?? "").toLowerCase().includes(s) || (p.display_name ?? "").toLowerCase().includes(s),
    );
  }, [mutuals, q]);

  async function start(uid: string) {
    try {
      const id = await startDM.mutateAsync(uid);
      onOpenConv(id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start chat");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-sm border-l border-white/40 bg-white/85 p-0 backdrop-blur-2xl"
        style={{ WebkitBackdropFilter: "blur(28px) saturate(1.5)" }}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <div>
            <h3 className="text-[16px] font-semibold text-ink">New message</h3>
            <p className="text-[11.5px] text-muted-foreground">Only mutual friends can be messaged</p>
          </div>
          <button onClick={() => onOpenChange(false)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5">
            <X className="h-4 w-4 text-ink" />
          </button>
        </div>
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 rounded-full bg-black/5 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search friends"
              className="flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="mt-2 max-h-[calc(100dvh-160px)] overflow-y-auto px-2 py-2">
          {isLoading ? (
            <div className="p-6 text-center text-[13px] text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[13.5px] font-semibold text-ink">No mutual friends yet</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Follow someone and once they follow you back, you can message them.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col">
              {filtered.map((p) => {
                const initials = (p.display_name || p.username || "?").slice(0, 2).toUpperCase();
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => start(p.id)}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-black/[0.04]"
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-cover bg-center text-[12px] font-semibold text-white"
                        style={{
                          backgroundImage: p.avatar_url
                            ? `url(${p.avatar_url})`
                            : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))",
                        }}
                      >
                        {!p.avatar_url && initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-semibold text-ink">{p.display_name || p.username || "User"}</p>
                        {p.username && <p className="truncate text-[11px] text-muted-foreground">@{p.username}</p>}
                      </div>
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

```

## `src/components/notification-bell.tsx`

```tsx
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Check, UserPlus, Users, Sparkles, X } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import {
  useNotifications,
  useUnreadCount,
  useMarkAllRead,
  useMarkRead,
  useNotificationsRealtime,
  requestBrowserPushPermission,
  type NotificationRow,
} from "@/lib/notifications";
import { Sheet, SheetContent } from "@/components/ui/sheet";

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString();
}

export function NotificationBell() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const { data: unread = 0 } = useUnreadCount(user?.id);
  useNotificationsRealtime(user?.id);

  if (!user) return null;

  return (
    <>
      <button
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        onClick={() => setOpen(true)}
        className="fixed right-4 top-[calc(env(safe-area-inset-top,0px)+12px)] z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/55 shadow-glass backdrop-blur-2xl transition active:scale-95"
        style={{ WebkitBackdropFilter: "blur(24px) saturate(1.4)" }}
      >
        <Bell className="h-[18px] w-[18px] text-ink" strokeWidth={2.2} />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="dot"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-md ring-2 ring-white"
            >
              {unread > 99 ? "99+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <NotificationSheet open={open} onOpenChange={setOpen} />
    </>
  );
}

function NotificationSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useUser();
  const { data: items = [], isLoading } = useNotifications(user?.id);
  const markAll = useMarkAllRead(user?.id);
  const [pushState, setPushState] = useState<NotificationPermission | "unsupported" | "idle">("idle");

  const enablePush = async () => {
    const r = await requestBrowserPushPermission();
    setPushState(r);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-md border-l border-white/40 bg-white/80 p-0 backdrop-blur-2xl sm:max-w-md"
        style={{ WebkitBackdropFilter: "blur(28px) saturate(1.5)" }}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <div>
            <h2 className="text-[19px] font-semibold tracking-tight text-ink">Notifications</h2>
            <p className="text-[12px] text-muted-foreground">Follows, mutuals & trip nudges</p>
          </div>
          <div className="flex items-center gap-1">
            {items.some((n) => !n.read_at) && (
              <button
                onClick={() => markAll.mutate()}
                className="rounded-full bg-black/5 px-3 py-1.5 text-[12px] font-medium text-ink transition hover:bg-black/10"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Push permission prompt */}
        {typeof window !== "undefined" && "Notification" in window && Notification.permission === "default" && pushState !== "granted" && (
          <div className="mx-4 mt-3 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Bell className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-ink">Get notified instantly</p>
              <p className="text-[11.5px] text-muted-foreground">Allow browser notifications for follows & mutuals.</p>
            </div>
            <button
              onClick={enablePush}
              className="self-center rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground shadow-sm transition active:scale-95"
            >
              Enable
            </button>
          </div>
        )}
        {pushState === "denied" && (
          <div className="mx-4 mt-3 flex items-center gap-2 rounded-2xl bg-black/5 p-3 text-[12px] text-muted-foreground">
            <BellOff className="h-4 w-4" /> Browser notifications blocked. Enable them in your browser settings.
          </div>
        )}

        <div className="max-h-[calc(100dvh-80px)] overflow-y-auto px-2 py-2">
          {isLoading ? (
            <div className="p-6 text-center text-[13px] text-muted-foreground">Loading…</div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-black/5">
                <Sparkles className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-[14px] font-semibold text-ink">You're all caught up</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                New follows, mutuals, and trip suggestions will show up here.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col">
              {items.map((n) => (
                <NotificationItem key={n.id} n={n} onClose={() => onOpenChange(false)} />
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NotificationItem({ n, onClose }: { n: NotificationRow; onClose: () => void }) {
  const { user } = useUser();
  const markRead = useMarkRead(user?.id);
  const isUnread = !n.read_at;

  const actor = n.actor;
  const actorName = actor?.display_name || (actor?.username ? `@${actor.username}` : "Someone");
  const initials = (actor?.display_name || actor?.username || "?").slice(0, 2).toUpperCase();

  const config = (() => {
    switch (n.type) {
      case "follow":
        return { icon: <UserPlus className="h-3 w-3" />, tone: "bg-blue-500", verb: "started following you" };
      case "mutual_follow":
        return { icon: <Users className="h-3 w-3" />, tone: "bg-primary", verb: "is now your friend" };
      case "trip_suggestion":
        return { icon: <Sparkles className="h-3 w-3" />, tone: "bg-amber-500", verb: "suggested a trip" };
      default:
        return { icon: <Check className="h-3 w-3" />, tone: "bg-neutral-500", verb: "sent an update" };
    }
  })();

  const to = actor?.username ? { to: "/u/$username" as const, params: { username: actor.username } } : { to: "/discover" as const };

  return (
    <li>
      <Link
        {...to}
        onClick={() => {
          if (isUnread) markRead.mutate(n.id);
          onClose();
        }}
        className={`group flex items-start gap-3 rounded-2xl px-3 py-3 transition ${isUnread ? "bg-primary/[0.04] hover:bg-primary/[0.07]" : "hover:bg-black/[0.03]"}`}
      >
        <div className="relative shrink-0">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full bg-cover bg-center text-[13px] font-semibold text-white ring-2 ring-white"
            style={{ backgroundImage: actor?.avatar_url ? `url(${actor.avatar_url})` : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))" }}
          >
            {!actor?.avatar_url && initials}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-white ring-2 ring-white ${config.tone}`}>
            {config.icon}
          </span>
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[13.5px] leading-snug text-ink">
            <span className="font-semibold">{actorName}</span>{" "}
            <span className="text-ink/80">{config.verb}</span>
          </p>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">{timeAgo(n.created_at)} ago</p>
        </div>
        {isUnread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
      </Link>
    </li>
  );
}

```

## `src/components/satellite-map.tsx`

```tsx
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
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
  interactive?: boolean;
  variant?: "dot" | "glass";
  cursor?: "default" | "crosshair";
  ghostPin?: { lat: number; lng: number } | null;
  mapStyle?: "satellite" | "classy";
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

// Warm editorial cartography — CARTO Voyager raster tiles on a sand wash.
// Clean, muted, professional; complements the Warm Sand palette.
const CLASSY_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    basemap: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
      maxzoom: 19,
    },
    labels: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    { id: "bg", type: "background", paint: { "background-color": "#f3ead9" } },
    { id: "base", type: "raster", source: "basemap", paint: { "raster-saturation": -0.15, "raster-contrast": 0.02 } },
    { id: "labels", type: "raster", source: "labels", paint: { "raster-opacity": 0.9 } },
  ],
};

function iconFor(category?: string) {
  return CATEGORIES.find((c) => c.id === category)?.icon ?? "📍";
}

export function SatelliteMap({ pins, onPinClick, onMapClick, center = [10, 25], zoom = 1.6, className, interactive = true, variant = "dot", cursor = "default", ghostPin = null, mapStyle = "satellite" }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const ghostRef = useRef<Marker | null>(null);
  const clickHandlerRef = useRef<((e: maplibregl.MapMouseEvent) => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle === "classy" ? CLASSY_STYLE : SATELLITE_STYLE,
      center,
      zoom,
      pitch: mapStyle === "classy" ? 0 : 30,
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
      ghostRef.current?.remove();
      ghostRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cursor + map click binding
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getCanvas().style.cursor = cursor === "crosshair" ? "crosshair" : "";
    if (clickHandlerRef.current) {
      map.off("click", clickHandlerRef.current);
      clickHandlerRef.current = null;
    }
    if (onMapClick) {
      const handler = (e: maplibregl.MapMouseEvent) => {
        onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      };
      clickHandlerRef.current = handler;
      map.on("click", handler);
    }
    return () => {
      if (clickHandlerRef.current && map) {
        map.off("click", clickHandlerRef.current);
        clickHandlerRef.current = null;
      }
    };
  }, [onMapClick, cursor]);

  // Ghost pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    ghostRef.current?.remove();
    ghostRef.current = null;
    if (ghostPin) {
      const el = document.createElement("div");
      el.className = "relative flex items-center justify-center";
      el.innerHTML = `
        <span class="relative flex h-12 w-12 items-center justify-center rounded-full text-xl shadow-[0_10px_30px_rgba(0,0,0,0.45)] ring-2 ring-white/80 backdrop-blur-xl bg-primary/70">
          <span class="absolute inset-0 rounded-full bg-gradient-to-b from-white/60 to-white/5"></span>
          <span class="relative drop-shadow">📍</span>
        </span>
        <span class="absolute inset-0 -z-10 animate-ping rounded-full bg-white/40"></span>
      `;
      ghostRef.current = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([ghostPin.lng, ghostPin.lat])
        .addTo(map);
    }
  }, [ghostPin]);

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

```

## `src/components/ui/accordion.tsx`

```tsx
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-sm font-medium cursor-pointer transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

```

## `src/components/ui/alert-dialog.tsx`

```tsx
import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants(), className)} {...props} />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};

```

## `src/components/ui/alert.tsx`

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

```

## `src/components/ui/aspect-ratio.tsx`

```tsx
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

const AspectRatio = AspectRatioPrimitive.Root;

export { AspectRatio };

```

## `src/components/ui/avatar.tsx`

```tsx
"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };

```

## `src/components/ui/badge.tsx`

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

```

## `src/components/ui/breadcrumb.tsx`

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode;
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<"ol">>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn(
        "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
        className,
      )}
      {...props}
    />
  ),
);
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />
  ),
);
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      ref={ref}
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  ),
);
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({ children, className, ...props }: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:w-3.5 [&>svg]:h-3.5", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};

```

## `src/components/ui/button.tsx`

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

```

## `src/components/ui/calendar.tsx`

```tsx
"use client";

import * as React from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn("bg-popover absolute inset-0 opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
          defaultClassNames.caption_label,
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
          defaultClassNames.weekday,
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
        week_number: cn(
          "text-muted-foreground select-none text-[0.8rem]",
          defaultClassNames.week_number,
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day,
        ),
        range_start: cn("bg-accent rounded-l-md", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today,
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside,
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className={cn("size-4", className)} {...props} />;
          }

          if (orientation === "right") {
            return <ChevronRightIcon className={cn("size-4", className)} {...props} />;
          }

          return <ChevronDownIcon className={cn("size-4", className)} {...props} />;
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-(--cell-size) flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };

```

## `src/components/ui/card.tsx`

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

```

## `src/components/ui/carousel.tsx`

```tsx
import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(({ orientation = "horizontal", opts, setApi, plugins, className, children, ...props }, ref) => {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) {
      return;
    }

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  React.useEffect(() => {
    if (!api || !setApi) {
      return;
    }

    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        ref={ref}
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
});
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel();

    return (
      <div ref={carouselRef} className="overflow-hidden">
        <div
          ref={ref}
          className={cn(
            "flex",
            orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { orientation } = useCarousel();

    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        className={cn(
          "min-w-0 shrink-0 grow-0 basis-full",
          orientation === "horizontal" ? "pl-4" : "pt-4",
          className,
        )}
        {...props}
      />
    );
  },
);
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute  h-8 w-8 rounded-full",
          orientation === "horizontal"
            ? "-left-12 top-1/2 -translate-y-1/2"
            : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        {...props}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>
    );
  },
);
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute h-8 w-8 rounded-full",
          orientation === "horizontal"
            ? "-right-12 top-1/2 -translate-y-1/2"
            : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        disabled={!canScrollNext}
        onClick={scrollNext}
        {...props}
      >
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>
    );
  },
);
CarouselNext.displayName = "CarouselNext";

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};

```

## `src/components/ui/chart.tsx`

```tsx
import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "Chart";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, config]) => config.theme || config.color);

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: "line" | "dot" | "dashed";
      nameKey?: string;
      labelKey?: string;
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label;

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>
        );
      }

      if (!value) {
        return null;
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>;
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className,
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload
            .filter((item) => item.type !== "none")
            .map((item, index) => {
              const key = `${nameKey || item.name || item.dataKey || "value"}`;
              const itemConfig = getPayloadConfigFromPayload(config, item, key);
              const indicatorColor = color || item.payload.fill || item.color;

              return (
                <div
                  key={item.dataKey}
                  className={cn(
                    "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                    indicator === "dot" && "items-center",
                  )}
                >
                  {formatter && item?.value !== undefined && item.name ? (
                    formatter(item.value, item.name, item, index, item.payload)
                  ) : (
                    <>
                      {itemConfig?.icon ? (
                        <itemConfig.icon />
                      ) : (
                        !hideIndicator && (
                          <div
                            className={cn(
                              "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                              {
                                "h-2.5 w-2.5": indicator === "dot",
                                "w-1": indicator === "line",
                                "w-0 border-[1.5px] border-dashed bg-transparent":
                                  indicator === "dashed",
                                "my-0.5": nestLabel && indicator === "dashed",
                              },
                            )}
                            style={
                              {
                                "--color-bg": indicatorColor,
                                "--color-border": indicatorColor,
                              } as React.CSSProperties
                            }
                          />
                        )
                      )}
                      <div
                        className={cn(
                          "flex flex-1 justify-between leading-none",
                          nestLabel ? "items-end" : "items-center",
                        )}
                      >
                        <div className="grid gap-1.5">
                          {nestLabel ? tooltipLabel : null}
                          <span className="text-muted-foreground">
                            {itemConfig?.label || item.name}
                          </span>
                        </div>
                        {item.value && (
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {item.value.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = "ChartTooltip";

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean;
      nameKey?: string;
    }
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground",
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          );
        })}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegend";

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};

```

## `src/components/ui/checkbox.tsx`

```tsx
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("grid place-content-center text-current")}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };

```

## `src/components/ui/collapsible.tsx`

```tsx
"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

```

## `src/components/ui/command.tsx`

```tsx
"use client";

import * as React from "react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className,
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

const CommandDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className,
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className,
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};

```

## `src/components/ui/context-menu.tsx`

```tsx
import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const ContextMenu = ContextMenuPrimitive.Root;

const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

const ContextMenuGroup = ContextMenuPrimitive.Group;

const ContextMenuPortal = ContextMenuPrimitive.Portal;

const ContextMenuSub = ContextMenuPrimitive.Sub;

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </ContextMenuPrimitive.SubTrigger>
));
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;

const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-context-menu-content-transform-origin)",
      className,
    )}
    {...props}
  />
));
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;

const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={cn(
        "z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-context-menu-content-transform-origin)",
        className,
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
));
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
));
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName;

const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className="h-4 w-4 fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
));
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;

const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold text-foreground", inset && "pl-8", className)}
    {...props}
  />
));
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;

const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;

const ContextMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props}
    />
  );
};
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};

```

## `src/components/ui/dialog.tsx`

```tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

```

## `src/components/ui/drawer.tsx`

```tsx
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/lib/utils";

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className,
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)} {...props} />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};

```

## `src/components/ui/dropdown-menu.tsx`

```tsx
"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};

```

## `src/components/ui/form.tsx`

```tsx
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>");
  }

  const fieldState = getFieldState(fieldContext.name, formState);

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId();

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    );
  },
);
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};

```

## `src/components/ui/hover-card.tsx`

```tsx
import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { cn } from "@/lib/utils";

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-hover-card-content-transform-origin)",
      className,
    )}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };

```

## `src/components/ui/input-otp.tsx`

```tsx
import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Minus } from "lucide-react";

import { cn } from "@/lib/utils";

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName,
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
));
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-1 ring-ring",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Minus />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };

```

## `src/components/ui/input.tsx`

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

```

## `src/components/ui/label.tsx`

```tsx
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };

```

## `src/components/ui/menubar.tsx`

```tsx
import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

function MenubarMenu({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu {...props} />;
}

function MenubarGroup({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group {...props} />;
}

function MenubarPortal({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal {...props} />;
}

function MenubarRadioGroup({ ...props }: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup {...props} />;
}

function MenubarSub({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      "flex h-9 items-center space-x-1 rounded-md border bg-background p-1 shadow-sm",
      className,
    )}
    {...props}
  />
));
Menubar.displayName = MenubarPrimitive.Root.displayName;

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-3 py-1 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      className,
    )}
    {...props}
  />
));
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
));
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-menubar-content-transform-origin)",
      className,
    )}
    {...props}
  />
));
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(({ className, align = "start", alignOffset = -4, sideOffset = 8, ...props }, ref) => (
  <MenubarPrimitive.Portal>
    <MenubarPrimitive.Content
      ref={ref}
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-menubar-content-transform-origin)",
        className,
      )}
      {...props}
    />
  </MenubarPrimitive.Portal>
));
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
));
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-4 w-4 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
));
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
    {...props}
  />
));
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

const MenubarShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props}
    />
  );
};
MenubarShortcut.displayname = "MenubarShortcut";

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};

```

## `src/components/ui/navigation-menu.tsx`

```tsx
import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn("group flex flex-1 list-none items-center justify-center space-x-1", className)}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=open]:text-accent-foreground data-[state=open]:bg-accent/50 data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent",
);

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}{" "}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ",
      className,
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
        className,
      )}
      ref={ref}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className,
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};

```

## `src/components/ui/pagination.tsx`

```tsx
import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />
  ),
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn("", className)} {...props} />,
);
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({ className, isActive, size = "icon", ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};

```

## `src/components/ui/popover.tsx`

```tsx
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };

```

## `src/components/ui/progress.tsx`

```tsx
"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

```

## `src/components/ui/radio-group.tsx`

```tsx
import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-3.5 w-3.5 fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };

```

## `src/components/ui/resizable.tsx`

```tsx
import { GripVertical } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({ className, ...props }: React.ComponentProps<typeof Group>) => (
  <Group
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
    {...props}
  />
);

const ResizablePanel = Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean;
}) => (
  <Separator
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </Separator>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

```

## `src/components/ui/scroll-area.tsx`

```tsx
import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };

```

## `src/components/ui/select.tsx`

```tsx
"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};

```

## `src/components/ui/separator.tsx`

```tsx
import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className,
    )}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };

```

## `src/components/ui/sheet.tsx`

```tsx
"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};

```

## `src/components/ui/sidebar.tsx`

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { PanelLeft } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);

    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(defaultOpen);
    const open = openProp ?? _open;
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          _setOpen(openState);
        }

        // This sets the cookie to keep the sidebar state.
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [setOpenProp, open],
    );

    // Helper to toggle the sidebar.
    const toggleSidebar = React.useCallback(() => {
      return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
    }, [isMobile, setOpen, setOpenMobile]);

    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          toggleSidebar();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? "expanded" : "collapsed";

    const contextValue = React.useMemo<SidebarContextProps>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
    );

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
              className,
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    );
  },
);
SidebarProvider.displayName = "SidebarProvider";

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      );
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Sidebar</SheetTitle>
              <SheetDescription>Displays the mobile sidebar.</SheetDescription>
            </SheetHeader>
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <div
        ref={ref}
        className="group peer hidden text-sidebar-foreground md:block"
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
      >
        {/* This is what handles the sidebar gap on desktop */}
        <div
          className={cn(
            "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
            "group-data-[collapsible=offcanvas]:w-0",
            "group-data-[side=right]:rotate-180",
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
              : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
          )}
        />
        <div
          className={cn(
            "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            // Adjust the padding for floating and inset variants.
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
              : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
            className,
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
          >
            {children}
          </div>
        </div>
      </div>
    );
  },
);
Sidebar.displayName = "Sidebar";

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    return (
      <button
        ref={ref}
        data-sidebar="rail"
        aria-label="Toggle Sidebar"
        tabIndex={-1}
        onClick={toggleSidebar}
        title="Toggle Sidebar"
        className={cn(
          "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
          "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
          "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
          "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
          "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
          "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarRail.displayName = "SidebarRail";

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<"main">>(
  ({ className, ...props }, ref) => {
    return (
      <main
        ref={ref}
        className={cn(
          "relative flex w-full flex-1 flex-col bg-background",
          "md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarInset.displayName = "SidebarInset";

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className,
      )}
      {...props}
    />
  );
});
SidebarInput.displayName = "SidebarInput";

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="header"
        className={cn("flex flex-col gap-2 p-2", className)}
        {...props}
      />
    );
  },
);
SidebarHeader.displayName = "SidebarHeader";

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="footer"
        className={cn("flex flex-col gap-2 p-2", className)}
        {...props}
      />
    );
  },
);
SidebarFooter.displayName = "SidebarFooter";

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  );
});
SidebarSeparator.displayName = "SidebarSeparator";

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="content"
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarContent.displayName = "SidebarContent";

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="group"
        className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
        {...props}
      />
    );
  },
);
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className,
      )}
      {...props}
    />
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
});
SidebarGroupAction.displayName = "SidebarGroupAction";

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  ),
);
SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  ),
);
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  ),
);
SidebarMenuItem.displayName = "SidebarMenuItem";

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring cursor-pointer transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const { isMobile, state } = useSidebar();

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    );

    if (!tooltip) {
      return button;
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      };
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={state !== "collapsed" || isMobile}
          {...tooltip}
        />
      </Tooltip>
    );
  },
);
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean;
    showOnHover?: boolean;
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className,
      )}
      {...props}
    />
  );
});
SidebarMenuAction.displayName = "SidebarMenuAction";

const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  ),
);
SidebarMenuBadge.displayName = "SidebarMenuBadge";

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean;
  }
>(({ className, showIcon = false, ...props }, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  );
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";

const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  ),
);
SidebarMenuSub.displayName = "SidebarMenuSub";

const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ ...props }, ref) => <li ref={ref} {...props} />,
);
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean;
    size?: "sm" | "md";
    isActive?: boolean;
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};

```

## `src/components/ui/skeleton.tsx`

```tsx
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-primary/10", className)} {...props} />;
}

export { Skeleton };

```

## `src/components/ui/slider.tsx`

```tsx
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

```

## `src/components/ui/sonner.tsx`

```tsx
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

```

## `src/components/ui/switch.tsx`

```tsx
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };

```

## `src/components/ui/table.tsx`

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
));
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };

```

## `src/components/ui/tabs.tsx`

```tsx
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };

```

## `src/components/ui/textarea.tsx`

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };

```

## `src/components/ui/toggle-group.tsx`

```tsx
"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "default",
});

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex items-center justify-center gap-1", className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };

```

## `src/components/ui/toggle.tsx`

```tsx
import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };

```

## `src/components/ui/tooltip.tsx`

```tsx
"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

```

## `src/components/username-onboarding.tsx`

```tsx
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AtSign, Check, Loader2, Sparkles } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useMyProfile, isProvisionalUsername, checkUsernameAvailable, setMyUsername } from "@/lib/follows";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function UsernameOnboarding() {
  const { user } = useUser();
  const qc = useQueryClient();
  const { data: profile, isLoading } = useMyProfile(user?.id);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "ok" | "bad">("idle");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const needsOnboarding = !isLoading && !!profile && isProvisionalUsername(profile.username);

  useEffect(() => {
    if (needsOnboarding && !value && profile?.display_name) {
      const seed = profile.display_name.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 18);
      if (seed.length >= 3) setValue(seed);
    }
  }, [needsOnboarding, profile?.display_name, value]);

  useEffect(() => {
    if (!value) { setStatus("idle"); setReason(""); return; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) { setStatus("bad"); setReason("3–20 letters, numbers or _"); return; }
    setStatus("checking");
    const t = setTimeout(async () => {
      const res = await checkUsernameAvailable(value, user?.id);
      setStatus(res.ok ? "ok" : "bad");
      setReason(res.reason);
    }, 350);
    return () => clearTimeout(t);
  }, [value, user?.id]);

  async function submit() {
    if (!user || status !== "ok") return;
    setSaving(true);
    try {
      await setMyUsername(user.id, value);
      await qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success(`Welcome, @${value}`);
    } catch (e: any) {
      toast.error(e.message ?? "Could not save username");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {needsOnboarding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-5"
          style={{ background: "rgba(28,20,10,0.42)", backdropFilter: "blur(20px) saturate(160%)", WebkitBackdropFilter: "blur(20px) saturate(160%)" }}
        >
          <motion.div
            initial={{ scale: 0.94, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="w-full max-w-sm rounded-[28px] p-7 ring-1 ring-black/[0.06]"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(253,246,232,0.92) 100%)",
              backdropFilter: "saturate(180%) blur(24px)",
              WebkitBackdropFilter: "saturate(180%) blur(24px)",
              boxShadow: "0 30px 80px -20px rgba(50,34,15,0.35), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8b6f45]">
              <Sparkles className="h-3.5 w-3.5" /> One more step
            </div>
            <h2 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight text-[#1a1614]">Pick a username</h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#6b5842]">Friends will find and follow you with this handle.</p>

            <div className="mt-5">
              <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-3.5 py-3 ring-1 ring-black/[0.06] focus-within:ring-black/20 transition">
                <AtSign className="h-4 w-4 text-[#9a8770]" />
                <input
                  autoFocus
                  value={value}
                  onChange={(e) => setValue(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
                  placeholder="yourhandle"
                  maxLength={20}
                  className="flex-1 bg-transparent text-[15px] font-medium text-[#1a1614] placeholder:text-[#c2ae90] focus:outline-none"
                />
                {status === "checking" && <Loader2 className="h-4 w-4 animate-spin text-[#9a8770]" />}
                {status === "ok" && <Check className="h-4 w-4 text-emerald-600" />}
              </div>
              <p className={`mt-2 min-h-[16px] text-[12px] ${status === "bad" ? "text-red-600" : "text-[#8b7659]"}`}>
                {status === "bad" ? reason : status === "ok" ? "Available" : "3–20 letters, numbers or _"}
              </p>
            </div>

            <Button onClick={submit} disabled={status !== "ok" || saving} className="mt-4 h-12 w-full rounded-2xl bg-[#1a1614] text-white hover:bg-[#2a201a]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim username"}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

```

## `src/hooks/use-mobile.tsx`

```tsx
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

```

## `src/hooks/use-user.ts`

```tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, loading };
}

```

## `src/integrations/lovable/index.ts`

```tsx
// This file is auto-generated by Lovable. Do not modify it.

import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "../supabase/client";
const lovableAuth = createLovableAuth();

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple" | "microsoft" | "lovable", opts?: SignInOptions) => {
      const result = await lovableAuth.signInWithOAuth(provider, {
        redirect_uri: opts?.redirect_uri,
        extraParams: {
          ...opts?.extraParams,
        },
      });

      if (result.redirected) {
        return result;
      }

      if (result.error) {
        return result;
      }

      try {
        await supabase.auth.setSession(result.tokens);
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
      return result;
    },
  },
};

```

## `src/integrations/supabase/auth-attacher.ts`

```tsx
// This file is automatically generated. Do not edit it directly.
import { createMiddleware } from '@tanstack/react-start'
import { supabase } from './client'

// Must be registered as a global `functionMiddleware` in `src/start.ts`; otherwise
// the browser never attaches the bearer token to serverFn RPCs.
export const attachSupabaseAuth = createMiddleware({ type: 'function' }).client(
  async ({ next }) => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  },
)

```

## `src/integrations/supabase/auth-middleware.ts`

```tsx
// This file is automatically generated. Do not edit it directly.
import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'



function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    // New Supabase API keys are opaque strings, not bearer JWTs.
    if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }

    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

export const requireSupabaseAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      const missing = [
        ...(!SUPABASE_URL ? ['SUPABASE_URL'] : []),
        ...(!SUPABASE_PUBLISHABLE_KEY ? ['SUPABASE_PUBLISHABLE_KEY'] : []),
      ];
      const message = `Missing Supabase environment variable(s): ${missing.join(', ')}. Connect Supabase in Lovable Cloud.`;
      console.error(`[Supabase] ${message}`);
      throw new Error(message);
    }
    
    const request = getRequest();

    if (!request?.headers) {
      throw new Error('Unauthorized: No request headers available');
    }

    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      throw new Error('Unauthorized: No authorization header provided');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized: Only Bearer tokens are supported');
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new Error('Unauthorized: No token provided');
    }

    if (token.split('.').length !== 3) {
      throw new Error('Unauthorized: Invalid token');
    }

    const supabase = createClient<Database>(
      SUPABASE_URL!,
      SUPABASE_PUBLISHABLE_KEY!,
      {
        global: {
          fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY!),
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          storage: undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims) {
      throw new Error('Unauthorized: Invalid token');
    }

    if (!data.claims.sub) {
      throw new Error('Unauthorized: No user ID found in token');
    }

    return next({
      context: {
        supabase,
        userId: data.claims.sub,
        claims: data.claims,
      },
    });
  },
);

```

## `src/integrations/supabase/client.server.ts`

```tsx
// This file is automatically generated. Do not edit it directly.
// Server-side Supabase client with service role key - bypasses RLS.
// Use this for admin operations in server functions and server routes only.
// For user-authenticated queries (with RLS), use the auth middleware instead.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    // New Supabase API keys are opaque strings, not bearer JWTs.
    if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }

    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function createSupabaseAdminClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ['SUPABASE_URL'] : []),
      ...(!SUPABASE_SERVICE_ROLE_KEY ? ['SUPABASE_SERVICE_ROLE_KEY'] : []),
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(', ')}. Connect Supabase in Lovable Cloud.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    global: {
      fetch: createSupabaseFetch(SUPABASE_SERVICE_ROLE_KEY),
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

let _supabaseAdmin: ReturnType<typeof createSupabaseAdminClient> | undefined;

// Server-side Supabase client with service role - bypasses RLS
// SECURITY: Only use this for trusted server-side operations, never expose to client code
// Load inside server handlers: const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
// Top-level import is safe only in other .server.ts modules - route files and *.functions.ts ship to the client bundle.
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createSupabaseAdminClient>, {
  get(_, prop, receiver) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
    return Reflect.get(_supabaseAdmin, prop, receiver);
  },
});

```

## `src/integrations/supabase/client.ts`

```tsx
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    // New Supabase API keys are opaque strings, not bearer JWTs.
    if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }

    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}


function createSupabaseClient() {
  // Use import.meta.env for client-side (Vite build-time replacement)
  // Fall back to process.env for SSR (server-side rendering)
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ['SUPABASE_URL'] : []),
      ...(!SUPABASE_PUBLISHABLE_KEY ? ['SUPABASE_PUBLISHABLE_KEY'] : []),
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(', ')}. Connect Supabase in Lovable Cloud.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: {
      fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
    },
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});


```

## `src/lib/activities.ts`

```tsx
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Activity = {
  id: string;
  host_id: string;
  title: string;
  description: string;
  category: string;
  cover_url: string | null;
  city: string;
  country: string;
  lat: number;
  lng: number;
  starts_at: string;
  max_spots: number;
  created_at: string;
};

export const activitiesQuery = () => ({
  queryKey: ["activities"],
  queryFn: async (): Promise<Activity[]> => {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("starts_at", { ascending: true });
    if (error) throw error;
    return data as Activity[];
  },
  // Activities are pinned for at most 24h; refetching every keystroke is wasteful.
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: false,
});

export function useActivities() {
  return useQuery(activitiesQuery());
}


export function activityQuery(id: string) {
  return {
    queryKey: ["activity", id],
    queryFn: async (): Promise<Activity | null> => {
      const { data, error } = await supabase.from("activities").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Activity | null;
    },
  };
}

export type RsvpRow = { id: string; activity_id: string; user_id: string; status: string };

export function useRsvpsForActivity(activityId: string | undefined) {
  return useQuery({
    queryKey: ["rsvps", activityId],
    queryFn: async (): Promise<RsvpRow[]> => {
      if (!activityId) return [];
      const { data, error } = await supabase.from("rsvps").select("*").eq("activity_id", activityId).eq("status", "going");
      if (error) throw error;
      return data as RsvpRow[];
    },
    enabled: !!activityId,
  });
}

export function useMyRsvps(userId: string | undefined) {
  return useQuery({
    queryKey: ["my-rsvps", userId],
    queryFn: async (): Promise<RsvpRow[]> => {
      if (!userId) return [];
      const { data, error } = await supabase.from("rsvps").select("*").eq("user_id", userId).eq("status", "going");
      if (error) throw error;
      return data as RsvpRow[];
    },
    enabled: !!userId,
  });
}

```

## `src/lib/categories.ts`

```tsx
export const CATEGORIES = [
  { id: "Dinner", label: "Dinner", icon: "🍷", tint: "#E85A3C", tintSoft: "#FCE7DE" },
  { id: "Adventure", label: "Adventure", icon: "🏔️", tint: "#3B7A57", tintSoft: "#E1EDE5" },
  { id: "Coworking", label: "Coworking", icon: "☕", tint: "#8A6B45", tintSoft: "#EFE6D5" },
  { id: "Wellness", label: "Wellness", icon: "🧘", tint: "#6B7FB8", tintSoft: "#E4E9F4" },
  { id: "Food", label: "Food crawl", icon: "🌮", tint: "#E8A93C", tintSoft: "#FBF0D6" },
  { id: "Nightlife", label: "Nightlife", icon: "✨", tint: "#7B5FB0", tintSoft: "#ECE5F5" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

```

## `src/lib/error-capture.ts`

```tsx
// Captures the original Error out-of-band so server.ts can recover the stack
// when h3 has already swallowed the throw into a generic 500 Response.

let lastCapturedError: { error: unknown; at: number } | undefined;
const TTL_MS = 5_000;

function record(error: unknown) {
  lastCapturedError = { error, at: Date.now() };
}

if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => record((event as ErrorEvent).error ?? event));
  globalThis.addEventListener("unhandledrejection", (event) =>
    record((event as PromiseRejectionEvent).reason),
  );
}

export function consumeLastCapturedError(): unknown {
  if (!lastCapturedError) return undefined;
  if (Date.now() - lastCapturedError.at > TTL_MS) {
    lastCapturedError = undefined;
    return undefined;
  }
  const { error } = lastCapturedError;
  lastCapturedError = undefined;
  return error;
}

```

## `src/lib/error-page.ts`

```tsx
export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}

```

## `src/lib/follows.ts`

```tsx
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type ProfileLite = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  home_city: string | null;
};

// A username is "provisional" (auto-generated on signup) if it matches user_xxxxxxxxxx (10 hex chars).
export function isProvisionalUsername(username: string | null | undefined) {
  return !!username && /^user_[a-f0-9]{6,12}$/i.test(username);
}

export function useMyProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", "me", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, home_city, bio")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useProfileByUsername(username: string | undefined) {
  return useQuery({
    queryKey: ["profile", "by-username", username?.toLowerCase()],
    enabled: !!username && username.length >= 3,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, home_city")
        .ilike("username", username!)
        .maybeSingle();
      if (error) throw error;
      return data as ProfileLite | null;
    },
  });
}

export function useSearchProfiles(query: string) {
  return useQuery({
    queryKey: ["profile", "search", query.toLowerCase()],
    enabled: query.trim().length >= 2,
    queryFn: async () => {
      const q = query.trim().replace(/[%_]/g, "");
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, home_city")
        .or(`username.ilike.${q}%,display_name.ilike.%${q}%`)
        .limit(12);
      if (error) throw error;
      return (data ?? []) as ProfileLite[];
    },
  });
}

export function useFollowCounts(userId: string | undefined) {
  return useQuery({
    queryKey: ["follows", "counts", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [followers, following] = await Promise.all([
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId!),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId!),
      ]);
      return { followers: followers.count ?? 0, following: following.count ?? 0 };
    },
  });
}

export function useFollowingList(userId: string | undefined) {
  return useQuery({
    queryKey: ["follows", "following", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follows")
        .select("following_id, profile:profiles!follows_following_id_fkey(id, username, display_name, avatar_url, home_city)")
        .eq("follower_id", userId!);
      if (error) {
        // fallback if fk name differs — fetch ids then profiles
        const { data: rows } = await supabase.from("follows").select("following_id").eq("follower_id", userId!);
        const ids = (rows ?? []).map((r) => r.following_id);
        if (ids.length === 0) return [];
        const { data: profs } = await supabase.from("profiles").select("id, username, display_name, avatar_url, home_city").in("id", ids);
        return (profs ?? []) as ProfileLite[];
      }
      return (data ?? []).map((r: any) => r.profile).filter(Boolean) as ProfileLite[];
    },
  });
}

export function useFollowersList(userId: string | undefined) {
  return useQuery({
    queryKey: ["follows", "followers", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: rows } = await supabase.from("follows").select("follower_id").eq("following_id", userId!);
      const ids = (rows ?? []).map((r) => r.follower_id);
      if (ids.length === 0) return [];
      const { data: profs } = await supabase.from("profiles").select("id, username, display_name, avatar_url, home_city").in("id", ids);
      return (profs ?? []) as ProfileLite[];
    },
  });
}

export function useIsFollowing(followerId: string | undefined, followingId: string | undefined) {
  return useQuery({
    queryKey: ["follows", "is", followerId, followingId],
    enabled: !!followerId && !!followingId && followerId !== followingId,
    queryFn: async () => {
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", followerId!)
        .eq("following_id", followingId!)
        .maybeSingle();
      return !!data;
    },
  });
}

// Does `otherId` follow `myId`? Used for "Follows you" pills.
export function useFollowsMe(myId: string | undefined, otherId: string | undefined) {
  return useQuery({
    queryKey: ["follows", "followsMe", myId, otherId],
    enabled: !!myId && !!otherId && myId !== otherId,
    queryFn: async () => {
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", otherId!)
        .eq("following_id", myId!)
        .maybeSingle();
      return !!data;
    },
  });
}

// Suggested profiles: people I don't follow yet (excluding me).
export function useSuggestedProfiles(myId: string | undefined, limit = 8) {
  return useQuery({
    queryKey: ["profile", "suggested", myId, limit],
    enabled: !!myId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data: myFollows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", myId!);
      const excludeIds = new Set<string>([myId!, ...(myFollows ?? []).map((r) => r.following_id)]);
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, home_city")
        .order("created_at", { ascending: false })
        .limit(limit + excludeIds.size);
      return ((data ?? []) as ProfileLite[]).filter((p) => !excludeIds.has(p.id)).slice(0, limit);
    },
  });
}

export function useFollowMutation(myId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ targetId, follow }: { targetId: string; follow: boolean }) => {
      if (!myId) throw new Error("Not signed in");
      if (follow) {
        const { error } = await supabase.from("follows").insert({ follower_id: myId, following_id: targetId });
        if (error && !error.message.includes("duplicate")) throw error;
      } else {
        const { error } = await supabase.from("follows").delete().eq("follower_id", myId).eq("following_id", targetId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["follows"] });
    },
  });
}

/* ---------------- Blocks ---------------- */

export function useIsBlocked(myId: string | undefined, otherId: string | undefined) {
  return useQuery({
    queryKey: ["blocks", "is", myId, otherId],
    enabled: !!myId && !!otherId && myId !== otherId,
    queryFn: async () => {
      const { data } = await supabase
        .from("blocks")
        .select("id")
        .eq("blocker_id", myId!)
        .eq("blocked_id", otherId!)
        .maybeSingle();
      return !!data;
    },
  });
}

export function useBlockedByMe(myId: string | undefined) {
  return useQuery({
    queryKey: ["blocks", "list", myId],
    enabled: !!myId,
    queryFn: async () => {
      const { data: rows } = await supabase.from("blocks").select("blocked_id").eq("blocker_id", myId!);
      const ids = (rows ?? []).map((r) => r.blocked_id);
      if (ids.length === 0) return [];
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, home_city")
        .in("id", ids);
      return (profs ?? []) as ProfileLite[];
    },
  });
}

export function useBlockMutation(myId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ targetId, block }: { targetId: string; block: boolean }) => {
      if (!myId) throw new Error("Not signed in");
      if (block) {
        const { error } = await supabase.from("blocks").insert({ blocker_id: myId, blocked_id: targetId });
        if (error && !error.message.includes("duplicate")) throw error;
      } else {
        const { error } = await supabase.from("blocks").delete().eq("blocker_id", myId).eq("blocked_id", targetId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blocks"] });
      qc.invalidateQueries({ queryKey: ["follows"] });
    },
  });
}

export async function checkUsernameAvailable(username: string, currentUserId?: string) {
  const clean = username.trim();
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(clean)) return { ok: false, reason: "3–20 letters, numbers or _" };
  let q = supabase.from("profiles").select("id").ilike("username", clean);
  if (currentUserId) q = q.neq("id", currentUserId);
  const { data, error } = await q.maybeSingle();
  if (error) return { ok: false, reason: error.message };
  return { ok: !data, reason: data ? "That username is taken" : "" };
}

export async function setMyUsername(userId: string, username: string) {
  const { error } = await supabase.from("profiles").update({ username: username.trim() }).eq("id", userId);
  if (error) throw error;
}

```

## `src/lib/landing-stats.functions.ts`

```tsx
import { createServerFn } from "@tanstack/react-start";

export type LandingStats = {
  liveCount: number;
  activeHosts: number;
  totalCities: number;
  perCountry: Record<string, number>;
  trending: { city: string; country: string; count: number }[];
  joins: { when: string; name: string; title: string; city: string; country: string; category: string }[];
  generatedAt: string;
};

export const getLandingStats = createServerFn({ method: "GET" }).handler(async (): Promise<LandingStats> => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const now = new Date();
  const nowIso = now.toISOString();
  const in6h = new Date(now.getTime() + 6 * 3600 * 1000).toISOString();
  const last24h = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();

  const [liveCountRes, soonHostsRes, cityRes, joinsRes, allCitiesRes] = await Promise.all([
    supabaseAdmin.from("activities").select("*", { count: "exact", head: true }).gte("starts_at", nowIso),
    supabaseAdmin.from("activities").select("host_id, starts_at").gte("starts_at", nowIso).lte("starts_at", in6h),
    supabaseAdmin.from("activities").select("city, country, created_at").gte("created_at", last24h),
    supabaseAdmin
      .from("rsvps")
      .select("created_at, user_id, activity_id")
      .order("created_at", { ascending: false })
      .limit(12),
    supabaseAdmin.from("activities").select("city, country"),
  ]);

  const activeHosts = new Set((soonHostsRes.data ?? []).map((a) => a.host_id)).size;

  const cityMap = new Map<string, { count: number; country: string }>();
  for (const a of cityRes.data ?? []) {
    const cur = cityMap.get(a.city) ?? { count: 0, country: a.country };
    cur.count += 1;
    cityMap.set(a.city, cur);
  }
  const trending = [...cityMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([city, v]) => ({ city, country: v.country, count: v.count }));

  const perCountry: Record<string, number> = {};
  const totalCitiesSet = new Set<string>();
  for (const a of allCitiesRes.data ?? []) {
    perCountry[a.country] = (perCountry[a.country] ?? 0) + 1;
    totalCitiesSet.add(a.city);
  }

  let joins: LandingStats["joins"] = [];
  const raw = joinsRes.data ?? [];
  if (raw.length) {
    const uids = [...new Set(raw.map((r) => r.user_id))];
    const aids = [...new Set(raw.map((r) => r.activity_id))];
    const [profs, acts] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, display_name").in("id", uids),
      supabaseAdmin.from("activities").select("id, title, city, country, category").in("id", aids),
    ]);
    const pMap = new Map((profs.data ?? []).map((p) => [p.id, p.display_name]));
    const aMap = new Map((acts.data ?? []).map((a) => [a.id, a]));
    joins = raw
      .map((r) => {
        const a = aMap.get(r.activity_id);
        if (!a) return null;
        return {
          when: r.created_at,
          name: (pMap.get(r.user_id) ?? "Someone").split(" ")[0],
          title: a.title,
          city: a.city,
          country: a.country,
          category: a.category,
        };
      })
      .filter(Boolean) as LandingStats["joins"];
  }

  return {
    liveCount: liveCountRes.count ?? 0,
    activeHosts,
    totalCities: totalCitiesSet.size,
    perCountry,
    trending,
    joins,
    generatedAt: nowIso,
  };
});

```

## `src/lib/lovable-error-reporting.ts`

```tsx
type LovableErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type LovableEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: LovableErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __lovableEvents?: LovableEvents;
  }
}

export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );
}

```

## `src/lib/messages.ts`

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ConversationType = "dm" | "location";

export type ConversationRow = {
  id: string;
  type: ConversationType;
  activity_id: string | null;
  created_by: string;
  title: string | null;
  expires_at: string | null;
  last_message_at: string;
  created_at: string;
};

export type MemberRow = {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
  profile?: { username: string | null; display_name: string | null; avatar_url: string | null } | null;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  media_url: string | null;
  media_type: string | null;
  signed_url?: string | null;
};


export type ConversationSummary = ConversationRow & {
  members: MemberRow[];
  last_body: string | null;
  unread: number;
};

// -------- Conversations list --------
export function useConversations(userId?: string) {
  return useQuery({
    queryKey: ["conversations", userId],
    enabled: !!userId,
    queryFn: async (): Promise<ConversationSummary[]> => {
      const { data: mine, error } = await supabase
        .from("conversation_members")
        .select("conversation_id, last_read_at")
        .eq("user_id", userId!);
      if (error) throw error;
      const ids = (mine ?? []).map((m) => m.conversation_id);
      if (ids.length === 0) return [];
      const readMap = new Map((mine ?? []).map((m) => [m.conversation_id, m.last_read_at as string]));

      const { data: convs } = await supabase
        .from("conversations")
        .select("*")
        .in("id", ids)
        .order("last_message_at", { ascending: false });

      const { data: rawMembers } = await supabase
        .from("conversation_members")
        .select("id, conversation_id, user_id, role, joined_at")
        .in("conversation_id", ids);
      const memberUserIds = Array.from(new Set((rawMembers ?? []).map((m) => m.user_id)));
      const { data: memberProfiles } = memberUserIds.length
        ? await supabase.from("profiles").select("id, username, display_name, avatar_url").in("id", memberUserIds)
        : { data: [] as { id: string; username: string | null; display_name: string | null; avatar_url: string | null }[] };
      const profileMap = new Map((memberProfiles ?? []).map((p) => [p.id, p]));
      const members: MemberRow[] = (rawMembers ?? []).map((m) => ({
        ...(m as Omit<MemberRow, "profile">),
        role: m.role as "owner" | "member",
        profile: profileMap.get(m.user_id) ?? null,
      }));


      const { data: lastMsgs } = await supabase
        .from("messages")
        .select("conversation_id, body, created_at, sender_id")
        .in("conversation_id", ids)
        .order("created_at", { ascending: false });

      const bodyByConv = new Map<string, string>();
      const unreadByConv = new Map<string, number>();
      for (const m of lastMsgs ?? []) {
        if (!bodyByConv.has(m.conversation_id)) bodyByConv.set(m.conversation_id, m.body);
        const lr = readMap.get(m.conversation_id);
        if (m.sender_id !== userId && (!lr || new Date(m.created_at) > new Date(lr))) {
          unreadByConv.set(m.conversation_id, (unreadByConv.get(m.conversation_id) ?? 0) + 1);
        }
      }

      const membersByConv = new Map<string, MemberRow[]>();
      for (const m of members) {
        const arr = membersByConv.get(m.conversation_id) ?? [];
        arr.push(m);
        membersByConv.set(m.conversation_id, arr);
      }


      return (convs ?? []).map((c) => ({
        ...(c as ConversationRow),
        members: membersByConv.get(c.id) ?? [],
        last_body: bodyByConv.get(c.id) ?? null,
        unread: unreadByConv.get(c.id) ?? 0,
      }));
    },
    staleTime: 10_000,
  });
}

export function useUnreadMessagesTotal(userId?: string) {
  const { data = [] } = useConversations(userId);
  return data.reduce((sum, c) => sum + c.unread, 0);
}

// -------- Messages in a conversation --------
export function useMessages(conversationId?: string) {
  return useQuery({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId,
    queryFn: async (): Promise<MessageRow[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      const rows = (data ?? []) as MessageRow[];
      const paths = rows.filter((m) => m.media_url).map((m) => m.media_url!) as string[];
      if (paths.length) {
        const { data: signed } = await supabase.storage.from("chat-media").createSignedUrls(paths, 3600);
        const map = new Map((signed ?? []).map((s) => [s.path!, s.signedUrl]));
        rows.forEach((m) => {
          if (m.media_url) m.signed_url = map.get(m.media_url) ?? null;
        });
      }
      return rows;
    },
  });
}

export function useSendMessage(conversationId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: string | { body?: string; file?: File | null }) => {
      const arg = typeof input === "string" ? { body: input } : input;
      const trimmed = (arg.body ?? "").trim();
      const file = arg.file ?? null;
      if (!trimmed && !file) return;
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid || !conversationId) return;

      let media_url: string | null = null;
      let media_type: string | null = null;
      if (file) {
        const ext = (file.name.split(".").pop() || "bin").toLowerCase().slice(0, 8);
        const path = `${conversationId}/${uid}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("chat-media")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;
        media_url = path;
        media_type = file.type.startsWith("video") ? "video" : "image";
      }

      const { error } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: uid, body: trimmed, media_url, media_type });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}


export function useMarkConvRead(conversationId?: string, userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!conversationId || !userId) return;
      await supabase
        .from("conversation_members")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", userId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

// -------- Realtime messages for the current user --------
export function useMessagesRealtime(userId?: string, activeConversationId?: string) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`msgs-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const row = payload.new as MessageRow;
        qc.invalidateQueries({ queryKey: ["conversations"] });
        if (activeConversationId && row.conversation_id === activeConversationId) {
          qc.invalidateQueries({ queryKey: ["messages", activeConversationId] });
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, activeConversationId, qc]);
}

// -------- Start / manage --------
export function useStartDM() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (otherUserId: string) => {
      const { data, error } = await supabase.rpc("start_dm", { _other: otherUserId });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

export function useLeaveConv() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      const { error } = await supabase
        .from("conversation_members")
        .delete()
        .eq("conversation_id", conversationId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      const { error } = await supabase
        .from("conversation_members")
        .delete()
        .eq("conversation_id", conversationId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["members", v.conversationId] });
    },
  });
}

// -------- Mutual followers for DM picker --------
export function useMutualFollowers(userId?: string) {
  return useQuery({
    queryKey: ["mutual-followers", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: following } = await supabase.from("follows").select("following_id").eq("follower_id", userId!);
      const { data: followers } = await supabase.from("follows").select("follower_id").eq("following_id", userId!);
      const setA = new Set((following ?? []).map((r) => r.following_id));
      const mutuals = (followers ?? []).map((r) => r.follower_id).filter((id) => setA.has(id));
      if (mutuals.length === 0) return [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", mutuals);
      return profiles ?? [];
    },
  });
}

```

## `src/lib/notifications.ts`

```tsx
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export type NotificationType = "follow" | "mutual_follow" | "trip_suggestion" | "system";

export type NotificationRow = {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: NotificationType | string;
  entity_type: string | null;
  entity_id: string | null;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
  actor?: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

export function useNotifications(userId: string | undefined) {
  return useQuery({
    queryKey: ["notifications", userId],
    enabled: !!userId,
    staleTime: 15_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      const rows = (data ?? []) as NotificationRow[];
      const actorIds = Array.from(new Set(rows.map((r) => r.actor_id).filter(Boolean))) as string[];
      if (actorIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .in("id", actorIds);
        const byId = new Map((profs ?? []).map((p: any) => [p.id, p]));
        rows.forEach((r) => {
          r.actor = r.actor_id ? (byId.get(r.actor_id) as any) ?? null : null;
        });
      }
      return rows;
    },
  });
}

export function useUnreadCount(userId: string | undefined) {
  return useQuery({
    queryKey: ["notifications", "unread", userId],
    enabled: !!userId,
    staleTime: 10_000,
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId!)
        .is("read_at", null);
      return count ?? 0;
    },
  });
}

export function useMarkAllRead(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!userId) return;
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", userId)
        .is("read_at", null);
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["notifications", "unread", userId] });
      qc.setQueryData(["notifications", "unread", userId], 0);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread", userId] });
    },
  });
}

export function useMarkRead(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread", userId] });
    },
  });
}

/** Subscribes to realtime inserts on the user's notifications and refreshes cache + fires a browser notification if permitted. */
export function useNotificationsRealtime(userId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        async (payload) => {
          qc.invalidateQueries({ queryKey: ["notifications"] });
          qc.invalidateQueries({ queryKey: ["notifications", "unread", userId] });
          const n = payload.new as NotificationRow;
          try {
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              let actorName = "Someone";
              if (n.actor_id) {
                const { data: p } = await supabase
                  .from("profiles")
                  .select("username, display_name")
                  .eq("id", n.actor_id)
                  .maybeSingle();
                actorName = (p?.display_name || (p?.username ? `@${p.username}` : "Someone")) as string;
              }
              const title = n.type === "mutual_follow" ? "You're now friends" : "New follower";
              const body =
                n.type === "mutual_follow"
                  ? `${actorName} follows you back on Gobber.`
                  : `${actorName} started following you on Gobber.`;
              new Notification(title, { body, icon: "/favicon.ico", tag: n.id });
            }
          } catch {
            /* ignore */
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, qc]);
}

export async function requestBrowserPushPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted" || Notification.permission === "denied") return Notification.permission;
  return await Notification.requestPermission();
}

/* ---------------- Suggested (server-ranked) ---------------- */

export type SuggestedProfile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  home_city: string | null;
  mutual_count: number;
};

export function useRankedSuggestions(userId: string | undefined, limit = 12) {
  return useQuery({
    queryKey: ["profile", "suggested-ranked", userId, limit],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("suggested_profiles", { _user_id: userId!, _limit: limit });
      if (error) throw error;
      return (data ?? []) as SuggestedProfile[];
    },
  });
}

```

## `src/lib/place-photo.functions.ts`

```tsx
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  lat: z.number(),
  lng: z.number(),
  category: z.string().optional(),
});

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";

// Curated fallback imagery per category, used when Google Places has no photo.
const FALLBACK: Record<string, string> = {
  Dinner: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
  Adventure: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80",
  Coworking: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80",
  Wellness: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80",
  Food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
  Nightlife: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&q=80",
};

export const getLocationPhoto = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => Input.parse(v))
  .handler(async ({ data }): Promise<{ url: string; source: "google" | "fallback" }> => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const gmKey = process.env.GOOGLE_MAPS_API_KEY;
    const fallbackUrl =
      FALLBACK[data.category ?? ""] ??
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80";

    if (!lovableKey || !gmKey) return { url: fallbackUrl, source: "fallback" };

    try {
      // 1. Find the closest interesting place with a photo.
      const nearbyRes = await fetch(`${GATEWAY}/places/v1/places:searchNearby`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": gmKey,
          "Content-Type": "application/json",
          "X-Goog-FieldMask": "places.id,places.displayName,places.photos",
        },
        body: JSON.stringify({
          maxResultCount: 5,
          locationRestriction: {
            circle: {
              center: { latitude: data.lat, longitude: data.lng },
              radius: 250,
            },
          },
        }),
      });

      if (!nearbyRes.ok) return { url: fallbackUrl, source: "fallback" };
      const nearby = (await nearbyRes.json()) as {
        places?: { photos?: { name: string }[] }[];
      };
      const photoName = nearby.places?.find((p) => p.photos?.length)?.photos?.[0]?.name;
      if (!photoName) return { url: fallbackUrl, source: "fallback" };

      // 2. Resolve the photo media URL.
      const mediaRes = await fetch(
        `${GATEWAY}/places/v1/${photoName}/media?maxWidthPx=1200&skipHttpRedirect=true`,
        {
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": gmKey,
          },
        },
      );
      if (!mediaRes.ok) return { url: fallbackUrl, source: "fallback" };
      const media = (await mediaRes.json()) as { photoUri?: string };
      if (!media.photoUri) return { url: fallbackUrl, source: "fallback" };

      return { url: media.photoUri, source: "google" };
    } catch {
      return { url: fallbackUrl, source: "fallback" };
    }
  });

```

## `src/lib/utils.ts`

```tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

```

## `src/router.tsx`

```tsx
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  return router;
};

```

## `src/routes/__root.tsx`

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="text-8xl font-semibold tracking-tighter text-foreground">404</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This corner of the world isn't on the map yet.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          Back to Discover
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Something went sideways</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try refreshing or head home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
          <a href="/" className="rounded-full border border-input px-5 py-2 text-sm">
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#faf8f5" },
      { title: "Gobber — Meet strangers. Leave with friends." },
      { name: "description", content: "Gobber turns cities into gathering places. Discover intimate dinners, spontaneous hikes and small adventures hosted by people nearby — and become the reason someone remembers a city." },
      { name: "author", content: "Gobber" },
      { property: "og:title", content: "Gobber — Meet strangers. Leave with friends." },
      { property: "og:description", content: "Gobber turns cities into gathering places. Discover intimate dinners, spontaneous hikes and small adventures hosted by people nearby — and become the reason someone remembers a city." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Gobber — Meet strangers. Leave with friends." },
      { name: "twitter:description", content: "Gobber turns cities into gathering places. Discover intimate dinners, spontaneous hikes and small adventures hosted by people nearby — and become the reason someone remembers a city." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/cdacf2fc-78af-49e9-80c9-823d83bc4780/id-preview-b8e10897--5377433b-1587-4428-8eeb-66bf34c8d00f.lovable.app-1784094136228.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/cdacf2fc-78af-49e9-80c9-823d83bc4780/id-preview-b8e10897--5377433b-1587-4428-8eeb-66bf34c8d00f.lovable.app-1784094136228.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Gobber",
          url: "https://gobber.lovable.app",
          description:
            "Gobber turns cities into gathering places. Discover intimate dinners, spontaneous hikes and small adventures hosted by people nearby.",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

```

## `src/routes/_authenticated/activity.$id.tsx`

```tsx
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Users, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { activityQuery, useRsvpsForActivity } from "@/lib/activities";
import { useUser } from "@/hooks/use-user";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/activity/$id")({
  component: ActivityDetail,
});

function ActivityDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useUser();
  const { data: activity, isLoading } = useQuery(activityQuery(id));
  const { data: rsvps = [] } = useRsvpsForActivity(id);

  const myRsvp = user ? rsvps.find((r) => r.user_id === user.id) : undefined;
  const spotsLeft = activity ? activity.max_spots - rsvps.length : 0;

  const rsvpMut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      if (myRsvp) {
        const { error } = await supabase.from("rsvps").delete().eq("id", myRsvp.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rsvps").insert({ activity_id: id, user_id: user.id, status: "going" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rsvps", id] });
      qc.invalidateQueries({ queryKey: ["my-rsvps"] });
      toast.success(myRsvp ? "RSVP cancelled" : "You're in ✨");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (isLoading) return <div className="flex h-[100dvh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!activity) return (
    <div className="flex h-[100dvh] flex-col items-center justify-center px-6">
      <p className="text-lg font-medium">Activity not found</p>
      <Link to="/discover" className="mt-4 text-sm text-clay underline">Back to Discover</Link>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-background pb-32">
      {/* Hero */}
      <div className="relative h-[42dvh] w-full overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${activity.cover_url ?? "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=75&auto=format"})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/40" />
        <button onClick={() => navigate({ to: "/discover" })} className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full glass shadow-glass">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15, duration: 0.6 }}
        className="relative -mt-16 px-5"
      >
        <div className="rounded-3xl bg-card p-6 shadow-float">
          <p className="text-xs font-medium uppercase tracking-widest text-clay">{activity.category}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{activity.title}</h1>

          <div className="mt-4 grid grid-cols-3 gap-3 border-y border-border py-4 text-center">
            <Stat icon={Calendar} label={format(new Date(activity.starts_at), "MMM d")} sub={format(new Date(activity.starts_at), "h:mm a")} />
            <Stat icon={MapPin} label={activity.city} sub={activity.country} />
            <Stat icon={Users} label={`${spotsLeft} left`} sub={`of ${activity.max_spots}`} />
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-foreground/85">{activity.description}</p>
        </div>
      </motion.div>

      {/* Sticky RSVP */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border glass px-5 py-4 pb-safe-4">
        <div className="mx-auto max-w-md">
          <Button
            onClick={() => rsvpMut.mutate()}
            disabled={rsvpMut.isPending || (spotsLeft <= 0 && !myRsvp)}
            className="h-12 w-full rounded-full text-base font-medium"
            variant={myRsvp ? "outline" : "default"}
          >
            {rsvpMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : myRsvp ? "You're going · Cancel RSVP" : spotsLeft <= 0 ? "Fully booked" : `Reserve a spot`}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, sub }: { icon: typeof MapPin; label: string; sub: string }) {
  return (
    <div>
      <Icon className="mx-auto h-4 w-4 text-clay" />
      <p className="mt-1 text-sm font-semibold text-ink">{label}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

```

## `src/routes/_authenticated/discover.tsx`

```tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Compass, Plus, X, Loader2, Trash2, LocateFixed, Minus } from "lucide-react";
import { GoogleMap, type GoogleMapHandle } from "@/components/google-map";
import { MapTypeToggle, type MapView } from "@/components/map-type-toggle";
import { BottomNav } from "@/components/bottom-nav";
import { DraggableSheet } from "@/components/draggable-sheet";
import { useActivities, type Activity } from "@/lib/activities";
import { CATEGORIES } from "@/lib/categories";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/use-user";
import { toast } from "sonner";
import { getLocationPhoto } from "@/lib/place-photo.functions";

const TITLE_PLACEHOLDERS: Record<string, string> = {
  Dinner: "Sunset ramen in Shibuya",
  Adventure: "Sunrise hike above the fjord",
  Coworking: "Slow mornings & flat whites",
  Wellness: "Rooftop yoga before the heat",
  Food: "Taco crawl through the old town",
  Nightlife: "Rooftop cocktails, no phones",
};

const DESC_PLACEHOLDERS: Record<string, string> = {
  Dinner: "Small table, big conversations. Bring an appetite. (optional)",
  Adventure: "Bring shoes with grip and a light layer. (optional)",
  Coworking: "Laptops open, small talk welcome. (optional)",
  Wellness: "Mats provided. Come as you are. (optional)",
  Food: "Five stops, one street, zero plans. (optional)",
  Nightlife: "Dress how you feel. Stay as long as you like. (optional)",
};

export const Route = createFileRoute("/_authenticated/discover")({
  head: () => ({
    meta: [
      { title: "Discover — Gobber" },
      { name: "description", content: "Intimate gatherings happening around the world, right now." },
    ],
  }),
  component: Discover,
});

function Discover() {
  const { data: activities = [], isLoading, refetch } = useActivities();
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [mapView, setMapView] = useState<MapView>("satellite");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [heading, setHeading] = useState(0);

  // Pin creation flow
  const { user } = useUser();
  const [addMode, setAddMode] = useState(false);
  const [ghostPin, setGhostPin] = useState<{ lat: number; lng: number } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [placeLabel, setPlaceLabel] = useState<string>("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Dinner" as string,
    duration_hours: 2,
  });



  const navigate = useNavigate();
  const qc = useQueryClient();
  const mapRef = useRef<GoogleMapHandle>(null);
  const railRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      if (category && a.category !== category) return false;
      if (query && !`${a.title} ${a.city} ${a.country}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [activities, category, query]);

  // A user is only allowed one *active* pin at a time (starts_at + duration_hours > now)
  const myActivePin = useMemo(() => {
    if (!user) return null;
    const now = Date.now();
    return (
      activities.find((a) => {
        if (a.host_id !== user.id) return false;
        const start = new Date(a.starts_at).getTime();
        const durHrs = (a as unknown as { duration_hours?: number }).duration_hours ?? 2;
        const end = start + durHrs * 60 * 60 * 1000;
        return end > now;
      }) ?? null
    );
  }, [activities, user]);

  const pins = useMemo(
    () =>
      filtered.map((a) => ({
        id: a.id,
        lat: a.lat,
        lng: a.lng,
        label: a.title,
        category: a.category,
        mine: !!user && a.host_id === user.id,
      })),
    [filtered, user],
  );


  function focusActivity(a: Activity) {
    setSelectedId(a.id);
    mapRef.current?.panTo(a.lat, a.lng, 12);
    // Smoothly snap the corresponding card into center of the rail
    const el = railRef.current?.querySelector<HTMLElement>(`[data-id="${a.id}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  const [removing, setRemoving] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  async function removeMyPin() {
    if (!myActivePin || !user) return;
    const id = myActivePin.id;
    setRemoving(true);
    try {
      const { error } = await supabase.from("activities").delete().eq("id", id).eq("host_id", user.id);
      if (error) throw error;
      toast.success("Pin removed");
      await qc.invalidateQueries({ queryKey: ["activities"] });
      setShowRemoveConfirm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove");
    } finally {
      setRemoving(false);
    }
  }

  function confirmRemovePin() {
    if (!myActivePin) return;
    setShowRemoveConfirm(true);
  }


  async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
        { headers: { "Accept-Language": "en" } },
      );
      const j = await r.json();
      const a = j.address ?? {};
      const city = a.city ?? a.town ?? a.village ?? a.county ?? "Somewhere";
      const country = a.country ?? "";
      return country ? `${city}, ${country}` : city;
    } catch {
      return "Selected location";
    }
  }

  async function handleMapClick(pos: { lat: number; lng: number }) {
    if (!addMode) return;
    setGhostPin(pos);
    setAddMode(false);
    setShowCreate(true);
    setPlaceLabel("Locating…");
    setPlaceLabel(await reverseGeocode(pos.lat, pos.lng));
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !ghostPin) return;
    if (myActivePin) {
      toast.error("You already have an active pin. Remove it first.");
      setShowCreate(false);
      setGhostPin(null);
      return;
    }
    if (!form.title) {
      toast.error("Add a title");
      return;
    }
    setCreating(true);

    try {
      const [city, country = ""] = placeLabel.split(",").map((s) => s.trim());
      const duration = Math.min(24, Math.max(1, form.duration_hours || 2));
      const startsAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Try Google Places for a real photo of this location; fall back per category.
      let coverUrl: string | null = null;
      try {
        const photo = await getLocationPhoto({
          data: { lat: ghostPin.lat, lng: ghostPin.lng, category: form.category },
        });
        coverUrl = photo.url;
      } catch {
        // non-fatal
      }

      const { data, error } = await supabase
        .from("activities")
        .insert({
          host_id: user.id,
          title: form.title,
          description: form.description || form.title,
          category: form.category,
          city: city || "Somewhere",
          country: country || "Earth",
          lat: ghostPin.lat,
          lng: ghostPin.lng,
          starts_at: startsAt,
          duration_hours: duration,
          max_spots: 6,
          cover_url: coverUrl,
        })
        .select()
        .single();
      if (error) throw error;
      toast.success("Pin dropped ✨ Starts in 10 min");
      await qc.invalidateQueries({ queryKey: ["activities"] });
      setShowCreate(false);
      setGhostPin(null);
      setForm({ title: "", description: "", category: "Dinner", duration_hours: 2 });
      if (data) mapRef.current?.panTo(data.lat, data.lng, 13);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setCreating(false);
    }

  }


  function cancelCreate() {
    setShowCreate(false);
    setGhostPin(null);
  }

  const [locating, setLocating] = useState(false);
  async function handleLocate() {
    setLocating(true);
    try {
      const pos = await mapRef.current?.locate();
      if (!pos) toast.error("Location unavailable");
    } finally {
      setLocating(false);
    }
  }

  const [searching, setSearching] = useState(false);
  async function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    // If any local activity matches, focus that first — cheapest hit.
    const local = filtered[0] ?? activities.find((a) =>
      `${a.title} ${a.city} ${a.country}`.toLowerCase().includes(q.toLowerCase()),
    );
    if (local) {
      mapRef.current?.flyTo(local.lat, local.lng, 11);
      setSelectedId(local.id);
      return;
    }
    setSearching(true);
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
        { headers: { "Accept-Language": "en" } },
      );
      const j = await r.json();
      const hit = Array.isArray(j) ? j[0] : null;
      if (!hit) {
        toast.error(`Couldn't find "${q}"`);
        return;
      }
      mapRef.current?.flyTo(parseFloat(hit.lat), parseFloat(hit.lon), 11);
    } catch {
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  }

  const railRafRef = useRef<number | null>(null);
  function onRailScroll() {
    if (railRafRef.current != null) return;
    railRafRef.current = requestAnimationFrame(() => {
      railRafRef.current = null;
      const el = railRef.current;
      if (!el) return;
      const center = el.scrollLeft + el.clientWidth / 2;
      const children = Array.from(el.children) as HTMLElement[];
      let closest: HTMLElement | null = null;
      let closestDist = Infinity;
      for (const c of children) {
        const cCenter = c.offsetLeft + c.clientWidth / 2;
        const d = Math.abs(cCenter - center);
        if (d < closestDist) {
          closestDist = d;
          closest = c;
        }
      }
      const id = closest?.dataset.id;
      if (id && id !== selectedId) {
        const a = filtered.find((x) => x.id === id);
        if (a) {
          setSelectedId(a.id);
          mapRef.current?.panTo(a.lat, a.lng);
        }
      }
    });
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      <GoogleMap
        ref={mapRef}
        pins={pins}
        mapTypeId={mapView}
        className="absolute inset-0"
        cursor={addMode ? "crosshair" : "default"}
        ghostPin={ghostPin}
        onMapClick={handleMapClick}
        onPinClick={(id: string) => {
          if (myActivePin && id === myActivePin.id) {
            confirmRemovePin();
            return;
          }
          const a = filtered.find((x) => x.id === id);
          if (a) focusActivity(a);
        }}

        onHeadingChange={setHeading}
      />

      {/* Top gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-56 bg-gradient-to-b from-[#f5eddc]/92 via-[#f5eddc]/55 to-transparent" />

      {/* Map style toggle — centered, no header text */}
      <motion.div
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-30 mx-auto flex w-full max-w-[720px] justify-center px-5 pt-9 sm:px-7"
      >
        <h1 className="sr-only">Discover gatherings near you</h1>
        <MapTypeToggle value={mapView} onChange={setMapView} />
      </motion.div>




      {/* Add-mode banner */}
      <AnimatePresence>
        {addMode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute left-1/2 top-[220px] z-30 -translate-x-1/2 rounded-full px-4 py-2 text-[12.5px] font-medium text-white shadow-lg"
            style={{ background: "linear-gradient(180deg,#e85a3c,#c94a2a)" }}
          >
            Tap anywhere on the map to drop a pin
            <button onClick={() => setAddMode(false)} className="ml-3 opacity-80 hover:opacity-100">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB — Add pin OR Remove your active pin */}
      <motion.button
        onClick={() => {
          if (!user) {
            toast.error("Sign in to drop a pin");
            return;
          }
          if (myActivePin) {
            confirmRemovePin();
            return;
          }
          setAddMode((v) => !v);
        }}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.06, y: -2 }}
        animate={
          addMode || myActivePin
            ? { scale: 1 }
            : { scale: [1, 1.04, 1] }
        }
        transition={
          addMode || myActivePin
            ? { type: "spring", stiffness: 380, damping: 22 }
            : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
        }
        className="absolute bottom-28 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_18px_36px_-14px_rgba(232,90,60,0.7)] sm:right-7"
        style={{
          background: myActivePin
            ? "linear-gradient(180deg,#f0a020,#c67a10)"
            : addMode
              ? "linear-gradient(180deg,#1a1614,#0a0908)"
              : "linear-gradient(180deg,#ff7a5c,#e85a3c)",
        }}
        aria-label={myActivePin ? "Remove your pin" : addMode ? "Cancel add pin" : "Add pin"}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={myActivePin ? "trash" : addMode ? "cancel" : "plus"}
            initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className="flex items-center justify-center"
          >
            {myActivePin ? <Trash2 className="h-5 w-5" strokeWidth={2.2} /> : addMode ? <X className="h-6 w-6" strokeWidth={2.4} /> : <Plus className="h-6 w-6" strokeWidth={2.4} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>


      {/* Bottom sheet */}
      <DraggableSheet
        snapPoints={[180, 420, typeof window !== "undefined" ? Math.min(760, window.innerHeight - 80) : 760]}
        initialSnap={0}
        onRefresh={async () => {
          await qc.invalidateQueries({ queryKey: ["activities"] });
          await refetch();
        }}
      >
        <div className="px-5 pt-1">
          {/* Editorial sheet header */}
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#6b5230]">Gobber · Discover</p>
              <h2 className="mt-1 font-serif text-[28px] italic leading-[1] tracking-[-0.025em] text-[#0f0d0b]">
                Around you
              </h2>
            </div>
            <div className="text-right tabular-nums">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={isLoading ? "loading" : `${filtered.length}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="block font-serif text-[26px] italic leading-none text-[#0f0d0b]"
                >
                  {isLoading ? "…" : filtered.length}
                </motion.span>
              </AnimatePresence>
              <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6b5230]">
                {filtered.length === 1 ? "Gathering" : "Gatherings"}
              </p>
            </div>
          </div>

          {/* Search + categories live inside the sheet, beneath the handle */}
          <motion.form
            onSubmit={handleSearchSubmit}
            whileHover={{ y: -1 }}
            whileFocus={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            className="flex w-full items-center gap-2.5 rounded-full px-4 py-3.5 ring-1 ring-[#3a2a12]/[0.06] focus-within:ring-[#3a2a12]/[0.14] transition-shadow"
            style={{
              background: "color-mix(in oklab, #fffaf0 72%, transparent)",
              backdropFilter: "saturate(180%) blur(28px)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.65), 0 1px 2px rgba(60,42,20,0.05), 0 18px 40px -20px rgba(60,42,20,0.22)",
            }}
          >
            <motion.span
              key={searching ? "loading" : "idle"}
              initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 460, damping: 22 }}
              className="flex items-center"
            >
              {searching ? (
                <Loader2 className="h-[18px] w-[18px] animate-spin text-[#2a1c0c]" />
              ) : (
                <Search className="h-[18px] w-[18px] text-[#2a1c0c]" strokeWidth={2} />
              )}
            </motion.span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a city or a vibe"
              className="w-full bg-transparent text-[15px] tracking-[-0.012em] outline-none placeholder:text-[#8a6d42]/80 text-[#1a1614]"
              enterKeyHint="search"
            />
            <AnimatePresence initial={false}>
              {query && (
                <motion.button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear"
                  initial={{ opacity: 0, scale: 0.6, rotate: -60 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6, rotate: 60 }}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="text-[#2a1c0c] hover:text-[#1a1614]"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.form>

          <div
            className="relative -mx-5 mt-4"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0, #000 32px, #000 calc(100% - 32px), transparent 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0, #000 32px, #000 calc(100% - 32px), transparent 100%)",
            }}
          >
            <div className="flex gap-2 overflow-x-auto px-5 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <CategoryChip active={!category} onClick={() => setCategory(null)}>All</CategoryChip>
              {CATEGORIES.map((c) => (
                <CategoryChip
                  key={c.id}
                  active={category === c.id}
                  onClick={() => setCategory(c.id === category ? null : c.id)}
                >
                  <span className="mr-1">{c.icon}</span>{c.label}
                </CategoryChip>
              ))}
            </div>
          </div>

          <div className="mb-2 mt-5 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#6b5230]">
              {query ? "Matching your search" : category ? "Filtered gatherings" : "Nearby right now"}
            </p>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-[#6b5230] sm:inline lg:hidden">
              Swipe · Pull to refresh
            </span>
          </div>



          <div
            ref={railRef}
            onScroll={onRailScroll}
            className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ touchAction: "pan-x" }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.slice(0, 20).map((a, i) => (
                <ActivityCard
                  key={a.id}
                  a={a}
                  active={selectedId === a.id}
                  onClick={() => {
                    focusActivity(a);
                    navigate({ to: "/activity/$id", params: { id: a.id } });
                  }}
                  delay={i * 0.03}
                />
              ))}
              {!isLoading && filtered.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full rounded-[22px] p-7 text-center ring-1 ring-[#3a2a12]/[0.06]"
                  style={{
                    background: "color-mix(in oklab, #fffaf0 72%, transparent)",
                    backdropFilter: "saturate(180%) blur(24px)",
                    WebkitBackdropFilter: "saturate(180%) blur(24px)",
                  }}
                >
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-[#2a1c0c]">Quiet spot</p>
                  <h4 className="mt-1.5 font-serif italic text-[22px] leading-[1.05] tracking-[-0.02em] text-[#0f0d0b]">
                    {query || category ? "Nothing matches — yet." : "No gatherings here yet."}
                  </h4>
                  <p className="mt-1.5 text-[12.5px] text-[#2a1c0c]">
                    {query
                      ? "Try a different city, or start the vibe yourself."
                      : "Be the first to drop a pin and set the vibe."}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {(query || category) && (
                      <button
                        onClick={() => {
                          setQuery("");
                          setCategory(null);
                        }}
                        className="rounded-full bg-white/70 px-4 py-2 text-[12.5px] font-medium text-[#2b1d0f] ring-1 ring-[#3a2a12]/[0.08] transition hover:bg-white"
                      >
                        Clear filters
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (!user) return toast.error("Sign in to drop a pin");
                        if (myActivePin) return confirmRemovePin();
                        setAddMode(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium text-white shadow-[0_12px_28px_-12px_rgba(232,90,60,0.7)] transition"
                      style={{ background: "linear-gradient(180deg,#ff7a5c,#e85a3c)" }}
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
                      Drop the first pin
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 space-y-2">
            <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((a, i) => (
              <motion.button
                key={"row-" + a.id}
                layout
                initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(10px)" }}
                transition={{ delay: i * 0.02, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => navigate({ to: "/activity/$id", params: { id: a.id } })}
                className="flex w-full items-center gap-3 rounded-2xl p-3 text-left ring-1 ring-[#3a2a12]/[0.06] transition hover:-translate-y-0.5"
                style={{
                  background: "color-mix(in oklab, #fffaf0 70%, transparent)",
                  backdropFilter: "saturate(180%) blur(22px)",
                  WebkitBackdropFilter: "saturate(180%) blur(22px)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.6), 0 10px 26px -18px rgba(50,34,15,0.22)",
                }}
              >
                <div
                  className="h-14 w-14 shrink-0 rounded-xl bg-cover bg-center ring-1 ring-[#3a2a12]/[0.06]"
                  style={{ backgroundImage: `url(${a.cover_url ?? "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=320&q=70&auto=format"})` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[#3a2a18]">{a.category}</p>
                  <h4 className="line-clamp-1 text-[14px] font-semibold tracking-[-0.01em] text-[#0f0d0b]">{a.title}</h4>
                  <p className="line-clamp-1 text-[11.5px] text-[#2a1c0c]">
                    {a.city}, {a.country} · {format(new Date(a.starts_at), "MMM d")}
                  </p>
                </div>
              </motion.button>
            ))}
            </AnimatePresence>
          </div>
        </div>
      </DraggableSheet>

      {/* Quick create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            key="create-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-5"
            style={{
              background: "rgba(30,22,12,0.28)",
              backdropFilter: "blur(22px) saturate(140%)",
              WebkitBackdropFilter: "blur(22px) saturate(140%)",
            }}
            onClick={cancelCreate}
          >
            <motion.form
              onSubmit={submitCreate}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 20, scale: 0.96, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 10, scale: 0.97, filter: "blur(8px)" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[420px] overflow-hidden rounded-[26px]"
              style={{
                background: "linear-gradient(180deg, rgba(255,253,247,0.42) 0%, rgba(255,247,230,0.28) 100%)",
                backdropFilter: "saturate(180%) blur(48px)",
                WebkitBackdropFilter: "saturate(180%) blur(48px)",
                border: "1px solid rgba(255,255,255,0.55)",
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.75) inset, 0 40px 90px -30px rgba(60,42,20,0.4), 0 10px 30px -18px rgba(60,42,20,0.18)",
              }}
            >
              <motion.button
                type="button"
                onClick={cancelCreate}
                aria-label="Close"
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full text-[#2b1d0f] transition-colors hover:bg-black/5"
              >
                <X className="h-4 w-4" />
              </motion.button>

              <div className="px-7 pt-9 pb-6">
                <div className="text-left">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-[#2a1c0c]">Drop a pin</p>
                  <h3 className="mt-1.5 font-serif italic text-[28px] leading-[1] tracking-[-0.02em] text-[#0f0d0b]">
                    New gathering
                  </h3>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/60 px-2.5 py-1 text-[11.5px] text-[#2b1d0f] ring-1 ring-white/60">
                    <MapPin className="h-3.5 w-3.5 text-[#e85a3c]" />
                    <span className="max-w-[240px] truncate">{placeLabel || "Selected location"}</span>
                  </div>
                </div>

                <div className="mt-5 space-y-3.5">
                  {/* Category picker — top of form, all tags visible */}
                  <div>
                    <label className="mb-1.5 block px-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#2a1c0c]">
                      Vibe
                    </label>
                    <div
                      className="relative -mx-1"
                      style={{
                        WebkitMaskImage:
                          "linear-gradient(to right, transparent 0, #000 20px, #000 calc(100% - 20px), transparent 100%)",
                        maskImage:
                          "linear-gradient(to right, transparent 0, #000 20px, #000 calc(100% - 20px), transparent 100%)",
                      }}
                    >
                      <div
                        className="flex gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        role="radiogroup"
                        aria-label="Pin category"
                      >
                        {CATEGORIES.map((c) => {
                          const active = form.category === c.id;
                          return (
                            <motion.button
                              key={c.id}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => setForm({ ...form, category: c.id })}
                              whileTap={{ scale: 0.92 }}
                              whileHover={{ y: -1 }}
                              transition={{ type: "spring", stiffness: 420, damping: 26 }}
                              className="relative shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium"
                              style={{ color: active ? "#fffaf0" : "#2b1d0f" }}
                            >
                              {active && (
                                <motion.span
                                  layoutId="createChipActive"
                                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                                  className="absolute inset-0 -z-10 rounded-full"
                                  style={{
                                    background: `linear-gradient(180deg, ${c.tint}, color-mix(in oklab, ${c.tint} 78%, #0f0d0b))`,
                                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 22px -12px ${c.tint}80`,
                                  }}
                                />
                              )}
                              {!active && (
                                <span
                                  className="absolute inset-0 -z-10 rounded-full ring-1 ring-white/60"
                                  style={{ background: "rgba(255,255,255,0.45)" }}
                                />
                              )}
                              <span className="relative flex items-center gap-1">
                                <motion.span
                                  animate={active ? { rotate: [0, -8, 8, 0], scale: [1, 1.15, 1] } : { rotate: 0, scale: 1 }}
                                  transition={{ duration: 0.5 }}
                                  aria-hidden="true"
                                >
                                  {c.icon}
                                </motion.span>
                                {c.label}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <GlassInput
                    autoFocus
                    value={form.title}
                    onChange={(v) => setForm({ ...form, title: v })}
                    placeholder={TITLE_PLACEHOLDERS[form.category] ?? "What's happening?"}
                  />
                  <GlassTextarea
                    value={form.description}
                    onChange={(v) => setForm({ ...form, description: v })}
                    placeholder={DESC_PLACEHOLDERS[form.category] ?? "What's the vibe? (optional)"}
                  />

                  <div className="pt-1">
                    <label className="mb-1 block px-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#2a1c0c]">
                      Duration · max 24h
                    </label>
                    <GlassInputRaw
                      type="number"
                      min={1}
                      max={24}
                      value={String(form.duration_hours)}
                      onChange={(v) => {
                        const n = Math.min(24, Math.max(1, parseInt(v) || 1));
                        setForm({ ...form, duration_hours: n });
                      }}
                      suffix="hrs"
                    />
                    <p className="mt-2 px-1 text-[11px] text-[#3a2a18]">
                      Starts 10 min after you drop the pin. We'll pull a photo of the spot from Google Maps — or hand-pick one if there isn't one.
                    </p>
                  </div>
                </div>


                <motion.button
                  type="submit"
                  disabled={creating}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium text-white transition disabled:opacity-70"
                  style={{
                    background: "linear-gradient(180deg,#1a1614,#0a0908)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.14), 0 14px 28px -14px rgba(20,14,8,0.65)",
                  }}
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post gathering"}
                </motion.button>
              </div>
            </motion.form>
          </motion.div>

        )}
      </AnimatePresence>

      {/* Remove pin confirmation — glass modal */}
      <AnimatePresence>
        {showRemoveConfirm && myActivePin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-24 sm:items-center sm:pb-0"
            style={{
              background: "color-mix(in oklab, #1a1006 32%, transparent)",
              backdropFilter: "blur(14px) saturate(140%)",
              WebkitBackdropFilter: "blur(14px) saturate(140%)",
            }}
            onClick={() => !removing && setShowRemoveConfirm(false)}
          >
            <motion.div
              initial={{ y: 30, scale: 0.94, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[380px] overflow-hidden rounded-[26px] ring-1 ring-black/[0.06]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,251,242,0.92) 0%, rgba(250,240,220,0.88) 100%)",
                backdropFilter: "saturate(180%) blur(30px)",
                WebkitBackdropFilter: "saturate(180%) blur(30px)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.9), 0 30px 80px -20px rgba(60,42,20,0.5)",
              }}
            >
              <div className="flex flex-col items-center px-7 pb-6 pt-8 text-center">
                <motion.div
                  initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 20 }}
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                  style={{
                    background: "linear-gradient(180deg, #fef1e6, #fbdcc4)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 20px -8px rgba(232,90,60,0.35)",
                  }}
                >
                  <Trash2 className="h-6 w-6 text-[#c94a2a]" strokeWidth={2.2} />
                </motion.div>
                <h3 className="font-serif text-[26px] italic leading-[1] tracking-[-0.02em] text-[#0f0d0b]">
                  Remove pin?
                </h3>
                <p className="mt-2.5 text-[13.5px] leading-[1.5] tracking-[-0.005em] text-[#2a1c0c]">
                  "<span className="font-medium text-[#1a1614]">{myActivePin.title}</span>" will disappear from the map for everyone.
                </p>
              </div>

              <div className="flex gap-2 border-t border-black/[0.06] bg-white/25 px-4 py-4">
                <button
                  type="button"
                  onClick={() => setShowRemoveConfirm(false)}
                  disabled={removing}
                  className="flex-1 rounded-full py-3 text-[13.5px] font-semibold text-[#1a1614] ring-1 ring-black/[0.08] transition hover:bg-white/60 disabled:opacity-50"
                  style={{
                    background: "rgba(255,255,255,0.55)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  Keep it
                </button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={removeMyPin}
                  disabled={removing}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(232,90,60,0.7)] transition disabled:opacity-70"
                  style={{
                    background: "linear-gradient(180deg,#ff6a4c,#c94a2a)",
                  }}
                >
                  {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" strokeWidth={2.2} />}
                  {removing ? "Removing…" : "Remove"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

function CategoryChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      layout
      whileHover={{ y: -2, scale: 1.03 }}
      whileTap={{ scale: 0.92 }}
      animate={active ? { scale: 1.04 } : { scale: 1 }}
      onClick={onClick}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className="relative shrink-0 rounded-full px-4 py-2 text-[13px] font-medium tracking-[-0.008em]"
      style={{
        color: active ? "#fffaf0" : "#3d3120",
      }}
    >
      {active && (
        <motion.span
          layoutId="chipActive"
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className="absolute inset-0 -z-10 rounded-full"
          style={{
            background: "linear-gradient(180deg,#221a12,#0f0b07)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.12), 0 10px 24px -12px rgba(20,14,8,0.55)",
          }}
        />
      )}
      {!active && (
        <span
          className="absolute inset-0 -z-10 rounded-full ring-1 ring-[#3a2a12]/[0.06]"
          style={{
            background: "color-mix(in oklab, #fffaf0 68%, transparent)",
            backdropFilter: "saturate(180%) blur(20px)",
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        />
      )}
      <span className="relative">{children}</span>
    </motion.button>
  );
}


function ActivityCard({
  a,
  onClick,
  delay,
  active,
}: {
  a: Activity;
  onClick: () => void;
  delay: number;
  active?: boolean;
}) {
  return (
    <motion.button
      layout
      data-id={a.id}
      initial={{ opacity: 0, y: 18, filter: "blur(14px)", scale: 0.96 }}
      animate={{
        opacity: 1,
        y: active ? -4 : 0,
        filter: "blur(0px)",
        scale: active ? 1.02 : 0.97,
      }}
      exit={{ opacity: 0, y: -8, filter: "blur(14px)", scale: 0.96 }}
      transition={{
        delay,
        opacity: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        filter: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        y: { type: "spring", stiffness: 380, damping: 32, mass: 0.7 },
        scale: { type: "spring", stiffness: 380, damping: 30, mass: 0.7 },
      }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`group w-[260px] shrink-0 snap-center snap-always overflow-hidden rounded-[22px] text-left ring-1 ring-[#3a2a12]/[0.06] transition-shadow will-change-transform ${
        active ? "shadow-[0_28px_60px_-24px_rgba(50,34,15,0.42)]" : "shadow-[0_10px_28px_-18px_rgba(50,34,15,0.18)]"
      }`}
      style={{
        background: "color-mix(in oklab, #fffaf0 88%, transparent)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
      }}
    >
      <div
        className="h-36 w-full bg-cover bg-center transition-transform duration-[900ms] group-hover:scale-[1.04]"
        style={{ backgroundImage: `url(${a.cover_url ?? "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=75&auto=format"})` }}
      />
      <div className="p-4">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[#3a2a18]">{a.category}</p>
        <h3 className="mt-1 line-clamp-1 font-serif italic text-[19px] leading-tight tracking-[-0.02em] text-[#0f0d0b]">{a.title}</h3>
        <div className="mt-2 flex items-center gap-1.5 text-[11.5px] text-[#2a1c0c]">
          <MapPin className="h-3 w-3" strokeWidth={2} />
          <span className="line-clamp-1">{a.city}, {a.country}</span>
          <span className="mx-0.5">·</span>
          <span>{format(new Date(a.starts_at), "MMM d")}</span>
        </div>
      </div>
    </motion.button>

  );
}

const GLASS_INPUT_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.28)",
  border: "1px solid rgba(255,255,255,0.6)",
  backdropFilter: "blur(18px) saturate(180%)",
  WebkitBackdropFilter: "blur(18px) saturate(180%)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.75), inset 0 -1px 0 rgba(20,18,16,0.05), 0 4px 12px -8px rgba(60,42,20,0.15)",
};

function GlassInput({ value, onChange, placeholder, autoFocus }: {
  value: string; onChange: (v: string) => void; placeholder: string; autoFocus?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="h-[48px] w-full rounded-[12px] px-4 text-[15px] tracking-[-0.01em] text-[#0f0d0b] placeholder:text-[#6b5230] outline-none transition-all duration-300 focus:bg-white/45"
      style={GLASS_INPUT_STYLE}
    />
  );
}

function GlassTextarea({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      className="w-full resize-none rounded-[12px] px-4 py-3 text-[14px] tracking-[-0.01em] text-[#0f0d0b] placeholder:text-[#6b5230] outline-none transition-all duration-300 focus:bg-white/45"
      style={GLASS_INPUT_STYLE}
    />
  );
}

function GlassInputRaw({ value, onChange, type, min, max, suffix }: {
  value: string; onChange: (v: string) => void; type: string; min?: number; max?: number; suffix?: string;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="h-[46px] w-full rounded-[12px] px-3 text-[13.5px] text-[#0f0d0b] outline-none transition-all duration-300 focus:bg-white/45"
        style={GLASS_INPUT_STYLE}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#2a1c0c]">
          {suffix}
        </span>
      )}
    </div>
  );
}


```

## `src/routes/_authenticated/explore.tsx`

```tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Users, X, Plus, Minus, Loader2, Check, LocateFixed, Compass } from "lucide-react";
import { format } from "date-fns";
import { GoogleMap, type GoogleMapHandle } from "@/components/google-map";
import { MapTypeToggle, type MapView } from "@/components/map-type-toggle";
import { BottomNav } from "@/components/bottom-nav";
import { useActivities, type Activity } from "@/lib/activities";
import { CATEGORIES } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/use-user";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/explore")({
  head: () => ({
    meta: [
      { title: "Explore — Gobber" },
      { name: "description", content: "Surf the globe. Discover live gatherings pinned by nomads everywhere." },
    ],
  }),
  component: Explore,
});

type DropCoords = { lat: number; lng: number; city?: string; country?: string };

function Explore() {
  const { data: activities = [] } = useActivities();
  const [category, setCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dropMode, setDropMode] = useState(false);
  const [drop, setDrop] = useState<DropCoords | null>(null);
  const [mapView, setMapView] = useState<MapView>("satellite");
  const [heading, setHeading] = useState(0);
  const [locating, setLocating] = useState(false);
  const mapRef = useRef<GoogleMapHandle>(null);
  const navigate = useNavigate();

  async function handleLocate() {
    setLocating(true);
    try {
      await mapRef.current?.locate();
    } finally {
      setLocating(false);
    }
  }


  const filtered = useMemo(
    () => activities.filter((a) => (category ? a.category === category : true)),
    [activities, category],
  );

  const pins = useMemo(
    () => filtered.map((a) => ({ id: a.id, lat: a.lat, lng: a.lng, label: a.title, category: a.category })),
    [filtered],
  );
  const selected = selectedId ? activities.find((a) => a.id === selectedId) ?? null : null;


  async function handleDrop(c: { lng: number; lat: number }) {
    setDrop({ lat: c.lat, lng: c.lng });
    setSelectedId(null);
    setDropMode(true);
    // Reverse geocode (best-effort)
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${c.lat}&lon=${c.lng}`);
      const j = await r.json();
      const addr = j.address ?? {};
      setDrop({
        lat: c.lat,
        lng: c.lng,
        city: addr.city || addr.town || addr.village || addr.hamlet || addr.state || "Somewhere",
        country: addr.country ?? "",
      });
    } catch {
      setDrop({ lat: c.lat, lng: c.lng, city: "Somewhere", country: "" });
    }
  }

  async function handleMapClick(c: { lng: number; lat: number }) {
    if (!dropMode) return;
    await handleDrop(c);
  }

  function cancelDrop() {
    setDrop(null);
    setDropMode(false);
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      <GoogleMap
        ref={mapRef}
        pins={pins}
        mapTypeId={mapView}
        center={{ lat: 25, lng: 10 }}
        zoom={2}
        className="absolute inset-0"
        cursor={dropMode ? "crosshair" : "default"}
        onPinClick={(id: string) => { if (!dropMode) setSelectedId(id); }}
        onMapClick={dropMode ? handleMapClick : undefined}
        onLongPress={(c) => { if (!dropMode) handleDrop(c); }}
        ghostPin={drop}
        onHeadingChange={setHeading}
      />

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-52 bg-gradient-to-b from-background/60 via-background/10 to-transparent" />

      {/* Left flank: zoom stack */}
      <div className="absolute bottom-32 left-5 z-30 sm:left-7">
        <div
          className="flex flex-col overflow-hidden rounded-2xl bg-white/85 ring-1 ring-black/[0.06] shadow-[0_18px_36px_-14px_rgba(60,42,20,0.28)]"
          style={{ backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)" }}
        >
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => mapRef.current?.zoomIn()}
            className="flex h-11 w-11 items-center justify-center text-[#1a1614] transition hover:bg-black/5"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
          </motion.button>
          <div className="mx-2 h-px bg-black/[0.08]" />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => mapRef.current?.zoomOut()}
            className="flex h-11 w-11 items-center justify-center text-[#1a1614] transition hover:bg-black/5"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" strokeWidth={2.2} />
          </motion.button>
        </div>
      </div>

      {/* Right flank: locate + compass — mirrors the zoom stack */}
      <div className="absolute bottom-32 right-5 z-30 flex flex-col gap-2 sm:right-7">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleLocate}
          disabled={locating}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-[#1a1614] ring-1 ring-black/[0.06] shadow-[0_18px_36px_-14px_rgba(60,42,20,0.28)] transition hover:bg-white"
          style={{ backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)" }}
          aria-label="My location"
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" strokeWidth={2.2} />}
        </motion.button>
        <AnimatePresence>
          {Math.abs(heading) > 1 && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => mapRef.current?.resetHeading()}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 ring-1 ring-black/[0.06] shadow-[0_18px_36px_-14px_rgba(60,42,20,0.28)]"
              style={{ backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)" }}
              aria-label="Reset north"
            >
              <Compass className="h-4 w-4 text-[#1a1614]" style={{ transform: `rotate(${-heading}deg)` }} strokeWidth={2} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>



      {/* Drop-mode banner */}
      <AnimatePresence>
        {dropMode && !drop && (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="absolute inset-x-0 top-0 z-30 flex justify-center px-4 pt-3"
          >
            <div className="flex items-center gap-3 rounded-full bg-primary/95 px-4 py-2 text-xs font-medium text-primary-foreground shadow-float backdrop-blur">
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-white" />
              Tap anywhere on the map to drop your pin
              <button onClick={cancelDrop} className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wider">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top-left flank: Drop-a-pin FAB — mirrors the notification bell top-right */}
      <div className="absolute left-5 top-5 z-30 sm:left-7">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => { setDropMode((v) => !v); setDrop(null); setSelectedId(null); }}
          aria-pressed={dropMode}
          aria-label={dropMode ? "Cancel pin" : "Drop a pin"}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-[#1a1614] ring-1 ring-black/[0.06] shadow-[0_18px_36px_-14px_rgba(60,42,20,0.28)] transition hover:bg-white"
          style={{ backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)" }}
        >
          <Plus className={`h-4 w-4 transition-transform ${dropMode ? "rotate-45" : ""}`} strokeWidth={2.2} aria-hidden="true" />
        </motion.button>
      </div>

      {/* Header — editorial, centered */}
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 mx-auto w-full max-w-[720px] px-5 pt-9 sm:px-7"
      >
        <div className="flex flex-col items-center text-center">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.3em] text-[#3a2a12]">Right now</p>
          <h1 className="mt-1.5 font-serif italic text-[44px] leading-[0.95] tracking-[-0.03em] text-[#0b0906] drop-shadow-[0_1px_0_rgba(255,255,255,0.55)] sm:text-[52px]">
            Explore.
          </h1>
          <div className="mt-4">
            <MapTypeToggle value={mapView} onChange={setMapView} />
          </div>

          <div
            className="relative mt-5 w-full"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0, #000 32px, #000 calc(100% - 32px), transparent 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0, #000 32px, #000 calc(100% - 32px), transparent 100%)",
            }}
          >
            <div
              className="mx-auto flex w-max max-w-full justify-center gap-2 overflow-x-auto px-8 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="tablist"
              aria-label="Filter by category"
            >
              <button
                onClick={() => setCategory(null)}
                role="tab"
                aria-selected={!category}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold tracking-[-0.005em] ring-1 transition ${
                  !category
                    ? "bg-[#1a1108] text-[#fff7e8] ring-black/10 shadow-[0_10px_22px_-12px_rgba(20,12,4,0.55)]"
                    : "bg-white/70 text-[#2a1c0c] ring-black/[0.06] backdrop-blur-xl shadow-[0_6px_16px_-10px_rgba(60,40,14,0.28)]"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id === category ? null : c.id)}
                  role="tab"
                  aria-selected={category === c.id}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold tracking-[-0.005em] ring-1 transition ${
                    category === c.id
                      ? "bg-[#1a1108] text-[#fff7e8] ring-black/10 shadow-[0_10px_22px_-12px_rgba(20,12,4,0.55)]"
                      : "bg-white/70 text-[#2a1c0c] ring-black/[0.06] backdrop-blur-xl shadow-[0_6px_16px_-10px_rgba(60,40,14,0.28)]"
                  }`}
                >
                  <span className="mr-1" aria-hidden="true">{c.icon}</span>{c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>



      {/* Stat chip */}
      {!dropMode && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute inset-x-0 bottom-40 z-10 mx-auto w-fit rounded-full px-4 py-1.5 text-[11.5px] font-semibold tracking-[-0.005em] text-[#1a1108] ring-1 ring-black/[0.06]"
          style={{
            background: "linear-gradient(180deg, rgba(255,252,246,0.88) 0%, rgba(246,238,224,0.78) 100%)",
            backdropFilter: "saturate(180%) blur(22px)",
            boxShadow:
              "0 18px 40px -20px rgba(60,40,14,0.4), 0 1px 0 rgba(255,255,255,0.9) inset",
          }}
        >
          {filtered.length > 0
            ? `${filtered.length} gathering${filtered.length === 1 ? "" : "s"} pinned worldwide`
            : "Nothing pinned yet — tap Drop a pin to start"}
        </motion.div>
      )}


      {/* Quick create sheet */}
      <AnimatePresence>
        {drop && (
          <QuickCreate
            drop={drop}
            onClose={cancelDrop}
            onCreated={(id) => {
              cancelDrop();
              navigate({ to: "/activity/$id", params: { id } });
            }}
          />
        )}
      </AnimatePresence>

      {/* Selected activity glass card */}
      <AnimatePresence>
        {selected && !drop && (
          <motion.div
            key={selected.id}
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="absolute inset-x-4 bottom-28 z-20 sm:inset-x-auto sm:right-6 sm:left-auto sm:bottom-28 sm:w-96"
          >
            <div className="overflow-hidden rounded-3xl glass shadow-float">
              <div className="relative h-40 w-full overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${selected.cover_url ?? "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=75&auto=format"})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <button
                  onClick={() => setSelectedId(null)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/25 backdrop-blur-xl ring-1 ring-white/50 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute left-4 bottom-3 text-white">
                  <p className="text-[10px] font-medium uppercase tracking-widest opacity-90">{selected.category}</p>
                  <h3 className="text-lg font-semibold leading-tight">{selected.title}</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{selected.city}, {selected.country}</span>
                  <span>·</span>
                  <span>{format(new Date(selected.starts_at), "MMM d, p")}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{selected.max_spots}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{selected.description}</p>
                <button
                  onClick={() => navigate({ to: "/activity/$id", params: { id: selected.id } })}
                  className="mt-3 w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:-translate-y-0.5"
                >
                  View gathering
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recently pinned rail — only when we actually have pins and no overlay */}
      {!selected && !drop && filtered.length > 0 && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 26 }}
          className="absolute inset-x-0 bottom-24 z-10 px-4 sm:px-6"
        >
          <div className="mb-2.5 flex items-baseline justify-between px-1">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-[#2a1c0c] drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">Recently pinned</p>
            <span className="text-[10.5px] font-medium tracking-wide text-[#5c4527] drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">Tap a pin to preview</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filtered.slice(0, 10).map((a) => (
              <MiniCard key={a.id} a={a} onClick={() => setSelectedId(a.id)} />
            ))}
          </div>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
}

function MiniCard({ a, onClick }: { a: Activity; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-60 shrink-0 items-center gap-3 rounded-2xl p-2 pr-3.5 text-left ring-1 ring-black/[0.06] transition hover:-translate-y-0.5"
      style={{
        background: "linear-gradient(180deg, rgba(255,252,246,0.9) 0%, rgba(246,238,224,0.8) 100%)",
        backdropFilter: "saturate(180%) blur(22px)",
        boxShadow:
          "0 18px 40px -22px rgba(60,40,14,0.42), 0 1px 0 rgba(255,255,255,0.9) inset",
      }}
    >
      <div
        className="h-14 w-14 shrink-0 rounded-xl bg-cover bg-center ring-1 ring-black/5"
        style={{ backgroundImage: `url(${a.cover_url ?? "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=70&auto=format"})` }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#7a3f16]">{a.category}</p>
        <h4 className="line-clamp-1 text-[13.5px] font-semibold tracking-[-0.01em] text-[#0f0a05]">{a.title}</h4>
        <p className="line-clamp-1 text-[11px] font-medium text-[#5c4527]">{a.city}, {a.country}</p>
      </div>
    </button>
  );
}


function QuickCreate({
  drop,
  onClose,
  onCreated,
}: {
  drop: DropCoords;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const { user } = useUser();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Dinner",
    starts_at: "",
    max_spots: 6,
    cover_url: "",
  });

  const geocoded = drop.city || drop.country;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("activities")
        .insert({
          host_id: user.id,
          title: form.title,
          description: form.description,
          category: form.category,
          city: drop.city || "Somewhere",
          country: drop.country || "—",
          lat: drop.lat,
          lng: drop.lng,
          starts_at: new Date(form.starts_at).toISOString(),
          max_spots: form.max_spots,
          cover_url: form.cover_url || null,
        })
        .select()
        .single();
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Pinned to the globe ✨");
      onCreated(data.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ y: 260, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 260, opacity: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 28 }}
      className="absolute inset-x-3 bottom-24 z-30 sm:inset-x-auto sm:right-6 sm:left-auto sm:bottom-24 sm:w-[26rem]"
    >
      <div className="overflow-hidden rounded-3xl glass shadow-float">
        <div className="flex items-start justify-between gap-3 border-b border-white/40 p-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-clay">New gathering</p>
            <h3 className="text-base font-semibold text-ink">
              {geocoded ? `${drop.city}${drop.country ? `, ${drop.country}` : ""}` : "Locating…"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {drop.lat.toFixed(3)}, {drop.lng.toFixed(3)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/60 backdrop-blur ring-1 ring-white/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3 p-4">
          <Input
            required
            placeholder="Title (e.g. Sunset ramen)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="h-10 rounded-xl bg-white/70"
          />
          <Textarea
            required
            rows={2}
            placeholder="What's the vibe?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-xl bg-white/70"
          />
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setForm({ ...form, category: c.id })}
                className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                  form.category === c.id ? "bg-primary text-primary-foreground" : "bg-white/60 text-foreground"
                }`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              required
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              className="h-10 rounded-xl bg-white/70"
            />
            <Input
              required
              type="number"
              min={2}
              max={30}
              value={form.max_spots}
              onChange={(e) => setForm({ ...form, max_spots: parseInt(e.target.value) || 6 })}
              className="h-10 rounded-xl bg-white/70"
            />
          </div>
          <Input
            placeholder="Cover image URL (optional)"
            value={form.cover_url}
            onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
            className="h-10 rounded-xl bg-white/70"
          />
          <button
            type="submit"
            disabled={loading || !geocoded}
            className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Pin this gathering
          </button>
        </form>
      </div>
    </motion.div>
  );
}

```

## `src/routes/_authenticated/host.tsx`

```tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "@/lib/categories";
import { BottomNav } from "@/components/bottom-nav";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/host")({
  head: () => ({ meta: [{ title: "Host a gathering — Gobber" }] }),
  component: HostPage,
});

function HostPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [form, setForm] = useState({
    title: "", description: "", category: "Dinner",
    city: "", country: "", starts_at: "", max_spots: 6,
    cover_url: "",
  });
  const [loading, setLoading] = useState(false);

  async function geocodeCity(): Promise<{ lat: number; lng: number } | null> {
    if (!form.city) return null;
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(`${form.city}, ${form.country}`)}`);
      const arr = await r.json();
      if (arr[0]) return { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) };
    } catch {}
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const coords = await geocodeCity();
      if (!coords) { toast.error("Couldn't find that city. Try again."); setLoading(false); return; }
      const { data, error } = await supabase.from("activities").insert({
        host_id: user.id,
        title: form.title,
        description: form.description,
        category: form.category,
        city: form.city,
        country: form.country,
        lat: coords.lat, lng: coords.lng,
        starts_at: new Date(form.starts_at).toISOString(),
        max_spots: form.max_spots,
        cover_url: form.cover_url || null,
      }).select().single();
      if (error) throw error;
      toast.success("Gathering posted ✨");
      navigate({ to: "/activity/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-32">
      <div className="mx-auto max-w-md px-5 pt-8">
        <button onClick={() => navigate({ to: "/discover" })} className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Host</p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">A new gathering</h1>
          <p className="mt-1 text-sm text-muted-foreground">What are you gathering strangers for?</p>
        </motion.div>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <Field label="Title"><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sunset ramen in Shibuya" className="h-11 rounded-xl" /></Field>
          <Field label="Description"><Textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What will the vibe be?" className="rounded-xl" /></Field>
          <Field label="Category">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c.id} type="button" onClick={() => setForm({ ...form, category: c.id })}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${form.category === c.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City"><Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Lisbon" className="h-11 rounded-xl" /></Field>
            <Field label="Country"><Input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Portugal" className="h-11 rounded-xl" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="When"><Input required type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="h-11 rounded-xl" /></Field>
            <Field label="Max spots"><Input required type="number" min={2} max={30} value={form.max_spots} onChange={(e) => setForm({ ...form, max_spots: parseInt(e.target.value) || 6 })} className="h-11 rounded-xl" /></Field>
          </div>
          <Field label="Cover image URL (optional)"><Input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} placeholder="https://..." className="h-11 rounded-xl" /></Field>

          <Button type="submit" disabled={loading} className="h-12 w-full rounded-full text-base font-medium">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post gathering"}
          </Button>
        </form>
      </div>
      <BottomNav />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-medium">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

```

## `src/routes/_authenticated/profile.tsx`

```tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Loader2, AtSign, Pencil, ChevronDown } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { supabase } from "@/integrations/supabase/client";
import { useMyRsvps, useActivities } from "@/lib/activities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BottomNav } from "@/components/bottom-nav";
import { FriendsPanel } from "@/components/friends-panel";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Gobber" }] }),
  component: Profile,
});

function Profile() {
  const { user } = useUser();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: rsvps = [] } = useMyRsvps(user?.id);
  const { data: activities = [] } = useActivities();
  const [profile, setProfile] = useState<{ display_name: string; bio: string; home_city: string; avatar_url: string; username: string }>({ display_name: "", bio: "", home_city: "", avatar_url: "", username: "" });
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setProfile({ display_name: data.display_name ?? "", bio: data.bio ?? "", home_city: data.home_city ?? "", avatar_url: data.avatar_url ?? "", username: (data as any).username ?? "" });
    });
  }, [user]);

  const citiesVisited = new Set(activities.filter((a) => rsvps.some((r) => r.activity_id === a.id) || a.host_id === user?.id).map((a) => a.city)).size;
  const gatheringsJoined = rsvps.length;

  async function save() {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update(profile).eq("id", user.id);
    if (error) toast.error(error.message); else toast.success("Profile saved");
    setLoading(false);
  }

  async function signOut() {
    setSigningOut(true);
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initials = (profile.display_name || user?.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-[100dvh] bg-background pb-32">
      <div className="mx-auto max-w-md px-5 pt-8">
        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cover bg-center text-2xl font-semibold text-primary-foreground shadow-float"
            style={{ backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))" }}>
            {!profile.avatar_url && initials}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{profile.display_name || "Traveler"}</h1>
            {profile.username && (
              <p className="flex items-center gap-0.5 text-sm text-muted-foreground"><AtSign className="h-3.5 w-3.5" />{profile.username}</p>
            )}
            {profile.home_city && <p className="text-xs text-muted-foreground">{profile.home_city}</p>}
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <StatCard n={gatheringsJoined} label="Gatherings joined" />
          <StatCard n={citiesVisited} label="Cities on the map" />
        </div>

        <div className="mt-6">
          <FriendsPanel />
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl bg-card shadow-glass">
          <button
            onClick={() => setEditOpen((v) => !v)}
            className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-black/[0.02]"
            aria-expanded={editOpen}
          >
            <span className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-ink"><Pencil className="h-3.5 w-3.5" /></span>
              <span className="text-[15px] font-semibold text-ink">Edit profile</span>
            </span>
            <motion.span animate={{ rotate: editOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} className="text-muted-foreground">
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </button>
          <motion.div
            initial={false}
            animate={{ height: editOpen ? "auto" : 0, opacity: editOpen ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
            style={{ overflow: "hidden" }}
          >
            <div className="space-y-4 px-5 pb-5">
              <div><Label className="text-xs">Display name</Label><Input value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} className="mt-1 h-11 rounded-xl" /></div>
              <div><Label className="text-xs">Home city</Label><Input value={profile.home_city} onChange={(e) => setProfile({ ...profile, home_city: e.target.value })} className="mt-1 h-11 rounded-xl" placeholder="Lisbon" /></div>
              <div><Label className="text-xs">Avatar URL</Label><Input value={profile.avatar_url} onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })} className="mt-1 h-11 rounded-xl" placeholder="https://..." /></div>
              <div><Label className="text-xs">Bio</Label><Textarea rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="mt-1 rounded-xl" placeholder="I collect sunsets and third-wave coffee." /></div>
              <Button onClick={save} disabled={loading} className="h-11 w-full rounded-xl">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
            </div>
          </motion.div>
        </div>




        <Button onClick={signOut} disabled={signingOut} variant="ghost" className="mt-4 h-11 w-full rounded-xl text-muted-foreground">
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
      <BottomNav />
    </div>
  );
}

function StatCard({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-glass">
      <p className="text-3xl font-semibold tracking-tight text-ink">{n}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

```

## `src/routes/_authenticated/route.tsx`

```tsx
import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { UsernameOnboarding } from "@/components/username-onboarding";
import { NotificationBell } from "@/components/notification-bell";
import { MessageBell } from "@/components/message-bell";


export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedShell,
});

// Order of primary tabs — used to decide slide direction so navigation
// between adjacent tabs feels spatial (left/right) rather than random.
const TAB_ORDER = ["/discover", "/explore", "/host", "/trips", "/profile"];

function tabIndex(pathname: string) {
  const match = TAB_ORDER.findIndex((p) => pathname === p || pathname.startsWith(p + "/"));
  return match === -1 ? 0 : match;
}

function AuthenticatedShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Key by top-level segment so nested routes (e.g. /activity/$id) don't
  // re-mount on every param change but tab switches do animate.
  const segment = "/" + (pathname.split("/")[1] ?? "");
  const idx = tabIndex(segment);

  return (
    <>
      <AnimatePresence mode="popLayout" initial={false} custom={idx}>
        <motion.div
          key={segment}
          custom={idx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          style={{ minHeight: "100dvh", willChange: "opacity, transform" }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      <NotificationBell />
      <MessageBell />

      <UsernameOnboarding />
    </>
  );
}

```

## `src/routes/_authenticated/trips.tsx`

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { format } from "date-fns";
import { useUser } from "@/hooks/use-user";
import { useMyRsvps } from "@/lib/activities";
import { useActivities } from "@/lib/activities";
import { BottomNav } from "@/components/bottom-nav";

export const Route = createFileRoute("/_authenticated/trips")({
  head: () => ({ meta: [{ title: "My Trips — Gobber" }] }),
  component: Trips,
});

function Trips() {
  const { user } = useUser();
  const { data: rsvps = [] } = useMyRsvps(user?.id);
  const { data: activities = [] } = useActivities();

  const now = Date.now();
  const joined = activities.filter((a) => rsvps.some((r) => r.activity_id === a.id));
  const hosted = user ? activities.filter((a) => a.host_id === user.id) : [];
  const upcoming = [...joined, ...hosted].filter((a) => new Date(a.starts_at).getTime() >= now)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const past = [...joined, ...hosted].filter((a) => new Date(a.starts_at).getTime() < now);

  return (
    <div className="min-h-[100dvh] bg-background pb-32">
      <div className="mx-auto max-w-md px-5 pt-8">
        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">My</p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Trips</h1>
        </motion.div>

        <Section title="Upcoming" items={upcoming} empty="Nothing on the horizon yet. Head to Discover." />
        <Section title="Past" items={past} empty="No memories to look back on yet." />
      </div>
      <BottomNav />
    </div>
  );
}

function Section({ title, items, empty }: { title: string; items: any[]; empty: string }) {
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      {items.length === 0 ? (
        <p className="rounded-2xl bg-secondary/60 p-6 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <Link key={a.id} to="/activity/$id" params={{ id: a.id }} className="flex gap-3 rounded-2xl bg-card p-3 shadow-glass transition hover:-translate-y-0.5">
              <div className="h-16 w-16 shrink-0 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${a.cover_url ?? ""})` }} />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-widest text-clay">{a.category}</p>
                <h3 className="line-clamp-1 text-sm font-semibold text-ink">{a.title}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" />{a.city} · {format(new Date(a.starts_at), "MMM d, h:mm a")}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

```

## `src/routes/_authenticated/u.$username.tsx`

```tsx
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, AtSign, MapPin, Loader2, MoreHorizontal, Ban, Check, UserPlus, ShieldOff } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  useFollowCounts,
  useFollowMutation,
  useIsFollowing,
  useFollowsMe,
  useIsBlocked,
  useBlockMutation,
  type ProfileLite,
} from "@/lib/follows";
import { BottomNav } from "@/components/bottom-nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/u/$username")({
  head: ({ params }) => ({ meta: [{ title: `@${params.username} — Gobber` }] }),
  component: UserProfile,
});

type FullProfile = ProfileLite & { bio: string | null };

function UserProfile() {
  const { username } = Route.useParams();
  const navigate = useNavigate();
  const { user: me } = useUser();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", "public", username.toLowerCase()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, home_city, bio")
        .ilike("username", username)
        .maybeSingle();
      if (error) throw error;
      return data as FullProfile | null;
    },
  });

  const isMe = me?.id && profile?.id === me.id;
  const { data: counts } = useFollowCounts(profile?.id);
  const { data: isFollowing } = useIsFollowing(me?.id, profile?.id);
  const { data: followsMe } = useFollowsMe(me?.id, profile?.id);
  const { data: isBlocked } = useIsBlocked(me?.id, profile?.id);
  const followMut = useFollowMutation(me?.id);
  const blockMut = useBlockMutation(me?.id);

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (error || !profile) {
    return (
      <div className="mx-auto max-w-md px-5 pt-16 text-center">
        <p className="text-lg font-semibold text-ink">User not found</p>
        <p className="mt-1 text-sm text-muted-foreground">@{username} doesn't exist on Gobber.</p>
        <button onClick={() => navigate({ to: "/discover" })} className="mt-6 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
          Back to Discover
        </button>
      </div>
    );
  }

  const initials = (profile.display_name || profile.username).slice(0, 2).toUpperCase();

  async function handleBlock() {
    const currentlyBlocked = !!isBlocked;
    await blockMut.mutateAsync({ targetId: profile!.id, block: !currentlyBlocked });
    toast.success(currentlyBlocked ? `Unblocked @${profile!.username}` : `Blocked @${profile!.username}`);
  }

  async function handleShare() {
    const url = `${window.location.origin}/u/${profile!.username}`;
    try {
      if (navigator.share) await navigator.share({ url, title: `@${profile!.username} on Gobber` });
      else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
    } catch {}
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-32">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/[0.04] bg-background/80 px-4 py-3 backdrop-blur-xl">
        <button onClick={() => history.length > 1 ? history.back() : navigate({ to: "/discover" })} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary/60">
          <ArrowLeft className="h-4 w-4 text-ink" />
        </button>
        <p className="flex items-center gap-0.5 text-[15px] font-semibold text-ink">
          <AtSign className="h-3.5 w-3.5 text-muted-foreground" />{profile.username}
        </p>
        {!isMe ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary/60" aria-label="More">
              <MoreHorizontal className="h-4 w-4 text-ink" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem onClick={handleShare}>Share profile</DropdownMenuItem>
              <DropdownMenuItem onClick={handleBlock} className={isBlocked ? "" : "text-destructive focus:text-destructive"}>
                {isBlocked ? (<><ShieldOff className="mr-2 h-4 w-4" /> Unblock</>) : (<><Ban className="mr-2 h-4 w-4" /> Block @{profile.username}</>)}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : <div className="h-9 w-9" />}
      </div>

      <div className="mx-auto max-w-md px-5 pt-6">
        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center text-center">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full bg-cover bg-center text-2xl font-semibold text-white shadow-float ring-2 ring-white"
            style={{ backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))" }}
          >
            {!profile.avatar_url && initials}
          </div>
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-ink">{profile.display_name || profile.username}</h1>
          <div className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="flex items-center"><AtSign className="h-3 w-3" />{profile.username}</span>
            {followsMe && !isMe && <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium">Follows you</span>}
          </div>
          {profile.home_city && (
            <p className="mt-2 flex items-center gap-1 text-[13px] text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{profile.home_city}</p>
          )}
          {profile.bio && <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-ink/90">{profile.bio}</p>}
        </motion.div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card p-4 text-center shadow-glass">
            <p className="text-2xl font-semibold text-ink">{counts?.followers ?? 0}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div className="rounded-2xl bg-card p-4 text-center shadow-glass">
            <p className="text-2xl font-semibold text-ink">{counts?.following ?? 0}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
        </div>

        {/* Actions */}
        {!isMe && (
          <div className="mt-4 flex gap-2">
            {isBlocked ? (
              <button
                onClick={handleBlock}
                disabled={blockMut.isPending}
                className="h-11 flex-1 rounded-xl bg-secondary text-[14px] font-semibold text-ink disabled:opacity-60"
              >
                {blockMut.isPending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Unblock"}
              </button>
            ) : (
              <FollowCTA
                isFollowing={!!isFollowing}
                followsMe={!!followsMe}
                loading={followMut.isPending}
                onClick={() => followMut.mutate({ targetId: profile.id, follow: !isFollowing })}
              />
            )}
            <button
              onClick={handleShare}
              className="h-11 rounded-xl bg-secondary px-4 text-[14px] font-semibold text-ink"
            >
              Share
            </button>
          </div>
        )}

        {isMe && (
          <Link
            to="/profile"
            className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-secondary text-[14px] font-semibold text-ink"
          >
            Edit your profile
          </Link>
        )}

        {isBlocked && (
          <p className="mt-6 rounded-2xl bg-secondary/70 p-4 text-center text-[12px] text-muted-foreground">
            You've blocked @{profile.username}. They can't follow you and you won't see their activity.
          </p>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function FollowCTA({ isFollowing, followsMe, loading, onClick }: { isFollowing: boolean; followsMe: boolean; loading: boolean; onClick: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const label = isFollowing ? "Following" : followsMe ? "Follow back" : "Follow";
  const filled = !isFollowing;

  function handle() {
    if (isFollowing && !confirm) { setConfirm(true); setTimeout(() => setConfirm(false), 2500); return; }
    setConfirm(false);
    onClick();
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={handle}
      disabled={loading}
      className={`h-11 flex-1 rounded-xl text-[14px] font-semibold inline-flex items-center justify-center gap-1.5 transition disabled:opacity-60 ${
        filled ? "bg-primary text-primary-foreground shadow-sm" : confirm ? "bg-destructive/10 text-destructive" : "bg-secondary text-ink"
      }`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isFollowing ? (
        confirm ? <>Tap again to unfollow</> : <><Check className="h-4 w-4" /> {label}</>
      ) : <><UserPlus className="h-4 w-4" /> {label}</>}
    </motion.button>
  );
}

```

## `src/routes/auth.tsx`

```tsx
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";


export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/discover" });
  },
  head: () => ({
    meta: [
      { title: "Sign in — Gobber" },
      { name: "description", content: "Sign in to Gobber to host or join gatherings near you." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

const EASE = [0.22, 1, 0.36, 1] as const;

/** iCloud-style animated cloud mark — clean, minimal, breathing softly. */
function CloudMark() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.1, ease: EASE }}
      className="relative mx-auto"
      style={{ width: 128, height: 128 }}
      aria-hidden
    >
      {/* Soft warm halo behind the cloud */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,232,190,0.55) 0%, rgba(255,232,190,0) 70%)",
          filter: "blur(6px)",
        }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
      />
      <motion.svg
        viewBox="0 0 128 128"
        className="relative h-full w-full"
        animate={{ y: [0, -3, 0, 2, 0] }}
        transition={{ duration: 6.2, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
      >
        <defs>
          <linearGradient id="cloud-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#fbf3e2" />
          </linearGradient>
          <linearGradient id="cloud-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a08a68" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#8a6b45" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        {/* Classic rounded cloud silhouette */}
        <path
          d="M40 88c-11 0-20-8.6-20-19.5S29 49 40 49c1.1 0 2.2.1 3.3.3C46 38.6 55.8 31 67 31c13.2 0 24 10.4 24 23.2 0 .8 0 1.6-.1 2.4 1.3-.3 2.7-.5 4.1-.5 9.9 0 18 7.8 18 17.4S105 91 95.1 91H40z"
          fill="url(#cloud-fill)"
          stroke="url(#cloud-stroke)"
          strokeWidth="1.5"
          style={{
            filter:
              "drop-shadow(0 12px 24px rgba(78,52,22,0.18)) drop-shadow(0 2px 4px rgba(78,52,22,0.08))",
          }}
        />
        {/* Inner highlight */}
        <path
          d="M46 58c4-8 12-14 22-14"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.9"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </motion.svg>
    </motion.div>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.44 2.23-1.17 3.03-.79.87-2.07 1.54-3.13 1.46-.13-1.11.42-2.28 1.13-3.02.79-.83 2.15-1.45 3.17-1.47zM20.5 17.02c-.55 1.26-.82 1.83-1.54 2.95-1 1.55-2.41 3.48-4.16 3.5-1.56.01-1.96-1.01-4.07-1-2.11.01-2.55 1.02-4.11 1.01-1.75-.02-3.09-1.76-4.09-3.3-2.8-4.31-3.09-9.37-1.36-12.06 1.22-1.91 3.15-3.03 4.97-3.03 1.84 0 3 1 4.52 1s2.45-1 4.58-1c1.62 0 3.33.88 4.55 2.4-3.99 2.19-3.34 7.9.71 9.53z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

/** iCloud-style single-line input with inline chevron submit. */
function InlineField({
  type,
  placeholder,
  value,
  onChange,
  autoFocus,
  onSubmit,
  submitting,
  showSubmit,
  autoComplete,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  onSubmit?: () => void;
  submitting?: boolean;
  showSubmit?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSubmit) {
            e.preventDefault();
            onSubmit();
          }
        }}
        className="h-[46px] w-full rounded-[10px] border border-[#1a1614]/12 bg-white/85 px-4 pr-12 text-[15px] tracking-[-0.01em] text-[#0f0d0b] placeholder:text-[#a89676] outline-none transition focus:border-[#8a6b45]/50 focus:bg-white"
      />
      {showSubmit && (
        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={submitting || !value}
          whileTap={{ scale: 0.92 }}
          className="absolute right-1.5 top-1/2 flex h-[36px] w-[36px] -translate-y-1/2 items-center justify-center rounded-full bg-[#0f0d0b] text-white transition disabled:opacity-30"
          aria-label="Continue"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          )}
        </motion.button>
      )}
    </div>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState<null | "apple" | "google" | "form">(null);

  async function handleEmailContinue() {
    if (!email) return;
    setStep("password");
  }

  async function submit() {
    setLoading("form");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Welcome to Gobber");
        navigate({ to: "/discover" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/discover" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  async function google() {
    setLoading("google");
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) { toast.error(res.error.message ?? "Google sign-in failed"); setLoading(null); return; }
    if (res.redirected) return;
    navigate({ to: "/discover" });
  }

  async function apple() {
    setLoading("apple");
    const res = await lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin });
    if (res.error) { toast.error(res.error.message ?? "Apple sign-in failed"); setLoading(null); return; }
    if (res.redirected) return;
    navigate({ to: "/discover" });
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10"
      style={{
        background:
          "radial-gradient(1200px 800px at 50% -10%, #fdf7e8 0%, transparent 55%)," +
          "linear-gradient(180deg, #f6efdd 0%, #f0e6cd 100%)",
      }}
    >
      {/* subtle grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-multiply"
        style={{
          backgroundImage: "radial-gradient(rgba(139,111,74,0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Ambient aurora — blurred backdrop behind the card */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ filter: "blur(24px)" }}>
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "min(92vw, 780px)",
            height: "min(92vw, 780px)",
            borderRadius: "50%",
            background:
              "radial-gradient(closest-side, rgba(122,155,205,0.32) 0%, rgba(214,168,110,0.20) 38%, rgba(155,185,150,0.12) 62%, transparent 78%)",
          }}
          animate={{ scale: [1, 1.05, 1], rotate: [0, 12, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "min(60vw, 520px)",
            height: "min(60vw, 520px)",
            borderRadius: "50%",
            background:
              "radial-gradient(closest-side, rgba(255,238,200,0.6) 0%, rgba(255,224,170,0.20) 45%, transparent 72%)",
            mixBlendMode: "screen",
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 9, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
        />
      </div>

      {/* Auth card — front and center */}

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: EASE }}
        className="relative z-10 w-full max-w-[380px] overflow-hidden rounded-[26px]"
        style={{
          background: "rgba(255,253,247,0.82)",
          backdropFilter: "saturate(180%) blur(40px)",
          border: "1px solid rgba(255,255,255,0.75)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.9) inset, 0 40px 90px -30px rgba(60,42,20,0.4), 0 10px 30px -18px rgba(60,42,20,0.18)",
        }}
      >


              <div className="px-7 pt-10 pb-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
                  className="space-y-2.5 text-left"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {step === "email" ? (
                      <motion.div
                        key="email"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="space-y-2.5"
                      >
                        {mode === "signup" && (
                          <InlineField
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={setName}
                            autoComplete="name"
                          />
                        )}
                        <InlineField
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={setEmail}
                          autoFocus
                          autoComplete="email"
                          showSubmit
                          onSubmit={handleEmailContinue}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="password"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between px-1 text-[12.5px] text-[#8a7a5f]">
                          <span className="truncate">{email}</span>
                          <button
                            onClick={() => setStep("email")}
                            className="text-[#8a6b45] hover:underline"
                          >
                            Change
                          </button>
                        </div>
                        <InlineField
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={setPassword}
                          autoFocus
                          autoComplete={mode === "signin" ? "current-password" : "new-password"}
                          showSubmit
                          submitting={loading === "form"}
                          onSubmit={submit}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Divider */}
                <div className="mt-6 flex items-center gap-3">
                  <span className="h-px flex-1 bg-[#1a1614]/10" />
                  <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[#a08a68]">or</span>
                  <span className="h-px flex-1 bg-[#1a1614]/10" />
                </div>

                {/* Social row */}
                <div className="mt-5 flex items-center justify-center gap-3">
                  <SocialButton onClick={apple} loading={loading === "apple"} disabled={!!loading} label="Continue with Apple">
                    <AppleIcon className="h-[19px] w-[19px] text-[#0f0d0b]" />
                  </SocialButton>
                  <SocialButton onClick={google} loading={loading === "google"} disabled={!!loading} label="Continue with Google">
                    <GoogleIcon className="h-[19px] w-[19px]" />
                  </SocialButton>
                </div>

                {/* Switch mode */}
                <div className="mt-6 text-center text-[13px] text-[#8a7a5f]">
                  {mode === "signin" ? (
                    <>
                      New here?{" "}
                      <button
                        onClick={() => { setMode("signup"); setStep("email"); }}
                        className="font-medium text-[#8a6b45] hover:underline"
                      >
                        Create an account
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        onClick={() => { setMode("signin"); setStep("email"); }}
                        className="font-medium text-[#8a6b45] hover:underline"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              </div>
      </motion.div>
    </div>

  );
}

function SocialButton({
  children,
  onClick,
  loading,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      aria-label={label}
      className="flex h-[46px] w-[64px] items-center justify-center rounded-[12px] border border-[#1a1614]/10 bg-white/80 transition hover:bg-white disabled:opacity-60"
      style={{
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.9) inset, 0 6px 16px -12px rgba(60,42,20,0.2)",
      }}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin text-[#0f0d0b]" /> : children}
    </motion.button>
  );
}

```

## `src/routes/index.tsx`

```tsx
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Star, Coffee, Users, MapPin, Hand, Radio, Compass } from "lucide-react";
import type { GoogleMapHandle } from "@/components/google-map";
import { activitiesQuery } from "@/lib/activities";
import { getLandingStats, type LandingStats } from "@/lib/landing-stats.functions";
import { FloatingFlags } from "@/components/landing/floating-flags";
import { JoinsTicker, TrendingStrip, twemojiUrl } from "@/components/landing/live-signals";
import owlLogo from "@/assets/gobber-owl.png.asset.json";
import { AuthOverlay, openAuth } from "@/components/auth/auth-overlay";
import { supabase } from "@/integrations/supabase/client";

// Heavy map/globe modules are split out of the landing bundle; both live
// below the fold and the interactive map only mounts after user intent.
const ArcgisGlobe = lazy(() => import("@/components/arcgis-globe").then((m) => ({ default: m.ArcgisGlobe })));
const GoogleMap = lazy(() => import("@/components/google-map").then((m) => ({ default: m.GoogleMap })));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gobber — Meet strangers. Leave with friends." },
      {
        name: "description",
        content:
          "Gobber turns cities into gathering places. Browse nearby dinners, hikes and small adventures hosted by people around you — and become the reason someone remembers a city.",
      },
      { property: "og:title", content: "Gobber — Meet strangers. Leave with friends." },
      {
        property: "og:description",
        content:
          "Browse nearby dinners, hikes and small adventures hosted by people around you. Today, not someday.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://gobber.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://gobber.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Gobber",
          url: "https://gobber.lovable.app/",
        }),
      },
    ],
  }),
  component: Landing,
});

const EASE = [0.22, 1, 0.36, 1] as const;

/* Amber Clarity palette */
const PALETTE = {
  cream: "#FAF3E1",
  paper: "#F4E9CA",
  ink: "#1A1614",
  blue: "#0A84FF",
  blueDeep: "#0057D1",
  blueSoft: "#E0F0FF",
  amber: "#E8A93C",
  amberDeep: "#B4801F",
  amberSoft: "#FBF0D6",
  sage: "#7DA88E",
  sageSoft: "#EAF2E6",
  muted: "#5a4a38",
};

const COUNTRY_FLAGS: Record<string, string> = {
  Portugal: "🇵🇹", Japan: "🇯🇵", Thailand: "🇹🇭", Spain: "🇪🇸", Brazil: "🇧🇷",
  "United States": "🇺🇸", USA: "🇺🇸", Netherlands: "🇳🇱", "United Kingdom": "🇬🇧",
  UK: "🇬🇧", Italy: "🇮🇹", France: "🇫🇷", Germany: "🇩🇪", Mexico: "🇲🇽",
  Indonesia: "🇮🇩", Morocco: "🇲🇦", Greece: "🇬🇷", Korea: "🇰🇷", Iceland: "🇮🇸",
  Earth: "🌍",
};

/* ───────────────────────── ICONS ───────────────────────── */

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.44 2.23-1.17 3.03-.79.87-2.07 1.54-3.13 1.46-.13-1.11.42-2.28 1.13-3.02.79-.83 2.15-1.45 3.17-1.47zM20.5 17.02c-.55 1.26-.82 1.83-1.54 2.95-1 1.55-2.41 3.48-4.16 3.5-1.56.01-1.96-1.01-4.07-1-2.11.01-2.55 1.02-4.11 1.01-1.75-.02-3.09-1.76-4.09-3.3-2.8-4.31-3.09-9.37-1.36-12.06 1.22-1.91 3.15-3.03 4.97-3.03 1.84 0 3 1 4.52 1s2.45-1 4.58-1c1.62 0 3.33.88 4.55 2.4-3.99 2.19-3.34 7.9.71 9.53z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function OwlMark({ size = 32 }: { size?: number }) {
  return (
    <motion.img
      src={owlLogo.url}
      alt="Gobber"
      width={size}
      height={size}
      whileHover={{ rotate: [-4, 4, -2, 2, 0], scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={{ rotate: { duration: 0.6, ease: "easeInOut" }, scale: { type: "spring", stiffness: 380, damping: 18 } }}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: "drop-shadow(0 6px 12px rgba(60,42,20,0.18))",
        cursor: "pointer",
      }}
    />
  );
}


/* ───────────────────────── NAV ───────────────────────── */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const [active, setActive] = useState<string>("live");
  const links = [
    { id: "live", label: "live map", href: "#live" },
    { id: "how", label: "how it works", href: "#how" },
  ];
  // Sync the active pill with the section currently in view
  useEffect(() => {
    const ids = links.map((l) => l.id);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`mx-auto mt-3 flex h-14 max-w-6xl items-center justify-between px-3 pl-5 pr-2 transition-all duration-500 ${
          scrolled ? "sm:mt-4" : ""
        }`}
        style={{
          borderRadius: 999,
          marginLeft: "clamp(12px, 3vw, 24px)",
          marginRight: "clamp(12px, 3vw, 24px)",
          background:
            "linear-gradient(180deg, color-mix(in oklab, #2A2320 82%, transparent) 0%, color-mix(in oklab, #2A2320 68%, transparent) 100%)",
          backdropFilter: "saturate(180%) blur(22px)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: scrolled
            ? "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.2), 0 20px 40px -20px rgba(0,0,0,0.5), 0 4px 12px -6px rgba(0,0,0,0.25)"
            : "inset 0 1px 0 rgba(255,255,255,0.14), 0 12px 28px -18px rgba(0,0,0,0.4)",

        }}
      >
        <Link to="/" className="flex items-center gap-2">
          <OwlMark size={26} />
          <span className="text-[16px] font-semibold tracking-[-0.02em]" style={{ color: "#FAF3E1" }}>
            gobber
          </span>
        </Link>

        <nav
          className="relative hidden items-center gap-1 rounded-full p-1 text-[13px] md:flex"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.2) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(14px) saturate(160%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.2), 0 4px 12px -6px rgba(0,0,0,0.3)",
          }}
        >
          {links.map((l) => {
            const isActive = active === l.id;
            return (
              <motion.a
                key={l.id}
                href={l.href}
                onClick={() => setActive(l.id)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 500, damping: 26 }}
                className="relative rounded-full px-4 py-1.5"
                style={{ color: isActive ? "#FAF3E1" : "rgba(250,243,225,0.88)" }}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-glass-pill"
                    className="absolute inset-0 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15), 0 6px 14px -6px rgba(0,0,0,0.35)",
                    }}
                  />
                )}
                <span className="relative z-10 font-medium">{l.label}</span>
              </motion.a>
            );
          })}

        </nav>

        <motion.button
          type="button"
          onClick={openAuth}
          whileHover={{ y: -1.5 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 24 }}
          className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-4 py-2 text-[13px] font-medium"
          style={{
            color: "#ffffff",
            background:
              "linear-gradient(180deg, rgba(28,26,24,0.95) 0%, rgba(20,18,16,0.85) 100%)",
            border: "1px solid rgba(20,18,16,0.9)",
            backdropFilter: "blur(14px) saturate(180%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.3), 0 10px 22px -12px rgba(20,18,16,0.4)",
          }}
        >
          {/* sheen sweep */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          />
          <span className="relative">sign in</span>
          <ArrowRight className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </motion.button>

      </div>
    </header>
  );
}

/* ───────────── AUTH BUTTONS ───────────── */

function AuthButtons() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <motion.button
        type="button"
        onClick={openAuth}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-[15px] font-medium sm:w-auto"
        style={{
          background: "linear-gradient(180deg,#1c1815 0%,#0a0908 100%)",
          color: "#ffffff",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.15), 0 18px 40px -18px rgba(20,18,16,0.6), 0 4px 10px rgba(20,18,16,0.18)",
        }}
      >
        <AppleIcon className="h-[19px] w-[19px] text-white transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110" />
        Sign in with Apple
      </motion.button>
      <motion.button
        type="button"
        onClick={openAuth}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full px-6 py-4 text-[15px] font-medium sm:w-auto"
        style={{
          background: "color-mix(in oklab, white 96%, transparent)",
          color: PALETTE.ink,
          border: "1px solid rgba(20,18,16,0.08)",
          boxShadow: "0 10px 22px -14px rgba(20,18,16,0.22)",
        }}
      >
        <GoogleIcon className="h-[19px] w-[19px] transition-transform duration-500 group-hover:rotate-[20deg]" />
        Sign in with Google
      </motion.button>
    </div>
  );
}


/* ───────────────────────── HERO ───────────────────────── */

type NearYou = { city: string; country: string; countryName: string } | null;

function Hero({ stats, nearYou }: { stats: LandingStats | undefined; nearYou: NearYou }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const live = stats?.liveCount ?? 0;
  const totalCities = stats?.totalCities ?? 0;
  const hosts = stats?.activeHosts ?? 0;
  const nearbyCount = nearYou && stats ? stats.perCountry[nearYou.countryName] ?? 0 : 0;

  // Real live count from backend (activities starting now or later)
  const count = live;

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-32"
      style={{
        background: `
          radial-gradient(80% 60% at 50% 0%, #FDF6DF 0%, transparent 55%),
          radial-gradient(70% 50% at 50% 110%, ${PALETTE.blueSoft} 0%, transparent 60%),
          radial-gradient(45% 45% at 12% 50%, ${PALETTE.amberSoft} 0%, transparent 65%),
          radial-gradient(45% 45% at 88% 50%, ${PALETTE.amberSoft} 0%, transparent 65%),
          radial-gradient(35% 35% at 25% 85%, ${PALETTE.sageSoft} 0%, transparent 65%),
          radial-gradient(35% 35% at 75% 85%, ${PALETTE.sageSoft} 0%, transparent 65%),
          linear-gradient(180deg, ${PALETTE.cream} 0%, ${PALETTE.paper} 55%, ${PALETTE.cream} 100%)
        `,
      }}
    >
      <FloatingFlags />

      <motion.div style={{ y }} className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        {/* Live counter pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px]"
          style={{ color: "#241a10" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7DA88E] opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7DA88E]" />
          </span>
          <span className="font-semibold" style={{ color: PALETTE.ink }}>{count.toLocaleString()}</span>
          <span>{count === 1 ? "table live right now" : "tables live right now"}</span>
          <span className="text-base leading-none">🌍</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.05 }}
          className="mt-8"
        >
          <OwlMark size={88} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
          className="mt-6 font-display font-semibold leading-[1.05] tracking-[-0.035em]"
          style={{
            fontSize: "clamp(52px, 9vw, 120px)",
            color: PALETTE.ink,
            paddingBottom: "0.12em",
          }}
        >
          Visit{" "}
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              fontWeight: 400,
              color: PALETTE.blue,
              letterSpacing: "-0.02em",
            }}
          >
            n
          </span>{" "}
          Vibe
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.32 }}
          className="mt-6 max-w-[54ch] text-[17.5px] leading-[1.55]"
          style={{ color: "#2f2519" }}
        >
          browse nearby tables, join one, and vibe with people around you.
          today, not someday <span className="inline-block">:)</span>
        </motion.p>

        {/* Live joins ticker */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.4 }}
          className="mt-6"
        >
          <JoinsTicker joins={stats?.joins ?? []} />
        </motion.div>

        {/* Real-time trust pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.5 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2.5"
        >
          <LivePill
            icon={<MapPin className="h-3.5 w-3.5" style={{ color: PALETTE.blue }} strokeWidth={2.4} />}
            value={live}
            label="live worldwide"
            tint="blue"
          />
          {nearYou && nearbyCount > 0 && (
            <LivePill
              icon={<Compass className="h-3.5 w-3.5" style={{ color: PALETTE.amberDeep }} strokeWidth={2.4} />}
              value={nearbyCount}
              label={`near ${nearYou.city}`}
              tint="amber"
            />
          )}
          <LivePill
            icon={<Radio className="h-3.5 w-3.5" style={{ color: PALETTE.sage }} strokeWidth={2.4} />}
            value={hosts}
            label="hosts online now"
            tint="sage"
          />
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px]"
            style={{
              background: "color-mix(in oklab, white 78%, transparent)",
              border: "1px solid rgba(20,18,16,0.06)",
              color: "#241a10",
            }}
          >
            🌍 <span className="font-semibold" style={{ color: PALETTE.ink }}>{totalCities}</span> cities
          </div>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px]"
            style={{
              background: "color-mix(in oklab, white 78%, transparent)",
              border: "1px solid rgba(20,18,16,0.06)",
              color: "#241a10",
            }}
          >
            <span className="flex text-[#f5b301]">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-3 w-3 fill-current" />
              ))}
            </span>
            <span className="font-semibold" style={{ color: PALETTE.ink }}>4.9</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.62 }}
          className="mt-8"
        >
          <AuthButtons />
        </motion.div>
      </motion.div>

      {/* smooth dissolve into next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-32"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${PALETTE.cream} 100%)`,
        }}
      />
    </section>
  );
}

function LivePill({ icon, value, label, tint }: { icon: React.ReactNode; value: number; label: string; tint: "blue" | "amber" | "sage" }) {
  const bg = tint === "blue" ? PALETTE.blueSoft : tint === "amber" ? PALETTE.amberSoft : PALETTE.sageSoft;
  const border = tint === "blue" ? `${PALETTE.blue}22` : tint === "amber" ? `${PALETTE.amber}33` : `${PALETTE.sage}33`;
  return (
    <motion.div
      key={`${label}-${value}`}
      initial={{ scale: 0.94 }}
      animate={{ scale: 1 }}
      whileHover={{ y: -2, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="inline-flex cursor-default items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px]"
      style={{ background: bg, border: `1px solid ${border}`, color: "#241a10" }}
    >
      {icon}
      <span className="font-semibold" style={{ color: PALETTE.ink }}>{value.toLocaleString()}</span>
      <span>{label}</span>
    </motion.div>
  );
}


/* ───────────────── LIVE MAP SECTION ───────────────── */

function LiveMap({
  activities,
  stats,
}: {
  activities: { id: string; lat: number; lng: number; category: string; title: string; city: string; country: string }[];
  stats: LandingStats | undefined;
}) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"satellite" | "roadmap">("roadmap");
  const [interactive, setInteractive] = useState(false);
  const mapRef = useRef<GoogleMapHandle>(null);
  useEffect(() => setMounted(true), []);

  const pins = useMemo(
    () =>
      activities.map((a) => ({
        id: a.id,
        lat: a.lat,
        lng: a.lng,
        category: a.category,
        label: a.title,
      })),
    [activities],
  );

  return (
    <section id="live" className="relative px-6 pb-24 pt-32">
      {/* top blend with hero's cream tail */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-40"
        style={{
          background: `linear-gradient(180deg, ${PALETTE.cream} 0%, transparent 100%)`,
        }}
      />
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em]"
            style={{ background: PALETTE.blueSoft, color: PALETTE.blueDeep, border: `1px solid ${PALETTE.blue}22` }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ background: PALETTE.blue }} />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: PALETTE.blue }} />
            </span>
            live map
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1, ease: EASE, delay: 0.15 }}
            className="mt-4 font-display font-semibold leading-[1.02] tracking-[-0.03em]"
            style={{ fontSize: "clamp(32px,5vw,56px)", color: PALETTE.ink }}
          >
            every pin is a{" "}
            <span style={{ color: PALETTE.blue, fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}>
              real
            </span>{" "}
            gathering, right now
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
            className="mt-4 text-[15.5px] leading-[1.55]"
            style={{ color: "#2f2519" }}
          >
            no algorithm, no feed — just an actual world map of tables you can sit at tonight.
          </motion.p>

          {/* Trending strip pulled from live data */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.42 }}
              className="mt-6 flex justify-center"
            >
              <TrendingStrip trending={stats.trending} fallbackFlags={COUNTRY_FLAGS} />
            </motion.div>
          )}
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
          className="relative mx-auto mt-10 overflow-hidden rounded-[28px]"
          style={{
            border: "1px solid rgba(20,18,16,0.08)",
            boxShadow: "0 40px 80px -30px rgba(60,42,20,0.32), 0 12px 30px -14px rgba(60,42,20,0.18)",
            height: "clamp(360px, 60vh, 560px)",
          }}
        >
          {/* Ambient globe (always mounted while preview is idle) */}
          {mounted && !interactive && (
            <motion.div
              key="globe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="absolute inset-0"
            >
              <Suspense fallback={<div className="absolute inset-0" style={{ background: PALETTE.paper }} />}>
                <ArcgisGlobe basemap="satellite" spin className="absolute inset-0" />
              </Suspense>
            </motion.div>
          )}

          {/* Interactive Google map — mounted once the user chooses to explore */}
          {mounted && interactive && (
            <motion.div
              key="gmap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="absolute inset-0"
            >
              <Suspense fallback={<div className="absolute inset-0" style={{ background: PALETTE.paper }} />}>
                <GoogleMap
                  ref={mapRef}
                  pins={pins}
                  mapTypeId={view}
                  zoom={2}
                  className="absolute inset-0"
                />
              </Suspense>
            </motion.div>
          )}

          {!mounted && (
            <div className="absolute inset-0" style={{ background: PALETTE.paper }} />
          )}

          {!interactive && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setInteractive(true)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              className="absolute inset-0 z-20 flex cursor-pointer flex-col items-center justify-center gap-3 text-white transition-[background] duration-500"
              style={{
                background:
                  "linear-gradient(180deg, rgba(10,12,20,0.02) 0%, rgba(10,12,20,0.22) 55%, rgba(10,12,20,0.42) 100%)",
              }}
              aria-label="Explore the map"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-medium"
                style={{
                  background: "color-mix(in oklab, white 88%, transparent)",
                  color: PALETTE.ink,
                  backdropFilter: "blur(22px) saturate(160%)",
                  WebkitBackdropFilter: "blur(22px) saturate(160%)",
                  boxShadow:
                    "0 24px 60px -24px rgba(0,0,0,0.4), 0 2px 6px -2px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.55)",
                  border: "1px solid rgba(255,255,255,0.45)",
                }}
              >
                <Hand className="h-4 w-4" style={{ color: PALETTE.blue }} strokeWidth={2.2} />
                Tap to explore the map
              </motion.div>
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="text-[11.5px] font-medium uppercase tracking-[0.12em]"
                style={{ color: "rgba(255,255,255,0.9)", textShadow: "0 1px 8px rgba(0,0,0,0.35)" }}
              >
                {activities.length} gathering{activities.length === 1 ? "" : "s"} · worldwide
              </motion.span>
            </motion.button>
          )}


          {interactive && (
            <>
              <div
                className="absolute left-4 top-4 z-10 inline-flex items-center gap-0.5 rounded-full p-1"
                style={{
                  background: "color-mix(in oklab, white 75%, transparent)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid rgba(20,18,16,0.06)",
                  boxShadow: "0 8px 20px -14px rgba(60,42,20,0.25)",
                }}
              >
                {(["satellite", "roadmap"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`rounded-full px-3 py-1.5 text-[11.5px] font-medium transition ${
                      view === v ? "text-white" : "text-[#2f2519] hover:text-[#141210]"
                    }`}
                    style={view === v ? { background: PALETTE.blue } : undefined}
                  >
                    {v === "satellite" ? "Satellite" : "Street"}
                  </button>
                ))}
              </div>

              <div
                className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px]"
                style={{
                  background: "color-mix(in oklab, white 82%, transparent)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid rgba(20,18,16,0.06)",
                  color: PALETTE.ink,
                }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: PALETTE.sage }} />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: PALETTE.sage }} />
                </span>
                <span className="font-semibold">{activities.length}</span> live
              </div>

              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center pb-5"
                style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.28) 100%)" }}
              >
                <Link
                  to="/discover"
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-medium transition hover:-translate-y-0.5"
                  style={{
                    background: "color-mix(in oklab, white 92%, transparent)",
                    color: PALETTE.ink,
                    backdropFilter: "blur(14px)",
                    boxShadow: "0 14px 28px -16px rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.6)",
                  }}
                >
                  open the full map <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────── TRENDING TRIPS MARQUEE ───────────────── */

type Trip = { flag: string; city: string; count: number };

const CARD_THEMES = [
  { grad: `linear-gradient(155deg, ${PALETTE.blueSoft} 0%, #FFFFFF 60%, ${PALETTE.blueSoft} 100%)`, ring: PALETTE.blue, badge: PALETTE.blue, badgeFg: "#FFFFFF", glow: "0 18px 36px -18px rgba(10,132,255,0.45)" },
  { grad: `linear-gradient(155deg, ${PALETTE.amberSoft} 0%, #FFFFFF 60%, ${PALETTE.amberSoft} 100%)`, ring: PALETTE.amberDeep, badge: PALETTE.amber, badgeFg: PALETTE.ink, glow: "0 18px 36px -18px rgba(180,128,31,0.45)" },
  { grad: `linear-gradient(155deg, ${PALETTE.sageSoft} 0%, #FFFFFF 60%, ${PALETTE.sageSoft} 100%)`, ring: PALETTE.sage, badge: PALETTE.sage, badgeFg: "#FFFFFF", glow: "0 18px 36px -18px rgba(125,168,142,0.5)" },
  { grad: `linear-gradient(155deg, #FFF 0%, ${PALETTE.paper} 100%)`, ring: PALETTE.muted, badge: PALETTE.ink, badgeFg: PALETTE.cream, glow: "0 18px 36px -18px rgba(60,42,20,0.35)" },
];

function TripCard({ t, idx }: { t: Trip; idx: number }) {
  const theme = CARD_THEMES[idx % CARD_THEMES.length];
  return (
    <motion.div
      whileHover={{ y: -6, rotate: -2, scale: 1.06 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl sm:h-28 sm:w-28"
      style={{
        background: theme.grad,
        border: `1px solid color-mix(in oklab, ${theme.ring} 22%, transparent)`,
        boxShadow: theme.glow,
      }}
      role="img"
      aria-label={`${t.city} — ${t.count} live gatherings this week`}
      title={`${t.city} · ${t.count} live`}
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 45%)" }}
      />
      <img src={twemojiUrl(t.flag)} alt="" draggable={false} className="relative h-12 w-12 drop-shadow-sm sm:h-14 sm:w-14" />
      <span
        className="absolute -bottom-1.5 -right-1.5 min-w-[24px] rounded-full px-1.5 text-center text-[11px] font-bold leading-[20px] tracking-tight"
        style={{ background: theme.badge, color: theme.badgeFg, boxShadow: `0 4px 12px ${theme.ring}55`, border: "1.5px solid #fff" }}
      >
        {t.count}
      </span>
    </motion.div>
  );
}


function TrendingMarquee({ trips }: { trips: Trip[] }) {
  if (trips.length === 0) return null;
  const doubled = [...trips, ...trips];
  return (
    <section id="trips" className="relative overflow-hidden py-10">
      <div className="mx-auto mb-6 flex max-w-6xl items-center justify-center gap-2 px-6 text-[15px] font-semibold" style={{ color: PALETTE.ink }}>
        <span className="text-lg">✈️</span> trending trips
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24" style={{ background: `linear-gradient(90deg,${PALETTE.paper},transparent)` }} />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24" style={{ background: `linear-gradient(-90deg,${PALETTE.paper},transparent)` }} />
        <motion.div
          className="flex gap-4 sm:gap-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((t, i) => (
            <TripCard key={i} t={t} idx={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────── HOW IT WORKS ───────────────── */

function How() {
  const steps = [
    { n: "01", icon: MapPin, tint: PALETTE.blue, title: "open the map", body: "every pin is a real gathering nearby — tonight, this weekend, or next city over." },
    { n: "02", icon: Coffee, tint: PALETTE.amberDeep, title: "tap what excites you", body: "see the host, the vibe, who's coming. reserve one of the few spots with a single tap." },
    { n: "03", icon: Users, tint: PALETTE.sage, title: "show up. belong.", body: "meet strangers over dinner, at a trailhead, at a corner café. leave with new group chats." },
  ];
  return (
    <section id="how" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="font-display font-semibold leading-[1.02] tracking-[-0.03em]"
            style={{ fontSize: "clamp(32px,5vw,56px)", color: PALETTE.ink }}
          >
            three taps.{" "}
            <span style={{ color: PALETTE.blue, fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}>
              one
            </span>{" "}
            unforgettable night.
          </h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
              className="relative overflow-hidden rounded-3xl p-7"
              style={{
                background: `linear-gradient(180deg,${PALETTE.cream} 0%,${PALETTE.paper} 100%)`,
                border: "1px solid rgba(20,18,16,0.06)",
                boxShadow: "0 20px 40px -28px rgba(60,42,20,0.22)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[13px] font-medium tracking-[0.14em]" style={{ color: s.tint }}>{s.n}</span>
                <span
                  className="grid h-10 w-10 place-items-center rounded-full"
                  style={{
                    background: "color-mix(in oklab, white 70%, transparent)",
                    border: "1px solid rgba(20,18,16,0.06)",
                    color: s.tint,
                  }}
                >
                  <s.icon className="h-4 w-4" strokeWidth={2} />
                </span>
              </div>
              <div className="mt-14 font-display text-[22px] font-semibold tracking-[-0.02em]" style={{ color: PALETTE.ink }}>{s.title}</div>
              <p className="mt-2 text-[14px] leading-[1.55]" style={{ color: "#2f2519" }}>{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── FINAL CTA ───────────────── */

function CTA() {
  return (
    <section className="relative px-6 py-28">
      <div
        className="relative mx-auto max-w-4xl overflow-hidden rounded-[36px] px-8 py-16 text-center"
        style={{
          background: `
            radial-gradient(70% 90% at 20% 0%, ${PALETTE.blue}55 0%, transparent 55%),
            radial-gradient(60% 80% at 100% 100%, ${PALETTE.amber}66 0%, transparent 55%),
            linear-gradient(180deg,#1c1815 0%,#0a0908 100%)
          `,
          boxShadow: "0 60px 120px -40px rgba(20,18,16,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <div className="mx-auto mb-6 flex justify-center">
          <OwlMark size={72} />
        </div>
        <div className="text-[11.5px] font-medium uppercase tracking-[0.2em]" style={{ color: "#cfe0ff" }}>
          your seat is waiting
        </div>
        <h2 className="mt-4 font-display font-semibold leading-[1.02] tracking-[-0.03em] text-white" style={{ fontSize: "clamp(34px,5.5vw,60px)" }}>
          today is a{" "}
          <span style={{ color: "#F4C97A", fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}>
            good day
          </span>{" "}
          to meet someone.
        </h2>
        <p className="mx-auto mt-5 max-w-[48ch] text-[15.5px] leading-[1.55]" style={{ color: "#f2e3ce" }}>
          gobber is free. joining a table takes ten seconds. the memory lasts a lot longer.
        </p>
        <div className="mt-9 flex justify-center">
          <AuthButtons />
        </div>
      </div>
    </section>
  );
}

/* ───────────────── FOOTER ───────────────── */

function Footer() {
  return (
    <footer className="px-6 pb-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t pt-8 text-[12.5px] sm:flex-row" style={{ borderColor: "#1a161410", color: "#3d3120" }}>
        <div className="flex items-center gap-2">
          <OwlMark size={22} />
          <span className="font-semibold" style={{ color: PALETTE.ink }}>gobber</span>
          <span>· visit n vibe, made for meeting people in real life.</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="#" className="transition hover:text-[#141210]">privacy</a>
          <a href="#" className="transition hover:text-[#141210]">terms</a>
          <a href="#" className="transition hover:text-[#141210]">contact</a>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────── PAGE ───────────────── */

function Landing() {
  const navigate = useNavigate();
  // If a session is already present (e.g. after an OAuth full-page redirect
  // returned to the origin on tablets/in-app browsers), push into the app.
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) navigate({ to: "/discover", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        navigate({ to: "/discover", replace: true });
      }
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const { data: activities = [] } = useQuery(activitiesQuery());
  const { data: stats } = useQuery({
    queryKey: ["landing-stats"],
    queryFn: () => getLandingStats(),
    refetchInterval: 12_000,
    refetchIntervalInBackground: false,
    staleTime: 8_000,
  });

  const [nearYou, setNearYou] = useState<NearYou>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d?.city) setNearYou({ city: d.city, country: d.country_code, countryName: d.country_name });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const trips = useMemo<Trip[]>(() => {
    if (!stats || stats.trending.length === 0) return [];
    return stats.trending.map((t) => ({
      flag: COUNTRY_FLAGS[t.country] ?? "🌍",
      city: t.city,
      count: t.count,
    }));
  }, [stats]);

  return (
    <main className="relative min-h-screen" style={{ background: PALETTE.paper }}>
      <Nav />
      <Hero stats={stats} nearYou={nearYou} />
      <LiveMap activities={activities} stats={stats} />
      <TrendingMarquee trips={trips} />
      <How />
      <CTA />
      <Footer />
      <AuthOverlay />
    </main>
  );
}

```

## `src/routes/sitemap[.]xml.ts`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://gobber.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // Only public, indexable routes. Authenticated app surfaces
        // (/discover, /explore, /host, /profile, /trips, /activity/:id, /auth)
        // stay out of the sitemap and are Disallowed in robots.txt.
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

```

## `src/server.ts`

```tsx
import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

```

## `src/start.ts`

```tsx
import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware],
}));

```

## `src/styles.css`

```css
@import "tailwindcss" source(none);
@source "../src";
@import "tw-animate-css";
@import "@fontsource/outfit/400.css";
@import "@fontsource/outfit/500.css";
@import "@fontsource/outfit/600.css";
@import "@fontsource/outfit/700.css";
@import "@fontsource/figtree/400.css";
@import "@fontsource/figtree/500.css";
@import "@fontsource/figtree/600.css";
@import "@fontsource/instrument-serif/400.css";
@import "@fontsource/instrument-serif/400-italic.css";
@import "maplibre-gl/dist/maplibre-gl.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);

  --font-display: "Outfit", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Instrument Serif", ui-serif, Georgia, serif;
  --font-sans: "Figtree", ui-sans-serif, system-ui, sans-serif;

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-sand: var(--sand);
  --color-clay: var(--clay);
  --color-ink: var(--ink);
  --color-sage: var(--sage);
  --color-apple-blue: var(--apple-blue);


  --shadow-glass: 0 1px 2px rgba(60, 42, 20, 0.04), 0 8px 26px -14px rgba(60, 42, 20, 0.14);
  --shadow-soft: 0 1px 2px rgba(60, 42, 20, 0.04), 0 6px 20px -12px rgba(60, 42, 20, 0.10);
  --shadow-lift: 0 2px 6px rgba(60, 42, 20, 0.05), 0 20px 50px -24px rgba(60, 42, 20, 0.18);
  --shadow-float: 0 30px 70px -30px rgba(50, 34, 15, 0.28), 0 6px 16px -8px rgba(50, 34, 15, 0.10);
  --gradient-warm: linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.55 0.09 55));
}

:root {
  --radius: 1.25rem;
  /* Amber Clarity — Apple x Goldfish */
  --background: oklch(0.965 0.028 88);      /* #FAF3E1 cream */
  --foreground: oklch(0.18 0.012 55);       /* #1A1614 ink */
  --card: oklch(0.985 0.018 88);
  --card-foreground: var(--foreground);
  --popover: oklch(0.985 0.018 88);
  --popover-foreground: var(--foreground);
  --primary: oklch(0.62 0.20 255);          /* #0A84FF apple blue */
  --primary-foreground: oklch(0.99 0.005 88);
  --secondary: oklch(0.93 0.045 88);        /* #F4E9CA paper */
  --secondary-foreground: var(--foreground);
  --muted: oklch(0.93 0.035 85);
  --muted-foreground: oklch(0.52 0.03 60);
  --accent: oklch(0.77 0.135 78);           /* #E8A93C amber */
  --accent-foreground: oklch(0.18 0.012 55);
  --destructive: oklch(0.58 0.19 25);
  --destructive-foreground: oklch(0.98 0 0);
  --border: oklch(0.88 0.03 82 / 0.6);
  --input: oklch(0.88 0.03 82);
  --ring: oklch(0.62 0.20 255);
  --sand: oklch(0.93 0.045 88);
  --clay: oklch(0.66 0.115 72);             /* amber deep */
  --ink: oklch(0.18 0.012 55);
  --sage: oklch(0.72 0.055 155);            /* #7DA88E */
  --apple-blue: oklch(0.62 0.20 255);
}


.dark {
  --background: oklch(0.18 0.015 60);
  --foreground: oklch(0.96 0.008 85);
  --card: oklch(0.22 0.015 60);
  --card-foreground: var(--foreground);
  --popover: oklch(0.22 0.015 60);
  --popover-foreground: var(--foreground);
  --primary: oklch(0.78 0.055 75);
  --primary-foreground: oklch(0.18 0.015 60);
  --secondary: oklch(0.26 0.015 60);
  --secondary-foreground: var(--foreground);
  --muted: oklch(0.26 0.015 60);
  --muted-foreground: oklch(0.72 0.02 70);
  --accent: oklch(0.4 0.04 55);
  --accent-foreground: var(--foreground);
  --destructive: oklch(0.6 0.19 25);
  --destructive-foreground: oklch(0.98 0 0);
  --border: oklch(1 0 0 / 12%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.78 0.055 75);
  --sand: oklch(0.26 0.015 60);
  --clay: oklch(0.78 0.055 75);
  --ink: oklch(0.96 0.008 85);
}

@layer base {
  * { border-color: var(--color-border); }
  html {
    scroll-behavior: smooth;
    /* prevent hash targets from hiding under the fixed floating nav */
    scroll-padding-top: 96px;
  }
  html, body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    font-feature-settings: "ss01", "cv11";
    /* stop horizontal jitter from floating flags / marquees */
    overflow-x: hidden;
  }
  h1, h2, h3, h4, h5 { font-family: var(--font-display); letter-spacing: -0.022em; }
  ::selection { background: color-mix(in oklab, var(--accent) 40%, transparent); }
  :focus-visible {
    outline: 2px solid color-mix(in oklab, var(--accent) 70%, transparent);
    outline-offset: 2px;
    border-radius: 6px;
  }
  section[id] { scroll-margin-top: 96px; }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }

}

/* Editorial serif — for hero words and accents */
@utility serif-hero {
  font-family: var(--font-serif);
  font-style: italic;
  letter-spacing: -0.03em;
  line-height: 0.98;
  font-weight: 400;
}

/* Soft card surface — nearly merges with background */
@utility surface {
  background: color-mix(in oklab, var(--card) 96%, transparent);
  box-shadow: var(--shadow-soft);
}

@utility surface-lift {
  background: var(--card);
  box-shadow: var(--shadow-lift);
}

/* ---------- Liquid glass system ----------
 * One recipe, three densities. All share the same warm ivory→sand fill,
 * hairline ring, inner top highlight, and warm drop shadow so glass
 * surfaces read as a family across the app. */

@utility glass {
  background:
    linear-gradient(180deg, rgba(255, 252, 246, 0.82) 0%, rgba(246, 238, 224, 0.68) 100%);
  backdrop-filter: saturate(180%) blur(22px);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 0 rgba(60, 40, 14, 0.05),
    0 18px 40px -22px rgba(60, 40, 14, 0.35);
}

@utility glass-dark {
  background:
    linear-gradient(180deg, rgba(28, 22, 14, 0.72) 0%, rgba(20, 16, 10, 0.55) 100%);
  backdrop-filter: saturate(180%) blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 24px 48px -24px rgba(0, 0, 0, 0.5);
}

/* Premium panel — larger surfaces (cards, sheets, modals) */
@utility glass-panel {
  background:
    linear-gradient(180deg, rgba(255, 252, 246, 0.86) 0%, rgba(246, 238, 224, 0.72) 100%);
  backdrop-filter: saturate(180%) blur(26px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 -1px 0 rgba(60, 40, 14, 0.06),
    0 24px 56px -24px rgba(60, 40, 14, 0.38);
}

/* Compact glass — chips, pills, tiny toggles */
@utility glass-chip {
  background:
    linear-gradient(180deg, rgba(255, 252, 246, 0.88) 0%, rgba(246, 238, 224, 0.72) 100%);
  backdrop-filter: saturate(170%) blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 1),
    0 10px 22px -14px rgba(60, 40, 14, 0.3);
}


/* Warm page background — atmospheric globe wash at the bottom */
@utility page-wash {
  background:
    radial-gradient(90% 55% at 50% 108%, rgba(232, 169, 60, 0.22) 0%, transparent 55%),
    radial-gradient(1200px 900px at 50% -10%, #FBF0D6 0%, transparent 55%),
    linear-gradient(180deg, #FAF3E1 0%, #F4E9CA 100%);
}


/* Maplibre polish */
.maplibregl-ctrl-attrib { font-size: 10px !important; opacity: 0.55; }
.maplibregl-ctrl-bottom-right { display: none !important; }


```

## `supabase/migrations/20260713111505_3b1bd46a-a6ac-424d-b7cb-dd88c44ff548.sql`

```sql

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_url text,
  bio text,
  home_city text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  cover_url text,
  city text NOT NULL,
  country text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  starts_at timestamptz NOT NULL,
  max_spots int NOT NULL DEFAULT 6 CHECK (max_spots > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Activities viewable by authenticated" ON public.activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create activities as self" ON public.activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update own activities" ON public.activities FOR UPDATE TO authenticated USING (auth.uid() = host_id);
CREATE POLICY "Hosts can delete own activities" ON public.activities FOR DELETE TO authenticated USING (auth.uid() = host_id);

CREATE TABLE public.rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (activity_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rsvps TO authenticated;
GRANT ALL ON public.rsvps TO service_role;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "RSVPs viewable by authenticated" ON public.rsvps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can rsvp as self" ON public.rsvps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rsvp" ON public.rsvps FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rsvp" ON public.rsvps FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

```

## `supabase/migrations/20260713111533_4de636d2-90a4-450c-bb7c-ff02a0522a0f.sql`

```sql

ALTER FUNCTION public.set_updated_at() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

```

## `supabase/migrations/20260716103027_849e650a-4776-4de2-b676-de5b488aa692.sql`

```sql
CREATE POLICY "Activities publicly viewable" ON public.activities FOR SELECT TO anon USING (true); GRANT SELECT ON public.activities TO anon;
```

## `supabase/migrations/20260716114518_ac6c6d45-dc02-480f-b260-d36e5552c2c1.sql`

```sql
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS duration_hours integer NOT NULL DEFAULT 2 CHECK (duration_hours > 0 AND duration_hours <= 24);
```

## `supabase/migrations/20260716125516_4f67ae62-d063-4255-a9cd-5af680e82701.sql`

```sql
DROP POLICY IF EXISTS "RSVPs viewable by authenticated" ON public.rsvps;

CREATE POLICY "RSVPs viewable by owner or host"
ON public.rsvps
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR auth.uid() = (SELECT host_id FROM public.activities WHERE id = rsvps.activity_id)
);
```

## `supabase/migrations/20260716134337_42a024ff-379c-4837-b176-81a6abf75591.sql`

```sql

-- 1. Add username to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text;

-- Backfill any nulls with a placeholder derived from id so unique constraint holds
UPDATE public.profiles
  SET username = 'user_' || substr(replace(id::text, '-', ''), 1, 10)
  WHERE username IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN username SET NOT NULL;

-- Case-insensitive uniqueness + shape check
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx
  ON public.profiles ((lower(username)));

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_format_chk
  CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$');

-- 2. Follows table
CREATE TABLE public.follows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX follows_follower_idx ON public.follows(follower_id);
CREATE INDEX follows_following_idx ON public.follows(following_id);

GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows viewable by authenticated"
  ON public.follows FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can follow as self"
  ON public.follows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow own"
  ON public.follows FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

-- 3. Update handle_new_user to seed a unique username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  base_name text;
  candidate text;
  suffix int := 0;
BEGIN
  base_name := lower(regexp_replace(
    COALESCE(NEW.raw_user_meta_data->>'preferred_username',
             split_part(NEW.email, '@', 1),
             'user'),
    '[^a-z0-9_]', '', 'g'
  ));
  IF length(base_name) < 3 THEN base_name := 'user' || substr(replace(NEW.id::text,'-',''),1,6); END IF;
  IF length(base_name) > 18 THEN base_name := substr(base_name, 1, 18); END IF;

  candidate := base_name;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE lower(username) = candidate) LOOP
    suffix := suffix + 1;
    candidate := substr(base_name, 1, 18) || suffix::text;
  END LOOP;

  INSERT INTO public.profiles (id, display_name, avatar_url, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    candidate
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$function$;

```

## `supabase/migrations/20260716135027_d3743b13-3908-4150-9d7d-b1b703426e3a.sql`

```sql

CREATE TABLE public.blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

GRANT SELECT, INSERT, DELETE ON public.blocks TO authenticated;
GRANT ALL ON public.blocks TO service_role;

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blocks"
  ON public.blocks FOR SELECT TO authenticated
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block as self"
  ON public.blocks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock own"
  ON public.blocks FOR DELETE TO authenticated
  USING (auth.uid() = blocker_id);

CREATE INDEX blocks_blocker_idx ON public.blocks (blocker_id);
CREATE INDEX blocks_blocked_idx ON public.blocks (blocked_id);

-- When a block is created, remove any follow relationships between the two users.
CREATE OR REPLACE FUNCTION public.remove_follows_on_block()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.follows
   WHERE (follower_id = NEW.blocker_id AND following_id = NEW.blocked_id)
      OR (follower_id = NEW.blocked_id AND following_id = NEW.blocker_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER blocks_after_insert_remove_follows
AFTER INSERT ON public.blocks
FOR EACH ROW EXECUTE FUNCTION public.remove_follows_on_block();

```

## `supabase/migrations/20260716135046_1f41beb4-4200-4265-a947-f25f38341012.sql`

```sql
REVOKE EXECUTE ON FUNCTION public.remove_follows_on_block() FROM PUBLIC, anon, authenticated;
```

## `supabase/migrations/20260716135446_0d3380a1-723c-4aba-a54a-702394812986.sql`

```sql

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_created_idx ON public.notifications (user_id, created_at DESC);
CREATE INDEX notifications_user_unread_idx ON public.notifications (user_id) WHERE read_at IS NULL;

GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: on new follow, create notification(s)
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_mutual BOOLEAN;
BEGIN
  -- Skip if blocked in either direction
  IF EXISTS (
    SELECT 1 FROM public.blocks
    WHERE (blocker_id = NEW.following_id AND blocked_id = NEW.follower_id)
       OR (blocker_id = NEW.follower_id AND blocked_id = NEW.following_id)
  ) THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.follows
    WHERE follower_id = NEW.following_id AND following_id = NEW.follower_id
  ) INTO is_mutual;

  -- Notify the followed user
  INSERT INTO public.notifications (user_id, actor_id, type, entity_type, entity_id)
  VALUES (
    NEW.following_id,
    NEW.follower_id,
    CASE WHEN is_mutual THEN 'mutual_follow' ELSE 'follow' END,
    'user',
    NEW.follower_id
  );

  -- If mutual, also notify the follower (who just completed the mutual)
  IF is_mutual THEN
    INSERT INTO public.notifications (user_id, actor_id, type, entity_type, entity_id)
    VALUES (NEW.follower_id, NEW.following_id, 'mutual_follow', 'user', NEW.following_id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_follow
AFTER INSERT ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();

-- Suggestion function: rank by mutual-follow count (people your friends follow) + recency
CREATE OR REPLACE FUNCTION public.suggested_profiles(_user_id UUID, _limit INT DEFAULT 12)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  home_city TEXT,
  mutual_count BIGINT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH my_following AS (
    SELECT following_id FROM public.follows WHERE follower_id = _user_id
  ),
  blocked AS (
    SELECT blocked_id AS uid FROM public.blocks WHERE blocker_id = _user_id
    UNION
    SELECT blocker_id AS uid FROM public.blocks WHERE blocked_id = _user_id
  ),
  candidates AS (
    -- Friends-of-friends
    SELECT f.following_id AS uid, COUNT(*) AS mutual
    FROM public.follows f
    WHERE f.follower_id IN (SELECT following_id FROM my_following)
      AND f.following_id <> _user_id
      AND f.following_id NOT IN (SELECT following_id FROM my_following)
      AND f.following_id NOT IN (SELECT uid FROM blocked)
    GROUP BY f.following_id
  )
  SELECT p.id, p.username, p.display_name, p.avatar_url, p.home_city,
         COALESCE(c.mutual, 0) AS mutual_count
  FROM public.profiles p
  LEFT JOIN candidates c ON c.uid = p.id
  WHERE p.id <> _user_id
    AND p.id NOT IN (SELECT following_id FROM my_following)
    AND p.id NOT IN (SELECT uid FROM blocked)
  ORDER BY COALESCE(c.mutual, 0) DESC, p.created_at DESC NULLS LAST
  LIMIT _limit;
$$;

GRANT EXECUTE ON FUNCTION public.suggested_profiles(UUID, INT) TO authenticated;

```

## `supabase/migrations/20260716141141_b17dc5b7-3d55-45c9-9b0d-1543d6a43fec.sql`

```sql

-- ============ CONVERSATIONS ============
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('dm','location')),
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  expires_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX conversations_activity_unique ON public.conversations(activity_id) WHERE type='location';
CREATE INDEX conversations_last_msg_idx ON public.conversations(last_message_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- ============ MEMBERS ============
CREATE TABLE public.conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','member')),
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);
CREATE INDEX conversation_members_user_idx ON public.conversation_members(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_members TO authenticated;
GRANT ALL ON public.conversation_members TO service_role;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

-- ============ MESSAGES ============
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (length(body) > 0 AND length(body) <= 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX messages_conv_idx ON public.messages(conversation_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ============ HELPER: is_member ============
CREATE OR REPLACE FUNCTION public.is_conv_member(_conv UUID, _uid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id=_conv AND user_id=_uid);
$$;

CREATE OR REPLACE FUNCTION public.is_conv_owner(_conv UUID, _uid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id=_conv AND user_id=_uid AND role='owner');
$$;

-- ============ POLICIES: conversations ============
CREATE POLICY "Members can view conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (public.is_conv_member(id, auth.uid()));

CREATE POLICY "Users can update last_message_at as member"
  ON public.conversations FOR UPDATE TO authenticated
  USING (public.is_conv_member(id, auth.uid()));

CREATE POLICY "Owners can delete conversation"
  ON public.conversations FOR DELETE TO authenticated
  USING (public.is_conv_owner(id, auth.uid()));

-- INSERT: only via SECURITY DEFINER functions (start_dm) or triggers.
-- We still allow authenticated inserts scoped to self so client can create DMs directly,
-- but recommend using start_dm RPC. Restrict type to dm here.
CREATE POLICY "Users can create own DM conversation"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND type = 'dm');

-- ============ POLICIES: members ============
CREATE POLICY "Members can view own memberships"
  ON public.conversation_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_conv_member(conversation_id, auth.uid()));

CREATE POLICY "Users can add self to convo"
  ON public.conversation_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "User can update own membership"
  ON public.conversation_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Self-leave or owner removes member"
  ON public.conversation_members FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR (public.is_conv_owner(conversation_id, auth.uid()) AND role <> 'owner')
  );

-- ============ POLICIES: messages ============
CREATE POLICY "Members can read messages"
  ON public.messages FOR SELECT TO authenticated
  USING (public.is_conv_member(conversation_id, auth.uid()));

CREATE POLICY "Members can send messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.is_conv_member(conversation_id, auth.uid()));

CREATE POLICY "Sender can delete own message"
  ON public.messages FOR DELETE TO authenticated
  USING (sender_id = auth.uid());

-- ============ TRIGGER: bump last_message_at ============
CREATE OR REPLACE FUNCTION public.bump_conv_last_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
  RETURN NEW;
END; $$;
CREATE TRIGGER messages_bump_last AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.bump_conv_last_message();

-- ============ TRIGGER: auto-create location chat on activity insert ============
CREATE OR REPLACE FUNCTION public.create_location_chat()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_conv_id UUID;
BEGIN
  INSERT INTO public.conversations (type, activity_id, created_by, title, expires_at)
  VALUES (
    'location',
    NEW.id,
    NEW.host_id,
    NEW.title,
    NEW.starts_at + (NEW.duration_hours || ' hours')::interval + interval '2 days'
  )
  RETURNING id INTO new_conv_id;

  INSERT INTO public.conversation_members (conversation_id, user_id, role)
  VALUES (new_conv_id, NEW.host_id, 'owner');

  RETURN NEW;
END; $$;
CREATE TRIGGER activities_create_chat AFTER INSERT ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.create_location_chat();

-- Backfill for existing activities
INSERT INTO public.conversations (type, activity_id, created_by, title, expires_at)
SELECT 'location', a.id, a.host_id, a.title,
  a.starts_at + (a.duration_hours || ' hours')::interval + interval '2 days'
FROM public.activities a
WHERE NOT EXISTS (SELECT 1 FROM public.conversations c WHERE c.activity_id = a.id);

INSERT INTO public.conversation_members (conversation_id, user_id, role)
SELECT c.id, c.created_by, 'owner'
FROM public.conversations c
WHERE c.type = 'location'
  AND NOT EXISTS (
    SELECT 1 FROM public.conversation_members m
    WHERE m.conversation_id = c.id AND m.user_id = c.created_by
  );

-- ============ TRIGGER: auto-add rsvp'd user to location chat ============
CREATE OR REPLACE FUNCTION public.rsvp_join_location_chat()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  conv_id UUID;
BEGIN
  IF NEW.status <> 'going' THEN RETURN NEW; END IF;
  SELECT id INTO conv_id FROM public.conversations WHERE activity_id = NEW.activity_id AND type='location';
  IF conv_id IS NOT NULL THEN
    INSERT INTO public.conversation_members (conversation_id, user_id, role)
    VALUES (conv_id, NEW.user_id, 'member')
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER rsvps_join_chat AFTER INSERT ON public.rsvps
  FOR EACH ROW EXECUTE FUNCTION public.rsvp_join_location_chat();

-- Backfill members from existing rsvps
INSERT INTO public.conversation_members (conversation_id, user_id, role)
SELECT c.id, r.user_id, 'member'
FROM public.rsvps r
JOIN public.conversations c ON c.activity_id = r.activity_id AND c.type='location'
WHERE r.status = 'going'
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- ============ start_dm RPC ============
CREATE OR REPLACE FUNCTION public.start_dm(_other UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  me UUID := auth.uid();
  existing UUID;
  new_id UUID;
  mutual BOOLEAN;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF me = _other THEN RAISE EXCEPTION 'cannot dm yourself'; END IF;

  -- must be mutual follow
  SELECT EXISTS (
    SELECT 1 FROM public.follows WHERE follower_id = me AND following_id = _other
  ) AND EXISTS (
    SELECT 1 FROM public.follows WHERE follower_id = _other AND following_id = me
  ) INTO mutual;
  IF NOT mutual THEN RAISE EXCEPTION 'mutual follow required'; END IF;

  -- reject if either has blocked the other
  IF EXISTS (SELECT 1 FROM public.blocks WHERE (blocker_id = me AND blocked_id = _other) OR (blocker_id = _other AND blocked_id = me)) THEN
    RAISE EXCEPTION 'blocked';
  END IF;

  -- find existing DM
  SELECT c.id INTO existing
  FROM public.conversations c
  JOIN public.conversation_members m1 ON m1.conversation_id = c.id AND m1.user_id = me
  JOIN public.conversation_members m2 ON m2.conversation_id = c.id AND m2.user_id = _other
  WHERE c.type = 'dm'
  LIMIT 1;

  IF existing IS NOT NULL THEN RETURN existing; END IF;

  INSERT INTO public.conversations (type, created_by) VALUES ('dm', me) RETURNING id INTO new_id;
  INSERT INTO public.conversation_members (conversation_id, user_id, role) VALUES (new_id, me, 'owner');
  INSERT INTO public.conversation_members (conversation_id, user_id, role) VALUES (new_id, _other, 'member');
  RETURN new_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.start_dm(UUID) TO authenticated;

-- ============ realtime ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_members;

-- ============ pg_cron: hourly cleanup of expired location chats ============
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule(
  'gobber-cleanup-expired-chats',
  '17 * * * *',
  $$DELETE FROM public.conversations WHERE type='location' AND expires_at IS NOT NULL AND expires_at < now();$$
);

```

## `supabase/migrations/20260716141933_6d074e02-a986-4d8e-84bf-a3130a331ea6.sql`

```sql

-- Allow media in messages
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS media_url TEXT,
  ADD COLUMN IF NOT EXISTS media_type TEXT;

-- Relax body check: allow empty body if media attached
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_body_check;
ALTER TABLE public.messages
  ADD CONSTRAINT messages_body_or_media_check
  CHECK (
    length(body) <= 4000
    AND (length(body) > 0 OR media_url IS NOT NULL)
  );

-- Storage RLS for chat-media (private bucket). Object path convention: <conversation_id>/<user_id>/<filename>
CREATE POLICY "chat-media upload by members"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat-media'
  AND public.is_conv_member((storage.foldername(name))[1]::uuid, auth.uid())
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "chat-media read by members"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'chat-media'
  AND public.is_conv_member((storage.foldername(name))[1]::uuid, auth.uid())
);

CREATE POLICY "chat-media delete own"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'chat-media'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

```

