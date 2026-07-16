import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GoogleMap, type GoogleMapHandle } from "@/components/google-map";

type City = { name: string; flag: string; lat: number; lng: number; zoom: number };

const CITIES: City[] = [
  { name: "Tokyo", flag: "🇯🇵", lat: 35.6595, lng: 139.7005, zoom: 14 },
  { name: "Lisbon", flag: "🇵🇹", lat: 38.7069, lng: -9.1355, zoom: 14 },
  { name: "Barcelona", flag: "🇪🇸", lat: 41.4036, lng: 2.1744, zoom: 14 },
  { name: "New York", flag: "🇺🇸", lat: 40.758, lng: -73.9855, zoom: 14 },
  { name: "Marrakech", flag: "🇲🇦", lat: 31.6295, lng: -7.9811, zoom: 14 },
  { name: "Bali", flag: "🇮🇩", lat: -8.5069, lng: 115.2625, zoom: 13 },
  { name: "Reykjavik", flag: "🇮🇸", lat: 64.1466, lng: -21.9426, zoom: 13 },
  { name: "Mexico City", flag: "🇲🇽", lat: 19.4326, lng: -99.1332, zoom: 13 },
  { name: "Cape Town", flag: "🇿🇦", lat: -33.9249, lng: 18.4241, zoom: 13 },
  { name: "Paris", flag: "🇫🇷", lat: 48.8566, lng: 2.3522, zoom: 14 },
];

function MapCard({
  startIndex,
  interval,
  transform,
  width,
  height,
  floatDelay = 0,
}: {
  startIndex: number;
  interval: number;
  transform: string;
  width: number;
  height: number;
  floatDelay?: number;
}) {
  const [i, setI] = useState(startIndex);
  const [fading, setFading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mapRef = useRef<GoogleMapHandle>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const c = CITIES[i];
    mapRef.current?.panTo(c.lat, c.lng, c.zoom);
  }, [i, mounted]);

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setI((prev) => (prev + 3) % CITIES.length);
        setTimeout(() => setFading(false), 900);
      }, 700);
    }, interval);
    return () => clearInterval(t);
  }, [interval]);

  const city = CITIES[i];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: startIndex * 0.15 }}
      style={{
        width,
        height,
        transform,
        transformStyle: "preserve-3d",
        filter: "drop-shadow(0 30px 50px rgba(30,20,10,0.35))",
      }}
    >
      <motion.div
        animate={{ y: [0, -10, 0, 8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: floatDelay }}
        className="relative h-full w-full overflow-hidden rounded-[22px]"
        style={{
          border: "1px solid rgba(255,255,255,0.55)",
          background: "#0f0d0b",
        }}
      >
        <motion.div
          animate={{ opacity: fading ? 0.3 : 1, filter: fading ? "blur(2px)" : "blur(0px)" }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {mounted && (
            <GoogleMap
              ref={mapRef}
              pins={[]}
              mapTypeId="satellite"
              zoom={CITIES[startIndex].zoom}
              center={{ lat: CITIES[startIndex].lat, lng: CITIES[startIndex].lng }}
              className="absolute inset-0"
            />
          )}
        </motion.div>

        {/* Interaction blocker */}
        <div className="absolute inset-0 z-10" />

        {/* Warm color grade + top gloss */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,240,200,0.10) 0%, transparent 30%, rgba(20,10,4,0.55) 100%)",
            mixBlendMode: "multiply",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.18), transparent)",
          }}
        />

        {/* Label */}
        <motion.div
          key={city.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: fading ? 0 : 1, y: fading ? -4 : 0 }}
          transition={{ duration: 0.6 }}
          className="absolute bottom-3 left-3 text-white"
        >
          <div className="flex items-center gap-1.5 text-[9.5px] font-medium uppercase tracking-[0.18em] opacity-80">
            <span>{city.flag}</span>
            <span>live now</span>
          </div>
          <div className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em]">{city.name}</div>
        </motion.div>

        {/* Live ping */}
        <div className="absolute right-3 top-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E8A93C] opacity-90" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E8A93C]" />
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Floating3DMaps() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="pointer-events-auto absolute left-[3%] top-[16%] hidden md:block">
        <MapCard
          startIndex={0}
          interval={6200}
          width={250}
          height={175}
          transform="perspective(1400px) rotateX(22deg) rotateY(-16deg) rotateZ(-5deg)"
        />
      </div>
      <div className="pointer-events-auto absolute right-[3%] top-[10%] hidden md:block">
        <MapCard
          startIndex={2}
          interval={6800}
          width={290}
          height={205}
          floatDelay={1.4}
          transform="perspective(1400px) rotateX(19deg) rotateY(14deg) rotateZ(4deg)"
        />
      </div>
      <div className="pointer-events-auto absolute right-[9%] bottom-[6%] hidden lg:block">
        <MapCard
          startIndex={5}
          interval={7200}
          width={220}
          height={160}
          floatDelay={2.6}
          transform="perspective(1400px) rotateX(24deg) rotateY(-8deg) rotateZ(-2deg)"
        />
      </div>
      <div className="pointer-events-auto absolute left-[7%] bottom-[8%] hidden lg:block">
        <MapCard
          startIndex={7}
          interval={5800}
          width={210}
          height={150}
          floatDelay={0.7}
          transform="perspective(1400px) rotateX(20deg) rotateY(10deg) rotateZ(5deg)"
        />
      </div>
    </div>
  );
}
