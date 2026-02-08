import { useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function ShareBlock({ item }) {
  const url = useMemo(() => window.location.href, []);
  const [copied, setCopied] = useState(false);

  const shareText = `${item.title} — SoliCare`;
  const wa = `https://wa.me/?text=${encodeURIComponent(shareText + " " + url)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
      alert("Copie manuelle: " + url);
    }
  }

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold">📣 Partager ce cas</div>
        <button className="px-3 py-2 rounded-xl border" onClick={copy}>
          {copied ? "✅ Copié" : "Copier le lien"}
        </button>
      </div>

      {/* Boutons share */}
      <div className="flex gap-2 flex-wrap">
        <a className="px-3 py-2 rounded-xl border font-semibold" href={wa} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
        <a className="px-3 py-2 rounded-xl border" href={fb} target="_blank" rel="noreferrer">
          Facebook
        </a>
      </div>

      {/* Carte partage */}
      <div className="border rounded-2xl p-4 dark:border-slate-800">
        <div className="text-xs opacity-70 mb-2">Carte partage</div>
        <div className="flex gap-4 items-start">
          <img
            src={(item.photos && item.photos[0]) || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=60"}
            alt=""
            className="w-28 h-20 rounded-xl object-cover border dark:border-slate-800"
          />
          <div className="min-w-0">
            <div className="font-semibold line-clamp-2">{item.title}</div>
            <div className="text-sm opacity-80 line-clamp-2">{item.summary || item.description}</div>
            <div className="text-xs opacity-70 mt-1">
              {item.category} • {item.urgency} • {item.status}
            </div>
          </div>
        </div>
      </div>

      {/* QR Partage */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="bg-white p-3 rounded-2xl border inline-block">
          <QRCodeCanvas value={url} size={132} />
        </div>
        <div className="text-sm opacity-80">
          Scanner pour <b>ouvrir</b> ou <b>partager</b> ce cas.
          <div className="text-xs opacity-70 mt-1">Lien : {url}</div>
        </div>
      </div>
    </div>
  );
}
