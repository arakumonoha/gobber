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
import { GoogleMap } from "@/components/google-map";
import memoji1 from "@/assets/memoji-1.png";
import memoji2 from "@/assets/memoji-2.png";
import memoji3 from "@/assets/memoji-3.png";
import memoji4 from "@/assets/memoji-4.png";
import memoji5 from "@/assets/memoji-5.png";
import memoji6 from "@/assets/memoji-6.png";

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
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

// Individual memoji with independent breathing motion.
type Memoji = {
  src: string;
  // percentage layout inside the cluster viewbox
  x: number; y: number; size: number; z: number;
  // motion params
  delay: number; duration: number; amp: number; tilt: number;
};

const MEMOJIS: Memoji[] = [
  { src: memoji2, x: 8,  y: 18, size: 88,  z: 2, delay: 0.05, duration: 5.4, amp: 6, tilt: -3 },
  { src: memoji3, x: 26, y: 6,  size: 104, z: 3, delay: 0.18, duration: 6.2, amp: 8, tilt: 2 },
  { src: memoji1, x: 44, y: 0,  size: 128, z: 5, delay: 0.30, duration: 5.8, amp: 9, tilt: -2 },
  { src: memoji5, x: 62, y: 8,  size: 108, z: 4, delay: 0.42, duration: 6.4, amp: 7, tilt: 3 },
  { src: memoji6, x: 78, y: 20, size: 94,  z: 2, delay: 0.55, duration: 5.6, amp: 6, tilt: -2 },
  { src: memoji4, x: 36, y: 42, size: 96,  z: 1, delay: 0.68, duration: 6.0, amp: 5, tilt: 2 },
];

function MemojiCluster() {
  return (
    <div className="relative mx-auto w-full max-w-[420px]" style={{ aspectRatio: "1.55 / 1" }}>
      {MEMOJIS.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 24, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            opacity: { duration: 0.6, delay: m.delay, ease: [0.22, 1, 0.36, 1] },
            y:       { duration: 0.9, delay: m.delay, ease: [0.34, 1.4, 0.64, 1] },
            scale:   { duration: 0.9, delay: m.delay, ease: [0.34, 1.56, 0.64, 1] },
          }}
          className="absolute"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: `${m.size}px`,
            height: `${m.size}px`,
            zIndex: m.z,
          }}
        >
          <motion.img
            src={m.src}
            alt=""
            draggable={false}
            width={256}
            height={256}
            className="h-full w-full select-none"
            style={{
              filter: `drop-shadow(0 ${8 + m.z * 2}px ${14 + m.z * 3}px rgba(70, 45, 20, ${0.14 + m.z * 0.02}))`,
            }}
            animate={{ y: [0, -m.amp, 0], rotate: [0, m.tilt, 0] }}
            transition={{
              duration: m.duration,
              delay: m.delay + 0.9,
              repeat: Infinity,
              ease: [0.45, 0, 0.55, 1],
            }}
          />
        </motion.div>
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
    <div className="relative min-h-screen overflow-hidden bg-[#f5eddc]">
      {/* Warm cream wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 800px at 50% -10%, #fbf4e5 0%, transparent 55%), linear-gradient(180deg, #f5eddc 0%, #efe3ca 100%)",
        }}
      />

      {/* Bottom quarter map — dissolves into cream */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0"
        style={{
          height: "26vh",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 22%, rgba(0,0,0,0.75) 55%, #000 85%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 22%, rgba(0,0,0,0.75) 55%, #000 85%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 0.85, scale: 1 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="h-full w-full"
        >
          <GoogleMap
            pins={[]}
            className="h-full w-full"
            mapTypeId="satellite"
            center={{ lat: 28, lng: 12 }}
            zoom={2.6}
          />
        </motion.div>
        {/* Warm tint over the map to blend with cream */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(245,237,220,0.55) 0%, rgba(245,237,220,0.15) 40%, rgba(239,227,202,0.35) 100%)",
            mixBlendMode: "multiply",
          }}
        />
      </div>

      {/* Subtle grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.28] mix-blend-multiply"
        style={{
          backgroundImage: "radial-gradient(rgba(139,111,74,0.05) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col px-6 pt-16 pb-10">
        {/* Headline — large, confident, Apple-style */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center font-serif text-[#1a1614]"
          style={{
            fontSize: "clamp(3.4rem, 13vw, 5rem)",
            lineHeight: 0.94,
            letterSpacing: "-0.035em",
            fontWeight: 400,
          }}
        >
          <span className="italic">Travel with</span>
          <br />
          <span className="italic">strangers.</span>
          <br />
          <span className="italic" style={{ color: "#8a6a48", display: "inline-block", marginTop: "0.12em" }}>
            Meet as friends.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-5 text-center text-[14px] text-[#9a8770] tracking-[-0.005em]"
        >
          Real-life gatherings, wherever you land.
        </motion.p>

        {/* Memoji cluster — individual, independently animated */}
        <div className="mt-8 flex-1 flex items-center justify-center">
          <MemojiCluster />
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mt-6 flex w-full flex-col items-center gap-2.5"
        >
          <PressButton
            onClick={apple}
            disabled={loading}
            className="bg-[#141210] text-white shadow-[0_16px_38px_-18px_rgba(20,18,16,0.7)] hover:bg-black"
          >
            <AppleIcon className="mr-2 h-[19px] w-[19px]" />
            Continue with Apple
          </PressButton>
          <PressButton
            onClick={google}
            disabled={loading}
            className="bg-white text-[#1a1614] shadow-[0_10px_28px_-16px_rgba(0,0,0,0.28)] hover:bg-white"
          >
            <GoogleIcon className="mr-2 h-[19px] w-[19px]" />
            Continue with Google
          </PressButton>
          <PressButton
            onClick={() => setShowAuth(true)}
            disabled={loading}
            className="bg-white/70 text-[#1a1614] backdrop-blur-xl shadow-[0_10px_28px_-16px_rgba(0,0,0,0.22)] hover:bg-white/80 ring-1 ring-black/[0.04]"
          >
            <Mail className="mr-2 h-[18px] w-[18px]" />
            Continue with Email
          </PressButton>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setMode("signin"); setShowAuth(true); }}
            className="mt-3 inline-flex items-center gap-1 text-[13px] text-[#9a8770] transition-colors"
          >
            Already have an account?{" "}
            <span className="font-semibold text-[#1a1614]">Sign in</span>
            <ChevronRight className="h-3.5 w-3.5 text-[#1a1614]" />
          </motion.button>
        </motion.div>
      </div>

      {/* Email sheet */}
      <AnimatePresence>
        {showAuth && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowAuth(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md rounded-t-[28px] bg-white/95 p-6 pb-9 shadow-[0_-20px_60px_-20px_rgba(45,30,20,0.4)] backdrop-blur-2xl ring-1 ring-black/[0.05]"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/20" />
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="font-serif italic text-3xl leading-none tracking-[-0.02em] text-[#1a1614]">
                    {mode === "signin" ? "Welcome back" : "Create your account"}
                  </h2>
                  <p className="mt-2 text-[13px] text-[#9a8770]">
                    {mode === "signin" ? "Sign in to continue." : "Join Gobber — it takes a minute."}
                  </p>
                </div>
                <button
                  onClick={() => setShowAuth(false)}
                  className="rounded-full bg-black/5 p-1.5 text-[#9a8770] transition hover:text-[#1a1614]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 flex rounded-full bg-black/[0.04] p-1 text-xs font-medium">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 rounded-full px-3 py-2 transition ${mode === m ? "bg-white text-[#1a1614] shadow-sm" : "text-[#9a8770]"}`}
                  >
                    {m === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="space-y-3">
                {mode === "signup" && (
                  <div>
                    <Label htmlFor="name" className="text-xs">Your name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Amelia" className="mt-1 h-11 rounded-xl bg-white" />
                  </div>
                )}
                <div>
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gobber.app" className="mt-1 h-11 rounded-xl bg-white" />
                </div>
                <div>
                  <Label htmlFor="password" className="text-xs">Password</Label>
                  <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 h-11 rounded-xl bg-white" />
                </div>
                <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl bg-[#141210] text-white font-medium transition hover:bg-black active:scale-[0.99]">
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

function PressButton({
  onClick, disabled, className, children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.975 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      className={`inline-flex h-[54px] w-full items-center justify-center rounded-full text-[15.5px] font-medium tracking-[-0.01em] disabled:opacity-70 ${className ?? ""}`}
    >
      {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </motion.button>
  );
}
