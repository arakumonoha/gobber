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
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        onKeyDown={(e) => { if (e.key === "Enter" && onSubmit) { e.preventDefault(); onSubmit(); } }}
        className="h-[46px] w-full rounded-[10px] border border-[#1a1614]/12 bg-white/85 px-4 pr-12 text-[15px] tracking-[-0.01em] text-[#0f0d0b] placeholder:text-[#a89676] outline-none transition focus:border-[#8a6b45]/50 focus:bg-white"
      />
      {showSubmit && (
        <motion.button
          type="button" onClick={onSubmit} disabled={submitting || !value} whileTap={{ scale: 0.92 }}
          className="absolute right-1.5 top-1/2 flex h-[36px] w-[36px] -translate-y-1/2 items-center justify-center rounded-full bg-[#0f0d0b] text-white transition disabled:opacity-30"
          aria-label="Continue"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" strokeWidth={2.4} />}
        </motion.button>
      )}
    </div>
  );
}

function SocialButton({ children, onClick, loading, disabled, label }: {
  children: React.ReactNode; onClick: () => void; loading?: boolean; disabled?: boolean; label: string;
}) {
  return (
    <motion.button
      onClick={onClick} disabled={disabled}
      whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      aria-label={label}
      className="flex h-[46px] w-[64px] items-center justify-center rounded-[12px] border border-[#1a1614]/10 bg-white/80 transition hover:bg-white disabled:opacity-60"
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 6px 16px -12px rgba(60,42,20,0.2)" }}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin text-[#0f0d0b]" /> : children}
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
        background: "rgba(255,253,247,0.92)",
        backdropFilter: "saturate(180%) blur(40px)",
        border: "1px solid rgba(255,255,255,0.75)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 40px 90px -30px rgba(60,42,20,0.4), 0 10px 30px -18px rgba(60,42,20,0.18)",
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full text-[#5a4f43] transition hover:bg-black/5"
      >
        <X className="h-4 w-4" />
      </button>
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
                <div className="flex items-center justify-between px-1 text-[12.5px] text-[#8a7a5f]">
                  <span className="truncate">{email}</span>
                  <button onClick={() => setStep("email")} className="text-[#8a6b45] hover:underline">Change</button>
                </div>
                <InlineField type="password" placeholder="Password" value={password} onChange={setPassword} autoFocus autoComplete={mode === "signin" ? "current-password" : "new-password"} showSubmit submitting={loading === "form"} onSubmit={submit} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-[#1a1614]/10" />
          <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[#a08a68]">or</span>
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

        <div className="mt-6 text-center text-[13px] text-[#8a7a5f]">
          {mode === "signin" ? (
            <>New here?{" "}<button onClick={() => { setMode("signup"); setStep("email"); }} className="font-medium text-[#8a6b45] hover:underline">Create an account</button></>
          ) : (
            <>Already have an account?{" "}<button onClick={() => { setMode("signin"); setStep("email"); }} className="font-medium text-[#8a6b45] hover:underline">Sign in</button></>
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
