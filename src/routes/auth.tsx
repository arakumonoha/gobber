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
import memojiBundle from "@/assets/memoji-bundle.png";

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
    <div className="relative min-h-screen overflow-hidden bg-[#f4ecdd]">
      {/* Warm cream wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 900px at 50% -15%, #fbf4e6 0%, transparent 55%), radial-gradient(1100px 800px at 50% 105%, #ead4a8 0%, transparent 62%)",
        }}
      />

      {/* Prominent globe horizon at bottom, with city lights */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] overflow-hidden">
        <svg
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: "-58%" }}
          width="1600" height="1600" viewBox="0 0 1600 1600" fill="none" aria-hidden
        >
          <defs>
            <radialGradient id="globeBody" cx="50%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#fff2d6" stopOpacity="1" />
              <stop offset="40%" stopColor="#f2d9a8" stopOpacity="0.85" />
              <stop offset="75%" stopColor="#c99a5c" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#8a6535" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="globeRim" cx="50%" cy="25%" r="70%">
              <stop offset="60%" stopColor="#8a6535" stopOpacity="0" />
              <stop offset="88%" stopColor="#8a6535" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#5a3f1c" stopOpacity="0.7" />
            </radialGradient>
            <radialGradient id="topFade" cx="50%" cy="0%" r="55%">
              <stop offset="0%" stopColor="#f4ecdd" stopOpacity="1" />
              <stop offset="100%" stopColor="#f4ecdd" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Globe body */}
          <circle cx="800" cy="800" r="720" fill="url(#globeBody)" />
          <circle cx="800" cy="800" r="720" fill="url(#globeRim)" />

          {/* Coastline / continent hints (very subtle organic shapes) */}
          <g opacity="0.28" fill="#a37540">
            <path d="M320 1050 Q 420 1010, 520 1055 T 720 1070 Q 800 1075, 880 1050 T 1080 1080 Q 1180 1095, 1280 1060 L 1300 1120 Q 1160 1160, 1000 1140 T 700 1150 Q 520 1145, 360 1120 Z" />
            <path d="M240 1240 Q 380 1210, 540 1245 T 820 1260 Q 1000 1265, 1180 1240 T 1360 1250 L 1370 1310 Q 1160 1350, 940 1330 T 560 1330 Q 380 1320, 220 1300 Z" />
            <path d="M420 900 Q 500 880, 580 905 T 720 915 L 730 940 Q 620 950, 500 940 T 400 930 Z" />
            <path d="M900 880 Q 1000 860, 1100 895 T 1240 910 L 1250 940 Q 1120 955, 980 940 T 880 920 Z" />
          </g>

          {/* City lights */}
          <g fill="#fff1c8">
            {[
              [380,1080,1.6],[430,1105,1.2],[510,1090,1.8],[560,1120,1.3],
              [640,1075,1.5],[700,1105,2],[770,1090,1.4],[840,1115,1.7],
              [920,1080,1.6],[985,1110,2.2],[1050,1085,1.5],[1120,1115,1.4],
              [1190,1090,1.7],[1260,1120,1.3],
              [300,1245,1.5],[380,1265,1.8],[470,1250,1.4],[560,1275,2],
              [650,1255,1.6],[740,1280,1.5],[830,1260,1.9],[920,1285,1.5],
              [1010,1265,1.7],[1100,1290,1.4],[1200,1270,1.8],[1290,1290,1.3],
              [1380,1265,1.5],
              [460,910,1.2],[540,925,1.4],[620,915,1.1],[700,930,1.3],
              [960,905,1.3],[1040,920,1.5],[1120,912,1.2],[1200,930,1.4],
            ].map(([cx, cy, r], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r={r as number} opacity="0.95" />
                <circle cx={cx} cy={cy} r={(r as number) * 3.5} opacity="0.18" />
              </g>
            ))}
          </g>

          {/* Top fade to blend into cream */}
          <rect x="0" y="0" width="1600" height="600" fill="url(#topFade)" />
        </svg>
      </div>

      {/* Subtle grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.3] mix-blend-multiply"
        style={{ backgroundImage: "radial-gradient(rgba(139,111,74,0.05) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center px-6 pt-14 pb-8">
        {/* Headline — bold serif, matching reference exactly */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center font-serif text-[#1a1614]"
          style={{
            fontSize: "clamp(3.2rem, 12vw, 4.6rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            fontWeight: 400,
          }}
        >
          <span className="italic">Travel with</span>
          <br />
          <span className="italic">strangers.</span>
          <br />
          <span
            className="italic"
            style={{ color: "#7a5c40", display: "inline-block", marginTop: "0.15em" }}
          >
            Meet as friends.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-5 text-center text-[13.5px] text-[#9a8770]"
          style={{ letterSpacing: "-0.005em" }}
        >
          Real-life gatherings, wherever you land.
        </motion.p>

        {/* Memoji bundle — the group photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
          transition={{
            opacity: { duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] },
            scale:   { duration: 0.9, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] },
            y: { duration: 5.5, delay: 1.2, repeat: Infinity, ease: [0.45, 0, 0.55, 1] },
          }}
          className="relative mt-6 w-full max-w-[360px]"
        >
          <img
            src={memojiBundle}
            alt=""
            width={1200}
            height={1024}
            className="h-auto w-full select-none"
            draggable={false}
            style={{ filter: "drop-shadow(0 20px 30px rgba(80, 55, 30, 0.18))" }}
          />
        </motion.div>

        {/* CTAs — three-button stack */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 flex w-full flex-col items-center gap-2.5"
        >
          <Button
            onClick={apple}
            disabled={loading}
            className="h-[54px] w-full rounded-full bg-[#141210] text-white text-[15.5px] font-medium tracking-[-0.01em] shadow-[0_14px_34px_-16px_rgba(20,18,16,0.6)] hover:bg-black"
          >
            <AppleIcon className="mr-2 h-[19px] w-[19px]" />
            Continue with Apple
          </Button>
          <Button
            onClick={google}
            disabled={loading}
            variant="outline"
            className="h-[54px] w-full rounded-full border-0 bg-white text-[15.5px] font-medium tracking-[-0.01em] text-[#1a1614] shadow-[0_10px_28px_-16px_rgba(0,0,0,0.28)] hover:bg-white"
          >
            <GoogleIcon className="mr-2 h-[19px] w-[19px]" />
            Continue with Google
          </Button>
          <Button
            onClick={() => setShowAuth(true)}
            variant="outline"
            className="h-[54px] w-full rounded-full border-0 bg-white text-[15.5px] font-medium tracking-[-0.01em] text-[#1a1614] shadow-[0_10px_28px_-16px_rgba(0,0,0,0.28)] hover:bg-white"
          >
            <Mail className="mr-2 h-[18px] w-[18px]" />
            Continue with Email
          </Button>
          <button
            onClick={() => { setMode("signin"); setShowAuth(true); }}
            className="mt-3 inline-flex items-center gap-1 text-[13px] text-[#9a8770]"
          >
            Already have an account?{" "}
            <span className="font-semibold text-[#1a1614]">Sign in</span>
            <ChevronRight className="h-3.5 w-3.5 text-[#1a1614]" />
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
                  className="rounded-full bg-black/5 p-1.5 text-[#9a8770] hover:text-[#1a1614]"
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
                <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl bg-[#141210] text-white font-medium hover:bg-black">
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
