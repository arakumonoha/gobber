import { motion } from "framer-motion";
import m1 from "@/assets/people-v2/m1.png.asset.json";
import m2 from "@/assets/people-v2/m2.png.asset.json";
import m3 from "@/assets/people-v2/m3.png.asset.json";
import m4 from "@/assets/people-v2/m4.png.asset.json";
import m5 from "@/assets/people-v2/m5.png.asset.json";
import m6 from "@/assets/people-v2/m6.png.asset.json";
import m7 from "@/assets/people-v2/m7.png.asset.json";
import m8 from "@/assets/people-v2/m8.png.asset.json";
import m9 from "@/assets/people-v2/m9.png.asset.json";
import m10 from "@/assets/people-v2/m10.png.asset.json";
import m11 from "@/assets/people-v2/m11.png.asset.json";
import m12 from "@/assets/people-v2/m12.png.asset.json";

/**
 * Clean symmetric 3x4 grid of Apple memojis — no overlap.
 * Each face floats and breathes independently on its own rhythm.
 */

const EASE = [0.45, 0, 0.55, 1] as const;
const ROWS = [
  [m1, m2, m3, m4],
  [m5, m6, m7, m8],
  [m9, m10, m11, m12],
];

export function MemojiOrbit() {
  return (
    <div
      className="relative mx-auto grid w-full max-w-[420px] grid-cols-4 gap-x-4 gap-y-3 px-2"
      aria-hidden
    >
      {ROWS.flat().map((asset, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        // Staggered entrance across the grid
        const entryDelay = 0.15 + (row * 0.08 + col * 0.05);
        // Independent breathing rhythm per face
        const dur = 5.4 + ((i * 0.37) % 2.6);
        const floatDelay = (i * 0.31) % 2.4;
        const bob = 3 + ((i % 3) * 0.6);

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.7,
              delay: entryDelay,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative aspect-square"
          >
            {/* soft ground shadow */}
            <div
              className="absolute inset-x-3 bottom-1 h-2 rounded-full"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(90,60,25,0.28) 0%, rgba(90,60,25,0) 70%)",
                filter: "blur(4px)",
              }}
            />
            <motion.img
              src={asset.url}
              alt=""
              draggable={false}
              className="relative h-full w-full select-none"
              style={{
                objectFit: "contain",
                filter:
                  "drop-shadow(0 6px 12px rgba(60,42,20,0.18)) drop-shadow(0 1px 2px rgba(60,42,20,0.10))",
              }}
              animate={{ y: [0, -bob, 0, bob * 0.5, 0] }}
              transition={{
                duration: dur,
                repeat: Infinity,
                ease: EASE,
                delay: floatDelay,
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
