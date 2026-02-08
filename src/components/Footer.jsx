import { useEffect, useState } from "react";
import { apiPost } from "../api/client.js";
import { getAuth, getToken } from "../state/auth.js";
import { t } from "../i18n/i18n.js";
import { getLang } from "../i18n/i18n.js";

import logo from "../assets/universelle-logo.png";
import cha9a9aQr from "../assets/cha9a9a-qr.png";

import VoiceAssistant from "./VoiceAssistant.jsx";
import OrgCarousel from "./OrgCarousel.jsx";

function Icon({ name, className = "" }) {
  const base = `h-5 w-5 opacity-80 ${className}`;
  if (name === "phone")
    return (
      <svg
        className={base}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.54 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.06a2 2 0 0 1 2.11-.45c.8.24 1.64.42 2.5.54A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  if (name === "mail")
    return (
      <svg
        className={base}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-10 6L2 7" />
      </svg>
    );
  if (name === "message")
    return (
      <svg
        className={base}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.1 0-2.16-.2-3.14-.57L3 21l1.57-6.36c-.37-.98-.57-2.04-.57-3.14A8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5Z" />
      </svg>
    );
  return null;
}

export default function Footer() {
  const auth = getAuth();
  const token = getToken();

  const [email, setEmail] = useState(auth?.user?.email || "");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const local = localStorage.getItem("urgent_subscribed");
    if (local === "1") setSubscribed(true);
  }, []);

  async function onToggle(next) {
    setSubscribed(next);
    localStorage.setItem("urgent_subscribed", next ? "1" : "0");
    setMsg("");

    try {
      setLoading(true);
      await apiPost(
        "/api/subscriptions/urgent",
        { email: email.trim(), subscribed: next },
        token || undefined
      );
      setMsg(next ? t("subscribedOk") : t("unsubscribedOk"));
    } catch {
      // fallback si endpoint pas prêt
      setMsg(t("savedLocal"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="mt-12 border-t dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-10 grid gap-6 md:grid-cols-4">
        {/* Col 1: Branding */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Universelle Ariana"
              className="h-12 w-12 rounded-2xl border dark:border-slate-800 object-cover"
            />
            <div className="font-bold text-lg">
              Soli<span className="opacity-60">Care</span>
            </div>
          </div>

          <p className="text-sm opacity-80">{t("footerPitch")}</p>

          <a
            className="underline text-sm"
            href="https://universellecellule.wixsite.com/website-2/"
            target="_blank"
            rel="noreferrer"
          >
            {t("assocOfficialSite")}
          </a>

          {/* Coordonnées (avec icônes) */}
          <div className="text-xs opacity-80 space-y-2 pt-1">
            <div className="font-semibold opacity-80">Coordonnées</div>

            <a
              className="flex items-center gap-3 hover:underline"
              href="tel:+21695403001"
            >
              <Icon name="phone" />
              <span>95 403 001</span>
            </a>

            <a
              className="flex items-center gap-3 hover:underline"
              href="mailto:universellecelluleariana@gmail.com"
            >
              <Icon name="mail" />
              <span>universellecelluleariana@gmail.com</span>
            </a>

            <a
              className="flex items-center gap-3 hover:underline"
              href="https://www.facebook.com/p/Universelle-Ariana-100069170580432/"
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="message" />
              <span>Universelle Cellule Ariana</span>
            </a>
          </div>
        </div>

        {/* Col 2: Donor email opt-in */}
        <div className="space-y-2">
          <div className="font-semibold">{t("donorBlockTitle")}</div>
          <p className="text-sm opacity-80">{t("donorBlockDesc")}</p>

          <div className="card p-4 space-y-3">
            <label className="text-sm font-semibold" htmlFor="donorEmail">
              {t("yourEmail")}
            </label>
            <input
              id="donorEmail"
              className="w-full rounded-xl border dark:border-slate-800 bg-transparent px-3 py-2"
              placeholder="ex: donor@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!auth?.user?.email}
            />

            <label className="flex items-center gap-3 select-none">
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={subscribed}
                onChange={(e) => onToggle(e.target.checked)}
                disabled={loading || !email.trim()}
              />
              <span className="text-sm">{t("urgentEmailOptin")}</span>
            </label>

            <div className="text-xs opacity-70">
              {loading ? t("saving") : !email.trim() ? t("enterEmail") : (msg || "OK")}
            </div>
          </div>
        </div>

        {/* Col 3: Cha9a9a QR */}
        <div className="space-y-2">
          <div className="font-semibold">{t("cha9a9aBlockTitle")}</div>
          <p className="text-sm opacity-80">{t("cha9a9aBlockDesc")}</p>

          <div className="card p-4">
            <div className="bg-white rounded-2xl p-3 inline-block border">
              <img
                src={cha9a9aQr}
                alt="QR Cha9a9a"
                className="w-44 h-44 object-contain"
              />
            </div>
            <div className="text-xs opacity-70 mt-2">{t("cha9a9aQrHint")}</div>
          </div>
        </div>

        {/* Col 4: Assistant vocal + mini galerie */}
        <div className="space-y-3">
          {/* Assistant sonore */}
          <VoiceAssistant lang={getLang()} />

          {/* Mini galerie */}
          <div className="space-y-2">
            <div className="font-semibold">{t("associationGalleryTitle")}</div>
            <p className="text-sm opacity-80">{t("associationGalleryDesc")}</p>
            <OrgCarousel height={86} speed={28} />
            <div className="text-xs opacity-70">{t("associationGalleryHint")}</div>
          </div>
        </div>
      </div>

      <div className="text-xs opacity-60 px-6 py-4 text-center border-t dark:border-slate-800">
        © {new Date().getFullYear()} SoliCare — مشروع تضامني تونس
      </div>
    </footer>
  );
}
