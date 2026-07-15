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

// Coordinates in a 460x340 stage. Sizes chosen so composition reads as one mass.
// Mirror-symmetric around x=230.
type M = { src: { url: string }; x: number; y: number; size: number; z: number; rot: number; delay: number };
const BUNDLE: M[] = [
  // Back row (higher, smaller)
  { src: m2, x: 150, y: 60,  size: 128, z: 1, rot: -6, delay: 0.0 },
  { src: m3, x: 230, y: 44,  size: 138, z: 2, rot: 0,  delay: 0.6 },
  { src: m4, x: 310, y: 60,  size: 128, z: 1, rot: 6,  delay: 1.1 },
  // Front row (larger, lower, overlapping back)
  { src: m5, x: 96,  y: 170, size: 132, z: 3, rot: -10, delay: 0.4 },
  { src: m6, x: 186, y: 200, size: 148, z: 5, rot: -3,  delay: 0.8 },
  { src: m7, x: 274, y: 200, size: 148, z: 5, rot: 3,   delay: 0.2 },
  { src: m8, x: 364, y: 170, size: 132, z: 3, rot: 10,  delay: 1.0 },
  // Small anchor tucked at front-center bottom
  { src: m1, x: 230, y: 258, size: 116, z: 6, rot: 0,   delay: 0.5 },
];

export function MemojiOrbit() {
  return (
    <div
      className="relative mx-auto"
      style={{ width: "min(460px, 100%)", aspectRatio: "460 / 340" }}
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
            top: `${(m.y / 340) * 100}%`,
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
