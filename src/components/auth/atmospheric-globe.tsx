import { motion } from "framer-motion";

/**
 * Atmospheric globe — environmental lighting suggestion, not an illustration.
 * Only the upper curvature emerges. Continents are barely-perceptible warm patches.
 * No blue, no outlines, no map rendering. Opacity around 5–8%.
 */
export function AtmosphericGlobe() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[58vh] overflow-hidden"
      aria-hidden
    >
      {/* Ambient warm floor light — the "atmosphere" glow */}
      <div
        className="absolute inset-x-0 bottom-0 h-[46vh]"
        style={{
          background:
            "radial-gradient(80% 60% at 50% 100%, rgba(255, 232, 190, 0.55) 0%, rgba(248, 224, 180, 0.18) 45%, transparent 72%)",
        }}
      />

      {/* Barely-there sphere curvature — soft ivory sitting inside the wash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: "-88vh",
          width: "220vw",
          height: "128vh",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 28%, rgba(255,246,228,0.55) 0%, rgba(240,224,192,0.14) 42%, transparent 70%)",
          boxShadow:
            "inset 0 60px 120px rgba(255, 244, 220, 0.35), inset 0 -80px 160px rgba(160, 122, 78, 0.06)",
        }}
      />

      {/* Continent suggestions — extremely low opacity warm smudges. No shapes, no outlines. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[46vh]"
        style={{
          opacity: 0.055,
          mixBlendMode: "multiply",
          backgroundImage:
            "radial-gradient(ellipse 22% 6% at 22% 78%, #6b4a24 0%, transparent 65%)," +
            "radial-gradient(ellipse 18% 5% at 44% 84%, #6b4a24 0%, transparent 65%)," +
            "radial-gradient(ellipse 26% 7% at 68% 80%, #6b4a24 0%, transparent 65%)," +
            "radial-gradient(ellipse 14% 4% at 82% 88%, #6b4a24 0%, transparent 65%)",
        }}
      />

      {/* Horizon line light — the ridge where atmosphere catches the sun */}
      <div
        className="absolute inset-x-0"
        style={{
          bottom: "40vh",
          height: "12vh",
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(255, 240, 210, 0.35) 50%, transparent 100%)",
          filter: "blur(24px)",
        }}
      />
    </div>
  );
}
