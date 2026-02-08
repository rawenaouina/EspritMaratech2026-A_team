import { motion } from "framer-motion";

/**
 * Infinite carousel for organisation photos.
 * Images live under /public/org/*.png (you can replace them with real photos).
 */
export default function OrgCarousel({
  images = ["/org/1.png", "/org/2.png", "/org/3.png", "/org/4.png", "/org/5.png"],
  height = 96,
  speed = 35, // seconds for one loop
  className = "",
}) {
  // Duplicate to ensure a seamless loop
  const items = [...images, ...images];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border dark:border-slate-800 ${className}`}
      style={{ height }}
      aria-label="Galerie Universelle Ariana"
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-white dark:from-slate-950 via-transparent to-white dark:to-slate-950 opacity-80" />

      <motion.div
        className="absolute inset-y-0 left-0 flex items-center gap-3 px-3"
        animate={{ x: [0, "-50%"] }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
        style={{ willChange: "transform" }}
      >
        {items.map((src, idx) => (
          <img
            key={`${src}-${idx}`}
            src={src}
            alt=""
            className="h-[calc(100%-12px)] w-auto rounded-xl border dark:border-slate-800 object-cover shadow-sm"
            draggable={false}
          />
        ))}
      </motion.div>
    </div>
  );
}
