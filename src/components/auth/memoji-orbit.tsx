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
 * Symmetric humanoid memoji bundle — a tight, overlapping group photo
 * arranged like the reference: two rows, back row of 3, front row of 4,
 * with a fifth face tucked to the side. Each memoji breathes independently.
 */

const EASE = [0.45, 0, 0.55, 1] as const;

// Symmetric two-row group. Coordinates in a 320x260 box.
// Back row (higher, slightly smaller). Front row (lower, larger, overlapping).
const GROUP: Array<{ src: string; x: number; y: number; size: number; z: number; delay: number; rotate: number }> = [
  // Back row — 3 faces, symmetric
  { src: p1, x: 88,  y: 40,  size: 78, z: 1, delay: 0.0, rotate: -6 },
  { src: p2, x: 160, y: 22,  size: 82, z: 2, delay: 0.4, rotate: 0 },
  { src: p3, x: 232, y: 40,  size: 78, z: 1, delay: 0.8, rotate: 6 },
  // Front row — 4 faces, symmetric, overlapping the back row
  { src: p4, x: 60,  y: 118, size: 84, z: 3, delay: 0.6, rotate: -8 },
  { src: p5, x: 130, y: 132, size: 88, z: 4, delay: 0.2, rotate: -2 },
  { src: p6, x: 200, y: 132, size: 88, z: 4, delay: 1.0, rotate: 2 },
  { src: p7, x: 270, y: 118, size: 84, z: 3, delay: 0.5, rotate: 8 },
  // Small accent tucked in the front-center to add depth (still symmetric mass)
  { src: p8, x: 165, y: 178, size: 72, z: 5, delay: 0.9, rotate: 0 },
];

export function MemojiOrbit() {
  return (
    <div className="relative mx-auto" style={{ width: 340, height: 260 }} aria-hidden>
      {/* Soft warm ground shadow beneath the group */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: 6,
          width: 240,
          height: 30,
          background:
            "radial-gradient(ellipse at center, rgba(90,60,25,0.22) 0%, rgba(90,60,25,0) 70%)",
          filter: "blur(6px)",
        }}
      />

      {GROUP.map((m, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: m.x,
            top: m.y,
            width: m.size,
            height: m.size,
            marginLeft: -m.size / 2,
            marginTop: -m.size / 2,
            zIndex: m.z,
          }}
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="h-full w-full"
            style={{ rotate: m.rotate }}
            animate={{
              y: [0, -3, 0, 2, 0],
              rotate: [m.rotate, m.rotate + 1.2, m.rotate, m.rotate - 1.2, m.rotate],
            }}
            transition={{
              duration: 6 + (i % 3) * 0.6,
              repeat: Infinity,
              ease: EASE,
              delay: m.delay,
            }}
          >
            <img
              src={m.src}
              alt=""
              className="h-full w-full select-none"
              draggable={false}
              style={{
                objectFit: "contain",
                filter:
                  "drop-shadow(0 8px 14px rgba(60,42,20,0.22)) drop-shadow(0 2px 4px rgba(60,42,20,0.12))",
              }}
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
