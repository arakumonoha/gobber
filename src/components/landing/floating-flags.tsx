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
