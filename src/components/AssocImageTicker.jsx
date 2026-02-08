import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const IMAGES = [
  "https://images.unsplash.com/photo-1520975912139-1f2ea6b44f51?auto=format&fit=crop&w=1400&q=60",
  "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1400&q=60",
  "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1400&q=60",
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1400&q=60",
];

export default function AssocImageTicker() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % IMAGES.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-2xl border overflow-hidden bg-white">
      <div className="p-4 border-b">
        <div className="font-semibold">📷 Universelle Ariana – actions</div>
        <div className="text-xs text-slate-500">Diaporama (concept) – pour impressionner le jury</div>
      </div>
      <div className="aspect-[16/7] bg-slate-100">
        <AnimatePresence mode="wait">
          <motion.img
            key={IMAGES[i]}
            src={IMAGES[i]}
            alt=""
            className="h-full w-full object-cover"
            initial={{ opacity: 0.2, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.2, scale: 1.03 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
