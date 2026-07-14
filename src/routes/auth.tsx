import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, X, ChevronRight } from "lucide-react";

import memoji1 from "@/assets/memoji-1.png";
import memoji2 from "@/assets/memoji-2.png";
import memoji3 from "@/assets/memoji-3.png";
import memoji4 from "@/assets/memoji-4.png";
import memoji5 from "@/assets/memoji-5.png";
import memoji6 from "@/assets/memoji-6.png";
import memoji7 from "@/assets/memoji-7.png";
import memoji8 from "@/assets/memoji-8.png";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Welcome — Gobber" },
      { name: "description", content: "Real-life gatherings, wherever you land." },
    ],
  }),
  component: AuthPage,
});

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
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}

// Cluster positions — mimicking the reference bundle
// x/y are percentages of the container; size is width in px at base scale.
const MEMOJIS = [
  // Back row
  { src: memoji2, x: 20, y: 6,  size: 118, z: 2, delay: 0.15 }, // beanie girl left-back
  { src: memoji3, x: 42, y: 0,  size: 128, z: 2, delay: 0.35 }, // blonde center-back
  { src: memoji4, x: 66, y: 4,  size: 128, z: 2, delay: 0.55 }, // afro right-back
  // Front row
  { src: memoji1, x: 6,  y: 34, size: 118, z: 3, delay: 0.75 }, // asian tongue front-left
  { src: memoji5, x: 26, y: 42, size: 120, z: 4, delay: 0.20 }, // beret girl
  { src: memoji6, x: 46, y: 40, size: 122, z: 5, delay: 0.45 }, // green beanie tongue center
  { src: memoji7, x: 64, y: 42, size: 118, z: 4, delay: 0.30 }, // heart girl
  { src: memoji8, x: 80, y: 36, size: 118, z: 3, delay: 0.60 }, // glasses asian right
];

function MemojiCluster() {
  return (
    <div className="relative mx-auto w-full max-w-[420px] aspect-[420/280]">
      {MEMOJIS.map((m, i) => (
        <motion.img
          key={i}
          src={m.src}
          alt=""
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -8, 0],
          }}
          transition={{
            opacity: { duration: 0.5, delay: 0.1 + i * 0.05 },
            scale: { duration: 0.7, delay: 0.1 + i * 0.05, ease: [0.34, 1.56, 0.64, 1] },
            y: {
              duration: 3.2 + (i % 3) * 0.4,
              delay: 1 + m.delay,
              repeat: Infinity,
              ease: [0.45, 0, 0.55, 1],
            },
          }}
          draggable={false}
          className="absolute select-none"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: `${m.size}px`,
            height: `${m.size}px`,
            zIndex: m.z,
            filter: "drop-shadow(0 10px 20px rgba(80, 55, 30, 0.18))",
          }}
        />
      ))}
    </div>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
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
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) { toast.error(res.error.message ?? "Google sign-in failed"); setLoading(false); return; }
    if (res.redirected) return;
    navigate({ to: "/" });
  }

  async function apple() {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin });
    if (res.error) { toast.error(res.error.message ?? "Apple sign-in failed"); setLoading(false); return; }
    if (res.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5ecdc]">
      {/* Warm cream wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 800px at 50% -10%, #fbf4e5 0%, transparent 55%), radial-gradient(900px 700px at 50% 100%, #e8d6b4 0%, transparent 60%)",
        }}
      />

      {/* Blended globe — bottom horizon */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] overflow-hidden">
        <svg
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: "-45%", opacity: 0.5 }}
          width="1400" height="1400" viewBox="0 0 1400 1400" fill="none" aria-hidden
        >
          <defs>
            <radialGradient id="globeGlow" cx="50%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#fff6e4" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#e8d0a4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#c9a870" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="globeStroke" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#a68556" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#a68556" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="700" cy="700" r="620" fill="url(#globeGlow)" />
          <g stroke="url(#globeStroke)" strokeWidth="1.2" fill="none">
            <circle cx="700" cy="700" r="620" />
            <ellipse cx="700" cy="700" rx="620" ry="200" />
            <ellipse cx="700" cy="700" rx="620" ry="380" />
            <ellipse cx="700" cy="700" rx="380" ry="620" />
            <ellipse cx="700" cy="700" rx="200" ry="620" />
          </g>
          {/* Sparkles */}
          {[
            [280, 780], [1120, 820], [420, 980], [980, 1000], [640, 900], [820, 860], [340, 900], [1060, 940],
          ].map(([cx, cy], i) => (
            <g key={i} transform={`translate(${cx} ${cy})`} opacity="0.7">
              <circle r="1.5" fill="#fff5d6" />
              <circle r="4" fill="#fff5d6" opacity="0.25" />
            </g>
          ))}
        </svg>
      </div>

      {/* Subtle grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply"
        style={{ backgroundImage: "radial-gradient(rgba(139,111,74,0.05) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center px-6 pt-16 pb-8">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center font-serif font-normal text-[#1a1a1a]"
          style={{
            fontSize: "clamp(3rem, 11vw, 4.25rem)",
            lineHeight: 0.98,
            letterSpacing: "-0.025em",
          }}
        >
          <span className="italic font-normal">Travel with</span>
          <br />
          <span className="italic font-normal">strangers.</span>
          <br />
          <span className="italic font-normal" style={{ color: "#6b533a" }}>
            Meet as friends.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-5 text-center text-[14px] text-[#8a7a63]"
          style={{ letterSpacing: "-0.005em" }}
        >
          Real-life gatherings, wherever you land.
        </motion.p>

        {/* Memoji cluster */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 w-full"
        >
          <MemojiCluster />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2 flex w-full flex-col items-center gap-2.5"
        >
          <Button
            onClick={apple}
            disabled={loading}
            className="h-[54px] w-full rounded-full bg-[#1a1a1a] text-white text-[15px] font-medium tracking-tight shadow-[0_12px_30px_-14px_rgba(26,26,26,0.55)] hover:bg-black"
          >
            <AppleIcon className="mr-2 h-[18px] w-[18px]" />
            Continue with Apple
          </Button>
          <Button
            onClick={google}
            disabled={loading}
            variant="outline"
            className="h-[54px] w-full rounded-full border-black/[0.06] bg-white text-[15px] font-medium tracking-tight text-[#1a1a1a] shadow-[0_8px_24px_-14px_rgba(0,0,0,0.25)] hover:bg-white"
          >
            <GoogleIcon className="mr-2 h-[18px] w-[18px]" />
            Continue with Google
          </Button>
          <Button
            onClick={() => setShowAuth(true)}
            variant="outline"
            className="h-[54px] w-full rounded-full border-black/[0.06] bg-white text-[15px] font-medium tracking-tight text-[#1a1a1a] shadow-[0_8px_24px_-14px_rgba(0,0,0,0.25)] hover:bg-white"
          >
            <Mail className="mr-2 h-[18px] w-[18px]" />
            Continue with Email
          </Button>
          <button
            onClick={() => { setMode("signin"); setShowAuth(true); }}
            className="mt-2 inline-flex items-center gap-1 text-[13px] text-[#8a7a63]"
          >
            Already have an account?{" "}
            <span className="font-semibold text-[#1a1a1a]">Sign in</span>
            <ChevronRight className="h-3.5 w-3.5 text-[#1a1a1a]" />
          </button>
        </motion.div>
      </div>

      {/* Email sign-in sheet */}
      <AnimatePresence>
        {showAuth && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowAuth(false)}
              className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md rounded-t-[28px] bg-background/95 p-6 pb-9 shadow-[0_-20px_60px_-20px_rgba(45,30,20,0.4)] backdrop-blur-2xl ring-1 ring-black/[0.05]"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="font-serif text-3xl leading-none tracking-[-0.02em] text-ink">
                    {mode === "signin" ? "Welcome back" : "Create your account"}
                  </h2>
                  <p className="mt-2 text-[13px] text-muted-foreground">
                    {mode === "signin" ? "Sign in to continue." : "Join Gobber — it takes a minute."}
                  </p>
                </div>
                <button
                  onClick={() => setShowAuth(false)}
                  className="rounded-full bg-secondary p-1.5 text-muted-foreground hover:text-ink"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 flex rounded-full bg-secondary p-1 text-xs font-medium">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 rounded-full px-3 py-2 transition ${mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                  >
                    {m === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="space-y-3">
                {mode === "signup" && (
                  <div>
                    <Label htmlFor="name" className="text-xs">Your name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Amelia" className="mt-1 h-11 rounded-xl bg-card" />
                  </div>
                )}
                <div>
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gobber.app" className="mt-1 h-11 rounded-xl bg-card" />
                </div>
                <div>
                  <Label htmlFor="password" className="text-xs">Password</Label>
                  <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 h-11 rounded-xl bg-card" />
                </div>
                <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl bg-ink text-background font-medium hover:bg-ink/90">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Start exploring"}
                </Button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
