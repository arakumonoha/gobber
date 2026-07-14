import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Welcome — NomadTable" },
      { name: "description", content: "Real-life gatherings, wherever you land." },
    ],
  }),
  component: AuthPage,
});

// Memoji-style avatars — playful circular gradients with a face emoji.
// The "you" avatar is highlighted with a warm clay ring.
const AVATARS: {
  emoji: string;
  from: string;
  to: string;
  x: string;
  y: string;
  size: number;
  delay: number;
  duration: number;
  isYou?: boolean;
}[] = [
  { emoji: "🧑🏻‍🦱", from: "#f9d29d", to: "#e8a87c", x: "12%",  y: "10%", size: 68, delay: 0.0, duration: 3.4 },
  { emoji: "👩🏽‍🦰", from: "#f6b0a5", to: "#c9756a", x: "78%",  y: "6%",  size: 74, delay: 0.4, duration: 3.8 },
  { emoji: "🧑🏾",   from: "#c8a678", to: "#8b6f5e", x: "88%",  y: "38%", size: 60, delay: 0.9, duration: 3.2 },
  { emoji: "👨🏼‍🦳", from: "#e6d4b8", to: "#b89b7a", x: "6%",   y: "44%", size: 64, delay: 0.6, duration: 3.6 },
  { emoji: "😎",     from: "#f5c9a1", to: "#c78a5b", x: "22%",  y: "72%", size: 82, delay: 0.2, duration: 4.0, isYou: true },
  { emoji: "👩🏻",   from: "#f8dcc3", to: "#d9a172", x: "70%",  y: "70%", size: 66, delay: 0.7, duration: 3.5 },
  { emoji: "🧔🏽",   from: "#d9b892", to: "#8f6b4a", x: "48%",  y: "84%", size: 58, delay: 1.0, duration: 3.3 },
  { emoji: "🧑🏼‍🦰", from: "#f4c7a1", to: "#d0895a", x: "44%",  y: "4%",  size: 56, delay: 0.5, duration: 3.7 },
];

function MemojiCloud() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {AVATARS.map((a, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: a.x, top: a.y, width: a.size, height: a.size }}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -10, 0],
          }}
          transition={{
            opacity: { duration: 0.8, delay: a.delay, ease: [0.22, 1, 0.36, 1] },
            scale:   { duration: 0.9, delay: a.delay, ease: [0.34, 1.56, 0.64, 1] },
            y: {
              duration: a.duration,
              delay: a.delay + 0.9,
              repeat: Infinity,
              ease: [0.45, 0, 0.55, 1],
            },
          }}
        >
          <div
            className="relative flex h-full w-full items-center justify-center rounded-full"
            style={{
              background: `radial-gradient(circle at 30% 25%, ${a.from}, ${a.to})`,
              boxShadow: a.isYou
                ? "0 18px 40px -12px rgba(139,115,85,0.55), inset 0 1px 0 rgba(255,255,255,0.5), 0 0 0 3px rgba(255,255,255,0.9), 0 0 0 5px #c78a5b"
                : "0 12px 30px -10px rgba(60,45,30,0.45), inset 0 1px 0 rgba(255,255,255,0.45), 0 0 0 2.5px rgba(255,255,255,0.9)",
              fontSize: a.size * 0.58,
              lineHeight: 1,
            }}
          >
            <span style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.15))" }}>{a.emoji}</span>
            {a.isYou && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-ink px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-background shadow-md">
                you
              </span>
            )}
          </div>
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
        toast.success("Welcome to NomadTable ✈️");
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Warm sand ambient wash — iCloud-style clean canvas */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 700px at 50% -10%, #fbf5ea 0%, transparent 60%), radial-gradient(900px 600px at 80% 100%, #f3e3cc 0%, transparent 55%), radial-gradient(700px 500px at 10% 90%, #f6e6d0 0%, transparent 55%)",
        }}
      />
      <div className="absolute inset-0 opacity-[0.35] mix-blend-multiply"
        style={{ backgroundImage: "radial-gradient(rgba(139,115,85,0.08) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      {/* Landing */}
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-md ring-1 ring-black/[0.04]">
            <span className="h-1.5 w-1.5 rounded-full bg-clay" />
            NomadTable
          </div>
          <h1 className="font-display text-[2.9rem] font-semibold leading-[1.02] tracking-[-0.04em] text-ink sm:text-[3.4rem]">
            Travel with strangers.
            <br />
            <span className="font-normal italic tracking-[-0.045em] text-clay">Meet as friends.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[18rem] text-[15px] leading-snug tracking-tight text-muted-foreground">
            Real-life gatherings, wherever you land.
          </p>
        </motion.div>

        {/* Memoji constellation */}
        <div className="relative mx-auto my-6 h-[360px] w-full max-w-[380px]">
          <MemojiCloud />
        </div>

        {/* Let's start CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-auto flex flex-col items-center gap-3"
        >
          <Button
            onClick={() => setShowAuth(true)}
            className="h-12 w-full max-w-xs rounded-full bg-ink text-background font-medium tracking-tight shadow-[0_10px_30px_-10px_rgba(45,30,20,0.55)] hover:bg-ink/90"
          >
            Let's start
          </Button>
          <button
            onClick={() => { setMode("signin"); setShowAuth(true); }}
            className="text-[13px] font-medium text-clay hover:underline"
          >
            Already have an account? Sign in
          </button>
        </motion.div>
      </div>

      {/* Sign-in sheet */}
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
                  <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink">
                    {mode === "signin" ? "Welcome back" : "Create your account"}
                  </h2>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {mode === "signin" ? "Sign in to continue exploring." : "Join the table — it takes a minute."}
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
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@nomad.club" className="mt-1 h-11 rounded-xl bg-card" />
                </div>
                <div>
                  <Label htmlFor="password" className="text-xs">Password</Label>
                  <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 h-11 rounded-xl bg-card" />
                </div>
                <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl bg-ink text-background font-medium hover:bg-ink/90">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Start exploring"}
                </Button>
              </form>

              <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
              </div>

              <Button variant="outline" onClick={google} disabled={loading} className="h-11 w-full rounded-xl border-border bg-card font-medium">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
                Continue with Google
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
