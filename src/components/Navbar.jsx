import { Link, useNavigate } from "react-router-dom";
import AccessibilityToggle from "./AccessibilityToggle.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import VisualSettings from "./VisualSettings.jsx";
import LanguageToggle from "../i18n/LanguageToggle.jsx";
import { t } from "../i18n/i18n.js";
import { getAuth, clearAuth } from "../state/auth.js";

import logo from "../assets/universelle-logo.png";

export default function Navbar() {
  const nav = useNavigate();
  const auth = getAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 min-w-[180px]" aria-label="Accueil">
          <img
            src={logo}
            alt="Universelle Ariana"
            className="h-10 w-10 rounded-xl border dark:border-slate-800 object-cover"
          />
          <div className="font-bold text-lg whitespace-nowrap">
            {t("appNameA")}
            <span className="opacity-60">{t("appNameB")}</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-3 text-sm flex-wrap justify-end" aria-label="Navigation">
          <Link to="/cases" className="hover:underline">{t("navCases")}</Link>
          <Link to="/about" className="hover:underline">{t("navAbout")}</Link>

          {auth?.user?.role === "ASSOCIATION" && (
            <>
              <Link to="/association/new" className="hover:underline">{t("navAddCase")}</Link>
              <Link to="/association/dashboard" className="hover:underline">{t("navDashboard")}</Link>
            </>
          )}

          {auth?.user?.role === "ADMIN" && (
            <Link to="/admin" className="hover:underline">{t("navAdmin")}</Link>
          )}

          {/* ✅ Relancer test handicap (sans DevTools) */}
          <button
            type="button"
            className="px-3 py-2 rounded-xl border dark:border-slate-800"
            onClick={() => {
              localStorage.removeItem("onboarding_disability_done");
              localStorage.removeItem("user_disability_profile");
              window.dispatchEvent(new Event("open_disability_onboarding"));
            }}
            title="Relancer le test handicap"
            aria-label="Relancer le test handicap"
          >
            🧩
          </button>

          <ThemeToggle />
          <AccessibilityToggle />
          <VisualSettings />
          <LanguageToggle />

          {!auth ? (
            <Link to="/login" className="px-3 py-2 rounded-xl border dark:border-slate-800">
              {t("login")}
            </Link>
          ) : (
            <button
              type="button"
              className="px-3 py-2 rounded-xl border dark:border-slate-800"
              onClick={() => {
                clearAuth();
                nav("/");
              }}
            >
              {t("logout")}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
