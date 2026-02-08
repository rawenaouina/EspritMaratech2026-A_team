import { useEffect, useState } from "react";
import { t } from "../i18n/i18n.js";

export default function VisualSettings() {
  const [open, setOpen] = useState(false);
  const [brightness, setBrightness] = useState(() => Number(localStorage.getItem("brightness") || "1"));
  const [contrast, setContrast] = useState(() => Number(localStorage.getItem("contrast") || "1"));

  useEffect(() => {
    localStorage.setItem("brightness", String(brightness));
    document.documentElement.style.setProperty("--brightness", String(brightness));
  }, [brightness]);

  useEffect(() => {
    localStorage.setItem("contrast", String(contrast));
    document.documentElement.style.setProperty("--contrast", String(contrast));
  }, [contrast]);

  function reset() {
    setBrightness(1);
    setContrast(1);
  }

  return (
    <div className="relative">
      <button
        className="px-3 py-2 rounded-xl border"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-label={t("visual")}
        title={t("visual")}
      >
        🎚️
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 card p-4 space-y-3 z-20">
          <div className="font-semibold">{t("visual")}</div>

          <div className="space-y-1">
            <label className="text-sm" htmlFor="brightness">{t("brightness")} ({brightness.toFixed(2)})</label>
            <input
              id="brightness"
              type="range"
              min="0.85"
              max="1.25"
              step="0.01"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm" htmlFor="contrast">{t("contrast")} ({contrast.toFixed(2)})</label>
            <input
              id="contrast"
              type="range"
              min="0.9"
              max="1.35"
              step="0.01"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <button className="px-3 py-2 rounded-xl border w-full" onClick={reset}>
            {t("reset")}
          </button>
        </div>
      )}
    </div>
  );
}
