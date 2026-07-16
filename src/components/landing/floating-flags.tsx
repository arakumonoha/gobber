import { motion } from "framer-motion";

// Scattered flag emojis with gentle floating animation (nomadtable-style)
type Flag = { flag: string; top: string; left: string; size: number; delay: number; mobile?: boolean };

const FLAGS: Flag[] = [
  { flag: "🇯🇵", top: "12%", left: "8%",  size: 56, delay: 0.0, mobile: true },
  { flag: "🇫🇷", top: "18%", left: "88%", size: 64, delay: 0.4, mobile: true },
  { flag: "🇮🇹", top: "34%", left: "4%",  size: 48, delay: 0.8 },
  { flag: "🇺🇸", top: "28%", left: "93%", size: 52, delay: 1.2 },
  { flag: "🇪🇸", top: "58%", left: "6%",  size: 60, delay: 0.2, mobile: true },
  { flag: "🇬🇧", top: "62%", left: "90%", size: 54, delay: 0.6, mobile: true },
  { flag: "🇩🇪", top: "78%", left: "12%", size: 46, delay: 1.0 },
  { flag: "🇧🇷", top: "82%", left: "86%", size: 58, delay: 0.3 },
  { flag: "🇦🇺", top: "45%", left: "2%",  size: 42, delay: 0.9 },
  { flag: "🇮🇳", top: "48%", left: "95%", size: 50, delay: 0.5 },
  { flag: "🇲🇽", top: "8%",  left: "40%", size: 44, delay: 0.7 },
  { flag: "🇰🇷", top: "90%", left: "48%", size: 46, delay: 0.1, mobile: true },
];

function twemojiUrl(emoji: string): string {
  const cps: string[] = [];
  for (const ch of emoji) {
    const cp = ch.codePointAt(0);
    if (cp && cp !== 0xfe0f) cps.push(cp.toString(16));
  }
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${cps.join("-")}.svg`;
}

export function FloatingFlags() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {FLAGS.map((f, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -14, 0],
            rotate: [0, i % 2 === 0 ? 4 : -4, 0],
          }}
          transition={{
            opacity: { duration: 0.8, delay: f.delay },
            scale: { duration: 0.8, delay: f.delay, ease: [0.22, 1, 0.36, 1] },
            y: { duration: 4 + (i % 3), delay: f.delay, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 5 + (i % 4), delay: f.delay, repeat: Infinity, ease: "easeInOut" },
          }}
          className={`absolute select-none ${f.mobile ? "" : "hidden sm:block"}`}
          style={{
            top: f.top,
            left: f.left,
            width: `clamp(${Math.round(f.size * 0.55)}px, ${f.size / 14}vw, ${f.size}px)`,
            lineHeight: 1,
            filter: "drop-shadow(0 12px 24px rgba(60,42,20,0.22))",
          }}
        >
          <img
            src={twemojiUrl(f.flag)}
            alt=""
            loading="lazy"
            draggable={false}
            className="block h-auto w-full"
          />
        </motion.div>
      ))}
    </div>
  );
}

