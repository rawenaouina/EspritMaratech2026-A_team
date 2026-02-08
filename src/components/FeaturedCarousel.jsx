import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "../lib/apiClient";

export default function FeaturedCarousel() {
  const [items, setItems] = useState([]);
  const [i, setI] = useState(0);

  useEffect(() => {
    apiFetch("/api/cases/featured").then((d) => setItems(d.items || []));
  }, []);

  useEffect(() => {
    if (!items.length) return;
    const t = setInterval(() => setI((x) => (x + 1) % items.length), 3500);
    return () => clearInterval(t);
  }, [items]);

  if (!items.length) return null;
  const item = items[i];
  const img = item.photos?.[0];

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cas mis en avant</h3>
        <div className="flex gap-2">
          <button className="rounded-xl border px-3 py-1" onClick={() => setI((x) => (x - 1 + items.length) % items.length)}>Prev</button>
          <button className="rounded-xl border px-3 py-1" onClick={() => setI((x) => (x + 1) % items.length)}>Next</button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="grid gap-3 md:grid-cols-2"
          >
            <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100">
              {img && <img src={img} className="h-full w-full object-cover" />}
            </div>
            <div>
              <div className="text-sm text-slate-500">{item.address}</div>
              <div className="mt-1 text-xl font-semibold">{item.title}</div>
              <p className="mt-2 text-slate-700">{item.summary}</p>
              <a
                className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                href={item.cha9a9aUrl}
                target="_blank"
                rel="noreferrer"
              >
                Donner via Cha9a9a
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
