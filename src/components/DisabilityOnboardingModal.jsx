import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const STORAGE_DONE_KEY = "onboarding_disability_done";
const STORAGE_PROFILE_KEY = "user_disability_profile";

const DISABILITY_OPTIONS = [
  { key: "VISUAL", fr: "Handicap visuel", ar: "إعاقة بصرية" },
  { key: "AUDITIF", fr: "Handicap auditif", ar: "إعاقة سمعية" },
  { key: "MOTEUR", fr: "Handicap moteur", ar: "إعاقة حركية" },
  { key: "COGNITIF", fr: "Handicap cognitif", ar: "إعاقة ذهنية" },
  { key: "LANGAGE", fr: "Handicap du langage", ar: "إعاقة لغوية" },
];

export default function DisabilityOnboardingModal() {
  const { i18n } = useTranslation();
  const isArabic = useMemo(() => i18n.language?.startsWith("ar"), [i18n.language]);

  const [open, setOpen] = useState(false);
  const [hasDisability, setHasDisability] = useState(null); // null | true | false
  const [selectedTags, setSelectedTags] = useState([]);

  // ✅ Open once (first visit) + allow reopening via event
  useEffect(() => {
    const done = localStorage.getItem(STORAGE_DONE_KEY);
    if (!done) setOpen(true);

    const handler = () => {
      setHasDisability(null);
      setSelectedTags([]);
      setOpen(true);
    };
    window.addEventListener("open_disability_onboarding", handler);
    return () => window.removeEventListener("open_disability_onboarding", handler);
  }, []);

  // ✅ Lock scroll + ESC close
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open) return null;

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );
  };

  const close = () => setOpen(false);

  const save = () => {
    if (hasDisability === true && selectedTags.length === 0) return;

    const profile = {
      hasDisability: !!hasDisability,
      tags: hasDisability ? selectedTags : [],
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(STORAGE_DONE_KEY, "1");
    close();
  };

  const skip = () => {
    localStorage.setItem(
      STORAGE_PROFILE_KEY,
      JSON.stringify({
        hasDisability: false,
        tags: [],
        createdAt: new Date().toISOString(),
      })
    );
    localStorage.setItem(STORAGE_DONE_KEY, "1");
    close();
  };

  const title = isArabic ? "هل أنت شخص من ذوي الإعاقة؟" : "Êtes-vous porteur d’un handicap ?";
  const subtitle = isArabic
    ? "نستعمل هذه المعلومة فقط لتحسين تجربتك وإظهار الحالات المناسبة."
    : "Cette information sert uniquement à améliorer votre expérience et afficher les cas adaptés.";

  const yesText = isArabic ? "نعم" : "Oui";
  const noText = isArabic ? "لا" : "Non";
  const chooseTypeText = isArabic ? "اختر نوع الإعاقة:" : "Choisissez le type de handicap :";
  const saveText = isArabic ? "تأكيد" : "Confirmer";
  const skipText = isArabic ? "تخطي" : "Ignorer";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        // click outside closes
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-xl border px-3 py-2 text-sm dark:border-slate-700"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Yes/No */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setHasDisability(true)}
            className={`w-full rounded-xl border px-4 py-3 font-semibold transition
              ${
                hasDisability === true
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              }`}
          >
            {yesText}
          </button>

          <button
            type="button"
            onClick={() => {
              setHasDisability(false);
              setSelectedTags([]);
            }}
            className={`w-full rounded-xl border px-4 py-3 font-semibold transition
              ${
                hasDisability === false
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              }`}
          >
            {noText}
          </button>
        </div>

        {/* Types */}
        {hasDisability === true && (
          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-white">
              {chooseTypeText}
            </p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DISABILITY_OPTIONS.map((opt) => {
                const label = isArabic ? opt.ar : opt.fr;
                const active = selectedTags.includes(opt.key);

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => toggleTag(opt.key)}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition
                      ${
                        active
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {selectedTags.length === 0 && (
              <p className="mt-2 text-xs text-red-600">
                {isArabic ? "الرجاء اختيار نوع واحد على الأقل." : "Veuillez choisir au moins un type."}
              </p>
            )}
          </div>
        )}

        {/* Footer buttons */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={skip}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
          >
            {skipText}
          </button>

          <button
            type="button"
            onClick={save}
            className={`rounded-xl px-5 py-2 text-sm font-semibold text-white transition
              ${
                hasDisability === null
                  ? "bg-slate-400 cursor-not-allowed"
                  : hasDisability === true && selectedTags.length === 0
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-slate-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-slate-200"
              }`}
            disabled={
              hasDisability === null ||
              (hasDisability === true && selectedTags.length === 0)
            }
          >
            {saveText}
          </button>
        </div>

        {/* Hint */}
        <p className="mt-3 text-xs opacity-70">
          {isArabic
            ? "يمكنك إعادة هذا الاختبار من زر 🧩 في الأعلى."
            : "Vous pouvez relancer ce test via le bouton 🧩 en haut."}
        </p>
      </div>
    </div>
  );
}
