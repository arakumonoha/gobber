import { motion } from "framer-motion";
import p1 from "@/assets/people/p1.png";
import p2 from "@/assets/people/p2.png";
import p3 from "@/assets/people/p3.png";
import p4 from "@/assets/people/p4.png";
import p5 from "@/assets/people/p5.png";
import p6 from "@/assets/people/p6.png";
import p7 from "@/assets/people/p7.png";
import p8 from "@/assets/people/p8.png";

/**
 * iCloud-style orbit: one large memoji at center in a soft tinted disc,
 * surrounded by smaller memojis floating in dark bubbles.
 * Each bubble breathes/floats independently.
 */

const EASE = [0.45, 0, 0.55, 1] as const;

// Positions in % relative to the container (which is a square).
const ORBIT: Array<{ src: string; x: number; y: number; size: number; delay: number }> = [
  { src: p2, x: 50, y: 6,  size: 62, delay: 0.0 },  // top
  { src: p3, x: 84, y: 18, size: 56, delay: 0.4 },  // top-right
  { src: p4, x: 94, y: 52, size: 66, delay: 0.8 },  // right
  { src: p5, x: 80, y: 86, size: 58, delay: 1.1 },  // bottom-right
  { src: p6, x: 42, y: 96, size: 64, delay: 0.6 },  // bottom
  { src: p7, x: 10, y: 82, size: 56, delay: 0.3 },  // bottom-left
  { src: p8, x: 4,  y: 46, size: 62, delay: 0.9 },  // left
  { src: p1, x: 14, y: 14, size: 58, delay: 0.5 },  // top-left
];

export function MemojiOrbit({ center = p4 }: { center?: string }) {
  return (
    <div
      className="relative mx-auto"
      style={{ width: 340, height: 340 }}
      aria-hidden
    >
      {/* Center memoji — large, soft tinted disc */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{ y: [0, -4, 0, 3, 0], scale: [1, 1.015, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: EASE }}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 152,
            height: 152,
            background:
              "radial-gradient(circle at 30% 30%, #d8ecd4 0%, #b9dbb2 70%, #a7cf9f 100%)",
            boxShadow:
              "0 20px 50px -18px rgba(60,42,20,0.35), inset 0 2px 6px rgba(255,255,255,0.6)",
          }}
        >
          <img
            src={center}
            alt=""
            className="h-[130px] w-[130px] object-contain"
            style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.15))" }}
            draggable={false}
          />
        </motion.div>
      </motion.div>

      {/* Orbiting memojis in dark bubbles */}
      {ORBIT.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="absolute"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.size,
            height: m.size,
            transform: "translate(-50%, -50%)",
          }}
        >
          <motion.div
            animate={{
              y: [0, -5, 0, 4, 0],
              x: [0, 2, 0, -2, 0],
              scale: [1, 1.03, 1],
            }}
            transition={{
              duration: 5 + (i % 3),
              repeat: Infinity,
              ease: EASE,
              delay: m.delay,
            }}
            className="flex h-full w-full items-center justify-center rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, #3a3936 0%, #1e1d1b 75%, #141312 100%)",
              boxShadow:
                "0 10px 24px -10px rgba(0,0,0,0.45), inset 0 1px 2px rgba(255,255,255,0.08)",
            }}
          >
            <img
              src={m.src}
              alt=""
              className="object-contain"
              style={{
                width: m.size * 0.72,
                height: m.size * 0.72,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))",
              }}
              draggable={false}
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
