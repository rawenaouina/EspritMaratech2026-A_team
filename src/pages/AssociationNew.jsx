import { useMemo, useState } from "react";
import { t } from "../i18n/i18n.js";
import { apiPost } from "../api/client";
import { detectSensitive } from "../utils/privacy.js";
import { getAuth, getToken } from "../state/auth";
import { isValidUrl } from "../utils/format.js";

const CATS = ["Santé", "Handicap", "Enfants", "Éducation", "Rénovation", "Autre"];

function mockAiImprove(description) {
  const alerts = detectSensitive(description);
  const cleaned = description
    .replace(/\s+/g, " ")
    .replace(/\bsvp\b/gi, "")
    .trim();
  const improved = cleaned.length ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : cleaned;

  const summary = improved.length > 90 ? improved.slice(0, 87) + "..." : improved || "—";

  // super simple category guess
  const low = improved.toLowerCase();
  let category = "Autre";
  if (/enfant|bébé|école|scolar/.test(low)) category = "Enfants";
  else if (/handicap|fauteuil|autisme/.test(low)) category = "Handicap";
  else if (/rénov|maison|toit|murs|travaux/.test(low)) category = "Rénovation";
  else if (/éduc|formation|livre|classe/.test(low)) category = "Éducation";
  else if (/santé|opération|hopital|médic/.test(low)) category = "Santé";

  // urgency guess
  let urgency = "NORMAL";
  if (/urgent|vite|critique|danger/.test(low)) urgency = "URGENT";
  if (/très urgent|tres urgent/.test(low)) urgency = "TRES_URGENT";

  return {
    improvedText: improved,
    oneLineSummary: summary,
    suggestedCategory: category,
    suggestedUrgency: urgency,
    alerts
  };
}

export default function AssociationNew() {
  const auth = getAuth();
  const token = getToken();
  const isAssoc = auth?.user?.role === "ASSOCIATION";

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Santé",
    urgency: "NORMAL",
    cha9a9aUrl: "",
    photos: [""],
    goalAmount: "",
    locationText: "",
    lat: "",
    lng: ""
  });

  const [errors, setErrors] = useState({});
  const [aiOpen, setAiOpen] = useState(false);
  const [ai, setAi] = useState(null);
  const [msg, setMsg] = useState("");

  const sensitive = useMemo(() => detectSensitive(form.description), [form.description]);

  if (!isAssoc) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="card p-6">
          <div className="text-lg font-semibold">{t("addCaseTitle")}</div>
          <p className="mt-2 text-sm opacity-80">{t("pleaseLoginAsAssoc")}</p>
        </div>
      </div>
    );
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = t("required");
    if (!form.description.trim()) e.description = t("required");
    if (!form.cha9a9aUrl.trim()) e.cha9a9aUrl = t("required");
    if (form.cha9a9aUrl.trim() && !isValidUrl(form.cha9a9aUrl.trim())) e.cha9a9aUrl = t("invalidUrl");

    const photos = form.photos.filter(Boolean);
    for (const url of photos) {
      if (!isValidUrl(url)) { e.photos = t("invalidUrl"); break; }
    }
    if (form.lat && isNaN(Number(form.lat))) e.lat = "Nombre invalide";
    if (form.lng && isNaN(Number(form.lng))) e.lng = "Nombre invalide";
    if (form.goalAmount && isNaN(Number(form.goalAmount))) e.goalAmount = "Nombre invalide";
    return e;
  }

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      summary: ai?.oneLineSummary || undefined,
      category: form.category,
      urgency: form.urgency,
      cha9a9aUrl: form.cha9a9aUrl.trim(),
      photos: form.photos.filter(Boolean),
      goalAmount: form.goalAmount ? Number(form.goalAmount) : null,
      locationText: form.locationText || null,
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null
    };

    try {
      await apiPost("/api/cases", payload, token || undefined);
      setMsg("✅ Cas soumis (PENDING).");
      setForm({ title: "", description: "", category: "Santé", urgency: "NORMAL", cha9a9aUrl: "", photos: [""], goalAmount: "", locationText: "", lat: "", lng: "" });
      setAi(null);
      setAiOpen(false);
    } catch (err) {
      setMsg("❌ Erreur: " + String(err.message || err));
    }
  }

  function addPhoto() {
    setForm(f => ({ ...f, photos: [...f.photos, ""] }));
  }

  function improve() {
    const r = mockAiImprove(form.description);
    setAi(r);
    setAiOpen(true);
  }

  function applyAi() {
    if (!ai) return;
    setForm(f => ({
      ...f,
      description: ai.improvedText || f.description,
      category: ai.suggestedCategory || f.category,
      urgency: ai.suggestedUrgency || f.urgency
    }));
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <h1 className="text-3xl font-bold">{t("addCaseTitle")}</h1>
        <button className="px-4 py-3 rounded-2xl border font-semibold" onClick={improve}>
          {t("improveWithAi")}
        </button>
      </div>

      {sensitive.length ? (
        <div className="card p-4 border-amber-400/60">
          <div className="font-semibold">{t("sensitiveAlerts")}</div>
          <ul className="list-disc pl-5 text-sm mt-2 opacity-90">
            {sensitive.map((x) => <li key={x}>{x}</li>)}
          </ul>
        </div>
      ) : null}

      <div className="grid md:grid-cols-2 gap-4">
        <form onSubmit={submit} className="card p-5 space-y-4">
          <div>
            <label className="font-semibold" htmlFor="title">{t("title")}</label>
            <input
              id="title"
              className="w-full mt-1 rounded-xl border dark:border-slate-800 bg-transparent px-3 py-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            {errors.title ? <div className="text-sm text-amber-600 mt-1">{errors.title}</div> : null}
          </div>

          <div>
            <label className="font-semibold" htmlFor="desc">{t("description")}</label>
            <textarea
              id="desc"
              className="w-full mt-1 rounded-xl border dark:border-slate-800 bg-transparent px-3 py-2 min-h-[160px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            {errors.description ? <div className="text-sm text-amber-600 mt-1">{errors.description}</div> : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold" htmlFor="cat">{t("category")}</label>
              <select
                id="cat"
                className="w-full mt-1 rounded-xl border dark:border-slate-800 bg-transparent px-3 py-2"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="font-semibold" htmlFor="urg">{t("urgency")}</label>
              <select
                id="urg"
                className="w-full mt-1 rounded-xl border dark:border-slate-800 bg-transparent px-3 py-2"
                value={form.urgency}
                onChange={(e) => setForm({ ...form, urgency: e.target.value })}
              >
                <option value="NORMAL">{t("normal")}</option>
                <option value="URGENT">{t("urgent")}</option>
                <option value="TRES_URGENT">{t("veryUrgent")}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold" htmlFor="cha9">{t("cha9a9aLinkRequired")}</label>
            <input
              id="cha9"
              className="w-full mt-1 rounded-xl border dark:border-slate-800 bg-transparent px-3 py-2"
              value={form.cha9a9aUrl}
              onChange={(e) => setForm({ ...form, cha9a9aUrl: e.target.value })}
              placeholder="https://cha9a9a.tn/..."
            />
            {errors.cha9a9aUrl ? <div className="text-sm text-amber-600 mt-1">{errors.cha9a9aUrl}</div> : null}
          </div>

          <div className="space-y-2">
            <div className="font-semibold">{t("photosOptional")}</div>
            {form.photos.map((url, idx) => (
              <input
                key={idx}
                className="w-full rounded-xl border dark:border-slate-800 bg-transparent px-3 py-2"
                value={url}
                placeholder={`Photo URL ${idx + 1}`}
                onChange={(e) => {
                  const next = [...form.photos];
                  next[idx] = e.target.value;
                  setForm({ ...form, photos: next });
                }}
              />
            ))}
            {errors.photos ? <div className="text-sm text-amber-600">{errors.photos}</div> : null}
            <button type="button" className="px-3 py-2 rounded-xl border" onClick={addPhoto}>
              + {t("addPhotoUrl")}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold" htmlFor="goal">{t("goalOptional")}</label>
              <input
                id="goal"
                className="w-full mt-1 rounded-xl border dark:border-slate-800 bg-transparent px-3 py-2"
                value={form.goalAmount}
                onChange={(e) => setForm({ ...form, goalAmount: e.target.value })}
                placeholder="ex: 5000"
              />
              {errors.goalAmount ? <div className="text-sm text-amber-600 mt-1">{errors.goalAmount}</div> : null}
            </div>

            <div>
              <label className="font-semibold" htmlFor="loc">{t("locationText")}</label>
              <input
                id="loc"
                className="w-full mt-1 rounded-xl border dark:border-slate-800 bg-transparent px-3 py-2"
                value={form.locationText}
                onChange={(e) => setForm({ ...form, locationText: e.target.value })}
                placeholder="Ariana, Tunis..."
              />
            </div>

            <div>
              <label className="font-semibold" htmlFor="lat">{t("lat")}</label>
              <input
                id="lat"
                className="w-full mt-1 rounded-xl border dark:border-slate-800 bg-transparent px-3 py-2"
                value={form.lat}
                onChange={(e) => setForm({ ...form, lat: e.target.value })}
                placeholder="36.866..."
              />
              {errors.lat ? <div className="text-sm text-amber-600 mt-1">{errors.lat}</div> : null}
            </div>

            <div>
              <label className="font-semibold" htmlFor="lng">{t("lng")}</label>
              <input
                id="lng"
                className="w-full mt-1 rounded-xl border dark:border-slate-800 bg-transparent px-3 py-2"
                value={form.lng}
                onChange={(e) => setForm({ ...form, lng: e.target.value })}
                placeholder="10.164..."
              />
              {errors.lng ? <div className="text-sm text-amber-600 mt-1">{errors.lng}</div> : null}
            </div>
          </div>

          <button className="w-full px-4 py-3 rounded-2xl border font-semibold" type="submit">
            {t("submitPending")}
          </button>

          <div className="text-xs opacity-70">{t("afterSubmit")}</div>
          {msg ? <div className="text-sm">{msg}</div> : null}
        </form>

        <aside className="space-y-4">
          <div className="card p-5">
            <div className="font-semibold">{t("aiAssist")}</div>
            <p className="text-sm opacity-80 mt-2">{t("aiHint")}</p>

            {!ai ? (
              <div className="text-sm opacity-70 mt-4">
                Clique sur <b>{t("improveWithAi")}</b> pour générer une version digne + résumé + suggestions.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="card p-3">
                  <div className="text-sm font-semibold">{t("improvedText")}</div>
                  <div className="text-sm mt-1 opacity-90">{ai.improvedText}</div>
                </div>

                <div className="card p-3">
                  <div className="text-sm font-semibold">{t("oneLineSummary")}</div>
                  <div className="text-sm mt-1 opacity-90">{ai.oneLineSummary}</div>
                </div>

                <div className="card p-3">
                  <div className="text-sm font-semibold">{t("suggested")}</div>
                  <div className="text-sm mt-1 opacity-90">{ai.suggestedCategory} • {ai.suggestedUrgency}</div>
                </div>

                <div className="card p-3">
                  <div className="text-sm font-semibold">{t("sensitiveAlerts")}</div>
                  {ai.alerts.length ? (
                    <ul className="list-disc pl-5 text-sm mt-1">
                      {ai.alerts.map((x) => <li key={x}>{x}</li>)}
                    </ul>
                  ) : <div className="text-sm opacity-70 mt-1">OK</div>}
                </div>

                <div className="flex gap-3">
                  <button type="button" className="px-4 py-3 rounded-2xl border font-semibold" onClick={applyAi}>
                    {t("apply")}
                  </button>
                  <button type="button" className="px-4 py-3 rounded-2xl border" onClick={() => setAi(null)}>
                    {t("keepMine")}
                  </button>
                </div>
              </div>
            )}
          </div>

          
        </aside>
      </div>
    </div>
  );
}
